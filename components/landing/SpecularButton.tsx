"use client";

import { useRef, useEffect, type ReactNode } from "react";

// ── Shaders ───────────────────────────────────────────────────────────────────
const VERT_SRC = `#version 300 es
in vec2 position;
void main() {
  gl_Position = vec4(position, 0.0, 1.0);
}`;

const FRAG_SRC = `#version 300 es
precision highp float;

uniform vec2  uCenter;
uniform vec2  uHalfSize;
uniform float uRadius;
uniform float uAngle;
uniform float uPx;
uniform vec3  uLineColor;
uniform vec3  uBaseColor;
uniform float uIntensity;
uniform float uShineSize;
uniform float uShineFade;
uniform float uThickness;
uniform float uBaseWidth;

out vec4 fragColor;

float sdRoundedRect(vec2 p, vec2 b, float r) {
  vec2 q = abs(p) - b + r;
  return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r;
}

float gaussianLine(float d, float sigma) {
  float x = d / (sigma + 1e-6);
  float k = mix(1.0, 1.6, smoothstep(0.0, 1.5, x));
  return exp(-k * x * x);
}

void main() {
  vec2  p    = gl_FragCoord.xy - uCenter;
  float d    = sdRoundedRect(p, uHalfSize, uRadius);
  vec2  L    = vec2(cos(uAngle), sin(uAngle));
  float base = (1.0 - smoothstep(0.0, uBaseWidth, abs(d))) * 0.45;
  vec2  nEll = normalize(p / (uHalfSize * uHalfSize) + 1e-6);
  float phi  = acos(clamp(abs(dot(nEll, L)), 0.0, 1.0));
  float rim  = 1.0 - smoothstep(uShineSize - uShineFade, uShineSize + uShineFade + 1e-4, phi);
  float line = gaussianLine(d, uThickness);
  float edgeClamp = 1.0 - smoothstep(0.5 * uPx, 3.0 * uPx, abs(d));
  float hi   = line * rim * edgeClamp * uIntensity;
  vec3  col  = uBaseColor * base + uLineColor * hi;
  float a    = clamp(base + hi, 0.0, 1.0);
  fragColor  = vec4(col, a);
}`;

// ── Helpers ───────────────────────────────────────────────────────────────────
function hexToRgb(hex: string): [number, number, number] {
  const r = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!r) return [1, 1, 1];
  return [parseInt(r[1], 16) / 255, parseInt(r[2], 16) / 255, parseInt(r[3], 16) / 255];
}

function compileShader(gl: WebGL2RenderingContext, type: number, src: string) {
  const s = gl.createShader(type)!;
  gl.shaderSource(s, src);
  gl.compileShader(s);
  return s;
}

// ── Props ─────────────────────────────────────────────────────────────────────
interface SpecularButtonProps {
  children?:    ReactNode;
  onClick?:     () => void;
  lineColor?:   string;
  baseColor?:   string;
  textColor?:   string;
  tint?:        string;
  tintOpacity?: number;
  intensity?:   number;
  shineSize?:   number;
  shineFade?:   number;
  thickness?:   number;
  radius?:      number;
  size?:        "sm" | "md" | "lg";
  blur?:        number;
  className?:   string;
  type?:        "button" | "submit";
}

const SIZE_MAP = {
  sm: "px-4 py-2 text-sm",
  md: "px-6 py-3 text-base",
  lg: "px-8 py-3.5 text-base",
};

