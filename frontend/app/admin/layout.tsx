"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode } from "react";

export default function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  const pathname = usePathname();

  const navItems = [
    { label: "Overview & Telemetry", href: "/admin", icon: "📊" },
    { label: "Product Catalogue", href: "/admin/products", icon: "⌚" },
    { label: "Register New Product", href: "/admin/products/new", icon: "➕" },
    { label: "Campaigns & Banners", href: "/admin/promotions", icon: "🏷️" },
  ];

  const toggleTheme = () => {
    const isDark = document.documentElement.classList.contains("dark");
    if (isDark) {
      document.documentElement.classList.remove("dark");
      try {
        localStorage.setItem("krono_theme", "light");
      } catch {}
    } else {
      document.documentElement.classList.add("dark");
      try {
        localStorage.setItem("krono_theme", "dark");
      } catch {}
    }
  };

  return (
    <div className="flex min-h-screen w-full bg-[#F8F9FB] dark:bg-[#0B0F17] text-slate-900 dark:text-slate-100 font-sans selection:bg-slate-900 selection:text-white dark:selection:bg-amber-400 dark:selection:text-slate-950">
      {/* Sidebar */}
      <aside className="w-64 flex-shrink-0 bg-white dark:bg-[#131B2A] text-slate-900 dark:text-white flex flex-col border-r border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex h-20 items-center px-6 border-b border-slate-200 dark:border-slate-800 gap-3.5 bg-slate-50/50 dark:bg-[#0B0F17]/50">
          <img
            src="/icon.jpg"
            alt="Krono Admin Logo"
            className="h-10 w-10 rounded-xl object-contain bg-white dark:bg-slate-800 p-0.5 border border-slate-200/90 dark:border-slate-700 shadow-sm"
          />
          <div>
            <div className="text-sm font-black tracking-[0.2em] text-slate-900 dark:text-white uppercase font-display">
              KRONO ADMIN
            </div>
            <div className="text-[9px] uppercase tracking-[0.25em] text-slate-500 dark:text-slate-400 font-mono font-bold">
              Executive Console
            </div>
          </div>
        </div>

        <div className="px-4 py-6 flex-1 space-y-6">
          <div>
            <div className="text-[9px] font-mono uppercase tracking-[0.25em] text-slate-400 dark:text-slate-500 px-3 mb-3 font-bold">
              Management
            </div>
            <nav className="space-y-1.5 text-xs font-semibold">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition ${
                      isActive
                        ? "bg-slate-900 dark:bg-amber-400 text-white dark:text-slate-950 font-bold shadow-sm"
                        : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"
                    }`}
                  >
                    <span className="text-base">{item.icon}</span>
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>

        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-[#0B0F17]/60 space-y-3">
          <button
            onClick={toggleTheme}
            className="w-full flex items-center justify-between px-4 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 bg-white dark:bg-[#131B2A] hover:bg-slate-100 dark:hover:bg-slate-800 transition border border-slate-200 dark:border-slate-700 shadow-sm cursor-pointer"
          >
            <span>🌓 Toggle Theme</span>
          </button>
          <Link
            href="/"
            className="flex items-center justify-between px-4 py-2.5 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 bg-white dark:bg-[#131B2A] hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition border border-slate-200 dark:border-slate-700 shadow-sm"
            target="_blank"
          >
            <span>Live Boutique</span>
            <span className="text-slate-900 dark:text-amber-400">↗</span>
          </Link>
          <div className="text-[9px] text-slate-400 dark:text-slate-500 text-center font-mono font-semibold">
            Krono Atelier v2.0 • Active DB
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-20 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-8 bg-white/90 dark:bg-[#131B2A]/90 backdrop-blur-xl shadow-xs">
          <div className="flex items-center gap-3">
            <span className="inline-block h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <h2 className="text-xs font-mono uppercase tracking-wider text-slate-500 dark:text-slate-400 font-semibold">
              PostgreSQL / Express API Connected
            </h2>
          </div>

          <div className="flex items-center gap-4">
            <Link
              href="/"
              target="_blank"
              className="text-xs font-mono font-bold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 px-3.5 py-1.5 rounded-xl transition shadow-xs"
            >
              Storefront View ↗
            </Link>
            <div className="flex items-center gap-2.5 border-l border-slate-200 dark:border-slate-800 pl-4">
              <div className="h-8 w-8 rounded-xl bg-slate-900 dark:bg-amber-400 text-white dark:text-slate-950 flex items-center justify-center text-xs font-bold font-mono shadow-sm">
                AD
              </div>
              <div>
                <span className="text-xs font-bold text-slate-900 dark:text-white block">Master Concierge</span>
                <span className="text-[9px] text-slate-500 dark:text-slate-400 font-mono block font-semibold">Administrator</span>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 p-6 sm:p-8 overflow-y-auto bg-[#F8F9FB] dark:bg-[#0B0F17]">
          {children}
        </main>
      </div>
    </div>
  );
}