"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import Link from "next/link";
import { fetchOrders, Order } from "@/lib/api";

type DatePreset = "all" | "today" | "yesterday" | "7d" | "30d" | "month" | "year" | "custom";

export default function AdminReportsPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [preset, setPreset] = useState<DatePreset>("all");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<"all" | "paid" | "pending">("all");
  const [searchQuery, setSearchQuery] = useState("");

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchOrders();
      setOrders(data || []);
    } catch (err: any) {
      console.error("Failed to load orders for reports:", err);
      setError(err?.message || "Failed to load sales report data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Update start & end dates when preset changes
  const applyPreset = (newPreset: DatePreset) => {
    setPreset(newPreset);
    const now = new Date();
    const todayStr = now.toISOString().split("T")[0];

    if (newPreset === "all") {
      setStartDate("");
      setEndDate("");
    } else if (newPreset === "today") {
      setStartDate(todayStr);
      setEndDate(todayStr);
    } else if (newPreset === "yesterday") {
      const y = new Date(now);
      y.setDate(y.getDate() - 1);
      const yStr = y.toISOString().split("T")[0];
      setStartDate(yStr);
      setEndDate(yStr);
    } else if (newPreset === "7d") {
      const past7 = new Date(now);
      past7.setDate(past7.getDate() - 7);
      setStartDate(past7.toISOString().split("T")[0]);
      setEndDate(todayStr);
    } else if (newPreset === "30d") {
      const past30 = new Date(now);
      past30.setDate(past30.getDate() - 30);
      setStartDate(past30.toISOString().split("T")[0]);
      setEndDate(todayStr);
    } else if (newPreset === "month") {
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
      setStartDate(firstDay.toISOString().split("T")[0]);
      setEndDate(todayStr);
    } else if (newPreset === "year") {
      const firstDayYear = new Date(now.getFullYear(), 0, 1);
      setStartDate(firstDayYear.toISOString().split("T")[0]);
      setEndDate(todayStr);
    }
  };

  // Filter orders by date range, payment status, and search query
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      // Date filter
      if (startDate || endDate) {
        const orderDateStr = order.created_at
          ? new Date(order.created_at).toISOString().split("T")[0]
          : "";
        if (startDate && orderDateStr < startDate) return false;
        if (endDate && orderDateStr > endDate) return false;
      }

      // Status filter
      if (statusFilter !== "all") {
        const pStatus = (order.payment_status || "").toLowerCase();
        if (statusFilter === "paid" && pStatus !== "paid" && pStatus !== "completed") {
          return false;
        }
        if (statusFilter === "pending" && pStatus !== "pending" && pStatus !== "pending_payment") {
          return false;
        }
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesId = (order.id || "").toLowerCase().includes(q) || (order.order_number || "").toLowerCase().includes(q);
        const matchesName = (order.customer_name || "").toLowerCase().includes(q);
        const matchesEmail = (order.customer_email || "").toLowerCase().includes(q);
        const matchesPayment = (order.payment_method || "").toLowerCase().includes(q);
        if (!matchesId && !matchesName && !matchesEmail && !matchesPayment) {
          return false;
        }
      }

      return true;
    });
  }, [orders, startDate, endDate, statusFilter, searchQuery]);

  // Aggregated Report Metrics
  const metrics = useMemo(() => {
    const totalSales = filteredOrders.reduce(
      (sum, o) => sum + (Number(o.total_amount) || 0),
      0
    );
    const orderCount = filteredOrders.length;
    const aov = orderCount > 0 ? totalSales / orderCount : 0;

    const paidOrders = filteredOrders.filter((o) => {
      const st = (o.payment_status || "").toLowerCase();
      return st === "paid" || st === "completed";
    });
    const paidSales = paidOrders.reduce((sum, o) => sum + (Number(o.total_amount) || 0), 0);

    const pendingOrders = filteredOrders.filter((o) => {
      const st = (o.payment_status || "").toLowerCase();
      return st === "pending" || st === "pending_payment";
    });
    const pendingSales = pendingOrders.reduce((sum, o) => sum + (Number(o.total_amount) || 0), 0);

    // Product frequency
    const itemFreq: Record<string, { count: number; revenue: number }> = {};
    filteredOrders.forEach((o) => {
      (o.items || []).forEach((it: any) => {
        const name = it.product_name || it.name || "Watch";
        const qty = Number(it.quantity) || 1;
        const price = Number(it.unit_price || it.price) || 0;
        if (!itemFreq[name]) {
          itemFreq[name] = { count: 0, revenue: 0 };
        }
        itemFreq[name].count += qty;
        itemFreq[name].revenue += qty * price;
      });
    });

    const topProducts = Object.entries(itemFreq)
      .sort((a, b) => b[1].revenue - a[1].revenue)
      .slice(0, 4);

    return {
      totalSales,
      orderCount,
      aov,
      paidSales,
      paidCount: paidOrders.length,
      pendingSales,
      pendingCount: pendingOrders.length,
      topProducts,
    };
  }, [filteredOrders]);

  const fmtCurrency = (n: number) => `LKR ${Number(n || 0).toLocaleString("en-US")}`;

  const handlePrint = () => {
    window.print();
  };

  const activeDateLabel = useMemo(() => {
    if (preset === "today") return "Today";
    if (preset === "yesterday") return "Yesterday";
    if (preset === "7d") return "Last 7 Days";
    if (preset === "30d") return "Last 30 Days";
    if (preset === "month") return "This Month";
    if (preset === "year") return "This Year";
    if (startDate && endDate) return `${startDate} to ${endDate}`;
    if (startDate) return `From ${startDate}`;
    if (endDate) return `Until ${endDate}`;
    return "All Time (Complete History)";
  }, [preset, startDate, endDate]);

  return (
    <div className="space-y-8 print:p-0 print:m-0 print:bg-white print:text-black">
      {/* Print-Only Header (visible only on print / PDF output) */}
      <div className="hidden print:block border-b-2 border-black pb-4 mb-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold uppercase tracking-widest font-serif">
              Krono Luxury Watches
            </h1>
            <p className="text-xs text-neutral-600 font-mono mt-1">
              Official Executive Sales & Revenue Report
            </p>
          </div>
          <div className="text-right text-xs font-mono">
            <div><strong>Report Period:</strong> {activeDateLabel}</div>
            <div><strong>Generated At:</strong> {new Date().toLocaleString()}</div>
            <div><strong>Total Orders:</strong> {metrics.orderCount}</div>
          </div>
        </div>
      </div>

      {/* Top Header & Actions Bar (Hidden on print) */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#0E1015] border border-[#1E232B] rounded-2xl p-6 shadow-md print:hidden">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-[#C5A059] uppercase tracking-widest font-bold">
            <span>✦ Financial Intelligence</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-white tracking-tight mt-1">
            Sales & Revenue Reports
          </h1>
          <p className="text-xs text-[#8E95A5] font-mono mt-1">
            Filter total sales by custom date periods and export boardroom-ready PDF reports.
          </p>
        </div>

        {/* Print / Export PDF Button */}
        <div className="flex items-center gap-3">
          <button
            onClick={loadData}
            disabled={loading}
            className="px-4 py-2.5 bg-[#14161C] hover:bg-[#1E232B] border border-[#282E38] text-white text-xs font-mono rounded-lg transition-colors flex items-center gap-2 cursor-pointer"
            title="Refresh order data"
          >
            <span className={loading ? "animate-spin" : ""}>↻</span>
            <span>Refresh</span>
          </button>

          <button
            onClick={handlePrint}
            className="px-5 py-2.5 bg-[#C5A059] hover:bg-[#d4af37] text-black font-bold text-xs uppercase tracking-wider rounded-lg transition-all shadow-lg hover:shadow-[#C5A059]/20 flex items-center gap-2 cursor-pointer"
          >
            <svg
              className="w-4 h-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="6 9 6 2 18 2 18 9" />
              <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
              <rect x="6" y="14" width="12" height="8" />
            </svg>
            <span>Print / Save as PDF</span>
          </button>
        </div>
      </div>

      {/* Date & Filter Control Bar (Hidden on print) */}
      <div className="bg-[#0E1015] border border-[#1E232B] rounded-2xl p-6 space-y-4 shadow-md print:hidden">
        {/* Preset Range Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[10px] font-mono uppercase tracking-widest text-white/50 font-bold mr-2">
            Date Range:
          </span>
          {[
            { id: "all", label: "All Time" },
            { id: "today", label: "Today" },
            { id: "yesterday", label: "Yesterday" },
            { id: "7d", label: "Last 7 Days" },
            { id: "30d", label: "Last 30 Days" },
            { id: "month", label: "This Month" },
            { id: "year", label: "This Year" },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => applyPreset(item.id as DatePreset)}
              className={`px-3 py-1.5 text-xs font-mono rounded-lg transition-colors cursor-pointer border ${
                preset === item.id
                  ? "bg-[#C5A059] text-black font-bold border-[#C5A059]"
                  : "bg-[#14161C] text-white/70 border-[#262A33] hover:text-white hover:border-[#383E4B]"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Custom Date Pickers & Filters Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-3 border-t border-[#1C2028]">
          {/* Start Date */}
          <div className="space-y-1">
            <label className="block text-[10px] font-mono uppercase text-white/50 font-semibold">
              From Date:
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                setPreset("custom");
              }}
              className="w-full bg-[#14161C] border border-[#262A33] text-white text-xs font-mono rounded-lg px-3 py-2 focus:outline-none focus:border-[#C5A059]"
            />
          </div>

          {/* End Date */}
          <div className="space-y-1">
            <label className="block text-[10px] font-mono uppercase text-white/50 font-semibold">
              To Date:
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                setPreset("custom");
              }}
              className="w-full bg-[#14161C] border border-[#262A33] text-white text-xs font-mono rounded-lg px-3 py-2 focus:outline-none focus:border-[#C5A059]"
            />
          </div>

          {/* Payment Status */}
          <div className="space-y-1">
            <label className="block text-[10px] font-mono uppercase text-white/50 font-semibold">
              Payment Status:
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="w-full bg-[#14161C] border border-[#262A33] text-white text-xs font-mono rounded-lg px-3 py-2 focus:outline-none focus:border-[#C5A059]"
            >
              <option value="all">All Payment Statuses</option>
              <option value="paid">Paid & Verified Only</option>
              <option value="pending">Pending Payment Only</option>
            </select>
          </div>

          {/* Search Filter */}
          <div className="space-y-1">
            <label className="block text-[10px] font-mono uppercase text-white/50 font-semibold">
              Search by Client / Order:
            </label>
            <input
              type="text"
              placeholder="Search order ID, client name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#14161C] border border-[#262A33] text-white text-xs font-mono rounded-lg px-3 py-2 focus:outline-none focus:border-[#C5A059] placeholder:text-[#5E6573]"
            />
          </div>
        </div>

        {/* Active Filter Summary Pill */}
        <div className="flex items-center justify-between text-xs font-mono text-[#8E95A5] pt-2">
          <div>
            Showing orders for: <span className="text-white font-bold">{activeDateLabel}</span>
          </div>
          {(startDate || endDate || statusFilter !== "all" || searchQuery) && (
            <button
              onClick={() => {
                applyPreset("all");
                setStatusFilter("all");
                setSearchQuery("");
              }}
              className="text-[#C5A059] hover:underline cursor-pointer uppercase text-[10px]"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* KPI Cards Summary Grid (Styling adapts for both Screen & Print) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 print:grid-cols-4 print:gap-3">
        {/* Total Sales */}
        <div className="bg-[#0E1015] border border-[#1E232B] rounded-xl p-5 shadow-sm print:bg-neutral-50 print:border-neutral-300 print:p-3">
          <div className="text-[10px] font-mono uppercase tracking-widest text-[#C5A059] font-bold print:text-neutral-700">
            TOTAL SALES REVENUE
          </div>
          <div className="text-2xl font-bold font-mono text-white mt-1.5 truncate print:text-black">
            {fmtCurrency(metrics.totalSales)}
          </div>
          <div className="text-[11px] font-mono text-[#8E95A5] mt-1 print:text-neutral-600">
            Across {metrics.orderCount} orders in period
          </div>
        </div>

        {/* Paid Volume */}
        <div className="bg-[#0E1015] border border-[#1E232B] rounded-xl p-5 shadow-sm print:bg-neutral-50 print:border-neutral-300 print:p-3">
          <div className="text-[10px] font-mono uppercase tracking-widest text-emerald-400 font-bold print:text-emerald-700">
            COLLECTED / PAID
          </div>
          <div className="text-2xl font-bold font-mono text-white mt-1.5 truncate print:text-black">
            {fmtCurrency(metrics.paidSales)}
          </div>
          <div className="text-[11px] font-mono text-[#8E95A5] mt-1 print:text-neutral-600">
            {metrics.paidCount} orders settled
          </div>
        </div>

        {/* Pending Settlement */}
        <div className="bg-[#0E1015] border border-[#1E232B] rounded-xl p-5 shadow-sm print:bg-neutral-50 print:border-neutral-300 print:p-3">
          <div className="text-[10px] font-mono uppercase tracking-widest text-amber-400 font-bold print:text-amber-700">
            PENDING REVENUE
          </div>
          <div className="text-2xl font-bold font-mono text-white mt-1.5 truncate print:text-black">
            {fmtCurrency(metrics.pendingSales)}
          </div>
          <div className="text-[11px] font-mono text-[#8E95A5] mt-1 print:text-neutral-600">
            {metrics.pendingCount} orders awaiting gateway/bank
          </div>
        </div>

        {/* Average Order Value (AOV) */}
        <div className="bg-[#0E1015] border border-[#1E232B] rounded-xl p-5 shadow-sm print:bg-neutral-50 print:border-neutral-300 print:p-3">
          <div className="text-[10px] font-mono uppercase tracking-widest text-blue-400 font-bold print:text-blue-700">
            AVERAGE ORDER VALUE
          </div>
          <div className="text-2xl font-bold font-mono text-white mt-1.5 truncate print:text-black">
            {fmtCurrency(metrics.aov)}
          </div>
          <div className="text-[11px] font-mono text-[#8E95A5] mt-1 print:text-neutral-600">
            Mean transaction size
          </div>
        </div>
      </div>

      {/* Top Models breakdown (Hidden on Print if empty) */}
      {metrics.topProducts.length > 0 && (
        <div className="bg-[#0E1015] border border-[#1E232B] rounded-2xl p-6 shadow-md print:bg-transparent print:border-neutral-300 print:p-4">
          <div className="text-xs font-mono uppercase tracking-widest text-[#C5A059] font-bold mb-4 print:text-black">
            ✦ Best-Selling Watches in Period
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 print:grid-cols-4">
            {metrics.topProducts.map(([name, data]) => (
              <div
                key={name}
                className="bg-[#14161C] border border-[#262A33] rounded-xl p-3.5 print:bg-white print:border-neutral-300"
              >
                <div className="text-xs font-bold text-white truncate print:text-black">{name}</div>
                <div className="flex items-center justify-between text-xs font-mono mt-2">
                  <span className="text-[#8E95A5] print:text-neutral-600">{data.count} units sold</span>
                  <span className="text-[#C5A059] font-bold print:text-black">{fmtCurrency(data.revenue)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Itemized Sales Transactions Table */}
      <div className="bg-[#0E1015] border border-[#1E232B] rounded-2xl shadow-md overflow-hidden print:border-neutral-300 print:shadow-none">
        <div className="p-6 border-b border-[#1E232B] flex items-center justify-between print:p-3 print:border-neutral-300">
          <div>
            <h2 className="text-sm font-bold font-mono uppercase tracking-wider text-white print:text-black">
              Itemized Sales Records ({filteredOrders.length})
            </h2>
            <p className="text-xs text-[#8E95A5] font-mono print:text-neutral-600">
              Verified order transactions for reporting period: {activeDateLabel}
            </p>
          </div>
          <div className="text-xs font-mono text-[#C5A059] font-bold print:text-black">
            Total: {fmtCurrency(metrics.totalSales)}
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center text-xs font-mono text-[#8E95A5] animate-pulse">
            Loading sales data...
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="p-12 text-center text-xs font-mono text-[#8E95A5] space-y-2">
            <div>No sales transactions found for the selected date range.</div>
            <button
              onClick={() => applyPreset("all")}
              className="text-[#C5A059] underline hover:text-white"
            >
              View All-Time Sales
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-[#12141A] text-[#8E95A5] uppercase tracking-wider border-b border-[#1E232B] print:bg-neutral-100 print:text-neutral-800 print:border-black">
                <tr>
                  <th className="py-3 px-4">Order ID</th>
                  <th className="py-3 px-4">Date & Time</th>
                  <th className="py-3 px-4">Customer Details</th>
                  <th className="py-3 px-4">Items Summary</th>
                  <th className="py-3 px-4">Payment Method</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#181B22] text-white print:divide-neutral-300 print:text-black">
                {filteredOrders.map((order) => {
                  const itemsList = order.items || [];
                  const isPaid =
                    (order.payment_status || "").toLowerCase() === "paid" ||
                    (order.payment_status || "").toLowerCase() === "completed";

                  return (
                    <tr
                      key={order.id || order.order_number}
                      className="hover:bg-[#14161C]/60 transition-colors print:hover:bg-transparent"
                    >
                      <td className="py-3.5 px-4 font-bold text-[#C5A059] print:text-black whitespace-nowrap">
                        {order.order_number || order.id}
                      </td>
                      <td className="py-3.5 px-4 text-white/70 print:text-neutral-700 whitespace-nowrap">
                        {order.created_at
                          ? new Date(order.created_at).toLocaleString("en-US", {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : "—"}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-white print:text-black">
                          {order.customer_email || (order.customer_name && order.customer_name !== "Valued Client" ? order.customer_name : "Customer")}
                        </div>
                        {order.customer_phone && (
                          <div className="text-[11px] text-white/40 print:text-neutral-500">
                            {order.customer_phone}
                          </div>
                        )}
                      </td>
                      <td className="py-3.5 px-4 max-w-xs">
                        {itemsList.length > 0 ? (
                          <div className="space-y-1">
                            {itemsList.map((it: any, idx: number) => (
                              <div key={idx} className="truncate">
                                <span className="text-white/40 print:text-neutral-500 font-bold mr-1">
                                  {it.quantity}×
                                </span>
                                <span>{it.product_name || it.name || "Watch"}</span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <span className="text-white/40 print:text-neutral-500">Luxury Order</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 uppercase text-white/70 print:text-neutral-700">
                        {order.payment_method === "payhere"
                          ? "PayHere Gateway"
                          : order.payment_method === "wire"
                          ? "Bank Wire"
                          : order.payment_method || "Direct"}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase print:border print:border-black ${
                            isPaid
                              ? "bg-emerald-950/60 text-emerald-400 border border-emerald-500/40 print:bg-neutral-100 print:text-black"
                              : "bg-amber-950/60 text-amber-400 border border-amber-500/40 print:bg-neutral-100 print:text-black"
                          }`}
                        >
                          {order.payment_status || "Pending"}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right font-bold font-mono text-white print:text-black whitespace-nowrap">
                        {fmtCurrency(order.total_amount)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot className="bg-[#12141A] font-bold border-t-2 border-[#1E232B] print:bg-neutral-100 print:border-black">
                <tr>
                  <td colSpan={6} className="py-3.5 px-4 text-right uppercase text-white print:text-black">
                    Grand Total ({filteredOrders.length} Orders):
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono text-[#C5A059] print:text-black text-sm">
                    {fmtCurrency(metrics.totalSales)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>

      {/* Print Footer with Sign-off (Visible only when printed) */}
      <div className="hidden print:flex justify-between items-end pt-12 text-xs font-mono border-t border-black mt-8">
        <div>
          <div><strong>Prepared By:</strong> Krono Atelier Administrative Controller</div>
          <div><strong>Verification:</strong> Certified Digital Audit Record</div>
        </div>
        <div className="text-right">
          <div className="border-b border-black w-48 mb-1"></div>
          <div>Authorized Signature & Stamp</div>
        </div>
      </div>

      {/* Print Style Injector */}
      <style jsx global>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 15mm;
          }
          body {
            background-color: white !important;
            color: black !important;
          }
          /* Hide admin sidebar and navigation when printing reports */
          nav, aside, header, .no-print, button, input, select {
            display: none !important;
          }
          table {
            page-break-inside: auto;
          }
          tr {
            page-break-inside: avoid;
            page-break-after: auto;
          }
        }
      `}</style>
    </div>
  );
}
