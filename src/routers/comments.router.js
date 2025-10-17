import express from 'express'
import { verifyJWS } from '../middlewares/auth.middleware.js'
import * as commentController from '../controllers/comments.controller.js'

const comment = express.Router()

comment.use(verifyJWS)
comment.get('/video-comments', commentController.getVideoComments)
comment.post('/add-comment', commentController.addComment)
comment.patch('/update-comment', commentController.updateComment)
comment.post('/delete-comment', commentController.deleteComment)

export default comment