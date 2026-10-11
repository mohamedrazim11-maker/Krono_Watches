"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { fetchStats, fetchProducts, fetchOrders, fetchPosters, deleteProduct, updateProduct, updateOrderStatus, Product, Stats, Order, Poster } from "@/lib/api";
import { getProductImage } from "@/lib/productImages";

const S = {
  card: {
    background: "#0D0D0D",
    border: "1px solid #1E1E1E",
    borderRadius: "14px",
    padding: "22px",
    boxShadow: "0 8px 30px rgba(0,0,0,0.7)",
  } as React.CSSProperties,
  label: {
    fontSize: "10.5px",
    fontWeight: 700,
    color: "#71717A",
    textTransform: "uppercase" as const,
    letterSpacing: "0.08em",
    marginBottom: "8px",
  } as React.CSSProperties,
  value: {
    fontSize: "28px",
    fontWeight: 800,
    color: "#F8FAFC",
    letterSpacing: "-0.5px",
    lineHeight: 1,
    fontFamily: "var(--font-mono, monospace)",
  } as React.CSSProperties,
  sub: {
    fontSize: "11.5px",
    color: "#A1A1AA",
    marginTop: "6px",
    fontWeight: 500,
  } as React.CSSProperties,
  th: {
    padding: "13px 16px",
    fontSize: "10.5px",
    fontWeight: 700,
    color: "#71717A",
    textTransform: "uppercase" as const,
    letterSpacing: "0.08em",
    borderBottom: "1px solid #1A1A1A",
    background: "#121212",
    whiteSpace: "nowrap" as const,
  } as React.CSSProperties,
  td: {
    padding: "14px 16px",
    fontSize: "12px",
    color: "#F8FAFC",
    borderBottom: "1px solid #1A1A1A",
    verticalAlign: "middle" as const,
  } as React.CSSProperties,
};

