import mongoose from "mongoose";

const subscribeSchema = new mongoose.Schema({
    subscriber:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    channel:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }
},{timestamps:true})

export const Subscribe = mongoose.model("Subscribe", subscribeSchema)