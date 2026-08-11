const express = require('express');
const router = express.Router();
const contactController = require('../controllers/contactController');
const contactLimiter = require('../middleware/contactLimiter');

router.get('/', contactController.index);
router.post('/', contactLimiter, contactController.create);

module.exports = router;