const mongoose = require('mongoose');

const certificateSchema = new mongoose.Schema({
    title: { type: String, required: true },
    issuer: { type: String, required: true },
    issueDate: { type: Date },
    credentialUrl: String,
    image: String, // Cloudinary URL
}, { timestamps: true });

module.exports = mongoose.model('Certificate', certificateSchema);