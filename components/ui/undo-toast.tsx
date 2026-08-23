"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, RotateCcw } from "lucide-react";
import { cn } from "@/utils/cn";

interface UndoToastProps {
  message: string;
  onUndo: () => void;
  onExpire: () => void;
  duration?: number; // seconds
}

export function UndoToast({ message, onUndo, onExpire, duration = 6 }: UndoToastProps) {
  const [countdown, setCountdown] = useState(duration);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const expiredRef = useRef(false);

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          if (!expiredRef.current) {
            expiredRef.current = true;
            onExpire();
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [onExpire]);

  function handleUndo() {
    if (timerRef.current) clearInterval(timerRef.current);
    expiredRef.current = true;
    onUndo();
  }

  return (
    <div className="flex items-center gap-3 pl-4 pr-2 py-2.5 rounded-xl border border-border bg-card shadow-lifted min-w-[280px] max-w-xs">
      <CheckCircle2 className="h-4 w-4 text-success shrink-0" aria-hidden="true" />
      <p className="flex-1 text-sm font-medium leading-snug">{message}</p>
      <div className="flex items-center gap-1 shrink-0">
        <button
          onClick={handleUndo}
          className="flex items-center gap-1 text-sm font-medium text-primary hover:underline focus-visible:outline-none focus-visible:underline transition-colors"
          aria-label="Undo attendance"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Undo
        </button>
        <span
          className={cn(
            "tabular ml-1 flex h-5 w-5 items-center justify-center rounded-full text-[11px] font-semibold",
            countdown <= 2
              ? "bg-destructive/15 text-destructive"
              : "bg-muted text-muted-foreground",
          )}
          aria-live="polite"
          aria-label={`${countdown} seconds remaining`}
        >
          {countdown}
        </span>
      </div>
      {/* Progress bar */}
      <div
        className="absolute bottom-0 left-0 right-0 h-0.5 rounded-b-xl bg-primary/25 overflow-hidden"
      >
        <div
          className="h-full bg-primary transition-none"
          style={{ width: `${(countdown / duration) * 100}%`, transition: "width 1s linear" }}
        />
      </div>
    </div>
  );
}

interface AttendanceUndoPortalProps {
  message: string | null;
  onUndo: () => void;
  onExpire: () => void;
}

export function AttendanceUndoPortal({ message, onUndo, onExpire }: AttendanceUndoPortalProps) {
  return (
    <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-[60] pointer-events-none">
      <AnimatePresence>
        {message && (
          <motion.div
            key={message}
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.95 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="pointer-events-auto relative"
          >
            <UndoToast message={message} onUndo={onUndo} onExpire={onExpire} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
