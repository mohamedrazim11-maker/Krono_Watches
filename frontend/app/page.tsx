"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import Link from "next/link";
import { fetchProducts, fetchPosters, Product, Poster } from "@/lib/api";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import CartDrawer from "@/components/CartDrawer";
import WishlistDrawer from "@/components/WishlistDrawer";
import QuickViewModal from "@/components/QuickViewModal";
import CheckoutModal from "@/components/CheckoutModal";
import { useCart } from "@/lib/CartContext";
import { getProductImage } from "@/lib/productImages";

type PriceFilterType = "all" | "under500k" | "500k-2m" | "2m-5m" | "over5m";

// ─── Navbar ────────────────────────────────────────────────────────────────────
function DarkNavbar({
  cartCount,
  wishlistCount,
  onOpenCart,
  onOpenWishlist,
}: {
  cartCount: number;
  wishlistCount: number;
  onOpenCart: () => void;
  onOpenWishlist: () => void;
}) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const navLinks = [
    { label: "Watches", href: "/" },
    { label: "Catalogue", href: "/catalog" },
    { label: "About", href: "/about" },
    { label: "Admin", href: "/admin" },
  ];

  return (
    <>
      {/* Announcement bar */}
      <div style={{ background: "#111", borderBottom: "1px solid #222", textAlign: "center", padding: "7px 16px", fontSize: "11px", color: "#999", letterSpacing: "0.06em", fontFamily: "inherit" }}>
        Custom Logo Watches &amp; More, Free Shipping &amp; Returns
      </div>

      {/* Main Navbar */}
      <header style={{
        position: "sticky", top: 0, zIndex: 999,
        background: scrolled ? "rgba(0,0,0,0.97)" : "#000",
        borderBottom: "1px solid #1a1a1a",
        backdropFilter: "blur(12px)",
        transition: "background 300ms",
      }}>
        <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "0 24px", height: "64px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>

          {/* Logo */}
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: "10px", textDecoration: "none" }}>
            <img src="/icon.jpg" alt="Krono" style={{ height: "32px", width: "32px", borderRadius: "4px", objectFit: "cover" }} />
            <div>
              <div style={{ fontSize: "15px", fontWeight: 800, color: "#fff", letterSpacing: "0.18em", fontFamily: "inherit", textTransform: "uppercase" }}>KRONO</div>
              <div style={{ fontSize: "9px", color: "#888", letterSpacing: "0.1em", marginTop: "-2px", fontFamily: "inherit" }}>Watches</div>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav style={{ display: "flex", alignItems: "center", gap: "36px" }}>
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href} style={{
                fontSize: "11px", fontWeight: 700, color: "#ccc",
                letterSpacing: "0.12em", textTransform: "uppercase",
                textDecoration: "none", transition: "color 150ms",
                paddingBottom: "2px",
                borderBottom: link.href === "/" ? "1px solid #C5A059" : "1px solid transparent",
              }}
                onMouseEnter={(e) => (e.currentTarget as HTMLElement).style.color = "#fff"}
                onMouseLeave={(e) => (e.currentTarget as HTMLElement).style.color = link.href === "/" ? "#fff" : "#ccc"}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right Icons */}
          <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
            {/* Search */}
            <button style={{ background: "none", border: "none", cursor: "pointer", color: "#aaa", padding: "4px", display: "flex" }} aria-label="Search">
              <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>

            {/* Wishlist */}
            <button onClick={onOpenWishlist} style={{ background: "none", border: "none", cursor: "pointer", color: "#aaa", padding: "4px", position: "relative", display: "flex" }} aria-label="Wishlist">
              <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              {wishlistCount > 0 && (
                <span style={{ position: "absolute", top: "-4px", right: "-4px", background: "#C5A059", color: "#000", borderRadius: "50%", width: "14px", height: "14px", fontSize: "8px", fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {wishlistCount}
                </span>
              )}
            </button>

            {/* Cart */}
            <button onClick={onOpenCart} style={{ background: "none", border: "none", cursor: "pointer", color: "#aaa", padding: "4px", position: "relative", display: "flex" }} aria-label="Cart">
              <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              {cartCount > 0 && (
                <span style={{ position: "absolute", top: "-4px", right: "-4px", background: "#C5A059", color: "#000", borderRadius: "50%", width: "14px", height: "14px", fontSize: "8px", fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {cartCount}
                </span>
              )}
            </button>

            {/* Account */}
            <button style={{ background: "none", border: "none", cursor: "pointer", color: "#aaa", padding: "4px", display: "flex" }} aria-label="Account">
              <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </button>
          </div>
        </div>
      </header>
    </>
  );
}

// ─── Hero Slide ────────────────────────────────────────────────────────────────
function HeroSection({ products }: { products: Product[] }) {
  const [slide, setSlide] = useState(0);
  const featuredProducts = useMemo(() => products.filter((p) => p.is_featured).slice(0, 3), [products]);
  const heroProducts = featuredProducts.length > 0 ? featuredProducts : products.slice(0, 3);

  useEffect(() => {
    if (heroProducts.length <= 1) return;
    const t = setInterval(() => setSlide((s) => (s + 1) % heroProducts.length), 5000);
    return () => clearInterval(t);
  }, [heroProducts.length]);

  const current = heroProducts[slide];

  return (
    <section style={{ position: "relative", background: "#000", minHeight: "calc(100vh - 100px)", display: "flex", alignItems: "center", overflow: "hidden" }}>
      {/* Background watch image — right half */}
      {current && (
        <div style={{ position: "absolute", right: 0, top: 0, bottom: 0, width: "60%", zIndex: 1 }}>
          <img
            key={current.id}
            src={getProductImage(current.id, current.image_url)}
            alt={current.name}
            style={{
              width: "100%", height: "100%", objectFit: "cover", objectPosition: "center",
              opacity: 0.85,
              animation: "heroFadeIn 0.8s ease",
            }}
          />
          {/* Gradient overlay left edge */}
          <div style={{
            position: "absolute", inset: 0,
            background: "linear-gradient(to right, #000 0%, #000 15%, rgba(0,0,0,0.5) 45%, transparent 100%)",
          }} />
        </div>
      )}

      {/* Left Text Content */}
      <div style={{ position: "relative", zIndex: 2, maxWidth: "1280px", margin: "0 auto", padding: "0 48px", width: "100%", paddingTop: "80px", paddingBottom: "80px" }}>
        <div style={{ maxWidth: "520px" }}>
          {/* Brand label */}
          <div style={{ fontSize: "11px", fontWeight: 700, color: "#C5A059", letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: "20px", fontFamily: "inherit" }}>
            {current?.brand || "Swiss Horology"}
          </div>

          {/* Headline */}
          <h1 style={{
            fontSize: "clamp(36px, 5vw, 68px)", fontWeight: 900, color: "#fff",
            textTransform: "uppercase", lineHeight: 1.0, letterSpacing: "-0.01em",
            marginBottom: "24px", fontFamily: "inherit",
          }}>
            {current ? current.name.split(" ").slice(0, 4).join(" ") : "Custom Watches For"}
            <br />
            <span style={{ color: "#C5A059" }}>
              {current ? current.name.split(" ").slice(4).join(" ") || "Any Occasion" : "Any Occasion"}
            </span>
          </h1>

          {/* Sub */}
          <p style={{ fontSize: "13px", color: "#999", lineHeight: 1.7, marginBottom: "36px", maxWidth: "420px", fontFamily: "inherit" }}>
            {current?.description?.slice(0, 120) || "Precision Swiss mechanical horology. Certified chronometers crafted for timeless elegance."}
          </p>

          {/* Buttons */}
          <div style={{ display: "flex", gap: "14px", flexWrap: "wrap" }}>
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
              View This Piece
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
              Full Catalogue
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
        @keyframes heroFadeIn {
          from { opacity: 0; transform: scale(1.03); }
          to { opacity: 0.85; transform: scale(1); }
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
            Curated Timepieces
          </h2>
          <p style={{ fontSize: "12px", color: "#666", marginTop: "4px" }}>
            {filtered.length} authenticated Swiss mechanical timepieces
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
  }, []);

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
        }}>
          ✦ {toastMessage}
        </div>
      )}

      {/* Navbar */}
      <DarkNavbar
        cartCount={totalCartCount}
        wishlistCount={wishlist.length}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenWishlist={() => setIsWishlistOpen(true)}
      />

      {/* Hero */}
      <HeroSection products={products} />

      {/* Divider */}
      <div style={{ background: "#0a0a0a", borderTop: "1px solid #1a1a1a", padding: "20px 0" }}>
        <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "0 24px", display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "24px", textAlign: "center" }}>
          {[
            { icon: "🕐", label: "Swiss Certified", sub: "Superlative chronometers" },
            { icon: "📦", label: "Free Shipping", sub: "On all orders worldwide" },
            { icon: "✦", label: "5-Year Warranty", sub: "Global certified service" },
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
        onAddToCart={(p) => addToCart(p, 1)}
        onToggleWishlist={toggleWishlist}
        onQuickView={setQuickViewProduct}
      />

      {/* Footer */}
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
        onMoveToCart={(prod) => { addToCart(prod, 1); toggleWishlist(prod); setIsCartOpen(true); }}
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
