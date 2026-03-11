/**
 * DeltaPill — shows a score change vs prior period.
 * e.g. +3 or −7 with directional color coding.
 */
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface Props {
  delta: number;
  suffix?: string;
  size?: "xs" | "sm";
  className?: string;
}

export default function DeltaPill({ delta, suffix = "", size = "sm", className }: Props) {
  const isUp   = delta > 0;
  const isDown = delta < 0;
  const Icon   = isUp ? TrendingUp : isDown ? TrendingDown : Minus;

  const color = isUp
    ? "hsl(160 56% 44%)"
    : isDown
    ? "hsl(350 72% 56%)"
    : "hsl(38 90% 52%)";

  const bg = isUp
    ? "hsl(160 56% 44% / 0.12)"
    : isDown
    ? "hsl(350 72% 56% / 0.12)"
    : "hsl(38 90% 52% / 0.12)";

  const label = delta === 0
    ? "—"
    : `${isUp ? "+" : ""}${delta}${suffix}`;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-0.5 rounded-full font-bold font-mono",
        size === "xs" ? "text-[9px] px-1.5 py-0.5" : "text-[10px] px-2 py-0.5",
        className
      )}
      style={{ color, background: bg }}>
      <Icon className={size === "xs" ? "w-2.5 h-2.5" : "w-3 h-3"} />
      {label}
    </span>
  );
}
