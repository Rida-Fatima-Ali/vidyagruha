"use client";

import { useEffect, useRef } from "react";

// ── Helpers ──────────────────────────────────────────────────────────────────
function hexToRgb(hex: string): [number, number, number] {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return [1, 1, 1];
  return [
    parseInt(result[1], 16) / 255,
    parseInt(result[2], 16) / 255,
    parseInt(result[3], 16) / 255,
  ];
}

// ── GLSL ──────────────────────────────────────────────────────────────────────
const VERT = `#version 300 es
in vec2 position;
void main() {
  gl_Position = vec4(position, 0.0, 1.0);
}`;

const FRAG = `#version 300 es
precision highp float;
uniform vec2  iResolution;
uniform float iTime;
uniform float uSpeed;
uniform float uAmplitude;
uniform float uWaveScale;
uniform float uWaveRatio;
uniform float uSwell;
uniform float uTurbulence;
uniform float uTilt;
uniform float uZoom;
uniform float uHeight;
uniform float uFogDepth;
uniform float uSteps;
uniform float uBrightness;
uniform float uOpacity;
uniform vec3  uHorizonColor;
uniform vec3  uWaveColor;
uniform vec3  uCrestColor;
out vec4 fragColor;

const float MAX_DIST = 20000.0;

float plasma(vec3 r, vec2 freq, vec4 tc) {
  float mx = r.x + tc.x;
  mx += uSwell * sin((r.y + mx) / 20.0 + tc.y);
  float my = r.y - tc.z;
  my += uTurbulence * cos(r.x / 23.0 + tc.w);
  return r.z - (sin(mx * freq.x) * uAmplitude + sin(my * freq.y) * uAmplitude + uHeight);
}

float raymarch(vec3 pos, vec3 dir, vec2 freq, vec4 tc) {
  float dist = 0.0;
  for (int i = 0; i < 128; i++) {
    if (float(i) >= uSteps) break;
    float dscene = plasma(pos + dist * dir, freq, tc);
    if (abs(dscene) < 0.1) break;
    dist += 0.9 * dscene;
    if (!(abs(dist) < MAX_DIST)) return MAX_DIST;
  }
  return dist;
}

void main() {
  float T    = iTime * uSpeed;
  vec2  freq = vec2(uWaveScale / 7.0, (uWaveScale * uWaveRatio) / 3.0);
  vec4  tc   = vec4(T / 0.130, T / 0.810, T / 0.200, T / 0.710);
  float vfov = (3.14159 / 2.3) / max(uZoom, 0.05);
  vec3  cam  = vec3(0.0, 0.0, 30.0);
  vec2  uv   = (gl_FragCoord.xy / iResolution.xy) - 0.5;
  uv.x *= iResolution.x / iResolution.y;
  uv.y *= -1.0;

  vec3  dir  = vec3(0.0, 0.0, -1.0);
  float ulen = length(uv);
  float xrot = vfov * ulen;
  float c = cos(xrot), s = sin(xrot);
  dir = mat3(1.0,0.0,0.0, 0.0,c,-s, 0.0,s,c) * dir;
  vec2 nuv = ulen > 1e-5 ? uv / ulen : vec2(1.0, 0.0);
  c = nuv.x; s = nuv.y;
  dir = mat3(c,-s,0.0, s,c,0.0, 0.0,0.0,1.0) * dir;
  c = cos(uTilt); s = sin(uTilt);
  dir = mat3(c,0.0,s, 0.0,1.0,0.0, -s,0.0,c) * dir;

  float dist = raymarch(cam, dir, freq, tc);
  vec3  pos  = cam + dist * dir;

  float t    = clamp(uFogDepth / max(dist, 0.001), 0.0, 1.0);
  vec3  body = mix(uWaveColor, uCrestColor, clamp(pos.z * 0.08 + 0.5, 0.0, 1.0));
  vec3  col  = mix(uHorizonColor, body * uBrightness, t);
  fragColor  = vec4(col, uOpacity);
}`;

