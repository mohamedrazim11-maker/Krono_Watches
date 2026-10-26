import fs from 'fs';
import path from 'path';
import { supabase } from './supabase';

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

function ensureFile() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify({ products: [], posters: [], users: [], orders: [] }, null, 2), 'utf-8');
  }
}

export function readLocalDb(): any {
  ensureFile();
  try {
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    const data = JSON.parse(raw);
    let mutated = false;

    if (!data.products) {
      data.products = [];
      mutated = true;
    }
    if (!data.users) {
      data.users = [];
      mutated = true;
    }
    if (!data.orders) {
      data.orders = [];
      mutated = true;
    }
    if (!data.order_items) {
      data.order_items = [];
      mutated = true;
    }

    // Ensure at least one system administrator exists
    const adminEmail = (process.env.ADMIN_EMAIL || 'admin@krono.luxury').toLowerCase();
    const hasAdmin = data.users.some((u: any) => u.email?.toLowerCase() === adminEmail || u.role === 'admin' || u.username === 'admin');
    if (!hasAdmin) {
      data.users.unshift({
        id: 'usr-admin-01',
        user_id: 'usr-admin-01',
        name: 'Administrator',
        full_name: 'Administrator',
        username: 'admin',
        email: adminEmail,
        password_hash: '$2b$10$fpvtcCOaApIIBbj98vzDDOwCRpnj2n7FUhYlzUi77plgpVo2unDaG', // Admin@1234
        role: 'admin',
        phone: '',
        address: '',
        status: 'Active',
        created_at: new Date().toISOString(),
      });
      mutated = true;
    } else {
      for (const u of data.users) {
        if (u.role === 'admin' && !u.username) {
          u.username = 'admin';
          mutated = true;
        }
      }
    }

    // Ensure existing products have stock_qty and is_active (Milestone 1 - Slide 5)
    for (const p of data.products) {
      if (p.stock_qty === undefined) {
        p.stock_qty = p.stock_count ?? 12;
        mutated = true;
      }
      if (p.is_active === undefined) {
        p.is_active = true;
        mutated = true;
      }
    }

    // Ensure order_items are synced from existing orders
    if (data.order_items.length === 0 && data.orders.length > 0) {
      for (const order of data.orders) {
        if (Array.isArray(order.items)) {
          order.items.forEach((item: any, idx: number) => {
            data.order_items.push({
              id: `item-${order.id}-${idx}`,
              order_item_id: `item-${order.id}-${idx}`,
              order_id: order.id,
              product_id: item.product_id || item.id,
              product_name: item.product_name || item.name || 'Timepiece',
              quantity: item.quantity || 1,
              unit_price: item.unit_price || item.price || 0,
              subtotal: (item.unit_price || item.price || 0) * (item.quantity || 1),
              created_at: order.created_at || new Date().toISOString(),
            });
          });
        }
      }
      mutated = true;
    }

    if (mutated) {
      fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
    }

    return data;
  } catch (err) {
    console.error('Error reading local db:', err);
    return { products: [], posters: [], users: [], orders: [], order_items: [] };
  }
}

export function writeLocalDb(data: any) {
  ensureFile();
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

let isSupabaseHealthy = true;

async function trySupabase<T>(queryFn: () => Promise<T>): Promise<T | null> {
  if (!supabase || !isSupabaseHealthy) return null;
  try {
    const timeout = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Supabase timeout')), 400)
    );
    const result = await Promise.race([queryFn(), timeout]);
    return result;
  } catch (err: any) {
    if (
      err.message &&
      (err.message.includes('ENOTFOUND') ||
        err.message.includes('fetch failed') ||
        err.message.includes('timeout'))
    ) {
      isSupabaseHealthy = false;
    }
    return null;
  }
}

