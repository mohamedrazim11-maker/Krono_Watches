"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { apiResetPassword } from "@/lib/api";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function ForgotPasswordPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [step, setStep] = useState<"verify" | "reset" | "success">("verify");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [verifiedName, setVerifiedName] = useState<string>("");

  const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;

  const handleVerifyEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim()) {
      setError("Please enter your registered email address.");
      return;
    }

    setLoading(true);
    try {
      const res = await apiResetPassword({ email: email.trim() });
      if (res.success && res.exists) {
        setVerifiedName(res.name || "Customer");
        setStep("reset");
      } else {
        setError(res.message || "No account found with this email.");
      }
    } catch (err: any) {
      setError(err.message || "Failed to verify account.");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!newPassword) {
      setError("Please enter a new password.");
      return;
    }

    if (!PASSWORD_REGEX.test(newPassword)) {
      setError(
        "Password must be at least 8 characters and include uppercase, lowercase, a number, and a special character."
      );
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const res = await apiResetPassword({
        email: email.trim(),
        newPassword,
        confirmNewPassword,
      });

      if (res.success) {
        setSuccessMsg(res.message);
        setStep("success");
      } else {
        setError(res.message || "Failed to reset password.");
      }
    } catch (err: any) {
      setError(err.message || "An error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#050505] text-white">
      <Navbar />

      <main className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-md bg-[#0D0D0D] border border-white/10 rounded-xl p-8 shadow-2xl backdrop-blur-sm">
          {/* Header */}
          <div className="text-center mb-8">
            <span className="text-xs font-mono tracking-widest text-[#C5A059] uppercase">
              Security &amp; Recovery
            </span>
            <h1 className="text-2xl font-serif tracking-tight mt-2 text-white">
              Reset Your Password
            </h1>
            <p className="text-xs text-white/50 mt-1">
              Recover access to your Krono account, orders, and vault.
            </p>
          </div>

          {/* Feedback alerts */}
          {error && (
            <div className="mb-6 p-3.5 bg-red-950/40 border border-red-500/40 rounded-lg text-xs text-red-300">
              {error}
            </div>
          )}

          {step === "verify" && (
            <form onSubmit={handleVerifyEmail} className="space-y-4">
              <div>
                <label className="block text-xs uppercase tracking-wider text-white/70 mb-1.5 font-mono">
                  Registered Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="user@example.com"
                  className="w-full px-4 py-2.5 bg-black/60 border border-white/15 rounded-lg text-sm text-white focus:outline-none focus:border-[#C5A059] transition-colors"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-4 py-3 bg-[#C5A059] hover:bg-[#b08d48] text-black font-semibold text-xs tracking-widest uppercase rounded-lg transition-all shadow-lg hover:shadow-[#C5A059]/20 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Verifying Account..." : "Continue to Reset →"}
              </button>

              <div className="mt-6 pt-6 border-t border-white/10 text-center text-xs text-white/50">
                Remembered your password?{" "}
                <Link href="/login" className="text-[#C5A059] hover:underline font-medium">
                  Sign In
                </Link>
              </div>
            </form>
          )}

          {step === "reset" && (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div className="p-3 bg-[#161616] border border-[#262626] rounded-lg text-xs text-white/70">
                Identified client: <span className="text-[#C5A059] font-semibold">{verifiedName}</span> ({email})
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

              <div className="text-[11px] text-white/40 space-y-1">
                <div>Must be at least 8 characters</div>
                <div>Must include uppercase, lowercase, number &amp; symbol</div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-4 py-3 bg-[#C5A059] hover:bg-[#b08d48] text-black font-semibold text-xs tracking-widest uppercase rounded-lg transition-all shadow-lg hover:shadow-[#C5A059]/20 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Updating Credentials..." : "Confirm & Set New Password"}
              </button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => setStep("verify")}
                  className="text-xs text-white/50 hover:text-white underline font-mono"
                >
                  ← Back to Email Check
                </button>
              </div>
            </form>
          )}

          {step === "success" && (
            <div className="space-y-6 text-center">
              <div className="w-16 h-16 mx-auto rounded-full bg-emerald-950/60 border border-emerald-500/40 flex items-center justify-center text-emerald-400 text-2xl">
                ✓
              </div>
              <div className="space-y-2">
                <h2 className="text-lg font-bold text-white uppercase">Password Reset Complete</h2>
                <p className="text-xs text-white/60 font-mono leading-relaxed">
                  {successMsg || "Your new credentials have been encrypted and saved successfully."}
                </p>
              </div>
              <Link
                href="/login"
                className="block w-full py-3.5 bg-[#C5A059] hover:bg-[#b08d48] text-black font-bold text-xs uppercase tracking-widest rounded-lg transition-all"
              >
                Sign In to Your Account →
              </Link>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
