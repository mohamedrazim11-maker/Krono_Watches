"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { fetchProducts, fetchCategories, Product, Category } from "@/lib/api";
import { executeSearch, SearchEngineResponse } from "@/lib/searchEngine";
import SmoothImage from "./SmoothImage";
import ThemeToggle from "./ThemeToggle";
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
  const [categories, setCategories] = useState<Category[]>([]);
  const [internalQuery, setInternalQuery] = useState(searchQuery || "");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [voiceNotice, setVoiceNotice] = useState<string | null>(null);

  const searchContainerRef = useRef<HTMLDivElement>(null);
  const mobileSearchContainerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mobileFileInputRef = useRef<HTMLInputElement>(null);

  const navLinks = [
    { label: "Watches", href: "/" },
    { label: "Catalogue", href: "/catalog" },
    { label: "About", href: "/about" },
  ];

  // Sticky navbar shadow and backdrop trigger on scroll
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Sync external search query
  useEffect(() => {
    if (searchQuery !== undefined) {
      setInternalQuery(searchQuery);
    }
  }, [searchQuery]);

  // Preload products & categories for client-side search engine
  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      try {
        const [prods, cats] = await Promise.all([fetchProducts(), fetchCategories()]);
        if (isMounted) {
          if (prods) setAllProducts(prods);
          if (cats) setCategories(cats);
        }
      } catch (e) {
        console.error("Live search preload error:", e);
      }
    }
    loadData();
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

  const activeQuery = onSearchChange ? searchQuery : internalQuery;

  // Execute advanced Search Engine with Autocomplete, Typo Tolerance, and Relevance Ranking
  const searchEngineOutput: SearchEngineResponse = useMemo(() => {
    return executeSearch(allProducts, activeQuery, categories);
  }, [allProducts, activeQuery, categories]);

  const handleSearchChange = (val: string) => {
    setInternalQuery(val);
    if (onSearchChange) onSearchChange(val);
    if (val.trim()) {
      setIsDropdownOpen(true);
    }
  };

  const handleSelectProduct = (id: string) => {
    setIsDropdownOpen(false);
    router.push(`/products/${id}`);
  };

  const handleSelectKeyword = (term: string) => {
    handleSearchChange(term);
    setIsDropdownOpen(true);
  };

  // 4. Voice Search Implementation (Web Speech API)
  const startVoiceSearch = () => {
    const SpeechRec =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRec) {
      alert("Voice search is supported on Google Chrome, Microsoft Edge, and Safari.");
      return;
    }

    try {
      const recognition = new SpeechRec();
      recognition.lang = "en-US";
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      setIsListening(true);
      setVoiceNotice("Listening for timepiece, brand, or calibre…");
      recognition.start();

      recognition.onresult = (event: any) => {
        const spoken = event.results[0]?.[0]?.transcript || "";
        if (spoken) {
          handleSearchChange(spoken);
          setIsDropdownOpen(true);
        }
        setIsListening(false);
        setVoiceNotice(null);
      };

      recognition.onerror = () => {
        setIsListening(false);
        setVoiceNotice("Could not capture speech. Please try again.");
        setTimeout(() => setVoiceNotice(null), 2500);
      };

      recognition.onend = () => {
        setIsListening(false);
        setVoiceNotice(null);
      };
    } catch {
      setIsListening(false);
      setVoiceNotice(null);
    }
  };

  // 4. Visual Search Implementation (Photo selection / upload analysis)
  const handleVisualSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Clean image filename to extract keywords (e.g. "omega_seamaster_diver.jpg" -> "omega seamaster")
    const cleanTerm = file.name
      .replace(/\.[^/.]+$/, "")
      .replace(/[-_]/g, " ")
      .replace(/\b(image|img|photo|picture|watch|download|screenshot)\b/gi, "")
      .trim();

    const finalQuery = cleanTerm.length > 2 ? cleanTerm : "Chronograph";
    handleSearchChange(finalQuery);
    setIsDropdownOpen(true);
  };

  const formatCurrency = (amount: number) => {
    return `LKR ${Number(amount || 0).toLocaleString("en-US")}`;
  };

  return (
    <>
      {/* Announcement bar */}
      <div className="bg-[#111] border-b border-[#222] text-center py-2 px-4 text-[11px] text-[#888] tracking-widest uppercase font-mono">
        Authentic Horology Boutique • Insured Worldwide Priority Delivery
      </div>

      {/* 6. Sticky Navigation: Header stays permanently visible on scroll */}
      <header
        style={{ position: "sticky", top: 0, zIndex: 999 }}
        className={`w-full transition-all duration-300 border-b ${
          scrolled ? "bg-black/95 backdrop-blur-md border-[#222] shadow-2xl" : "bg-black border-[#1a1a1a]"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          {/* Brand Logo */}
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
                LUXURY WATCHES
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

          {/* Live Search Bar with Voice, Visual Search, Autocomplete & Typo Tolerance */}
          {showSearch && (
            <div
              ref={searchContainerRef}
              className="hidden md:flex relative items-center flex-1 max-w-xs lg:max-w-md"
            >
              <div
                className={`relative w-full flex items-center bg-[#111] border rounded-lg px-3 py-1.5 transition-all ${
                  isListening
                    ? "border-[#C5A059] ring-2 ring-[#C5A059]/30"
                    : "border-[#2a2a2a] focus-within:border-[#C5A059]"
                }`}
              >
                <span className="text-white/40 text-xs mr-2 select-none">⌕</span>

                <input
                  type="text"
                  placeholder={isListening ? "Listening now…" : "Search brand, model, calibre (e.g. rolexx)..."}
                  value={activeQuery}
                  onFocus={() => {
                    if (activeQuery.trim()) setIsDropdownOpen(true);
                  }}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && activeQuery.trim()) {
                      setIsDropdownOpen(false);
                      router.push(`/catalog?q=${encodeURIComponent(activeQuery.trim())}`);
                    }
                  }}
                  className="w-full bg-transparent text-xs text-white placeholder-white/40 focus:outline-none font-mono"
                />

                {/* Voice Search (Microphone Button) */}
                <button
                  type="button"
                  onClick={startVoiceSearch}
                  className={`p-1 text-xs rounded transition-colors mr-1 cursor-pointer ${
                    isListening
                      ? "text-[#C5A059] animate-pulse bg-[#C5A059]/10"
                      : "text-white/40 hover:text-[#C5A059]"
                  }`}
                  title="Voice Search: Speak query"
                  aria-label="Voice Search"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.8}
                      d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 003-3V5a3 3 0 00-6 0v6a3 3 0 003 3z"
                    />
                  </svg>
                </button>

                {/* Visual Search (Camera Button) */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleVisualSearch}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="p-1 text-xs text-white/40 hover:text-[#C5A059] rounded transition-colors mr-1 cursor-pointer"
                  title="Visual Search: Upload a photo"
                  aria-label="Visual Search"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.8}
                      d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.8}
                      d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                </button>

                {/* Clear button */}
                {activeQuery && (
                  <button
                    onClick={() => {
                      handleSearchChange("");
                      setIsDropdownOpen(false);
                    }}
                    className="p-1 text-white/40 hover:text-white text-xs font-bold"
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* Voice Listening Banner */}
              {voiceNotice && (
                <div className="absolute top-full left-0 right-0 mt-1 px-3 py-1.5 bg-[#C5A059] text-black font-mono text-[11px] rounded font-bold shadow-lg z-50 flex items-center justify-between">
                  <span>🎙️ {voiceNotice}</span>
                  <span className="animate-ping w-2 h-2 rounded-full bg-black"></span>
                </div>
              )}

              {/* Advanced Live Search Dropdown */}
              {isDropdownOpen && activeQuery.trim() && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-[#0D0D0D] border border-white/15 rounded-xl overflow-hidden shadow-2xl z-50 max-h-[460px] flex flex-col">
                  {/* 1. Autocomplete Suggestions Header */}
                  {searchEngineOutput.autocompleteSuggestions.length > 0 && (
                    <div className="p-3 bg-[#14161C] border-b border-white/10 space-y-2">
                      <div className="text-[10px] font-mono uppercase text-[#8E95A5] font-bold tracking-wider">
                        Suggested Keywords (Autocomplete)
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {searchEngineOutput.autocompleteSuggestions.map((sug, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => handleSelectKeyword(sug)}
                            className="px-2.5 py-1 rounded bg-[#1C2028] hover:bg-[#282E38] hover:text-[#C5A059] text-white/80 text-[10px] font-mono transition-colors cursor-pointer border border-white/5"
                          >
                            {sug}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 2. Typo Tolerance Banner ("Did you mean...") */}
                  {searchEngineOutput.hasTypoCorrection && searchEngineOutput.didYouMean && (
                    <div className="px-4 py-2 bg-amber-950/40 border-b border-amber-500/30 flex items-center justify-between text-xs font-mono text-amber-300">
                      <span>
                        Did you mean:{" "}
                        <button
                          type="button"
                          onClick={() => handleSelectKeyword(searchEngineOutput.didYouMean!)}
                          className="font-bold underline text-[#C5A059] hover:text-white cursor-pointer ml-1"
                        >
                          {searchEngineOutput.didYouMean}
                        </button>
                        ?
                      </span>
                      <span className="text-[10px] text-amber-400/80">Typo Tolerance</span>
                    </div>
                  )}

                  {/* 3. Relevance Ranking Results List */}
                  <div className="p-2.5 bg-[#101217] border-b border-white/5 flex items-center justify-between text-[10px] font-mono text-white/60 uppercase tracking-wider">
                    <span>Ranked Results</span>
                    <span className="text-[#C5A059] font-bold">
                      {searchEngineOutput.totalMatches} matches
                    </span>
                  </div>

                  {searchEngineOutput.results.length > 0 ? (
                    <div className="divide-y divide-white/5 overflow-y-auto flex-1">
                      {searchEngineOutput.results.slice(0, 5).map((prod, idx) => (
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
                            <div className="flex items-center gap-2">
                              <span className="text-[9px] font-mono uppercase text-[#C5A059] font-bold truncate">
                                {prod.brand} • {prod.category}
                              </span>
                              {idx === 0 && (
                                <span className="text-[8px] font-mono bg-emerald-950 text-emerald-400 border border-emerald-500/30 px-1 rounded">
                                  Top Match
                                </span>
                              )}
                              {prod.in_stock && (
                                <span className="text-[8px] font-mono text-emerald-400">
                                  In Stock
                                </span>
                              )}
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
                    /* 5. No-Results Handling: Suggest Alternatives instead of a dead end */
                    <div className="p-4 space-y-4 overflow-y-auto flex-1">
                      <div className="text-center space-y-1">
                        <div className="text-xs font-mono text-white/70">
                          No direct matches found for "{activeQuery}".
                        </div>
                        <div className="text-[11px] font-mono text-[#8E95A5]">
                          Here are popular in-stock alternatives crafted for collectors:
                        </div>
                      </div>

                      {/* Alternative watches recommendations */}
                      <div className="space-y-2">
                        {searchEngineOutput.alternativeRecommendations.map((alt) => (
                          <div
                            key={alt.id}
                            onClick={() => handleSelectProduct(alt.id)}
                            className="flex items-center gap-3 p-2 bg-[#14161C] border border-white/5 hover:border-[#C5A059]/40 rounded-lg cursor-pointer transition group"
                          >
                            <div className="h-9 w-9 rounded bg-black border border-white/10 overflow-hidden flex-shrink-0">
                              <SmoothImage src={alt.image_url} alt={alt.name} className="w-full h-full object-cover" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="text-xs font-semibold text-white group-hover:text-[#C5A059] truncate">
                                {alt.name}
                              </div>
                              <div className="text-[10px] font-mono text-[#C5A059]">
                                {formatCurrency(alt.price)}
                              </div>
                            </div>
                            <span className="text-xs text-[#8E95A5] font-mono">View →</span>
                          </div>
                        ))}
                      </div>

                      {/* Explore Categories Pills */}
                      <div className="pt-2 border-t border-white/10">
                        <div className="text-[10px] font-mono uppercase text-[#8E95A5] mb-2 font-bold">
                          Explore Collections
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {["Automatic", "Luxury", "Chronograph", "Dive Watches", "Sport"].map((cat) => (
                            <Link
                              key={cat}
                              href={`/catalog?cat=${encodeURIComponent(cat)}`}
                              onClick={() => setIsDropdownOpen(false)}
                              className="px-2.5 py-1 rounded bg-[#1A1D24] hover:bg-[#C5A059] hover:text-black text-white/80 text-[10px] font-mono transition-colors"
                            >
                              {cat}
                            </Link>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Dropdown footer link */}
                  <div className="p-2.5 bg-[#141414] border-t border-white/10 text-center">
                    <Link
                      href={`/catalog?q=${encodeURIComponent(activeQuery)}`}
                      onClick={() => setIsDropdownOpen(false)}
                      className="text-[10px] font-mono font-bold text-[#C5A059] hover:underline uppercase tracking-wider block"
                    >
                      Search Full Catalogue for "{activeQuery}" →
                    </Link>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Right Action Icons: Theme Toggle, Wishlist, Cart & Account */}
          <div className="flex items-center gap-3">
            {/* Theme Toggle Button */}
            <ThemeToggle />

            {/* Wishlist Button */}
            <button
              onClick={effectiveOpenWishlist}
              className="relative p-2 text-white/70 hover:text-white transition-colors cursor-pointer"
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

            {/* Standalone Checkout Link */}
            <Link
              href="/checkout"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#C5A059]/70 bg-[#C5A059]/10 text-[#C5A059] hover:bg-[#C5A059] hover:text-black text-[11px] font-bold uppercase tracking-wider transition-all"
              aria-label="Go to checkout"
              title="Checkout"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M5 12h14m-6-6 6 6-6 6" />
              </svg>
              <span className="hidden md:inline">Checkout</span>
            </Link>

            {/* Auth Controls */}
            {isAuthenticated && user ? (
              <div className="flex items-center gap-2">
                <Link
                  href="/profile"
                  className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg border border-white/20 hover:border-[#C5A059] text-white transition-all"
                  title={`Signed in as ${user.name}`}
                >
                  <div className="w-5 h-5 rounded-full bg-[#C5A059] text-black font-serif font-bold text-[10px] flex items-center justify-center">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-xs font-mono hidden xl:inline max-w-[90px] truncate">
                    {user.name}
                  </span>
                </Link>
                <button
                  onClick={logout}
                  className="p-1.5 rounded-lg text-white/50 hover:text-red-400 hover:bg-white/5 text-xs transition-colors cursor-pointer"
                  title="Sign Out"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.8}
                      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                    />
                  </svg>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="px-3 py-1.5 rounded-lg border border-white/20 hover:border-white text-xs font-mono text-white transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="hidden xl:inline-block px-3 py-1.5 rounded-lg bg-[#C5A059] hover:bg-[#d4af66] text-black text-xs font-mono font-bold transition-colors"
                >
                  Register
                </Link>
              </div>
            )}

            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-white/70 hover:text-white lg:hidden cursor-pointer"
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
            {/* Mobile Search with Voice & Visual inputs */}
            {showSearch && (
              <div ref={mobileSearchContainerRef} className="relative space-y-2">
                <div className="flex items-center bg-[#111] border border-[#2a2a2a] rounded-lg px-3 py-2">
                  <input
                    type="text"
                    placeholder="Search brand, model, calibre…"
                    value={activeQuery}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && activeQuery.trim()) {
                        setMobileMenuOpen(false);
                        router.push(`/catalog?q=${encodeURIComponent(activeQuery.trim())}`);
                      }
                    }}
                    className="w-full bg-transparent text-xs text-white placeholder-white/40 focus:outline-none font-mono"
                  />
                  <button
                    type="button"
                    onClick={startVoiceSearch}
                    className="p-1 text-white/40 hover:text-[#C5A059]"
                    title="Voice Search"
                  >
                    🎙️
                  </button>
                  <input
                    ref={mobileFileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleVisualSearch}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => mobileFileInputRef.current?.click()}
                    className="p-1 text-white/40 hover:text-[#C5A059]"
                    title="Visual Search"
                  >
                    📷
                  </button>
                </div>
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

              <Link
                href="/checkout"
                onClick={() => setMobileMenuOpen(false)}
                className={`px-3 py-2 rounded-lg text-xs font-bold tracking-wider uppercase flex items-center justify-between ${
                  pathname === "/checkout"
                    ? "bg-[#C5A059] text-black"
                    : "border border-[#C5A059]/50 text-[#C5A059] hover:bg-[#C5A059]/10"
                }`}
              >
                <span>Checkout{effectiveCartCount > 0 ? ` (${effectiveCartCount})` : ""}</span>
                <span>→</span>
              </Link>

              <div className="pt-2 border-t border-white/10 space-y-1">
                {isAuthenticated && user ? (
                  <>
                    <Link
                      href="/profile"
                      onClick={() => setMobileMenuOpen(false)}
                      className="px-3 py-2 rounded-lg text-xs font-bold text-[#C5A059] hover:bg-white/5 flex items-center justify-between"
                    >
                      <span>My Profile ({user.name})</span>
                      <span>→</span>
                    </Link>
                    <button
                      onClick={() => {
                        setMobileMenuOpen(false);
                        logout();
                      }}
                      className="w-full text-left px-3 py-2 rounded-lg text-xs font-bold text-red-400 hover:bg-white/5 flex items-center justify-between cursor-pointer"
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

                {/* Mobile Theme Toggle Row */}
                <div className="px-3 py-2 flex items-center justify-between border-t border-white/10 mt-2 pt-3">
                  <span className="text-xs font-mono text-[#8E95A5]">Appearance Mode</span>
                  <ThemeToggle showLabel />
                </div>
              </div>
            </nav>
          </div>
        )}
      </header>
    </>
  );
}
