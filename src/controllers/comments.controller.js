import mongoose from "mongoose";
import { Video } from "../models/video.models.js";
import { ApiErrors } from "../utils/ApiErrors.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Comments } from "../models/comments.models.js";

export const getVideoComments = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    const { page = 1, limit = 10 } = req.query

    if (!videoId) {
        throw new ApiErrors(400, 'videoId is missing')
    }

    const isVideoValid = await Video.findById(videoId)
    if (!isVideoValid) {
        throw new ApiErrors(404, "Video not valid")
    }

    const pageNumber = parseInt(page);
    const limitNumber = parseInt(limit);
    const skip = (pageNumber - 1) * limitNumber;

    const allComments = await Video.aggregate([
        { $match: { _id: new mongoose.Types.ObjectId(videoId) } },
        {
            $lookup: {
                from: 'comments',
                localField: '_id',
                foreignField: 'video',
                as: 'comments',
                pipeline: [
                    {
                        $sort: { createdAt: -1 }
                    },
                    {
                        $skip: skip
                    },
                    {
                        $limit: limitNumber
                    },
                    {
                        $project: {
                            content: 1,
                            owner: 1
                        }
                    },
                    {
                        $lookup: {
                            from: 'users',
                            localField: 'owner',
                            foreignField: '_id',
                            as: 'owner',
                            pipeline: [
                                {
                                    $project: {
                                        userName: 1,
                                        avatar: 1
                                    }
                                }
                            ]
                        }
                    },
                    {
                        $unwind: {
                            path: '$owner',
                            preserveNullAndEmptyArrays: true
                        }
                    },
                    {
                        $project: {
                            content: 1,
                            owner: 1,
                            createdAt: 1
                        }
                    }
                ]
            }
        }
    ])

    if (!allComments.length) {
        throw new ApiErrors(404, "comment not found")
    }

    return res
        .status(200)
        .json(
            new ApiResponse(200, allComments[0].comments, "Comment fetched successfully")
        )

})

export const addComment = asyncHandler(async (req, res) => {
    const { content, videoId } = req.body
    const { _id } = req.user
    if (!content || !videoId) {
        throw new ApiErrors(400, "content and video Id both are required")
    }

    const newComment = await Comments.create({
        content,
        video: videoId,
        owner: _id
    })
    if (!newComment) {
        throw new ApiErrors(400, "comment add failed")
    }

    return res
        .status(200)
        .json(
            new ApiResponse(200, newComment, "comment added successfully")
        )
})

export const updateComment = asyncHandler(async (req, res) => {
    const { _id, content } = req.body
    const userId = req.user?._id
    const isCommentUpdated = await Comments.findOneAndUpdate(
        { _id, owner: userId },
        { content },
        { new: true }
    )
    if (!isCommentUpdated) {
        throw new ApiErrors(404, "Comment not found")
    }

    return res
        .status(200)
        .json(
            new ApiResponse(200, isCommentUpdated, "Comment updated successfully")
        )
})

export const deleteComment = asyncHandler(async (req, res) => {
    const { _id } = req.body
    const userId = req.user?._id

    const isDeleted = await Comments.findOneAndDelete(
        { _id, owner: userId }
    )

    if (!isDeleted) {
        throw new ApiErrors(404, "comment can not deleted")
    }

    return res
        .status(200)
        .json(
            new ApiResponse(200, {}, "comment deleted successfully")
        )
})