"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, CircleAlert, Info, X, XCircle } from "lucide-react";
import { cn } from "@/utils/cn";

export type ToastTone = "default" | "success" | "destructive" | "warning" | "info";

export interface ToastAction {
  label: string;
  onClick: () => void;
}

export interface ToastOptions {
  title: string;
  description?: string;
  tone?: ToastTone;
  /** Auto-dismiss delay in ms (default 4000). */
  duration?: number;
  /** Inline action button — shown with a countdown while the toast is alive. */
  action?: ToastAction;
}

interface ToastItem {
  id: string;
  title: string;
  description?: string;
  tone: ToastTone;
  action?: ToastAction;
  duration: number;
  createdAt: number;
}

const TONE_ICON = {
  default: Info,
  success: CheckCircle2,
  destructive: XCircle,
  warning: CircleAlert,
  info: Info,
} as const;

const TONE_ACCENT: Record<ToastTone, string> = {
  default: "text-muted-foreground",
  success: "text-success",
  destructive: "text-destructive",
  warning: "text-warning",
  info: "text-info",
};

interface ToastContextValue {
  toast: (options: ToastOptions) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);
  const counter = useRef(0);

  const dismiss = useCallback((id: string) => {
    setItems((current) => current.filter((item) => item.id !== id));
  }, []);

  const toast = useCallback(
    (options: ToastOptions) => {
      const id = `toast-${++counter.current}`;
      const duration = options.duration ?? 4000;
      setItems((current) => [
        ...current,
        {
          id,
          title: options.title,
          description: options.description,
          tone: options.tone ?? "default",
          action: options.action,
          duration,
          createdAt: Date.now(),
        },
      ]);
      window.setTimeout(() => dismiss(id), duration);
    },
    [dismiss],
  );

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div
        aria-live="polite"
        className="pointer-events-none fixed inset-x-0 bottom-4 z-[60] flex flex-col items-center gap-2 px-4 sm:items-end sm:pr-6"
      >
        <AnimatePresence>
          {items.map((item) => {
            const Icon = TONE_ICON[item.tone];
            return (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, y: 16, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.96 }}
                transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                className="glass-strong pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-xl border border-border px-4 py-3.5 shadow-float"
                role="status"
              >
                <Icon
                  className={cn("mt-0.5 h-4 w-4 shrink-0", TONE_ACCENT[item.tone])}
                  aria-hidden="true"
                />
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-medium text-foreground">
                    {item.title}
                  </span>
                  {item.description ? (
                    <span className="mt-0.5 block text-xs text-muted-foreground">
                      {item.description}
                    </span>
                  ) : null}
                  {item.action ? (
                    <ToastActionButton
                      action={item.action}
                      duration={item.duration}
                      createdAt={item.createdAt}
                      onDone={() => dismiss(item.id)}
                    />
                  ) : null}
                </span>
                <button
                  type="button"
                  onClick={() => dismiss(item.id)}
                  aria-label="Dismiss notification"
                  className="shrink-0 rounded-md p-0.5 text-muted-foreground transition-colors hover:text-foreground"
                >
                  <X className="h-4 w-4" aria-hidden="true" />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

/** Action button with a Gmail-style countdown of the remaining window. */
function ToastActionButton({
  action,
  duration,
  createdAt,
  onDone,
}: {
  action: ToastAction;
  duration: number;
  createdAt: number;
  onDone: () => void;
}) {
  const [left, setLeft] = useState(duration);

  useEffect(() => {
    const tick = () => setLeft(Math.max(0, createdAt + duration - Date.now()));
    tick();
    const timer = window.setInterval(tick, 200);
    return () => window.clearInterval(timer);
  }, [createdAt, duration]);

  const remaining = Math.ceil(left / 1000);
  const progress = Math.max(0, Math.min(1, left / duration));

  return (
    <span className="mt-2 flex items-center gap-2.5">
      <button
        type="button"
        onClick={() => {
          action.onClick();
          onDone();
        }}
        className="rounded-md bg-surface-2 px-2.5 py-1 text-xs font-semibold text-foreground ring-1 ring-inset ring-border transition-colors hover:bg-surface-3"
      >
        {action.label}
      </button>
      <span className="tabular text-xs text-muted-foreground">{remaining}s</span>
      <span className="h-1 min-w-0 flex-1 overflow-hidden rounded-full bg-surface-3" aria-hidden="true">
        <span
          className="block h-full rounded-full bg-primary transition-[width] duration-200 ease-linear"
          style={{ width: `${progress * 100}%` }}
        />
      </span>
    </span>
  );
}

export function useToast(): ToastContextValue {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}
