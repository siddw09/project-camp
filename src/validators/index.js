import { body } from "express-validator";

const userRegisterValidator =()=>{
    return [
        body("email")
            .trim()
            .notEmpty()
            .withMessage("Email is requird")
            .isEmail()
            .withMessage("Email is invalid"),
        
        body("username")
            .trim()
            .notEmpty()
            .withMessage("username is required")
            .isLowercase()
            .withMessage("username must be in lower case")
            .isLength()
            .withMessage("username must be atleast 3 charcaters long"),

        body("password")
            .trim()
            .notEmpty()
            .withMessage("password is required"),

        body("fullName")
            .optional()
            .trim()


            
    ]
}

const userLoginValidator = () =>{
    return [
        body("email")
            .optional()
            .isEmail()
            .withMessage("Invalid email!"),
        
        body("password")
            .notEmpty()
            .withMessage("Password is required !")
    ]
}
export {
    userRegisterValidator , userLoginValidator
}