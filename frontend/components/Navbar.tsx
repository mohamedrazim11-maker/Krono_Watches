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
  showSearch = false,
}: NavbarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuth();
  const cartContext = useCart();

  const effectiveCartCount = cartCount !== undefined ? cartCount : cartContext.totalItems;
  const effectiveWishlistCount = wishlistCount !== undefined ? wishlistCount : cartContext.wishlist.length;
  const effectiveOpenCart = onOpenCart || (() => cartContext.setIsCartOpen(true));
  const effectiveOpenWishlist = onOpenWishlist || (() => cartContext.setIsWishlistOpen(true));

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const mobileSearchContainerRef = useRef<HTMLDivElement>(null);

  const navLinks = [
    { label: "Boutique", href: "/" },
    { label: "Catalogue", href: "/catalog" },
    { label: "Cart", href: "/cart" },
    { label: "Atelier Heritage", href: "/about" },
    { label: "Console", href: "/admin" },
  ];

  // Initialize theme from localStorage or OS preference
  useEffect(() => {
    try {
      const savedTheme = localStorage.getItem("krono_theme") as "light" | "dark" | null;
      if (savedTheme) {
        setTheme(savedTheme);
        if (savedTheme === "dark") {
          document.documentElement.classList.add("dark");
        } else {
          document.documentElement.classList.remove("dark");
        }
      } else if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
        setTheme("dark");
        document.documentElement.classList.add("dark");
      }
    } catch {}
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === "light" ? "dark" : "light";
    setTheme(nextTheme);
    try {
      localStorage.setItem("krono_theme", nextTheme);
    } catch {}
    if (nextTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

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

  // Filter products dynamically based on search query
  const searchResults = searchQuery.trim()
    ? allProducts
        .filter((p) => {
          const q = searchQuery.toLowerCase();
          return (
            p.name?.toLowerCase().includes(q) ||
            p.brand?.toLowerCase().includes(q) ||
            p.category?.toLowerCase().includes(q) ||
            p.movement?.toLowerCase().includes(q) ||
            p.case_size?.toLowerCase().includes(q) ||
            p.description?.toLowerCase().includes(q)
          );
        })
        .slice(0, 5)
    : [];

  const formatCurrency = (amount?: number) => {
    return `LKR ${Number(amount || 0).toLocaleString("en-US")}`;
  };

  const handleSelectProduct = (productId: string) => {
    setIsDropdownOpen(false);
    if (onSearchChange) onSearchChange("");
    router.push(`/products/${productId}`);
  };

  return (
    <header className="sticky top-0 z-40 bg-[#E8EEF3]/90 dark:bg-[#0E1A16]/90 backdrop-blur-xl border-b border-[rgba(255,255,255,0.7)] dark:border-[rgba(255,255,255,0.06)] shadow-[0_6px_20px_rgba(166,180,200,0.35)] dark:shadow-[0_8px_24px_rgba(0,0,0,0.6)] transition-all duration-300">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 py-3 gap-3 lg:gap-6">
        {/* Brand Crest & Logo */}
        <Link href="/" className="flex items-center gap-3 group flex-shrink-0">
          <div className="relative p-1 rounded-2xl neu-raised group-hover:scale-105 transition-transform duration-300 flex items-center justify-center">
            <img
              src="/icon.jpg"
              alt="Krono Logo"
              className="h-8 w-8 sm:h-9 sm:w-9 rounded-xl object-contain"
            />
          </div>
          <div>
            <div className="text-base font-black tracking-[0.25em] text-[#0F172A] dark:text-[#F8FAFC] font-display uppercase flex items-center gap-1.5">
              <span>K R O N O</span>
              <span className="h-1.5 w-1.5 rounded-full bg-[#006039] dark:bg-[#00A362] animate-pulse"></span>
            </div>
            <div className="text-[8px] uppercase tracking-[0.3em] text-[#5A6D64] dark:text-[#8EAA9C] font-mono font-semibold">
              Haute Horlogerie • Genève
            </div>
          </div>
        </Link>

        {/* Center Navigation Links with Soft Neumorphic Inset Well */}
        <nav className="hidden lg:flex items-center gap-1.5 p-1.5 rounded-full neu-inset">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`px-4 py-1.5 rounded-full text-xs font-bold tracking-wider transition-all duration-200 cursor-pointer ${
                  isActive
                    ? "neu-btn-primary shadow-md scale-105 text-white"
                    : "text-[#475569] dark:text-[#CBD5E1] hover:text-[#006039] dark:hover:text-[#4ADE80] hover:neu-raised-sm"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Live Search Bar with Neumorphic Inset Tray */}
        {showSearch && onSearchChange && (
          <div
            ref={searchContainerRef}
            className="hidden md:flex relative items-center flex-1 max-w-xs lg:max-w-sm"
          >
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Search reference, calibre..."
                value={searchQuery}
                onFocus={() => {
                  if (searchQuery.trim()) setIsDropdownOpen(true);
                }}
                onChange={(e) => {
                  onSearchChange(e.target.value);
                  setIsDropdownOpen(true);
                }}
                className="w-full neu-inset rounded-full pl-4 pr-9 py-2 text-xs text-[#0F172A] dark:text-[#F8FAFC] placeholder-[#64748B] dark:placeholder-[#8EAA9C] focus:outline-none focus:ring-2 focus:ring-[#006039]/40 dark:focus:ring-[#00A362]/40 transition-all font-sans"
              />
              {searchQuery ? (
                <button
                  onClick={() => {
                    onSearchChange("");
                    setIsDropdownOpen(false);
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748B] hover:text-[#0F172A] dark:hover:text-white text-xs font-bold cursor-pointer"
                >
                  ✕
                </button>
              ) : (
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#006039] dark:text-[#00A362] text-xs pointer-events-none font-bold">
                  ⌕
                </span>
              )}
            </div>

            {/* Live Interactive Search Results Dropdown with Neumorphic Modal Surface */}
            {isDropdownOpen && searchQuery.trim() && (
              <div className="absolute top-full left-0 right-0 mt-3 rounded-2xl neu-raised-lg overflow-hidden z-50 animate-pageEnter border border-[rgba(255,255,255,0.8)] dark:border-[rgba(255,255,255,0.08)]">
                <div className="p-3 bg-[#E8EEF3] dark:bg-[#12221D] border-b border-[rgba(166,180,200,0.3)] dark:border-[rgba(255,255,255,0.06)] flex items-center justify-between text-[10px] font-mono text-[#5A6D64] dark:text-[#8EAA9C] uppercase tracking-wider">
                  <span>Vault References</span>
                  <span className="font-bold text-[#006039] dark:text-[#4ADE80]">
                    {searchResults.length} matches
                  </span>
                </div>

                {searchResults.length > 0 ? (
                  <div className="divide-y divide-[rgba(166,180,200,0.2)] dark:divide-[rgba(255,255,255,0.04)] max-h-80 overflow-y-auto">
                    {searchResults.map((prod) => (
                      <div
                        key={prod.id}
                        onClick={() => handleSelectProduct(prod.id)}
                        className="flex items-center gap-3 p-3 hover:bg-[#DCE4EC] dark:hover:bg-[#182C25] cursor-pointer transition group"
                      >
                        <SmoothImage
                          src={prod.image_url}
                          alt={prod.name}
                          className="group-hover:scale-105 transition-transform duration-300"
                          containerClassName="h-11 w-11 rounded-xl neu-inset overflow-hidden flex-shrink-0"
                        />

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 text-[9px] font-mono uppercase text-[#5A6D64] dark:text-[#8EAA9C] font-bold">
                            <span className="text-[#006039] dark:text-[#4ADE80]">{prod.category}</span>
                            {prod.badge && (
                              <span className="text-[#0F172A] dark:text-[#CBD5E1]">• {prod.badge}</span>
                            )}
                          </div>
                          <div className="text-xs font-bold text-[#0F172A] dark:text-[#F8FAFC] group-hover:text-[#006039] dark:group-hover:text-[#4ADE80] truncate font-display">
                            {prod.name}
                          </div>
                          {prod.movement && (
                            <div className="text-[10px] text-[#64748B] dark:text-[#8EAA9C] font-mono truncate">
                              {prod.movement}
                            </div>
                          )}
                        </div>

                        <div className="text-right flex-shrink-0 pl-2">
                          <div className="text-xs font-black text-[#006039] dark:text-[#4ADE80] font-num">
                            {formatCurrency(prod.price)}
                          </div>
                          <div className="text-[9px] font-mono text-[#006039] dark:text-[#10B981] font-semibold flex items-center justify-end gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#006039] dark:bg-[#10B981]"></span> Available
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-6 text-center space-y-1">
                    <div className="text-xs font-bold text-[#0F172A] dark:text-[#F8FAFC]">
                      No matching calibres found
                    </div>
                    <div className="text-[10px] text-[#64748B] dark:text-[#8EAA9C] font-mono">
                      Search by model (Submariner, Speedmaster) or brand
                    </div>
                  </div>
                )}

                <div className="p-3 bg-[#E8EEF3] dark:bg-[#12221D] border-t border-[rgba(166,180,200,0.3)] dark:border-[rgba(255,255,255,0.06)] text-center">
                  <Link
                    href={`/catalog?q=${encodeURIComponent(searchQuery)}`}
                    onClick={() => setIsDropdownOpen(false)}
                    className="text-[11px] font-mono font-bold text-[#006039] dark:text-[#4ADE80] hover:underline uppercase tracking-wider block py-0.5"
                  >
                    Explore Complete Collection →
                  </Link>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Action Controls: Neumorphic Theme Toggle, Wishlist, Cart & Mobile Menu */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          {/* Dark / Light Mode Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2.5 neu-btn-icon rounded-2xl"
            title={theme === "light" ? "Switch to Night Mode" : "Switch to Day Mode"}
            aria-label="Toggle Theme"
          >
            {theme === "light" ? (
              <svg className="w-4 h-4 text-[#006039]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            ) : (
              <svg className="w-4 h-4 text-[#D4AF37]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            )}
          </button>

          {/* Wishlist Button */}
          <button
            onClick={effectiveOpenWishlist}
            className="relative p-2.5 neu-btn-icon rounded-2xl"
            title="Saved Timepieces"
            aria-label="Wishlist"
          >
            <svg
              className="w-4 h-4 text-[#0F172A] dark:text-[#D4AF37]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.8}
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
            {effectiveWishlistCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-[#E11D48] text-white text-[9px] font-black h-4.5 w-4.5 rounded-full flex items-center justify-center shadow-md">
                {effectiveWishlistCount}
              </span>
            )}
          </button>

          {/* Cart Button in Neumorphic Emerald */}
          <button
            onClick={effectiveOpenCart}
            className="relative flex items-center gap-2 px-3.5 py-2 rounded-2xl neu-btn hover:neu-raised text-[#006039] dark:text-[#4ADE80] transition-all cursor-pointer group"
            title="Shopping Cart"
            aria-label="Cart"
          >
            <svg
              className="w-4 h-4 group-hover:scale-105 transition-transform"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.8}
                d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
            <span className="hidden sm:inline text-xs font-bold uppercase tracking-wider">
              Cart
            </span>
            {effectiveCartCount > 0 && (
              <span className="bg-[#006039] text-white dark:bg-[#00A362] dark:text-[#0E1A16] text-[9px] font-black h-4.5 min-w-[18px] px-1 rounded-full flex items-center justify-center font-mono shadow-sm">
                {effectiveCartCount}
              </span>
            )}
          </button>

          {/* User Profile / Auth State Controls (Milestone 2) */}
          {isAuthenticated && user ? (
            <div className="flex items-center gap-1.5 sm:gap-2">
              <Link
                href="/profile"
                className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-1.5 rounded-2xl neu-btn hover:neu-raised text-[#0F172A] dark:text-[#F8FAFC] transition-all group"
                title={`Signed in as ${user.name} (${user.email})`}
              >
                <div className="w-6 h-6 rounded-full bg-[#C5A059] text-black font-serif font-bold text-xs flex items-center justify-center">
                  {user.name ? user.name.charAt(0).toUpperCase() : "U"}
                </div>
                <span className="hidden md:inline text-xs font-medium max-w-[90px] truncate">
                  {user.name.split(" ")[0]}
                </span>
              </Link>
              <button
                onClick={logout}
                className="p-2.5 neu-btn-icon rounded-2xl text-red-500 hover:text-red-600 transition-colors"
                title="Secure Sign Out"
                aria-label="Logout"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl neu-btn hover:neu-raised text-xs font-semibold text-[#0F172A] dark:text-[#F8FAFC] transition-all"
              title="Client Sign In"
            >
              <svg className="w-4 h-4 text-[#C5A059]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span className="hidden sm:inline">Sign In</span>
            </Link>
          )}

          {/* Mobile hamburger menu toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2.5 neu-btn-icon rounded-2xl lg:hidden"
            aria-label="Toggle navigation"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {mobileMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.8}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.8}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden neu-raised-lg border-t border-[rgba(255,255,255,0.7)] dark:border-[rgba(255,255,255,0.06)] px-5 py-4 space-y-3 animate-pageEnter">
          {showSearch && onSearchChange && (
            <div ref={mobileSearchContainerRef} className="relative">
              <input
                type="text"
                placeholder="Search reference, calibre..."
                value={searchQuery}
                onFocus={() => {
                  if (searchQuery.trim()) setIsDropdownOpen(true);
                }}
                onChange={(e) => {
                  onSearchChange(e.target.value);
                  setIsDropdownOpen(true);
                }}
                className="w-full neu-inset rounded-xl px-4 py-2.5 text-xs text-[#0F172A] dark:text-[#F8FAFC] focus:outline-none"
              />

              {/* Mobile Live Results */}
              {isDropdownOpen && searchQuery.trim() && (
                <div className="mt-2 rounded-xl neu-raised overflow-hidden">
                  <div className="p-2 bg-[#E8EEF3] dark:bg-[#12221D] border-b border-[rgba(166,180,200,0.3)] text-[10px] font-mono text-[#006039] dark:text-[#4ADE80] uppercase font-bold">
                    Live Matches ({searchResults.length})
                  </div>
                  {searchResults.map((prod) => (
                    <div
                      key={prod.id}
                      onClick={() => {
                        handleSelectProduct(prod.id);
                        setMobileMenuOpen(false);
                      }}
                      className="flex items-center gap-3 p-2.5 hover:bg-[#DCE4EC] dark:hover:bg-[#182C25] border-b border-[rgba(166,180,200,0.2)] last:border-0 cursor-pointer"
                    >
                      <SmoothImage
                        src={prod.image_url}
                        alt={prod.name}
                        containerClassName="h-9 w-9 rounded-lg neu-inset overflow-hidden flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-bold text-[#0F172A] dark:text-[#F8FAFC] truncate">
                          {prod.name}
                        </div>
                        <div className="text-[10px] text-[#006039] dark:text-[#4ADE80] font-num font-bold">
                          {formatCurrency(prod.price)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          <nav className="flex flex-col space-y-1.5 pt-2">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-between ${
                  pathname === link.href
                    ? "neu-btn-primary text-white"
                    : "neu-btn text-[#475569] dark:text-[#CBD5E1]"
                }`}
              >
                <span>{link.label}</span>
                <span className="text-[10px]">→</span>
              </Link>
            ))}

            {/* Mobile Auth Links */}
            <div className="pt-2 border-t border-[rgba(166,180,200,0.3)] dark:border-[rgba(255,255,255,0.06)] space-y-1.5">
              {isAuthenticated && user ? (
                <>
                  <Link
                    href="/profile"
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-4 py-2.5 rounded-xl text-xs font-bold neu-btn text-[#C5A059] flex items-center justify-between"
                  >
                    <span>My Vault Profile ({user.name})</span>
                    <span className="text-[10px]">→</span>
                  </Link>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      logout();
                    }}
                    className="w-full px-4 py-2.5 rounded-xl text-xs font-bold neu-btn text-red-400 flex items-center justify-between"
                  >
                    <span>Secure Sign Out</span>
                    <span className="text-[10px]">✕</span>
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-4 py-2.5 rounded-xl text-xs font-bold neu-btn text-[#C5A059] flex items-center justify-between"
                  >
                    <span>Client Sign In</span>
                    <span className="text-[10px]">→</span>
                  </Link>
                  <Link
                    href="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-4 py-2.5 rounded-xl text-xs font-bold neu-btn text-white/70 flex items-center justify-between"
                  >
                    <span>Register New Account</span>
                    <span className="text-[10px]">→</span>
                  </Link>
                </>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
