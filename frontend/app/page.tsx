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
import KineticProductRow from "@/components/KineticProductRow";
import CartDrawer, { CartItem } from "@/components/CartDrawer";
import WishlistDrawer from "@/components/WishlistDrawer";
import QuickViewModal from "@/components/QuickViewModal";
import CheckoutModal from "@/components/CheckoutModal";

type PriceFilterType = "all" | "under500k" | "500k-1m" | "over1m";

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [posters, setPosters] = useState<Poster[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"kinetic" | "grid">("kinetic");

  // Filters & Search
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [priceFilter, setPriceFilter] = useState<PriceFilterType>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"featured" | "price-asc" | "price-desc" | "name">("featured");
  const [onlyInStock, setOnlyInStock] = useState(false);

  // Modals & Drawers
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  // Cart & Wishlist State
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<Product[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Promo Coupon Code
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

    try {
      const savedCart = localStorage.getItem("krono_cart");
      if (savedCart) setCart(JSON.parse(savedCart));
      const savedWishlist = localStorage.getItem("krono_wishlist");
      if (savedWishlist) setWishlist(JSON.parse(savedWishlist));
    } catch {}
  }, []);

  // Scroll Tracking for Kinetic Row Parallax
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setScrollY(window.scrollY);
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleAddToCart = (product: Product, quantity = 1) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { product, quantity }];
    });
    showToast(`Added ${product.name} to vault bag`);
  };

  const handleUpdateQuantity = (productId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.product.id === productId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const handleRemoveFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
    showToast("Reference removed from bag");
  };

  const handleToggleWishlist = (product: Product) => {
    setWishlist((prev) => {
      const exists = prev.some((p) => p.id === product.id);
      if (exists) {
        showToast("Removed from wishlist");
        return prev.filter((p) => p.id !== product.id);
      } else {
        showToast("Saved to private portfolio");
        return [...prev, product];
      }
    });
  };

  const handleApplyCoupon = (code: string) => {
    if (code.toUpperCase() === "MONO20" || code.toUpperCase() === "ROYAL20") {
      setAppliedCoupon("MONO20");
      setCouponDiscountPercent(20);
      showToast("Voucher code applied: 20% privilege");
      return true;
    }
    return false;
  };

  const handleCopyCoupon = (code: string) => {
    navigator.clipboard.writeText(code);
    handleApplyCoupon(code);
    showToast(`Copied voucher ${code}`);
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
    <div className="min-h-screen flex flex-col bg-[#F8F9FB] dark:bg-[#0B0F17] text-slate-900 dark:text-slate-100 selection:bg-slate-900 selection:text-white transition-colors duration-200">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 dark:bg-slate-800 border border-slate-700 dark:border-slate-600 text-white px-4 py-2.5 rounded-xl shadow-2xl text-xs font-mono font-bold flex items-center gap-2">
          <span className="text-emerald-400">▪</span>
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

      {/* Main Content Feed (Compact Spacing) */}
      <main className="flex-1 mx-auto max-w-7xl px-4 sm:px-6 py-5 sm:py-6 space-y-8 sm:space-y-10">
        {/* Editorial Hero Banner */}
        <HeroBanner posters={posters} products={products} onCopyCoupon={handleCopyCoupon} />

        {/* Metier Pillars */}
        <CategoryPillars
          selectedCategory={selectedCategory}
          onSelectCategory={(cat) => setSelectedCategory(cat)}
        />

        {/* Minimalist Clean Grid Section */}
        <section id="vault" className="space-y-4 sm:space-y-5">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-3 border-b border-slate-200/80 dark:border-slate-800 pb-3">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-slate-500 dark:text-slate-400 font-bold">
                The Archive
              </span>
              <h2 className="text-2xl sm:text-3xl font-black font-display text-slate-900 dark:text-white uppercase tracking-tight">
                Curated <span className="text-slate-900 dark:text-white underline decoration-slate-300 dark:decoration-slate-700 decoration-2">Catalogue Vault</span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-sans">
                {filteredProducts.length} authenticated Swiss & mechanical timepieces
              </p>
            </div>

            {/* Metier Pill Filters & View Toggle */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex flex-wrap items-center gap-1.5">
                {["All", "Luxury", "Automatic", "Sport", "Smart"].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold tracking-wider uppercase transition cursor-pointer ${
                      selectedCategory === cat
                        ? "bg-slate-900 dark:bg-white text-white dark:text-slate-950 font-bold shadow-sm"
                        : "border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:border-slate-300 dark:hover:border-slate-700 shadow-sm"
                    }`}
                  >
                    {cat === "All" ? "All Series" : cat}
                  </button>
                ))}
              </div>

              {/* Kinetic vs Standard Grid View Toggle */}
              <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 ml-auto">
                <button
                  onClick={() => setViewMode("kinetic")}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold uppercase transition flex items-center gap-1.5 cursor-pointer ${
                    viewMode === "kinetic"
                      ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm"
                      : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                  }`}
                  title="Kinetic Scroll-Cycling Carousel Mode"
                >
                  <span>⇋ Kinetic Carousel</span>
                </button>
                <button
                  onClick={() => setViewMode("grid")}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold uppercase transition flex items-center gap-1.5 cursor-pointer ${
                    viewMode === "grid"
                      ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm"
                      : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                  }`}
                  title="Standard Static Grid"
                >
                  <span>⊞ Grid</span>
                </button>
              </div>
            </div>
          </div>

          {/* Clean Quick Filter Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 p-3 sm:p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#131B2A] shadow-sm">
            <div className="relative">
              <input
                type="text"
                placeholder="Filter by reference..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-1.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-slate-800 dark:focus:border-slate-500"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-2 text-xs text-slate-400 hover:text-slate-800 dark:hover:text-white"
                >
                  ✕
                </button>
              )}
            </div>

            <div>
              <select
                value={priceFilter}
                onChange={(e) => setPriceFilter(e.target.value as PriceFilterType)}
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-1.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-slate-800 dark:focus:border-slate-500 font-mono"
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
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-1.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-slate-800 dark:focus:border-slate-500 font-mono"
              >
                <option value="featured">Featured First</option>
                <option value="price-asc">Price: Ascending</option>
                <option value="price-desc">Price: Descending</option>
                <option value="name">Reference (A-Z)</option>
              </select>
            </div>

            <div className="flex items-center justify-between px-3.5 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
              <span className="text-xs text-slate-600 dark:text-slate-400 font-mono font-semibold">In Vault Only</span>
              <input
                type="checkbox"
                checked={onlyInStock}
                onChange={(e) => setOnlyInStock(e.target.checked)}
                className="h-4 w-4 rounded accent-slate-900 dark:accent-white cursor-pointer"
              />
            </div>
          </div>

          {/* High-Precision Product Showcase */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 py-8">
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className="rounded-2xl border border-slate-200 dark:border-slate-800 p-4 space-y-4 animate-pulse bg-white dark:bg-[#131B2A]"
                >
                  <div className="aspect-square bg-slate-100 dark:bg-slate-800 rounded-xl"></div>
                  <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded w-3/4"></div>
                  <div className="h-8 bg-slate-100 dark:bg-slate-800 rounded"></div>
                </div>
              ))}
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-16 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-3 bg-white dark:bg-[#131B2A] shadow-sm">
              <div className="text-3xl text-slate-300 dark:text-slate-600">⌕</div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white font-display uppercase tracking-wider">No References Match</h3>
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
          ) : viewMode === "kinetic" ? (
            <div className="space-y-6 py-2">
              {(() => {
                // Split products into 2 or 3 kinetic rows for continuous loop cycling
                const rowCount = filteredProducts.length > 6 ? 3 : filteredProducts.length > 3 ? 2 : 1;
                const rows: Product[][] = Array.from({ length: rowCount }, () => []);
                filteredProducts.forEach((prod, i) => {
                  rows[i % rowCount].push(prod);
                });

                return rows.map((rowItems, rowIndex) => (
                  <KineticProductRow
                    key={rowIndex}
                    products={rowItems}
                    rowIndex={rowIndex}
                    scrollY={scrollY}
                    speed={0.35}
                    onAddToCart={(prod, qty) => handleAddToCart(prod, qty || 1)}
                    onToggleWishlist={handleToggleWishlist}
                    isWishlisted={(id) => wishlist.some((p) => p.id === id)}
                    onQuickView={(prod) => setQuickViewProduct(prod)}
                  />
                ));
              })()}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5 py-2">
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
          )}
        </section>

        {/* Guarantees */}
        <TrustPillars />

        {/* Testimonials */}
        <TestimonialsSection />
      </main>

      <Footer />

      {/* Slide Drawers & Modals */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveFromCart}
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
