import {User} from "../models/user.models.js";
import {ApiResponce} from "../utils/api-response.js"
import {ApiError} from "../utils/api-error.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import {emailVerificationMailgenContent, sendEmail} from "../utils/mail.js"
import jwt from "jsonwebtoken"

const generateAccessAndRefreshTokens = async (userId) =>{
    try {
       const user = await User.findById(userId) 
       const accessToken  = user.generateAccessToken()
       const refreshToken = user.generateRefreshToken()

       user.refreshToken = refreshToken
       await user.save({ValidateBeforeSave : false})
       return {accessToken, refreshToken}
    } catch (error) {
        console.error("Actual error : ",error)
        throw new ApiError (500,"Something went wrong while generating access token!", error)
    }
}

const registerUser = asyncHandler(async (req,res) =>{
    const {email, username, password, role} = req.body
// first we'll find for the user if he already exist. 
    const existingUser = await User.findOne({
        $or: [{username},{email}]
    })

    if(existingUser){
        throw new ApiError(409,"User with email or username already exists!",[])
    }

// if not then we'll save him 
    const user = await User.create({
        email,
        password,
        username,
        isEmailVerified: false
    })

    const {unHashedToken,hashedToken,tokenExpiry} = user.generateTempToken()

    user.emailVerificationToken = hashedToken
    user.emailVerificationExpiry = tokenExpiry

    await user.save({ValidateBeforeSave: false})

    await sendEmail({
        email: user ?.email,
        subject: "Please verify your mail!",
        mailgenContent:emailVerificationMailgenContent(
            user.username,
            `${req.protocol}://${req.get("host")}/api/v1/users/verify-email/${unHashedToken}`
        ),
    })

    const createdUser = await User.findById(user._id).select("-password -refreshToken -emailVerificationToken -emailVerificationExpiry ",)

    if(!createdUser){
        throw new ApiError(500, "Something went wrong while registering the user!")
    }

    return res
        .status(201)
        .json(
            new ApiResponce(
                200,
                {user: createdUser},
                "User registered successfully and verification email has been sent on your email "
            )
        )
})

// this is part is login where registerd user will come to login and this method will tell how he can login . like using what he can login into the app.
const loginUser = asyncHandler(async (req,res) =>{
    // taking data from the forntend.
    const {email,password,username} = req.body

    if(!email){   // can be written like this also : if(!username && !email) or if(!username ||  !email)
        throw new ApiError(400,"Username or email is required!")
    } 

    const user = await User.findOne({email})
    if(!user){
        throw new ApiError(400,"User does not exists !")
    }

    const isPasswordValid = await user.isPasswordCorrect(password)
    if(!isPasswordValid){
        throw new ApiError(400,"Invalid creadentials!")
    }

    const {accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id)


// we have to send cookies to the user or sending tokens to user using cookies

    const logedInUser = await User.findById(user._id).select("-password -refreshToken -emailVerificationToken -emailVerificationExpiry ")

    const options ={
        httpOnly : true,
        secure : true
    }

    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponce(
                200,
                {
                    user: logedInUser,
                    accessToken,
                    refreshToken
                },
                "User Logged in successfully!"
            )
        )

})


const logoutUser = asyncHandler(async (req,res) =>{
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: { // so basically this is removing the token from the user so that that feild become empty and user's access got loose.
                refreshToken: "" 
            }
        },
        {
            new: true
        }
    )
    const options = {
        httpOnly : true,
        secure : true
    }

    return res
            .status(200)
            .clearCookie("accessToken", options)
            .clearCookie("refreshToken", options)
            .json(
                new ApiResponce(
                    220,
                    {},
                    "User logged out ! "
                )
            )
})


const getCurrentUser = asyncHandler (async (req, res) =>{
    return res  
            .status(200)
            .json(
                new ApiResponce(
                    200,
                    req.user,
                    "Current user fetched successfully!"
                )
            )
})

//getting the info from the url directily. like there is token in url of email verification sent via email(verify email button)
const verifyEmail = asyncHandler (async (req, res) =>{
    const {verificationToken} = req.params

    if(!verificationToken){
        throw new ApiError(400,"Email verification token is missing !")
    }

    let hashedToken = crypto
        .createHash("sha256")
        .update(verificationToken)
        .digest("hex")

        await User.findOne({
            emailVerificationToken : hashedToken,
            emailVerificationExpiry :{$gt: Date.now()}
        })

        if(!user){
            throw new ApiError(400,"Token is invalid or expired! ")
        }

// cleaning the uneccessory data 

        user.emailVerificationToken= undefined
        user.emailVerificationExpiry = undefined

        user.isEmailVerified= true
        await user.save({ValidateBeforeSave: false})

        return res  
                .status(200)
                .json(
                    new ApiResponce(
                        200,
                        {
                            isEmailVerified: true
                        },
                        "Email is verified!"
                    )
                )

})

