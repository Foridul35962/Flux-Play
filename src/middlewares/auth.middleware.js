import jwt from "jsonwebtoken";
import { ApiErrors } from "../utils/ApiErrors.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.models.js";

export const verifyJWS = asyncHandler(async (req, res, next)=>{
    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "")
        if (!token) {
            throw new ApiErrors(401, "Unathorization request")
        }
    
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
        if (!decodedToken) {
            throw new ApiErrors(401, "Wrong access token")
        }
    
        const user = await User.findById(decodedToken?._id).select("-password -refreshToken")
        if (!user) {
            throw new ApiErrors(402, "Invalid token access")
        }
    
        req.user = user
        next()
    } catch (error) {
        throw new ApiErrors(401, error.message||"Invalid Access token")
    }
})