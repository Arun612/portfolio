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

// ---------- Blog ----------
router.get('/blogs', isAdmin, adminController.blogsIndex);
router.get('/blogs/new', isAdmin, adminController.blogsNew);
router.post('/blogs', isAdmin, adminController.blogsCreate);
router.get('/blogs/:id/edit', isAdmin, adminController.blogsEdit);
router.put('/blogs/:id', isAdmin, adminController.blogsUpdate);
router.delete('/blogs/:id', isAdmin, adminController.blogsDelete);

// ---------- Skills ----------
router.get('/skills', isAdmin, adminController.skillsIndex);
router.post('/skills', isAdmin, adminController.skillsCreate);
router.delete('/skills/:id', isAdmin, adminController.skillsDelete);

// ---------- Certificates ----------
router.get('/certificates', isAdmin, adminController.certificatesIndex);
router.post('/certificates', isAdmin, upload.single('image'), adminController.certificatesCreate);
router.delete('/certificates/:id', isAdmin, adminController.certificatesDelete);

// ---------- Experience ----------
router.get('/experience', isAdmin, adminController.experienceIndex);
router.post('/experience', isAdmin, adminController.experienceCreate);
router.delete('/experience/:id', isAdmin, adminController.experienceDelete);

// ---------- Gallery ----------
router.get('/gallery', isAdmin, adminController.galleryIndex);
router.post('/gallery', isAdmin, upload.single('image'), adminController.galleryCreate);
router.delete('/gallery/:id', isAdmin, adminController.galleryDelete);

// ---------- Messages ----------
router.get('/messages', isAdmin, adminController.messagesIndex);
router.put('/messages/:id/read', isAdmin, adminController.messagesMarkRead);
router.delete('/messages/:id', isAdmin, adminController.messagesDelete);

module.exports = router;