"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export default function Template({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Smoothly scroll to top on page transition
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [pathname]);

  return (
    <div
      key={pathname}
      className="page-transition-wrapper flex-1 flex flex-col w-full animate-pageEnter"
    >
      {/* Top Luxury Gold Route Transition Glow Line */}
      <div className="fixed top-0 left-0 right-0 h-[2.5px] bg-gradient-to-r from-amber-500/0 via-amber-400 to-amber-500/0 z-[9999] pointer-events-none animate-routeGlow" />
      {children}
    </div>
  );
}
