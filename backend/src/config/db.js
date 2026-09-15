const fs = require('fs');
const path = require('path');
const supabase = require('./supabase');

const DATA_DIR = path.join(__dirname, '../../data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

const INITIAL_DATA = {
  products: [
    {
      id: "prod-1",
      name: "Aurelia Master Classic",
      category: "Luxury",
      price: 1240,
      old_price: 1680,
      badge: "Best Seller",
      warranty: "5 Years Prestige International Warranty",
      promotion_period: "Valid until Sep 15, 2026",
      is_on_promotion: true,
      promo_discount_percent: 26,
      image_url: "https://images.unsplash.com/photo-1523170335258-f5ed11844a49?auto=format&fit=crop&w=900&q=80",
      description: "Handcrafted luxury timepiece with Swiss automatic movement, anti-reflective sapphire crystal glass, and top-grain Italian leather strap.",
      movement: "Swiss Automatic ETA 2824-2",
      case_material: "316L Hand-Polished Stainless Steel",
      water_resistance: "100m (10 ATM)",
      in_stock: true,
      stock_count: 14,
      is_featured: true,
      created_at: new Date(Date.now() - 3600000 * 24 * 5).toISOString()
    },
    {
      id: "prod-2",
      name: "Nova Chronograph Titanium",
      category: "Automatic",
      price: 980,
      old_price: 1250,
      badge: "New Release",
      warranty: "3 Years Worldwide Movement Warranty",
      promotion_period: "Limited Season: Ends Sep 20, 2026",
      is_on_promotion: true,
      promo_discount_percent: 21,
      image_url: "https://images.unsplash.com/photo-1542496658-e33a6d0d50f6?auto=format&fit=crop&w=900&q=80",
      description: "Precision mechanical chronograph with lightweight Grade 5 titanium case, Super-LumiNova markers, and 48-hour power reserve.",
      movement: "Mechanical Automatic Calibre 16",
      case_material: "Grade 5 Satin Titanium",
      water_resistance: "150m (15 ATM)",
      in_stock: true,
      stock_count: 8,
      is_featured: true,
      created_at: new Date(Date.now() - 3600000 * 24 * 4).toISOString()
    },
    {
      id: "prod-3",
      name: "Vanta Sport Stealth Edition",
      category: "Sport",
      price: 760,
      old_price: 990,
      badge: "Hot Deal",
      warranty: "2 Years Rugged Protection Warranty",
      promotion_period: "Flash Sale: This Week Only",
      is_on_promotion: true,
      promo_discount_percent: 23,
      image_url: "https://images.unsplash.com/photo-1434056886845-dac89ffe9b56?auto=format&fit=crop&w=900&q=80",
      description: "Aerospace-grade vulcanized silicone strap, shock-resistant DLC casing, and high-precision chronograph for athletic endurance.",
      movement: "High-Beat Quartz Chronograph",
      case_material: "Diamond-Like Carbon (DLC) Coated Steel",
      water_resistance: "200m (20 ATM)",
      in_stock: true,
      stock_count: 22,
      is_featured: true,
      created_at: new Date(Date.now() - 3600000 * 24 * 3).toISOString()
    },
    {
      id: "prod-4",
      name: "Helio Smart Sapphire AMOLED",
      category: "Smart",
      price: 520,
      old_price: 700,
      badge: "Staff Pick",
      warranty: "2 Years Hardware & Battery Warranty",
      promotion_period: "Special Promotion: Ends Sep 30, 2026",
      is_on_promotion: true,
      promo_discount_percent: 25,
      image_url: "https://images.unsplash.com/photo-1508057198894-247b23fe5ade?auto=format&fit=crop&w=900&q=80",
      description: "Next-generation AMOLED display with advanced biometric sensors, sapphire crystal touchscreen, GPS tracking, and 14-day battery life.",
      movement: "Custom KronoOS Dual-Core Processor",
      case_material: "Aerospace Matte Aluminum & Ceramic Back",
      water_resistance: "50m Swimproof",
      in_stock: true,
      stock_count: 19,
      is_featured: true,
      created_at: new Date(Date.now() - 3600000 * 24 * 2).toISOString()
    },
    {
      id: "prod-5",
      name: "Grand Horizon 18k Rose Gold",
      category: "Luxury",
      price: 2450,
      old_price: 2890,
      badge: "Exclusive",
      warranty: "Lifetime Mechanism Guarantee & Free Annual Polish",
      promotion_period: "Prestige Gala Period: Aug 25 - Sep 30, 2026",
      is_on_promotion: false,
      promo_discount_percent: 15,
      image_url: "https://images.unsplash.com/photo-1547996160-81dfa63595aa?auto=format&fit=crop&w=900&q=80",
      description: "18k rose gold bezel with diamond index markers, skeleton open-heart dial, and genuine alligator grain leather band.",
      movement: "In-House Skeleton Tourbillon Movement",
      case_material: "18k Rose Gold Plated Steel & Exhibition Back",
      water_resistance: "50m (5 ATM)",
      in_stock: true,
      stock_count: 5,
      is_featured: false,
      created_at: new Date(Date.now() - 3600000 * 24 * 1).toISOString()
    },
    {
      id: "prod-6",
      name: "Eclipse Diver 300M Ceramic",
      category: "Sport",
      price: 890,
      old_price: 1100,
      badge: "Limited Drop",
      warranty: "3 Years Deep-Sea Pressure Warranty",
      promotion_period: "Limited Batch: Ends Oct 05, 2026",
      is_on_promotion: false,
      promo_discount_percent: 19,
      image_url: "https://images.unsplash.com/photo-1547996160-81dfa63595aa?auto=format&fit=crop&w=1000&q=85",
      description: "Professional ISO-certified 300m diver timepiece featuring scratch-proof unidirectional ceramic bezel and helium escape valve.",
      movement: "Japanese Automatic 24-Jewel Movement",
      case_material: "Brushed 316L Steel & Scratchproof Ceramic",
      water_resistance: "300m (30 ATM) Diver",
      in_stock: true,
      stock_count: 11,
      is_featured: false,
      created_at: new Date().toISOString()
    }
  ],
  posters: [
    {
      section_id: "announcement_bar",
      badge: "Special Privilege",
      title: "Complimentary Worldwide Express Courier & 5-Year Warranty on all orders over $500",
      coupon_code: "KRONO2026",
      promotion_period: "August 25 - September 30, 2026",
      is_active: true,
      updated_at: new Date().toISOString()
    },
    {
      section_id: "hero_drop",
      badge: "New season collection 2026",
      title: "Timekeeping that defines your legacy.",
      subtitle: "Discover master-crafted wristwatches designed for visionaries, collectors, and connoisseurs who demand unwavering accuracy, luxury materials, and timeless design.",
      featured_product_name: "Aurelia Master Classic",
      featured_product_price: "$1,240",
      discount_text: "Save 30% Today",
      promotion_period: "Season Launch Period: Active until Sep 30, 2026",
      start_date: "2026-08-25",
      end_date: "2026-09-30",
      coupon_code: "HERO30",
      image_url: "https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?auto=format&fit=crop&w=1200&q=80",
      action_link: "#shop",
      is_active: true,
      updated_at: new Date().toISOString()
    },
    {
      section_id: "weekend_sale",
      badge: "Exclusive Flash Promotion",
      title: "Up to 50% off iconic luxury timepieces.",
      subtitle: "Acquire limited-edition collectors' pieces with verified international warranty, authenticity certificate, and complimentary wooden presentation case.",
      days: "04",
      hours: "18",
      mins: "45",
      button_text: "Explore Flash Deals",
      discount_text: "Up to 50% OFF",
      promotion_period: "Promotion Period: Aug 28 - Sep 15, 2026",
      start_date: "2026-08-28",
      end_date: "2026-09-15",
      coupon_code: "FLASH50",
      image_url: "https://images.unsplash.com/photo-1547996160-81dfa63595aa?auto=format&fit=crop&w=1200&q=80",
      action_link: "#shop",
      is_active: true,
      updated_at: new Date().toISOString()
    }
  ]
};

// Ensure data folder and file exists
function ensureFile() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify(INITIAL_DATA, null, 2), 'utf-8');
  }
}

