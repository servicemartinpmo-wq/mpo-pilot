import { useState, useRef, useEffect } from "react";
import { Info, X, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils";
import { explainScore, getContextMultipliers, buildOrgContext, getNeutralContext } from "@/lib/engine/contextEngine";
import type { OrgContext, ScoreExplanation } from "@/lib/engine/contextEngine";
import { loadProfile } from "@/lib/companyStore";

interface Props {
  metricName: string;
  rawScore: number;
  className?: string;
  variant?: "light" | "dark";
  size?: "sm" | "md";
}

function getOrgContext(): OrgContext {
  try {
    const profile = loadProfile();
    if (profile.onboardingComplete) return buildOrgContext(profile);
  } catch {
    // ignore — fall through to neutral context
  }
  return getNeutralContext();
}

const positionColors: Record<ScoreExplanation["stagePosition"], string> = {
  "Excellent": "hsl(160 56% 44%)",
  "Above Stage": "hsl(160 56% 44%)",
  "At Stage": "hsl(38 90% 52%)",
  "Below Stage": "hsl(350 72% 56%)",
};

const positionIcons: Record<ScoreExplanation["stagePosition"], typeof TrendingUp> = {
  "Excellent": TrendingUp,
  "Above Stage": TrendingUp,
  "At Stage": Minus,
  "Below Stage": TrendingDown,
};

export default function ScoreExplainer({ metricName, rawScore, className, variant = "light", size = "sm" }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const ctx = getOrgContext();

  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  if (!rawScore) return null;

  const explanation = explainScore(metricName, rawScore, ctx);
  const multi = getContextMultipliers(ctx);
  const Icon = positionIcons[explanation.stagePosition];
  const color = positionColors[explanation.stagePosition];
  const isDark = variant === "dark";

  return (
    <div className={cn("relative inline-flex", className)} ref={ref}>
      <button
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); setOpen(!open); }}
        className={cn(
          "rounded-full transition-all flex items-center justify-center min-w-[20px] min-h-[20px]",
          size === "sm" ? "w-[16px] h-[16px]" : "w-[20px] h-[20px]",
          isDark ? "hover:bg-white/10" : "hover:bg-black/5",
        )}
        title="Why this score?"
        aria-label="Score explanation"
      >
        <Info className={cn(
          size === "sm" ? "w-3 h-3" : "w-3.5 h-3.5",
          isDark ? "text-white/40 hover:text-white/70" : "text-muted-foreground/50 hover:text-muted-foreground",
        )} />
      </button>

      {open && (
        <div
          className={cn(
            "absolute z-[200] rounded-xl shadow-2xl border p-4 min-w-[320px] max-w-[380px]",
            "animate-in fade-in-0 zoom-in-95 duration-150",
            isDark
              ? "bg-[hsl(222_32%_12%)] border-white/10 text-white"
              : "bg-white border-border text-foreground",
            size === "sm" ? "top-6 right-0" : "top-7 right-0",
          )}
          style={{ pointerEvents: "auto" }}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Icon className="w-4 h-4" style={{ color }} />
              <span className="text-xs font-bold uppercase tracking-wide" style={{ color }}>
                {explanation.stagePosition}
              </span>
            </div>
            <button onClick={() => setOpen(false)} className="p-0.5 rounded hover:bg-black/5">
              <X className={cn("w-3.5 h-3.5", isDark ? "text-white/40" : "text-muted-foreground")} />
            </button>
          </div>

          <p className={cn(
            "text-[12px] leading-relaxed mb-3",
            isDark ? "text-white/70" : "text-muted-foreground",
          )}>
            {explanation.summary}
          </p>

          {explanation.contextAdjustments.length > 0 && (
            <div className={cn(
              "rounded-lg p-2.5 mb-3",
              isDark ? "bg-white/5" : "bg-muted/50",
            )}>
              <span className={cn(
                "text-[10px] font-semibold uppercase tracking-wider block mb-1.5",
                isDark ? "text-white/40" : "text-muted-foreground/60",
              )}>
                Context Adjustments
              </span>
              {explanation.contextAdjustments.map((adj, i) => (
                <p key={i} className={cn(
                  "text-[11px] leading-snug",
                  i > 0 && "mt-1",
                  isDark ? "text-white/55" : "text-muted-foreground/80",
                )}>
                  {adj}
                </p>
              ))}
            </div>
          )}

          <div className={cn(
            "rounded-lg p-2.5",
            isDark ? "bg-white/5" : "bg-muted/50",
          )}>
            <span className={cn(
              "text-[10px] font-semibold uppercase tracking-wider block mb-1.5",
              isDark ? "text-white/40" : "text-muted-foreground/60",
            )}>
              Stage Benchmark
            </span>
            <div className="flex items-center gap-3">
              <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: isDark ? "hsl(0 0% 100% / 0.08)" : "hsl(0 0% 0% / 0.06)" }}>
                <div className="h-full rounded-full transition-all" style={{
                  width: `${Math.min(100, (rawScore / multi.stageNormal.high) * 100)}%`,
                  background: color,
                }} />
              </div>
              <span className={cn(
                "text-[10px] font-mono font-bold",
                isDark ? "text-white/50" : "text-muted-foreground",
              )}>
                {multi.stageNormal.low}–{multi.stageNormal.high}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
