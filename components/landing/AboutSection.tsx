"use client";

import dynamic from "next/dynamic";
import { motion } from "framer-motion";

// Dynamically import MagicRings (Three.js) — no SSR
const MagicRings = dynamic(() => import("./MagicRings"), { ssr: false });

export default function AboutSection() {
  return (
    <section
      id="section-about"
      style={{
        position: "relative",
        width: "100vw",
        height: "100vh",
        maxWidth: "100vw",
        overflow: "hidden",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background:
          "linear-gradient(160deg, #050d1a 0%, #0a1628 50%, #050a18 100%)",
      }}
    >
      {/* Magic Rings — centered depth effect */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <MagicRings
          color="#0ea5e9"
          colorTwo="#7c3aed"
          ringCount={6}
          opacity={0.75}
          speed={0.85}
          lineThickness={2.2}
        />
      </div>

      {/* Radial overlay so text stays readable */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(ellipse 50% 50% at 50% 50%, rgba(5,13,26,0.0) 0%, rgba(5,13,26,0.85) 100%)",
          pointerEvents: "none",
        }}
      />

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.4 }}
        transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
        style={{
          position: "relative",
          zIndex: 1,
          textAlign: "center",
          padding: "0 1.5rem",
          maxWidth: "680px",
          width: "100%",
        }}
      >
        {/* Eyebrow */}
        <div
          style={{
            display: "inline-block",
            marginBottom: "1.25rem",
            padding: "0.3rem 0.85rem",
            borderRadius: "9999px",
            border: "1px solid rgba(14,165,233,0.30)",
            background: "rgba(14,165,233,0.10)",
            fontSize: "0.8rem",
            fontWeight: 500,
            color: "rgba(125,211,252,0.85)",
            letterSpacing: "0.05em",
            textTransform: "uppercase",
          }}
        >
          Our Vision
        </div>

        <h2
          style={{
            fontSize: "clamp(2rem, 5.5vw, 3.75rem)",
            fontWeight: 800,
            color: "#ffffff",
            lineHeight: 1.1,
            letterSpacing: "-0.025em",
            marginBottom: "1.25rem",
          }}
        >
          About{" "}
          <span
            style={{
              background:
                "linear-gradient(135deg, #38bdf8 0%, #0ea5e9 50%, #7dd3fc 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            VidyaGruha
          </span>
        </h2>

        <p
          style={{
            fontSize: "clamp(0.95rem, 2vw, 1.15rem)",
            color: "rgba(255,255,255,0.52)",
            lineHeight: 1.7,
            marginBottom: "0.5rem",
          }}
        >
          Built for modern campuses — unifying academic workflows, faculty coordination, and student engagement end to end.
        </p>
        <p
          style={{
            fontSize: "clamp(0.875rem, 1.8vw, 1.05rem)",
            color: "rgba(255,255,255,0.35)",
            lineHeight: 1.7,
          }}
        >
          Designed with editorial restraint, architectural clarity, and institutional purpose.
        </p>
      </motion.div>
    </section>
  );
}
