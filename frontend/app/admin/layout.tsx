"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ReactNode, useState, useEffect } from "react";
import { useAuth } from "@/lib/AuthContext";

const NAV_ITEMS = [
  {
    group: "Storefront & Orders",
    items: [
      {
        label: "Overview",
        href: "/admin",
        badge: "Live",
        icon: (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.5V19a1 1 0 001 1h4v-6H3zm7-8V19h4V5.5a1 1 0 00-1-1h-2a1 1 0 00-1 1zm7 4V19h4v-5.5a1 1 0 00-1-1h-2a1 1 0 00-1 1z" />
          </svg>
        ),
      },
      {
        label: "Orders",
        href: "/admin/orders",
        badge: "Storefront",
        icon: (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
        ),
      },
    ],
  },
  {
    group: "Watches Catalog",
    items: [
      {
        label: "All Watches",
        href: "/admin/products",
        icon: (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        ),
      },
      {
        label: "Add Watch",
        href: "/admin/products/new",
        icon: (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
        ),
      },
    ],
  },
  {
    group: "Marketing & Drops",
    items: [
      {
        label: "Storefront Campaigns",
        href: "/admin/promotions",
        icon: (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
          </svg>
        ),
      },
    ],
  },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Role-based access guard (Slide 8: Admin access flow)
  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.push(`/login?returnUrl=${encodeURIComponent(pathname)}&unauthorized=true`);
      } else if (user && user.role !== "admin") {
        router.push("/?error=admin_forbidden&message=Administrator+Privileges+Required");
      }
    }
  }, [isAuthenticated, isLoading, user, router, pathname]);

  const now = new Date();
  const timeStr = now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false });
  const dateStr = now.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });

  return (
    <div
      className="flex h-screen w-full overflow-hidden"
      style={{
        fontFamily: "var(--font-sans, 'Inter', system-ui, sans-serif)",
        background: "#050505",
        color: "#F8FAFC",
      }}
    >
      {/* Sidebar */}
      <aside
        style={{
          width: sidebarOpen ? "256px" : "68px",
          background: "#0A0A0A",
          borderRight: "1px solid #1A1A1A",
          display: "flex",
          flexDirection: "column",
          flexShrink: 0,
          transition: "width 220ms cubic-bezier(0.4, 0, 0.2, 1)",
          overflow: "hidden",
          boxShadow: "0 8px 30px rgba(0, 0, 0, 0.8)",
          zIndex: 20,
        }}
      >
        {/* Brand Header */}
        <div
          style={{
            height: "64px",
            display: "flex",
            alignItems: "center",
            padding: "0 16px",
            borderBottom: "1px solid #1A1A1A",
            gap: "12px",
            flexShrink: 0,
            background: "linear-gradient(180deg, rgba(255, 255, 255, 0.03) 0%, transparent 100%)",
          }}
        >
          <div
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "8px",
              background: "linear-gradient(135deg, #222222 0%, #111111 100%)",
              border: "1px solid rgba(255, 255, 255, 0.18)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              boxShadow: "0 2px 10px rgba(0, 0, 0, 0.5)",
            }}
          >
            <span style={{ fontSize: "14px", fontWeight: 800, color: "#FFFFFF" }}>
              ✦
            </span>
          </div>

          {sidebarOpen && (
            <div style={{ overflow: "hidden", whiteSpace: "nowrap" }}>
              <div
                style={{
                  fontSize: "13px",
                  fontWeight: 800,
                  color: "#FFFFFF",
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  fontFamily: "var(--font-sans, system-ui, sans-serif)",
                }}
              >
                KRONO WATCHES
              </div>
              <div
                style={{
                  fontSize: "9.5px",
                  color: "#A1A1AA",
                  fontWeight: 600,
                  letterSpacing: "0.08em",
                  marginTop: "1px",
                  textTransform: "uppercase",
                }}
              >
                Admin Dashboard
              </div>
            </div>
          )}
        </div>

        {/* Live Storefront Status Badge */}
        {sidebarOpen && (
          <div
            style={{
              margin: "12px 12px 6px 12px",
              padding: "8px 12px",
              borderRadius: "8px",
              background: "#111111",
              border: "1px solid #222222",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span
                style={{
                  width: "7px",
                  height: "7px",
                  borderRadius: "50%",
                  background: "#22C55E",
                  boxShadow: "0 0 8px rgba(34, 197, 94, 0.6)",
                }}
              />
              <span
                style={{
                  fontSize: "10px",
                  fontWeight: 700,
                  color: "#E4E4E7",
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  fontFamily: "var(--font-mono, monospace)",
                }}
              >
                Storefront Synced
              </span>
            </div>
            <Link
              href="/"
              target="_blank"
              style={{
                fontSize: "10px",
                color: "#A1A1AA",
                fontWeight: 600,
                textDecoration: "none",
                display: "inline-flex",
                alignItems: "center",
                gap: "3px",
                transition: "color 140ms ease",
              }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = "#FFFFFF")}
              onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = "#A1A1AA")}
            >
              Live ↗
            </Link>
          </div>
        )}

        {/* Navigation */}
        <nav style={{ flex: 1, padding: "10px 8px", overflowY: "auto", overflowX: "hidden" }}>
          {NAV_ITEMS.map((group) => (
            <div key={group.group} style={{ marginBottom: "20px" }}>
              {sidebarOpen && (
                <div
                  style={{
                    fontSize: "9.5px",
                    fontWeight: 700,
                    color: "#71717A",
                    textTransform: "uppercase",
                    letterSpacing: "0.12em",
                    padding: "0 10px",
                    marginBottom: "6px",
                  }}
                >
                  {group.group}
                </div>
              )}
              {group.items.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    title={!sidebarOpen ? item.label : undefined}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: sidebarOpen ? "9px 12px" : "10px",
                      borderRadius: "8px",
                      marginBottom: "3px",
                      fontSize: "12.5px",
                      fontWeight: isActive ? 700 : 500,
                      color: isActive ? "#FFFFFF" : "#A1A1AA",
                      background: isActive
                        ? "linear-gradient(90deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.02) 100%)"
                        : "transparent",
                      borderLeft: isActive ? "3px solid #FFFFFF" : "3px solid transparent",
                      border: isActive
                        ? "1px solid rgba(255, 255, 255, 0.12)"
                        : "1px solid transparent",
                      textDecoration: "none",
                      transition: "all 140ms ease",
                      whiteSpace: "nowrap",
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive) {
                        (e.currentTarget as HTMLElement).style.background = "rgba(255, 255, 255, 0.04)";
                        (e.currentTarget as HTMLElement).style.color = "#FFFFFF";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) {
                        (e.currentTarget as HTMLElement).style.background = "transparent";
                        (e.currentTarget as HTMLElement).style.color = "#A1A1AA";
                      }
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <span style={{ flexShrink: 0, color: isActive ? "#FFFFFF" : "#71717A" }}>
                        {item.icon}
                      </span>
                      {sidebarOpen && <span>{item.label}</span>}
                    </div>
                    {sidebarOpen && (item as any).badge && (
                      <span
                        style={{
                          fontSize: "9px",
                          fontWeight: 700,
                          padding: "2px 6px",
                          borderRadius: "4px",
                          background: isActive ? "rgba(255, 255, 255, 0.15)" : "rgba(255, 255, 255, 0.05)",
                          color: isActive ? "#FFFFFF" : "#A1A1AA",
                          letterSpacing: "0.04em",
                          textTransform: "uppercase",
                        }}
                      >
                        {(item as any).badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Bottom Actions */}
        <div
          style={{
            padding: "12px 10px",
            borderTop: "1px solid #1A1A1A",
            flexShrink: 0,
            background: "#0A0A0A",
          }}
        >
          <Link
            href="/"
            target="_blank"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              padding: "9px 12px",
              borderRadius: "8px",
              fontSize: "12px",
              fontWeight: 700,
              color: "#FFFFFF",
              background: "#141414",
              border: "1px solid #262626",
              textDecoration: "none",
              transition: "all 140ms ease",
              whiteSpace: "nowrap",
              overflow: "hidden",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.background = "#202020";
              (e.currentTarget as HTMLElement).style.borderColor = "#3F3F46";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.background = "#141414";
              (e.currentTarget as HTMLElement).style.borderColor = "#262626";
            }}
          >
            <svg
              className="w-4 h-4"
              style={{ flexShrink: 0 }}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
            {sidebarOpen && <span>View Storefront</span>}
          </Link>

          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: sidebarOpen ? "flex-start" : "center",
              gap: "10px",
              padding: "8px 12px",
              borderRadius: "6px",
              marginTop: "4px",
              fontSize: "11px",
              fontWeight: 500,
              color: "#71717A",
              background: "transparent",
              border: "none",
              cursor: "pointer",
              width: "100%",
              whiteSpace: "nowrap",
              overflow: "hidden",
              transition: "color 120ms ease",
            }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = "#FFFFFF")}
            onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = "#71717A")}
          >
            <svg
              className="w-4 h-4"
              style={{ flexShrink: 0, transform: sidebarOpen ? "none" : "rotate(180deg)", transition: "transform 200ms ease" }}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.75}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
            </svg>
            {sidebarOpen && <span>Collapse Sidebar</span>}
          </button>
        </div>
      </aside>

      {/* Main Area */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0, overflow: "hidden" }}>
        {/* Top Bar */}
        <header
          style={{
            height: "64px",
            flexShrink: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 28px",
            borderBottom: "1px solid #1A1A1A",
            background: "#0A0A0A",
          }}
        >
          {/* Left indicator */}
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                padding: "5px 12px",
                borderRadius: "20px",
                background: "#141414",
                border: "1px solid #262626",
              }}
            >
              <span
                style={{
                  display: "inline-block",
                  width: "6px",
                  height: "6px",
                  borderRadius: "50%",
                  background: "#22C55E",
                  boxShadow: "0 0 8px rgba(34, 197, 94, 0.6)",
                }}
              />
              <span style={{ fontSize: "11px", color: "#F8FAFC", fontWeight: 700, fontFamily: "var(--font-mono, monospace)", letterSpacing: "0.06em" }}>
                STOREFRONT · ONLINE
              </span>
            </div>

            <div style={{ display: "none", alignItems: "center", gap: "6px" }} className="md:flex">
              <span style={{ fontSize: "11px", color: "#71717A" }}>Storefront Engine:</span>
              <span style={{ fontSize: "11px", color: "#E4E4E7", fontFamily: "var(--font-mono, monospace)" }}>Obsidian Luxury Edition</span>
            </div>
          </div>

          {/* Right indicator */}
          <div style={{ display: "flex", alignItems: "center", gap: "18px" }}>
            <Link
              href="/"
              target="_blank"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                padding: "7px 16px",
                borderRadius: "8px",
                background: "#FFFFFF",
                border: "1px solid #FFFFFF",
                color: "#000000",
                fontSize: "12px",
                fontWeight: 700,
                textDecoration: "none",
                transition: "all 140ms ease",
                boxShadow: "0 2px 10px rgba(0, 0, 0, 0.5)",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.background = "#E4E4E7";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.background = "#FFFFFF";
              }}
            >
              <span>Explore Storefront</span>
              <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </Link>

            <div style={{ width: "1px", height: "24px", background: "#1A1A1A" }} />

            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: "12px", fontWeight: 700, color: "#F8FAFC", fontFamily: "var(--font-mono, monospace)" }}>
                {timeStr}
              </div>
              <div style={{ fontSize: "10px", color: "#71717A", fontWeight: 500 }}>
                {dateStr}
              </div>
            </div>

            <div style={{ width: "1px", height: "24px", background: "#1A1A1A" }} />

            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div
                style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "8px",
                  background: "linear-gradient(135deg, #222222 0%, #141414 100%)",
                  border: "1px solid rgba(255, 255, 255, 0.18)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "12px",
                  fontWeight: 800,
                  color: "#FFFFFF",
                  boxShadow: "0 2px 8px rgba(0, 0, 0, 0.5)",
                }}
              >
                KA
              </div>
              <div>
                <div style={{ fontSize: "12px", fontWeight: 700, color: "#F8FAFC" }}>Boutique Director</div>
                <div style={{ fontSize: "10px", color: "#A1A1AA", fontWeight: 600 }}>Master Access</div>
              </div>
            </div>
          </div>
        </header>

        {/* Content Viewport */}
        <main
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "28px 32px",
            background: "#050505",
          }}
        >
          {children}
        </main>
      </div>
    </div>
  );
}