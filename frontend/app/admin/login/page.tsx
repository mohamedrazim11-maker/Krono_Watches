"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/AuthContext";

function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, logout, user, isAuthenticated, isLoading } = useAuth();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const returnUrl = searchParams.get("returnUrl") || "/admin";

  // If already authenticated as admin, redirect to admin dashboard
  useEffect(() => {
    if (!isLoading && isAuthenticated && user?.role === "admin") {
      router.push(returnUrl);
    }
  }, [isAuthenticated, isLoading, user, returnUrl, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanUsername = username.trim();
    if (!cleanUsername || !password) {
      setError("Please enter both username and password.");
      return;
    }

    setLoading(true);
    try {
      const res = await login(cleanUsername, password, true);
      if (res.success && res.user) {
        if (res.user.role === "admin") {
          router.push(returnUrl);
        } else {
          logout();
          setError("Access Denied: This account does not possess administrator privileges.");
        }
      } else {
        setError(res.message || "Invalid credentials.");
      }
    } catch (err: any) {
      setError(err?.message || "Authentication error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-sm bg-[#0E1015] border border-[#20242B] rounded-2xl p-8 shadow-2xl space-y-6">
      {/* Brand Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-[#14161C] border border-[#C5A059]/40 text-[#C5A059] shadow-lg mb-1">
          <svg
            className="w-6 h-6"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
        </div>
        <h1 className="text-xl font-bold text-white tracking-tight font-serif">
          Admin Portal
        </h1>
        <p className="text-xs text-white/50 font-mono">
          Sign in to access control panel
        </p>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="p-3 bg-red-950/40 border border-red-500/40 rounded-lg text-xs text-red-300 font-mono text-center">
          {error}
        </div>
      )}

      {/* Clean Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Username */}
        <div className="space-y-1.5">
          <label
            htmlFor="admin-username"
            className="block text-[11px] font-mono uppercase tracking-wider text-white/60 font-semibold"
          >
            Username
          </label>
          <input
            id="admin-username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="admin"
            required
            autoComplete="username"
            autoFocus
            className="w-full px-3.5 py-2.5 bg-[#07080A] border border-[#262A33] rounded-lg text-sm text-white placeholder-white/30 font-mono focus:outline-none focus:border-[#C5A059] transition-colors"
          />
        </div>

        {/* Password */}
        <div className="space-y-1.5">
          <label
            htmlFor="admin-password"
            className="block text-[11px] font-mono uppercase tracking-wider text-white/60 font-semibold"
          >
            Password
          </label>
          <div className="relative">
            <input
              id="admin-password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••"
              required
              autoComplete="current-password"
              className="w-full px-3.5 py-2.5 pr-10 bg-[#07080A] border border-[#262A33] rounded-lg text-sm text-white placeholder-white/30 font-mono focus:outline-none focus:border-[#C5A059] transition-colors"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors cursor-pointer"
              title={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                  <line x1="1" y1="1" x2="23" y2="23" />
                </svg>
              ) : (
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-[#C5A059] hover:bg-[#d4af37] text-black font-bold text-xs uppercase tracking-widest rounded-lg transition-all shadow-lg hover:shadow-[#C5A059]/20 disabled:opacity-50 cursor-pointer pt-3 mt-2"
        >
          {loading ? "Signing In..." : "Sign In"}
        </button>
      </form>

      {/* Return to Store */}
      <div className="text-center pt-2">
        <Link
          href="/"
          className="text-xs text-white/40 hover:text-[#C5A059] font-mono transition-colors"
        >
          ← Return to Store
        </Link>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-[#07080A] text-white font-sans selection:bg-[#C5A059] selection:text-black">
      <Suspense
        fallback={
          <div className="text-xs font-mono text-[#C5A059] animate-pulse">
            Loading Admin Portal...
          </div>
        }
      >
        <AdminLoginForm />
      </Suspense>
    </div>
  );
}
