const supabase = require('../config/supabase');

// Get all products (supports filtering by category or featured)
exports.getProducts = async (req, res) => {
  try {
    const { category, featured } = req.query;
    let query = supabase.from('products').select('*').order('created_at', { ascending: false });

    if (category) {
      query = query.eq('category', category);
    }
    if (featured === 'true') {
      query = query.eq('is_featured', true);
    }

    const { data, error } = await query;
    if (error) throw error;

    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Create a new product (Admin)
exports.createProduct = async (req, res) => {
  try {
    const { name, category, price, old_price, badge, image_url, is_featured } = req.body;

    const { data, error } = await supabase
      .from('products')
      .insert([{ name, category, price, old_price, badge, image_url, is_featured }])
      .select()
      .single();

    if (error) throw error;
    res.status(201).json({ success: true, data });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Delete a product (Admin)
exports.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = await supabase.from('products').delete().eq('id', id);

    if (error) throw error;
    res.status(200).json({ success: true, message: 'Product deleted successfully' });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};