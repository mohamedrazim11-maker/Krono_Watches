const db = require('../config/db');

// Create new customer order (persisted to Supabase 'orders' table)
exports.createOrder = async (req, res) => {
  try {
    const orderData = req.body;
    if (!orderData || !orderData.items || orderData.items.length === 0) {
      return res.status(400).json({ success: false, message: 'Cart items are required to place an order.' });
    }

    const order = await db.createOrder(orderData);
    res.status(201).json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get orders list (Admin)
exports.getOrders = async (req, res) => {
  try {
    const orders = await db.getOrders();
    res.status(200).json({ success: true, count: orders.length, data: orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
