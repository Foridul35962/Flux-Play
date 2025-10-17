import mongoose from "mongoose";

const LikesSchema = new mongoose.Schema({
    comment: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "comments"
    },
    video: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "videos"
    },
    likedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
        unique: true
    }
}, { timestamps: true })

export const Likes = mongoose.model("Likes", LikesSchema)