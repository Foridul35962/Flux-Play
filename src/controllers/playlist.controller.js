import { ApiErrors } from "../utils/ApiErrors.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Playlists } from "../models/playlist.models.js";
import { ApiResponse } from "../utils/ApiResponse.js";

export const createPlaylist = asyncHandler(async (req, res) => {
    const { name, discription } = req.body
    const userId = req.user?._id
    if (!name) {
        throw new ApiErrors(400, "playlist name is required")
    }

    const playlist = await Playlists.create({
        name,
        discription: discription || "",
        owner: userId,
        videos: ""
    })

    if (!playlist) {
        throw new ApiErrors(400, "playlist create failed")
    }

    return res
        .status(200)
        .json(
            new ApiResponse(200, playlist, "playlist create successfully")
        )
})

export const getUserPlaylist = asyncHandler(async (req, res) => {
    const { userId } = req.params
    if (!userId) {
        throw new ApiErrors(400, "User ID is required")
    }
    const playlists = await Playlists.find({
        owner: userId
    })
    if (!playlists || !playlists.length) {
        throw new ApiErrors(404, "No playlists found for this user")
    }
    return res
        .status(200)
        .json(
            new ApiResponse(200, playlists, "playlist fetched successfully")
        )
})

export const getPlaylistById = asyncHandler(async (req, res) => {
    const { playlistId } = req.params
    if (!playlistId) {
        throw new ApiErrors(400, "playlist Id is required")
    }
    const playlist = await Playlists.findById(playlistId)

    if (!playlist) {
        throw new ApiErrors(400, "playlist is not found")
    }

    return res
        .status(200)
        .json(
            new ApiResponse(200, playlist, "playlist fetched successfully")
        )
})

export const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const { videoId, playlistId } = req.params

    if (!videoId || !playlistId) {
        throw new ApiErrors(400, "videoId and playlistId is required")
    }

    const addVideoInPlaylist = await Playlists.findByIdAndUpdate(
        playlistId,
        {
            $addToSet: { videos: videoId }
        },
        { new: true }
    )

    if (!addVideoInPlaylist) {
        throw new ApiErrors(404, "playlist is not found")
    }

    return res
        .status(200)
        .json(
            new ApiResponse(200, addVideoInPlaylist, "video add to playlist successfully")
        )
})

export const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const { playlistId, videoId } = req.params
    const userId = req.user?._id
    if (!playlistId || !videoId) {
        throw new ApiErrors(400, "playlistId and videoId is required")
    }

    const playlist = await Playlists.findOneAndUpdate(
        {
            _id: playlistId,
            owner: userId
        },
        {
            $pull: { videos: videoId }
        },
        {
            new: true
        }
    )

    if (!playlist) {
        throw new ApiErrors(404, "Playlist not found or you are not authorized")
    }

    return res
        .status(200)
        .json(
            new ApiResponse(200, playlist, "video removed from playlist successfully")
        )
})

export const deletePlaylist = asyncHandler(async (req, res) => {
    const { playlistId } = req.params
    const userId = req.user?._id

    if (!playlistId) {
        throw new ApiErrors(400, "playlist Id is required")
    }

    const deletedPlaylist = await Playlists.findOneAndDelete({
        _id: playlistId,
        owner: userId
    })

    if (!deletedPlaylist) {
        throw new ApiErrors(404, "Playlist is not found")
    }

    return res
        .status(200)
        .json(
            new ApiResponse(200, {}, "Playlist deleted successfully")
        )
})

export const updatePlaylist = asyncHandler(async (req, res) => {
    const { playlistId } = req.params
    const { name, discription } = req.body
    const userId = req.user?._id
    if (!playlistId) {
        throw new ApiErrors(400, "Playlist Id is required")
    }
    if (!name) {
        throw new ApiErrors(400, "Name is required")
    }

    let updateData = { name }
    if (discription !== undefined) {
        updateData.discription = discription
    }

    const playlist = await Playlists.findOneAndUpdate(
        {
            _id: playlistId,
            owner: userId
        },
        updateData,
        { new: true }
    )

    if (!playlist) {
        throw new ApiErrors(404, "Playlist not found")
    }

    return res
        .status(200)
        .json(
            new ApiResponse(200, playlist, "Playlist updated successfully")
        )
})