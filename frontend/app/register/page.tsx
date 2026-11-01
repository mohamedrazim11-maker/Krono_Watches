"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/AuthContext";
import { useCart } from "@/lib/CartContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { register, isAuthenticated } = useAuth();
  const { cart } = useCart();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);

  const rawParam =
    searchParams.get("returnUrl") ||
    searchParams.get("redirect") ||
    searchParams.get("return_url") ||
    searchParams.get("next");
  const returnUrl = rawParam || (cart && cart.length > 0 ? "/checkout" : "/profile");

  // Pre-warm login and destination route
  useEffect(() => {
    const loginTarget = `/login?registered=true&returnUrl=${encodeURIComponent(returnUrl)}`;
    router.prefetch(loginTarget);
  }, [returnUrl, router]);

  useEffect(() => {
    if (isAuthenticated && !isRedirecting && !loading) {
      setIsRedirecting(true);
      window.location.assign(returnUrl);
    }
  }, [isAuthenticated, returnUrl, isRedirecting, loading]);

  // Regex patterns
  const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;

  const validate = () => {
    if (!name.trim()) return "Full name is required.";
    if (!email.trim()) return "Email address is required.";
    if (!EMAIL_REGEX.test(email)) return "Please enter a valid email address.";
    if (!password) return "Password is required.";
    if (!PASSWORD_REGEX.test(password)) {
      return "Password must be at least 8 characters and include uppercase, lowercase, a number, and a special character.";
    }
    if (password !== confirmPassword) {
      return "Passwords do not match.";
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading || isRedirecting) return;
    setError(null);
    setSuccess(null);

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    try {
      const res = await register({
        name: name.trim(),
        email: email.trim(),
        password,
        confirmPassword,
      });

      if (res.success) {
        setIsRedirecting(true);
        setSuccess("Registration successful! Redirecting to login...");
        setTimeout(() => {
          window.location.assign(`/login?registered=true&returnUrl=${encodeURIComponent(returnUrl)}`);
        }, 800);
        return;
      } else {
        setError(res.message || "Registration failed. Please try again.");
        setLoading(false);
      }
    } catch (err: any) {
      setError(err.message || "An error occurred during registration.");
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md p-8 bg-[#0a0a0a] border border-white/10 rounded-xl shadow-2xl backdrop-blur-md">
      {/* Brand Header */}
      <div className="text-center mb-8">
        <h1 className="text-2xl font-serif tracking-widest text-[#C5A059] uppercase font-bold">
          Krono
        </h1>
        <p className="text-xs uppercase tracking-[0.2em] text-white/50 mt-1">
          Create Account
        </p>
      </div>

      {/* Notifications */}
      {error && (
        <div className="mb-6 p-4 bg-red-950/40 border border-red-500/40 rounded-lg text-xs text-red-300 font-mono">
          {error}
        </div>
      )}
      {success && (
        <div className="mb-6 p-4 bg-emerald-950/40 border border-emerald-500/40 rounded-lg text-xs text-emerald-300 font-mono">
          {success}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs uppercase tracking-wider text-white/70 mb-2 font-mono">
            Full Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="John Doe"
            className="w-full px-4 py-2.5 bg-black/60 border border-white/15 rounded-lg text-sm text-white focus:outline-none focus:border-[#C5A059] transition-colors"
            required
          />
        </div>

        <div>
          <label className="block text-xs uppercase tracking-wider text-white/70 mb-2 font-mono">
            Email Address
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="client@krono.luxury"
            className="w-full px-4 py-2.5 bg-black/60 border border-white/15 rounded-lg text-sm text-white focus:outline-none focus:border-[#C5A059] transition-colors"
            required
          />
        </div>

        <div>
          <label className="block text-xs uppercase tracking-wider text-white/70 mb-2 font-mono">
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full px-4 py-2.5 bg-black/60 border border-white/15 rounded-lg text-sm text-white focus:outline-none focus:border-[#C5A059] transition-colors"
            required
          />
        </div>

        <div>
          <label className="block text-xs uppercase tracking-wider text-white/70 mb-2 font-mono">
            Confirm Password
          </label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full px-4 py-2.5 bg-black/60 border border-white/15 rounded-lg text-sm text-white focus:outline-none focus:border-[#C5A059] transition-colors"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading || isRedirecting}
          className="w-full mt-4 py-3 bg-[#C5A059] hover:bg-[#b08d48] text-black font-semibold text-xs tracking-widest uppercase rounded-lg transition-all shadow-lg hover:shadow-[#C5A059]/20 disabled:opacity-75 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isRedirecting ? (
            <>
              <svg className="w-4 h-4 animate-spin text-black" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <span>Account Created • Redirecting...</span>
            </>
          ) : loading ? (
            <>
              <svg className="w-4 h-4 animate-spin text-black" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <span>Registering...</span>
            </>
          ) : (
            "Create Account"
          )}
        </button>
      </form>

      {/* Footer Navigation */}
      <div className="mt-6 pt-6 border-t border-white/10 text-center text-xs text-white/50">
        Already a member?{" "}
        <Link
          href={rawParam ? `/login?returnUrl=${encodeURIComponent(rawParam)}` : "/login"}
          className="text-[#C5A059] hover:underline font-medium"
        >
          Sign In
        </Link>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#050505] text-white">
      <Navbar />

      <main className="flex-1 flex items-center justify-center px-4 py-16">
        <Suspense fallback={<div className="text-white text-xs font-mono">Loading registration...</div>}>
          <RegisterForm />
        </Suspense>
      </main>

      <Footer />
    </div>
  );
}
