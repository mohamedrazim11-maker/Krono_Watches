const express = require('express');
const router = express.Router();
const { getPosters, updatePoster } = require('../controllers/posterController');

router.get('/', getPosters);
router.post('/update', updatePoster);
router.post('/', updatePoster);

module.exports = router;