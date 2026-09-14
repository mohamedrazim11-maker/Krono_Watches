"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { fetchProducts, fetchPosters, Product, Poster } from "@/lib/api";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import HeroBanner from "@/components/HeroBanner";
import CategoryPillars from "@/components/CategoryPillars";
import TrustPillars from "@/components/TrustPillars";
import TestimonialsSection from "@/components/TestimonialsSection";
import ProductCard from "@/components/ProductCard";
import CartDrawer from "@/components/CartDrawer";
import WishlistDrawer from "@/components/WishlistDrawer";
import QuickViewModal from "@/components/QuickViewModal";
import CheckoutModal from "@/components/CheckoutModal";
import SmoothImage from "@/components/SmoothImage";
import { useCart } from "@/lib/CartContext";

type PriceFilterType = "all" | "under500k" | "500k-1m" | "over1m";

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [posters, setPosters] = useState<Poster[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters & Search
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [priceFilter, setPriceFilter] = useState<PriceFilterType>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"featured" | "price-asc" | "price-desc" | "name">("featured");
  const [onlyInStock, setOnlyInStock] = useState(false);

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
    showToast,
  } = useCart();

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [prodRes, postRes] = await Promise.all([
          fetchProducts(),
          fetchPosters(),
        ]);
        setProducts(prodRes || []);
        setPosters(postRes || []);
      } catch (err) {
        console.error("Error loading home data:", err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  const handleCopyCoupon = (code: string) => {
    navigator.clipboard.writeText(code);
    applyCoupon(code);
    showToast(`Copied privilege voucher ${code}`);
  };

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      if (selectedCategory !== "All") {
        const prodCat = product.category?.toLowerCase() || "";
        const selCat = selectedCategory.toLowerCase();
        if (!prodCat.includes(selCat)) return false;
      }

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = product.name?.toLowerCase().includes(q);
        const matchBrand = product.brand?.toLowerCase().includes(q);
        const matchCategory = product.category?.toLowerCase().includes(q);
        const matchMovement = product.movement?.toLowerCase().includes(q);
        if (!matchName && !matchBrand && !matchCategory && !matchMovement) return false;
      }

      if (onlyInStock && product.in_stock === false) {
        return false;
      }

      if (priceFilter === "under500k" && product.price >= 500000) return false;
      if (priceFilter === "500k-1m" && (product.price < 500000 || product.price > 1000000)) return false;
      if (priceFilter === "over1m" && product.price <= 1000000) return false;

      return true;
    }).sort((a, b) => {
      if (sortBy === "price-asc") return a.price - b.price;
      if (sortBy === "price-desc") return b.price - a.price;
      if (sortBy === "name") return a.name.localeCompare(b.name);
      return (b.is_featured ? 1 : 0) - (a.is_featured ? 1 : 0);
    });
  }, [products, selectedCategory, searchQuery, priceFilter, onlyInStock, sortBy]);

  const totalCartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F5] dark:bg-[#080B10] text-[#121826] dark:text-[#F8FAFC] selection:bg-[#D4AF37] selection:text-[#080B10] transition-colors duration-300">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-[#121826] dark:bg-[#141D2E] border border-[#D4AF37] text-white px-4 py-3 rounded-2xl shadow-2xl text-xs font-mono font-bold flex items-center gap-2.5 animate-pageEnter">
          <span className="text-[#D4AF37] text-base">✦</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Global Navbar */}
      <Navbar
        cartCount={totalCartCount}
        wishlistCount={wishlist.length}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenWishlist={() => setIsWishlistOpen(true)}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        showSearch={true}
      />

      {/* Main Container */}
      <main className="flex-1 mx-auto max-w-7xl px-4 sm:px-6 py-6 sm:py-8 space-y-12 sm:space-y-16">
        {/* Editorial Hero Showcase */}
        <HeroBanner posters={posters} products={products} onCopyCoupon={handleCopyCoupon} />

        {/* Metier Pillars */}
        <CategoryPillars
          selectedCategory={selectedCategory}
          onSelectCategory={(cat) => setSelectedCategory(cat)}
        />

        {/* Masterpiece Catalogue Vault */}
        <section id="vault" className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#E8E2D6] dark:border-[rgba(212,175,55,0.18)] pb-4">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#D4AF37] dark:text-[#E5C158] font-bold">
                The Master Registry
              </span>
              <h2 className="text-2xl sm:text-3xl font-black font-display text-[#121826] dark:text-[#F8FAFC] uppercase tracking-tight">
                Curated <span className="gold-gradient-text">Catalogue Vault</span>
              </h2>
              <p className="text-xs text-[#8C7B65] dark:text-[#CBD5E1] font-sans">
                {filteredProducts.length} authenticated Swiss & mechanical timepieces available for immediate allocation
              </p>
            </div>

            {/* Category Filter Pills */}
            <div className="flex flex-wrap items-center gap-2">
              {["All", "Luxury", "Automatic", "Sport", "Smart"].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-1.5 rounded-full text-xs font-semibold tracking-wider uppercase transition-all cursor-pointer ${
                    selectedCategory === cat
                      ? "bg-gradient-to-r from-[#D4AF37] to-[#AA7A1E] text-[#080B10] font-black shadow-md shadow-[#D4AF37]/25 scale-105"
                      : "border border-[#E8E2D6] dark:border-[rgba(212,175,55,0.18)] bg-white dark:bg-[#0E1420] text-[#645A4C] dark:text-[#CBD5E1] hover:text-[#121826] dark:hover:text-[#F3E5AB] hover:border-[#D4AF37] shadow-sm"
                  }`}
                >
                  {cat === "All" ? "All Series" : cat}
                </button>
              ))}
            </div>
          </div>

          {/* Quick Precision Filter Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 p-4 rounded-2xl border border-[#E8E2D6] dark:border-[rgba(212,175,55,0.18)] bg-white dark:bg-[#0E1420] shadow-sm">
            <div className="relative">
              <input
                type="text"
                placeholder="Filter by reference..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#FAF8F5] dark:bg-[#080B10] border border-[#E8E2D6] dark:border-[rgba(212,175,55,0.2)] rounded-xl px-3.5 py-2 text-xs text-[#121826] dark:text-[#F8FAFC] placeholder-[#8C7B65] focus:outline-none focus:border-[#D4AF37]"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-2.5 text-xs text-[#8C7B65] hover:text-[#121826] dark:hover:text-white"
                >
                  ✕
                </button>
              )}
            </div>

            <div>
              <select
                value={priceFilter}
                onChange={(e) => setPriceFilter(e.target.value as PriceFilterType)}
                className="w-full bg-[#FAF8F5] dark:bg-[#080B10] border border-[#E8E2D6] dark:border-[rgba(212,175,55,0.2)] rounded-xl px-3.5 py-2 text-xs text-[#121826] dark:text-[#F8FAFC] focus:outline-none focus:border-[#D4AF37] font-mono"
              >
                <option value="all">All Valuations</option>
                <option value="under500k">Under LKR 500,000</option>
                <option value="500k-1m">LKR 500,000 – LKR 1,000,000</option>
                <option value="over1m">Over LKR 1,000,000</option>
              </select>
            </div>

            <div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="w-full bg-[#FAF8F5] dark:bg-[#080B10] border border-[#E8E2D6] dark:border-[rgba(212,175,55,0.2)] rounded-xl px-3.5 py-2 text-xs text-[#121826] dark:text-[#F8FAFC] focus:outline-none focus:border-[#D4AF37] font-mono"
              >
                <option value="featured">Featured First</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="name">Reference (A-Z)</option>
              </select>
            </div>

            <div className="flex items-center justify-between px-4 bg-[#FAF8F5] dark:bg-[#080B10] rounded-xl border border-[#E8E2D6] dark:border-[rgba(212,175,55,0.2)]">
              <span className="text-xs text-[#645A4C] dark:text-[#CBD5E1] font-mono font-semibold">In Stock Only</span>
              <input
                type="checkbox"
                checked={onlyInStock}
                onChange={(e) => setOnlyInStock(e.target.checked)}
                className="h-4 w-4 rounded accent-[#D4AF37] cursor-pointer"
              />
            </div>
          </div>

          {/* Product Grid Showcase */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 py-6">
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className="rounded-2xl border border-[#E8E2D6] dark:border-[rgba(212,175,55,0.15)] p-4 space-y-4 animate-pulse bg-white dark:bg-[#0E1420]"
                >
                  <div className="aspect-[4/3] bg-[#FAF8F5] dark:bg-[#141D2E] rounded-xl"></div>
                  <div className="h-4 bg-[#FAF8F5] dark:bg-[#141D2E] rounded w-3/4"></div>
                  <div className="h-8 bg-[#FAF8F5] dark:bg-[#141D2E] rounded"></div>
                </div>
              ))}
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-16 rounded-3xl border border-[#E8E2D6] dark:border-[rgba(212,175,55,0.2)] space-y-3 bg-white dark:bg-[#0E1420] shadow-sm">
              <div className="text-4xl text-[#D5CBBA] dark:text-[#1E293B]">⌕</div>
              <h3 className="text-base font-bold text-[#121826] dark:text-[#F8FAFC] font-display uppercase tracking-wider">
                No References Match Your Query
              </h3>
              <p className="text-xs text-[#8C7B65]">Try resetting your search query or price valuation filters.</p>
              <button
                onClick={() => {
                  setSelectedCategory("All");
                  setSearchQuery("");
                  setPriceFilter("all");
                  setOnlyInStock(false);
                }}
                className="lux-btn-gold px-6 py-2.5 rounded-xl text-xs uppercase font-bold"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5 py-2">
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
          )}
        </section>

        {/* Feature Spotlight: Micro-Mechanical Horology Anatomy */}
        <section className="rounded-3xl border border-[#E8E2D6] dark:border-[rgba(212,175,55,0.2)] p-6 sm:p-8 lg:p-10 bg-gradient-to-br from-white via-[#FAF8F5] to-[#F3EFEA] dark:from-[#0E1420] dark:via-[#080B10] dark:to-[#040609] shadow-2xl relative overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center relative z-10">
            <div className="space-y-4">
              <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#D4AF37] dark:text-[#E5C158] font-bold">
                Atelier Engineering
              </span>
              <h2 className="text-2xl sm:text-4xl font-black font-display text-[#121826] dark:text-[#F8FAFC] uppercase tracking-tight">
                Anatomy of a <br />
                <span className="gold-gradient-text">Masterpiece Calibre</span>
              </h2>
              <p className="text-xs sm:text-sm text-[#645A4C] dark:text-[#CBD5E1] leading-relaxed">
                Every Krono timepiece represents hundreds of hours of micromechanical regulation, certified Swiss tolerances, and hand-finished chamfered edges.
              </p>

              <div className="space-y-3 pt-2">
                <div className="p-3.5 rounded-2xl bg-white/80 dark:bg-[#141D2E]/80 border border-[#E8E2D6] dark:border-[rgba(212,175,55,0.15)] flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#AA7A1E] text-[#080B10] flex items-center justify-center font-bold text-xs flex-shrink-0">
                    01
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[#121826] dark:text-[#F8FAFC]">Swiss Chronometer Escapement</h4>
                    <p className="text-[11px] text-[#8C7B65] dark:text-[#A3937C]">High-beat 28,800 vph balance wheel with glucydur balance and silicon hairspring.</p>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-white/80 dark:bg-[#141D2E]/80 border border-[#E8E2D6] dark:border-[rgba(212,175,55,0.15)] flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#AA7A1E] text-[#080B10] flex items-center justify-center font-bold text-xs flex-shrink-0">
                    02
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[#121826] dark:text-[#F8FAFC]">Double Anti-Reflective Sapphire</h4>
                    <p className="text-[11px] text-[#8C7B65] dark:text-[#A3937C]">Mohs hardness 9 synthetic sapphire crystal with dual-sided anti-glare coating.</p>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-white/80 dark:bg-[#141D2E]/80 border border-[#E8E2D6] dark:border-[rgba(212,175,55,0.15)] flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#AA7A1E] text-[#080B10] flex items-center justify-center font-bold text-xs flex-shrink-0">
                    03
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[#121826] dark:text-[#F8FAFC]">Surgical 316L & 18K Solid Gold</h4>
                    <p className="text-[11px] text-[#8C7B65] dark:text-[#A3937C]">Corrosion-immune stainless steel cases paired with solid gold fluted bezels.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative rounded-3xl border border-[#E8E2D6] dark:border-[rgba(212,175,55,0.25)] p-2.5 overflow-hidden bg-white dark:bg-[#080B10] shadow-xl">
              <SmoothImage
                src="https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=1000&q=85"
                alt="Horological Calibre Anatomy"
                className="rounded-2xl filter brightness-[0.95]"
                containerClassName="rounded-2xl w-full h-80 sm:h-96"
              />
              <div className="absolute bottom-5 inset-x-5 p-3.5 rounded-xl bg-white/95 dark:bg-[#0E1420]/95 backdrop-blur-md border border-[#E8E2D6] dark:border-[rgba(212,175,55,0.25)] shadow-xl flex items-center justify-between">
                <div>
                  <div className="text-[9px] text-[#D4AF37] uppercase font-mono font-bold">COSC Certified Calibre</div>
                  <div className="text-xs font-bold text-[#121826] dark:text-[#F8FAFC]">Genève Hand-Assembled Movement</div>
                </div>
                <Link
                  href="/catalog"
                  className="lux-btn-gold px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider"
                >
                  View Pieces
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Guarantees of Excellence */}
        <TrustPillars />

        {/* Collector Reviews */}
        <TestimonialsSection />
      </main>

      <Footer />

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
