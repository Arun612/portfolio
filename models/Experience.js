const mongoose = require('mongoose');

const experienceSchema = new mongoose.Schema({
    role: { type: String, required: true },
    organization: { type: String, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date }, // null/undefined = "Present"
    description: { type: String },
    type: { type: String, enum: ['Internship', 'Project', 'Competition', 'Coursework'], default: 'Internship' },
}, { timestamps: true });

module.exports = mongoose.model('Experience', experienceSchema);