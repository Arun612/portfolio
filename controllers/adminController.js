const Project = require('../models/Project');
const catchAsync = require('../middleware/catchAsync');
const slugify = require('slugify');


exports.projectsIndex = catchAsync(async (req, res) => {
    const projects = await Project.find({}).sort({ createdAt: -1 });
    res.render('pages/admin/projects/index', { title: 'Manage Projects', projects });
});

exports.projectsNew = (req, res) => {
    res.render('pages/admin/projects/new', { title: 'New Project' });
};

exports.projectsCreate = catchAsync(async (req, res) => {
    const { title, description, longDescription, techStack, category, githubUrl, liveUrl, featured } = req.body;

    const project = new Project({
        title,
        slug: slugify(title, { lower: true, strict: true }),
        description,
        longDescription,
        techStack: techStack ? techStack.split(',').map(t => t.trim()) : [],
        category,
        githubUrl,
        liveUrl,
        featured: featured === 'on',
    });

    if (req.file) {
        project.images = [req.file.secure_url];
    }

    await project.save();
    req.flash('success', 'Project created!');
    res.redirect('/admin/projects');
});

exports.projectsEdit = catchAsync(async (req, res) => {
    const project = await Project.findById(req.params.id);
    if (!project) {
        req.flash('error', 'Project not found.');
        return res.redirect('/admin/projects');
    }
    res.render('pages/admin/projects/edit', { title: 'Edit Project', project });
});

exports.projectsUpdate = catchAsync(async (req, res) => {
    const { title, description, longDescription, techStack, category, githubUrl, liveUrl, featured } = req.body;
    const project = await Project.findById(req.params.id);

    if (!project) {
        req.flash('error', 'Project not found.');
        return res.redirect('/admin/projects');
    }

    project.title = title;
    project.slug = slugify(title, { lower: true, strict: true });
    project.description = description;
    project.longDescription = longDescription;
    project.techStack = techStack ? techStack.split(',').map(t => t.trim()) : [];
    project.category = category;
    project.githubUrl = githubUrl;
    project.liveUrl = liveUrl;
    project.featured = featured === 'on';

    if (req.file) {
        project.images = [req.file.secure_url];
    }

    await project.save();
    req.flash('success', 'Project updated!');
    res.redirect('/admin/projects');
});

exports.projectsDelete = catchAsync(async (req, res) => {
    await Project.findByIdAndDelete(req.params.id);
    req.flash('success', 'Project deleted.');
    res.redirect('/admin/projects');
});