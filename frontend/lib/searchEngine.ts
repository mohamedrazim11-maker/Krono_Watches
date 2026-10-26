import { Product } from "./api";

// Levenshtein edit distance algorithm for typo tolerance
export function levenshteinDistance(a: string, b: string): number {
  const s1 = a.toLowerCase();
  const s2 = b.toLowerCase();
  const m = s1.length;
  const n = s2.length;

  if (m === 0) return n;
  if (n === 0) return m;

  const d: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));

  for (let i = 0; i <= m; i++) d[i][0] = i;
  for (let j = 0; j <= n; j++) d[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = s1[i - 1] === s2[j - 1] ? 0 : 1;
      d[i][j] = Math.min(
        d[i - 1][j] + 1, // deletion
        d[i][j - 1] + 1, // insertion
        d[i - 1][j - 1] + cost // substitution
      );
    }
  }

  return d[m][n];
}

// Check if token fuzzy matches target word with typo tolerance
export function isFuzzyMatch(queryToken: string, targetWord: string): { matched: boolean; score: number } {
  const q = queryToken.toLowerCase();
  const t = targetWord.toLowerCase();

  // Exact match
  if (t === q) return { matched: true, score: 1.0 };
  // Prefix match
  if (t.startsWith(q)) return { matched: true, score: 0.9 };
  // Substring match
  if (t.includes(q)) return { matched: true, score: 0.8 };

  // Typo tolerance based on length
  const maxDistance = q.length <= 3 ? 1 : q.length <= 6 ? 2 : 3;
  const dist = levenshteinDistance(q, t);

  if (dist <= maxDistance) {
    const score = Math.max(0.4, 1.0 - dist * 0.25);
    return { matched: true, score };
  }

  return { matched: false, score: 0 };
}

// Common watch brand, horology, and e-commerce dictionary for typo correction ("Did you mean?")
const WATCH_DICTIONARY = [
  "Rolex",
  "Omega",
  "Patek Philippe",
  "Audemars Piguet",
  "Tissot",
  "Casio",
  "G-Shock",
  "Krono Swiss",
  "TAG Heuer",
  "Breitling",
  "Cartier",
  "Seiko",
  "Grand Seiko",
  "Citizen",
  "Longines",
  "Submariner",
  "Speedmaster",
  "Seamaster",
  "Aquaracer",
  "Navitimer",
  "Chronograph",
  "Chronometer",
  "Automatic",
  "Titanium",
  "Ceramic",
  "Diver",
  "Nautilus",
  "Royal Oak",
  "Daytona",
  "Mechanical",
  "Tourbillon",
  "Leather",
  "Sneakers",
];

// Find closest typo correction suggestion (supports whole string or individual token corrections)
export function getTypoSuggestion(query: string): string | null {
  const clean = query.trim().toLowerCase();
  if (clean.length < 3) return null;

  // 1. Direct single match against dictionary
  let closest: string | null = null;
  let minDistance = 999;

  for (const word of WATCH_DICTIONARY) {
    const w = word.toLowerCase();
    if (w === clean) return null; // already exact match
    const dist = levenshteinDistance(clean, w);
    const maxAllowed = clean.length <= 4 ? 1 : clean.length <= 8 ? 2 : 3;

    if (dist <= maxAllowed && dist < minDistance) {
      minDistance = dist;
      closest = word;
    }
  }

  if (closest) return closest;

  // 2. Multi-word token correction check (e.g. "omga watch" -> "Omega watch")
  const tokens = clean.split(/\s+/);
  if (tokens.length > 1) {
    let hasCorrection = false;
    const corrected = tokens.map((t) => {
      if (t.length < 3) return t;
      let tokenClosest: string | null = null;
      let tokenMinDist = 999;
      for (const word of WATCH_DICTIONARY) {
        const w = word.toLowerCase();
        if (w === t) return t;
        const dist = levenshteinDistance(t, w);
        const maxAllowed = t.length <= 4 ? 1 : 2;
        if (dist <= maxAllowed && dist < tokenMinDist) {
          tokenMinDist = dist;
          tokenClosest = word;
        }
      }
      if (tokenClosest) {
        hasCorrection = true;
        return tokenClosest;
      }
      return t;
    });

    if (hasCorrection) {
      return corrected.join(" ");
    }
  }

  return null;
}

export interface SearchResultItem {
  product: Product;
  relevanceScore: number;
  matchedFields: string[];
}

export interface SearchEngineResponse {
  results: Product[];
  totalMatches: number;
  autocompleteSuggestions: string[];
  matchedCategories: string[];
  didYouMean: string | null;
  hasTypoCorrection: boolean;
  alternativeRecommendations: Product[];
}

