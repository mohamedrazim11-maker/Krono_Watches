const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export interface Product {
  id: string;
  name: string;
  brand?: string;
  category: string;
  gender?: "Men" | "Women" | "Unisex" | string;
  case_size?: string;
  price: number;
  old_price?: number | null;
  badge?: string;
  warranty: string;
  promotion_period?: string;
  is_on_promotion?: boolean;
  promo_discount_percent?: number | null;
  image_url: string;
  images?: string[];
  description?: string;
  movement?: string;
  case_material?: string;
  water_resistance?: string;
  in_stock?: boolean;
  stock_count?: number;
  is_featured?: boolean;
  created_at?: string;
}

export interface Poster {
  section_id: string;
  title: string;
  subtitle?: string;
  badge?: string;
  discount_text?: string;
  coupon_code?: string;
  promotion_period?: string;
  start_date?: string;
  end_date?: string;
  image_url: string;
  action_link?: string;
  button_text?: string;
  days?: string;
  hours?: string;
  mins?: string;
  featured_product_name?: string;
  featured_product_price?: string;
  is_active?: boolean;
  updated_at?: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image_url?: string;
  badge?: string;
  is_active?: boolean;
}

export interface Stats {
  totalProducts: number;
  activePosters: number;
  totalInventoryValue: number;
  categoryCount: number;
  categories: string[];
  featuredCount: number;
  promoCount: number;
  totalStockUnits: number;
}

