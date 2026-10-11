-- ==============================================================================
-- KRONO WATCHES - SUPABASE DATABASE SCHEMA (SRI LANKA LKR REGISTRY)
-- Run this script in your Supabase Project -> SQL Editor to initialize all tables
-- ==============================================================================

-- 1. Create Users Table (Role-based access: customer, admin)
CREATE TABLE IF NOT EXISTS public.users (
    id TEXT PRIMARY KEY DEFAULT ('usr-' || floor(random() * 1000000000)::text),
    user_id TEXT GENERATED ALWAYS AS (id) STORED,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'customer',
    phone TEXT,
    address TEXT,
    status TEXT DEFAULT 'Active Member',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create Products Table with Brand, Gender, Case Size & LKR Pricing
CREATE TABLE IF NOT EXISTS public.products (
    id TEXT PRIMARY KEY DEFAULT ('prod-' || floor(random() * 1000000000)::text),
    product_id TEXT GENERATED ALWAYS AS (id) STORED,
    name TEXT NOT NULL,
    brand TEXT NOT NULL DEFAULT 'Krono Swiss',
    category TEXT NOT NULL DEFAULT 'Luxury',
    gender TEXT NOT NULL DEFAULT 'Men',
    case_size TEXT NOT NULL DEFAULT '40mm',
    price NUMERIC NOT NULL,
    old_price NUMERIC,
    badge TEXT DEFAULT 'New Release',
    warranty TEXT DEFAULT '5 Years Certified International Warranty',
    promotion_period TEXT DEFAULT 'Active Season Privilege',
    is_on_promotion BOOLEAN DEFAULT false,
    promo_discount_percent INTEGER,
    image_url TEXT NOT NULL,
    images TEXT[] DEFAULT ARRAY[]::TEXT[],
    description TEXT,
    movement TEXT DEFAULT 'Swiss Automatic ETA 2824-2',
    case_material TEXT DEFAULT '316L Stainless Steel',
    water_resistance TEXT DEFAULT '100m (10 ATM)',
    in_stock BOOLEAN DEFAULT true,
    stock_qty INTEGER DEFAULT 12,
    stock_count INTEGER DEFAULT 12,
    is_active BOOLEAN DEFAULT true,
    is_featured BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create Posters & Banner Sections Table
CREATE TABLE IF NOT EXISTS public.posters (
    section_id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    subtitle TEXT,
    badge TEXT,
    discount_text TEXT,
    promotion_period TEXT,
    start_date DATE,
    end_date DATE,
    days TEXT DEFAULT '03',
    hours TEXT DEFAULT '14',
    mins TEXT DEFAULT '28',
    button_text TEXT DEFAULT 'Explore Collection',
    coupon_code TEXT,
    image_url TEXT,
    featured_product_name TEXT,
    featured_product_price TEXT,
    action_link TEXT DEFAULT '#shop',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Create Categories Registry Table
CREATE TABLE IF NOT EXISTS public.categories (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    image_url TEXT,
    badge TEXT DEFAULT 'Curated',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Create Orders Table for Storefront Checkout (in LKR)
CREATE TABLE IF NOT EXISTS public.orders (
    id TEXT PRIMARY KEY DEFAULT ('KR-' || floor(100000 + random() * 900000)::text),
    order_id TEXT GENERATED ALWAYS AS (id) STORED,
    user_id TEXT REFERENCES public.users(id) ON DELETE SET NULL,
    customer_name TEXT NOT NULL,
    customer_email TEXT NOT NULL,
    customer_phone TEXT,
    delivery_address TEXT NOT NULL,
    city TEXT,
    postal_code TEXT,
    country TEXT DEFAULT 'Sri Lanka',
    payment_method TEXT DEFAULT 'card',
    subtotal NUMERIC NOT NULL,
    discount_amount NUMERIC DEFAULT 0,
    total_amount NUMERIC NOT NULL,
    coupon_code TEXT,
    items JSONB NOT NULL DEFAULT '[]'::jsonb,
    status TEXT DEFAULT 'Pending',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Create Order Items Table (Enforcing Foreign-Key Integrity)
CREATE TABLE IF NOT EXISTS public.order_items (
    id TEXT PRIMARY KEY DEFAULT ('item-' || floor(random() * 1000000000)::text),
    order_item_id TEXT GENERATED ALWAYS AS (id) STORED,
    order_id TEXT NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    product_id TEXT NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
    quantity INTEGER NOT NULL DEFAULT 1,
    unit_price NUMERIC NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Enable Row Level Security (RLS) & Access Policies
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow All on Users" ON public.users FOR ALL USING (true);
CREATE POLICY "Allow All on Products" ON public.products FOR ALL USING (true);
CREATE POLICY "Allow All on Posters" ON public.posters FOR ALL USING (true);
CREATE POLICY "Allow All on Categories" ON public.categories FOR ALL USING (true);
CREATE POLICY "Allow All on Orders" ON public.orders FOR ALL USING (true);
CREATE POLICY "Allow All on Order Items" ON public.order_items FOR ALL USING (true);

-- ==============================================================================
-- SEED DATA (WITH SRI LANKAN RUPEE PRICING & SPECIFICATIONS)
-- ==============================================================================

-- Seed Categories
INSERT INTO public.categories (id, name, slug, description, image_url, badge) VALUES
('cat-1', 'Luxury', 'luxury', 'Prestige 18K & Rose Gold Swiss Masterpieces', '/images/watches/watch_1547996160-81dfa.jpg', 'Masterpiece'),
('cat-2', 'Automatic', 'automatic', 'Swiss Calibre Mechanical & Open-Heart Movements', '/images/watches/seastar_1000_powermatic.jpg', 'Heritage'),
('cat-3', 'Sport', 'sport', '300M Deep Divers & Grade 5 Titanium Chronographs', '/images/watches/watch_1434056886845-da.jpg', 'Endurance'),
('cat-4', 'Smart', 'smart', 'Sapphire AMOLED Touchscreen with Biometric Sensors', '/images/watches/watch_1508057198894-24.jpg', 'Innovation')
ON CONFLICT (id) DO NOTHING;

-- Seed Products (Prices in LKR)
INSERT INTO public.products (
    id, name, brand, category, gender, case_size, price, old_price, badge, warranty, promotion_period,
    is_on_promotion, promo_discount_percent, image_url, images, description,
    movement, case_material, water_resistance, in_stock, stock_count, is_featured
) VALUES
(
    'prod-1',
    'Aurelia Master Classic',
    'Krono Swiss',
    'Luxury',
    'Men',
    '40mm',
    385000,
    520000,
    'Best Seller',
    '5 Years Prestige International Warranty',
    'Valid until Sep 30, 2026',
    true,
    26,
    '/images/watches/seastar_1000_powermatic.jpg',
    ARRAY[
        '/images/watches/seastar_1000_powermatic.jpg',
        '/images/watches/watch_1547996160-81dfa.jpg',
        '/images/watches/watch_1524592094714-0f.jpg'
    ],
    'Handcrafted luxury timepiece with Swiss automatic movement, anti-reflective sapphire crystal glass, and top-grain Italian leather strap.',
    'Swiss Automatic ETA 2824-2',
    '316L Hand-Polished Stainless Steel',
    '100m (10 ATM)',
    true,
    14,
    true
),
(
    'prod-2',
    'Speedmaster Chrono Titanium',
    'Omega',
    'Automatic',
    'Men',
    '42mm',
    295000,
    380000,
    'New Release',
    '5 Years Worldwide Movement Warranty',
    'Limited Season: Ends Sep 20, 2026',
    true,
    22,
    '/images/watches/watch_1542496658-e33a6.jpg',
    ARRAY[
        '/images/watches/watch_1542496658-e33a6.jpg',
        '/images/watches/seastar_1000_powermatic.jpg'
    ],
    'Precision mechanical chronograph with lightweight Grade 5 titanium case, Super-LumiNova markers, and 48-hour power reserve.',
    'Mechanical Automatic Calibre 16',
    'Grade 5 Satin Titanium',
    '150m (15 ATM)',
    true,
    8,
    true
),
(
    'prod-3',
    'Submariner Deep Black Ceramic',
    'Rolex',
    'Sport',
    'Men',
    '41mm',
    490000,
    620000,
    'Hot Deal',
    '5 Years Certified International Warranty',
    'Flash Sale: This Week Only',
    true,
    21,
    '/images/watches/watch_1434056886845-da.jpg',
    ARRAY[
        '/images/watches/watch_1434056886845-da.jpg',
        '/images/watches/watch_1524592094714-0f.jpg'
    ],
    'Legendary diver timepiece featuring 300m water resistance, scratch-resistant cerachrom bezel, and precision Oystersteel bracelet.',
    'Perpetual Calibre 3235 Automatic',
    '904L Oystersteel & High-Tech Ceramic',
    '300m (30 ATM)',
    true,
    6,
    true
),
(
    'prod-4',
    'Helio Smart Sapphire AMOLED',
    'TAG Heuer',
    'Smart',
    'Unisex',
    '44mm',
    165000,
    220000,
    'Staff Pick',
    '2 Years Hardware & Battery Warranty',
    'Special Promotion: Ends Sep 30, 2026',
    true,
    25,
    '/images/watches/watch_1508057198894-24.jpg',
    ARRAY[
        '/images/watches/watch_1508057198894-24.jpg',
        '/images/watches/watch_1510017803434-a8.jpg'
    ],
    'Next-generation AMOLED display with advanced biometric sensors, sapphire crystal touchscreen, GPS tracking, and 14-day battery life.',
    'Custom KronoOS Dual-Core Processor',
    'Aerospace Matte Aluminum & Ceramic Back',
    '50m Swimproof',
    true,
    19,
    true
),
(
    'prod-5',
    'Grand Horizon 18k Rose Gold',
    'Patek Philippe',
    'Luxury',
    'Men',
    '38mm',
    780000,
    920000,
    'Exclusive',
    'Lifetime Mechanism Guarantee & Free Annual Polish',
    'Prestige Gala Period: Aug 25 - Sep 30, 2026',
    false,
    15,
    '/images/watches/watch_1547996160-81dfa.jpg',
    ARRAY[
        '/images/watches/watch_1547996160-81dfa.jpg',
        '/images/watches/watch_1524592094714-0f.jpg'
    ],
    '18k rose gold bezel with diamond index markers, skeleton open-heart dial, and genuine alligator grain leather band.',
    'In-House Skeleton Tourbillon Movement',
    '18k Rose Gold Plated Steel & Exhibition Back',
    '50m (5 ATM)',
    true,
    5,
    false
),
(
    'prod-6',
    'Ballon Bleu Mother-of-Pearl',
    'Cartier',
    'Luxury',
    'Women',
    '36mm',
    420000,
    540000,
    'Women Heritage',
    '5 Years International Warranty',
    'Valid until Sep 30, 2026',
    true,
    22,
    '/images/watches/watch_1524592094714-0f.jpg',
    ARRAY[
        '/images/watches/watch_1524592094714-0f.jpg',
        '/images/watches/watch_1542496658-e33a6.jpg'
    ],
    'Captivating guilloché mother-of-pearl dial with blued-steel sword-shaped hands, sapphire cabochon crown, and polished steel bracelet.',
    'Swiss Calibre 076 Automatic',
    'Polished Stainless Steel & Blue Sapphire Cabochon',
    '30m (3 ATM)',
    true,
    9,
    false
),
(
    'prod-7',
    'Seastar 1000 Powermatic 80',
    'Tissot',
    'Sport',
    'Men',
    '40mm',
    145000,
    195000,
    'Popular',
    '3 Years International Warranty',
    'Valid until Sep 30, 2026',
    true,
    25,
    '/images/watches/watch_1524805444758-08.jpg',
    ARRAY[
        '/images/watches/watch_1524805444758-08.jpg',
        '/images/watches/seastar_1000_powermatic.jpg'
    ],
    'High-performance Swiss automatic diver with up to 80 hours power reserve and gradient sunray blue dial.',
    'Powermatic 80.111 Automatic',
    '316L Stainless Steel',
    '300m (30 ATM)',
    true,
    16,
    true
),
(
    'prod-8',
    'Constellation Diamond Bezel',
    'Omega',
    'Luxury',
    'Women',
    '36mm',
    520000,
    680000,
    'Diamond Edition',
    '5 Years Master Chronometer Warranty',
    'Valid until Sep 30, 2026',
    true,
    23,
    '/images/watches/watch_1547996160-81dfa.jpg',
    ARRAY[
        '/images/watches/watch_1547996160-81dfa.jpg',
        '/images/watches/watch_1524592094714-0f.jpg'
    ],
    'Iconic claws design with pavé diamond bezel, mother-of-pearl dial, and Co-Axial Master Chronometer movement.',
    'Omega Calibre 8700 Co-Axial',
    'Sedna Gold & Stainless Steel',
    '50m (5 ATM)',
    true,
    7,
    true
)
ON CONFLICT (id) DO NOTHING;

-- Seed Posters / Banners (in LKR)
INSERT INTO public.posters (
    section_id, title, subtitle, badge, discount_text, promotion_period,
    coupon_code, image_url, featured_product_name, featured_product_price, action_link, is_active
) VALUES
(
    'announcement_bar',
    'Complimentary All-Island Insured Courier across Sri Lanka & 5-Year Certified Warranty on all orders over LKR 100,000',
    'VIP Privilege Protection',
    'Special Privilege',
    'Free Courier Delivery',
    'August 25 - September 30, 2026',
    'KRONO2026',
    null,
    null,
    null,
    '#shop',
    true
),
(
    'hero_drop',
    'Mastery in horology. Crafted for eternity.',
    'Discover master-crafted Swiss mechanical wristwatches designed for visionaries, collectors, and connoisseurs in Sri Lanka.',
    'New Season Collection 2026',
    'Save 30% Today',
    'Season Launch Period: Active until Sep 30, 2026',
    'HERO30',
    '/images/watches/watch_1522312346375-d1.jpg',
    'Aurelia Master Classic',
    'LKR 385,000',
    '#shop',
    true
),
(
    'weekend_sale',
    'Up to 50% off iconic luxury timepieces.',
    'Acquire limited-edition collectors pieces with verified international warranty, authenticity certificate, and complimentary wooden presentation case.',
    'Exclusive Flash Promotion',
    'Up to 50% OFF',
    'Promotion Period: Aug 28 - Sep 15, 2026',
    'FLASH50',
    '/images/watches/watch_1547996160-81dfa.jpg',
    null,
    null,
    '#shop',
    true
)
ON CONFLICT (section_id) DO NOTHING;

-- ==============================================================================
-- SEED USERS (Role-Based Access: Admin & Customer)
-- ==============================================================================
INSERT INTO public.users (id, full_name, email, password_hash, role, phone, address, status) VALUES
(
    'usr-admin-01',
    'Krono Atelier Director',
    'admin@krono.luxury',
    '$2b$10$fpvtcCOaApIIBbj98vzDDOwCRpnj2n7FUhYlzUi77plgpVo2unDaG', -- Admin@1234
    'admin',
    '+94 11 234 5678',
    'Galle Face Court, Colombo 03, Sri Lanka',
    'Active Administrator'
),
(
    'usr-cust-01',
    'Lord Sterling',
    'collector_1789451291448@geneva-vault.ch',
    '$2b$10$S82JP9orCtyDG9MENsQ59OkhNrRclsNvuGrkHP65DStL6aaDEBSw2',
    'customer',
    '+41 22 700 0000',
    'Quai du Mont-Blanc 19, Geneva, Switzerland',
    'Active Member'
),
(
    'usr-cust-02',
    'A. Perera',
    'customer@krono.luxury',
    '$2b$10$rO233iyK3TBtoVaqs2sU8OcG/rIJy3kEFtpP2VtQUQdwGwBpqW6uy', -- Customer@1234
    'customer',
    '+94 77 123 4567',
    'Alfred House Gardens, Colombo 03, Sri Lanka',
    'Active Member'
)
ON CONFLICT (email) DO NOTHING;

-- Seed Sample Orders & Order Items
INSERT INTO public.orders (id, user_id, customer_name, customer_email, customer_phone, delivery_address, total_amount, status) VALUES
('KR-1031', 'usr-cust-02', 'A. Perera', 'customer@krono.luxury', '+94 77 123 4567', 'Alfred House Gardens, Colombo 03', 385000, 'Pending'),
('KR-1032', 'usr-cust-01', 'N. Silva', 'silva@krono.luxury', '+94 71 987 6543', 'Flower Road, Colombo 07', 295000, 'Paid'),
('KR-1033', 'usr-cust-02', 'K. Fernando', 'fernando@krono.luxury', '+94 76 555 4321', 'Kandy Road, Kiribathgoda', 490000, 'Shipped')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.order_items (id, order_id, product_id, quantity, unit_price) VALUES
('item-1031-1', 'KR-1031', 'prod-1', 1, 385000),
('item-1032-1', 'KR-1032', 'prod-2', 1, 295000),
('item-1033-1', 'KR-1033', 'prod-3', 1, 490000)
ON CONFLICT (id) DO NOTHING;

-- ==============================================================================
-- INVENTORY REDUCTION LOGIC (CONFIRMED ORDER WORKFLOW)
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.decrease_product_stock()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.products
    SET stock_qty = GREATEST(0, COALESCE(stock_qty, stock_count, 12) - NEW.quantity),
        stock_count = GREATEST(0, COALESCE(stock_qty, stock_count, 12) - NEW.quantity),
        in_stock = (GREATEST(0, COALESCE(stock_qty, stock_count, 12) - NEW.quantity) > 0)
    WHERE id = NEW.product_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_decrease_stock ON public.order_items;
CREATE TRIGGER trg_decrease_stock
AFTER INSERT ON public.order_items
FOR EACH ROW
EXECUTE FUNCTION public.decrease_product_stock();

