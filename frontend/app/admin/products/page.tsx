"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { fetchProducts, deleteProduct, updateProduct, Product } from "@/lib/api";
import { getProductImage } from "@/lib/productImages";

const CATEGORIES = ["All", "Luxury", "Automatic", "Sport", "Smart"];

const S = {
  card: { background: "#0D1117", border: "1px solid #1E2530", borderRadius: "8px" } as React.CSSProperties,
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

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [cat, setCat] = useState("All");
  const [feedback, setFeedback] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      setProducts(await fetchProducts());
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
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
      toast(`"${name}" deleted.`);
    } catch (err: any) { alert(err.message || "Failed to delete"); }
    finally { setDeletingId(null); }
  };

  const handleToggleFeatured = async (product: Product) => {
    try {
      const updated = await updateProduct(product.id, { is_featured: !product.is_featured });
      setProducts((prev) => prev.map((p) => p.id === product.id ? { ...p, is_featured: updated.is_featured } : p));
      toast(`"${product.name}" updated.`);
    } catch (err: any) { alert(err.message || "Failed to update"); }
  };

  const fmt = (n: number) => `LKR ${Number(n || 0).toLocaleString("en-US")}`;

  const filtered = useMemo(() => products.filter((p) => {
    const q = search.toLowerCase();
    return (cat === "All" || p.category === cat) &&
      (!q || p.name.toLowerCase().includes(q) || (p.brand || "").toLowerCase().includes(q) || p.category.toLowerCase().includes(q));
  }), [products, cat, search]);

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto", fontFamily: "inherit" }}>
      {/* Toast */}
      {feedback && (
        <div style={{
          position: "fixed", bottom: "24px", right: "28px", zIndex: 9999,
          background: "#0D1117", border: "1px solid #22C55E", borderLeft: "3px solid #22C55E",
          borderRadius: "6px", padding: "12px 18px",
          fontSize: "12px", fontWeight: 600, color: "#22C55E",
          boxShadow: "0 4px 24px rgba(0,0,0,0.4)", animation: "slideUp 0.2s ease",
        }}>
          ✓ {feedback}
        </div>
      )}

      {/* Header */}
      <div style={{ marginBottom: "24px", display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
        <div>
          <div style={{ fontSize: "11px", fontWeight: 600, color: "#3B82F6", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "5px" }}>
            Inventory
          </div>
          <h1 style={{ fontSize: "22px", fontWeight: 700, color: "#F1F5F9", margin: 0, letterSpacing: "-0.4px" }}>
            Product Catalogue
          </h1>
          <p style={{ fontSize: "12px", color: "#64748B", marginTop: "4px" }}>
            {products.length} products in database · {filtered.length} shown
          </p>
        </div>
        <Link href="/admin/products/new" style={{
          display: "inline-flex", alignItems: "center", gap: "6px",
          padding: "8px 16px", borderRadius: "6px",
          background: "#3B82F6", color: "white",
          fontSize: "12px", fontWeight: 600, textDecoration: "none",
        }}>
          <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Add Product
        </Link>
      </div>

      {/* Filter Bar */}
      <div style={{
        ...S.card, padding: "14px 16px", marginBottom: "16px",
        display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap",
      }}>
        {/* Search */}
        <div style={{ position: "relative", flex: "1 1 220px", minWidth: "180px" }}>
          <svg style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", color: "#475569" }}
            width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, brand or category..."
            style={{
              width: "100%", background: "#141820", border: "1px solid #1E2530",
              borderRadius: "6px", padding: "7px 10px 7px 30px",
              fontSize: "12px", color: "#E2E8F0", outline: "none",
              boxSizing: "border-box",
            }}
          />
        </div>

        {/* Category pills */}
        <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
          {CATEGORIES.map((c) => (
            <button
              key={c}
              onClick={() => setCat(c)}
              style={{
                padding: "5px 12px", borderRadius: "4px", fontSize: "11px", fontWeight: 600,
                cursor: "pointer", transition: "all 120ms",
                background: cat === c ? "#3B82F6" : "#141820",
                color: cat === c ? "white" : "#64748B",
                border: cat === c ? "1px solid #3B82F6" : "1px solid #1E2530",
              }}
            >
              {c}
            </button>
          ))}
        </div>

        <div style={{ marginLeft: "auto", fontSize: "11px", color: "#475569", fontWeight: 600, whiteSpace: "nowrap" }}>
          {filtered.length} result{filtered.length !== 1 ? "s" : ""}
        </div>
      </div>

      {/* Table */}
      <div style={{ ...S.card, overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "750px" }}>
            <thead>
              <tr>
                {["Product", "Brand", "Category", "Movement", "Price", "Status", "Featured", "Actions"].map((h) => (
                  <th key={h} style={{ ...S.th, textAlign: h === "Actions" ? "right" : "left" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(6)].map((_, i) => (
                  <tr key={i}>
                    {[...Array(8)].map((__, j) => (
                      <td key={j} style={S.td}>
                        <div style={{ height: "14px", borderRadius: "4px", background: "#1A2235", animation: "pulse 1.5s ease-in-out infinite" }} />
                      </td>
                    ))}
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ ...S.td, textAlign: "center", padding: "48px", color: "#475569" }}>
                    <div style={{ fontSize: "32px", marginBottom: "8px" }}>🔍</div>
                    <div style={{ fontWeight: 600, color: "#64748B" }}>No products match your filters.</div>
                  </td>
                </tr>
              ) : (
                filtered.map((p) => (
                  <tr
                    key={p.id}
                    onMouseEnter={(e) => (e.currentTarget as HTMLElement).style.background = "#0F151E"}
                    onMouseLeave={(e) => (e.currentTarget as HTMLElement).style.background = "transparent"}
                    style={{ transition: "background 100ms" }}
                  >
                    {/* Product */}
                    <td style={S.td}>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <div style={{
                          width: "38px", height: "38px", borderRadius: "6px",
                          overflow: "hidden", background: "#141820",
                          border: "1px solid #1E2530", flexShrink: 0,
                        }}>
                          <img src={getProductImage(p.id, p.image_url)} alt={p.name}
                            style={{ width: "100%", height: "100%", objectFit: "cover" }} loading="lazy" />
                        </div>
                        <div>
                          <div style={{ fontSize: "12px", fontWeight: 600, color: "#E2E8F0", maxWidth: "180px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {p.name}
                          </div>
                          <div style={{ fontSize: "10px", color: "#475569", fontFamily: "monospace", marginTop: "1px" }}>
                            {p.id}
                          </div>
                        </div>
                      </div>
                    </td>
                    {/* Brand */}
                    <td style={{ ...S.td, fontWeight: 500, color: "#94A3B8" }}>{p.brand || "—"}</td>
                    {/* Category */}
                    <td style={S.td}>
                      <span style={{
                        display: "inline-block", padding: "2px 7px", borderRadius: "4px", fontSize: "10px", fontWeight: 700,
                        background: "rgba(100,116,139,0.12)", color: "#94A3B8",
                        border: "1px solid rgba(100,116,139,0.2)",
                      }}>{p.category}</span>
                    </td>
                    {/* Movement */}
                    <td style={{ ...S.td, fontFamily: "monospace", fontSize: "10px", color: "#475569", maxWidth: "140px" }}>
                      <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", display: "block" }}>
                        {p.movement || "Swiss ETA"}
                      </span>
                    </td>
                    {/* Price */}
                    <td style={{ ...S.td, fontFamily: "monospace", fontWeight: 700, color: "#F1F5F9", fontSize: "12px" }}>
                      {fmt(p.price)}
                    </td>
                    {/* Stock */}
                    <td style={S.td}>
                      <span style={{
                        display: "inline-block", padding: "2px 7px", borderRadius: "4px", fontSize: "10px", fontWeight: 700,
                        background: p.in_stock ? "rgba(34,197,94,0.12)" : "rgba(239,68,68,0.12)",
                        color: p.in_stock ? "#22C55E" : "#F87171",
                        border: `1px solid ${p.in_stock ? "rgba(34,197,94,0.25)" : "rgba(239,68,68,0.25)"}`,
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
                          cursor: "pointer", transition: "all 120ms",
                          background: p.is_featured ? "rgba(59,130,246,0.12)" : "rgba(100,116,139,0.08)",
                          color: p.is_featured ? "#60A5FA" : "#64748B",
                          border: `1px solid ${p.is_featured ? "rgba(59,130,246,0.25)" : "rgba(100,116,139,0.15)"}`,
                        }}
                      >
                        {p.is_featured ? "★ Featured" : "Standard"}
                      </button>
                    </td>
                    {/* Actions */}
                    <td style={{ ...S.td, textAlign: "right" }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "6px" }}>
                        <Link href={`/products/${p.id}`} target="_blank"
                          style={{
                            display: "inline-flex", alignItems: "center", justifyContent: "center",
                            width: "28px", height: "28px", borderRadius: "5px",
                            background: "#141820", border: "1px solid #1E2530", color: "#64748B",
                            textDecoration: "none",
                          }}
                          title="View live">
                          <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
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
                            cursor: deletingId === p.id ? "not-allowed" : "pointer",
                            opacity: deletingId === p.id ? 0.5 : 1,
                          }}
                          title="Delete">
                          <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
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
        input::placeholder { color: #475569; }
        input:focus { border-color: #3B82F6 !important; box-shadow: 0 0 0 2px rgba(59,130,246,0.15); }
      `}</style>
    </div>
  );
}
