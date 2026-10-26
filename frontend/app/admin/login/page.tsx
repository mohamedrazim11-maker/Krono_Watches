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
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const returnUrl = searchParams.get("returnUrl") || "/admin";
  const isUnauthorized = searchParams.get("unauthorized") === "true";
  const isSessionExpired = searchParams.get("session_expired") === "true";
  const urlError = searchParams.get("message") || searchParams.get("error");

  // If already authenticated as admin, redirect to destination
  useEffect(() => {
    if (!isLoading && isAuthenticated && user?.role === "admin") {
      router.push(returnUrl);
    }
  }, [isAuthenticated, isLoading, user, returnUrl, router]);

  // Handle URL errors or warnings
  useEffect(() => {
    if (isSessionExpired) {
      setError("Your administrative session has expired. Please sign in again.");
    } else if (urlError) {
      setError(urlError === "admin_forbidden" ? "Administrator privileges required to access this area." : urlError);
    } else if (isUnauthorized) {
      setError("Administrative authentication required. Please sign in.");
    }
  }, [isSessionExpired, urlError, isUnauthorized]);

  const handleFillDemo = () => {
    setUsername("admin");
    setPassword("Admin@1234");
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanUsername = username.trim();
    if (!cleanUsername || !password) {
      setError("Please provide both administrator username and password.");
      return;
    }

    setLoading(true);
    try {
      const res = await login(cleanUsername, password, rememberMe);
      if (res.success && res.user) {
        if (res.user.role === "admin") {
          router.push(returnUrl);
        } else {
          // Logged in user is not an admin
          logout();
          setError("Access Denied: This account does not possess administrator privileges.");
        }
      } else {
        setError(res.message || "Invalid credentials. Please verify your email and password.");
      }
    } catch (err: any) {
      setError(err?.message || "An unexpected authentication error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        width: "100%",
        maxWidth: "440px",
        background: "#111418",
        border: "1px solid #20242B",
        borderRadius: "16px",
        padding: "36px 32px",
        boxShadow: "0 24px 60px rgba(0, 0, 0, 0.6), 0 0 1px 1px rgba(255, 255, 255, 0.05)",
        backdropFilter: "blur(12px)",
      }}
    >
      {/* Brand Header */}
      <div style={{ textAlign: "center", marginBottom: "28px" }}>
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: "48px",
            height: "48px",
            borderRadius: "12px",
            background: "linear-gradient(135deg, #0E2A47 0%, #172635 100%)",
            border: "1px solid #1E3A5F",
            color: "#38BDF8",
            marginBottom: "16px",
            boxShadow: "0 0 20px rgba(56, 189, 248, 0.15)",
          }}
        >
          <svg
            width="24"
            height="24"
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

        <div
          style={{
            fontSize: "11px",
            fontWeight: 700,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: "#38BDF8",
            marginBottom: "6px",
            fontFamily: "monospace",
          }}
        >
          Krono Atelier Security
        </div>

        <h1
          style={{
            fontSize: "22px",
            fontWeight: 700,
            color: "#FFFFFF",
            letterSpacing: "-0.02em",
            margin: "0 0 6px 0",
          }}
        >
          Admin Portal Sign In
        </h1>

        <p
          style={{
            fontSize: "13px",
            color: "#8B949E",
            lineHeight: 1.5,
            margin: 0,
          }}
        >
          Authenticate to access administrative controls, inventory, and orders.
        </p>
      </div>

      {/* Notice if currently signed in as non-admin customer */}
      {isAuthenticated && user && user.role !== "admin" && (
        <div
          style={{
            marginBottom: "20px",
            padding: "12px 14px",
            background: "rgba(234, 179, 8, 0.08)",
            border: "1px solid rgba(234, 179, 8, 0.25)",
            borderRadius: "10px",
            fontSize: "12.5px",
            color: "#FDE047",
            lineHeight: 1.45,
          }}
        >
          <div style={{ fontWeight: 600, marginBottom: "4px" }}>Customer Session Active</div>
          Currently signed in as <strong>{user.name || user.email}</strong>. Enter administrator credentials below or{" "}
          <button
            type="button"
            onClick={() => logout()}
            style={{
              color: "#38BDF8",
              background: "none",
              border: "none",
              padding: 0,
              textDecoration: "underline",
              cursor: "pointer",
              font: "inherit",
              fontWeight: 600,
            }}
          >
            sign out
          </button>
          .
        </div>
      )}

      {/* Error message banner */}
      {error && (
        <div
          style={{
            marginBottom: "20px",
            padding: "12px 14px",
            background: "rgba(239, 68, 68, 0.1)",
            border: "1px solid rgba(239, 68, 68, 0.3)",
            borderRadius: "10px",
            fontSize: "12.5px",
            color: "#FCA5A5",
            display: "flex",
            alignItems: "flex-start",
            gap: "10px",
            lineHeight: 1.45,
          }}
        >
          <svg
            style={{ flexShrink: 0, marginTop: "2px" }}
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <div>{error}</div>
        </div>
      )}

      {/* Login Form */}
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        {/* Username Field */}
        <div>
          <label
            htmlFor="admin-username"
            style={{
              display: "block",
              fontSize: "11px",
              fontWeight: 600,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: "#9CA3AF",
              marginBottom: "6px",
              fontFamily: "monospace",
            }}
          >
            Administrator Username
          </label>
          <div style={{ position: "relative" }}>
            <input
              id="admin-username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="admin (or admin@krono.luxury)"
              required
              autoComplete="username"
              style={{
                width: "100%",
                padding: "11px 14px 11px 38px",
                background: "#0B0C0E",
                border: "1px solid #252A33",
                borderRadius: "8px",
                fontSize: "13.5px",
                color: "#FFFFFF",
                outline: "none",
                transition: "border-color 150ms ease, box-shadow 150ms ease",
                boxSizing: "border-box",
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = "#38BDF8";
                e.currentTarget.style.boxShadow = "0 0 0 2px rgba(56, 189, 248, 0.2)";
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = "#252A33";
                e.currentTarget.style.boxShadow = "none";
              }}
            />
            <svg
              style={{
                position: "absolute",
                left: "12px",
                top: "50%",
                transform: "translateY(-50%)",
                color: "#6B7280",
                pointerEvents: "none",
              }}
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </div>
        </div>

        {/* Password Field */}
        <div>
          <label
            htmlFor="admin-password"
            style={{
              display: "block",
              fontSize: "11px",
              fontWeight: 600,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: "#9CA3AF",
              marginBottom: "6px",
              fontFamily: "monospace",
            }}
          >
            Password
          </label>
          <div style={{ position: "relative" }}>
            <input
              id="admin-password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              required
              autoComplete="current-password"
              style={{
                width: "100%",
                padding: "11px 40px 11px 38px",
                background: "#0B0C0E",
                border: "1px solid #252A33",
                borderRadius: "8px",
                fontSize: "13.5px",
                color: "#FFFFFF",
                outline: "none",
                transition: "border-color 150ms ease, box-shadow 150ms ease",
                boxSizing: "border-box",
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = "#38BDF8";
                e.currentTarget.style.boxShadow = "0 0 0 2px rgba(56, 189, 248, 0.2)";
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = "#252A33";
                e.currentTarget.style.boxShadow = "none";
              }}
            />
            <svg
              style={{
                position: "absolute",
                left: "12px",
                top: "50%",
                transform: "translateY(-50%)",
                color: "#6B7280",
                pointerEvents: "none",
              }}
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={{
                position: "absolute",
                right: "10px",
                top: "50%",
                transform: "translateY(-50%)",
                background: "transparent",
                border: "none",
                color: "#6B7280",
                cursor: "pointer",
                padding: "4px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
              title={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                  <line x1="1" y1="1" x2="23" y2="23" />
                </svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Remember Session */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: "2px" }}>
          <label
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              cursor: "pointer",
              userSelect: "none",
              fontSize: "12.5px",
              color: "#9CA3AF",
            }}
          >
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              style={{
                width: "15px",
                height: "15px",
                accentColor: "#38BDF8",
                cursor: "pointer",
              }}
            />
            <span>Remember session (30-day persistence)</span>
          </label>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          style={{
            marginTop: "8px",
            width: "100%",
            padding: "12px 18px",
            background: loading ? "#0E2A47" : "#0284C7",
            color: "#FFFFFF",
            border: "1px solid #38BDF8",
            borderRadius: "8px",
            fontSize: "13px",
            fontWeight: 600,
            letterSpacing: "0.04em",
            cursor: loading ? "not-allowed" : "pointer",
            transition: "all 140ms ease",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
            boxShadow: "0 4px 14px rgba(2, 132, 199, 0.3)",
          }}
          onMouseEnter={(e) => {
            if (!loading) (e.currentTarget as HTMLElement).style.background = "#0369A1";
          }}
          onMouseLeave={(e) => {
            if (!loading) (e.currentTarget as HTMLElement).style.background = "#0284C7";
          }}
        >
          {loading ? (
            <>
              <svg
                style={{
                  animation: "spin 1s linear infinite",
                }}
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="12" cy="12" r="10" strokeOpacity="0.25" />
                <path d="M12 2a10 10 0 0 1 10 10" strokeOpacity="0.8" />
              </svg>
              <span>Verifying Administrative Authority...</span>
            </>
          ) : (
            <>
              <span>Sign In to Admin Panel</span>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </>
          )}
        </button>
      </form>

      {/* Quick Test / Demo Credentials Assistant */}
      <div
        style={{
          marginTop: "24px",
          padding: "12px 14px",
          background: "#0B0D10",
          border: "1px dashed #222730",
          borderRadius: "8px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "12px",
        }}
      >
        <div style={{ fontSize: "11.5px", color: "#6B7280" }}>
          <div style={{ color: "#9CA3AF", fontWeight: 600, marginBottom: "2px" }}>Default Credentials:</div>
          Username: <code>admin</code> (or <code>admin@krono.luxury</code>) / Password: <code>Admin@1234</code>
        </div>
        <button
          type="button"
          onClick={handleFillDemo}
          style={{
            padding: "6px 10px",
            background: "#161920",
            border: "1px solid #2A303C",
            borderRadius: "6px",
            color: "#38BDF8",
            fontSize: "11px",
            fontWeight: 600,
            cursor: "pointer",
            whiteSpace: "nowrap",
            transition: "all 120ms ease",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.background = "#1D232D";
            (e.currentTarget as HTMLElement).style.borderColor = "#38BDF8";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.background = "#161920";
            (e.currentTarget as HTMLElement).style.borderColor = "#2A303C";
          }}
        >
          Autofill
        </button>
      </div>

      {/* Return to Public Boutique */}
      <div style={{ marginTop: "20px", textAlign: "center" }}>
        <Link
          href="/"
          style={{
            fontSize: "12px",
            color: "#6B7280",
            textDecoration: "none",
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            transition: "color 140ms ease",
          }}
          onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = "#D1D5DB")}
          onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = "#6B7280")}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
          <span>Return to Krono Boutique Store</span>
        </Link>
      </div>

      <style jsx global>{`
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <div
      style={{
        minHeight: "100vh",
        width: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "32px 16px",
        background: "radial-gradient(ellipse at 50% 20%, #171E28 0%, #0B0D0F 70%)",
        color: "#F3F4F6",
        fontFamily: "var(--font-sans, system-ui, -apple-system, sans-serif)",
      }}
    >
      <Suspense
        fallback={
          <div
            style={{
              color: "#9CA3AF",
              fontSize: "13px",
              fontFamily: "monospace",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <span>Loading Administrative Gate...</span>
          </div>
        }
      >
        <AdminLoginForm />
      </Suspense>
    </div>
  );
}