function readLocalDb() {
  ensureFile();
  try {
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    const data = JSON.parse(raw);
    if (!data.products || data.products.length === 0) {
      data.products = INITIAL_DATA.products;
    }
    if (!data.posters || data.posters.length === 0) {
      data.posters = INITIAL_DATA.posters;
    }
    return data;
  } catch (err) {
    console.error('Error reading local db, reverting to initial:', err);
    return INITIAL_DATA;
  }
}

function writeLocalDb(data) {
  ensureFile();
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

// Database helper functions with Supabase fallback
async function getProducts({ category, featured, search } = {}) {
  if (supabase) {
    try {
      let query = supabase.from('products').select('*').order('created_at', { ascending: false });
      if (category && category !== 'All') {
        query = query.eq('category', category);
      }
      if (featured === 'true' || featured === true) {
        query = query.eq('is_featured', true);
      }
      const { data, error } = await query;
      if (!error && data && data.length > 0) return data;
    } catch (e) {
      // fallback
    }
  }

  const db = readLocalDb();
  let list = [...(db.products || [])];

  if (category && category !== 'All') {
    list = list.filter(p => p.category?.toLowerCase() === category.toLowerCase());
  }
  if (featured === 'true' || featured === true) {
    list = list.filter(p => p.is_featured === true);
  }
  if (search) {
    const s = search.toLowerCase();
    list = list.filter(p =>
      p.name?.toLowerCase().includes(s) ||
      p.description?.toLowerCase().includes(s) ||
      p.category?.toLowerCase().includes(s) ||
      p.warranty?.toLowerCase().includes(s)
    );
  }

  return list;
}

async function getCategories() {
  if (supabase) {
    try {
      const { data, error } = await supabase.from('categories').select('*').order('name');
      if (!error && data && data.length > 0) return data;
    } catch (e) {
      // fallback
    }
  }

  const db = readLocalDb();
  if (db.categories && db.categories.length > 0) return db.categories;

  const products = db.products || [];
  const uniqueCategories = [...new Set(products.map(p => p.category).filter(Boolean))];
  return uniqueCategories.map((cat, i) => ({
    id: `cat-${i + 1}`,
    name: cat,
    slug: cat.toLowerCase(),
    description: `${cat} Swiss Timepiece Collection`,
    is_active: true
  }));
}

async function getProductById(id) {

  if (supabase) {
    try {
      const { data, error } = await supabase.from('products').select('*').eq('id', id).single();
      if (!error && data) return data;
    } catch (e) {
      // fallback
    }
  }

  const db = readLocalDb();
  const product = (db.products || []).find(p => String(p.id) === String(id));
  return product || null;
}

async function createProduct(productData) {
  const price = Number(productData.price) || 0;
  const old_price = productData.old_price ? Number(productData.old_price) : null;
  const discountPercent = old_price && old_price > price ? Math.round(((old_price - price) / old_price) * 100) : null;

  const primaryImage = productData.image_url || (Array.isArray(productData.images) && productData.images[0]) || "https://images.unsplash.com/photo-1523170335258-f5ed11844a49?auto=format&fit=crop&w=900&q=80";
  const images = Array.isArray(productData.images) && productData.images.length > 0
    ? productData.images.filter(Boolean)
    : [primaryImage];

  const newProduct = {
    id: `prod-${Date.now()}`,
    name: productData.name || "Untitled Masterpiece",
    brand: productData.brand || "Krono Swiss",
    category: productData.category || "Luxury",
    gender: productData.gender || "Unisex",
    case_size: productData.case_size || "40mm",
    price,
    old_price,
    badge: productData.badge || "New Release",
    warranty: productData.warranty || "5 Years International Warranty",
    promotion_period: productData.promotion_period || "Standard Warranty Included",
    is_on_promotion: Boolean(productData.is_on_promotion || (old_price && old_price > price)),
    promo_discount_percent: discountPercent || productData.promo_discount_percent || null,
    image_url: primaryImage,
    images: images,
    description: productData.description || "Precision engineered timepiece with premium materials and Swiss craftsmanship.",
    movement: productData.movement || "Swiss Automatic Movement",
    case_material: productData.case_material || "316L Stainless Steel",
    water_resistance: productData.water_resistance || "100m (10 ATM)",
    in_stock: productData.in_stock !== undefined ? Boolean(productData.in_stock) : true,
    stock_count: Number(productData.stock_count) || 12,
    is_featured: Boolean(productData.is_featured),
    created_at: new Date().toISOString()
  };



  if (supabase) {
    try {
      const { data, error } = await supabase.from('products').insert([newProduct]).select().single();
      if (!error && data) return data;
    } catch (e) {
      // fallback
    }
  }

  const db = readLocalDb();
  db.products = [newProduct, ...(db.products || [])];
  writeLocalDb(db);
  return newProduct;
}

async function updateProduct(id, updates) {
  if (supabase) {
    try {
      const { data, error } = await supabase.from('products').update(updates).eq('id', id).select().single();
      if (!error && data) return data;
    } catch (e) {
      // fallback
    }
  }

  const db = readLocalDb();
  const index = (db.products || []).findIndex(p => String(p.id) === String(id));
  if (index === -1) {
    throw new Error('Product not found');
  }

  const current = db.products[index];
  const price = updates.price !== undefined ? Number(updates.price) : current.price;
  const old_price = updates.old_price !== undefined ? (updates.old_price ? Number(updates.old_price) : null) : current.old_price;
  const discountPercent = old_price && old_price > price ? Math.round(((old_price - price) / old_price) * 100) : current.promo_discount_percent;

  const primaryImage = updates.image_url || (Array.isArray(updates.images) && updates.images[0]) || current.image_url;
  const images = Array.isArray(updates.images) && updates.images.length > 0 ? updates.images.filter(Boolean) : (current.images || [primaryImage]);

  db.products[index] = {
    ...current,
    ...updates,
    price,
    old_price,
    image_url: primaryImage,
    images,
    promo_discount_percent: discountPercent,
    updated_at: new Date().toISOString()
  };


  writeLocalDb(db);
  return db.products[index];
}

async function deleteProduct(id) {
  if (supabase) {
    try {
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (!error) return true;
    } catch (e) {
      // fallback
    }
  }

  const db = readLocalDb();
  db.products = (db.products || []).filter(p => String(p.id) !== String(id));
  writeLocalDb(db);
  return true;
}

async function getPosters() {
  if (supabase) {
    try {
      const { data, error } = await supabase.from('posters').select('*').eq('is_active', true);
      if (!error && data && data.length > 0) return data;
    } catch (e) {
      // fallback
    }
  }

  const db = readLocalDb();
  return db.posters || [];
}

async function updatePoster(posterData) {
  const { section_id } = posterData;
  if (!section_id) throw new Error('section_id is required');

  const updatedPoster = {
    ...posterData,
    updated_at: new Date().toISOString()
  };

  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('posters')
        .upsert(updatedPoster, { onConflict: 'section_id' })
        .select()
        .single();
      if (!error && data) return data;
    } catch (e) {
      // fallback
    }
  }

  const db = readLocalDb();
  db.posters = db.posters || [];
  const index = db.posters.findIndex(p => p.section_id === section_id);
  if (index >= 0) {
    db.posters[index] = { ...db.posters[index], ...updatedPoster };
  } else {
    db.posters.push(updatedPoster);
  }
  writeLocalDb(db);
  return updatedPoster;
}

