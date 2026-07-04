import mongoose, {Schema} from "mongoose";
import bcrypt from "bcryptjs";

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
            type:Data
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

userSchema.pre("save", async function (next) {
    if(!this.isModified("password")) return next()

    this.password = await bcrypt.hash(this.password, 10)
    next()
})

userSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password, this.password)
}

export const User = mongoose.model('User',userSchema)