export const FALLBACK_PRODUCTS: Product[] = [
  // ===================== 1. ROLEX (5 Models) =====================
  {
    id: "prod-rolex-submariner",
    name: "Rolex Submariner Date 41mm Cerachrom",
    brand: "Rolex",
    category: "Dive Watches",
    gender: "Men",
    case_size: "41mm",
    price: 3100000,
    old_price: 3450000,
    badge: "Iconic Diver",
    warranty: "5 Years Certified Rolex International Guarantee",
    promotion_period: "VIP Allocation",
    is_on_promotion: true,
    promo_discount_percent: 10,
    image_url: "/images/watches/submariner_deep_black_ceramic.jpg",
    images: [
      "/images/watches/submariner_deep_black_ceramic.jpg",
      "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=1200&q=85",
      "https://images.unsplash.com/photo-1533139502658-0198f920d8e8?auto=format&fit=crop&w=1200&q=85"
    ],
    description: "The benchmark among divers' watches. Features 300m water resistance, black Cerachrom unidirectional bezel, Chromalight display, and Perpetual Calibre 3235 with 70-hour power reserve.",
    movement: "Rolex Perpetual Calibre 3235 Automatic",
    case_material: "Oystersteel (904L Surgical Grade)",
    water_resistance: "300m (30 ATM)",
    in_stock: true,
    stock_count: 4,
    is_featured: true,
    created_at: "2026-09-01T10:00:00.000Z"
  },
  {
    id: "prod-rolex-gmt-master-ii",
    name: "Rolex GMT-Master II 'Pepsi' Jubilee 40mm",
    brand: "Rolex",
    category: "Sports Watches",
    gender: "Men",
    case_size: "40mm",
    price: 4850000,
    old_price: 5400000,
    badge: "Dual Time Icon",
    warranty: "5 Years Certified Rolex International Guarantee",
    promotion_period: "VIP Registry",
    is_on_promotion: true,
    promo_discount_percent: 10,
    image_url: "https://images.unsplash.com/photo-1547996160-81dfa63595aa?auto=format&fit=crop&w=1200&q=85",
    images: [
      "https://images.unsplash.com/photo-1547996160-81dfa63595aa?auto=format&fit=crop&w=1200&q=85",
      "https://images.unsplash.com/photo-1524592094714-0f0654e20314?auto=format&fit=crop&w=1200&q=85",
      "https://images.unsplash.com/photo-1539185441755-769473a23570?auto=format&fit=crop&w=1200&q=85"
    ],
    description: "Designed to display the time in two different time zones simultaneously. Features a red and blue Cerachrom ceramic 24-hour bezel, arrow-tipped 24-hour hand, and Jubilee five-link bracelet.",
    movement: "Rolex Calibre 3285 Dual Time Automatic",
    case_material: "Oystersteel (904L)",
    water_resistance: "100m (10 ATM)",
    in_stock: true,
    stock_count: 3,
    is_featured: true,
    created_at: "2026-09-01T10:05:00.000Z"
  },
  {
    id: "prod-rolex-daytona",
    name: "Rolex Cosmograph Daytona 40mm Cerachrom",
    brand: "Rolex",
    category: "Chronograph",
    gender: "Men",
    case_size: "40mm",
    price: 5200000,
    old_price: 5800000,
    badge: "Motorsport Legend",
    warranty: "5 Years Certified Rolex International Guarantee",
    promotion_period: "VIP Allocation",
    is_on_promotion: true,
    promo_discount_percent: 10,
    image_url: "https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=1200&q=85",
    images: [
      "https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=1200&q=85",
      "https://images.unsplash.com/photo-1542496658-e33a6d0d50f6?auto=format&fit=crop&w=1200&q=85",
      "https://images.unsplash.com/photo-1526045478516-99145907023c?auto=format&fit=crop&w=1200&q=85"
    ],
    description: "The quintessential tool watch for endurance motor racers. Features a molded tachymetric scale Cerachrom bezel, panda dial sub-dials, and the in-house Calibre 4131 chronograph movement.",
    movement: "Rolex Calibre 4131 Column-Wheel Chronograph",
    case_material: "Oystersteel & Black Cerachrom",
    water_resistance: "100m (10 ATM)",
    in_stock: true,
    stock_count: 2,
    is_featured: true,
    created_at: "2026-09-01T10:10:00.000Z"
  },
  {
    id: "prod-rolex-day-date-40",
    name: "Rolex Day-Date 40 18K Yellow Gold President",
    brand: "Rolex",
    category: "Dress Watches",
    gender: "Men",
    case_size: "40mm",
    price: 15400000,
    old_price: 16800000,
    badge: "The Presidents' Watch",
    warranty: "5 Years Certified Rolex International Guarantee",
    promotion_period: "Exclusive Vault",
    is_on_promotion: true,
    promo_discount_percent: 8,
    image_url: "https://images.unsplash.com/photo-1547996160-81dfa63595aa?auto=format&fit=crop&w=1200&q=85",
    images: [
      "https://images.unsplash.com/photo-1547996160-81dfa63595aa?auto=format&fit=crop&w=1200&q=85",
      "https://images.unsplash.com/photo-1614164185128-e4ec99c436d7?auto=format&fit=crop&w=1200&q=85",
      "/images/watches/speedmaster_chrono_titanium.jpg",
    ],
    description: "The ultimate symbol of prestige and leadership. Crafted in solid 18k yellow gold with Champagne fluted bezel, bespoke President bracelet, and day of the week spelled out in full.",
    movement: "Rolex Calibre 3255 Superlative Chronometer",
    case_material: "18K Solid Yellow Gold",
    water_resistance: "100m (10 ATM)",
    in_stock: true,
    stock_count: 2,
    is_featured: true,
    created_at: "2026-09-01T10:15:00.000Z"
  },
  {
    id: "prod-rolex-sky-dweller",
    name: "Rolex Sky-Dweller Annual Calendar 42mm Rolesor",
    brand: "Rolex",
    category: "Dress Watches",
    gender: "Men",
    case_size: "42mm",
    price: 16300000,
    old_price: 17800000,
    badge: "Grand Complication",
    warranty: "5 Years Certified Rolex International Guarantee",
    promotion_period: "VIP Allocation",
    is_on_promotion: true,
    promo_discount_percent: 8,
    image_url: "https://images.unsplash.com/photo-1523170335258-f5ed11844a49?auto=format&fit=crop&w=1200&q=85",
    images: [
      "https://images.unsplash.com/photo-1523170335258-f5ed11844a49?auto=format&fit=crop&w=1200&q=85",
      "https://images.unsplash.com/photo-1547996160-81dfa63595aa?auto=format&fit=crop&w=1200&q=85",
      "/images/watches/submariner_deep_black_ceramic.jpg",
    ],
    description: "An elegant timepiece for global travelers. Features dual time zones, annual calendar with revolutionary Saros mechanism, month indicator, and fluted bidirectional Ring Command bezel.",
    movement: "Rolex Calibre 9002 Annual Calendar Automatic",
    case_material: "18K White Gold & Oystersteel",
    water_resistance: "100m (10 ATM)",
    in_stock: true,
    stock_count: 2,
    is_featured: true,
    created_at: "2026-09-01T10:20:00.000Z"
  },

  // ===================== 2. OMEGA (5 Models) =====================
  {
    id: "prod-omega-speedmaster-moonwatch",
    name: "Omega Speedmaster Professional Moonwatch",
    brand: "Omega",
    category: "Chronograph",
    gender: "Men",
    case_size: "42mm",
    price: 2450000,
    old_price: 2750000,
    badge: "Space Certified",
    warranty: "5 Years Master Chronometer International Warranty",
    promotion_period: "Collector Series",
    is_on_promotion: true,
    promo_discount_percent: 11,
    image_url: "/images/watches/speedmaster_chrono_titanium.jpg",
    images: [
      "/images/watches/speedmaster_chrono_titanium.jpg",
      "https://images.unsplash.com/photo-1526045478516-99145907023c?auto=format&fit=crop&w=1200&q=85",
      "https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=1200&q=85"
    ],
    description: "The legendary Moonwatch qualified by NASA for all manned space missions. Features the manual-winding Co-Axial Master Chronometer Calibre 3861 with dot-over-ninety anodized aluminium bezel.",
    movement: "Omega Co-Axial Master Chronometer 3861",
    case_material: "Stainless Steel (316L)",
    water_resistance: "50m (5 ATM)",
    in_stock: true,
    stock_count: 5,
    is_featured: true,
    created_at: "2026-09-01T10:25:00.000Z"
  },
  {
    id: "prod-omega-seamaster-diver-300m",
    name: "Omega Seamaster Diver 300M Co-Axial Master",
    brand: "Omega",
    category: "Dive Watches",
    gender: "Men",
    case_size: "42mm",
    price: 1850000,
    old_price: 2100000,
    badge: "007 Heritage",
    warranty: "5 Years Master Chronometer International Warranty",
    promotion_period: "VIP Offer",
    is_on_promotion: true,
    promo_discount_percent: 12,
    image_url: "/images/watches/submariner_deep_black_ceramic.jpg",
    images: [
      "/images/watches/submariner_deep_black_ceramic.jpg",
      "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=1200&q=85",
      "https://images.unsplash.com/photo-1434056886845-dac89ffe9b56?auto=format&fit=crop&w=1200&q=85"
    ],
    description: "Since 1993, the Seamaster Professional Diver 300M has enjoyed a legendary following. Black ceramic dial with laser-engraved waves, helium escape valve, and METAS-certified Calibre 8800.",
    movement: "Omega Co-Axial Master Chronometer 8800 Automatic",
    case_material: "Stainless Steel & Ceramic Bezel",
    water_resistance: "300m (30 ATM)",
    in_stock: true,
    stock_count: 6,
    is_featured: true,
    created_at: "2026-09-01T10:30:00.000Z"
  },
  {
    id: "prod-omega-seamaster-aqua-terra",
    name: "Omega Seamaster Aqua Terra 150M 41mm",
    brand: "Omega",
    category: "Sports Watches",
    gender: "Men",
    case_size: "41mm",
    price: 2050000,
    old_price: 2350000,
    badge: "Maritime Luxury",
    warranty: "5 Years Master Chronometer International Warranty",
    promotion_period: "Valid Sep 2026",
    is_on_promotion: true,
    promo_discount_percent: 13,
    image_url: "https://images.unsplash.com/photo-1523170335258-f5ed11844a49?auto=format&fit=crop&w=1200&q=85",
    images: [
      "https://images.unsplash.com/photo-1523170335258-f5ed11844a49?auto=format&fit=crop&w=1200&q=85",
      "https://images.unsplash.com/photo-1547996160-81dfa63595aa?auto=format&fit=crop&w=1200&q=85",
      "/images/watches/submariner_deep_black_ceramic.jpg",
    ],
    description: "A superb tribute to Omega's rich maritime heritage. Horizontal teak concept pattern dial inspired by the wooden decks of luxury yachts. Resistant to magnetic fields reaching 15,000 gauss.",
    movement: "Omega Master Chronometer Calibre 8900",
    case_material: "Stainless Steel (316L)",
    water_resistance: "150m (15 ATM)",
    in_stock: true,
    stock_count: 4,
    is_featured: false,
    created_at: "2026-09-01T10:35:00.000Z"
  },
  {
    id: "prod-omega-constellation",
    name: "Omega Constellation Co-Axial Master 39mm",
    brand: "Omega",
    category: "Dress Watches",
    gender: "Unisex",
    case_size: "39mm",
    price: 2300000,
    old_price: 2600000,
    badge: "Geneva Observatory",
    warranty: "5 Years Master Chronometer International Warranty",
    promotion_period: "VIP Allocation",
    is_on_promotion: true,
    promo_discount_percent: 12,
    image_url: "https://images.unsplash.com/photo-1547996160-81dfa63595aa?auto=format&fit=crop&w=1200&q=85",
    images: [
      "https://images.unsplash.com/photo-1547996160-81dfa63595aa?auto=format&fit=crop&w=1200&q=85",
      "https://images.unsplash.com/photo-1524592094714-0f0654e20314?auto=format&fit=crop&w=1200&q=85",
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1200&q=85"
    ],
    description: "Distinguished by famous half-moons, iconic 'claws' on the side of the case, and mono-rang bracelet. Roman numerals engraved on the bezel with silk-embossed silver-grey dial.",
    movement: "Omega Co-Axial Master Chronometer 8800",
    case_material: "Stainless Steel & 18K Sedna Gold Accents",
    water_resistance: "50m (5 ATM)",
    in_stock: true,
    stock_count: 3,
    is_featured: false,
    created_at: "2026-09-01T10:40:00.000Z"
  },
  {
    id: "prod-omega-de-ville-prestige",
    name: "Omega De Ville Prestige Co-Axial Master 40mm",
    brand: "Omega",
    category: "Dress Watches",
    gender: "Men",
    case_size: "40mm",
    price: 1680000,
    old_price: 1950000,
    badge: "Pure Elegance",
    warranty: "5 Years Master Chronometer International Warranty",
    promotion_period: "Classic Edition",
    is_on_promotion: true,
    promo_discount_percent: 14,
    image_url: "https://images.unsplash.com/photo-1524592094714-0f0654e20314?auto=format&fit=crop&w=1200&q=85",
    images: [
      "https://images.unsplash.com/photo-1524592094714-0f0654e20314?auto=format&fit=crop&w=1200&q=85",
      "https://images.unsplash.com/photo-1547996160-81dfa63595aa?auto=format&fit=crop&w=1200&q=85",
      "/images/watches/speedmaster_chrono_titanium.jpg",
    ],
    description: "Timeless style and refined aesthetic. Sun-brushed blue PVD dial with alternating Roman numerals and cabochon indexes, encased in a slim stainless steel profile with 7-link bracelet.",
    movement: "Omega Co-Axial Master Chronometer 8800",
    case_material: "Stainless Steel (316L)",
    water_resistance: "30m (3 ATM)",
    in_stock: true,
    stock_count: 5,
    is_featured: false,
    created_at: "2026-09-01T10:45:00.000Z"
  },

  // ===================== 3. CASIO (5 Models) =====================
  {
    id: "prod-casio-g-shock-mr-g",
    name: "Casio G-Shock MR-G MRG-B2000 Titanium Kachi-Iro",
    brand: "Casio",
    category: "Sports Watches",
    gender: "Men",
    case_size: "49.8mm",
    price: 1100000,
    old_price: 1250000,
    badge: "Flagship MR-G",
    warranty: "3 Years Casio International Premium Guarantee",
    promotion_period: "Yamagata Masterpiece",
    is_on_promotion: true,
    promo_discount_percent: 12,
    image_url: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1200&q=85",
    images: [
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1200&q=85",
      "https://images.unsplash.com/photo-1533139502658-0198f920d8e8?auto=format&fit=crop&w=1200&q=85",
      "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&w=1200&q=85"
    ],
    description: "The pinnacle of G-Shock toughness with traditional Japanese craftsmanship. Deep-layer hardened recrystallized titanium, Sallaz polishing, Bluetooth connectivity, and Tough Solar.",
    movement: "Tough Solar Multi-Band 6 Connected Quartz",
    case_material: "Deep-Layer Hardened Titanium with DLC Coating",
    water_resistance: "200m (20 ATM)",
    in_stock: true,
    stock_count: 3,
    is_featured: true,
    created_at: "2026-09-01T10:50:00.000Z"
  },
  {
    id: "prod-casio-g-shock-mt-g",
    name: "Casio G-Shock MT-G MTG-B3000 Carbon Dual Core",
    brand: "Casio",
    category: "Sports Watches",
    gender: "Men",
    case_size: "50.9mm",
    price: 420000,
    old_price: 480000,
    badge: "Carbon Core Guard",
    warranty: "2 Years Casio International Warranty",
    promotion_period: "Slim Structure Innovation",
    is_on_promotion: true,
    promo_discount_percent: 12,
    image_url: "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&w=1200&q=85",
    images: [
      "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&w=1200&q=85",
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1200&q=85",
      "https://images.unsplash.com/photo-1533139502658-0198f920d8e8?auto=format&fit=crop&w=1200&q=85"
    ],
    description: "Innovative Dual-Core Guard structure fusing resin reinforced with carbon fiber and steel exterior. Incredibly slim 12.1mm module with smartphone link and high-luminosity LED light.",
    movement: "Tough Solar Connected Module 5672",
    case_material: "Carbon-Reinforced Resin & Stainless Steel",
    water_resistance: "200m (20 ATM)",
    in_stock: true,
    stock_count: 6,
    is_featured: false,
    created_at: "2026-09-01T10:55:00.000Z"
  },
  {
    id: "prod-casio-g-shock-full-metal",
    name: "Casio G-Shock Full Metal GMW-B5000D-1 Silver",
    brand: "Casio",
    category: "Digital",
    gender: "Unisex",
    case_size: "43.2mm",
    price: 240000,
    old_price: 280000,
    badge: "Origin Heritage",
    warranty: "2 Years Casio International Warranty",
    promotion_period: "Heritage Classic",
    is_on_promotion: true,
    promo_discount_percent: 14,
    image_url: "https://images.unsplash.com/photo-1533139502658-0198f920d8e8?auto=format&fit=crop&w=1200&q=85",
    images: [
      "https://images.unsplash.com/photo-1533139502658-0198f920d8e8?auto=format&fit=crop&w=1200&q=85",
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1200&q=85",
      "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&w=1200&q=85"
    ],
    description: "Full-metal realization of the iconic 1983 square DW-5000C origin. Stainless steel screw-lock back, STN liquid crystal display, Tough Solar power, and Bluetooth Smartphone Link.",
    movement: "Tough Solar Bluetooth Digital Multi-Band 6",
    case_material: "Solid Stainless Steel with Fine Resin Dampeners",
    water_resistance: "200m (20 ATM)",
    in_stock: true,
    stock_count: 8,
    is_featured: false,
    created_at: "2026-09-01T11:00:00.000Z"
  },
  {
    id: "prod-casio-g-shock-master-of-g",
    name: "Casio G-Shock Master of G Mudmaster GWG-B1000",
    brand: "Casio",
    category: "Digital",
    gender: "Men",
    case_size: "54mm",
    price: 275000,
    old_price: 320000,
    badge: "Extreme Survival",
    warranty: "2 Years Casio International Warranty",
    promotion_period: "Land Master Series",
    is_on_promotion: true,
    promo_discount_percent: 14,
    image_url: "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&w=1200&q=85",
    images: [
      "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&w=1200&q=85",
      "https://images.unsplash.com/photo-1533139502658-0198f920d8e8?auto=format&fit=crop&w=1200&q=85",
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1200&q=85"
    ],
    description: "Built to survive sand, mud, and harsh conditions. Triple sensor featuring digital compass, altimeter/barometer, thermometer, forged carbon bezel guards, and sapphire crystal.",
    movement: "Tough Solar Triple Sensor v3 with Radio-Control",
    case_material: "Carbon Core Guard & Stainless Steel Forging",
    water_resistance: "200m (20 ATM)",
    in_stock: true,
    stock_count: 7,
    is_featured: false,
    created_at: "2026-09-01T11:05:00.000Z"
  },
  {
    id: "prod-casio-oceanus-ocw",
    name: "Casio Oceanus Manta OCW-S7000 Slim Sapphire",
    brand: "Casio",
    category: "Dress Watches",
    gender: "Men",
    case_size: "42.8mm",
    price: 490000,
    old_price: 560000,
    badge: "Elegance & Technology",
    warranty: "3 Years Casio Premium International Warranty",
    promotion_period: "Japan Domestic Masterpiece",
    is_on_promotion: true,
    promo_discount_percent: 12,
    image_url: "https://images.unsplash.com/photo-1523170335258-f5ed11844a49?auto=format&fit=crop&w=1200&q=85",
    images: [
      "https://images.unsplash.com/photo-1523170335258-f5ed11844a49?auto=format&fit=crop&w=1200&q=85",
      "https://images.unsplash.com/photo-1547996160-81dfa63595aa?auto=format&fit=crop&w=1200&q=85",
      "https://images.unsplash.com/photo-1524592094714-0f0654e20314?auto=format&fit=crop&w=1200&q=85"
    ],
    description: "Premium Japanese craftsmanship with mirror-polished Zaratsu titanium case. 12-facet blue sapphire crystal bezel, dual-curved sapphire glass, Tough Solar, and Bluetooth time synchronization.",
    movement: "Tough Solar Chronograph with Smart Access Crown",
    case_material: "Titanium with Titanium Carbide Treatment & Sapphire",
    water_resistance: "100m (10 ATM)",
    in_stock: true,
    stock_count: 4,
    is_featured: false,
    created_at: "2026-09-01T11:10:00.000Z"
  },

  // ===================== 4. SEIKO (5 Models) =====================
  {
    id: "prod-grand-seiko-spring-drive-snowflake",
    name: "Grand Seiko Heritage Spring Drive 'Snowflake' SBGA211",
    brand: "Seiko",
    category: "Automatic",
    gender: "Men",
    case_size: "41mm",
    price: 2150000,
    old_price: 2400000,
    badge: "Shinshu Snowflake",
    warranty: "5 Years Grand Seiko International Warranty",
    promotion_period: "Spring Drive Master",
    is_on_promotion: true,
    promo_discount_percent: 10,
    image_url: "https://images.unsplash.com/photo-1547996160-81dfa63595aa?auto=format&fit=crop&w=1200&q=85",
    images: [
      "https://images.unsplash.com/photo-1547996160-81dfa63595aa?auto=format&fit=crop&w=1200&q=85",
      "https://images.unsplash.com/photo-1524592094714-0f0654e20314?auto=format&fit=crop&w=1200&q=85",
      "https://images.unsplash.com/photo-1523170335258-f5ed11844a49?auto=format&fit=crop&w=1200&q=85"
    ],
    description: "The dial captures the serene texture of fresh snow on the Shinshu mountains. Powered by the unique Spring Drive Calibre 9R65 with a mesmerizing, perfectly continuous gliding seconds hand.",
    movement: "Grand Seiko Calibre 9R65 Spring Drive (+/- 1s/day)",
    case_material: "High-Intensity Titanium with Zaratsu Polish",
    water_resistance: "100m (10 ATM)",
    in_stock: true,
    stock_count: 4,
    is_featured: true,
    created_at: "2026-09-01T11:15:00.000Z"
  },
  {
    id: "prod-grand-seiko-heritage-shunbun",
    name: "Grand Seiko Heritage 'Shunbun' SBGA413 Spring Drive",
    brand: "Seiko",
    category: "Dress Watches",
    gender: "Unisex",
    case_size: "40mm",
    price: 2350000,
    old_price: 2650000,
    badge: "Sakura Blossom Dial",
    warranty: "5 Years Grand Seiko International Warranty",
    promotion_period: "Four Seasons 24 Sekki",
    is_on_promotion: true,
    promo_discount_percent: 11,
    image_url: "https://images.unsplash.com/photo-1524592094714-0f0654e20314?auto=format&fit=crop&w=1200&q=85",
    images: [
      "https://images.unsplash.com/photo-1524592094714-0f0654e20314?auto=format&fit=crop&w=1200&q=85",
      "https://images.unsplash.com/photo-1547996160-81dfa63595aa?auto=format&fit=crop&w=1200&q=85",
      "/images/watches/submariner_deep_black_ceramic.jpg",
    ],
    description: "Celebrates the spring equinox (Shunbun) when pink cherry blossoms fall onto lake surfaces (Hana-Ikada). High-intensity titanium case with 62GS vintage bezel-free design.",
    movement: "Grand Seiko Calibre 9R65 Spring Drive",
    case_material: "High-Intensity Titanium (Zaratsu Polished)",
    water_resistance: "100m (10 ATM)",
    in_stock: true,
    stock_count: 3,
    is_featured: true,
    created_at: "2026-09-01T11:20:00.000Z"
  },
  {
    id: "prod-grand-seiko-elegance-sbgy007",
    name: "Grand Seiko Elegance 'Omiwatari' SBGY007",
    brand: "Seiko",
    category: "Dress Watches",
    gender: "Men",
    case_size: "38.5mm",
    price: 2750000,
    old_price: 3100000,
    badge: "Omiwatari Glacier Dial",
    warranty: "5 Years Grand Seiko International Warranty",
    promotion_period: "Manual Wind Master",
    is_on_promotion: true,
    promo_discount_percent: 11,
    image_url: "https://images.unsplash.com/photo-1523170335258-f5ed11844a49?auto=format&fit=crop&w=1200&q=85",
    images: [
      "https://images.unsplash.com/photo-1523170335258-f5ed11844a49?auto=format&fit=crop&w=1200&q=85",
      "https://images.unsplash.com/photo-1524592094714-0f0654e20314?auto=format&fit=crop&w=1200&q=85",
      "https://images.unsplash.com/photo-1547996160-81dfa63595aa?auto=format&fit=crop&w=1200&q=85"
    ],
    description: "Inspired by the frozen ridges of Lake Suwa in winter. Manual-wind Spring Drive Calibre 9R31 with dual-spring barrel delivering 72 hours of power reserve in an ultra-thin 10.2mm profile.",
    movement: "Grand Seiko Manual-Wind Spring Drive 9R31",
    case_material: "Stainless Steel with Zaratsu Polish & Crocodile Strap",
    water_resistance: "30m (Splash Resistant)",
    in_stock: true,
    stock_count: 2,
    is_featured: false,
    created_at: "2026-09-01T11:25:00.000Z"
  },
  {
    id: "prod-seiko-prospex-lx-diver",
    name: "Seiko Prospex LX Spring Drive Diver SNR029 300m",
    brand: "Seiko",
    category: "Dive Watches",
    gender: "Men",
    case_size: "44.8mm",
    price: 1800000,
    old_price: 2050000,
    badge: "Ken Okuyama Design",
    warranty: "3 Years Seiko International Warranty",
    promotion_period: "Professional Diver",
    is_on_promotion: true,
    promo_discount_percent: 12,
    image_url: "/images/watches/submariner_deep_black_ceramic.jpg",
    images: [
      "/images/watches/submariner_deep_black_ceramic.jpg",
      "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=1200&q=85",
      "https://images.unsplash.com/photo-1434056886845-dac89ffe9b56?auto=format&fit=crop&w=1200&q=85"
    ],
    description: "Designed in collaboration with famed industrial designer Ken Okuyama. 300m saturation diver with lightweight super-hard coated titanium case, ceramic bezel, and Spring Drive Calibre 5R65.",
    movement: "Seiko Calibre 5R65 Spring Drive Automatic",
    case_material: "Titanium with Super-Hard Coating & Ceramic Bezel",
    water_resistance: "300m Saturation Diving",
    in_stock: true,
    stock_count: 4,
    is_featured: false,
    created_at: "2026-09-01T11:30:00.000Z"
  },
  {
    id: "prod-seiko-presage-craftsmanship-enamel",
    name: "Seiko Presage Craftsmanship Enamel SPB403",
    brand: "Seiko",
    category: "Automatic",
    gender: "Men",
    case_size: "40.2mm",
    price: 360000,
    old_price: 410000,
    badge: "Handcrafted Enamel",
    warranty: "3 Years Seiko International Warranty",
    promotion_period: "Artisan Dial Edition",
    is_on_promotion: true,
    promo_discount_percent: 12,
    image_url: "https://images.unsplash.com/photo-1524592094714-0f0654e20314?auto=format&fit=crop&w=1200&q=85",
    images: [
      "https://images.unsplash.com/photo-1524592094714-0f0654e20314?auto=format&fit=crop&w=1200&q=85",
      "https://images.unsplash.com/photo-1547996160-81dfa63595aa?auto=format&fit=crop&w=1200&q=85",
      "https://images.unsplash.com/photo-1523170335258-f5ed11844a49?auto=format&fit=crop&w=1200&q=85"
    ],
    description: "Pure white enamel dial fired by master artisan Mitsuru Yokosawa. Traditional Roman numerals, tempered blue hands, and the new automatic Calibre 6R55 with 72 hours power reserve.",
    movement: "Seiko Automatic Calibre 6R55 (72-Hour Reserve)",
    case_material: "Stainless Steel with Dual-Curved Sapphire",
    water_resistance: "100m (10 ATM)",
    in_stock: true,
    stock_count: 6,
    is_featured: false,
    created_at: "2026-09-01T11:35:00.000Z"
  },

  // ===================== 5. TISSOT (5 Models) =====================
  {
    id: "prod-tissot-prx-powermatic-80",
    name: "Tissot PRX Powermatic 80 40mm Ice Blue Dial",
    brand: "Tissot",
    category: "Automatic",
    gender: "Unisex",
    case_size: "40mm",
    price: 245000,
    old_price: 285000,
    badge: "Integrated Bracelet Icon",
    warranty: "2 Years International Tissot Warranty",
    promotion_period: "Hot Trending Reference",
    is_on_promotion: true,
    promo_discount_percent: 14,
    image_url: "https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=1200&q=85",
    images: [
      "https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=1200&q=85",
      "https://images.unsplash.com/photo-1542496658-e33a6d0d50f6?auto=format&fit=crop&w=1200&q=85",
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1200&q=85"
    ],
    description: "Slim, timeless 1978 design featuring a waffle pattern ice-blue dial, integrated brushed steel bracelet, Nivachron non-magnetic balance spring, and 80 hours power reserve.",
    movement: "Swiss Powermatic 80.111 Automatic",
    case_material: "316L Stainless Steel with Integrated Bracelet",
    water_resistance: "100m (10 ATM)",
    in_stock: true,
    stock_count: 10,
    is_featured: true,
    created_at: "2026-09-01T11:40:00.000Z"
  },
  {
    id: "prod-tissot-gentleman-powermatic-80",
    name: "Tissot Gentleman Powermatic 80 Silicium 40mm",
    brand: "Tissot",
    category: "Dress Watches",
    gender: "Men",
    case_size: "40mm",
    price: 265000,
    old_price: 310000,
    badge: "Silicium Hairspring",
    warranty: "2 Years International Tissot Warranty",
    promotion_period: "Executive Standard",
    is_on_promotion: true,
    promo_discount_percent: 15,
    image_url: "https://images.unsplash.com/photo-1547996160-81dfa63595aa?auto=format&fit=crop&w=1200&q=85",
    images: [
      "https://images.unsplash.com/photo-1547996160-81dfa63595aa?auto=format&fit=crop&w=1200&q=85",
      "https://images.unsplash.com/photo-1524592094714-0f0654e20314?auto=format&fit=crop&w=1200&q=85",
      "https://images.unsplash.com/photo-1523170335258-f5ed11844a49?auto=format&fit=crop&w=1200&q=85"
    ],
    description: "The ultimate daily watch for the modern gentleman. Deep sunburst blue dial, crosshair motif, exhibition caseback, and anti-magnetic silicon hairspring.",
    movement: "Swiss Powermatic 80 Silicium Automatic",
    case_material: "316L Stainless Steel",
    water_resistance: "100m (10 ATM)",
    in_stock: true,
    stock_count: 8,
    is_featured: false,
    created_at: "2026-09-01T11:45:00.000Z"
  },
  {
    id: "prod-tissot-seastar-1000-powermatic",
    name: "Tissot Seastar 1000 Powermatic 80 43mm Diver",
    brand: "Tissot",
    category: "Dive Watches",
    gender: "Men",
    case_size: "43mm",
    price: 260000,
    old_price: 295000,
    badge: "300m Diver",
    warranty: "2 Years International Tissot Warranty",
    promotion_period: "Watersport Edition",
    is_on_promotion: true,
    promo_discount_percent: 12,
    image_url: "/images/watches/submariner_deep_black_ceramic.jpg",
    images: [
      "/images/watches/submariner_deep_black_ceramic.jpg",
      "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=1200&q=85",
      "https://images.unsplash.com/photo-1434056886845-dac89ffe9b56?auto=format&fit=crop&w=1200&q=85"
    ],
    description: "High performance underwater watch rated to 300m/1000ft. Unidirectional ceramic bezel, screw-down crown and caseback, luminous Super-LumiNova hands, and 80h power reserve.",
    movement: "Swiss Powermatic 80 Automatic",
    case_material: "316L Stainless Steel & Ceramic Bezel",
    water_resistance: "300m (30 ATM)",
    in_stock: true,
    stock_count: 7,
    is_featured: false,
    created_at: "2026-09-01T11:50:00.000Z"
  },
  {
    id: "prod-tissot-le-locle-powermatic-80",
    name: "Tissot Le Locle Powermatic 80 Guilloché 39.3mm",
    brand: "Tissot",
    category: "Dress Watches",
    gender: "Men",
    case_size: "39.3mm",
    price: 235000,
    old_price: 270000,
    badge: "Cradle of Horology",
    warranty: "2 Years International Tissot Warranty",
    promotion_period: "Swiss Heritage",
    is_on_promotion: true,
    promo_discount_percent: 13,
    image_url: "https://images.unsplash.com/photo-1524592094714-0f0654e20314?auto=format&fit=crop&w=1200&q=85",
    images: [
      "https://images.unsplash.com/photo-1524592094714-0f0654e20314?auto=format&fit=crop&w=1200&q=85",
      "https://images.unsplash.com/photo-1547996160-81dfa63595aa?auto=format&fit=crop&w=1200&q=85",
      "/images/watches/speedmaster_chrono_titanium.jpg",
    ],
    description: "Named after Tissot's home city in the Swiss Jura mountains. Traditional Clous de Paris guilloché dial, classic Roman numerals, and ornate split-window exhibition caseback.",
    movement: "Swiss Powermatic 80 Automatic",
    case_material: "316L Stainless Steel",
    water_resistance: "30m (3 ATM)",
    in_stock: true,
    stock_count: 9,
    is_featured: false,
    created_at: "2026-09-01T11:55:00.000Z"
  },
  {
    id: "prod-tissot-ballade",
    name: "Tissot Ballade Powermatic 80 COSC Chronometer",
    brand: "Tissot",
    category: "Dress Watches",
    gender: "Unisex",
    case_size: "41mm",
    price: 280000,
    old_price: 325000,
    badge: "COSC Chronometer Certified",
    warranty: "3 Years International Tissot Warranty",
    promotion_period: "Chronometer Standard",
    is_on_promotion: true,
    promo_discount_percent: 14,
    image_url: "https://images.unsplash.com/photo-1547996160-81dfa63595aa?auto=format&fit=crop&w=1200&q=85",
    images: [
      "https://images.unsplash.com/photo-1547996160-81dfa63595aa?auto=format&fit=crop&w=1200&q=85",
      "https://images.unsplash.com/photo-1524592094714-0f0654e20314?auto=format&fit=crop&w=1200&q=85",
      "https://images.unsplash.com/photo-1523170335258-f5ed11844a49?auto=format&fit=crop&w=1200&q=85"
    ],
    description: "Official Swiss Chronometer Testing Institute (COSC) certified precision. Fluted bezel with guilloché inner dial ring, silicon balance spring, and stainless steel link bracelet.",
    movement: "COSC Certified Powermatic 80 Silicium",
    case_material: "316L Stainless Steel with Fluted Bezel",
    water_resistance: "50m (5 ATM)",
    in_stock: true,
    stock_count: 5,
    is_featured: false,
    created_at: "2026-09-01T12:00:00.000Z"
  }
];

