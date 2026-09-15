"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { fetchStats, fetchProducts, deleteProduct, updateProduct, Product, Stats } from "@/lib/api";
import { getProductImage } from "@/lib/productImages";

const S = {
  card: {
    background: "#0D1117",
    border: "1px solid #1E2530",
    borderRadius: "8px",
    padding: "20px",
  } as React.CSSProperties,
  label: {
    fontSize: "11px", fontWeight: 600, color: "#64748B",
    textTransform: "uppercase" as const, letterSpacing: "0.06em",
    marginBottom: "6px",
  } as React.CSSProperties,
  value: {
    fontSize: "28px", fontWeight: 700, color: "#F1F5F9",
    letterSpacing: "-0.5px", lineHeight: 1,
  } as React.CSSProperties,
  sub: {
    fontSize: "11px", color: "#475569", marginTop: "4px", fontWeight: 500,
  } as React.CSSProperties,
  th: {
    padding: "10px 14px", fontSize: "10px", fontWeight: 700,
    color: "#475569", textTransform: "uppercase" as const,
    letterSpacing: "0.08em", borderBottom: "1px solid #1E2530",
    background: "#0D1117", whiteSpace: "nowrap" as const,
  } as React.CSSProperties,
  td: {
    padding: "12px 14px", fontSize: "12px", color: "#94A3B8",
    borderBottom: "1px solid #141820", verticalAlign: "middle" as const,
  } as React.CSSProperties,
};

function StatCard({ label, value, sub, accent }: { label: string; value: string | number; sub: string; accent?: string }) {
  return (
    <div style={S.card}>
      <div style={S.label}>{label}</div>
      <div style={{ ...S.value, color: accent || "#F1F5F9" }}>{value}</div>
      <div style={S.sub}>{sub}</div>
    </div>
  );
}

