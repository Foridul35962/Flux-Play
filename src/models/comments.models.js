import mongoose from "mongoose";

const commentSchema = new mongoose.Schema({
    content:{
        type: String,
        require: true
    },
    video:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "videos"
    },
    owner:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "users"
    }
},{timestamps: true})

export const Comments = mongoose.model("Comments", commentSchema)