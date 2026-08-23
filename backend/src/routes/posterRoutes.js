const express = require('express');
const router = express.Router();
const { getPosters, updatePoster } = require('../controllers/posterController');

router.get('/', getPosters);
router.post('/update', updatePoster);

module.exports = router;