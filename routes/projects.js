const express = require('express');
const router = express.Router();
const projectController = require('../controllers/projectController');

router.get('/', projectController.index);
router.get('/:slug', projectController.show);

module.exports = router;