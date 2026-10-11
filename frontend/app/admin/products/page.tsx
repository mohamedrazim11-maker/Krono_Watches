"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { fetchProducts, deleteProduct, updateProduct, Product } from "@/lib/api";
import { getProductImage } from "@/lib/productImages";

const BRANDS = ["All Brands", "Rolex", "Omega", "Patek Philippe", "Audemars Piguet", "Cartier", "Krono Swiss", "Tissot"];
const CATEGORIES = ["All Categories", "Luxury", "Dive Watches", "Chronograph", "Automatic", "Sports Watches", "Dress Watches"];

const S = {
  card: {
    background: "var(--card, #12221D)",
    border: "1px solid var(--border-subtle, rgba(0, 96, 57, 0.25))",
    borderRadius: "14px",
    boxShadow: "var(--neu-shadow-raised-sm, 4px 4px 10px rgba(0,0,0,0.7))",
  } as React.CSSProperties,
  th: {
    padding: "13px 16px",
    fontSize: "10.5px",
    fontWeight: 700,
    color: "var(--accent-muted, #8EAA9C)",
    textTransform: "uppercase" as const,
    letterSpacing: "0.08em",
    borderBottom: "1px solid var(--border-subtle, rgba(0, 96, 57, 0.25))",
    background: "var(--card-elevated, #162923)",
    whiteSpace: "nowrap" as const,
  } as React.CSSProperties,
  td: {
    padding: "14px 16px",
    fontSize: "12px",
    color: "var(--foreground, #F8FAFC)",
    borderBottom: "1px solid var(--border-subtle, rgba(0, 96, 57, 0.15))",
    verticalAlign: "middle" as const,
  } as React.CSSProperties,
};

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [brandFilter, setBrandFilter] = useState("All Brands");
  const [catFilter, setCatFilter] = useState("All Categories");
  const [feedback, setFeedback] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      setProducts(await fetchProducts());
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editFormData, setEditFormData] = useState({
    name: "",
    price: 0,
    stock_qty: 0,
    category: "",
    brand: "",
    image_url: "",
    is_active: true,
  });
  const [savingEdit, setSavingEdit] = useState(false);

  const toast = (msg: string) => {
    setFeedback(msg);
    setTimeout(() => setFeedback(null), 3000);
  };

  const openEditModal = (p: Product) => {
    setEditingProduct(p);
    setEditFormData({
      name: p.name,
      price: p.price,
      stock_qty: p.stock_qty ?? p.stock_count ?? 12,
      category: p.category || "Luxury",
      brand: p.brand || "Krono Swiss",
      image_url: p.image_url || "",
      is_active: p.is_active !== false,
    });
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    setSavingEdit(true);
    try {
      const updated = await updateProduct(editingProduct.id, {
        name: editFormData.name,
        price: Number(editFormData.price),
        stock_qty: Number(editFormData.stock_qty),
        stock_count: Number(editFormData.stock_qty),
        in_stock: Number(editFormData.stock_qty) > 0,
        category: editFormData.category,
        brand: editFormData.brand,
        image_url: editFormData.image_url,
        is_active: editFormData.is_active,
      });
      setProducts((prev) =>
        prev.map((p) => (p.id === editingProduct.id ? { ...p, ...updated } : p))
      );
      toast(`Changes saved to database for "${editFormData.name}".`);
      setEditingProduct(null);
    } catch (err: any) {
      alert(err.message || "Failed to update product");
    } finally {
      setSavingEdit(false);
    }
  };

  const handleQuickStockChange = async (product: Product, delta: number) => {
    const current = product.stock_qty ?? product.stock_count ?? 12;
    const newQty = Math.max(0, current + delta);
    try {
      await updateProduct(product.id, {
        stock_qty: newQty,
        stock_count: newQty,
        in_stock: newQty > 0,
      });
      setProducts((prev) =>
        prev.map((p) =>
          p.id === product.id ? { ...p, stock_qty: newQty, stock_count: newQty, in_stock: newQty > 0 } : p
        )
      );
      toast(`Stock for "${product.name}" updated to ${newQty}.`);
    } catch (err: any) {
      alert(err.message || "Failed to update stock");
    }
  };

  const handleToggleActive = async (product: Product) => {
    const newActiveState = product.is_active === false ? true : false;
    try {
      await updateProduct(product.id, {
        is_active: newActiveState,
        in_stock: newActiveState,
      });
      setProducts((prev) =>
        prev.map((p) =>
          p.id === product.id ? { ...p, is_active: newActiveState, in_stock: newActiveState } : p
        )
      );
      toast(
        newActiveState
          ? `"${product.name}" is now active in boutique catalog.`
          : `"${product.name}" safely deactivated (soft-deleted).`
      );
    } catch (err: any) {
      alert(err.message || "Failed to toggle active status");
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete or safely deactivate "${name}" from boutique vault?`)) return;
    setDeletingId(id);
    try {
      const res = await deleteProduct(id);
      if (res && res.softDeleted) {
        setProducts((prev) =>
          prev.map((p) => (p.id === id ? { ...p, is_active: false, in_stock: false } : p))
        );
        toast(`"${name}" deactivated safely (soft-deleted) to protect orders.`);
      } else {
        setProducts((prev) => prev.filter((p) => p.id !== id));
        toast(`"${name}" removed from vault.`);
      }
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
      toast(`Homepage showcase status updated for "${product.name}".`);
    } catch (err: any) {
      alert(err.message || "Failed to update");
    }
  };

  const fmt = (n: number) => `LKR ${Number(n || 0).toLocaleString("en-US")}`;

  const filtered = useMemo(() => {
    return products.filter((p) => {
      const q = search.toLowerCase();
      const matchBrand = brandFilter === "All Brands" || p.brand?.toLowerCase() === brandFilter.toLowerCase();
      const matchCat = catFilter === "All Categories" || p.category?.toLowerCase() === catFilter.toLowerCase();
      const matchSearch =
        !q ||
        p.name.toLowerCase().includes(q) ||
        (p.brand || "").toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        (p.movement || "").toLowerCase().includes(q);

      return matchBrand && matchCat && matchSearch;
    });
  }, [products, brandFilter, catFilter, search]);

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
            background: "var(--card-elevated, #162923)",
            border: "1px solid var(--accent, #00A362)",
            borderLeft: "4px solid var(--accent, #00A362)",
            borderRadius: "8px",
            padding: "14px 20px",
            fontSize: "12.5px",
            fontWeight: 600,
            color: "var(--foreground, #F8FAFC)",
            boxShadow: "0 10px 30px rgba(0,0,0,0.6)",
          }}
        >
          ✓ {feedback}
        </div>
      )}

      {/* Header */}
      <div style={{ marginBottom: "24px", display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <div style={{ fontSize: "11px", fontWeight: 800, color: "var(--rolex-gold, #C5A059)", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: "5px" }}>
            Vault Inventory
          </div>
          <h1
            style={{
              fontSize: "28px",
              fontWeight: 800,
              color: "var(--foreground, #F8FAFC)",
              margin: 0,
              fontFamily: "var(--font-serif, 'Cormorant Garamond', Georgia, serif)",
              letterSpacing: "0.02em",
            }}
          >
            Horological Timepiece Catalogue
          </h1>
          <p style={{ fontSize: "12.5px", color: "var(--accent-muted, #8EAA9C)", marginTop: "4px" }}>
            {products.length} certified timepieces in vault · {filtered.length} currently filtered
          </p>
        </div>

        <div style={{ display: "flex", gap: "10px" }}>
          <Link
            href="/catalog"
            target="_blank"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              padding: "9px 18px",
              borderRadius: "8px",
              background: "var(--card-elevated, #162923)",
              border: "1px solid var(--border-strong, rgba(0, 163, 98, 0.35))",
              color: "var(--rolex-gold, #C5A059)",
              fontSize: "12px",
              fontWeight: 700,
              textDecoration: "none",
            }}
          >
            <span>View Storefront Catalogue ↗</span>
          </Link>
          <Link
            href="/admin/products/new"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              padding: "9px 18px",
              borderRadius: "8px",
              background: "linear-gradient(145deg, #007345 0%, #004D2E 100%)",
              border: "1px solid var(--border-strong, rgba(0, 163, 98, 0.35))",
              color: "#FFFFFF",
              fontSize: "12px",
              fontWeight: 700,
              textDecoration: "none",
              boxShadow: "0 2px 10px rgba(0, 96, 57, 0.4)",
            }}
          >
            <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Register Timepiece
          </Link>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div
        style={{
          ...S.card,
          padding: "16px 20px",
          marginBottom: "20px",
          display: "flex",
          alignItems: "center",
          gap: "14px",
          flexWrap: "wrap",
        }}
      >
        {/* Search */}
        <div style={{ position: "relative", minWidth: "240px", flex: 1 }}>
          <input
            type="text"
            placeholder="Search timepiece by model, brand, calibre..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: "100%",
              background: "var(--background, #0E1A16)",
              border: "1px solid var(--border-subtle, rgba(0, 96, 57, 0.25))",
              borderRadius: "8px",
              padding: "9px 12px 9px 36px",
              fontSize: "12px",
              color: "var(--foreground, #F8FAFC)",
              outline: "none",
            }}
          />
          <svg
            style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", width: "15px", height: "15px", color: "var(--accent-muted, #8EAA9C)" }}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        {/* Brand Dropdown */}
        <select
          value={brandFilter}
          onChange={(e) => setBrandFilter(e.target.value)}
          style={{
            background: "var(--background, #0E1A16)",
            border: "1px solid var(--border-subtle, rgba(0, 96, 57, 0.25))",
            borderRadius: "8px",
            padding: "9px 14px",
            fontSize: "12px",
            color: "var(--rolex-gold, #C5A059)",
            fontWeight: 600,
            outline: "none",
            cursor: "pointer",
          }}
        >
          {BRANDS.map((b) => (
            <option key={b} value={b} style={{ background: "var(--card-elevated, #162923)", color: "#FFF" }}>
              {b}
            </option>
          ))}
        </select>

        {/* Category Dropdown */}
        <select
          value={catFilter}
          onChange={(e) => setCatFilter(e.target.value)}
          style={{
            background: "var(--background, #0E1A16)",
            border: "1px solid var(--border-subtle, rgba(0, 96, 57, 0.25))",
            borderRadius: "8px",
            padding: "9px 14px",
            fontSize: "12px",
            color: "var(--accent-muted, #8EAA9C)",
            fontWeight: 600,
            outline: "none",
            cursor: "pointer",
          }}
        >
          {CATEGORIES.map((c) => (
            <option key={c} value={c} style={{ background: "var(--card-elevated, #162923)", color: "#FFF" }}>
              {c}
            </option>
          ))}
        </select>
      </div>

      {/* Products Table */}
      <div style={{ ...S.card, padding: 0, overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "960px" }}>
            <thead>
              <tr>
                <th style={S.th}>Timepiece</th>
                <th style={S.th}>Brand</th>
                <th style={S.th}>Price (LKR)</th>
                <th style={S.th}>Stock & Vault Controls</th>
                <th style={S.th}>Status</th>
                <th style={S.th}>Showcase</th>
                <th style={{ ...S.th, textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(6)].map((_, i) => (
                  <tr key={i}>
                    <td colSpan={7} style={{ padding: "16px", textAlign: "center", color: "var(--accent-muted, #8EAA9C)" }}>
                      Loading timepieces...
                    </td>
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ padding: "40px 16px", textAlign: "center", color: "var(--accent-muted, #8EAA9C)" }}>
                    No timepieces matched your filters.
                  </td>
                </tr>
              ) : (
                filtered.map((p) => {
                  const currentStock = p.stock_qty ?? p.stock_count ?? 12;
                  const isActive = p.is_active !== false;

                  return (
                    <tr
                      key={p.id}
                      style={{
                        transition: "background 100ms",
                        opacity: isActive ? 1 : 0.65,
                      }}
                      onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = "var(--accent-light, rgba(0, 163, 98, 0.15))")}
                      onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "transparent")}
                    >
                      {/* Timepiece Image & Name */}
                      <td style={S.td}>
                        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                          <div
                            style={{
                              width: "44px",
                              height: "44px",
                              borderRadius: "8px",
                              overflow: "hidden",
                              background: "var(--card-elevated, #162923)",
                              border: "1px solid var(--border-strong, rgba(0, 163, 98, 0.35))",
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
                            <div style={{ fontSize: "12.5px", fontWeight: 700, color: "var(--foreground, #F8FAFC)", whiteSpace: "nowrap" }}>
                              {p.name}
                            </div>
                            <div style={{ fontSize: "10.5px", color: "var(--accent-muted, #8EAA9C)", fontFamily: "var(--font-mono, monospace)", marginTop: "1px" }}>
                              Ref: {p.id} · {p.category}
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
                            color: "var(--rolex-gold, #C5A059)",
                            textTransform: "uppercase",
                          }}
                        >
                          {p.brand || "Krono Swiss"}
                        </span>
                      </td>

                      {/* Price */}
                      <td style={S.td}>
                        <div style={{ fontWeight: 800, color: "var(--foreground, #F8FAFC)", fontFamily: "var(--font-mono, monospace)" }}>
                          {fmt(p.price)}
                        </div>
                        {p.old_price && p.old_price > p.price ? (
                          <div style={{ fontSize: "10px", color: "var(--accent-muted, #8EAA9C)", textDecoration: "line-through" }}>
                            {fmt(p.old_price)}
                          </div>
                        ) : null}
                      </td>

                      {/* Stock Stepper Controls (Slide 9 & 10) */}
                      <td style={S.td}>
                        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                          <button
                            onClick={() => handleQuickStockChange(p, -1)}
                            disabled={currentStock <= 0}
                            style={{
                              width: "24px",
                              height: "24px",
                              borderRadius: "4px",
                              background: "var(--card-elevated, #162923)",
                              border: "1px solid var(--border-subtle, rgba(0, 96, 57, 0.25))",
                              color: "var(--foreground, #F8FAFC)",
                              fontSize: "12px",
                              cursor: currentStock <= 0 ? "not-allowed" : "pointer",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                            title="Decrease stock by 1"
                          >
                            -
                          </button>
                          <span
                            style={{
                              fontSize: "11px",
                              fontWeight: 800,
                              minWidth: "32px",
                              textAlign: "center",
                              fontFamily: "var(--font-mono, monospace)",
                              color: currentStock <= 5 ? "#EAB308" : "var(--accent, #00A362)",
                            }}
                          >
                            {currentStock}
                          </span>
                          <button
                            onClick={() => handleQuickStockChange(p, 1)}
                            style={{
                              width: "24px",
                              height: "24px",
                              borderRadius: "4px",
                              background: "var(--card-elevated, #162923)",
                              border: "1px solid var(--border-subtle, rgba(0, 96, 57, 0.25))",
                              color: "var(--foreground, #F8FAFC)",
                              fontSize: "12px",
                              cursor: "pointer",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                            title="Increase stock by 1"
                          >
                            +
                          </button>
                          {currentStock <= 5 && (
                            <span style={{ fontSize: "9.5px", color: "#EAB308", fontWeight: 700, marginLeft: "4px" }}>
                              (Low Stock)
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Status Column (Slide 10: Show ID, price, stock and status) */}
                      <td style={S.td}>
                        <span
                          style={{
                            fontSize: "10px",
                            fontWeight: 800,
                            padding: "3px 8px",
                            borderRadius: "4px",
                            background: isActive ? "rgba(0, 163, 98, 0.2)" : "rgba(239, 68, 68, 0.15)",
                            color: isActive ? "var(--accent, #00A362)" : "#F87171",
                            border: isActive ? "1px solid var(--accent, #00A362)" : "1px solid rgba(239, 68, 68, 0.3)",
                            textTransform: "uppercase",
                          }}
                        >
                          {isActive ? "Active" : "Deactivated"}
                        </span>
                      </td>

                      {/* Featured on Storefront Toggle */}
                      <td style={S.td}>
                        <button
                          onClick={() => handleToggleFeatured(p)}
                          style={{
                            fontSize: "11px",
                            fontWeight: 800,
                            padding: "4px 10px",
                            borderRadius: "6px",
                            background: p.is_featured ? "rgba(197, 160, 89, 0.22)" : "var(--card-elevated, #162923)",
                            color: p.is_featured ? "var(--rolex-gold, #C5A059)" : "var(--accent-muted, #8EAA9C)",
                            border: p.is_featured ? "1px solid var(--rolex-gold, #C5A059)" : "1px solid var(--border-subtle, rgba(0, 96, 57, 0.25))",
                            cursor: "pointer",
                          }}
                        >
                          {p.is_featured ? "★" : "☆"}
                        </button>
                      </td>

                      {/* Actions (Slide 10: Edit, Deactivate safely, View) */}
                      <td style={{ ...S.td, textAlign: "right" }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "6px" }}>
                          <button
                            onClick={() => openEditModal(p)}
                            style={{
                              padding: "5px 10px",
                              borderRadius: "6px",
                              background: "rgba(197, 160, 89, 0.15)",
                              border: "1px solid var(--rolex-gold, #C5A059)",
                              color: "var(--rolex-gold, #C5A059)",
                              fontSize: "11px",
                              fontWeight: 700,
                              cursor: "pointer",
                            }}
                            title="Edit product details & stock"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleToggleActive(p)}
                            style={{
                              padding: "5px 9px",
                              borderRadius: "6px",
                              background: isActive ? "rgba(234, 179, 8, 0.12)" : "rgba(0, 163, 98, 0.12)",
                              border: isActive ? "1px solid #EAB308" : "1px solid var(--accent, #00A362)",
                              color: isActive ? "#EAB308" : "var(--accent, #00A362)",
                              fontSize: "11px",
                              fontWeight: 700,
                              cursor: "pointer",
                            }}
                            title="Safely deactivate or reactivate this timepiece"
                          >
                            {isActive ? "Deactivate" : "Activate"}
                          </button>
                          <Link
                            href={`/products/${p.id}`}
                            target="_blank"
                            style={{
                              padding: "5px 9px",
                              borderRadius: "6px",
                              background: "var(--card-elevated, #162923)",
                              border: "1px solid var(--border-subtle, rgba(0, 96, 57, 0.25))",
                              color: "var(--accent-muted, #8EAA9C)",
                              fontSize: "11px",
                              textDecoration: "none",
                            }}
                            title="Inspect timepiece on live customer storefront"
                          >
                            ↗
                          </Link>
                          <button
                            disabled={deletingId === p.id}
                            onClick={() => handleDelete(p.id, p.name)}
                            style={{
                              padding: "5px 9px",
                              borderRadius: "6px",
                              background: "transparent",
                              border: "1px solid rgba(239, 68, 68, 0.25)",
                              color: "#F87171",
                              fontSize: "11px",
                              cursor: "pointer",
                            }}
                            title="Delete or soft-archive"
                          >
                            {deletingId === p.id ? "..." : "Del"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Product Modal (Slide 10: UPDATE Edit product/stock, Save changes to DB) */}
      {editingProduct && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 10000,
            background: "rgba(0, 0, 0, 0.8)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
          }}
        >
          <div
            style={{
              background: "var(--card, #12221D)",
              border: "1px solid var(--rolex-gold, #C5A059)",
              borderRadius: "14px",
              padding: "26px",
              width: "100%",
              maxWidth: "520px",
              boxShadow: "0 20px 50px rgba(0,0,0,0.85)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <div>
                <span style={{ fontSize: "10px", color: "var(--rolex-gold, #C5A059)", fontWeight: 800, textTransform: "uppercase" }}>
                  Database Update · Ref: {editingProduct.id}
                </span>
                <h2 style={{ margin: "2px 0 0 0", fontSize: "18px", color: "var(--foreground, #F8FAFC)" }}>
                  Edit Timepiece Specification
                </h2>
              </div>
              <button
                onClick={() => setEditingProduct(null)}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "var(--accent-muted, #8EAA9C)",
                  fontSize: "18px",
                  cursor: "pointer",
                }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEdit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div>
                <label style={{ display: "block", fontSize: "11px", color: "var(--accent-muted, #8EAA9C)", marginBottom: "4px" }}>
                  Timepiece Title / Name
                </label>
                <input
                  type="text"
                  required
                  value={editFormData.name}
                  onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                  style={{
                    width: "100%",
                    padding: "9px 12px",
                    borderRadius: "6px",
                    background: "var(--card-elevated, #162923)",
                    border: "1px solid var(--border-subtle, rgba(0, 96, 57, 0.25))",
                    color: "#FFF",
                    fontSize: "13px",
                    boxSizing: "border-box",
                  }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "11px", color: "var(--accent-muted, #8EAA9C)", marginBottom: "4px" }}>
                    Price (LKR)
                  </label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={editFormData.price}
                    onChange={(e) => setEditFormData({ ...editFormData, price: Number(e.target.value) })}
                    style={{
                      width: "100%",
                      padding: "9px 12px",
                      borderRadius: "6px",
                      background: "var(--card-elevated, #162923)",
                      border: "1px solid var(--border-subtle, rgba(0, 96, 57, 0.25))",
                      color: "#FFF",
                      fontSize: "13px",
                      boxSizing: "border-box",
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "11px", color: "var(--accent-muted, #8EAA9C)", marginBottom: "4px" }}>
                    Stock Units (stock_qty)
                  </label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={editFormData.stock_qty}
                    onChange={(e) => setEditFormData({ ...editFormData, stock_qty: Number(e.target.value) })}
                    style={{
                      width: "100%",
                      padding: "9px 12px",
                      borderRadius: "6px",
                      background: "var(--card-elevated, #162923)",
                      border: "1px solid var(--border-subtle, rgba(0, 96, 57, 0.25))",
                      color: "#FFF",
                      fontSize: "13px",
                      boxSizing: "border-box",
                    }}
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "11px", color: "var(--accent-muted, #8EAA9C)", marginBottom: "4px" }}>
                    Category
                  </label>
                  <input
                    type="text"
                    value={editFormData.category}
                    onChange={(e) => setEditFormData({ ...editFormData, category: e.target.value })}
                    style={{
                      width: "100%",
                      padding: "9px 12px",
                      borderRadius: "6px",
                      background: "var(--card-elevated, #162923)",
                      border: "1px solid var(--border-subtle, rgba(0, 96, 57, 0.25))",
                      color: "#FFF",
                      fontSize: "13px",
                      boxSizing: "border-box",
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "11px", color: "var(--accent-muted, #8EAA9C)", marginBottom: "4px" }}>
                    Brand
                  </label>
                  <input
                    type="text"
                    value={editFormData.brand}
                    onChange={(e) => setEditFormData({ ...editFormData, brand: e.target.value })}
                    style={{
                      width: "100%",
                      padding: "9px 12px",
                      borderRadius: "6px",
                      background: "var(--card-elevated, #162923)",
                      border: "1px solid var(--border-subtle, rgba(0, 96, 57, 0.25))",
                      color: "#FFF",
                      fontSize: "13px",
                      boxSizing: "border-box",
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "11px", color: "var(--accent-muted, #8EAA9C)", marginBottom: "4px" }}>
                  Image URL
                </label>
                <input
                  type="text"
                  value={editFormData.image_url}
                  onChange={(e) => setEditFormData({ ...editFormData, image_url: e.target.value })}
                  style={{
                    width: "100%",
                    padding: "9px 12px",
                    borderRadius: "6px",
                    background: "var(--card-elevated, #162923)",
                    border: "1px solid var(--border-subtle, rgba(0, 96, 57, 0.25))",
                    color: "#FFF",
                    fontSize: "13px",
                    boxSizing: "border-box",
                  }}
                />
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginTop: "4px" }}>
                <input
                  type="checkbox"
                  id="editIsActive"
                  checked={editFormData.is_active}
                  onChange={(e) => setEditFormData({ ...editFormData, is_active: e.target.checked })}
                  style={{ cursor: "pointer" }}
                />
                <label htmlFor="editIsActive" style={{ fontSize: "12px", color: "var(--foreground, #F8FAFC)", cursor: "pointer" }}>
                  Active in Storefront Catalog (uncheck to safely deactivate / soft-delete)
                </label>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "14px" }}>
                <button
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  style={{
                    padding: "8px 16px",
                    borderRadius: "6px",
                    background: "transparent",
                    border: "1px solid var(--border-subtle, rgba(0, 96, 57, 0.25))",
                    color: "var(--accent-muted, #8EAA9C)",
                    fontSize: "12px",
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingEdit}
                  style={{
                    padding: "8px 20px",
                    borderRadius: "6px",
                    background: "linear-gradient(135deg, var(--rolex-green, #006039), var(--rolex-green-dark, #00482B))",
                    border: "1px solid var(--rolex-gold, #C5A059)",
                    color: "var(--rolex-gold, #C5A059)",
                    fontSize: "12px",
                    fontWeight: 800,
                    cursor: "pointer",
                  }}
                >
                  {savingEdit ? "Saving..." : "Save to Database"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
