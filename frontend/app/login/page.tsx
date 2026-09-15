"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/AuthContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, isAuthenticated } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const returnUrl = searchParams.get("returnUrl") || "/profile";
  const registered = searchParams.get("registered");

  useEffect(() => {
    if (registered) {
      setNotice("Account created successfully! Please sign in with your credentials.");
    }
    if (searchParams.get("unauthorized")) {
      setError("Please sign in to access this protected area.");
    }
  }, [registered, searchParams]);

  useEffect(() => {
    if (isAuthenticated) {
      router.push(returnUrl);
    }
  }, [isAuthenticated, returnUrl, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setNotice(null);

    if (!email.trim() || !password) {
      setError("Please enter your email and password.");
      return;
    }

    setLoading(true);
    try {
      const res = await login(email.trim(), password, rememberMe);
      if (res.success) {
        router.push(returnUrl);
      } else {
        setError(res.message || "Invalid credentials.");
      }
    } catch (err: any) {
      setError(err.message || "An error occurred during sign in.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-[#0D0D0D] border border-white/10 rounded-xl p-8 shadow-2xl backdrop-blur-sm">
      {/* Header */}
      <div className="text-center mb-8">
        <span className="text-xs font-mono tracking-widest text-[#C5A059] uppercase">
          Client Authentication
        </span>
        <h1 className="text-2xl font-serif tracking-tight mt-2 text-white">
          Sign In to Krono
        </h1>
        <p className="text-xs text-white/50 mt-1">
          Access your private vault, orders, and saved horology.
        </p>
      </div>

      {/* Notice & Error */}
      {notice && (
        <div className="mb-6 p-3.5 bg-emerald-950/40 border border-emerald-500/40 rounded-lg text-xs text-emerald-300">
          {notice}
        </div>
      )}
      {error && (
        <div className="mb-6 p-3.5 bg-red-950/40 border border-red-500/40 rounded-lg text-xs text-red-300">
          {error}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs uppercase tracking-wider text-white/70 mb-1.5 font-mono">
            Email Address
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="sterling@geneva-vault.ch"
            className="w-full px-4 py-2.5 bg-black/60 border border-white/15 rounded-lg text-sm text-white focus:outline-none focus:border-[#C5A059] transition-colors"
            required
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs uppercase tracking-wider text-white/70 font-mono">
              Password
            </label>
          </div>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full px-4 py-2.5 bg-black/60 border border-white/15 rounded-lg text-sm text-white focus:outline-none focus:border-[#C5A059] transition-colors"
            required
          />
        </div>

        {/* Remember Me & Persistent Session Option */}
        <div className="flex items-center justify-between pt-1">
          <label className="flex items-center gap-2.5 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="w-4 h-4 rounded border-white/20 bg-black/80 text-[#C5A059] focus:ring-0 focus:ring-offset-0 accent-[#C5A059] cursor-pointer"
            />
            <span className="text-xs text-white/70">
              Remember me (30-day encrypted session)
            </span>
          </label>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full mt-4 py-3 bg-[#C5A059] hover:bg-[#b08d48] text-black font-semibold text-xs tracking-widest uppercase rounded-lg transition-all shadow-lg hover:shadow-[#C5A059]/20 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Verifying Credentials..." : "Authenticate & Enter"}
        </button>
      </form>

      {/* Switch to Register */}
      <div className="mt-6 pt-6 border-t border-white/10 text-center text-xs text-white/50">
        New client?{" "}
        <Link
          href="/register"
          className="text-[#C5A059] hover:underline font-medium"
        >
          Register an Account
        </Link>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#050505] text-white">
      <Navbar />

      <main className="flex-1 flex items-center justify-center px-4 py-16">
        <Suspense fallback={<div className="text-white text-xs font-mono">Loading authentication...</div>}>
          <LoginForm />
        </Suspense>
      </main>

      <Footer />
    </div>
  );
}
