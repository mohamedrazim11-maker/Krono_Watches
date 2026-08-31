const db = require('../config/db');

// Get all active posters/promotional banners
exports.getPosters = async (req, res) => {
  try {
    const data = await db.getPosters();
    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Upsert / update a poster section (Admin)
exports.updatePoster = async (req, res) => {
  try {
    const { section_id, title, subtitle, badge, discount_text, image_url, action_link, button_text, days, hours, mins, is_active } = req.body;
    
    if (!section_id) {
      return res.status(400).json({ success: false, message: 'section_id is required' });
    }

    const data = await db.updatePoster({
      section_id,
      title,
      subtitle,
      badge,
      discount_text,
      image_url,
      action_link,
      button_text,
      days,
      hours,
      mins,
      is_active: is_active !== undefined ? is_active : true
    });

    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};