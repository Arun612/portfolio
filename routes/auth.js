const express = require('express');
const router = express.Router();
const passport = require('passport');

// Show login form
router.get('/login', (req, res) => {
    res.render('pages/admin/login', { title: 'Admin Login' });
});

// Handle login
router.post('/login', passport.authenticate('local', {
    usernameField: 'email',
    failureRedirect: '/login',
    failureFlash: true,
}), (req, res) => {
    req.flash('success', 'Welcome back!');
    const redirectUrl = req.session.returnTo || '/admin/dashboard';
    delete req.session.returnTo;
    res.redirect(redirectUrl);
});

// Logout
router.post('/logout', (req, res, next) => {
    req.logout((err) => {
        if (err) return next(err);
        req.flash('success', 'Logged out successfully.');
        res.redirect('/');
    });
});

module.exports = router;