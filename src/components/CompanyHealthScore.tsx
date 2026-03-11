import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface Dimension {
  label: string;
  score: number;
  weight: number;
}

interface Props {
  score: number;
  trend?: "Improving" | "Declining" | "Stable";
  dimensions?: Dimension[];
  size?: "sm" | "md" | "lg";
  showBreakdown?: boolean;
  className?: string;
}

function getScoreColor(score: number) {
  if (score >= 75) return { stroke: "hsl(160 56% 42%)", text: "hsl(160 56% 50%)", glow: "hsl(160 56% 42% / 0.3)", label: "Strong" };
  if (score >= 60) return { stroke: "hsl(222 88% 65%)", text: "hsl(222 88% 70%)", glow: "hsl(222 88% 65% / 0.3)", label: "Good" };
  if (score >= 45) return { stroke: "hsl(38 92% 52%)", text: "hsl(38 92% 58%)", glow: "hsl(38 92% 52% / 0.3)", label: "Developing" };
  return { stroke: "hsl(350 84% 62%)", text: "hsl(350 84% 68%)", glow: "hsl(350 84% 62% / 0.3)", label: "Needs Attention" };
}

const SIZES = {
  sm: { svgSize: 80, r: 30, stroke: 5, fontSize: "text-xl", subSize: "text-[9px]" },
  md: { svgSize: 120, r: 46, stroke: 7, fontSize: "text-3xl", subSize: "text-[10px]" },
  lg: { svgSize: 160, r: 62, stroke: 9, fontSize: "text-4xl", subSize: "text-xs" },
};

export default function CompanyHealthScore({
  score,
  trend = "Stable",
  dimensions = [],
  size = "lg",
  showBreakdown = true,
  className,
}: Props) {
  const [animatedScore, setAnimatedScore] = useState(0);
  const [dashOffset, setDashOffset] = useState(0);
  const rafRef = useRef<number | null>(null);

  const { svgSize, r, stroke, fontSize, subSize } = SIZES[size];
  const circumference = 2 * Math.PI * r;
  const colors = getScoreColor(score);

  useEffect(() => {
    let start: number | null = null;
    const duration = 1400;

    function animate(ts: number) {
      if (!start) start = ts;
      const elapsed = ts - start;
      const progress = Math.min(elapsed / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);

      const current = Math.round(ease * score);
      setAnimatedScore(current);
      setDashOffset(circumference * (1 - (ease * score) / 100));

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate);
      }
    }

    rafRef.current = requestAnimationFrame(animate);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [score, circumference]);

  const TrendIcon = trend === "Improving" ? TrendingUp : trend === "Declining" ? TrendingDown : Minus;
  const trendColor =
    trend === "Improving" ? "text-signal-green" :
    trend === "Declining" ? "text-rose" :
    "text-muted-foreground";

  return (
    <div className={cn("flex flex-col items-center gap-5", className)}>
      {/* Ring gauge */}
      <div className="relative" style={{ width: svgSize, height: svgSize }}>
        {/* Glow layer */}
        <div
          className="absolute inset-0 rounded-full blur-xl opacity-40 transition-all duration-1000"
          style={{ background: `radial-gradient(circle, ${colors.glow} 0%, transparent 70%)` }}
        />

        <svg
          width={svgSize}
          height={svgSize}
          viewBox={`0 0 ${svgSize} ${svgSize}`}
          style={{ transform: "rotate(-90deg)" }}>
          {/* Track */}
          <circle
            cx={svgSize / 2}
            cy={svgSize / 2}
            r={r}
            fill="none"
            stroke="hsl(224 16% 20%)"
            strokeWidth={stroke}
          />
          {/* Progress */}
          <circle
            cx={svgSize / 2}
            cy={svgSize / 2}
            r={r}
            fill="none"
            stroke={colors.stroke}
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            style={{
              transition: "stroke-dashoffset 0.1s linear",
              filter: `drop-shadow(0 0 6px ${colors.stroke})`
            }}
          />
        </svg>

        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span
            className={cn("font-black font-mono leading-none tracking-tight", fontSize)}
            style={{ color: colors.text }}>
            {animatedScore}
          </span>
          <span className={cn("text-muted-foreground font-medium mt-0.5", subSize)}>/ 100</span>
          <span className={cn("font-bold mt-0.5", subSize)} style={{ color: colors.text }}>
            {colors.label}
          </span>
        </div>
      </div>

      {/* Trend indicator */}
      <div className={cn("flex items-center gap-1.5 text-xs font-semibold", trendColor)}>
        <TrendIcon className="w-3.5 h-3.5" />
        <span>{trend}</span>
      </div>

      {/* Dimension breakdown */}
      {showBreakdown && dimensions.length > 0 && (
        <div className="w-full space-y-2.5">
          {dimensions.map(({ label, score: dimScore }) => {
            const c = getScoreColor(dimScore);
            return (
              <div key={label} className="flex items-center gap-3">
                <span className="text-[11px] text-muted-foreground w-28 flex-shrink-0 truncate">{label}</span>
                <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: "hsl(224 16% 20%)" }}>
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${dimScore}%`, background: c.stroke }}
                  />
                </div>
                <span className="text-[11px] font-mono font-semibold w-7 text-right" style={{ color: c.text }}>
                  {dimScore}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
