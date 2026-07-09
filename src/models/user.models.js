import mongoose, {Schema} from "mongoose";
import bcrypt from "bcryptjs";

import jwt from "jsonwebtoken"
import crypto from "crypto"

// this is how db is designed in Nosql;
const userSchema = new Schema(
    {
    
        avatar:{
            type:{
                url: String,
                localPath: String
            },
            default:{
                url: "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png",
                localPath:""
            }
            
        },

        username:{
            type:String,
            required: true,
            unique: true,
            lowercase:true,
            trim:true,
            index:true
        },
        email:{
            type:String,
            required:true,
            unique:true,
            lowercase:true,
            trim:true
        },
        fullName:{
            type:String,
            trim:true,
        },
        password:{
            type:String,
            required:[true,"password kyu nahi dala vroo"]
        },
        isEmailVerified:{
            type:Boolean,
            default:false
        },
        refreshToken:{
            type:String
        },
        forgotPasswordToken:{
            type:String
        },
        forgotPasswordExpiry:{
            type:Date
        },
        emailVerificationToken:{
            type:String
        },
        emailVerificationExpiry:{
            type:Date
        }
    }, {
        timestamps:true,
    },
)

// encrypted the password using BCRYPT lib  -- this is basically a hook (pre HOOK )
userSchema.pre("save", async function () {
    if(!this.isModified("password")) return 

    this.password = await bcrypt.hash(this.password, 10)
    
})

// it is the method which checks if the password enterd is correct or not
userSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password, this.password)
}


// methods for tokens - JWT (with data)
// method for access token generation

userSchema.methods.generateAccessToken = function (){
    return jwt.sign(
        {
            _id: this._id,
            email: this.email,
            username: this.username
        },
        process.env.ACCESS_TOKEN_SECRET,
        {expiresIn: process.env.ACCESS_TOKEN_EXPIRY}
    )
}

// method for access token generation
userSchema.methods.generateRefreshToken = function(){
    return jwt.sign(
        {
            _id: this.id
        },
        process.env.REFRESH_TOKEN_SECRET,
        {expiresIn: process.env.REFRESH_TOKEN_EXPIRY}
    )
}

// methods for tokens (without data)
userSchema.methods.generateTempToken = function(){
    const unHashedToken = crypto.randomBytes(20).toString("hex")
    const hashedToken = crypto
        .createHash("sha256")
        .update(unHashedToken)
        .digest("hex")
    
    const tokenExpiry = Date.now() + (20*60*1000) // added 20 min expiry
    return {unHashedToken,hashedToken,tokenExpiry}
}

const User = mongoose.model('User',userSchema)
export default User