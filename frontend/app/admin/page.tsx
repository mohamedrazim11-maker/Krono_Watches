"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/AuthContext";
import { fetchProducts, fetchOrders, fetchAdminUsers, Product, Order, AdminUser } from "@/lib/api";
import { getProductImage } from "@/lib/productImages";
import SmoothImage from "@/components/SmoothImage";

const S = {
  card: {
    background: "#0E1015",
    border: "1px solid #1E232B",
    borderRadius: "12px",
    padding: "20px",
    boxShadow: "0 4px 16px rgba(0, 0, 0, 0.4)",
  } as React.CSSProperties,
  th: {
    padding: "12px 14px",
    fontSize: "10.5px",
    fontWeight: 700,
    color: "#6E7585",
    textTransform: "uppercase" as const,
    letterSpacing: "0.1em",
    borderBottom: "1px solid #1C2028",
    background: "#12141A",
    whiteSpace: "nowrap" as const,
  } as React.CSSProperties,
  td: {
    padding: "13px 14px",
    fontSize: "12px",
    color: "#E2E8F0",
    borderBottom: "1px solid #181B22",
    verticalAlign: "middle" as const,
  } as React.CSSProperties,
};

export default function AdminDashboard() {
  const { user: authUser } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchFilter, setSearchFilter] = useState("");

  const loadRealData = async () => {
    try {
      const [pList, oList, uRes] = await Promise.all([
        fetchProducts(),
        fetchOrders(),
        fetchAdminUsers().catch(() => ({ success: true, data: [] })),
      ]);

      setProducts(pList || []);
      setOrders(oList || []);
      if (uRes && uRes.data) {
        setUsers(uRes.data);
      }
    } catch (e) {
      console.error("Error loading real data from database:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRealData();
  }, []);

  // Aggregations
  const totalRevenue = useMemo(() => {
    return orders.reduce((sum, o) => sum + (Number(o.total_amount) || 0), 0);
  }, [orders]);

  const newOrdersCount = useMemo(() => {
    return orders.filter((o) => {
      const st = (o.order_status || o.status || "").toLowerCase();
      return st === "pending" || st === "paid" || st === "new";
    }).length;
  }, [orders]);

  const lowStockCount = useMemo(() => {
    return products.filter((p) => {
      const qty = p.stock_qty ?? (p as any).stock_count ?? 0;
      return qty <= 5;
    }).length;
  }, [products]);

  const customerCount = users.filter((u) => u.role === "customer").length || users.length;

  const fmtCurrency = (n: number) => `LKR ${Number(n || 0).toLocaleString("en-US")}`;

  // Filtered views if user types in top search
  const displayedOrders = useMemo(() => {
    if (!searchFilter.trim()) return orders.slice(0, 5);
    const q = searchFilter.toLowerCase();
    return orders.filter(
      (o) =>
        o.id.toLowerCase().includes(q) ||
        o.customer_name?.toLowerCase().includes(q) ||
        o.customer_email?.toLowerCase().includes(q)
    );
  }, [orders, searchFilter]);

  const displayedProducts = useMemo(() => {
    if (!searchFilter.trim()) return products.slice(0, 5);
    const q = searchFilter.toLowerCase();
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.brand?.toLowerCase().includes(q) ||
        p.movement?.toLowerCase().includes(q)
    );
  }, [products, searchFilter]);

  // Dynamic monthly sales breakdown for SVG chart
  const monthlyData = useMemo(() => {
    const monthNames = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
    const now = new Date();
    const months: { label: string; year: number; month: number; total: number }[] = [];

    // Last 6 months
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({
        label: monthNames[d.getMonth()],
        year: d.getFullYear(),
        month: d.getMonth(),
        total: 0,
      });
    }

    for (const ord of orders) {
      if (ord.created_at) {
        const d = new Date(ord.created_at);
        const match = months.find((m) => m.year === d.getFullYear() && m.month === d.getMonth());
        if (match) {
          match.total += Number(ord.total_amount) || 0;
        }
      }
    }

    const maxVal = Math.max(...months.map((m) => m.total), 1);
    const points: [number, number][] = months.map((m, idx) => {
      const x = 30 + idx * (520 / (months.length - 1));
      const ratio = m.total / maxVal;
      const y = m.total > 0 ? Math.round(130 - ratio * 90) : 130;
      return [x, y];
    });

    const polylineStr = points.map(([x, y]) => `${x},${y}`).join(" ");
    const polygonStr = `${points[0][0]},145 ` + points.map(([x, y]) => `${x},${y}`).join(" ") + ` ${points[points.length - 1][0]},145`;

    return { months, points, polylineStr, polygonStr };
  }, [orders]);

  // Dynamic top selling watches derived from orders & active inventory
  const topSellingWatches = useMemo(() => {
    const soldMap: Record<string, { name: string; brand: string; count: number }> = {};
    for (const ord of orders) {
      if (Array.isArray(ord.items)) {
        for (const item of ord.items) {
          const pid = item.product_id || (item as any).id;
          const name = item.product_name || (item as any).name || "Watch";
          if (!soldMap[pid]) {
            const prod = products.find((p) => p.id === pid);
            soldMap[pid] = {
              name,
              brand: prod?.brand || "Swiss",
              count: 0,
            };
          }
          soldMap[pid].count += item.quantity || 1;
        }
      }
    }

    const sortedSold = Object.values(soldMap).sort((a, b) => b.count - a.count);
    if (sortedSold.length > 0) {
      return sortedSold.slice(0, 5).map((s) => ({
        name: s.name,
        brand: s.brand,
        sales: `${s.count} sold`,
      }));
    }

    // When no orders placed yet, display current inventory pieces with stock count
    return products.slice(0, 5).map((p) => ({
      name: p.name,
      brand: p.brand || "Swiss",
      sales: `${p.stock_qty ?? (p as any).stock_count ?? 0} in stock`,
    }));
  }, [orders, products]);

  return (
    <div className="space-y-6">
      {/* Clean Dashboard Header & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#0E1015] border border-[#1E232B] rounded-xl px-5 py-4 shadow-sm">
        <div>
          <h1 className="text-lg font-bold font-mono text-white tracking-wider uppercase">
            Dashboard
          </h1>
          <p className="text-xs font-mono text-[#6E7585] mt-0.5">
            Store performance and recent activity
          </p>
        </div>

        <div className="w-full sm:w-72">
          <input
            type="text"
            placeholder="Search orders or products…"
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            className="w-full bg-[#14161C] border border-[#262A33] rounded-lg px-3.5 py-2 text-xs text-white font-mono focus:outline-none focus:border-[#C5A059] placeholder:text-[#5E6573]"
          />
        </div>
      </div>

      {/* TOP 4 METRIC CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* TOTAL SALES */}
        <div style={S.card}>
          <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#C5A059] font-bold">
            TOTAL SALES
          </div>
          <div className="text-2xl font-bold font-mono text-white mt-2 truncate">
            {loading ? "..." : fmtCurrency(totalRevenue)}
          </div>
        </div>

        {/* NEW ORDERS */}
        <div style={S.card}>
          <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#C5A059] font-bold">
            NEW ORDERS
          </div>
          <div className="text-2xl font-bold font-mono text-white mt-2">
            {loading ? "..." : newOrdersCount}
          </div>
        </div>

        {/* CUSTOMERS */}
        <div style={S.card}>
          <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#C5A059] font-bold">
            CUSTOMERS
          </div>
          <div className="text-2xl font-bold font-mono text-white mt-2">
            {loading ? "..." : customerCount}
          </div>
        </div>

        {/* LOW STOCK */}
        <div style={S.card}>
          <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#F59E0B] font-bold">
            LOW STOCK
          </div>
          <div className="text-2xl font-bold font-mono text-[#F59E0B] mt-2">
            {loading ? "..." : lowStockCount}
          </div>
        </div>
      </div>

      {/* 2. MIDDLE ROW (2 CARDS): SALES OVERVIEW & TOP SELLING WATCHES */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Card: SALES OVERVIEW (LINE / BAR CHART) */}
        <div className="lg:col-span-8" style={S.card}>
          <div className="flex items-center justify-between border-b border-[#1C2028] pb-3 mb-4">
            <h2 className="text-xs font-mono uppercase font-bold text-[#C5A059] tracking-[0.2em]">
              SALES OVERVIEW
            </h2>
            <span className="text-[11px] font-mono text-[#6E7585]">Monthly Performance</span>
          </div>

          {/* Interactive Dynamic SVG Line / Bar Chart Representation */}
          <div className="h-56 w-full flex flex-col justify-between py-2">
            <svg className="w-full h-40 overflow-visible" viewBox="0 0 600 160">
              <defs>
                <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#C5A059" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#C5A059" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              {/* Grid Lines */}
              <line x1="0" y1="30" x2="600" y2="30" stroke="#1A1E26" strokeDasharray="3 3" />
              <line x1="0" y1="75" x2="600" y2="75" stroke="#1A1E26" strokeDasharray="3 3" />
              <line x1="0" y1="120" x2="600" y2="120" stroke="#1A1E26" strokeDasharray="3 3" />

              {/* Area fill */}
              <polygon
                points={monthlyData.polygonStr}
                fill="url(#chartGrad)"
              />
              {/* Path line */}
              <polyline
                fill="none"
                stroke="#C5A059"
                strokeWidth="2.5"
                points={monthlyData.polylineStr}
              />
              {/* Data points */}
              {monthlyData.points.map(([x, y], idx) => (
                <circle key={idx} cx={x} cy={y} r="4" fill="#C5A059" stroke="#0E1015" strokeWidth="2" />
              ))}
            </svg>

            <div className="flex justify-between text-[10px] font-mono text-[#6E7585] pt-2 border-t border-[#1C2028]">
              {monthlyData.months.map((m, idx) => (
                <span key={idx}>{m.label}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Right Card: TOP SELLING WATCHES */}
        <div className="lg:col-span-4" style={S.card}>
          <h2 className="text-xs font-mono uppercase font-bold text-[#C5A059] tracking-[0.2em] border-b border-[#1C2028] pb-3 mb-4">
            TOP SELLING WATCHES
          </h2>

          <div className="divide-y divide-[#181B22] space-y-3">
            {topSellingWatches.map((top, idx) => (
              <div key={idx} className="pt-3 flex items-center justify-between text-xs font-mono">
                <div>
                  <div className="text-white font-medium">{top.name}</div>
                  <div className="text-[10px] text-[#6E7585]">{top.brand}</div>
                </div>
                <div className="text-[#C5A059] font-bold">{top.sales}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 3. RECENT ORDERS TABLE BOX matching Page 4 Wireframe */}
      <div style={{ ...S.card, padding: 0, overflow: "hidden" }}>
        <div className="p-5 flex items-center justify-between border-b border-[#1C2028] bg-[#101217]">
          <h2 className="text-xs font-mono uppercase font-bold text-[#C5A059] tracking-[0.2em]">
            RECENT ORDERS
          </h2>
          <Link href="/admin/orders" className="text-xs font-mono text-[#8E95A5] hover:text-[#C5A059] transition-colors">
            View all →
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left" style={{ borderCollapse: "collapse", minWidth: "700px" }}>
            <thead>
              <tr>
                <th style={S.th}>ORDER</th>
                <th style={S.th}>CUSTOMER</th>
                <th style={S.th}>ITEMS</th>
                <th style={S.th}>PAYMENT</th>
                <th style={S.th}>STATUS</th>
                <th style={{ ...S.th, textAlign: "right" }}>TOTAL</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} style={{ ...S.td, textAlign: "center", padding: "30px", color: "#6E7585" }}>
                    Loading orders…
                  </td>
                </tr>
              ) : displayedOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ ...S.td, textAlign: "center", padding: "30px", color: "#6E7585" }}>
                    No orders recorded yet.
                  </td>
                </tr>
              ) : (
                displayedOrders.map((ord) => {
                  const paymentDisplay = ord.payment_status || "Paid";
                  const statusDisplay = ord.order_status || ord.status || "Processing";
                  const itemsSummary = ord.items?.map((i) => `${i.name || i.product_name || "Watch"} (x${i.quantity})`).join(", ") || "1 item";

                  return (
                    <tr key={ord.id} className="hover:bg-[#14161C] transition-colors">
                      <td style={S.td} className="font-mono font-bold text-white">
                        #{ord.id.slice(0, 10)}
                      </td>
                      <td style={S.td}>
                        <div className="font-medium text-white">{ord.customer_name || "Customer"}</div>
                        <div className="text-[10.5px] font-mono text-[#6E7585]">{ord.customer_email || "—"}</div>
                      </td>
                      <td style={S.td} className="text-[#8E95A5] max-w-[200px] truncate font-mono text-[11px]">
                        {itemsSummary}
                      </td>
                      <td style={S.td}>
                        <span className="text-[11px] font-mono text-emerald-400 capitalize">
                          {paymentDisplay}
                        </span>
                      </td>
                      <td style={S.td}>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#1C2028] text-[#C5A059] border border-[#262A33] uppercase">
                          {statusDisplay}
                        </span>
                      </td>
                      <td style={{ ...S.td, textAlign: "right" }} className="font-mono font-bold text-white">
                        {fmtCurrency(ord.total_amount)}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. PRODUCTS TABLE BOX matching Page 4 Wireframe */}
      <div style={{ ...S.card, padding: 0, overflow: "hidden" }}>
        <div className="p-5 flex items-center justify-between border-b border-[#1C2028] bg-[#101217]">
          <h2 className="text-xs font-mono uppercase font-bold text-[#C5A059] tracking-[0.2em]">
            PRODUCTS
          </h2>
          <Link
            href="/admin/products/new"
            className="px-4 py-2 bg-[#C5A059] hover:bg-[#D4AF37] text-black font-mono font-bold text-xs uppercase tracking-wider rounded-lg transition-colors shadow-md"
          >
            + ADD WATCH
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left" style={{ borderCollapse: "collapse", minWidth: "750px" }}>
            <thead>
              <tr>
                <th style={S.th}>IMAGE</th>
                <th style={S.th}>NAME</th>
                <th style={S.th}>BRAND</th>
                <th style={S.th}>PRICE</th>
                <th style={S.th}>STOCK</th>
                <th style={{ ...S.th, textAlign: "right" }}>ACTION</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} style={{ ...S.td, textAlign: "center", padding: "30px", color: "#6E7585" }}>
                    Loading products…
                  </td>
                </tr>
              ) : displayedProducts.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ ...S.td, textAlign: "center", padding: "30px", color: "#6E7585" }}>
                    No products found.
                  </td>
                </tr>
              ) : (
                displayedProducts.map((p) => {
                  const img = getProductImage(p.id, p.image_url);
                  const stock = p.stock_qty ?? (p as any).stock_count ?? 10;

                  return (
                    <tr key={p.id} className="hover:bg-[#14161C] transition-colors">
                      <td style={S.td}>
                        <div className="w-10 h-10 bg-[#14161C] border border-[#262A33] rounded-lg overflow-hidden p-0.5 flex items-center justify-center">
                          <SmoothImage src={img} alt={p.name} className="w-full h-full object-contain" />
                        </div>
                      </td>
                      <td style={S.td} className="font-semibold text-white">
                        {p.name}
                      </td>
                      <td style={S.td} className="text-[#8E95A5] font-mono text-[11px]">
                        {p.brand}
                      </td>
                      <td style={S.td} className="font-mono font-bold text-white">
                        {fmtCurrency(p.price)}
                      </td>
                      <td style={S.td} className="font-mono text-xs">
                        <span className={stock <= 5 ? "text-amber-400 font-bold" : "text-white"}>
                          {stock} units
                        </span>
                      </td>
                      <td style={{ ...S.td, textAlign: "right" }}>
                        <Link
                          href={`/admin/products?edit=${p.id}`}
                          className="px-3 py-1 bg-[#1C2028] hover:bg-[#282E38] text-[#C5A059] border border-[#262A33] rounded text-xs font-mono"
                        >
                          Edit
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}