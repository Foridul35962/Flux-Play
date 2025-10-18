import express from 'express'
import * as videoController from '../controllers/videos.controller.js'
import { verifyJWS } from '../middlewares/auth.middleware.js'
import { upload } from '../middlewares/multer.middleware.js'

const video = express.Router()

video.get('/get-all-videos', videoController.getAllVideos)
video.use(verifyJWS)
video.post('/publish', upload.fields([
    {
        name: "videoFile",
        maxCount: 1
    },
    {
        name: "thumbnail",
        maxCount: 1
    }
    ]), videoController.publishVideo)
video.get('/get-video/:videoId', videoController.getVideoById)
video.patch('/toggle-public-status/:videoId', videoController.togglePublishedStatus)

export default video