export function formatLKR(amount: number): string {
  return `LKR ${Number(amount || 0).toLocaleString("en-US")}`;
}

export const FALLBACK_POSTERS: Poster[] = [
  {
    section_id: "hero",
    title: "The Five Master Houses. Swiss & Japanese Prestige.",
    subtitle: "Curated 2026 collection from Rolex, Omega, Casio, Seiko, and Tissot with international certification and direct boutique allocation.",
    badge: "Official 2026 Registry",
    discount_text: "VIP Privilege",
    promotion_period: "Season Launch: Active until Sep 30, 2026",
    coupon_code: "MONO20",
    image_url: "/images/watches/submariner_deep_black_ceramic.jpg",
    featured_product_name: "Rolex Submariner Date 41mm",
    featured_product_price: "LKR 3,100,000",
    days: "04",
    hours: "18",
    mins: "45",
    is_active: true
  },
  {
    section_id: "flash_deals",
    title: "Exclusive 20% Masterpiece Privilege",
    subtitle: "Acquire verified references from Rolex, Omega, Grand Seiko, Casio MR-G, and Tissot with international warranty.",
    badge: "VIP Privilege Event",
    discount_text: "20% OFF",
    promotion_period: "Promotion Period: Active until Sep 30, 2026",
    coupon_code: "MONO20",
    image_url: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=1200&q=85",
    featured_product_name: "Rolex GMT-Master II Pepsi",
    featured_product_price: "LKR 4,850,000",
    is_active: true
  }
];