export default function SpecularButton({
  children    = "Get Started",
  onClick,
  lineColor   = "#ffffff",
  baseColor   = "#525252",
  textColor   = "#f5f5f5",
  tint        = "#ffffff",
  tintOpacity = 0.06,
  intensity   = 1.0,
  shineSize   = 10,
  shineFade   = 40,
  thickness   = 1.0,
  radius      = 16,
  size        = "lg",
  blur        = 8,
  className   = "",
  type        = "button",
}: SpecularButtonProps) {
  const btnRef    = useRef<HTMLButtonElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const angleRef  = useRef(Math.PI / 4);
  const rafRef    = useRef<number>(0);
  const glRef     = useRef<WebGL2RenderingContext | null>(null);
  const progRef   = useRef<WebGLProgram | null>(null);
  const uLoc      = useRef<Record<string, WebGLUniformLocation | null>>({});

  useEffect(() => {
    const btn    = btnRef.current;
    const canvas = canvasRef.current;
    if (!btn || !canvas) return;

    const dpr = window.devicePixelRatio || 1;
    const gl  = canvas.getContext("webgl2", { alpha: true, premultipliedAlpha: true })!;
    if (!gl) return;
    glRef.current = gl;

    gl.clearColor(0, 0, 0, 0);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

    const prog = gl.createProgram()!;
    gl.attachShader(prog, compileShader(gl, gl.VERTEX_SHADER,   VERT_SRC));
    gl.attachShader(prog, compileShader(gl, gl.FRAGMENT_SHADER, FRAG_SRC));
    gl.linkProgram(prog);
    gl.useProgram(prog);
    progRef.current = prog;

    // Full-screen triangle
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 3,-1, -1,3]), gl.STATIC_DRAW);
    const posLoc = gl.getAttribLocation(prog, "position");
    gl.enableVertexAttribArray(posLoc);
    gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

    // Cache uniform locations
    const U = (n: string) => gl.getUniformLocation(prog, n);
    uLoc.current = {
      uCenter:    U("uCenter"),    uHalfSize: U("uHalfSize"),
      uRadius:    U("uRadius"),    uAngle:    U("uAngle"),
      uPx:        U("uPx"),        uLineColor:U("uLineColor"),
      uBaseColor: U("uBaseColor"), uIntensity:U("uIntensity"),
      uShineSize: U("uShineSize"), uShineFade:U("uShineFade"),
      uThickness: U("uThickness"), uBaseWidth:U("uBaseWidth"),
    };

    // Set static uniforms
    gl.uniform3fv(uLoc.current.uLineColor, hexToRgb(lineColor));
    gl.uniform3fv(uLoc.current.uBaseColor, hexToRgb(baseColor));
    gl.uniform1f(uLoc.current.uIntensity,  intensity);
    gl.uniform1f(uLoc.current.uShineSize,  shineSize * 0.017453); // deg→rad
    gl.uniform1f(uLoc.current.uShineFade,  shineFade * 0.017453);
    gl.uniform1f(uLoc.current.uThickness,  thickness);
    gl.uniform1f(uLoc.current.uBaseWidth,  2.0);
    gl.uniform1f(uLoc.current.uRadius,     radius);

    const draw = () => {
      if (!btn || !canvas) return;
      const rect = btn.getBoundingClientRect();
      const w    = rect.width  * dpr;
      const h    = rect.height * dpr;

      if (canvas.width !== w || canvas.height !== h) {
        canvas.width  = w;
        canvas.height = h;
        gl.viewport(0, 0, w, h);
      }

      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.uniform2f(uLoc.current.uCenter,   w / 2, h / 2);
      gl.uniform2f(uLoc.current.uHalfSize, w / 2 - 1, h / 2 - 1);
      gl.uniform1f(uLoc.current.uAngle,    angleRef.current);
      gl.uniform1f(uLoc.current.uPx,       1);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };

    const animate = () => {
      angleRef.current += 0.008;
      draw();
      rafRef.current = requestAnimationFrame(animate);
    };

    const onMove = (e: MouseEvent) => {
      const rect = btn.getBoundingClientRect();
      const dx   = e.clientX - rect.left  - rect.width  / 2;
      const dy   = e.clientY - rect.top   - rect.height / 2;
      angleRef.current = Math.atan2(-dy, dx);
      draw();
    };

    btn.addEventListener("mousemove", onMove);
    rafRef.current = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(rafRef.current);
      btn.removeEventListener("mousemove", onMove);
      gl.deleteProgram(prog);
    };
  }, [lineColor, baseColor, intensity, shineSize, shineFade, thickness, radius]);

  const tintStyle = `color-mix(in srgb, ${tint} ${Math.round(tintOpacity * 100)}%, transparent)`;

  return (
    <button
      ref={btnRef}
      type={type}
      onClick={onClick}
      className={`relative inline-flex items-center justify-center select-none cursor-pointer font-medium transition-transform active:scale-95 ${SIZE_MAP[size]} ${className}`}
      style={{
        background:    tintStyle,
        borderRadius:  `${radius}px`,
        backdropFilter:`blur(${blur}px)`,
        WebkitBackdropFilter: `blur(${blur}px)`,
        color:         textColor,
        border:        "none",
        letterSpacing: "0.01em",
        overflow:      "hidden",
      }}
    >
      {/* WebGL specular canvas overlay */}
      <canvas
        ref={canvasRef}
        style={{
          position:      "absolute",
          inset:         0,
          width:         "100%",
          height:        "100%",
          pointerEvents: "none",
          borderRadius:  `${radius}px`,
        }}
      />
      {/* Label */}
      <span style={{ position: "relative", zIndex: 1 }}>{children}</span>
    </button>
  );
}