function StatCard({ label, value, sub, accent }: { label: string; value: string | number; sub: string; accent?: string }) {
  return (
    <div style={S.card}>
      <div style={S.label}>{label}</div>
      <div style={{ ...S.value, color: accent || "#F8FAFC" }}>{value}</div>
      <div style={S.sub}>{sub}</div>
    </div>
  );
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [posters, setPosters] = useState<Poster[]>([]);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const [s, p, o, post] = await Promise.all([
        fetchStats(),
        fetchProducts(),
        fetchOrders(),
        fetchPosters().catch(() => []),
      ]);
      setStats(s);
      setProducts(p.slice(0, 8));
      setOrders(o.slice(0, 5));
      setPosters(post);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const toast = (msg: string) => {
    setFeedback(msg);
    setTimeout(() => setFeedback(null), 3000);
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Permanently delete timepiece "${name}" from the boutique vault?`)) return;
    setDeletingId(id);
    try {
      await deleteProduct(id);
      setProducts((prev) => prev.filter((p) => p.id !== id));
      setStats((prev) => (prev ? { ...prev, totalProducts: Math.max(0, prev.totalProducts - 1) } : null));
      toast(`"${name}" removed from vault.`);
    } catch (err: any) {
      alert(err.message || "Failed to delete");
    } finally {
      setDeletingId(null);
    }
  };

  const handleToggleFeatured = async (product: Product) => {
    try {
      const updated = await updateProduct(product.id, { is_featured: !product.is_featured });
      setProducts((prev) =>
        prev.map((p) => (p.id === product.id ? { ...p, is_featured: updated.is_featured } : p))
      );
      toast(`Homepage showcase updated for "${product.name}".`);
    } catch (err: any) {
      alert(err.message || "Failed to update");
    }
  };

  const handleOrderStatusQuickChange = async (orderId: string, status: string) => {
    try {
      await updateOrderStatus(orderId, { status });
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId || o.order_number === orderId ? { ...o, status } : o))
      );
      toast(`Order status updated to ${status.replace("_", " ")}`);
    } catch (err: any) {
      alert(err.message || "Failed to update order");
    }
  };

  const fmt = (n: number) => `LKR ${Number(n || 0).toLocaleString("en-US")}`;

  const heroPoster = posters.find((p) => p.section_id === "hero_drop" || p.section_id === "hero");
  const totalOrderRevenue = orders.reduce((acc, o) => acc + (Number(o.total_amount) || 0), 0);

  return (
    <div style={{ maxWidth: "1280px", margin: "0 auto", fontFamily: "inherit" }}>
      {/* Toast */}
      {feedback && (
        <div
          style={{
            position: "fixed",
            bottom: "28px",
            right: "32px",
            zIndex: 9999,
            background: "#141414",
            border: "1px solid #2E2E2E",
            borderLeft: "4px solid #FFFFFF",
            borderRadius: "8px",
            padding: "14px 20px",
            fontSize: "12.5px",
            fontWeight: 600,
            color: "#FFFFFF",
            boxShadow: "0 10px 30px rgba(0,0,0,0.8)",
          }}
        >
          ✓ {feedback}
        </div>
      )}

      {/* Top Banner / Storefront Sync Bar */}
      <div
        style={{
          background: "linear-gradient(135deg, #141414 0%, #0A0A0A 100%)",
          border: "1px solid #222222",
          borderRadius: "14px",
          padding: "16px 22px",
          marginBottom: "24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "14px",
          boxShadow: "0 8px 30px rgba(0,0,0,0.7)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
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
              color: "#FFFFFF",
              fontSize: "16px",
              boxShadow: "0 2px 10px rgba(0,0,0,0.5)",
            }}
          >
            ✦
          </div>
          <div>
            <div style={{ fontSize: "13.5px", fontWeight: 800, color: "#F8FAFC", letterSpacing: "0.02em" }}>
              Krono Watches · Storefront Active
            </div>
            <div style={{ fontSize: "11px", color: "#A1A1AA", marginTop: "1px" }}>
              Live inventory vault, homepage showcases, checkout orders, and flash campaign banners are unified.
            </div>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <Link
            href="/"
            target="_blank"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              padding: "8px 16px",
              borderRadius: "8px",
              background: "#FFFFFF",
              color: "#000000",
              fontSize: "12px",
              fontWeight: 800,
              textDecoration: "none",
              boxShadow: "0 2px 10px rgba(0, 0, 0, 0.5)",
              transition: "background 140ms ease",
            }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = "#E4E4E7")}
            onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "#FFFFFF")}
          >
            <span>Live Storefront ↗</span>
          </Link>
          <Link
            href="/catalog"
            target="_blank"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              padding: "8px 16px",
              borderRadius: "8px",
              background: "#141414",
              border: "1px solid #262626",
              color: "#FFFFFF",
              fontSize: "12px",
              fontWeight: 700,
              textDecoration: "none",
              transition: "border-color 140ms ease",
            }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.borderColor = "#3F3F46")}
            onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.borderColor = "#262626")}
          >
            <span>Catalogue View ↗</span>
          </Link>
        </div>
      </div>

      {/* Page Header */}
      <div style={{ marginBottom: "28px", display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <div style={{ fontSize: "11px", fontWeight: 700, color: "#71717A", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: "6px" }}>
            Admin Management Suite
          </div>
          <h1
            style={{
              fontSize: "26px",
              fontWeight: 800,
              color: "#FFFFFF",
              margin: 0,
              fontFamily: "var(--font-sans, system-ui, sans-serif)",
              letterSpacing: "-0.02em",
            }}
          >
            Horological Operations & Overview
          </h1>
          <p style={{ fontSize: "12.5px", color: "#A1A1AA", marginTop: "4px" }}>
            Real-time certified Swiss inventory, VIP client acquisitions, and storefront curation.
          </p>
        </div>

        <div style={{ display: "flex", gap: "10px" }}>
          <Link
            href="/admin/products/new"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              padding: "9px 18px",
              borderRadius: "8px",
              background: "#FFFFFF",
              border: "1px solid #FFFFFF",
              color: "#000000",
              fontSize: "12px",
              fontWeight: 800,
              textDecoration: "none",
              boxShadow: "0 2px 10px rgba(0, 0, 0, 0.5)",
              transition: "background 140ms ease",
            }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = "#E4E4E7")}
            onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "#FFFFFF")}
          >
            <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Add Timepiece
          </Link>
          <Link
            href="/admin/orders"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              padding: "9px 18px",
              borderRadius: "8px",
              background: "#141414",
              border: "1px solid #282828",
              color: "#FFFFFF",
              fontSize: "12px",
              fontWeight: 700,
              textDecoration: "none",
              transition: "border-color 140ms ease",
            }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.borderColor = "#3F3F46")}
            onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.borderColor = "#282828")}
          >
            View VIP Orders ({orders.length})
          </Link>
          <Link
            href="/admin/promotions"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              padding: "9px 18px",
              borderRadius: "8px",
              background: "#141414",
              border: "1px solid #222222",
              color: "#A1A1AA",
              fontSize: "12px",
              fontWeight: 600,
              textDecoration: "none",
              transition: "color 140ms ease",
            }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = "#FFFFFF")}
            onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = "#A1A1AA")}
          >
            Campaigns
          </Link>
        </div>
      </div>

      {/* Stat Cards - Week 8 Admin Dashboard (Slide 1 & 9) */}
      {loading ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px", marginBottom: "28px" }}>
          {[...Array(4)].map((_, i) => (
            <div key={i} style={{ ...S.card, height: "96px", opacity: 0.5 }} />
          ))}
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px", marginBottom: "28px" }}>
          <StatCard
            label="Products"
            value={stats?.totalProducts || products.length}
            sub={`${stats?.featuredCount || 0} featured on storefront`}
            accent="#FFFFFF"
          />
          <StatCard
            label="Orders"
            value={stats?.totalOrders || orders.length}
            sub={`${fmt(totalOrderRevenue)} total revenue`}
            accent="#FFFFFF"
          />
          <StatCard
            label="Low Stock"
            value={stats?.lowStockCount ?? products.filter((p) => (p.stock_qty ?? p.stock_count ?? 0) <= 5).length}
            sub="Timepieces with ≤ 5 units in vault"
            accent="#F59E0B"
          />
          <StatCard
            label="Database Status"
            value="Connected ✓"
            sub="Source of truth persistent DB"
            accent="#22C55E"
          />
        </div>
      )}

      {/* Storefront Campaign Snapshot Card */}
      {heroPoster && (
        <div
          style={{
            ...S.card,
            marginBottom: "28px",
            background: "linear-gradient(135deg, #141414 0%, #0A0A0A 100%)",
            border: "1px solid #222222",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "16px",
          }}
        >
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
              <span
                style={{
                  fontSize: "9.5px",
                  fontWeight: 800,
                  textTransform: "uppercase",
                  padding: "3px 8px",
                  borderRadius: "4px",
                  background: "#222222",
                  color: "#FFFFFF",
                  border: "1px solid #333333",
                  fontFamily: "var(--font-mono, monospace)",
                }}
              >
                LIVE STOREFRONT HERO DROP
              </span>
              <span style={{ fontSize: "11px", color: "#A1A1AA", fontWeight: 700 }}>
                {heroPoster.badge || "2026 Season Collection"}
              </span>
            </div>
            <h3 style={{ margin: 0, fontSize: "17px", fontWeight: 800, color: "#FFFFFF", fontFamily: "var(--font-sans, system-ui, sans-serif)" }}>
              "{heroPoster.title}"
            </h3>
            <p style={{ margin: "4px 0 0 0", fontSize: "12px", color: "#71717A" }}>
              Featured Showcase: {heroPoster.featured_product_name || "Aurelia Master Classic"} · {heroPoster.featured_product_price || "LKR 385,000"} · {heroPoster.discount_text || "Save 30% Today"}
            </p>
          </div>

          <Link
            href="/admin/promotions"
            style={{
              padding: "9px 18px",
              borderRadius: "8px",
              background: "#181818",
              border: "1px solid #2E2E2E",
              color: "#FFFFFF",
              fontSize: "12px",
              fontWeight: 700,
              textDecoration: "none",
              transition: "border-color 140ms ease",
            }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.borderColor = "#555555")}
            onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.borderColor = "#2E2E2E")}
          >
            Edit Storefront Hero Campaign →
          </Link>
        </div>
      )}

      {/* Recent Storefront Orders Section */}
      <div style={{ ...S.card, padding: 0, overflow: "hidden", marginBottom: "28px" }}>
        <div
          style={{
            padding: "16px 20px",
            borderBottom: "1px solid #1A1A1A",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            background: "#121212",
          }}
        >
          <div>
            <div style={{ fontSize: "14px", fontWeight: 800, color: "#F8FAFC", display: "flex", alignItems: "center", gap: "8px" }}>
              <span>Recent Client Watch Orders</span>
              <span
                style={{
                  fontSize: "10px",
                  fontWeight: 700,
                  padding: "2px 6px",
                  borderRadius: "4px",
                  background: "#1A1A1A",
                  color: "#E4E4E7",
                  border: "1px solid #2E2E2E",
                }}
              >
                Storefront Live
              </span>
            </div>
            <div style={{ fontSize: "11px", color: "#71717A", marginTop: "2px" }}>
              Orders placed by clients via online checkout & PayHere
            </div>
          </div>
          <Link href="/admin/orders" style={{ fontSize: "11.5px", fontWeight: 700, color: "#FFFFFF", textDecoration: "none" }}>
            View all orders ({orders.length}) →
          </Link>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "750px" }}>
            <thead>
              <tr>
                {["Order #", "Client", "Timepiece(s)", "Total (LKR)", "Payment", "Status", "Quick Action"].map((h) => (
                  <th key={h} style={S.th}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(2)].map((_, i) => (
                  <tr key={i}>
                    <td colSpan={7} style={{ padding: "16px", textAlign: "center", color: "#71717A" }}>
                      Loading client orders...
                    </td>
                  </tr>
                ))
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ padding: "32px 16px", textAlign: "center", color: "#71717A" }}>
                    No orders placed yet. Simulate a checkout on the storefront to test live tracking!
                  </td>
                </tr>
              ) : (
                orders.map((o) => (
                  <tr
                    key={o.id || o.order_number}
                    style={{ transition: "background 100ms" }}
                    onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = "rgba(255, 255, 255, 0.03)")}
                    onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "transparent")}
                  >
                    <td style={S.td}>
                      <span style={{ fontWeight: 800, color: "#FFFFFF", fontFamily: "var(--font-mono, monospace)" }}>
                        {o.order_number || o.id}
                      </span>
                    </td>
                    <td style={S.td}>
                      <div style={{ fontWeight: 700, color: "#F8FAFC" }}>{o.customer_name}</div>
                      <div style={{ fontSize: "10.5px", color: "#71717A" }}>{o.customer_email}</div>
                    </td>
                    <td style={S.td}>
                      <div style={{ maxWidth: "200px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {(o.items || []).map((it) => `${it.product_name} (x${it.quantity})`).join(", ") || "Timepiece"}
                      </div>
                      {o.wrist_size && (
                        <div style={{ fontSize: "10px", color: "#A1A1AA", marginTop: "2px" }}>
                          Sizing: {o.wrist_size}
                        </div>
                      )}
                    </td>
                    <td style={S.td}>
                      <span style={{ fontWeight: 800, color: "#F8FAFC", fontFamily: "var(--font-mono, monospace)" }}>
                        {fmt(o.total_amount)}
                      </span>
                    </td>
                    <td style={S.td}>
                      <span
                        style={{
                          fontSize: "10px",
                          fontWeight: 700,
                          padding: "2px 6px",
                          borderRadius: "4px",
                          background: o.payment_status === "completed" ? "rgba(16, 185, 129, 0.15)" : "rgba(245, 158, 11, 0.15)",
                          color: o.payment_status === "completed" ? "#34D399" : "#FBBF24",
                          border: o.payment_status === "completed" ? "1px solid rgba(16, 185, 129, 0.3)" : "1px solid rgba(245, 158, 11, 0.3)",
                        }}
                      >
                        {o.payment_status === "completed" ? "Paid" : "Pending"}
                      </span>
                    </td>
                    <td style={S.td}>
                      <span
                        style={{
                          fontSize: "11px",
                          fontWeight: 700,
                          color:
                            o.status === "delivered"
                              ? "#34D399"
                              : o.status === "authenticated"
                              ? "#FFFFFF"
                              : o.status === "dispatched"
                              ? "#C084FC"
                              : "#F8FAFC",
                          textTransform: "capitalize",
                        }}
                      >
                        {(o.status || "pending_payment").replace("_", " ")}
                      </span>
                    </td>
                    <td style={S.td}>
                      <div style={{ display: "flex", gap: "6px" }}>
                        {o.status !== "authenticated" && (
                          <button
                            onClick={() => handleOrderStatusQuickChange(o.id || o.order_number, "authenticated")}
                            style={{
                              padding: "4px 8px",
                              borderRadius: "4px",
                              background: "#181818",
                              border: "1px solid #333333",
                              color: "#FFFFFF",
                              fontSize: "10.5px",
                              fontWeight: 700,
                              cursor: "pointer",
                            }}
                          >
                            Authenticate
                          </button>
                        )}
                        <Link
                          href="/admin/orders"
                          style={{
                            padding: "4px 8px",
                            borderRadius: "4px",
                            background: "#141414",
                            border: "1px solid #262626",
                            color: "#A1A1AA",
                            fontSize: "10.5px",
                            textDecoration: "none",
                          }}
                        >
                          Dossier
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Products Table (Curated Storefront Catalogue) */}
      <div style={{ ...S.card, padding: 0, overflow: "hidden" }}>
        {/* Table Header */}
        <div
          style={{
            padding: "16px 20px",
            borderBottom: "1px solid #1A1A1A",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            background: "#121212",
          }}
        >
          <div>
            <div style={{ fontSize: "14px", fontWeight: 800, color: "#F8FAFC" }}>
              Timepiece Catalogue & Storefront Curation
            </div>
            <div style={{ fontSize: "11px", color: "#71717A", marginTop: "2px" }}>
              Manage certified movements, retail pricing, and storefront homepage showcases.
            </div>
          </div>
          <Link href="/admin/products" style={{ fontSize: "11.5px", fontWeight: 700, color: "#FFFFFF", textDecoration: "none" }}>
            View all timepieces ({stats?.totalProducts || 0}) →
          </Link>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "850px" }}>
            <thead>
              <tr>
                {["Timepiece", "Brand", "Calibre / Movement", "Case", "Retail (LKR)", "Stock", "Storefront Showcase", "Actions"].map((h) => (
                  <th key={h} style={{ ...S.th, textAlign: h === "Actions" ? "right" : "left" }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading
                ? [...Array(5)].map((_, i) => (
                    <tr key={i}>
                      <td colSpan={8} style={{ padding: "16px", textAlign: "center", color: "#71717A" }}>
                        Loading catalogue...
                      </td>
                    </tr>
                  ))
                : products.map((p) => {
                    return (
                      <tr
                        key={p.id}
                        style={{ transition: "background 100ms" }}
                        onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = "rgba(255, 255, 255, 0.03)")}
                        onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "transparent")}
                      >
                        {/* Product Image and Name */}
                        <td style={S.td}>
                          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                            <div
                              style={{
                                width: "42px",
                                height: "42px",
                                borderRadius: "8px",
                                overflow: "hidden",
                                background: "#141414",
                                border: "1px solid #262626",
                                flexShrink: 0,
                              }}
                            >
                              <img
                                src={getProductImage(p.id, p.image_url)}
                                alt={p.name}
                                style={{ width: "100%", height: "100%", objectFit: "cover" }}
                                loading="lazy"
                              />
                            </div>
                            <div>
                              <div style={{ fontSize: "12.5px", fontWeight: 700, color: "#F8FAFC", whiteSpace: "nowrap" }}>
                                {p.name}
                              </div>
                              <div style={{ fontSize: "10.5px", color: "#71717A", fontFamily: "var(--font-mono, monospace)", marginTop: "1px" }}>
                                Ref: {p.id.slice(0, 14)}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Brand */}
                        <td style={S.td}>
                          <span
                            style={{
                              fontSize: "11px",
                              fontWeight: 800,
                              color: "#FFFFFF",
                              textTransform: "uppercase",
                              letterSpacing: "0.04em",
                            }}
                          >
                            {p.brand || "Krono Swiss"}
                          </span>
                        </td>

                        {/* Movement */}
                        <td style={S.td}>
                          <div style={{ fontSize: "11.5px", color: "#F8FAFC" }}>
                            {p.movement || "Swiss Calibre"}
                          </div>
                          <div style={{ fontSize: "10px", color: "#71717A" }}>
                            {p.category}
                          </div>
                        </td>

                        {/* Case & Size */}
                        <td style={S.td}>
                          <div style={{ fontSize: "11.5px", color: "#F8FAFC" }}>
                            {p.case_size || "40mm"}
                          </div>
                          <div style={{ fontSize: "10px", color: "#71717A" }}>
                            {p.case_material || "316L Steel"}
                          </div>
                        </td>

                        {/* Price */}
                        <td style={S.td}>
                          <div style={{ fontWeight: 800, color: "#F8FAFC", fontFamily: "var(--font-mono, monospace)" }}>
                            {fmt(p.price)}
                          </div>
                          {p.old_price && p.old_price > p.price ? (
                            <div style={{ fontSize: "10px", color: "#71717A", textDecoration: "line-through" }}>
                              {fmt(p.old_price)}
                            </div>
                          ) : null}
                        </td>

                        {/* Stock */}
                        <td style={S.td}>
                          <span
                            style={{
                              fontSize: "10.5px",
                              fontWeight: 700,
                              padding: "3px 8px",
                              borderRadius: "6px",
                              background: p.in_stock !== false ? "rgba(16, 185, 129, 0.15)" : "rgba(239, 68, 68, 0.15)",
                              color: p.in_stock !== false ? "#34D399" : "#F87171",
                              border: p.in_stock !== false ? "1px solid rgba(16, 185, 129, 0.3)" : "1px solid rgba(239, 68, 68, 0.3)",
                            }}
                          >
                            {p.in_stock !== false ? `${p.stock_count ?? 5} in vault` : "Sold Out"}
                          </span>
                        </td>

                        {/* Featured Showcase Toggle */}
                        <td style={S.td}>
                          <button
                            onClick={() => handleToggleFeatured(p)}
                            style={{
                              fontSize: "11px",
                              fontWeight: 700,
                              padding: "5px 12px",
                              borderRadius: "6px",
                              background: p.is_featured ? "rgba(255, 255, 255, 0.15)" : "#141414",
                              color: p.is_featured ? "#FFFFFF" : "#71717A",
                              border: p.is_featured ? "1px solid rgba(255, 255, 255, 0.3)" : "1px solid #262626",
                              cursor: "pointer",
                              transition: "all 120ms ease",
                            }}
                            title="Click to toggle featured display on storefront homepage"
                          >
                            {p.is_featured ? "★ Featured" : "☆ Standard"}
                          </button>
                        </td>

                        {/* Actions */}
                        <td style={{ ...S.td, textAlign: "right" }}>
                          <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "8px" }}>
                            <Link
                              href={`/products/${p.id}`}
                              target="_blank"
                              style={{
                                padding: "5px 10px",
                                borderRadius: "6px",
                                background: "#141414",
                                border: "1px solid #282828",
                                color: "#FFFFFF",
                                fontSize: "11px",
                                fontWeight: 600,
                                textDecoration: "none",
                              }}
                              title="Inspect this timepiece on the live storefront"
                            >
                              View in Store ↗
                            </Link>
                            <button
                              disabled={deletingId === p.id}
                              onClick={() => handleDelete(p.id, p.name)}
                              style={{
                                padding: "5px 10px",
                                borderRadius: "6px",
                                background: "transparent",
                                border: "1px solid rgba(239, 68, 68, 0.25)",
                                color: "#F87171",
                                fontSize: "11px",
                                cursor: "pointer",
                              }}
                            >
                              {deletingId === p.id ? "..." : "Delete"}
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
    </div>
  );
}