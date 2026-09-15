"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { fetchProducts, fetchCategories, Product, Category } from "@/lib/api";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SmoothImage from "@/components/SmoothImage";
import CartDrawer from "@/components/CartDrawer";
import WishlistDrawer from "@/components/WishlistDrawer";
import QuickViewModal from "@/components/QuickViewModal";
import CheckoutModal from "@/components/CheckoutModal";
import { useCart } from "@/lib/CartContext";
import { getProductImage } from "@/lib/productImages";

type ViewMode = "grid" | "list";

const MOVEMENTS = [
  "All",
  "Automatic",
  "Chronometer",
  "Spring Drive",
  "Powermatic 80",
  "Quartz",
  "Tough Solar",
  "Digital",
];

const CASE_SIZES = [
  "All",
  "38.5mm",
  "39mm",
  "40mm",
  "41mm",
  "42mm",
  "43mm",
  "44mm",
  "45mm+",
];

const PRESTIGE_BRANDS = [
  "All",
  "Rolex",
  "Omega",
  "Patek Philippe",
  "Audemars Piguet",
  "Cartier",
  "TAG Heuer",
  "Breitling",
  "Grand Seiko",
  "Tissot",
  "Casio",
  "Citizen",
  "Seiko",
  "Longines",
];

const COLLECTIONS = [
  "All",
  "Dive Watches",
  "Dress Watches",
  "Chronograph",
  "Automatic",
  "Digital",
  "Sports Watches",
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
  const [maxPriceRange, setMaxPriceRange] = useState<number>(25000000);

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
    isInWishlist,
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
    showToast,
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

  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        // Brand filter
        if (selectedBrand !== "All" && p.brand?.toLowerCase() !== selectedBrand.toLowerCase()) {
          return false;
        }

        // Category filter
        if (selectedCategory !== "All" && !p.category?.toLowerCase().includes(selectedCategory.toLowerCase())) {
          return false;
        }

        // Search Query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchName = p.name?.toLowerCase().includes(q);
          const matchBrand = p.brand?.toLowerCase().includes(q);
          const matchCategory = p.category?.toLowerCase().includes(q);
          const matchMovement = p.movement?.toLowerCase().includes(q);
          if (!matchName && !matchBrand && !matchCategory && !matchMovement) return false;
        }

        // Price filter
        if (p.price > maxPriceRange) return false;

        // In Stock filter
        if (onlyInStock && !p.in_stock) return false;

        // Movement filter
        if (selectedMovement !== "All" && !p.movement?.toLowerCase().includes(selectedMovement.toLowerCase())) {
          return false;
        }

        // Case size filter
        if (selectedSize !== "All") {
          if (selectedSize === "45mm+" && parseInt(p.case_size || "0", 10) < 45) return false;
          if (selectedSize !== "45mm+" && p.case_size && !p.case_size.startsWith(selectedSize.replace("mm", ""))) {
            return false;
          }
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
    searchQuery,
    maxPriceRange,
    onlyInStock,
    selectedMovement,
    selectedSize,
    sortBy,
  ]);

  const resetFilters = () => {
    setSelectedBrand("All");
    setSelectedCategory("All");
    setSelectedSize("All");
    setSelectedMovement("All");
    setOnlyInStock(false);
    setSearchQuery("");
    setMaxPriceRange(25000000);
    setSortBy("featured");
  };

  const activeFiltersCount =
    (selectedBrand !== "All" ? 1 : 0) +
    (selectedCategory !== "All" ? 1 : 0) +
    (selectedSize !== "All" ? 1 : 0) +
    (selectedMovement !== "All" ? 1 : 0) +
    (onlyInStock ? 1 : 0) +
    (searchQuery.trim() !== "" ? 1 : 0) +
    (maxPriceRange < 25000000 ? 1 : 0);

  const totalCartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="min-h-screen flex flex-col bg-[#050505] text-white selection:bg-[#C5A059] selection:text-black">
      <Navbar
        cartCount={totalCartCount}
        wishlistCount={wishlist.length}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenWishlist={() => setIsWishlistOpen(true)}
      />

      {/* Global Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#C5A059] text-black px-5 py-3 rounded-lg text-xs font-bold font-mono uppercase tracking-wider flex items-center gap-2 shadow-2xl animate-fade-in">
          <span>✦</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Hero Header */}
      <div className="border-b border-[#1a1a1a] bg-[#000]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
          <div className="max-w-3xl space-y-3">
            <span className="text-[11px] font-mono tracking-[0.25em] text-[#C5A059] uppercase font-bold">
              The Archive • Genève
            </span>
            <h1 className="text-3xl sm:text-5xl font-extrabold uppercase tracking-tight text-white font-sans">
              Curated Timepieces Catalogue
            </h1>
            <p className="text-xs sm:text-sm text-white/60 font-mono leading-relaxed">
              Explore {products.length} registered horological creations. Each reference certified with complete provenance, serialized authenticity, and insured armored delivery worldwide.
            </p>
          </div>

          {/* Quick Collection Strip */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pt-8">
            {COLLECTIONS.map((cat) => {
              const isSelected = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 text-xs font-mono tracking-wider uppercase whitespace-nowrap transition-all border rounded-none ${
                    isSelected
                      ? "bg-[#C5A059] text-black font-bold border-[#C5A059]"
                      : "bg-transparent text-white/60 border-[#2a2a2a] hover:text-white hover:border-white/40"
                  }`}
                >
                  {cat === "All" ? "All Series" : cat}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Catalogue Area */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-10 space-y-8">
        {/* Brand Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-3 no-scrollbar border-b border-[#1a1a1a]">
          <span className="text-[10px] font-mono uppercase font-bold text-[#C5A059] pr-2 flex-shrink-0 tracking-widest">
            MANUFACTURE:
          </span>
          {PRESTIGE_BRANDS.map((brand) => {
            const count =
              brand === "All"
                ? products.length
                : products.filter((p) => p.brand?.toLowerCase() === brand.toLowerCase()).length;
            if (brand !== "All" && count === 0) return null;
            const isSelected = selectedBrand === brand;

            return (
              <button
                key={brand}
                onClick={() => setSelectedBrand(brand)}
                className={`px-3.5 py-1.5 text-xs font-mono tracking-wider uppercase whitespace-nowrap transition-all flex items-center gap-2 border flex-shrink-0 ${
                  isSelected
                    ? "bg-white text-black font-bold border-white"
                    : "bg-[#111] text-white/70 border-[#222] hover:text-white hover:border-white/30"
                }`}
              >
                <span>{brand}</span>
                <span className={`text-[9px] px-1 py-0.2 rounded font-mono ${isSelected ? "bg-black/20 text-black" : "text-white/40"}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Toolbar (Search, Filter Counts, Sort, View Toggle) */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-2 border-b border-[#1a1a1a]">
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono text-white/60">
              Showing <span className="text-white font-bold">{filteredProducts.length}</span> of {products.length} Timepieces
            </span>
            {activeFiltersCount > 0 && (
              <button
                onClick={resetFilters}
                className="text-[11px] font-mono text-[#C5A059] hover:underline uppercase tracking-wider"
              >
                Reset Filters ({activeFiltersCount})
              </button>
            )}
          </div>

          <div className="flex items-center gap-4">
            {/* Sort Selector */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono uppercase text-white/50">Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-[#111] border border-[#2a2a2a] text-white text-xs font-mono px-3 py-1.5 rounded-none focus:outline-none focus:border-[#C5A059]"
              >
                <option value="featured">Featured Curations</option>
                <option value="price-asc">Price: Lowest to Highest</option>
                <option value="price-desc">Price: Highest to Lowest</option>
                <option value="name">Model Nomenclature (A-Z)</option>
              </select>
            </div>

            {/* View Mode Toggle */}
            <div className="hidden sm:flex items-center border border-[#2a2a2a]">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-1.5 transition-colors ${viewMode === "grid" ? "bg-white text-black" : "text-white/50 hover:text-white"}`}
                title="Grid View"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-1.5 transition-colors ${viewMode === "list" ? "bg-white text-black" : "text-white/50 hover:text-white"}`}
                title="List View"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Catalog Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Desktop Filter Sidebar */}
          <aside className="hidden lg:block lg:col-span-3 bg-[#0A0A0A] border border-[#1a1a1a] p-5 space-y-6 sticky top-24">
            <div className="flex items-center justify-between border-b border-[#222] pb-3">
              <span className="text-xs font-mono uppercase font-bold text-white tracking-widest">
                Dossier Filters
              </span>
              {activeFiltersCount > 0 && (
                <button
                  onClick={resetFilters}
                  className="text-[10px] font-mono text-[#C5A059] hover:underline uppercase"
                >
                  Clear All
                </button>
              )}
            </div>

            {/* Price Valuation Slider */}
            <div className="space-y-2">
              <div className="flex justify-between text-[11px] font-mono">
                <span className="text-white/50 uppercase">Max Valuation:</span>
                <span className="text-[#C5A059] font-bold">{formatCurrency(maxPriceRange)}</span>
              </div>
              <input
                type="range"
                min={200000}
                max={25000000}
                step={200000}
                value={maxPriceRange}
                onChange={(e) => setMaxPriceRange(Number(e.target.value))}
                className="w-full accent-[#C5A059] bg-[#222] h-1 rounded cursor-pointer"
              />
            </div>

            {/* In Stock Only */}
            <div className="pt-2 border-t border-[#1a1a1a]">
              <label className="flex items-center gap-2.5 cursor-pointer text-xs font-mono text-white/80">
                <input
                  type="checkbox"
                  checked={onlyInStock}
                  onChange={(e) => setOnlyInStock(e.target.checked)}
                  className="accent-[#C5A059] w-4 h-4 rounded-none"
                />
                <span>In Stock Vault Allocations Only</span>
              </label>
            </div>

            {/* Calibre Movement */}
            <div className="pt-2 border-t border-[#1a1a1a] space-y-2">
              <span className="block text-[10px] font-mono uppercase tracking-wider text-[#C5A059] font-bold">
                Movement Architecture
              </span>
              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                {MOVEMENTS.map((mov) => (
                  <button
                    key={mov}
                    onClick={() => setSelectedMovement(mov)}
                    className={`w-full text-left px-2 py-1 text-xs font-mono rounded transition-colors ${
                      selectedMovement === mov
                        ? "bg-[#C5A059] text-black font-bold"
                        : "text-white/60 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    {mov}
                  </button>
                ))}
              </div>
            </div>

            {/* Case Diameter */}
            <div className="pt-2 border-t border-[#1a1a1a] space-y-2">
              <span className="block text-[10px] font-mono uppercase tracking-wider text-[#C5A059] font-bold">
                Case Sizing
              </span>
              <div className="grid grid-cols-3 gap-1.5">
                {CASE_SIZES.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`py-1 text-[11px] font-mono border text-center transition-colors ${
                      selectedSize === size
                        ? "bg-[#C5A059] text-black font-bold border-[#C5A059]"
                        : "border-[#222] text-white/60 hover:text-white"
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          </aside>

          {/* Product Feed */}
          <div className="lg:col-span-9">
            {loading ? (
              <div className="py-24 text-center space-y-3 font-mono text-xs text-[#C5A059] animate-pulse">
                <div>✦</div>
                <div>Accessing Haute Horlogerie Archives...</div>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="bg-[#0D0D0D] border border-[#1a1a1a] p-12 text-center space-y-4">
                <div className="text-3xl text-[#C5A059]">✦</div>
                <h3 className="text-lg font-serif font-bold text-white uppercase">
                  No References Located
                </h3>
                <p className="text-xs text-white/50 max-w-sm mx-auto font-mono">
                  No registered timepieces meet your current filter configuration. Try broadening your valuation or selecting all manufactures.
                </p>
                <button
                  onClick={resetFilters}
                  className="px-6 py-2.5 bg-[#C5A059] text-black text-xs font-mono font-bold tracking-wider uppercase hover:bg-[#b08d48] transition-colors"
                >
                  Reset All Criteria
                </button>
              </div>
            ) : (
              <div
                className={
                  viewMode === "grid"
                    ? "grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6"
                    : "space-y-4"
                }
              >
                {filteredProducts.map((p) => {
                  const resolvedImage = getProductImage(p.id, p.image_url);
                  const isSaved = isInWishlist(p.id);

                  if (viewMode === "list") {
                    return (
                      <div
                        key={p.id}
                        className="bg-[#0D0D0D] border border-[#1a1a1a] hover:border-[#C5A059] p-4 flex flex-col sm:flex-row items-center gap-5 transition-all group"
                      >
                        <div className="w-32 h-32 bg-black border border-white/10 relative overflow-hidden flex-shrink-0">
                          <SmoothImage
                            src={resolvedImage}
                            alt={p.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        </div>

                        <div className="flex-1 min-w-0 space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-mono uppercase text-[#C5A059] font-bold">
                              {p.brand}
                            </span>
                            {p.badge && (
                              <span className="text-[9px] font-mono px-2 py-0.5 bg-[#1a1a1a] text-white/80 border border-white/10 uppercase">
                                {p.badge}
                              </span>
                            )}
                          </div>
                          <Link
                            href={`/products/${p.id}`}
                            className="block text-sm font-semibold text-white hover:text-[#C5A059] transition-colors truncate"
                          >
                            {p.name}
                          </Link>
                          <p className="text-xs text-white/50 font-mono line-clamp-2">
                            {p.description}
                          </p>
                          <div className="text-[11px] font-mono text-white/40 pt-1">
                            {p.case_size} • {p.movement}
                          </div>
                        </div>

                        <div className="text-right flex-shrink-0 space-y-2">
                          <div className="text-base font-mono font-bold text-[#C5A059]">
                            {formatCurrency(p.price)}
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => addToCart(p, 1)}
                              className="px-4 py-2 bg-white hover:bg-[#C5A059] hover:text-black text-black font-semibold text-xs tracking-wider uppercase transition-colors"
                            >
                              Acquire
                            </button>
                            <button
                              onClick={() => toggleWishlist(p)}
                              className={`p-2 border transition-colors ${
                                isSaved ? "border-red-500 text-red-500" : "border-[#333] text-white/60 hover:text-white"
                              }`}
                            >
                              ♥
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div
                      key={p.id}
                      className="bg-[#0D0D0D] border border-[#1a1a1a] hover:border-[#C5A059] flex flex-col transition-all duration-300 group relative"
                    >
                      {/* Image Container */}
                      <div className="aspect-square bg-black relative overflow-hidden">
                        <SmoothImage
                          src={resolvedImage}
                          alt={p.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />

                        {/* Top Badges */}
                        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
                          {p.badge && (
                            <span className="text-[9px] font-mono font-bold tracking-widest uppercase bg-[#C5A059] text-black px-2 py-0.5 shadow">
                              {p.badge}
                            </span>
                          )}
                          {p.is_on_promotion && (
                            <span className="text-[9px] font-mono font-bold tracking-widest bg-red-600 text-white px-1.5 py-0.5">
                              -{p.promo_discount_percent || 10}%
                            </span>
                          )}
                        </div>

                        {/* Wishlist Button */}
                        <button
                          onClick={() => toggleWishlist(p)}
                          className={`absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center transition-colors z-10 ${
                            isSaved
                              ? "bg-red-950/80 border border-red-500 text-red-400"
                              : "bg-black/60 border border-white/20 text-white/70 hover:text-white"
                          }`}
                        >
                          ♥
                        </button>

                        {/* Quick View Hover overlay */}
                        <button
                          onClick={() => setQuickViewProduct(p)}
                          className="absolute bottom-3 left-3 right-3 py-2 bg-black/80 hover:bg-black text-white text-[11px] font-mono tracking-widest uppercase border border-white/20 opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm"
                        >
                          Quick Inspection
                        </button>
                      </div>

                      {/* Content */}
                      <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                        <div>
                          <div className="flex items-center justify-between text-[10px] font-mono uppercase text-[#C5A059] font-bold tracking-wider mb-1">
                            <span>{p.brand}</span>
                            <span className="text-white/40">{p.case_size}</span>
                          </div>
                          <Link
                            href={`/products/${p.id}`}
                            className="block text-sm font-semibold text-white hover:text-[#C5A059] transition-colors leading-snug line-clamp-2"
                          >
                            {p.name}
                          </Link>
                          {p.movement && (
                            <p className="text-[11px] font-mono text-white/40 truncate mt-1">
                              {p.movement}
                            </p>
                          )}
                        </div>

                        <div className="pt-3 border-t border-[#1a1a1a] flex items-center justify-between">
                          <div>
                            <div className="text-[10px] font-mono text-white/40 uppercase">
                              Valuation
                            </div>
                            <div className="text-sm font-mono font-bold text-[#C5A059]">
                              {formatCurrency(p.price)}
                            </div>
                          </div>

                          <button
                            onClick={() => {
                              addToCart(p, 1);
                              showToast(`Added ${p.name} to portfolio.`);
                            }}
                            className="px-3.5 py-1.5 bg-white hover:bg-[#C5A059] hover:text-black text-black text-xs font-semibold uppercase tracking-wider transition-colors"
                          >
                            Acquire
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Quick View Modal */}
      {quickViewProduct && (
        <QuickViewModal
          isOpen={!!quickViewProduct}
          onClose={() => setQuickViewProduct(null)}
          product={quickViewProduct}
          onAddToCart={(p, qty) => {
            addToCart(p, qty);
            showToast(`Added ${p.name} to cart.`);
          }}
          onToggleWishlist={toggleWishlist}
          isInWishlist={isInWishlist(quickViewProduct.id)}
        />
      )}

      {/* Cart & Wishlist Drawers */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        onOpenCheckout={() => {
          setIsCartOpen(false);
          setIsCheckoutOpen(true);
        }}
      />
      <WishlistDrawer
        isOpen={isWishlistOpen}
        onClose={() => setIsWishlistOpen(false)}
      />

      <Footer />
    </div>
  );
}
