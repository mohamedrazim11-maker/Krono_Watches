"use client";

import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { fetchProductById, fetchProducts, Product } from "@/lib/api";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import SmoothImage from "@/components/SmoothImage";
import CartDrawer from "@/components/CartDrawer";
import WishlistDrawer from "@/components/WishlistDrawer";
import QuickViewModal from "@/components/QuickViewModal";
import CheckoutModal from "@/components/CheckoutModal";
import { useCart } from "@/lib/CartContext";

export default function ProductDetailPage() {
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

  // Quick View Modal
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);

  // Global Cart Context
  const {
    cart,
    wishlist,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    toggleWishlist,
    isInWishlist,
    isCartOpen,
    setIsCartOpen,
    isWishlistOpen,
    setIsWishlistOpen,
    isCheckoutOpen,
    setIsCheckoutOpen,
    appliedCoupon,
    couponDiscountPercent,
    applyCoupon,
    grandTotal,
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

  const isWishlisted = product ? isInWishlist(product.id) : false;

  const handleBuyNow = () => {
    if (!product) return;
    addToCart(product, quantity);
    setIsCheckoutOpen(true);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!imageContainerRef.current) return;
    const rect = imageContainerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomPos({ x, y });
  };

  const handleConciergeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setConciergeSent(true);
    setTimeout(() => {
      setIsConciergeOpen(false);
      setConciergeSent(false);
      setConciergeMsg("");
      showToast("Consultation request transmitted to Geneva salon.");
    }, 2000);
  };

  const formatCurrency = (amount: number) => {
    return `LKR ${Number(amount || 0).toLocaleString("en-US")}`;
  };

  const images = product?.images && product.images.length > 0 ? product.images : product ? [product.image_url] : [];
  const currentImage = images[activeImageIndex] || product?.image_url;

  const totalCartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] dark:bg-[#080B10] flex flex-col">
        <Navbar cartCount={totalCartCount} wishlistCount={wishlist.length} />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-3 font-mono text-xs text-[#D4AF37]">
            <div className="animate-spin text-2xl mx-auto">✦</div>
            <div>Calibrating Horological Dossier...</div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] dark:bg-[#080B10] flex flex-col text-[#121826] dark:text-[#F8FAFC]">
        <Navbar cartCount={totalCartCount} wishlistCount={wishlist.length} />
        <div className="flex-1 flex flex-col items-center justify-center p-6 space-y-4 text-center">
          <div className="text-4xl text-[#D5CBBA] dark:text-[#1E293B]">✦</div>
          <h2 className="text-xl font-bold font-display text-[#121826] dark:text-[#F8FAFC] uppercase">
            Reference Not Located
          </h2>
          <Link href="/catalog" className="lux-btn-gold px-6 py-2.5 rounded-xl text-xs uppercase font-bold">
            Return to Catalogue Vault
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const hasDiscount = product.old_price && product.old_price > product.price;
  const discountPercent = hasDiscount
    ? Math.round(((product.old_price! - product.price) / product.old_price!) * 100)
    : product.promo_discount_percent || 0;

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F5] dark:bg-[#080B10] text-[#121826] dark:text-[#F8FAFC] selection:bg-[#D4AF37] selection:text-[#080B10] transition-colors duration-300">
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#121826] dark:bg-[#141D2E] border border-[#D4AF37] text-white px-5 py-3.5 rounded-2xl shadow-2xl text-xs font-mono font-bold flex items-center gap-2.5 animate-pageEnter">
          <span className="text-[#D4AF37]">✦</span>
          <span>{toastMessage}</span>
        </div>
      )}

      <Navbar
        cartCount={totalCartCount}
        wishlistCount={wishlist.length}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenWishlist={() => setIsWishlistOpen(true)}
      />

      <main className="flex-1 mx-auto max-w-7xl px-4 sm:px-6 py-6 sm:py-8 space-y-8 sm:space-y-12">
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 text-xs text-[#8C7B65] dark:text-[#CBD5E1] font-mono uppercase font-semibold">
          <Link href="/" className="hover:text-[#D4AF37]">Home</Link>
          <span>/</span>
          <Link href="/catalog" className="hover:text-[#D4AF37]">Catalogue</Link>
          <span>/</span>
          <span className="text-[#121826] dark:text-[#F3E5AB] truncate max-w-xs">{product.name}</span>
        </nav>

        {/* Master Detail Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Gallery View */}
          <div className="lg:col-span-6 space-y-3.5">
            <div
              ref={imageContainerRef}
              onMouseEnter={() => setIsHoverZooming(true)}
              onMouseLeave={() => setIsHoverZooming(false)}
              onMouseMove={handleMouseMove}
              onClick={() => setIsLightboxOpen(true)}
              className="relative aspect-square rounded-3xl border border-[#E8E2D6] dark:border-[rgba(212,175,55,0.2)] bg-[#FAF8F5] dark:bg-[#0E1420] overflow-hidden cursor-zoom-in group shadow-2xl"
            >
              {/* Badges */}
              <div className="absolute top-4 left-4 z-20 flex flex-wrap gap-2">
                {product.badge && (
                  <span className="text-[9px] font-mono font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-gradient-to-r from-[#D4AF37] to-[#AA7A1E] text-[#080B10] shadow-md">
                    {product.badge}
                  </span>
                )}
                {discountPercent > 0 && (
                  <span className="text-[9px] font-mono font-bold px-2.5 py-1 rounded-full border border-[#F43F5E]/30 bg-[#FFF1F2] dark:bg-[#4C0519]/40 text-[#F43F5E]">
                    -{discountPercent}%
                  </span>
                )}
              </div>

              <SmoothImage
                src={currentImage}
                alt={product.name}
                className={`w-full h-full object-cover transition-opacity duration-300 ${
                  isHoverZooming ? "opacity-0" : "opacity-100"
                }`}
              />

              {isHoverZooming && (
                <div
                  className="absolute inset-0 pointer-events-none bg-no-repeat rounded-3xl"
                  style={{
                    backgroundImage: `url(${currentImage})`,
                    backgroundPosition: `${zoomPos.x}% ${zoomPos.y}%`,
                    backgroundSize: "240%",
                  }}
                />
              )}

              <div className="absolute bottom-4 right-4 z-20 opacity-0 group-hover:opacity-100 transition text-[9px] font-mono uppercase text-[#121826] dark:text-[#F8FAFC] bg-white/95 dark:bg-[#0E1420]/95 px-3 py-1.5 rounded-xl border border-[#E8E2D6] dark:border-[rgba(212,175,55,0.25)] shadow-md">
                Click to Expand
              </div>
            </div>

            {images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIndex(idx)}
                    className={`h-16 w-16 sm:h-20 sm:w-20 rounded-2xl bg-[#FAF8F5] dark:bg-[#0E1420] border transition overflow-hidden flex-shrink-0 cursor-pointer shadow-sm ${
                      activeImageIndex === idx
                        ? "border-[#D4AF37] dark:border-[#E5C158] ring-2 ring-[#D4AF37]/40 shadow-md"
                        : "border-[#E8E2D6] dark:border-[#1E293B] opacity-60 hover:opacity-100"
                    }`}
                  >
                    <SmoothImage src={img} alt="" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Specifications & Actions */}
          <div className="lg:col-span-6 space-y-5">
            <div className="flex items-center justify-between border-b border-[#E8E2D6] dark:border-[rgba(212,175,55,0.18)] pb-3">
              <span className="text-xs uppercase tracking-[0.2em] text-[#D4AF37] dark:text-[#E5C158] font-mono font-bold">
                {product.category} Series • {product.brand || "Krono Atelier"}
              </span>
              <span className="text-[10px] text-[#059669] dark:text-[#10B981] bg-[#ECFDF5] dark:bg-[#064E3B]/40 px-3 py-0.5 rounded-full border border-[#10B981]/30 font-mono uppercase font-bold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]"></span> COSC Serialized
              </span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-black font-display text-[#121826] dark:text-[#F8FAFC] uppercase leading-tight tracking-tight">
              {product.name}
            </h1>

            {/* Valuation Price Box */}
            <div className="rounded-2xl border border-[#E8E2D6] dark:border-[rgba(212,175,55,0.2)] p-5 bg-gradient-to-br from-white via-[#FAF8F5] to-[#F3EFEA] dark:from-[#0E1420] dark:via-[#080B10] dark:to-[#040609] shadow-md flex items-baseline justify-between">
              <div>
                <div className="text-[9px] text-[#8C7B65] dark:text-[#A3937C] uppercase tracking-widest font-mono font-bold">
                  Valuation
                </div>
                <div className="flex items-baseline gap-3 pt-1">
                  <span className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#121826] dark:text-[#F3E5AB] font-num">
                    {formatCurrency(product.price)}
                  </span>
                  {hasDiscount && (
                    <span className="text-base text-[#8C7B65] line-through font-num">
                      {formatCurrency(product.old_price!)}
                    </span>
                  )}
                </div>
              </div>
              <div className="text-right text-[10px] text-[#8C7B65] dark:text-[#A3937C] font-mono">
                <div>Insured Air Transit Included</div>
                <div className="text-[#D4AF37] dark:text-[#E5C158] font-bold">5-Yr Concierge Warranty</div>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-[#645A4C] dark:text-[#CBD5E1] leading-relaxed font-normal">
              {product.description ||
                "A triumph of micro-mechanical watchmaking. Engineered with an ultra-high beat escapement, serialized exhibition caseback revealing hand-finished perlage bevels, and anti-reflective double-domed sapphire crystal."}
            </p>

            {/* Technical Matrix */}
            <div className="space-y-2.5">
              <h3 className="text-xs font-bold uppercase tracking-widest text-[#121826] dark:text-[#F8FAFC] font-mono flex items-center gap-1.5">
                <span className="text-[#D4AF37]">✦</span> Technical Matrix
              </h3>
              <div className="grid grid-cols-2 gap-2.5 text-xs">
                <div className="p-3.5 rounded-2xl bg-white dark:bg-[#0E1420] border border-[#E8E2D6] dark:border-[rgba(212,175,55,0.15)] shadow-sm space-y-0.5">
                  <span className="text-[9px] text-[#8C7B65] dark:text-[#A3937C] uppercase font-mono font-semibold">Calibre</span>
                  <div className="font-bold text-[#121826] dark:text-[#F8FAFC] truncate font-mono">{product.movement || "Swiss Automatic"}</div>
                </div>
                <div className="p-3.5 rounded-2xl bg-white dark:bg-[#0E1420] border border-[#E8E2D6] dark:border-[rgba(212,175,55,0.15)] shadow-sm space-y-0.5">
                  <span className="text-[9px] text-[#8C7B65] dark:text-[#A3937C] uppercase font-mono font-semibold">Case Diameter</span>
                  <div className="font-bold text-[#121826] dark:text-[#F8FAFC] truncate font-mono">{product.case_size || "41mm"}</div>
                </div>
                <div className="p-3.5 rounded-2xl bg-white dark:bg-[#0E1420] border border-[#E8E2D6] dark:border-[rgba(212,175,55,0.15)] shadow-sm space-y-0.5">
                  <span className="text-[9px] text-[#8C7B65] dark:text-[#A3937C] uppercase font-mono font-semibold">Material</span>
                  <div className="font-bold text-[#121826] dark:text-[#F8FAFC] truncate">{product.case_material || "316L Surgical Steel"}</div>
                </div>
                <div className="p-3.5 rounded-2xl bg-white dark:bg-[#0E1420] border border-[#E8E2D6] dark:border-[rgba(212,175,55,0.15)] shadow-sm space-y-0.5">
                  <span className="text-[9px] text-[#8C7B65] dark:text-[#A3937C] uppercase font-mono font-semibold">Water Resistance</span>
                  <div className="font-bold text-[#121826] dark:text-[#F8FAFC] truncate font-mono">{product.water_resistance || "100M"}</div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-3">
                <div className="flex items-center bg-white dark:bg-[#0E1420] border border-[#E8E2D6] dark:border-[#1E293B] rounded-2xl px-3.5 py-2.5 text-xs shadow-sm">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="text-[#8C7B65] hover:text-[#121826] dark:hover:text-white px-2 font-bold cursor-pointer"
                  >
                    -
                  </button>
                  <span className="font-mono text-[#121826] dark:text-[#F8FAFC] text-xs px-2 font-bold">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="text-[#8C7B65] hover:text-[#121826] dark:hover:text-white px-2 font-bold cursor-pointer"
                  >
                    +
                  </button>
                </div>

                <button
                  onClick={() => addToCart(product, quantity)}
                  disabled={product.in_stock === false}
                  className="flex-1 py-3.5 px-6 rounded-2xl lux-btn-gold text-xs font-black uppercase tracking-wider cursor-pointer shadow-lg hover:shadow-xl transition"
                >
                  {product.in_stock === false ? "Out of Stock" : "Add to Cart"}
                </button>

                <button
                  onClick={() => toggleWishlist(product)}
                  className={`p-3.5 rounded-2xl border transition cursor-pointer shadow-sm ${
                    isWishlisted
                      ? "bg-[#FFF1F2] dark:bg-[#881337]/30 border-[#F43F5E] text-[#F43F5E]"
                      : "bg-white dark:bg-[#0E1420] border-[#E8E2D6] dark:border-[#1E293B] text-[#8C7B65] hover:text-[#D4AF37]"
                  }`}
                  title="Wishlist"
                >
                  ♡
                </button>
              </div>

              <button
                onClick={handleBuyNow}
                disabled={product.in_stock === false}
                className="w-full py-3.5 rounded-2xl lux-btn-secondary text-xs font-black uppercase tracking-widest cursor-pointer shadow-sm hover:border-[#D4AF37]"
              >
                Instant Concierge Checkout →
              </button>

              <div className="text-center pt-1">
                <button
                  onClick={() => setIsConciergeOpen(true)}
                  className="text-xs text-[#D4AF37] dark:text-[#E5C158] hover:underline font-mono cursor-pointer font-bold"
                >
                  Request Private Salon Viewing or Custom Sizing →
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Related Timepieces */}
        {relatedProducts.length > 0 && (
          <section className="space-y-4 border-t border-[#E8E2D6] dark:border-[rgba(212,175,55,0.18)] pt-8 sm:pt-10">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#D4AF37] dark:text-[#E5C158] font-bold">
                  Complementary Calibres
                </span>
                <h2 className="text-xl sm:text-2xl font-black font-display text-[#121826] dark:text-[#F8FAFC] uppercase tracking-tight">
                  Related <span className="gold-gradient-text">Timepieces</span>
                </h2>
              </div>
              <Link href="/catalog" className="text-xs font-mono font-bold text-[#D4AF37] dark:text-[#E5C158] hover:underline">
                View All in Vault →
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {relatedProducts.map((rel) => (
                <ProductCard
                  key={rel.id}
                  product={rel}
                  onAddToCart={(prod) => addToCart(prod, 1)}
                  onToggleWishlist={(prod) => toggleWishlist(prod)}
                  isWishlisted={wishlist.some((p) => p.id === rel.id)}
                  onQuickView={(prod) => setQuickViewProduct(prod)}
                />
              ))}
            </div>
          </section>
        )}
      </main>

      <Footer />

      {/* Lightbox */}
      {isLightboxOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 backdrop-blur-md"
          onClick={() => setIsLightboxOpen(false)}
        >
          <div className="relative max-w-4xl max-h-[85vh] p-4">
            <button
              onClick={() => setIsLightboxOpen(false)}
              className="absolute top-2 right-2 text-white text-2xl p-2 z-20 font-bold"
            >
              ✕
            </button>
            <SmoothImage
              src={currentImage}
              alt={product.name}
              objectFit="contain"
              className="max-h-[80vh] max-w-full mx-auto filter drop-shadow-2xl"
              containerClassName="max-h-[80vh] bg-transparent"
            />
          </div>
        </div>
      )}

      {/* Concierge Modal */}
      {isConciergeOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setIsConciergeOpen(false)}
          />
          <div className="relative z-10 w-full max-w-md rounded-3xl bg-white dark:bg-[#0E1420] p-6 border border-[#E8E2D6] dark:border-[rgba(212,175,55,0.25)] text-[#121826] dark:text-[#F8FAFC] shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-[#E8E2D6] dark:border-[rgba(212,175,55,0.18)] pb-3">
              <h3 className="text-sm font-bold font-display uppercase tracking-wider text-[#121826] dark:text-[#F8FAFC] flex items-center gap-1.5">
                <span className="text-[#D4AF37]">✦</span> Private Salon Consultation
              </h3>
              <button onClick={() => setIsConciergeOpen(false)} className="text-[#8C7B65] hover:text-[#121826] dark:hover:text-white font-bold">
                ✕
              </button>
            </div>

            {conciergeSent ? (
              <div className="text-center py-6 space-y-2">
                <div className="text-3xl text-[#D4AF37]">✓</div>
                <div className="text-xs font-mono font-bold text-[#121826] dark:text-[#F8FAFC]">Consultation Transmitted</div>
              </div>
            ) : (
              <form onSubmit={handleConciergeSubmit} className="space-y-3 text-xs">
                <p className="text-[#645A4C] dark:text-[#CBD5E1] text-[11px] leading-relaxed">
                  Request an appointment at our Geneva, London, or New York salons for private inspection of{" "}
                  <strong className="text-[#121826] dark:text-[#F8FAFC]">{product.name}</strong>.
                </p>
                <div>
                  <label className="block text-[9px] text-[#8C7B65] dark:text-[#A3937C] uppercase font-mono font-bold mb-1">Your Name</label>
                  <input
                    type="text"
                    required
                    placeholder="Lord Sterling"
                    className="w-full bg-[#FAF8F5] dark:bg-[#080B10] border border-[#E8E2D6] dark:border-[#1E293B] rounded-xl px-3.5 py-2 text-xs text-[#121826] dark:text-[#F8FAFC] focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>
                <div>
                  <label className="block text-[9px] text-[#8C7B65] dark:text-[#A3937C] uppercase font-mono font-bold mb-1">VIP Contact</label>
                  <input
                    type="text"
                    required
                    placeholder="+94 77 123 4567 or email@domain.com"
                    className="w-full bg-[#FAF8F5] dark:bg-[#080B10] border border-[#E8E2D6] dark:border-[#1E293B] rounded-xl px-3.5 py-2 text-xs text-[#121826] dark:text-[#F8FAFC] focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>
                <div>
                  <label className="block text-[9px] text-[#8C7B65] dark:text-[#A3937C] uppercase font-mono font-bold mb-1">Inquiries & Requirements</label>
                  <textarea
                    rows={3}
                    placeholder="Specify preferred salon city or wrist sizing..."
                    value={conciergeMsg}
                    onChange={(e) => setConciergeMsg(e.target.value)}
                    className="w-full bg-[#FAF8F5] dark:bg-[#080B10] border border-[#E8E2D6] dark:border-[#1E293B] rounded-xl px-3.5 py-2 text-xs text-[#121826] dark:text-[#F8FAFC] focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>
                <button type="submit" className="w-full py-3 rounded-xl lux-btn-gold text-xs font-bold uppercase tracking-wider shadow-md">
                  Transmit Request
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Drawers */}
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
        onMoveToCart={(prod) => {
          addToCart(prod, 1);
          toggleWishlist(prod);
          setIsCartOpen(true);
        }}
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
