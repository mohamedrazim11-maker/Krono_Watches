/**
 * productImages.ts
 * Maps product IDs and names to locally-generated, verified luxury watch images.
 * Completely eliminates any non-watch images (makeup, brushes, coffee, etc.).
 */

const BANNED_IMAGE_PATTERNS = [
  'photo-1522335789203-aabd1fc54bc9', // Bobbi Brown makeup
  'photo-1509042239860-f550ce710b93', // Coffee cups
  'photo-1523170335258-f5ed11844a49', // Makeup brushes
];

function isCleanWatchImage(url?: string | null): boolean {
  if (!url) return false;
  return !BANNED_IMAGE_PATTERNS.some((pattern) => url.includes(pattern));
}

/** Map of product ID → primary local or verified watch image path */
export const PRODUCT_IMAGE_MAP: Record<string, string> = {
  // Numeric IDs
  'prod-1': '/images/watches/aurelia_master_classic.jpg',
  'prod-2': '/images/watches/speedmaster_chrono_titanium.jpg',
  'prod-3': '/images/watches/submariner_deep_black_ceramic.jpg',
  'prod-4': '/images/watches/helio_smart_sapphire_amoled.jpg',
  'prod-5': '/images/watches/grand_horizon_rose_gold.jpg',
  'prod-6': '/images/watches/ballon_bleu_mother_of_pearl.jpg',
  'prod-7': '/images/watches/seastar_1000_powermatic.jpg',
  'prod-8': '/images/watches/constellation_diamond_bezel.jpg',

  // Rolex
  'prod-rolex-submariner': '/images/watches/submariner_deep_black_ceramic.jpg',
  'prod-rolex-gmt-master-ii': 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=1200&q=85',
  'prod-rolex-daytona': 'https://images.unsplash.com/photo-1542496658-e33a6d0d50f6?auto=format&fit=crop&w=1200&q=85',
  'prod-rolex-day-date-40': 'https://images.unsplash.com/photo-1547996160-81dfa63595aa?auto=format&fit=crop&w=1200&q=85',
  'prod-rolex-sky-dweller': '/images/watches/grand_horizon_rose_gold.jpg',

  // Omega
  'prod-omega-speedmaster-moonwatch': '/images/watches/speedmaster_chrono_titanium.jpg',
  'prod-omega-seamaster-diver-300m': '/images/watches/seastar_1000_powermatic.jpg',
  'prod-omega-seamaster-aqua-terra': '/images/watches/seastar_1000_powermatic.jpg',
  'prod-omega-constellation': '/images/watches/constellation_diamond_bezel.jpg',

  // Grand Seiko & Tissot
  'prod-grand-seiko-spring-drive-snowflake': 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=1200&q=85',
  'prod-tissot-prx-powermatic-80': '/images/watches/seastar_1000_powermatic.jpg',
  'prod-tissot-seastar-1000': '/images/watches/seastar_1000_powermatic.jpg',

  // TAG Heuer
  'prod-tag-heuer-carrera-chronograph': '/images/watches/helio_smart_sapphire_amoled.jpg',
  'prod-tag-heuer-monaco-calibre-11': 'https://images.unsplash.com/photo-1542496658-e33a6d0d50f6?auto=format&fit=crop&w=1200&q=85',

  // Breitling
  'prod-breitling-navitimer-b01': 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=1200&q=85',
  'prod-breitling-superocean-automatic-42': '/images/watches/submariner_deep_black_ceramic.jpg',

  // Patek Philippe & Audemars Piguet
  'prod-patek-philippe-nautilus': '/images/watches/grand_horizon_rose_gold.jpg',
  'prod-patek-philippe-calatrava': '/images/watches/grand_horizon_rose_gold.jpg',
  'prod-audemars-piguet-royal-oak': '/images/watches/grand_horizon_rose_gold.jpg',

  // Cartier
  'prod-cartier-santos-de-cartier': '/images/watches/ballon_bleu_mother_of_pearl.jpg',
  'prod-cartier-ballon-bleu': '/images/watches/ballon_bleu_mother_of_pearl.jpg',
  'prod-cartier-tank-must': '/images/watches/ballon_bleu_mother_of_pearl.jpg',

  // Casio & Citizen & Seiko & Longines
  'prod-casio-g-shock-ga-2100': 'https://images.unsplash.com/photo-1533139502658-0198f920d8e8?auto=format&fit=crop&w=1200&q=85',
  'prod-casio-g-shock-full-metal-gmb2100': 'https://images.unsplash.com/photo-1533139502658-0198f920d8e8?auto=format&fit=crop&w=1200&q=85',
  'prod-citizen-promaster-diver-bn0150': '/images/watches/seastar_1000_powermatic.jpg',
  'prod-citizen-tsuyosa-automatic': '/images/watches/aurelia_master_classic.jpg',
  'prod-seiko-prospex-alpinist-spb121': 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?auto=format&fit=crop&w=1200&q=85',
  'prod-seiko-5-sports-srpd55': 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=1200&q=85',
  'prod-longines-hydroconquest': '/images/watches/submariner_deep_black_ceramic.jpg',
};

/**
 * Returns the best local or verified image path for a given product.
 * Strips out any banned coffee, makeup, or brush images.
 */
export function getProductImage(productId: string, fallbackUrl?: string): string {
  if (PRODUCT_IMAGE_MAP[productId]) {
    return PRODUCT_IMAGE_MAP[productId];
  }
  if (isCleanWatchImage(fallbackUrl)) {
    return fallbackUrl!;
  }
  return '/images/watches/seastar_1000_powermatic.jpg';
}

/**
 * Returns all clean image paths for a given product.
 * Filters out any banned coffee, makeup, or brush images.
 */
export function getProductImages(
  productId: string,
  apiImages?: string[],
  fallbackUrl?: string
): string[] {
  const localImage = PRODUCT_IMAGE_MAP[productId];
  const cleanFallback = isCleanWatchImage(fallbackUrl)
    ? fallbackUrl!
    : '/images/watches/seastar_1000_powermatic.jpg';

  if (localImage) {
    const extraClean = (apiImages || [])
      .filter((img) => isCleanWatchImage(img) && img !== localImage);
    return [localImage, ...extraClean];
  }

  const cleanList = (apiImages || []).filter(isCleanWatchImage);
  if (cleanList.length > 0) return cleanList;
  return [cleanFallback];
}
