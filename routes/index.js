const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    res.send('Server is working!'); // temporary, replace in Phase 2
});

module.exports = router;