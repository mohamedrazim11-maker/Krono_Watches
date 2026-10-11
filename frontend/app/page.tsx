"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { fetchProducts, fetchPosters, Product, Poster } from "@/lib/api";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import CartDrawer from "@/components/CartDrawer";
import WishlistDrawer from "@/components/WishlistDrawer";
import QuickViewModal from "@/components/QuickViewModal";
import CheckoutModal from "@/components/CheckoutModal";
import { useCart } from "@/lib/CartContext";
import { useAuth } from "@/lib/AuthContext";
import { getProductImage } from "@/lib/productImages";

type PriceFilterType = "all" | "under500k" | "500k-2m" | "2m-5m" | "over5m";

// ─── Navbar ────────────────────────────────────────────────────────────────────
function DarkNavbar({
  cartCount,
  wishlistCount,
  onOpenCart,
  onOpenWishlist,
  products = [],
}: {
  cartCount: number;
  wishlistCount: number;
  onOpenCart: () => void;
  onOpenWishlist: () => void;
  products?: Product[];
}) {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  
  // Interactive Search State
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Interactive Account Popover State
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const accountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Auto-focus search input when opened
  useEffect(() => {
    if (searchOpen) {
      setTimeout(() => searchInputRef.current?.focus(), 80);
    } else {
      setSearchQuery("");
    }
  }, [searchOpen]);

  // Click outside and keydown (Esc / Ctrl+K) listener
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setSearchOpen(false);
      }
      if (accountRef.current && !accountRef.current.contains(e.target as Node)) {
        setAccountMenuOpen(false);
      }
    }
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setSearchOpen(false);
        setAccountMenuOpen(false);
      }
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  // Filter products in real-time
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase().trim();
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.brand?.toLowerCase().includes(q) ||
        p.category?.toLowerCase().includes(q) ||
        p.movement?.toLowerCase().includes(q)
    ).slice(0, 5);
  }, [products, searchQuery]);

  const navLinks = [
    { label: "Watches", href: "/" },
    { label: "Catalogue", href: "/catalog" },
    { label: "About", href: "/about" },
  ];

  return (
    <>
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

          {/* Right Action Icons */}
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>

            {/* 1. Search Icon */}
            <button
              onClick={() => {
                setSearchOpen((prev) => !prev);
                setAccountMenuOpen(false);
              }}
              style={{
                background: searchOpen ? "rgba(197,160,89,0.15)" : "none",
                border: searchOpen ? "1px solid #C5A059" : "1px solid transparent",
                borderRadius: "6px",
                cursor: "pointer",
                color: searchOpen ? "#C5A059" : "#aaa",
                padding: "6px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "all 150ms",
              }}
              aria-label="Search"
              title="Search Watches (Ctrl+K)"
              onMouseEnter={(e) => { if (!searchOpen) (e.currentTarget as HTMLElement).style.color = "#fff"; }}
              onMouseLeave={(e) => { if (!searchOpen) (e.currentTarget as HTMLElement).style.color = "#aaa"; }}
            >
              <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>

            {/* 2. Wishlist Icon */}
            <button
              onClick={onOpenWishlist}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                color: wishlistCount > 0 ? "#C5A059" : "#aaa",
                padding: "6px",
                position: "relative",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "color 150ms, transform 150ms",
              }}
              aria-label="Wishlist"
              title={`Curated Wishlist (${wishlistCount})`}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.color = "#C5A059";
                (e.currentTarget as HTMLElement).style.transform = "scale(1.1)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.color = wishlistCount > 0 ? "#C5A059" : "#aaa";
                (e.currentTarget as HTMLElement).style.transform = "scale(1)";
              }}
            >
              <svg width="18" height="18" fill={wishlistCount > 0 ? "rgba(197,160,89,0.25)" : "none"} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              {wishlistCount > 0 && (
                <span style={{
                  position: "absolute", top: "-2px", right: "-2px",
                  background: "#C5A059", color: "#000", borderRadius: "50%",
                  width: "15px", height: "15px", fontSize: "9px", fontWeight: 800,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  boxShadow: "0 0 8px rgba(197,160,89,0.5)",
                }}>
                  {wishlistCount}
                </span>
              )}
            </button>

            {/* 3. Cart Icon */}
            <button
              onClick={onOpenCart}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                color: cartCount > 0 ? "#C5A059" : "#aaa",
                padding: "6px",
                position: "relative",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "color 150ms, transform 150ms",
              }}
              aria-label="Cart"
              title={`Shopping Bag (${cartCount})`}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.color = "#C5A059";
                (e.currentTarget as HTMLElement).style.transform = "scale(1.1)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.color = cartCount > 0 ? "#C5A059" : "#aaa";
                (e.currentTarget as HTMLElement).style.transform = "scale(1)";
              }}
            >
              <svg width="18" height="18" fill={cartCount > 0 ? "rgba(197,160,89,0.2)" : "none"} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              {cartCount > 0 && (
                <span style={{
                  position: "absolute", top: "-2px", right: "-2px",
                  background: "#C5A059", color: "#000", borderRadius: "50%",
                  width: "15px", height: "15px", fontSize: "9px", fontWeight: 800,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  boxShadow: "0 0 8px rgba(197,160,89,0.5)",
                }}>
                  {cartCount}
                </span>
              )}
            </button>

            {/* 4. Account Icon & Popover Menu */}
            <div ref={accountRef} style={{ position: "relative" }}>
              <button
                onClick={() => {
                  setAccountMenuOpen((prev) => !prev);
                  setSearchOpen(false);
                }}
                style={{
                  background: isAuthenticated ? "rgba(197,160,89,0.15)" : "none",
                  border: isAuthenticated ? "1px solid #C5A059" : "1px solid transparent",
                  borderRadius: "50%",
                  cursor: "pointer",
                  color: isAuthenticated ? "#C5A059" : "#aaa",
                  padding: "6px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "all 150ms",
                }}
                aria-label="Account"
                title={isAuthenticated && user ? `Signed in as ${user.name}` : "Client Account"}
                onMouseEnter={(e) => { if (!isAuthenticated) (e.currentTarget as HTMLElement).style.color = "#fff"; }}
                onMouseLeave={(e) => { if (!isAuthenticated) (e.currentTarget as HTMLElement).style.color = "#aaa"; }}
              >
                {isAuthenticated && user ? (
                  <span style={{ fontSize: "11px", fontWeight: 800, color: "#C5A059", width: "18px", height: "18px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    {user.name ? user.name.charAt(0).toUpperCase() : "U"}
                  </span>
                ) : (
                  <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                )}
              </button>

              {/* Account Dropdown Menu */}
              {accountMenuOpen && (
                <div
                  style={{
                    position: "absolute",
                    top: "calc(100% + 10px)",
                    right: 0,
                    width: "240px",
                    background: "#0c0c0c",
                    border: "1px solid #262626",
                    boxShadow: "0 16px 36px rgba(0,0,0,0.9)",
                    borderRadius: "8px",
                    overflow: "hidden",
                    zIndex: 1000,
                  }}
                >
                  {isAuthenticated && user ? (
                    <div>
                      <div style={{ padding: "14px 16px", borderBottom: "1px solid #1a1a1a", background: "#111" }}>
                        <div style={{ fontSize: "9px", color: "#C5A059", textTransform: "uppercase", letterSpacing: "0.15em", fontWeight: 700 }}>
                          ✦ Certified Client
                        </div>
                        <div style={{ fontSize: "13px", fontWeight: 700, color: "#fff", marginTop: "4px" }}>
                          {user.name}
                        </div>
                        <div style={{ fontSize: "11px", color: "#888", marginTop: "2px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {user.email}
                        </div>
                      </div>

                      <div style={{ padding: "6px" }}>
                        <Link
                          href="/profile"
                          onClick={() => setAccountMenuOpen(false)}
                          style={{
                            display: "flex", alignItems: "center", gap: "10px",
                            padding: "9px 12px", borderRadius: "6px",
                            fontSize: "12px", color: "#ccc", textDecoration: "none",
                            transition: "background 150ms, color 150ms",
                          }}
                          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "#1a1a1a"; (e.currentTarget as HTMLElement).style.color = "#fff"; }}
                          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; (e.currentTarget as HTMLElement).style.color = "#ccc"; }}
                        >
                          <span>👤</span>
                          <span>My Profile</span>
                        </Link>

                        <Link
                          href="/profile?tab=orders"
                          onClick={() => setAccountMenuOpen(false)}
                          style={{
                            display: "flex", alignItems: "center", gap: "10px",
                            padding: "9px 12px", borderRadius: "6px",
                            fontSize: "12px", color: "#ccc", textDecoration: "none",
                            transition: "background 150ms, color 150ms",
                          }}
                          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "#1a1a1a"; (e.currentTarget as HTMLElement).style.color = "#fff"; }}
                          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; (e.currentTarget as HTMLElement).style.color = "#ccc"; }}
                        >
                          <span>📜</span>
                          <span>Order History</span>
                        </Link>

                        <div style={{ borderTop: "1px solid #1a1a1a", margin: "6px 0" }} />

                        <button
                          onClick={() => {
                            setAccountMenuOpen(false);
                            logout();
                          }}
                          style={{
                            width: "100%", display: "flex", alignItems: "center", gap: "10px",
                            padding: "9px 12px", borderRadius: "6px", border: "none",
                            background: "transparent", fontSize: "12px", color: "#ef4444",
                            textAlign: "left", cursor: "pointer", transition: "background 150ms",
                          }}
                          onMouseEnter={(e) => (e.currentTarget as HTMLElement).style.background = "rgba(239,68,68,0.1)"}
                          onMouseLeave={(e) => (e.currentTarget as HTMLElement).style.background = "transparent"}
                        >
                          <span>🚪</span>
                          <span>Sign Out</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div style={{ padding: "16px" }}>
                      <div style={{ fontSize: "12px", fontWeight: 700, color: "#fff", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "4px" }}>
                        Client Sanctuary
                      </div>
                      <div style={{ fontSize: "11px", color: "#888", marginBottom: "14px", lineHeight: 1.5 }}>
                        Sign in to access your bespoke allocations, wishlist, and orders.
                      </div>

                      <Link
                        href="/login"
                        onClick={() => setAccountMenuOpen(false)}
                        style={{
                          display: "block", textAlign: "center", padding: "10px 16px",
                          background: "#C5A059", color: "#000", fontWeight: 700, fontSize: "11px",
                          textTransform: "uppercase", letterSpacing: "0.1em", textDecoration: "none",
                          borderRadius: "4px", marginBottom: "8px", transition: "background 150ms",
                        }}
                        onMouseEnter={(e) => (e.currentTarget as HTMLElement).style.background = "#d4af66"}
                        onMouseLeave={(e) => (e.currentTarget as HTMLElement).style.background = "#C5A059"}
                      >
                        Sign In
                      </Link>

                      <Link
                        href="/register"
                        onClick={() => setAccountMenuOpen(false)}
                        style={{
                          display: "block", textAlign: "center", padding: "9px 16px",
                          background: "transparent", color: "#ccc", border: "1px solid #333",
                          fontWeight: 700, fontSize: "11px", textTransform: "uppercase",
                          letterSpacing: "0.1em", textDecoration: "none", borderRadius: "4px",
                          transition: "all 150ms",
                        }}
                        onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "#fff"; (e.currentTarget as HTMLElement).style.color = "#fff"; }}
                        onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "#333"; (e.currentTarget as HTMLElement).style.color = "#ccc"; }}
                      >
                        Create Account
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </div>

          </div>
        </div>

        {/* Live Search Drawer / Modal Overlay */}
        {searchOpen && (
          <div
            ref={searchContainerRef}
            style={{
              position: "absolute",
              top: "100%",
              left: 0,
              right: 0,
              background: "rgba(10,10,10,0.98)",
              borderBottom: "1px solid #2a2a2a",
              boxShadow: "0 20px 40px rgba(0,0,0,0.85)",
              backdropFilter: "blur(20px)",
              zIndex: 1000,
              padding: "16px 24px 24px",
            }}
          >
            <div style={{ maxWidth: "800px", margin: "0 auto" }}>
              {/* Search input field */}
              <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="#C5A059" strokeWidth={2} style={{ position: "absolute", left: "14px" }}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && searchQuery.trim()) {
                      setSearchOpen(false);
                      router.push(`/catalog?q=${encodeURIComponent(searchQuery.trim())}`);
                    }
                  }}
                  placeholder="Search by calibre, reference, brand (e.g. Omega, Titanium, Chronograph)..."
                  style={{
                    width: "100%",
                    background: "#141414",
                    border: "1px solid #333",
                    borderRadius: "8px",
                    color: "#fff",
                    padding: "12px 48px 12px 42px",
                    fontSize: "13px",
                    outline: "none",
                    fontFamily: "inherit",
                    boxSizing: "border-box",
                  }}
                  onFocus={(e) => (e.target.style.borderColor = "#C5A059")}
                  onBlur={(e) => (e.target.style.borderColor = "#333")}
                />
                {searchQuery ? (
                  <button
                    onClick={() => setSearchQuery("")}
                    style={{
                      position: "absolute", right: "14px", background: "none", border: "none", color: "#888",
                      cursor: "pointer", fontSize: "14px", padding: "4px",
                    }}
                  >
                    ✕
                  </button>
                ) : (
                  <span style={{ position: "absolute", right: "14px", fontSize: "10px", color: "#555", fontFamily: "monospace", border: "1px solid #333", borderRadius: "3px", padding: "2px 5px" }}>ESC</span>
                )}
              </div>

              {/* Quick tags */}
              <div style={{ display: "flex", gap: "8px", marginTop: "12px", alignItems: "center", flexWrap: "wrap" }}>
                <span style={{ fontSize: "10px", color: "#666", textTransform: "uppercase", letterSpacing: "0.1em" }}>Quick:</span>
                {["Chronograph", "Dive Watches", "Automatic", "Titanium", "Gold"].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSearchQuery(cat)}
                    style={{
                      background: "#1a1a1a", border: "1px solid #282828", color: "#aaa",
                      padding: "4px 10px", borderRadius: "12px", fontSize: "11px", cursor: "pointer",
                      transition: "all 150ms",
                    }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "#C5A059"; (e.currentTarget as HTMLElement).style.color = "#C5A059"; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "#282828"; (e.currentTarget as HTMLElement).style.color = "#aaa"; }}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Instant Search Results */}
              {searchQuery.trim() && (
                <div style={{ marginTop: "16px", borderTop: "1px solid #222", paddingTop: "12px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", color: "#888", marginBottom: "8px" }}>
                    <span>Matching Watches ({searchResults.length})</span>
                    {searchResults.length > 0 && (
                      <Link
                        href={`/catalog?q=${encodeURIComponent(searchQuery)}`}
                        onClick={() => setSearchOpen(false)}
                        style={{ color: "#C5A059", textDecoration: "none", fontWeight: 700 }}
                      >
                        Explore Complete Catalogue →
                      </Link>
                    )}
                  </div>

                  {searchResults.length > 0 ? (
                    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                      {searchResults.map((prod) => (
                        <Link
                          key={prod.id}
                          href={`/products/${prod.id}`}
                          onClick={() => setSearchOpen(false)}
                          style={{
                            display: "flex", alignItems: "center", justifyContent: "space-between",
                            padding: "8px 12px", background: "#111", borderRadius: "6px",
                            textDecoration: "none", transition: "background 150ms",
                            border: "1px solid transparent",
                          }}
                          onMouseEnter={(e) => {
                            (e.currentTarget as HTMLElement).style.background = "#181818";
                            (e.currentTarget as HTMLElement).style.borderColor = "#333";
                          }}
                          onMouseLeave={(e) => {
                            (e.currentTarget as HTMLElement).style.background = "#111";
                            (e.currentTarget as HTMLElement).style.borderColor = "transparent";
                          }}
                        >
                          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                            <img
                              src={getProductImage(prod.id, prod.image_url)}
                              alt={prod.name}
                              style={{ width: "38px", height: "38px", objectFit: "cover", borderRadius: "4px", background: "#000" }}
                            />
                            <div>
                              <div style={{ fontSize: "10px", color: "#C5A059", textTransform: "uppercase", letterSpacing: "0.1em" }}>
                                {prod.brand || "Swiss Horology"} • {prod.category}
                              </div>
                              <div style={{ fontSize: "13px", fontWeight: 600, color: "#fff" }}>
                                {prod.name}
                              </div>
                            </div>
                          </div>
                          <div style={{ textAlign: "right" }}>
                            <div style={{ fontSize: "12px", fontWeight: 700, color: "#C5A059", fontFamily: "monospace" }}>
                              LKR {Number(prod.price || 0).toLocaleString("en-US")}
                            </div>
                            {prod.in_stock ? (
                              <span style={{ fontSize: "9px", color: "#4ade80" }}>In Stock</span>
                            ) : (
                              <span style={{ fontSize: "9px", color: "#888" }}>Reserve Only</span>
                            )}
                          </div>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <div style={{ textAlign: "center", padding: "20px 0", color: "#666", fontSize: "12px" }}>
                      No watches found matching "{searchQuery}". Try searching for another brand or model.
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </header>
    </>
  );
}

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
        products={products}
      />

      {/* Hero */}
      <HeroSection
        products={products}
        onAddToCart={(p) => {
          addToCart(p, 1);
          setIsCartOpen(true);
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
          setIsCartOpen(true);
        }}
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
        onProceedToCheckout={() => {
          setIsCartOpen(false);
          router.push("/checkout");
        }}
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
        onAddToCart={(prod, qty) => {
          addToCart(prod, qty);
          setIsCartOpen(true);
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
