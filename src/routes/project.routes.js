import { Router } from "express";
import { getProjects,
    getProjectById,
    createProject,
    updateProject,
    deleteProject,
    addMemberToProject,
    getProjectMembers,
    updateMemberRole,
    deleteMemberFromProject } from "../controllers/project.controller.js"

//validation part (import these 2 ones)
import { validate } from "../middlewares/validator.middleware.js";
import { 
    createProjectValidator,
    addMemberToProjectValidator } from "../validators/index.js";

import {verifyJWT,validateProjectPermission} from "../middlewares/auth.middleware.js"
import { UserRolesEnum } from "../utils/constants.js";


const router = Router()
router.use(verifyJWT)

router  
    .route("/")
    .get(getProjects)
    .post(createProjectValidator(),validate, createProject)

router  
    .route("/:projectId")
    .get(validateProjectPermission([UserRolesEnum.ADMIN]), getProjectById)
    .put(validateProjectPermission([UserRolesEnum.ADMIN]),
        createProjectValidator(),
        validate,
        updateProject 
    )
    .delete(
        validateProjectPermission([UserRolesEnum.ADMIN]),
        deleteProject
    )

router  
    .route("/:projectId/members")
    .get(getProjectMembers)
    .post(
        validateProjectPermission([UserRolesEnum.ADMIN]),
        addMemberToProjectValidator(),
        validate,
        addMemberToProject
    )

router  
    .route("/:projectId/members/:userId")
    .put(
        validateProjectPermission([UserRolesEnum.ADMIN]),
        updateMemberRole)
    .delete(validateProjectPermission([UserRolesEnum.ADMIN]),
    deleteMemberFromProject)

    export default router