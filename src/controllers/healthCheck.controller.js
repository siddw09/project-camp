import {ApiResponce} from "../utils/api-response.js"

const healthCheck = (req,res)=>{
    try {
        res
            .status(200)
            .json(
                new ApiResponce(200,{message:"Server is good and running!"})
            )
    } catch (error) {
        
    }
}
export {healthCheck}