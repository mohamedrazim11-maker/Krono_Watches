"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { fetchProducts, Product } from "@/lib/api";
import SmoothImage from "./SmoothImage";
import { useCart } from "@/lib/CartContext";
import { useAuth } from "@/lib/AuthContext";

interface NavbarProps {
  cartCount?: number;
  wishlistCount?: number;
  onOpenCart?: () => void;
  onOpenWishlist?: () => void;
  searchQuery?: string;
  onSearchChange?: (val: string) => void;
  showSearch?: boolean;
}

export default function Navbar({
  cartCount,
  wishlistCount,
  onOpenCart,
  onOpenWishlist,
  searchQuery = "",
  onSearchChange,
  showSearch = true,
}: NavbarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuth();
  const cartContext = useCart();

  const effectiveCartCount = cartCount !== undefined ? cartCount : cartContext.totalItems;
  const effectiveWishlistCount = wishlistCount !== undefined ? wishlistCount : cartContext.wishlist.length;
  const effectiveOpenCart = onOpenCart || (() => cartContext.setIsCartOpen(true));
  const effectiveOpenWishlist = onOpenWishlist || (() => cartContext.setIsWishlistOpen(true));

  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const mobileSearchContainerRef = useRef<HTMLDivElement>(null);

  const navLinks = [
    { label: "Watches", href: "/" },
    { label: "Catalogue", href: "/catalog" },
    { label: "About", href: "/about" },
    { label: "Admin", href: "/admin" },
  ];

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Fetch product dataset for instant live search preview
  useEffect(() => {
    let isMounted = true;
    async function loadSearchProducts() {
      try {
        const prods = await fetchProducts();
        if (isMounted && prods) {
          setAllProducts(prods);
        }
      } catch (e) {
        console.error("Live search preload error:", e);
      }
    }
    loadSearchProducts();
    return () => {
      isMounted = false;
    };
  }, []);

  // Close dropdown on click outside or escape key
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(e.target as Node) &&
        mobileSearchContainerRef.current &&
        !mobileSearchContainerRef.current.contains(e.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    }

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setIsDropdownOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const searchResults = searchQuery.trim()
    ? allProducts
        .filter((p) => {
          const q = searchQuery.toLowerCase();
          return (
            p.name?.toLowerCase().includes(q) ||
            p.brand?.toLowerCase().includes(q) ||
            p.category?.toLowerCase().includes(q) ||
            p.movement?.toLowerCase().includes(q)
          );
        })
        .slice(0, 6)
    : [];

  const handleSelectProduct = (id: string) => {
    setIsDropdownOpen(false);
    if (onSearchChange) onSearchChange("");
    router.push(`/products/${id}`);
  };

  const formatCurrency = (amount: number) => {
    return `LKR ${Number(amount || 0).toLocaleString("en-US")}`;
  };

  return (
    <>
      {/* Announcement bar */}
      <div className="bg-[#111] border-b border-[#222] text-center py-2 px-4 text-[11px] text-[#888] tracking-widest uppercase font-mono">
        Custom Logo Watches &amp; More • Insured Express Delivery Worldwide
      </div>

      {/* Main Luxury Black Navbar */}
      <header
        className={`sticky top-0 z-50 transition-all duration-300 border-b ${
          scrolled ? "bg-black/95 backdrop-blur-md border-[#222]" : "bg-black border-[#1a1a1a]"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 text-decoration-none flex-shrink-0">
            <img
              src="/icon.jpg"
              alt="Krono"
              className="h-8 w-8 rounded object-cover border border-white/10"
            />
            <div>
              <div className="text-sm font-extrabold text-white tracking-[0.2em] uppercase font-sans">
                KRONO
              </div>
              <div className="text-[9px] text-[#888] tracking-[0.15em] -mt-0.5 font-mono">
                HAUTE HORLOGERIE
              </div>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-[11px] font-bold tracking-[0.14em] uppercase transition-colors pb-1 border-b-2 ${
                    isActive
                      ? "text-white border-[#C5A059]"
                      : "text-[#aaa] border-transparent hover:text-white"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Live Search Bar */}
          {showSearch && onSearchChange && (
            <div
              ref={searchContainerRef}
              className="hidden md:flex relative items-center flex-1 max-w-xs lg:max-w-sm"
            >
              <div className="relative w-full">
                <input
                  type="text"
                  placeholder="Search calibre, reference..."
                  value={searchQuery}
                  onFocus={() => {
                    if (searchQuery.trim()) setIsDropdownOpen(true);
                  }}
                  onChange={(e) => {
                    onSearchChange(e.target.value);
                    setIsDropdownOpen(true);
                  }}
                  className="w-full bg-[#111] border border-[#2a2a2a] focus:border-[#C5A059] rounded-lg pl-4 pr-9 py-2 text-xs text-white placeholder-white/40 focus:outline-none transition-colors font-mono"
                />
                {searchQuery ? (
                  <button
                    onClick={() => {
                      onSearchChange("");
                      setIsDropdownOpen(false);
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white text-xs font-bold"
                  >
                    ✕
                  </button>
                ) : (
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 text-xs">
                    ⌕
                  </span>
                )}
              </div>

              {/* Live Search Dropdown */}
              {isDropdownOpen && searchQuery.trim() && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-[#0D0D0D] border border-white/15 rounded-xl overflow-hidden shadow-2xl z-50">
                  <div className="p-3 bg-[#141414] border-b border-white/10 flex items-center justify-between text-[10px] font-mono text-white/60 uppercase tracking-wider">
                    <span>Vault References</span>
                    <span className="text-[#C5A059] font-bold">
                      {searchResults.length} matches
                    </span>
                  </div>

                  {searchResults.length > 0 ? (
                    <div className="divide-y divide-white/5 max-h-80 overflow-y-auto">
                      {searchResults.map((prod) => (
                        <div
                          key={prod.id}
                          onClick={() => handleSelectProduct(prod.id)}
                          className="flex items-center gap-3 p-3 hover:bg-white/5 cursor-pointer transition group"
                        >
                          <div className="h-10 w-10 rounded bg-black border border-white/10 overflow-hidden flex-shrink-0">
                            <SmoothImage
                              src={prod.image_url}
                              alt={prod.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                            />
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="text-[9px] font-mono uppercase text-[#C5A059] font-bold truncate">
                              {prod.brand} • {prod.category}
                            </div>
                            <div className="text-xs font-semibold text-white group-hover:text-[#C5A059] truncate">
                              {prod.name}
                            </div>
                          </div>

                          <div className="text-right flex-shrink-0">
                            <div className="text-xs font-mono font-bold text-[#C5A059]">
                              {formatCurrency(prod.price)}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-6 text-center text-xs text-white/50 font-mono">
                      No matching calibres found.
                    </div>
                  )}

                  <div className="p-2.5 bg-[#141414] border-t border-white/10 text-center">
                    <Link
                      href={`/catalog?q=${encodeURIComponent(searchQuery)}`}
                      onClick={() => setIsDropdownOpen(false)}
                      className="text-[10px] font-mono font-bold text-[#C5A059] hover:underline uppercase tracking-wider block"
                    >
                      Explore Complete Catalogue →
                    </Link>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Right Action Icons */}
          <div className="flex items-center gap-3">
            {/* Wishlist Button */}
            <button
              onClick={effectiveOpenWishlist}
              className="relative p-2 text-white/70 hover:text-white transition-colors"
              title="Saved Timepieces"
              aria-label="Wishlist"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.6}
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </svg>
              {effectiveWishlistCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-[#C5A059] text-black text-[9px] font-bold h-4 w-4 rounded-full flex items-center justify-center font-mono">
                  {effectiveWishlistCount}
                </span>
              )}
            </button>

            {/* Cart Button */}
            <button
              onClick={effectiveOpenCart}
              className="relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/20 hover:border-[#C5A059] text-white transition-all cursor-pointer group"
              title="Shopping Cart"
              aria-label="Cart"
            >
              <svg className="w-4 h-4 text-white/80 group-hover:text-[#C5A059] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.8}
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
              <span className="hidden sm:inline text-[11px] font-bold uppercase tracking-wider text-white">
                Cart
              </span>
              {effectiveCartCount > 0 && (
                <span className="bg-[#C5A059] text-black text-[9px] font-bold h-4 min-w-[16px] px-1 rounded-full flex items-center justify-center font-mono">
                  {effectiveCartCount}
                </span>
              )}
            </button>

            {/* Auth Controls */}
            {isAuthenticated && user ? (
              <div className="flex items-center gap-2">
                <Link
                  href="/profile"
                  className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg border border-white/20 hover:border-[#C5A059] text-white transition-all"
                  title={`Signed in as ${user.name}`}
                >
                  <div className="w-5 h-5 rounded-full bg-[#C5A059] text-black font-serif font-bold text-[10px] flex items-center justify-center">
                    {user.name ? user.name.charAt(0).toUpperCase() : "U"}
                  </div>
                  <span className="hidden md:inline text-xs font-medium max-w-[80px] truncate">
                    {user.name.split(" ")[0]}
                  </span>
                </Link>
                <button
                  onClick={logout}
                  className="p-1.5 text-white/50 hover:text-red-400 transition-colors"
                  title="Sign Out"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#C5A059] text-[#C5A059] hover:bg-[#C5A059] hover:text-black text-xs font-bold uppercase tracking-wider transition-all"
              >
                <span className="hidden sm:inline">Sign In</span>
                <span className="sm:hidden">Login</span>
              </Link>
            )}

            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-white/70 hover:text-white lg:hidden"
              aria-label="Toggle Menu"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-[#0A0A0A] border-t border-[#1a1a1a] px-5 py-4 space-y-3">
            {showSearch && onSearchChange && (
              <div ref={mobileSearchContainerRef} className="relative">
                <input
                  type="text"
                  placeholder="Search reference, calibre..."
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                  className="w-full bg-[#111] border border-[#2a2a2a] rounded-lg px-3 py-2 text-xs text-white placeholder-white/40 focus:outline-none font-mono"
                />
              </div>
            )}

            <nav className="flex flex-col space-y-1 pt-2">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`px-3 py-2 rounded-lg text-xs font-bold tracking-wider uppercase flex items-center justify-between ${
                    pathname === link.href
                      ? "bg-[#C5A059] text-black"
                      : "text-white/70 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <span>{link.label}</span>
                  <span>→</span>
                </Link>
              ))}

              <div className="pt-2 border-t border-white/10 space-y-1">
                {isAuthenticated && user ? (
                  <>
                    <Link
                      href="/profile"
                      onClick={() => setMobileMenuOpen(false)}
                      className="px-3 py-2 rounded-lg text-xs font-bold text-[#C5A059] hover:bg-white/5 flex items-center justify-between"
                    >
                      <span>My Vault Profile ({user.name})</span>
                      <span>→</span>
                    </Link>
                    <button
                      onClick={() => {
                        setMobileMenuOpen(false);
                        logout();
                      }}
                      className="w-full text-left px-3 py-2 rounded-lg text-xs font-bold text-red-400 hover:bg-white/5 flex items-center justify-between"
                    >
                      <span>Sign Out</span>
                      <span>✕</span>
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      href="/login"
                      onClick={() => setMobileMenuOpen(false)}
                      className="px-3 py-2 rounded-lg text-xs font-bold text-[#C5A059] hover:bg-white/5 flex items-center justify-between"
                    >
                      <span>Sign In</span>
                      <span>→</span>
                    </Link>
                    <Link
                      href="/register"
                      onClick={() => setMobileMenuOpen(false)}
                      className="px-3 py-2 rounded-lg text-xs font-bold text-white/60 hover:bg-white/5 flex items-center justify-between"
                    >
                      <span>Register New Account</span>
                      <span>→</span>
                    </Link>
                  </>
                )}
              </div>
            </nav>
          </div>
        )}
      </header>
    </>
  );
}
