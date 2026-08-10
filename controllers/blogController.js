const Blog = require('../models/Blog');
const catchAsync = require('../middleware/catchAsync');

exports.index = catchAsync(async (req, res) => {
    const blogs = await Blog.find({ published: true }).sort({ createdAt: -1 });
    res.render('pages/blogs/index', { title: 'Blog', blogs });
});

exports.show = catchAsync(async (req, res) => {
    const blog = await Blog.findOne({ slug: req.params.slug, published: true });
    if (!blog) {
        return res.status(404).render('pages/error', { title: '404', status: 404, message: 'Post not found' });
    }
    res.render('pages/blogs/show', { title: blog.title, blog });
});