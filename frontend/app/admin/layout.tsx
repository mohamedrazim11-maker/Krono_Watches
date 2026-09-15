"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode, useState } from "react";

const NAV_ITEMS = [
  {
    group: "Analytics",
    items: [
      {
        label: "Overview",
        href: "/admin",
        icon: (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.5V19a1 1 0 001 1h4v-6H3zm7-8V19h4V5.5a1 1 0 00-1-1h-2a1 1 0 00-1 1zm7 4V19h4v-5.5a1 1 0 00-1-1h-2a1 1 0 00-1 1z" />
          </svg>
        ),
      },
    ],
  },
  {
    group: "Catalogue",
    items: [
      {
        label: "All Products",
        href: "/admin/products",
        icon: (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M20 7H4a1 1 0 00-1 1v10a1 1 0 001 1h16a1 1 0 001-1V8a1 1 0 00-1-1zM9 7V5a3 3 0 016 0v2" />
          </svg>
        ),
      },
      {
        label: "Add Product",
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
    group: "Marketing",
    items: [
      {
        label: "Campaigns",
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
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const now = new Date();
  const timeStr = now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false });
  const dateStr = now.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });

  return (
    <div className="flex h-screen w-full overflow-hidden" style={{ fontFamily: "'Inter', 'SF Pro Display', system-ui, sans-serif", background: "#0A0C10", color: "#E2E8F0" }}>
      {/* Sidebar */}
      <aside
        style={{
          width: sidebarOpen ? "240px" : "64px",
          background: "#0D1117",
          borderRight: "1px solid #1E2530",
          display: "flex",
          flexDirection: "column",
          flexShrink: 0,
          transition: "width 200ms ease",
          overflow: "hidden",
        }}
      >
        {/* Logo */}
        <div style={{ height: "56px", display: "flex", alignItems: "center", padding: "0 16px", borderBottom: "1px solid #1E2530", gap: "10px", flexShrink: 0 }}>
          <div style={{
            width: "28px", height: "28px", borderRadius: "6px",
            background: "linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)",
            display: "flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0, fontSize: "12px", fontWeight: 800, color: "white", letterSpacing: "-0.5px"
          }}>K</div>
          {sidebarOpen && (
            <div style={{ overflow: "hidden", whiteSpace: "nowrap" }}>
              <div style={{ fontSize: "13px", fontWeight: 700, color: "#F1F5F9", letterSpacing: "-0.3px" }}>Krono Admin</div>
              <div style={{ fontSize: "10px", color: "#64748B", fontWeight: 500, marginTop: "1px" }}>Management Console</div>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: "12px 8px", overflowY: "auto", overflowX: "hidden" }}>
          {NAV_ITEMS.map((group) => (
            <div key={group.group} style={{ marginBottom: "20px" }}>
              {sidebarOpen && (
                <div style={{ fontSize: "10px", fontWeight: 600, color: "#475569", textTransform: "uppercase", letterSpacing: "0.08em", padding: "0 8px", marginBottom: "4px" }}>
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
                      display: "flex", alignItems: "center", gap: "10px",
                      padding: "8px", borderRadius: "6px", marginBottom: "2px",
                      fontSize: "13px", fontWeight: isActive ? 600 : 400,
                      color: isActive ? "#F1F5F9" : "#8B9CBB",
                      background: isActive ? "#1A2235" : "transparent",
                      borderLeft: isActive ? "2px solid #3B82F6" : "2px solid transparent",
                      textDecoration: "none", transition: "all 120ms ease",
                      whiteSpace: "nowrap", overflow: "hidden",
                    }}
                    onMouseEnter={(e) => { if (!isActive) (e.currentTarget as HTMLElement).style.background = "#131B2A"; }}
                    onMouseLeave={(e) => { if (!isActive) (e.currentTarget as HTMLElement).style.background = "transparent"; }}
                  >
                    <span style={{ flexShrink: 0, color: isActive ? "#3B82F6" : "#64748B" }}>{item.icon}</span>
                    {sidebarOpen && <span>{item.label}</span>}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Bottom */}
        <div style={{ padding: "12px 8px", borderTop: "1px solid #1E2530", flexShrink: 0 }}>
          <Link
            href="/"
            target="_blank"
            style={{
              display: "flex", alignItems: "center", gap: "10px",
              padding: "8px", borderRadius: "6px",
              fontSize: "12px", fontWeight: 500, color: "#64748B",
              textDecoration: "none", transition: "color 120ms ease", whiteSpace: "nowrap", overflow: "hidden",
            }}
            onMouseEnter={(e) => (e.currentTarget as HTMLElement).style.color = "#94A3B8"}
            onMouseLeave={(e) => (e.currentTarget as HTMLElement).style.color = "#64748B"}
          >
            <svg className="w-4 h-4" style={{ flexShrink: 0 }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
            {sidebarOpen && <span>View Storefront</span>}
          </Link>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            style={{
              display: "flex", alignItems: "center", gap: "10px",
              padding: "8px", borderRadius: "6px", marginTop: "4px",
              fontSize: "12px", fontWeight: 500, color: "#64748B",
              background: "transparent", border: "none", cursor: "pointer",
              width: "100%", whiteSpace: "nowrap", overflow: "hidden",
              transition: "color 120ms ease",
            }}
            onMouseEnter={(e) => (e.currentTarget as HTMLElement).style.color = "#94A3B8"}
            onMouseLeave={(e) => (e.currentTarget as HTMLElement).style.color = "#64748B"}
          >
            <svg className="w-4 h-4" style={{ flexShrink: 0, transform: sidebarOpen ? "none" : "rotate(180deg)", transition: "transform 200ms ease" }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
            </svg>
            {sidebarOpen && <span>Collapse</span>}
          </button>
        </div>
      </aside>

      {/* Main Area */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0, overflow: "hidden" }}>
        {/* Top Bar */}
        <header style={{
          height: "56px", flexShrink: 0,
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "0 24px", borderBottom: "1px solid #1E2530",
          background: "#0D1117",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{
              display: "inline-block", width: "7px", height: "7px",
              borderRadius: "50%", background: "#22C55E",
              boxShadow: "0 0 6px #22C55E",
            }} />
            <span style={{ fontSize: "11px", color: "#64748B", fontWeight: 500, fontFamily: "monospace" }}>
              API Connected · PostgreSQL
            </span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: "12px", fontWeight: 600, color: "#94A3B8", fontFamily: "monospace" }}>{timeStr}</div>
              <div style={{ fontSize: "10px", color: "#475569", fontWeight: 500 }}>{dateStr}</div>
            </div>
            <div style={{ width: "1px", height: "28px", background: "#1E2530" }} />
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <div style={{
                width: "30px", height: "30px", borderRadius: "6px",
                background: "linear-gradient(135deg, #3B82F6, #1D4ED8)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "11px", fontWeight: 700, color: "white",
              }}>AD</div>
              <div>
                <div style={{ fontSize: "12px", fontWeight: 600, color: "#E2E8F0" }}>Administrator</div>
                <div style={{ fontSize: "10px", color: "#64748B", fontWeight: 500 }}>Full Access</div>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main style={{ flex: 1, overflowY: "auto", padding: "28px 32px", background: "#0A0C10" }}>
          {children}
        </main>
      </div>
    </div>
  );
}