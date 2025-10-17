import mongoose from "mongoose";

const playlistSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    discription: {
        type: String
    },
    videos: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "videos"
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users"
    }
}, { timestamps: true })

export const Playlists = mongoose.model("Playlists", playlistSchema)