import { useMemo, useRef, useEffect, useId } from "react";
import { useCountUp } from "@/hooks/useCountUp";

interface DataPoint {
  label: string;
  value: number;
}

interface Props {
  label: string;
  data: DataPoint[];
  unit?: string;
  color?: string;
  height?: number;
  targetLine?: number;
  showArea?: boolean;
  animDelay?: number;
}

export default function KpiTrendChart({
  label,
  data,
  unit = "",
  color = "hsl(222 88% 65%)",
  height = 48,
  targetLine,
  showArea = true,
  animDelay = 0,
}: Props) {
  const uid = useId().replace(/:/g, "");
  const polyRef = useRef<SVGPolylineElement>(null);
  const areaRef = useRef<SVGPathElement>(null);

  const values = data.map(d => d.value);
  const minVal = Math.min(...values);
  const maxVal = Math.max(...values);
  const range = maxVal - minVal || 1;

  const padX = 2;
  const padY = 4;
  const w = 200;
  const h = height;

  const points = data.map((d, i) => {
    const x = padX + (i / (data.length - 1)) * (w - padX * 2);
    const y = padY + (1 - (d.value - minVal) / range) * (h - padY * 2);
    return { x, y, ...d };
  });

  const polyline = points.map(p => `${p.x},${p.y}`).join(" ");

  const areaPath = points.length > 1
    ? `M${points[0].x},${h} L${points.map(p => `${p.x},${p.y}`).join(" L")} L${points[points.length - 1].x},${h} Z`
    : "";

  const targetY = targetLine !== undefined
    ? padY + (1 - (targetLine - minVal) / range) * (h - padY * 2)
    : null;

  const latest = values[values.length - 1];
  const prev = values[values.length - 2] ?? latest;
  const trend = latest > prev ? "up" : latest < prev ? "down" : "flat";
  const delta = Math.abs(latest - prev);
  const trendColor = trend === "up" ? "hsl(160 56% 42%)" : trend === "down" ? "hsl(350 84% 62%)" : "hsl(38 92% 52%)";

  const displayValue = useCountUp(latest, { duration: 900, delay: animDelay, decimals: Number.isInteger(latest) ? 0 : 1 });

  useEffect(() => {
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) return;

    const el = polyRef.current;
    if (!el) return;

    const length = el.getTotalLength?.() ?? 300;
    el.style.strokeDasharray = String(length);
    el.style.strokeDashoffset = String(length);
    el.style.transition = "none";

    const timer = setTimeout(() => {
      el.style.transition = `stroke-dashoffset 1.1s cubic-bezier(0.4,0,0.2,1) ${animDelay}ms`;
      el.style.strokeDashoffset = "0";
    }, 50);

    if (areaRef.current) {
      areaRef.current.style.opacity = "0";
      setTimeout(() => {
        if (areaRef.current) {
          areaRef.current.style.transition = `opacity 0.8s ease ${animDelay + 600}ms`;
          areaRef.current.style.opacity = "1";
        }
      }, 50);
    }

    return () => clearTimeout(timer);
  }, [data, animDelay]);

  return (
    <div className="rounded-xl border p-4 flex flex-col gap-3"
      style={{ background: "hsl(var(--card))", borderColor: "hsl(var(--border))" }}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="section-label">{label}</div>
          <div className="text-2xl font-black font-mono leading-none mt-1" style={{ color }}>
            {displayValue}{unit}
          </div>
        </div>
        <div className="text-right">
          <div className="text-xs font-semibold" style={{ color: trendColor }}>
            {trend === "up" ? "↑" : trend === "down" ? "↓" : "→"} {delta > 0 ? `${delta.toFixed(1)}${unit}` : "Stable"}
          </div>
          <div className="text-[10px] text-muted-foreground mt-0.5">vs prior</div>
        </div>
      </div>

      <svg viewBox={`0 0 ${w} ${h}`} className="w-full overflow-visible" style={{ height }}>
        <defs>
          <linearGradient id={`grad_${uid}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.25" />
            <stop offset="100%" stopColor={color} stopOpacity="0.02" />
          </linearGradient>
        </defs>

        {showArea && areaPath && (
          <path ref={areaRef} d={areaPath} fill={`url(#grad_${uid})`} />
        )}

        {targetY !== null && (
          <line
            x1={padX} y1={targetY} x2={w - padX} y2={targetY}
            stroke="hsl(38 92% 52%)" strokeWidth="1" strokeDasharray="3 3" opacity="0.5"
          />
        )}

        <polyline
          ref={polyRef}
          points={polyline}
          fill="none"
          stroke={color}
          strokeWidth="1.5"
          strokeLinejoin="round"
          strokeLinecap="round"
        />

        {points.map((p, i) => (
          <circle
            key={i}
            cx={p.x} cy={p.y}
            r={i === points.length - 1 ? 3 : 2}
            fill={i === points.length - 1 ? color : "hsl(var(--card))"}
            stroke={color}
            strokeWidth="1.5"
            style={{
              opacity: 0,
              animation: `fadeIn 0.3s ease forwards`,
              animationDelay: `${animDelay + 900 + i * 40}ms`,
            }}
          />
        ))}
      </svg>

      <style>{`@keyframes fadeIn { from { opacity: 0; transform: scale(0.5); } to { opacity: 1; transform: scale(1); } }`}</style>

      <div className="flex justify-between">
        {data.map((d, i) => (
          <span key={i} className="text-[9px] text-muted-foreground">{d.label}</span>
        ))}
      </div>
    </div>
  );
}
