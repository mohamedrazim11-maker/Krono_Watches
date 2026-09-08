"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { fetchProducts, fetchCategories, Product, Category } from "@/lib/api";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import CartDrawer, { CartItem } from "@/components/CartDrawer";
import WishlistDrawer from "@/components/WishlistDrawer";
import QuickViewModal from "@/components/QuickViewModal";
import CheckoutModal from "@/components/CheckoutModal";

type ViewMode = "grid" | "list";

const MOVEMENTS = ["All", "Swiss Automatic", "Automatic ETA", "Quartz", "Manual-Wind", "Biometric"];
const CASE_SIZES = ["All", "36mm", "38mm", "39mm", "40mm", "41mm", "42mm", "44mm", "45mm"];
const PRESTIGE_BRANDS = [
  "All",
  "Rolex",
  "Omega",
  "Patek Philippe",
  "Audemars Piguet",
  "TAG Heuer"
];

export default function CatalogPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter States
  const [selectedBrand, setSelectedBrand] = useState("All");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedSize, setSelectedSize] = useState("All");
  const [selectedMovement, setSelectedMovement] = useState("All");
  const [onlyInStock, setOnlyInStock] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [maxPriceRange, setMaxPriceRange] = useState<number>(2000000);

  // Sorting & View
  const [sortBy, setSortBy] = useState<"featured" | "price-asc" | "price-desc" | "name">("featured");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modals & Drawers
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  // Cart & Wishlist
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<Product[]>([]);

  // Promo Code
  const [appliedCoupon, setAppliedCoupon] = useState("MONO20");
  const [couponDiscountPercent, setCouponDiscountPercent] = useState(20);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [prodData, catData] = await Promise.all([fetchProducts(), fetchCategories()]);
        setProducts(prodData || []);
        setCategories(catData || []);
      } catch (err) {
        console.error("Failed to load catalog:", err);
      } finally {
        setLoading(false);
      }

      try {
        const savedWishlist = localStorage.getItem("krono_wishlist");
        if (savedWishlist) setWishlist(JSON.parse(savedWishlist));
        const savedCart = localStorage.getItem("krono_cart");
        if (savedCart) setCart(JSON.parse(savedCart));
      } catch {}
    }
    loadData();
  }, []);

  const handleAddToCart = (product: Product, quantity = 1) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id ? { ...item, quantity: item.quantity + quantity } : item
        );
      }
      return [...prev, { product, quantity }];
    });
    showToast(`Added ${product.name} to vault bag`);
  };

  const handleToggleWishlist = (product: Product) => {
    setWishlist((prev) => {
      const exists = prev.some((p) => p.id === product.id);
      if (exists) {
        showToast("Removed from wishlist");
        return prev.filter((p) => p.id !== product.id);
      } else {
        showToast(`Saved to wishlist`);
        return [...prev, product];
      }
    });
  };

  const handleApplyCoupon = (code: string) => {
    if (code.toUpperCase() === "MONO20" || code.toUpperCase() === "ROYAL20") {
      setAppliedCoupon("MONO20");
      setCouponDiscountPercent(20);
      showToast("Privilege voucher applied: 20% off");
      return true;
    }
    return false;
  };

  const formatCurrency = (amount: number) => {
    return `LKR ${Number(amount || 0).toLocaleString("en-US")}`;
  };

  const resetFilters = () => {
    setSelectedBrand("All");
    setSelectedCategory("All");
    setSelectedSize("All");
    setSelectedMovement("All");
    setOnlyInStock(false);
    setSearchQuery("");
    setMaxPriceRange(2000000);
    setSortBy("featured");
  };

  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        if (selectedBrand !== "All") {
          const matchBrand = p.brand?.toLowerCase() === selectedBrand.toLowerCase();
          if (!matchBrand) return false;
        }

        if (selectedCategory !== "All") {
          const matchCat = p.category?.toLowerCase() === selectedCategory.toLowerCase();
          if (!matchCat) return false;
        }

        if (selectedSize !== "All") {
          if (p.case_size && !p.case_size.includes(selectedSize)) return false;
        }

        if (selectedMovement !== "All") {
          if (p.movement && !p.movement.toLowerCase().includes(selectedMovement.toLowerCase()))
            return false;
        }

        if (p.price > maxPriceRange) return false;

        if (onlyInStock && p.in_stock === false) return false;

        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchName = p.name?.toLowerCase().includes(q);
          const matchBrand = p.brand?.toLowerCase().includes(q);
          const matchDesc = p.description?.toLowerCase().includes(q);
          const matchMove = p.movement?.toLowerCase().includes(q);
          if (!matchName && !matchBrand && !matchDesc && !matchMove) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === "price-asc") return a.price - b.price;
        if (sortBy === "price-desc") return b.price - a.price;
        if (sortBy === "name") return a.name.localeCompare(b.name);
        return (b.is_featured ? 1 : 0) - (a.is_featured ? 1 : 0);
      });
  }, [
    products,
    selectedBrand,
    selectedCategory,
    selectedSize,
    selectedMovement,
    maxPriceRange,
    onlyInStock,
    searchQuery,
    sortBy,
  ]);

  const totalCartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const activeFiltersCount = [
    selectedBrand !== "All",
    selectedCategory !== "All",
    selectedSize !== "All",
    selectedMovement !== "All",
    onlyInStock,
    searchQuery.trim() !== "",
    maxPriceRange < 2000000,
  ].filter(Boolean).length;

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F9FB] dark:bg-[#0B0F17] text-slate-900 dark:text-slate-100 selection:bg-slate-900 selection:text-white transition-colors duration-200">
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 dark:bg-slate-800 border border-slate-700 dark:border-slate-600 text-white px-4 py-2.5 rounded-xl shadow-2xl text-xs font-mono font-bold flex items-center gap-2">
          <span className="text-emerald-400">▪</span>
          <span>{toastMessage}</span>
        </div>
      )}

      <Navbar
        cartCount={totalCartCount}
        wishlistCount={wishlist.length}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenWishlist={() => setIsWishlistOpen(true)}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        showSearch={true}
      />

      <main className="flex-1 mx-auto max-w-7xl w-full px-4 sm:px-6 py-5 sm:py-6 space-y-5">
        {/* Editorial Vault Header */}
        <div className="rounded-2xl sm:rounded-3xl border border-slate-200/80 dark:border-slate-800 p-5 sm:p-7 bg-white dark:bg-[#131B2A] shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1.5 min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-slate-500 dark:text-slate-400 font-bold bg-slate-100 dark:bg-slate-900 px-3 py-1 rounded-full border border-slate-200 dark:border-slate-800">
                Official Watch Registry
              </span>
              {selectedBrand !== "All" && (
                <span className="text-[10px] font-mono uppercase tracking-wider text-amber-600 dark:text-amber-400 font-bold bg-amber-500/10 border border-amber-500/20 px-2.5 py-0.5 rounded-full flex items-center gap-1.5">
                  <span>Filtered:</span>
                  <strong className="text-amber-700 dark:text-amber-300">{selectedBrand}</strong>
                  <button onClick={() => setSelectedBrand("All")} className="hover:text-amber-900 dark:hover:text-white ml-0.5 font-bold">×</button>
                </span>
              )}
            </div>
            <h1 className="text-xl sm:text-3xl font-black font-display text-slate-900 dark:text-white tracking-tight uppercase">
              Vault <span className="text-slate-900 dark:text-white underline decoration-slate-300 dark:decoration-slate-700 decoration-2">Catalogue</span>
            </h1>
            <p className="text-xs text-slate-600 dark:text-slate-400 max-w-xl font-sans line-clamp-2 sm:line-clamp-none">
              Explore authentic calibres from the world&apos;s top 5 manufactures: Rolex, Omega, Patek Philippe, Audemars Piguet, and TAG Heuer.
            </p>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-between sm:justify-end flex-shrink-0">
            <button
              onClick={() => setIsMobileFilterOpen(true)}
              className="lg:hidden lux-btn-secondary px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 flex-1 sm:flex-initial justify-center"
            >
              <span>⚙ Filters</span>
              {activeFiltersCount > 0 && (
                <span className="bg-amber-500 text-slate-950 font-bold px-1.5 py-0.2 rounded-full text-[10px] font-mono">
                  {activeFiltersCount}
                </span>
              )}
            </button>
            <button
              onClick={resetFilters}
              className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white text-xs font-mono transition shadow-sm"
            >
              Reset All
            </button>
          </div>
        </div>

        {/* 5 Real Luxury Brands Quick Selector Bar */}
        <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 p-2.5 sm:p-3 bg-white dark:bg-[#131B2A] shadow-sm flex items-center gap-2 overflow-x-auto no-scrollbar">
          <span className="text-[10px] font-mono uppercase font-bold text-slate-400 dark:text-slate-500 whitespace-nowrap pl-1 pr-1.5 tracking-wider flex items-center gap-1.5 flex-shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
            Brand:
          </span>
          <div className="flex items-center gap-1.5 flex-nowrap sm:flex-wrap">
            {PRESTIGE_BRANDS.map((brand) => {
              const brandCount = brand === "All"
                ? products.length
                : products.filter((p) => p.brand?.toLowerCase() === brand.toLowerCase()).length;
              const isSelected = selectedBrand === brand;

              return (
                <button
                  key={brand}
                  onClick={() => setSelectedBrand(brand)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-mono whitespace-nowrap transition-all flex items-center gap-1.5 border flex-shrink-0 ${
                    isSelected
                      ? "bg-slate-900 dark:bg-white text-white dark:text-slate-950 font-bold border-slate-900 dark:border-white shadow-sm"
                      : "bg-slate-50 dark:bg-slate-900/60 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  <span>{brand === "All" ? "All Brands (5)" : brand}</span>
                  {brandCount > 0 && (
                    <span
                      className={`text-[9px] px-1.5 py-0.2 rounded-md font-mono ${
                        isSelected
                          ? "bg-white/20 dark:bg-black/20 text-white dark:text-slate-900"
                          : "bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400"
                      }`}
                    >
                      {brandCount}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Layout Grid (Desktop Sidebar + Main Content) */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-5 items-start">
          {/* Desktop Sidebar (Sticky, Hidden on Mobile/Tablet) */}
          <aside className="hidden lg:block space-y-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 bg-white dark:bg-[#131B2A] shadow-sm sticky top-28">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2.5">
              <h3 className="text-xs font-bold uppercase tracking-widest text-slate-900 dark:text-white font-mono">
                Filter Parameters
              </h3>
              <button onClick={resetFilters} className="text-[10px] text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-mono font-semibold">
                Clear All
              </button>
            </div>

            {/* 5 Real Brands Selection */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-[9px] text-slate-500 dark:text-slate-400 uppercase font-bold font-mono tracking-widest block">
                  Manufacture (5 Brands)
                </label>
                {selectedBrand !== "All" && (
                  <button
                    onClick={() => setSelectedBrand("All")}
                    className="text-[9px] text-amber-600 dark:text-amber-400 hover:underline font-mono font-bold"
                  >
                    Reset Brand
                  </button>
                )}
              </div>
              <div className="space-y-1">
                {PRESTIGE_BRANDS.map((brand) => {
                  const count = brand === "All"
                    ? products.length
                    : products.filter((p) => p.brand?.toLowerCase() === brand.toLowerCase()).length;
                  const isSelected = selectedBrand === brand;

                  return (
                    <button
                      key={brand}
                      onClick={() => setSelectedBrand(brand)}
                      className={`w-full text-left px-3 py-1.5 rounded-xl text-xs font-mono transition flex items-center justify-between border ${
                        isSelected
                          ? "bg-slate-900 dark:bg-white text-white dark:text-slate-950 font-bold border-transparent shadow-sm"
                          : "border-transparent text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900 hover:text-slate-900 dark:hover:text-white"
                      }`}
                    >
                      <span className="truncate pr-1">{brand === "All" ? "All 5 Brands" : brand}</span>
                      {count > 0 && (
                        <span
                          className={`text-[9px] px-1.5 py-0.5 rounded font-mono ${
                            isSelected
                              ? "bg-white/20 dark:bg-black/20 text-white dark:text-slate-900"
                              : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400"
                          }`}
                        >
                          {count}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Metier Category */}
            <div className="space-y-2 border-t border-slate-200 dark:border-slate-800 pt-3.5">
              <label className="text-[9px] text-slate-500 dark:text-slate-400 uppercase font-bold font-mono tracking-widest block">
                Metier Category
              </label>
              <div className="space-y-1">
                {["All", "Luxury", "Automatic", "Sport", "Smart"].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`w-full text-left px-3 py-1.5 rounded-xl text-xs font-mono transition flex items-center justify-between ${
                      selectedCategory === cat
                        ? "bg-slate-900 dark:bg-white text-white dark:text-slate-950 font-bold shadow-sm"
                        : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900 hover:text-slate-900 dark:hover:text-white"
                    }`}
                  >
                    <span>{cat === "All" ? "All Series" : cat}</span>
                    {selectedCategory === cat && <span>✓</span>}
                  </button>
                ))}
              </div>
            </div>

            {/* Price Range */}
            <div className="space-y-2 border-t border-slate-200 dark:border-slate-800 pt-3.5">
              <div className="flex justify-between text-[10px] font-mono font-bold">
                <span className="text-slate-500 dark:text-slate-400 uppercase tracking-widest">Max Valuation</span>
                <span className="text-slate-900 dark:text-white font-num">{formatCurrency(maxPriceRange)}</span>
              </div>
              <input
                type="range"
                min={100000}
                max={2000000}
                step={50000}
                value={maxPriceRange}
                onChange={(e) => setMaxPriceRange(Number(e.target.value))}
                className="w-full accent-slate-900 dark:accent-white h-1.5 bg-slate-200 dark:bg-slate-800 rounded cursor-pointer"
              />
            </div>

            {/* Movement */}
            <div className="space-y-2 border-t border-slate-200 dark:border-slate-800 pt-3.5">
              <label className="text-[9px] text-slate-500 dark:text-slate-400 uppercase font-bold font-mono tracking-widest block">
                Calibre Escapement
              </label>
              <select
                value={selectedMovement}
                onChange={(e) => setSelectedMovement(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-slate-800 dark:focus:border-slate-500 font-mono"
              >
                {MOVEMENTS.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>

            {/* Size */}
            <div className="space-y-2 border-t border-slate-200 dark:border-slate-800 pt-3.5">
              <label className="text-[9px] text-slate-500 dark:text-slate-400 uppercase font-bold font-mono tracking-widest block">
                Case Diameter
              </label>
              <select
                value={selectedSize}
                onChange={(e) => setSelectedSize(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-slate-800 dark:focus:border-slate-500 font-mono"
              >
                {CASE_SIZES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            {/* In Stock */}
            <div className="flex items-center justify-between border-t border-slate-200 dark:border-slate-800 pt-3.5">
              <span className="text-xs text-slate-700 dark:text-slate-300 font-mono font-semibold">In Vault Only</span>
              <input
                type="checkbox"
                checked={onlyInStock}
                onChange={(e) => setOnlyInStock(e.target.checked)}
                className="h-4 w-4 rounded accent-slate-900 dark:accent-white cursor-pointer"
              />
            </div>
          </aside>

          {/* Product Feed */}
          <div className="lg:col-span-3 space-y-4">
            {/* Top Toolbar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 sm:p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#131B2A] shadow-sm">
              <div className="text-xs text-slate-600 dark:text-slate-400 font-mono flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-start">
                <span>Displaying <strong className="text-slate-900 dark:text-white">{filteredProducts.length}</strong> references</span>
                {selectedBrand !== "All" && (
                  <span className="text-amber-600 dark:text-amber-400 font-semibold">• {selectedBrand}</span>
                )}
              </div>

              <div className="flex items-center gap-2.5 w-full sm:w-auto justify-between sm:justify-end">
                <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-0.5">
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`px-3 py-1 rounded-lg text-xs font-mono transition ${
                      viewMode === "grid" ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold shadow-sm" : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                    }`}
                  >
                    Grid
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    className={`px-3 py-1 rounded-lg text-xs font-mono transition ${
                      viewMode === "list" ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold shadow-sm" : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                    }`}
                  >
                    List
                  </button>
                </div>

                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-slate-800 dark:focus:border-slate-500 font-mono"
                >
                  <option value="featured">Featured First</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="name">Reference (A-Z)</option>
                </select>
              </div>
            </div>

            {/* Grid / List Results (Fully Responsive) */}
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6 py-8">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="rounded-2xl border border-slate-200 dark:border-slate-800 p-4 space-y-4 animate-pulse bg-white dark:bg-[#131B2A]">
                    <div className="aspect-square bg-slate-100 dark:bg-slate-800 rounded-xl"></div>
                    <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded w-3/4"></div>
                  </div>
                ))}
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-16 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3 bg-white dark:bg-[#131B2A] shadow-sm px-4">
                <div className="text-3xl text-slate-300 dark:text-slate-600">⌕</div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white uppercase font-display">No References Located</h3>
                <p className="text-xs text-slate-500 font-mono">Try adjusting your brand selection or price range filter.</p>
                <button onClick={resetFilters} className="lux-btn-primary px-6 py-2 rounded-xl text-xs uppercase">
                  Reset All Filters
                </button>
              </div>
            ) : viewMode === "grid" ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
                {filteredProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onAddToCart={(prod) => handleAddToCart(prod, 1)}
                    onToggleWishlist={handleToggleWishlist}
                    isWishlisted={wishlist.some((p) => p.id === product.id)}
                    onQuickView={(prod) => setQuickViewProduct(prod)}
                  />
                ))}
              </div>
            ) : (
              /* List Mode */
              <div className="space-y-3">
                {filteredProducts.map((product) => (
                  <div
                    key={product.id}
                    className="rounded-2xl border border-slate-200/80 dark:border-slate-800 p-3.5 sm:p-4 flex flex-col sm:flex-row items-center gap-4 bg-white dark:bg-[#131B2A] hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-md transition duration-300 shadow-sm"
                  >
                    <Link
                      href={`/products/${product.id}`}
                      className="h-28 w-28 sm:h-24 sm:w-24 rounded-xl bg-slate-100 dark:bg-slate-900 flex-shrink-0 block overflow-hidden border border-slate-200 dark:border-slate-800 shadow-inner group/thumb"
                    >
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover/thumb:scale-105 transition-transform duration-300"
                        loading="lazy"
                        decoding="async"
                      />
                    </Link>

                    <div className="flex-1 min-w-0 space-y-1 text-center sm:text-left w-full">
                      <div className="flex items-center justify-center sm:justify-start gap-2">
                        {product.brand && (
                          <span className="text-[9px] uppercase tracking-widest text-amber-600 dark:text-amber-400 font-mono font-bold">
                            {product.brand}
                          </span>
                        )}
                        <span className="text-[9px] uppercase tracking-widest text-slate-500 dark:text-slate-400 font-mono">
                          • {product.category}
                        </span>
                        {product.badge && (
                          <span className="text-[8px] px-2 py-0.5 rounded bg-slate-900 dark:bg-white text-white dark:text-slate-950 font-bold font-mono uppercase">
                            {product.badge}
                          </span>
                        )}
                      </div>
                      <Link
                        href={`/products/${product.id}`}
                        className="text-sm font-bold text-slate-900 dark:text-white hover:text-slate-600 dark:hover:text-slate-300 transition block font-display tracking-tight"
                      >
                        {product.name}
                      </Link>
                      <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 text-[10px] text-slate-500 dark:text-slate-400 font-mono pt-0.5">
                        {product.movement && <span>{product.movement}</span>}
                        {product.case_size && <span>• {product.case_size}</span>}
                        {product.water_resistance && <span>• {product.water_resistance}</span>}
                      </div>
                    </div>

                    <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-center w-full sm:w-auto gap-3 flex-shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800">
                      <div className="text-left sm:text-right">
                        <div className="text-sm sm:text-base font-black text-slate-900 dark:text-white font-num">
                          {formatCurrency(product.price)}
                        </div>
                        {product.old_price && (
                          <div className="text-xs text-slate-400 dark:text-slate-500 line-through font-num">
                            {formatCurrency(product.old_price)}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => setQuickViewProduct(product)}
                          className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white shadow-sm"
                          title="Quick View"
                        >
                          👁
                        </button>
                        <button
                          onClick={() => handleToggleWishlist(product)}
                          className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white shadow-sm"
                          title="Wishlist"
                        >
                          ♡
                        </button>
                        <button
                          onClick={() => handleAddToCart(product)}
                          className="lux-btn-primary px-3.5 py-1.5 rounded-xl text-xs uppercase font-extrabold shadow-sm"
                        >
                          Acquire
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />

      {/* Mobile Slide-Over Filter Drawer */}
      {isMobileFilterOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <div
            onClick={() => setIsMobileFilterOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
          />

          {/* Drawer Panel */}
          <div className="fixed inset-y-0 right-0 max-w-full flex">
            <div className="w-screen max-w-sm bg-white dark:bg-[#131B2A] shadow-2xl flex flex-col justify-between border-l border-slate-200 dark:border-slate-800">
              {/* Drawer Header */}
              <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-widest text-slate-900 dark:text-white font-mono">
                    Filter Parameters
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                    {filteredProducts.length} matching watches found
                  </p>
                </div>
                <button
                  onClick={() => setIsMobileFilterOpen(false)}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 text-sm font-bold"
                >
                  ✕
                </button>
              </div>

              {/* Drawer Scrollable Content */}
              <div className="p-4 sm:p-5 space-y-5 overflow-y-auto flex-1">
                {/* 5 Real Brands Selection */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-[9px] text-slate-500 dark:text-slate-400 uppercase font-bold font-mono tracking-widest block">
                      Manufacture (5 Brands)
                    </label>
                    {selectedBrand !== "All" && (
                      <button
                        onClick={() => setSelectedBrand("All")}
                        className="text-[9px] text-amber-600 dark:text-amber-400 hover:underline font-mono font-bold"
                      >
                        Reset Brand
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-1.5">
                    {PRESTIGE_BRANDS.map((brand) => {
                      const count = brand === "All"
                        ? products.length
                        : products.filter((p) => p.brand?.toLowerCase() === brand.toLowerCase()).length;
                      const isSelected = selectedBrand === brand;

                      return (
                        <button
                          key={brand}
                          onClick={() => setSelectedBrand(brand)}
                          className={`text-left px-2.5 py-2 rounded-xl text-xs font-mono transition flex items-center justify-between border ${
                            isSelected
                              ? "bg-slate-900 dark:bg-white text-white dark:text-slate-950 font-bold border-transparent shadow-sm"
                              : "border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900 hover:text-slate-900 dark:hover:text-white"
                          }`}
                        >
                          <span className="truncate pr-1">{brand === "All" ? "All 5" : brand}</span>
                          {count > 0 && (
                            <span
                              className={`text-[9px] px-1.5 py-0.2 rounded font-mono ${
                                isSelected
                                  ? "bg-white/20 dark:bg-black/20 text-white dark:text-slate-900"
                                  : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400"
                              }`}
                            >
                              {count}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Metier Category */}
                <div className="space-y-2 border-t border-slate-200 dark:border-slate-800 pt-4">
                  <label className="text-[9px] text-slate-500 dark:text-slate-400 uppercase font-bold font-mono tracking-widest block">
                    Metier Category
                  </label>
                  <div className="grid grid-cols-2 gap-1.5">
                    {["All", "Luxury", "Automatic", "Sport", "Smart"].map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setSelectedCategory(cat)}
                        className={`text-left px-3 py-2 rounded-xl text-xs font-mono transition flex items-center justify-between border ${
                          selectedCategory === cat
                            ? "bg-slate-900 dark:bg-white text-white dark:text-slate-950 font-bold border-transparent shadow-sm"
                            : "border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900 hover:text-slate-900 dark:hover:text-white"
                        }`}
                      >
                        <span>{cat === "All" ? "All Series" : cat}</span>
                        {selectedCategory === cat && <span>✓</span>}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Price Range */}
                <div className="space-y-2 border-t border-slate-200 dark:border-slate-800 pt-4">
                  <div className="flex justify-between text-[10px] font-mono font-bold">
                    <span className="text-slate-500 dark:text-slate-400 uppercase tracking-widest">Max Valuation</span>
                    <span className="text-slate-900 dark:text-white font-num">{formatCurrency(maxPriceRange)}</span>
                  </div>
                  <input
                    type="range"
                    min={100000}
                    max={2000000}
                    step={50000}
                    value={maxPriceRange}
                    onChange={(e) => setMaxPriceRange(Number(e.target.value))}
                    className="w-full accent-slate-900 dark:accent-white h-2 bg-slate-200 dark:bg-slate-800 rounded cursor-pointer"
                  />
                </div>

                {/* Movement */}
                <div className="space-y-2 border-t border-slate-200 dark:border-slate-800 pt-4">
                  <label className="text-[9px] text-slate-500 dark:text-slate-400 uppercase font-bold font-mono tracking-widest block">
                    Calibre Escapement
                  </label>
                  <select
                    value={selectedMovement}
                    onChange={(e) => setSelectedMovement(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none font-mono"
                  >
                    {MOVEMENTS.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Size */}
                <div className="space-y-2 border-t border-slate-200 dark:border-slate-800 pt-4">
                  <label className="text-[9px] text-slate-500 dark:text-slate-400 uppercase font-bold font-mono tracking-widest block">
                    Case Diameter
                  </label>
                  <select
                    value={selectedSize}
                    onChange={(e) => setSelectedSize(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none font-mono"
                  >
                    {CASE_SIZES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>

                {/* In Stock */}
                <div className="flex items-center justify-between border-t border-slate-200 dark:border-slate-800 pt-4">
                  <span className="text-xs text-slate-700 dark:text-slate-300 font-mono font-semibold">In Vault Only</span>
                  <input
                    type="checkbox"
                    checked={onlyInStock}
                    onChange={(e) => setOnlyInStock(e.target.checked)}
                    className="h-5 w-5 rounded accent-slate-900 dark:accent-white cursor-pointer"
                  />
                </div>
              </div>

              {/* Drawer Footer Actions */}
              <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex items-center gap-2.5">
                <button
                  onClick={resetFilters}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-mono font-bold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition"
                >
                  Reset
                </button>
                <button
                  onClick={() => setIsMobileFilterOpen(false)}
                  className="flex-1 lux-btn-primary py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider text-center"
                >
                  Show {filteredProducts.length} Results
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Drawers & Modals */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        onUpdateQuantity={(id, delta) => {
          setCart((prev) =>
            prev
              .map((item) => (item.product.id === id ? { ...item, quantity: item.quantity + delta } : item))
              .filter((i) => i.quantity > 0)
          );
        }}
        onRemoveItem={(id) => setCart((prev) => prev.filter((i) => i.product.id !== id))}
        onClearCart={() => setCart([])}
        onProceedToCheckout={() => setIsCheckoutOpen(true)}
        appliedCoupon={appliedCoupon}
        onApplyCoupon={handleApplyCoupon}
        couponDiscountPercent={couponDiscountPercent}
      />

      <WishlistDrawer
        isOpen={isWishlistOpen}
        onClose={() => setIsWishlistOpen(false)}
        wishlist={wishlist}
        onRemoveFromWishlist={(id) => setWishlist((prev) => prev.filter((p) => p.id !== id))}
        onMoveToCart={(prod) => {
          handleAddToCart(prod);
          setWishlist((prev) => prev.filter((p) => p.id !== prod.id));
          setIsCartOpen(true);
        }}
      />

      <QuickViewModal
        product={quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
        onAddToCart={handleAddToCart}
      />

      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        cart={cart}
        onOrderSuccess={() => {
          setCart([]);
          localStorage.removeItem("krono_cart");
        }}
        appliedCoupon={appliedCoupon}
        couponDiscountPercent={couponDiscountPercent}
      />
    </div>
  );
}
