"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/AuthContext";
import { useCart } from "@/lib/CartContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function ProfilePage() {
  const router = useRouter();
  const {
    user,
    isAuthenticated,
    isLoading,
    logout,
    updateProfile,
    changePassword,
    mergedGuestCount,
    session,
    activeSessions,
    loadActiveSessions,
    refreshSession,
    revokeSession,
    revokeOtherSessions,
    expiryWarningMinutes,
    dismissExpiryWarning,
  } = useAuth();
  const { cart, grandTotal } = useCart();

  // Profile Edit Form state (Milestone 4 - contact info, phone, multiple addresses)
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [secondaryAddress, setSecondaryAddress] = useState("");
  const [profileMsg, setProfileMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [profileSaving, setProfileSaving] = useState(false);

  // Security Form state (Milestone 4 - identity re-verification)
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [securityMsg, setSecurityMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [securitySaving, setSecuritySaving] = useState(false);

  // Session Action State
  const [sessionMsg, setSessionMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [sessionActionLoading, setSessionActionLoading] = useState(false);

  // Active Tab
  const [activeTab, setActiveTab] = useState<"details" | "security" | "sessions" | "cart">("details");

  // Load active sessions when sessions tab is selected
  useEffect(() => {
    if (activeTab === "sessions") {
      loadActiveSessions();
    }
  }, [activeTab, loadActiveSessions]);

  // Route Protection (Milestone 3)
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login?returnUrl=/profile&unauthorized=true");
    }
  }, [isLoading, isAuthenticated, router]);

  // Populate form fields from user object
  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setPhone(user.phone || "");
      setAddress(user.address || "");
      setSecondaryAddress(user.secondary_address || "");
    }
  }, [user]);

  if (isLoading || !isAuthenticated || !user) {
    return (
      <div className="min-h-screen flex flex-col bg-[#050505] text-white">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center font-mono text-sm text-[#C5A059] animate-pulse">
            Verifying Krono Client Session...
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileMsg(null);
    setProfileSaving(true);
    try {
      const res = await updateProfile({
        name,
        phone,
        address,
        secondary_address: secondaryAddress,
      });
      if (res.success) {
        setProfileMsg({ type: "success", text: "Client details and addresses saved successfully." });
      } else {
        setProfileMsg({ type: "error", text: res.message || "Failed to update details." });
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

  return (
    <div className="min-h-screen flex flex-col bg-[#050505] text-white">
      <Navbar />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-10">
        {/* Top Header Banner (Milestone 4 - Profile View) */}
        <div className="bg-[#0D0D0D] border border-white/10 rounded-2xl p-6 sm:p-8 mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#C5A059] to-[#8C6D32] flex items-center justify-center text-black font-bold text-2xl font-serif shadow-lg shadow-[#C5A059]/20">
              {user.name ? user.name.charAt(0).toUpperCase() : "U"}
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-xl sm:text-2xl font-serif text-white font-semibold">
                  {user.name}
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono tracking-wider uppercase bg-emerald-950/80 border border-emerald-500/30 text-emerald-400">
                  Status: {user.status || "Active Member"}
                </span>
              </div>
              <p className="text-xs text-white/50 font-mono mt-1">{user.email}</p>
              <div className="flex items-center gap-4 text-[11px] text-white/40 font-mono mt-1">
                <span>
                  Member Since:{" "}
                  {user.created_at
                    ? new Date(user.created_at).toLocaleDateString("en-US", {
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      })
                    : "Geneva Vault Member"}
                </span>
                <span>•</span>
                <span className="text-[#00e5ff] font-semibold">
                  cart_state: {mergedGuestCount > 0 ? `${mergedGuestCount} guest items merged` : `${cart.length} active vault items`}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/catalog"
              className="px-4 py-2 border border-white/15 hover:border-white/40 text-xs font-mono tracking-wider rounded-lg transition-colors"
            >
              Browse Catalog
            </Link>
            <button
              onClick={logout}
              className="px-4 py-2 bg-red-950/40 hover:bg-red-900/50 border border-red-500/30 text-red-300 text-xs font-mono tracking-wider rounded-lg transition-colors"
            >
              Secure Logout
            </button>
          </div>
        </div>

        {/* Session Expiration Warning Banner */}
        {expiryWarningMinutes !== null && (
          <div className="mb-6 p-4 bg-amber-950/40 border border-amber-500/40 rounded-xl flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="text-amber-400 font-mono text-base">⚠</span>
              <div>
                <div className="text-xs font-semibold text-amber-200 uppercase tracking-wider font-mono">
                  Session Expiring in {expiryWarningMinutes} minutes
                </div>
                <div className="text-[11px] text-amber-300/80">
                  Your encrypted Swiss vault session will expire soon. Extend now to maintain uninterrupted access.
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={async () => {
                  const ok = await refreshSession();
                  if (ok) setSessionMsg({ type: "success", text: "Session successfully extended." });
                }}
                className="px-4 py-2 bg-[#C5A059] hover:bg-[#b08d48] text-black font-semibold text-xs tracking-wider uppercase rounded-lg transition-all"
              >
                Extend Session
              </button>
              <button
                onClick={dismissExpiryWarning}
                className="px-3 py-2 text-white/50 hover:text-white text-xs font-mono"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex flex-wrap items-center gap-2 mb-8 border-b border-white/10 pb-3">
          <button
            onClick={() => setActiveTab("details")}
            className={`px-4 py-2 text-xs font-mono uppercase tracking-wider rounded-lg transition-all ${
              activeTab === "details"
                ? "bg-[#C5A059] text-black font-bold shadow-md shadow-[#C5A059]/20"
                : "text-white/60 hover:text-white hover:bg-white/5"
            }`}
          >
            Client Details & Addresses
          </button>
          <button
            onClick={() => setActiveTab("security")}
            className={`px-4 py-2 text-xs font-mono uppercase tracking-wider rounded-lg transition-all ${
              activeTab === "security"
                ? "bg-[#C5A059] text-black font-bold shadow-md shadow-[#C5A059]/20"
                : "text-white/60 hover:text-white hover:bg-white/5"
            }`}
          >
            Security & Credentials
          </button>
          <button
            onClick={() => setActiveTab("sessions")}
            className={`px-4 py-2 text-xs font-mono uppercase tracking-wider rounded-lg transition-all ${
              activeTab === "sessions"
                ? "bg-[#C5A059] text-black font-bold shadow-md shadow-[#C5A059]/20"
                : "text-white/60 hover:text-white hover:bg-white/5"
            }`}
          >
            Session & Cookie Management
          </button>
          <button
            onClick={() => setActiveTab("cart")}
            className={`px-4 py-2 text-xs font-mono uppercase tracking-wider rounded-lg transition-all ${
              activeTab === "cart"
                ? "bg-[#C5A059] text-black font-bold shadow-md shadow-[#C5A059]/20"
                : "text-white/60 hover:text-white hover:bg-white/5"
            }`}
          >
            Associated Vault Cart ({cart.length})
          </button>
        </div>

        {/* Tab 1: Edit Details Form & Milestone 4 Preview Window */}
        {activeTab === "details" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Form Column */}
            <div className="lg:col-span-7 bg-[#0D0D0D] border border-white/10 rounded-xl p-6 sm:p-8">
              <h2 className="text-lg font-serif text-white font-medium mb-1">
                Personal Information & Multiple Addresses
              </h2>
              <p className="text-xs text-white/50 mb-6">
                Functional forms for updating contact info, phone numbers, and multiple addresses.
              </p>

              {profileMsg && (
                <div
                  className={`mb-6 p-3.5 rounded-lg text-xs border ${
                    profileMsg.type === "success"
                      ? "bg-emerald-950/40 border-emerald-500/40 text-emerald-300"
                      : "bg-red-950/40 border-red-500/40 text-red-300"
                  }`}
                >
                  {profileMsg.text}
                </div>
              )}

              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div>
                  <label className="block text-xs uppercase tracking-wider text-white/70 mb-1.5 font-mono">
                    Client Full Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-2.5 bg-black/60 border border-white/15 rounded-lg text-sm text-white focus:outline-none focus:border-[#C5A059] transition-colors"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider text-white/70 mb-1.5 font-mono">
                    Email (Primary Account Key)
                  </label>
                  <input
                    type="email"
                    value={user.email}
                    disabled
                    className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-sm text-white/40 cursor-not-allowed font-mono"
                  />
                  <p className="text-[10px] text-white/30 mt-1 font-mono">
                    Verified immutable email address.
                  </p>
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider text-white/70 mb-1.5 font-mono">
                    Contact Phone Number
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+94 77 123 4567 / +41 22 700 0000"
                    className="w-full px-4 py-2.5 bg-black/60 border border-white/15 rounded-lg text-sm text-white focus:outline-none focus:border-[#C5A059] transition-colors"
                  />
                </div>

                {/* Multiple Addresses (Milestone 4 Requirement) */}
                <div>
                  <label className="block text-xs uppercase tracking-wider text-white/70 mb-1.5 font-mono">
                    Primary Delivery Address (Residence)
                  </label>
                  <textarea
                    rows={2}
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Penthouse Suite, 42 Marina Boulevard, Colombo 03, Sri Lanka"
                    className="w-full px-4 py-2.5 bg-black/60 border border-white/15 rounded-lg text-sm text-white focus:outline-none focus:border-[#C5A059] transition-colors resize-none"
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider text-white/70 mb-1.5 font-mono">
                    Secondary Address (Office / Alternate Vault Destination)
                  </label>
                  <textarea
                    rows={2}
                    value={secondaryAddress}
                    onChange={(e) => setSecondaryAddress(e.target.value)}
                    placeholder="Krono Private Vault, Quai du Mont-Blanc 19, 1201 Genève, Switzerland"
                    className="w-full px-4 py-2.5 bg-black/60 border border-white/15 rounded-lg text-sm text-white focus:outline-none focus:border-[#C5A059] transition-colors resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={profileSaving}
                  className="py-3 px-8 bg-[#00e5ff] hover:bg-[#00c4da] text-black font-bold text-xs tracking-widest uppercase rounded-lg transition-all shadow-lg hover:shadow-[#00e5ff]/20 disabled:opacity-50"
                >
                  {profileSaving ? "Saving..." : "Save Details"}
                </button>
              </form>
            </div>

            {/* Milestone 4 Right Window Mockup Display */}
            <div className="lg:col-span-5">
              <div className="bg-[#101725] border border-white/15 rounded-xl overflow-hidden shadow-2xl">
                {/* macOS style header */}
                <div className="px-4 py-3 bg-[#172033] border-b border-white/10 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-[#ff5f56] inline-block"></span>
                    <span className="w-3 h-3 rounded-full bg-[#ffbd2e] inline-block"></span>
                    <span className="w-3 h-3 rounded-full bg-[#27c93f] inline-block"></span>
                  </div>
                  <span className="text-[11px] font-mono text-white/60 tracking-wider">
                    User Profile & Settings View
                  </span>
                  <div className="w-8"></div>
                </div>

                {/* Window body */}
                <div className="p-6 space-y-5">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-full border-2 border-[#00e5ff] flex items-center justify-center text-[#00e5ff] font-serif font-bold text-xl">
                      {name ? name.charAt(0).toUpperCase() : "U"}
                    </div>
                    <div>
                      <div className="text-base font-semibold text-white">
                        {name || "Dev Student"}
                      </div>
                      <div className="text-xs text-[#00e5ff] font-mono">
                        Status: {user.status || "Active Member"}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3 font-mono text-xs">
                    <div className="bg-[#0b1019] border border-white/10 rounded-lg p-3 text-white/70">
                      email: <span className="text-[#00e5ff]">{user.email}</span>
                    </div>

                    <div className="bg-[#0b1019] border border-white/10 rounded-lg p-3 text-white/70 flex justify-between items-center">
                      <span>password: <span className="tracking-widest">••••••••••</span></span>
                      <button
                        onClick={() => setActiveTab("security")}
                        className="text-[10px] text-[#C5A059] hover:underline uppercase"
                      >
                        Change
                      </button>
                    </div>

                    <div className="bg-[#0b1019] border border-white/10 rounded-lg p-3 text-[#00e5ff]">
                      cart_state: {mergedGuestCount > 0 ? `${mergedGuestCount} guest items merged` : `${cart.length} active cart items`}
                    </div>

                    {phone && (
                      <div className="bg-[#0b1019] border border-white/10 rounded-lg p-3 text-white/70">
                        phone: <span className="text-white">{phone}</span>
                      </div>
                    )}

                    {address && (
                      <div className="bg-[#0b1019] border border-white/10 rounded-lg p-3 text-white/70 text-[11px]">
                        primary_address: <span className="text-white/90">{address}</span>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={handleUpdateProfile}
                    className="w-full py-2.5 bg-[#00e5ff] hover:bg-[#00c4da] text-black font-bold text-xs tracking-wider uppercase rounded-lg transition-all"
                  >
                    Save Details
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Security & Identity Re-verification */}
        {activeTab === "security" && (
          <div className="bg-[#0D0D0D] border border-white/10 rounded-xl p-6 sm:p-8 max-w-2xl">
            <h2 className="text-lg font-serif text-white font-medium mb-1">
              Security Workflow & Password Re-Verification
            </h2>
            <p className="text-xs text-white/50 mb-6">
              To change your access key, you must re-verify your current identity.
            </p>

            {securityMsg && (
              <div
                className={`mb-6 p-3.5 rounded-lg text-xs border ${
                  securityMsg.type === "success"
                    ? "bg-emerald-950/40 border-emerald-500/40 text-emerald-300"
                    : "bg-red-950/40 border-red-500/40 text-red-300"
                }`}
              >
                {securityMsg.text}
              </div>
            )}

            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className="block text-xs uppercase tracking-wider text-white/70 mb-1.5 font-mono">
                  Current Password (Identity Re-Verification)
                </label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-2.5 bg-black/60 border border-white/15 rounded-lg text-sm text-white focus:outline-none focus:border-[#C5A059] transition-colors"
                  required
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-white/70 mb-1.5 font-mono">
                  New Password
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-2.5 bg-black/60 border border-white/15 rounded-lg text-sm text-white focus:outline-none focus:border-[#C5A059] transition-colors"
                  required
                />
                <p className="text-[10px] text-white/40 mt-1 font-mono">
                  Min 8 chars, uppercase, lowercase, number & special symbol
                </p>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-white/70 mb-1.5 font-mono">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-2.5 bg-black/60 border border-white/15 rounded-lg text-sm text-white focus:outline-none focus:border-[#C5A059] transition-colors"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={securitySaving}
                className="py-2.5 px-6 bg-[#C5A059] hover:bg-[#b08d48] text-black font-semibold text-xs tracking-widest uppercase rounded-lg transition-all disabled:opacity-50"
              >
                {securitySaving ? "Updating Security Keys..." : "Change Password"}
              </button>
            </form>
          </div>
        )}

        {/* Tab 3: Session & Cookie Management */}
        {activeTab === "sessions" && (
          <div className="space-y-8 max-w-5xl">
            {/* Session Action Notification */}
            {sessionMsg && (
              <div
                className={`p-3.5 rounded-lg text-xs border ${
                  sessionMsg.type === "success"
                    ? "bg-emerald-950/40 border-emerald-500/40 text-emerald-300"
                    : "bg-red-950/40 border-red-500/40 text-red-300"
                }`}
              >
                {sessionMsg.text}
              </div>
            )}

            {/* Current Verified Session */}
            <div className="bg-[#0D0D0D] border border-white/10 rounded-xl p-6 sm:p-8">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-xs font-mono tracking-widest text-[#C5A059] uppercase">
                      Current Verified Vault Session
                    </span>
                  </div>
                  <h2 className="text-xl font-serif text-white font-medium">
                    Encrypted Session Dossier
                  </h2>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={async () => {
                      setSessionActionLoading(true);
                      setSessionMsg(null);
                      const ok = await refreshSession();
                      setSessionActionLoading(false);
                      if (ok) {
                        setSessionMsg({ type: "success", text: "Session successfully extended and re-verified." });
                        loadActiveSessions();
                      } else {
                        setSessionMsg({ type: "error", text: "Failed to extend session." });
                      }
                    }}
                    disabled={sessionActionLoading}
                    className="px-4 py-2 bg-[#C5A059] hover:bg-[#b08d48] text-black font-semibold text-xs tracking-wider uppercase rounded-lg transition-all disabled:opacity-50"
                  >
                    {sessionActionLoading ? "Synchronizing..." : "Refresh / Extend Session"}
                  </button>
                  <button
                    onClick={logout}
                    className="px-4 py-2 border border-red-500/30 bg-red-950/30 hover:bg-red-950/60 text-red-300 text-xs font-mono tracking-wider uppercase rounded-lg transition-all"
                  >
                    Terminate Session
                  </button>
                </div>
              </div>

              {/* Grid of Session Metrics */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
                <div className="bg-black/40 border border-white/5 rounded-lg p-4">
                  <span className="text-[10px] font-mono text-white/40 uppercase tracking-wider block mb-1">
                    Session Reference
                  </span>
                  <span className="text-xs font-mono text-white truncate block" title={session?.id}>
                    {session?.id || "ses_live_authenticated"}
                  </span>
                </div>

                <div className="bg-black/40 border border-white/5 rounded-lg p-4">
                  <span className="text-[10px] font-mono text-white/40 uppercase tracking-wider block mb-1">
                    Device & Environment
                  </span>
                  <span className="text-xs font-mono text-white block">
                    {session?.deviceLabel || "Chrome / Web Browser"}
                  </span>
                </div>

                <div className="bg-black/40 border border-white/5 rounded-lg p-4">
                  <span className="text-[10px] font-mono text-white/40 uppercase tracking-wider block mb-1">
                    Persistence Policy
                  </span>
                  <span className="text-xs font-mono text-[#C5A059] block font-semibold">
                    {session?.rememberMe ? "30 Days (Remember Me)" : "7 Days Standard"}
                  </span>
                </div>

                <div className="bg-black/40 border border-white/5 rounded-lg p-4">
                  <span className="text-[10px] font-mono text-white/40 uppercase tracking-wider block mb-1">
                    Scheduled Expiration
                  </span>
                  <span className="text-xs font-mono text-white/80 block">
                    {session?.expiresAt ? new Date(session.expiresAt).toLocaleDateString() : "Valid"}
                  </span>
                </div>
              </div>
            </div>

            {/* Cookie Management & Protection Shield */}
            <div className="bg-[#0D0D0D] border border-white/10 rounded-xl p-6 sm:p-8">
              <h3 className="text-base font-serif text-white font-medium mb-1">
                Cookie Architecture & Defense Matrix
              </h3>
              <p className="text-xs text-white/50 mb-6">
                All client credentials and session states are managed using strict HTTP-only and SameSite flags to repel XSS and CSRF attacks.
              </p>

              <div className="space-y-3 font-mono text-xs">
                <div className="p-4 bg-black/60 border border-white/10 rounded-lg flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[#C5A059] font-bold">krono_token</span>
                      <span className="px-2 py-0.5 bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-[10px] rounded uppercase">
                        HTTP-Only Shield
                      </span>
                      <span className="px-2 py-0.5 bg-white/5 text-white/60 text-[10px] rounded">
                        SameSite: Lax
                      </span>
                    </div>
                    <p className="text-[11px] text-white/50 mt-1 font-sans">
                      Cryptographically signed JWT bearer token. Inaccessible to JavaScript to neutralize cross-site scripting (XSS) attacks.
                    </p>
                  </div>
                  <div className="text-[10px] text-emerald-400 uppercase tracking-widest font-mono">
                    Protected by Server
                  </div>
                </div>

                <div className="p-4 bg-black/60 border border-white/10 rounded-lg flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[#C5A059] font-bold">krono_session</span>
                      <span className="px-2 py-0.5 bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-[10px] rounded uppercase">
                        HTTP-Only Shield
                      </span>
                      <span className="px-2 py-0.5 bg-white/5 text-white/60 text-[10px] rounded">
                        SameSite: Lax
                      </span>
                    </div>
                    <p className="text-[11px] text-white/50 mt-1 font-sans">
                      Opaque session UUID tracked in the backend session registry for immediate multi-device revocation capability.
                    </p>
                  </div>
                  <div className="text-[10px] text-emerald-400 uppercase tracking-widest font-mono">
                    Protected by Server
                  </div>
                </div>

                <div className="p-4 bg-black/60 border border-white/10 rounded-lg flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-white/80 font-bold">krono_client_session</span>
                      <span className="px-2 py-0.5 bg-blue-950/60 border border-blue-500/40 text-blue-300 text-[10px] rounded uppercase">
                        Client Synced
                      </span>
                      <span className="px-2 py-0.5 bg-white/5 text-white/60 text-[10px] rounded">
                        SameSite: Lax
                      </span>
                    </div>
                    <p className="text-[11px] text-white/50 mt-1 font-sans">
                      Non-sensitive user metadata cookie enabling instant Next.js SSR hydration and zero-flicker client rendering.
                    </p>
                  </div>
                  <div className="text-[10px] text-blue-400 uppercase tracking-widest font-mono">
                    Client Readable
                  </div>
                </div>
              </div>
            </div>

            {/* Active Sessions & Concurrent Devices */}
            <div className="bg-[#0D0D0D] border border-white/10 rounded-xl p-6 sm:p-8">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                  <h3 className="text-base font-serif text-white font-medium mb-1">
                    Concurrent Devices & Active Vault Sessions
                  </h3>
                  <p className="text-xs text-white/50">
                    Real-time monitoring of all authenticated terminals authorized for this client account.
                  </p>
                </div>
                {activeSessions.length > 1 && (
                  <button
                    onClick={async () => {
                      setSessionActionLoading(true);
                      const ok = await revokeOtherSessions();
                      setSessionActionLoading(false);
                      if (ok) {
                        setSessionMsg({ type: "success", text: "Terminated all other active sessions." });
                      }
                    }}
                    disabled={sessionActionLoading}
                    className="px-3.5 py-1.5 border border-red-500/40 bg-red-950/30 hover:bg-red-950/60 text-red-300 text-xs font-mono tracking-wider uppercase rounded-lg transition-all disabled:opacity-50"
                  >
                    Terminate Other Sessions
                  </button>
                )}
              </div>

              {activeSessions.length === 0 ? (
                <div className="p-4 bg-black/40 border border-white/5 rounded-lg flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    <div>
                      <div className="text-xs font-mono text-white">Current Browser Terminal</div>
                      <div className="text-[10px] font-mono text-white/40">Active Session • IP: Verified</div>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-widest">
                    Current Device
                  </span>
                </div>
              ) : (
                <div className="divide-y divide-white/10">
                  {activeSessions.map((s) => (
                    <div
                      key={s.id}
                      className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 font-mono text-xs"
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className={`w-2 h-2 rounded-full ${
                            s.isCurrent ? "bg-emerald-400 animate-pulse" : "bg-white/30"
                          }`}
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-white font-medium">{s.deviceLabel}</span>
                            {s.isCurrent && (
                              <span className="px-1.5 py-0.5 bg-[#C5A059]/20 text-[#C5A059] text-[9px] rounded uppercase font-bold">
                                Current
                              </span>
                            )}
                            {s.rememberMe && (
                              <span className="px-1.5 py-0.5 bg-white/10 text-white/60 text-[9px] rounded uppercase">
                                30D
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] text-white/40 mt-0.5">
                            IP: {s.ip} • Last Active: {new Date(s.lastActive).toLocaleTimeString()}
                          </div>
                        </div>
                      </div>

                      {!s.isCurrent && (
                        <button
                          onClick={async () => {
                            const ok = await revokeSession(s.id);
                            if (ok) {
                              setSessionMsg({ type: "success", text: "Device session revoked." });
                            }
                          }}
                          className="text-[10px] text-red-400 hover:text-red-300 uppercase tracking-wider hover:underline"
                        >
                          Revoke Access
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 4: Cart Association */}
        {activeTab === "cart" && (
          <div className="bg-[#0D0D0D] border border-white/10 rounded-xl p-6 sm:p-8">
            <h2 className="text-lg font-serif text-white font-medium mb-1">
              Associated Shopping Cart (Synced)
            </h2>
            <p className="text-xs text-white/50 mb-6">
              Guest items were automatically merged into your client session upon authentication.
            </p>

            {cart.length === 0 ? (
              <div className="text-center py-12 border border-dashed border-white/10 rounded-xl">
                <p className="text-xs text-white/40 font-mono">
                  Your vault cart is currently empty.
                </p>
                <Link
                  href="/catalog"
                  className="inline-block mt-4 px-4 py-2 bg-[#C5A059] text-black text-xs font-semibold rounded-lg tracking-wider uppercase"
                >
                  Explore Timepieces
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="divide-y divide-white/10">
                  {cart.map((item) => (
                    <div
                      key={item.product.id}
                      className="py-4 flex items-center justify-between gap-4"
                    >
                      <div>
                        <div className="text-sm font-medium text-white">
                          {item.product.name}
                        </div>
                        <div className="text-xs text-white/50 font-mono">
                          Qty: {item.quantity} × LKR {item.product.price.toLocaleString()}
                        </div>
                      </div>
                      <div className="text-sm font-mono text-[#C5A059] font-bold">
                        LKR {(item.product.price * item.quantity).toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                  <span className="text-xs text-white/60 font-mono uppercase">
                    Cart Total:
                  </span>
                  <span className="text-lg font-mono font-bold text-[#C5A059]">
                    LKR {grandTotal.toLocaleString()}
                  </span>
                </div>

                <div className="pt-2 flex justify-end">
                  <Link
                    href="/checkout"
                    className="px-6 py-2.5 bg-[#C5A059] hover:bg-[#b08d48] text-black font-semibold text-xs tracking-widest uppercase rounded-lg transition-all"
                  >
                    Proceed to Protected Checkout →
                  </Link>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