async function createOrder(orderData) {
  const newOrder = {
    id: `KR-${Math.floor(100000 + Math.random() * 900000)}`,
    customer_name: orderData.customer_name || orderData.fullName || 'Guest Client',
    customer_email: orderData.customer_email || orderData.email || 'client@krono.luxury',
    customer_phone: orderData.customer_phone || orderData.phone || '',
    delivery_address: orderData.delivery_address || orderData.address || '',
    city: orderData.city || 'Geneva',
    postal_code: orderData.postal_code || orderData.postalCode || '1200',
    country: orderData.country || 'Switzerland',
    payment_method: orderData.payment_method || orderData.paymentMethod || 'card',
    subtotal: Number(orderData.subtotal) || 0,
    discount_amount: Number(orderData.discount_amount) || 0,
    total_amount: Number(orderData.total_amount || orderData.total) || 0,
    coupon_code: orderData.coupon_code || null,
    items: orderData.items || [],
    status: 'processing',
    created_at: new Date().toISOString()
  };

  if (supabase) {
    try {
      const { data, error } = await supabase.from('orders').insert([newOrder]).select().single();
      if (!error && data) return data;
    } catch (e) {
      // fallback
    }
  }

  const db = readLocalDb();
  db.orders = [newOrder, ...(db.orders || [])];
  writeLocalDb(db);
  return newOrder;
}

