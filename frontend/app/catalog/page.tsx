"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { fetchProducts, fetchCategories, Product, Category } from "@/lib/api";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import SmoothImage from "@/components/SmoothImage";
import CartDrawer from "@/components/CartDrawer";
import WishlistDrawer from "@/components/WishlistDrawer";
import QuickViewModal from "@/components/QuickViewModal";
import CheckoutModal from "@/components/CheckoutModal";
import { useCart } from "@/lib/CartContext";

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

  // Quick View Modal
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);

  // Global Cart Context
  const {
    cart,
    wishlist,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    toggleWishlist,
    isCartOpen,
    setIsCartOpen,
    isWishlistOpen,
    setIsWishlistOpen,
    isCheckoutOpen,
    setIsCheckoutOpen,
    appliedCoupon,
    couponDiscountPercent,
    applyCoupon,
    grandTotal,
    toastMessage,
  } = useCart();

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
    }
    loadData();
  }, []);

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
    <div className="min-h-screen flex flex-col bg-[#FAF8F5] dark:bg-[#080B10] text-[#121826] dark:text-[#F8FAFC] selection:bg-[#D4AF37] selection:text-[#080B10] transition-colors duration-300">
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-[#121826] dark:bg-[#141D2E] border border-[#D4AF37] text-white px-4 py-3 rounded-2xl shadow-2xl text-xs font-mono font-bold flex items-center gap-2.5 animate-pageEnter">
          <span className="text-[#D4AF37] text-base">✦</span>
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

      <main className="flex-1 mx-auto max-w-7xl w-full px-4 sm:px-6 py-6 sm:py-8 space-y-6">
        {/* Editorial Vault Header */}
        <div className="rounded-3xl border border-[#E8E2D6] dark:border-[rgba(212,175,55,0.2)] p-6 sm:p-8 bg-gradient-to-br from-white via-[#FAF8F5] to-[#F3EFEA] dark:from-[#0E1420] dark:via-[#080B10] dark:to-[#040609] shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-2 min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#D4AF37] dark:text-[#E5C158] font-bold bg-[#FAF8F5] dark:bg-[#141D2E] px-3.5 py-1 rounded-full border border-[#E8E2D6] dark:border-[rgba(212,175,55,0.2)] shadow-sm">
                Official Timepiece Registry
              </span>
              {selectedBrand !== "All" && (
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#8C6212] dark:text-[#F3E5AB] font-bold bg-[#D4AF37]/15 border border-[#D4AF37]/30 px-3 py-0.5 rounded-full flex items-center gap-1.5">
                  <span>Manufacture:</span>
                  <strong>{selectedBrand}</strong>
                  <button onClick={() => setSelectedBrand("All")} className="hover:text-red-500 ml-1 font-bold">×</button>
                </span>
              )}
            </div>
            <h1 className="text-2xl sm:text-4xl font-black font-display text-[#121826] dark:text-[#F8FAFC] tracking-tight uppercase">
              Vault <span className="gold-gradient-text">Catalogue</span>
            </h1>
            <p className="text-xs sm:text-sm text-[#645A4C] dark:text-[#CBD5E1] max-w-xl font-sans">
              Explore authentic calibres from the world&apos;s leading manufactures: Rolex, Omega, Patek Philippe, Audemars Piguet, and TAG Heuer.
            </p>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-between sm:justify-end flex-shrink-0">
            <button
              onClick={() => setIsMobileFilterOpen(true)}
              className="lg:hidden lux-btn-secondary px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 flex-1 sm:flex-initial justify-center shadow-sm"
            >
              <span>⚙ Filters</span>
              {activeFiltersCount > 0 && (
                <span className="bg-[#D4AF37] text-[#080B10] font-bold px-1.5 py-0.2 rounded-full text-[10px] font-mono">
                  {activeFiltersCount}
                </span>
              )}
            </button>
            <button
              onClick={resetFilters}
              className="px-4 py-2.5 rounded-xl border border-[#E8E2D6] dark:border-[rgba(212,175,55,0.2)] bg-white dark:bg-[#0E1420] text-[#645A4C] dark:text-[#CBD5E1] hover:text-[#D4AF37] text-xs font-mono transition shadow-sm"
            >
              Reset All
            </button>
          </div>
        </div>

        {/* 5 Real Luxury Brands Quick Selector Bar */}
        <div className="rounded-2xl border border-[#E8E2D6] dark:border-[rgba(212,175,55,0.18)] p-3 bg-white dark:bg-[#0E1420] shadow-sm flex items-center gap-2.5 overflow-x-auto no-scrollbar">
          <span className="text-[10px] font-mono uppercase font-bold text-[#D4AF37] whitespace-nowrap pl-1 pr-1.5 tracking-wider flex items-center gap-1.5 flex-shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37] animate-ping"></span>
            Manufacture:
          </span>
          <div className="flex items-center gap-2 flex-nowrap sm:flex-wrap">
            {PRESTIGE_BRANDS.map((brand) => {
              const brandCount = brand === "All"
                ? products.length
                : products.filter((p) => p.brand?.toLowerCase() === brand.toLowerCase()).length;
              const isSelected = selectedBrand === brand;

              return (
                <button
                  key={brand}
                  onClick={() => setSelectedBrand(brand)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-mono whitespace-nowrap transition-all flex items-center gap-1.5 border flex-shrink-0 cursor-pointer ${
                    isSelected
                      ? "bg-gradient-to-r from-[#D4AF37] to-[#AA7A1E] text-[#080B10] font-black border-transparent shadow-md scale-105"
                      : "bg-[#FAF8F5] dark:bg-[#141D2E] text-[#645A4C] dark:text-[#CBD5E1] border-[#E8E2D6] dark:border-[#1E293B] hover:border-[#D4AF37] hover:text-[#121826] dark:hover:text-white"
                  }`}
                >
                  <span>{brand === "All" ? "All Brands (5)" : brand}</span>
                  {brandCount > 0 && (
                    <span
                      className={`text-[9px] px-1.5 py-0.2 rounded-md font-mono ${
                        isSelected
                          ? "bg-black/20 text-[#080B10]"
                          : "bg-[#EBE5DB] dark:bg-[#080B10] text-[#8C7B65] dark:text-[#A3937C]"
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
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
          {/* Desktop Sidebar */}
          <aside className="hidden lg:block space-y-4 rounded-3xl border border-[#E8E2D6] dark:border-[rgba(212,175,55,0.18)] p-5 bg-white dark:bg-[#0E1420] shadow-md sticky top-28">
            <div className="flex items-center justify-between border-b border-[#E8E2D6] dark:border-[rgba(212,175,55,0.15)] pb-3">
              <h3 className="text-xs font-bold uppercase tracking-widest text-[#121826] dark:text-[#F8FAFC] font-mono flex items-center gap-1.5">
                <span className="text-[#D4AF37]">✦</span> Filter Parameters
              </h3>
              <button onClick={resetFilters} className="text-[10px] text-[#8C7B65] hover:text-[#D4AF37] font-mono font-bold">
                Clear
              </button>
            </div>

            {/* 5 Real Brands Selection */}
            <div className="space-y-2">
              <label className="text-[9px] text-[#D4AF37] uppercase font-bold font-mono tracking-widest block">
                Manufacture
              </label>
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
                      className={`w-full text-left px-3 py-2 rounded-xl text-xs font-mono transition flex items-center justify-between border cursor-pointer ${
                        isSelected
                          ? "bg-gradient-to-r from-[#D4AF37] to-[#AA7A1E] text-[#080B10] font-black border-transparent shadow-sm"
                          : "border-transparent text-[#645A4C] dark:text-[#CBD5E1] hover:bg-[#FAF8F5] dark:hover:bg-[#141D2E] hover:text-[#121826] dark:hover:text-white"
                      }`}
                    >
                      <span className="truncate pr-1">{brand === "All" ? "All 5 Brands" : brand}</span>
                      {count > 0 && (
                        <span
                          className={`text-[9px] px-1.5 py-0.5 rounded font-mono ${
                            isSelected
                              ? "bg-black/20 text-[#080B10]"
                              : "bg-[#FAF8F5] dark:bg-[#141D2E] text-[#8C7B65] dark:text-[#A3937C]"
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
            <div className="space-y-2 border-t border-[#EBE5DB] dark:border-[#182234] pt-3.5">
              <label className="text-[9px] text-[#D4AF37] uppercase font-bold font-mono tracking-widest block">
                Metier Category
              </label>
              <div className="space-y-1">
                {["All", "Luxury", "Automatic", "Sport", "Smart"].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs font-mono transition flex items-center justify-between cursor-pointer ${
                      selectedCategory === cat
                        ? "bg-gradient-to-r from-[#D4AF37] to-[#AA7A1E] text-[#080B10] font-black shadow-sm"
                        : "text-[#645A4C] dark:text-[#CBD5E1] hover:bg-[#FAF8F5] dark:hover:bg-[#141D2E] hover:text-[#121826] dark:hover:text-white"
                    }`}
                  >
                    <span>{cat === "All" ? "All Series" : cat}</span>
                    {selectedCategory === cat && <span>✓</span>}
                  </button>
                ))}
              </div>
            </div>

            {/* Price Range */}
            <div className="space-y-2 border-t border-[#EBE5DB] dark:border-[#182234] pt-3.5">
              <div className="flex justify-between text-[10px] font-mono font-bold">
                <span className="text-[#8C7B65] uppercase tracking-widest">Max Valuation</span>
                <span className="text-[#121826] dark:text-[#F3E5AB] font-num">{formatCurrency(maxPriceRange)}</span>
              </div>
              <input
                type="range"
                min={100000}
                max={2000000}
                step={50000}
                value={maxPriceRange}
                onChange={(e) => setMaxPriceRange(Number(e.target.value))}
                className="w-full accent-[#D4AF37] h-1.5 bg-[#E8E2D6] dark:bg-[#1E293B] rounded cursor-pointer"
              />
            </div>

            {/* Movement */}
            <div className="space-y-2 border-t border-[#EBE5DB] dark:border-[#182234] pt-3.5">
              <label className="text-[9px] text-[#D4AF37] uppercase font-bold font-mono tracking-widest block">
                Calibre Escapement
              </label>
              <select
                value={selectedMovement}
                onChange={(e) => setSelectedMovement(e.target.value)}
                className="w-full bg-[#FAF8F5] dark:bg-[#080B10] border border-[#E8E2D6] dark:border-[rgba(212,175,55,0.2)] rounded-xl px-3 py-2 text-xs text-[#121826] dark:text-[#F8FAFC] focus:outline-none focus:border-[#D4AF37] font-mono"
              >
                {MOVEMENTS.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>

            {/* Size */}
            <div className="space-y-2 border-t border-[#EBE5DB] dark:border-[#182234] pt-3.5">
              <label className="text-[9px] text-[#D4AF37] uppercase font-bold font-mono tracking-widest block">
                Case Diameter
              </label>
              <select
                value={selectedSize}
                onChange={(e) => setSelectedSize(e.target.value)}
                className="w-full bg-[#FAF8F5] dark:bg-[#080B10] border border-[#E8E2D6] dark:border-[rgba(212,175,55,0.2)] rounded-xl px-3 py-2 text-xs text-[#121826] dark:text-[#F8FAFC] focus:outline-none focus:border-[#D4AF37] font-mono"
              >
                {CASE_SIZES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            {/* In Stock */}
            <div className="flex items-center justify-between border-t border-[#EBE5DB] dark:border-[#182234] pt-3.5">
              <span className="text-xs text-[#645A4C] dark:text-[#CBD5E1] font-mono font-semibold">In Stock Only</span>
              <input
                type="checkbox"
                checked={onlyInStock}
                onChange={(e) => setOnlyInStock(e.target.checked)}
                className="h-4 w-4 rounded accent-[#D4AF37] cursor-pointer"
              />
            </div>
          </aside>

          {/* Product Feed */}
          <div className="lg:col-span-3 space-y-4">
            {/* Top Toolbar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3.5 rounded-2xl border border-[#E8E2D6] dark:border-[rgba(212,175,55,0.18)] bg-white dark:bg-[#0E1420] shadow-sm">
              <div className="text-xs text-[#645A4C] dark:text-[#CBD5E1] font-mono flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-start">
                <span>Displaying <strong className="text-[#121826] dark:text-[#F8FAFC]">{filteredProducts.length}</strong> authenticated references</span>
                {selectedBrand !== "All" && (
                  <span className="text-[#D4AF37] font-bold">• {selectedBrand}</span>
                )}
              </div>

              <div className="flex items-center gap-2.5 w-full sm:w-auto justify-between sm:justify-end">
                <div className="flex items-center gap-1 bg-[#FAF8F5] dark:bg-[#080B10] border border-[#E8E2D6] dark:border-[#1E293B] rounded-xl p-0.5">
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`px-3 py-1 rounded-lg text-xs font-mono transition cursor-pointer ${
                      viewMode === "grid" ? "bg-white dark:bg-[#141D2E] text-[#121826] dark:text-[#F8FAFC] font-bold shadow-sm" : "text-[#8C7B65] hover:text-[#121826] dark:hover:text-white"
                    }`}
                  >
                    Grid
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    className={`px-3 py-1 rounded-lg text-xs font-mono transition cursor-pointer ${
                      viewMode === "list" ? "bg-white dark:bg-[#141D2E] text-[#121826] dark:text-[#F8FAFC] font-bold shadow-sm" : "text-[#8C7B65] hover:text-[#121826] dark:hover:text-white"
                    }`}
                  >
                    List
                  </button>
                </div>

                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="bg-[#FAF8F5] dark:bg-[#080B10] border border-[#E8E2D6] dark:border-[#1E293B] rounded-xl px-3 py-1.5 text-xs text-[#121826] dark:text-[#F8FAFC] focus:outline-none focus:border-[#D4AF37] font-mono"
                >
                  <option value="featured">Featured First</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="name">Reference (A-Z)</option>
                </select>
              </div>
            </div>

            {/* Grid / List Results */}
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5 py-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="rounded-2xl border border-[#E8E2D6] dark:border-[rgba(212,175,55,0.15)] p-4 space-y-4 animate-pulse bg-white dark:bg-[#0E1420]">
                    <div className="aspect-square bg-[#FAF8F5] dark:bg-[#141D2E] rounded-xl"></div>
                    <div className="h-4 bg-[#FAF8F5] dark:bg-[#141D2E] rounded w-3/4"></div>
                  </div>
                ))}
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-16 rounded-3xl border border-[#E8E2D6] dark:border-[rgba(212,175,55,0.2)] space-y-3 bg-white dark:bg-[#0E1420] shadow-sm px-4">
                <div className="text-4xl text-[#D5CBBA] dark:text-[#1E293B]">⌕</div>
                <h3 className="text-base font-bold text-[#121826] dark:text-[#F8FAFC] uppercase font-display">No References Located</h3>
                <p className="text-xs text-[#8C7B65] font-mono">Try adjusting your brand selection or price range filter.</p>
                <button onClick={resetFilters} className="lux-btn-gold px-6 py-2 rounded-xl text-xs uppercase font-bold">
                  Reset All Filters
                </button>
              </div>
            ) : viewMode === "grid" ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5">
                {filteredProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onAddToCart={(prod) => addToCart(prod, 1)}
                    onToggleWishlist={(prod) => toggleWishlist(prod)}
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
                    className="rounded-2xl border border-[#E8E2D6] dark:border-[rgba(212,175,55,0.14)] p-4 flex flex-col sm:flex-row items-center gap-4 bg-white dark:bg-[#0E1420] hover:border-[#D4AF37] transition duration-300 shadow-md"
                  >
                    <Link
                      href={`/products/${product.id}`}
                      className="h-28 w-28 sm:h-24 sm:w-24 rounded-xl bg-[#FAF8F5] dark:bg-[#080B10] flex-shrink-0 block overflow-hidden border border-[#E8E2D6] dark:border-[rgba(212,175,55,0.15)] shadow-inner group/thumb"
                    >
                      <SmoothImage
                        src={product.image_url}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover/thumb:scale-105 transition-transform duration-500"
                      />
                    </Link>

                    <div className="flex-1 min-w-0 space-y-1 text-center sm:text-left w-full">
                      <div className="flex items-center justify-center sm:justify-start gap-2">
                        {product.brand && (
                          <span className="text-[9px] uppercase tracking-widest text-[#D4AF37] font-mono font-bold">
                            {product.brand}
                          </span>
                        )}
                        <span className="text-[9px] uppercase tracking-widest text-[#8C7B65] dark:text-[#A3937C] font-mono">
                          • {product.category}
                        </span>
                        {product.badge && (
                          <span className="text-[8px] px-2 py-0.5 rounded-full bg-gradient-to-r from-[#D4AF37] to-[#AA7A1E] text-[#080B10] font-bold font-mono uppercase">
                            {product.badge}
                          </span>
                        )}
                      </div>
                      <Link
                        href={`/products/${product.id}`}
                        className="text-sm font-bold text-[#121826] dark:text-[#F8FAFC] hover:text-[#D4AF37] transition block font-display tracking-tight"
                      >
                        {product.name}
                      </Link>
                      <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 text-[10px] text-[#8C7B65] dark:text-[#A3937C] font-mono pt-0.5">
                        {product.movement && <span>{product.movement}</span>}
                        {product.case_size && <span>• {product.case_size}</span>}
                        {product.water_resistance && <span>• {product.water_resistance}</span>}
                      </div>
                    </div>

                    <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-center w-full sm:w-auto gap-3 flex-shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#EBE5DB] dark:border-[#182234]">
                      <div className="text-left sm:text-right">
                        <div className="text-sm sm:text-base font-black text-[#121826] dark:text-[#F3E5AB] font-num">
                          {formatCurrency(product.price)}
                        </div>
                        {product.old_price && (
                          <div className="text-xs text-[#8C7B65] line-through font-num">
                            {formatCurrency(product.old_price)}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => setQuickViewProduct(product)}
                          className="p-2 rounded-xl border border-[#E8E2D6] dark:border-[#1E293B] bg-[#FAF8F5] dark:bg-[#141D2E] text-[#8C7B65] hover:text-[#D4AF37] shadow-sm cursor-pointer"
                          title="Quick View"
                        >
                          👁
                        </button>
                        <button
                          onClick={() => toggleWishlist(product)}
                          className={`p-2 rounded-xl border border-[#E8E2D6] dark:border-[#1E293B] bg-[#FAF8F5] dark:bg-[#141D2E] shadow-sm transition cursor-pointer ${
                            wishlist.some((p) => p.id === product.id)
                              ? "text-red-500 font-bold border-red-300"
                              : "text-[#8C7B65] hover:text-[#D4AF37]"
                          }`}
                          title="Wishlist"
                        >
                          ♡
                        </button>
                        <button
                          onClick={() => addToCart(product)}
                          className="lux-btn-gold px-4 py-2 rounded-xl text-xs uppercase font-extrabold shadow-sm"
                        >
                          Add to Cart
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
          <div
            onClick={() => setIsMobileFilterOpen(false)}
            className="fixed inset-0 bg-black/75 backdrop-blur-md transition-opacity"
          />

          <div className="fixed inset-y-0 right-0 max-w-full flex">
            <div className="w-screen max-w-sm bg-white dark:bg-[#0E1420] shadow-2xl flex flex-col justify-between border-l border-[#E8E2D6] dark:border-[rgba(212,175,55,0.2)]">
              <div className="p-4 sm:p-5 border-b border-[#E8E2D6] dark:border-[rgba(212,175,55,0.18)] flex items-center justify-between bg-[#FAF8F5] dark:bg-[#080B10]">
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-widest text-[#121826] dark:text-[#F8FAFC] font-mono">
                    Filter Parameters
                  </h3>
                  <p className="text-[11px] text-[#D4AF37] font-mono">
                    {filteredProducts.length} matching calibres
                  </p>
                </div>
                <button
                  onClick={() => setIsMobileFilterOpen(false)}
                  className="p-1.5 rounded-lg border border-[#E8E2D6] dark:border-[#1E293B] text-[#8C7B65] hover:text-[#121826] dark:hover:text-white text-xs font-bold"
                >
                  ✕
                </button>
              </div>

              <div className="p-4 sm:p-5 space-y-5 overflow-y-auto flex-1">
                {/* 5 Real Brands Selection */}
                <div className="space-y-2">
                  <label className="text-[9px] text-[#D4AF37] uppercase font-bold font-mono tracking-widest block">
                    Manufacture
                  </label>
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
                          className={`text-left px-2.5 py-2 rounded-xl text-xs font-mono transition flex items-center justify-between border cursor-pointer ${
                            isSelected
                              ? "bg-gradient-to-r from-[#D4AF37] to-[#AA7A1E] text-[#080B10] font-black border-transparent shadow-sm"
                              : "border-[#E8E2D6] dark:border-[#1E293B] text-[#645A4C] dark:text-[#CBD5E1] hover:bg-[#FAF8F5] dark:hover:bg-[#141D2E]"
                          }`}
                        >
                          <span className="truncate pr-1">{brand === "All" ? "All 5" : brand}</span>
                          {count > 0 && (
                            <span
                              className={`text-[9px] px-1.5 py-0.2 rounded font-mono ${
                                isSelected
                                  ? "bg-black/20 text-[#080B10]"
                                  : "bg-[#FAF8F5] dark:bg-[#080B10] text-[#8C7B65]"
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
                <div className="space-y-2 border-t border-[#EBE5DB] dark:border-[#182234] pt-4">
                  <label className="text-[9px] text-[#D4AF37] uppercase font-bold font-mono tracking-widest block">
                    Metier Category
                  </label>
                  <div className="grid grid-cols-2 gap-1.5">
                    {["All", "Luxury", "Automatic", "Sport", "Smart"].map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setSelectedCategory(cat)}
                        className={`text-left px-3 py-2 rounded-xl text-xs font-mono transition flex items-center justify-between border cursor-pointer ${
                          selectedCategory === cat
                            ? "bg-gradient-to-r from-[#D4AF37] to-[#AA7A1E] text-[#080B10] font-black border-transparent shadow-sm"
                            : "border-[#E8E2D6] dark:border-[#1E293B] text-[#645A4C] dark:text-[#CBD5E1] hover:bg-[#FAF8F5] dark:hover:bg-[#141D2E]"
                        }`}
                      >
                        <span>{cat === "All" ? "All Series" : cat}</span>
                        {selectedCategory === cat && <span>✓</span>}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Price Range */}
                <div className="space-y-2 border-t border-[#EBE5DB] dark:border-[#182234] pt-4">
                  <div className="flex justify-between text-[10px] font-mono font-bold">
                    <span className="text-[#8C7B65] uppercase tracking-widest">Max Valuation</span>
                    <span className="text-[#121826] dark:text-[#F3E5AB] font-num">{formatCurrency(maxPriceRange)}</span>
                  </div>
                  <input
                    type="range"
                    min={100000}
                    max={2000000}
                    step={50000}
                    value={maxPriceRange}
                    onChange={(e) => setMaxPriceRange(Number(e.target.value))}
                    className="w-full accent-[#D4AF37] h-2 bg-[#E8E2D6] dark:bg-[#1E293B] rounded cursor-pointer"
                  />
                </div>

                {/* Movement */}
                <div className="space-y-2 border-t border-[#EBE5DB] dark:border-[#182234] pt-4">
                  <label className="text-[9px] text-[#D4AF37] uppercase font-bold font-mono tracking-widest block">
                    Calibre Escapement
                  </label>
                  <select
                    value={selectedMovement}
                    onChange={(e) => setSelectedMovement(e.target.value)}
                    className="w-full bg-[#FAF8F5] dark:bg-[#080B10] border border-[#E8E2D6] dark:border-[#1E293B] rounded-xl px-3 py-2 text-xs text-[#121826] dark:text-[#F8FAFC] focus:outline-none font-mono"
                  >
                    {MOVEMENTS.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Size */}
                <div className="space-y-2 border-t border-[#EBE5DB] dark:border-[#182234] pt-4">
                  <label className="text-[9px] text-[#D4AF37] uppercase font-bold font-mono tracking-widest block">
                    Case Diameter
                  </label>
                  <select
                    value={selectedSize}
                    onChange={(e) => setSelectedSize(e.target.value)}
                    className="w-full bg-[#FAF8F5] dark:bg-[#080B10] border border-[#E8E2D6] dark:border-[#1E293B] rounded-xl px-3 py-2 text-xs text-[#121826] dark:text-[#F8FAFC] focus:outline-none font-mono"
                  >
                    {CASE_SIZES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>

                {/* In Stock */}
                <div className="flex items-center justify-between border-t border-[#EBE5DB] dark:border-[#182234] pt-4">
                  <span className="text-xs text-[#645A4C] dark:text-[#CBD5E1] font-mono font-semibold">In Stock Only</span>
                  <input
                    type="checkbox"
                    checked={onlyInStock}
                    onChange={(e) => setOnlyInStock(e.target.checked)}
                    className="h-5 w-5 rounded accent-[#D4AF37] cursor-pointer"
                  />
                </div>
              </div>

              {/* Drawer Footer Actions */}
              <div className="p-4 border-t border-[#E8E2D6] dark:border-[rgba(212,175,55,0.18)] bg-[#FAF8F5] dark:bg-[#080B10] flex items-center gap-2.5">
                <button
                  onClick={resetFilters}
                  className="px-4 py-2.5 rounded-xl border border-[#E8E2D6] dark:border-[#1E293B] bg-white dark:bg-[#141D2E] text-xs font-mono font-bold text-[#645A4C] dark:text-[#CBD5E1]"
                >
                  Reset
                </button>
                <button
                  onClick={() => setIsMobileFilterOpen(false)}
                  className="flex-1 lux-btn-gold py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider text-center"
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
        onUpdateQuantity={updateQuantity}
        onRemoveItem={removeFromCart}
        onClearCart={clearCart}
        onProceedToCheckout={() => setIsCheckoutOpen(true)}
        appliedCoupon={appliedCoupon}
        onApplyCoupon={applyCoupon}
        couponDiscountPercent={couponDiscountPercent}
      />

      <WishlistDrawer
        isOpen={isWishlistOpen}
        onClose={() => setIsWishlistOpen(false)}
        wishlist={wishlist}
        onRemoveFromWishlist={(id) => toggleWishlist({ id } as any)}
        onMoveToCart={(prod) => {
          addToCart(prod, 1);
          toggleWishlist(prod);
          setIsCartOpen(true);
        }}
      />

      <QuickViewModal
        product={quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
        onAddToCart={(prod, qty) => addToCart(prod, qty)}
      />

      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        cart={cart}
        totalAmount={grandTotal}
        onClearCart={clearCart}
      />
    </div>
  );
}
