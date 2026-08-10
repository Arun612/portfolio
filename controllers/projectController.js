const Project = require('../models/Project');
const catchAsync = require('../middleware/catchAsync');

exports.index = catchAsync(async (req, res) => {
    const projects = await Project.find({}).sort({ createdAt: -1 });
    res.render('pages/projects/index', { title: 'Projects', projects });
});

exports.show = catchAsync(async (req, res) => {
    const project = await Project.findOne({ slug: req.params.slug });
    if (!project) {
        return res.status(404).render('pages/error', { title: '404', status: 404, message: 'Project not found' });
    }
    res.render('pages/projects/show', { title: project.title, project });
});