async function getOrders() {
  if (supabase) {
    try {
      const { data, error } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
      if (!error && data && data.length > 0) return data;
    } catch (e) {
      // fallback
    }
  }

  const db = readLocalDb();
  return db.orders || [];
}

async function getStats() {
  const db = readLocalDb();
  const products = db.products || [];
  const totalProducts = products.length;
  const activePosters = (db.posters || []).filter(p => p.is_active !== false).length;
  const totalInventoryValue = products.reduce((acc, p) => acc + (Number(p.price) || 0), 0);
  const categories = [...new Set(products.map(p => p.category))];
  const promoCount = products.filter(p => p.is_on_promotion || (p.old_price && p.old_price > p.price)).length;
  const totalStockUnits = products.reduce((acc, p) => acc + (Number(p.stock_count) || 1), 0);

  return {
    totalProducts,
    activePosters,
    totalInventoryValue,
    categoryCount: categories.length,
    categories,
    featuredCount: products.filter(p => p.is_featured).length,
    promoCount,
    totalStockUnits
  };
}

// ─── User CRUD ────────────────────────────────────────────────────────────────
async function getUserByEmail(email) {
  if (supabase) {
    try {
      const { data, error } = await supabase.from('users').select('*').eq('email', email).single();
      if (!error && data) return data;
    } catch (e) {}
  }
  const db = readLocalDb();
  return (db.users || []).find(u => u.email === email) || null;
}

