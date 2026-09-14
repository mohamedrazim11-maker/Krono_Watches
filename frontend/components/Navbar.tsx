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
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-[#06110D]/95 border-b border-[#E2E8F0] dark:border-[rgba(0,96,57,0.3)] backdrop-blur-2xl transition-all duration-300 shadow-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 py-3.5 gap-3 lg:gap-6">
        {/* Brand Crest & Logo */}
        <Link href="/" className="flex items-center gap-3 group flex-shrink-0">
          <div className="relative p-0.5 rounded-xl bg-gradient-to-br from-[#C5A059] via-[#006039] to-[#00482B] shadow-md shadow-[#006039]/20 group-hover:scale-105 transition-transform duration-300">
            <img
              src="/icon.jpg"
              alt="Krono Logo"
              className="h-8 w-8 sm:h-9 sm:w-9 rounded-[10px] object-contain bg-[#06110D] p-0.5"
            />
          </div>
          <div>
            <div className="text-base font-black tracking-[0.25em] text-[#0F172A] dark:text-[#F8FAFC] font-display uppercase flex items-center gap-1.5">
              <span>K R O N O</span>
              <span className="h-1.5 w-1.5 rounded-full bg-[#006039] dark:bg-[#00A362]"></span>
            </div>
            <div className="text-[8px] uppercase tracking-[0.3em] text-[#5A6D64] dark:text-[#8EAA9C] font-mono">
              Haute Horlogerie • Genève
            </div>
          </div>
        </Link>

        {/* Center Navigation Links with Rolex Green & Gold Pills */}
        <nav className="hidden lg:flex items-center gap-1 p-1 rounded-full border border-[#E2E8F0] dark:border-[rgba(0,96,57,0.35)] bg-[#F8FAF9]/90 dark:bg-[#0B1C15]/90 shadow-inner">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold tracking-wider transition-all duration-200 cursor-pointer ${
                  isActive
                    ? "bg-[#006039] dark:bg-[#00824E] text-white font-bold shadow-md shadow-[#006039]/30"
                    : "text-[#475569] dark:text-[#CBD5E1] hover:text-[#006039] dark:hover:text-[#4ADE80] hover:bg-[#E8F5EE] dark:hover:bg-[#11261D]"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Live Search Bar with Rolex Green Accent */}
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
                className="w-full bg-[#F1F5F3] dark:bg-[#0B1C15] border border-[#E2E8F0] dark:border-[rgba(0,96,57,0.35)] rounded-full pl-4 pr-9 py-1.5 text-xs text-[#0F172A] dark:text-[#F8FAFC] placeholder-[#64748B] dark:placeholder-[#8EAA9C] focus:outline-none focus:border-[#006039] dark:focus:border-[#00A362] focus:ring-2 focus:ring-[#006039]/20 transition-all shadow-inner"
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

            {/* Live Interactive Search Results Dropdown */}
            {isDropdownOpen && searchQuery.trim() && (
              <div className="absolute top-full left-0 right-0 mt-2 rounded-2xl bg-white dark:bg-[#0B1C15] border border-[#E2E8F0] dark:border-[rgba(0,96,57,0.4)] shadow-2xl overflow-hidden z-50 animate-in fade-in duration-200">
                <div className="p-2.5 bg-[#F8FAF9] dark:bg-[#06110D] border-b border-[#E2E8F0] dark:border-[rgba(0,96,57,0.3)] flex items-center justify-between text-[10px] font-mono text-[#5A6D64] dark:text-[#8EAA9C] uppercase tracking-wider">
                  <span>Vault References</span>
                  <span className="font-bold text-[#006039] dark:text-[#4ADE80]">
                    {searchResults.length} matches
                  </span>
                </div>

                {searchResults.length > 0 ? (
                  <div className="divide-y divide-[#E5ECE8] dark:divide-[#122B20] max-h-80 overflow-y-auto">
                    {searchResults.map((prod) => (
                      <div
                        key={prod.id}
                        onClick={() => handleSelectProduct(prod.id)}
                        className="flex items-center gap-3 p-3 hover:bg-[#F1F5F3] dark:hover:bg-[#11261D] cursor-pointer transition group"
                      >
                        <SmoothImage
                          src={prod.image_url}
                          alt={prod.name}
                          className="group-hover:scale-105 transition-transform duration-300"
                          containerClassName="h-11 w-11 rounded-xl bg-[#F8FAF9] dark:bg-[#06110D] border border-[#E2E8F0] dark:border-[rgba(0,96,57,0.3)] overflow-hidden flex-shrink-0"
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

                <div className="p-2.5 bg-[#F8FAF9] dark:bg-[#06110D] border-t border-[#E2E8F0] dark:border-[rgba(0,96,57,0.3)] text-center">
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

        {/* Action Controls: Theme Toggle, Wishlist, Cart & Mobile Menu */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* Dark / Light Mode Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl border border-[#E2E8F0] dark:border-[rgba(0,96,57,0.35)] bg-white dark:bg-[#0B1C15] text-[#0F172A] dark:text-[#F8FAFC] hover:border-[#006039] dark:hover:border-[#00A362] transition-all cursor-pointer shadow-sm hover:shadow-md"
            title={theme === "light" ? "Switch to Night Mode" : "Switch to Day Mode"}
            aria-label="Toggle Theme"
          >
            {theme === "light" ? (
              <svg className="w-4 h-4 text-[#006039]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            ) : (
              <svg className="w-4 h-4 text-[#C5A059]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            )}
          </button>

          {/* Wishlist Button */}
          <button
            onClick={effectiveOpenWishlist}
            className="relative p-2 rounded-xl border border-[#E2E8F0] dark:border-[rgba(0,96,57,0.35)] bg-white dark:bg-[#0B1C15] text-[#0F172A] dark:text-[#F8FAFC] hover:border-[#006039] dark:hover:border-[#00A362] transition-all cursor-pointer shadow-sm"
            title="Saved Timepieces"
            aria-label="Wishlist"
          >
            <svg
              className="w-4 h-4 text-[#0F172A] dark:text-[#C5A059]"
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
              <span className="absolute -top-1.5 -right-1.5 bg-[#E11D48] text-white text-[9px] font-black h-4 w-4 rounded-full flex items-center justify-center shadow-md">
                {effectiveWishlistCount}
              </span>
            )}
          </button>

          {/* Cart Button in Rolex Green */}
          <button
            onClick={effectiveOpenCart}
            className="relative flex items-center gap-2 px-3 py-1.5 rounded-xl border border-[#006039] dark:border-[#00A362] bg-[#E8F5EE] dark:bg-[#11261D] text-[#006039] dark:text-[#4ADE80] hover:bg-[#006039] hover:text-white dark:hover:bg-[#00824E] transition-all cursor-pointer shadow-sm group"
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
              <span className="bg-[#006039] text-white dark:bg-[#00A362] dark:text-[#06110D] text-[9px] font-black h-4.5 min-w-[18px] px-1 rounded-full flex items-center justify-center font-mono shadow-sm">
                {effectiveCartCount}
              </span>
            )}
          </button>

          {/* Mobile hamburger menu toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl border border-[#E2E8F0] dark:border-[rgba(0,96,57,0.35)] text-[#0F172A] dark:text-[#F8FAFC] hover:text-[#006039] lg:hidden"
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
        <div className="lg:hidden border-t border-[#E2E8F0] dark:border-[rgba(0,96,57,0.35)] bg-white dark:bg-[#06110D] px-5 py-4 space-y-3 shadow-2xl">
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
                className="w-full bg-[#F1F5F3] dark:bg-[#0B1C15] border border-[#E2E8F0] dark:border-[rgba(0,96,57,0.35)] rounded-xl px-4 py-2 text-xs text-[#0F172A] dark:text-[#F8FAFC] focus:outline-none focus:border-[#006039]"
              />

              {/* Mobile Live Results */}
              {isDropdownOpen && searchQuery.trim() && (
                <div className="mt-2 rounded-xl bg-white dark:bg-[#0B1C15] border border-[#E2E8F0] dark:border-[rgba(0,96,57,0.4)] shadow-xl overflow-hidden">
                  <div className="p-2 bg-[#F8FAF9] dark:bg-[#06110D] border-b border-[#E2E8F0] dark:border-[rgba(0,96,57,0.3)] text-[10px] font-mono text-[#006039] dark:text-[#4ADE80] uppercase font-bold">
                    Live Matches ({searchResults.length})
                  </div>
                  {searchResults.map((prod) => (
                    <div
                      key={prod.id}
                      onClick={() => {
                        handleSelectProduct(prod.id);
                        setMobileMenuOpen(false);
                      }}
                      className="flex items-center gap-3 p-2.5 hover:bg-[#F1F5F3] dark:hover:bg-[#11261D] border-b border-[#E5ECE8] dark:border-[#122B20] last:border-0 cursor-pointer"
                    >
                      <SmoothImage
                        src={prod.image_url}
                        alt={prod.name}
                        containerClassName="h-9 w-9 rounded-lg overflow-hidden flex-shrink-0"
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

          <nav className="flex flex-col space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-between ${
                  pathname === link.href
                    ? "bg-[#006039] text-white shadow-md"
                    : "text-[#475569] dark:text-[#CBD5E1] hover:bg-[#E8F5EE] dark:hover:bg-[#11261D]"
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
