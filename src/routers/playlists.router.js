import express from 'express'
import * as playlistController from '../controllers/playlist.controller.js'
import { verifyJWS } from '../middlewares/auth.middleware.js'

const playlist = express.Router()

playlist.use(verifyJWS)

playlist.post('/create', playlistController.createPlaylist)
playlist.get('/user-playlist/:userId', playlistController.getUserPlaylist)
playlist.get('/:playlistId', playlistController.getPlaylistById)
playlist.patch('/:playlistId/add-video/:videoId', playlistController.addVideoToPlaylist)
playlist.patch('/:playlistId/remove-video/:videoId', playlistController.removeVideoFromPlaylist)
playlist.delete('/remove/:playlistId', playlistController.deletePlaylist)
playlist.patch('/update/:playlistId', playlistController.updatePlaylist)

export default playlist