"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import GradientWaves from "./GradientWaves";
import SpecularButton from "./SpecularButton";

export default function HeroSection() {
  const router = useRouter();

  return (
    <section
      id="section-hero"
      style={{
        position: "relative",
        width: "100vw",
        height: "100vh",
        maxWidth: "100vw",
        overflow: "hidden",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#0d0a1a",
      }}
    >
      {/* GradientWaves background */}
      <GradientWaves
        horizonColor="#0d0a1a"
        waveColor="#4a1d96"
        crestColor="#7c3aed"
        speed={0.22}
        amplitude={1.2}
        waveScale={1.0}
        opacity={0.85}
      />

      {/* Subtle dark vignette overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(ellipse 80% 60% at 50% 50%, transparent 0%, rgba(13,10,26,0.55) 100%)",
          pointerEvents: "none",
        }}
      />

      {/* Content */}
      <div
        style={{
          position: "relative",
          zIndex: 1,
          textAlign: "center",
          padding: "0 1.5rem",
          maxWidth: "800px",
          width: "100%",
        }}
      >
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          style={{ marginBottom: "1.5rem" }}
        >
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.375rem",
              padding: "0.375rem 0.875rem",
              borderRadius: "9999px",
              border: "1px solid rgba(124,58,237,0.40)",
              background: "rgba(124,58,237,0.12)",
              fontSize: "0.8125rem",
              fontWeight: 500,
              color: "rgba(196,168,255,0.90)",
              letterSpacing: "0.04em",
              textTransform: "uppercase",
            }}
          >
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: "#7c3aed",
                display: "inline-block",
              }}
            />
            Academic Intelligence Ecosystem
          </span>
        </motion.div>

        {/* Heading */}
        <motion.h1
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.75, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          style={{
            fontSize: "clamp(2.5rem, 7vw, 5rem)",
            fontWeight: 800,
            color: "#ffffff",
            lineHeight: 1.05,
            letterSpacing: "-0.03em",
            marginBottom: "1.25rem",
          }}
        >
          Explore{" "}
          <span
            style={{
              background:
                "linear-gradient(135deg, #a78bfa 0%, #7c3aed 50%, #c4b5fd 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            VidyaGruha
          </span>
        </motion.h1>

        {/* Description lines */}
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
          style={{
            fontSize: "clamp(1rem, 2.5vw, 1.25rem)",
            color: "rgba(255,255,255,0.55)",
            lineHeight: 1.65,
            marginBottom: "0.5rem",
          }}
        >
          One unified space for students, faculty, and campus administrators.
        </motion.p>
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, delay: 0.45, ease: [0.22, 1, 0.36, 1] }}
          style={{
            fontSize: "clamp(0.9rem, 2vw, 1.1rem)",
            color: "rgba(255,255,255,0.38)",
            lineHeight: 1.65,
            marginBottom: "2.5rem",
          }}
        >
          Attendance, cover marketplace, room clash radar and doubt resolution.
        </motion.p>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.55, delay: 0.6, ease: [0.22, 1, 0.36, 1] }}
          style={{ display: "flex", justifyContent: "center", gap: "1rem", flexWrap: "wrap" }}
        >
          <SpecularButton
            size="lg"
            onClick={() => router.push("/signin")}
            radius={22}
            tintOpacity={0.1}
            blur={12}
            intensity={1.3}
            shineSize={9}
            shineFade={38}
          >
            Sign In to VidyaGruha →
          </SpecularButton>
        </motion.div>
      </div>
    </section>
  );
}
