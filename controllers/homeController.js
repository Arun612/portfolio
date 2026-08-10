const Project = require('../models/Project');
const catchAsync = require('../middleware/catchAsync');

exports.home = catchAsync(async (req, res) => {
    const featuredProjects = await Project.find({ featured: true }).limit(3);
    res.render('pages/home', { title: 'Home', featuredProjects });
});

exports.about = (req, res) => {
    res.render('pages/about', { title: 'About' }); // sync, no wrap needed
};