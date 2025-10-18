import express from 'express'
import cookieParser from 'cookie-parser'
import cors from 'cors'

//local file import
import userRouter from './routers/users.router.js'
import errorHandle from './utils/errorHandle.js'
import commentRouter from './routers/comments.router.js'
import likeRouter from './routers/likes.router.js'
import playlistRouter from './routers/playlists.router.js'
import subscribeRouter from './routers/subscribes.router.js'
import videoRouter from './routers/videos.router.js'


const app = express()

//setting request URL
app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))

//setting for req.body
app.use(express.urlencoded({extended:false}))
app.use(express.json())

//public files
app.use(express.static('public'))

// sent and read cookies
app.use(cookieParser())

//router
app.use('/api/v1/users', userRouter)
app.use('/api/v1/comments', commentRouter)
app.use('/api/v1/likes', likeRouter)
app.use('/api/v1/playlists', playlistRouter)
app.use('/api/v1/subscribe', subscribeRouter)
app.use('/api/v1/videos', videoRouter)

//Global error handler
app.use(errorHandle)


export {app}