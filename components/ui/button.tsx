import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "@/utils/cn";

const variants = {
  default:
    "bg-primary text-primary-foreground hover:bg-primary/92 active:bg-primary active:translate-y-[0.5px]",
  accent: "bg-primary text-primary-foreground hover:bg-primary/92",
  secondary:
    "bg-secondary text-secondary-foreground ring-1 ring-inset ring-border hover:bg-accent active:translate-y-[0.5px]",
  outline:
    "border border-border bg-transparent text-foreground hover:border-primary/35 hover:text-primary hover:bg-primary/[0.04] active:translate-y-[0.5px]",
  ghost:
    "text-muted-foreground hover:bg-surface-2 hover:text-foreground active:bg-surface-3/70",
  destructive:
    "bg-destructive text-destructive-foreground hover:bg-destructive/92 active:translate-y-[0.5px]",
  success:
    "bg-success text-success-foreground hover:bg-success/92 active:translate-y-[0.5px]",
} as const;

const sizes = {
  sm: "h-8 rounded-lg px-3 text-sm",
  default: "h-10 rounded-lg px-4 text-sm",
  lg: "h-11 rounded-xl px-5 text-base",
  icon: "h-10 w-10 rounded-lg",
} as const;

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: keyof typeof variants;
  size?: keyof typeof sizes;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", type = "button", ...props }, ref) => (
    <button
      ref={ref}
      type={type}
      className={cn(
        "inline-flex select-none items-center justify-center gap-2 font-medium transition-all duration-200 ease-spatial disabled:pointer-events-none disabled:opacity-45",
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    />
  ),
);

Button.displayName = "Button";
