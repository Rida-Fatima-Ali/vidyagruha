"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

interface BandwidthContextType {
  lowBandwidth: boolean;
  setLowBandwidth: (val: boolean) => void;
}

const BandwidthContext = createContext<BandwidthContextType | undefined>(undefined);

const STORAGE_KEY = "campusone_bandwidth_mode";

export function BandwidthProvider({ children }: { children: ReactNode }) {
  const [lowBandwidth, setLowBandwidthState] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored === "true") {
        setLowBandwidthState(true);
      } else if (stored === null && typeof navigator !== "undefined") {
        // Auto-detect poor connection if supported
        const conn = (navigator as any).connection;
        if (conn && (conn.saveData || conn.effectiveType === "2g" || conn.effectiveType === "3g")) {
          setLowBandwidthState(true);
        }
      }
    } catch {
      // Ignore
    }
  }, []);

  const setLowBandwidth = (val: boolean) => {
    setLowBandwidthState(val);
    try {
      localStorage.setItem(STORAGE_KEY, String(val));
    } catch {
      // Ignore
    }
  };

  useEffect(() => {
    if (lowBandwidth) {
      document.documentElement.classList.add("low-bandwidth");
    } else {
      document.documentElement.classList.remove("low-bandwidth");
    }
  }, [lowBandwidth]);

  return (
    <BandwidthContext.Provider value={{ lowBandwidth, setLowBandwidth }}>
      {children}
    </BandwidthContext.Provider>
  );
}

export function useBandwidth() {
  const context = useContext(BandwidthContext);
  if (!context) {
    throw new Error("useBandwidth must be used within BandwidthProvider");
  }
  return context;
}
