"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import FoldText     from "./FoldText";
import PillNav      from "./PillNav";
import SpecularButton from "./SpecularButton";
import { Menu, X } from "lucide-react";

const NAV_ITEMS = [
  { label: "Home",     targetId: "section-hero"  },
  { label: "About",    targetId: "section-about" },
  { label: "Features", targetId: "section-why"   },
];

export default function LandingNavbar() {
  const router       = useRouter();
  const [open, setOpen]       = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const goToApp = () => router.push("/login");

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setOpen(false);
  };

  return (
    <nav
      aria-label="Main navigation"
      style={{
        position:      "fixed",
        top:           0,
        left:          0,
        right:         0,
        zIndex:        50,
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        background:    scrolled
          ? "rgba(8, 5, 20, 0.72)"
          : "rgba(8, 5, 20, 0.40)",
        borderBottom:  "1px solid rgba(255,255,255,0.06)",
        boxShadow:     scrolled
          ? "0 8px 40px rgba(0,0,0,0.40)"
          : "0 2px 20px rgba(0,0,0,0.20)",
        transition:    "background 0.35s ease, box-shadow 0.35s ease",
      }}
    >
      {/* ── Desktop bar ─────────────────────────────────────────────────── */}
      <div
        style={{
          maxWidth:      "100vw",
          padding:       "0 1.5rem",
          height:        "64px",
          display:       "flex",
          alignItems:    "center",
          justifyContent:"space-between",
          gap:           "1.5rem",
        }}
      >
        {/* Left — Brand */}
        <div style={{ flexShrink: 0, cursor: "pointer" }} onClick={() => scrollTo("section-hero")}>
          <FoldText
            text="Campus One"
            fontSize={20}
            fontWeight={700}
            color="#ffffff"
            hinge="top"
            duration={0.7}
            stagger={0.035}
            style={{ letterSpacing: "-0.02em" }}
          />
        </div>

        {/* Center — PillNav (desktop only) */}
        <div
          style={{ flexGrow: 1, display: "flex", justifyContent: "center" }}
          className="hidden md:flex"
        >
          <PillNav items={NAV_ITEMS} />
        </div>

        {/* Right — CTA + hamburger */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexShrink: 0 }}>
          <div className="hidden md:block">
            <SpecularButton
              size="sm"
              onClick={goToApp}
              radius={20}
              tintOpacity={0.08}
              blur={8}
              intensity={1.2}
              shineSize={8}
              shineFade={35}
            >
              View Campus One
            </SpecularButton>
          </div>

          {/* Hamburger (mobile) */}
          <button
            className="md:hidden p-2 rounded-lg"
            style={{
              color:      "#ffffffcc",
              background: "rgba(255,255,255,0.06)",
              border:     "1px solid rgba(255,255,255,0.10)",
            }}
            onClick={() => setOpen(v => !v)}
            aria-label={open ? "Close menu" : "Open menu"}
          >
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {/* ── Mobile menu ─────────────────────────────────────────────────── */}
      {open && (
        <div
          className="md:hidden"
          style={{
            borderTop:  "1px solid rgba(255,255,255,0.06)",
            padding:    "1rem 1.5rem 1.25rem",
            display:    "flex",
            flexDirection: "column",
            gap:        "0.5rem",
          }}
        >
          {NAV_ITEMS.map(it => (
            <button
              key={it.targetId}
              onClick={() => scrollTo(it.targetId)}
              style={{
                textAlign:  "left",
                padding:    "0.625rem 0.75rem",
                borderRadius:"8px",
                color:      "rgba(255,255,255,0.80)",
                fontSize:   "0.9375rem",
                fontWeight: 500,
                background: "rgba(255,255,255,0.05)",
                border:     "1px solid rgba(255,255,255,0.08)",
                cursor:     "pointer",
                transition: "background 0.2s",
              }}
            >
              {it.label}
            </button>
          ))}
          <div style={{ marginTop: "0.5rem" }}>
            <SpecularButton
              size="md"
              onClick={goToApp}
              radius={12}
              tintOpacity={0.1}
              className="w-full"
            >
              View Campus One
            </SpecularButton>
          </div>
        </div>
      )}
    </nav>
  );
}
