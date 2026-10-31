"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/AuthContext";
import { useCart } from "@/lib/CartContext";
import { fetchOrders, requestOrderRefund, Order } from "@/lib/api";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SmoothImage from "@/components/SmoothImage";
import { getProductImage } from "@/lib/productImages";

export interface DeliveryAddress {
  id: string;
  label: "Home" | "Work" | "Billing" | "Other";
  recipientName: string;
  phone: string;
  streetAddress: string;
  city: string;
  postalCode: string;
  isDefault: boolean;
}

type SidebarTab =
  | "overview"
  | "edit-profile"
  | "addresses"
  | "orders"
  | "wishlist"
  | "payment"
  | "settings";

// Professional SVG Vector Micro-Icons (Zero emoji)
const IconDashboard = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
  </svg>
);

const IconUser = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

const IconPin = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const IconPackage = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
  </svg>
);

const IconHeart = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
  </svg>
);

const IconCard = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
  </svg>
);

const IconLock = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
  </svg>
);

const IconSignout = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
  </svg>
);

const IconPencil = () => (
  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
  </svg>
);

const IconTrash = () => (
  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);

const IconCart = () => (
  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
  </svg>
);

const IconCheck = () => (
  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M5 13l4 4L19 7" />
  </svg>
);

const IconTruck = () => (
  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
  </svg>
);

const IconRefresh = () => (
  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
  </svg>
);