function Badge({ type }: { type: "success" | "warning" | "neutral" | "blue" }) {
  const map = {
    success: { bg: "rgba(34,197,94,0.12)", color: "#22C55E", border: "rgba(34,197,94,0.25)" },
    warning: { bg: "rgba(239,68,68,0.12)", color: "#F87171", border: "rgba(239,68,68,0.25)" },
    neutral: { bg: "rgba(100,116,139,0.12)", color: "#94A3B8", border: "rgba(100,116,139,0.2)" },
    blue: { bg: "rgba(59,130,246,0.12)", color: "#60A5FA", border: "rgba(59,130,246,0.25)" },
  };
  return map[type];
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const [s, p] = await Promise.all([fetchStats(), fetchProducts()]);
      setStats(s);
      setProducts(p.slice(0, 8));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const toast = (msg: string) => {
    setFeedback(msg);
    setTimeout(() => setFeedback(null), 3000);
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Permanently delete "${name}"?`)) return;
    setDeletingId(id);
    try {
      await deleteProduct(id);
      setProducts((prev) => prev.filter((p) => p.id !== id));
      setStats((prev) => prev ? { ...prev, totalProducts: Math.max(0, prev.totalProducts - 1) } : null);
      toast(`"${name}" deleted.`);
    } catch (err: any) {
      alert(err.message || "Failed to delete");
    } finally {
      setDeletingId(null);
    }
  };

  const handleToggleFeatured = async (product: Product) => {
    try {
      const updated = await updateProduct(product.id, { is_featured: !product.is_featured });
      setProducts((prev) => prev.map((p) => p.id === product.id ? { ...p, is_featured: updated.is_featured } : p));
      toast(`Featured status updated for "${product.name}".`);
    } catch (err: any) {
      alert(err.message || "Failed to update");
    }
  };

  const fmt = (n: number) => `LKR ${Number(n || 0).toLocaleString("en-US")}`;

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto", fontFamily: "inherit" }}>

      {/* Toast */}
      {feedback && (
        <div style={{
          position: "fixed", bottom: "24px", right: "28px", zIndex: 9999,
          background: "#0D1117", border: "1px solid #22C55E",
          borderLeft: "3px solid #22C55E",
          borderRadius: "6px", padding: "12px 18px",
          fontSize: "12px", fontWeight: 600, color: "#22C55E",
          boxShadow: "0 4px 24px rgba(0,0,0,0.4)",
          animation: "slideUp 0.2s ease",
        }}>
          ✓ {feedback}
        </div>
      )}

      {/* Page Header */}
      <div style={{ marginBottom: "28px", display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
        <div>
          <div style={{ fontSize: "11px", fontWeight: 600, color: "#3B82F6", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "6px" }}>
            Dashboard
          </div>
          <h1 style={{ fontSize: "22px", fontWeight: 700, color: "#F1F5F9", margin: 0, letterSpacing: "-0.4px" }}>
            Overview
          </h1>
          <p style={{ fontSize: "12px", color: "#64748B", marginTop: "4px", fontWeight: 400 }}>
            Real-time product metrics and catalogue management.
          </p>
        </div>
        <div style={{ display: "flex", gap: "8px" }}>
          <Link href="/admin/products/new" style={{
            display: "inline-flex", alignItems: "center", gap: "6px",
            padding: "8px 16px", borderRadius: "6px",
            background: "#3B82F6", color: "white",
            fontSize: "12px", fontWeight: 600, textDecoration: "none",
            transition: "background 150ms ease",
          }}>
            <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Add Product
          </Link>
          <Link href="/admin/promotions" style={{
            display: "inline-flex", alignItems: "center", gap: "6px",
            padding: "8px 16px", borderRadius: "6px",
            background: "#1A2235", border: "1px solid #2D3748", color: "#94A3B8",
            fontSize: "12px", fontWeight: 600, textDecoration: "none",
          }}>
            Campaigns
          </Link>
        </div>
      </div>

      {/* Stat Cards */}
      {loading ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "12px", marginBottom: "28px" }}>
          {[...Array(4)].map((_, i) => (
            <div key={i} style={{ ...S.card, height: "88px", animation: "pulse 1.5s ease-in-out infinite" }} />
          ))}
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "12px", marginBottom: "28px" }}>
          <StatCard label="Total Products" value={stats?.totalProducts || 0} sub="In active catalogue" />
          <StatCard label="Catalogue Value" value={`LKR ${((stats?.totalInventoryValue || 0) / 1000000).toFixed(1)}M`} sub="Estimated asset total" accent="#3B82F6" />
          <StatCard label="Active Campaigns" value={stats?.activePosters || 0} sub="Hero banners · Vouchers" />
          <StatCard label="Stock Units" value={stats?.totalStockUnits || 0} sub="Physical inventory ready" accent="#22C55E" />
        </div>
      )}

      {/* Products Table */}
      <div style={{ ...S.card, padding: 0, overflow: "hidden" }}>
        {/* Table Header */}
        <div style={{
          padding: "16px 20px", borderBottom: "1px solid #1E2530",
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          <div>
            <div style={{ fontSize: "13px", fontWeight: 700, color: "#E2E8F0" }}>Recent Products</div>
            <div style={{ fontSize: "11px", color: "#64748B", marginTop: "2px" }}>Latest entries in the database</div>
          </div>
          <Link href="/admin/products" style={{
            fontSize: "11px", fontWeight: 600, color: "#3B82F6", textDecoration: "none",
          }}>
            View all ({stats?.totalProducts || 0}) →
          </Link>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "700px" }}>
            <thead>
              <tr>
                {["Product", "Brand", "Category", "Price", "Stock", "Featured", "Actions"].map((h) => (
                  <th key={h} style={{ ...S.th, textAlign: h === "Actions" ? "right" : "left" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading
                ? [...Array(5)].map((_, i) => (
                    <tr key={i}>
                      {[...Array(7)].map((__, j) => (
                        <td key={j} style={S.td}>
                          <div style={{ height: "14px", borderRadius: "4px", background: "#1A2235", animation: "pulse 1.5s ease-in-out infinite" }} />
                        </td>
                      ))}
                    </tr>
                  ))
                : products.map((p) => {
                    const stockBadge = p.in_stock ? Badge({ type: "success" }) : Badge({ type: "warning" });
                    const featBadge = p.is_featured ? Badge({ type: "blue" }) : Badge({ type: "neutral" });
                    return (
                      <tr
                        key={p.id}
                        style={{ transition: "background 100ms" }}
                        onMouseEnter={(e) => (e.currentTarget as HTMLElement).style.background = "#0F151E"}
                        onMouseLeave={(e) => (e.currentTarget as HTMLElement).style.background = "transparent"}
                      >
                        {/* Product */}
                        <td style={S.td}>
                          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                            <div style={{
                              width: "36px", height: "36px", borderRadius: "6px",
                              overflow: "hidden", background: "#141820",
                              border: "1px solid #1E2530", flexShrink: 0,
                            }}>
                              <img
                                src={getProductImage(p.id, p.image_url)}
                                alt={p.name}
                                style={{ width: "100%", height: "100%", objectFit: "cover" }}
                                loading="lazy"
                              />
                            </div>
                            <div>
                              <div style={{ fontSize: "12px", fontWeight: 600, color: "#E2E8F0", whiteSpace: "nowrap" }}>{p.name}</div>
                              <div style={{ fontSize: "10px", color: "#475569", fontFamily: "monospace", marginTop: "1px" }}>
                                {p.id.slice(0, 10)}
                              </div>
                            </div>
                          </div>
                        </td>
                        {/* Brand */}
                        <td style={S.td}>{p.brand || "—"}</td>
                        {/* Category */}
                        <td style={S.td}>
                          <span style={{ fontSize: "11px", fontWeight: 600, color: "#94A3B8" }}>{p.category}</span>
                        </td>
                        {/* Price */}
                        <td style={{ ...S.td, fontFamily: "monospace", fontWeight: 700, color: "#F1F5F9", fontSize: "12px" }}>
                          {fmt(p.price)}
                        </td>
                        {/* Stock */}
                        <td style={S.td}>
                          <span style={{
                            display: "inline-block", padding: "2px 8px", borderRadius: "4px", fontSize: "10px", fontWeight: 700,
                            background: stockBadge.bg, color: stockBadge.color,
                            border: `1px solid ${stockBadge.border}`,
                          }}>
                            {p.in_stock ? "In Stock" : "Sold Out"}
                          </span>
                        </td>
                        {/* Featured */}
                        <td style={S.td}>
                          <button
                            onClick={() => handleToggleFeatured(p)}
                            style={{
                              display: "inline-block", padding: "2px 8px", borderRadius: "4px", fontSize: "10px", fontWeight: 700,
                              background: featBadge.bg, color: featBadge.color,
                              border: `1px solid ${featBadge.border}`,
                              cursor: "pointer", transition: "opacity 150ms",
                            }}
                          >
                            {p.is_featured ? "Featured" : "Standard"}
                          </button>
                        </td>
                        {/* Actions */}
                        <td style={{ ...S.td, textAlign: "right" }}>
                          <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "6px" }}>
                            <Link
                              href={`/products/${p.id}`}
                              target="_blank"
                              style={{
                                display: "inline-flex", alignItems: "center", justifyContent: "center",
                                width: "28px", height: "28px", borderRadius: "5px",
                                background: "#141820", border: "1px solid #1E2530", color: "#64748B",
                                textDecoration: "none", transition: "color 120ms, border-color 120ms",
                              }}
                              title="View product"
                            >
                              <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                              </svg>
                            </Link>
                            <button
                              onClick={() => handleDelete(p.id, p.name)}
                              disabled={deletingId === p.id}
                              style={{
                                display: "inline-flex", alignItems: "center", justifyContent: "center",
                                width: "28px", height: "28px", borderRadius: "5px",
                                background: "#1A0D0D", border: "1px solid #3D1515", color: "#F87171",
                                cursor: "pointer", opacity: deletingId === p.id ? 0.5 : 1,
                              }}
                              title="Delete product"
                            >
                              <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
            </tbody>
          </table>
        </div>
      </div>

      <style jsx global>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>
    </div>
  );
}