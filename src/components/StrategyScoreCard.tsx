import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import type { StrategyScore } from "@/hooks/useStrategyScores";

interface Props {
  score: StrategyScore;
}

export default function StrategyScoreCard({ score }: Props) {
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference - (score.value / 100) * circumference;

  return (
    <div className="rounded-2xl border flex flex-col items-center gap-3 p-5 relative overflow-hidden transition-all duration-200 hover:border-white/10"
      style={{ background: "hsl(var(--card))", borderColor: "hsl(var(--border))", boxShadow: "var(--shadow-card)" }}>
      <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: score.color }} />

      <div className="section-label text-center w-full">{score.label}</div>

      <div className="relative w-20 h-20">
        <svg width="80" height="80" viewBox="0 0 80 80" className="rotate-[-90deg]">
          <circle cx="40" cy="40" r={radius}
            strokeWidth="6"
            fill="none"
            stroke="hsl(224 16% 18%)"
          />
          <circle
            cx="40" cy="40" r={radius}
            strokeWidth="6"
            fill="none"
            stroke={score.color}
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            strokeLinecap="round"
            style={{ transition: "stroke-dashoffset 0.8s ease" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-black font-mono leading-none" style={{ color: score.color }}>
            {score.value}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-1.5">
        {score.trend === "up" && <TrendingUp className="w-3.5 h-3.5" style={{ color: "hsl(160 56% 42%)" }} />}
        {score.trend === "down" && <TrendingDown className="w-3.5 h-3.5" style={{ color: "hsl(350 84% 62%)" }} />}
        {score.trend === "flat" && <Minus className="w-3.5 h-3.5" style={{ color: "hsl(0 0% 100% / 0.35)" }} />}
        <span className="text-xs font-semibold" style={{
          color: score.trend === "up" ? "hsl(160 56% 42%)" : score.trend === "down" ? "hsl(350 84% 62%)" : "hsl(0 0% 100% / 0.35)"
        }}>
          {score.trend === "flat" ? "Stable" : `${score.trend === "up" ? "+" : "-"}${score.trendDelta}%`}
        </span>
      </div>

      <p className="text-[10px] text-center leading-relaxed" style={{ color: "hsl(0 0% 100% / 0.38)" }}>
        {score.description}
      </p>
    </div>
  );
}
