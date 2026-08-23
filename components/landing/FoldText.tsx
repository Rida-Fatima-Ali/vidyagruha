"use client";

import { useEffect, useRef, useMemo } from "react";

interface FoldTextProps {
  text:        string;
  fontSize?:   number | string;
  fontWeight?: number | string;
  color?:      string;
  hinge?:      "top" | "bottom" | "left" | "right";
  duration?:   number;
  stagger?:    number;
  className?:  string;
  style?:      React.CSSProperties;
}

const HINGE = {
  top:    { origin: "50% 0%",   rx: -92, ry: 0 },
  bottom: { origin: "50% 100%", rx:  92, ry: 0 },
  left:   { origin: "0% 50%",   rx: 0,   ry: 92 },
  right:  { origin: "100% 50%", rx: 0,   ry: -92 },
};

export default function FoldText({
  text,
  fontSize   = 40,
  fontWeight = 800,
  color      = "#ffffff",
  hinge      = "top",
  duration   = 0.65,
  stagger    = 0.04,
  className  = "",
  style      = {},
}: FoldTextProps) {
  const rootRef = useRef<HTMLSpanElement>(null);
  const cfg     = HINGE[hinge];

  const chars = useMemo(
    () =>
      text.split("").map((ch, i) => (
        <span
          key={i}
          className="fold-char"
          style={{
            display:      "inline-block",
            perspective:  "700px",
            overflow:     "hidden",
            verticalAlign:"bottom",
          }}
        >
          <span
            className="fold-piece"
            style={{
              display:         "inline-block",
              transformOrigin: cfg.origin,
              transform:       `rotateX(${cfg.rx}deg) rotateY(${cfg.ry}deg)`,
              opacity:         0,
              whiteSpace:      ch === " " ? "pre" : "normal",
            }}
          >
            {ch === " " ? "\u00A0" : ch}
          </span>
        </span>
      )),
    [text, cfg]
  );

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      // Skip animation — just show text
      rootRef.current?.querySelectorAll<HTMLElement>(".fold-piece").forEach(el => {
        el.style.transform = "none";
        el.style.opacity   = "1";
      });
      return;
    }

    let gsapMod: typeof import("gsap") | null = null;

    (async () => {
      const { gsap } = await import("gsap");
      gsapMod = { gsap } as unknown as typeof import("gsap");
      const pieces = rootRef.current?.querySelectorAll<HTMLElement>(".fold-piece");
      if (!pieces?.length) return;

      gsap.to(Array.from(pieces), {
        rotateX:  0,
        rotateY:  0,
        opacity:  1,
        duration,
        ease:     "power3.out",
        stagger,
      });
    })();

    return () => {
      if (gsapMod) {
        const { gsap } = gsapMod as unknown as { gsap: { killTweensOf: (t: unknown) => void } };
        const pieces = rootRef.current?.querySelectorAll(".fold-piece");
        if (pieces) gsap.killTweensOf(Array.from(pieces));
      }
    };
  }, [text, duration, stagger, cfg]);

  return (
    <span
      ref={rootRef}
      className={className}
      style={{ fontSize, fontWeight, color, letterSpacing: "-0.01em", ...style }}
      aria-label={text}
    >
      {chars}
    </span>
  );
}
