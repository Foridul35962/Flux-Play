import express from "express"
import * as userController from '../controllers/users.controller.js'
import { upload } from "../middlewares/multer.middleware.js"
import { verifyJWS } from "../middlewares/auth.middleware.js"

const user = express.Router()

user.post('/register',upload.fields([
        {
            name: 'avatar',
            maxCount:1
        },
        {
            name:'coverImage',
            maxCount:1
        }
    ]),userController.registerUser)

user.post('/logIn', userController.loggedInUser)
user.post('/logOut', verifyJWS, userController.loggedOutUser)
user.post('/restore-token', userController.refreshAccessToken)
user.post('/change-password', verifyJWS, userController.changePassword)
user.patch('/update-user-details', verifyJWS, userController.updateUserDetails)
user.patch('/update-avatar', verifyJWS, upload.single("avatar"), userController.updateAvatar)
user.patch('/update-cover-image', verifyJWS, upload.single("coverImage"), userController.updateCoverImage)
user.get('/channel-profile/:userName', verifyJWS, userController.userChannelProfile)
user.get('/watch-history', verifyJWS, userController.getWatchHistory)

export default user