export async function fetchProducts(params?: { category?: string; featured?: boolean | string; search?: string }): Promise<Product[]> {
  try {
    const query = new URLSearchParams();
    if (params?.category && params.category !== 'All') query.append('category', params.category);
    if (params?.featured !== undefined) query.append('featured', String(params.featured));
    if (params?.search) query.append('search', params.search);

    const url = `${API_BASE_URL}/products${query.toString() ? `?${query.toString()}` : ''}`;
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) throw new Error(`Failed to fetch products: ${res.statusText}`);
    const json = await res.json();
    if (json.data && Array.isArray(json.data) && json.data.length > 0) {
      return json.data;
    }
    return FALLBACK_PRODUCTS;
  } catch (error) {
    console.error('API fetchProducts falling back to curated dataset:', error);
    return FALLBACK_PRODUCTS;
  }
}

export async function fetchProductById(id: string): Promise<Product | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/products/${id}`, { cache: 'no-store' });
    if (!res.ok) throw new Error(`Failed to fetch product ${id}`);
    const json = await res.json();
    if (json.data) return json.data;
    const fallback = FALLBACK_PRODUCTS.find((p) => p.id === id);
    return fallback || null;
  } catch (error) {
    console.error(`API fetchProductById falling back for ${id}:`, error);
    const fallback = FALLBACK_PRODUCTS.find((p) => p.id === id);
    return fallback || null;
  }
}

export async function fetchCategories(): Promise<Category[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/products/categories`, { cache: 'no-store' });
    if (!res.ok) throw new Error(`Failed to fetch categories: ${res.statusText}`);
    const json = await res.json();
    return json.data || [];
  } catch (error) {
    console.error('API fetchCategories error:', error);
    return [
      { id: "cat-dive", name: "Dive Watches", slug: "Dive Watches", description: "Deep water resistance & ceramic bezels" },
      { id: "cat-dress", name: "Dress Watches", slug: "Dress Watches", description: "Fluted bezels, precious metals & guilloché" },
      { id: "cat-chronograph", name: "Chronograph", slug: "Chronograph", description: "High-precision timing & tachymetric scales" },
      { id: "cat-automatic", name: "Automatic", slug: "Automatic", description: "Swiss & Japanese self-winding movements" },
      { id: "cat-digital", name: "Digital", slug: "Digital", description: "Multi-band atomic & Tough Solar modules" },
      { id: "cat-sports", name: "Sports Watches", slug: "Sports Watches", description: "Toughness, dual-time & extreme resilience" }
    ];
  }
}

