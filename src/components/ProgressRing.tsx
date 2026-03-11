/**
 * ProgressRing — animated SVG circular progress ring.
 * Respects prefers-reduced-motion.
 */
import { useEffect, useRef } from "react";
import { useCountUp } from "@/hooks/useCountUp";
import { cn } from "@/lib/utils";

interface Props {
  value: number;
  max?: number;
  size?: number;
  strokeWidth?: number;
  label?: string;
  sublabel?: string;
  color?: string;
  trackColor?: string;
  animDelay?: number;
  className?: string;
  showValue?: boolean;
  valueSuffix?: string;
}

export default function ProgressRing({
  value,
  max = 100,
  size = 80,
  strokeWidth = 7,
  label,
  sublabel,
  color,
  trackColor,
  animDelay = 0,
  className,
  showValue = true,
  valueSuffix = "",
}: Props) {
  const pct = Math.min(Math.max(value / max, 0), 1);
  const r = (size - strokeWidth) / 2;
  const circ = 2 * Math.PI * r;
  const dashOffset = circ * (1 - pct);
  const circleRef = useRef<SVGCircleElement>(null);

  const autoColor = color ?? (
    pct >= 0.75 ? "hsl(160 56% 44%)"
    : pct >= 0.55 ? "hsl(38 90% 52%)"
    : "hsl(350 72% 56%)"
  );

  const trackCol = trackColor ?? "hsl(var(--muted))";
  const displayValue = useCountUp(value, { duration: 1000, delay: animDelay });

  useEffect(() => {
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const el = circleRef.current;
    if (!el || prefersReduced) return;

    el.style.strokeDasharray = String(circ);
    el.style.strokeDashoffset = String(circ);
    el.style.transition = "none";

    const timer = setTimeout(() => {
      el.style.transition = `stroke-dashoffset 1.1s cubic-bezier(0.4,0,0.2,1) ${animDelay}ms`;
      el.style.strokeDashoffset = String(dashOffset);
    }, 60);

    return () => clearTimeout(timer);
  }, [value, circ, dashOffset, animDelay]);

  return (
    <div className={cn("flex flex-col items-center gap-1.5", className)}>
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}
          style={{ transform: "rotate(-90deg)" }}>
          <circle
            cx={size / 2} cy={size / 2} r={r}
            fill="none" stroke={trackCol} strokeWidth={strokeWidth}
          />
          <circle
            ref={circleRef}
            cx={size / 2} cy={size / 2} r={r}
            fill="none" stroke={autoColor} strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circ}
            strokeDashoffset={dashOffset}
          />
        </svg>
        {showValue && (
          <div className="absolute inset-0 flex flex-col items-center justify-center"
            style={{ transform: "rotate(0deg)" }}>
            <span className="text-sm font-black font-mono leading-none" style={{ color: autoColor }}>
              {displayValue}{valueSuffix}
            </span>
          </div>
        )}
      </div>
      {label && <div className="text-[11px] font-bold text-foreground text-center leading-tight">{label}</div>}
      {sublabel && <div className="text-[10px] text-muted-foreground text-center">{sublabel}</div>}
    </div>
  );
}
