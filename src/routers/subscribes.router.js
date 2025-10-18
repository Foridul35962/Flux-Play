import express from 'express'
import * as subscribeController from '../controllers/subscribe.controller.js'
import { verifyJWS } from '../middlewares/auth.middleware.js'


const subscribe = express.Router()

subscribe.use(verifyJWS)

subscribe.post('/toggle', subscribeController.toggleSubscription)
subscribe.get('/channel-subscribers/:channelId', subscribeController.channelSubscribers)
subscribe.get('/subscribed-channel', subscribeController.subscribedChannel)

export default subscribe