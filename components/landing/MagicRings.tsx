"use client";

import { useEffect, useRef } from "react";

// ── GLSL Shaders ──────────────────────────────────────────────────────────────
const VERT = `
void main() {
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}`;

const FRAG = `
precision highp float;

uniform float uTime, uAttenuation, uLineThickness;
uniform float uBaseRadius, uRadiusStep, uScaleRate;
uniform float uOpacity, uNoiseAmount, uRotation, uRingGap;
uniform float uFadeIn, uFadeOut;
uniform vec2  uResolution;
uniform vec3  uColor, uColorTwo;
uniform int   uRingCount;

const float HP    = 1.5707963;
const float CYCLE = 3.45;

float fade(float t) {
  return t < uFadeIn ? smoothstep(0.0, uFadeIn, t)
                     : 1.0 - smoothstep(uFadeOut, CYCLE - 0.2, t);
}

float ring(vec2 p, float ri, float cut, float t0, float px) {
  float t  = mod(uTime + t0, CYCLE);
  float r  = ri + t / CYCLE * uScaleRate;
  float d  = abs(length(p) - r);
  float a  = atan(abs(p.y), abs(p.x)) / HP;
  float th = max(1.0 - a, 0.5) * px * uLineThickness;
  float h  = (1.0 - smoothstep(th, th * 1.5, d)) + 1.0;
  d += pow(cut * a, 3.0) * r;
  return h * exp(-uAttenuation * d) * fade(t);
}

void main() {
  float px = 1.0 / min(uResolution.x, uResolution.y);
  vec2  p  = (gl_FragCoord.xy - 0.5 * uResolution.xy) * px;
  float cr = cos(uRotation), sr = sin(uRotation);
  p = mat2(cr, -sr, sr, cr) * p;

  vec3  c   = vec3(0.0);
  float rcf = max(float(uRingCount) - 1.0, 1.0);
  for (int i = 0; i < 10; i++) {
    if (i >= uRingCount) break;
    float fi = float(i);
    vec3  rc = mix(uColor, uColorTwo, fi / rcf);
    c = mix(c, rc, vec3(ring(p, uBaseRadius + fi * uRadiusStep,
        pow(uRingGap, fi), i == 0 ? 0.0 : 2.95 * fi, px)));
  }
  float n = fract(sin(dot(gl_FragCoord.xy + uTime * 100.0,
                           vec2(12.9898, 78.233))) * 43758.5453);
  c += (n - 0.5) * uNoiseAmount;
  gl_FragColor = vec4(c, max(c.r, max(c.g, c.b)) * uOpacity);
}`;

// ── Component ─────────────────────────────────────────────────────────────────
interface MagicRingsProps {
  color?:         string;
  colorTwo?:      string;
  ringCount?:     number;
  opacity?:       number;
  speed?:         number;
  lineThickness?: number;
  className?:     string;
}

function hexToRgb(hex: string): [number, number, number] {
  const r = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!r) return [1, 1, 1];
  return [parseInt(r[1], 16) / 255, parseInt(r[2], 16) / 255, parseInt(r[3], 16) / 255];
}

export default function MagicRings({
  color         = "#7c3aed",
  colorTwo      = "#06b6d4",
  ringCount     = 6,
  opacity       = 0.85,
  speed         = 1.0,
  lineThickness = 2.0,
  className     = "",
}: MagicRingsProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const rafRef   = useRef<number>(0);

  useEffect(() => {
    const el = mountRef.current;
    if (!el) return;

    let THREE: typeof import("three");
    let renderer: import("three").WebGLRenderer;
    let scene: import("three").Scene;
    let camera: import("three").OrthographicCamera;
    let mesh: import("three").Mesh;
    let material: import("three").ShaderMaterial;
    let animating = true;

    (async () => {
      THREE = await import("three");

      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
      renderer.setPixelRatio(window.devicePixelRatio);
      renderer.setClearColor(0x000000, 0);
      el.appendChild(renderer.domElement);
      renderer.domElement.style.cssText =
        "position:absolute;inset:0;width:100%;height:100%;pointer-events:none;";

      scene  = new THREE.Scene();
      camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

      const geo = new THREE.PlaneGeometry(2, 2);
      material  = new THREE.ShaderMaterial({
        transparent:    true,
        depthWrite:     false,
        uniforms: {
          uTime:          { value: 0 },
          uResolution:    { value: new THREE.Vector2() },
          uColor:         { value: new THREE.Vector3(...hexToRgb(color)) },
          uColorTwo:      { value: new THREE.Vector3(...hexToRgb(colorTwo)) },
          uRingCount:     { value: ringCount },
          uAttenuation:   { value: 10.0 },
          uLineThickness: { value: lineThickness },
          uBaseRadius:    { value: 0.35 },
          uRadiusStep:    { value: 0.1 },
          uScaleRate:     { value: 0.1 },
          uOpacity:       { value: opacity },
          uNoiseAmount:   { value: 0.05 },
          uRotation:      { value: 0 },
          uRingGap:       { value: 1.5 },
          uFadeIn:        { value: 0.7 },
          uFadeOut:       { value: 0.5 },
        },
        vertexShader:   VERT,
        fragmentShader: FRAG,
      });

      mesh = new THREE.Mesh(geo, material);
      scene.add(mesh);

      const resize = () => {
        const w = el.offsetWidth;
        const h = el.offsetHeight;
        renderer.setSize(w, h);
        material.uniforms.uResolution.value.set(
          w * window.devicePixelRatio,
          h * window.devicePixelRatio
        );
      };
      const ro = new ResizeObserver(resize);
      ro.observe(el);
      resize();

      let start = 0;
      const loop = (ts: number) => {
        if (!animating) return;
        if (!start) start = ts;
        material.uniforms.uTime.value = ((ts - start) / 1000) * speed;
        renderer.render(scene, camera);
        rafRef.current = requestAnimationFrame(loop);
      };
      rafRef.current = requestAnimationFrame(loop);

      return () => ro.disconnect();
    })();

    return () => {
      animating = false;
      cancelAnimationFrame(rafRef.current);
      if (renderer) {
        renderer.dispose();
        renderer.domElement.remove();
      }
    };
  }, [color, colorTwo, ringCount, opacity, speed, lineThickness]);

  return (
    <div
      ref={mountRef}
      className={`absolute inset-0 w-full h-full pointer-events-none ${className}`}
    />
  );
}
