"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { fetchProducts, deleteProduct, updateProduct, Product } from "@/lib/api";
import SmoothImage from "@/components/SmoothImage";

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [feedback, setFeedback] = useState<string | null>(null);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const data = await fetchProducts();
      setProducts(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to permanently delete "${name}" from the vault catalogue?`)) return;
    try {
      await deleteProduct(id);
      setProducts((prev) => prev.filter((p) => p.id !== id));
      setFeedback(`"${name}" successfully deleted.`);
      setTimeout(() => setFeedback(null), 3000);
    } catch (err: any) {
      alert(err.message || "Failed to delete product");
    }
  };

  const handleToggleFeatured = async (product: Product) => {
    try {
      const updated = await updateProduct(product.id, {
        is_featured: !product.is_featured,
      });
      setProducts((prev) =>
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

  const filtered = useMemo(() => {
    return products.filter((p) => {
      const matchCat = categoryFilter === "All" || p.category.toLowerCase() === categoryFilter.toLowerCase();
      const matchSearch =
        !search ||
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.category.toLowerCase().includes(search.toLowerCase()) ||
        (p.brand || "").toLowerCase().includes(search.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [products, categoryFilter, search]);

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
          <span className="text-[10px] font-mono font-bold uppercase tracking-[0.25em] text-slate-500 dark:text-slate-400">Inventory Management</span>
          <h1 className="text-3xl font-black font-display text-slate-900 dark:text-white uppercase tracking-tight mt-1">Products Catalogue</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Manage, inspect, and update timepieces in your PostgreSQL database.
          </p>
        </div>

        <Link
          href="/admin/products/new"
          className="lux-btn-primary px-5 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 uppercase tracking-wider shadow-sm"
        >
          <span>+ Register Timepiece</span>
        </Link>
      </div>

      {/* Search & Filter Bar */}
      <div className="p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 flex flex-col sm:flex-row gap-4 items-center justify-between bg-white dark:bg-[#131B2A] shadow-sm">
        <div className="relative w-full sm:w-80">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search timepiece name, brand, calibre..."
            className="w-full rounded-xl bg-slate-50 dark:bg-[#0B0F17] px-3.5 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 border border-slate-200 dark:border-slate-700 focus:border-slate-800 dark:focus:border-amber-400 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="rounded-xl bg-slate-50 dark:bg-[#0B0F17] px-3 py-2 text-xs text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 focus:border-slate-800 dark:focus:border-amber-400 focus:outline-none font-mono"
          >
            <option value="All">All Categories</option>
            <option value="Luxury">Luxury</option>
            <option value="Automatic">Automatic</option>
            <option value="Sport">Sport</option>
            <option value="Smart">Smart</option>
          </select>

          <span className="text-xs text-slate-500 dark:text-slate-400 font-mono font-semibold">
            Total: <span className="text-slate-900 dark:text-white font-bold">{filtered.length}</span>
          </span>
        </div>
      </div>

      {/* Catalogue Table */}
      <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 bg-white dark:bg-[#131B2A] shadow-sm">
        {loading ? (
          <div className="text-center py-16 font-mono text-xs text-slate-500 dark:text-slate-400">
            Loading Database Inventory...
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 space-y-2">
            <p className="text-sm font-bold text-slate-900 dark:text-white uppercase font-display">No Timepieces Match Criteria</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider text-[9px] font-mono bg-slate-50 dark:bg-[#0B0F17]">
                <tr>
                  <th className="py-3 px-3">Timepiece</th>
                  <th className="py-3 px-3">Category</th>
                  <th className="py-3 px-3">Movement / Calibre</th>
                  <th className="py-3 px-3">Valuation</th>
                  <th className="py-3 px-3 text-center">Featured</th>
                  <th className="py-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-slate-700 dark:text-slate-300">
                {filtered.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                    <td className="py-3.5 px-3">
                      <div className="flex items-center gap-3">
                        <SmoothImage
                          src={p.image_url}
                          alt={p.name}
                          objectFit="contain"
                          className="p-1"
                          containerClassName="h-12 w-12 rounded-xl bg-slate-50 dark:bg-[#0B0F17] border border-slate-200 dark:border-slate-700 flex-shrink-0"
                        />
                        <div>
                          <div className="font-bold text-slate-900 dark:text-white text-xs font-display">{p.name}</div>
                          <div className="text-[9px] text-slate-500 dark:text-slate-400 font-mono font-semibold">
                            REF-{p.id.slice(0, 8).toUpperCase()}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-3 font-mono text-[10px] uppercase text-slate-700 dark:text-slate-300 font-semibold">{p.category}</td>
                    <td className="py-3.5 px-3 text-slate-600 dark:text-slate-400 font-mono text-[10px]">{p.movement || "Swiss ETA"}</td>
                    <td className="py-3.5 px-3 font-bold font-num text-slate-900 dark:text-amber-400">
                      {formatCurrency(p.price)}
                    </td>
                    <td className="py-3.5 px-3 text-center">
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
                    <td className="py-3.5 px-3 text-right">
                      <div className="flex items-center justify-end gap-2 font-mono text-[11px]">
                        <Link
                          href={`/products/${p.id}`}
                          target="_blank"
                          className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#131B2A] text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition shadow-xs"
                          title="View"
                        >
                          👁
                        </Link>
                        <button
                          onClick={() => handleDelete(p.id, p.name)}
                          className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#131B2A] text-red-500 hover:text-red-400 transition cursor-pointer shadow-xs"
                          title="Delete"
                        >
                          🗑
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
