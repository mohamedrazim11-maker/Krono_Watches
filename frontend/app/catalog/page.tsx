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

const MOVEMENTS = ["All", "Automatic", "Chronometer", "Spring Drive", "Powermatic 80", "Tough Solar", "Quartz", "Digital"];
const CASE_SIZES = ["All", "38.5mm", "39mm", "39.3mm", "40mm", "41mm", "42mm", "42.8mm", "43mm", "43.2mm", "44.8mm", "49.8mm", "50.9mm", "54mm"];
const PRESTIGE_BRANDS = [
  "All",
  "Rolex",
  "Omega",
  "Casio",
  "Seiko",
  "Tissot"
];

const COLLECTIONS = [
  "All",
  "Dive Watches",
  "Dress Watches",
  "Chronograph",
  "Automatic",
  "Digital",
  "Sports Watches"
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
  const [maxPriceRange, setMaxPriceRange] = useState<number>(20000000);

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
    setMaxPriceRange(20000000);
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
    maxPriceRange < 20000000,
  ].filter(Boolean).length;

  return (
    <div className="min-h-screen flex flex-col bg-[#E8EEF3] dark:bg-[#0E1A16] text-[#0F172A] dark:text-[#F8FAFC] selection:bg-[#006039] selection:text-white transition-colors duration-300">
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 neu-raised-lg text-white bg-[#006039] dark:bg-[#0E1A16] px-5 py-3.5 rounded-2xl text-xs font-mono font-bold flex items-center gap-2.5 animate-pageEnter">
          <span className="text-[#4ADE80] text-base">✦</span>
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
        {/* Header & Quick Filter Showcase */}
        <div className="rounded-[2rem] neu-raised-lg p-6 sm:p-8 space-y-5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#006039] dark:text-[#4ADE80] font-bold neu-raised-sm px-3.5 py-1 rounded-full">
                  Official Horological Vault
                </span>
                <span className="text-xs font-mono text-[#5A6D64] dark:text-[#8EAA9C]">
                  • {filteredProducts.length} References Available
                </span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-black font-display text-[#0F172A] dark:text-[#F8FAFC] uppercase tracking-tight">
                Vault <span className="rolex-gradient-text">Catalogue</span>
              </h1>
            </div>

            {/* Quick Actions & Reset */}
            <div className="flex items-center gap-2.5">
              <button
                onClick={() => setIsMobileFilterOpen(true)}
                className="lg:hidden neu-btn px-4 py-2 rounded-2xl text-xs font-bold flex items-center gap-2"
              >
                <span>⚙ Filters</span>
                {activeFiltersCount > 0 && (
                  <span className="bg-[#006039] text-white font-bold px-1.5 py-0.2 rounded-full text-[10px] font-mono">
                    {activeFiltersCount}
                  </span>
                )}
              </button>
              {activeFiltersCount > 0 && (
                <button
                  onClick={resetFilters}
                  className="px-4 py-2 rounded-2xl neu-btn text-[#5A6D64] hover:text-[#006039] text-xs font-mono font-bold transition"
                >
                  Reset ({activeFiltersCount})
                </button>
              )}
            </div>
          </div>

          {/* Manufacture Selection Bar */}
          <div className="space-y-2 pt-2 border-t border-[rgba(166,180,200,0.3)] dark:border-[rgba(255,255,255,0.06)]">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase font-bold text-[#006039] dark:text-[#4ADE80] tracking-wider flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#006039] dark:bg-[#4ADE80] animate-ping"></span>
                Select Manufacture:
              </span>
              <div className="hidden sm:flex items-center gap-1 text-[10px] font-mono text-[#5A6D64] dark:text-[#8EAA9C]">
                {selectedBrand !== "All" ? `Filtered: ${selectedBrand}` : "Showing All 5 Swiss Houses"}
              </div>
            </div>

            <div className="flex items-center gap-2.5 overflow-x-auto pb-1.5 no-scrollbar">
              {PRESTIGE_BRANDS.map((brand) => {
                const brandCount = brand === "All"
                  ? products.length
                  : products.filter((p) => p.brand?.toLowerCase() === brand.toLowerCase()).length;
                const isSelected = selectedBrand === brand;

                return (
                  <button
                    key={brand}
                    onClick={() => setSelectedBrand(brand)}
                    className={`px-4 py-2 rounded-2xl text-xs font-mono whitespace-nowrap transition-all flex items-center gap-2 flex-shrink-0 cursor-pointer ${
                      isSelected
                        ? "neu-btn-primary shadow-md scale-105 text-white font-bold"
                        : "neu-btn text-[#475569] dark:text-[#CBD5E1]"
                    }`}
                  >
                    <span>{brand === "All" ? "All Manufactures" : brand}</span>
                    {brandCount > 0 && (
                      <span
                        className={`text-[9px] px-1.5 py-0.5 rounded-md font-mono font-bold ${
                          isSelected
                            ? "bg-black/25 text-white"
                            : "neu-inset text-[#5A6D64] dark:text-[#8EAA9C]"
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

          {/* Collection Pills Bar */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pt-1">
            <span className="text-[10px] font-mono uppercase font-bold text-[#5A6D64] dark:text-[#8EAA9C] pr-1 flex-shrink-0 tracking-wider">
              COLLECTION:
            </span>
            {COLLECTIONS.map((cat) => {
              const isSelected = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-mono font-bold whitespace-nowrap transition cursor-pointer ${
                    isSelected
                      ? "neu-btn-primary text-white scale-105"
                      : "neu-pill text-[#5A6D64] dark:text-[#CBD5E1]"
                  }`}
                >
                  {cat === "All" ? "All Series" : cat}
                </button>
              );
            })}
          </div>
        </div>

        {/* Layout Grid (Desktop Sidebar + Main Feed) */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
          {/* Desktop Sidebar */}
          <aside className="hidden lg:block space-y-4 rounded-3xl neu-raised p-5 sticky top-28">
            <div className="flex items-center justify-between border-b border-[rgba(166,180,200,0.3)] dark:border-[rgba(255,255,255,0.06)] pb-3">
              <h3 className="text-xs font-bold uppercase tracking-widest text-[#0F172A] dark:text-[#F8FAFC] font-mono flex items-center gap-1.5">
                <span className="text-[#006039] dark:text-[#4ADE80]">✦</span> Detailed Filter
              </h3>
              <button onClick={resetFilters} className="text-[10px] text-[#5A6D64] hover:text-[#006039] font-mono font-bold cursor-pointer">
                Clear
              </button>
            </div>

            {/* Price Range Slider */}
            <div className="space-y-2">
              <div className="flex justify-between text-[10px] font-mono font-bold">
                <span className="text-[#5A6D64] uppercase tracking-widest">Max Valuation</span>
                <span className="text-[#006039] dark:text-[#4ADE80] font-num">{formatCurrency(maxPriceRange)}</span>
              </div>
              <input
                type="range"
                min={100000}
                max={20000000}
                step={250000}
                value={maxPriceRange}
                onChange={(e) => setMaxPriceRange(Number(e.target.value))}
                className="w-full accent-[#006039] h-2 rounded-lg cursor-pointer"
              />
            </div>

            {/* Movement Escapement */}
            <div className="space-y-2 border-t border-[rgba(166,180,200,0.3)] dark:border-[rgba(255,255,255,0.06)] pt-3.5">
              <label className="text-[9px] text-[#006039] dark:text-[#4ADE80] uppercase font-bold font-mono tracking-widest block">
                Calibre Escapement
              </label>
              <select
                value={selectedMovement}
                onChange={(e) => setSelectedMovement(e.target.value)}
                className="w-full neu-inset rounded-xl px-3 py-2 text-xs text-[#0F172A] dark:text-[#F8FAFC] focus:outline-none font-mono"
              >
                {MOVEMENTS.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>

            {/* Size */}
            <div className="space-y-2 border-t border-[rgba(166,180,200,0.3)] dark:border-[rgba(255,255,255,0.06)] pt-3.5">
              <label className="text-[9px] text-[#006039] dark:text-[#4ADE80] uppercase font-bold font-mono tracking-widest block">
                Case Diameter
              </label>
              <select
                value={selectedSize}
                onChange={(e) => setSelectedSize(e.target.value)}
                className="w-full neu-inset rounded-xl px-3 py-2 text-xs text-[#0F172A] dark:text-[#F8FAFC] focus:outline-none font-mono"
              >
                {CASE_SIZES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            {/* In Stock Toggle */}
            <div className="flex items-center justify-between border-t border-[rgba(166,180,200,0.3)] dark:border-[rgba(255,255,255,0.06)] pt-3.5">
              <span className="text-xs text-[#475569] dark:text-[#CBD5E1] font-mono font-semibold">In Stock Only</span>
              <input
                type="checkbox"
                checked={onlyInStock}
                onChange={(e) => setOnlyInStock(e.target.checked)}
                className="h-4 w-4 rounded accent-[#006039] cursor-pointer"
              />
            </div>
          </aside>

          {/* Product Feed */}
          <div className="lg:col-span-3 space-y-5">
            {/* Top Toolbar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3.5 rounded-3xl neu-raised">
              <div className="text-xs text-[#475569] dark:text-[#CBD5E1] font-mono flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-start">
                <span>Displaying <strong className="text-[#0F172A] dark:text-[#F8FAFC]">{filteredProducts.length}</strong> authenticated references</span>
                {selectedBrand !== "All" && (
                  <span className="text-[#006039] dark:text-[#4ADE80] font-bold">• {selectedBrand}</span>
                )}
              </div>

              <div className="flex items-center gap-2.5 w-full sm:w-auto justify-between sm:justify-end">
                <div className="flex items-center gap-1 neu-inset rounded-xl p-1">
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`px-3 py-1 rounded-lg text-xs font-mono transition cursor-pointer ${
                      viewMode === "grid" ? "neu-raised text-[#0F172A] dark:text-[#F8FAFC] font-bold" : "text-[#5A6D64]"
                    }`}
                  >
                    Grid
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    className={`px-3 py-1 rounded-lg text-xs font-mono transition cursor-pointer ${
                      viewMode === "list" ? "neu-raised text-[#0F172A] dark:text-[#F8FAFC] font-bold" : "text-[#5A6D64]"
                    }`}
                  >
                    List
                  </button>
                </div>

                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="neu-inset rounded-xl px-3 py-1.5 text-xs text-[#0F172A] dark:text-[#F8FAFC] focus:outline-none font-mono"
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
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5 py-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="rounded-3xl neu-card p-5 space-y-4 animate-pulse">
                    <div className="aspect-square neu-inset rounded-2xl"></div>
                    <div className="h-4 bg-[rgba(166,180,200,0.4)] dark:bg-[rgba(255,255,255,0.06)] rounded w-3/4"></div>
                  </div>
                ))}
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-16 rounded-3xl neu-card space-y-3 px-4">
                <div className="text-4xl text-[#CBD5E1] dark:text-[#1F4535]">⌕</div>
                <h3 className="text-base font-bold text-[#0F172A] dark:text-[#F8FAFC] uppercase font-display">No References Located</h3>
                <p className="text-xs text-[#5A6D64] font-mono">Try adjusting your brand selection or price range filter.</p>
                <button onClick={resetFilters} className="neu-btn-primary px-6 py-2.5 rounded-2xl text-xs uppercase font-bold">
                  Reset All Filters
                </button>
              </div>
            ) : viewMode === "grid" ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
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
              <div className="space-y-4">
                {filteredProducts.map((product) => (
                  <div
                    key={product.id}
                    className="rounded-3xl neu-card p-5 flex flex-col sm:flex-row items-center gap-5 transition duration-300"
                  >
                    <Link
                      href={`/products/${product.id}`}
                      className="h-28 w-28 sm:h-24 sm:w-24 rounded-2xl neu-inset flex-shrink-0 block overflow-hidden p-1 group/thumb"
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
                          <span className="text-[9px] uppercase tracking-widest text-[#006039] dark:text-[#4ADE80] font-mono font-bold">
                            {product.brand}
                          </span>
                        )}
                        <span className="text-[9px] uppercase tracking-widest text-[#5A6D64] dark:text-[#8EAA9C] font-mono">
                          • {product.category}
                        </span>
                        {product.badge && (
                          <span className="text-[8px] px-2.5 py-0.5 rounded-full neu-raised-sm text-[#006039] dark:text-[#4ADE80] font-bold font-mono uppercase">
                            {product.badge}
                          </span>
                        )}
                      </div>
                      <Link
                        href={`/products/${product.id}`}
                        className="text-sm font-bold text-[#0F172A] dark:text-[#F8FAFC] hover:text-[#006039] dark:hover:text-[#4ADE80] transition block font-display tracking-tight"
                      >
                        {product.name}
                      </Link>
                      <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 text-[10px] text-[#5A6D64] dark:text-[#8EAA9C] font-mono pt-0.5">
                        {product.movement && <span>{product.movement}</span>}
                        {product.case_size && <span>• {product.case_size}</span>}
                        {product.water_resistance && <span>• {product.water_resistance}</span>}
                      </div>
                    </div>

                    <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-center w-full sm:w-auto gap-3 flex-shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-[rgba(166,180,200,0.3)] dark:border-[rgba(255,255,255,0.06)]">
                      <div className="text-left sm:text-right">
                        <div className="text-sm sm:text-base font-black text-[#006039] dark:text-[#4ADE80] font-num">
                          {formatCurrency(product.price)}
                        </div>
                        {product.old_price && (
                          <div className="text-xs text-[#64748B] line-through font-num">
                            {formatCurrency(product.old_price)}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setQuickViewProduct(product)}
                          className="p-2.5 rounded-xl neu-btn-icon text-[#5A6D64] hover:text-[#006039] cursor-pointer"
                          title="Quick View"
                        >
                          👁
                        </button>
                        <button
                          onClick={() => toggleWishlist(product)}
                          className={`p-2.5 rounded-xl neu-btn-icon transition cursor-pointer ${
                            wishlist.some((p) => p.id === product.id)
                              ? "text-red-500 font-bold neu-inset"
                              : "text-[#5A6D64] hover:text-[#006039]"
                          }`}
                          title="Wishlist"
                        >
                          ♡
                        </button>
                        <button
                          onClick={() => addToCart(product)}
                          className="neu-btn-primary px-4 py-2 rounded-xl text-xs uppercase font-extrabold"
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
            <div className="w-screen max-w-sm bg-[#E8EEF3] dark:bg-[#0E1A16] shadow-2xl flex flex-col justify-between border-l border-[rgba(255,255,255,0.7)] dark:border-[rgba(255,255,255,0.06)]">
              <div className="p-4 sm:p-5 border-b border-[rgba(166,180,200,0.3)] dark:border-[rgba(255,255,255,0.06)] flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-widest text-[#0F172A] dark:text-[#F8FAFC] font-mono">
                    Filter Parameters
                  </h3>
                  <p className="text-[11px] text-[#006039] dark:text-[#4ADE80] font-mono">
                    {filteredProducts.length} matching calibres
                  </p>
                </div>
                <button
                  onClick={() => setIsMobileFilterOpen(false)}
                  className="p-2 rounded-xl neu-btn-icon text-[#5A6D64] hover:text-[#0F172A] dark:hover:text-white text-xs font-bold"
                >
                  ✕
                </button>
              </div>

              <div className="p-4 sm:p-5 space-y-5 overflow-y-auto flex-1">
                {/* 5 Real Brands Selection */}
                <div className="space-y-2">
                  <label className="text-[9px] text-[#006039] dark:text-[#4ADE80] uppercase font-bold font-mono tracking-widest block">
                    Manufacture
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {PRESTIGE_BRANDS.map((brand) => {
                      const count = brand === "All"
                        ? products.length
                        : products.filter((p) => p.brand?.toLowerCase() === brand.toLowerCase()).length;
                      const isSelected = selectedBrand === brand;

                      return (
                        <button
                          key={brand}
                          onClick={() => setSelectedBrand(brand)}
                          className={`text-left px-3 py-2 rounded-xl text-xs font-mono transition flex items-center justify-between cursor-pointer ${
                            isSelected
                              ? "neu-btn-primary text-white font-bold"
                              : "neu-btn text-[#475569] dark:text-[#CBD5E1]"
                          }`}
                        >
                          <span className="truncate pr-1">{brand === "All" ? "All 5" : brand}</span>
                          {count > 0 && (
                            <span
                              className={`text-[9px] px-1.5 py-0.2 rounded font-mono ${
                                isSelected
                                  ? "bg-black/20 text-white"
                                  : "neu-inset text-[#5A6D64]"
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
                <div className="space-y-2 border-t border-[rgba(166,180,200,0.3)] dark:border-[rgba(255,255,255,0.06)] pt-4">
                  <label className="text-[9px] text-[#006039] dark:text-[#4ADE80] uppercase font-bold font-mono tracking-widest block">
                    Collection
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {COLLECTIONS.map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setSelectedCategory(cat)}
                        className={`text-left px-3 py-2 rounded-xl text-xs font-mono transition flex items-center justify-between cursor-pointer ${
                          selectedCategory === cat
                            ? "neu-btn-primary text-white font-bold"
                            : "neu-btn text-[#475569] dark:text-[#CBD5E1]"
                        }`}
                      >
                        <span>{cat === "All" ? "All Series" : cat}</span>
                        {selectedCategory === cat && <span>✓</span>}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Price Range */}
                <div className="space-y-2 border-t border-[rgba(166,180,200,0.3)] dark:border-[rgba(255,255,255,0.06)] pt-4">
                  <div className="flex justify-between text-[10px] font-mono font-bold">
                    <span className="text-[#5A6D64] uppercase tracking-widest">Max Valuation</span>
                    <span className="text-[#006039] dark:text-[#4ADE80] font-num">{formatCurrency(maxPriceRange)}</span>
                  </div>
                  <input
                    type="range"
                    min={100000}
                    max={20000000}
                    step={250000}
                    value={maxPriceRange}
                    onChange={(e) => setMaxPriceRange(Number(e.target.value))}
                    className="w-full accent-[#006039] h-2 rounded-lg cursor-pointer"
                  />
                </div>

                {/* Movement */}
                <div className="space-y-2 border-t border-[rgba(166,180,200,0.3)] dark:border-[rgba(255,255,255,0.06)] pt-4">
                  <label className="text-[9px] text-[#006039] dark:text-[#4ADE80] uppercase font-bold font-mono tracking-widest block">
                    Calibre Escapement
                  </label>
                  <select
                    value={selectedMovement}
                    onChange={(e) => setSelectedMovement(e.target.value)}
                    className="w-full neu-inset rounded-xl px-3 py-2 text-xs text-[#0F172A] dark:text-[#F8FAFC] focus:outline-none font-mono"
                  >
                    {MOVEMENTS.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Size */}
                <div className="space-y-2 border-t border-[rgba(166,180,200,0.3)] dark:border-[rgba(255,255,255,0.06)] pt-4">
                  <label className="text-[9px] text-[#006039] dark:text-[#4ADE80] uppercase font-bold font-mono tracking-widest block">
                    Case Diameter
                  </label>
                  <select
                    value={selectedSize}
                    onChange={(e) => setSelectedSize(e.target.value)}
                    className="w-full neu-inset rounded-xl px-3 py-2 text-xs text-[#0F172A] dark:text-[#F8FAFC] focus:outline-none font-mono"
                  >
                    {CASE_SIZES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>

                {/* In Stock */}
                <div className="flex items-center justify-between border-t border-[rgba(166,180,200,0.3)] dark:border-[rgba(255,255,255,0.06)] pt-4">
                  <span className="text-xs text-[#475569] dark:text-[#CBD5E1] font-mono font-semibold">In Stock Only</span>
                  <input
                    type="checkbox"
                    checked={onlyInStock}
                    onChange={(e) => setOnlyInStock(e.target.checked)}
                    className="h-4 w-4 rounded accent-[#006039] cursor-pointer"
                  />
                </div>
              </div>

              {/* Drawer Footer Actions */}
              <div className="p-4 border-t border-[rgba(166,180,200,0.3)] dark:border-[rgba(255,255,255,0.06)] bg-[#E8EEF3] dark:bg-[#0E1A16] flex items-center gap-2.5">
                <button
                  onClick={resetFilters}
                  className="px-4 py-2.5 rounded-xl neu-btn text-xs font-mono font-bold text-[#475569] dark:text-[#CBD5E1]"
                >
                  Reset
                </button>
                <button
                  onClick={() => setIsMobileFilterOpen(false)}
                  className="flex-1 neu-btn-primary py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider text-center"
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
