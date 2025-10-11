import { asyncHandler } from '../utils/asyncHandler.js'
import { check, ExpressValidator, validationResult } from 'express-validator'
import { ApiErrors } from '../utils/ApiErrors.js'
import { User } from '../models/user.models.js'
import { uploadOnCloudinary } from '../utils/cloudinary.js'
import { ApiResponse } from '../utils/ApiResponse.js'
import { DeleteImage } from '../utils/deleteImage.js'
import generateAccessAndRefreshToken from '../utils/Token.js'


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

    if (!userName || !email) {
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