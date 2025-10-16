import { asyncHandler } from '../utils/asyncHandler.js'
import { check, ExpressValidator, validationResult } from 'express-validator'
import { ApiErrors } from '../utils/ApiErrors.js'
import { User } from '../models/user.models.js'
import { uploadOnCloudinary } from '../utils/cloudinary.js'
import { ApiResponse } from '../utils/ApiResponse.js'
import { DeleteImage } from '../utils/deleteImage.js'
import generateAccessAndRefreshToken from '../utils/Token.js'
import jwt from 'jsonwebtoken'
import mongoose from 'mongoose'


export const registerUser = [
    check('userName')
        .trim()
        .isLength({ min: 5 })
        .withMessage('UserName must be at least 5 charecter'),
    check('email')
        .isEmail()
        .withMessage('Need a valid Email')
        .normalizeEmail(),
    check('fullName')
        .notEmpty()
        .withMessage('Need a valid Email'),
    check('password')
        .isLength({ min: 8 })
        .matches(/[a-zA-Z]/)
        .withMessage('Password mush be has one alphabet')
        .matches(/[0-9]/)
        .withMessage('Password mush be has one number')
        .trim(),
    check('confirm_password')
        .trim()
        .custom((value, { req }) => {
            if (value !== req.body.password) {
                throw new Error("Password not matched")
            }
            return true
        }),

    asyncHandler(async (req, res, next) => {
        const { userName, email, fullName, password } = req.body

        //loacl path form image
        const avatarLocalPath = req.files?.avatar?.[0]?.path
        const coverImageLocalPath = req.files.coverImage && req.files?.coverImage?.[0]?.path

        if (!avatarLocalPath) {
            new DeleteImage(avatarLocalPath, coverImageLocalPath)
            throw new ApiErrors(400, 'avatar must be required')
        }

        const error = validationResult(req)
        if (!error.isEmpty()) {
            new DeleteImage(avatarLocalPath, coverImageLocalPath)
            throw new ApiErrors(400, 'Wrong value entered errors', error.array())
        }

        // checked: is email and userName unique
        const existingUser = await User.findOne({ $or: [{ email }, { userName }] })
        if (existingUser) {
            new DeleteImage(avatarLocalPath, coverImageLocalPath)
            throw new ApiErrors(409, 'email and user name is already exist')
        }

        // //upload image on cloudinary
        const avatar = await uploadOnCloudinary(avatarLocalPath)
        const coverImage = await uploadOnCloudinary(coverImageLocalPath)
        if (!avatar) {
            new DeleteImage(avatarLocalPath, coverImageLocalPath)
            throw new ApiErrors(400, 'avatar must be required')
        }

        //upload data in database
        User.create({
            fullName,
            avatar: avatar.url,
            coverImage: req.files.coverImage && coverImage?.url || "",
            email, password, userName
        }).then((user) => {
            if (user) {
                const userObj = user.toObject()
                delete userObj.password
                return res.status(200).json(
                    new ApiResponse(200, userObj, "user registered successfully")
                )
            }
        })
    })
]


export const loggedInUser = asyncHandler(async (req, res) => {
    const { email, userName, password } = req.body

    if (!userName && !email) {
        throw new ApiErrors(401, "user or email is required")
    }

    //check: is user exist
    const user = await User.findOne({
        $or: [{ email }, { userName }]
    })

    if (!user) {
        throw new ApiErrors(402, "User does not exist")
    }

    //check: is password correct
    const validationPassword = await user.isPasswordCorrect(password)
    if (!validationPassword) {
        throw new ApiErrors(403, "Password is incorrect")
    }

    //create tokens
    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id)

    //sending cookies
    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")
    const options = {
        httpOnly: true,
        secure: true
    }
    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(new ApiResponse(200, {
            user: loggedInUser
        }, "User LoggedIn successfully"))
})

export const loggedOutUser = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(
        req.user._id, {
        $set: {
            refreshToken: undefined
        }
    }, {
        new: true
    })

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
        .status(200)
        .clearCookie("accessToken")
        .clearCookie("refreshToken")
        .json(new ApiResponse(200, {}, "User Logged Out Successfully"))
})

export const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken = req.cookies?.refreshToken || req.body.refreshToken
    if (!incomingRefreshToken) {
        throw new ApiErrors(401, "Unauthorize request")
    }

    try {
        const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET)
        const user = await User.findById(decodedToken?._id)
        if (!user) {
            throw new ApiErrors(401, "Invalid refresh token")
        }

        if (incomingRefreshToken !== user.refreshToken) {
            throw new ApiErrors(401, "Refresh token is expired")
        }

        const { accessToken } = await generateAccessAndRefreshToken(user._id, true)
        const options = {
            httpOnly: true,
            secure: true
        }

        return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", incomingRefreshToken, options)
            .json(
                new ApiResponse(201, { accessToken, refreshToken: incomingRefreshToken }, "Access Token refreshed")
            )
    } catch (error) {
        throw new ApiErrors(401, error?.message || "Invalid refresh token")
    }
})

