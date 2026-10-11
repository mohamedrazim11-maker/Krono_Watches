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
        label: "Atelier Overview",
        href: "/admin",
        badge: "Live",
        icon: (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.5V19a1 1 0 001 1h4v-6H3zm7-8V19h4V5.5a1 1 0 00-1-1h-2a1 1 0 00-1 1zm7 4V19h4v-5.5a1 1 0 00-1-1h-2a1 1 0 00-1 1z" />
          </svg>
        ),
      },
      {
        label: "VIP Orders & Clients",
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
    group: "Horological Catalogue",
    items: [
      {
        label: "All Timepieces",
        href: "/admin/products",
        icon: (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        ),
      },
      {
        label: "Add Timepiece",
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
        background: "var(--background, #0E1A16)",
        color: "var(--foreground, #F8FAFC)",
      }}
    >
      {/* Sidebar */}
      <aside
        style={{
          width: sidebarOpen ? "256px" : "68px",
          background: "var(--card, #12221D)",
          borderRight: "1px solid var(--border-subtle, rgba(0, 96, 57, 0.25))",
          display: "flex",
          flexDirection: "column",
          flexShrink: 0,
          transition: "width 220ms cubic-bezier(0.4, 0, 0.2, 1)",
          overflow: "hidden",
          boxShadow: "var(--neu-shadow-raised, 8px 8px 20px rgba(0, 0, 0, 0.75))",
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
            borderBottom: "1px solid var(--border-subtle, rgba(0, 96, 57, 0.25))",
            gap: "12px",
            flexShrink: 0,
            background: "linear-gradient(180deg, var(--accent-light, rgba(0, 163, 98, 0.15)) 0%, transparent 100%)",
          }}
        >
          <div
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "10px",
              background: "linear-gradient(135deg, var(--rolex-green, #006039) 0%, var(--rolex-green-dark, #00482B) 60%, var(--rolex-gold, #C5A059) 100%)",
              border: "1px solid var(--rolex-gold, #C5A059)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              boxShadow: "0 2px 12px var(--gold-glow, rgba(197, 160, 89, 0.28))",
            }}
          >
            {/* Crown / K Icon */}
            <span style={{ fontSize: "16px", fontWeight: 800, color: "var(--rolex-gold, #C5A059)" }}>
              ♔
            </span>
          </div>

          {sidebarOpen && (
            <div style={{ overflow: "hidden", whiteSpace: "nowrap" }}>
              <div
                style={{
                  fontSize: "14px",
                  fontWeight: 800,
                  color: "var(--foreground, #F8FAFC)",
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  fontFamily: "var(--font-serif, 'Cormorant Garamond', Georgia, serif)",
                }}
              >
                KRONO ATELIER
              </div>
              <div
                style={{
                  fontSize: "9.5px",
                  color: "var(--rolex-gold, #C5A059)",
                  fontWeight: 700,
                  letterSpacing: "0.08em",
                  marginTop: "1px",
                  textTransform: "uppercase",
                }}
              >
                Haute Horlogerie Console
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
              background: "var(--card-elevated, #162923)",
              border: "1px solid var(--border-strong, rgba(0, 163, 98, 0.35))",
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
                  background: "var(--accent, #00A362)",
                  boxShadow: "0 0 10px var(--accent, #00A362)",
                }}
              />
              <span
                style={{
                  fontSize: "10px",
                  fontWeight: 700,
                  color: "var(--accent, #00A362)",
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
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
                color: "var(--rolex-gold, #C5A059)",
                fontWeight: 700,
                textDecoration: "none",
                display: "inline-flex",
                alignItems: "center",
                gap: "3px",
              }}
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
                    color: "var(--accent-muted, #8EAA9C)",
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
                      color: isActive ? "var(--foreground, #F8FAFC)" : "var(--accent-muted, #8EAA9C)",
                      background: isActive
                        ? "linear-gradient(90deg, rgba(0, 96, 57, 0.45) 0%, rgba(197, 160, 89, 0.14) 100%)"
                        : "transparent",
                      borderLeft: isActive ? "3px solid var(--rolex-gold, #C5A059)" : "3px solid transparent",
                      border: isActive
                        ? "1px solid var(--border-strong, rgba(0, 163, 98, 0.35))"
                        : "1px solid transparent",
                      textDecoration: "none",
                      transition: "all 140ms ease",
                      whiteSpace: "nowrap",
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive) (e.currentTarget as HTMLElement).style.background = "var(--accent-light, rgba(0, 163, 98, 0.15))";
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) (e.currentTarget as HTMLElement).style.background = "transparent";
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <span style={{ flexShrink: 0, color: isActive ? "var(--rolex-gold, #C5A059)" : "var(--accent-muted, #8EAA9C)" }}>
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
                          background: isActive ? "rgba(197, 160, 89, 0.2)" : "rgba(255, 255, 255, 0.05)",
                          color: isActive ? "var(--rolex-gold, #C5A059)" : "var(--accent-muted, #8EAA9C)",
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
            borderTop: "1px solid var(--border-subtle, rgba(0, 96, 57, 0.25))",
            flexShrink: 0,
            background: "var(--card-elevated, #162923)",
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
              color: "var(--rolex-gold, #C5A059)",
              background: "rgba(197, 160, 89, 0.1)",
              border: "1px solid var(--rolex-gold, #C5A059)",
              textDecoration: "none",
              transition: "all 140ms ease",
              whiteSpace: "nowrap",
              overflow: "hidden",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.background = "var(--rolex-gold, #C5A059)";
              (e.currentTarget as HTMLElement).style.color = "#000";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.background = "rgba(197, 160, 89, 0.1)";
              (e.currentTarget as HTMLElement).style.color = "var(--rolex-gold, #C5A059)";
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
              color: "var(--accent-muted, #8EAA9C)",
              background: "transparent",
              border: "none",
              cursor: "pointer",
              width: "100%",
              whiteSpace: "nowrap",
              overflow: "hidden",
              transition: "color 120ms ease",
            }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = "var(--rolex-gold, #C5A059)")}
            onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = "var(--accent-muted, #8EAA9C)")}
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
            borderBottom: "1px solid var(--border-subtle, rgba(0, 96, 57, 0.25))",
            background: "var(--card, #12221D)",
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
                background: "var(--accent-light, rgba(0, 163, 98, 0.15))",
                border: "1px solid var(--border-strong, rgba(0, 163, 98, 0.35))",
              }}
            >
              <span
                style={{
                  display: "inline-block",
                  width: "6px",
                  height: "6px",
                  borderRadius: "50%",
                  background: "var(--accent, #00A362)",
                  boxShadow: "0 0 8px var(--accent, #00A362)",
                }}
              />
              <span style={{ fontSize: "11px", color: "var(--accent, #00A362)", fontWeight: 700, fontFamily: "var(--font-mono, monospace)", letterSpacing: "0.06em" }}>
                HAUTE HORLOGERIE ATELIER · ONLINE
              </span>
            </div>

            <div style={{ display: "none", alignItems: "center", gap: "6px" }} className="md:flex">
              <span style={{ fontSize: "11px", color: "var(--accent-muted, #8EAA9C)" }}>Storefront Engine:</span>
              <span style={{ fontSize: "11px", color: "var(--foreground, #F8FAFC)", fontFamily: "var(--font-mono, monospace)" }}>Rolex Green & Gold Edition</span>
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
                background: "linear-gradient(135deg, var(--rolex-green, #006039) 0%, var(--rolex-green-dark, #00482B) 100%)",
                border: "1px solid var(--border-strong, rgba(0, 163, 98, 0.35))",
                color: "#FFFFFF",
                fontSize: "12px",
                fontWeight: 700,
                textDecoration: "none",
                transition: "all 140ms ease",
                boxShadow: "0 2px 10px rgba(0, 96, 57, 0.3)",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = "var(--rolex-gold, #C5A059)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = "var(--border-strong, rgba(0, 163, 98, 0.35))";
              }}
            >
              <span>Explore Storefront</span>
              <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </Link>

            <div style={{ width: "1px", height: "24px", background: "var(--border-subtle, rgba(0, 96, 57, 0.25))" }} />

            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: "12px", fontWeight: 700, color: "var(--foreground, #F8FAFC)", fontFamily: "var(--font-mono, monospace)" }}>
                {timeStr}
              </div>
              <div style={{ fontSize: "10px", color: "var(--accent-muted, #8EAA9C)", fontWeight: 500 }}>
                {dateStr}
              </div>
            </div>

            <div style={{ width: "1px", height: "24px", background: "var(--border-subtle, rgba(0, 96, 57, 0.25))" }} />

            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div
                style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "10px",
                  background: "linear-gradient(135deg, var(--rolex-green, #006039), var(--rolex-green-dark, #00482B))",
                  border: "1px solid var(--rolex-gold, #C5A059)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "12px",
                  fontWeight: 800,
                  color: "var(--rolex-gold, #C5A059)",
                  boxShadow: "0 2px 8px var(--gold-glow, rgba(197, 160, 89, 0.28))",
                }}
              >
                KA
              </div>
              <div>
                <div style={{ fontSize: "12px", fontWeight: 700, color: "var(--foreground, #F8FAFC)" }}>Boutique Director</div>
                <div style={{ fontSize: "10px", color: "var(--rolex-gold, #C5A059)", fontWeight: 700 }}>Master Access</div>
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
            background: "var(--background, #0E1A16)",
          }}
        >
          {children}
        </main>
      </div>
    </div>
  );
}