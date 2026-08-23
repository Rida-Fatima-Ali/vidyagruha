import Image from "next/image";
import { cn } from "@/utils/cn";

export function Brand({ className, compact = false }: { className?: string; compact?: boolean }) {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <div className={cn("relative flex items-center", compact ? "h-7 w-28" : "h-8 w-36")}>
        <Image
          src="/vidyagruha-logo.jpg"
          alt="VidyaGruha"
          width={160}
          height={36}
          priority
          className="object-contain object-left h-full w-auto mix-blend-multiply"
        />
      </div>
    </div>
  );
}
