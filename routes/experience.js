const express = require('express');
const router = express.Router();
const experienceController = require('../controllers/experienceController');

router.get('/', experienceController.index);

module.exports = router;