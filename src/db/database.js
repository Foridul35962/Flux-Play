import mongoose from "mongoose";
import { DB_Name } from "../utils/constance.js";

const connectDB = async ()=>{
    await mongoose.connect(`${process.env.MONGODB_URL}/${DB_Name}`).then((connectionInstance)=>{
        console.log('Database is connected');
        return connectionInstance
    }).catch((err)=>{
        console.log('Database connection failed: ',err.message);
        throw err
    })
}

export default connectDB