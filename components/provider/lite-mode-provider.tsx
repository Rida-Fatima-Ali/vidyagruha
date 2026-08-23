"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import { LITE_MODE_STORAGE_KEY } from "@/constants/theme";

export type LiteModePreference = "auto" | "on" | "off";

interface NetworkInformation extends EventTarget {
  effectiveType?: string;
  saveData?: boolean;
  downlink?: number;
}

interface LiteModeContextValue {
  /** What the user asked for. */
  preference: LiteModePreference;
  /** Whether the lite experience is actually applied right now. */
  lite: boolean;
  /** The connection looks slow (2G, or the OS data saver is on). */
  slowConnection: boolean;
  /** Effective connection type reported by the browser, when available. */
  effectiveType: string | null;
  setPreference: (preference: LiteModePreference) => void;
  toggle: () => void;
}

const LiteModeContext = createContext<LiteModeContextValue | null>(null);

function connection(): NetworkInformation | null {
  if (typeof navigator === "undefined") return null;
  const candidate = navigator as Navigator & { connection?: NetworkInformation };
  return candidate.connection ?? null;
}

function readNetwork(info: NetworkInformation | null): {
  slowConnection: boolean;
  effectiveType: string | null;
} {
  const effectiveType = info?.effectiveType ?? null;
  return {
    effectiveType,
    slowConnection:
      Boolean(info?.saveData) || effectiveType === "2g" || effectiveType === "slow-2g",
  };
}

function readStoredPreference(): LiteModePreference {
  try {
    const stored = window.localStorage.getItem(LITE_MODE_STORAGE_KEY);
    return stored === "on" || stored === "off" || stored === "auto" ? stored : "auto";
  } catch {
    return "auto";
  }
}

/**
 * Low-bandwidth mode. `auto` follows the browser's Network Information API —
 * a 2G connection or the OS data saver flips the app into a text-first layout
 * that drops imagery, blur and motion; the user can also pin it on or off.
 */
export function LiteModeProvider({ children }: { children: ReactNode }) {
  const [preference, setPreferenceState] = useState<LiteModePreference>(() =>
    typeof window === "undefined" ? "auto" : readStoredPreference(),
  );
  const [network, setNetwork] = useState(() => readNetwork(connection()));

  useEffect(() => {
    const info = connection();
    if (!info) return;
    const read = () => setNetwork(readNetwork(info));
    info.addEventListener("change", read);
    return () => info.removeEventListener("change", read);
  }, []);

  const { slowConnection, effectiveType } = network;

  const lite = preference === "on" || (preference === "auto" && slowConnection);

  useEffect(() => {
    document.documentElement.toggleAttribute("data-lite", lite);
  }, [lite]);

  const setPreference = useCallback((next: LiteModePreference) => {
    setPreferenceState(next);
    try {
      window.localStorage.setItem(LITE_MODE_STORAGE_KEY, next);
    } catch {
      // Storage unavailable — the preference still applies for this session.
    }
  }, []);

  const toggle = useCallback(() => {
    setPreference(lite ? "off" : "on");
  }, [lite, setPreference]);

  return (
    <LiteModeContext.Provider
      value={{ preference, lite, slowConnection, effectiveType, setPreference, toggle }}
    >
      {children}
    </LiteModeContext.Provider>
  );
}

export function useLiteMode(): LiteModeContextValue {
  const context = useContext(LiteModeContext);
  if (!context) {
    throw new Error("useLiteMode must be used within a LiteModeProvider");
  }
  return context;
}
