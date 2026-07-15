import mongoose, {Schema} from "mongoose";
import {availableUserRole,UserRolesEnum} from "../utils/constants.js"

const projectMember = new Schema({
     user:{
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    project:{
        type: Schema.Types.ObjectId,
        ref: "Project",
        required: true
    },
    
     role:{
        type : String,
        enum: availableUserRole,
        default : UserRolesEnum.MEMBER
     }
}, {timestamps : true}) 

export const ProjectMember = mongoose.model("ProjectMember",projectMember)
