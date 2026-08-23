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
      : "h-10 sm:h-11 w-44 sm:w-52";

  return (
    <div className={cn("flex items-center", className)}>
      <div className={cn("relative flex items-center", heightClass)}>
        <Image
          src="/vidyagruha-logo.png"
          alt="VidyaGruha"
          width={280}
          height={70}
          priority
          className="object-contain object-left h-full w-auto"
        />
      </div>
    </div>
  );
}
