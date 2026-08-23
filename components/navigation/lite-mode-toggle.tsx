"use client";

import { Gauge, Signal, SignalLow } from "lucide-react";
import { useLiteMode } from "@/components/provider/lite-mode-provider";
import { Button } from "@/components/ui/button";
import { cn } from "@/utils/cn";

/**
 * Low-bandwidth toggle. Shows a warning tint when the browser reports a slow
 * connection so lite mode is discoverable exactly when it matters.
 */
export function LiteModeToggle() {
  const { lite, slowConnection, effectiveType, toggle } = useLiteMode();
  const Icon = lite ? SignalLow : slowConnection ? Signal : Gauge;
  const label = lite
    ? "Turn off low-bandwidth mode"
    : slowConnection
      ? `Slow connection${effectiveType ? ` (${effectiveType})` : ""} — turn on low-bandwidth mode`
      : "Turn on low-bandwidth mode";

  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label={label}
      aria-pressed={lite}
      title={label}
      onClick={toggle}
      className={cn(
        lite && "text-success",
        !lite && slowConnection && "text-warning",
      )}
    >
      <Icon className="h-5 w-5" aria-hidden="true" />
    </Button>
  );
}
