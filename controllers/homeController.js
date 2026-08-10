exports.home = (req, res) => {
    res.render('pages/home', { title: 'Home' });
};

exports.about = (req, res) => {
    res.render('pages/about', { title: 'About' });
};