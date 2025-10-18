import dotenv from "dotenv";
dotenv.config();
import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_API_KEY,
    api_secret: process.env.CLOUD_API_SECRET,
});

const uploadOnCloudinary = async (localFilePath) => {
    if (!localFilePath) return null;
    try {
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto",
        });
        fs.unlink(localFilePath, (err) => {
            if (err) console.error("Failed to delete local file:", err);
        });
        return response;
    } catch (error) {
        console.error("Cloudinary upload error:", error);
        fs.unlink(localFilePath, (err) => {
            if (err) console.error("Failed to delete local file:", err);
        });
        return null;
    }
};

const deleteFromCloudinary = async (publicId) => {
    if (!publicId) {
        return null
    }

    try {
        const response = await cloudinary.uploader.destroy(publicId, {
            resource_type: "auto"
        })
        return response
    } catch (error) {
        console.error("Cloudinary delete error:", error);
        return null;
    }
}

export { uploadOnCloudinary, deleteFromCloudinary }