import express from 'express'
import * as likeController from '../controllers/likes.controller.js'
import { verifyJWS } from '../middlewares/auth.middleware.js'

const like = express.Router()

like.use(verifyJWS)

like.patch('/toggle-video-like/:videoId', likeController.toggleVideoLikes)
like.post('/toggle-comment-like', likeController.toggleCommentLikes)
like.get('/get-liked/:videoId', likeController.getLikedVideo)

export default like