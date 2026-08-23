const supabase = require('../config/supabase');

// Get all active posters/banners for the frontend
exports.getPosters = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('posters')
      .select('*')
      .eq('is_active', true);

    if (error) throw error;
    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Upsert / update a poster section (Admin)
exports.updatePoster = async (req, res) => {
  try {
    const { section_id, title, subtitle, accent_text, image_url, action_link, is_active } = req.body;

    const { data, error } = await supabase
      .from('posters')
      .upsert(
        { section_id, title, subtitle, accent_text, image_url, action_link, is_active, updated_at: new Date() },
        { onConflict: 'section_id' }
      )
      .select()
      .single();

    if (error) throw error;
    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};