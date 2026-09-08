"use client";

import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { fetchProductById, fetchProducts, Product } from "@/lib/api";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import CartDrawer, { CartItem } from "@/components/CartDrawer";
import WishlistDrawer from "@/components/WishlistDrawer";
import QuickViewModal from "@/components/QuickViewModal";
import CheckoutModal from "@/components/CheckoutModal";

export default function ProductDetailPage() {
  const params = useParams();
  const productId = params?.id as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

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

  // Drawers & Modals
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);

  // Cart & Wishlist state
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<Product[]>([]);

  // Promo
  const [appliedCoupon, setAppliedCoupon] = useState("MONO20");
  const [couponDiscountPercent, setCouponDiscountPercent] = useState(20);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

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

      try {
        const savedWishlist = localStorage.getItem("krono_wishlist");
        if (savedWishlist) setWishlist(JSON.parse(savedWishlist));
        const savedCart = localStorage.getItem("krono_cart");
        if (savedCart) setCart(JSON.parse(savedCart));
      } catch {}
    }
    loadProductData();
  }, [productId]);

  useEffect(() => {
    try {
      localStorage.setItem("krono_cart", JSON.stringify(cart));
    } catch {}
  }, [cart]);

  useEffect(() => {
    try {
      localStorage.setItem("krono_wishlist", JSON.stringify(wishlist));
    } catch {}
  }, [wishlist]);

  const isWishlisted = product ? wishlist.some((p) => p.id === product.id) : false;

  const toggleWishlist = (targetProduct?: Product) => {
    const item = targetProduct || product;
    if (!item) return;

    setWishlist((prev) => {
      const exists = prev.some((p) => p.id === item.id);
      if (exists) {
        showToast("Removed from wishlist");
        return prev.filter((p) => p.id !== item.id);
      } else {
        showToast(`Saved to wishlist`);
        return [...prev, item];
      }
    });
  };

  const handleAddToCart = (targetProduct?: Product, qty = quantity) => {
    const item = targetProduct || product;
    if (!item) return;

    setCart((prev) => {
      const existing = prev.find((p) => p.product.id === item.id);
      if (existing) {
        return prev.map((p) =>
          p.product.id === item.id ? { ...p, quantity: p.quantity + qty } : p
        );
      }
      return [...prev, { product: item, quantity: qty }];
    });
    showToast(`Added ${qty} × "${item.name}" to Vault Bag`);
  };

  const handleBuyNow = () => {
    if (!product) return;
    handleAddToCart(product, quantity);
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
      showToast("Consultation request transmitted.");
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
      <div className="min-h-screen bg-[#F8F9FB] dark:bg-[#0B0F17] flex flex-col">
        <Navbar cartCount={totalCartCount} wishlistCount={wishlist.length} />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-3 font-mono text-xs text-slate-500 dark:text-slate-400">
            <div>Calibrating Technical Dossier...</div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-[#F8F9FB] dark:bg-[#0B0F17] flex flex-col text-slate-900 dark:text-slate-100">
        <Navbar cartCount={totalCartCount} wishlistCount={wishlist.length} />
        <div className="flex-1 flex flex-col items-center justify-center p-6 space-y-4 text-center">
          <div className="text-4xl text-slate-300 dark:text-slate-700">▪</div>
          <h2 className="text-xl font-bold font-display text-slate-900 dark:text-white uppercase">Reference Not Found</h2>
          <Link href="/catalog" className="lux-btn-primary px-6 py-2.5 rounded-xl text-xs uppercase font-bold">
            Return to Vault
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
    <div className="min-h-screen flex flex-col bg-[#F8F9FB] dark:bg-[#0B0F17] text-slate-900 dark:text-slate-100 selection:bg-slate-900 selection:text-white dark:selection:bg-amber-400 dark:selection:text-slate-950">
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 dark:bg-slate-800 border border-slate-700 dark:border-slate-600 text-white px-5 py-3 rounded-xl shadow-2xl text-xs font-mono font-bold flex items-center gap-2">
          <span className="text-emerald-400">▪</span>
          <span>{toastMessage}</span>
        </div>
      )}

      <Navbar
        cartCount={totalCartCount}
        wishlistCount={wishlist.length}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenWishlist={() => setIsWishlistOpen(true)}
      />

      <main className="flex-1 mx-auto max-w-7xl px-4 sm:px-6 py-5 sm:py-6 space-y-8 sm:space-y-10">
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 font-mono uppercase font-semibold">
          <Link href="/" className="hover:text-slate-900 dark:hover:text-white">Home</Link>
          <span>/</span>
          <Link href="/catalog" className="hover:text-slate-900 dark:hover:text-white">Vault</Link>
          <span>/</span>
          <span className="text-slate-900 dark:text-slate-200 truncate max-w-xs">{product.name}</span>
        </nav>

        {/* Master Detail Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10">
          {/* Gallery View */}
          <div className="lg:col-span-6 space-y-3">
            <div
              ref={imageContainerRef}
              onMouseEnter={() => setIsHoverZooming(true)}
              onMouseLeave={() => setIsHoverZooming(false)}
              onMouseMove={handleMouseMove}
              onClick={() => setIsLightboxOpen(true)}
              className="relative aspect-square rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-slate-100 dark:bg-[#131B2A] overflow-hidden cursor-zoom-in group shadow-lg shadow-slate-200/50 dark:shadow-none"
            >
              {/* Badges */}
              <div className="absolute top-4 left-4 z-20 flex flex-wrap gap-2">
                {product.badge && (
                  <span className="text-[9px] font-mono font-bold uppercase tracking-wider px-3 py-1 rounded bg-slate-900 dark:bg-amber-400 text-white dark:text-slate-950 shadow-md">
                    {product.badge}
                  </span>
                )}
                {discountPercent > 0 && (
                  <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded border border-emerald-300 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-400">
                    -{discountPercent}%
                  </span>
                )}
              </div>

              <img
                src={currentImage}
                alt={product.name}
                className={`w-full h-full object-cover transition-all duration-300 ${
                  isHoverZooming ? "opacity-0" : "opacity-100"
                }`}
                loading="eager"
                decoding="async"
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

              <div className="absolute bottom-4 right-4 z-20 opacity-0 group-hover:opacity-100 transition text-[9px] font-mono uppercase text-slate-700 dark:text-slate-300 bg-white/90 dark:bg-slate-900/90 px-3 py-1 rounded-lg border border-slate-200 dark:border-slate-700 shadow-md">
                Click to Expand
              </div>
            </div>

            {images.length > 1 && (
              <div className="flex gap-2.5 overflow-x-auto pb-2">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIndex(idx)}
                    className={`h-16 w-16 sm:h-20 sm:w-20 rounded-xl bg-slate-100 dark:bg-[#131B2A] border transition overflow-hidden flex-shrink-0 cursor-pointer shadow-sm ${
                      activeImageIndex === idx
                        ? "border-slate-900 dark:border-amber-400 ring-2 ring-slate-900 dark:ring-amber-400 shadow-md"
                        : "border-slate-200 dark:border-slate-800 opacity-60 hover:opacity-100"
                    }`}
                  >
                    <img src={img} alt="" className="h-full w-full object-cover" loading="lazy" decoding="async" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Specifications & Actions */}
          <div className="lg:col-span-6 space-y-4 sm:space-y-5">
            <div className="flex items-center justify-between border-b border-slate-200/80 dark:border-slate-800 pb-2.5">
              <span className="text-xs uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400 font-mono font-bold">
                {product.category} Series • {product.brand || "Krono Atelier"}
              </span>
              <span className="text-[10px] text-emerald-800 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800 font-mono uppercase font-bold">
                COSC Serialized
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black font-display text-slate-900 dark:text-white uppercase leading-tight tracking-tight">
              {product.name}
            </h1>

            {/* Price Box */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-4 sm:p-5 bg-white dark:bg-[#131B2A] shadow-sm flex items-baseline justify-between">
              <div>
                <div className="text-[9px] text-slate-500 dark:text-slate-400 uppercase tracking-widest font-mono font-bold">
                  Valuation
                </div>
                <div className="flex items-baseline gap-3 pt-1">
                  <span className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 dark:text-amber-400 font-num">
                    {formatCurrency(product.price)}
                  </span>
                  {hasDiscount && (
                    <span className="text-base text-slate-400 dark:text-slate-500 line-through font-num">
                      {formatCurrency(product.old_price!)}
                    </span>
                  )}
                </div>
              </div>
              <div className="text-right text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                <div>Insured Air Courier</div>
                <div className="text-slate-900 dark:text-white font-bold">5-Yr Warranty Included</div>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
              {product.description ||
                "A triumph of micro-mechanical watchmaking. Engineered with an ultra-high beat escapement, serialized exhibition caseback revealing hand-finished perlage bevels, and anti-reflective double-domed sapphire crystal."}
            </p>

            {/* Technical Matrix */}
            <div className="space-y-2.5">
              <h3 className="text-xs font-bold uppercase tracking-widest text-slate-900 dark:text-white font-mono">
                Horological Technical Specifications
              </h3>
              <div className="grid grid-cols-2 gap-2.5 text-xs">
                <div className="p-3 rounded-xl bg-white dark:bg-[#131B2A] border border-slate-200 dark:border-slate-800 shadow-sm space-y-0.5">
                  <span className="text-[9px] text-slate-500 dark:text-slate-400 uppercase font-mono font-semibold">Calibre</span>
                  <div className="font-bold text-slate-900 dark:text-white truncate font-mono">{product.movement || "Swiss Automatic"}</div>
                </div>
                <div className="p-3 rounded-xl bg-white dark:bg-[#131B2A] border border-slate-200 dark:border-slate-800 shadow-sm space-y-0.5">
                  <span className="text-[9px] text-slate-500 dark:text-slate-400 uppercase font-mono font-semibold">Case Diameter</span>
                  <div className="font-bold text-slate-900 dark:text-white truncate font-mono">{product.case_size || "41mm"}</div>
                </div>
                <div className="p-3 rounded-xl bg-white dark:bg-[#131B2A] border border-slate-200 dark:border-slate-800 shadow-sm space-y-0.5">
                  <span className="text-[9px] text-slate-500 dark:text-slate-400 uppercase font-mono font-semibold">Material</span>
                  <div className="font-bold text-slate-900 dark:text-white truncate">{product.case_material || "316L Surgical Steel"}</div>
                </div>
                <div className="p-3 rounded-xl bg-white dark:bg-[#131B2A] border border-slate-200 dark:border-slate-800 shadow-sm space-y-0.5">
                  <span className="text-[9px] text-slate-500 dark:text-slate-400 uppercase font-mono font-semibold">Water Resistance</span>
                  <div className="font-bold text-slate-900 dark:text-white truncate font-mono">{product.water_resistance || "100M"}</div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-2.5 pt-1">
              <div className="flex items-center gap-3">
                <div className="flex items-center bg-white dark:bg-[#131B2A] border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs shadow-sm">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white px-2 font-bold"
                  >
                    -
                  </button>
                  <span className="font-mono text-slate-900 dark:text-white text-xs px-2 font-bold">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white px-2 font-bold"
                  >
                    +
                  </button>
                </div>

                <button
                  onClick={() => handleAddToCart()}
                  disabled={product.in_stock === false}
                  className="flex-1 py-3 px-6 rounded-xl lux-btn-primary text-xs font-black uppercase tracking-wider cursor-pointer shadow-md hover:shadow-lg transition"
                >
                  {product.in_stock === false ? "Reserved / Out of Vault" : "Add to Vault Bag"}
                </button>

                <button
                  onClick={() => toggleWishlist()}
                  className={`p-3 rounded-xl border transition cursor-pointer shadow-sm ${
                    isWishlisted
                      ? "bg-slate-900 dark:bg-amber-400 text-white dark:text-slate-950 border-slate-900 dark:border-amber-400"
                      : "bg-white dark:bg-[#131B2A] border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  }`}
                  title="Wishlist"
                >
                  ♡
                </button>
              </div>

              <button
                onClick={handleBuyNow}
                disabled={product.in_stock === false}
                className="w-full py-3 rounded-xl lux-btn-secondary text-xs font-black uppercase tracking-widest cursor-pointer shadow-sm"
              >
                Instant Concierge Checkout →
              </button>

              <div className="text-center pt-0.5">
                <button
                  onClick={() => setIsConciergeOpen(true)}
                  className="text-xs text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-mono underline underline-offset-4 cursor-pointer font-semibold"
                >
                  Request Private Salon Viewing or Sizing Consultation
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Related */}
        {relatedProducts.length > 0 && (
          <section className="space-y-4 border-t border-slate-200/80 dark:border-slate-800 pt-8 sm:pt-10">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-slate-500 dark:text-slate-400 font-bold">
                  Complementary References
                </span>
                <h2 className="text-xl sm:text-2xl font-black font-display text-slate-900 dark:text-white uppercase tracking-tight">
                  Related <span className="text-slate-900 dark:text-amber-400 underline decoration-slate-300 dark:decoration-slate-700 decoration-2">Timepieces</span>
                </h2>
              </div>
              <Link href="/catalog" className="text-xs font-mono font-bold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white">
                View Full Catalogue →
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {relatedProducts.map((rel) => (
                <ProductCard
                  key={rel.id}
                  product={rel}
                  onAddToCart={(prod) => handleAddToCart(prod, 1)}
                  onToggleWishlist={toggleWishlist}
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
          className="fixed inset-0 z-50 bg-slate-950/90 flex items-center justify-center p-4 backdrop-blur-md"
          onClick={() => setIsLightboxOpen(false)}
        >
          <div className="relative max-w-4xl max-h-[85vh] p-4">
            <button
              onClick={() => setIsLightboxOpen(false)}
              className="absolute top-2 right-2 text-white text-2xl p-2 z-20 font-bold"
            >
              ✕
            </button>
            <img
              src={currentImage}
              alt={product.name}
              className="max-h-[80vh] max-w-full object-contain mx-auto filter drop-shadow-2xl"
            />
          </div>
        </div>
      )}

      {/* Concierge Modal */}
      {isConciergeOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-slate-900/60 dark:bg-black/80 backdrop-blur-sm"
            onClick={() => setIsConciergeOpen(false)}
          />
          <div className="relative z-10 w-full max-w-md rounded-3xl bg-white dark:bg-[#131B2A] p-6 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="text-sm font-bold font-display uppercase tracking-wider text-slate-900 dark:text-white">
                Private Consultation
              </h3>
              <button onClick={() => setIsConciergeOpen(false)} className="text-slate-400 hover:text-slate-800 dark:hover:text-white font-bold">
                ✕
              </button>
            </div>

            {conciergeSent ? (
              <div className="text-center py-6 space-y-2">
                <div className="text-2xl text-slate-900 dark:text-amber-400">✓</div>
                <div className="text-xs font-mono font-bold text-slate-900 dark:text-white">Consultation Transmitted</div>
              </div>
            ) : (
              <form onSubmit={handleConciergeSubmit} className="space-y-3 text-xs">
                <p className="text-slate-600 dark:text-slate-300 text-[11px] leading-relaxed">
                  Request an appointment at our Geneva, London, or Mumbai salons for hands-on inspection of{" "}
                  <strong className="text-slate-900 dark:text-white">{product.name}</strong>.
                </p>
                <div>
                  <label className="block text-[9px] text-slate-500 dark:text-slate-400 uppercase font-mono font-bold mb-1">Your Name</label>
                  <input
                    type="text"
                    required
                    placeholder="Lord Sterling"
                    className="w-full bg-slate-50 dark:bg-[#0B0F17] border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-slate-800 dark:focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="block text-[9px] text-slate-500 dark:text-slate-400 uppercase font-mono font-bold mb-1">VIP Contact</label>
                  <input
                    type="text"
                    required
                    placeholder="+91 98765 43210 or email@domain.com"
                    className="w-full bg-slate-50 dark:bg-[#0B0F17] border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-slate-800 dark:focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="block text-[9px] text-slate-500 dark:text-slate-400 uppercase font-mono font-bold mb-1">Inquiries</label>
                  <textarea
                    rows={3}
                    placeholder="Specify salon or custom request..."
                    value={conciergeMsg}
                    onChange={(e) => setConciergeMsg(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-[#0B0F17] border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-slate-800 dark:focus:border-amber-400"
                  />
                </div>
                <button type="submit" className="w-full py-3 rounded-xl lux-btn-primary text-xs font-bold uppercase tracking-wider shadow-md">
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
        onUpdateQuantity={(id, delta) => {
          setCart((prev) =>
            prev
              .map((item) => (item.product.id === id ? { ...item, quantity: item.quantity + delta } : item))
              .filter((i) => i.quantity > 0)
          );
        }}
        onRemoveItem={(id) => setCart((prev) => prev.filter((i) => i.product.id !== id))}
        onClearCart={() => setCart([])}
        onProceedToCheckout={() => setIsCheckoutOpen(true)}
        appliedCoupon={appliedCoupon}
        onApplyCoupon={(code) => code.toUpperCase() === "MONO20"}
        couponDiscountPercent={couponDiscountPercent}
      />

      <WishlistDrawer
        isOpen={isWishlistOpen}
        onClose={() => setIsWishlistOpen(false)}
        wishlist={wishlist}
        onRemoveFromWishlist={(id) => setWishlist((prev) => prev.filter((p) => p.id !== id))}
        onMoveToCart={(prod) => {
          handleAddToCart(prod);
          setWishlist((prev) => prev.filter((p) => p.id !== prod.id));
          setIsCartOpen(true);
        }}
      />

      <QuickViewModal
        product={quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
        onAddToCart={handleAddToCart}
      />

      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        cart={cart}
        onOrderSuccess={() => {
          setCart([]);
          localStorage.removeItem("krono_cart");
        }}
        appliedCoupon={appliedCoupon}
        couponDiscountPercent={couponDiscountPercent}
      />
    </div>
  );
}
