import express from "express"
import * as userController from '../controllers/users.controller.js'
import { upload } from "../middlewares/multer.middleware.js"

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

export default user