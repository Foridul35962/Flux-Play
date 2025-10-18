import { asyncHandler } from "../utils/asyncHandler";
import { Video } from "../models/video.models.js";
import mongoose from "mongoose";
import { ApiErrors } from "../utils/ApiErrors.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

export const getAllVideos = asyncHandler(async (req, res) => {
    const {
        page = 1,
        limit = 10,
        query,
        sortBy = "createdAt",
        sortType = "desc",
        userId
    } = req.query

    if (!userId) {
        throw new ApiErrors(400, "user Id is required")
    }

    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);

    const matchStage = {
        owner: mongoose.Types.ObjectId(userId)
    }

    if (query) {
        matchStage.title = { $regex: query, $options: "i" }
    }

    const aggregatePipeline = [
        {
            $match: matchStage
        },
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "ownerDetails",
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
            $addFields: {
                owner: { $arrayElemAt: ["$ownerDetails", 0] },
            }
        },
        {
            $project: {
                title: 1,
                description: 1,
                thumbnail: 1,
                views: 1,
                createdAt: 1,
                owner: 1,
            },
        }
    ]

    //sorting

    if (sortBy && sortType) {
        const sortOrder = (sortType === "asc") ? 1 : -1
        aggregatePipeline.push({
            $sort: { [sortBy]: sortOrder },
        })
    }

    const options = {
        page: pageNumber,
        limit: limitNumber,
    }

    const videos = await Video.aggregatePaginate(
        Video.aggregate(aggregatePipeline),
        options
    )

    return res
        .status(200)
        .json(new ApiResponse(200, videos, "Videos fetched successfully"))
})

export const publishVideo = asyncHandler(async (req, res) => {
    const { title, description, duration } = req.body
    const userId = req.user?._id
    if (!title || !description || !duration) {
        throw new ApiErrors(400, "Video title, description and duration must be required")
    }

    const videoFileLocalPath = req.files?.videoFile?.[0]?.path
    const thumbnailLocalPath = req.files?.thumbnail?.[0]?.path

    if (!videoFileLocalPath) {
        throw new ApiErrors(400, "video is not found")
    }

    if (!thumbnailLocalPath) {
        throw new ApiErrors(400, "thumbnail is not found")
    }

    const videoUpload = await uploadOnCloudinary(videoFileLocalPath)
    if (!videoUpload) {
        throw new ApiErrors(400, "video must be required")
    }
    const thumbnailUpload = await uploadOnCloudinary(thumbnailLocalPath)
    if (!thumbnailUpload) {
        throw new ApiErrors(400, "thumbnail must be required")
    }

    const video = await Video.create({
        title,
        description,
        duration,
        videoFile: videoUpload.url,
        thumbnail: thumbnailUpload.url,
        owner: userId
    })

    if (!video) {
        throw new ApiErrors(400, "video published failed")
    }

    return res
        .status(200)
        .json(
            new ApiResponse(200, video, "video published successfully")
        )
})

export const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    if (!videoId) {
        throw new ApiErrors(400, "video Id is required")
    }

    if (!mongoose.Types.ObjectId.isValid(videoId)) {
        throw new ApiErrors(400, "Invalid Video ID format");
    }

    const video = await Video.findById(videoId)
    if (!video) {
        throw new ApiErrors(404, "video is not found")
    }

    return res
        .status(200)
        .json(
            new ApiResponse(200, video, "video fetched successfully")
        )
})

export const togglePublishedStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    const userId = req.user?._id
    if (!videoId) {
        throw new ApiErrors(400, "video Id is required")
    }

    const video = await Video.findOne(
        {
            _id: videoId,
            owner: userId
        }
    )
    
    if (!video) {
        throw new ApiErrors(404, "Video not found or you are not the owner")
    }

    video.isPublish = !video.isPublish
    await video.save()

    return res
        .status(200)
        .json(
            new ApiResponse(200, video, "published status toggled successfully")
        )
})