const resendEmailVerification = asyncHandler (async (req, res) =>{
    const user = await User.findById(req.user?._id)

    if(!user){
        throw new ApiError(404,"User does not exist!")
    }
    
    if(user.isEmailVerified){
        throw new ApiError(409,"Email is already verified! ")
    }

    const {unHashedToken,hashedToken,tokenExpiry} = user.generateTempToken()

    user.emailVerificationToken = hashedToken
    user.emailVerificationExpiry = tokenExpiry

    await user.save({ValidateBeforeSave: false})

    await sendEmail({
        email: user ?.email,
        subject: "Please verify your mail!",
        mailgenContent:emailVerificationMailgenContent(
            user.username,
            `${req.protocol}://${req.get("host")}/api/v1/users/verify-email/${unHashedToken}`
        ),
    })
    return res
            .status(200)
            .json(
                new ApiResponce(
                    200,
                    {},
                    "Mail has been sent to email-ID"
                )
            )
})




const refreshAccessToken = asyncHandler (async (req, res) =>{
    const incomingRefreshToken = req.cookie.refreshToken || req.body.refreshToken

    if(!incomingRefreshToken){
        throw new ApiError(401,"Unathorized access!")
    }

    try {
        const decodedRefreshToken = jwt.verify(incomingRefreshToken,process.env.REFRESH_TOKEN_SECRET)

        const user = await User.findById(decodedRefreshToken?._id)

        if(!user){
            throw new ApiError(401,"Invalid refresh token")
        }

        if(incomingRefreshToken!==user?.refreshToken){
            throw new ApiError(401,"Refresh token is expired")
        }

        const options = {
            httpOnly: true,
            secure:true
        }

        const {accessToken, refreshToken: newRefreshToken}= await generateAccessAndRefreshTokens(user._id)

        user.refreshToken = newRefreshToken
        await user.save()

        return res  
                .status(200)
                .cookie("accessToken",accessToken,options)
                .cookie("refreshToken",newRefreshToken,options)
                .json(
                    new ApiResponce(
                        200,
                        {accessToken, refreshToken: newRefreshToken},
                        "Access token refreshed!"
                    )
                )
    
    } catch (error) {
        throw new ApiError(401,"Invalid refresh token!")
    }
})


const forgotPasswordRequest = asyncHandler (async (req, res) =>{
    const {email} = req.body

    const user = await User.findOne({email})
    if(!user){
        throw new ApiError(404,"User does not exist!")
    }

    const {unHashedToken,hashedToken,tokenExpiry}= user.generateTempToken()

    user.forgotPasswordToken = hashedToken
    user.forgotPasswordExpiry = tokenExpiry

    await user.save({validateBeforeSave : false})

    await sendEmail({
        email: user ?.email,
        subject: "Password reset request",
        mailgenContent:forgorPasswordMailgenContent(
            user.username,
            `${process.env.FORGOT_PASSWORD_REDIRECT_URL}/${unHashedToken}`
        ),
    })

    return res  
            .status(200)
            .json(
                new ApiResponce(
                    200,
                    {},
                    "Password reset mail has been sent on your email!"
                )
            )
})


const resetForgotPassword = asyncHandler (async (req, res) =>{
    const{resetToken} = req.params
    const{newPassword} = req.body

    let hasedToken = crypto
        .createHash("sha256")
        .update(resetToken)
        .digest("hex")
    
    const user = await User.findOne({
        forgotPasswordToken: hasedToken,
        forgotPasswordExpiry:{$gt: Date.now()}
    })

    if(!user){
        throw new ApiError(489, "Token is invalid or expired!")
    }

    user.forgotPasswordExpiry = undefined
    user.forgotPasswordToken = undefined

    user.password = newPassword

    await user.save({validateBeforeSave: false})

    return res 
            .status(200)
            .json(
                new ApiResponce(
                    200,
                    {},
                    "Password reset successfully!"
                )
            )
})


const changeCurrentPassword = asyncHandler (async (req, res) =>{
    const {oldPassword, newPassword} = req.body

    const user = await User.findById(req.user?._id)

    const isPasswordValid = await user.isPasswordCorrect(oldPassword)

    if(!isPasswordValid){
        throw new ApiError(400,"Invalid old password!")
    }

    user.password = newPassword

    await user.save({validateBeforeSave:false})

    return res
            .status(200)
            .json(
                new ApiResponce(
                    200,
                    {},
                    "Password changed successfully!"
                )
            )
})


export {
    registerUser,
    loginUser,
    logoutUser,
    getCurrentUser,
    verifyEmail,
    resendEmailVerification,
    refreshAccessToken,
    forgotPasswordRequest,
    resetForgotPassword,
    changeCurrentPassword

}