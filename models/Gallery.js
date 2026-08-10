const mongoose = require('mongoose');

const gallerySchema = new mongoose.Schema({
    imageUrl: { type: String, required: true }, // Cloudinary URL
    caption: String,
}, { timestamps: true });

module.exports = mongoose.model('Gallery', gallerySchema);