export async function createProduct(productData: Partial<Product>): Promise<Product> {
  const res = await fetch(`${API_BASE_URL}/products`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(productData),
  });
  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.message || 'Failed to create product');
  }
  return json.data;
}

export async function updateProduct(id: string, productData: Partial<Product>): Promise<Product> {
  const res = await fetch(`${API_BASE_URL}/products/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(productData),
  });
  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.message || 'Failed to update product');
  }
  return json.data;
}

export async function deleteProduct(id: string): Promise<boolean> {
  const res = await fetch(`${API_BASE_URL}/products/${id}`, {
    method: 'DELETE',
  });
  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.message || 'Failed to delete product');
  }
  return true;
}

export async function fetchPosters(): Promise<Poster[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/posters`, { cache: 'no-store' });
    if (!res.ok) throw new Error(`Failed to fetch posters: ${res.statusText}`);
    const json = await res.json();
    if (json.data && Array.isArray(json.data) && json.data.length > 0) {
      return json.data;
    }
    return FALLBACK_POSTERS;
  } catch (error) {
    console.error('API fetchPosters falling back:', error);
    return FALLBACK_POSTERS;
  }
}

export async function updatePoster(posterData: Partial<Poster>): Promise<Poster> {
  const res = await fetch(`${API_BASE_URL}/posters/update`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(posterData),
  });
  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.message || 'Failed to update poster');
  }
  return json.data;
}

