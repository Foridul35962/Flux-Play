import { Likes } from "../models/likes.models.js";
import { ApiErrors } from "../utils/ApiErrors.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import mongoose from "mongoose";

export const toggleVideoLikes = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    const userId = req.user._id

    if (!videoId) {
        throw new ApiErrors(400, "video id is require")
    }

    let message = ""

    const alreadyLikedVideo = await Likes.findOne({
        video: videoId,
        likedBy: userId
    })
    if (!alreadyLikedVideo) {
        const likedVideo = await Likes.create({
            video: videoId,
            likedBy: userId
        })
        message = "Video liked successfully"

        if (!likedVideo) {
            throw new ApiErrors(400, "like video failed")
        }
    } else {
        const dislikedVideo = await Likes.findOneAndDelete({
            video: videoId,
            likedBy: userId
        })
        message = "Video unliked successfully"

        if (!dislikedVideo) {
            throw new ApiErrors(400, "video liked delete failed")
        }
    }

    return res
        .status(200)
        .json(
            new ApiResponse(200, {}, message)
        )
})

export const toggleCommentLikes = asyncHandler(async (req, res) => {
    const { commentId } = req.body
    const userId = req.user._id

    if (!commentId) {
        throw new ApiErrors(400, "comment id is required")
    }
    const alreadyLikedComment = await Likes.findOne({
        comment: commentId,
        likedBy: userId
    })

    let message = ""
    if (!alreadyLikedComment) {
        const likedComment = await Likes.create({
            comment: commentId,
            likedBy: userId
        })
        message = "comment liked successful"

        if (!likedComment) {
            throw new ApiErrors(400, "comment liked failed")
        }
    } else {
        const dislikedComment = await Likes.findOneAndDelete({
            comment: commentId,
            likedBy: userId
        })
        message = "comment disliked successful"

        if (!dislikedComment) {
            throw new ApiErrors(400, "comment disliked failed")
        }
    }

    return res
        .status(200)
        .json(
            new ApiResponse(200, {}, message)
        )
})

export const getLikedVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    const likedVideo = await Likes.aggregate([
        { $match: { video: new mongoose.Types.ObjectId(videoId) } },
        {
            $lookup: {
                from: "users",
                localField: "likedBy",
                foreignField: "_id",
                as: "likedByUser",
                pipeline: [
                    {
                        $project: {
                            userName: 1
                        }
                    }
                ]
            }
        },
        {
            $group: {
                _id: null,
                likedUsers: { $push: "$likedByUser" },
                likeCount: { $sum: 1 }
            }
        },
        {
            $project: {
                _id: 0,
                likeCount: 1,
                likedUsers: {
                    $reduce: {
                        input: "$likedUsers",
                        initialValue: [],
                        in: { $concatArrays: ["$$value", "$$this"] }
                    }
                }
            }
        }
    ])

    if (!likedVideo || !likedVideo.length) {
        throw new ApiErrors(400, "liked videos does not found")
    }

    return res
        .status(200)
        .json(
            new ApiResponse(200, likedVideo[0], "liked video fetched successfully")
        )
})