import User from "../models/user.models.js";
import {ApiResponce} from "../utils/api-response.js"
import {ApiError} from "../utils/api-error.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import {emailVerificationMailgenContent, sendEmail} from "../utils/mail.js"

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
const login = asyncHandler(async (req,res) =>{
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
export {registerUser,login}