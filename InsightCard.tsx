import { cn } from "@/lib/utils";
import type { Insight } from "@/lib/pmoData";
import { ScoreBadge, SignalDot } from "./ScoreBadge";
import { ChevronDown, ChevronUp, Stethoscope, Target, Wrench } from "lucide-react";
import { useState } from "react";

// User-friendly type labels — no internal/backend terminology
const typeLabels: Record<string, string> = {
  "Risk Escalation": "Risk",
  "Strategic Misalignment": "Misalignment",
  "Capacity Constraint": "Capacity",
  "Dependency Bottleneck": "Bottleneck",
  "Performance Anomaly": "Performance",
  "Execution Delay": "Delay",
};

const insightTypeColors: Record<string, string> = {
  "Risk Escalation": "text-signal-red bg-signal-red/8 border-signal-red/25",
  "Strategic Misalignment": "text-signal-red bg-signal-red/8 border-signal-red/25",
  "Capacity Constraint": "text-signal-yellow bg-signal-yellow/8 border-signal-yellow/25",
  "Dependency Bottleneck": "text-signal-yellow bg-signal-yellow/8 border-signal-yellow/25",
  "Performance Anomaly": "text-signal-yellow bg-signal-yellow/8 border-signal-yellow/25",
  "Execution Delay": "text-electric-blue bg-electric-blue/8 border-electric-blue/25",
};

interface InsightCardProps {
  insight: Insight;
  rank: number;
}

export default function InsightCard({ insight, rank }: InsightCardProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className={cn(
      "bg-card rounded-xl border-2 border-border transition-all duration-200 overflow-hidden",
      expanded ? "shadow-elevated border-electric-blue/30" : "shadow-card"
    )}>
      {/* Left accent bar based on signal */}
      <div className="flex">
        <div className={cn("w-1 flex-shrink-0 rounded-l-xl",
          insight.signal === "red" ? "bg-signal-red" :
          insight.signal === "yellow" ? "bg-signal-yellow" :
          insight.signal === "green" ? "bg-signal-green" : "bg-electric-blue"
        )} />
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="p-4 flex items-start gap-3">
            <div className="flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold font-mono border border-border bg-secondary text-muted-foreground">
              {rank}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1.5">
                <SignalDot signal={insight.signal} pulse={insight.signal === "red"} />
                <span className={cn("text-xs font-semibold px-2 py-0.5 rounded-full border", insightTypeColors[insight.type] || "text-muted-foreground bg-muted border-border")}>
                  {typeLabels[insight.type] || insight.type}
                </span>
                <span className="text-xs text-muted-foreground font-medium">{insight.department}</span>
                <span className="ml-auto text-xs text-muted-foreground">{insight.createdAt}</span>
              </div>
              <p className="text-sm font-medium text-foreground leading-snug line-clamp-2">
                {insight.situation}
              </p>
              <div className="flex items-center gap-3 mt-2">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-muted-foreground">Priority Score</span>
                  <ScoreBadge score={insight.executivePriorityScore} signal={insight.signal} size="sm" />
                </div>
              </div>
            </div>
            <button
              onClick={() => setExpanded(!expanded)}
              className="flex-shrink-0 p-1.5 rounded-lg hover:bg-secondary border border-border transition-colors"
            >
              {expanded
                ? <ChevronUp className="w-4 h-4 text-muted-foreground" />
                : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
            </button>
          </div>

          {/* Score mini-bars */}
          <div className="px-4 pb-3 grid grid-cols-4 gap-3">
            {[
              { label: "Impact", value: insight.strategicImpact },
              { label: "Urgency", value: insight.urgency },
              { label: "Risk", value: insight.operationalRisk },
              { label: "Leverage", value: insight.leverage },
            ].map(({ label, value }) => (
              <div key={label} className="space-y-1">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-muted-foreground">{label}</span>
                  <span className="text-xs font-mono text-foreground">{value}</span>
                </div>
                <div className="h-1.5 rounded-full bg-secondary overflow-hidden border border-border">
                  <div
                    className={cn("h-full rounded-full", value >= 80 ? "bg-electric-blue" : value >= 60 ? "bg-teal" : value >= 40 ? "bg-signal-yellow" : "bg-signal-red")}
                    style={{ width: `${value}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Expanded detail */}
          {expanded && (
            <div className="border-t-2 border-border divide-y-2 divide-border animate-fade-in">
              {[
                { icon: <Stethoscope className="w-3.5 h-3.5" />, label: "What's Wrong", content: insight.diagnosis, color: "text-signal-yellow" },
                { icon: <Target className="w-3.5 h-3.5" />, label: "What to Do", content: insight.recommendation, color: "text-signal-green" },
                { icon: <Wrench className="w-3.5 h-3.5" />, label: "Long-Term Fix", content: insight.systemRemedy, color: "text-electric-blue" },
              ].map(({ icon, label, content, color }) => (
                <div key={label} className="p-4">
                  <div className={cn("flex items-center gap-1.5 text-xs font-bold mb-1.5 uppercase tracking-wide", color)}>
                    {icon}{label}
                  </div>
                  <p className="text-sm text-foreground/80 leading-relaxed">{content}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
