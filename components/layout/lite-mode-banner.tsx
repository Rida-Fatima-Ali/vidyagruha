"use client";

import { SignalLow } from "lucide-react";
import { useLiteMode } from "@/components/provider/lite-mode-provider";

/** Explains why the UI looks stripped down, and offers a one-click way out. */
export function LiteModeBanner() {
  const { lite, preference, slowConnection, effectiveType, setPreference } = useLiteMode();
  if (!lite) return null;

  const auto = preference === "auto" && slowConnection;

  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 border-b border-warning/25 bg-warning/10 px-4 py-2 text-xs text-warning sm:px-6 lg:px-8">
      <SignalLow className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
      <p className="min-w-0 flex-1">
        Low-bandwidth mode{auto ? " on automatically" : " on"}
        {auto && effectiveType ? ` — your connection reports ${effectiveType}` : ""}. Images,
        blur and animations are off; text loads first.
      </p>
      <button
        type="button"
        onClick={() => setPreference("off")}
        className="font-medium underline underline-offset-2"
      >
        Load full experience
      </button>
    </div>
  );
}
