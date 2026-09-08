"use client";

import { useMemo, useState } from "react";
import { Product } from "@/lib/api";
import ProductCard from "./ProductCard";

interface KineticProductRowProps {
  products: Product[];
  rowIndex: number;
  scrollY: number;
  speed?: number;
  onAddToCart: (product: Product, quantity?: number) => void;
  onToggleWishlist: (product: Product) => void;
  isWishlisted: (id: string) => boolean;
  onQuickView: (product: Product) => void;
}

export default function KineticProductRow({
  products,
  rowIndex,
  scrollY,
  speed = 0.35,
  onAddToCart,
  onToggleWishlist,
  isWishlisted,
  onQuickView,
}: KineticProductRowProps) {
  const [isHovered, setIsHovered] = useState(false);

  // Each card is ~310px width + 20px gap = 330px per item
  const itemSpan = 330;
  const singleSetWidth = Math.max(itemSpan, products.length * itemSpan);

  // Row 0, 2: Moves Forward/Left on scroll down (1st product moves to the end, 2nd product takes 1st position)
  // Row 1, 3: Moves in continuous circular counter-flow
  const isMoveLeft = rowIndex % 2 === 0;

  const currentOffset = useMemo(() => {
    if (singleSetWidth <= 0) return 0;
    // Continuous circular modulo translation like a train on a track
    const rawScroll = scrollY * speed;
    const mod = ((rawScroll % singleSetWidth) + singleSetWidth) % singleSetWidth;

    if (isMoveLeft) {
      return -mod;
    } else {
      return -(singleSetWidth - mod);
    }
  }, [scrollY, singleSetWidth, isMoveLeft, speed]);

  // Repeat items 5 times to ensure seamless circular continuity on any viewport width
  const repeatedProducts = useMemo(() => {
    if (products.length === 0) return [];
    if (products.length === 1) return Array(8).fill(products[0]);
    return [...products, ...products, ...products, ...products, ...products];
  }, [products]);

  if (products.length === 0) return null;

  return (
    <div
      className="relative overflow-hidden py-2"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Row Header Indicator */}
      <div className="flex items-center justify-between px-1 mb-2">
        <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400 font-bold flex items-center gap-1.5">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-slate-900 dark:bg-amber-400 animate-pulse"></span>
          Train Track {rowIndex + 1} • {isMoveLeft ? "Continuous Forward Stream →" : "← Circular Counter Flow"}
        </span>
        <span className="text-[9px] font-mono text-slate-400 dark:text-slate-500">
          Circular Track • Hover to inspect
        </span>
      </div>

      {/* Kinetic Track */}
      <div className="overflow-hidden w-full select-none">
        <div
          style={{
            transform: `translate3d(${currentOffset}px, 0, 0)`,
            transition: isHovered
              ? "transform 0.4s ease-out"
              : "transform 0.18s cubic-bezier(0.16, 1, 0.3, 1)",
            willChange: "transform",
          }}
          className="flex gap-5 items-stretch"
        >
          {repeatedProducts.map((product, idx) => (
            <div
              key={`${product.id}-loop-${idx}`}
              className="w-[280px] sm:w-[310px] flex-shrink-0 transition-transform duration-200 hover:scale-[1.02]"
            >
              <ProductCard
                product={product}
                onAddToCart={onAddToCart}
                onToggleWishlist={onToggleWishlist}
                isWishlisted={isWishlisted(product.id)}
                onQuickView={onQuickView}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
