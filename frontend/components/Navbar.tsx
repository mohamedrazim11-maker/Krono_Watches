"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { fetchProducts, Product } from "@/lib/api";
import SmoothImage from "./SmoothImage";
import { useCart } from "@/lib/CartContext";

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
    <header className="sticky top-0 z-40 bg-white/90 dark:bg-[#080B10]/90 border-b border-[#E8E2D6] dark:border-[rgba(212,175,55,0.15)] backdrop-blur-2xl transition-all duration-300">
      {/* Top VIP Announcement Ribbon */}
      <div className="bg-[#121826] dark:bg-[#040609] text-[#E5C158] py-1 px-4 text-center text-[10px] font-mono tracking-[0.25em] flex items-center justify-center gap-2 sm:gap-4 border-b border-[#28364F]/50">
        <span className="hidden sm:inline-block w-1.5 h-1.5 rounded-full bg-[#D4AF37] animate-ping"></span>
        <span className="font-semibold">
          SWISS CALIBRE CERTIFIED • 5-YEAR CONCIERGE WARRANTY • INSURED WORLDWIDE TRANSIT
        </span>
        <span className="hidden sm:inline-block w-1.5 h-1.5 rounded-full bg-[#D4AF37] animate-ping"></span>
      </div>

      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 py-3 gap-3 lg:gap-6">
        {/* Brand Crest & Logo */}
        <Link href="/" className="flex items-center gap-3 group flex-shrink-0">
          <div className="relative p-0.5 rounded-xl bg-gradient-to-br from-[#F3E5AB] via-[#D4AF37] to-[#8C6212] shadow-md shadow-[#D4AF37]/20 group-hover:scale-105 transition-transform duration-300">
            <img
              src="/icon.jpg"
              alt="Krono Logo"
              className="h-8 w-8 sm:h-9 sm:w-9 rounded-[10px] object-contain bg-[#080B10] p-0.5"
            />
          </div>
          <div>
            <div className="text-base font-black tracking-[0.25em] text-[#121826] dark:text-[#F8FAFC] font-display uppercase flex items-center gap-1.5">
              <span>K R O N O</span>
              <span className="h-1.5 w-1.5 rounded-full bg-[#D4AF37]"></span>
            </div>
            <div className="text-[8px] uppercase tracking-[0.3em] text-[#8C7B65] dark:text-[#A3937C] font-mono">
              Haute Horlogerie • Genève
            </div>
          </div>
        </Link>

        {/* Center Navigation Links with Gold Accent Pills */}
        <nav className="hidden lg:flex items-center gap-1 p-1 rounded-full border border-[#E8E2D6] dark:border-[rgba(212,175,55,0.18)] bg-[#FAF8F5]/80 dark:bg-[#0E1420]/80 shadow-inner">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold tracking-wider transition-all duration-200 cursor-pointer ${
                  isActive
                    ? "bg-gradient-to-r from-[#D4AF37] to-[#AA7A1E] text-[#080B10] font-black shadow-md shadow-[#D4AF37]/25"
                    : "text-[#645A4C] dark:text-[#CBD5E1] hover:text-[#121826] dark:hover:text-[#F3E5AB] hover:bg-[#F3EFEA] dark:hover:bg-[#141D2E]"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Live Search Bar with Gold Glow Accent */}
        {showSearch && onSearchChange && (
          <div
            ref={searchContainerRef}
            className="hidden md:flex relative items-center flex-1 max-w-xs lg:max-w-sm"
          >
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Search reference, calibre, brand..."
                value={searchQuery}
                onFocus={() => {
                  if (searchQuery.trim()) setIsDropdownOpen(true);
                }}
                onChange={(e) => {
                  onSearchChange(e.target.value);
                  setIsDropdownOpen(true);
                }}
                className="w-full bg-[#F3EFEA] dark:bg-[#0E1420] border border-[#E8E2D6] dark:border-[rgba(212,175,55,0.18)] rounded-full pl-4 pr-9 py-1.5 text-xs text-[#121826] dark:text-[#F8FAFC] placeholder-[#8C7B65] dark:placeholder-[#64748B] focus:outline-none focus:border-[#D4AF37] dark:focus:border-[#E5C158] focus:ring-2 focus:ring-[#D4AF37]/20 transition-all shadow-inner"
              />
              {searchQuery ? (
                <button
                  onClick={() => {
                    onSearchChange("");
                    setIsDropdownOpen(false);
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8C7B65] hover:text-[#121826] dark:hover:text-white text-xs font-bold cursor-pointer"
                >
                  ✕
                </button>
              ) : (
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#D4AF37] text-xs pointer-events-none font-bold">
                  ⌕
                </span>
              )}
            </div>

            {/* Live Interactive Search Results Dropdown */}
            {isDropdownOpen && searchQuery.trim() && (
              <div className="absolute top-full left-0 right-0 mt-2 rounded-2xl bg-white dark:bg-[#0E1420] border border-[#E8E2D6] dark:border-[rgba(212,175,55,0.25)] shadow-2xl overflow-hidden z-50 animate-in fade-in duration-200">
                <div className="p-2.5 bg-[#FAF8F5] dark:bg-[#080B10] border-b border-[#E8E2D6] dark:border-[rgba(212,175,55,0.15)] flex items-center justify-between text-[10px] font-mono text-[#8C7B65] dark:text-[#A3937C] uppercase tracking-wider">
                  <span>Horological Results</span>
                  <span className="font-bold text-[#D4AF37]">
                    {searchResults.length} references
                  </span>
                </div>

                {searchResults.length > 0 ? (
                  <div className="divide-y divide-[#EBE5DB] dark:divide-[#182234] max-h-80 overflow-y-auto">
                    {searchResults.map((prod) => (
                      <div
                        key={prod.id}
                        onClick={() => handleSelectProduct(prod.id)}
                        className="flex items-center gap-3 p-3 hover:bg-[#FAF8F5] dark:hover:bg-[#141D2E] cursor-pointer transition group"
                      >
                        <SmoothImage
                          src={prod.image_url}
                          alt={prod.name}
                          className="group-hover:scale-105 transition-transform duration-300"
                          containerClassName="h-11 w-11 rounded-xl bg-[#FAF8F5] dark:bg-[#080B10] border border-[#E8E2D6] dark:border-[rgba(212,175,55,0.2)] overflow-hidden flex-shrink-0"
                        />

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 text-[9px] font-mono uppercase text-[#8C7B65] dark:text-[#A3937C] font-bold">
                            <span className="text-[#D4AF37]">{prod.category}</span>
                            {prod.badge && (
                              <span className="text-[#121826] dark:text-[#CBD5E1]">• {prod.badge}</span>
                            )}
                          </div>
                          <div className="text-xs font-bold text-[#121826] dark:text-[#F8FAFC] group-hover:text-[#D4AF37] dark:group-hover:text-[#E5C158] truncate font-display">
                            {prod.name}
                          </div>
                          {prod.movement && (
                            <div className="text-[10px] text-[#8C7B65] dark:text-[#64748B] font-mono truncate">
                              {prod.movement}
                            </div>
                          )}
                        </div>

                        <div className="text-right flex-shrink-0 pl-2">
                          <div className="text-xs font-black text-[#121826] dark:text-[#F3E5AB] font-num">
                            {formatCurrency(prod.price)}
                          </div>
                          <div className="text-[9px] font-mono text-[#059669] dark:text-[#10B981] font-semibold flex items-center justify-end gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]"></span> In Stock
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-6 text-center space-y-1">
                    <div className="text-xs font-bold text-[#121826] dark:text-[#F8FAFC]">
                      No matching calibres found
                    </div>
                    <div className="text-[10px] text-[#8C7B65] dark:text-[#A3937C] font-mono">
                      Search by brand (Rolex, Omega) or case size
                    </div>
                  </div>
                )}

                <div className="p-2.5 bg-[#FAF8F5] dark:bg-[#080B10] border-t border-[#E8E2D6] dark:border-[rgba(212,175,55,0.15)] text-center">
                  <Link
                    href={`/catalog?q=${encodeURIComponent(searchQuery)}`}
                    onClick={() => setIsDropdownOpen(false)}
                    className="text-[11px] font-mono font-bold text-[#D4AF37] dark:text-[#E5C158] hover:underline uppercase tracking-wider block py-0.5"
                  >
                    View All Vault References →
                  </Link>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Action Controls: Theme Toggle, Wishlist, Cart & Mobile Menu */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* Dark / Light Mode Toggle Button with Gold Trim */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl border border-[#E8E2D6] dark:border-[rgba(212,175,55,0.2)] bg-white dark:bg-[#0E1420] text-[#121826] dark:text-[#F8FAFC] hover:border-[#D4AF37] dark:hover:border-[#E5C158] transition-all cursor-pointer shadow-sm hover:shadow-md"
            title={theme === "light" ? "Switch to Obsidian Dark Mode" : "Switch to Alabaster Light Mode"}
            aria-label="Toggle Theme"
          >
            {theme === "light" ? (
              <svg className="w-4 h-4 text-[#8C6212]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            ) : (
              <svg className="w-4 h-4 text-[#E5C158]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            )}
          </button>

          {/* Wishlist Button with Gold Glow on Count */}
          <button
            onClick={effectiveOpenWishlist}
            className="relative p-2 rounded-xl border border-[#E8E2D6] dark:border-[rgba(212,175,55,0.2)] bg-white dark:bg-[#0E1420] text-[#121826] dark:text-[#F8FAFC] hover:border-[#D4AF37] dark:hover:border-[#E5C158] transition-all cursor-pointer shadow-sm"
            title="Saved Timepieces"
            aria-label="Wishlist"
          >
            <svg
              className="w-4 h-4 text-[#121826] dark:text-[#E5C158]"
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
              <span className="absolute -top-1.5 -right-1.5 bg-gradient-to-r from-[#F43F5E] to-[#E11D48] text-white text-[9px] font-black h-4 w-4 rounded-full flex items-center justify-center shadow-md">
                {effectiveWishlistCount}
              </span>
            )}
          </button>

          {/* Cart Button with Gold Shimmer */}
          <button
            onClick={effectiveOpenCart}
            className="relative flex items-center gap-2 px-3 py-1.5 rounded-xl border border-[#D4AF37] dark:border-[#E5C158] bg-gradient-to-r from-[#F3E5AB]/20 via-[#D4AF37]/10 to-transparent dark:from-[#D4AF37]/20 dark:via-[#141D2E] dark:to-[#0E1420] text-[#121826] dark:text-[#F8FAFC] hover:border-[#AA7A1E] dark:hover:border-[#FDF3C7] transition-all cursor-pointer shadow-sm group"
            title="Shopping Cart"
            aria-label="Cart"
          >
            <svg
              className="w-4 h-4 text-[#8C6212] dark:text-[#E5C158] group-hover:scale-105 transition-transform"
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
            <span className="hidden sm:inline text-xs font-bold uppercase tracking-wider text-[#121826] dark:text-[#F8FAFC]">
              Cart
            </span>
            {effectiveCartCount > 0 && (
              <span className="bg-gradient-to-r from-[#D4AF37] to-[#AA7A1E] text-[#080B10] text-[9px] font-black h-4.5 min-w-[18px] px-1 rounded-full flex items-center justify-center font-mono shadow-sm">
                {effectiveCartCount}
              </span>
            )}
          </button>

          {/* Mobile hamburger menu toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl border border-[#E8E2D6] dark:border-[rgba(212,175,55,0.2)] text-[#121826] dark:text-[#F8FAFC] hover:text-[#D4AF37] lg:hidden"
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
        <div className="lg:hidden border-t border-[#E8E2D6] dark:border-[rgba(212,175,55,0.2)] bg-white dark:bg-[#080B10] px-5 py-4 space-y-3 shadow-2xl">
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
                className="w-full bg-[#F3EFEA] dark:bg-[#0E1420] border border-[#E8E2D6] dark:border-[rgba(212,175,55,0.2)] rounded-xl px-4 py-2 text-xs text-[#121826] dark:text-[#F8FAFC] focus:outline-none focus:border-[#D4AF37]"
              />

              {/* Mobile Live Results */}
              {isDropdownOpen && searchQuery.trim() && (
                <div className="mt-2 rounded-xl bg-white dark:bg-[#0E1420] border border-[#E8E2D6] dark:border-[rgba(212,175,55,0.25)] shadow-xl overflow-hidden">
                  <div className="p-2 bg-[#FAF8F5] dark:bg-[#080B10] border-b border-[#E8E2D6] dark:border-[rgba(212,175,55,0.15)] text-[10px] font-mono text-[#D4AF37] uppercase font-bold">
                    Live Matches ({searchResults.length})
                  </div>
                  {searchResults.map((prod) => (
                    <div
                      key={prod.id}
                      onClick={() => {
                        handleSelectProduct(prod.id);
                        setMobileMenuOpen(false);
                      }}
                      className="flex items-center gap-3 p-2.5 hover:bg-[#FAF8F5] dark:hover:bg-[#141D2E] border-b border-[#EBE5DB] dark:border-[#182234] last:border-0 cursor-pointer"
                    >
                      <SmoothImage
                        src={prod.image_url}
                        alt={prod.name}
                        containerClassName="h-9 w-9 rounded-lg overflow-hidden flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-bold text-[#121826] dark:text-[#F8FAFC] truncate">
                          {prod.name}
                        </div>
                        <div className="text-[10px] text-[#D4AF37] font-num font-bold">
                          {formatCurrency(prod.price)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          <nav className="flex flex-col space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-between ${
                  pathname === link.href
                    ? "bg-gradient-to-r from-[#D4AF37] to-[#AA7A1E] text-[#080B10] shadow-md"
                    : "text-[#645A4C] dark:text-[#CBD5E1] hover:bg-[#F3EFEA] dark:hover:bg-[#141D2E]"
                }`}
              >
                <span>{link.label}</span>
                <span className="text-[10px]">→</span>
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
