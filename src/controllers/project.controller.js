import User from "../models/user.models.js";
import {Project} from "../models/project.models.js";
import {ProjectMember} from "../models/projectMember.models.js";
import {ApiResponce} from "../utils/api-response.js"
import {ApiError} from "../utils/api-error.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import { create } from "domain";
import mongoose from "mongoose";
import {UserRolesEnum} from "../utils/constants.js";


const getProjects = asyncHandler(async (req,res,next)=>{
    const projects = await ProjectMember.aggregate([
        {
            $match:{
                user: new mongoose.Types.ObjectId(req.user._id)
            }
        },
        {
            $lookup: {
                from:"projects",
                localField:"projects",
                foreignField:"_id",
                as:"Projects",
                pipeline:[
                    {
                        $lookup:{
                            from:"projectmembers",
                            localField:"_id",
                            foreignField:"Projects",
                            as:"projectmembers"
                        }
                    },
                    {
                        $addFields:{
                            members:{
                                $size:"$projectmembers"
                            }
                        }
                    }
                ]
            }
        },
        {
            $unwind: "$projects"
        },
        {
            // the data which will be exported
            $project:{
                project:{
                    _id:1,
                    name:1,
                    description:1,
                    members:1,
                    createdAt:1,
                    createdBy:1,

                },
                role:1,
                _id:0
            }
        }
    ])

    return res 
        .status(200)
        .json(
            new ApiResponce(
                200,
                projects,
                "Projects fetched successfully "
        )
    )
})

const getProjectById = asyncHandler(async (req,res,next)=>{
    const {projectId} = req.body
    const project= await Project.findById(projectId)
    if(!project){
        throw new ApiError(404,"Project not found ")
    }

    return res 
            .status(200)
            .json(
                new ApiResponce(
                    200,
                    project,
                    "Project fetched successfully ! "
                )
            )
        
})


const createProject = asyncHandler(async (req,res,next)=>{
    const {name, description} = req.body;

    const project = await Project.create({
        name,
        description,
        // createdBy: res.user._id  // <-- this must be mongodb object id.
        createdBy:new mongoose.Types.ObjectId(res.user._id)
    })

// the user who is creating the project must be upgraded as a ADMIN.

    await ProjectMember.create({
          user:new mongoose.Types.ObjectId(res.user._id),
          project: new mongoose.Types.ObjectId(project._id),
          role: UserRolesEnum.ADMIN
    })

    return res  
            .status(201)
            .json(
                new ApiResponce(
                    201,
                    project,
                    "Project created successfully!"
                )
            )
    
})

const updateProject = asyncHandler(async (req,res,next)=>{
    const {name,description} = req.body
    const {projectId} = req.params

    const project = await Project.findByIdAndUpdate(
        projectId,
        {
            name,
            description,
        },
        { new:true}
    )
    
    if(!project){
        throw new ApiError(404,"Project not found!")
    }

    return res  
            .status(202)
            .json(
                new ApiResponce(
                    202,
                    project,
                    "Project updated successfully!"
                )
            )

})

const deleteProject = asyncHandler(async (req,res,next)=>{
    const {name, description}
    const {projectId} = req.params
    
    const project = await Project.findOneAndDelete(projectId)

    if(!project){
        throw new ApiError(404,"Project not found!")
    }

    return res  
            .status(202)
            .json(
                new ApiResponce(
                    202,
                    project,
                    "Project deleted successfully!"
                )
            )
})

const addMemberToProject = asyncHandler(async (req,res,next)=>{
    // we'll first need the (email, role) & (projectId)
    const {email,role} = req.body
    const {projectId} = req.parama   
    
})

const getProjectMembers = asyncHandler(async (req,res,next)=>{
    //test
    
})

const updateMemberRole = asyncHandler(async (req,res,next)=>{
    //test
    
})


const deleteMemberFromProject = asyncHandler(async (req,res,next)=>{
    //test
    
})


export{
    getProjects,
    getProjectById,
    createProject,
    updateProject,
    deleteProject,
    addMemberToProject,
    getProjectMembers,
    updateMemberRole,
    deleteMemberFromProject
}