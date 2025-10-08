import multer from "multer";

const fileStorage = multer.diskStorage({
    destination:(req, file, cb)=>{
        cb(null,'../public/upload')
    },
    filename:(req, file, cb)=>{
        cb(null, new Date().toISOString().replace(/:/g,'-')+'-'+file.originalname)
    }
})

export const upload = multer({storage:fileStorage})