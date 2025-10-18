import mongoose from "mongoose";
import { Subscription } from "../models/subscribe.models.js";
import { ApiErrors } from "../utils/ApiErrors.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const toggleSubscription = asyncHandler(async (req, res) => {
    const { channelId } = req.body
    const userId = req.user?._id
    if (!channelId) {
        throw new ApiErrors(400, "channel id is required")
    }

    const isAlreadySubscribe = await Subscription.findOne({
        subscriber: userId,
        channel: channelId
    })

    let message = ""

    if (!isAlreadySubscribe) {
        const isSubscribe = await Subscription.create({
            subscriber: userId,
            channel: channelId
        })

        if (!isSubscribe) {
            throw new ApiErrors(400, "channel subscribed failed")
        }

        message = "channel subscribed successfully"
    } else {
        const isUnsubscribe = await Subscription.findOneAndDelete({
            subscriber: userId,
            channel: channelId
        })

        if (!isUnsubscribe) {
            throw new ApiErrors(400, "channel unsubscribed failed")
        }

        message = "channel unsubscribed successfully"
    }

    return res
        .status(200)
        .json(
            new ApiResponse(200, {}, message)
        )
})

export const channelSubscribers = asyncHandler(async (req, res) => {
    const { channelId } = req.params

    if (!channelId) {
        throw new ApiErrors(400, "channel Id is required")
    }
    const subscribers = await Subscription.aggregate([
        { $match: { channel: new mongoose.Types.ObjectId(channelId) } },
        {
            $lookup: {
                from: "users",
                localField: "subscriber",
                foreignField: "_id",
                as: "subscriber",
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
            $unwind: "$subscriber"
        },
        {
            $project: {
                _id: 0,
                subscriber: 1
            }
        }
    ])

    if (!subscribers || !subscribers.length) {
        throw new ApiErrors(400, "subscribers not found")
    }

    const subscribersCount = subscribers.length;

    return res
        .status(200)
        .json(
            new ApiResponse(200, { subscribersCount, subscribers }, "subscribers fetched successfully")
        )
})

export const subscribedChannel = asyncHandler(async (req, res) => {
    const userId = req.user?._id

    const channels = await Subscription.aggregate([
        { $match: { subscriber: new mongoose.Types.ObjectId(userId) } },
        {
            $lookup: {
                from: "users",
                localField: "channel",
                foreignField: "_id",
                as: "channel",
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
            $unwind: "$channel"
        },
        {
            $project: {
                _id: 0,
                channels: 1
            }
        }
    ])

    if (!channels || !channels.length) {
        throw new ApiErrors(400, "channels not found")
    }
    const countChannels = channels.length

    return res
        .status(200)
        .json(
            new ApiResponse(200, {
                countChannels,
                channels
            },"channels fetched successfully")
        )
})