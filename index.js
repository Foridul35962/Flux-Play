import dotenv from 'dotenv'
dotenv.config({path:'./.env'})
import connectDB from './src/db/database.js'
import { app } from './src/app.js'


const PORT = process.env.PORT || 3000

connectDB().then(()=>{
    app.listen(PORT,()=>{
        console.log(`Server is running on http://localhost:${PORT}`);
    })
}).catch((err)=>{
    console.log('server connect failed: ',err);
})