import  {User}  from '../models/user.models.js';
import { ApiError } from '../utils/api-error.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import jwt from "jsonwebtoken"
import {ProjectMember} from "../models/projectMember.models.js";
import mongoose from 'mongoose';


const verifyJWT = asyncHandler(async(req, res, next)=> {
    const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer", "" )

    if(!token){
        throw new ApiError(401, "Unauthorized request or access token not found !")
    }

    try {
        const decodedToken =  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
        const user = await User.findById(decodedToken?._id).select("-password -refreshToken -emailVerificationToken -emailVerificationExpiry ")

    if(!user){
        throw new ApiError(401, "Invalid access token !")
    }
    
    req.user = user
    next()
    
    } catch (error) {
    
    throw new ApiError(401, "Invalid access token !")
    }

}) 

const validateProjectPermission = (roles = []) =>{
    return asyncHandler(async(req, res, next) =>{
        const {projectId} = req.params
        if(!projectId){
            throw new ApiError(400,"Project id is missing ! ")
        }
//              /<- this is not a project, this is the whole doc of projects
        const project = await ProjectMember.findOne({
            project: new mongoose.Types.ObjectId(projectId),
            user: new mongoose.Types.ObjectId(req.user._id)
        })

        if(!project){
            throw new ApiError(400,"Project not found ! ")
        }

        const givenRole = project?.role

        req.user.role = givenRole 

        if(!roles.includes(givenRole)){
            throw new ApiError(
                403,
                "You do not have this permission to perform this action ! "
            )
        }

        next()
    })
}
export {verifyJWT, validateProjectPermission}