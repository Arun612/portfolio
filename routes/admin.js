const express = require('express');
const router = express.Router();
const isAdmin = require('../middleware/isAdmin');

router.get('/', isAdmin, (req, res) => {
    res.redirect('/admin/dashboard');
});

router.get('/dashboard', isAdmin, (req, res) => {
    res.render('pages/admin/dashboard', { title: 'Dashboard' });
});

module.exports = router;