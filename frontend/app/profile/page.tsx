"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/AuthContext";
import { useCart } from "@/lib/CartContext";
import { fetchOrders, Order } from "@/lib/api";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SmoothImage from "@/components/SmoothImage";
import { getProductImage } from "@/lib/productImages";

type SidebarTab =
  | "overview"
  | "orders"
  | "wishlist"
  | "addresses"
  | "payment"
  | "settings";

export default function ProfilePage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading, logout, updateProfile, changePassword } = useAuth();
  const { cart, wishlist, totalItems } = useCart();

  const [activeTab, setActiveTab] = useState<SidebarTab>("overview");
  const [userOrders, setUserOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [selectedOrderDetails, setSelectedOrderDetails] = useState<Order | null>(null);

  // Profile Edit Modal State
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isEditAddressOpen, setIsEditAddressOpen] = useState(false);
  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editAddress, setEditAddress] = useState("");
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMsg, setProfileMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Password Security Form
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [securityMsg, setSecurityMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [securitySaving, setSecuritySaving] = useState(false);

  // Authentication guard
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login?returnUrl=/profile&unauthorized=true");
    }
  }, [isLoading, isAuthenticated, router]);

  // Load orders and populate user profile data
  useEffect(() => {
    if (user) {
      setEditName(user.name || "");
      setEditPhone(user.phone || "");
      setEditAddress(user.address || "");

      setOrdersLoading(true);
      fetchOrders()
        .then((all) => {
          const matched = all.filter(
            (o) =>
              (o.user_id && o.user_id === user.id) ||
              (o.customer_email && o.customer_email.toLowerCase() === user.email?.toLowerCase())
          );
          setUserOrders(matched);
        })
        .catch(() => {})
        .finally(() => setOrdersLoading(false));
    }
  }, [user]);

  const formatCurrency = (amount: number) => {
    return `LKR ${Number(amount || 0).toLocaleString("en-US")}`;
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSaving(true);
    setProfileMsg(null);
    try {
      const res = await updateProfile({
        name: editName,
        phone: editPhone,
        address: editAddress,
      });
      if (res.success) {
        setProfileMsg({ type: "success", text: "Profile details updated successfully." });
        setTimeout(() => setIsEditProfileOpen(false), 1200);
      } else {
        setProfileMsg({ type: "error", text: res.message || "Failed to update profile." });
      }
    } catch (err: any) {
      setProfileMsg({ type: "error", text: err.message || "An error occurred." });
    } finally {
      setProfileSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setSecurityMsg(null);

    const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
    if (!PASSWORD_REGEX.test(newPassword)) {
      setSecurityMsg({
        type: "error",
        text: "New password must be at least 8 characters with uppercase, lowercase, number & symbol.",
      });
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setSecurityMsg({ type: "error", text: "New passwords do not match." });
      return;
    }

    setSecuritySaving(true);
    try {
      const res = await changePassword({ currentPassword, newPassword, confirmNewPassword });
      if (res.success) {
        setSecurityMsg({ type: "success", text: "Security credentials updated successfully." });
        setCurrentPassword("");
        setNewPassword("");
        setConfirmNewPassword("");
      } else {
        setSecurityMsg({ type: "error", text: res.message || "Failed to change password." });
      }
    } catch (err: any) {
      setSecurityMsg({ type: "error", text: err.message || "An error occurred." });
    } finally {
      setSecuritySaving(false);
    }
  };

  if (isLoading || !isAuthenticated || !user) {
    return (
      <div className="min-h-screen flex flex-col bg-[#07080A] text-white">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center font-mono text-xs text-[#C5A059] animate-pulse">
            Verifying Krono Client Session...
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const defaultAddressDisplay = user.address || "Galle Face Court, Colombo 03, Sri Lanka";
  const userInitials = (user.name || "Customer")
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const SIDEBAR_ITEMS: { id: SidebarTab; label: string }[] = [
    { id: "overview", label: "Overview" },
    { id: "orders", label: "Orders" },
    { id: "wishlist", label: "Wishlist" },
    { id: "addresses", label: "Addresses" },
    { id: "payment", label: "Payment methods" },
    { id: "settings", label: "Account settings" },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#07080A] text-white selection:bg-[#C5A059] selection:text-black font-sans">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Title matching Page 3 Wireframe: "My Account" */}
        <div className="mb-8 border-b border-[#1A1D24] pb-5">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white font-serif">
            My Account
          </h1>
        </div>

        {/* 2-Column Layout: Left Vertical Menu & Right Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Sidebar Menu */}
          <div className="lg:col-span-3 space-y-1">
            {SIDEBAR_ITEMS.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full text-left px-5 py-3 rounded-lg text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                    isActive
                      ? "bg-[#C5A059] text-black font-bold shadow-md shadow-[#C5A059]/10"
                      : "text-[#8E95A5] hover:text-white hover:bg-[#12141A]"
                  }`}
                >
                  {item.label}
                </button>
              );
            })}

            {/* Sign out button at bottom of sidebar */}
            <button
              onClick={() => {
                logout();
                router.push("/login");
              }}
              className="w-full text-left px-5 py-3 rounded-lg text-xs font-semibold text-red-400 hover:text-red-300 hover:bg-[#1A1315] transition-colors cursor-pointer mt-4"
            >
              Sign out
            </button>
          </div>

          {/* Right Main Content Area */}
          <div className="lg:col-span-9 space-y-6">
            {/* 1. OVERVIEW VIEW (Matching Page 3 Wireframe) */}
            {activeTab === "overview" && (
              <>
                {/* Top Profile Header Card: AVATAR, Name, Email/Phone, EDIT PROFILE */}
                <div className="bg-[#0E1015] border border-[#1E232B] rounded-xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-5 shadow-md">
                  <div className="flex items-center gap-5">
                    {/* AVATAR Circle */}
                    <div className="w-16 h-16 rounded-full bg-[#181B22] border border-[#2E3440] flex items-center justify-center font-serif font-bold text-lg text-[#C5A059] flex-shrink-0 shadow-inner">
                      {userInitials}
                    </div>

                    {/* Customer info */}
                    <div className="space-y-1">
                      <h2 className="text-base sm:text-lg font-bold text-white tracking-wide">
                        {user.name || "Customer"}
                      </h2>
                      <div className="text-xs font-mono text-[#8E95A5]">
                        <span>{user.email}</span>
                        {user.phone && <span> · {user.phone}</span>}
                      </div>
                    </div>
                  </div>

                  {/* EDIT PROFILE Button */}
                  <button
                    type="button"
                    onClick={() => {
                      setProfileMsg(null);
                      setIsEditProfileOpen(true);
                    }}
                    className="px-5 py-2.5 bg-transparent hover:bg-[#1C2028] border border-[#2E3440] hover:border-[#C5A059] text-white text-xs font-mono uppercase tracking-wider rounded-lg transition-all self-start sm:self-center cursor-pointer"
                  >
                    EDIT PROFILE
                  </button>
                </div>

                {/* 3 Metric Stat Boxes: ORDERS, WISHLIST, CART */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* ORDERS Stat */}
                  <div
                    onClick={() => setActiveTab("orders")}
                    className="bg-[#0E1015] border border-[#1E232B] hover:border-[#2E3440] rounded-xl p-5 cursor-pointer transition-colors"
                  >
                    <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#8E95A5] font-bold">
                      ORDERS
                    </div>
                    <div className="text-2xl font-bold font-mono text-white mt-2">
                      {ordersLoading ? "—" : userOrders.length}
                    </div>
                  </div>

                  {/* WISHLIST Stat */}
                  <div
                    onClick={() => setActiveTab("wishlist")}
                    className="bg-[#0E1015] border border-[#1E232B] hover:border-[#2E3440] rounded-xl p-5 cursor-pointer transition-colors"
                  >
                    <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#8E95A5] font-bold">
                      WISHLIST
                    </div>
                    <div className="text-2xl font-bold font-mono text-white mt-2">
                      {wishlist.length}
                    </div>
                  </div>

                  {/* CART Stat */}
                  <Link
                    href="/cart"
                    className="bg-[#0E1015] border border-[#1E232B] hover:border-[#C5A059]/40 rounded-xl p-5 block transition-colors"
                  >
                    <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#C5A059] font-bold">
                      CART
                    </div>
                    <div className="text-2xl font-bold font-mono text-white mt-2">
                      {totalItems}
                    </div>
                  </Link>
                </div>

                {/* RECENT ORDERS Table Box */}
                <div className="bg-[#0E1015] border border-[#1E232B] rounded-xl p-6 space-y-4 shadow-md">
                  <div className="flex items-center justify-between border-b border-[#181B22] pb-3">
                    <h3 className="text-xs font-mono uppercase font-bold text-[#C5A059] tracking-[0.2em]">
                      RECENT ORDERS
                    </h3>
                    <button
                      onClick={() => setActiveTab("orders")}
                      className="text-xs font-mono text-[#8E95A5] hover:text-white"
                    >
                      View all ({userOrders.length})
                    </button>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs font-mono">
                      <thead>
                        <tr className="border-b border-[#181B22] text-[#6E7585] uppercase text-[10px]">
                          <th className="py-2.5 pr-4">ORDER</th>
                          <th className="py-2.5 pr-4">DATE</th>
                          <th className="py-2.5 pr-4">STATUS</th>
                          <th className="py-2.5 pr-4">TOTAL</th>
                          <th className="py-2.5 text-right">ACTION</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#161820]">
                        {ordersLoading ? (
                          <tr>
                            <td colSpan={5} className="py-6 text-center text-[#8E95A5]">
                              Loading client order history…
                            </td>
                          </tr>
                        ) : userOrders.length === 0 ? (
                          <tr>
                            <td colSpan={5} className="py-6 text-center text-[#8E95A5]">
                              No recent orders found.{" "}
                              <Link href="/catalog" className="text-[#C5A059] underline">
                                Browse our collection
                              </Link>
                            </td>
                          </tr>
                        ) : (
                          userOrders.slice(0, 3).map((ord) => {
                            const dateStr = ord.created_at
                              ? new Date(ord.created_at).toLocaleDateString()
                              : "Recent";
                            const statusDisplay = ord.order_status || ord.status || "Processing";

                            return (
                              <tr key={ord.id} className="hover:bg-[#12141A]/50 transition-colors">
                                <td className="py-3.5 pr-4 text-white font-bold font-mono">
                                  #{ord.id.slice(0, 10)}
                                </td>
                                <td className="py-3.5 pr-4 text-[#8E95A5]">{dateStr}</td>
                                <td className="py-3.5 pr-4">
                                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#1C2028] text-[#C5A059] border border-[#2E3440] uppercase">
                                    {statusDisplay}
                                  </span>
                                </td>
                                <td className="py-3.5 pr-4 text-white font-bold">
                                  {formatCurrency(ord.total_amount)}
                                </td>
                                <td className="py-3.5 text-right">
                                  <button
                                    onClick={() => setSelectedOrderDetails(ord)}
                                    className="text-[#C5A059] hover:underline"
                                  >
                                    View
                                  </button>
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Bottom Row (2 Cards): DEFAULT ADDRESS & SAVED WATCHES */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* Card 1: DEFAULT ADDRESS */}
                  <div className="bg-[#0E1015] border border-[#1E232B] rounded-xl p-6 space-y-3 shadow-md flex flex-col justify-between">
                    <div className="space-y-2">
                      <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#C5A059] font-bold">
                        DEFAULT ADDRESS
                      </div>
                      <div className="text-sm font-bold text-white">{user.name || "Client"}</div>
                      <div className="text-xs font-mono text-[#8E95A5] leading-relaxed">
                        {defaultAddressDisplay}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsEditAddressOpen(true)}
                      className="text-xs font-mono text-[#C5A059] hover:underline self-start pt-2 cursor-pointer"
                    >
                      Edit
                    </button>
                  </div>

                  {/* Card 2: SAVED WATCHES (Wishlist Thumbnails matching wireframe) */}
                  <div className="bg-[#0E1015] border border-[#1E232B] rounded-xl p-6 space-y-3 shadow-md">
                    <div className="flex items-center justify-between">
                      <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#C5A059] font-bold">
                        SAVED WATCHES
                      </div>
                      <button
                        onClick={() => setActiveTab("wishlist")}
                        className="text-xs font-mono text-[#8E95A5] hover:text-white"
                      >
                        {wishlist.length} saved
                      </button>
                    </div>

                    <div className="grid grid-cols-3 gap-3 pt-1">
                      {wishlist.length > 0 ? (
                        wishlist.slice(0, 3).map((w) => {
                          const img = getProductImage(w.id, w.image_url);
                          return (
                            <Link
                              key={w.id}
                              href={`/products/${w.id}`}
                              className="aspect-square bg-[#14161C] border border-[#262A33] hover:border-[#C5A059] rounded-lg p-1 overflow-hidden flex items-center justify-center transition-all group"
                              title={w.name}
                            >
                              <SmoothImage
                                src={img}
                                alt={w.name}
                                className="w-full h-full object-contain group-hover:scale-105 transition-transform"
                              />
                            </Link>
                          );
                        })
                      ) : (
                        <>
                          <div className="aspect-square bg-[#14161C] border border-[#262A33] rounded-lg flex items-center justify-center text-[10px] font-mono text-[#5E6573]">
                            IMG
                          </div>
                          <div className="aspect-square bg-[#14161C] border border-[#262A33] rounded-lg flex items-center justify-center text-[10px] font-mono text-[#5E6573]">
                            IMG
                          </div>
                          <div className="aspect-square bg-[#14161C] border border-[#262A33] rounded-lg flex items-center justify-center text-[10px] font-mono text-[#5E6573]">
                            IMG
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* 2. ORDERS TAB VIEW */}
            {activeTab === "orders" && (
              <div className="bg-[#0E1015] border border-[#1E232B] rounded-xl p-6 space-y-6">
                <div className="flex items-center justify-between border-b border-[#181B22] pb-4">
                  <h2 className="text-xs font-mono uppercase font-bold text-[#C5A059] tracking-[0.2em]">
                    ALL ORDERS
                  </h2>
                  <span className="text-xs font-mono text-[#8E95A5]">
                    {userOrders.length} total orders
                  </span>
                </div>

                {userOrders.length === 0 ? (
                  <div className="text-center py-12 text-[#8E95A5] text-xs font-mono space-y-3">
                    <div>No orders recorded in your client account yet.</div>
                    <Link
                      href="/catalog"
                      className="inline-block px-6 py-2.5 bg-[#C5A059] text-black text-xs font-mono font-bold uppercase rounded-lg"
                    >
                      Shop Timepieces
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {userOrders.map((ord) => (
                      <div
                        key={ord.id}
                        className="p-5 bg-[#14161C] border border-[#262A33] rounded-xl space-y-3"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#20242D] pb-3 text-xs font-mono">
                          <div>
                            <span className="text-white font-bold">Order #{ord.id}</span>
                            <span className="text-[#8E95A5] ml-3">
                              {ord.created_at ? new Date(ord.created_at).toLocaleString() : ""}
                            </span>
                          </div>
                          <span className="px-2.5 py-1 rounded text-[10px] font-bold bg-[#1E232B] text-[#C5A059] uppercase self-start sm:self-center">
                            {ord.order_status || ord.status || "Pending"}
                          </span>
                        </div>

                        {ord.items && ord.items.length > 0 && (
                          <div className="space-y-2 pt-1 text-xs">
                            {ord.items.map((item, idx) => {
                              const title = item.name || item.product_name || "Watch";
                              const unitPrice = item.price ?? item.unit_price ?? 0;
                              return (
                                <div key={idx} className="flex justify-between text-[#8E95A5]">
                                  <span>
                                    {title} (x{item.quantity})
                                  </span>
                                  <span className="text-white font-mono font-medium">
                                    {formatCurrency(unitPrice * item.quantity)}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        )}

                        <div className="pt-2 border-t border-[#20242D] flex justify-between items-center text-xs font-mono">
                          <span className="text-[#8E95A5]">Total</span>
                          <span className="text-sm font-bold text-[#C5A059]">
                            {formatCurrency(ord.total_amount)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* 3. WISHLIST TAB VIEW */}
            {activeTab === "wishlist" && (
              <div className="bg-[#0E1015] border border-[#1E232B] rounded-xl p-6 space-y-6">
                <div className="flex items-center justify-between border-b border-[#181B22] pb-4">
                  <h2 className="text-xs font-mono uppercase font-bold text-[#C5A059] tracking-[0.2em]">
                    SAVED WATCHES
                  </h2>
                  <span className="text-xs font-mono text-[#8E95A5]">
                    {wishlist.length} saved
                  </span>
                </div>

                {wishlist.length === 0 ? (
                  <div className="text-center py-12 text-[#8E95A5] text-xs font-mono space-y-3">
                    <div>You have no saved watches in your wishlist.</div>
                    <Link
                      href="/catalog"
                      className="inline-block px-6 py-2.5 bg-[#C5A059] text-black text-xs font-mono font-bold uppercase rounded-lg"
                    >
                      Explore Catalog
                    </Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                    {wishlist.map((w) => {
                      const img = getProductImage(w.id, w.image_url);
                      return (
                        <div
                          key={w.id}
                          className="bg-[#14161C] border border-[#262A33] rounded-xl p-4 space-y-3"
                        >
                          <div className="aspect-square bg-[#0E1015] rounded-lg p-2 flex items-center justify-center">
                            <SmoothImage
                              src={img}
                              alt={w.name}
                              className="w-full h-full object-contain"
                            />
                          </div>
                          <div>
                            <div className="text-xs font-bold text-white truncate">{w.name}</div>
                            <div className="text-xs font-mono text-[#C5A059] font-bold mt-1">
                              {formatCurrency(w.price)}
                            </div>
                          </div>
                          <Link
                            href={`/products/${w.id}`}
                            className="block w-full py-2 bg-[#1C2028] hover:bg-[#282E38] text-white text-center text-xs font-mono rounded-lg transition-colors"
                          >
                            View Product
                          </Link>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* 4. ADDRESSES TAB VIEW */}
            {activeTab === "addresses" && (
              <div className="bg-[#0E1015] border border-[#1E232B] rounded-xl p-6 space-y-6">
                <h2 className="text-xs font-mono uppercase font-bold text-[#C5A059] tracking-[0.2em] border-b border-[#181B22] pb-4">
                  SAVED ADDRESSES
                </h2>
                <div className="p-5 bg-[#14161C] border border-[#262A33] rounded-xl space-y-2">
                  <div className="text-xs font-mono text-[#C5A059] font-bold">PRIMARY SHIPPING ADDRESS</div>
                  <div className="text-sm font-bold text-white">{user.name}</div>
                  <div className="text-xs font-mono text-[#8E95A5]">{defaultAddressDisplay}</div>
                  <button
                    onClick={() => setIsEditAddressOpen(true)}
                    className="text-xs font-mono text-[#C5A059] hover:underline pt-2 inline-block cursor-pointer"
                  >
                    Update Address
                  </button>
                </div>
              </div>
            )}

            {/* 5. PAYMENT METHODS TAB VIEW */}
            {activeTab === "payment" && (
              <div className="bg-[#0E1015] border border-[#1E232B] rounded-xl p-6 space-y-6">
                <h2 className="text-xs font-mono uppercase font-bold text-[#C5A059] tracking-[0.2em] border-b border-[#181B22] pb-4">
                  PAYMENT METHODS
                </h2>
                <div className="p-5 bg-[#14161C] border border-[#262A33] rounded-xl space-y-2 text-xs font-mono">
                  <div className="text-white font-bold">PayHere Verified Gateway</div>
                  <div className="text-[#8E95A5]">
                    All card payments (Visa, MasterCard, Amex) are processed securely via encrypted PayHere tokens.
                  </div>
                </div>
              </div>
            )}

            {/* 6. SETTINGS TAB VIEW */}
            {activeTab === "settings" && (
              <div className="bg-[#0E1015] border border-[#1E232B] rounded-xl p-6 space-y-6">
                <h2 className="text-xs font-mono uppercase font-bold text-[#C5A059] tracking-[0.2em] border-b border-[#181B22] pb-4">
                  ACCOUNT &amp; SECURITY SETTINGS
                </h2>

                {securityMsg && (
                  <div
                    className={`p-3.5 rounded-lg text-xs font-mono ${
                      securityMsg.type === "success"
                        ? "bg-emerald-950/40 border border-emerald-500/40 text-emerald-300"
                        : "bg-red-950/40 border border-red-500/40 text-red-300"
                    }`}
                  >
                    {securityMsg.text}
                  </div>
                )}

                <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
                  <div>
                    <label className="block text-xs uppercase text-[#8E95A5] mb-1.5 font-mono">
                      Current Password
                    </label>
                    <input
                      type="password"
                      required
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="w-full bg-[#14161C] border border-[#262A33] rounded-lg px-4 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-[#C5A059]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs uppercase text-[#8E95A5] mb-1.5 font-mono">
                      New Password
                    </label>
                    <input
                      type="password"
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full bg-[#14161C] border border-[#262A33] rounded-lg px-4 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-[#C5A059]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs uppercase text-[#8E95A5] mb-1.5 font-mono">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      required
                      value={confirmNewPassword}
                      onChange={(e) => setConfirmNewPassword(e.target.value)}
                      className="w-full bg-[#14161C] border border-[#262A33] rounded-lg px-4 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-[#C5A059]"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={securitySaving}
                    className="px-6 py-2.5 bg-[#C5A059] hover:bg-[#D4AF37] text-black font-bold text-xs font-mono uppercase tracking-wider rounded-lg transition-colors cursor-pointer"
                  >
                    {securitySaving ? "Saving..." : "Update Password"}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Edit Profile Modal */}
      {(isEditProfileOpen || isEditAddressOpen) && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => {
            setIsEditProfileOpen(false);
            setIsEditAddressOpen(false);
          }}
        >
          <div
            className="w-full max-w-md bg-[#0E1015] border border-[#282E38] rounded-xl p-6 space-y-4 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center border-b border-[#1E232B] pb-3">
              <h3 className="text-sm font-bold text-white uppercase font-mono tracking-wider">
                {isEditAddressOpen ? "Update Default Address" : "Edit Profile"}
              </h3>
              <button
                onClick={() => {
                  setIsEditProfileOpen(false);
                  setIsEditAddressOpen(false);
                }}
                className="text-[#8E95A5] hover:text-white"
              >
                ✕
              </button>
            </div>

            {profileMsg && (
              <div
                className={`p-3 rounded-lg text-xs font-mono ${
                  profileMsg.type === "success"
                    ? "bg-emerald-950/40 text-emerald-300"
                    : "bg-red-950/40 text-red-300"
                }`}
              >
                {profileMsg.text}
              </div>
            )}

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div>
                <label className="block text-xs uppercase text-[#8E95A5] mb-1 font-mono">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full bg-[#14161C] border border-[#262A33] rounded-lg px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-[#C5A059]"
                />
              </div>

              <div>
                <label className="block text-xs uppercase text-[#8E95A5] mb-1 font-mono">
                  Phone Number
                </label>
                <input
                  type="text"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  placeholder="+94 77 123 4567"
                  className="w-full bg-[#14161C] border border-[#262A33] rounded-lg px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-[#C5A059]"
                />
              </div>

              <div>
                <label className="block text-xs uppercase text-[#8E95A5] mb-1 font-mono">
                  Delivery Address
                </label>
                <textarea
                  rows={3}
                  value={editAddress}
                  onChange={(e) => setEditAddress(e.target.value)}
                  placeholder="Street, City, Postal code"
                  className="w-full bg-[#14161C] border border-[#262A33] rounded-lg px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-[#C5A059]"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditProfileOpen(false);
                    setIsEditAddressOpen(false);
                  }}
                  className="px-4 py-2 border border-[#262A33] rounded-lg text-xs font-mono text-[#8E95A5]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={profileSaving}
                  className="px-5 py-2 bg-[#C5A059] hover:bg-[#D4AF37] text-black font-bold text-xs font-mono uppercase tracking-wider rounded-lg"
                >
                  {profileSaving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Order Details Modal */}
      {selectedOrderDetails && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setSelectedOrderDetails(null)}
        >
          <div
            className="w-full max-w-lg bg-[#0E1015] border border-[#282E38] rounded-xl p-6 space-y-4 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center border-b border-[#1E232B] pb-3">
              <div>
                <h3 className="text-sm font-bold text-white uppercase font-mono">
                  Order Details #{selectedOrderDetails.id}
                </h3>
                <span className="text-[11px] font-mono text-[#8E95A5]">
                  Status: {selectedOrderDetails.order_status || selectedOrderDetails.status || "Processing"}
                </span>
              </div>
              <button
                onClick={() => setSelectedOrderDetails(null)}
                className="text-[#8E95A5] hover:text-white text-lg"
              >
                ✕
              </button>
            </div>

            <div className="divide-y divide-[#181B22] max-h-60 overflow-y-auto">
              {selectedOrderDetails.items?.map((item, idx) => {
                const title = item.name || item.product_name || "Watch";
                const unitPrice = item.price ?? item.unit_price ?? 0;
                return (
                  <div key={idx} className="py-2.5 flex justify-between text-xs font-mono">
                    <div>
                      <div className="text-white font-medium">{title}</div>
                      <div className="text-[#8E95A5]">Qty: {item.quantity}</div>
                    </div>
                    <div className="text-white font-bold">{formatCurrency(unitPrice * item.quantity)}</div>
                  </div>
                );
              })}
            </div>

            <div className="pt-3 border-t border-[#1E232B] flex justify-between text-sm font-bold font-mono text-[#C5A059]">
              <span>Total Paid:</span>
              <span>{formatCurrency(selectedOrderDetails.total_amount)}</span>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
