import multer from 'multer'
import path from 'path'
import fs from 'fs'
const uploadDir = './uploads'
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir)

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${file.originalname}`
    cb(null, uniqueName)
  }
})

function fileFilter(req, file, cb) {
  const allowed = /jpg|jpeg|png|pdf/
  const ext = path.extname(file.originalname).toLowerCase()
  if (allowed.test(ext)) cb(null, true)
  else cb(new Error('Only images or PDF files allowed'))
}

export const upload = multer({ storage, fileFilter })
