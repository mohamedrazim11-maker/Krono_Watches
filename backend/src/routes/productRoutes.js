const express = require('express');
const router = express.Router();
const { getProducts, getCategories, getProductById, createProduct, updateProduct, deleteProduct, getStats } = require('../controllers/productController');

router.get('/stats', getStats);
router.get('/categories', getCategories);
router.get('/', getProducts);
router.get('/:id', getProductById);
router.post('/', createProduct);
router.put('/:id', updateProduct);
router.delete('/:id', deleteProduct);

module.exports = router;