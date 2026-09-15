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
  const { user, isAuthenticated, isLoading, logout, updateProfile, changePassword, mergedGuestCount } = useAuth();
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

  // Active Tab
  const [activeTab, setActiveTab] = useState<"details" | "security" | "cart">("details");

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

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 mb-8 border-b border-white/10 pb-3">
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

        {/* Tab 3: Cart Association */}
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
