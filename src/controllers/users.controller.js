import {asyncHandler} from '../utils/asyncHandler.js'
import { check, ExpressValidator, validationResult } from 'express-validator'
import { ApiErrors } from '../utils/ApiErrors.js'
import { User } from '../models/user.models.js'
import { uploadOnCloudinary } from '../utils/cloudinary.js'


export const registerUser = [
    check('userName')
        .trim()
        .isLength({min:5})
        .withMessage('UserName must be at least 5 charecter'),
    check('email')
        .isEmail()
        .withMessage('Need a valid Email')
        .normalizeEmail(),
    check('fullName')
        .notEmpty()
        .withMessage('Need a valid Email'),
    check('password')
        .isLength({min:8})
        .matches(/[a-zA-Z]/)
        .withMessage('Password mush be has one alphabet')
        .matches(/[0-9]/)
        .withMessage('Password mush be has one number')
        .trim(),
    check('confirm_password')
        .trim()
        .custom((value,{req})=>{
            if (value!==req.body.password) {
                throw new Error ("Password not matched")
            }
            return true
        }),

    asyncHandler(async(req, res, next)=>{
        const {userName, email, fullName, password } = req.body
        let error = validationResult(req)
        if (!error.isEmpty()) {
            error.array()
            throw new ApiErrors(400,'registration time errors', error)
        }
        //checked "is email and userName is unique"
        User.findOne({
            $or:[{email},{userName}]
        }).then(()=>{
            throw new ApiErrors(409, 'email and user name is already exist')
        })

        //loacl path form image
        const avatarLocalPath = req.file?.avatar[0]?.path;
        const coverImageLocalPath = req.file?.coverImage[0]?.path

        if (!avatarLocalPath) {
            throw new ApiErrors(400, 'avatar must be required')
        }

        //upload image on cloudinary
        const avatar = await uploadOnCloudinary(avatarLocalPath)
        const coverImage = await uploadOnCloudinary(coverImageLocalPath)
        if (!avatar) {
            throw new ApiErrors(400, 'avatar must be required')
        }

        //upload data in database
        User.create({
            fullName,
            avatar:avatar.url,
            coverImage: coverImage?.url|| "",
            email,password,userName
        })
    })
]