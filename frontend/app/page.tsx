"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { fetchProducts, fetchPosters, Product, Poster } from "@/lib/api";
import { executeSearch, SearchEngineResponse } from "@/lib/searchEngine";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import WishlistDrawer from "@/components/WishlistDrawer";
import QuickViewModal from "@/components/QuickViewModal";
import CheckoutModal from "@/components/CheckoutModal";
import ThemeToggle from "@/components/ThemeToggle";
import { useCart } from "@/lib/CartContext";
import { useAuth } from "@/lib/AuthContext";
import { getProductImage } from "@/lib/productImages";

type PriceFilterType = "all" | "under500k" | "500k-2m" | "2m-5m" | "over5m";



// ─── Hero Slide ────────────────────────────────────────────────────────────────
function HeroSection({
  products,
  onAddToCart,
}: {
  products: Product[];
  onAddToCart?: (p: Product) => void;
}) {
  const [slide, setSlide] = useState(0);
  const featuredProducts = useMemo(() => products.filter((p) => p.is_featured).slice(0, 3), [products]);
  const heroProducts = featuredProducts.length > 0 ? featuredProducts : products.slice(0, 3);

  useEffect(() => {
    if (heroProducts.length <= 1) return;
    const t = setInterval(() => setSlide((s) => (s + 1) % heroProducts.length), 5000);
    return () => clearInterval(t);
  }, [heroProducts.length]);

  const current = heroProducts[slide] || heroProducts[0];

  return (
    <section style={{ position: "relative", background: "#000", minHeight: "calc(100vh - 100px)", display: "flex", alignItems: "center", overflow: "hidden" }}>
      {/* Background watch images — seamless persistent stack with smooth crossfade */}
      <div
        style={{
          position: "absolute",
          right: 0,
          top: 0,
          bottom: 0,
          width: "60%",
          zIndex: 1,
          overflow: "hidden",
          pointerEvents: "none",
        }}
      >
        {heroProducts.map((item, idx) => {
          const isActive = idx === slide;
          return (
            <div
              key={item.id}
              style={{
                position: "absolute",
                inset: "-6px", // Slight expansion so scale/subpixel rendering never leaves a visible edge line
                opacity: isActive ? 0.88 : 0,
                transform: isActive ? "scale(1)" : "scale(1.04)",
                transition: "opacity 1000ms cubic-bezier(0.4, 0, 0.2, 1), transform 1400ms cubic-bezier(0.25, 1, 0.5, 1)",
                willChange: "opacity, transform",
                pointerEvents: "none",
              }}
            >
              <img
                src={getProductImage(item.id, item.image_url)}
                alt={item.name}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  objectPosition: "center",
                  border: "none",
                  outline: "none",
                  boxShadow: "none",
                  display: "block",
                  WebkitBackfaceVisibility: "hidden",
                  backfaceVisibility: "hidden",
                }}
              />
            </div>
          );
        })}

        {/* Multi-angle seamless feathering & vignette overlays — eliminating all visible image borders */}
        {/* Left blend into pure black */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 4,
            background: "linear-gradient(to right, #000000 0%, #000000 16%, rgba(0,0,0,0.85) 36%, rgba(0,0,0,0.3) 65%, transparent 100%)",
            pointerEvents: "none",
          }}
        />

        {/* Top blend into header */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "140px",
            zIndex: 5,
            background: "linear-gradient(to bottom, #000000 0%, rgba(0,0,0,0.7) 40%, transparent 100%)",
            pointerEvents: "none",
          }}
        />

        {/* Bottom blend into stats section */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: "160px",
            zIndex: 5,
            background: "linear-gradient(to top, #000000 0%, rgba(0,0,0,0.8) 40%, transparent 100%)",
            pointerEvents: "none",
          }}
        />

        {/* Right border blend */}
        <div
          style={{
            position: "absolute",
            top: 0,
            bottom: 0,
            right: 0,
            width: "60px",
            zIndex: 5,
            background: "linear-gradient(to left, rgba(0,0,0,0.6) 0%, transparent 100%)",
            pointerEvents: "none",
          }}
        />
      </div>

      {/* Left Text Content */}
      <div style={{ position: "relative", zIndex: 2, maxWidth: "1280px", margin: "0 auto", padding: "0 48px", width: "100%", paddingTop: "80px", paddingBottom: "80px" }}>
        <div key={slide} className="hero-text-fade" style={{ maxWidth: "520px" }}>
          {/* Brand label */}
          <div style={{ fontSize: "11px", fontWeight: 700, color: "#C5A059", letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: "20px", fontFamily: "inherit" }}>
            {current?.brand || "Swiss Watches"}
          </div>

          {/* Headline */}
          <h1 style={{
            fontSize: "clamp(36px, 5vw, 68px)", fontWeight: 900, color: "#fff",
            textTransform: "uppercase", lineHeight: 1.0, letterSpacing: "-0.01em",
            marginBottom: "24px", fontFamily: "inherit",
          }}>
            {current ? current.name.split(" ").slice(0, 4).join(" ") : "Luxury Watches For"}
            <br />
            <span style={{ color: "#C5A059" }}>
              {current ? current.name.split(" ").slice(4).join(" ") || "Every Moment" : "Every Moment"}
            </span>
          </h1>

          {/* Sub */}
          <p style={{ fontSize: "13px", color: "#999", lineHeight: 1.6, marginBottom: "32px", maxWidth: "420px", fontFamily: "inherit" }}>
            {current?.description?.slice(0, 95) || "Certified luxury timepieces. Guaranteed authentic with international warranty."}
          </p>

          {/* Buttons */}
          <div style={{ display: "flex", gap: "14px", flexWrap: "wrap", alignItems: "center" }}>
            {current && (
              <button
                onClick={() => onAddToCart && onAddToCart(current)}
                style={{
                  display: "inline-block", padding: "13px 28px",
                  background: "#C5A059", border: "1px solid #C5A059", color: "#000",
                  fontSize: "11px", fontWeight: 800, letterSpacing: "0.12em",
                  textTransform: "uppercase", cursor: "pointer",
                  transition: "background 200ms, transform 150ms",
                  fontFamily: "inherit",
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "#b08d48"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "#C5A059"; }}
              >
                Buy Now • LKR {Number(current.price || 0).toLocaleString()}
              </button>
            )}
            <Link href={current ? `/products/${current.id}` : "/catalog"} style={{
              display: "inline-block", padding: "13px 28px",
              border: "1px solid #fff", color: "#fff",
              fontSize: "11px", fontWeight: 700, letterSpacing: "0.12em",
              textTransform: "uppercase", textDecoration: "none",
              transition: "background 200ms, color 200ms",
              fontFamily: "inherit",
            }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "#fff"; (e.currentTarget as HTMLElement).style.color = "#000"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; (e.currentTarget as HTMLElement).style.color = "#fff"; }}
            >
              View Watch
            </Link>
            <Link href="/catalog" style={{
              display: "inline-block", padding: "13px 28px",
              border: "1px solid #444", color: "#ccc",
              fontSize: "11px", fontWeight: 700, letterSpacing: "0.12em",
              textTransform: "uppercase", textDecoration: "none",
              transition: "border-color 200ms, color 200ms",
              fontFamily: "inherit",
            }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "#C5A059"; (e.currentTarget as HTMLElement).style.color = "#C5A059"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "#444"; (e.currentTarget as HTMLElement).style.color = "#ccc"; }}
            >
              All Watches
            </Link>
          </div>

          {/* Slide dots */}
          {heroProducts.length > 1 && (
            <div style={{ display: "flex", gap: "8px", marginTop: "48px" }}>
              {heroProducts.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setSlide(i)}
                  style={{
                    width: i === slide ? "24px" : "8px", height: "8px",
                    borderRadius: "4px",
                    background: i === slide ? "#C5A059" : "#444",
                    border: "none", cursor: "pointer",
                    transition: "all 300ms",
                    padding: 0,
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <style jsx global>{`
        @keyframes heroTextFade {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .hero-text-fade {
          animation: heroTextFade 0.6s cubic-bezier(0.16, 1, 0.3, 1) both;
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .product-reveal {
          animation: fadeInUp 0.5s ease both;
        }
      `}</style>
    </section>
  );
}

// ─── Products Section ──────────────────────────────────────────────────────────
function ProductsSection({
  products,
  loading,
  wishlist,
  onAddToCart,
  onToggleWishlist,
  onQuickView,
}: {
  products: Product[];
  loading: boolean;
  wishlist: Product[];
  onAddToCart: (p: Product) => void;
  onToggleWishlist: (p: Product) => void;
  onQuickView: (p: Product) => void;
}) {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [priceFilter, setPriceFilter] = useState<PriceFilterType>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"featured" | "price-asc" | "price-desc" | "name">("featured");
  const sectionRef = useRef<HTMLElement>(null);

  const categories = ["All", "Dive Watches", "Dress Watches", "Chronograph", "Automatic", "Digital", "Sports Watches"];

  const filtered = useMemo(() => {
    return products.filter((p) => {
      if (selectedCategory !== "All" && !p.category?.toLowerCase().includes(selectedCategory.toLowerCase())) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        if (!p.name?.toLowerCase().includes(q) && !p.brand?.toLowerCase().includes(q) && !p.category?.toLowerCase().includes(q)) return false;
      }
      if (priceFilter === "under500k" && p.price >= 500000) return false;
      if (priceFilter === "500k-2m" && (p.price < 500000 || p.price > 2000000)) return false;
      if (priceFilter === "2m-5m" && (p.price < 2000000 || p.price > 5000000)) return false;
      if (priceFilter === "over5m" && p.price <= 5000000) return false;
      return true;
    }).sort((a, b) => {
      if (sortBy === "price-asc") return a.price - b.price;
      if (sortBy === "price-desc") return b.price - a.price;
      if (sortBy === "name") return a.name.localeCompare(b.name);
      return (b.is_featured ? 1 : 0) - (a.is_featured ? 1 : 0);
    });
  }, [products, selectedCategory, searchQuery, priceFilter, sortBy]);

  const sel: React.CSSProperties = {
    background: "#111", border: "1px solid #2a2a2a", color: "#ccc",
    padding: "9px 14px", fontSize: "11px", outline: "none",
    fontFamily: "inherit", letterSpacing: "0.04em", cursor: "pointer",
    borderRadius: "0",
  };

  return (
    <section id="products" ref={sectionRef} style={{ background: "#050505", padding: "80px 0" }}>
      <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "0 24px" }}>

        {/* Section header */}
        <div style={{ marginBottom: "48px", display: "flex", flexDirection: "column", gap: "6px" }}>
          <div style={{ fontSize: "10px", fontWeight: 700, color: "#C5A059", letterSpacing: "0.2em", textTransform: "uppercase" }}>
            The Collection
          </div>
          <h2 style={{ fontSize: "clamp(24px, 3vw, 40px)", fontWeight: 900, color: "#fff", textTransform: "uppercase", letterSpacing: "-0.02em", margin: 0 }}>
            Featured Watches
          </h2>
          <p style={{ fontSize: "12px", color: "#666", marginTop: "4px" }}>
            {filtered.length} authenticated luxury watches
          </p>
        </div>

        {/* Category strip */}
        <div style={{ display: "flex", gap: "4px", flexWrap: "wrap", marginBottom: "24px", borderBottom: "1px solid #1a1a1a", paddingBottom: "20px" }}>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              style={{
                padding: "7px 16px", fontSize: "10px", fontWeight: 700,
                letterSpacing: "0.1em", textTransform: "uppercase",
                background: selectedCategory === cat ? "#C5A059" : "transparent",
                color: selectedCategory === cat ? "#000" : "#888",
                border: selectedCategory === cat ? "1px solid #C5A059" : "1px solid #2a2a2a",
                cursor: "pointer", transition: "all 150ms", fontFamily: "inherit",
              }}
            >
              {cat === "All" ? "All Series" : cat}
            </button>
          ))}
        </div>

        {/* Filter bar */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px", marginBottom: "40px" }}>
          <div style={{ position: "relative" }}>
            <input
              type="text"
              placeholder="Search by reference, brand..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ ...sel, width: "100%", boxSizing: "border-box", paddingRight: "32px" }}
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery("")} style={{ position: "absolute", right: "10px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "#666", cursor: "pointer", fontSize: "12px" }}>✕</button>
            )}
          </div>
          <select value={priceFilter} onChange={(e) => setPriceFilter(e.target.value as PriceFilterType)} style={sel}>
            <option value="all">All Price Ranges</option>
            <option value="under500k">Under LKR 500,000</option>
            <option value="500k-2m">LKR 500K – 2M</option>
            <option value="2m-5m">LKR 2M – 5M</option>
            <option value="over5m">Over LKR 5M</option>
          </select>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value as any)} style={sel}>
            <option value="featured">Featured First</option>
            <option value="price-asc">Price: Low → High</option>
            <option value="price-desc">Price: High → Low</option>
            <option value="name">Name A–Z</option>
          </select>
        </div>

        {/* Grid */}
        {loading ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: "20px" }}>
            {[...Array(8)].map((_, i) => (
              <div key={i} style={{ background: "#111", borderRadius: "0", height: "320px", animation: "pulse 1.5s ease-in-out infinite" }} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "80px 0", color: "#555" }}>
            <div style={{ fontSize: "40px", marginBottom: "12px" }}>⌕</div>
            <div style={{ fontSize: "16px", fontWeight: 700, color: "#ccc", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "8px" }}>No Matches Found</div>
            <div style={{ fontSize: "12px", marginBottom: "20px" }}>Try adjusting your filters</div>
            <button onClick={() => { setSelectedCategory("All"); setSearchQuery(""); setPriceFilter("all"); }}
              style={{ padding: "10px 24px", background: "transparent", border: "1px solid #C5A059", color: "#C5A059", fontSize: "11px", fontWeight: 700, letterSpacing: "0.1em", cursor: "pointer", textTransform: "uppercase" }}>
              Clear Filters
            </button>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "2px" }}>
            {filtered.map((product, i) => (
              <div key={product.id} className="product-reveal" style={{ animationDelay: `${i * 60}ms` }}>
                <ProductCard
                  product={product}
                  onAddToCart={(prod) => onAddToCart(prod)}
                  onToggleWishlist={(prod) => onToggleWishlist(prod)}
                  isWishlisted={wishlist.some((p) => p.id === product.id)}
                  onQuickView={(prod) => onQuickView(prod)}
                />
              </div>
            ))}
          </div>
        )}
      </div>
      <style jsx global>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
        select option { background: #111; color: #ccc; }
        input::placeholder { color: #555; }
      `}</style>
    </section>
  );
}

// ─── Page Root ─────────────────────────────────────────────────────────────────
export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [posters, setPosters] = useState<Poster[]>([]);
  const [loading, setLoading] = useState(true);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);

  const router = useRouter();
  const {
    cart, wishlist, addToCart, removeFromCart, updateQuantity, clearCart,
    toggleWishlist, isCartOpen, setIsCartOpen, isWishlistOpen, setIsWishlistOpen,
    isCheckoutOpen, setIsCheckoutOpen, appliedCoupon, couponDiscountPercent,
    applyCoupon, grandTotal, toastMessage,
  } = useCart();

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const [prodRes, postRes] = await Promise.all([fetchProducts(), fetchPosters()]);
        setProducts(prodRes || []);
        setPosters(postRes || []);
      } catch (err) {
        console.error("Error loading home data:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
    setIsCartOpen(false);
    setIsWishlistOpen(false);
  }, [setIsCartOpen, setIsWishlistOpen]);

  const totalCartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div style={{ minHeight: "100vh", background: "#000", color: "#fff", fontFamily: "'Inter', 'SF Pro Display', system-ui, sans-serif" }}>

      {/* Toast */}
      {toastMessage && (
        <div style={{
          position: "fixed", bottom: "24px", right: "24px", zIndex: 9999,
          background: "#111", border: "1px solid #C5A059", borderLeft: "3px solid #C5A059",
          borderRadius: "0", padding: "12px 20px",
          fontSize: "12px", fontWeight: 600, color: "#C5A059",
          boxShadow: "0 4px 24px rgba(0,0,0,0.8)",
          animation: "fadeInUp 0.3s ease",
          display: "flex", alignItems: "center", gap: "12px",
        }}>
          <span>✦ {toastMessage}</span>
          <Link
            href="/cart"
            style={{
              padding: "4px 10px", background: "#C5A059", color: "#000",
              fontWeight: 700, fontSize: "10px", textTransform: "uppercase",
              textDecoration: "none", display: "inline-block", letterSpacing: "0.08em",
            }}
          >
            View Cart →
          </Link>
        </div>
      )}

      {/* Navbar */}
      <Navbar
        cartCount={totalCartCount}
        wishlistCount={wishlist.length}
      />

      {/* Hero */}
      <HeroSection
        products={products}
        onAddToCart={(p) => {
          addToCart(p, 1);
        }}
      />

      {/* Divider */}
      <div style={{ background: "#0a0a0a", borderTop: "1px solid #1a1a1a", padding: "20px 0" }}>
        <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "0 24px", display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "24px", textAlign: "center" }}>
          {[
            { icon: "🕐", label: "Certified Watches", sub: "100% Authentic" },
            { icon: "📦", label: "Free Shipping", sub: "Worldwide delivery" },
            { icon: "✦", label: "5-Year Warranty", sub: "Full coverage" },
          ].map((item) => (
            <div key={item.label} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "6px", padding: "16px 0" }}>
              <span style={{ fontSize: "20px" }}>{item.icon}</span>
              <div style={{ fontSize: "11px", fontWeight: 700, color: "#ccc", letterSpacing: "0.1em", textTransform: "uppercase" }}>{item.label}</div>
              <div style={{ fontSize: "10px", color: "#666" }}>{item.sub}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Products */}
      <ProductsSection
        products={products}
        loading={loading}
        wishlist={wishlist}
        onAddToCart={(p) => {
          addToCart(p, 1);
        }}
        onToggleWishlist={toggleWishlist}
        onQuickView={setQuickViewProduct}
      />

      {/* Footer */}
      <Footer />

      {/* Drawers & Modals */}
      <WishlistDrawer
        isOpen={isWishlistOpen}
        onClose={() => setIsWishlistOpen(false)}
        wishlist={wishlist}
        onRemoveFromWishlist={(id) => toggleWishlist({ id } as any)}
        onMoveToCart={(prod) => { addToCart(prod, 1); toggleWishlist(prod); }}
      />

      <QuickViewModal
        product={quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
        onAddToCart={(prod, qty) => {
          addToCart(prod, qty);
        }}
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