// ── Component ──────────────────────────────────────────────────────────────────
interface GradientWavesProps {
  horizonColor?: string;
  waveColor?: string;
  crestColor?: string;
  speed?: number;
  amplitude?: number;
  waveScale?: number;
  opacity?: number;
  className?: string;
}

export default function GradientWaves({
  horizonColor = "#0d0a1a",
  waveColor    = "#4a1d96",
  crestColor   = "#7c3aed",
  speed        = 0.4,
  amplitude    = 1.8,
  waveScale    = 1.2,
  opacity      = 1.0,
  className    = "",
}: GradientWavesProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef    = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext("webgl2");
    if (!gl) return;

    // Compile shader
    function compile(type: number, src: string) {
      const shader = gl!.createShader(type)!;
      gl!.shaderSource(shader, src);
      gl!.compileShader(shader);
      return shader;
    }

    const prog = gl.createProgram()!;
    gl.attachShader(prog, compile(gl.VERTEX_SHADER, VERT));
    gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(prog);
    gl.useProgram(prog);

    // Full-screen triangle
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 3, -1, -1, 3]),
      gl.STATIC_DRAW
    );
    const posLoc = gl.getAttribLocation(prog, "position");
    gl.enableVertexAttribArray(posLoc);
    gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

    // Uniform locations
    const U = (name: string) => gl.getUniformLocation(prog, name);
    const uRes   = U("iResolution");
    const uTime  = U("iTime");
    const uSpd   = U("uSpeed");
    const uAmp   = U("uAmplitude");
    const uWS    = U("uWaveScale");
    const uWR    = U("uWaveRatio");
    const uSwell = U("uSwell");
    const uTurb  = U("uTurbulence");
    const uTilt  = U("uTilt");
    const uZoom  = U("uZoom");
    const uHgt   = U("uHeight");
    const uFog   = U("uFogDepth");
    const uSteps = U("uSteps");
    const uBri   = U("uBrightness");
    const uOp    = U("uOpacity");
    const uHorC  = U("uHorizonColor");
    const uWavC  = U("uWaveColor");
    const uCreC  = U("uCrestColor");

    // Set static uniforms
    gl.uniform1f(uSpd,   speed);
    gl.uniform1f(uAmp,   amplitude);
    gl.uniform1f(uWS,    waveScale);
    gl.uniform1f(uWR,    1.0);
    gl.uniform1f(uSwell, 1.5);
    gl.uniform1f(uTurb,  1.0);
    gl.uniform1f(uTilt,  0.18);
    gl.uniform1f(uZoom,  1.0);
    gl.uniform1f(uHgt,   0.0);
    gl.uniform1f(uFog,   20.0);
    gl.uniform1f(uSteps, 70.0);
    gl.uniform1f(uBri,   1.0);
    gl.uniform1f(uOp,    opacity);
    gl.uniform3fv(uHorC, hexToRgb(horizonColor));
    gl.uniform3fv(uWavC, hexToRgb(waveColor));
    gl.uniform3fv(uCreC, hexToRgb(crestColor));

    let start = 0;

    const resize = () => {
      const w = canvas.offsetWidth  * window.devicePixelRatio;
      const h = canvas.offsetHeight * window.devicePixelRatio;
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width  = w;
        canvas.height = h;
        gl.viewport(0, 0, w, h);
      }
    };

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    resize();

    const draw = (ts: number) => {
      if (!start) start = ts;
      const t = (ts - start) / 1000;
      gl.uniform2f(uRes, canvas.width, canvas.height);
      gl.uniform1f(uTime, t);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      rafRef.current = requestAnimationFrame(draw);
    };

    rafRef.current = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(rafRef.current);
      ro.disconnect();
      gl.deleteProgram(prog);
    };
  }, [horizonColor, waveColor, crestColor, speed, amplitude, waveScale, opacity]);

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 w-full h-full ${className}`}
      style={{ display: "block" }}
    />
  );
}
