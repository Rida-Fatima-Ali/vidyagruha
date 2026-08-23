"use client";

import { useState, useRef, useEffect } from "react";

interface NavItem {
  label: string;
  targetId: string;
}

interface PillNavProps {
  items: NavItem[];
  baseColor?: string;
  pillColor?: string;
  textColor?: string;
  activeColor?: string;
  className?: string;
  onItemClick?: (targetId: string) => void;
}

export default function PillNav({
  items,
  baseColor = "rgba(255,255,255,0.08)",
  pillColor = "rgba(255,255,255,0.18)",
  textColor = "rgba(255,255,255,0.65)",
  activeColor = "#ffffff",
  className = "",
  onItemClick,
}: PillNavProps) {
  const [active, setActive] = useState(0);
  const [hoveredIdx, setHovered] = useState<number | null>(null);
  const navRef = useRef<HTMLDivElement>(null);

  // Update active pill on scroll
  useEffect(() => {
    const ids = items.map((it) => it.targetId);
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            const idx = ids.indexOf(e.target.id);
            if (idx !== -1) setActive(idx);
          }
        });
      },
      { threshold: 0.5 }
    );
    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [items]);

  const scrollTo = (id: string, idx: number) => {
    setActive(idx);
    if (onItemClick) {
      onItemClick(id);
    } else {
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div
      ref={navRef}
      className={`flex items-center gap-1 px-2 py-1.5 rounded-full ${className}`}
      style={{
        background: baseColor,
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        border: "1px solid rgba(255,255,255,0.10)",
      }}
    >
      {items.map((item, i) => {
        const isActive = active === i;
        const isHovered = hoveredIdx === i;

        return (
          <button
            key={item.targetId}
            onClick={() => scrollTo(item.targetId, i)}
            onMouseEnter={() => setHovered(i)}
            onMouseLeave={() => setHovered(null)}
            className="relative px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-300 select-none"
            style={{
              color: isActive ? activeColor : textColor,
              background: isActive
                ? pillColor
                : isHovered
                ? "rgba(255,255,255,0.07)"
                : "transparent",
              boxShadow: isActive
                ? "0 1px 0 rgba(255,255,255,0.06) inset, 0 2px 8px rgba(0,0,0,0.3)"
                : "none",
              border: isActive
                ? "1px solid rgba(255,255,255,0.15)"
                : "1px solid transparent",
              transform: isHovered && !isActive ? "translateY(-1px)" : "none",
            }}
          >
            {item.label}
          </button>
        );
      })}
    </div>
  );
}
