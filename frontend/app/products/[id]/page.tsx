"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { fetchProductById, fetchProducts, Product } from "@/lib/api";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SmoothImage from "@/components/SmoothImage";
import CartDrawer from "@/components/CartDrawer";
import WishlistDrawer from "@/components/WishlistDrawer";
import { useCart } from "@/lib/CartContext";
import { getProductImage, getProductImages } from "@/lib/productImages";

const ATELIER_ACCESSORIES = [
  {
    id: "acc-roll-03",
    name: "Barénia Leather Watch Roll",
    category: "Accessories",
    price: 380000,
    image_url: "/images/watches/watch_1548036328-c9fa8.jpg",
    description: "Tri-compartment cylindrical roll crafted in vegetable-tanned French calfskin with cushioned micro-suede dividers.",
    refCode: "Travel & Storage · Ref. ACC-ROLL-03",
    tag: "Hand-Stitched",
    warranty: "Lifetime Atelier Leather Guarantee",
  },
  {
    id: "acc-wnd-01",
    name: "Monolith Kinetic Calibre Winder",
    category: "Accessories",
    price: 640000,
    image_url: "/images/watches/watch_1523275335684-37.jpg",
    description: "Whisper-quiet brushless Swiss micro-motor engineered with customizable turns-per-day programs for automatic calibres.",
    refCode: "Winding Cabinet · Ref. ACC-WND-01",
    tag: "Programmable",
    warranty: "5-Year Swiss Motor Warranty",
  },
  {
    id: "acc-lop-10",
    name: "Aplanatic 10x Horologist Loupe",
    category: "Accessories",
    price: 165000,
    image_url: "/images/watches/speedmaster_chrono_titanium.jpg",
    description: "Anti-reflective coated double sapphire lens set in knurled warm champagne anodized brass housing with engraved serial number.",
    refCode: "Optics & Inspection · Ref. ACC-LOP-10",
    tag: "Collector Edition",
    warranty: "Certified Optical Alignment",
  },
];

type TabType = "DETAIL" | "SIZE DETAIL" | "RETURN POLICY" | "DELIVERY INFO";