// ─── Products ─────────────────────────────────────────────────────────────────
export async function getProducts({
  category,
  featured,
  search,
}: { category?: string; featured?: string | boolean; search?: string } = {}) {
  const supabaseData = await trySupabase(async () => {
    let query = supabase!.from('products').select('*').order('created_at', { ascending: false });
    if (category && category !== 'All') {
      query = query.eq('category', category);
    }
    if (featured === 'true' || featured === true) {
      query = query.eq('is_featured', true);
    }
    const { data, error } = await query;
    if (!error && data && data.length > 0) return data;
    return null;
  });

  if (supabaseData) return supabaseData;

  const db = readLocalDb();
  let list = [...(db.products || [])];

  if (category && category !== 'All') {
    list = list.filter((p: any) => p.category?.toLowerCase() === category.toLowerCase());
  }
  if (featured === 'true' || featured === true) {
    list = list.filter((p: any) => p.is_featured === true);
  }
  if (search) {
    const s = search.toLowerCase();
    list = list.filter(
      (p: any) =>
        p.name?.toLowerCase().includes(s) ||
        p.description?.toLowerCase().includes(s) ||
        p.category?.toLowerCase().includes(s) ||
        p.warranty?.toLowerCase().includes(s) ||
        p.brand?.toLowerCase().includes(s)
    );
  }

  return list;
}

export async function getCategories() {
  const supabaseData = await trySupabase(async () => {
    const { data, error } = await supabase!.from('categories').select('*').order('name');
    if (!error && data && data.length > 0) return data;
    return null;
  });

  if (supabaseData) return supabaseData;

  const db = readLocalDb();
  if (db.categories && db.categories.length > 0) return db.categories;

  const products = db.products || [];
  const uniqueCategories = [...new Set(products.map((p: any) => p.category).filter(Boolean))];
  return uniqueCategories.map((cat: any, i) => ({
    id: `cat-${i + 1}`,
    name: cat,
    slug: cat.toLowerCase(),
    description: `${cat} Swiss Timepiece Collection`,
    is_active: true,
  }));
}

export async function getProductById(id: string) {
  const supabaseData = await trySupabase(async () => {
    const { data, error } = await supabase!.from('products').select('*').eq('id', id).single();
    if (!error && data) return data;
    return null;
  });

  if (supabaseData) return supabaseData;

  const db = readLocalDb();
  const product = (db.products || []).find((p: any) => String(p.id) === String(id));
  return product || null;
}

export async function createProduct(productData: any) {
  const price = Number(productData.price) || 0;
  const old_price = productData.old_price ? Number(productData.old_price) : null;
  const discountPercent =
    old_price && old_price > price
      ? Math.round(((old_price - price) / old_price) * 100)
      : null;

  const primaryImage =
    productData.image_url ||
    (Array.isArray(productData.images) && productData.images[0]) ||
    '/images/watches/seastar_1000_powermatic.jpg';
  const images =
    Array.isArray(productData.images) && productData.images.length > 0
      ? productData.images.filter(Boolean)
      : [primaryImage];

  const newProduct = {
    id: `prod-${Date.now()}`,
    name: productData.name || 'Untitled Masterpiece',
    brand: productData.brand || 'Krono Swiss',
    category: productData.category || 'Luxury',
    gender: productData.gender || 'Unisex',
    case_size: productData.case_size || '40mm',
    price,
    old_price,
    badge: productData.badge || 'New Release',
    warranty: productData.warranty || '5 Years International Warranty',
    promotion_period: productData.promotion_period || 'Standard Warranty Included',
    is_on_promotion: Boolean(productData.is_on_promotion || (old_price && old_price > price)),
    promo_discount_percent: discountPercent || productData.promo_discount_percent || null,
    image_url: primaryImage,
    images: images,
    description:
      productData.description ||
      'Precision engineered timepiece with premium materials and Swiss craftsmanship.',
    movement: productData.movement || 'Swiss Automatic Movement',
    case_material: productData.case_material || '316L Stainless Steel',
    water_resistance: productData.water_resistance || '100m (10 ATM)',
    in_stock: productData.in_stock !== undefined ? Boolean(productData.in_stock) : true,
    stock_count: Number(productData.stock_count) || 12,
    is_featured: Boolean(productData.is_featured),
    created_at: new Date().toISOString(),
  };

  if (supabase) {
    try {
      const { data, error } = await supabase.from('products').insert([newProduct]).select().single();
      if (!error && data) return data;
    } catch {}
  }

  const db = readLocalDb();
  db.products = [newProduct, ...(db.products || [])];
  writeLocalDb(db);
  return newProduct;
}

