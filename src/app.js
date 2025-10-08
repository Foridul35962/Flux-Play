import express from 'express'
import cookieParser from 'cookie-parser'
import cors from 'cors'

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

app.use(cookieParser())


export {app}