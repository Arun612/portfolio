const Project = require('../models/Project');
const Skill = require('../models/Skill');
const Certificate = require('../models/Certificate');
const catchAsync = require('../middleware/catchAsync');

exports.home = catchAsync(async (req, res) => {
    const featuredProjects = await Project.find({ featured: true }).limit(3);
    res.render('pages/home', { title: 'Home', featuredProjects });
});

exports.about = catchAsync(async (req, res) => {
    const skills = await Skill.find({}).sort({ category: 1 });
    const certificates = await Certificate.find({}).sort({ issueDate: -1 });
    res.render('pages/about', { title: 'About', skills, certificates });
});