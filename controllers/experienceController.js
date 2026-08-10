const Experience = require('../models/Experience');
const catchAsync = require('../middleware/catchAsync');

exports.index = catchAsync(async (req, res) => {
    const experience = await Experience.find({}).sort({ startDate: -1 });
    res.render('pages/experience', { title: 'Experience', experience });
});