import Image from "next/image";
import { cn } from "@/utils/cn";

export function Brand({
  className,
  compact = false,
  size = "normal",
}: {
  className?: string;
  compact?: boolean;
  size?: "small" | "normal" | "large";
}) {
  const heightClass =
    size === "large"
      ? "h-14 sm:h-16 w-56 sm:w-64"
      : compact || size === "small"
      ? "h-8 sm:h-9 w-36 sm:w-44"
      : "h-11 sm:h-12 w-48 sm:w-56";

  return (
    <div className={cn("flex items-center", className)}>
      <div className={cn("relative flex items-center", heightClass)}>
        <Image
          src="/vidyagruha-logo.jpg"
          alt="VidyaGruha"
          width={280}
          height={70}
          priority
          className="object-contain object-left h-full w-auto mix-blend-multiply transition-transform duration-200"
        />
      </div>
    </div>
  );
}
