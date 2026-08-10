const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: { type: String, required: true },
    longDescription: { type: String }, // markdown, rendered on detail page
    techStack: [{ type: String }],
    category: { type: String, enum: ['AI/ML', 'Web', 'Hardware'], default: 'Web' },
    githubUrl: String,
    liveUrl: String,
    images: [{ type: String }], // Cloudinary URLs
    featured: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('Project', projectSchema);