export async function createOrder(orderData: any): Promise<any> {
  const res = await fetch(`${API_BASE_URL}/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(orderData),
  });
  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.message || 'Failed to place order');
  }
  return json.data;
}

export async function fetchStats(): Promise<Stats> {
  try {
    const res = await fetch(`${API_BASE_URL}/products/stats`, { cache: 'no-store' });
    if (!res.ok) throw new Error(`Failed to fetch stats: ${res.statusText}`);
    const json = await res.json();
    return json.data || {
      totalProducts: 25,
      activePosters: 2,
      totalInventoryValue: 68500000,
      categoryCount: 6,
      categories: ["Dive Watches", "Dress Watches", "Chronograph", "Automatic", "Digital", "Sports Watches"],
      featuredCount: 10,
      promoCount: 25,
      totalStockUnits: 120,
    };
  } catch (error) {
    console.error('API fetchStats error:', error);
    return {
      totalProducts: 25,
      activePosters: 2,
      totalInventoryValue: 68500000,
      categoryCount: 6,
      categories: ["Dive Watches", "Dress Watches", "Chronograph", "Automatic", "Digital", "Sports Watches"],
      featuredCount: 10,
      promoCount: 25,
      totalStockUnits: 120,
    };
  }
}

// ─── Auth Types & API ─────────────────────────────────────────────────────────

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  status?: string;
  created_at?: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  token?: string;
  user?: AuthUser;
}

function getToken(): string | null {
  try { return localStorage.getItem('krono_token'); } catch { return null; }
}

function authHeaders(): HeadersInit {
  const token = getToken();
  return token ? { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` } : { 'Content-Type': 'application/json' };
}

export async function apiRegister(data: { name: string; email: string; password: string; confirmPassword: string }): Promise<AuthResponse> {
  const res = await fetch(`${API_BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function apiLogin(data: { email: string; password: string }): Promise<AuthResponse> {
  const res = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function apiGetProfile(): Promise<AuthResponse> {
  const res = await fetch(`${API_BASE_URL}/auth/profile`, { headers: authHeaders() });
  return res.json();
}

export async function apiUpdateProfile(data: { name?: string; phone?: string; address?: string }): Promise<AuthResponse> {
  const res = await fetch(`${API_BASE_URL}/auth/profile`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function apiChangePassword(data: { currentPassword: string; newPassword: string; confirmNewPassword: string }): Promise<AuthResponse> {
  const res = await fetch(`${API_BASE_URL}/auth/change-password`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
  return res.json();
}

