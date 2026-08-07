const fs = require('fs')
const path = require('path')

const UPLOAD_DIR = path.join(__dirname, '..', 'uploads')

const UPLOAD_FILE_RE = /\/uploads\/([a-f0-9-]+\.(?:jpg|png|webp|gif))$/i

fs.mkdirSync(UPLOAD_DIR, { recursive: true })

function isUploadedImage(value) {
  return typeof value === 'string' && UPLOAD_FILE_RE.test(value)
}

function deleteUploadedImage(value) {
  if (!isUploadedImage(value)) return
  const filename = value.match(UPLOAD_FILE_RE)[1]
  fs.unlink(path.join(UPLOAD_DIR, filename), () => {})
}

module.exports = { UPLOAD_DIR, isUploadedImage, deleteUploadedImage }
