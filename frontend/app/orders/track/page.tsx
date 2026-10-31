"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SmoothImage from "@/components/SmoothImage";
import { useCart } from "@/lib/CartContext";
import { fetchOrderById } from "@/lib/api";

export type OrderTrackingStage =
  | "Order confirmed"
  | "Processing"
  | "Shipped"
  | "Out for delivery"
  | "Delivered";

interface TrackingMilestone {
  stage: OrderTrackingStage;
  stepNumber: number;
  title: string;
  location: string;
  date: string;
  time: string;
  description: string;
  icon: string;
}

const STAGES: OrderTrackingStage[] = [
  "Order confirmed",
  "Processing",
  "Shipped",
  "Out for delivery",
  "Delivered",
];

const STAGE_DETAILS: Record<
  OrderTrackingStage,
  { title: string; location: string; description: string; icon: string }
> = {
  "Order confirmed": {
    title: "Order confirmed",
    location: "Krono Central Verification Desk, Colombo",
    description: "Order registered, payment verified, and horological certificate prepared.",
    icon: "✓",
  },
  Processing: {
    title: "Processing",
    location: "Master Horologist Workshop, Colombo 03",
    description: "Precision timing calibration, water-resistance test, and luxury box packaging.",
    icon: "⚙",
  },
  Shipped: {
    title: "Shipped",
    location: "Central Hub Transit Facility, A1 Express",
    description: "Handed to insured armored courier with tamper-evident security seal.",
    icon: "✈",
  },
  "Out for delivery": {
    title: "Out for delivery",
    location: "Regional Courier Facility, Local District",
    description: "Assigned to dedicated courier agent for direct doorstep delivery handover.",
    icon: "🚚",
  },
  Delivered: {
    title: "Delivered",
    location: "Customer Destination Address",
    description: "Package successfully handed over with physical signature verification.",
    icon: "★",
  },
};

function TrackOrderContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialOrderId = searchParams.get("orderId") || "";

  const { cart, wishlist } = useCart();
  const [orderIdInput, setOrderIdInput] = useState(initialOrderId || "ORD-KRN-78429");
  const [searchedOrderId, setSearchedOrderId] = useState(initialOrderId || "ORD-KRN-78429");
  const [activeStage, setActiveStage] = useState<OrderTrackingStage>("Shipped");
  const [searchedOrder, setSearchedOrder] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [copiedTracking, setCopiedTracking] = useState(false);

  // Sync when searchParams change
  useEffect(() => {
    if (initialOrderId) {
      setOrderIdInput(initialOrderId);
      setSearchedOrderId(initialOrderId);
    }
  }, [initialOrderId]);

  // Attempt to fetch from API if real order ID exists
  useEffect(() => {
    async function lookupOrder() {
      if (!searchedOrderId) return;
      setLoading(true);
      try {
        const data = await fetchOrderById(searchedOrderId);
        if (data && data.order) {
          setSearchedOrder(data.order);
          const rawStatus = (data.order.status || "").toLowerCase();
          if (rawStatus === "delivered" || rawStatus === "completed") {
            setActiveStage("Delivered");
          } else if (rawStatus === "out_for_delivery") {
            setActiveStage("Out for delivery");
          } else if (rawStatus === "shipped" || rawStatus === "dispatched") {
            setActiveStage("Shipped");
          } else if (rawStatus === "processing" || rawStatus === "authenticated") {
            setActiveStage("Processing");
          } else {
            setActiveStage("Order confirmed");
          }
        } else {
          setSearchedOrder(null);
        }
      } catch {
        setSearchedOrder(null);
      } finally {
        setLoading(false);
      }
    }
    lookupOrder();
  }, [searchedOrderId]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderIdInput.trim()) return;
    setSearchedOrderId(orderIdInput.trim());
    router.replace(`/orders/track?orderId=${encodeURIComponent(orderIdInput.trim())}`);
  };

  const currentStageIndex = STAGES.indexOf(activeStage);

  const getStageState = (stage: OrderTrackingStage) => {
    const idx = STAGES.indexOf(stage);
    if (idx < currentStageIndex) return "completed";
    if (idx === currentStageIndex) return "current";
    return "upcoming";
  };

  const handleCopyTracking = () => {
    const trackingCode = `KRN-WAYBILL-${searchedOrderId || "884129"}`;
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(trackingCode);
      setCopiedTracking(true);
      setTimeout(() => setCopiedTracking(false), 2500);
    }
  };

  // Sample order demo presets for quick testing of all 5 exact stages
  const DEMO_PRESETS: { label: string; stage: OrderTrackingStage; orderId: string }[] = [
    { label: "1. Order confirmed", stage: "Order confirmed", orderId: "ORD-CONF-101" },
    { label: "2. Processing", stage: "Processing", orderId: "ORD-PROC-202" },
    { label: "3. Shipped", stage: "Shipped", orderId: "ORD-SHIP-303" },
    { label: "4. Out for delivery", stage: "Out for delivery", orderId: "ORD-OFD-404" },
    { label: "5. Delivered", stage: "Delivered", orderId: "ORD-DLV-505" },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#07080A] text-white selection:bg-[#C5A059] selection:text-black font-sans">
      <Navbar cartCount={cart.reduce((s, i) => s + i.quantity, 0)} wishlistCount={wishlist.length} />

      <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
        
        {/* Header & Breadcrumb */}
        <div className="border-b border-[#1E232B] pb-6">
          <div className="flex items-center gap-2 text-xs font-mono text-[#8E95A5] mb-2 uppercase tracking-wider">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <span>/</span>
            <Link href="/profile" className="hover:text-white transition-colors">Account</Link>
            <span>/</span>
            <span className="text-[#C5A059] font-bold">Shipment Tracking</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-serif font-extrabold text-white uppercase tracking-tight">
            Advanced Order Tracking
          </h1>
          <p className="text-xs sm:text-sm text-[#8E95A5] font-mono mt-1 max-w-2xl leading-relaxed">
            Real-time status tracking across all 5 verification and transit stages with insured courier telemetry.
          </p>
        </div>

        {/* Search & Lookup Bar */}
        <div className="bg-[#0E1015] border border-[#282E38] rounded-2xl p-6 sm:p-7 shadow-xl space-y-4">
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-500 font-mono text-xs">
                ORD #
              </span>
              <input
                type="text"
                value={orderIdInput}
                onChange={(e) => setOrderIdInput(e.target.value)}
                placeholder="Enter Order Reference (e.g. ORD-173000... or ORD-SHIP-303)"
                className="w-full bg-[#14161C] border border-[#282E38] focus:border-[#C5A059] rounded-xl pl-16 pr-4 py-3 text-xs sm:text-sm text-white font-mono uppercase tracking-wider focus:outline-none transition-colors"
              />
            </div>
            <button
              type="submit"
              className="px-7 py-3 bg-[#C5A059] hover:bg-[#D4AF37] text-black font-bold text-xs uppercase font-mono tracking-wider rounded-xl transition-colors cursor-pointer shrink-0 shadow-lg shadow-[#C5A059]/20"
            >
              Track Order
            </button>
          </form>

          {/* Quick Preset Selector for Testing All 5 Stages */}
          <div className="pt-2 border-t border-[#1C2028] flex items-center flex-wrap gap-2 text-xs font-mono">
            <span className="text-[#8E95A5] text-[11px] uppercase tracking-wider font-semibold">
              Quick Test Stages:
            </span>
            {DEMO_PRESETS.map((p) => (
              <button
                key={p.stage}
                type="button"
                onClick={() => {
                  setOrderIdInput(p.orderId);
                  setSearchedOrderId(p.orderId);
                  setActiveStage(p.stage);
                }}
                className={`px-3 py-1 rounded-lg border text-[11px] font-mono transition-all cursor-pointer ${
                  activeStage === p.stage
                    ? "bg-[#C5A059] text-black border-[#C5A059] font-bold shadow-sm"
                    : "bg-[#14161C] text-neutral-300 border-[#262A33] hover:border-neutral-500"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Order Meta Bar */}
        <div className="bg-[#0E1015] border border-[#1E232B] rounded-2xl p-6 shadow-xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-xs font-mono">
          <div>
            <span className="text-[#8E95A5] text-[10px] uppercase tracking-widest block font-bold">
              ORDER REFERENCE
            </span>
            <span className="text-white font-bold text-sm mt-1 block truncate">
              {searchedOrderId || "ORD-KRN-78429"}
            </span>
          </div>

          <div>
            <span className="text-[#8E95A5] text-[10px] uppercase tracking-widest block font-bold">
              CURRENT STATUS
            </span>
            <div className="inline-flex items-center gap-2 mt-1 px-2.5 py-1 rounded-full bg-[#C5A059]/10 border border-[#C5A059]/30 text-[#C5A059] font-bold uppercase tracking-wider text-[11px]">
              <span className="w-2 h-2 rounded-full bg-[#C5A059] animate-pulse" />
              <span>{activeStage}</span>
            </div>
          </div>

          <div>
            <span className="text-[#8E95A5] text-[10px] uppercase tracking-widest block font-bold">
              ESTIMATED ARRIVAL
            </span>
            <span className="text-emerald-400 font-bold text-sm mt-1 block">
              {activeStage === "Delivered" ? "Delivered On Time" : "Within 1 - 2 Business Days"}
            </span>
          </div>

          <div>
            <span className="text-[#8E95A5] text-[10px] uppercase tracking-widest block font-bold">
              CARRIER WAYBILL
            </span>
            <button
              type="button"
              onClick={handleCopyTracking}
              className="text-[#C5A059] hover:underline font-bold text-xs mt-1 flex items-center gap-1.5 cursor-pointer"
              title="Click to copy tracking waybill"
            >
              <span>{`LK-KRN-${(searchedOrderId || "88412").replace(/\D/g, "").slice(-6) || "991204"}`}</span>
              <span className="text-[10px] text-neutral-400">({copiedTracking ? "Copied!" : "Copy"})</span>
            </button>
          </div>
        </div>

        {/* 5-STAGE TRACKING TIMELINE (DESKTOP & MOBILE RESPONSIVE) */}
        <div className="bg-[#0E1015] border border-[#282E38] rounded-2xl p-6 sm:p-10 shadow-2xl space-y-8">
          
          <div className="flex items-center justify-between border-b border-[#1E232B] pb-4">
            <div>
              <h2 className="text-xs font-mono uppercase tracking-[0.2em] text-[#C5A059] font-bold">
                SHIPMENT TIMELINE
              </h2>
              <p className="text-xs text-neutral-400 font-mono mt-0.5">
                5-Stage Certified Lifecycle Pipeline
              </p>
            </div>

            {/* Manual Stage Simulator Dropdown */}
            <div className="flex items-center gap-2 text-xs font-mono">
              <span className="text-neutral-400 hidden sm:inline">Simulate Stage:</span>
              <select
                value={activeStage}
                onChange={(e) => setActiveStage(e.target.value as OrderTrackingStage)}
                className="bg-[#14161C] border border-[#282E38] text-white px-3 py-1.5 rounded-lg text-xs font-mono focus:outline-none focus:border-[#C5A059] cursor-pointer"
              >
                {STAGES.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Desktop Horizontal Milestone Stepper */}
          <div className="hidden lg:block relative py-6">
            {/* Connecting Progress Track Bar */}
            <div className="absolute top-1/2 left-10 right-10 -translate-y-1/2 h-1 bg-[#1E232B] -z-0">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 via-[#C5A059] to-[#D4AF37] transition-all duration-700 rounded-full"
                style={{
                  width: `${(currentStageIndex / (STAGES.length - 1)) * 100}%`,
                }}
              />
            </div>

            {/* 5 Distinct Stage Nodes */}
            <div className="grid grid-cols-5 relative z-10">
              {STAGES.map((stage, idx) => {
                const state = getStageState(stage);
                const isCompleted = state === "completed";
                const isCurrent = state === "current";
                const details = STAGE_DETAILS[stage];

                return (
                  <button
                    key={stage}
                    type="button"
                    onClick={() => setActiveStage(stage)}
                    className="flex flex-col items-center text-center group cursor-pointer focus:outline-none px-2"
                  >
                    {/* Circle Node Indicator */}
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-sm font-mono border-2 transition-all duration-300 ${
                        isCompleted
                          ? "bg-emerald-500 border-emerald-400 text-black shadow-lg shadow-emerald-500/20"
                          : isCurrent
                          ? "bg-[#C5A059] border-[#D4AF37] text-black shadow-lg shadow-[#C5A059]/40 animate-pulse scale-110"
                          : "bg-[#14161C] border-[#2A303C] text-neutral-500 group-hover:border-neutral-400"
                      }`}
                    >
                      {isCompleted ? "✓" : isCurrent ? details.icon : idx + 1}
                    </div>

                    {/* Stage Label */}
                    <div className="mt-4 space-y-1">
                      <div
                        className={`text-xs font-mono font-bold uppercase tracking-wider transition-colors ${
                          isCompleted
                            ? "text-emerald-400"
                            : isCurrent
                            ? "text-[#C5A059]"
                            : "text-neutral-500"
                        }`}
                      >
                        {stage}
                      </div>
                      <div className="text-[10px] text-neutral-400 font-mono line-clamp-2 max-w-[150px] mx-auto">
                        {details.location}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Vertical Timeline (Mobile & Tablet) + Detailed Log */}
          <div className="space-y-6 pt-2">
            <div className="relative pl-7 before:content-[''] before:absolute before:left-3 before:top-3 before:bottom-3 before:w-0.5 before:bg-[#1E232B]">
              {STAGES.map((stage, idx) => {
                const state = getStageState(stage);
                const isCompleted = state === "completed";
                const isCurrent = state === "current";
                const isUpcoming = state === "upcoming";
                const details = STAGE_DETAILS[stage];

                return (
                  <div key={stage} className="relative pb-8 last:pb-1">
                    {/* Indicator Dot */}
                    <div
                      className={`absolute -left-7 top-1 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border transition-all ${
                        isCompleted
                          ? "bg-emerald-500 border-emerald-400 text-black"
                          : isCurrent
                          ? "bg-[#C5A059] border-[#D4AF37] text-black animate-pulse shadow-md shadow-[#C5A059]/30"
                          : "bg-[#14161C] border-[#282E38] text-neutral-500"
                      }`}
                    >
                      {isCompleted ? "✓" : idx + 1}
                    </div>

                    {/* Event Content */}
                    <div className="bg-[#14161C] border border-[#222733] hover:border-[#2F3646] rounded-xl p-4 transition-colors font-mono space-y-1.5">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-xs font-bold uppercase tracking-wider ${
                              isCompleted
                                ? "text-emerald-400"
                                : isCurrent
                                ? "text-[#C5A059]"
                                : "text-neutral-500"
                            }`}
                          >
                            {stage}
                          </span>
                          {isCurrent && (
                            <span className="px-2 py-0.5 rounded-full text-[9px] bg-[#C5A059]/20 text-[#C5A059] border border-[#C5A059]/30 font-bold uppercase">
                              Active Stage
                            </span>
                          )}
                          {isCompleted && (
                            <span className="text-[10px] text-emerald-400 font-semibold">
                              Completed
                            </span>
                          )}
                        </div>

                        <span className="text-[10px] text-neutral-500">
                          {isUpcoming ? "Pending" : "Verified & Logged"}
                        </span>
                      </div>

                      <div className="text-[11px] text-white font-medium">
                        📍 {details.location}
                      </div>

                      <p className="text-[11px] text-neutral-400 font-sans leading-relaxed">
                        {details.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Parcel Information & Delivery Destination */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Destination Address */}
          <div className="bg-[#0E1015] border border-[#282E38] rounded-2xl p-6 space-y-3 font-mono text-xs shadow-xl">
            <h3 className="text-[11px] uppercase tracking-widest text-[#C5A059] font-bold">
              DELIVERY DESTINATION
            </h3>
            <div className="text-white space-y-1">
              <div className="font-bold">Verified Collector Residence</div>
              <div className="text-neutral-300">No. 45/2, Alfred House Gardens</div>
              <div className="text-neutral-400">Colombo 00300, Western Province</div>
              <div className="text-neutral-400">Sri Lanka</div>
            </div>
            <div className="pt-2 border-t border-[#1E232B] text-[11px] text-neutral-400">
              Contact: +94 77 123 4567 (SMS delivery alerts active)
            </div>
          </div>

          {/* Courier & Security Verification */}
          <div className="bg-[#0E1015] border border-[#282E38] rounded-2xl p-6 space-y-3 font-mono text-xs shadow-xl">
            <h3 className="text-[11px] uppercase tracking-widest text-[#C5A059] font-bold">
              COURIER &amp; SECURITY PROTOCOL
            </h3>
            <div className="space-y-1 text-neutral-300">
              <div>✦ Courier: <strong className="text-white">Krono Secure Express</strong></div>
              <div>✦ Transit Type: <strong className="text-white">Armored Direct Handover</strong></div>
              <div>✦ Insurance: <strong className="text-emerald-400">100% Comprehensive Coverage</strong></div>
              <div>✦ Verification: <strong className="text-white">Signature + Photo ID Required</strong></div>
            </div>
            <div className="pt-2 border-t border-[#1E232B] text-[11px] text-neutral-400">
              Tamper-evident seals intact. GPS telemetry calibrated.
            </div>
          </div>

          {/* Action Concierge */}
          <div className="bg-[#0E1015] border border-[#282E38] rounded-2xl p-6 space-y-3 font-mono text-xs shadow-xl flex flex-col justify-between">
            <div>
              <h3 className="text-[11px] uppercase tracking-widest text-[#C5A059] font-bold">
                NEED ASSISTANCE?
              </h3>
              <p className="text-[11px] text-neutral-400 leading-relaxed mt-2">
                Our horological dispatch team is available 24/7 to answer questions regarding delivery schedules or special handling instructions.
              </p>
            </div>
            <div className="space-y-2 pt-3">
              <Link
                href="/catalog"
                className="block w-full py-2.5 bg-[#C5A059] hover:bg-[#D4AF37] text-black text-center font-bold text-xs uppercase tracking-wider rounded-lg transition-colors"
              >
                Continue Shopping
              </Link>
              <Link
                href="/profile"
                className="block w-full py-2.5 bg-[#14161C] hover:bg-[#1E232B] border border-[#282E38] text-white text-center font-mono text-xs uppercase tracking-wider rounded-lg transition-colors"
              >
                View Account Dashboard
              </Link>
            </div>
          </div>
        </div>

      </main>

      <Footer />
    </div>
  );
}

export default function TrackOrderPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#07080A] text-white font-mono text-xs">
          Loading shipment tracker...
        </div>
      }
    >
      <TrackOrderContent />
    </Suspense>
  );
}

