const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema({
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    content: { type: String, required: true }, // markdown
    tags: [{ type: String }],
    published: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('Blog', blogSchema);