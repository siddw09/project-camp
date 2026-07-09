import User from "../models/user.models.js";
import {ApiResponce} from "../utils/api-response.js"
import {ApiError} from "../utils/api-error.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import {emailVerificationMailgenContent, sendEmail} from "../utils/mail.js"

const generateAccessAndRefreshTokens = async (userId) =>{
    try {
       const user = await user.findById(userId) 
       const accessToken  = user.generateAccessToken()
       const refreshToken = user.generateRefreshToken()

       user.refreshToken = refreshToken
       await user.save({ValidateBeforeSave : false})
       return {accessToken, refreshToken}
    } catch (error) {
        throw new ApiError (500,"Something went wrong while generating access token!")
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

export {registerUser}