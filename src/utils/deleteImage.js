import fs from 'fs'

class DeleteImage {
    constructor(avatarPath, coverPath) {
        if (avatarPath) {
            fs.unlink(avatarPath, (err) => {
                if (err) console.error("Failed to delete local file:", err);
            });
        }
        if (coverPath) {
            fs.unlink(coverPath, (err) => {
                if (err) console.error("Failed to delete local file:", err);
            });
        }
    }
}

export {DeleteImage}