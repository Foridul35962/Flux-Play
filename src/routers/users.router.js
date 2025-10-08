import express from "express"
import * as userController from '../controllers/users.controller.js'

const user = express.Router()

user.post('/register',userController.registerUser)

export default user