export async function updateProduct(id: string, updates: any) {
  if (supabase) {
    try {
      const { data, error } = await supabase.from('products').update(updates).eq('id', id).select().single();
      if (!error && data) return data;
    } catch {}
  }

  const db = readLocalDb();
  const index = (db.products || []).findIndex((p: any) => String(p.id) === String(id));
  if (index === -1) {
    throw new Error('Product not found');
  }

  const current = db.products[index];
  const price = updates.price !== undefined ? Number(updates.price) : current.price;
  const old_price =
    updates.old_price !== undefined
      ? updates.old_price
        ? Number(updates.old_price)
        : null
      : current.old_price;
  const discountPercent =
    old_price && old_price > price
      ? Math.round(((old_price - price) / old_price) * 100)
      : current.promo_discount_percent;

  const primaryImage =
    updates.image_url || (Array.isArray(updates.images) && updates.images[0]) || current.image_url;
  const images =
    Array.isArray(updates.images) && updates.images.length > 0
      ? updates.images.filter(Boolean)
      : current.images || [primaryImage];

  db.products[index] = {
    ...current,
    ...updates,
    price,
    old_price,
    image_url: primaryImage,
    images,
    promo_discount_percent: discountPercent,
    updated_at: new Date().toISOString(),
  };

  writeLocalDb(db);
  return db.products[index];
}

export async function deleteProduct(id: string, forceHardDelete = false) {
  const db = readLocalDb();
  if (!db.products) db.products = [];

  // Check if orders or order_items reference this product (Milestone 1 & Slide 10)
  const isReferencedInOrders =
    (db.order_items || []).some((item: any) => String(item.product_id) === String(id)) ||
    (db.orders || []).some((o: any) =>
      Array.isArray(o.items) && o.items.some((it: any) => String(it.product_id || it.id) === String(id))
    );

  if (isReferencedInOrders && !forceHardDelete) {
    // Perform Safe Deactivation (Soft-Delete)
    const pIdx = db.products.findIndex((p: any) => String(p.id) === String(id));
    if (pIdx !== -1) {
      db.products[pIdx].is_active = false;
      db.products[pIdx].in_stock = false;
      db.products[pIdx].updated_at = new Date().toISOString();
      writeLocalDb(db);

      if (supabase) {
        try {
          await supabase
            .from('products')
            .update({ is_active: false, in_stock: false })
            .eq('id', id);
        } catch {}
      }
      return { success: true, softDeleted: true, id, message: 'Timepiece deactivated safely (archived) to preserve order history.' };
    }
    return { success: true, softDeleted: true, id };
  }

  // If not referenced in any order, remove from products
  if (supabase) {
    try {
      await supabase.from('products').delete().eq('id', id);
    } catch {}
  }

  db.products = db.products.filter((p: any) => String(p.id) !== String(id));
  writeLocalDb(db);
  return { success: true, hardDeleted: true, id };
}

// ─── Posters ──────────────────────────────────────────────────────────────────
export async function getPosters() {
  const supabaseData = await trySupabase(async () => {
    const { data, error } = await supabase!.from('posters').select('*').eq('is_active', true);
    if (!error && data && data.length > 0) return data;
    return null;
  });

  if (supabaseData) return supabaseData;

  const db = readLocalDb();
  return db.posters || [];
}

export async function updatePoster(posterData: any) {
  const { section_id } = posterData;
  if (!section_id) throw new Error('section_id is required');

  const updatedPoster = {
    ...posterData,
    updated_at: new Date().toISOString(),
  };

  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('posters')
        .upsert(updatedPoster, { onConflict: 'section_id' })
        .select()
        .single();
      if (!error && data) return data;
    } catch {}
  }

  const db = readLocalDb();
  db.posters = db.posters || [];
  const index = db.posters.findIndex((p: any) => p.section_id === section_id);
  if (index >= 0) {
    db.posters[index] = { ...db.posters[index], ...updatedPoster };
  } else {
    db.posters.push(updatedPoster);
  }
  writeLocalDb(db);
  return updatedPoster;
}

