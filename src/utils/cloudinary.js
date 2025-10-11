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

export { uploadOnCloudinary }