const express = require('express')
const crypto = require('crypto')
const path = require('path')
const fs = require('fs')
const multer = require('multer')
const { auth, admin } = require('../middleware/auth')
const { UPLOAD_DIR } = require('../utils/uploads')

const router = express.Router()

const MAX_SIZE = 5 * 1024 * 1024

const FORMATS = {
  jpeg: {
    ext: '.jpg',
    detect: buf => buf.length > 3 && buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff,
  },
  png: {
    ext: '.png',
    detect: buf => buf.length > 8 && buf.readUInt32BE(0) === 0x89504e47 && buf.readUInt32BE(4) === 0x0d0a1a0a,
  },
  gif: {
    ext: '.gif',
    detect: buf => buf.length > 6 && /^GIF8[79]a$/.test(buf.toString('ascii', 0, 6)),
  },
  webp: {
    ext: '.webp',
    detect: buf => buf.length > 12 && buf.toString('ascii', 0, 4) === 'RIFF' && buf.toString('ascii', 8, 12) === 'WEBP',
  },
}

function detectFormat(buffer) {
  for (const format of Object.values(FORMATS)) {
    try {
      if (format.detect(buffer)) return format
    } catch (e) {
      // ignore short buffers
    }
  }
  return null
}

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_SIZE, files: 1, fields: 0 },
})

router.post('/', auth, admin, (req, res) => {
  upload.single('image')(req, res, err => {
    if (err) {
      console.error('[POST /api/upload] multer:', err)
      if (err.code === 'LIMIT_FILE_SIZE') return res.status(413).json({ message: 'Image must be 5MB or smaller' })
      if (err.code === 'LIMIT_UNEXPECTED_FILE') return res.status(400).json({ message: 'Only a single image field is allowed' })
      return res.status(400).json({ message: 'Invalid upload request' })
    }

    if (!req.file) {
      return res.status(400).json({ message: 'No image file provided' })
    }

    const format = detectFormat(req.file.buffer)
    if (!format) {
      return res.status(400).json({ message: 'Only JPEG, PNG, GIF, or WebP images are allowed' })
    }

    const filename = crypto.randomUUID() + format.ext
    fs.writeFileSync(path.join(UPLOAD_DIR, filename), req.file.buffer)

    const url = `${req.protocol}://${req.get('host')}/uploads/${filename}`
    res.status(201).json({ url })
  })
})

module.exports = router
