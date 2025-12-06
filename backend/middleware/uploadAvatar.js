const multer = require("multer")
const path = require("path")
const fs = require("fs")

const uploadFolder = path.join(__dirname, "../uploads/avatars")
if (!fs.existsSync(uploadFolder)) {
    fs.mkdirSync(uploadFolder, { recursive: true })
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadFolder)
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname)
        const filename = `${req.user.utorid}${ext}`
        cb(null, filename)
    },
})

const uploadAvatar = multer({ storage })

module.exports = uploadAvatar