// Comprehensive search engine with Autocomplete, Typo Tolerance, Relevance Ranking & No-Results Handling
export function executeSearch(
  products: Product[],
  query: string,
  categories: { id: string; name: string }[] = []
): SearchEngineResponse {
  const rawQ = query.trim();
  if (!rawQ) {
    return {
      results: products,
      totalMatches: products.length,
      autocompleteSuggestions: [],
      matchedCategories: [],
      didYouMean: null,
      hasTypoCorrection: false,
      alternativeRecommendations: [],
    };
  }

  const queryTokens = rawQ.toLowerCase().split(/\s+/).filter(Boolean);
  const scoredItems: SearchResultItem[] = [];

  for (const product of products) {
    let score = 0;
    const matchedFields: string[] = [];

    const name = product.name || "";
    const brand = product.brand || "";
    const category = product.category || "";
    const movement = product.movement || "";
    const desc = product.description || "";

    const nameTokens = name.toLowerCase().split(/\s+/);
    const brandTokens = brand.toLowerCase().split(/\s+/);
    const catTokens = category.toLowerCase().split(/\s+/);

    // 1. Exact Full Phrase Match
    if (name.toLowerCase().includes(rawQ.toLowerCase())) {
      score += 120;
      matchedFields.push("name");
    } else if (brand.toLowerCase().includes(rawQ.toLowerCase())) {
      score += 90;
      matchedFields.push("brand");
    }

    // 2. Token-by-Token Match with Typo Tolerance
    let tokensMatched = 0;
    for (const qToken of queryTokens) {
      let tokenBestScore = 0;

      // Check name tokens
      for (const nToken of nameTokens) {
        const fuzzy = isFuzzyMatch(qToken, nToken);
        if (fuzzy.matched && fuzzy.score * 60 > tokenBestScore) {
          tokenBestScore = fuzzy.score * 60;
          if (!matchedFields.includes("name")) matchedFields.push("name");
        }
      }

      // Check brand tokens
      for (const bToken of brandTokens) {
        const fuzzy = isFuzzyMatch(qToken, bToken);
        if (fuzzy.matched && fuzzy.score * 50 > tokenBestScore) {
          tokenBestScore = fuzzy.score * 50;
          if (!matchedFields.includes("brand")) matchedFields.push("brand");
        }
      }

      // Check category tokens
      for (const cToken of catTokens) {
        const fuzzy = isFuzzyMatch(qToken, cToken);
        if (fuzzy.matched && fuzzy.score * 40 > tokenBestScore) {
          tokenBestScore = fuzzy.score * 40;
          if (!matchedFields.includes("category")) matchedFields.push("category");
        }
      }

      // Check description
      if (desc.toLowerCase().includes(qToken)) {
        tokenBestScore = Math.max(tokenBestScore, 20);
        if (!matchedFields.includes("description")) matchedFields.push("description");
      }

      if (tokenBestScore > 0) {
        tokensMatched++;
        score += tokenBestScore;
      }
    }

    // Match coverage multiplier: items matching all search words get heavily prioritized
    if (tokensMatched === queryTokens.length) {
      score *= 1.4;
    }

    // 3. Relevance Ranking Boosts:
    // Boost for in-stock availability
    if (product.in_stock && (product.stock_qty ?? product.stock_count ?? 1) > 0) {
      score += 25;
    }

    // Boost for featured timepieces
    if (product.is_featured) {
      score += 15;
    }

    // Boost for promotional/bestsellers
    if (product.badge || product.is_on_promotion) {
      score += 10;
    }

    if (score > 15) {
      scoredItems.push({ product, relevanceScore: score, matchedFields });
    }
  }

  // Sort by highest relevance score first
  scoredItems.sort((a, b) => b.relevanceScore - a.relevanceScore);
  const results = scoredItems.map((item) => item.product);

  // Autocomplete Suggestions (top matching product names and category keywords)
  const autocompleteSet = new Set<string>();
  for (const res of results.slice(0, 5)) {
    autocompleteSet.add(res.name);
  }
  for (const cat of categories) {
    if (cat.name.toLowerCase().includes(rawQ.toLowerCase()) || queryTokens.some((t) => isFuzzyMatch(t, cat.name).matched)) {
      autocompleteSet.add(`${cat.name} Watches`);
    }
  }

  // Matching categories
  const matchedCategories = categories
    .filter((c) => c.name.toLowerCase().includes(rawQ.toLowerCase()) || queryTokens.some((t) => isFuzzyMatch(t, c.name).matched))
    .map((c) => c.name);

  // Typo Tolerance / Did You Mean
  const didYouMean = getTypoSuggestion(rawQ);
  const hasTypoCorrection = Boolean(didYouMean && didYouMean.toLowerCase() !== rawQ.toLowerCase());

  // No-Results Handling: Closest alternative recommendations
  const alternativeRecommendations = results.length === 0
    ? products.filter((p) => p.is_featured || p.in_stock).slice(0, 3)
    : [];

  return {
    results,
    totalMatches: results.length,
    autocompleteSuggestions: Array.from(autocompleteSet).slice(0, 6),
    matchedCategories,
    didYouMean,
    hasTypoCorrection,
    alternativeRecommendations,
  };
}
