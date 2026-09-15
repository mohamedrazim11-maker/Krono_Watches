"use client";

import Link from "next/link";
import { useState } from "react";

export default function Footer() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) { setSubscribed(true); setEmail(""); }
  };

  const S = {
    heading: { fontSize: "10px", fontWeight: 700, color: "#888", letterSpacing: "0.15em", textTransform: "uppercase" as const, marginBottom: "14px", borderBottom: "1px solid #1a1a1a", paddingBottom: "8px" },
    link: { display: "block", fontSize: "12px", color: "#666", textDecoration: "none", marginBottom: "8px", transition: "color 150ms", letterSpacing: "0.02em" },
  };

  return (
    <footer style={{ background: "#050505", borderTop: "1px solid #1a1a1a", color: "#666", fontFamily: "inherit" }}>
      <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "64px 24px 32px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", gap: "48px", marginBottom: "48px" }}>

          {/* Brand */}
          <div>
            <Link href="/" style={{ display: "flex", alignItems: "center", gap: "10px", textDecoration: "none", marginBottom: "16px" }}>
              <img src="/icon.jpg" alt="Krono" style={{ height: "32px", width: "32px", borderRadius: "4px", objectFit: "cover" }} />
              <div>
                <div style={{ fontSize: "14px", fontWeight: 800, color: "#fff", letterSpacing: "0.18em", textTransform: "uppercase" }}>KRONO</div>
                <div style={{ fontSize: "9px", color: "#555", letterSpacing: "0.1em" }}>Swiss Watches</div>
              </div>
            </Link>
            <p style={{ fontSize: "12px", lineHeight: 1.7, color: "#555", maxWidth: "300px", marginBottom: "20px" }}>
              Precision Swiss mechanical horology. Superlative chronometer escapements, serialized exhibition casebacks, and diamond-grade sapphire crystals.
            </p>

            {/* Newsletter */}
            {subscribed ? (
              <div style={{ fontSize: "12px", color: "#C5A059" }}>✓ Enrolled in the Krono Private Registry.</div>
            ) : (
              <form onSubmit={handleSubscribe} style={{ display: "flex", gap: "0" }}>
                <input
                  type="email" required placeholder="Your email address"
                  value={email} onChange={(e) => setEmail(e.target.value)}
                  style={{
                    flex: 1, background: "#111", border: "1px solid #222",
                    borderRight: "none", color: "#ccc", padding: "9px 14px",
                    fontSize: "11px", outline: "none", fontFamily: "inherit",
                  }}
                />
                <button type="submit" style={{
                  padding: "9px 18px", background: "#C5A059", color: "#000",
                  border: "1px solid #C5A059", fontSize: "10px", fontWeight: 700,
                  letterSpacing: "0.1em", textTransform: "uppercase", cursor: "pointer",
                  fontFamily: "inherit", whiteSpace: "nowrap",
                }}>
                  Subscribe
                </button>
              </form>
            )}
          </div>

          {/* Salons */}
          <div>
            <div style={S.heading}>Salons</div>
            <div style={{ fontSize: "12px", marginBottom: "12px" }}>
              <div style={{ color: "#bbb", fontWeight: 600, marginBottom: "2px" }}>Genève Atelier</div>
              <div style={{ color: "#555", fontSize: "11px" }}>Rue du Rhône 42, CH</div>
            </div>
            <div style={{ fontSize: "12px", marginBottom: "12px" }}>
              <div style={{ color: "#bbb", fontWeight: 600, marginBottom: "2px" }}>London Mayfair</div>
              <div style={{ color: "#555", fontSize: "11px" }}>14 New Bond Street, UK</div>
            </div>
            <div style={{ fontSize: "12px" }}>
              <div style={{ color: "#bbb", fontWeight: 600, marginBottom: "2px" }}>New York 5th Ave</div>
              <div style={{ color: "#555", fontSize: "11px" }}>745 Fifth Avenue, NY</div>
            </div>
          </div>

          {/* Collections */}
          <div>
            <div style={S.heading}>Collections</div>
            {[
              { label: "All Watches", href: "/catalog" },
              { label: "Dive Watches", href: "/catalog" },
              { label: "Dress Watches", href: "/catalog" },
              { label: "Chronograph", href: "/catalog" },
              { label: "Atelier Heritage", href: "/about" },
            ].map((l) => (
              <Link key={l.label} href={l.href} style={S.link}
                onMouseEnter={(e) => (e.currentTarget as HTMLElement).style.color = "#C5A059"}
                onMouseLeave={(e) => (e.currentTarget as HTMLElement).style.color = "#666"}
              >{l.label}</Link>
            ))}
          </div>

          {/* Guarantees */}
          <div>
            <div style={S.heading}>Guarantees</div>
            {["5-Year Certified Warranty", "Insured Global Air Courier", "Serialized Authenticity Card", "30-Day Return Policy"].map((g) => (
              <div key={g} style={{ display: "flex", alignItems: "flex-start", gap: "8px", marginBottom: "8px" }}>
                <span style={{ color: "#C5A059", fontSize: "10px", marginTop: "1px", flexShrink: 0 }}>✦</span>
                <span style={{ fontSize: "11px", color: "#666" }}>{g}</span>
              </div>
            ))}
            <Link href="/admin" style={{ ...S.link, color: "#C5A059", marginTop: "12px", fontSize: "11px" }}
              onMouseEnter={(e) => (e.currentTarget as HTMLElement).style.color = "#fff"}
              onMouseLeave={(e) => (e.currentTarget as HTMLElement).style.color = "#C5A059"}
            >
              Admin Console →
            </Link>
          </div>
        </div>

        {/* Bottom bar */}
        <div style={{ borderTop: "1px solid #1a1a1a", paddingTop: "24px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
          <div style={{ fontSize: "11px", color: "#444" }}>
            © {new Date().getFullYear()} KRONO ATELIER S.A. All rights reserved.
          </div>
          <div style={{ display: "flex", gap: "20px", fontSize: "10px", color: "#444", letterSpacing: "0.08em", textTransform: "uppercase", fontFamily: "monospace" }}>
            <span style={{ color: "#C5A059" }}>Superlative Chronometer</span>
            <span>•</span>
            <span>SSL Encrypted</span>
            <span>•</span>
            <span style={{ color: "#C5A059" }}>Genève Registry</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
