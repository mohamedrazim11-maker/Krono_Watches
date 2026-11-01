"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import Link from "next/link";
import { fetchOrders, fetchProducts, fetchAdminUsers, Order, Product, AdminUser } from "@/lib/api";
import { getProductImage } from "@/lib/productImages";

type ReportTab = "sales" | "inventory" | "products" | "customers";
type DatePreset = "all" | "today" | "yesterday" | "7d" | "30d" | "month" | "year" | "custom";

export default function AdminReportsPage() {
  const [activeTab, setActiveTab] = useState<ReportTab>("sales");
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [preset, setPreset] = useState<DatePreset>("all");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<"all" | "paid" | "pending" | "refund">("all");
  const [searchQuery, setSearchQuery] = useState("");

  const loadAllRealData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [ordersRes, productsRes, usersRes] = await Promise.all([
        fetchOrders(),
        fetchProducts(),
        fetchAdminUsers().catch(() => ({ success: true, data: [] })),
      ]);

      setOrders(ordersRes || []);
      setProducts(productsRes || []);
      if (usersRes && usersRes.data) {
        setUsers(usersRes.data);
      }
    } catch (err: any) {
      console.error("Failed to load real reports data:", err);
      setError(err?.message || "Failed to load live store data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllRealData();
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

  // Helper map: Find customer real name from registered users list
  const userMap = useMemo(() => {
    const map = new Map<string, AdminUser>();
    users.forEach((u) => {
      if (u.id) map.set(u.id, u);
      if (u.email) map.set(u.email.toLowerCase(), u);
    });
    return map;
  }, [users]);

  const resolveCustomerName = (order: Order) => {
    if (order.user_id && userMap.has(order.user_id)) {
      const u = userMap.get(order.user_id);
      if (u?.name) return u.name;
    }
    if (order.customer_email && userMap.has(order.customer_email.toLowerCase())) {
      const u = userMap.get(order.customer_email.toLowerCase());
      if (u?.name) return u.name;
    }
    if (order.customer_name && !order.customer_name.includes("@") && order.customer_name !== "Valued Client") {
      return order.customer_name;
    }
    return order.customer_name || order.customer_email || "Customer";
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
        const oStatus = (order.status || order.order_status || "").toLowerCase();

        if (statusFilter === "paid" && pStatus !== "paid" && pStatus !== "completed") {
          return false;
        }
        if (statusFilter === "pending" && pStatus !== "pending" && pStatus !== "pending_payment") {
          return false;
        }
        if (statusFilter === "refund" && !oStatus.includes("refund") && !pStatus.includes("refund")) {
          return false;
        }
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesId = (order.id || "").toLowerCase().includes(q) || (order.order_number || "").toLowerCase().includes(q);
        const resolvedName = resolveCustomerName(order).toLowerCase();
        const matchesName = resolvedName.includes(q) || (order.customer_name || "").toLowerCase().includes(q);
        const matchesEmail = (order.customer_email || "").toLowerCase().includes(q);
        const matchesPayment = (order.payment_method || "").toLowerCase().includes(q);
        const matchesItem = (order.items || []).some((it: any) =>
          (it.product_name || it.name || "").toLowerCase().includes(q)
        );
        if (!matchesId && !matchesName && !matchesEmail && !matchesPayment && !matchesItem) {
          return false;
        }
      }

      return true;
    });
  }, [orders, startDate, endDate, statusFilter, searchQuery, userMap]);

  // Aggregated Sales Report Metrics
  const salesMetrics = useMemo(() => {
    const totalSales = filteredOrders.reduce((sum, o) => sum + (Number(o.total_amount) || 0), 0);
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

    const refundOrders = filteredOrders.filter((o) => {
      const st = (o.status || o.order_status || "").toLowerCase();
      const p = (o.payment_status || "").toLowerCase();
      return st.includes("refund") || p.includes("refund");
    });
    const refundSales = refundOrders.reduce((sum, o) => sum + (Number(o.total_amount) || 0), 0);

    // Dynamic Monthly Breakdown for Chart
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const now = new Date();
    const months: { label: string; year: number; month: number; total: number; count: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({
        label: `${monthNames[d.getMonth()]} ${d.getFullYear() === now.getFullYear() ? "" : d.getFullYear()}`,
        year: d.getFullYear(),
        month: d.getMonth(),
        total: 0,
        count: 0,
      });
    }

    filteredOrders.forEach((ord) => {
      if (ord.created_at) {
        const d = new Date(ord.created_at);
        const match = months.find((m) => m.year === d.getFullYear() && m.month === d.getMonth());
        if (match) {
          match.total += Number(ord.total_amount) || 0;
          match.count += 1;
        }
      }
    });

    const maxMonthlyVal = Math.max(...months.map((m) => m.total), 1);

    return {
      totalSales,
      orderCount,
      aov,
      paidSales,
      paidCount: paidOrders.length,
      pendingSales,
      pendingCount: pendingOrders.length,
      refundSales,
      refundCount: refundOrders.length,
      months,
      maxMonthlyVal,
    };
  }, [filteredOrders]);

  // Aggregated Inventory & Stock Metrics
  const inventoryMetrics = useMemo(() => {
    let filteredList = products;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filteredList = products.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.brand?.toLowerCase().includes(q) ||
          p.category?.toLowerCase().includes(q)
      );
    }

    const totalProducts = products.length;
    const totalStockUnits = products.reduce(
      (sum, p) => sum + (Number(p.stock_qty ?? p.stock_count) || 0),
      0
    );
    const totalValuation = products.reduce(
      (sum, p) => sum + (Number(p.price) || 0) * (Number(p.stock_qty ?? p.stock_count) || 0),
      0
    );

    const lowStockWatches = products.filter((p) => {
      const q = Number(p.stock_qty ?? p.stock_count) || 0;
      return q > 0 && q <= 5;
    });

    const outOfStockWatches = products.filter((p) => {
      const q = Number(p.stock_qty ?? p.stock_count) || 0;
      return q === 0 || p.in_stock === false;
    });

    // Grouping by brand
    const brandMap: Record<string, { count: number; units: number; valuation: number }> = {};
    products.forEach((p) => {
      const b = p.brand || "Swiss Independent";
      if (!brandMap[b]) brandMap[b] = { count: 0, units: 0, valuation: 0 };
      const qty = Number(p.stock_qty ?? p.stock_count) || 0;
      brandMap[b].count += 1;
      brandMap[b].units += qty;
      brandMap[b].valuation += qty * (Number(p.price) || 0);
    });

    const topBrandsByValuation = Object.entries(brandMap)
      .sort((a, b) => b[1].valuation - a[1].valuation)
      .slice(0, 5);

    return {
      filteredList,
      totalProducts,
      totalStockUnits,
      totalValuation,
      lowStockCount: lowStockWatches.length,
      outOfStockCount: outOfStockWatches.length,
      topBrandsByValuation,
    };
  }, [products, searchQuery]);

  // Aggregated Product Sales Performance Metrics
  const productPerformanceMetrics = useMemo(() => {
    const salesMap: Record<
      string,
      {
        productId: string;
        name: string;
        brand: string;
        price: number;
        imageUrl: string;
        unitsSold: number;
        revenue: number;
        orderCount: number;
        stockLeft: number;
      }
    > = {};

    // Seed with all products in catalog
    products.forEach((p) => {
      salesMap[p.id] = {
        productId: p.id,
        name: p.name,
        brand: p.brand || "Krono Swiss",
        price: Number(p.price) || 0,
        imageUrl: p.image_url,
        unitsSold: 0,
        revenue: 0,
        orderCount: 0,
        stockLeft: Number(p.stock_qty ?? p.stock_count) || 0,
      };
    });

    // Aggregate from filtered orders
    filteredOrders.forEach((ord) => {
      (ord.items || []).forEach((it: any) => {
        const pid = it.product_id || it.id;
        const qty = Number(it.quantity) || 1;
        const price = Number(it.unit_price || it.price) || 0;
        const name = it.product_name || it.name || "Timepiece";

        if (pid && salesMap[pid]) {
          salesMap[pid].unitsSold += qty;
          salesMap[pid].revenue += qty * price;
          salesMap[pid].orderCount += 1;
        } else {
          const key = pid || name;
          if (!salesMap[key]) {
            salesMap[key] = {
              productId: key,
              name,
              brand: it.brand || "Swiss",
              price,
              imageUrl: it.image_url || "/images/watches/submariner_deep_black_ceramic.jpg",
              unitsSold: 0,
              revenue: 0,
              orderCount: 0,
              stockLeft: 0,
            };
          }
          salesMap[key].unitsSold += qty;
          salesMap[key].revenue += qty * price;
          salesMap[key].orderCount += 1;
        }
      });
    });

    let list = Object.values(salesMap);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter((p) => p.name.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q));
    }

    // Sort by units sold descending
    const sorted = [...list].sort((a, b) => b.unitsSold - a.unitsSold || b.revenue - a.revenue);
    const totalSoldUnits = sorted.reduce((sum, p) => sum + p.unitsSold, 0);
    const totalProductRevenue = sorted.reduce((sum, p) => sum + p.revenue, 0);
    const topSeller = sorted.find((p) => p.unitsSold > 0) || sorted[0];

    return {
      productsList: sorted,
      totalSoldUnits,
      totalProductRevenue,
      topSeller,
    };
  }, [products, filteredOrders, searchQuery]);

  // Aggregated Customer Metrics
  const customerMetrics = useMemo(() => {
    const custMap: Record<
      string,
      {
        id: string;
        name: string;
        email: string;
        phone: string;
        ordersCount: number;
        totalSpend: number;
        lastOrderDate: string;
        isRegistered: boolean;
      }
    > = {};

    // Seed registered users
    users
      .filter((u) => u.role !== "admin")
      .forEach((u) => {
        const key = u.email.toLowerCase();
        custMap[key] = {
          id: u.id,
          name: u.name || "Valued Client",
          email: u.email,
          phone: u.phone || "—",
          ordersCount: 0,
          totalSpend: 0,
          lastOrderDate: "",
          isRegistered: true,
        };
      });

    // Populate actual spending from all orders
    orders.forEach((ord) => {
      const email = (ord.customer_email || "").toLowerCase();
      const resolvedName = resolveCustomerName(ord);
      const key = email || ord.customer_name || ord.id;

      if (!custMap[key]) {
        custMap[key] = {
          id: ord.user_id || ord.id,
          name: resolvedName,
          email: ord.customer_email || "Guest Client",
          phone: ord.customer_phone || "—",
          ordersCount: 0,
          totalSpend: 0,
          lastOrderDate: ord.created_at || "",
          isRegistered: false,
        };
      }

      custMap[key].ordersCount += 1;
      custMap[key].totalSpend += Number(ord.total_amount) || 0;
      if (ord.created_at && (!custMap[key].lastOrderDate || ord.created_at > custMap[key].lastOrderDate)) {
        custMap[key].lastOrderDate = ord.created_at;
      }
    });

    let list = Object.values(custMap);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.email.toLowerCase().includes(q) ||
          c.phone.includes(q)
      );
    }

    const sortedBySpend = [...list].sort((a, b) => b.totalSpend - a.totalSpend);
    const totalCustomers = list.length;
    const totalSpendAll = sortedBySpend.reduce((sum, c) => sum + c.totalSpend, 0);
    const avgSpendPerCustomer = totalCustomers > 0 ? totalSpendAll / totalCustomers : 0;
    const topVip = sortedBySpend[0];

    return {
      customerList: sortedBySpend,
      totalCustomers,
      totalSpendAll,
      avgSpendPerCustomer,
      topVip,
    };
  }, [users, orders, searchQuery, userMap]);

  const fmtCurrency = (n: number) => `LKR ${Number(n || 0).toLocaleString("en-US")}`;

  const handlePrint = () => {
    window.print();
  };

  // CSV Export Generator for whichever tab is active
  const handleExportCsv = () => {
    const timestamp = new Date().toISOString().split("T")[0];

    if (activeTab === "sales") {
      const rows: (string | number)[][] = [
        ["Order ID", "Date", "Customer Name", "Customer Email", "Customer Phone", "Items Summary", "Payment Method", "Payment Status", "Order Status", "Total Amount (LKR)"],
        ...filteredOrders.map((o) => [
          o.order_number || o.id,
          o.created_at ? new Date(o.created_at).toLocaleString() : "",
          resolveCustomerName(o),
          o.customer_email || "",
          o.customer_phone || "",
          (o.items || []).map((it: any) => `${it.quantity}x ${it.product_name || it.name}`).join(" | "),
          o.payment_method || "Direct",
          o.payment_status || "Pending",
          o.status || o.order_status || "Processing",
          Number(o.total_amount) || 0,
        ]),
      ];
      downloadCsv(`krono_sales_report_${timestamp}.csv`, rows);
    } else if (activeTab === "inventory") {
      const rows: (string | number)[][] = [
        ["Product ID", "Watch Model", "Brand", "Category", "Retail Price (LKR)", "Stock Units", "Stock Status", "Total Valuation (LKR)"],
        ...inventoryMetrics.filteredList.map((p) => {
          const qty = Number(p.stock_qty ?? p.stock_count) || 0;
          const status = qty === 0 ? "Out of Stock" : qty <= 5 ? "Low Stock" : "In Stock";
          const val = qty * (Number(p.price) || 0);
          return [p.id, p.name, p.brand || "", p.category || "", Number(p.price) || 0, qty, status, val];
        }),
      ];
      downloadCsv(`krono_inventory_report_${timestamp}.csv`, rows);
    } else if (activeTab === "products") {
      const rows: (string | number)[][] = [
        ["Product ID", "Watch Model", "Brand", "Retail Price (LKR)", "Units Sold", "Total Revenue (LKR)", "Orders Count", "Current Stock Remaining"],
        ...productPerformanceMetrics.productsList.map((p) => [
          p.productId,
          p.name,
          p.brand,
          p.price,
          p.unitsSold,
          p.revenue,
          p.orderCount,
          p.stockLeft,
        ]),
      ];
      downloadCsv(`krono_product_performance_report_${timestamp}.csv`, rows);
    } else if (activeTab === "customers") {
      const rows: (string | number)[][] = [
        ["Customer ID", "Client Name", "Email Address", "Phone", "Account Type", "Orders Placed", "Total Spend (LKR)", "Last Purchase Date"],
        ...customerMetrics.customerList.map((c) => [
          c.id,
          c.name,
          c.email,
          c.phone,
          c.isRegistered ? "Registered Member" : "Guest Client",
          c.ordersCount,
          c.totalSpend,
          c.lastOrderDate ? new Date(c.lastOrderDate).toLocaleString() : "Never",
        ]),
      ];
      downloadCsv(`krono_customer_report_${timestamp}.csv`, rows);
    }
  };

  const downloadCsv = (filename: string, rows: (string | number)[][]) => {
    const csvContent =
      "data:text/csv;charset=utf-8," +
      rows
        .map((e) =>
          e
            .map((val) => {
              let s = String(val ?? "");
              if (s.includes(",") || s.includes('"') || s.includes("\n")) {
                s = `"${s.replace(/"/g, '""')}"`;
              }
              return s;
            })
            .join(",")
        )
        .join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
    return "All Time (Complete Store History)";
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
              Live Verified Enterprise Audit Report · {activeTab.toUpperCase()}
            </p>
          </div>
          <div className="text-right text-xs font-mono">
            <div><strong>Report Type:</strong> {activeTab.toUpperCase()} REPORT</div>
            <div><strong>Report Period:</strong> {activeDateLabel}</div>
            <div><strong>Generated At:</strong> {new Date().toLocaleString()}</div>
          </div>
        </div>
      </div>

      {/* Top Header & Actions Bar (Hidden on print) */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#0E1015] border border-[#1E232B] rounded-2xl p-6 shadow-md print:hidden">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-[#C5A059] uppercase tracking-widest font-bold">
            <span>✦ Live Database Analytics</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-white tracking-tight mt-1">
            Store Reports & Financial Intelligence
          </h1>
          <p className="text-xs text-[#8E95A5] font-mono mt-1">
            Real-time business data calculated directly from your store&apos;s live database transactions.
          </p>
        </div>

        {/* Action Buttons: Refresh, CSV Export, Print/PDF */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={loadAllRealData}
            disabled={loading}
            className="px-4 py-2.5 bg-[#14161C] hover:bg-[#1E232B] border border-[#282E38] text-white text-xs font-mono rounded-lg transition-colors flex items-center gap-2 cursor-pointer"
            title="Refresh database records"
          >
            <span className={loading ? "animate-spin" : ""}>↻</span>
            <span>{loading ? "Loading..." : "Sync Live Data"}</span>
          </button>

          <button
            onClick={handleExportCsv}
            disabled={loading}
            className="px-4 py-2.5 bg-[#14161C] hover:bg-[#1E232B] border border-[#282E38] text-[#C5A059] hover:text-white text-xs font-mono rounded-lg transition-colors flex items-center gap-2 cursor-pointer"
            title="Export real data to CSV / Excel spreadsheet"
          >
            <span>↓</span>
            <span>Export CSV</span>
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
            <span>Print / PDF Audit</span>
          </button>
        </div>
      </div>

      {/* Main Report Tabs Selector (Hidden on Print) */}
      <div className="bg-[#0E1015] border border-[#1E232B] rounded-2xl p-2 flex flex-wrap gap-2 print:hidden shadow-sm">
        {[
          { id: "sales", label: "📊 Sales & Revenue", desc: "Transactions, settlements & AOV" },
          { id: "inventory", label: "📦 Inventory & Stock Valuation", desc: "Catalog value & stock levels" },
          { id: "products", label: "🏆 Product Performance", desc: "Best-selling timepieces" },
          { id: "customers", label: "👥 Customer & VIP Clients", desc: "Lifetime spend & acquisition" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as ReportTab)}
            className={`flex-1 min-w-[200px] text-left px-4 py-3 rounded-xl transition-all cursor-pointer border ${
              activeTab === tab.id
                ? "bg-[#161920] border-[#C5A059] shadow-lg shadow-[#C5A059]/5"
                : "bg-transparent border-transparent hover:bg-[#12141A] hover:border-[#222731]"
            }`}
          >
            <div
              className={`text-xs font-mono font-bold tracking-wider uppercase ${
                activeTab === tab.id ? "text-[#C5A059]" : "text-white/80"
              }`}
            >
              {tab.label}
            </div>
            <div className="text-[11px] font-mono text-[#8E95A5] mt-0.5">{tab.desc}</div>
          </button>
        ))}
      </div>

      {/* Date & Filter Control Bar (Hidden on print) */}
      <div className="bg-[#0E1015] border border-[#1E232B] rounded-2xl p-6 space-y-4 shadow-md print:hidden">
        {/* Preset Range Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[10px] font-mono uppercase tracking-widest text-white/50 font-bold mr-2">
            Time Period:
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

          {/* Payment Status (Relevant for Sales) */}
          <div className="space-y-1">
            <label className="block text-[10px] font-mono uppercase text-white/50 font-semibold">
              Transaction Filter:
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="w-full bg-[#14161C] border border-[#262A33] text-white text-xs font-mono rounded-lg px-3 py-2 focus:outline-none focus:border-[#C5A059]"
            >
              <option value="all">All Transactions</option>
              <option value="paid">Settled / Paid Only</option>
              <option value="pending">Pending Payment Only</option>
              <option value="refund">Refunds & Disputes</option>
            </select>
          </div>

          {/* Search Filter */}
          <div className="space-y-1">
            <label className="block text-[10px] font-mono uppercase text-white/50 font-semibold">
              Live Table Search:
            </label>
            <input
              type="text"
              placeholder="Search by model, client, ID, brand..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#14161C] border border-[#262A33] text-white text-xs font-mono rounded-lg px-3 py-2 focus:outline-none focus:border-[#C5A059] placeholder:text-[#5E6573]"
            />
          </div>
        </div>

        {/* Active Filter Summary Pill */}
        <div className="flex items-center justify-between text-xs font-mono text-[#8E95A5] pt-2">
          <div>
            Active Filter Period: <span className="text-white font-bold">{activeDateLabel}</span>
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

      {/* ========================================================================= */}
      {/* TAB 1: SALES & REVENUE REPORT                                             */}
      {/* ========================================================================= */}
      {activeTab === "sales" && (
        <div className="space-y-8 animate-fadeIn">
          {/* KPI Cards Summary Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 print:grid-cols-4 print:gap-3">
            {/* Total Sales */}
            <div className="bg-[#0E1015] border border-[#1E232B] rounded-xl p-5 shadow-sm print:bg-neutral-50 print:border-neutral-300 print:p-3">
              <div className="text-[10px] font-mono uppercase tracking-widest text-[#C5A059] font-bold print:text-neutral-700">
                GROSS SALES REVENUE
              </div>
              <div className="text-2xl font-bold font-mono text-white mt-1.5 truncate print:text-black">
                {fmtCurrency(salesMetrics.totalSales)}
              </div>
              <div className="text-[11px] font-mono text-[#8E95A5] mt-1 print:text-neutral-600">
                Across {salesMetrics.orderCount} orders in period
              </div>
            </div>

            {/* Paid Volume */}
            <div className="bg-[#0E1015] border border-[#1E232B] rounded-xl p-5 shadow-sm print:bg-neutral-50 print:border-neutral-300 print:p-3">
              <div className="text-[10px] font-mono uppercase tracking-widest text-emerald-400 font-bold print:text-emerald-700">
                SETTLED / PAID REVENUE
              </div>
              <div className="text-2xl font-bold font-mono text-white mt-1.5 truncate print:text-black">
                {fmtCurrency(salesMetrics.paidSales)}
              </div>
              <div className="text-[11px] font-mono text-[#8E95A5] mt-1 print:text-neutral-600">
                {salesMetrics.paidCount} orders verified & settled
              </div>
            </div>

            {/* Pending Settlement */}
            <div className="bg-[#0E1015] border border-[#1E232B] rounded-xl p-5 shadow-sm print:bg-neutral-50 print:border-neutral-300 print:p-3">
              <div className="text-[10px] font-mono uppercase tracking-widest text-amber-400 font-bold print:text-amber-700">
                PENDING GATEWAY VOLUME
              </div>
              <div className="text-2xl font-bold font-mono text-white mt-1.5 truncate print:text-black">
                {fmtCurrency(salesMetrics.pendingSales)}
              </div>
              <div className="text-[11px] font-mono text-[#8E95A5] mt-1 print:text-neutral-600">
                {salesMetrics.pendingCount} orders awaiting completion
              </div>
            </div>

            {/* Average Order Value (AOV) */}
            <div className="bg-[#0E1015] border border-[#1E232B] rounded-xl p-5 shadow-sm print:bg-neutral-50 print:border-neutral-300 print:p-3">
              <div className="text-[10px] font-mono uppercase tracking-widest text-blue-400 font-bold print:text-blue-700">
                AVERAGE TRANSACTION (AOV)
              </div>
              <div className="text-2xl font-bold font-mono text-white mt-1.5 truncate print:text-black">
                {fmtCurrency(salesMetrics.aov)}
              </div>
              <div className="text-[11px] font-mono text-[#8E95A5] mt-1 print:text-neutral-600">
                Mean transaction ticket size
              </div>
            </div>
          </div>

          {/* Monthly Revenue Trend Visual Bar / Area (Screen Only) */}
          <div className="bg-[#0E1015] border border-[#1E232B] rounded-2xl p-6 shadow-md print:hidden">
            <div className="flex justify-between items-center mb-4">
              <div className="text-xs font-mono uppercase tracking-widest text-[#C5A059] font-bold">
                ✦ Monthly Sales Velocity (6-Month Trend)
              </div>
              <span className="text-[11px] font-mono text-[#8E95A5]">Calculated from Live Orders</span>
            </div>

            <div className="grid grid-cols-6 gap-3 items-end h-44 pt-4 border-b border-[#1E232B] pb-2">
              {salesMetrics.months.map((m, idx) => {
                const heightPct = Math.round((m.total / salesMetrics.maxMonthlyVal) * 100);
                return (
                  <div key={idx} className="flex flex-col items-center h-full justify-end group">
                    <span className="text-[10px] font-mono text-[#C5A059] opacity-0 group-hover:opacity-100 transition-opacity mb-1 whitespace-nowrap">
                      {fmtCurrency(m.total)}
                    </span>
                    <div
                      style={{ height: `${Math.max(heightPct, 6)}%` }}
                      className={`w-full max-w-[48px] rounded-t-md transition-all ${
                        m.total > 0
                          ? "bg-gradient-to-t from-[#C5A059]/40 to-[#C5A059] group-hover:to-[#E5C079]"
                          : "bg-[#181B22]"
                      }`}
                    />
                    <span className="text-[10px] font-mono text-[#8E95A5] mt-2">{m.label}</span>
                    <span className="text-[9px] font-mono text-white/40">{m.count} ord</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Itemized Sales Transactions Table */}
          <div className="bg-[#0E1015] border border-[#1E232B] rounded-2xl shadow-md overflow-hidden print:border-neutral-300 print:shadow-none">
            <div className="p-6 border-b border-[#1E232B] flex items-center justify-between print:p-3 print:border-neutral-300">
              <div>
                <h2 className="text-sm font-bold font-mono uppercase tracking-wider text-white print:text-black">
                  Itemized Store Orders ({filteredOrders.length})
                </h2>
                <p className="text-xs text-[#8E95A5] font-mono print:text-neutral-600">
                  Live verified order transactions matching filter: {activeDateLabel}
                </p>
              </div>
              <div className="text-xs font-mono text-[#C5A059] font-bold print:text-black">
                Period Total: {fmtCurrency(salesMetrics.totalSales)}
              </div>
            </div>

            {loading ? (
              <div className="p-12 text-center text-xs font-mono text-[#8E95A5] animate-pulse">
                Querying database records...
              </div>
            ) : filteredOrders.length === 0 ? (
              <div className="p-12 text-center text-xs font-mono text-[#8E95A5] space-y-2">
                <div>No sales transactions found matching the selected filter.</div>
                <button
                  onClick={() => applyPreset("all")}
                  className="text-[#C5A059] underline hover:text-white"
                >
                  View All-Time Store Orders
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
                      const isRefund =
                        (order.status || order.order_status || "").toLowerCase().includes("refund") ||
                        (order.payment_status || "").toLowerCase().includes("refund");

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
                              {resolveCustomerName(order)}
                            </div>
                            <div className="text-[11px] text-white/40 print:text-neutral-500">
                              {order.customer_email || "—"}
                            </div>
                            {order.customer_phone && (
                              <div className="text-[10px] text-white/30 print:text-neutral-500">
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
                                    <span>{it.product_name || it.name || "Timepiece"}</span>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <span className="text-white/40 print:text-neutral-500">Order</span>
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
                                isRefund
                                  ? "bg-red-950/60 text-red-400 border border-red-500/40"
                                  : isPaid
                                  ? "bg-emerald-950/60 text-emerald-400 border border-emerald-500/40"
                                  : "bg-amber-950/60 text-amber-400 border border-amber-500/40"
                              }`}
                            >
                              {isRefund
                                ? "Refund Requested"
                                : order.payment_status || "Pending"}
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
                        Total ({filteredOrders.length} Orders):
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono text-[#C5A059] print:text-black text-sm">
                        {fmtCurrency(salesMetrics.totalSales)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: INVENTORY & STOCK VALUATION REPORT                                  */}
      {/* ========================================================================= */}
      {activeTab === "inventory" && (
        <div className="space-y-8 animate-fadeIn">
          {/* Inventory KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 print:grid-cols-4 print:gap-3">
            <div className="bg-[#0E1015] border border-[#1E232B] rounded-xl p-5 shadow-sm print:bg-neutral-50 print:border-neutral-300 print:p-3">
              <div className="text-[10px] font-mono uppercase tracking-widest text-[#C5A059] font-bold print:text-neutral-700">
                TOTAL INVENTORY VALUATION
              </div>
              <div className="text-2xl font-bold font-mono text-white mt-1.5 truncate print:text-black">
                {fmtCurrency(inventoryMetrics.totalValuation)}
              </div>
              <div className="text-[11px] font-mono text-[#8E95A5] mt-1 print:text-neutral-600">
                Across {inventoryMetrics.totalStockUnits} total watch units
              </div>
            </div>

            <div className="bg-[#0E1015] border border-[#1E232B] rounded-xl p-5 shadow-sm print:bg-neutral-50 print:border-neutral-300 print:p-3">
              <div className="text-[10px] font-mono uppercase tracking-widest text-emerald-400 font-bold print:text-emerald-700">
                TOTAL TIMEPIECE MODELS
              </div>
              <div className="text-2xl font-bold font-mono text-white mt-1.5 truncate print:text-black">
                {inventoryMetrics.totalProducts} Catalog Models
              </div>
              <div className="text-[11px] font-mono text-[#8E95A5] mt-1 print:text-neutral-600">
                In store catalogue
              </div>
            </div>

            <div className="bg-[#0E1015] border border-[#1E232B] rounded-xl p-5 shadow-sm print:bg-neutral-50 print:border-neutral-300 print:p-3">
              <div className="text-[10px] font-mono uppercase tracking-widest text-amber-400 font-bold print:text-amber-700">
                LOW STOCK WARNING (≤5)
              </div>
              <div className="text-2xl font-bold font-mono text-amber-400 mt-1.5 truncate print:text-black">
                {inventoryMetrics.lowStockCount} Models Alert
              </div>
              <div className="text-[11px] font-mono text-[#8E95A5] mt-1 print:text-neutral-600">
                Urgent re-stock recommended
              </div>
            </div>

            <div className="bg-[#0E1015] border border-[#1E232B] rounded-xl p-5 shadow-sm print:bg-neutral-50 print:border-neutral-300 print:p-3">
              <div className="text-[10px] font-mono uppercase tracking-widest text-red-400 font-bold print:text-red-700">
                OUT OF STOCK
              </div>
              <div className="text-2xl font-bold font-mono text-red-400 mt-1.5 truncate print:text-black">
                {inventoryMetrics.outOfStockCount} Models
              </div>
              <div className="text-[11px] font-mono text-[#8E95A5] mt-1 print:text-neutral-600">
                Zero inventory available
              </div>
            </div>
          </div>

          {/* Brand Valuation Summary */}
          <div className="bg-[#0E1015] border border-[#1E232B] rounded-2xl p-6 shadow-md print:bg-transparent print:border-neutral-300">
            <div className="text-xs font-mono uppercase tracking-widest text-[#C5A059] font-bold mb-4 print:text-black">
              ✦ Top Brand Allocations by Asset Value
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              {inventoryMetrics.topBrandsByValuation.map(([brand, bData]) => (
                <div
                  key={brand}
                  className="bg-[#14161C] border border-[#262A33] rounded-xl p-3.5 print:bg-white print:border-neutral-300"
                >
                  <div className="text-xs font-bold text-white truncate print:text-black">{brand}</div>
                  <div className="text-[11px] font-mono text-[#8E95A5] mt-1">
                    {bData.count} models · {bData.units} units
                  </div>
                  <div className="text-xs font-mono text-[#C5A059] font-bold mt-2">
                    {fmtCurrency(bData.valuation)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Itemized Inventory Table */}
          <div className="bg-[#0E1015] border border-[#1E232B] rounded-2xl shadow-md overflow-hidden print:border-neutral-300 print:shadow-none">
            <div className="p-6 border-b border-[#1E232B] flex items-center justify-between print:p-3 print:border-neutral-300">
              <div>
                <h2 className="text-sm font-bold font-mono uppercase tracking-wider text-white print:text-black">
                  Itemized Timepiece Inventory ({inventoryMetrics.filteredList.length})
                </h2>
                <p className="text-xs text-[#8E95A5] font-mono print:text-neutral-600">
                  Live stock breakdown with unit retail pricing and total asset valuation
                </p>
              </div>
              <div className="text-xs font-mono text-[#C5A059] font-bold print:text-black">
                Asset Value: {fmtCurrency(inventoryMetrics.totalValuation)}
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-[#12141A] text-[#8E95A5] uppercase tracking-wider border-b border-[#1E232B] print:bg-neutral-100 print:text-neutral-800 print:border-black">
                  <tr>
                    <th className="py-3 px-4">Photo</th>
                    <th className="py-3 px-4">Watch Model</th>
                    <th className="py-3 px-4">Brand</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4 text-right">Unit Price</th>
                    <th className="py-3 px-4 text-center">Stock Units</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Total Valuation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#181B22] text-white print:divide-neutral-300 print:text-black">
                  {inventoryMetrics.filteredList.map((p) => {
                    const qty = Number(p.stock_qty ?? p.stock_count) || 0;
                    const val = qty * (Number(p.price) || 0);
                    const isLow = qty > 0 && qty <= 5;
                    const isOut = qty === 0 || p.in_stock === false;

                    return (
                      <tr key={p.id} className="hover:bg-[#14161C]/60 transition-colors">
                        <td className="py-2 px-4">
                          <div className="w-10 h-10 rounded-md overflow-hidden bg-black border border-[#262A33]">
                            <img
                              src={getProductImage(p.id, p.image_url)}
                              alt={p.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        </td>
                        <td className="py-3 px-4 font-bold text-white print:text-black">
                          {p.name}
                        </td>
                        <td className="py-3 px-4 text-white/70 print:text-neutral-700">{p.brand || "Swiss"}</td>
                        <td className="py-3 px-4 text-white/70 print:text-neutral-700">{p.category || "Luxury"}</td>
                        <td className="py-3 px-4 text-right font-mono">{fmtCurrency(p.price)}</td>
                        <td className="py-3 px-4 text-center font-bold">{qty}</td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                              isOut
                                ? "bg-red-950/60 text-red-400 border border-red-500/40"
                                : isLow
                                ? "bg-amber-950/60 text-amber-400 border border-amber-500/40"
                                : "bg-emerald-950/60 text-emerald-400 border border-emerald-500/40"
                            }`}
                          >
                            {isOut ? "Out of Stock" : isLow ? "Low Stock" : "In Stock"}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right font-mono font-bold text-[#C5A059] print:text-black">
                          {fmtCurrency(val)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: PRODUCT SALES PERFORMANCE REPORT                                    */}
      {/* ========================================================================= */}
      {activeTab === "products" && (
        <div className="space-y-8 animate-fadeIn">
          {/* Performance KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 print:grid-cols-4 print:gap-3">
            <div className="bg-[#0E1015] border border-[#1E232B] rounded-xl p-5 shadow-sm print:bg-neutral-50 print:border-neutral-300 print:p-3">
              <div className="text-[10px] font-mono uppercase tracking-widest text-[#C5A059] font-bold print:text-neutral-700">
                TOTAL UNITS SOLD
              </div>
              <div className="text-2xl font-bold font-mono text-white mt-1.5 truncate print:text-black">
                {productPerformanceMetrics.totalSoldUnits} Timepieces
              </div>
              <div className="text-[11px] font-mono text-[#8E95A5] mt-1 print:text-neutral-600">
                In selected reporting period
              </div>
            </div>

            <div className="bg-[#0E1015] border border-[#1E232B] rounded-xl p-5 shadow-sm print:bg-neutral-50 print:border-neutral-300 print:p-3">
              <div className="text-[10px] font-mono uppercase tracking-widest text-emerald-400 font-bold print:text-emerald-700">
                PRODUCT ORDER REVENUE
              </div>
              <div className="text-2xl font-bold font-mono text-white mt-1.5 truncate print:text-black">
                {fmtCurrency(productPerformanceMetrics.totalProductRevenue)}
              </div>
              <div className="text-[11px] font-mono text-[#8E95A5] mt-1 print:text-neutral-600">
                Generated from product purchases
              </div>
            </div>

            <div className="bg-[#0E1015] border border-[#1E232B] rounded-xl p-5 shadow-sm print:bg-neutral-50 print:border-neutral-300 print:p-3">
              <div className="text-[10px] font-mono uppercase tracking-widest text-amber-400 font-bold print:text-amber-700">
                TOP SELLING MODEL
              </div>
              <div className="text-lg font-bold font-mono text-amber-400 mt-1.5 truncate print:text-black">
                {productPerformanceMetrics.topSeller?.name || "None yet"}
              </div>
              <div className="text-[11px] font-mono text-[#8E95A5] mt-1 print:text-neutral-600">
                {productPerformanceMetrics.topSeller?.unitsSold || 0} units sold
              </div>
            </div>

            <div className="bg-[#0E1015] border border-[#1E232B] rounded-xl p-5 shadow-sm print:bg-neutral-50 print:border-neutral-300 print:p-3">
              <div className="text-[10px] font-mono uppercase tracking-widest text-blue-400 font-bold print:text-blue-700">
                CATALOG POPULARITY
              </div>
              <div className="text-2xl font-bold font-mono text-white mt-1.5 truncate print:text-black">
                {productPerformanceMetrics.productsList.filter((p) => p.unitsSold > 0).length} / {productPerformanceMetrics.productsList.length}
              </div>
              <div className="text-[11px] font-mono text-[#8E95A5] mt-1 print:text-neutral-600">
                Models with verified order demand
              </div>
            </div>
          </div>

          {/* Product Performance Table */}
          <div className="bg-[#0E1015] border border-[#1E232B] rounded-2xl shadow-md overflow-hidden print:border-neutral-300 print:shadow-none">
            <div className="p-6 border-b border-[#1E232B] flex items-center justify-between print:p-3 print:border-neutral-300">
              <div>
                <h2 className="text-sm font-bold font-mono uppercase tracking-wider text-white print:text-black">
                  Watch Sales Velocity Ranking
                </h2>
                <p className="text-xs text-[#8E95A5] font-mono print:text-neutral-600">
                  Ranked by units sold and gross order revenue in period: {activeDateLabel}
                </p>
              </div>
              <div className="text-xs font-mono text-[#C5A059] font-bold print:text-black">
                Revenue: {fmtCurrency(productPerformanceMetrics.totalProductRevenue)}
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-[#12141A] text-[#8E95A5] uppercase tracking-wider border-b border-[#1E232B] print:bg-neutral-100 print:text-neutral-800 print:border-black">
                  <tr>
                    <th className="py-3 px-4">Photo</th>
                    <th className="py-3 px-4">Model Name</th>
                    <th className="py-3 px-4">Brand</th>
                    <th className="py-3 px-4 text-right">Retail Price</th>
                    <th className="py-3 px-4 text-center">Units Sold</th>
                    <th className="py-3 px-4 text-right">Gross Revenue</th>
                    <th className="py-3 px-4 text-center">Remaining Stock</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#181B22] text-white print:divide-neutral-300 print:text-black">
                  {productPerformanceMetrics.productsList.map((p) => (
                    <tr key={p.productId} className="hover:bg-[#14161C]/60 transition-colors">
                      <td className="py-2 px-4">
                        <div className="w-10 h-10 rounded-md overflow-hidden bg-black border border-[#262A33]">
                          <img
                            src={getProductImage(p.productId, p.imageUrl)}
                            alt={p.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </td>
                      <td className="py-3 px-4 font-bold text-white print:text-black">
                        {p.name}
                      </td>
                      <td className="py-3 px-4 text-white/70 print:text-neutral-700">{p.brand}</td>
                      <td className="py-3 px-4 text-right font-mono">{fmtCurrency(p.price)}</td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`px-2 py-0.5 rounded font-bold ${
                            p.unitsSold > 0
                              ? "bg-emerald-950/60 text-emerald-400 border border-emerald-500/40"
                              : "text-white/40"
                          }`}
                        >
                          {p.unitsSold} sold
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-[#C5A059] print:text-black">
                        {fmtCurrency(p.revenue)}
                      </td>
                      <td className="py-3 px-4 text-center font-mono">
                        <span className={p.stockLeft <= 5 ? "text-amber-400 font-bold" : "text-white/70"}>
                          {p.stockLeft} units
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: CUSTOMER & CLIENT ACTIVITY REPORT                                   */}
      {/* ========================================================================= */}
      {activeTab === "customers" && (
        <div className="space-y-8 animate-fadeIn">
          {/* Customer KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 print:grid-cols-4 print:gap-3">
            <div className="bg-[#0E1015] border border-[#1E232B] rounded-xl p-5 shadow-sm print:bg-neutral-50 print:border-neutral-300 print:p-3">
              <div className="text-[10px] font-mono uppercase tracking-widest text-[#C5A059] font-bold print:text-neutral-700">
                TOTAL CLIENT ACCOUNTS
              </div>
              <div className="text-2xl font-bold font-mono text-white mt-1.5 truncate print:text-black">
                {customerMetrics.totalCustomers} Clients
              </div>
              <div className="text-[11px] font-mono text-[#8E95A5] mt-1 print:text-neutral-600">
                Registered members & active buyers
              </div>
            </div>

            <div className="bg-[#0E1015] border border-[#1E232B] rounded-xl p-5 shadow-sm print:bg-neutral-50 print:border-neutral-300 print:p-3">
              <div className="text-[10px] font-mono uppercase tracking-widest text-emerald-400 font-bold print:text-emerald-700">
                TOTAL CLIENT SPEND
              </div>
              <div className="text-2xl font-bold font-mono text-white mt-1.5 truncate print:text-black">
                {fmtCurrency(customerMetrics.totalSpendAll)}
              </div>
              <div className="text-[11px] font-mono text-[#8E95A5] mt-1 print:text-neutral-600">
                Cumulative customer lifetime volume
              </div>
            </div>

            <div className="bg-[#0E1015] border border-[#1E232B] rounded-xl p-5 shadow-sm print:bg-neutral-50 print:border-neutral-300 print:p-3">
              <div className="text-[10px] font-mono uppercase tracking-widest text-blue-400 font-bold print:text-blue-700">
                AVERAGE REVENUE PER CLIENT
              </div>
              <div className="text-2xl font-bold font-mono text-white mt-1.5 truncate print:text-black">
                {fmtCurrency(customerMetrics.avgSpendPerCustomer)}
              </div>
              <div className="text-[11px] font-mono text-[#8E95A5] mt-1 print:text-neutral-600">
                Customer Lifetime Value (LTV)
              </div>
            </div>

            <div className="bg-[#0E1015] border border-[#1E232B] rounded-xl p-5 shadow-sm print:bg-neutral-50 print:border-neutral-300 print:p-3">
              <div className="text-[10px] font-mono uppercase tracking-widest text-amber-400 font-bold print:text-amber-700">
                TOP VIP PATRON
              </div>
              <div className="text-base font-bold font-mono text-amber-400 mt-1.5 truncate print:text-black">
                {customerMetrics.topVip?.name || "None"}
              </div>
              <div className="text-[11px] font-mono text-[#8E95A5] mt-1 print:text-neutral-600">
                Spent {fmtCurrency(customerMetrics.topVip?.totalSpend || 0)}
              </div>
            </div>
          </div>

          {/* Customer Table */}
          <div className="bg-[#0E1015] border border-[#1E232B] rounded-2xl shadow-md overflow-hidden print:border-neutral-300 print:shadow-none">
            <div className="p-6 border-b border-[#1E232B] flex items-center justify-between print:p-3 print:border-neutral-300">
              <div>
                <h2 className="text-sm font-bold font-mono uppercase tracking-wider text-white print:text-black">
                  Client Directory & Lifetime Valuation ({customerMetrics.customerList.length})
                </h2>
                <p className="text-xs text-[#8E95A5] font-mono print:text-neutral-600">
                  Real client purchase history and account details from database
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-[#12141A] text-[#8E95A5] uppercase tracking-wider border-b border-[#1E232B] print:bg-neutral-100 print:text-neutral-800 print:border-black">
                  <tr>
                    <th className="py-3 px-4">Client Name</th>
                    <th className="py-3 px-4">Email</th>
                    <th className="py-3 px-4">Phone</th>
                    <th className="py-3 px-4">Type</th>
                    <th className="py-3 px-4 text-center">Orders Placed</th>
                    <th className="py-3 px-4 text-right">Lifetime Spend</th>
                    <th className="py-3 px-4">Last Activity</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#181B22] text-white print:divide-neutral-300 print:text-black">
                  {customerMetrics.customerList.map((c) => (
                    <tr key={c.id || c.email} className="hover:bg-[#14161C]/60 transition-colors">
                      <td className="py-3 px-4 font-bold text-white print:text-black">
                        {c.name}
                      </td>
                      <td className="py-3 px-4 text-white/70 print:text-neutral-700">{c.email}</td>
                      <td className="py-3 px-4 text-white/60 print:text-neutral-600">{c.phone}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            c.totalSpend >= 50000
                              ? "bg-amber-950/60 text-amber-400 border border-amber-500/40"
                              : c.isRegistered
                              ? "bg-blue-950/60 text-blue-400 border border-blue-500/40"
                              : "bg-neutral-800 text-neutral-300"
                          }`}
                        >
                          {c.totalSpend >= 50000
                            ? "VIP Patron"
                            : c.isRegistered
                            ? "Member"
                            : "Buyer"}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center font-bold">{c.ordersCount}</td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-[#C5A059] print:text-black">
                        {fmtCurrency(c.totalSpend)}
                      </td>
                      <td className="py-3 px-4 text-white/50 print:text-neutral-500">
                        {c.lastOrderDate ? new Date(c.lastOrderDate).toLocaleDateString() : "No orders yet"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Print Footer with Sign-off (Visible only when printed) */}
      <div className="hidden print:flex justify-between items-end pt-12 text-xs font-mono border-t border-black mt-8">
        <div>
          <div><strong>Prepared By:</strong> Krono Swiss Horology Administration</div>
          <div><strong>Audit Verification:</strong> Verified Real Database Extraction</div>
        </div>
        <div className="text-right">
          <div className="border-b border-black w-48 mb-1"></div>
          <div>Executive Signature & Stamp</div>
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
