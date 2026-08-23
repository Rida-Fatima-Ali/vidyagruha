"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import PillNav from "./PillNav";
import SpecularButton from "./SpecularButton";
import { Menu, X, ArrowLeft } from "lucide-react";

const NAV_ITEMS = [
  { label: "Home", targetId: "section-hero" },
  { label: "About", targetId: "section-about" },
  { label: "Features", targetId: "section-why" },
];

export default function LandingNavbar() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const goToSignIn = () => router.push("/signin");

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setOpen(false);
  };

  return (
    <nav
      aria-label="Main navigation"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        background: scrolled ? "rgba(8, 5, 20, 0.85)" : "rgba(8, 5, 20, 0.50)",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        boxShadow: scrolled
          ? "0 8px 40px rgba(0,0,0,0.40)"
          : "0 2px 20px rgba(0,0,0,0.20)",
        transition: "background 0.35s ease, box-shadow 0.35s ease",
      }}
    >
      {/* ── Desktop bar ─────────────────────────────────────────────────── */}
      <div
        style={{
          maxWidth: "100vw",
          padding: "0 1.5rem",
          height: "64px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        {/* Left: Brand Logo & Back */}
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <button
            onClick={() => router.push("/")}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.12)",
              color: "#fff",
              borderRadius: "6px",
              padding: "0.35rem 0.75rem",
              fontSize: "0.75rem",
              cursor: "pointer",
              fontWeight: 500,
              transition: "all 0.2s ease",
            }}
            title="Return to Main Sign In"
          >
            <ArrowLeft style={{ width: "14px", height: "14px" }} />
            <span>Sign In</span>
          </button>

          <a
            href="#section-hero"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              textDecoration: "none",
            }}
          >
            <Image
              src="/vidyagruha-logo-light.png"
              alt="VidyaGruha"
              width={140}
              height={36}
              style={{ objectFit: "contain", height: "30px", width: "auto" }}
              priority
            />
          </a>
        </div>

        {/* Center: Pill Navigation */}
        <div
          style={{
            display: "none",
          }}
          className="desktop-pill-nav"
        >
          <style>{`
            @media (min-width: 768px) {
              .desktop-pill-nav { display: block !important; }
              .mobile-burger-btn { display: none !important; }
            }
          `}</style>
          <PillNav items={NAV_ITEMS} onItemClick={scrollTo} />
        </div>

        {/* Right: Primary Sign In & Sign Up Buttons */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <div style={{ display: "none" }} className="desktop-pill-nav">
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <button
                onClick={() => router.push("/signup")}
                style={{
                  background: "rgba(255, 255, 255, 0.08)",
                  border: "1px solid rgba(255, 255, 255, 0.16)",
                  color: "#fff",
                  padding: "0.4rem 0.85rem",
                  borderRadius: "8px",
                  fontSize: "0.75rem",
                  fontWeight: 600,
                  cursor: "pointer",
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  transition: "all 0.2s ease",
                }}
              >
                Sign Up
              </button>
              <SpecularButton
                size="sm"
                onClick={goToSignIn}
                radius={8}
                tintOpacity={0.12}
                blur={12}
                intensity={1.2}
              >
                Sign In
              </SpecularButton>
            </div>
          </div>

          {/* Mobile hamburger */}
          <button
            type="button"
            className="mobile-burger-btn"
            onClick={() => setOpen(!open)}
            aria-label="Toggle menu"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "36px",
              height: "36px",
              borderRadius: "8px",
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.10)",
              color: "#fff",
              cursor: "pointer",
            }}
          >
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {/* ── Mobile dropdown ──────────────────────────────────────────────── */}
      {open && (
        <div
          style={{
            borderTop: "1px solid rgba(255,255,255,0.06)",
            background: "rgba(8, 5, 20, 0.95)",
            backdropFilter: "blur(20px)",
            padding: "1rem 1.5rem 1.5rem",
            display: "flex",
            flexDirection: "column",
            gap: "0.75rem",
          }}
        >
          {NAV_ITEMS.map((item) => (
            <button
              key={item.label}
              type="button"
              onClick={() => scrollTo(item.targetId)}
              style={{
                textAlign: "left",
                background: "transparent",
                border: "none",
                color: "rgba(255,255,255,0.80)",
                fontSize: "1rem",
                padding: "0.5rem 0",
                cursor: "pointer",
                fontWeight: 500,
              }}
            >
              {item.label}
            </button>
          ))}
          <div style={{ paddingTop: "0.5rem" }}>
            <SpecularButton size="md" onClick={goToSignIn} radius={8}>
              Sign In to VidyaGruha
            </SpecularButton>
          </div>
        </div>
      )}
    </nav>
  );
}