export default function ProfilePage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading, logout, updateProfile, changePassword } = useAuth();
  const { cart, wishlist, totalItems, moveToCart, moveAllWishlistToCart } = useCart();

  const [activeTab, setActiveTab] = useState<SidebarTab>("overview");
  const [userOrders, setUserOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [selectedOrderDetails, setSelectedOrderDetails] = useState<Order | null>(null);

  // Order Tracking State
  const [trackingOrder, setTrackingOrder] = useState<Order | null>(null);

  // Refund State & Policy Flow
  const [refundOrder, setRefundOrder] = useState<Order | null>(null);
  const [refundStep, setRefundStep] = useState<"policy" | "form" | "success">("policy");
  const [policyAgreed, setPolicyAgreed] = useState(false);
  const [refundReason, setRefundReason] = useState("Defective or mechanical issue upon arrival");
  const [refundNotes, setRefundNotes] = useState("");
  const [refundMethod, setRefundMethod] = useState("original_payment");
  const [refundBankName, setRefundBankName] = useState("");
  const [refundAccountNum, setRefundAccountNum] = useState("");
  const [refundHolderName, setRefundHolderName] = useState("");
  const [refundBranch, setRefundBranch] = useState("");
  const [refundSubmitting, setRefundSubmitting] = useState(false);
  const [refundError, setRefundError] = useState<string | null>(null);

  // Profile Edit Modal State
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isEditAddressOpen, setIsEditAddressOpen] = useState(false);
  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editAddress, setEditAddress] = useState("");
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMsg, setProfileMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Delivery Address Management State
  const [savedAddresses, setSavedAddresses] = useState<DeliveryAddress[]>([]);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [addrLabel, setAddrLabel] = useState<"Home" | "Work" | "Billing" | "Other">("Home");
  const [addrRecipient, setAddrRecipient] = useState("");
  const [addrPhone, setAddrPhone] = useState("");
  const [addrStreet, setAddrStreet] = useState("");
  const [addrCity, setAddrCity] = useState("Colombo");
  const [addrPostal, setAddrPostal] = useState("");
  const [addrIsDefault, setAddrIsDefault] = useState(false);
  const [addressToast, setAddressToast] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [avatarChoice, setAvatarChoice] = useState<string>("gold");

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

      // Load saved delivery addresses from localStorage or user record
      try {
        const stored = localStorage.getItem(`krono_saved_addresses_${user.id}`);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setSavedAddresses(parsed);
          } else {
            initDefaultAddresses();
          }
        } else {
          initDefaultAddresses();
        }
      } catch {
        initDefaultAddresses();
      }

      function initDefaultAddresses() {
        const initial: DeliveryAddress[] = [];
        if (user?.address) {
          initial.push({
            id: "addr-home",
            label: "Home",
            recipientName: user.name || "Customer",
            phone: user.phone || "+94 77 123 4567",
            streetAddress: user.address,
            city: "Colombo",
            postalCode: "00100",
            isDefault: true,
          });
        }
        if (user?.secondary_address) {
          initial.push({
            id: "addr-work",
            label: "Work",
            recipientName: user.name || "Customer",
            phone: user.phone || "+94 11 234 5678",
            streetAddress: user.secondary_address,
            city: "Colombo 01",
            postalCode: "00200",
            isDefault: initial.length === 0,
          });
        }
        if (initial.length === 0) {
          initial.push({
            id: "addr-sample",
            label: "Home",
            recipientName: user?.name || "Customer",
            phone: user?.phone || "+94 77 123 4567",
            streetAddress: "No. 42, Galle Road, Kollupitiya",
            city: "Colombo",
            postalCode: "00300",
            isDefault: true,
          });
        }
        setSavedAddresses(initial);
        try {
          if (user?.id) {
            localStorage.setItem(`krono_saved_addresses_${user.id}`, JSON.stringify(initial));
          }
        } catch {}
      }

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

  const handleOpenAddAddress = () => {
    setEditingAddressId(null);
    setAddrLabel("Home");
    setAddrRecipient(user?.name || "");
    setAddrPhone(user?.phone || "");
    setAddrStreet("");
    setAddrCity("Colombo");
    setAddrPostal("");
    setAddrIsDefault(savedAddresses.length === 0);
    setIsAddressModalOpen(true);
  };

  const handleOpenEditAddress = (addr: DeliveryAddress) => {
    setEditingAddressId(addr.id);
    setAddrLabel(addr.label);
    setAddrRecipient(addr.recipientName);
    setAddrPhone(addr.phone);
    setAddrStreet(addr.streetAddress);
    setAddrCity(addr.city);
    setAddrPostal(addr.postalCode);
    setAddrIsDefault(addr.isDefault);
    setIsAddressModalOpen(true);
  };

  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addrStreet.trim() || !addrRecipient.trim()) return;

    let updatedList: DeliveryAddress[];

    if (editingAddressId) {
      updatedList = savedAddresses.map((a) => {
        if (a.id === editingAddressId) {
          return {
            ...a,
            label: addrLabel,
            recipientName: addrRecipient.trim(),
            phone: addrPhone.trim(),
            streetAddress: addrStreet.trim(),
            city: addrCity.trim(),
            postalCode: addrPostal.trim(),
            isDefault: addrIsDefault,
          };
        }
        return addrIsDefault ? { ...a, isDefault: false } : a;
      });
    } else {
      const newAddr: DeliveryAddress = {
        id: `addr-${Date.now()}`,
        label: addrLabel,
        recipientName: addrRecipient.trim(),
        phone: addrPhone.trim(),
        streetAddress: addrStreet.trim(),
        city: addrCity.trim(),
        postalCode: addrPostal.trim(),
        isDefault: addrIsDefault || savedAddresses.length === 0,
      };

      if (newAddr.isDefault) {
        updatedList = [...savedAddresses.map((a) => ({ ...a, isDefault: false })), newAddr];
      } else {
        updatedList = [...savedAddresses, newAddr];
      }
    }

    setSavedAddresses(updatedList);
    try {
      if (user?.id) {
        localStorage.setItem(`krono_saved_addresses_${user.id}`, JSON.stringify(updatedList));
      }
    } catch {}

    // Sync default address to user profile and checkout auto-fill
    const defaultAddr = updatedList.find((a) => a.isDefault);
    if (defaultAddr) {
      setEditAddress(defaultAddr.streetAddress);
      updateProfile({
        address: defaultAddr.streetAddress,
        phone: defaultAddr.phone || editPhone,
      }).catch(() => {});

      try {
        const parts = (defaultAddr.recipientName || "").trim().split(" ");
        const autoAddr = {
          firstName: parts[0] || "",
          lastName: parts.slice(1).join(" ") || "",
          phone: defaultAddr.phone,
          address: defaultAddr.streetAddress,
          city: defaultAddr.city,
          postalCode: defaultAddr.postalCode,
        };
        localStorage.setItem("krono_auto_saved_address", JSON.stringify(autoAddr));
        if (user?.id) {
          localStorage.setItem(`krono_saved_address_${user.id}`, JSON.stringify(autoAddr));
        }
      } catch {}
    }

    setIsAddressModalOpen(false);
    setAddressToast(editingAddressId ? "Address updated successfully." : "New delivery address added.");
    setTimeout(() => setAddressToast(null), 3000);
  };

  const handleSetDefaultAddress = (id: string) => {
    const updated = savedAddresses.map((a) => ({
      ...a,
      isDefault: a.id === id,
    }));
    setSavedAddresses(updated);
    try {
      if (user?.id) {
        localStorage.setItem(`krono_saved_addresses_${user.id}`, JSON.stringify(updated));
      }
    } catch {}
    const defaultAddr = updated.find((a) => a.id === id);
    if (defaultAddr) {
      setEditAddress(defaultAddr.streetAddress);
      updateProfile({ address: defaultAddr.streetAddress }).catch(() => {});
    }
    setAddressToast("Default delivery address updated.");
    setTimeout(() => setAddressToast(null), 3000);
  };

  const handleDeleteAddress = (id: string) => {
    const remaining = savedAddresses.filter((a) => a.id !== id);
    if (remaining.length > 0 && !remaining.some((a) => a.isDefault)) {
      remaining[0].isDefault = true;
    }
    setSavedAddresses(remaining);
    try {
      if (user?.id) {
        localStorage.setItem(`krono_saved_addresses_${user.id}`, JSON.stringify(remaining));
      }
    } catch {}
    setDeleteConfirmId(null);
    setAddressToast("Address removed.");
    setTimeout(() => setAddressToast(null), 3000);
  };

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

  const handleOpenTracking = (ord: Order) => {
    setTrackingOrder(ord);
  };

  const handleOpenRefund = (ord: Order) => {
    setRefundOrder(ord);
    setRefundStep("policy");
    setPolicyAgreed(false);
    setRefundReason("Defective or mechanical issue upon arrival");
    setRefundNotes("");
    setRefundMethod(ord.payment_method === "payhere" ? "original_payment" : "bank_transfer");
    setRefundBankName("");
    setRefundAccountNum("");
    setRefundHolderName(user?.name || ord.customer_name || "");
    setRefundBranch("");
    setRefundError(null);
  };

  const handleSubmitRefund = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!refundOrder) return;
    if (!refundNotes.trim()) {
      setRefundError("Please provide details explaining the reason for your refund request.");
      return;
    }
    setRefundSubmitting(true);
    setRefundError(null);
    try {
      const bankDetails =
        refundMethod === "bank_transfer"
          ? {
              bank_name: refundBankName,
              account_number: refundAccountNum,
              account_name: refundHolderName,
              branch: refundBranch,
            }
          : undefined;

      await requestOrderRefund(refundOrder.id, {
        reason: refundReason,
        notes: refundNotes,
        method: refundMethod,
        bank_details: bankDetails,
      });

      // Update local state in userOrders and active modals
      setUserOrders((prev) =>
        prev.map((o) =>
          o.id === refundOrder.id
            ? { ...o, refund_status: "requested", status: "refund_requested" }
            : o
        )
      );
      if (selectedOrderDetails?.id === refundOrder.id) {
        setSelectedOrderDetails((prev) =>
          prev ? { ...prev, refund_status: "requested", status: "refund_requested" } : null
        );
      }
      if (trackingOrder?.id === refundOrder.id) {
        setTrackingOrder((prev) =>
          prev ? { ...prev, refund_status: "requested", status: "refund_requested" } : null
        );
      }
      setRefundStep("success");
    } catch (err: any) {
      setRefundError(err.message || "Failed to submit refund request. Please try again.");
    } finally {
      setRefundSubmitting(false);
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

  const defaultAddressDisplay = user.address || "No shipping address on file yet. Click Edit to add your address.";
  const userInitials = (user.name || "Customer")
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const SIDEBAR_ITEMS: { id: SidebarTab; label: string; icon: React.ReactNode }[] = [
    { id: "overview", label: "Overview", icon: <IconDashboard /> },
    { id: "edit-profile", label: "Edit Profile", icon: <IconUser /> },
    { id: "addresses", label: "Delivery Addresses", icon: <IconPin /> },
    { id: "orders", label: "My Orders", icon: <IconPackage /> },
    { id: "wishlist", label: "Wishlist", icon: <IconHeart /> },
    { id: "payment", label: "Payment Methods", icon: <IconCard /> },
    { id: "settings", label: "Password & Security", icon: <IconLock /> },
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
          <div className="lg:col-span-3 space-y-4">
            <div className="bg-[#0E1015] border border-[#1E232B] rounded-xl p-2 space-y-1">
              {SIDEBAR_ITEMS.map((item) => {
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full text-left px-4 py-2.5 rounded-lg text-xs font-semibold tracking-wide transition-all cursor-pointer flex items-center gap-2.5 ${
                      isActive
                        ? "bg-[#C5A059] text-black font-bold shadow-md shadow-[#C5A059]/10"
                        : "text-[#8E95A5] hover:text-white hover:bg-[#14161C]"
                    }`}
                  >
                    <span className="shrink-0">{item.icon}</span>
                    <span>{item.label}</span>
                  </button>
                );
              })}

              {/* Sign out button at bottom of sidebar */}
              <div className="pt-2 border-t border-[#181B22] mt-2">
                <button
                  onClick={() => {
                    logout();
                    router.push("/login");
                  }}
                  className="w-full text-left px-4 py-2.5 rounded-lg text-xs font-semibold text-neutral-400 hover:text-white hover:bg-neutral-800/40 transition-colors cursor-pointer flex items-center gap-2.5"
                >
                  <IconSignout />
                  <span>Sign out</span>
                </button>
              </div>
            </div>

            {/* Promotional Banner matching Slide 6 Mockup */}
            <div className="relative overflow-hidden rounded-xl border border-[#262A33] bg-gradient-to-br from-[#12151C] to-[#0A0C0F] p-5 shadow-lg group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#C5A059]/5 rounded-full blur-2xl pointer-events-none" />
              <div className="space-y-2 relative z-10">
                <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#C5A059] font-bold">
                  AUTUMN CURATION
                </span>
                <h3 className="text-sm font-bold text-white tracking-wide uppercase leading-snug">
                  Discover New Collection
                </h3>
                <p className="text-[11px] text-[#8E95A5] font-mono leading-relaxed">
                  Certified Swiss calibres and rare limited chronometers now available.
                </p>
                <Link
                  href="/catalog"
                  className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-[#C5A059] hover:text-[#D4AF37] pt-1 group-hover:translate-x-0.5 transition-transform"
                >
                  <span>Explore Catalogue</span>
                  <span>→</span>
                </Link>
              </div>
            </div>
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
                      setActiveTab("edit-profile");
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
                                  <div className="flex flex-col gap-1">
                                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#1C2028] text-[#C5A059] border border-[#2E3440] uppercase w-fit">
                                      {statusDisplay}
                                    </span>
                                    {ord.refund_status === "requested" && (
                                      <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-orange-950/60 text-orange-400 border border-orange-800/40 uppercase w-fit">
                                        Refund Pending
                                      </span>
                                    )}
                                    {ord.refund_status === "refunded" && (
                                      <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-red-950/60 text-red-400 border border-red-800/40 uppercase w-fit">
                                        Refunded
                                      </span>
                                    )}
                                  </div>
                                </td>
                                <td className="py-3.5 pr-4 text-white font-bold">
                                  {formatCurrency(ord.total_amount)}
                                </td>
                                <td className="py-3.5 text-right whitespace-nowrap">
                                  <div className="flex items-center justify-end gap-2">
                                    <button
                                      type="button"
                                      onClick={() => handleOpenTracking(ord)}
                                      className="px-2 py-1 bg-[#C5A059]/15 hover:bg-[#C5A059]/25 text-[#C5A059] border border-[#C5A059]/30 rounded text-[10px] font-bold font-mono transition-colors"
                                      title="Track order shipment and live courier status"
                                    >
                                      Track
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => setSelectedOrderDetails(ord)}
                                      className="px-2 py-1 bg-[#1A1E26] hover:bg-[#252B37] text-white/80 border border-[#2A303C] rounded text-[10px] font-mono transition-colors"
                                    >
                                      Details
                                    </button>
                                    {ord.refund_status === "requested" ? (
                                      <span className="text-[10px] font-mono text-orange-400 italic">
                                        In Review
                                      </span>
                                    ) : ord.refund_status === "refunded" ? (
                                      <span className="text-[10px] font-mono text-red-400 italic">
                                        Returned
                                      </span>
                                    ) : (
                                      <button
                                        type="button"
                                        onClick={() => handleOpenRefund(ord)}
                                        className="text-[10px] font-mono text-white/50 hover:text-orange-300 underline"
                                      >
                                        Refund
                                      </button>
                                    )}
                                  </div>
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
                    <div>No orders recorded in your account yet.</div>
                    <Link
                      href="/catalog"
                      className="inline-block px-6 py-2.5 bg-[#C5A059] text-black text-xs font-mono font-bold uppercase rounded-lg"
                    >
                      Shop Watches
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {userOrders.map((ord) => (
                      <div
                        key={ord.id}
                        className="p-5 bg-[#14161C] border border-[#262A33] rounded-xl space-y-4 shadow-sm"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#20242D] pb-3 text-xs font-mono">
                          <div>
                            <span className="text-white font-bold">Order #{ord.order_number || ord.id}</span>
                            <span className="text-[#8E95A5] ml-3">
                              {ord.created_at ? new Date(ord.created_at).toLocaleString() : ""}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="px-2.5 py-1 rounded text-[10px] font-bold bg-[#1E232B] text-[#C5A059] border border-[#2E3440] uppercase">
                              {ord.order_status || ord.status || "Pending"}
                            </span>
                            {ord.refund_status === "requested" && (
                              <span className="px-2.5 py-1 rounded text-[10px] font-bold bg-orange-950/70 text-orange-400 border border-orange-800/60 uppercase">
                                Refund Under Review
                              </span>
                            )}
                            {ord.refund_status === "refunded" && (
                              <span className="px-2.5 py-1 rounded text-[10px] font-bold bg-red-950/70 text-red-400 border border-red-800/60 uppercase">
                                Refunded
                              </span>
                            )}
                          </div>
                        </div>

                        {ord.items && ord.items.length > 0 && (
                          <div className="space-y-2 pt-1 text-xs">
                            {ord.items.map((item, idx) => {
                              const title = item.name || item.product_name || "Watch";
                              const unitPrice = item.price ?? item.unit_price ?? 0;
                              return (
                                <div key={idx} className="flex justify-between items-center text-[#8E95A5]">
                                  <span className="font-medium text-white/90">
                                    {title} <span className="text-[#8E95A5] font-mono">(×{item.quantity})</span>
                                  </span>
                                  <span className="text-white font-mono font-medium">
                                    {formatCurrency(unitPrice * item.quantity)}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        )}

                        <div className="pt-3 border-t border-[#20242D] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono">
                          <div>
                            <span className="text-[#8E95A5] mr-2">Total Paid:</span>
                            <span className="text-sm font-bold text-[#C5A059]">
                              {formatCurrency(ord.total_amount)}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 flex-wrap">
                            <button
                              type="button"
                              onClick={() => handleOpenTracking(ord)}
                              className="px-3.5 py-1.5 bg-[#C5A059] hover:bg-[#D4AF37] text-black font-bold rounded-lg text-xs font-mono transition-colors flex items-center gap-1.5 shadow-sm"
                            >
                              <IconTruck /> <span>Track Order</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => setSelectedOrderDetails(ord)}
                              className="px-3.5 py-1.5 bg-[#1E232B] hover:bg-[#282F3B] text-white border border-[#2E3645] rounded-lg text-xs font-mono transition-colors"
                            >
                              Details
                            </button>

                            {ord.refund_status === "requested" ? (
                              <button
                                type="button"
                                onClick={() => handleOpenRefund(ord)}
                                className="px-3 py-1.5 bg-orange-950/40 text-orange-300 border border-orange-800/40 rounded-lg text-xs font-mono hover:bg-orange-950/60 transition-colors"
                              >
                                View Refund
                              </button>
                            ) : ord.refund_status === "refunded" ? (
                              <span className="text-xs text-red-400 font-mono italic px-2">
                                Returned
                              </span>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleOpenRefund(ord)}
                                className="px-3 py-1.5 bg-transparent hover:bg-red-950/20 text-white/60 hover:text-red-300 border border-[#2E3440] hover:border-red-900/40 rounded-lg text-xs font-mono transition-colors"
                              >
                                Request Refund
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* 3. WISHLIST TAB VIEW (Baymard UX - Move to Cart) */}
            {activeTab === "wishlist" && (
              <div className="bg-[#0E1015] border border-[#1E232B] rounded-xl p-6 space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#181B22] pb-4">
                  <div>
                    <h2 className="text-xs font-mono uppercase font-bold text-[#C5A059] tracking-[0.2em]">
                      SAVED WATCHES
                    </h2>
                    <span className="text-xs font-mono text-[#8E95A5]">
                      {wishlist.length} saved in wishlist
                    </span>
                  </div>

                  {wishlist.length > 0 && (
                    <button
                      type="button"
                      onClick={moveAllWishlistToCart}
                      className="px-4 py-2 bg-[#C5A059] hover:bg-[#D4AF37] text-black font-bold text-xs font-mono uppercase tracking-wider rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 self-start sm:self-center"
                    >
                      <IconCart />
                      <span>Move All to Cart ({wishlist.length})</span>
                    </button>
                  )}
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
                          className="bg-[#14161C] border border-[#262A33] rounded-xl p-4 space-y-3 flex flex-col justify-between"
                        >
                          <div>
                            <div className="aspect-square bg-[#0E1015] rounded-lg p-2 flex items-center justify-center">
                              <SmoothImage
                                src={img}
                                alt={w.name}
                                className="w-full h-full object-contain"
                              />
                            </div>
                            <div className="pt-2">
                              <div className="text-xs font-bold text-white truncate">{w.name}</div>
                              <div className="text-xs font-mono text-[#C5A059] font-bold mt-1">
                                {formatCurrency(w.price)}
                              </div>
                            </div>
                          </div>

                          <div className="space-y-2 pt-2 border-t border-[#1E232B]">
                            <button
                              type="button"
                              onClick={() => moveToCart(w)}
                              className="w-full py-2 bg-[#C5A059] hover:bg-[#D4AF37] text-black text-center text-xs font-mono font-bold uppercase rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                            >
                              <IconCart />
                              <span>Move to Cart</span>
                            </button>
                            <Link
                              href={`/products/${w.id}`}
                              className="block w-full py-1.5 text-center text-[11px] font-mono text-[#8E95A5] hover:text-white transition-colors"
                            >
                              View Product Details
                            </Link>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* 2. EDIT PROFILE TAB VIEW (Slide 6 - Edit profile) */}
            {activeTab === "edit-profile" && (
              <div className="bg-[#0E1015] border border-[#1E232B] rounded-xl p-6 sm:p-8 space-y-8 shadow-xl">
                <div className="border-b border-[#181B22] pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h2 className="text-xs font-mono uppercase font-bold text-[#C5A059] tracking-[0.2em]">
                      EDIT PROFILE DETAILS
                    </h2>
                    <p className="text-xs text-[#8E95A5] font-mono mt-1">
                      Update your account identity, personal details, and contact preferences.
                    </p>
                  </div>
                  <span className="text-[11px] font-mono px-2.5 py-1 bg-emerald-950/40 text-emerald-400 border border-emerald-500/30 rounded-full w-fit">
                    Certified Client
                  </span>
                </div>

                {profileMsg && (
                  <div
                    className={`p-4 rounded-xl text-xs font-mono flex items-center gap-2 ${
                      profileMsg.type === "success"
                        ? "bg-emerald-950/40 border border-emerald-500/40 text-emerald-300"
                        : "bg-red-950/40 border border-red-500/40 text-red-300"
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    <span>{profileMsg.text}</span>
                  </div>
                )}

                {/* Avatar Section */}
                <div className="p-5 bg-[#14161C] border border-[#262A33] rounded-xl flex flex-col sm:flex-row sm:items-center gap-6">
                  <div className="w-20 h-20 rounded-full bg-[#1A1D24] border-2 border-[#C5A059] flex items-center justify-center font-serif font-bold text-2xl text-[#C5A059] shadow-lg flex-shrink-0">
                    {userInitials}
                  </div>
                  <div className="space-y-1.5 flex-1">
                    <h3 className="text-sm font-bold text-white uppercase font-mono">
                      Client Avatar &amp; Credentials
                    </h3>
                    <p className="text-xs text-[#8E95A5] font-mono">
                      Your initials and client status are authenticated across all Krono chronometer transactions.
                    </p>
                    <div className="flex flex-wrap items-center gap-2 pt-1 text-[10px] font-mono text-[#C5A059]">
                      <span className="px-2 py-0.5 rounded bg-[#0E1015] border border-[#282E38]">Role: {user.role || "Customer"}</span>
                      <span className="px-2 py-0.5 rounded bg-[#0E1015] border border-[#282E38]">Currency: LKR (Sri Lankan Rupee)</span>
                    </div>
                  </div>
                </div>

                {/* Profile Form */}
                <form onSubmit={handleSaveProfile} className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs uppercase text-[#8E95A5] mb-2 font-mono font-bold">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        placeholder="e.g. Alexander Vance"
                        className="w-full bg-[#14161C] border border-[#262A33] rounded-lg px-4 py-3 text-xs text-white font-mono focus:outline-none focus:border-[#C5A059] transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-xs uppercase text-[#8E95A5] mb-2 font-mono font-bold">
                        Contact Phone Number
                      </label>
                      <input
                        type="tel"
                        value={editPhone}
                        onChange={(e) => setEditPhone(e.target.value)}
                        placeholder="+94 77 123 4567"
                        className="w-full bg-[#14161C] border border-[#262A33] rounded-lg px-4 py-3 text-xs text-white font-mono focus:outline-none focus:border-[#C5A059] transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs uppercase text-[#8E95A5] mb-2 font-mono font-bold">
                      Registered Email Address (Locked)
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        disabled
                        value={user.email}
                        className="w-full bg-[#0D0F14] border border-[#20242D] rounded-lg px-4 py-3 text-xs text-[#8E95A5] font-mono cursor-not-allowed select-none"
                      />
                      <span className="absolute right-3 top-3 text-[10px] font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/20">
                        Primary ID
                      </span>
                    </div>
                    <p className="text-[11px] text-[#6E7585] font-mono mt-1">
                      To modify your registered authentication email, contact Krono Concierge Support.
                    </p>
                  </div>

                  {/* Communication Preferences */}
                  <div className="p-4 bg-[#14161C] border border-[#262A33] rounded-xl space-y-3">
                    <span className="text-[10px] font-mono uppercase tracking-widest text-[#C5A059] font-bold block">
                      COMMUNICATION PREFERENCES
                    </span>
                    <div className="space-y-2 text-xs font-mono">
                      <label className="flex items-center gap-3 cursor-pointer text-neutral-300 hover:text-white">
                        <input
                          type="checkbox"
                          defaultChecked
                          className="w-4 h-4 rounded text-[#C5A059] accent-[#C5A059] cursor-pointer"
                        />
                        <span>Send instant order confirmations and dispatch tracking emails</span>
                      </label>
                      <label className="flex items-center gap-3 cursor-pointer text-neutral-300 hover:text-white">
                        <input
                          type="checkbox"
                          defaultChecked
                          className="w-4 h-4 rounded text-[#C5A059] accent-[#C5A059] cursor-pointer"
                        />
                        <span>Send SMS notifications upon delivery agent dispatch</span>
                      </label>
                    </div>
                  </div>

                  <div className="pt-2 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => setActiveTab("overview")}
                      className="px-5 py-2.5 bg-transparent hover:bg-[#14161C] text-[#8E95A5] hover:text-white border border-[#262A33] rounded-lg text-xs font-mono transition-colors"
                    >
                      ← Back to Overview
                    </button>
                    <button
                      type="submit"
                      disabled={profileSaving}
                      className="px-7 py-3 bg-[#C5A059] hover:bg-[#D4AF37] text-black font-bold text-xs font-mono uppercase tracking-wider rounded-lg transition-all shadow-lg hover:shadow-[#C5A059]/20 disabled:opacity-50 cursor-pointer"
                    >
                      {profileSaving ? "Saving Changes..." : "Save Profile Changes"}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* 4. ADDRESSES TAB VIEW (Slide 6 - Manage delivery addresses) */}
            {activeTab === "addresses" && (
              <div className="bg-[#0E1015] border border-[#1E232B] rounded-xl p-6 sm:p-8 space-y-6 shadow-xl">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#181B22] pb-4">
                  <div>
                    <h2 className="text-xs font-mono uppercase font-bold text-[#C5A059] tracking-[0.2em]">
                      MANAGE DELIVERY ADDRESSES
                    </h2>
                    <p className="text-xs text-[#8E95A5] font-mono mt-1">
                      Manage your primary shipping address and secondary delivery destinations.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleOpenAddAddress}
                    className="px-4 py-2.5 bg-[#C5A059] hover:bg-[#D4AF37] text-black font-bold text-xs font-mono uppercase tracking-wider rounded-lg transition-all shadow-md flex items-center gap-2 cursor-pointer self-start sm:self-center"
                  >
                    <span>+</span>
                    <span>Add New Address</span>
                  </button>
                </div>

                {/* Toast Notification */}
                {addressToast && (
                  <div className="p-3.5 bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 rounded-lg text-xs font-mono flex items-center gap-2">
                    <IconCheck />
                    <span>{addressToast}</span>
                  </div>
                )}

                {/* Addresses Grid */}
                {savedAddresses.length === 0 ? (
                  <div className="text-center py-12 p-6 bg-[#14161C] border border-[#262A33] rounded-xl space-y-3">
                    <div className="w-12 h-12 rounded-full bg-[#181B22] border border-[#282E38] flex items-center justify-center text-[#C5A059] mx-auto"><IconPin /></div>
                    <h3 className="text-sm font-bold text-white uppercase font-mono">No Saved Addresses Found</h3>
                    <p className="text-xs text-[#8E95A5] font-mono max-w-sm mx-auto">
                      Add a shipping address to enable rapid 1-click checkout for all timepiece orders.
                    </p>
                    <button
                      type="button"
                      onClick={handleOpenAddAddress}
                      className="px-5 py-2.5 bg-[#C5A059] hover:bg-[#D4AF37] text-black font-bold text-xs font-mono uppercase tracking-wider rounded-lg transition-colors cursor-pointer mt-2"
                    >
                      + Add Your First Address
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {savedAddresses.map((addr) => {
                      return (
                        <div
                          key={addr.id}
                          className={`p-5 rounded-xl border transition-all space-y-3 relative flex flex-col justify-between ${
                            addr.isDefault
                              ? "bg-[#14161C] border-[#C5A059]/60 shadow-lg"
                              : "bg-[#111318] border-[#222730] hover:border-[#2E3440]"
                          }`}
                        >
                          <div>
                            {/* Card Top Badges */}
                            <div className="flex items-center justify-between gap-2 pb-2 border-b border-[#1E232B]">
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider ${
                                  addr.label === "Home"
                                    ? "bg-emerald-950/60 text-emerald-300 border border-emerald-500/30"
                                    : addr.label === "Work"
                                    ? "bg-blue-950/60 text-blue-300 border border-blue-500/30"
                                    : "bg-purple-950/60 text-purple-300 border border-purple-500/30"
                                }`}
                              >
                                {addr.label}
                              </span>

                              {addr.isDefault && (
                                <span className="text-[10px] font-mono font-bold text-[#C5A059] bg-[#C5A059]/10 border border-[#C5A059]/40 px-2 py-0.5 rounded-full flex items-center gap-1">
                                  <span>DEFAULT ADDRESS</span>
                                </span>
                              )}
                            </div>

                            {/* Recipient info & Address */}
                            <div className="pt-3 space-y-1">
                              <h3 className="text-sm font-bold text-white tracking-wide">
                                {addr.recipientName}
                              </h3>
                              {addr.phone && (
                                <div className="text-xs font-mono text-[#8E95A5]">
                                  Phone: {addr.phone}
                                </div>
                              )}
                              <p className="text-xs font-mono text-neutral-300 pt-1 leading-relaxed">
                                {addr.streetAddress}
                              </p>
                              <div className="text-xs font-mono text-[#8E95A5]">
                                {addr.city} {addr.postalCode ? `· ${addr.postalCode}` : ""}
                              </div>
                            </div>
                          </div>

                          {/* Card Action Buttons */}
                          <div className="pt-4 border-t border-[#1E232B] flex items-center justify-between gap-2">
                            <div>
                              {!addr.isDefault && (
                                <button
                                  type="button"
                                  onClick={() => handleSetDefaultAddress(addr.id)}
                                  className="text-[11px] font-mono text-[#C5A059] hover:underline cursor-pointer"
                                >
                                  Set as Default
                                </button>
                              )}
                            </div>

                            <div className="flex items-center gap-3">
                              <button
                                type="button"
                                onClick={() => handleOpenEditAddress(addr)}
                                className="text-xs font-mono text-[#8E95A5] hover:text-white transition-colors cursor-pointer flex items-center gap-1"
                              >
                                <IconPencil />
                                <span>Edit</span>
                              </button>

                              {deleteConfirmId === addr.id ? (
                                <div className="flex items-center gap-1">
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteAddress(addr.id)}
                                    className="text-xs font-mono text-red-400 font-bold hover:underline cursor-pointer"
                                  >
                                    Confirm?
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setDeleteConfirmId(null)}
                                    className="text-xs font-mono text-[#8E95A5] hover:text-white cursor-pointer ml-1"
                                  >
                                    ✕
                                  </button>
                                </div>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => setDeleteConfirmId(addr.id)}
                                  className="text-xs font-mono text-neutral-500 hover:text-red-400 transition-colors cursor-pointer flex items-center gap-1"
                                >
                                  <IconTrash />
                                  <span>Delete</span>
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
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

                {/* Password Reset Recovery Card (Slide 6 - Password reset) */}
                <div className="pt-6 border-t border-[#181B22] mt-6 max-w-md space-y-2">
                  <div className="text-xs font-mono font-bold text-white uppercase">
                    Forgot your current password?
                  </div>
                  <p className="text-xs text-[#8E95A5] font-mono leading-relaxed">
                    If you cannot recall your existing credentials, you can trigger a secure recovery reset with email verification.
                  </p>
                  <Link
                    href="/forgot-password"
                    className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-[#C5A059] hover:underline pt-1"
                  >
                    <span>Go to Password Recovery Tool</span>
                    <span>→</span>
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Add / Edit Delivery Address Modal (Slide 6 - Manage delivery addresses) */}
      {isAddressModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setIsAddressModalOpen(false)}
        >
          <div
            className="w-full max-w-lg bg-[#0E1015] border border-[#282E38] rounded-2xl p-6 sm:p-7 space-y-5 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center border-b border-[#1E232B] pb-3">
              <div>
                <h3 className="text-sm font-bold text-white uppercase font-mono tracking-wider">
                  {editingAddressId ? "Edit Delivery Address" : "Add New Delivery Address"}
                </h3>
                <span className="text-[11px] font-mono text-[#8E95A5]">
                  Address will be saved to your Krono profile for fast checkout.
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsAddressModalOpen(false)}
                className="text-[#8E95A5] hover:text-white text-lg leading-none p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveAddress} className="space-y-4">
              {/* Tag / Label selector */}
              <div>
                <label className="block text-xs uppercase text-[#8E95A5] mb-2 font-mono font-bold">
                  Address Type / Label
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {(["Home", "Work", "Billing", "Other"] as const).map((l) => (
                    <button
                      key={l}
                      type="button"
                      onClick={() => setAddrLabel(l)}
                      className={`py-2 text-xs font-mono font-bold rounded-lg border transition-all cursor-pointer ${
                        addrLabel === l
                          ? "bg-[#C5A059] text-black border-[#C5A059]"
                          : "bg-[#14161C] border-[#262A33] text-[#8E95A5] hover:text-white"
                      }`}
                    >
                      {l}
                    </button>
                  ))}
                </div>
              </div>

              {/* Recipient & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs uppercase text-[#8E95A5] mb-1 font-mono">
                    Recipient Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={addrRecipient}
                    onChange={(e) => setAddrRecipient(e.target.value)}
                    placeholder="e.g. Alexander Vance"
                    className="w-full bg-[#14161C] border border-[#262A33] rounded-lg px-3.5 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-[#C5A059]"
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase text-[#8E95A5] mb-1 font-mono">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    required
                    value={addrPhone}
                    onChange={(e) => setAddrPhone(e.target.value)}
                    placeholder="+94 77 123 4567"
                    className="w-full bg-[#14161C] border border-[#262A33] rounded-lg px-3.5 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-[#C5A059]"
                  />
                </div>
              </div>

              {/* Street Address */}
              <div>
                <label className="block text-xs uppercase text-[#8E95A5] mb-1 font-mono">
                  Street Address / Apartment / Suite *
                </label>
                <textarea
                  required
                  rows={2}
                  value={addrStreet}
                  onChange={(e) => setAddrStreet(e.target.value)}
                  placeholder="e.g. Apt 14B, 42 Galle Road, Kollupitiya"
                  className="w-full bg-[#14161C] border border-[#262A33] rounded-lg px-3.5 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-[#C5A059]"
                />
              </div>

              {/* City & Postal Code */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs uppercase text-[#8E95A5] mb-1 font-mono">
                    City / District *
                  </label>
                  <input
                    type="text"
                    required
                    value={addrCity}
                    onChange={(e) => setAddrCity(e.target.value)}
                    placeholder="e.g. Colombo"
                    className="w-full bg-[#14161C] border border-[#262A33] rounded-lg px-3.5 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-[#C5A059]"
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase text-[#8E95A5] mb-1 font-mono">
                    Postal / ZIP Code
                  </label>
                  <input
                    type="text"
                    value={addrPostal}
                    onChange={(e) => setAddrPostal(e.target.value)}
                    placeholder="e.g. 00300"
                    className="w-full bg-[#14161C] border border-[#262A33] rounded-lg px-3.5 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-[#C5A059]"
                  />
                </div>
              </div>

              {/* Default toggle */}
              <label className="flex items-center gap-3 cursor-pointer pt-1 text-xs font-mono text-neutral-300">
                <input
                  type="checkbox"
                  checked={addrIsDefault}
                  onChange={(e) => setAddrIsDefault(e.target.checked)}
                  className="w-4 h-4 rounded text-[#C5A059] accent-[#C5A059] cursor-pointer"
                />
                <span>Set as primary default delivery address for checkout</span>
              </label>

              {/* Modal Buttons */}
              <div className="flex justify-end gap-3 pt-3 border-t border-[#1E232B]">
                <button
                  type="button"
                  onClick={() => setIsAddressModalOpen(false)}
                  className="px-4 py-2 border border-[#262A33] rounded-lg text-xs font-mono text-[#8E95A5] hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-[#C5A059] hover:bg-[#D4AF37] text-black font-bold text-xs font-mono uppercase tracking-wider rounded-lg transition-colors cursor-pointer shadow-md"
                >
                  Save Address
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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
                  Order Details #{selectedOrderDetails.order_number || selectedOrderDetails.id}
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

            {selectedOrderDetails.refund_status === "requested" && (
              <div className="p-3 bg-orange-950/40 border border-orange-800/40 rounded-lg text-xs font-mono text-orange-300">
                Refund request under review. Reason: {selectedOrderDetails.refund_reason || "Requested by customer"}
              </div>
            )}

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

            <div className="pt-3 border-t border-[#1E232B] flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const ord = selectedOrderDetails;
                    setSelectedOrderDetails(null);
                    handleOpenTracking(ord);
                  }}
                  className="px-3.5 py-1.5 bg-[#C5A059] hover:bg-[#D4AF37] text-black font-bold rounded-lg text-xs font-mono transition-colors flex items-center gap-1.5"
                >
                  <IconTruck /> <span>Track Shipment</span>
                </button>
                {selectedOrderDetails.refund_status !== "requested" &&
                  selectedOrderDetails.refund_status !== "refunded" && (
                    <button
                      type="button"
                      onClick={() => {
                        const ord = selectedOrderDetails;
                        setSelectedOrderDetails(null);
                        handleOpenRefund(ord);
                      }}
                      className="px-3 py-1.5 bg-transparent hover:bg-red-950/20 text-white/60 hover:text-red-300 border border-[#2E3440] hover:border-red-900/40 rounded-lg text-xs font-mono transition-colors"
                    >
                      Request Refund
                    </button>
                  )}
              </div>
              <button
                type="button"
                onClick={() => setSelectedOrderDetails(null)}
                className="px-4 py-1.5 bg-[#1E232B] hover:bg-[#282F3B] text-white/80 rounded-lg text-xs font-mono transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Live Order Tracking Modal */}
      {trackingOrder && (
        <div
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
          onClick={() => setTrackingOrder(null)}
        >
          <div
            className="w-full max-w-xl bg-[#0E1015] border border-[#262B36] rounded-2xl p-6 sm:p-7 space-y-6 shadow-2xl my-8"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex justify-between items-start border-b border-[#1E232B] pb-4">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#C5A059] font-bold">
                    LIVE ORDER TRACKING
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#1C2028] text-[#C5A059] border border-[#2E3440] uppercase">
                    {trackingOrder.order_status || trackingOrder.status || "Processing"}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-white font-mono mt-1">
                  Order #{trackingOrder.order_number || trackingOrder.id}
                </h3>
                <div className="text-xs text-[#8E95A5] font-mono mt-0.5">
                  Placed on {trackingOrder.created_at ? new Date(trackingOrder.created_at).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }) : "Recent"}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setTrackingOrder(null)}
                className="text-[#8E95A5] hover:text-white text-xl p-1 leading-none"
              >
                ✕
              </button>
            </div>

            {/* Refund Alert Banner if applicable */}
            {trackingOrder.refund_status === "requested" && (
              <div className="p-3.5 bg-orange-950/40 border border-orange-800/50 rounded-xl text-xs font-mono text-orange-300 flex items-start gap-2.5">
                <IconRefresh />
                <div>
                  <div className="font-bold text-orange-200 uppercase tracking-wider text-[11px]">
                    Return / Refund Request Under Review
                  </div>
                  <div className="mt-0.5 text-orange-300/90 text-[11.5px] leading-relaxed">
                    You have requested a refund for this order. Our concierge team is processing the courier pickup details.
                  </div>
                </div>
              </div>
            )}

            {/* Courier & Shipping Meta Card */}
            <div className="bg-[#14161C] border border-[#222732] rounded-xl p-4.5 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
              <div>
                <div className="text-[10px] uppercase text-[#717A8C] font-bold tracking-wider">
                  COURIER SERVICE
                </div>
                <div className="text-white font-bold mt-1">
                  {trackingOrder.courier_name || "Krono Express Insured Courier"}
                </div>
                <div className="text-[11px] text-[#C5A059] mt-0.5 font-bold">
                  Track Ref: {trackingOrder.tracking_number || `KRN-LK-${(trackingOrder.order_number || trackingOrder.id).replace(/\D/g, "") || "901675"}`}
                </div>
              </div>

              <div>
                <div className="text-[10px] uppercase text-[#717A8C] font-bold tracking-wider">
                  ESTIMATED DELIVERY
                </div>
                <div className="text-white font-bold mt-1">
                  {(() => {
                    const d = trackingOrder.created_at ? new Date(trackingOrder.created_at) : new Date();
                    d.setDate(d.getDate() + 3);
                    return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
                  })()}
                </div>
                <div className="text-[11px] text-[#8E95A5] mt-0.5">
                  Priority Doorstep Courier
                </div>
              </div>

              <div className="sm:col-span-2 pt-2 border-t border-[#1C2028]">
                <div className="text-[10px] uppercase text-[#717A8C] font-bold tracking-wider">
                  DESTINATION ADDRESS
                </div>
                <div className="text-white/90 mt-1 leading-relaxed">
                  {trackingOrder.delivery_address ||
                    trackingOrder.shipping_address ||
                    user?.address ||
                    "Address on client record, Sri Lanka"}
                </div>
              </div>
            </div>

            {/* Step-by-Step Delivery Timeline */}
            <div className="space-y-4 pt-1">
              <div className="text-[11px] font-mono uppercase tracking-[0.15em] text-[#C5A059] font-bold">
                SHIPMENT PROGRESS
              </div>

              <div className="space-y-0 relative pl-6 before:content-[''] before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-[#202530]">
                {[
                  {
                    step: 1,
                    title: "Order confirmed",
                    desc: "Order has been verified, authenticated, and registered in the system.",
                    time: trackingOrder.created_at ? new Date(trackingOrder.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "08:08 AM",
                  },
                  {
                    step: 2,
                    title: "Processing",
                    desc: "Watch undergoes certified mechanical timing inspection and is placed in luxury presentation box.",
                    time: "Completed",
                  },
                  {
                    step: 3,
                    title: "Shipped",
                    desc: "Dispatched from Central Hub via insured armored courier partner with security seal.",
                    time: (trackingOrder.status || "").toLowerCase() === "dispatched" || (trackingOrder.status || "").toLowerCase() === "completed" || (trackingOrder.status || "").toLowerCase() === "delivered" ? "In Transit" : "Scheduled",
                  },
                  {
                    step: 4,
                    title: "Out for delivery",
                    desc: "Assigned to dedicated delivery agent for direct doorstep handover.",
                    time: (trackingOrder.status || "").toLowerCase() === "completed" || (trackingOrder.status || "").toLowerCase() === "delivered" ? "Completed" : "Next",
                  },
                  {
                    step: 5,
                    title: "Delivered",
                    desc: "Package delivered to customer with physical signature verification.",
                    time: (trackingOrder.status || "").toLowerCase() === "completed" || (trackingOrder.status || "").toLowerCase() === "delivered" ? "Delivered" : "Pending Handover",
                  },
                ].map((s) => {
                  const statusStr = (trackingOrder.order_status || trackingOrder.status || "").toLowerCase();
                  let currentStep = 2;
                  if (statusStr === "pending" || statusStr === "pending_payment") currentStep = 1;
                  else if (statusStr === "processing" || statusStr === "authenticated" || statusStr === "paid") currentStep = 2;
                  else if (statusStr === "dispatched" || statusStr === "shipped") currentStep = 3;
                  else if (statusStr === "completed" || statusStr === "delivered") currentStep = 5;

                  const isDone = s.step < currentStep || (currentStep === 5 && s.step === 5);
                  const isCurrent = s.step === currentStep && currentStep !== 5;

                  return (
                    <div key={s.step} className="relative pb-6 last:pb-1">
                      {/* Circle indicator */}
                      <div
                        className={`absolute -left-6 top-1 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold border transition-all ${
                          isDone
                            ? "bg-[#10B981] border-[#10B981] text-black"
                            : isCurrent
                            ? "bg-[#C5A059] border-[#C5A059] text-black animate-pulse shadow-[0_0_12px_rgba(197,160,89,0.5)]"
                            : "bg-[#14161C] border-[#2A303C] text-[#6E7585]"
                        }`}
                      >
                        {isDone ? <IconCheck /> : s.step}
                      </div>

                      <div className="font-mono">
                        <div className="flex items-center justify-between">
                          <span
                            className={`text-xs font-bold ${
                              isDone ? "text-white" : isCurrent ? "text-[#C5A059]" : "text-[#717A8C]"
                            }`}
                          >
                            {s.title}
                          </span>
                          <span className="text-[10px] text-[#717A8C]">{s.time}</span>
                        </div>
                        <p className="text-[11px] text-[#8E95A5] mt-1 leading-relaxed">
                          {s.desc}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Parcel Watch Summary */}
            <div className="border-t border-[#1E232B] pt-4">
              <div className="text-[10px] font-mono uppercase tracking-wider text-[#8E95A5] mb-2 font-bold">
                PARCEL CONTENTS ({trackingOrder.items?.length || 1} ITEM)
              </div>
              <div className="space-y-2">
                {trackingOrder.items?.map((it, i) => (
                  <div key={i} className="flex items-center justify-between text-xs font-mono bg-[#14161C] p-2.5 rounded-lg border border-[#202530]">
                    <div className="flex items-center gap-2.5 truncate">
                      <div className="w-8 h-8 rounded bg-[#0A0B0E] border border-[#202530] flex items-center justify-center shrink-0 text-[#C5A059]"><IconPackage /></div>
                      <span className="text-white font-medium truncate">{it.name || it.product_name || "Watch"}</span>
                    </div>
                    <span className="text-[#C5A059] font-bold shrink-0 ml-2">Qty: {it.quantity}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Bar */}
            <div className="pt-2 border-t border-[#1E232B] flex items-center justify-between gap-3 flex-wrap">
              {trackingOrder.refund_status !== "requested" && trackingOrder.refund_status !== "refunded" ? (
                <button
                  type="button"
                  onClick={() => {
                    const ord = trackingOrder;
                    setTrackingOrder(null);
                    handleOpenRefund(ord);
                  }}
                  className="px-3.5 py-2 bg-transparent hover:bg-red-950/20 text-white/60 hover:text-red-300 border border-[#2E3440] hover:border-red-900/40 rounded-lg text-xs font-mono transition-colors cursor-pointer"
                >
                  Request Refund
                </button>
              ) : (
                <span className="text-xs font-mono text-orange-400 italic">
                  Refund Request in Progress
                </span>
              )}

              <div className="flex items-center gap-2 ml-auto">
                <Link
                  href={`/orders/track?orderId=${encodeURIComponent(trackingOrder.id)}`}
                  className="px-3.5 py-2 bg-[#C5A059] hover:bg-[#D4AF37] text-black rounded-lg text-xs font-mono font-bold transition-colors cursor-pointer"
                >
                  Full Tracking Page →
                </Link>
                <button
                  type="button"
                  onClick={() => setTrackingOrder(null)}
                  className="px-4 py-2 bg-[#1E232B] hover:bg-[#282F3B] text-white rounded-lg text-xs font-mono font-bold transition-colors cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Return & Refund Modal (With Mandatory Policy Acceptance) */}
      {refundOrder && (
        <div
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
          onClick={() => {
            if (!refundSubmitting) setRefundOrder(null);
          }}
        >
          <div
            className="w-full max-w-xl bg-[#0E1015] border border-[#282E38] rounded-2xl p-6 sm:p-7 space-y-5 shadow-2xl my-8"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex justify-between items-start border-b border-[#1E232B] pb-3.5">
              <div>
                <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#C5A059] font-bold">
                  {refundStep === "policy"
                    ? "RETURN & REFUND POLICY"
                    : refundStep === "form"
                    ? "SUBMIT REFUND REQUEST"
                    : "CONFIRMATION"}
                </div>
                <h3 className="text-lg font-bold text-white font-mono mt-0.5">
                  Order #{refundOrder.order_number || refundOrder.id}
                </h3>
              </div>
              <button
                type="button"
                disabled={refundSubmitting}
                onClick={() => setRefundOrder(null)}
                className="text-[#8E95A5] hover:text-white text-xl p-1 leading-none disabled:opacity-50"
              >
                ✕
              </button>
            </div>

            {/* STEP 1: REFUND POLICY */}
            {refundStep === "policy" && (
              <div className="space-y-4 font-mono">
                <div className="p-3 bg-[#14161C] border border-[#222732] rounded-xl text-xs text-[#8E95A5] leading-relaxed">
                  Please review the Krono Watches return guidelines before proceeding. All returns must adhere to our certified inspection protocol.
                </div>

                <div className="space-y-3 max-h-72 overflow-y-auto pr-1 text-xs">
                  <div className="p-3.5 bg-[#12141A] border border-[#1E232B] rounded-xl space-y-1">
                    <div className="font-bold text-white flex items-center gap-2">
                      <span className="text-[#C5A059]">1.</span> 14-Day Return Window
                    </div>
                    <p className="text-[#8E95A5] text-[11.5px] leading-relaxed">
                      You may initiate a return or exchange within 14 calendar days from the date of package delivery.
                    </p>
                  </div>

                  <div className="p-3.5 bg-[#12141A] border border-[#1E232B] rounded-xl space-y-1">
                    <div className="font-bold text-white flex items-center gap-2">
                      <span className="text-[#C5A059]">2.</span> Watch Condition Requirements
                    </div>
                    <p className="text-[#8E95A5] text-[11.5px] leading-relaxed">
                      The watch must be unworn, undamaged, and with all protective factory plastic seals, stickers, and tags intact. Bracelets must not be altered or sized.
                    </p>
                  </div>

                  <div className="p-3.5 bg-[#12141A] border border-[#1E232B] rounded-xl space-y-1">
                    <div className="font-bold text-white flex items-center gap-2">
                      <span className="text-[#C5A059]">3.</span> Original Presentation Box &amp; Papers
                    </div>
                    <p className="text-[#8E95A5] text-[11.5px] leading-relaxed">
                      All accompanying items including the presentation box, certificate of authenticity, manual, and international warranty card must be returned in complete condition.
                    </p>
                  </div>

                  <div className="p-3.5 bg-[#12141A] border border-[#1E232B] rounded-xl space-y-1">
                    <div className="font-bold text-white flex items-center gap-2">
                      <span className="text-[#C5A059]">4.</span> Verification &amp; Technical Inspection
                    </div>
                    <p className="text-[#8E95A5] text-[11.5px] leading-relaxed">
                      Upon arrival at our inspection facility, a certified watchmaker will perform a 48-hour mechanical, timing, and cosmetic verification before the refund is authorized.
                    </p>
                  </div>

                  <div className="p-3.5 bg-[#12141A] border border-[#1E232B] rounded-xl space-y-1">
                    <div className="font-bold text-white flex items-center gap-2">
                      <span className="text-[#C5A059]">5.</span> Refund Settlement &amp; Processing
                    </div>
                    <p className="text-[#8E95A5] text-[11.5px] leading-relaxed">
                      Approved refunds are credited directly to your original payment method (PayHere online credit) or direct bank transfer within 3 to 5 business days after inspection approval.
                    </p>
                  </div>
                </div>

                {/* Mandatory Policy Agreement Checkbox */}
                <div className="p-3.5 bg-[#14161C] border border-[#2E3544] rounded-xl">
                  <label className="flex items-start gap-3 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={policyAgreed}
                      onChange={(e) => setPolicyAgreed(e.target.checked)}
                      className="mt-0.5 w-4 h-4 accent-[#C5A059] cursor-pointer shrink-0 rounded"
                    />
                    <span className="text-xs text-white leading-relaxed font-bold">
                      I have read, understood, and accept the Krono Watches Return &amp; Refund Policy.
                    </span>
                  </label>
                </div>

                {/* Footer Buttons */}
                <div className="flex items-center justify-between pt-2">
                  <button
                    type="button"
                    onClick={() => setRefundOrder(null)}
                    className="px-4 py-2 border border-[#262A33] rounded-lg text-xs text-[#8E95A5] hover:text-white"
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    disabled={!policyAgreed}
                    onClick={() => setRefundStep("form")}
                    className={`px-5 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                      policyAgreed
                        ? "bg-[#C5A059] hover:bg-[#D4AF37] text-black cursor-pointer shadow-md"
                        : "bg-[#202530] text-[#6E7585] cursor-not-allowed"
                    }`}
                  >
                    Continue to Refund Form →
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2: REFUND REQUEST FORM */}
            {refundStep === "form" && (
              <form onSubmit={handleSubmitRefund} className="space-y-4 font-mono text-xs">
                {refundError && (
                  <div className="p-3 rounded-lg bg-red-950/40 border border-red-800/50 text-red-300 text-xs">
                    {refundError}
                  </div>
                )}

                <div className="p-3 bg-[#14161C] border border-[#222732] rounded-xl flex items-center justify-between">
                  <span className="text-[#8E95A5]">Total Refundable Amount:</span>
                  <span className="text-sm font-bold text-[#C5A059]">
                    {formatCurrency(refundOrder.total_amount)}
                  </span>
                </div>

                <div>
                  <label className="block uppercase text-[#8E95A5] mb-1 font-bold text-[11px]">
                    Reason for Return / Refund <span className="text-red-400">*</span>
                  </label>
                  <select
                    value={refundReason}
                    onChange={(e) => setRefundReason(e.target.value)}
                    className="w-full bg-[#14161C] border border-[#262A33] rounded-lg px-3 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-[#C5A059]"
                  >
                    <option value="Defective or mechanical issue upon arrival">
                      Defective or mechanical issue upon arrival
                    </option>
                    <option value="Damaged presentation box or shipping transit damage">
                      Damaged presentation box or shipping transit damage
                    </option>
                    <option value="Incorrect watch model or dial variation received">
                      Incorrect watch model or dial variation received
                    </option>
                    <option value="Size or wrist fit unsuitable">
                      Size or wrist fit unsuitable
                    </option>
                    <option value="Changed mind / No longer required">
                      Changed mind / No longer required
                    </option>
                    <option value="Other reason">Other reason</option>
                  </select>
                </div>

                <div>
                  <label className="block uppercase text-[#8E95A5] mb-1 font-bold text-[11px]">
                    Details &amp; Explanation <span className="text-red-400">*</span>
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={refundNotes}
                    onChange={(e) => setRefundNotes(e.target.value)}
                    placeholder="Please explain the issue or condition of the watch in detail..."
                    className="w-full bg-[#14161C] border border-[#262A33] rounded-lg px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-[#C5A059]"
                  />
                </div>

                <div>
                  <label className="block uppercase text-[#8E95A5] mb-1 font-bold text-[11px]">
                    Preferred Refund Method
                  </label>
                  <select
                    value={refundMethod}
                    onChange={(e) => setRefundMethod(e.target.value)}
                    className="w-full bg-[#14161C] border border-[#262A33] rounded-lg px-3 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-[#C5A059]"
                  >
                    <option value="original_payment">Original Payment Method (Card via PayHere)</option>
                    <option value="bank_transfer">Direct Bank Transfer (Sri Lanka)</option>
                  </select>
                </div>

                {refundMethod === "bank_transfer" && (
                  <div className="p-3 bg-[#12141A] border border-[#222732] rounded-xl space-y-3">
                    <div className="text-[10px] font-bold text-[#C5A059] uppercase tracking-wider">
                      Sri Lanka Bank Details for Transfer
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] text-[#8E95A5] uppercase mb-1">
                          Bank Name
                        </label>
                        <input
                          type="text"
                          required
                          value={refundBankName}
                          onChange={(e) => setRefundBankName(e.target.value)}
                          placeholder="e.g. Commercial Bank of Ceylon"
                          className="w-full bg-[#14161C] border border-[#262A33] rounded-lg px-2.5 py-1.5 text-xs text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-[#8E95A5] uppercase mb-1">
                          Branch
                        </label>
                        <input
                          type="text"
                          required
                          value={refundBranch}
                          onChange={(e) => setRefundBranch(e.target.value)}
                          placeholder="e.g. Colombo 03"
                          className="w-full bg-[#14161C] border border-[#262A33] rounded-lg px-2.5 py-1.5 text-xs text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-[#8E95A5] uppercase mb-1">
                          Account Number
                        </label>
                        <input
                          type="text"
                          required
                          value={refundAccountNum}
                          onChange={(e) => setRefundAccountNum(e.target.value)}
                          placeholder="8001234567"
                          className="w-full bg-[#14161C] border border-[#262A33] rounded-lg px-2.5 py-1.5 text-xs text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-[#8E95A5] uppercase mb-1">
                          Account Holder Name
                        </label>
                        <input
                          type="text"
                          required
                          value={refundHolderName}
                          onChange={(e) => setRefundHolderName(e.target.value)}
                          placeholder="Full Name as on Account"
                          className="w-full bg-[#14161C] border border-[#262A33] rounded-lg px-2.5 py-1.5 text-xs text-white"
                        />
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between pt-2">
                  <button
                    type="button"
                    disabled={refundSubmitting}
                    onClick={() => setRefundStep("policy")}
                    className="px-4 py-2 border border-[#262A33] rounded-lg text-xs text-[#8E95A5] hover:text-white"
                  >
                    ← Back to Policy
                  </button>

                  <button
                    type="submit"
                    disabled={refundSubmitting}
                    className="px-5 py-2 bg-[#C5A059] hover:bg-[#D4AF37] text-black font-bold text-xs uppercase tracking-wider rounded-lg shadow-md transition-all flex items-center gap-2"
                  >
                    {refundSubmitting ? (
                      <>
                        <span className="w-3 h-3 rounded-full border-2 border-black border-t-transparent animate-spin inline-block" /> Submitting...
                      </>
                    ) : (
                      "Submit Refund Request"
                    )}
                  </button>
                </div>
              </form>
            )}

            {/* STEP 3: SUCCESS CONFIRMATION */}
            {refundStep === "success" && (
              <div className="text-center py-5 space-y-4 font-mono">
                <div className="w-14 h-14 rounded-full bg-emerald-950/60 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto shadow-lg"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg></div>

                <div>
                  <h4 className="text-base font-bold text-white">Refund Request Received</h4>
                  <p className="text-xs text-[#8E95A5] mt-1.5 leading-relaxed max-w-md mx-auto">
                    Your request for Order #{refundOrder.order_number || refundOrder.id} has been submitted for review.
                  </p>
                </div>

                <div className="p-4 bg-[#14161C] border border-[#202530] rounded-xl text-left text-xs space-y-2 text-[#8E95A5]">
                  <div className="text-white font-bold">What happens next?</div>
                  <div className="leading-relaxed">
                    1. Our concierge will review your submission within 24 business hours.
                  </div>
                  <div className="leading-relaxed">
                    2. We will contact you at <span className="text-[#C5A059] font-bold">{user.email || refundOrder.customer_email}</span> to arrange complimentary insured courier collection of the watch.
                  </div>
                  <div className="leading-relaxed">
                    3. Once received and inspected, your refund of <span className="text-white font-bold">{formatCurrency(refundOrder.total_amount)}</span> will be processed.
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setRefundOrder(null)}
                  className="px-6 py-2.5 bg-[#C5A059] hover:bg-[#D4AF37] text-black font-bold text-xs uppercase tracking-wider rounded-lg shadow-md"
                >
                  Done &amp; Return to Profile
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
