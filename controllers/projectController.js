exports.index = (req, res) => {
    res.render('pages/projects/index', { title: 'Projects' });
};

exports.show = (req, res) => {
    res.render('pages/projects/show', { title: 'Project' });
};