"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { fetchProducts, Product } from "@/lib/api";

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
  cartCount = 0,
  wishlistCount = 0,
  onOpenCart,
  onOpenWishlist,
  searchQuery = "",
  onSearchChange,
  showSearch = false,
}: NavbarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const mobileSearchContainerRef = useRef<HTMLDivElement>(null);

  const navLinks = [
    { label: "Boutique", href: "/" },
    { label: "Vault Catalogue", href: "/catalog" },
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
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-[#0B0F17]/95 border-b border-slate-200 dark:border-slate-800/80 backdrop-blur-xl transition-colors duration-200">
      {/* Top announcement bar */}
      <div className="bg-slate-900 dark:bg-slate-950 text-white py-1 px-4 text-center text-[10px] font-mono tracking-[0.2em] flex items-center justify-center gap-3 border-b border-slate-800/50">
        <span>
          SWISS CALIBRE CERTIFIED • 5-YEAR ATELIER GUARANTEE • INSURED WORLDWIDE TRANSIT
        </span>
      </div>

      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 py-2.5 sm:py-3 gap-4 lg:gap-6">
        {/* Brand Wordmark */}
        <Link href="/" className="flex items-center gap-3 group flex-shrink-0">
          <img
            src="/icon.jpg"
            alt="Krono Logo"
            className="h-9 w-9 sm:h-10 sm:w-10 rounded-xl object-contain bg-white dark:bg-slate-800 p-0.5 border border-slate-200/90 dark:border-slate-700 shadow-sm group-hover:scale-105 transition"
          />
          <div>
            <div className="text-sm font-black tracking-[0.25em] text-slate-900 dark:text-white font-display uppercase">
              K R O N O
            </div>
            <div className="text-[8px] uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400 font-mono">
              Haute Horlogerie • Genève
            </div>
          </div>
        </Link>

        {/* Center Nav Links */}
        <nav className="hidden lg:flex items-center gap-1 border border-slate-200 dark:border-slate-800 rounded-full px-2.5 py-1 bg-slate-50 dark:bg-slate-900/60">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3.5 py-1 rounded-full text-xs font-semibold tracking-wider transition ${
                  isActive
                    ? "bg-slate-900 dark:bg-white text-white dark:text-slate-950 font-bold shadow-sm"
                    : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-800"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Desktop Live Interactive Search Bar */}
        {showSearch && onSearchChange && (
          <div
            ref={searchContainerRef}
            className="hidden md:flex relative items-center flex-1 max-w-sm"
          >
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Search reference, model, calibre..."
                value={searchQuery}
                onFocus={() => {
                  if (searchQuery.trim()) setIsDropdownOpen(true);
                }}
                onChange={(e) => {
                  onSearchChange(e.target.value);
                  setIsDropdownOpen(true);
                }}
                className="w-full bg-slate-100 dark:bg-slate-900/80 border border-slate-200/90 dark:border-slate-800 rounded-full pl-4 pr-9 py-1.5 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-slate-900 dark:focus:border-slate-500 focus:bg-white dark:focus:bg-slate-900 transition shadow-inner"
              />
              {searchQuery ? (
                <button
                  onClick={() => {
                    onSearchChange("");
                    setIsDropdownOpen(false);
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-900 dark:hover:text-white text-xs font-bold cursor-pointer"
                >
                  ✕
                </button>
              ) : (
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 text-xs pointer-events-none">
                  ⌕
                </span>
              )}
            </div>

            {/* Live Interactive Dropdown Preview */}
            {isDropdownOpen && searchQuery.trim() && (
              <div className="absolute top-full left-0 right-0 mt-2 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-2xl overflow-hidden z-50 animate-in fade-in duration-200">
                <div className="p-2.5 bg-slate-50 dark:bg-slate-950 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between text-[10px] font-mono text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  <span>Live Catalogue Matches</span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {searchResults.length} references
                  </span>
                </div>

                {searchResults.length > 0 ? (
                  <div className="divide-y divide-slate-100 dark:divide-slate-800/60 max-h-80 overflow-y-auto">
                    {searchResults.map((prod) => (
                      <div
                        key={prod.id}
                        onClick={() => handleSelectProduct(prod.id)}
                        className="flex items-center gap-3 p-2.5 hover:bg-slate-50/90 dark:hover:bg-slate-800/60 cursor-pointer transition group"
                      >
                        <div className="h-11 w-11 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 overflow-hidden flex-shrink-0">
                          <img
                            src={prod.image_url}
                            alt={prod.name}
                            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform"
                            loading="lazy"
                            decoding="async"
                          />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 text-[9px] font-mono uppercase text-slate-500 dark:text-slate-400 font-bold">
                            <span>{prod.category}</span>
                            {prod.badge && (
                              <span className="text-slate-700 dark:text-slate-300">• {prod.badge}</span>
                            )}
                          </div>
                          <div className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-slate-600 dark:group-hover:text-slate-300 truncate font-display">
                            {prod.name}
                          </div>
                          {prod.movement && (
                            <div className="text-[10px] text-slate-400 font-mono truncate">
                              {prod.movement}
                            </div>
                          )}
                        </div>

                        <div className="text-right flex-shrink-0 pl-2">
                          <div className="text-xs font-black text-slate-900 dark:text-white font-num">
                            {formatCurrency(prod.price)}
                          </div>
                          <div className="text-[9px] font-mono text-emerald-700 dark:text-emerald-400 font-semibold">
                            In Vault
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-5 text-center space-y-1">
                    <div className="text-xs font-bold text-slate-900 dark:text-white">
                      No matching references located
                    </div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                      Try searching by brand (Rolex, Omega) or calibre
                    </div>
                  </div>
                )}

                <div className="p-2 bg-slate-50 dark:bg-slate-950 border-t border-slate-100 dark:border-slate-800 text-center">
                  <Link
                    href={`/catalog?q=${encodeURIComponent(searchQuery)}`}
                    onClick={() => setIsDropdownOpen(false)}
                    className="text-[11px] font-mono font-bold text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white uppercase tracking-wider block py-1"
                  >
                    View All in Catalogue Vault →
                  </Link>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Actions: Theme Toggle, Wishlist, Cart & Mobile Menu */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* Dark / Light Mode Toggle Button */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:text-slate-950 dark:hover:text-white hover:border-slate-400 dark:hover:border-slate-600 transition cursor-pointer shadow-sm"
            title={theme === "light" ? "Switch to Dark Mode" : "Switch to Light Mode"}
            aria-label="Toggle Theme"
          >
            {theme === "light" ? (
              <svg className="w-4 h-4 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            ) : (
              <svg className="w-4 h-4 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            )}
          </button>

          {onOpenWishlist && (
            <button
              onClick={onOpenWishlist}
              className="relative p-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:text-slate-950 dark:hover:text-white hover:border-slate-400 dark:hover:border-slate-600 transition cursor-pointer shadow-sm"
              title="Saved Items"
              aria-label="Wishlist"
            >
              <svg
                className="w-4 h-4"
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
              {wishlistCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-slate-900 dark:bg-white text-white dark:text-slate-950 text-[9px] font-black h-4 w-4 rounded-full flex items-center justify-center">
                  {wishlistCount}
                </span>
              )}
            </button>
          )}

          {onOpenCart && (
            <button
              onClick={onOpenCart}
              className="relative flex items-center gap-1.5 p-2 sm:px-3 sm:py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 hover:text-slate-950 dark:hover:text-white hover:border-slate-400 dark:hover:border-slate-600 transition cursor-pointer shadow-sm group"
              title="Shopping Cart"
              aria-label="Cart"
            >
              <svg
                className="w-4 h-4 text-slate-800 dark:text-slate-200 group-hover:scale-105 transition-transform"
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
              <span className="hidden sm:inline text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                Cart
              </span>
              {cartCount > 0 && (
                <span className="bg-slate-900 dark:bg-white text-white dark:text-slate-950 text-[9px] font-black h-4.5 min-w-[18px] px-1 rounded-full flex items-center justify-center font-mono shadow-sm">
                  {cartCount}
                </span>
              )}
            </button>
          )}

          {/* Mobile hamburger toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white lg:hidden"
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

      {/* Mobile Drawer with Live Search */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-5 py-4 space-y-3 shadow-lg">
          {showSearch && onSearchChange && (
            <div ref={mobileSearchContainerRef} className="relative">
              <input
                type="text"
                placeholder="Search reference, model..."
                value={searchQuery}
                onFocus={() => {
                  if (searchQuery.trim()) setIsDropdownOpen(true);
                }}
                onChange={(e) => {
                  onSearchChange(e.target.value);
                  setIsDropdownOpen(true);
                }}
                className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-slate-900 dark:focus:border-slate-500"
              />

              {/* Mobile Live Results */}
              {isDropdownOpen && searchQuery.trim() && (
                <div className="mt-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden">
                  <div className="p-2 bg-slate-50 dark:bg-slate-950 border-b border-slate-100 dark:border-slate-800 text-[10px] font-mono text-slate-500 dark:text-slate-400 uppercase">
                    Live Matches ({searchResults.length})
                  </div>
                  {searchResults.map((prod) => (
                    <div
                      key={prod.id}
                      onClick={() => {
                        handleSelectProduct(prod.id);
                        setMobileMenuOpen(false);
                      }}
                      className="flex items-center gap-3 p-2.5 hover:bg-slate-50 dark:hover:bg-slate-800/80 border-b border-slate-50 dark:border-slate-800/60 last:border-0 cursor-pointer"
                    >
                      <img
                        src={prod.image_url}
                        alt=""
                        className="h-9 w-9 rounded-lg object-cover bg-slate-100 dark:bg-slate-800"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                          {prod.name}
                        </div>
                        <div className="text-[10px] text-slate-500 dark:text-slate-400 font-num">
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
                className={`px-3.5 py-2 rounded-lg text-xs font-bold transition flex items-center justify-between ${
                  pathname === link.href
                    ? "bg-slate-900 dark:bg-white text-white dark:text-slate-950"
                    : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900"
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
