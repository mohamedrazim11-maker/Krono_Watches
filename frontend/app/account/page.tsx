"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AccountRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/profile");
  }, [router]);

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center text-white/50 font-mono text-xs">
      Redirecting to Client Profile...
    </div>
  );
}
