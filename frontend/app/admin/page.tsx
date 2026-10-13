"use client";

import { useEffect, useState, useMemo } from "react";
import { fetchProducts, fetchOrders, updateProduct, Product, Order } from "@/lib/api";

export default function AdminDashboard() {
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const loadRealData = async () => {
    try {
      const [pList, oList] = await Promise.all([
        fetchProducts(),
        fetchOrders(),
      ]);

      setProducts(pList);
      setOrders(oList);
    } catch (e) {
      console.error("Error loading real data from database:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRealData();
  }, []);

  // Real database stock updater
  const handleStockChange = async (productId: string, currentStock: number, delta: number, productName: string) => {
    const newStock = Math.max(0, currentStock + delta);
    if (newStock === currentStock) return;

    setUpdatingId(productId);

    // Optimistic UI update
    setProducts((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, stock_qty: newStock, stock_count: newStock } : p))
    );

    try {
      await updateProduct(productId, { stock_qty: newStock, stock_count: newStock });
      showToast(`Stock updated for ${productName} (${newStock} units)`);
    } catch (err: any) {
      console.error("Failed to update stock in database:", err);
      showToast(`Failed to update stock: ${err.message || "Network error"}`);
      // Revert if error
      loadRealData();
    } finally {
      setUpdatingId(null);
    }
  };

  // Real calculations computed directly from database records
  const totalProductsCount = products.length;
  const totalOrdersCount = orders.length;
  const lowStockCount = useMemo(() => {
    return products.filter((p) => {
      const qty = p.stock_qty ?? (p as any).stock_count ?? 0;
      return qty <= 5;
    }).length;
  }, [products]);

  const totalRevenue = useMemo(() => {
    return orders.reduce((sum, o) => sum + (Number(o.total_amount) || 0), 0);
  }, [orders]);

  const fmtCurrency = (n: number) => `LKR ${Number(n || 0).toLocaleString("en-US")}`;
  const fmtNumber = (n: number) => Number(n || 0).toLocaleString("en-US");

  return (
    <div style={{ position: "relative" }}>
      {/* Toast Notification */}
      {toastMessage && (
        <div
          style={{
            position: "fixed",
            bottom: "28px",
            right: "32px",
            zIndex: 9999,
            background: "#181B1F",
            border: "1px solid #2E333D",
            borderLeft: "3px solid #38BDF8",
            borderRadius: "8px",
            padding: "10px 18px",
            fontSize: "12.5px",
            fontWeight: 500,
            color: "#FFFFFF",
            boxShadow: "0 10px 30px rgba(0, 0, 0, 0.6)",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <span style={{ color: "#38BDF8" }}>✓</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Header: Dashboard title & Database connected pill */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "24px",
        }}
      >
        <h1
          style={{
            fontSize: "24px",
            fontWeight: 700,
            color: "#FFFFFF",
            margin: 0,
            letterSpacing: "-0.01em",
          }}
        >
          Dashboard
        </h1>

        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "7px",
            padding: "5px 13px",
            borderRadius: "6px",
            background: "rgba(34, 197, 94, 0.08)",
            border: "1px solid rgba(34, 197, 94, 0.28)",
            color: "#22C55E",
            fontSize: "12.5px",
            fontWeight: 500,
            boxShadow: "0 0 12px rgba(34, 197, 94, 0.08)",
          }}
        >
          <span style={{ fontSize: "13px", fontWeight: 700 }}>✓</span>
          <span>Database connected</span>
        </div>
      </div>

      {/* 4 Stat Cards in a row */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: "14px",
          marginBottom: "32px",
        }}
      >
        {/* Products Card */}
        <div
          style={{
            background: "#1C1E22",
            border: "1px solid #282C32",
            borderRadius: "10px",
            padding: "16px 20px",
            transition: "border-color 160ms ease, box-shadow 160ms ease",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.borderColor = "#383E47";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.borderColor = "#282C32";
          }}
        >
          <div style={{ fontSize: "13px", color: "#9CA3AF" }}>Products</div>
          <div
            style={{
              fontSize: "26px",
              fontWeight: 700,
              color: "#FFFFFF",
              marginTop: "6px",
              lineHeight: 1.1,
              fontFamily: "var(--font-mono, monospace)",
            }}
          >
            {loading ? "..." : totalProductsCount}
          </div>
        </div>

        {/* Orders Card */}
        <div
          style={{
            background: "#1C1E22",
            border: "1px solid #282C32",
            borderRadius: "10px",
            padding: "16px 20px",
            transition: "border-color 160ms ease, box-shadow 160ms ease",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.borderColor = "#383E47";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.borderColor = "#282C32";
          }}
        >
          <div style={{ fontSize: "13px", color: "#9CA3AF" }}>Orders</div>
          <div
            style={{
              fontSize: "26px",
              fontWeight: 700,
              color: "#FFFFFF",
              marginTop: "6px",
              lineHeight: 1.1,
              fontFamily: "var(--font-mono, monospace)",
            }}
          >
            {loading ? "..." : totalOrdersCount}
          </div>
        </div>

        {/* Low stock Card */}
        <div
          style={{
            background: "#1C1E22",
            border: "1px solid #282C32",
            borderRadius: "10px",
            padding: "16px 20px",
            transition: "border-color 160ms ease, box-shadow 160ms ease",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.borderColor = "#383E47";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.borderColor = "#282C32";
          }}
        >
          <div style={{ fontSize: "13px", color: "#9CA3AF" }}>Low stock</div>
          <div
            style={{
              fontSize: "26px",
              fontWeight: 700,
              color: "#F59E0B",
              marginTop: "6px",
              lineHeight: 1.1,
              fontFamily: "var(--font-mono, monospace)",
            }}
          >
            {loading ? "..." : lowStockCount}
          </div>
        </div>

        {/* Revenue Card */}
        <div
          style={{
            background: "#1C1E22",
            border: "1px solid #282C32",
            borderRadius: "10px",
            padding: "16px 20px",
            transition: "border-color 160ms ease, box-shadow 160ms ease",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.borderColor = "#383E47";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.borderColor = "#282C32";
          }}
        >
          <div style={{ fontSize: "13px", color: "#9CA3AF" }}>Revenue</div>
          <div
            style={{
              fontSize: "20px",
              fontWeight: 700,
              color: "#FFFFFF",
              marginTop: "8px",
              lineHeight: 1.1,
              fontFamily: "var(--font-mono, monospace)",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {loading ? "..." : fmtCurrency(totalRevenue)}
          </div>
        </div>
      </div>

      {/* Recent orders Section */}
      <div style={{ marginBottom: "34px" }}>
        <h2
          style={{
            fontSize: "15px",
            fontWeight: 600,
            color: "#FFFFFF",
            margin: "0 0 14px 0",
          }}
        >
          Recent orders
        </h2>

        <div style={{ width: "100%", overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ color: "#9CA3AF", fontSize: "13px", fontWeight: 400 }}>
                <th style={{ textAlign: "left", paddingBottom: "10px", fontWeight: 400, width: "22%" }}>
                  Order
                </th>
                <th style={{ textAlign: "left", paddingBottom: "10px", fontWeight: 400, width: "35%" }}>
                  Customer
                </th>
                <th style={{ textAlign: "right", paddingBottom: "10px", fontWeight: 400, width: "25%", paddingRight: "36px" }}>
                  Total (LKR)
                </th>
                <th style={{ textAlign: "left", paddingBottom: "10px", fontWeight: 400, width: "18%" }}>
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={4} style={{ padding: "20px 0", color: "#71717A", fontSize: "13px" }}>
                    Loading real orders from database...
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={4} style={{ padding: "20px 0", color: "#71717A", fontSize: "13px" }}>
                    No orders recorded in database yet.
                  </td>
                </tr>
              ) : (
                orders.slice(0, 5).map((o) => {
                  const orderId = o.order_number || o.id;
                  const statusStr = (o.status || "pending").toLowerCase();
                  const isPaid = statusStr === "paid" || statusStr === "completed";
                  const isShipped = statusStr === "shipped" || statusStr === "dispatched";

                  return (
                    <tr
                      key={orderId}
                      style={{
                        borderTop: "1px solid #23272D",
                        fontSize: "13.5px",
                        transition: "background 100ms ease",
                      }}
                      onMouseEnter={(e) => {
                        (e.currentTarget as HTMLElement).style.background = "rgba(255, 255, 255, 0.02)";
                      }}
                      onMouseLeave={(e) => {
                        (e.currentTarget as HTMLElement).style.background = "transparent";
                      }}
                    >
                      <td style={{ padding: "13px 0", color: "#F3F4F6", fontWeight: 500, fontFamily: "var(--font-mono, monospace)" }}>
                        {orderId}
                      </td>
                      <td style={{ padding: "13px 0", color: "#9CA3AF" }}>
                        {o.customer_name || "Guest Customer"}
                      </td>
                      <td style={{ padding: "13px 0", textAlign: "right", color: "#F3F4F6", paddingRight: "36px", fontFamily: "var(--font-mono, monospace)" }}>
                        {fmtNumber(o.total_amount)}
                      </td>
                      <td style={{ padding: "13px 0" }}>
                        {isPaid ? (
                          <span
                            style={{
                              display: "inline-block",
                              padding: "3px 12px",
                              borderRadius: "9999px",
                              fontSize: "12px",
                              fontWeight: 500,
                              background: "rgba(34, 197, 94, 0.16)",
                              color: "#22C55E",
                            }}
                          >
                            Paid
                          </span>
                        ) : isShipped ? (
                          <span
                            style={{
                              display: "inline-block",
                              padding: "3px 12px",
                              borderRadius: "9999px",
                              fontSize: "12px",
                              fontWeight: 500,
                              background: "rgba(56, 189, 248, 0.18)",
                              color: "#38BDF8",
                            }}
                          >
                            Shipped
                          </span>
                        ) : (
                          <span
                            style={{
                              display: "inline-block",
                              padding: "3px 12px",
                              borderRadius: "9999px",
                              fontSize: "12px",
                              fontWeight: 500,
                              background: "rgba(245, 158, 11, 0.16)",
                              color: "#F59E0B",
                            }}
                          >
                            Pending
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Products and stock Section */}
      <div>
        <h2
          style={{
            fontSize: "15px",
            fontWeight: 600,
            color: "#FFFFFF",
            margin: "0 0 14px 0",
          }}
        >
          Products and stock
        </h2>

        <div
          style={{
            background: "#1C1E22",
            border: "1px solid #282C32",
            borderRadius: "10px",
            overflow: "hidden",
          }}
        >
          {loading ? (
            <div style={{ padding: "20px", color: "#71717A", fontSize: "13px" }}>
              Loading products from database...
            </div>
          ) : products.length === 0 ? (
            <div style={{ padding: "20px", color: "#71717A", fontSize: "13px" }}>
              No products found in the database.
            </div>
          ) : (
            products.slice(0, 6).map((p, idx, arr) => {
              const stock = p.stock_qty ?? (p as any).stock_count ?? 0;
              const isLow = stock <= 5;
              const isUpdating = updatingId === p.id;

              return (
                <div
                  key={p.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "14px 20px",
                    borderBottom: idx < arr.length - 1 ? "1px solid #282C32" : "none",
                    transition: "background 100ms ease",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.background = "rgba(255, 255, 255, 0.02)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.background = "transparent";
                  }}
                >
                  {/* Product Name */}
                  <div
                    style={{
                      fontSize: "14px",
                      fontWeight: 500,
                      color: "#FFFFFF",
                    }}
                  >
                    {p.name}
                  </div>

                  {/* Right controls: Price & Stock Stepper */}
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <span
                      style={{
                        fontSize: "13px",
                        color: "#9CA3AF",
                        marginRight: "26px",
                        fontFamily: "var(--font-mono, monospace)",
                      }}
                    >
                      {fmtCurrency(p.price)}
                    </span>

                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      {/* Minus button */}
                      <button
                        onClick={() => handleStockChange(p.id, stock, -1, p.name)}
                        disabled={isUpdating || stock <= 0}
                        style={{
                          width: "26px",
                          height: "26px",
                          borderRadius: "5px",
                          background: "#141618",
                          border: "1px solid #374151",
                          color: stock <= 0 ? "#4B5563" : "#D1D5DB",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          cursor: stock <= 0 ? "not-allowed" : "pointer",
                          fontSize: "14px",
                          fontWeight: 600,
                          transition: "all 120ms ease",
                        }}
                        onMouseEnter={(e) => {
                          if (stock > 0) (e.currentTarget as HTMLElement).style.borderColor = "#6B7280";
                        }}
                        onMouseLeave={(e) => {
                          (e.currentTarget as HTMLElement).style.borderColor = "#374151";
                        }}
                        title="Decrease stock"
                      >
                        -
                      </button>

                      {/* Stock number */}
                      <span
                        style={{
                          width: "24px",
                          textAlign: "center",
                          fontSize: "14px",
                          fontWeight: 700,
                          color: isLow ? "#F59E0B" : "#FFFFFF",
                          fontFamily: "var(--font-mono, monospace)",
                        }}
                      >
                        {stock}
                      </span>

                      {/* Plus button */}
                      <button
                        onClick={() => handleStockChange(p.id, stock, 1, p.name)}
                        disabled={isUpdating}
                        style={{
                          width: "26px",
                          height: "26px",
                          borderRadius: "5px",
                          background: "#141618",
                          border: "1px solid #374151",
                          color: "#D1D5DB",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          cursor: "pointer",
                          fontSize: "14px",
                          fontWeight: 600,
                          transition: "all 120ms ease",
                        }}
                        onMouseEnter={(e) => {
                          (e.currentTarget as HTMLElement).style.borderColor = "#6B7280";
                        }}
                        onMouseLeave={(e) => {
                          (e.currentTarget as HTMLElement).style.borderColor = "#374151";
                        }}
                        title="Increase stock"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}