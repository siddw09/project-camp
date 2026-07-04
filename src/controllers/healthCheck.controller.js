import {ApiResponce} from "../utils/api-response.js"
import { asyncHandler } from "../utils/asyncHandler.js"

/* const healthCheck = async (req,res,next)=>{
    try {
       
        res
            .status(200)
            .json(
                new ApiResponce(200,{message:"Server is good and running!"})
            )
    } catch (error) {
            next(error)
    }
} */

const healthCheck = asyncHandler(async (req,res) =>{
    res.status(200).json(new ApiResponce(200,{message:"server is up and good!"}))
})


export {healthCheck}