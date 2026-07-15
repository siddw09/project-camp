import {User} from "../models/user.models.js";
import {Project} from "../models/project.models.js";
import {ProjectMember} from "../models/projectMember.models.js";
import {ApiResponce} from "../utils/api-response.js"
import {ApiError} from "../utils/api-error.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const getProjects = asyncHandler(async (req,res,next)=>{
    //test

})

const getProjectById = asyncHandler(async (req,res,next)=>{
    //test
    
})


const createProject = asyncHandler(async (req,res,next)=>{
    //test
    
})

const updateProject = asyncHandler(async (req,res,next)=>{
    //test
    
})

const deleteProject = asyncHandler(async (req,res,next)=>{
    //test
    
})

const addMemberToProject = asyncHandler(async (req,res,next)=>{
    //test
    
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