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

type PriceFilterType = "all" | "under500k" | "500k-2m" | "2m-5m" | "over5m";

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
      if (priceFilter === "500k-2m" && (product.price < 500000 || product.price > 2000000)) return false;
      if (priceFilter === "2m-5m" && (product.price < 2000000 || product.price > 5000000)) return false;
      if (priceFilter === "over5m" && product.price <= 5000000) return false;

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
    <div className="min-h-screen flex flex-col bg-[#F8FAF9] dark:bg-[#06110D] text-[#0F172A] dark:text-[#F8FAFC] selection:bg-[#006039] selection:text-white transition-colors duration-300">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-[#00482B] dark:bg-[#0B1C15] border border-[#006039] dark:border-[#00A362] text-white px-4 py-3 rounded-2xl shadow-2xl text-xs font-mono font-bold flex items-center gap-2.5 animate-pageEnter">
          <span className="text-[#4ADE80] text-base">✦</span>
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
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#E2E8F0] dark:border-[rgba(0,96,57,0.3)] pb-4">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#006039] dark:text-[#4ADE80] font-bold">
                The Master Registry
              </span>
              <h2 className="text-2xl sm:text-3xl font-black font-display text-[#0F172A] dark:text-[#F8FAFC] uppercase tracking-tight">
                Curated <span className="rolex-gradient-text">Catalogue Vault</span>
              </h2>
              <p className="text-xs text-[#5A6D64] dark:text-[#CBD5E1] font-sans">
                {filteredProducts.length} authenticated Swiss & mechanical timepieces available for immediate allocation
              </p>
            </div>

            {/* Category Filter Pills */}
            <div className="flex flex-wrap items-center gap-2">
              {["All", "Dive Watches", "Dress Watches", "Chronograph", "Automatic", "Digital", "Sports Watches"].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-1.5 rounded-full text-xs font-semibold tracking-wider uppercase transition-all cursor-pointer ${
                    selectedCategory === cat
                      ? "bg-[#006039] dark:bg-[#00824E] text-white font-bold shadow-md shadow-[#006039]/30 scale-105"
                      : "border border-[#E2E8F0] dark:border-[rgba(0,96,57,0.25)] bg-white dark:bg-[#0B1C15] text-[#475569] dark:text-[#CBD5E1] hover:text-[#006039] dark:hover:text-[#4ADE80] hover:border-[#006039] shadow-sm"
                  }`}
                >
                  {cat === "All" ? "All Series" : cat}
                </button>
              ))}
            </div>
          </div>

          {/* Quick Precision Filter Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 p-4 rounded-2xl border border-[#E2E8F0] dark:border-[rgba(0,96,57,0.3)] bg-white dark:bg-[#0B1C15] shadow-sm">
            <div className="relative">
              <input
                type="text"
                placeholder="Filter by reference..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#F8FAF9] dark:bg-[#06110D] border border-[#E2E8F0] dark:border-[rgba(0,96,57,0.35)] rounded-xl px-3.5 py-2 text-xs text-[#0F172A] dark:text-[#F8FAFC] placeholder-[#64748B] focus:outline-none focus:border-[#006039]"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-2.5 text-xs text-[#64748B] hover:text-[#0F172A] dark:hover:text-white"
                >
                  ✕
                </button>
              )}
            </div>

            <div>
              <select
                value={priceFilter}
                onChange={(e) => setPriceFilter(e.target.value as PriceFilterType)}
                className="w-full bg-[#F8FAF9] dark:bg-[#06110D] border border-[#E2E8F0] dark:border-[rgba(0,96,57,0.35)] rounded-xl px-3.5 py-2 text-xs text-[#0F172A] dark:text-[#F8FAFC] focus:outline-none focus:border-[#006039] font-mono"
              >
                <option value="all">All Valuations</option>
                <option value="under500k">Under LKR 500,000</option>
                <option value="500k-2m">LKR 500,000 – LKR 2,000,000</option>
                <option value="2m-5m">LKR 2,000,000 – LKR 5,000,000</option>
                <option value="over5m">Over LKR 5,000,000</option>
              </select>
            </div>

            <div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="w-full bg-[#F8FAF9] dark:bg-[#06110D] border border-[#E2E8F0] dark:border-[rgba(0,96,57,0.35)] rounded-xl px-3.5 py-2 text-xs text-[#0F172A] dark:text-[#F8FAFC] focus:outline-none focus:border-[#006039] font-mono"
              >
                <option value="featured">Featured First</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="name">Reference (A-Z)</option>
              </select>
            </div>

            <div className="flex items-center justify-between px-4 bg-[#F8FAF9] dark:bg-[#06110D] rounded-xl border border-[#E2E8F0] dark:border-[rgba(0,96,57,0.35)]">
              <span className="text-xs text-[#475569] dark:text-[#CBD5E1] font-mono font-semibold">In Stock Only</span>
              <input
                type="checkbox"
                checked={onlyInStock}
                onChange={(e) => setOnlyInStock(e.target.checked)}
                className="h-4 w-4 rounded accent-[#006039] cursor-pointer"
              />
            </div>
          </div>

          {/* Product Grid Showcase */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 py-6">
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className="rounded-2xl border border-[#E2E8F0] dark:border-[rgba(0,96,57,0.2)] p-4 space-y-4 animate-pulse bg-white dark:bg-[#0B1C15]"
                >
                  <div className="aspect-[4/3] bg-[#F8FAF9] dark:bg-[#11261D] rounded-xl"></div>
                  <div className="h-4 bg-[#F8FAF9] dark:bg-[#11261D] rounded w-3/4"></div>
                  <div className="h-8 bg-[#F8FAF9] dark:bg-[#11261D] rounded"></div>
                </div>
              ))}
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-16 rounded-3xl border border-[#E2E8F0] dark:border-[rgba(0,96,57,0.3)] space-y-3 bg-white dark:bg-[#0B1C15] shadow-sm">
              <div className="text-4xl text-[#CBD5E1] dark:text-[#1F4535]">⌕</div>
              <h3 className="text-base font-bold text-[#0F172A] dark:text-[#F8FAFC] font-display uppercase tracking-wider">
                No References Match Your Query
              </h3>
              <p className="text-xs text-[#5A6D64]">Try resetting your search query or price valuation filters.</p>
              <button
                onClick={() => {
                  setSelectedCategory("All");
                  setSearchQuery("");
                  setPriceFilter("all");
                  setOnlyInStock(false);
                }}
                className="lux-btn-primary px-6 py-2.5 rounded-xl text-xs uppercase font-bold"
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
        <section className="rounded-3xl border border-[#E2E8F0] dark:border-[rgba(0,96,57,0.3)] p-6 sm:p-8 lg:p-10 bg-gradient-to-br from-white via-[#F8FAF9] to-[#F1F5F3] dark:from-[#0B1C15] dark:via-[#06110D] dark:to-[#030806] shadow-xl relative overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center relative z-10">
            <div className="space-y-4">
              <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#006039] dark:text-[#4ADE80] font-bold">
                Atelier Engineering
              </span>
              <h2 className="text-2xl sm:text-4xl font-black font-display text-[#0F172A] dark:text-[#F8FAFC] uppercase tracking-tight">
                Anatomy of a <br />
                <span className="rolex-gradient-text">Superlative Calibre</span>
              </h2>
              <p className="text-xs sm:text-sm text-[#475569] dark:text-[#CBD5E1] leading-relaxed">
                Every Krono timepiece represents hundreds of hours of micromechanical regulation, certified Swiss tolerances, and hand-finished chamfered edges.
              </p>

              <div className="space-y-3 pt-2">
                <div className="p-3.5 rounded-2xl bg-white/90 dark:bg-[#11261D]/80 border border-[#E2E8F0] dark:border-[rgba(0,96,57,0.25)] flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-[#006039] text-white flex items-center justify-center font-bold text-xs flex-shrink-0">
                    01
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[#0F172A] dark:text-[#F8FAFC]">Swiss Chronometer Escapement</h4>
                    <p className="text-[11px] text-[#5A6D64] dark:text-[#8EAA9C]">High-beat 28,800 vph balance wheel with Parachrom hairspring and Paraflex shock absorbers.</p>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-white/90 dark:bg-[#11261D]/80 border border-[#E2E8F0] dark:border-[rgba(0,96,57,0.25)] flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-[#006039] text-white flex items-center justify-center font-bold text-xs flex-shrink-0">
                    02
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[#0F172A] dark:text-[#F8FAFC]">Double Anti-Reflective Sapphire & Cyclops</h4>
                    <p className="text-[11px] text-[#5A6D64] dark:text-[#8EAA9C]">Mohs hardness 9 synthetic sapphire crystal with 2.5x magnification date lens.</p>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-white/90 dark:bg-[#11261D]/80 border border-[#E2E8F0] dark:border-[rgba(0,96,57,0.25)] flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-[#006039] text-white flex items-center justify-center font-bold text-xs flex-shrink-0">
                    03
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[#0F172A] dark:text-[#F8FAFC]">Oystersteel (904L) & 18K Cerachrom</h4>
                    <p className="text-[11px] text-[#5A6D64] dark:text-[#8EAA9C]">Extreme corrosion-resistant aerospace superalloy paired with scratchproof ceramic bezels.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative rounded-3xl border border-[#E2E8F0] dark:border-[rgba(0,96,57,0.35)] p-2.5 overflow-hidden bg-white dark:bg-[#06110D] shadow-xl">
              <SmoothImage
                src="https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=1000&q=85"
                alt="Horological Calibre Anatomy"
                className="rounded-2xl filter brightness-[0.95]"
                containerClassName="rounded-2xl w-full h-80 sm:h-96"
              />
              <div className="absolute bottom-5 inset-x-5 p-3.5 rounded-xl bg-white/95 dark:bg-[#0B1C15]/95 backdrop-blur-md border border-[#E2E8F0] dark:border-[rgba(0,96,57,0.35)] shadow-xl flex items-center justify-between">
                <div>
                  <div className="text-[9px] text-[#006039] dark:text-[#4ADE80] uppercase font-mono font-bold">Superlative Chronometer</div>
                  <div className="text-xs font-bold text-[#0F172A] dark:text-[#F8FAFC]">Genève Calibre 3235 Movement</div>
                </div>
                <Link
                  href="/catalog"
                  className="lux-btn-primary px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider"
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
