"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { fetchStats, fetchProducts, deleteProduct, updateProduct, Product, Stats } from "@/lib/api";

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentProducts, setRecentProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [s, p] = await Promise.all([fetchStats(), fetchProducts()]);
      setStats(s);
      setRecentProducts(p.slice(0, 6));
    } catch (e) {
      console.error("Dashboard data load error:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete timepiece "${name}" from vault catalogue?`)) return;
    try {
      await deleteProduct(id);
      setRecentProducts((prev) => prev.filter((p) => p.id !== id));
      setStats((prev) => (prev ? { ...prev, totalProducts: Math.max(0, prev.totalProducts - 1) } : null));
      setFeedback(`"${name}" removed from catalogue.`);
      setTimeout(() => setFeedback(null), 3000);
    } catch (err: any) {
      alert(err.message || "Failed to delete timepiece");
    }
  };

  const handleToggleFeatured = async (product: Product) => {
    try {
      const updated = await updateProduct(product.id, {
        is_featured: !product.is_featured,
      });
      setRecentProducts((prev) =>
        prev.map((p) => (p.id === product.id ? { ...p, is_featured: updated.is_featured } : p))
      );
      setFeedback(`Featured status updated for "${product.name}".`);
      setTimeout(() => setFeedback(null), 3000);
    } catch (err: any) {
      alert(err.message || "Failed to toggle status");
    }
  };

  const formatCurrency = (amount: number) => {
    return `LKR ${Number(amount || 0).toLocaleString("en-US")}`;
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {feedback && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-mono font-semibold">
          {feedback}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <span className="text-[10px] font-mono font-bold uppercase tracking-[0.25em] text-slate-500 dark:text-slate-400">Atelier Overview</span>
          <h1 className="text-3xl font-black font-display text-slate-900 dark:text-white uppercase tracking-tight mt-1">Horology Dashboard</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Real-time telemetry on active timepieces, catalogue valuation, and campaigns.
          </p>
        </div>

        <div className="flex gap-3">
          <Link
            href="/admin/products/new"
            className="lux-btn-primary px-5 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 uppercase tracking-wider shadow-sm"
          >
            <span>+ Register Timepiece</span>
          </Link>
          <Link
            href="/admin/promotions"
            className="lux-btn-secondary px-4 py-2.5 rounded-xl text-xs font-bold transition uppercase tracking-wider shadow-sm"
          >
            Banners
          </Link>
        </div>
      </div>

      {/* Metrics */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-28 rounded-2xl bg-white dark:bg-[#131B2A] border border-slate-200 dark:border-slate-800 animate-pulse shadow-sm"></div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 space-y-2 bg-white dark:bg-[#131B2A] shadow-sm">
            <div className="text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-400 font-mono font-bold">Total References</div>
            <div className="text-3xl font-black text-slate-900 dark:text-white font-num">
              {stats?.totalProducts || 0}
            </div>
            <div className="text-[9px] text-slate-500 dark:text-slate-400 font-mono">Active in vault archive</div>
          </div>

          <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 space-y-2 bg-white dark:bg-[#131B2A] shadow-sm">
            <div className="text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-400 font-mono font-bold">Inventory Valuation</div>
            <div className="text-2xl font-black text-slate-900 dark:text-amber-400 font-num truncate">
              {formatCurrency(stats?.totalInventoryValue || 0)}
            </div>
            <div className="text-[9px] text-slate-500 dark:text-slate-400 font-mono">Estimated asset total</div>
          </div>

          <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 space-y-2 bg-white dark:bg-[#131B2A] shadow-sm">
            <div className="text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-400 font-mono font-bold">Active Campaigns</div>
            <div className="text-3xl font-black text-slate-900 dark:text-white font-num">
              {stats?.activePosters || 0}
            </div>
            <div className="text-[9px] text-slate-500 dark:text-slate-400 font-mono">Hero banners & vouchers</div>
          </div>

          <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 space-y-2 bg-white dark:bg-[#131B2A] shadow-sm">
            <div className="text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-400 font-mono font-bold">Stock Units Ready</div>
            <div className="text-3xl font-black text-slate-900 dark:text-white font-num">
              {stats?.totalStockUnits || 0}
            </div>
            <div className="text-[9px] text-slate-500 dark:text-slate-400 font-mono">Physical pieces in vault</div>
          </div>
        </div>
      )}

      {/* Recent Entries Table */}
      <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 overflow-hidden bg-white dark:bg-[#131B2A] shadow-sm">
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-[#0B0F17]/50">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase font-display tracking-wider">Recent Entries</h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Latest timepieces registered in PostgreSQL catalogue</p>
          </div>
          <Link href="/admin/products" className="text-xs font-mono text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white font-semibold">
            View All ({stats?.totalProducts || 0}) →
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-[#0B0F17] text-slate-500 dark:text-slate-400 uppercase text-[9px] tracking-wider font-mono border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-5 py-3">Reference</th>
                <th className="px-5 py-3">Metier</th>
                <th className="px-5 py-3">Calibre</th>
                <th className="px-5 py-3">Valuation</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-slate-700 dark:text-slate-300">
              {recentProducts.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                  <td className="px-5 py-3.5 flex items-center gap-3">
                    <img
                      src={p.image_url}
                      alt={p.name}
                      className="h-10 w-10 rounded-xl bg-slate-50 dark:bg-[#0B0F17] object-contain p-1 border border-slate-200 dark:border-slate-700"
                    />
                    <div>
                      <div className="font-bold text-slate-900 dark:text-white font-display text-xs">{p.name}</div>
                      <div className="text-[9px] text-slate-500 dark:text-slate-400 font-mono font-semibold">{p.brand || "Krono"}</div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 font-mono text-[10px] uppercase text-slate-700 dark:text-slate-300 font-semibold">
                    {p.category}
                  </td>
                  <td className="px-5 py-3.5 font-mono text-[10px] text-slate-600 dark:text-slate-400">{p.movement || "Swiss Auto"}</td>
                  <td className="px-5 py-3.5 font-num font-bold text-slate-900 dark:text-amber-400">{formatCurrency(p.price)}</td>
                  <td className="px-5 py-3.5">
                    <button
                      onClick={() => handleToggleFeatured(p)}
                      className={`px-2.5 py-0.5 rounded-lg text-[9px] font-mono uppercase font-bold transition cursor-pointer ${
                        p.is_featured
                          ? "bg-slate-900 dark:bg-amber-400 text-white dark:text-slate-950 shadow-sm"
                          : "border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                      }`}
                    >
                      {p.is_featured ? "Featured" : "Standard"}
                    </button>
                  </td>
                  <td className="px-5 py-3.5 text-right space-x-2 font-mono text-[11px]">
                    <Link
                      href={`/products/${p.id}`}
                      target="_blank"
                      className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition font-semibold"
                    >
                      View
                    </Link>
                    <button
                      onClick={() => handleDelete(p.id, p.name)}
                      className="text-red-500 hover:text-red-400 transition cursor-pointer font-semibold"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}