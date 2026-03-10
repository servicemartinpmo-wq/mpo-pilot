import { cn } from "@/lib/utils";
import type { SignalLevel, MaturityTier } from "@/lib/pmoData";

interface ScoreBadgeProps {
  score: number;
  signal: SignalLevel;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
}

const signalClasses: Record<SignalLevel, string> = {
  red: "text-signal-red bg-signal-red/10 border-signal-red/30",
  yellow: "text-signal-yellow bg-signal-yellow/10 border-signal-yellow/30",
  green: "text-signal-green bg-signal-green/10 border-signal-green/30",
  blue: "text-electric-blue bg-electric-blue/10 border-electric-blue/30",
};

const barClasses: Record<SignalLevel, string> = {
  red: "bg-signal-red",
  yellow: "bg-signal-yellow",
  green: "bg-signal-green",
  blue: "bg-electric-blue",
};

export function ScoreBadge({ score, signal, size = "md", showLabel = false }: ScoreBadgeProps) {
  const sizeClass = size === "sm" ? "text-xs px-1.5 py-0.5" : size === "lg" ? "text-lg px-3 py-1" : "text-sm px-2 py-0.5";
  return (
    <span className={cn("rounded border font-mono font-semibold", sizeClass, signalClasses[signal])}>
      {score}
      {showLabel && <span className="text-xs font-normal ml-0.5 opacity-70">/100</span>}
    </span>
  );
}

interface ScoreBarProps {
  value: number;
  signal: SignalLevel;
  label?: string;
  showValue?: boolean;
}

export function ScoreBar({ value, signal, label, showValue = true }: ScoreBarProps) {
  return (
    <div className="space-y-1">
      {(label || showValue) && (
        <div className="flex items-center justify-between">
          {label && <span className="text-xs text-muted-foreground">{label}</span>}
          {showValue && (
            <span className={cn("text-xs font-mono font-semibold", signalClasses[signal].split(" ")[0])}>
              {value}%
            </span>
          )}
        </div>
      )}
      <div className="score-bar-track">
        <div
          className={cn("h-full rounded-full transition-all duration-700", barClasses[signal])}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}

interface MaturityBadgeProps {
  tier: MaturityTier;
  score: number;
}

const maturityStyles: Record<MaturityTier, { bg: string; text: string; dot: string }> = {
  Foundational: { bg: "bg-signal-red/10", text: "text-signal-red", dot: "bg-signal-red" },
  Developing: { bg: "bg-signal-yellow/10", text: "text-signal-yellow", dot: "bg-signal-yellow" },
  Structured: { bg: "bg-teal/10", text: "text-teal", dot: "bg-teal" },
  Managed: { bg: "bg-electric-blue/10", text: "text-electric-blue", dot: "bg-electric-blue" },
  Optimized: { bg: "bg-signal-green/10", text: "text-signal-green", dot: "bg-signal-green" },
};

export function MaturityBadge({ tier, score }: MaturityBadgeProps) {
  const styles = maturityStyles[tier];
  return (
    <span className={cn("inline-flex items-center gap-1.5 text-xs font-medium px-2 py-0.5 rounded-full", styles.bg, styles.text)}>
      <span className={cn("w-1.5 h-1.5 rounded-full", styles.dot)} />
      {tier}
      <span className="font-mono opacity-70">· {score}</span>
    </span>
  );
}

interface SignalDotProps {
  signal: SignalLevel;
  pulse?: boolean;
}

export function SignalDot({ signal, pulse = false }: SignalDotProps) {
  const colors: Record<SignalLevel, string> = {
    red: "bg-signal-red",
    yellow: "bg-signal-yellow",
    green: "bg-signal-green",
    blue: "bg-electric-blue",
  };
  return (
    <span className="relative inline-flex h-2.5 w-2.5">
      {pulse && (
        <span className={cn("animate-ping absolute inline-flex h-full w-full rounded-full opacity-60", colors[signal])} />
      )}
      <span className={cn("relative inline-flex rounded-full h-2.5 w-2.5", colors[signal])} />
    </span>
  );
}
