"use client";

import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { fetchProductById, fetchProducts, Product } from "@/lib/api";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SmoothImage from "@/components/SmoothImage";
import CartDrawer from "@/components/CartDrawer";
import WishlistDrawer from "@/components/WishlistDrawer";
import QuickViewModal from "@/components/QuickViewModal";
import CheckoutModal from "@/components/CheckoutModal";
import { useCart } from "@/lib/CartContext";
import { getProductImage, getProductImages } from "@/lib/productImages";

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
    toggleWishlist,
    isInWishlist,
    isCartOpen,
    setIsCartOpen,
    isWishlistOpen,
    setIsWishlistOpen,
    isCheckoutOpen,
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

  const formatCurrency = (amount: number) => {
    return `LKR ${Number(amount || 0).toLocaleString("en-US")}`;
  };

  const totalCartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] text-white flex flex-col">
        <Navbar cartCount={totalCartCount} wishlistCount={wishlist.length} />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-3 font-mono text-xs text-[#C5A059] animate-pulse">
            <div>✦</div>
            <div>Calibrating Horological Dossier...</div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-[#050505] text-white flex flex-col">
        <Navbar cartCount={totalCartCount} wishlistCount={wishlist.length} />
        <div className="flex-1 flex flex-col items-center justify-center p-6 space-y-4 text-center">
          <div className="text-4xl text-[#C5A059]">✦</div>
          <h2 className="text-xl font-bold uppercase tracking-tight">Reference Not Located</h2>
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
    <div className="min-h-screen flex flex-col bg-[#050505] text-white selection:bg-[#C5A059] selection:text-black">
      <Navbar
        cartCount={totalCartCount}
        wishlistCount={wishlist.length}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenWishlist={() => setIsWishlistOpen(true)}
      />

      {/* Global Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#C5A059] text-black px-5 py-3 rounded-lg text-xs font-bold font-mono uppercase tracking-wider flex items-center gap-2 shadow-2xl">
          <span>✦</span>
          <span>{toastMessage}</span>
        </div>
      )}

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-8 space-y-12">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs font-mono text-white/50">
          <Link href="/" className="hover:text-white">Home</Link>
          <span>/</span>
          <Link href="/catalog" className="hover:text-white">Catalogue</Link>
          <span>/</span>
          <span className="text-[#C5A059] truncate max-w-xs">{product.name}</span>
        </div>

        {/* Master Detail Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Gallery View */}
          <div className="lg:col-span-7 space-y-4">
            <div
              ref={imageContainerRef}
              onMouseEnter={() => setIsHoverZooming(true)}
              onMouseLeave={() => setIsHoverZooming(false)}
              onMouseMove={handleMouseMove}
              onClick={() => setIsLightboxOpen(true)}
              className="relative aspect-square bg-[#0D0D0D] border border-[#1a1a1a] overflow-hidden cursor-zoom-in group"
            >
              {/* Badges */}
              <div className="absolute top-4 left-4 z-20 flex flex-col gap-2">
                {product.badge && (
                  <span className="text-[10px] font-mono font-bold uppercase tracking-widest px-3 py-1 bg-[#C5A059] text-black shadow">
                    {product.badge}
                  </span>
                )}
                {product.is_on_promotion && (
                  <span className="text-[10px] font-mono font-bold tracking-widest px-2.5 py-0.5 bg-red-600 text-white uppercase">
                    -{product.promo_discount_percent || 10}% Special Allocation
                  </span>
                )}
              </div>

              {/* Zoom or Standard Image */}
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
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  priority
                />
              )}
            </div>

            {/* Thumbnail Strip */}
            {galleryImages.length > 1 && (
              <div className="flex items-center gap-3 overflow-x-auto pb-2">
                {galleryImages.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIndex(idx)}
                    className={`w-20 h-20 bg-[#0D0D0D] border relative overflow-hidden flex-shrink-0 transition-all ${
                      activeImageIndex === idx ? "border-[#C5A059] scale-105" : "border-[#1a1a1a] opacity-60 hover:opacity-100"
                    }`}
                  >
                    <SmoothImage src={img} alt={`Angle ${idx + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Dossier & Buying Controls */}
          <div className="lg:col-span-5 space-y-6">
            <div className="space-y-2 border-b border-[#1a1a1a] pb-6">
              <div className="flex items-center justify-between text-xs font-mono uppercase text-[#C5A059] font-bold tracking-widest">
                <span>{product.brand}</span>
                <span className="text-white/40">{product.category}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-serif font-bold text-white leading-tight">
                {product.name}
              </h1>
              <div className="flex items-baseline gap-3 pt-2">
                <span className="text-2xl sm:text-3xl font-mono font-bold text-[#C5A059]">
                  {formatCurrency(product.price)}
                </span>
                {product.old_price && product.old_price > product.price && (
                  <span className="text-sm font-mono text-white/40 line-through">
                    {formatCurrency(product.old_price)}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 pt-1 text-xs font-mono">
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                <span className="text-emerald-400 font-bold uppercase tracking-wider">
                  Vault Ready • Complimentary Armored Transit
                </span>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2 text-xs text-white/70 font-mono leading-relaxed">
              <p>{product.description}</p>
            </div>

            {/* Specifications Summary Grid */}
            <div className="grid grid-cols-2 gap-3 py-4 border-y border-[#1a1a1a] text-xs font-mono">
              <div className="bg-[#0D0D0D] p-3 border border-[#1a1a1a]">
                <span className="text-white/40 uppercase block text-[10px]">Calibre Movement</span>
                <span className="text-white font-semibold">{product.movement || "In-House Swiss Automatic"}</span>
              </div>
              <div className="bg-[#0D0D0D] p-3 border border-[#1a1a1a]">
                <span className="text-white/40 uppercase block text-[10px]">Case Diameter</span>
                <span className="text-white font-semibold">{product.case_size || "41mm"}</span>
              </div>
              <div className="bg-[#0D0D0D] p-3 border border-[#1a1a1a]">
                <span className="text-white/40 uppercase block text-[10px]">Case Material</span>
                <span className="text-white font-semibold">{product.case_material || "Oystersteel 904L"}</span>
              </div>
              <div className="bg-[#0D0D0D] p-3 border border-[#1a1a1a]">
                <span className="text-white/40 uppercase block text-[10px]">Water Resistance</span>
                <span className="text-white font-semibold">{product.water_resistance || "100m (10 ATM)"}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-3">
                <div className="flex items-center border border-[#2a2a2a] bg-[#111]">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="px-3 py-2 text-white/70 hover:text-white"
                  >
                    -
                  </button>
                  <span className="px-4 py-2 font-mono text-xs font-bold">{quantity}</span>
                  <button
                    onClick={() => setQuantity((q) => q + 1)}
                    className="px-3 py-2 text-white/70 hover:text-white"
                  >
                    +
                  </button>
                </div>

                <button
                  onClick={() => {
                    addToCart(product, quantity);
                    showToast(`Added ${quantity} × ${product.name} to portfolio.`);
                  }}
                  className="flex-1 py-3 bg-white hover:bg-[#C5A059] hover:text-black text-black font-semibold text-xs tracking-widest uppercase transition-colors"
                >
                  Add to Vault Cart
                </button>

                <button
                  onClick={() => toggleWishlist(product)}
                  className={`p-3 border transition-colors ${
                    isWishlisted ? "border-red-500 text-red-500" : "border-[#2a2a2a] text-white/60 hover:text-white"
                  }`}
                  title="Save to Wishlist"
                >
                  ♥
                </button>
              </div>

              <button
                onClick={handleBuyNow}
                className="w-full py-3.5 bg-[#C5A059] hover:bg-[#b08d48] text-black font-bold text-xs tracking-widest uppercase transition-all shadow-lg hover:shadow-[#C5A059]/20"
              >
                Instant Acquisition • Protected Checkout
              </button>

              <button
                onClick={() => setIsConciergeOpen(true)}
                className="w-full py-2.5 border border-white/20 hover:border-white text-white/80 hover:text-white text-xs font-mono uppercase tracking-wider transition-colors"
              >
                Private Concierge Consultation
              </button>
            </div>
          </div>
        </div>

        {/* Related References */}
        {relatedProducts.length > 0 && (
          <div className="pt-12 border-t border-[#1a1a1a] space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono text-[#C5A059] uppercase tracking-widest font-bold">
                  Curated Pairings
                </span>
                <h2 className="text-xl font-serif font-bold text-white uppercase">
                  Related Horological References
                </h2>
              </div>
              <Link href="/catalog" className="text-xs font-mono text-[#C5A059] hover:underline uppercase">
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
                    className="bg-[#0D0D0D] border border-[#1a1a1a] hover:border-[#C5A059] p-4 transition-all group block"
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
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0D0D0D] border border-white/20 p-6 sm:p-8 max-w-md w-full space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <span className="text-xs font-mono uppercase text-[#C5A059] font-bold tracking-widest">
                Geneva Private Salon
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
                  className="w-full bg-black border border-[#2a2a2a] p-3 text-xs text-white focus:outline-none focus:border-[#C5A059] font-mono resize-none"
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
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} onOpenCheckout={() => { setIsCartOpen(false); setIsCheckoutOpen(true); }} />
      <WishlistDrawer isOpen={isWishlistOpen} onClose={() => setIsWishlistOpen(false)} />

      <Footer />
    </div>
  );
}
