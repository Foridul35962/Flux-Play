import { User } from "../models/user.models.js"
import { ApiErrors } from "./ApiErrors.js"

const generateAccessAndRefreshToken = async (userId, isOnlyAccessToken = false)=>{
    try {
        const user = await User.findById(userId)
        const accessToken = await user.generateAccessToken()
        if (!isOnlyAccessToken) {
            const refreshToken = await user.generateRefreshToken()
            user.refreshToken = refreshToken
            await user.save({validateBeforeSave: false})
            return {accessToken, refreshToken}
        }
        return {accessToken}

    } catch (error) {
        throw new ApiErrors(500, "Something went wrong while generate Access and refresh token")
    }
}

export default generateAccessAndRefreshToken