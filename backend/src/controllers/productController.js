const db = require('../config/db');

// Get all products (supports filtering by category, featured, search)
exports.getProducts = async (req, res) => {
  try {
    const { category, featured, search } = req.query;
    const products = await db.getProducts({ category, featured, search });
    res.status(200).json({ success: true, count: products.length, data: products });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Create a new product (Admin)
exports.createProduct = async (req, res) => {
  try {
    const { name, category, price, old_price, badge, image_url, description, is_featured } = req.body;
    if (!name || price === undefined) {
      return res.status(400).json({ success: false, message: 'Name and price are required.' });
    }

    const data = await db.createProduct({
      name,
      category,
      price,
      old_price,
      badge,
      image_url,
      description,
      is_featured
    });

    res.status(201).json({ success: true, data });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Update an existing product (Admin)
exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const data = await db.updateProduct(id, req.body);
    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Delete a product (Admin)
exports.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    await db.deleteProduct(id);
    res.status(200).json({ success: true, message: 'Product deleted successfully', id });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Get stats overview (Admin)
exports.getStats = async (req, res) => {
  try {
    const stats = await db.getStats();
    res.status(200).json({ success: true, data: stats });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};