export default function ProductDetailPage() {
  const router = useRouter();
  const params = useParams();
  const productId = params?.id as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);

  // Gallery & Zoom states
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isHoverZooming, setIsHoverZooming] = useState(false);
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 });
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const imageContainerRef = useRef<HTMLDivElement>(null);

  // Sample structure state: Active Tab & Dropdown sizes
  const [activeTab, setActiveTab] = useState<TabType>("DETAIL");
  const [selectedRegion, setSelectedRegion] = useState("UK");
  const [selectedSize, setSelectedSize] = useState("41mm");

  // Modals for Size Guide & Terms
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);
  const [isTermsOpen, setIsTermsOpen] = useState(false);

  // Concierge Consultation Modal
  const [isConciergeOpen, setIsConciergeOpen] = useState(false);
  const [conciergeMsg, setConciergeMsg] = useState("");
  const [conciergeSent, setConciergeSent] = useState(false);

  // Vault Reservation Timer
  const [timerSeconds, setTimerSeconds] = useState(28 * 60 + 44);

  // Bespoke Engraving State
  const [engravingText, setEngravingText] = useState("");
  const [engravingSaved, setEngravingSaved] = useState(false);

  // Global Cart Context
  const {
    cart,
    wishlist,
    addToCart,
    toggleWishlist,
    isInWishlist,
    isCartOpen,
    setIsCartOpen,
    isWishlistOpen,
    setIsWishlistOpen,
    toastMessage,
    showToast,
  } = useCart();

  useEffect(() => {
    async function loadProductData() {
      if (!productId) return;
      setLoading(true);
      try {
        const prod = await fetchProductById(productId);
        if (prod) {
          setProduct(prod);
          if (prod.case_size) {
            setSelectedSize(prod.case_size);
          }
          const all = await fetchProducts({ category: prod.category });
          setRelatedProducts(all.filter((p) => p.id !== prod.id).slice(0, 4));
        }
      } catch (err) {
        console.error("Failed to load product:", err);
      } finally {
        setLoading(false);
      }
    }
    loadProductData();
  }, [productId]);

  // Countdown Timer
  useEffect(() => {
    const interval = setInterval(() => {
      setTimerSeconds((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTimer = (total: number) => {
    const mins = Math.floor(total / 60);
    const secs = total % 60;
    return `${mins < 10 ? "0" : ""}${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  const handleExtendTimer = () => {
    setTimerSeconds((prev) => prev + 15 * 60);
    showToast("Geneva Vault Hold extended by +15:00 minutes.");
  };

  const handleSaveEngraving = () => {
    if (!engravingText.trim()) return;
    setEngravingSaved(true);
    showToast(`Bespoke engraving "${engravingText.trim()}" saved.`);
  };

  const isWishlisted = product ? isInWishlist(product.id) : false;

  const handleBuyNow = () => {
    if (!product) return;
    addToCart(product, quantity);
    router.push("/checkout");
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!imageContainerRef.current) return;
    const rect = imageContainerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomPos({ x, y });
  };

  const formatCurrency = (amount: number) => {
    return `LKR ${Number(amount || 0).toLocaleString("en-US")}`;
  };

  const formatUSD = (lkrAmount: number) => {
    const usd = Math.round(lkrAmount / 304);
    return `$ ${usd.toLocaleString("en-US")}`;
  };

  const formatEUR = (lkrAmount: number) => {
    const eur = Math.round(lkrAmount / 330);
    return `€ ${eur.toLocaleString("en-US")}`;
  };

  const totalCartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#070707] text-white flex flex-col font-sans">
        <Navbar cartCount={totalCartCount} wishlistCount={wishlist.length} />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-3 font-mono text-xs text-[#E88C30] animate-pulse">
            <div className="text-3xl">✦</div>
            <div>Loading product details...</div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-[#070707] text-white flex flex-col font-sans">
        <Navbar cartCount={totalCartCount} wishlistCount={wishlist.length} />
        <div className="flex-1 flex flex-col items-center justify-center p-6 space-y-4 text-center">
          <div className="text-4xl text-[#E88C30]">✦</div>
          <h2 className="text-xl font-bold uppercase tracking-tight">Timepiece Not Located</h2>
          <Link
            href="/catalog"
            className="px-6 py-2.5 bg-[#E88C30] text-black text-xs font-mono font-bold uppercase tracking-wider hover:bg-[#d47b24]"
          >
            Return to Catalogue
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const galleryImages = getProductImages(product.id, product.images, product.image_url);
  const activeImage = galleryImages[activeImageIndex] || galleryImages[0];

  // Variations list: uses related products or different angles
  const variationList = [
    { id: product.id, name: product.name, image: galleryImages[0], isCurrent: true },
    ...(relatedProducts.slice(0, 3).map((p, idx) => ({
      id: p.id,
      name: p.name,
      image: getProductImage(p.id, p.image_url),
      isCurrent: false,
    }))),
  ];

  // Dynamic Tab Content
  const renderTabContent = () => {
    switch (activeTab) {
      case "DETAIL":
        return (
          <div className="space-y-2 text-xs font-mono">
            <div className="flex items-center justify-between py-2 border-b border-white/5">
              <span className="text-neutral-400">SKU</span>
              <span className="text-white font-semibold uppercase">{product.id.replace(/^prod-/, "").toUpperCase() || "ASDK12453578GXZ"}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-white/5">
              <span className="text-neutral-400">Upper Material</span>
              <span className="text-white font-medium">{product.case_material || "Oystersteel 904L / Ceramic"}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-white/5">
              <span className="text-neutral-400">Inner Material</span>
              <span className="text-white font-medium">Anti-Reflective Sapphire Crystal</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-white/5">
              <span className="text-neutral-400">Sole Material</span>
              <span className="text-white font-medium">{product.movement || "Swiss Automatic Mechanical Calibre"}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-white/5">
              <span className="text-neutral-400">Inner Sole Material</span>
              <span className="text-white font-medium">{product.water_resistance || "100m (10 ATM) Sealed Gasket"}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-white/5">
              <span className="text-neutral-400">Warranty</span>
              <span className="text-[#E88C30] font-medium">{product.warranty || "5-Year International Atelier Warranty"}</span>
            </div>
          </div>
        );
      case "SIZE DETAIL":
        return (
          <div className="space-y-2 text-xs font-mono">
            <div className="flex items-center justify-between py-2 border-b border-white/5">
              <span className="text-neutral-400">Case Diameter</span>
              <span className="text-white font-medium">{product.case_size || "41 mm"}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-white/5">
              <span className="text-neutral-400">Case Thickness</span>
              <span className="text-white font-medium">12.4 mm (Profile)</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-white/5">
              <span className="text-neutral-400">Lug-to-Lug Distance</span>
              <span className="text-white font-medium">48.2 mm</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-white/5">
              <span className="text-neutral-400">Strap / Lug Width</span>
              <span className="text-white font-medium">20 mm (Tapered to 16 mm)</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-white/5">
              <span className="text-neutral-400">Wrist Fit Scope</span>
              <span className="text-white font-medium">160 mm - 215 mm (Micro-adjustable)</span>
            </div>
          </div>
        );
      case "RETURN POLICY":
        return (
          <div className="space-y-3 text-xs font-mono text-neutral-300 leading-relaxed">
            <p>
              ✦ <strong className="text-white">14-Day Complimentary Inspection:</strong> You may return or exchange this timepiece within 14 days of signed delivery.
            </p>
            <p>
              ✦ <strong className="text-white">Tamper-Evident Security Seal:</strong> Timepiece must retain the holographic Geneva security hangtag and undamaged caseback seal.
            </p>
            <p>
              ✦ <strong className="text-white">Complimentary Insured Transit:</strong> Return shipping is fully covered via scheduled armored courier pickup.
            </p>
          </div>
        );
      case "DELIVERY INFO":
        return (
          <div className="space-y-3 text-xs font-mono text-neutral-300 leading-relaxed">
            <p>
              📦 <strong className="text-white">Insured Armored Handover:</strong> Dispatched within 24 hours under 100% full-value escrow insurance.
            </p>
            <p>
              ⏱ <strong className="text-white">Transit Timelines:</strong> Domestic Sri Lanka: Next Business Day. International (Geneva/Dubai/London/NY): 2 - 4 business days.
            </p>
            <p>
              ✍️ <strong className="text-white">Signature Verification:</strong> Photo ID required upon courier handover with digital custody receipt.
            </p>
          </div>
        );
      default:
        return null;
    }
  };

  const discountPercent = product.promo_discount_percent || 30;

  return (
    <div className="min-h-screen flex flex-col bg-[#0A0A0A] text-white selection:bg-[#E88C30] selection:text-black font-sans">
      <Navbar
        cartCount={totalCartCount}
        wishlistCount={wishlist.length}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenWishlist={() => setIsWishlistOpen(true)}
      />

      {/* Global Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#161616] border border-[#E88C30] text-[#E88C30] px-5 py-3 text-xs font-bold font-mono uppercase tracking-wider flex items-center gap-2 shadow-2xl animate-fade-in">
          <span>✦</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Allocation & Vault Status Ribbon */}
      <section className="w-full bg-[#111111] border-b border-[#222222] py-2 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-xs font-mono">
          <div className="flex items-center gap-2.5">
            <span className="inline-block w-2 h-2 rounded-full bg-[#22C55E] shadow-[0_0_8px_rgba(34,197,94,0.6)] animate-pulse" />
            <span className="text-[#E88C30] uppercase tracking-wider font-semibold">
              Authenticated Stock
            </span>
            <span className="text-white/30">/</span>
            <span className="text-white/60">
              Allocation ID: <span className="text-white">#0x{product.id.slice(-6).toUpperCase()}</span>
            </span>
          </div>

          <div className="flex items-center gap-3 bg-[#1A1A1A] px-3 py-0.5 rounded border border-[#2B2B2B]">
            <span className="text-[#E88C30] text-xs">⏱</span>
            <span className="text-white/70 uppercase tracking-wider text-[10px]">Priority Hold:</span>
            <span className={`font-mono font-bold text-xs ${timerSeconds === 0 ? "text-red-500" : "text-[#E88C30]"}`}>
              {formatTimer(timerSeconds)}
            </span>
            <button
              onClick={handleExtendTimer}
              className="text-[9px] uppercase font-bold text-white/50 hover:text-[#E88C30] ml-1 transition-colors"
            >
              Extend
            </button>
          </div>
        </div>
      </section>

      {/* Main Container - Implemented directly matching the sample layout */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 py-8 sm:py-12">
        <div className="bg-[#121212] rounded-2xl border border-[#242424] shadow-2xl p-6 sm:p-8 lg:p-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            
            {/* ========================================================
                LEFT COLUMN:
                1. Main Image Showcase with 30% Starburst Badge
                2. Pagination Dots
                3. OTHER VARIATIONS Section
                4. Tabs Section (DETAIL, SIZE DETAIL, RETURN POLICY, DELIVERY INFO)
                5. Key-Value Specification Grid
               ======================================================== */}
            <div className="lg:col-span-7 space-y-6">
              
              {/* 1. Main Showcase Image Box with Starburst Badge */}
              <div className="relative">
                <div
                  ref={imageContainerRef}
                  onMouseEnter={() => setIsHoverZooming(true)}
                  onMouseLeave={() => setIsHoverZooming(false)}
                  onMouseMove={handleMouseMove}
                  onClick={() => setIsLightboxOpen(true)}
                  className="relative aspect-square sm:aspect-[4/3] bg-[#1A1A1A] rounded-xl border border-[#2B2B2B] overflow-hidden flex items-center justify-center cursor-zoom-in group shadow-inner"
                >
                  {/* Starburst Discount Badge (Matching sample's 30% red starburst badge) */}
                  <div className="absolute top-4 right-4 z-20 flex items-center justify-center">
                    <div className="relative w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center filter drop-shadow-lg">
                      <svg
                        viewBox="0 0 100 100"
                        className="w-full h-full text-[#EF4444] fill-current animate-pulse transform hover:scale-105 transition-transform"
                      >
                        <path d="M50 0 L58 15 L74 6 L75 24 L92 22 L86 38 L100 45 L89 57 L99 70 L83 76 L86 94 L70 91 L65 107 L50 97 L35 107 L30 91 L14 94 L17 76 L1 70 L11 57 L0 45 L14 38 L8 22 L25 24 L26 6 L42 15 Z" />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-white font-extrabold font-sans text-xs sm:text-sm leading-none drop-shadow">
                        <span>{discountPercent}%</span>
                      </div>
                    </div>
                  </div>

                  {/* Optional Ref code pill on top left */}
                  <div className="absolute top-4 left-4 z-20">
                    <span className="text-[10px] font-mono font-bold tracking-wider px-2.5 py-1 bg-black/70 backdrop-blur-md text-[#E88C30] border border-[#E88C30]/30 rounded">
                      Ref. {product.id}
                    </span>
                  </div>

                  {/* Main Product Image with Zoom */}
                  {isHoverZooming ? (
                    <div
                      className="w-full h-full"
                      style={{
                        backgroundImage: `url(${activeImage})`,
                        backgroundPosition: `${zoomPos.x}% ${zoomPos.y}%`,
                        backgroundSize: "220%",
                      }}
                    />
                  ) : (
                    <div className="w-full h-full p-4 flex items-center justify-center">
                      <SmoothImage
                        src={activeImage}
                        alt={product.name}
                        className="max-h-full max-w-full object-contain transition-transform duration-500 group-hover:scale-105"
                        priority
                      />
                    </div>
                  )}
                </div>

                {/* 2. Carousel / Pagination Dots (Matching sample image dots) */}
                <div className="flex items-center justify-center gap-2 pt-3">
                  {galleryImages.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImageIndex(idx)}
                      className={`h-2 rounded-full transition-all duration-300 ${
                        activeImageIndex === idx
                          ? "w-6 bg-[#E88C30] shadow-[0_0_8px_rgba(232,140,48,0.6)]"
                          : "w-2 bg-neutral-600 hover:bg-neutral-400"
                      }`}
                      aria-label={`View image ${idx + 1}`}
                    />
                  ))}
                </div>
              </div>

              {/* 3. OTHER VARIATIONS Section (Matching sample layout) */}
              <div className="space-y-2.5 pt-2">
                <h3 className="text-xs font-mono uppercase tracking-widest text-neutral-400 font-bold">
                  OTHER VARIATIONS
                </h3>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                  {variationList.map((variation, index) => {
                    const isSelected = variation.isCurrent && activeImageIndex === 0;
                    return (
                      <Link
                        key={variation.id + index}
                        href={variation.isCurrent ? "#" : `/products/${variation.id}`}
                        onClick={(e) => {
                          if (variation.isCurrent) {
                            e.preventDefault();
                            setActiveImageIndex(0);
                          }
                        }}
                        className={`aspect-square bg-[#1A1A1A] rounded-lg border p-2 flex items-center justify-center relative overflow-hidden group transition-all ${
                          isSelected
                            ? "border-[#E88C30] ring-1 ring-[#E88C30] shadow-[0_0_10px_rgba(232,140,48,0.25)]"
                            : "border-[#2B2B2B] hover:border-neutral-500 opacity-80 hover:opacity-100"
                        }`}
                        title={variation.name}
                      >
                        <SmoothImage
                          src={variation.image}
                          alt={variation.name}
                          className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform"
                        />
                      </Link>
                    );
                  })}
                </div>
              </div>

              {/* 4. Tabs Section (DETAIL, SIZE DETAIL, RETURN POLICY, DELIVERY INFO) */}
              <div className="pt-6 border-t border-[#222222] space-y-4">
                <div className="flex items-center gap-6 sm:gap-8 border-b border-[#242424] text-xs font-mono font-bold uppercase tracking-wider overflow-x-auto pb-1">
                  {(["DETAIL", "SIZE DETAIL", "RETURN POLICY", "DELIVERY INFO"] as TabType[]).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`pb-3 relative whitespace-nowrap transition-colors ${
                        activeTab === tab
                          ? "text-[#E88C30] font-bold"
                          : "text-neutral-400 hover:text-white"
                      }`}
                    >
                      {tab}
                      {activeTab === tab && (
                        <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#E88C30] rounded-full shadow-[0_0_8px_rgba(232,140,48,0.5)]" />
                      )}
                    </button>
                  ))}
                </div>

                {/* 5. Key-Value Specification Grid (Matching sample detail table) */}
                <div className="pt-2">
                  {renderTabContent()}
                </div>
              </div>

            </div>

            {/* ========================================================
                RIGHT COLUMN:
                1. Category Breadcrumb (MEN / LIFESTYLE / ...)
                2. PRODUCT CODE : 12678ASFG
                3. Title in Accent Orange (CANVAS SNEAKER - BLACK)
                4. Price & Star Reviews ($ 70 / € 65  ★★★★★ 17 reviews)
                5. Product Description
                6. SIZE (UK ⌄  SIZE ⌄  SIZE GUIDE)
                7. Action Buttons (ADD TO CART  |  ADD TO WISHLIST)
                8. DELIVERY ESTIMATE (Read our Terms and Conditions)
               ======================================================== */}
            <div className="lg:col-span-5 space-y-6">
              
              {/* 1. Category Breadcrumb */}
              <div className="text-[11px] font-mono uppercase tracking-wider text-neutral-400 flex items-center flex-wrap gap-1.5">
                <span>{product.gender?.toUpperCase() || "MEN"}</span>
                <span>/</span>
                <span>{product.category?.toUpperCase() || "LUXURY"}</span>
                <span>/</span>
                <span>{product.brand?.toUpperCase() || "CHRONOMETER"}</span>
                <span>/</span>
                <span className="text-white/80">{product.movement ? "AUTOMATIC" : "TIMEPIECE"}</span>
              </div>

              {/* 2. Product Code */}
              <div className="font-mono text-xs uppercase tracking-widest text-neutral-400">
                PRODUCT CODE : <span className="text-white font-semibold">{product.id.replace(/^prod-/, "").toUpperCase() || "12678ASFG"}</span>
              </div>

              {/* 3. Product Title (Vibrant Accent Orange Title) */}
              <h1 className="text-2xl sm:text-3xl font-display font-extrabold uppercase tracking-wide text-[#E88C30] leading-tight drop-shadow-sm">
                {product.name}
              </h1>

              {/* 4. Dual Price & Star Ratings Row */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#242424] pb-5">
                <div className="flex items-baseline gap-3">
                  <span className="text-2xl sm:text-3xl font-mono font-bold text-white">
                    {formatUSD(product.price)} / {formatEUR(product.price)}
                  </span>
                  <span className="text-xs font-mono text-[#E88C30]/80">
                    ({formatCurrency(product.price)})
                  </span>
                </div>

                <div className="flex items-center gap-2 text-xs font-mono text-[#F59E0B]">
                  <span className="tracking-widest">★★★★★</span>
                  <span className="text-neutral-400 text-[11px]">(17 reviews)</span>
                </div>
              </div>

              {/* 5. Product Description */}
              <div className="text-xs text-neutral-300 font-sans leading-relaxed">
                <p>{product.description || "Crafted to perfection with premium materials, certified chronometric movement, and exceptional attention to horological heritage."}</p>
              </div>

              {/* 6. SIZE Selection Section (Dropdowns & Size Guide Link) */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-mono font-bold uppercase tracking-wider text-neutral-300">
                    SIZE
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsSizeGuideOpen(true)}
                    className="text-[11px] font-mono uppercase tracking-wider text-neutral-400 hover:text-[#E88C30] underline transition-colors"
                  >
                    SIZE GUIDE
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3 font-mono text-xs">
                  {/* Dropdown 1: Region / System (e.g., UK, EU, US, MM) */}
                  <div className="relative">
                    <select
                      value={selectedRegion}
                      onChange={(e) => setSelectedRegion(e.target.value)}
                      className="w-full bg-[#1A1A1A] border border-[#333333] hover:border-[#E88C30] text-white px-3.5 py-2.5 rounded-lg appearance-none cursor-pointer focus:outline-none focus:border-[#E88C30] uppercase font-mono transition-colors"
                    >
                      <option value="UK">UK</option>
                      <option value="US">US</option>
                      <option value="EU">EU</option>
                      <option value="MM">MM (Metric)</option>
                    </select>
                    <span className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-neutral-400 text-[10px]">
                      ▼
                    </span>
                  </div>

                  {/* Dropdown 2: Case Size / Strap Fit */}
                  <div className="relative">
                    <select
                      value={selectedSize}
                      onChange={(e) => setSelectedSize(e.target.value)}
                      className="w-full bg-[#1A1A1A] border border-[#333333] hover:border-[#E88C30] text-white px-3.5 py-2.5 rounded-lg appearance-none cursor-pointer focus:outline-none focus:border-[#E88C30] uppercase font-mono transition-colors"
                    >
                      <option value="39mm">SIZE: 39mm</option>
                      <option value="40mm">SIZE: 40mm</option>
                      <option value="41mm">SIZE: 41mm (Standard)</option>
                      <option value="42mm">SIZE: 42mm</option>
                      <option value="44mm">SIZE: 44mm</option>
                    </select>
                    <span className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-neutral-400 text-[10px]">
                      ▼
                    </span>
                  </div>
                </div>
              </div>

              {/* 7. Action Buttons Row (ADD TO CART + ADD TO WISHLIST) */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center gap-3">
                  {/* Quantity selector */}
                  <div className="flex items-center border border-[#333333] bg-[#1A1A1A] rounded-lg">
                    <button
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      className="px-3 py-2.5 text-neutral-400 hover:text-white transition-colors"
                      title="Decrease quantity"
                    >
                      -
                    </button>
                    <span className="px-3 py-2.5 font-mono text-xs font-bold text-white">{quantity}</span>
                    <button
                      onClick={() => setQuantity((q) => q + 1)}
                      className="px-3 py-2.5 text-neutral-400 hover:text-white transition-colors"
                      title="Increase quantity"
                    >
                      +
                    </button>
                  </div>

                  {/* Add to Cart Button (Solid Vibrant Orange Button) */}
                  <button
                    onClick={() => {
                      addToCart(product, quantity);
                      setIsCartOpen(true);
                    }}
                    className="flex-1 py-3.5 px-6 bg-gradient-to-r from-[#E67E22] via-[#E88C30] to-[#F39C12] hover:from-[#D35400] hover:to-[#E67E22] text-white font-bold text-xs uppercase tracking-widest rounded-lg shadow-lg shadow-orange-500/25 active:scale-[0.99] transition-all flex items-center justify-center gap-2"
                  >
                    <span>ADD TO CART</span>
                  </button>

                  {/* Add to Wishlist Button (Outlined Button) */}
                  <button
                    onClick={() => toggleWishlist(product)}
                    className={`py-3.5 px-5 rounded-lg border font-mono text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 whitespace-nowrap ${
                      isWishlisted
                        ? "border-red-500 bg-red-500/10 text-red-400"
                        : "border-[#333333] hover:border-[#E88C30] text-neutral-300 hover:text-white bg-[#1A1A1A]"
                    }`}
                    title={isWishlisted ? "Remove from Wishlist" : "Add to Wishlist"}
                  >
                    <span>{isWishlisted ? "♥" : "♡"}</span>
                    <span className="hidden sm:inline">{isWishlisted ? "WISHLISTED" : "WISHLIST"}</span>
                  </button>
                </div>

                {/* Instant Checkout Button */}
                <button
                  onClick={handleBuyNow}
                  className="w-full py-3 bg-[#1A1A1A] hover:bg-[#252525] border border-[#333333] hover:border-[#E88C30] text-white text-xs font-mono font-bold uppercase tracking-wider rounded-lg transition-all"
                >
                  Proceed Directly to Checkout →
                </button>
              </div>

              {/* 8. DELIVERY ESTIMATE Section */}
              <div className="pt-5 border-t border-[#242424] space-y-2 font-mono text-xs">
                <h4 className="text-neutral-300 font-bold uppercase tracking-wider text-xs">
                  DELIVERY ESTIMATE
                </h4>
                <p className="text-neutral-400 leading-relaxed text-[11px]">
                  Estimated delivery: 2 - 4 business days via insured armored courier. Direct signature required upon delivery.
                </p>
                <div>
                  <button
                    type="button"
                    onClick={() => setIsTermsOpen(true)}
                    className="text-[#E88C30] hover:underline text-[11px] font-semibold"
                  >
                    Read our Terms and Conditions
                  </button>
                </div>
              </div>

              {/* Bespoke Caseback Engraving (Collapsible Accordion) */}
              <div className="bg-[#171717] rounded-lg border border-[#2B2B2B] p-3.5">
                <details className="group cursor-pointer">
                  <summary className="flex items-center justify-between list-none text-neutral-300 hover:text-white transition-colors">
                    <div className="flex items-center gap-2 font-mono text-xs">
                      <span className="text-[#E88C30]">✒</span>
                      <span className="font-bold uppercase tracking-wider">
                        Bespoke Caseback Engraving
                      </span>
                      <span className="px-1.5 py-0.5 bg-[#262626] text-[#E88C30] text-[9px] uppercase font-bold rounded">
                        Complimentary
                      </span>
                    </div>
                    <span className="text-xs transition-transform group-open:rotate-180">▼</span>
                  </summary>
                  <div className="mt-3 pt-3 border-t border-[#2B2B2B] flex flex-col gap-2 font-mono text-xs">
                    <label className="text-[10px] text-neutral-400">
                      Up to 14 characters engraved on caseback rim:
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        maxLength={14}
                        value={engravingText}
                        onChange={(e) => {
                          setEngravingText(e.target.value);
                          setEngravingSaved(false);
                        }}
                        placeholder="e.g. M.V. · 2026"
                        className="bg-black border border-[#333333] px-3 py-1.5 text-xs text-white rounded focus:outline-none focus:border-[#E88C30] flex-1 font-mono uppercase"
                      />
                      <button
                        type="button"
                        onClick={handleSaveEngraving}
                        className="px-3 py-1.5 bg-[#2B2B2B] hover:bg-[#E88C30] hover:text-black text-white text-xs font-bold uppercase rounded transition-colors"
                      >
                        {engravingSaved ? "✓ Saved" : "Save"}
                      </button>
                    </div>
                  </div>
                </details>
              </div>

              {/* Private Concierge Consultation Desk */}
              <button
                onClick={() => setIsConciergeOpen(true)}
                className="w-full py-2.5 border border-dashed border-[#333333] hover:border-[#E88C30] text-neutral-400 hover:text-[#E88C30] text-xs font-mono uppercase tracking-wider rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <span>✦</span>
                <span>Inquire with Private Horology Concierge</span>
              </button>

            </div>

          </div>
        </div>

        {/* Curated Accessories / Related Timepieces Grid */}
        {relatedProducts.length > 0 && (
          <section className="mt-16 space-y-6">
            <div className="flex items-center justify-between border-b border-[#222222] pb-4">
              <div>
                <span className="text-[10px] font-mono text-[#E88C30] uppercase tracking-widest font-bold">
                  Recommended Timepieces
                </span>
                <h2 className="text-xl font-bold text-white uppercase mt-1">
                  You May Also Like
                </h2>
              </div>
              <Link href="/catalog" className="text-xs font-mono text-[#E88C30] hover:underline uppercase">
                Explore All →
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((rel) => {
                const img = getProductImage(rel.id, rel.image_url);
                return (
                  <Link
                    key={rel.id}
                    href={`/products/${rel.id}`}
                    className="bg-[#121212] border border-[#242424] hover:border-[#E88C30] rounded-xl p-4 transition-all group block shadow-md hover:shadow-xl"
                  >
                    <div className="aspect-square bg-[#1A1A1A] rounded-lg mb-3 overflow-hidden flex items-center justify-center p-3">
                      <SmoothImage src={img} alt={rel.name} className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform" />
                    </div>
                    <div className="text-[9px] font-mono text-[#E88C30] uppercase font-bold">
                      {rel.brand}
                    </div>
                    <div className="text-xs font-semibold text-white group-hover:text-[#E88C30] truncate mt-1">
                      {rel.name}
                    </div>
                    <div className="text-xs font-mono text-white font-bold mt-2">
                      {formatCurrency(rel.price)}
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        )}
      </main>

      {/* Size Guide Modal */}
      {isSizeGuideOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#141414] border border-[#333333] rounded-xl p-6 sm:p-8 max-w-lg w-full space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#262626] pb-3">
              <h3 className="text-sm font-mono uppercase text-[#E88C30] font-bold tracking-wider">
                Watch Case &amp; Wrist Sizing Guide
              </h3>
              <button
                onClick={() => setIsSizeGuideOpen(false)}
                className="text-neutral-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>
            <div className="space-y-4 text-xs font-mono text-neutral-300">
              <p>
                Our cases are engineered according to Swiss horological standards. Use the chart below to match case diameter to your wrist circumference:
              </p>
              <div className="border border-[#2B2B2B] rounded overflow-hidden">
                <table className="w-full text-left">
                  <thead className="bg-[#1A1A1A] text-neutral-400 border-b border-[#2B2B2B]">
                    <tr>
                      <th className="p-2.5">Case Diameter</th>
                      <th className="p-2.5">Wrist Circumference</th>
                      <th className="p-2.5">Fit Recommendation</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#242424]">
                    <tr>
                      <td className="p-2.5 font-bold text-white">38mm - 39mm</td>
                      <td className="p-2.5">150mm - 170mm (6.0&quot; - 6.7&quot;)</td>
                      <td className="p-2.5 text-[#22C55E]">Classic Vintage</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-bold text-white">40mm - 41mm</td>
                      <td className="p-2.5">165mm - 190mm (6.5&quot; - 7.5&quot;)</td>
                      <td className="p-2.5 text-[#E88C30]">Universal Standard</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-bold text-white">42mm - 44mm</td>
                      <td className="p-2.5">180mm - 210mm (7.1&quot; - 8.3&quot;)</td>
                      <td className="p-2.5 text-blue-400">Sport Chrono</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p className="text-[11px] text-neutral-400">
                Complimentary micro-adjustment links and custom strap sizing are provided with every order.
              </p>
            </div>
            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setIsSizeGuideOpen(false)}
                className="px-4 py-2 bg-[#E88C30] text-black text-xs font-mono font-bold uppercase rounded hover:bg-[#d47b24]"
              >
                Got It
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Terms and Conditions Modal */}
      {isTermsOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#141414] border border-[#333333] rounded-xl p-6 sm:p-8 max-w-lg w-full space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#262626] pb-3">
              <h3 className="text-sm font-mono uppercase text-[#E88C30] font-bold tracking-wider">
                Delivery &amp; Authentication Terms
              </h3>
              <button
                onClick={() => setIsTermsOpen(false)}
                className="text-neutral-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>
            <div className="space-y-3 text-xs font-mono text-neutral-300 leading-relaxed max-h-80 overflow-y-auto pr-2">
              <p>
                <strong>1. Armored Transit Escrow:</strong> Every timepiece shipment is secured with 100% full-value Lloyd&apos;s or Swiss marine insurance until in-person signature handover.
              </p>
              <p>
                <strong>2. Tamper-Evident Security Seal:</strong> Timepieces arrive with verified serial verification holograms. Removal of the caseback tag constitutes ownership acceptance.
              </p>
              <p>
                <strong>3. 14-Day Return Guarantee:</strong> If unsatisfied, notify concierge within 14 days of receipt for an insured return dispatch.
              </p>
              <p>
                <strong>4. Customs &amp; Import Duties:</strong> All taxes and duties are prepaid and inclusive in your checkout total. No surprise fees upon courier handover.
              </p>
            </div>
            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setIsTermsOpen(false)}
                className="px-4 py-2 bg-[#E88C30] text-black text-xs font-mono font-bold uppercase rounded hover:bg-[#d47b24]"
              >
                Close Terms
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Concierge Modal */}
      {isConciergeOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#141414] border border-[#333333] rounded-xl p-6 sm:p-8 max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#262626] pb-3">
              <span className="text-xs font-mono uppercase text-[#E88C30] font-bold tracking-widest">
                Private Horology Consultation
              </span>
              <button onClick={() => setIsConciergeOpen(false)} className="text-white/60 hover:text-white">✕</button>
            </div>
            {conciergeSent ? (
              <div className="text-center py-6 space-y-2">
                <div className="text-2xl text-[#E88C30]">✓</div>
                <div className="text-sm font-sans font-bold">Inquiry Dispatched</div>
                <p className="text-xs text-white/60 font-mono">Our senior horologist will contact you within 2 business hours.</p>
                <button
                  onClick={() => { setIsConciergeOpen(false); setConciergeSent(false); }}
                  className="mt-4 px-4 py-2 bg-[#E88C30] text-black text-xs font-mono font-bold uppercase rounded"
                >
                  Close
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-xs text-neutral-300 font-mono">
                  Inquiring on: <span className="text-white font-semibold">{product.name}</span>
                </p>
                <textarea
                  rows={3}
                  value={conciergeMsg}
                  onChange={(e) => setConciergeMsg(e.target.value)}
                  placeholder="Inquire about bespoke sizing, vault inspection, or private wire transfer..."
                  className="w-full bg-black border border-[#333333] rounded p-3 text-xs text-white focus:outline-none focus:border-[#E88C30] font-mono resize-none"
                />
                <button
                  onClick={() => setConciergeSent(true)}
                  className="w-full py-2.5 bg-[#E88C30] text-black text-xs font-mono font-bold uppercase rounded hover:bg-[#d47b24] transition-colors"
                >
                  Dispatch to Concierge Desk
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Cart & Wishlist Drawers */}
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} onOpenCheckout={() => { setIsCartOpen(false); router.push("/checkout"); }} />
      <WishlistDrawer isOpen={isWishlistOpen} onClose={() => setIsWishlistOpen(false)} />

      <Footer />
    </div>
  );
}