// ─── Orders & Order Items (Milestone 1 & 3) ──────────────────────────────────
export async function createOrder(orderData: any) {
  const db = readLocalDb();
  if (!db.orders) db.orders = [];
  if (!db.order_items) db.order_items = [];
  if (!db.products) db.products = [];

  const rawItems = Array.isArray(orderData.items) ? orderData.items : [];
  if (rawItems.length === 0) {
    throw new Error('Cart items are required to place an order.');
  }

  // 1. Validate cart against database & recalculate order totals on the server
  // (Slide 7: "Important: do not trust totals sent by the browser. Recalculate order totals on the server using product data from the database.")
  const verifiedOrderItems: any[] = [];
  let calculatedSubtotal = 0;

  for (const item of rawItems) {
    const productId = item.product_id || item.id;
    const dbProduct = db.products.find((p: any) => String(p.id) === String(productId));

    if (!dbProduct) {
      throw new Error(`Timepiece with ID "${productId}" was not found in the boutique catalog.`);
    }

    const availableStock = Number(dbProduct.stock_qty ?? dbProduct.stock_count ?? 12);
    const requestedQty = Math.max(1, Number(item.quantity) || 1);

    if (availableStock < requestedQty) {
      throw new Error(
        `Insufficient stock for "${dbProduct.name}". Only ${availableStock} timepiece(s) available in the vault.`
      );
    }

    const authoritativeUnitPrice = Number(dbProduct.price) || 0;
    const lineSubtotal = authoritativeUnitPrice * requestedQty;
    calculatedSubtotal += lineSubtotal;

    verifiedOrderItems.push({
      product_id: dbProduct.id,
      product_name: dbProduct.name,
      brand: dbProduct.brand || 'Krono Swiss',
      quantity: requestedQty,
      unit_price: authoritativeUnitPrice,
      subtotal: lineSubtotal,
      image_url: dbProduct.image_url,
    });
  }

  // Recalculate discount & grand total
  const discountAmount = Number(orderData.discount_amount) || 0;
  const calculatedGrandTotal = Math.max(0, calculatedSubtotal - discountAmount);

  const generatedId = `KR-${Math.floor(100000 + Math.random() * 900000)}`;
  const orderId = orderData.id || orderData.order_id || generatedId;

  // 2. Create order record
  const initialStatus =
    orderData.status ||
    (orderData.payment_method === 'cod' ||
    orderData.payment_status === 'completed' ||
    orderData.payment_status === 'paid'
      ? 'Paid'
      : 'Pending');

  const newOrder = {
    id: orderId,
    order_id: orderId,
    order_number: orderId,
    user_id: orderData.user_id || orderData.userId || null,
    customer_name: orderData.customer_name || orderData.fullName || 'Valued Client',
    customer_email: orderData.customer_email || orderData.email || 'client@krono.luxury',
    customer_phone: orderData.customer_phone || orderData.phone || '',
    delivery_address: orderData.shipping_address || orderData.delivery_address || orderData.address || '',
    city: orderData.city || 'Colombo',
    postal_code: orderData.postal_code || orderData.postalCode || '00100',
    country: orderData.country || 'Sri Lanka',
    payment_method: orderData.payment_method || orderData.paymentMethod || 'payhere',
    payment_status:
      orderData.payment_status ||
      (orderData.payment_method === 'payhere' ? 'pending' : 'completed'),
    payment_id: orderData.payment_id || null,
    subtotal: calculatedSubtotal,
    discount_amount: discountAmount,
    total_amount: calculatedGrandTotal,
    coupon_code: orderData.coupon_code || null,
    wrist_size: orderData.wrist_size || 'Standard (19cm)',
    gift_packaging: orderData.gift_packaging ?? true,
    special_instructions: orderData.special_instructions || '',
    items: verifiedOrderItems,
    status: initialStatus,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  // 3. Create items in ORDER_ITEMS table (Slide 7 Step 3)
  const newOrderItemsRecords = verifiedOrderItems.map((item, idx) => ({
    id: `item-${Date.now()}-${idx}-${Math.floor(Math.random() * 1000)}`,
    order_item_id: `item-${Date.now()}-${idx}-${Math.floor(Math.random() * 1000)}`,
    order_id: orderId,
    product_id: item.product_id,
    product_name: item.product_name,
    quantity: item.quantity,
    unit_price: item.unit_price,
    subtotal: item.subtotal,
    created_at: newOrder.created_at,
  }));

  // 4. Update stock in database (Slide 7 Step 4: "Decrease stock for confirmed orders")
  for (const item of verifiedOrderItems) {
    const pIdx = db.products.findIndex((p: any) => String(p.id) === String(item.product_id));
    if (pIdx !== -1) {
      const currentStock = Number(db.products[pIdx].stock_qty ?? db.products[pIdx].stock_count ?? 12);
      const newStock = Math.max(0, currentStock - item.quantity);
      db.products[pIdx].stock_qty = newStock;
      db.products[pIdx].stock_count = newStock;
      db.products[pIdx].in_stock = newStock > 0;
      db.products[pIdx].updated_at = new Date().toISOString();

      if (supabase) {
        try {
          await supabase
            .from('products')
            .update({ stock_qty: newStock, stock_count: newStock, in_stock: newStock > 0 })
            .eq('id', item.product_id);
        } catch {}
      }
    }
  }

  // 5. Persist Order and Order Items
  db.orders = [newOrder, ...db.orders];
  db.order_items = [...newOrderItemsRecords, ...(db.order_items || [])];
  writeLocalDb(db);

  if (supabase) {
    try {
      await supabase.from('orders').insert([newOrder]);
      if (newOrderItemsRecords.length > 0) {
        await supabase.from('order_items').insert(newOrderItemsRecords);
      }
    } catch {}
  }

  // 5. Return result (Slide 7 Step 5: "Show order ID / confirmation to customer")
  return newOrder;
}

export async function getOrderItems(orderId?: string) {
  const db = readLocalDb();
  const items = db.order_items || [];
  if (orderId) {
    return items.filter((it: any) => String(it.order_id) === String(orderId));
  }
  return items;
}

export async function updateOrder(orderId: string, updateFields: any) {
  const db = readLocalDb();
  if (!db.orders) db.orders = [];
  const index = db.orders.findIndex((o: any) => o.id === orderId || o.order_number === orderId);
  let updatedOrder = null;
  if (index !== -1) {
    db.orders[index] = { ...db.orders[index], ...updateFields, updated_at: new Date().toISOString() };
    updatedOrder = db.orders[index];
    writeLocalDb(db);
  }
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('orders')
        .update({ ...updateFields, updated_at: new Date().toISOString() })
        .or(`id.eq.${orderId},order_number.eq.${orderId}`)
        .select()
        .single();
      if (!error && data) return data;
    } catch {}
  }
  return updatedOrder;
}

