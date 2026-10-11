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

  // Concierge Consultation Modal
  const [isConciergeOpen, setIsConciergeOpen] = useState(false);
  const [conciergeMsg, setConciergeMsg] = useState("");
  const [conciergeSent, setConciergeSent] = useState(false);

  // Stitch Vault Reservation Timer
  const [timerSeconds, setTimerSeconds] = useState(28 * 60 + 44);

  // Stitch Bespoke Engraving State
  const [engravingText, setEngravingText] = useState("");
  const [engravingSaved, setEngravingSaved] = useState(false);

  // Stitch Provenance Services Preferences
  const [provenanceOpt1, setProvenanceOpt1] = useState(true);
  const [provenanceOpt2, setProvenanceOpt2] = useState(true);
  const [provenanceOpt3, setProvenanceOpt3] = useState(false);

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
    setIsCheckoutOpen,
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
    return `$${usd.toLocaleString("en-US")} USD`;
  };

  const totalCartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] text-white flex flex-col font-sans">
        <Navbar cartCount={totalCartCount} wishlistCount={wishlist.length} />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-3 font-mono text-xs text-[#C5A059] animate-pulse">
            <div className="text-2xl">✦</div>
            <div>Synchronizing Geneva Vault...</div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-[#050505] text-white flex flex-col font-sans">
        <Navbar cartCount={totalCartCount} wishlistCount={wishlist.length} />
        <div className="flex-1 flex flex-col items-center justify-center p-6 space-y-4 text-center">
          <div className="text-4xl text-[#C5A059]">✦</div>
          <h2 className="text-xl font-bold uppercase tracking-tight">Timepiece Not Located</h2>
          <Link
            href="/catalog"
            className="px-6 py-2.5 bg-[#C5A059] text-black text-xs font-mono font-bold uppercase tracking-wider hover:bg-[#b08d48]"
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

  return (
    <div className="min-h-screen flex flex-col bg-[#000000] text-white selection:bg-[#C5A059] selection:text-black font-sans">
      <Navbar
        cartCount={totalCartCount}
        wishlistCount={wishlist.length}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenWishlist={() => setIsWishlistOpen(true)}
      />

      {/* Global Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#111] border border-[#C5A059] text-[#C5A059] px-5 py-3 text-xs font-bold font-mono uppercase tracking-wider flex items-center gap-2 shadow-2xl animate-fade-in">
          <span>✦</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Stitch Top Marquee & Escrow Status Bar */}
      <section className="w-full bg-[#050505] border-b border-[#1F1F1F] py-2.5 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-mono">
          <div className="flex items-center gap-2.5">
            <span className="inline-block w-2 h-2 rounded-full bg-[#4ADE80] shadow-[0_0_8px_rgba(74,222,128,0.6)] animate-pulse"></span>
            <span className="text-[#C5A059] uppercase tracking-widest font-semibold">
              Geneva Vault Synchronized
            </span>
            <span className="text-[#4E4639]">/</span>
            <span className="text-white/60">
              Session Key: <span className="text-white">0x7F2A...{product.id.slice(-4).toUpperCase()}</span>
            </span>
          </div>

          <div className="flex items-center gap-3 bg-[#0E0E0E] px-3.5 py-1 border border-[#1F1F1F]">
            <span className="text-[#C5A059] text-[13px]">⏱</span>
            <span className="text-white/70 uppercase tracking-wider text-[10px]">Allocation Hold:</span>
            <span className={`font-mono font-bold text-sm ${timerSeconds === 0 ? "text-red-500" : "text-[#C5A059]"}`}>
              {formatTimer(timerSeconds)}
            </span>
            <span className="text-white/40 uppercase tracking-widest text-[9px]">Remaining</span>
          </div>
        </div>
      </section>

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-8 space-y-12">
        {/* Breadcrumb Navigation */}
        <div className="flex items-center gap-2 text-xs font-mono text-white/50">
          <Link href="/" className="hover:text-white transition-colors">Home</Link>
          <span>/</span>
          <Link href="/catalog" className="hover:text-white transition-colors">Catalogue</Link>
          <span>/</span>
          <span className="text-[#C5A059] uppercase font-semibold">{product.brand}</span>
          <span>/</span>
          <span className="text-white/80 truncate max-w-xs">{product.name}</span>
        </div>

        {/* Master Vitrine & Product Details Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          
          {/* LEFT: Photographic Vitrine & Multi-Angle Thumbnails (7 Cols) */}
          <div className="lg:col-span-7 space-y-4">
            <div
              ref={imageContainerRef}
              onMouseEnter={() => setIsHoverZooming(true)}
              onMouseLeave={() => setIsHoverZooming(false)}
              onMouseMove={handleMouseMove}
              onClick={() => setIsLightboxOpen(true)}
              className="relative aspect-square bg-[#050505] border border-[#1F1F1F] overflow-hidden cursor-zoom-in group shadow-2xl"
            >
              {/* Badges Overlay */}
              <div className="absolute top-3 left-3 z-20 flex flex-col gap-1.5">
                {product.badge && (
                  <span className="text-[10px] font-mono font-bold uppercase tracking-widest px-3 py-1 bg-[#C5A059] text-black shadow-md">
                    {product.badge}
                  </span>
                )}
                <span className="text-[9px] font-mono tracking-widest px-2 py-0.5 bg-black/80 backdrop-blur-md text-[#C5A059] border border-[#C5A059]/40 uppercase">
                  Ref. {product.id}
                </span>
                {product.is_on_promotion && (
                  <span className="text-[9px] font-mono font-bold tracking-widest px-2 py-0.5 bg-red-600/90 text-white uppercase">
                    -{product.promo_discount_percent || 10}% Special Allocation
                  </span>
                )}
              </div>

              {/* Interactive Zoom or High-Resolution Vitrine Image */}
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
                <SmoothImage
                  src={activeImage}
                  alt={product.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  priority
                />
              )}

              <div className="absolute bottom-3 right-3 px-2 py-1 bg-black/70 backdrop-blur-sm text-[10px] font-mono text-white/50 border border-white/10 uppercase">
                Hover to Magnify 10x
              </div>
            </div>

            {/* Thumbnail Strip */}
            {galleryImages.length > 1 && (
              <div className="flex items-center gap-3 overflow-x-auto pb-2">
                {galleryImages.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIndex(idx)}
                    className={`w-20 h-20 bg-[#0C0C0C] border relative overflow-hidden flex-shrink-0 transition-all ${
                      activeImageIndex === idx
                        ? "border-[#C5A059] scale-105 shadow-[0_0_12px_rgba(197,160,89,0.3)]"
                        : "border-[#1F1F1F] opacity-60 hover:opacity-100"
                    }`}
                  >
                    <SmoothImage src={img} alt={`Angle ${idx + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* Vault Hold Guarantee Banner (from Stitch lines 51-71) */}
            <div className="bg-[#0C0C0C] border border-[#1F1F1F] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative overflow-hidden">
              <div className="flex items-start gap-3">
                <span className="p-2 bg-[#1C1B1B] text-[#C5A059] text-base font-mono">⏳</span>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-mono text-[11px] font-bold text-white uppercase tracking-wider">
                      Vault Allocation Guarantee
                    </h3>
                    <span className="px-1.5 py-0.5 bg-[#C5A059]/15 text-[#C5A059] font-mono text-[9px] uppercase font-bold">
                      Active
                    </span>
                  </div>
                  <p className="font-mono text-[11px] text-white/60 mt-0.5 max-w-md leading-relaxed">
                    This reference and serial number are withheld in our Geneva vault. You have priority allocation for 30 minutes.
                  </p>
                </div>
              </div>
              <button
                onClick={handleExtendTimer}
                type="button"
                className="font-mono text-[11px] font-bold text-[#C5A059] uppercase tracking-widest hover:text-[#D4AF66] transition-colors whitespace-nowrap self-start sm:self-center"
              >
                + Extend Hold
              </button>
            </div>
          </div>

          {/* RIGHT: Stitch Product Description & Buying Controls (5 Cols) */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* 1. Header & Identity */}
            <div className="space-y-2 border-b border-[#1F1F1F] pb-5">
              <div className="flex items-center justify-between font-mono text-[11px] uppercase tracking-wider">
                <span className="text-[#C5A059] font-bold">{product.brand} · {product.category}</span>
                <span className="text-white/40">Ref. {product.id}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-serif font-bold text-white leading-tight">
                {product.name}
              </h1>

              {/* Price & USD approx */}
              <div className="flex items-baseline justify-between pt-2">
                <div className="flex items-baseline gap-3">
                  <span className="text-2xl sm:text-3xl font-mono font-bold text-[#C5A059]">
                    {formatCurrency(product.price)}
                  </span>
                  {product.old_price && product.old_price > product.price && (
                    <span className="text-xs font-mono text-white/40 line-through">
                      {formatCurrency(product.old_price)}
                    </span>
                  )}
                </div>
                <span className="font-mono text-xs text-white/50">
                  ≈ {formatUSD(product.price)}
                </span>
              </div>

              {/* Status */}
              <div className="flex items-center gap-2 pt-1 font-mono text-xs">
                <span className="w-2 h-2 rounded-full bg-[#4ADE80] shadow-[0_0_6px_#4ADE80]"></span>
                <span className="text-[#4ADE80] font-bold uppercase tracking-wider">
                  In Stock • Geneva Vault Allocation Available
                </span>
              </div>
            </div>

            {/* 2. Concise Product Description */}
            <div className="font-mono text-xs text-white/75 leading-relaxed bg-[#0C0C0C] p-4 border border-[#1F1F1F]">
              <p>{product.description}</p>
            </div>

            {/* 3. Stitch 3-Box Technical Specifications Vitrine Grid (from Stitch lines 94-107) */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 p-3.5 bg-[#080808] border border-[#1F1F1F] text-xs font-mono">
              <div>
                <span className="text-[9px] uppercase tracking-wider text-white/40 block">Case Architecture</span>
                <span className="text-white font-medium block mt-0.5">
                  {product.case_material || "Oystersteel 904L"} · {product.case_size || "41mm"}
                </span>
              </div>
              <div>
                <span className="text-[9px] uppercase tracking-wider text-white/40 block">Movement Calibre</span>
                <span className="text-white font-medium block mt-0.5">
                  {product.movement || "Swiss Automatic Calibre"}
                </span>
              </div>
              <div className="col-span-2 sm:col-span-1">
                <span className="text-[9px] uppercase tracking-wider text-white/40 block">Water Resistance</span>
                <span className="text-white font-medium block mt-0.5">
                  {product.water_resistance || "100m (10 ATM)"}
                </span>
              </div>
            </div>

            {/* 4. Manufacture & Provenance Badges (from Stitch lines 108-117) */}
            <div className="flex flex-wrap items-center gap-2 font-mono text-[10px]">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#121212] border border-[#222] text-white">
                <span className="text-[#C5A059]">✦</span>
                Complimentary Atelier Box &amp; 10x Loupe
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#121212] border border-[#222] text-[#C5A059]">
                <span>✓</span>
                COSC Chronometer Certified
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#121212] border border-[#222] text-white/80">
                <span>🛡️</span>
                Insured Armored Courier Transit
              </span>
            </div>

            {/* 5. Stitch Bespoke Hand-Engraving Accordion (from Stitch lines 138-160) */}
            <div className="bg-[#0C0C0C] border border-[#1F1F1F] p-4">
              <details className="group cursor-pointer">
                <summary className="flex items-center justify-between list-none text-white/80 hover:text-white transition-colors">
                  <div className="flex items-center gap-2 font-mono text-xs">
                    <span className="text-[#C5A059]">✒</span>
                    <span className="font-bold uppercase tracking-wider text-white">
                      Request Bespoke Caseback Monogram / Engraving
                    </span>
                    <span className="px-1.5 py-0.5 bg-[#1F1F1F] text-[#C5A059] text-[9px] uppercase font-bold">
                      Complimentary
                    </span>
                  </div>
                  <span className="text-xs transition-transform group-open:rotate-180">▼</span>
                </summary>
                <div className="mt-4 pt-3 border-t border-[#1F1F1F] flex flex-col gap-2.5 font-mono">
                  <label className="text-[11px] text-white/60">
                    Master Engraver Initial Limit: Up to 14 Roman letters or numbers on outer caseback rim.
                  </label>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <input
                      type="text"
                      maxLength={14}
                      value={engravingText}
                      onChange={(e) => {
                        setEngravingText(e.target.value);
                        setEngravingSaved(false);
                      }}
                      placeholder="e.g. M.V. · 2026"
                      className="bg-black border border-[#2A2A2A] px-3.5 py-2 text-xs text-white focus:outline-none focus:border-[#C5A059] flex-1 font-mono uppercase"
                    />
                    <button
                      type="button"
                      onClick={handleSaveEngraving}
                      className="px-4 py-2 bg-[#222] hover:bg-[#C5A059] hover:text-black text-white text-xs font-bold uppercase transition-colors"
                    >
                      {engravingSaved ? "✓ Engraving Saved" : "Save Engraving"}
                    </button>
                  </div>
                </div>
              </details>
            </div>

            {/* 6. Quantity, Add to Cart & Buy Now */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-3">
                <div className="flex items-center border border-[#2A2A2A] bg-black">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="px-3 py-2.5 text-white/70 hover:text-white"
                  >
                    -
                  </button>
                  <span className="px-4 py-2.5 font-mono text-xs font-bold">{quantity}</span>
                  <button
                    onClick={() => setQuantity((q) => q + 1)}
                    className="px-3 py-2.5 text-white/70 hover:text-white"
                  >
                    +
                  </button>
                </div>

                <button
                  onClick={() => {
                    addToCart(product, quantity);
                    setIsCartOpen(true);
                  }}
                  className="flex-1 py-3.5 bg-white hover:bg-[#C5A059] hover:text-black text-black font-bold text-xs tracking-widest uppercase transition-colors shadow"
                >
                  Add to Cart
                </button>

                <button
                  onClick={() => toggleWishlist(product)}
                  className={`p-3.5 border transition-colors ${
                    isWishlisted ? "border-red-500 text-red-500" : "border-[#2A2A2A] text-white/60 hover:text-white"
                  }`}
                  title="Save to Wishlist"
                >
                  ♥
                </button>
              </div>

              <button
                onClick={handleBuyNow}
                className="w-full py-4 bg-[#C5A059] hover:bg-[#b08d48] text-black font-bold text-xs tracking-[0.16em] uppercase transition-all shadow-xl hover:shadow-[#C5A059]/20"
              >
                Proceed to Secure Checkout
              </button>

              <button
                onClick={() => setIsConciergeOpen(true)}
                className="w-full py-2.5 border border-[#333] hover:border-white text-white/80 hover:text-white text-xs font-mono uppercase tracking-wider transition-colors"
              >
                Inquire with Private Concierge
              </button>
            </div>

            {/* 7. Concierge Handover & Provenance Protocol Services (from Stitch lines 252-298) */}
            <div className="bg-[#0C0C0C] border border-[#1F1F1F] p-4 space-y-3">
              <div className="flex items-center justify-between border-b border-[#1F1F1F] pb-2">
                <div>
                  <span className="font-mono text-[9px] uppercase tracking-widest text-[#C5A059] font-bold">
                    Haute Horlogerie Protocol
                  </span>
                  <h4 className="text-xs font-serif font-bold text-white uppercase mt-0.5">
                    Concierge Handover &amp; Provenance
                  </h4>
                </div>
                <span className="text-base text-[#C5A059]">✦</span>
              </div>

              <div className="grid grid-cols-1 gap-2.5 font-mono text-xs">
                {/* Protocol 1 */}
                <label className="flex items-start gap-3 p-2.5 bg-black/50 border border-[#1F1F1F] hover:border-[#333] cursor-pointer transition-colors">
                  <input
                    type="checkbox"
                    checked={provenanceOpt1}
                    onChange={(e) => setProvenanceOpt1(e.target.checked)}
                    className="accent-[#C5A059] mt-0.5"
                  />
                  <div className="flex-1">
                    <span className="font-bold text-white uppercase text-[11px] block">
                      Hand-Calligraphed Provenance Folio
                    </span>
                    <span className="text-[10px] text-white/60">
                      Bound in Swiss calfskin folio with wax seal of the Watchmaker Master.
                    </span>
                  </div>
                  <span className="text-[9px] text-[#C5A059] uppercase font-bold whitespace-nowrap">
                    Included
                  </span>
                </label>

                {/* Protocol 2 */}
                <label className="flex items-start gap-3 p-2.5 bg-black/50 border border-[#1F1F1F] hover:border-[#333] cursor-pointer transition-colors">
                  <input
                    type="checkbox"
                    checked={provenanceOpt2}
                    onChange={(e) => setProvenanceOpt2(e.target.checked)}
                    className="accent-[#C5A059] mt-0.5"
                  />
                  <div className="flex-1">
                    <span className="font-bold text-white uppercase text-[11px] block">
                      Bespoke Presentation Box
                    </span>
                    <span className="text-[10px] text-white/60">
                      Architectural presentation box with custom brass key and velvet lining.
                    </span>
                  </div>
                  <span className="text-[9px] text-[#C5A059] uppercase font-bold whitespace-nowrap">
                    Courtesy
                  </span>
                </label>

                {/* Protocol 3 */}
                <label className="flex items-start gap-3 p-2.5 bg-black/50 border border-[#1F1F1F] hover:border-[#333] cursor-pointer transition-colors">
                  <input
                    type="checkbox"
                    checked={provenanceOpt3}
                    onChange={(e) => setProvenanceOpt3(e.target.checked)}
                    className="accent-[#C5A059] mt-0.5"
                  />
                  <div className="flex-1">
                    <span className="font-bold text-white uppercase text-[11px] block">
                      Geneva Flagship Salon Handover
                    </span>
                    <span className="text-[10px] text-white/60">
                      Receive in person at Geneva Flagship Salon with Horologist consultation.
                    </span>
                  </div>
                  <span className="text-[9px] text-white/40 uppercase font-bold whitespace-nowrap">
                    By Appt
                  </span>
                </label>
              </div>
            </div>

            {/* 8. Swiss Escrow Security Protocol Ledger Badges (from Stitch lines 381-405) */}
            <div className="bg-[#080808] border border-[#1F1F1F] p-4 space-y-3 font-mono text-xs">
              <span className="text-[9px] uppercase tracking-wider text-white/40 block font-bold">
                Security &amp; Authenticity Guarantees
              </span>
              <div className="grid grid-cols-1 gap-2">
                <div className="flex items-center gap-3 text-white/80">
                  <span className="text-base text-[#C5A059]">🛡️</span>
                  <div>
                    <span className="font-bold text-[11px] text-white uppercase block">
                      256-Bit Swiss Banking Protocol
                    </span>
                    <span className="text-[10px] text-white/50">
                      Regulated escrow protection through Geneva banking channels
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-white/80">
                  <span className="text-base text-[#C5A059]">📡</span>
                  <div>
                    <span className="font-bold text-[11px] text-white uppercase block">
                      NFC Cryptographic Digital Passport
                    </span>
                    <span className="text-[10px] text-white/50">
                      Tamper-evident serial verification and ownership certificate
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-white/80">
                  <span className="text-base text-[#C5A059]">📦</span>
                  <div>
                    <span className="font-bold text-[11px] text-white uppercase block">
                      Full Value Transit Insurance
                    </span>
                    <span className="text-[10px] text-white/50">
                      Armored door-to-door courier until signature handover
                    </span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* 9. Curated Atelier Accessories & Care Vitrine (from Stitch lines 410-502) */}
        <section className="pt-12 border-t border-[#1F1F1F] space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
            <div>
              <span className="text-[10px] font-mono text-[#C5A059] uppercase tracking-widest font-bold">
                Manufacture Atelier Care
              </span>
              <h2 className="text-xl sm:text-2xl font-serif font-bold text-white uppercase mt-0.5">
                Recommended Complications &amp; Accessories
              </h2>
              <p className="text-xs text-white/60 font-mono mt-1">
                Preserve and travel with your timepieces under optimal chronometric protection.
              </p>
            </div>
            <Link href="/catalog" className="text-xs font-mono text-[#C5A059] hover:underline uppercase">
              Explore Collection →
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {ATELIER_ACCESSORIES.map((acc) => (
              <article
                key={acc.id}
                className="bg-[#0C0C0C] border border-[#1F1F1F] hover:border-[#333] p-5 flex flex-col justify-between transition-all group"
              >
                <div>
                  <div className="relative aspect-video bg-[#050505] mb-4 overflow-hidden flex items-center justify-center">
                    <SmoothImage
                      src={acc.image_url}
                      alt={acc.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <span className="absolute top-2.5 left-2.5 px-2 py-0.5 bg-black/80 font-mono text-[9px] text-[#C5A059] uppercase font-bold border border-[#C5A059]/40">
                      {acc.tag}
                    </span>
                  </div>
                  <span className="font-mono text-[9px] uppercase text-white/40 block">
                    {acc.refCode}
                  </span>
                  <h3 className="font-serif font-bold text-base text-white mt-1 group-hover:text-[#C5A059] transition-colors">
                    {acc.name}
                  </h3>
                  <p className="font-mono text-xs text-white/60 mt-1.5 leading-relaxed">
                    {acc.description}
                  </p>
                </div>

                <div className="mt-6 pt-3 border-t border-[#1F1F1F] flex items-center justify-between">
                  <div>
                    <span className="font-mono text-[9px] uppercase text-white/40 block">Allocation Price</span>
                    <span className="font-mono text-sm font-bold text-[#C5A059]">
                      {formatCurrency(acc.price)}
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      addToCart(acc as any, 1);
                      setIsCartOpen(true);
                    }}
                    type="button"
                    className="bg-[#1F1F1F] hover:bg-[#C5A059] hover:text-black text-white font-mono text-xs font-bold uppercase px-3.5 py-2 transition-colors"
                  >
                    + Add to Cart
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* 10. Related Watches Section */}
        {relatedProducts.length > 0 && (
          <div className="pt-12 border-t border-[#1F1F1F] space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono text-[#C5A059] uppercase tracking-widest font-bold">
                  Recommended
                </span>
                <h2 className="text-xl font-bold text-white uppercase">
                  Related Watches
                </h2>
              </div>
              <Link href="/catalog" className="text-xs font-mono text-[#C5A059] hover:underline uppercase">
                View All →
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((rel) => {
                const img = getProductImage(rel.id, rel.image_url);
                return (
                  <Link
                    key={rel.id}
                    href={`/products/${rel.id}`}
                    className="bg-[#0C0C0C] border border-[#1F1F1F] hover:border-[#C5A059] p-4 transition-all group block"
                  >
                    <div className="aspect-square bg-black mb-3 overflow-hidden">
                      <SmoothImage src={img} alt={rel.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                    </div>
                    <div className="text-[9px] font-mono text-[#C5A059] uppercase font-bold">
                      {rel.brand}
                    </div>
                    <div className="text-xs font-semibold text-white group-hover:text-[#C5A059] truncate">
                      {rel.name}
                    </div>
                    <div className="text-xs font-mono text-[#C5A059] font-bold mt-2">
                      {formatCurrency(rel.price)}
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </main>

      {/* Concierge Modal */}
      {isConciergeOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0C0C0C] border border-white/20 p-6 sm:p-8 max-w-md w-full space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <span className="text-xs font-mono uppercase text-[#C5A059] font-bold tracking-widest">
                Geneva Private Salon Consultation
              </span>
              <button onClick={() => setIsConciergeOpen(false)} className="text-white/60 hover:text-white">✕</button>
            </div>
            {conciergeSent ? (
              <div className="text-center py-6 space-y-2">
                <div className="text-2xl text-[#C5A059]">✓</div>
                <div className="text-sm font-serif font-bold">Inquiry Dispatched</div>
                <p className="text-xs text-white/60 font-mono">Our senior horologist will contact you within 2 business hours.</p>
                <button
                  onClick={() => { setIsConciergeOpen(false); setConciergeSent(false); }}
                  className="mt-4 px-4 py-2 bg-[#C5A059] text-black text-xs font-mono font-bold uppercase"
                >
                  Close
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-xs text-white/70 font-mono">
                  Inquiring on: <span className="text-white font-semibold">{product.name}</span>
                </p>
                <textarea
                  rows={3}
                  value={conciergeMsg}
                  onChange={(e) => setConciergeMsg(e.target.value)}
                  placeholder="Inquire about bespoke sizing, vault inspection, or private wire transfer..."
                  className="w-full bg-black border border-[#2A2A2A] p-3 text-xs text-white focus:outline-none focus:border-[#C5A059] font-mono resize-none"
                />
                <button
                  onClick={() => setConciergeSent(true)}
                  className="w-full py-2.5 bg-[#C5A059] text-black text-xs font-mono font-bold uppercase hover:bg-[#b08d48]"
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