export const changePassword = [
    check('oldPassword')
        .notEmpty()
        .withMessage('Old Password must be required'),

    check('newPassword')
        .isLength({ min: 8 })
        .matches(/[a-zA-Z]/)
        .withMessage('Password mush be has one alphabet')
        .matches(/[0-9]/)
        .withMessage('Password mush be has one number')
        .trim(),

    check('confirm_password')
        .trim()
        .custom((value, { req }) => {
            if (value !== req.body.newPassword) {
                throw new Error("Password not matched")
            }
            return true
        }),

    asyncHandler(async (req, res) => {
        const error = validationResult(req)
        if (!error.isEmpty()) {
            throw new ApiErrors(400, 'Insert wrong value', error.array())
        }

        const { oldPassword, newPassword } = req.body

        const user = await User.findById(req.user?._id)
        if (!user) {
            throw new ApiErrors(401, "Unauthorize access")
        }

        const checkPassword = await user.isPasswordCorrect(oldPassword)
        if (!checkPassword) {
            throw new ApiErrors(400, "Invalid Password")
        }

        user.password = newPassword
        await user.save({ validateBeforeSave: false })

        return res
            .status(200)
            .json(
                new ApiResponse(200, {}, "Password changed successfully")
            )
    })
]

export const updateUserDetails = [
    check('userName')
        .notEmpty()
        .withMessage('user name is required')
        .trim()
        .isLength({ min: 5 })
        .withMessage('UserName must be at least 5 charecter'),
    check('email')
        .notEmpty()
        .withMessage('email is required')
        .isEmail()
        .withMessage('Need a valid Email')
        .normalizeEmail(),

    asyncHandler(async (req, res, next) => {
        const error = validationResult(req)
        if (!error.isEmpty()) {
            new ApiErrors(400, "Insert wrong value", error.array())
        }

        const { userName, email } = req.body
        const user = await User.findByIdAndUpdate(req.user?._id, {
            $set: { userName, email }
        }, { new: true }).select("-password -refreshToken")

        return res
            .status(200)
            .json(
                new ApiResponse(200, user, "Update user details is successfully")
            )
    })
]

export const updateAvatar = asyncHandler(async (req, res) => {
    const avatarLocalPath = req.file?.path
    if (!avatarLocalPath) {
        throw new ApiErrors(400, "avatar image is require")
    }

    const uploadedImage = await uploadOnCloudinary(avatarLocalPath)
    if (!uploadedImage) {
        throw new ApiErrors(400, "Avatar image uploaded fail")
    }

    const user = await User.findByIdAndUpdate(req.user?._id, {
        $set: { avatar: uploadedImage.url }
    }, { new: true }).select("-password -refreshToken")
    if (!user) {
        throw new ApiErrors(400, "Avatar image update on database failed")
    }

    return res
        .status(200)
        .json(
            new ApiResponse(200, user, "Avatar image update successfully")
        )
})

export const updateCoverImage = asyncHandler(async (req, res) => {
    const coverImageLocalPath = req.file?.path
    if (!coverImageLocalPath) {
        throw new ApiErrors(400, "Cover Image is require")
    }

    const uploadedCoverImage = await uploadOnCloudinary(coverImageLocalPath)
    if (!updateCoverImage) {
        throw new ApiErrors(400, "Cover Image uploaded failed")
    }

    const user = await User.findByIdAndUpdate(req.user?._id, {
        $set: { coverImage: updateCoverImage.url }
    }, { new: true }).select("-password -refreshToken")
    if (!user) {
        throw new ApiErrors(400, "Cover Image updated on database failed")
    }

    return res
        .status(200)
        .json(
            new ApiResponse(200, user, "Cover Image is updated successfully")
        )
})

export const userChannelProfile = asyncHandler(async (req, res) => {
    const { userName } = req.params

    if (!userName) {
        throw new ApiErrors(400, "user name is missing")
    }

    const channel = await User.aggregate([
        { $match: { userName } },
        {
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "channel",
                as: "subscribers"
            }
        },
        {
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "subscriber",
                as: "subscribedTo"
            }
        },
        {
            $addFields: {
                subscriberCount: {
                    $size: "$subscribers"
                },
                channelSubscribedToCount: {
                    $size: "$subscribedTo"
                },
                isSubscribed: {
                    $cond: {
                        if: { $in: [req.user?._id, "$subscribers.subscriber"] },
                        then: true,
                        else: false
                    }
                }
            }
        },
        {
            $project: {
                fullName: 1,
                userName: 1,
                subscriberCount: 1,
                channelSubscribedToCount: 1,
                isSubscribed: 1,
                avatar: 1,
                coverImage: 1,
                email: 1
            }
        }
    ])

    if (!channel?.length) {
        throw new ApiErrors(404, "channel does not exist")
    }

    return res
        .status(200)
        .json(
            new ApiResponse(200, channel[0], "User channel fetched successfully")
        )
})

export const getWatchHistory = asyncHandler(async (req, res) => {
    const user = await User.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(_id)
            }
        },
        {
            $lookup: {
                from: "videos",
                localField: "watchHistory",
                foreignField: "_id",
                as: "watchHistory",
                pipeline: [
                    {
                        $lookup: {
                            from: "users",
                            localField: "owner",
                            foreignField: "_id",
                            as: "owner",
                            pipeline: [
                                {
                                    $project: {
                                        fullName: 1,
                                        userName: 1,
                                        avatar: 1
                                    }
                                }
                            ]
                        }
                    },
                    {
                        $addFields: {
                            owner: {
                                $first: "$owner"
                            }
                        }
                    }
                ]
            }
        }
    ])

    return res
        .status(200)
        .json(
            new ApiResponse(200, user[0].watchHistory, "watch history fetched successfully")
        )
})