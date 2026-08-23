"use client";

import { motion } from "framer-motion";
import ShapeGrid from "./ShapeGrid";

export default function WhyCampusSection() {
  return (
    <section
      id="section-why"
      style={{
        position: "relative",
        width: "100vw",
        height: "70vh",
        maxWidth: "100vw",
        overflow: "hidden",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background:
          "linear-gradient(180deg, #080d10 0%, #0d1a14 60%, #0a100d 100%)",
      }}
    >
      {/* Shape Grid background */}
      <ShapeGrid
        borderColor="rgba(52,211,153,0.10)"
        squareSize={56}
        speed={0.06}
        shape="square"
        direction="right"
      />

      {/* Overlay — fade edges */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: [
            "radial-gradient(ellipse 70% 70% at 50% 50%, transparent 0%, rgba(8,13,16,0.70) 100%)",
          ].join(","),
          pointerEvents: "none",
        }}
      />

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.35 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        style={{
          position: "relative",
          zIndex: 1,
          textAlign: "center",
          padding: "0 1.5rem",
          maxWidth: "660px",
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
            border: "1px solid rgba(52,211,153,0.28)",
            background: "rgba(52,211,153,0.08)",
            fontSize: "0.8rem",
            fontWeight: 500,
            color: "rgba(110,231,183,0.85)",
            letterSpacing: "0.05em",
            textTransform: "uppercase",
          }}
        >
          Why VidyaGruha
        </div>

        <h2
          style={{
            fontSize: "clamp(1.875rem, 5vw, 3.5rem)",
            fontWeight: 800,
            color: "#ffffff",
            lineHeight: 1.1,
            letterSpacing: "-0.025em",
            marginBottom: "1.25rem",
          }}
        >
          Why{" "}
          <span
            style={{
              background:
                "linear-gradient(135deg, #34d399 0%, #10b981 50%, #6ee7b7 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            VidyaGruha?
          </span>
        </h2>

        <p
          style={{
            fontSize: "clamp(0.9rem, 2vw, 1.1rem)",
            color: "rgba(255,255,255,0.48)",
            lineHeight: 1.7,
            marginBottom: "0.5rem",
          }}
        >
          Replacing fragmented tools with a single, coherent academic and operational experience.
        </p>
        <p
          style={{
            fontSize: "clamp(0.85rem, 1.8vw, 1rem)",
            color: "rgba(255,255,255,0.32)",
            lineHeight: 1.7,
          }}
        >
          Trusted by students, preferred by faculty, adopted by college leadership.
        </p>
      </motion.div>
    </section>
  );
}
