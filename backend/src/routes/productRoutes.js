const express = require('express');
const router = express.Router();
const { getProducts, createProduct, updateProduct, deleteProduct, getStats } = require('../controllers/productController');

router.get('/stats', getStats);
router.get('/', getProducts);
router.post('/', createProduct);
router.put('/:id', updateProduct);
router.delete('/:id', deleteProduct);

module.exports = router;