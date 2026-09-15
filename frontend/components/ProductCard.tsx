"use client";

import Link from "next/link";
import { Product } from "@/lib/api";
import { getProductImage } from "@/lib/productImages";
import { useState } from "react";

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
  onToggleWishlist: (product: Product) => void;
  isWishlisted: boolean;
  onQuickView: (product: Product) => void;
}

export default function ProductCard({
  product,
  onAddToCart,
  onToggleWishlist,
  isWishlisted,
  onQuickView,
}: ProductCardProps) {
  const [hovered, setHovered] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);

  const fmt = (n: number) => `LKR ${Number(n || 0).toLocaleString("en-US")}`;
  const hasDiscount = product.old_price && product.old_price > product.price;
  const discountPct = hasDiscount
    ? Math.round(((product.old_price! - product.price) / product.old_price!) * 100)
    : product.promo_discount_percent || 0;

  const imgSrc = getProductImage(product.id, product.image_url);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: "relative",
        background: "#0a0a0a",
        border: `1px solid ${hovered ? "#2a2a2a" : "#1a1a1a"}`,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        transition: "border-color 200ms",
        cursor: "default",
      }}
    >
      {/* Badges row */}
      <div style={{ position: "absolute", top: "10px", left: "10px", zIndex: 3, display: "flex", gap: "6px", flexWrap: "wrap" }}>
        {product.badge && (
          <span style={{
            fontSize: "9px", fontWeight: 700, letterSpacing: "0.1em",
            textTransform: "uppercase", padding: "3px 8px",
            background: "#C5A059", color: "#000",
          }}>
            {product.badge}
          </span>
        )}
        {discountPct > 0 && (
          <span style={{
            fontSize: "9px", fontWeight: 700, padding: "3px 7px",
            background: "rgba(220,38,38,0.9)", color: "#fff",
          }}>
            -{discountPct}%
          </span>
        )}
      </div>

      {/* Wishlist button */}
      <button
        onClick={() => onToggleWishlist(product)}
        style={{
          position: "absolute", top: "10px", right: "10px", zIndex: 3,
          background: isWishlisted ? "rgba(197,160,89,0.15)" : "rgba(0,0,0,0.6)",
          border: `1px solid ${isWishlisted ? "#C5A059" : "#333"}`,
          color: isWishlisted ? "#C5A059" : "#888",
          width: "30px", height: "30px", display: "flex", alignItems: "center", justifyContent: "center",
          cursor: "pointer", transition: "all 150ms",
        }}
        aria-label="Wishlist"
      >
        <svg width="13" height="13" fill={isWishlisted ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      </button>

      {/* Image */}
      <Link href={`/products/${product.id}`} style={{ display: "block", position: "relative", aspectRatio: "1/1", overflow: "hidden", background: "#111", textDecoration: "none" }}>
        {/* Shimmer */}
        {!imgLoaded && (
          <div style={{
            position: "absolute", inset: 0,
            background: "linear-gradient(90deg, #111 0%, #1a1a1a 50%, #111 100%)",
            backgroundSize: "200% 100%",
            animation: "shimmer 1.5s infinite",
          }} />
        )}
        <img
          src={imgSrc}
          alt={product.name}
          onLoad={() => setImgLoaded(true)}
          loading="eager"
          style={{
            width: "100%", height: "100%", objectFit: "cover",
            display: "block",
            transform: hovered ? "scale(1.06)" : "scale(1)",
            transition: "transform 600ms ease",
            opacity: imgLoaded ? 1 : 0,
          }}
        />
        {/* Quick view overlay */}
        <div
          onClick={(e) => { e.preventDefault(); onQuickView(product); }}
          style={{
            position: "absolute", inset: 0, background: "rgba(0,0,0,0.4)",
            display: "flex", alignItems: "center", justifyContent: "center",
            opacity: hovered ? 1 : 0, transition: "opacity 200ms",
          }}
        >
          <span style={{
            padding: "8px 18px", fontSize: "10px", fontWeight: 700,
            letterSpacing: "0.12em", textTransform: "uppercase",
            border: "1px solid #fff", color: "#fff", background: "rgba(0,0,0,0.6)",
          }}>
            Quick View
          </span>
        </div>
      </Link>

      {/* Info */}
      <div style={{ padding: "16px", flex: 1, display: "flex", flexDirection: "column", gap: "8px" }}>
        {/* Category / movement */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: "9px", fontWeight: 700, color: "#C5A059", letterSpacing: "0.15em", textTransform: "uppercase" }}>
            {product.brand || product.category || "Swiss"}
          </span>
          {product.case_size && (
            <span style={{ fontSize: "9px", color: "#555", fontFamily: "monospace" }}>{product.case_size}</span>
          )}
        </div>

        {/* Name */}
        <Link href={`/products/${product.id}`} style={{ textDecoration: "none" }}>
          <h3 style={{
            fontSize: "13px", fontWeight: 700, color: hovered ? "#C5A059" : "#e0e0e0",
            lineHeight: 1.3, letterSpacing: "-0.01em", margin: 0,
            transition: "color 200ms",
            display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden",
          }}>
            {product.name}
          </h3>
        </Link>

        {/* Specs chips */}
        <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
          {product.water_resistance && (
            <span style={{ fontSize: "9px", color: "#555", border: "1px solid #222", padding: "2px 6px", fontFamily: "monospace" }}>
              {product.water_resistance}
            </span>
          )}
          {product.movement && (
            <span style={{ fontSize: "9px", color: "#555", border: "1px solid #222", padding: "2px 6px", fontFamily: "monospace", maxWidth: "120px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {product.movement}
            </span>
          )}
        </div>

        {/* Spacer */}
        <div style={{ flex: 1 }} />

        {/* Price + stock */}
        <div style={{ borderTop: "1px solid #1a1a1a", paddingTop: "12px", display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
          <div>
            <div style={{ fontSize: "9px", color: "#555", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "2px" }}>Price</div>
            <div style={{ display: "flex", alignItems: "baseline", gap: "6px" }}>
              <span style={{ fontSize: "14px", fontWeight: 800, color: "#C5A059", fontFamily: "monospace", letterSpacing: "-0.02em" }}>
                {fmt(product.price)}
              </span>
              {hasDiscount && (
                <span style={{ fontSize: "11px", color: "#444", textDecoration: "line-through", fontFamily: "monospace" }}>
                  {fmt(product.old_price!)}
                </span>
              )}
            </div>
          </div>
          <span style={{
            fontSize: "9px", fontWeight: 700, letterSpacing: "0.1em",
            color: product.in_stock === false ? "#555" : "#22C55E",
            textTransform: "uppercase",
          }}>
            {product.in_stock === false ? "Sold Out" : "In Stock"}
          </span>
        </div>

        {/* Add to Cart */}
        <button
          onClick={() => onAddToCart(product)}
          disabled={product.in_stock === false}
          style={{
            width: "100%", padding: "10px",
            background: "transparent",
            border: `1px solid ${product.in_stock === false ? "#333" : hovered ? "#C5A059" : "#444"}`,
            color: product.in_stock === false ? "#444" : hovered ? "#C5A059" : "#ccc",
            fontSize: "10px", fontWeight: 700, letterSpacing: "0.12em",
            textTransform: "uppercase", cursor: product.in_stock === false ? "not-allowed" : "pointer",
            transition: "all 200ms", fontFamily: "inherit",
          }}
        >
          {product.in_stock === false ? "Out of Stock" : "Add to Cart"}
        </button>
      </div>

      <style jsx global>{`
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
      `}</style>
    </div>
  );
}
