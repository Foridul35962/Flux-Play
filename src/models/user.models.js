import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken"

const userSchema = new mongoose.Schema({
    userName:{
        type: String,
        require: true,
        lowercase: true,
        unique: true,
        trim: true,
        index: true
    },
    email:{
        type: String,
        require: true,
        lowercase: true,
        unique: true,
        trim: true,
    },
    fullName:{
        type: String,
        require: true,
        lowercase: true,
        trim: true,
    },
    avatar:{
        type: String,   //cloudinary URL
        require: true,
    },
    avatar:{
        type: String,   //cloudinary URL
    },
    watchHistory:[{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Video'
    }],
    password:{
        type: String,
        require: true
    },
    refreshToken:{
        type: String
    }

},{timestamps:true})


//add encrypting password
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        return next()
    }
    this.password = bcrypt.hash(this.password,12)
    next()
})


//check encrypting password
userSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password, this.password)
}

//token define
userSchema.methods.generateAccessToken = function () {
    return jwt.sign({
        _id: this.id,
        email: this.email,
        fullName: this.fullName,
        userName: this.userName
    },
    process.env.ACCESS_TOKEN_SECRET,
    {expiresIn: process.env.ACCESS_TOKEN_EXPIRY})
}

userSchema.methods.generateRefreshToken = async function () {
    return jwt.sign({
        _id: this.id
    },
    process.env.REFRESH_TOKEN_SECRET,
    {expiresIn: process.env.REFRESH_TOKEN_EXPIRY})
}


export const User = mongoose.model("User", userSchema)