import mongoose,{Schema} from "mongoose";
import { availableTaskStatus, TaskStatusEnum } from "../utils/constants";

const taskSchema = new Schema ({
    title :{
        type:String,
        required:true,
        trim: true
    },
    description: String,
    project:{
        type: Schema.Types.ObjectId,
        ref: "Project",
        required: true
    },
    assignedTo:{
        type:Schema.Types.ObjectId,
        ref:"User"
    },
    assignedBy:{
        type:Schema.Types.ObjectId,
        ref:"User"
    },
    status:{
        type:String,
        enum: availableTaskStatus,
        default:TaskStatusEnum.TODO
    },
    attachment:{
        type:[
            {
                url: String,
                MimeType:String,
                size: Number
            }
        ],
        default:[]
    }


},{timestamps :true})

const Task = mongoose.model("Task",taskSchema)

export {Task}