import { cn } from "@/lib/utils";
import { HTMLAttributes } from "react";

type Tone = "cyan" | "purple" | "green" | "red" | "yellow" | "gray";

const tones: Record<Tone, string> = {
  cyan: "bg-cyan/10 text-cyan border-cyan/30",
  purple: "bg-purple/10 text-purple-glow border-purple/30",
  green: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
  red: "bg-red-500/10 text-red-400 border-red-500/30",
  yellow: "bg-yellow-500/10 text-yellow-400 border-yellow-500/30",
  gray: "bg-gray-500/10 text-gray-400 border-gray-500/30",
};

export function Badge({
  className,
  tone = "gray",
  ...props
}: HTMLAttributes<HTMLSpanElement> & { tone?: Tone }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium",
        tones[tone],
        className
      )}
      {...props}
    />
  );
}
