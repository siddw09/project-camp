import express from "express"
import { validate } from "../middlewares/validator.middleware.js";

const router = express.Router();


router.route('/').get(getAllTasks).post(verifyJWT,)
export default router