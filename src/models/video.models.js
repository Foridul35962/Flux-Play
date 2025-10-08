import mongoose from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const videoSchema = new mongoose.Schema({
    videoFile:{
        type: String,
        require: true
    },
    thumbails:{
        type: String,
        require: true
    },
    title:{
        type: String,
        require: true
    },
    discription:{
        type: String,
        require: true
    },
    duration:{
        type: Number,
        require: true
    },
    views:{
        type: Number,
        default: 0
    },
    isPublish:{
        type: Boolean,
        default: true
    },
    ower:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }
},{timestamps:true})

videoSchema.plugin(mongooseAggregatePaginate)

export const Video = mongoose.model("Video",videoSchema)