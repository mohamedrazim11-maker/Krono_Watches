"use client";

import { useState, useEffect, useMemo, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SmoothImage from "@/components/SmoothImage";
import { useCart } from "@/lib/CartContext";
import { useAuth } from "@/lib/AuthContext";
import { fetchOrders, fetchOrderById, Order } from "@/lib/api";

export type OrderTrackingStage =
  | "Order confirmed"
  | "Processing"
  | "Shipped"
  | "Out for delivery"
  | "Delivered";

const STAGES: OrderTrackingStage[] = [
  "Order confirmed",
  "Processing",
  "Shipped",
  "Out for delivery",
  "Delivered",
];

// Professional SVG Vector Micro-Icons (Zero emoji)
const IconPackage = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
  </svg>
);

const IconTruck = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
  </svg>
);

const IconCheck = () => (
  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M5 13l4 4L19 7" />
  </svg>
);

const IconMapPin = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const IconShield = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
  </svg>
);

const IconSearch = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

const IconCopy = () => (
  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
  </svg>
);

const IconClock = () => (
  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const IconUser = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

const IconArrowRight = () => (
  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
  </svg>
);

function mapStatusToStage(status?: string): OrderTrackingStage {
  const s = (status || "").toLowerCase().trim();
  if (s === "delivered" || s === "completed") return "Delivered";
  if (s === "out_for_delivery" || s === "out for delivery") return "Out for delivery";
  if (s === "shipped" || s === "dispatched" || s === "in transit" || s === "in_transit") return "Shipped";
  if (s === "processing" || s === "authenticated" || s === "paid") return "Processing";
  return "Order confirmed";
}

function formatDate(dateString?: string) {
  if (!dateString) return "Recent Order";
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return "Recent Order";
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return "Recent Order";
  }
}

function formatTime(dateString?: string) {
  if (!dateString) return "10:30 AM";
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return "10:30 AM";
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  } catch {
    return "10:30 AM";
  }
}

function TrackOrderContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryOrderId = searchParams.get("orderId") || "";

  const { cart, wishlist } = useCart();
  const { user, isAuthenticated } = useAuth();

  const [userOrders, setUserOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const [orderIdInput, setOrderIdInput] = useState(queryOrderId || "");
  const [searchedOrderId, setSearchedOrderId] = useState(queryOrderId || "");
  const [activeStage, setActiveStage] = useState<OrderTrackingStage>("Shipped");
  const [copiedTracking, setCopiedTracking] = useState(false);
  const [lookupLoading, setLookupLoading] = useState(false);

  // Load user placed orders
  useEffect(() => {
    let isMounted = true;
    async function loadOrders() {
      setOrdersLoading(true);
      try {
        const all = await fetchOrders();
        if (!isMounted) return;

        if (user?.id || user?.email) {
          const userEmail = (user?.email || "").toLowerCase().trim();
          const userId = user?.id;

          const matched = all.filter((o: any) => {
            const ordUserId = o.user_id || o.userId;
            const ordEmail = (o.customer_email || o.email || "").toLowerCase().trim();
            return (userId && ordUserId === userId) || (userEmail && ordEmail === userEmail);
          });

          // Sort orders by creation date descending (latest first)
          matched.sort((a, b) => {
            const timeA = a.created_at ? new Date(a.created_at).getTime() : 0;
            const timeB = b.created_at ? new Date(b.created_at).getTime() : 0;
            return timeB - timeA;
          });

          setUserOrders(matched);
        } else {
          // For guests or non-logged in, also inspect localStorage for recently placed order
          try {
            const recentId = localStorage.getItem("krono_recent_order_id");
            if (recentId) {
              const matched = all.filter(
                (o) => o.id === recentId || o.order_number === recentId
              );
              setUserOrders(matched);
            } else {
              setUserOrders([]);
            }
          } catch {
            setUserOrders([]);
          }
        }
      } catch (err) {
        console.error("Failed to fetch user orders:", err);
      } finally {
        if (isMounted) setOrdersLoading(false);
      }
    }

    loadOrders();
    return () => {
      isMounted = false;
    };
  }, [user]);

  // Handle order selection or URL parameter sync
  useEffect(() => {
    if (ordersLoading) return;

    if (queryOrderId) {
      // Find order in loaded userOrders
      const matched = userOrders.find(
        (o) =>
          o.id.toLowerCase() === queryOrderId.toLowerCase() ||
          (o.order_number && o.order_number.toLowerCase() === queryOrderId.toLowerCase())
      );

      if (matched) {
        setSelectedOrder(matched);
        setSearchedOrderId(matched.order_number || matched.id);
        setOrderIdInput(matched.order_number || matched.id);
        setActiveStage(mapStatusToStage(matched.status || (matched as any).order_status));
        return;
      }

      // If not in user's direct list, attempt fetching order by ID from API
      setLookupLoading(true);
      fetchOrderById(queryOrderId)
        .then((data) => {
          const ord = data?.order || data;
          if (ord && ord.id) {
            setSelectedOrder(ord);
            setSearchedOrderId(ord.order_number || ord.id);
            setOrderIdInput(ord.order_number || ord.id);
            setActiveStage(mapStatusToStage(ord.status || ord.order_status));
          } else {
            setSearchedOrderId(queryOrderId);
            setOrderIdInput(queryOrderId);
          }
        })
        .catch(() => {
          setSearchedOrderId(queryOrderId);
          setOrderIdInput(queryOrderId);
        })
        .finally(() => {
          setLookupLoading(false);
        });
    } else if (userOrders.length > 0 && !selectedOrder) {
      // Default to the most recent placed order
      const first = userOrders[0];
      setSelectedOrder(first);
      setSearchedOrderId(first.order_number || first.id);
      setOrderIdInput(first.order_number || first.id);
      setActiveStage(mapStatusToStage(first.status || (first as any).order_status));
    } else if (!searchedOrderId) {
      setSearchedOrderId("ORD-KRN-78429");
      setOrderIdInput("ORD-KRN-78429");
    }
  }, [ordersLoading, queryOrderId, userOrders]);

  // Click handler when an order is clicked in "Your Placed Orders"
  const handleSelectOrder = (order: Order) => {
    setSelectedOrder(order);
    const orderRef = order.order_number || order.id;
    setSearchedOrderId(orderRef);
    setOrderIdInput(orderRef);
    setActiveStage(mapStatusToStage(order.status || (order as any).order_status));
    router.replace(`/orders/track?orderId=${encodeURIComponent(order.id)}`);

    // Smoothly scroll down to details on mobile devices
    if (typeof window !== "undefined" && window.innerWidth < 1024) {
      const detailsEl = document.getElementById("order-tracking-details");
      if (detailsEl) {
        detailsEl.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const query = orderIdInput.trim();
    if (!query) return;

    setSearchedOrderId(query);
    router.replace(`/orders/track?orderId=${encodeURIComponent(query)}`);

    // Check if it matches an order in userOrders
    const localMatch = userOrders.find(
      (o) =>
        o.id.toLowerCase() === query.toLowerCase() ||
        (o.order_number && o.order_number.toLowerCase() === query.toLowerCase())
    );

    if (localMatch) {
      setSelectedOrder(localMatch);
      setActiveStage(mapStatusToStage(localMatch.status || (localMatch as any).order_status));
      return;
    }

    // Try fetching from API
    setLookupLoading(true);
    try {
      const data = await fetchOrderById(query);
      const ord = data?.order || data;
      if (ord && ord.id) {
        setSelectedOrder(ord);
        setActiveStage(mapStatusToStage(ord.status || ord.order_status));
      } else {
        setSelectedOrder(null);
      }
    } catch {
      setSelectedOrder(null);
    } finally {
      setLookupLoading(false);
    }
  };

  const currentStageIndex = STAGES.indexOf(activeStage);

  const getStageState = (stage: OrderTrackingStage) => {
    const idx = STAGES.indexOf(stage);
    if (idx < currentStageIndex) return "completed";
    if (idx === currentStageIndex) return "current";
    return "upcoming";
  };

  const carrierWaybill = useMemo(() => {
    if (selectedOrder?.tracking_number) return selectedOrder.tracking_number;
    const cleanNum = (searchedOrderId || "884129").replace(/\D/g, "");
    return `LK-KRN-${cleanNum.slice(-6) || "991204"}`;
  }, [selectedOrder, searchedOrderId]);

  const handleCopyTracking = () => {
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(carrierWaybill);
      setCopiedTracking(true);
      setTimeout(() => setCopiedTracking(false), 2500);
    }
  };

  // Dynamic milestone data based on selected order
  const stageTimelineLogs = useMemo(() => {
    const orderDate = selectedOrder?.created_at ? formatDate(selectedOrder.created_at) : "Today";
    const orderTime = selectedOrder?.created_at ? formatTime(selectedOrder.created_at) : "10:00 AM";
    const recipient = selectedOrder?.customer_name || user?.name || "Valued Collector";
    const destCity = selectedOrder?.city || "Colombo";
    const destAddress = selectedOrder?.delivery_address || selectedOrder?.shipping_address || "Customer Address";

    return {
      "Order confirmed": {
        title: "Order confirmed",
        location: "Krono Central Verification Desk, Colombo 03",
        date: orderDate,
        time: orderTime,
        description: `Order registered and authenticated. Certificate of horological authenticity prepared for ${recipient}.`,
      },
      Processing: {
        title: "Processing",
        location: "Master Horologist Workshop, Krono Colombo",
        date: orderDate,
        time: "02:15 PM",
        description: "Precision timing calibration, water-resistance pressure chamber test, and luxury packaging.",
      },
      Shipped: {
        title: "Shipped",
        location: "Central Hub Transit Facility, A1 Express",
        date: orderDate,
        time: "05:40 PM",
        description: `Dispatched in armored express transit with tamper-evident security seal. Waybill #${carrierWaybill}.`,
      },
      "Out for delivery": {
        title: "Out for delivery",
        location: `Regional Courier Facility, ${destCity}`,
        date: "Scheduled Today",
        time: "08:30 AM",
        description: `Assigned to dedicated courier agent for direct doorstep handover to ${destAddress}.`,
      },
      Delivered: {
        title: "Delivered",
        location: `${destAddress}, ${destCity}`,
        date: "Handover Verified",
        time: "Doorstep Arrival",
        description: `Package successfully handed over to ${recipient} with physical signature verification.`,
      },
    };
  }, [selectedOrder, user, carrierWaybill]);

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
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-4xl font-serif font-extrabold text-white uppercase tracking-tight">
                Advanced Order Tracking
              </h1>
              <p className="text-xs sm:text-sm text-[#8E95A5] font-mono mt-1 max-w-2xl leading-relaxed">
                View all orders placed by you and inspect live 5-stage shipment telemetry, milestone logs, and courier handover details.
              </p>
            </div>

            {isAuthenticated && (
              <div className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-[#0E1015] border border-[#282E38] text-xs font-mono shrink-0">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-neutral-400">Signed in as:</span>
                <span className="text-white font-bold truncate max-w-[150px]">{user?.name || user?.email}</span>
              </div>
            )}
          </div>
        </div>

        {/* SECTION 1: ALL ORDERS PLACED BY THE USER */}
        <div className="space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2.5">
              <span className="text-[#C5A059]"><IconPackage /></span>
              <h2 className="text-xs sm:text-sm font-mono uppercase tracking-[0.2em] text-white font-bold">
                Your Placed Orders
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#C5A059]/10 text-[#C5A059] border border-[#C5A059]/30">
                {ordersLoading ? "Loading..." : `${userOrders.length} Order${userOrders.length === 1 ? "" : "s"}`}
              </span>
            </div>

            <p className="text-[11px] font-mono text-[#8E95A5]">
              Click any order below to inspect its detailed tracking timeline
            </p>
          </div>

          {/* Loading Skeletons */}
          {ordersLoading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map((n) => (
                <div
                  key={n}
                  className="bg-[#0E1015] border border-[#1E232B] rounded-2xl p-5 space-y-3 animate-pulse"
                >
                  <div className="flex justify-between items-center">
                    <div className="w-24 h-4 bg-white/10 rounded" />
                    <div className="w-16 h-4 bg-white/10 rounded-full" />
                  </div>
                  <div className="w-3/4 h-3 bg-white/5 rounded" />
                  <div className="w-1/2 h-3 bg-white/5 rounded" />
                  <div className="pt-2 border-t border-[#1C2028] flex justify-between">
                    <div className="w-20 h-4 bg-white/10 rounded" />
                    <div className="w-16 h-4 bg-white/10 rounded" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Placed Orders Grid */}
          {!ordersLoading && userOrders.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {userOrders.map((ord) => {
                const isSelected =
                  selectedOrder?.id === ord.id ||
                  searchedOrderId.toLowerCase() === ord.id.toLowerCase() ||
                  (ord.order_number && searchedOrderId.toLowerCase() === ord.order_number.toLowerCase());

                const stageForCard = mapStatusToStage(ord.status || (ord as any).order_status);
                const itemsCount = ord.items?.reduce((s, it) => s + (it.quantity || 1), 0) || 1;
                const firstItem = ord.items && ord.items.length > 0 ? ord.items[0] : null;
                const firstItemName =
                  (firstItem as any)?.product_name ||
                  (firstItem as any)?.name ||
                  "Krono Timepiece";
                const firstItemImage =
                  (firstItem as any)?.image_url ||
                  (firstItem as any)?.product_image ||
                  "/images/watches/submariner_deep_black_ceramic.jpg";

                return (
                  <button
                    key={ord.id}
                    type="button"
                    onClick={() => handleSelectOrder(ord)}
                    className={`text-left p-5 rounded-2xl border transition-all duration-300 relative group cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? "bg-[#14161C] border-[#C5A059] shadow-xl shadow-[#C5A059]/10 ring-1 ring-[#C5A059]"
                        : "bg-[#0E1015] border-[#1E232B] hover:border-[#C5A059]/50 hover:bg-[#121419]"
                    }`}
                  >
                    {/* Top Row: Order ID & Status Badge */}
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-white font-mono font-bold text-xs sm:text-sm tracking-wider">
                            #{ord.order_number || ord.id}
                          </span>
                          {isSelected && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-[#C5A059] text-black">
                              <span className="w-1.5 h-1.5 rounded-full bg-black animate-ping" />
                              TRACKING
                            </span>
                          )}
                        </div>

                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider ${
                            stageForCard === "Delivered"
                              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                              : "bg-[#C5A059]/10 text-[#C5A059] border border-[#C5A059]/30"
                          }`}
                        >
                          {stageForCard}
                        </span>
                      </div>

                      {/* Date & Time */}
                      <div className="flex items-center gap-1.5 text-[11px] font-mono text-[#8E95A5] mb-3">
                        <IconClock />
                        <span>Placed on {formatDate(ord.created_at)}</span>
                      </div>

                      {/* Watch Item Preview */}
                      <div className="flex items-center gap-3 p-2.5 rounded-xl bg-[#08090C] border border-[#1C2028] mb-4">
                        <div className="w-12 h-12 rounded-lg overflow-hidden bg-[#14161C] border border-[#282E38] shrink-0 relative">
                          <SmoothImage
                            src={firstItemImage}
                            alt={firstItemName}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="truncate flex-1">
                          <div className="text-xs font-semibold text-white truncate">
                            {firstItemName}
                          </div>
                          <div className="text-[10px] font-mono text-[#8E95A5]">
                            {itemsCount} {itemsCount === 1 ? "timepiece" : "timepieces"} in parcel
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Bottom Row: Amount & Action Callout */}
                    <div className="pt-3 border-t border-[#1C2028] flex items-center justify-between text-xs font-mono">
                      <div>
                        <span className="text-[10px] text-[#8E95A5] uppercase tracking-wider block">
                          Total Paid
                        </span>
                        <span className="text-[#C5A059] font-bold text-sm">
                          LKR {Number(ord.total_amount || 0).toLocaleString()}
                        </span>
                      </div>

                      <div className="flex items-center gap-1 text-[11px] font-bold text-neutral-300 group-hover:text-[#C5A059] transition-colors">
                        <span>{isSelected ? "Active Tracking" : "View Details"}</span>
                        <IconArrowRight />
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {/* Empty State: Logged in but has no orders */}
          {!ordersLoading && isAuthenticated && userOrders.length === 0 && (
            <div className="bg-[#0E1015] border border-[#1E232B] rounded-2xl p-8 sm:p-10 text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-[#14161C] border border-[#282E38] text-[#C5A059] mx-auto flex items-center justify-center">
                <IconPackage />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-serif font-bold text-white">
                  No Placed Orders Found in Your Account
                </h3>
                <p className="text-xs text-[#8E95A5] font-mono max-w-md mx-auto">
                  Once you place an order for a luxury timepiece, all your shipments, carrier tracking codes, and status milestones will appear here automatically.
                </p>
              </div>
              <div className="pt-2">
                <Link
                  href="/catalog"
                  className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#C5A059] hover:bg-[#D4AF37] text-black font-mono font-bold text-xs uppercase tracking-wider rounded-xl transition-colors"
                >
                  Explore Collection
                </Link>
              </div>
            </div>
          )}

          {/* Empty State: Not logged in */}
          {!ordersLoading && !isAuthenticated && (
            <div className="bg-[#0E1015] border border-[#C5A059]/30 rounded-2xl p-6 sm:p-7 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3.5 text-center sm:text-left">
                <div className="w-10 h-10 rounded-full bg-[#14161C] border border-[#C5A059] text-[#C5A059] flex items-center justify-center shrink-0 hidden sm:flex">
                  <IconUser />
                </div>
                <div>
                  <h3 className="text-sm font-serif font-bold text-white">
                    Sign in to view all your placed orders
                  </h3>
                  <p className="text-xs text-[#8E95A5] font-mono mt-0.5">
                    Access your complete purchase history and one-click shipment tracking across all devices.
                  </p>
                </div>
              </div>
              <Link
                href="/login?redirect=/orders/track"
                className="px-6 py-2.5 bg-[#C5A059] hover:bg-[#D4AF37] text-black font-bold text-xs uppercase font-mono tracking-wider rounded-xl transition-colors shrink-0"
              >
                Sign In Now
              </Link>
            </div>
          )}
        </div>

        {/* SECTION 2: MANUAL SEARCH & STAGE SIMULATOR */}
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
                placeholder="Search any Order Reference (e.g. KR-223413, KR-901675 or ORD-...)"
                className="w-full bg-[#14161C] border border-[#282E38] focus:border-[#C5A059] rounded-xl pl-16 pr-4 py-3 text-xs sm:text-sm text-white font-mono uppercase tracking-wider focus:outline-none transition-colors"
              />
            </div>
            <button
              type="submit"
              disabled={lookupLoading}
              className="px-7 py-3 bg-[#C5A059] hover:bg-[#D4AF37] text-black font-bold text-xs uppercase font-mono tracking-wider rounded-xl transition-colors cursor-pointer shrink-0 shadow-lg shadow-[#C5A059]/20 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <IconSearch />
              <span>{lookupLoading ? "Looking up..." : "Track Order"}</span>
            </button>
          </form>
        </div>

        {/* SECTION 3: ORDER TRACKING DETAILS FOR SELECTED ORDER */}
        <div id="order-tracking-details" className="space-y-8 scroll-mt-24">
          
          {/* Order Meta Bar */}
          <div className="bg-[#0E1015] border border-[#1E232B] rounded-2xl p-6 shadow-xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-xs font-mono">
            <div>
              <span className="text-[#8E95A5] text-[10px] uppercase tracking-widest block font-bold">
                TRACKED ORDER REFERENCE
              </span>
              <span className="text-white font-bold text-sm mt-1 block truncate">
                {searchedOrderId || "ORD-KRN-78429"}
              </span>
              {selectedOrder && (
                <span className="text-[10px] text-[#8E95A5] block mt-0.5">
                  Placed on {formatDate(selectedOrder.created_at)}
                </span>
              )}
            </div>

            <div>
              <span className="text-[#8E95A5] text-[10px] uppercase tracking-widest block font-bold">
                CURRENT MILESTONE
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
                {activeStage === "Delivered"
                  ? "Delivered & Signed"
                  : activeStage === "Out for delivery"
                  ? "Arriving Today"
                  : "Within 1 - 2 Business Days"}
              </span>
            </div>

            <div>
              <span className="text-[#8E95A5] text-[10px] uppercase tracking-widest block font-bold">
                INSURED WAYBILL CODE
              </span>
              <button
                type="button"
                onClick={handleCopyTracking}
                className="text-[#C5A059] hover:underline font-bold text-xs mt-1 flex items-center gap-1.5 cursor-pointer"
                title="Click to copy tracking waybill"
              >
                <IconCopy />
                <span>{carrierWaybill}</span>
                <span className="text-[10px] text-neutral-400">
                  ({copiedTracking ? "Copied!" : "Copy"})
                </span>
              </button>
            </div>
          </div>

          {/* 5-STAGE TRACKING TIMELINE */}
          <div className="bg-[#0E1015] border border-[#282E38] rounded-2xl p-6 sm:p-10 shadow-2xl space-y-8">
            
            <div className="flex items-center justify-between border-b border-[#1E232B] pb-4 flex-wrap gap-2">
              <div>
                <h2 className="text-xs font-mono uppercase tracking-[0.2em] text-[#C5A059] font-bold">
                  SHIPMENT LIFECYCLE
                </h2>
                <p className="text-xs text-neutral-400 font-mono mt-0.5">
                  5-Stage Insured Horological Delivery Pipeline
                </p>
              </div>

              {/* Live Status Badge */}
              <div className="flex items-center gap-2 text-xs font-mono">
                <span className="text-neutral-400">Milestone:</span>
                <span className="px-2.5 py-1 rounded-lg bg-[#C5A059]/10 border border-[#C5A059]/30 text-[#C5A059] font-bold uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#C5A059] animate-pulse" />
                  <span>{activeStage}</span>
                </span>
              </div>
            </div>

            {/* Desktop Horizontal Milestone Stepper */}
            <div className="hidden lg:block relative py-6">
              {/* Connecting Progress Bar */}
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
                  const details = stageTimelineLogs[stage];

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
                        {isCompleted ? <IconCheck /> : idx + 1}
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

            {/* Vertical Milestone Log (Mobile + Tablet + Full Detailed Log) */}
            <div className="space-y-6 pt-2">
              <div className="relative pl-7 before:content-[''] before:absolute before:left-3 before:top-3 before:bottom-3 before:w-0.5 before:bg-[#1E232B]">
                {STAGES.map((stage, idx) => {
                  const state = getStageState(stage);
                  const isCompleted = state === "completed";
                  const isCurrent = state === "current";
                  const isUpcoming = state === "upcoming";
                  const details = stageTimelineLogs[stage];

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
                        {isCompleted ? <IconCheck /> : idx + 1}
                      </div>

                      {/* Event Content Box */}
                      <div className="bg-[#14161C] border border-[#222733] hover:border-[#2F3646] rounded-xl p-4 transition-colors font-mono space-y-2">
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
                                Active Milestone
                              </span>
                            )}
                            {isCompleted && (
                              <span className="text-[10px] text-emerald-400 font-semibold">
                                Completed
                              </span>
                            )}
                          </div>

                          <span className="text-[10px] text-neutral-500">
                            {isUpcoming ? "Scheduled" : `${details.date} • ${details.time}`}
                          </span>
                        </div>

                        <div className="text-[11px] text-white font-medium flex items-center gap-1.5">
                          <span className="text-[#C5A059]"><IconMapPin /></span>
                          <span>{details.location}</span>
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

          {/* SECTION 4: PARCEL CONTENTS, DESTINATION & COURIER PROTOCOL */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* 1. Parcel Contents & Items */}
            <div className="bg-[#0E1015] border border-[#282E38] rounded-2xl p-6 space-y-4 font-mono text-xs shadow-xl flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between border-b border-[#1E232B] pb-3 mb-3">
                  <h3 className="text-[11px] uppercase tracking-widest text-[#C5A059] font-bold flex items-center gap-1.5">
                    <IconPackage />
                    <span>PARCEL CONTENTS</span>
                  </h3>
                  <span className="text-[10px] text-[#8E95A5]">
                    {selectedOrder?.items?.length || 1} Timepiece{(selectedOrder?.items?.length || 1) === 1 ? "" : "s"}
                  </span>
                </div>

                <div className="space-y-3">
                  {selectedOrder && selectedOrder.items && selectedOrder.items.length > 0 ? (
                    selectedOrder.items.map((it, idx) => {
                      const itemName =
                        (it as any).product_name ||
                        (it as any).name ||
                        "Krono Timepiece";
                      const itemImage =
                        (it as any).image_url ||
                        (it as any).product_image ||
                        "/images/watches/submariner_deep_black_ceramic.jpg";
                      const itemPrice = Number(it.unit_price || it.subtotal || 0);

                      return (
                        <div
                          key={idx}
                          className="flex items-center gap-3 p-3 bg-[#14161C] border border-[#202530] rounded-xl"
                        >
                          <div className="w-12 h-12 rounded-lg bg-[#08090C] border border-[#282E38] overflow-hidden shrink-0 relative">
                            <SmoothImage
                              src={itemImage}
                              alt={itemName}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex-1 truncate">
                            <div className="text-white font-semibold text-xs truncate">
                              {itemName}
                            </div>
                            <div className="text-[10px] text-[#8E95A5] flex items-center gap-2 mt-0.5">
                              <span>Qty: {it.quantity}</span>
                              <span>•</span>
                              <span className="text-[#C5A059]">
                                LKR {itemPrice.toLocaleString()}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="flex items-center gap-3 p-3 bg-[#14161C] border border-[#202530] rounded-xl">
                      <div className="w-12 h-12 rounded-lg bg-[#08090C] border border-[#282E38] overflow-hidden shrink-0 relative">
                        <SmoothImage
                          src="/images/watches/speedmaster_chrono_titanium.jpg"
                          alt="Speed Master Chronograph"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 truncate">
                        <div className="text-white font-semibold text-xs truncate">
                          Omega Speedmaster Professional Chrono
                        </div>
                        <div className="text-[10px] text-[#8E95A5] flex items-center gap-2 mt-0.5">
                          <span>Qty: 1</span>
                          <span>•</span>
                          <span className="text-[#C5A059]">LKR 3,890</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Total Summary */}
              <div className="pt-3 border-t border-[#1E232B] flex items-center justify-between text-xs font-mono">
                <span className="text-[#8E95A5]">Grand Total:</span>
                <span className="text-white font-bold text-sm">
                  LKR {Number(selectedOrder?.total_amount || 3890).toLocaleString()}
                </span>
              </div>
            </div>

            {/* 2. Destination Address */}
            <div className="bg-[#0E1015] border border-[#282E38] rounded-2xl p-6 space-y-3 font-mono text-xs shadow-xl flex flex-col justify-between">
              <div>
                <h3 className="text-[11px] uppercase tracking-widest text-[#C5A059] font-bold border-b border-[#1E232B] pb-3 mb-3 flex items-center gap-1.5">
                  <IconMapPin />
                  <span>DELIVERY DESTINATION</span>
                </h3>
                <div className="text-white space-y-1.5">
                  <div className="font-bold text-sm text-white">
                    {selectedOrder?.customer_name || user?.name || "Verified Collector"}
                  </div>
                  <div className="text-neutral-300">
                    {selectedOrder?.delivery_address ||
                      selectedOrder?.shipping_address ||
                      "No. 45/2, Alfred House Gardens"}
                  </div>
                  <div className="text-neutral-400">
                    {selectedOrder?.city || "Colombo"} {selectedOrder?.postal_code || "00300"}, Sri Lanka
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-[#1E232B] space-y-1 text-[11px] text-neutral-400">
                <div>
                  Recipient Phone:{" "}
                  <span className="text-white font-bold">
                    {selectedOrder?.customer_phone || user?.phone || "+94 77 123 4567"}
                  </span>
                </div>
                <div>
                  Email Dispatch:{" "}
                  <span className="text-white">
                    {selectedOrder?.customer_email || user?.email || "customer@krono.luxury"}
                  </span>
                </div>
              </div>
            </div>

            {/* 3. Insured Courier Protocol */}
            <div className="bg-[#0E1015] border border-[#282E38] rounded-2xl p-6 space-y-3 font-mono text-xs shadow-xl flex flex-col justify-between">
              <div>
                <h3 className="text-[11px] uppercase tracking-widest text-[#C5A059] font-bold border-b border-[#1E232B] pb-3 mb-3 flex items-center gap-1.5">
                  <IconShield />
                  <span>COURIER &amp; TRANSIT PROTOCOL</span>
                </h3>
                <div className="space-y-2 text-neutral-300">
                  <div className="flex items-center justify-between">
                    <span className="text-[#8E95A5]">Courier Service:</span>
                    <strong className="text-white">
                      {selectedOrder?.courier_name || "Krono Secure Express"}
                    </strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#8E95A5]">Transit Type:</span>
                    <strong className="text-white">Armored Handover</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#8E95A5]">Insurance:</span>
                    <strong className="text-emerald-400">100% Comprehensive</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#8E95A5]">Verification:</span>
                    <strong className="text-white">Photo ID + Signature</strong>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-[#1E232B] flex gap-2">
                <Link
                  href="/catalog"
                  className="flex-1 py-2.5 bg-[#C5A059] hover:bg-[#D4AF37] text-black text-center font-bold text-xs uppercase tracking-wider rounded-lg transition-colors"
                >
                  Shop More
                </Link>
                <Link
                  href="/profile"
                  className="flex-1 py-2.5 bg-[#14161C] hover:bg-[#1E232B] border border-[#282E38] text-white text-center font-mono text-xs uppercase tracking-wider rounded-lg transition-colors"
                >
                  Account
                </Link>
              </div>
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
