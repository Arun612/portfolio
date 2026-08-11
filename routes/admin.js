const express = require('express');
const router = express.Router();
const isAdmin = require('../middleware/isAdmin');
const upload = require('../middleware/upload');
const adminController = require('../controllers/adminController');

router.get('/', isAdmin, (req, res) => {
    res.redirect('/admin/dashboard');
});

router.get('/dashboard', isAdmin, (req, res) => {
    res.render('pages/admin/dashboard', { title: 'Dashboard' });
});

// ---------- Projects ----------
router.get('/projects', isAdmin, adminController.projectsIndex);
router.get('/projects/new', isAdmin, adminController.projectsNew);
router.post('/projects', isAdmin, upload.single('image'), adminController.projectsCreate);
router.get('/projects/:id/edit', isAdmin, adminController.projectsEdit);
router.put('/projects/:id', isAdmin, upload.single('image'), adminController.projectsUpdate);
router.delete('/projects/:id', isAdmin, adminController.projectsDelete);

module.exports = router;