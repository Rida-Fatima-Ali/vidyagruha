"use client";

import { useRef, useEffect } from "react";

interface ShapeGridProps {
  borderColor?:   string;
  squareSize?:    number;
  speed?:         number;
  shape?:         "square" | "circle" | "triangle" | "hexagon";
  direction?:     "right" | "left" | "up" | "down";
  className?:     string;
}

export default function ShapeGrid({
  borderColor = "rgba(255,255,255,0.12)",
  squareSize  = 44,
  speed       = 0.5,
  shape       = "square",
  direction   = "right",
  className   = "",
}: ShapeGridProps) {
  const canvasRef  = useRef<HTMLCanvasElement>(null);
  const rafRef     = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;

    const gridOffset = { x: 0, y: 0 };
    const isHex = shape === "hexagon";
    const isTri = shape === "triangle";
    const hexHoriz = squareSize * 1.5;
    const hexVert  = squareSize * Math.sqrt(3);

    const resize = () => {
      canvas.width  = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    resize();

    const drawCircle = (cx: number, cy: number, size: number) => {
      ctx.beginPath();
      ctx.arc(cx, cy, size / 2, 0, Math.PI * 2);
      ctx.closePath();
    };

    const drawHex = (cx: number, cy: number, size: number) => {
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const angle = (Math.PI / 3) * i;
        const vx = cx + size * Math.cos(angle);
        const vy = cy + size * Math.sin(angle);
        if (i === 0) ctx.moveTo(vx, vy); else ctx.lineTo(vx, vy);
      }
      ctx.closePath();
    };

    const drawTri = (cx: number, cy: number, size: number, flip: boolean) => {
      ctx.beginPath();
      if (flip) {
        ctx.moveTo(cx, cy + size / 2);
        ctx.lineTo(cx + size / 2, cy - size / 2);
        ctx.lineTo(cx - size / 2, cy - size / 2);
      } else {
        ctx.moveTo(cx, cy - size / 2);
        ctx.lineTo(cx + size / 2, cy + size / 2);
        ctx.lineTo(cx - size / 2, cy + size / 2);
      }
      ctx.closePath();
    };

    const drawGrid = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const cols = Math.ceil(canvas.width  / squareSize) + 2;
      const rows = Math.ceil(canvas.height / squareSize) + 2;
      const ox   = ((gridOffset.x % squareSize) + squareSize) % squareSize;
      const oy   = ((gridOffset.y % squareSize) + squareSize) % squareSize;

      ctx.strokeStyle = borderColor;
      ctx.lineWidth   = 1;

      if (isHex) {
        const hexCols = Math.ceil(canvas.width  / hexHoriz) + 3;
        const hexRows = Math.ceil(canvas.height / hexVert)  + 3;
        const oxH = ((gridOffset.x % hexHoriz) + hexHoriz) % hexHoriz;
        const oyH = ((gridOffset.y % hexVert)  + hexVert)  % hexVert;

        for (let col = -1; col < hexCols; col++) {
          for (let row = -1; row < hexRows; row++) {
            const cx = col * hexHoriz - oxH + squareSize * 0.5;
            const cy = row * hexVert  - oyH + (col % 2 === 0 ? 0 : hexVert / 2);
            drawHex(cx, cy, squareSize * 0.5);
            ctx.stroke();
          }
        }
        return;
      }

      for (let c = -1; c < cols; c++) {
        for (let r = -1; r < rows; r++) {
          const cx = c * squareSize - ox + squareSize / 2;
          const cy = r * squareSize - oy + squareSize / 2;
          if (shape === "circle")   drawCircle(cx, cy, squareSize * 0.7);
          else if (isTri) drawTri(cx, cy, squareSize * 0.7, (c + r) % 2 === 0);
          else {
            ctx.strokeRect(
              c * squareSize - ox,
              r * squareSize - oy,
              squareSize,
              squareSize
            );
            continue;
          }
          ctx.stroke();
        }
      }
    };

    let last = 0;
    const loop = (ts: number) => {
      const dt = ts - last;
      last = ts;
      const spd = speed * 30 * (dt / 16.67);
      if (direction === "right") gridOffset.x += spd;
      else if (direction === "left")  gridOffset.x -= spd;
      else if (direction === "down")  gridOffset.y += spd;
      else if (direction === "up")    gridOffset.y -= spd;
      drawGrid();
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(rafRef.current);
      ro.disconnect();
    };
  }, [borderColor, squareSize, speed, shape, direction]);

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 w-full h-full pointer-events-none ${className}`}
    />
  );
}