export async function getOrderById(orderId: string) {
  const db = readLocalDb();
  const order = (db.orders || []).find((o: any) => o.id === orderId || o.order_number === orderId);
  if (order) return order;
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .or(`id.eq.${orderId},order_number.eq.${orderId}`)
        .single();
      if (!error && data) return data;
    } catch {}
  }
  return null;
}

export async function getOrders() {
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });
      if (!error && data && data.length > 0) return data;
    } catch {}
  }

  const db = readLocalDb();
  return db.orders || [];
}

export async function getStats() {
  const db = readLocalDb();
  const products = db.products || [];
  const orders = db.orders || [];
  const totalProducts = products.length;
  const activePosters = (db.posters || []).filter((p: any) => p.is_active !== false).length;
  const totalInventoryValue = products.reduce((acc: number, p: any) => acc + (Number(p.price) || 0), 0);
  const categories = [...new Set(products.map((p: any) => p.category))];
  const promoCount = products.filter(
    (p: any) => p.is_on_promotion || (p.old_price && p.old_price > p.price)
  ).length;
  const totalStockUnits = products.reduce(
    (acc: number, p: any) => acc + (Number(p.stock_qty ?? p.stock_count) || 1),
    0
  );
  // Slide 1 & 9: Low stock count (items with stock <= 5 units)
  const lowStockCount = products.filter(
    (p: any) => (p.stock_qty ?? p.stock_count ?? 0) <= 5
  ).length;
  const totalOrders = orders.length;
  const totalRevenue = orders.reduce((acc: number, o: any) => acc + (Number(o.total_amount) || 0), 0);
  const pendingOrders = orders.filter(
    (o: any) => o.status === 'Pending' || o.status === 'pending_payment' || o.payment_status === 'pending'
  ).length;

  return {
    totalProducts,
    activePosters,
    totalInventoryValue,
    categoryCount: categories.length,
    categories,
    featuredCount: products.filter((p: any) => p.is_featured).length,
    promoCount,
    totalStockUnits,
    totalOrders,
    totalRevenue,
    pendingOrders,
    lowStockCount,
    dbConnected: true,
  };
}

