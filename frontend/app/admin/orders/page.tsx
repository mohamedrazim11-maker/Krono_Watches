"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { fetchOrders, updateOrderStatus, Order } from "@/lib/api";
import { getProductImage } from "@/lib/productImages";

const S = {
  card: {
    background: "var(--card, #0D0D0D)",
    border: "1px solid var(--border-subtle, #1E1E1E)",
    borderRadius: "14px",
    padding: "22px",
    boxShadow: "0 8px 24px rgba(0, 0, 0, 0.4)",
  } as React.CSSProperties,
  th: {
    padding: "13px 16px",
    fontSize: "11px",
    fontWeight: 700,
    color: "#71717A",
    textTransform: "uppercase" as const,
    letterSpacing: "0.08em",
    borderBottom: "1px solid #1E1E1E",
    background: "#121212",
    whiteSpace: "nowrap" as const,
  } as React.CSSProperties,
  td: {
    padding: "14px 16px",
    fontSize: "12px",
    color: "var(--foreground, #F8FAFC)",
    borderBottom: "1px solid #171717",
    verticalAlign: "middle" as const,
  } as React.CSSProperties,
};

const STATUS_OPTIONS = [
  { value: "Pending", label: "Pending", bg: "rgba(245, 158, 11, 0.12)", text: "#FBBF24", border: "rgba(245, 158, 11, 0.25)" },
  { value: "Paid", label: "Paid", bg: "rgba(16, 185, 129, 0.12)", text: "#34D399", border: "rgba(16, 185, 129, 0.25)" },
  { value: "Processing", label: "Processing", bg: "rgba(96, 165, 250, 0.12)", text: "#60A5FA", border: "rgba(96, 165, 250, 0.25)" },
  { value: "Shipped", label: "Shipped", bg: "rgba(168, 85, 247, 0.12)", text: "#C084FC", border: "rgba(168, 85, 247, 0.25)" },
  { value: "Completed", label: "Completed", bg: "rgba(16, 185, 129, 0.15)", text: "#10B981", border: "rgba(16, 185, 129, 0.3)" },
  { value: "pending_payment", label: "Pending Payment", bg: "rgba(245, 158, 11, 0.12)", text: "#FBBF24", border: "rgba(245, 158, 11, 0.25)" },
  { value: "processing", label: "Processing & Verifying", bg: "rgba(96, 165, 250, 0.12)", text: "#60A5FA", border: "rgba(96, 165, 250, 0.25)" },
  { value: "authenticated", label: "Horology Authenticated", bg: "rgba(255, 255, 255, 0.08)", text: "#E4E4E7", border: "rgba(255, 255, 255, 0.2)" },
  { value: "dispatched", label: "Insured Courier Dispatched", bg: "rgba(168, 85, 247, 0.12)", text: "#C084FC", border: "rgba(168, 85, 247, 0.25)" },
  { value: "delivered", label: "Delivered to Client", bg: "rgba(16, 185, 129, 0.15)", text: "#10B981", border: "rgba(16, 185, 129, 0.3)" },
  { value: "cancelled", label: "Cancelled / Void", bg: "rgba(239, 68, 68, 0.12)", text: "#F87171", border: "rgba(239, 68, 68, 0.25)" },
];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [toast, setToast] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const data = await fetchOrders();
      setOrders(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    setUpdatingId(orderId);
    try {
      await updateOrderStatus(orderId, { status: newStatus });
      setOrders((prev) => prev.map((o) => (o.id === orderId || o.order_number === orderId ? { ...o, status: newStatus } : o)));
      if (selectedOrder && (selectedOrder.id === orderId || selectedOrder.order_number === orderId)) {
        setSelectedOrder((prev) => (prev ? { ...prev, status: newStatus } : null));
      }
      showToast(`Order status updated to ${newStatus.replace("_", " ")}`);
    } catch (err: any) {
      alert(err.message || "Failed to update order status");
    } finally {
      setUpdatingId(null);
    }
  };

  const handlePaymentStatusChange = async (orderId: string, newPaymentStatus: string) => {
    setUpdatingId(orderId);
    try {
      await updateOrderStatus(orderId, { payment_status: newPaymentStatus });
      setOrders((prev) => prev.map((o) => (o.id === orderId || o.order_number === orderId ? { ...o, payment_status: newPaymentStatus } : o)));
      if (selectedOrder && (selectedOrder.id === orderId || selectedOrder.order_number === orderId)) {
        setSelectedOrder((prev) => (prev ? { ...prev, payment_status: newPaymentStatus } : null));
      }
      showToast(`Payment marked as ${newPaymentStatus}`);
    } catch (err: any) {
      alert(err.message || "Failed to update payment status");
    } finally {
      setUpdatingId(null);
    }
  };

  const fmt = (n: number) => `LKR ${Number(n || 0).toLocaleString("en-US")}`;

  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      const matchStatus = statusFilter === "all" || o.status === statusFilter || (statusFilter === "pending" && (o.status === "pending_payment" || o.payment_status === "pending"));
      const q = search.toLowerCase();
      const matchSearch =
        !q ||
        o.order_number?.toLowerCase().includes(q) ||
        o.customer_name?.toLowerCase().includes(q) ||
        o.customer_email?.toLowerCase().includes(q) ||
        (o.customer_phone && o.customer_phone.includes(q)) ||
        o.items?.some((it) => it.product_name?.toLowerCase().includes(q));

      return matchStatus && matchSearch;
    });
  }, [orders, statusFilter, search]);

  const totalRevenue = useMemo(() => {
    return orders.reduce((acc, o) => acc + (Number(o.total_amount) || 0), 0);
  }, [orders]);

  const pendingOrdersCount = useMemo(() => {
    return orders.filter((o) => o.status === "pending_payment" || o.payment_status === "pending").length;
  }, [orders]);

  return (
    <div style={{ maxWidth: "1280px", margin: "0 auto", fontFamily: "inherit" }}>
      {/* Toast */}
      {toast && (
        <div
          style={{
            position: "fixed",
            bottom: "28px",
            right: "32px",
            zIndex: 9999,
            background: "#141414",
            border: "1px solid #27272A",
            borderLeft: "4px solid #FFFFFF",
            borderRadius: "8px",
            padding: "14px 20px",
            fontSize: "12.5px",
            fontWeight: 600,
            color: "#F8FAFC",
            boxShadow: "0 10px 30px rgba(0,0,0,0.6)",
          }}
        >
          ✓ {toast}
        </div>
      )}

      {/* Header */}
      <div style={{ marginBottom: "28px", display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <div style={{ fontSize: "11px", fontWeight: 700, color: "#A1A1AA", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: "6px" }}>
            Storefront Allocations & Sales
          </div>
          <h1
            style={{
              fontSize: "28px",
              fontWeight: 800,
              color: "#F8FAFC",
              margin: 0,
              fontFamily: "var(--font-serif, 'Cormorant Garamond', Georgia, serif)",
              letterSpacing: "0.02em",
            }}
          >
            Client Orders & Fulfilment
          </h1>
          <p style={{ fontSize: "12.5px", color: "#71717A", marginTop: "4px" }}>
            Manage client checkouts, authenticated deliveries, wrist sizing requests, and PayHere transactions.
          </p>
        </div>

        <div style={{ display: "flex", gap: "10px" }}>
          <button
            onClick={load}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              padding: "9px 18px",
              borderRadius: "8px",
              background: "#141414",
              border: "1px solid #27272A",
              color: "#FFFFFF",
              fontSize: "12px",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh Orders
          </button>
          <Link
            href="/checkout"
            target="_blank"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              padding: "9px 18px",
              borderRadius: "8px",
              background: "#FFFFFF",
              color: "#050505",
              fontSize: "12px",
              fontWeight: 800,
              textDecoration: "none",
              boxShadow: "0 2px 10px rgba(255, 255, 255, 0.15)",
            }}
          >
            <span>Simulate Store Checkout ↗</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px", marginBottom: "28px" }}>
        <div style={S.card}>
          <div style={{ fontSize: "11px", fontWeight: 700, color: "#71717A", textTransform: "uppercase", letterSpacing: "0.08em" }}>
            Total Orders
          </div>
          <div style={{ fontSize: "28px", fontWeight: 800, color: "#F8FAFC", marginTop: "6px", fontFamily: "var(--font-mono, monospace)" }}>
            {orders.length}
          </div>
          <div style={{ fontSize: "11.5px", color: "#A1A1AA", marginTop: "4px" }}>
            Storefront client checkouts
          </div>
        </div>

        <div style={S.card}>
          <div style={{ fontSize: "11px", fontWeight: 700, color: "#71717A", textTransform: "uppercase", letterSpacing: "0.08em" }}>
            Gross Order Value
          </div>
          <div style={{ fontSize: "26px", fontWeight: 800, color: "#FFFFFF", marginTop: "6px", fontFamily: "var(--font-mono, monospace)" }}>
            {fmt(totalRevenue)}
          </div>
          <div style={{ fontSize: "11.5px", color: "#A1A1AA", marginTop: "4px" }}>
            Cumulated sales across all timepieces
          </div>
        </div>

        <div style={S.card}>
          <div style={{ fontSize: "11px", fontWeight: 700, color: "#71717A", textTransform: "uppercase", letterSpacing: "0.08em" }}>
            Pending Action
          </div>
          <div style={{ fontSize: "28px", fontWeight: 800, color: "#FBBF24", marginTop: "6px", fontFamily: "var(--font-mono, monospace)" }}>
            {pendingOrdersCount}
          </div>
          <div style={{ fontSize: "11.5px", color: "#FBBF24", marginTop: "4px" }}>
            Awaiting payment verification / courier
          </div>
        </div>

        <div style={S.card}>
          <div style={{ fontSize: "11px", fontWeight: 700, color: "#71717A", textTransform: "uppercase", letterSpacing: "0.08em" }}>
            Delivery Mode
          </div>
          <div style={{ fontSize: "17px", fontWeight: 800, color: "#34D399", marginTop: "10px" }}>
            Insured Armored Courier
          </div>
          <div style={{ fontSize: "11.5px", color: "#71717A", marginTop: "4px" }}>
            Worldwide & Colombo Direct Delivery
          </div>
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
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "14px",
        }}
      >
        {/* Search */}
        <div style={{ position: "relative", minWidth: "280px", flex: 1 }}>
          <input
            type="text"
            placeholder="Search by client, order #, phone, watch model..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: "100%",
              background: "#0A0A0A",
              border: "1px solid #222222",
              borderRadius: "8px",
              padding: "9px 12px 9px 36px",
              fontSize: "12px",
              color: "#F8FAFC",
              outline: "none",
            }}
          />
          <svg
            style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", width: "15px", height: "15px", color: "#71717A" }}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        {/* Status filter tabs */}
        <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
          {[
            { id: "all", label: "All Orders" },
            { id: "pending", label: "Pending" },
            { id: "authenticated", label: "Authenticated" },
            { id: "dispatched", label: "Dispatched" },
            { id: "delivered", label: "Delivered" },
          ].map((tab) => {
            const active = statusFilter === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id)}
                style={{
                  padding: "7px 14px",
                  borderRadius: "8px",
                  fontSize: "11.5px",
                  fontWeight: 700,
                  cursor: "pointer",
                  background: active ? "#FFFFFF" : "#141414",
                  color: active ? "#050505" : "#A1A1AA",
                  border: active ? "1px solid #FFFFFF" : "1px solid #222222",
                  transition: "all 120ms ease",
                }}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Orders Table */}
      <div style={{ ...S.card, padding: 0, overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "900px" }}>
            <thead>
              <tr>
                <th style={S.th}>Order Reference</th>
                <th style={S.th}>Client</th>
                <th style={S.th}>Timepiece(s)</th>
                <th style={S.th}>Sizing & Gift</th>
                <th style={S.th}>Amount (LKR)</th>
                <th style={S.th}>Payment</th>
                <th style={S.th}>Fulfillment Status</th>
                <th style={{ ...S.th, textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(3)].map((_, i) => (
                  <tr key={i}>
                    <td colSpan={8} style={{ padding: "20px", textAlign: "center", color: "var(--accent-muted, #8EAA9C)" }}>
                      Loading orders...
                    </td>
                  </tr>
                ))
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ padding: "48px 20px", textAlign: "center" }}>
                    <div style={{ fontSize: "28px", color: "#A1A1AA", marginBottom: "8px" }}>⌚</div>
                    <div style={{ fontSize: "15px", fontWeight: 700, color: "#F8FAFC" }}>No watch orders found</div>
                    <div style={{ fontSize: "12px", color: "#71717A", marginTop: "4px" }}>
                      Checkouts made from the storefront will appear here in real-time.
                    </div>
                  </td>
                </tr>
              ) : (
                filteredOrders.map((o) => {
                  const statusObj = STATUS_OPTIONS.find((s) => s.value === o.status) || STATUS_OPTIONS[0];
                  return (
                    <tr
                      key={o.id || o.order_number}
                      style={{ transition: "background 100ms ease" }}
                      onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = "rgba(255, 255, 255, 0.03)")}
                      onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "transparent")}
                    >
                      {/* Order Reference */}
                      <td style={S.td}>
                        <div style={{ fontWeight: 800, color: "#FFFFFF", fontFamily: "var(--font-mono, monospace)" }}>
                          {o.order_number || o.id}
                        </div>
                        <div style={{ fontSize: "10.5px", color: "#71717A", marginTop: "2px" }}>
                          {o.created_at
                            ? new Date(o.created_at).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })
                            : "—"}
                        </div>
                      </td>

                      {/* Client */}
                      <td style={S.td}>
                        <div style={{ fontWeight: 700, color: "#F8FAFC" }}>{o.customer_name}</div>
                        <div style={{ fontSize: "11px", color: "#A1A1AA" }}>{o.customer_email}</div>
                        {o.customer_phone && (
                          <div style={{ fontSize: "10.5px", color: "#71717A", fontFamily: "var(--font-mono, monospace)" }}>
                            {o.customer_phone}
                          </div>
                        )}
                      </td>

                      {/* Timepieces */}
                      <td style={S.td}>
                        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                          {(o.items || []).map((it, idx) => (
                            <div key={idx} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                              <div
                                style={{
                                  width: "32px",
                                  height: "32px",
                                  borderRadius: "6px",
                                  overflow: "hidden",
                                  background: "#141414",
                                  border: "1px solid #222222",
                                  flexShrink: 0,
                                }}
                              >
                                <img
                                  src={getProductImage(it.product_id, it.image_url)}
                                  alt={it.product_name}
                                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                                />
                              </div>
                              <div style={{ maxWidth: "160px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                <span style={{ fontSize: "11.5px", color: "#F8FAFC", fontWeight: 600 }}>{it.product_name}</span>
                                <span style={{ fontSize: "10px", color: "#A1A1AA", marginLeft: "4px" }}>x{it.quantity}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </td>

                      {/* Sizing & Packaging */}
                      <td style={S.td}>
                        <div style={{ fontSize: "11.5px", color: "#F8FAFC" }}>
                          {o.wrist_size || "Standard (19cm)"}
                        </div>
                        {o.gift_packaging && (
                          <div
                            style={{
                              display: "inline-block",
                              marginTop: "4px",
                              fontSize: "9.5px",
                              fontWeight: 700,
                              padding: "2px 6px",
                              borderRadius: "4px",
                              background: "rgba(255, 255, 255, 0.06)",
                              color: "#E4E4E7",
                              border: "1px solid #333333",
                            }}
                          >
                            🎁 Luxury Box Included
                          </div>
                        )}
                      </td>

                      {/* Amount */}
                      <td style={S.td}>
                        <div style={{ fontWeight: 800, color: "#F8FAFC", fontFamily: "var(--font-mono, monospace)" }}>
                          {fmt(o.total_amount)}
                        </div>
                        {o.discount_amount ? (
                          <div style={{ fontSize: "10px", color: "#34D399" }}>
                            Disc: -{fmt(o.discount_amount)}
                          </div>
                        ) : null}
                      </td>

                      {/* Payment */}
                      <td style={S.td}>
                        <div style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", color: "#71717A" }}>
                          {o.payment_method || "PayHere"}
                        </div>
                        <div style={{ marginTop: "4px" }}>
                          <span
                            style={{
                              fontSize: "10px",
                              fontWeight: 700,
                              padding: "2px 6px",
                              borderRadius: "4px",
                              background: o.payment_status === "completed" ? "rgba(16, 185, 129, 0.15)" : "rgba(245, 158, 11, 0.12)",
                              color: o.payment_status === "completed" ? "#34D399" : "#FBBF24",
                              border: o.payment_status === "completed" ? "1px solid rgba(16, 185, 129, 0.3)" : "1px solid rgba(245, 158, 11, 0.3)",
                              cursor: "pointer",
                            }}
                            onClick={() => handlePaymentStatusChange(String(o.id || o.order_number || ""), o.payment_status === "completed" ? "pending" : "completed")}
                            title="Click to toggle payment confirmation"
                          >
                            {o.payment_status === "completed" ? "✓ Paid" : "⏳ Pending"}
                          </span>
                        </div>
                      </td>

                      {/* Fulfillment Status Selector */}
                      <td style={S.td}>
                        <select
                          value={o.status || "pending_payment"}
                          disabled={updatingId === (o.id || o.order_number)}
                          onChange={(e) => handleStatusChange(String(o.id || o.order_number || ""), e.target.value)}
                          style={{
                            background: statusObj.bg,
                            color: statusObj.text,
                            border: `1px solid ${statusObj.border}`,
                            borderRadius: "6px",
                            padding: "6px 8px",
                            fontSize: "11px",
                            fontWeight: 700,
                            cursor: "pointer",
                            outline: "none",
                          }}
                        >
                          {STATUS_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value} style={{ background: "#141414", color: "#FFF" }}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      </td>

                      {/* Actions */}
                      <td style={{ ...S.td, textAlign: "right" }}>
                        <button
                          onClick={() => setSelectedOrder(o)}
                          style={{
                            padding: "6px 12px",
                            borderRadius: "6px",
                            background: "#181818",
                            border: "1px solid #2E2E2E",
                            color: "#FFFFFF",
                            fontSize: "11px",
                            fontWeight: 700,
                            cursor: "pointer",
                          }}
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            background: "rgba(0,0,0,0.85)",
            backdropFilter: "blur(8px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
          }}
          onClick={() => setSelectedOrder(null)}
        >
          <div
            style={{
              background: "#0D0D0D",
              border: "1px solid #27272A",
              borderRadius: "16px",
              padding: "28px",
              maxWidth: "600px",
              width: "100%",
              maxHeight: "90vh",
              overflowY: "auto",
              boxShadow: "0 20px 50px rgba(0,0,0,0.85)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "20px" }}>
              <div>
                <div style={{ fontSize: "11px", color: "#A1A1AA", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em" }}>
                  Client Allocation Dossier
                </div>
                <h2 style={{ fontSize: "22px", fontWeight: 800, color: "#F8FAFC", margin: "4px 0 0 0", fontFamily: "var(--font-mono, monospace)" }}>
                  {selectedOrder.order_number || selectedOrder.id}
                </h2>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "#71717A",
                  fontSize: "22px",
                  cursor: "pointer",
                }}
              >
                ✕
              </button>
            </div>

            {/* Client Info */}
            <div style={{ background: "#141414", border: "1px solid #222222", borderRadius: "10px", padding: "18px", marginBottom: "16px" }}>
              <div style={{ fontSize: "11px", fontWeight: 800, color: "#FFFFFF", textTransform: "uppercase", marginBottom: "10px" }}>
                Client Details
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", fontSize: "12px" }}>
                <div>
                  <div style={{ color: "#71717A", fontSize: "10px" }}>NAME</div>
                  <div style={{ fontWeight: 700, color: "#F8FAFC" }}>{selectedOrder.customer_name}</div>
                </div>
                <div>
                  <div style={{ color: "#71717A", fontSize: "10px" }}>EMAIL</div>
                  <div style={{ color: "#F8FAFC" }}>{selectedOrder.customer_email}</div>
                </div>
                <div>
                  <div style={{ color: "#71717A", fontSize: "10px" }}>PHONE</div>
                  <div style={{ color: "#F8FAFC" }}>{selectedOrder.customer_phone || "Not specified"}</div>
                </div>
                <div>
                  <div style={{ color: "#71717A", fontSize: "10px" }}>WRIST SIZE</div>
                  <div style={{ color: "#F8FAFC", fontWeight: 700 }}>{selectedOrder.wrist_size || "Standard (19cm)"}</div>
                </div>
              </div>
              <div style={{ marginTop: "12px", borderTop: "1px solid #222222", paddingTop: "10px" }}>
                <div style={{ color: "#71717A", fontSize: "10px" }}>DELIVERY ADDRESS</div>
                <div style={{ color: "#F8FAFC", fontSize: "12px", marginTop: "2px" }}>
                  {selectedOrder.delivery_address || selectedOrder.shipping_address || "Boutique Pickup / Colombo"}
                </div>
              </div>
            </div>

            {/* Items */}
            <div style={{ background: "#141414", border: "1px solid #222222", borderRadius: "10px", padding: "18px", marginBottom: "16px" }}>
              <div style={{ fontSize: "11px", fontWeight: 800, color: "#FFFFFF", textTransform: "uppercase", marginBottom: "10px" }}>
                Acquired Timepiece(s)
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {(selectedOrder.items || []).map((it, idx) => (
                  <div key={idx} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <img
                        src={getProductImage(it.product_id, it.image_url)}
                        alt={it.product_name}
                        style={{ width: "38px", height: "38px", borderRadius: "6px", objectFit: "cover" }}
                      />
                      <div>
                        <div style={{ fontSize: "13px", fontWeight: 700, color: "#F8FAFC" }}>{it.product_name}</div>
                        <div style={{ fontSize: "11px", color: "#71717A" }}>Qty: {it.quantity}</div>
                      </div>
                    </div>
                    <div style={{ fontWeight: 800, color: "#FFFFFF", fontFamily: "var(--font-mono, monospace)", fontSize: "13px" }}>
                      {fmt(it.subtotal || (it.unit_price ?? it.price ?? 0) * it.quantity)}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Instructions */}
            {selectedOrder.special_instructions && (
              <div style={{ background: "#141414", border: "1px solid #222222", borderRadius: "10px", padding: "14px 18px", marginBottom: "16px" }}>
                <div style={{ fontSize: "10px", color: "#A1A1AA", fontWeight: 800, textTransform: "uppercase" }}>
                  Engraving / Horological Note
                </div>
                <div style={{ fontSize: "12px", color: "#F8FAFC", marginTop: "4px", fontStyle: "italic" }}>
                  &ldquo;{selectedOrder.special_instructions}&rdquo;
                </div>
              </div>
            )}

            {/* Total and Close */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: "14px", borderTop: "1px solid #222222" }}>
              <div>
                <div style={{ fontSize: "11px", color: "#71717A" }}>TOTAL INVOICE (LKR)</div>
                <div style={{ fontSize: "22px", fontWeight: 800, color: "#F8FAFC", fontFamily: "var(--font-mono, monospace)" }}>
                  {fmt(selectedOrder.total_amount)}
                </div>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                style={{
                  padding: "9px 22px",
                  borderRadius: "8px",
                  background: "#FFFFFF",
                  color: "#050505",
                  fontSize: "12px",
                  fontWeight: 800,
                  cursor: "pointer",
                  border: "none",
                  boxShadow: "0 2px 10px rgba(255, 255, 255, 0.15)",
                }}
              >
                Close Dossier
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
