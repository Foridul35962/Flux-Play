import { v2 as cloudinary } from "cloudinary";
import fs from 'fs'

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_API_KEY,
    api_secret: process.env.CLOUD_API_SECRET
});

const uploadOnCloudinary = async (localFilePath)=>{
    try {
        if (!localFilePath) {
            return null
        }
        await cloudinary.uploader.upload(localFilePath,{
            resource_type: "auto"
        }).then((response)=>{
            console.log('file uploaded on cloudinary successfully', response.url);
            return response
        })
    } catch (error) {
        fs.unlinkSync(localFilePath)
        return null
    }
}

export {uploadOnCloudinary}
