module.exports = (req, res, next) => {
    if (!req.isAuthenticated()) {
        req.flash('error', 'Admin access required.');
        return res.redirect('/login');
    }
    next();
};