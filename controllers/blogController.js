exports.index = (req, res) => {
    res.render('pages/blogs/index', { title: 'Blog' });
};

exports.show = (req, res) => {
    res.render('pages/blogs/show', { title: 'Post' });
};