async function getUserById(id) {
  if (supabase) {
    try {
      const { data, error } = await supabase.from('users').select('*').eq('id', id).single();
      if (!error && data) return data;
    } catch (e) {}
  }
  const db = readLocalDb();
  return (db.users || []).find(u => u.id === id) || null;
}

async function createUser({ name, email, hashedPw }) {
  const newUser = {
    id: `user-${Date.now()}`,
    name,
    email,
    password_hash: hashedPw,
    phone: null,
    address: null,
    status: 'Active Member',
    created_at: new Date().toISOString(),
  };

  if (supabase) {
    try {
      const { data, error } = await supabase.from('users').insert([{
        id: newUser.id, name, email, password_hash: hashedPw,
        status: 'Active Member', created_at: newUser.created_at
      }]).select().single();
      if (!error && data) return data;
    } catch (e) {}
  }

  const db = readLocalDb();
  db.users = db.users || [];
  db.users.push(newUser);
  writeLocalDb(db);
  return newUser;
}

async function updateUser(id, fields) {
  if (supabase) {
    try {
      const { data, error } = await supabase.from('users').update(fields).eq('id', id).select().single();
      if (!error && data) return data;
    } catch (e) {}
  }

  const db = readLocalDb();
  db.users = db.users || [];
  const idx = db.users.findIndex(u => u.id === id);
  if (idx === -1) throw new Error('User not found');
  db.users[idx] = { ...db.users[idx], ...fields };
  writeLocalDb(db);
  return db.users[idx];
}

module.exports = {
  getProducts,
  getProductById,
  getCategories,
  createProduct,
  updateProduct,
  deleteProduct,
  getPosters,
  updatePoster,
  createOrder,
  getOrders,
  getStats,
  getUserByEmail,
  getUserById,
  createUser,
  updateUser,
};



