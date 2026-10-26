"use client";

import { useTheme } from "@/lib/ThemeContext";

interface ThemeToggleProps {
  className?: string;
  showLabel?: boolean;
}

export default function ThemeToggle({ className = "", showLabel = false }: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`inline-flex items-center gap-2 p-2 rounded-lg text-xs font-mono transition-all cursor-pointer ${
        isDark
          ? "text-[#C5A059] hover:text-white bg-[#14161C] hover:bg-[#1E232B] border border-[#2E3440]"
          : "text-amber-600 hover:text-neutral-900 bg-neutral-100 hover:bg-neutral-200 border border-neutral-300"
      } ${className}`}
      title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
      aria-label={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
    >
      {isDark ? (
        // Sun Icon (Switch to Light Mode)
        <svg
          className="w-4 h-4 transition-transform hover:rotate-45"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <circle cx="12" cy="12" r="5" strokeWidth={1.8} />
          <line x1="12" y1="1" x2="12" y2="3" strokeWidth={1.8} strokeLinecap="round" />
          <line x1="12" y1="21" x2="12" y2="23" strokeWidth={1.8} strokeLinecap="round" />
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" strokeWidth={1.8} strokeLinecap="round" />
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" strokeWidth={1.8} strokeLinecap="round" />
          <line x1="1" y1="12" x2="3" y2="12" strokeWidth={1.8} strokeLinecap="round" />
          <line x1="21" y1="12" x2="23" y2="12" strokeWidth={1.8} strokeLinecap="round" />
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" strokeWidth={1.8} strokeLinecap="round" />
          <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" strokeWidth={1.8} strokeLinecap="round" />
        </svg>
      ) : (
        // Moon Icon (Switch to Dark Mode)
        <svg
          className="w-4 h-4 transition-transform hover:-rotate-12"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeWidth={1.8}
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"
          />
        </svg>
      )}
      {showLabel && (
        <span className="uppercase tracking-wider font-semibold">
          {isDark ? "Light" : "Dark"}
        </span>
      )}
    </button>
  );
}