// ─── Users ────────────────────────────────────────────────────────────────────
export async function getUserByEmail(email: string) {
  if (supabase) {
    try {
      const { data, error } = await supabase.from('users').select('*').eq('email', email).single();
      if (!error && data) return data;
    } catch {}
  }
  const db = readLocalDb();
  return (db.users || []).find((u: any) => u.email === email) || null;
}

export async function getUserByEmailOrUsername(identity: string) {
  const clean = identity.trim().toLowerCase();
  const db = readLocalDb();
  const found = (db.users || []).find(
    (u: any) =>
      u.email?.toLowerCase() === clean ||
      u.username?.toLowerCase() === clean ||
      (clean === 'admin' && u.role === 'admin')
  );
  if (found) return found;

  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .or(`email.eq.${clean},username.eq.${clean}`)
        .maybeSingle();
      if (!error && data) return data;
    } catch {}
  }
  return null;
}

export async function getUserById(id: string) {
  if (supabase) {
    try {
      const { data, error } = await supabase.from('users').select('*').eq('id', id).single();
      if (!error && data) return data;
    } catch {}
  }
  const db = readLocalDb();
  return (db.users || []).find((u: any) => u.id === id) || null;
}

export async function createUser({
  name,
  email,
  hashedPw,
  password_hash,
  role = 'customer',
  username,
  phone,
  address,
  status,
}: {
  name: string;
  email: string;
  hashedPw?: string;
  password_hash?: string;
  role?: string;
  username?: string;
  phone?: string;
  address?: string;
  status?: string;
}) {
  const userId = `user-${Date.now()}`;
  const finalHash = hashedPw || password_hash || '';
  const newUser = {
    id: userId,
    user_id: userId,
    name,
    full_name: name,
    username: username || email.split('@')[0],
    email,
    password_hash: finalHash,
    role: role || 'customer',
    phone: phone || null,
    address: address || null,
    status: status || 'Active Member',
    created_at: new Date().toISOString(),
  };

  if (supabase) {
    try {
      const { data, error } = await supabase.from('users').insert([{
        id: newUser.id,
        name,
        email,
        password_hash: finalHash,
        role: newUser.role,
        status: newUser.status,
        created_at: newUser.created_at,
      }]).select().single();
      if (!error && data) return data;
    } catch {}
  }

  const db = readLocalDb();
  db.users = db.users || [];
  db.users.push(newUser);
  writeLocalDb(db);
  return newUser;
}

export async function updateUser(id: string, fields: any) {
  if (supabase) {
    try {
      const { data, error } = await supabase.from('users').update(fields).eq('id', id).select().single();
      if (!error && data) return data;
    } catch {}
  }

  const db = readLocalDb();
  db.users = db.users || [];
  const idx = db.users.findIndex((u: any) => u.id === id);
  if (idx === -1) throw new Error('User not found');
  db.users[idx] = { ...db.users[idx], ...fields };
  writeLocalDb(db);
  return db.users[idx];
}

export async function getAllUsers(query?: string) {
  const db = readLocalDb();
  let users = (db.users || []).map((u: any) => {
    const { password_hash, ...safeUser } = u;
    return safeUser;
  });

  if (query && query.trim()) {
    const q = query.trim().toLowerCase();
    users = users.filter((u: any) =>
      u.name?.toLowerCase().includes(q) ||
      u.email?.toLowerCase().includes(q) ||
      u.username?.toLowerCase().includes(q) ||
      u.role?.toLowerCase().includes(q) ||
      u.phone?.toLowerCase().includes(q)
    );
  }

  return users;
}

export async function deleteUser(id: string) {
  const db = readLocalDb();
  db.users = db.users || [];
  const idx = db.users.findIndex((u: any) => u.id === id);
  const target = db.users[idx];
  const adminCount = db.users.filter((u: any) => u.role === 'admin').length;
  if (target.role === 'admin' && adminCount <= 1) {
    throw new Error('At least one administrator account must be retained');
  }

  if (supabase) {
    try {
      await supabase.from('users').delete().eq('id', id);
    } catch {}
  }

  const [removed] = db.users.splice(idx, 1);
  writeLocalDb(db);
  return { success: true, user: removed };
}
