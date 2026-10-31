"use client";

import { useEffect, useState, useRef, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { fetchProductById, fetchProducts, Product } from "@/lib/api";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SmoothImage from "@/components/SmoothImage";
import WishlistDrawer from "@/components/WishlistDrawer";
import { useCart } from "@/lib/CartContext";
import { useAuth } from "@/lib/AuthContext";
import { getProductImage, getProductImages } from "@/lib/productImages";

// Professional SVG Vector Micro-Icons
const IconCamera = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const IconPencil = ({ className = "w-3.5 h-3.5" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
  </svg>
);

export interface ProductReview {
  id: string;
  author: string;
  rating: number; // 1 to 5
  title: string;
  comment: string;
  createdAt: string;
  verifiedBuyer: boolean;
  imageUrl?: string;
}

const DEFAULT_REVIEWS: ProductReview[] = [
  {
    id: "rev-1",
    author: "Duminda Ranasinghe",
    rating: 5,
    title: "Exceptional Build Quality & Finish under LKR 5,000",
    comment: "The dial depth, sapphire crystal clarity, and precision movement exceeded my highest expectations. Arrived in Colombo in under 48 hours in a sealed presentation box. Incredible value for money!",
    createdAt: "2026-10-24",
    verifiedBuyer: true,
    imageUrl: "/images/watches/submariner_deep_black_ceramic.jpg",
  },
  {
    id: "rev-2",
    author: "Shenali Perera",
    rating: 5,
    title: "Stunning Quality, Unbeatable Value",
    comment: "Bought this as a gift. The bracelet weight and polished bevels are on par with watches costing triple the price. The official warranty card and luxury packaging are top-tier.",
    createdAt: "2026-10-18",
    verifiedBuyer: true,
    imageUrl: "/images/watches/speedmaster_chrono_titanium.jpg",
  },
  {
    id: "rev-3",
    author: "Arshad Farook",
    rating: 4,
    title: "Remarkable Craftsmanship, Highly Recommended",
    comment: "Stunning wrist presence. Whisper silent and keeps time accurately. Fast delivery with insured courier tracking across Sri Lanka.",
    createdAt: "2026-10-10",
    verifiedBuyer: true,
  },
  {
    id: "rev-4",
    author: "Kavinda Wickramasinghe",
    rating: 5,
    title: "Flawless Luxury Experience & Rapid Service",
    comment: "Krono's service is second to none. Cash on delivery option was seamless, and the watch itself is simply gorgeous in natural lighting.",
    createdAt: "2026-10-02",
    verifiedBuyer: true,
  },
  {
    id: "rev-5",
    author: "Nadeesha Fernando",
    rating: 5,
    title: "Perfect Daily Wear Watch under 5000 LKR",
    comment: "Solid weight, beautiful luminous hands, and great water resistance. Best watch purchase I have made this year in Sri Lanka.",
    createdAt: "2026-09-28",
    verifiedBuyer: true,
  },
  {
    id: "rev-6",
    author: "Tariq Mansoor",
    rating: 4,
    title: "Highly Satisfied with Design & Comfort",
    comment: "Premium strap ergonomics and scratch-resistant crystal. The price under 5,000 LKR is unbeatable for this level of quality.",
    createdAt: "2026-09-15",
    verifiedBuyer: true,
  },
];

type TabType = "SPECIFICATIONS" | "REVIEWS & RATINGS" | "SIZE & FIT" | "RETURN POLICY" | "DELIVERY INFO";

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
  const imageContainerRef = useRef<HTMLDivElement>(null);

  // Active Tab & Dropdown sizes
  const [activeTab, setActiveTab] = useState<TabType>("SPECIFICATIONS");
  const [selectedRegion, setSelectedRegion] = useState("UK");
  const [selectedSize, setSelectedSize] = useState("41mm");

  // Modals for Size Guide & Terms
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);
  const [isTermsOpen, setIsTermsOpen] = useState(false);

  // Support Inquiry Modal
  const [isSupportOpen, setIsSupportOpen] = useState(false);
  const [supportMsg, setSupportMsg] = useState("");
  const [supportSent, setSupportSent] = useState(false);

  // Hold Timer
  const [timerSeconds, setTimerSeconds] = useState(28 * 60 + 44);

  // Custom Engraving State
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

  const { user } = useAuth();
  const [reviews, setReviews] = useState<ProductReview[]>(DEFAULT_REVIEWS);
  const [isWritingReview, setIsWritingReview] = useState(false);
  const [newRating, setNewRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewAuthor, setReviewAuthor] = useState("");
  const [reviewTitle, setReviewTitle] = useState("");
  const [reviewComment, setReviewComment] = useState("");
  const [reviewImage, setReviewImage] = useState<string | null>(null);
  const [viewingPhoto, setViewingPhoto] = useState<string | null>(null);
  const modalFileInputRef = useRef<HTMLInputElement>(null);
  const inlineFileInputRef = useRef<HTMLInputElement>(null);
  const [reviewFilter, setReviewFilter] = useState<"all" | "5" | "4" | "3">("all");
  const [reviewSuccess, setReviewSuccess] = useState(false);
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const [feedbackRecommend, setFeedbackRecommend] = useState<"yes" | "no">("yes");
  const [upvotedReviews, setUpvotedReviews] = useState<Set<string>>(new Set());

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      showToast("Picture must be under 5MB in size.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setReviewImage(reader.result);
        showToast("✓ Photo attached successfully (Optional).");
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setReviewImage(null);
    if (modalFileInputRef.current) modalFileInputRef.current.value = "";
    if (inlineFileInputRef.current) inlineFileInputRef.current.value = "";
  };

  const toggleUpvote = (id: string) => {
    setUpvotedReviews((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Load reviews from localStorage keyed by product id
  useEffect(() => {
    if (!productId) return;
    try {
      const key = `krono_reviews_${productId}`;
      const stored = localStorage.getItem(key);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Remove any legacy "timepiece" text from cached reviews
          const sanitized = parsed.map((r: any) => ({
            ...r,
            title: (r.title || "").replace(/Timepiece/gi, "Quality"),
            comment: (r.comment || "").replace(/timepiece/gi, "watch"),
          }));
          setReviews(sanitized);
          return;
        }
      }
      localStorage.setItem(key, JSON.stringify(DEFAULT_REVIEWS));
      setReviews(DEFAULT_REVIEWS);
    } catch { }
  }, [productId]);

  useEffect(() => {
    if (user?.name && !reviewAuthor) {
      setReviewAuthor(user.name);
    }
  }, [user, reviewAuthor]);

  const handleAddReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewComment.trim()) return;
    const newRev: ProductReview = {
      id: `rev-${Date.now()}`,
      author: reviewAuthor.trim() || user?.name || "Verified Collector",
      rating: newRating,
      title: reviewTitle.trim() || "Verified Customer Review",
      comment: reviewComment.trim(),
      createdAt: new Date().toISOString().split("T")[0],
      verifiedBuyer: true,
      imageUrl: reviewImage || undefined,
    };
    const updated = [newRev, ...reviews];
    setReviews(updated);
    try {
      localStorage.setItem(`krono_reviews_${productId}`, JSON.stringify(updated));
    } catch { }
    setReviewSuccess(true);
    setIsWritingReview(false);
    setIsFeedbackModalOpen(false);
    setReviewTitle("");
    setReviewComment("");
    setReviewImage(null);
    if (modalFileInputRef.current) modalFileInputRef.current.value = "";
    if (inlineFileInputRef.current) inlineFileInputRef.current.value = "";
    showToast("✓ Thank you! Your product feedback has been submitted successfully.");
    setTimeout(() => setReviewSuccess(false), 4000);
  };

  const averageRating = useMemo(() => {
    if (reviews.length === 0) return 5.0;
    const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
    return Number((sum / reviews.length).toFixed(1));
  }, [reviews]);

  const ratingDistribution = useMemo(() => {
    const counts: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach((r) => {
      if (counts[r.rating] !== undefined) {
        counts[r.rating]++;
      }
    });
    return counts;
  }, [reviews]);

  const filteredReviews = useMemo(() => {
    if (reviewFilter === "all") return reviews;
    const target = parseInt(reviewFilter, 10);
    return reviews.filter((r) => r.rating === target);
  }, [reviews, reviewFilter]);

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
    showToast("Cart reservation extended by 15 minutes.");
  };

  const handleSaveEngraving = () => {
    if (!engravingText.trim()) return;
    setEngravingSaved(true);
    showToast(`Custom engraving "${engravingText.trim()}" saved.`);
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
          <h2 className="text-xl font-bold uppercase tracking-tight">Product Not Found</h2>
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
    ...(relatedProducts.slice(0, 3).map((p) => ({
      id: p.id,
      name: p.name,
      image: getProductImage(p.id, p.image_url),
      isCurrent: false,
    }))),
  ];

  // Dynamic Tab Content in Normal English
  const renderTabContent = () => {
    switch (activeTab) {
      case "SPECIFICATIONS":
        return (
          <div className="space-y-2 text-xs font-mono">
            <div className="flex items-center justify-between py-2 border-b border-white/5">
              <span className="text-neutral-400">Product Code</span>
              <span className="text-white font-semibold uppercase">{product.id.replace(/^prod-/, "").toUpperCase() || "KW-1002"}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-white/5">
              <span className="text-neutral-400">Case Material</span>
              <span className="text-white font-medium">{product.case_material || "Stainless Steel"}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-white/5">
              <span className="text-neutral-400">Glass &amp; Dial</span>
              <span className="text-white font-medium">Anti-Reflective Sapphire Crystal</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-white/5">
              <span className="text-neutral-400">Movement</span>
              <span className="text-white font-medium">{product.movement || "Swiss Automatic Movement"}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-white/5">
              <span className="text-neutral-400">Water Resistance</span>
              <span className="text-white font-medium">{product.water_resistance || "100m (10 ATM)"}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-white/5">
              <span className="text-neutral-400">Official Warranty</span>
              <span className="text-[#E88C30] font-medium">{product.warranty || "5-Year Official Brand Warranty"}</span>
            </div>
          </div>
        );
      case "REVIEWS & RATINGS":
        return (
          <div className="space-y-6 text-xs font-mono">
            {/* Reviews Summary Header */}
            <div className="bg-[#181818] border border-[#2B2B2B] rounded-xl p-5 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                {/* Score & Stars */}
                <div className="md:col-span-5 text-center md:text-left border-b md:border-b-0 md:border-r border-[#2A2A2A] pb-4 md:pb-0 md:pr-4">
                  <div className="text-4xl font-extrabold text-white font-sans">
                    {averageRating.toFixed(1)}
                    <span className="text-sm text-neutral-400 font-normal"> / 5.0</span>
                  </div>
                  <div className="flex items-center justify-center md:justify-start gap-1 text-[#F59E0B] text-lg mt-1 tracking-wider">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <span key={star}>
                        {averageRating >= star ? "★" : averageRating >= star - 0.5 ? "★" : "☆"}
                      </span>
                    ))}
                  </div>
                  <p className="text-[11px] text-neutral-400 mt-1">
                    Based on <strong className="text-white">{reviews.length}</strong> verified customer reviews
                  </p>
                  <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-950/60 border border-emerald-500/30 text-[10px] text-emerald-400">
                    <span>✓</span>
                    <span>100% Certified Buyer Feedback</span>
                  </div>
                </div>

                {/* Rating Distribution Progress Bars */}
                <div className="md:col-span-7 space-y-1.5">
                  {[5, 4, 3, 2, 1].map((stars) => {
                    const count = ratingDistribution[stars] || 0;
                    const pct = reviews.length > 0 ? Math.round((count / reviews.length) * 100) : 0;
                    return (
                      <div key={stars} className="flex items-center gap-2 text-[11px]">
                        <span className="w-12 text-neutral-300 font-semibold">{stars} ★</span>
                        <div className="flex-1 h-2 bg-[#262626] rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-[#E88C30] to-[#F59E0B] rounded-full transition-all duration-500"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className="w-14 text-right text-neutral-400">{pct}% ({count})</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Action Bar: Write Review Toggle */}
              <div className="pt-3 border-t border-[#262626] flex items-center justify-between flex-wrap gap-3">
                <span className="text-[11px] text-neutral-400">
                  Share your verified feedback and experience with collectors.
                </span>
                <button
                  type="button"
                  onClick={() => setIsWritingReview((prev) => !prev)}
                  className="px-4 py-2 bg-[#E88C30] hover:bg-[#d47b24] text-black font-bold text-xs font-mono uppercase tracking-wider rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  {isWritingReview ? (
                    "Cancel Review"
                  ) : (
                    <>
                      <IconPencil />
                      <span>Write a Review</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Review Submission Form */}
            {isWritingReview && (
              <form
                onSubmit={handleAddReview}
                className="bg-[#161616] border border-[#E88C30]/50 rounded-xl p-5 sm:p-6 space-y-4 shadow-xl"
              >
                <div className="flex items-center justify-between border-b border-[#262626] pb-2.5">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#E88C30]">
                    Write Customer Review &amp; Star Rating
                  </h4>
                  <span className="text-[10px] text-neutral-400">All fields required except photo</span>
                </div>

                {/* 1. Give Star Ratings */}
                <div className="space-y-1.5">
                  <label className="block text-[11px] uppercase tracking-wider text-neutral-300 font-semibold">
                    1. Give Star Rating
                  </label>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setNewRating(star)}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        className="text-2xl transition-transform hover:scale-125 focus:outline-none cursor-pointer"
                        title={`${star} Star${star > 1 ? "s" : ""}`}
                      >
                        <span
                          className={
                            (hoverRating || newRating) >= star ? "text-[#F59E0B]" : "text-neutral-600"
                          }
                        >
                          ★
                        </span>
                      </button>
                    ))}
                    <span className="text-xs font-mono text-[#E88C30] ml-2">
                      {newRating === 5 && "5 Stars — Exceptional"}
                      {newRating === 4 && "4 Stars — Very Good"}
                      {newRating === 3 && "3 Stars — Average"}
                      {newRating === 2 && "2 Stars — Fair"}
                      {newRating === 1 && "1 Star — Poor"}
                    </span>
                  </div>
                </div>

                {/* Author Name */}
                <div className="space-y-1.5">
                  <label className="block text-[11px] uppercase tracking-wider text-neutral-300 font-semibold">
                    2. Your Name
                  </label>
                  <input
                    type="text"
                    required
                    value={reviewAuthor}
                    onChange={(e) => setReviewAuthor(e.target.value)}
                    placeholder="e.g. Kasun Silva"
                    className="w-full bg-[#1F1F1F] border border-[#333333] focus:border-[#E88C30] rounded-lg px-3.5 py-2 text-xs text-white font-mono focus:outline-none"
                  />
                </div>

                {/* Review Title */}
                <div className="space-y-1.5">
                  <label className="block text-[11px] uppercase tracking-wider text-neutral-300 font-semibold">
                    3. Review Headline / Title
                  </label>
                  <input
                    type="text"
                    required
                    value={reviewTitle}
                    onChange={(e) => setReviewTitle(e.target.value)}
                    placeholder="e.g. Magnificent dial craftsmanship and comfort"
                    className="w-full bg-[#1F1F1F] border border-[#333333] focus:border-[#E88C30] rounded-lg px-3.5 py-2 text-xs text-white font-mono focus:outline-none"
                  />
                </div>

                {/* Review Comment */}
                <div className="space-y-1.5">
                  <label className="block text-[11px] uppercase tracking-wider text-neutral-300 font-semibold">
                    4. Product Review &amp; Feedback
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    placeholder="Describe the build quality, accuracy, wrist feel, packaging, and overall satisfaction..."
                    className="w-full bg-[#1F1F1F] border border-[#333333] focus:border-[#E88C30] rounded-lg p-3 text-xs text-white font-mono focus:outline-none resize-none leading-relaxed"
                  />
                </div>

                {/* 5. Optional Picture Attachment */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="block text-[11px] uppercase tracking-wider text-neutral-300 font-semibold">
                      5. Attach a Picture (Optional)
                    </label>
                    <span className="text-[10px] text-[#E88C30] font-mono font-bold">Optional</span>
                  </div>

                  {!reviewImage ? (
                    <div
                      onClick={() => inlineFileInputRef.current?.click()}
                      className="border border-dashed border-[#333333] hover:border-[#E88C30] rounded-xl p-4 text-center cursor-pointer transition-colors bg-[#1F1F1F]/60 hover:bg-[#1F1F1F] flex flex-col items-center justify-center gap-1.5 group"
                    >
                      <input
                        type="file"
                        ref={inlineFileInputRef}
                        onChange={handleImageChange}
                        accept="image/*"
                        className="hidden"
                      />
                      <div className="w-8 h-8 rounded-full bg-[#262626] group-hover:bg-[#E88C30]/20 text-neutral-400 group-hover:text-[#E88C30] flex items-center justify-center transition-colors">
                        <IconCamera />
                      </div>
                      <div className="text-xs text-white font-medium">Click to choose a photo</div>
                      <div className="text-[10px] text-neutral-400">PNG, JPG, WebP up to 5MB (Optional)</div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3 p-3 bg-[#1F1F1F] border border-[#333333] rounded-xl">
                      <div className="w-16 h-16 rounded-lg bg-[#141414] border border-[#333333] overflow-hidden shrink-0 relative">
                        <SmoothImage src={reviewImage} alt="Feedback preview" className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-semibold text-white">Picture attached</div>
                        <div className="text-[10px] text-emerald-400 font-mono mt-0.5">✓ Ready to submit with feedback (Optional)</div>
                      </div>
                      <button
                        type="button"
                        onClick={handleRemoveImage}
                        className="px-2.5 py-1.5 rounded-lg bg-red-950/40 border border-red-500/30 text-red-300 hover:bg-red-950/70 text-[10px] font-mono transition-colors cursor-pointer"
                      >
                        ✕ Remove
                      </button>
                    </div>
                  )}
                </div>

                {/* Submit button */}
                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsWritingReview(false)}
                    className="px-4 py-2 border border-[#333333] hover:border-white/30 text-neutral-400 hover:text-white rounded-lg text-xs font-mono transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-[#E88C30] hover:bg-[#d47b24] text-black font-bold text-xs font-mono uppercase tracking-wider rounded-lg transition-colors cursor-pointer shadow-lg shadow-orange-500/20"
                  >
                    Submit Review &amp; Rating
                  </button>
                </div>
              </form>
            )}

            {reviewSuccess && (
              <div className="p-3 bg-emerald-950/60 border border-emerald-500/50 rounded-lg text-emerald-300 text-xs font-mono flex items-center gap-2">
                <span>✓</span>
                <span>Your review and star rating have been published! Thank you for your feedback.</span>
              </div>
            )}

            {/* Filter Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 text-[11px]">
              <span className="text-neutral-400 uppercase font-semibold">Filter:</span>
              <button
                type="button"
                onClick={() => setReviewFilter("all")}
                className={`px-3 py-1 rounded-full border transition-colors cursor-pointer ${reviewFilter === "all"
                  ? "bg-[#E88C30] text-black border-[#E88C30] font-bold"
                  : "bg-[#1A1A1A] text-neutral-300 border-[#2B2B2B] hover:border-neutral-500"
                  }`}
              >
                All ({reviews.length})
              </button>
              {[5, 4, 3].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setReviewFilter(star.toString() as any)}
                  className={`px-3 py-1 rounded-full border transition-colors cursor-pointer ${reviewFilter === star.toString()
                    ? "bg-[#E88C30] text-black border-[#E88C30] font-bold"
                    : "bg-[#1A1A1A] text-neutral-300 border-[#2B2B2B] hover:border-neutral-500"
                    }`}
                >
                  {star} Stars ({ratingDistribution[star] || 0})
                </button>
              ))}
            </div>

            {/* Customer Feedback List */}
            <div className="space-y-3 pt-1">
              <div className="text-[11px] uppercase tracking-wider text-neutral-400 font-bold">
                Customer Feedback ({filteredReviews.length})
              </div>

              {filteredReviews.length === 0 ? (
                <div className="p-6 bg-[#161616] border border-[#262626] rounded-xl text-center text-neutral-400">
                  No reviews match this star filter.
                </div>
              ) : (
                filteredReviews.map((rev: ProductReview) => (
                  <div
                    key={rev.id}
                    className="p-4 bg-[#141414] border border-[#242424] rounded-xl space-y-2 hover:border-[#333333] transition-colors"
                  >
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-[#E88C30]/20 border border-[#E88C30]/40 flex items-center justify-center text-[11px] font-bold text-[#E88C30]">
                          {(rev.author || "C")[0].toUpperCase()}
                        </div>
                        <div>
                          <span className="text-white font-bold text-xs block">{rev.author}</span>
                          <span className="text-[10px] text-neutral-500">{rev.createdAt}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {rev.verifiedBuyer && (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-950/60 border border-emerald-500/40 text-[9px] text-emerald-400 font-bold uppercase tracking-wide">
                            ✓ Verified Buyer
                          </span>
                        )}
                        <span className="text-[#F59E0B] tracking-widest text-xs">
                          {"★".repeat(rev.rating)}{"☆".repeat(5 - rev.rating)}
                        </span>
                      </div>
                    </div>

                    <h5 className="text-xs font-bold text-white pt-1">{rev.title}</h5>
                    <p className="text-neutral-300 text-[11px] leading-relaxed font-sans">{rev.comment}</p>

                    {/* Customer Photo (Optional) */}
                    {rev.imageUrl && (
                      <div className="pt-2">
                        <div
                          className="relative inline-block group cursor-pointer"
                          onClick={() => setViewingPhoto(rev.imageUrl!)}
                          title="Click to view full picture"
                        >
                          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden border border-[#2B303C] group-hover:border-[#E88C30] transition-all bg-[#0B0C0E]">
                            <SmoothImage
                              src={rev.imageUrl}
                              alt={rev.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          </div>
                          <span className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded text-[9px] bg-black/80 text-white font-mono flex items-center gap-1 border border-white/10">
                            <IconCamera /> Photo
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        );
      case "SIZE & FIT":
        return (
          <div className="space-y-2 text-xs font-mono">
            <div className="flex items-center justify-between py-2 border-b border-white/5">
              <span className="text-neutral-400">Case Diameter</span>
              <span className="text-white font-medium">{product.case_size || "41 mm"}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-white/5">
              <span className="text-neutral-400">Case Thickness</span>
              <span className="text-white font-medium">12.4 mm</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-white/5">
              <span className="text-neutral-400">Lug-to-Lug Length</span>
              <span className="text-white font-medium">48.2 mm</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-white/5">
              <span className="text-neutral-400">Strap Width</span>
              <span className="text-white font-medium">20 mm</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-white/5">
              <span className="text-neutral-400">Wrist Fit Scope</span>
              <span className="text-white font-medium">160 mm - 215 mm (Adjustable)</span>
            </div>
          </div>
        );
      case "RETURN POLICY":
        return (
          <div className="space-y-3 text-xs font-mono text-neutral-300 leading-relaxed">
            <p>
              ✦ <strong className="text-white">14-Day Free Returns:</strong> You can easily return or exchange this watch within 14 days of delivery.
            </p>
            <p>
              ✦ <strong className="text-white">Original Condition:</strong> The watch must be unworn with all security tags, protective films, and original packaging intact.
            </p>
            <p>
              ✦ <strong className="text-white">Doorstep Pickup:</strong> We arrange free doorstep courier pickup for approved returns.
            </p>
          </div>
        );
      case "DELIVERY INFO":
        return (
          <div className="space-y-3 text-xs font-mono text-neutral-300 leading-relaxed">
            <p>
              ✦ <strong className="text-white">Fast Islandwide Delivery:</strong> Orders dispatched within 24 hours. Delivered across Sri Lanka in 1 to 3 business days.
            </p>
            <p>
              ✦ <strong className="text-white">Insured Shipping:</strong> Every shipment is fully insured against damage or loss during transit.
            </p>
            <p>
              ✦ <strong className="text-white">Payment Options:</strong> Secure online payment with Visa, MasterCard, Koko, or Cash on Delivery.
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
        <div className="fixed bottom-6 right-6 z-50 bg-[#161616] border border-[#E88C30] text-[#E88C30] px-5 py-3 text-xs font-bold font-mono uppercase tracking-wider flex items-center gap-3 shadow-2xl animate-fade-in">
          <span>✦</span>
          <span>{toastMessage}</span>
          <Link
            href="/cart"
            className="ml-1 px-2.5 py-1 bg-[#E88C30] text-black font-bold text-[10px] uppercase rounded hover:bg-[#d47b24] transition-colors cursor-pointer"
          >
            View Cart →
          </Link>
        </div>
      )}

      {/* Main Container */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 py-8 sm:py-12">
        <div className="bg-[#121212] rounded-2xl border border-[#242424] shadow-2xl p-6 sm:p-8 lg:p-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">

            {/* ========================================================
                LEFT COLUMN:
                1. Main Image Showcase with 30% Starburst Badge
                2. Pagination Dots
                3. OTHER VARIATIONS Section
                4. Tabs Section (SPECIFICATIONS, SIZE & FIT, RETURN POLICY, DELIVERY INFO)
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
                  className="relative aspect-square sm:aspect-[4/3] bg-[#1A1A1A] rounded-xl border border-[#2B2B2B] overflow-hidden flex items-center justify-center cursor-zoom-in group shadow-inner"
                >
                  {/* Starburst Discount Badge */}
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

                  {/* Ref pill on top left */}
                  <div className="absolute top-4 left-4 z-20">
                    <span className="text-[10px] font-mono font-bold tracking-wider px-2.5 py-1 bg-black/70 backdrop-blur-md text-[#E88C30] border border-[#E88C30]/30 rounded">
                      Ref: {product.id.replace(/^prod-/, "").toUpperCase()}
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

                {/* 2. Carousel / Pagination Dots */}
                <div className="flex items-center justify-center gap-2 pt-3">
                  {galleryImages.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImageIndex(idx)}
                      className={`h-2 rounded-full transition-all duration-300 ${activeImageIndex === idx
                        ? "w-6 bg-[#E88C30] shadow-[0_0_8px_rgba(232,140,48,0.6)]"
                        : "w-2 bg-neutral-600 hover:bg-neutral-400"
                        }`}
                      aria-label={`View image ${idx + 1}`}
                    />
                  ))}
                </div>
              </div>

              {/* 3. OTHER VARIATIONS Section */}
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
                        className={`aspect-square bg-[#1A1A1A] rounded-lg border p-2 flex items-center justify-center relative overflow-hidden group transition-all ${isSelected
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

              {/* 4. Tabs Section */}
              <div id="product-tabs-section" className="pt-6 border-t border-[#222222] space-y-4">
                <div className="flex items-center gap-6 sm:gap-8 border-b border-[#242424] text-xs font-mono font-bold uppercase tracking-wider overflow-x-auto pb-1">
                  {(["SPECIFICATIONS", "REVIEWS & RATINGS", "SIZE & FIT", "RETURN POLICY", "DELIVERY INFO"] as TabType[]).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`pb-3 relative whitespace-nowrap transition-colors cursor-pointer ${activeTab === tab
                        ? "text-[#E88C30] font-bold"
                        : "text-neutral-400 hover:text-white"
                        }`}
                    >
                      <span>{tab}</span>
                      {tab === "REVIEWS & RATINGS" && (
                        <span className="ml-1.5 px-1.5 py-0.5 rounded-full text-[10px] bg-[#E88C30]/20 text-[#E88C30] border border-[#E88C30]/30">
                          {reviews.length}
                        </span>
                      )}
                      {activeTab === tab && (
                        <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#E88C30] rounded-full shadow-[0_0_8px_rgba(232,140,48,0.5)]" />
                      )}
                    </button>
                  ))}
                </div>

                {/* 5. Key-Value Specification Grid or Tab Content */}
                <div className="pt-2">
                  {renderTabContent()}
                </div>
              </div>

            </div>

            {/* ========================================================
                RIGHT COLUMN:
                1. Category Breadcrumb
                2. PRODUCT CODE : 12678ASFG
                3. Title in Accent Orange
                4. Primary LKR Price & Star Reviews
                5. Product Description
                6. SIZE (UK ⌄  SIZE ⌄  SIZE GUIDE)
                7. Action Buttons (ADD TO CART  |  ADD TO WISHLIST)
                8. DELIVERY ESTIMATE
               ======================================================== */}
            <div className="lg:col-span-5 space-y-6">

              {/* 1. Category Breadcrumb */}
              <div className="text-[11px] font-mono uppercase tracking-wider text-neutral-400 flex items-center flex-wrap gap-1.5">
                <span>{product.gender?.toUpperCase() || "MEN"}</span>
                <span>/</span>
                <span>{product.category?.toUpperCase() || "WATCHES"}</span>
                <span>/</span>
                <span>{product.brand?.toUpperCase() || "KRONO"}</span>
                <span>/</span>
                <span className="text-white/80">{product.movement ? "AUTOMATIC" : "WATCH"}</span>
              </div>

              {/* 2. Product Code */}
              <div className="font-mono text-xs uppercase tracking-widest text-neutral-400">
                PRODUCT CODE : <span className="text-white font-semibold">{product.id.replace(/^prod-/, "").toUpperCase() || "KW-1002"}</span>
              </div>

              {/* 3. Product Title */}
              <h1 className="text-2xl sm:text-3xl font-display font-extrabold uppercase tracking-wide text-[#E88C30] leading-tight drop-shadow-sm">
                {product.name}
              </h1>

              {/* 4. Primary LKR Price & Star Ratings Row */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#242424] pb-5">
                <div className="flex items-baseline gap-3">
                  <span className="text-2xl sm:text-3xl font-mono font-bold text-white">
                    {formatCurrency(product.price)}
                  </span>
                  {product.old_price && product.old_price > product.price && (
                    <span className="text-sm font-mono text-neutral-500 line-through">
                      {formatCurrency(product.old_price)}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-3 flex-wrap">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab("REVIEWS & RATINGS");
                      const el = document.getElementById("product-tabs-section");
                      el?.scrollIntoView({ behavior: "smooth" });
                    }}
                    className="flex items-center gap-2 text-xs font-mono text-[#F59E0B] hover:text-[#E88C30] transition-colors cursor-pointer group"
                    title="View customer feedback and star ratings"
                  >
                    <span className="tracking-widest">
                      {"★".repeat(Math.round(averageRating))}{"☆".repeat(5 - Math.round(averageRating))}
                    </span>
                    <span className="text-neutral-400 text-[11px] group-hover:underline">
                      ({reviews.length} reviews · {averageRating.toFixed(1)}/5.0)
                    </span>
                  </button>
                  <span className="text-neutral-600">·</span>
                  <button
                    type="button"
                    onClick={() => setIsFeedbackModalOpen(true)}
                    className="text-xs font-mono font-bold text-[#E88C30] hover:text-[#F59E0B] hover:underline cursor-pointer flex items-center gap-1.5"
                  >
                    <IconPencil />
                    <span>Leave Feedback</span>
                  </button>
                </div>
              </div>

              {/* 5. Product Description in Normal English */}
              <div className="text-xs text-neutral-300 font-sans leading-relaxed">
                <p>{product.description || "Crafted to perfection with premium materials, verified Swiss movement, and exceptional attention to detail."}</p>
              </div>

              {/* 6. SIZE Selection Section */}
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
                  {/* Dropdown 1: Region / System */}
                  <div className="relative">
                    <select
                      value={selectedRegion}
                      onChange={(e) => setSelectedRegion(e.target.value)}
                      className="w-full bg-[#1A1A1A] border border-[#333333] hover:border-[#E88C30] text-white px-3.5 py-2.5 rounded-lg appearance-none cursor-pointer focus:outline-none focus:border-[#E88C30] uppercase font-mono transition-colors"
                    >
                      <option value="UK">UK Standard</option>
                      <option value="US">US Standard</option>
                      <option value="EU">EU Standard</option>
                      <option value="MM">MM (Metric)</option>
                    </select>
                    <span className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-neutral-400 text-[10px]">
                      ▼
                    </span>
                  </div>

                  {/* Dropdown 2: Case Size */}
                  <div className="relative">
                    <select
                      value={selectedSize}
                      onChange={(e) => setSelectedSize(e.target.value)}
                      className="w-full bg-[#1A1A1A] border border-[#333333] hover:border-[#E88C30] text-white px-3.5 py-2.5 rounded-lg appearance-none cursor-pointer focus:outline-none focus:border-[#E88C30] uppercase font-mono transition-colors"
                    >
                      <option value="39mm">Size: 39mm</option>
                      <option value="40mm">Size: 40mm</option>
                      <option value="41mm">Size: 41mm (Standard)</option>
                      <option value="42mm">Size: 42mm</option>
                      <option value="44mm">Size: 44mm</option>
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

                  {/* Add to Cart Button */}
                  <button
                    onClick={() => {
                      addToCart(product, quantity);
                    }}
                    className="flex-1 py-3.5 px-6 bg-gradient-to-r from-[#E67E22] via-[#E88C30] to-[#F39C12] hover:from-[#D35400] hover:to-[#E67E22] text-white font-bold text-xs uppercase tracking-widest rounded-lg shadow-lg shadow-orange-500/25 active:scale-[0.99] transition-all flex items-center justify-center gap-2"
                  >
                    <span>ADD TO CART</span>
                  </button>

                  {/* Add to Wishlist Button */}
                  <button
                    onClick={() => toggleWishlist(product)}
                    className={`py-3.5 px-5 rounded-lg border font-mono text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 whitespace-nowrap ${isWishlisted
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
                  Proceed to Checkout →
                </button>

                {/* Direct Customer Feedback Option */}
                <button
                  type="button"
                  onClick={() => setIsFeedbackModalOpen(true)}
                  className="w-full py-3 px-4 bg-[#14161C] hover:bg-[#1D212A] border border-[#282E3A] hover:border-[#E88C30] text-neutral-200 hover:text-white rounded-lg text-xs font-mono font-bold flex items-center justify-between transition-all cursor-pointer group shadow-sm"
                >
                  <span className="flex items-center gap-2">
                    <span className="text-[#F59E0B] text-sm">★</span>
                    <span>Customer Feedback &amp; Reviews ({reviews.length})</span>
                  </span>
                  <span className="text-[#E88C30] flex items-center gap-1.5 group-hover:translate-x-1 transition-transform">
                    <span className="text-[11px] uppercase tracking-wider font-bold flex items-center gap-1"><IconPencil /> Give Feedback</span>
                    <span>→</span>
                  </span>
                </button>
              </div>

              {/* 8. DELIVERY ESTIMATE Section */}
              <div className="pt-5 border-t border-[#242424] space-y-2 font-mono text-xs">
                <h4 className="text-neutral-300 font-bold uppercase tracking-wider text-xs">
                  DELIVERY ESTIMATE
                </h4>
                <p className="text-neutral-400 leading-relaxed text-[11px]">
                  Estimated delivery in Sri Lanka: 1 - 3 business days. Free islandwide insured shipping on all orders.
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

            </div>

          </div>
        </div>

        {/* Recommended Watches Grid */}
        {relatedProducts.length > 0 && (
          <section className="mt-16 space-y-6">
            <div className="flex items-center justify-between border-b border-[#222222] pb-4">
              <div>
                <span className="text-[10px] font-mono text-[#E88C30] uppercase tracking-widest font-bold">
                  Recommended Watches
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

      {/* Size Guide Modal in Normal English */}
      {isSizeGuideOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#141414] border border-[#333333] rounded-xl p-6 sm:p-8 max-w-lg w-full space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#262626] pb-3">
              <h3 className="text-sm font-mono uppercase text-[#E88C30] font-bold tracking-wider">
                Watch Sizing Guide
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
                Use the table below to find the case diameter that best fits your wrist:
              </p>
              <div className="border border-[#2B2B2B] rounded overflow-hidden">
                <table className="w-full text-left">
                  <thead className="bg-[#1A1A1A] text-neutral-400 border-b border-[#2B2B2B]">
                    <tr>
                      <th className="p-2.5">Case Size</th>
                      <th className="p-2.5">Wrist Size</th>
                      <th className="p-2.5">Fit Recommendation</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#242424]">
                    <tr>
                      <td className="p-2.5 font-bold text-white">38mm - 39mm</td>
                      <td className="p-2.5">150mm - 170mm (6.0&quot; - 6.7&quot;)</td>
                      <td className="p-2.5 text-[#22C55E]">Slim / Classic Fit</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-bold text-white">40mm - 41mm</td>
                      <td className="p-2.5">165mm - 190mm (6.5&quot; - 7.5&quot;)</td>
                      <td className="p-2.5 text-[#E88C30]">Standard Everyday Fit</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-bold text-white">42mm - 44mm</td>
                      <td className="p-2.5">180mm - 210mm (7.1&quot; - 8.3&quot;)</td>
                      <td className="p-2.5 text-blue-400">Bold / Sport Fit</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p className="text-[11px] text-neutral-400">
                All metal bracelet watches include extra links and adjustment tools. Leather straps fit standard wrist sizes with multiple buckle holes.
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

      {/* Terms and Conditions Modal in Normal English */}
      {isTermsOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#141414] border border-[#333333] rounded-xl p-6 sm:p-8 max-w-lg w-full space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#262626] pb-3">
              <h3 className="text-sm font-mono uppercase text-[#E88C30] font-bold tracking-wider">
                Delivery &amp; Return Terms
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
                <strong>1. Free Insured Delivery:</strong> Every order is carefully packaged, tracked, and 100% insured until safely delivered to your doorstep.
              </p>
              <p>
                <strong>2. 14-Day Return Guarantee:</strong> If you are not satisfied with your purchase, you can return or exchange it within 14 days of delivery.
              </p>
              <p>
                <strong>3. Product Authenticity:</strong> All watches are 100% original, brand new, and come with manufacturer serial numbers and official warranty cards.
              </p>
              <p>
                <strong>4. Transparent Pricing:</strong> All listed prices are in LKR with no hidden charges. Free shipping across Sri Lanka.
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

      {/* Customer Support Modal in Normal English */}
      {isSupportOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#141414] border border-[#333333] rounded-xl p-6 sm:p-8 max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#262626] pb-3">
              <span className="text-xs font-mono uppercase text-[#E88C30] font-bold tracking-widest">
                Customer Support Inquiry
              </span>
              <button onClick={() => setIsSupportOpen(false)} className="text-white/60 hover:text-white">✕</button>
            </div>
            {supportSent ? (
              <div className="text-center py-6 space-y-2">
                <div className="text-2xl text-[#E88C30]">✓</div>
                <div className="text-sm font-sans font-bold">Message Sent</div>
                <p className="text-xs text-white/60 font-mono">Our customer support team will reply to you within a few hours.</p>
                <button
                  onClick={() => { setIsSupportOpen(false); supportSent; }}
                  className="mt-4 px-4 py-2 bg-[#E88C30] text-black text-xs font-mono font-bold uppercase rounded"
                >
                  Close
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-xs text-neutral-300 font-mono">
                  Inquiring about: <span className="text-white font-semibold">{product.name}</span>
                </p>
                <textarea
                  rows={3}
                  value={supportMsg}
                  onChange={(e) => setSupportMsg(e.target.value)}
                  placeholder="Ask a question about size, delivery time, or payment options..."
                  className="w-full bg-black border border-[#333333] rounded p-3 text-xs text-white focus:outline-none focus:border-[#E88C30] font-mono resize-none"
                />
                <button
                  onClick={() => setSupportSent(true)}
                  className="w-full py-2.5 bg-[#E88C30] text-black text-xs font-mono font-bold uppercase rounded hover:bg-[#d47b24] transition-colors"
                >
                  Send Inquiry
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Dedicated Product Feedback Modal */}
      {isFeedbackModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#121418] border border-[#2B303C] rounded-2xl p-6 sm:p-8 max-w-lg w-full space-y-5 shadow-2xl animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[#222732] pb-3.5">
              <div className="flex items-center gap-2.5">
                <span className="text-[#E88C30]"><IconPencil className="w-5 h-5" /></span>
                <div>
                  <h3 className="text-sm font-mono uppercase font-bold text-[#E88C30] tracking-wider">
                    Product Feedback &amp; Review
                  </h3>
                  <p className="text-[11px] text-neutral-400 font-mono">
                    Share your experience and review
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsFeedbackModalOpen(false)}
                className="w-8 h-8 rounded-lg bg-neutral-800/60 hover:bg-neutral-800 text-neutral-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Product Summary Preview */}
            <div className="flex items-center gap-3.5 p-3 rounded-xl bg-[#171A21] border border-[#252A36]">
              <div className="w-12 h-12 rounded-lg bg-[#0C0E12] border border-[#222733] flex items-center justify-center p-1 overflow-hidden flex-shrink-0">
                <SmoothImage src={activeImage} alt={product.name} className="w-full h-full object-contain" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-[10px] font-mono uppercase tracking-widest text-[#E88C30] font-bold">
                  {product.brand || "KRONO"}
                </div>
                <div className="text-xs font-semibold text-white truncate">{product.name}</div>
                <div className="text-xs font-mono font-bold text-neutral-300">{formatCurrency(product.price)}</div>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleAddReview} className="space-y-4 font-mono text-xs">
              
              {/* Star Rating */}
              <div className="space-y-1.5">
                <label className="block text-[11px] uppercase tracking-wider text-neutral-300 font-bold">
                  1. Rate this Product
                </label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setNewRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      className="text-2xl transition-transform hover:scale-125 focus:outline-none cursor-pointer p-0.5"
                      title={`${star} Star${star > 1 ? "s" : ""}`}
                    >
                      <span className={(hoverRating || newRating) >= star ? "text-[#F59E0B]" : "text-neutral-600"}>
                        ★
                      </span>
                    </button>
                  ))}
                  <span className="text-xs text-[#E88C30] ml-2 font-bold">
                    {newRating === 5 && "5 Stars — Exceptional"}
                    {newRating === 4 && "4 Stars — Very Good"}
                    {newRating === 3 && "3 Stars — Average"}
                    {newRating === 2 && "2 Stars — Fair"}
                    {newRating === 1 && "1 Star — Poor"}
                  </span>
                </div>
              </div>

              {/* Name */}
              <div className="space-y-1">
                <label className="block text-[11px] uppercase tracking-wider text-neutral-300 font-bold">
                  2. Your Name
                </label>
                <input
                  type="text"
                  required
                  value={reviewAuthor}
                  onChange={(e) => setReviewAuthor(e.target.value)}
                  placeholder="e.g. Kasun Silva"
                  className="w-full bg-[#171A21] border border-[#2B303C] focus:border-[#E88C30] rounded-lg px-3.5 py-2.5 text-xs text-white focus:outline-none"
                />
              </div>

              {/* Headline */}
              <div className="space-y-1">
                <label className="block text-[11px] uppercase tracking-wider text-neutral-300 font-bold">
                  3. Headline / Title
                </label>
                <input
                  type="text"
                  required
                  value={reviewTitle}
                  onChange={(e) => setReviewTitle(e.target.value)}
                  placeholder="e.g. Magnificent watch, exceptional value under 5000 LKR"
                  className="w-full bg-[#171A21] border border-[#2B303C] focus:border-[#E88C30] rounded-lg px-3.5 py-2.5 text-xs text-white focus:outline-none"
                />
              </div>

              {/* Detailed Feedback */}
              <div className="space-y-1">
                <label className="block text-[11px] uppercase tracking-wider text-neutral-300 font-bold">
                  4. Product Feedback &amp; Review
                </label>
                <textarea
                  required
                  rows={4}
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder="Tell us about the build quality, accuracy, wrist comfort, packaging, and whether you recommend it..."
                  className="w-full bg-[#171A21] border border-[#2B303C] focus:border-[#E88C30] rounded-lg p-3 text-xs text-white focus:outline-none resize-none leading-relaxed"
                />
              </div>

              {/* 5. Optional Picture Attachment */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-[11px] uppercase tracking-wider text-neutral-300 font-bold">
                    5. Attach a Picture (Optional)
                  </label>
                  <span className="text-[10px] text-[#E88C30] font-mono font-bold">Optional</span>
                </div>

                {!reviewImage ? (
                  <div
                    onClick={() => modalFileInputRef.current?.click()}
                    className="border border-dashed border-[#2B303C] hover:border-[#E88C30] rounded-xl p-4 text-center cursor-pointer transition-colors bg-[#171A21]/60 hover:bg-[#171A21] flex flex-col items-center justify-center gap-1.5 group"
                  >
                    <input
                      type="file"
                      ref={modalFileInputRef}
                      onChange={handleImageChange}
                      accept="image/*"
                      className="hidden"
                    />
                    <div className="w-8 h-8 rounded-full bg-[#222733] group-hover:bg-[#E88C30]/20 text-[#8E95A5] group-hover:text-[#E88C30] flex items-center justify-center transition-colors">
                      <IconCamera />
                    </div>
                    <div className="text-xs text-white font-medium">Click to choose a photo</div>
                    <div className="text-[10px] text-neutral-400">PNG, JPG, WebP up to 5MB (Optional)</div>
                  </div>
                ) : (
                  <div className="flex items-center gap-3 p-3 bg-[#171A21] border border-[#2B303C] rounded-xl">
                    <div className="w-16 h-16 rounded-lg bg-[#0C0E12] border border-[#2B303C] overflow-hidden shrink-0 relative">
                      <SmoothImage src={reviewImage} alt="Feedback preview" className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-semibold text-white">Picture attached</div>
                      <div className="text-[10px] text-emerald-400 font-mono mt-0.5">✓ Ready to submit with feedback (Optional)</div>
                    </div>
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="px-2.5 py-1.5 rounded-lg bg-red-950/40 border border-red-500/30 text-red-300 hover:bg-red-950/70 text-[10px] font-mono transition-colors cursor-pointer"
                    >
                      ✕ Remove
                    </button>
                  </div>
                )}
              </div>

              {/* Recommend question */}
              <div className="flex items-center justify-between pt-1 text-[11px] text-neutral-300">
                <span>Would you recommend this watch to others?</span>
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="recommend"
                      checked={feedbackRecommend === "yes"}
                      onChange={() => setFeedbackRecommend("yes")}
                      className="accent-[#E88C30]"
                    />
                    <span>Yes</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="recommend"
                      checked={feedbackRecommend === "no"}
                      onChange={() => setFeedbackRecommend("no")}
                      className="accent-[#E88C30]"
                    />
                    <span>No</span>
                  </label>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#222732]">
                <button
                  type="button"
                  onClick={() => setIsFeedbackModalOpen(false)}
                  className="px-4 py-2.5 border border-[#333333] hover:border-neutral-500 text-neutral-300 hover:text-white rounded-lg text-xs font-mono transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#E88C30] hover:bg-[#d47b24] text-black font-bold text-xs font-mono uppercase tracking-wider rounded-lg transition-colors cursor-pointer shadow-lg shadow-orange-500/20"
                >
                  Submit Feedback
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Customer Feedback Photo Lightbox */}
      {viewingPhoto && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 cursor-pointer"
          onClick={() => setViewingPhoto(null)}
        >
          <div
            className="relative max-w-2xl max-h-[85vh] bg-[#121418] border border-[#2B303C] rounded-2xl overflow-hidden shadow-2xl p-2 cursor-default"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setViewingPhoto(null)}
              className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-black/70 hover:bg-black text-white flex items-center justify-center cursor-pointer border border-white/20 transition-colors"
            >
              ✕
            </button>
            <img
              src={viewingPhoto}
              alt="Customer Feedback Photo"
              className="max-w-full max-h-[80vh] object-contain rounded-xl mx-auto"
            />
            <div className="p-3 text-center text-xs font-mono text-neutral-300">
              Verified Customer Feedback Photo
            </div>
          </div>
        </div>
      )}

      {/* Floating Quick Feedback Pill */}
      <div className="fixed bottom-6 right-6 z-40">
        <button
          type="button"
          onClick={() => setIsFeedbackModalOpen(true)}
          className="flex items-center gap-2.5 px-4 py-3 bg-gradient-to-r from-[#E67E22] to-[#E88C30] hover:from-[#D35400] hover:to-[#E67E22] text-black font-mono font-bold text-xs uppercase tracking-wider rounded-full shadow-2xl shadow-orange-500/40 hover:scale-105 active:scale-95 transition-all cursor-pointer border border-amber-300/40 group"
          title="Leave product feedback or rating"
        >
          <IconPencil className="w-4 h-4 text-black group-hover:rotate-12 transition-transform" />
          <span>Leave Feedback</span>
          <span className="w-2 h-2 rounded-full bg-black/80 animate-ping" />
        </button>
      </div>

      {/* Wishlist Drawer */}
      <WishlistDrawer isOpen={isWishlistOpen} onClose={() => setIsWishlistOpen(false)} />

      <Footer />
    </div>
  );
}
