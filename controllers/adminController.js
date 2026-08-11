const Project = require('../models/Project');
const catchAsync = require('../middleware/catchAsync');
const slugify = require('slugify');
const Blog = require('../models/Blog');
const Skill = require('../models/Skill');
const Certificate = require('../models/Certificate');
const Experience = require('../models/Experience');
const Gallery = require('../models/Gallery');
const Message = require('../models/Message');


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

// ---------- Blog ----------

exports.blogsIndex = catchAsync(async (req, res) => {
    const blogs = await Blog.find({}).sort({ createdAt: -1 });
    res.render('pages/admin/blogs/index', { title: 'Manage Blog', blogs });
});

exports.blogsNew = (req, res) => {
    res.render('pages/admin/blogs/new', { title: 'New Post' });
};

exports.blogsCreate = catchAsync(async (req, res) => {
    const { title, content, tags, published } = req.body;
    await Blog.create({
        title,
        slug: slugify(title, { lower: true, strict: true }),
        content,
        tags: tags ? tags.split(',').map(t => t.trim()) : [],
        published: published === 'on',
    });
    req.flash('success', 'Post created!');
    res.redirect('/admin/blogs');
});

exports.blogsEdit = catchAsync(async (req, res) => {
    const blog = await Blog.findById(req.params.id);
    if (!blog) {
        req.flash('error', 'Post not found.');
        return res.redirect('/admin/blogs');
    }
    res.render('pages/admin/blogs/edit', { title: 'Edit Post', blog });
});

exports.blogsUpdate = catchAsync(async (req, res) => {
    const { title, content, tags, published } = req.body;
    const blog = await Blog.findById(req.params.id);
    if (!blog) {
        req.flash('error', 'Post not found.');
        return res.redirect('/admin/blogs');
    }
    blog.title = title;
    blog.slug = slugify(title, { lower: true, strict: true });
    blog.content = content;
    blog.tags = tags ? tags.split(',').map(t => t.trim()) : [];
    blog.published = published === 'on';
    await blog.save();
    req.flash('success', 'Post updated!');
    res.redirect('/admin/blogs');
});

exports.blogsDelete = catchAsync(async (req, res) => {
    await Blog.findByIdAndDelete(req.params.id);
    req.flash('success', 'Post deleted.');
    res.redirect('/admin/blogs');
});

// ---------- Skills ----------

exports.skillsIndex = catchAsync(async (req, res) => {
    const skills = await Skill.find({}).sort({ category: 1 });
    res.render('pages/admin/skills/index', { title: 'Manage Skills', skills });
});

exports.skillsCreate = catchAsync(async (req, res) => {
    const { name, category, proficiency } = req.body;
    await Skill.create({ name, category, proficiency });
    req.flash('success', 'Skill added!');
    res.redirect('/admin/skills');
});

exports.skillsDelete = catchAsync(async (req, res) => {
    await Skill.findByIdAndDelete(req.params.id);
    req.flash('success', 'Skill removed.');
    res.redirect('/admin/skills');
});

// ---------- Certificates ----------

exports.certificatesIndex = catchAsync(async (req, res) => {
    const certificates = await Certificate.find({}).sort({ issueDate: -1 });
    res.render('pages/admin/certificates/index', { title: 'Manage Certificates', certificates });
});

exports.certificatesCreate = catchAsync(async (req, res) => {
    const { title, issuer, issueDate, credentialUrl } = req.body;
    const certificate = new Certificate({ title, issuer, issueDate, credentialUrl });
    if (req.file) certificate.image = req.file.secure_url;
    await certificate.save();
    req.flash('success', 'Certificate added!');
    res.redirect('/admin/certificates');
});

exports.certificatesDelete = catchAsync(async (req, res) => {
    await Certificate.findByIdAndDelete(req.params.id);
    req.flash('success', 'Certificate removed.');
    res.redirect('/admin/certificates');
});

// ---------- Experience ----------

exports.experienceIndex = catchAsync(async (req, res) => {
    const experience = await Experience.find({}).sort({ startDate: -1 });
    res.render('pages/admin/experience/index', { title: 'Manage Experience', experience });
});

exports.experienceCreate = catchAsync(async (req, res) => {
    const { role, organization, startDate, endDate, description, type } = req.body;
    await Experience.create({
        role, organization, startDate,
        endDate: endDate || undefined,
        description, type,
    });
    req.flash('success', 'Experience added!');
    res.redirect('/admin/experience');
});

exports.experienceDelete = catchAsync(async (req, res) => {
    await Experience.findByIdAndDelete(req.params.id);
    req.flash('success', 'Experience removed.');
    res.redirect('/admin/experience');
});

// ---------- Gallery ----------

exports.galleryIndex = catchAsync(async (req, res) => {
    const images = await Gallery.find({}).sort({ createdAt: -1 });
    res.render('pages/admin/gallery/index', { title: 'Manage Gallery', images });
});

exports.galleryCreate = catchAsync(async (req, res) => {
    if (!req.file) {
        req.flash('error', 'Please select an image.');
        return res.redirect('/admin/gallery');
    }
    await Gallery.create({ imageUrl: req.file.secure_url, caption: req.body.caption });
    req.flash('success', 'Image added!');
    res.redirect('/admin/gallery');
});

exports.galleryDelete = catchAsync(async (req, res) => {
    await Gallery.findByIdAndDelete(req.params.id);
    req.flash('success', 'Image removed.');
    res.redirect('/admin/gallery');
});


// ---------- Messages ----------

exports.messagesIndex = catchAsync(async (req, res) => {
    const messages = await Message.find({}).sort({ createdAt: -1 });
    res.render('pages/admin/messages/index', { title: 'Messages', messages });
});

exports.messagesMarkRead = catchAsync(async (req, res) => {
    await Message.findByIdAndUpdate(req.params.id, { read: true });
    res.redirect('/admin/messages');
});

exports.messagesDelete = catchAsync(async (req, res) => {
    await Message.findByIdAndDelete(req.params.id);
    req.flash('success', 'Message deleted.');
    res.redirect('/admin/messages');
});