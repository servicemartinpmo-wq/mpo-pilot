/**
 * MiniSparkline — inline 40×20px trend sparkline for use inside tables.
 * Draws on mount with a stroke animation.
 */
import { useRef, useEffect, useId } from "react";

interface Props {
  values: number[];
  color?: string;
  width?: number;
  height?: number;
}

export default function MiniSparkline({ values, color = "hsl(222 88% 62%)", width = 48, height = 20 }: Props) {
  const polyRef = useRef<SVGPolylineElement>(null);
  const uid = useId().replace(/:/g, "");

  if (!values || values.length < 2) return null;

  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const pad = 2;

  const pts = values.map((v, i) => {
    const x = pad + (i / (values.length - 1)) * (width - pad * 2);
    const y = pad + (1 - (v - min) / range) * (height - pad * 2);
    return `${x},${y}`;
  }).join(" ");

  const trend = values[values.length - 1] > values[0] ? "up" : values[values.length - 1] < values[0] ? "down" : "flat";
  const autoColor = color === "auto"
    ? trend === "up" ? "hsl(160 56% 44%)" : trend === "down" ? "hsl(350 72% 56%)" : "hsl(38 90% 52%)"
    : color;

  useEffect(() => {
    const el = polyRef.current;
    if (!el) return;
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) return;
    const len = el.getTotalLength?.() ?? 100;
    el.style.strokeDasharray = String(len);
    el.style.strokeDashoffset = String(len);
    el.style.transition = "none";
    requestAnimationFrame(() => {
      el.style.transition = "stroke-dashoffset 0.8s cubic-bezier(0.4,0,0.2,1)";
      el.style.strokeDashoffset = "0";
    });
  }, [values.join(",")]);

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="inline-block flex-shrink-0">
      <defs>
        <linearGradient id={`sg_${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={autoColor} stopOpacity="0.18" />
          <stop offset="100%" stopColor={autoColor} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polyline ref={polyRef} points={pts} fill="none" stroke={autoColor} strokeWidth="1.5"
        strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}
