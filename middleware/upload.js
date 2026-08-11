const multer = require('multer');
const CloudinaryStorage = require('multer-storage-cloudinary');
require('../config/cloudinary'); // runs cloudinary.config() as a side effect
const cloudinary = require('cloudinary'); // raw package, has .v2 on it

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'portfolio',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 1200, crop: 'limit' }],
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
});

module.exports = upload;