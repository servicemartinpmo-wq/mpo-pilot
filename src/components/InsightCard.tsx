import { cn } from "@/lib/utils";
import type { Insight } from "@/lib/pmoData";
import { ScoreBadge, SignalDot } from "./ScoreBadge";
import { ChevronDown, ChevronUp, Lightbulb, Stethoscope, Target, Wrench } from "lucide-react";
import { useState } from "react";

const frameworkLabels: Record<string, string> = {
  Porter: "Porter",
  Rumelt: "Rumelt",
  BSC: "Balanced Scorecard",
  OKR: "OKRs",
  Lean: "Lean",
  "Six Sigma": "Six Sigma",
  TOC: "Theory of Constraints",
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
      "bg-card rounded-lg border shadow-card transition-all duration-200 overflow-hidden",
      expanded ? "shadow-elevated" : ""
    )}>
      {/* Header */}
      <div className="p-4 flex items-start gap-3">
        {/* Rank */}
        <div className="flex-shrink-0 w-7 h-7 rounded flex items-center justify-center text-xs font-bold font-mono"
          style={{ background: "hsl(var(--muted))", color: "hsl(var(--muted-foreground))" }}>
          {rank}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1.5">
            <SignalDot signal={insight.signal} pulse={insight.signal === "red"} />
            <span className={cn("text-xs font-medium px-1.5 py-0.5 rounded border", insightTypeColors[insight.type] || "text-muted-foreground bg-muted border-border")}>
              {insight.type}
            </span>
            <span className="text-xs text-muted-foreground font-medium">{insight.department}</span>
            <span className="ml-auto text-xs text-muted-foreground">{insight.createdAt}</span>
          </div>
          <p className="text-sm font-medium text-foreground leading-snug line-clamp-2">
            {insight.situation}
          </p>
          <div className="flex items-center gap-3 mt-2">
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-muted-foreground">Priority</span>
              <ScoreBadge score={insight.executivePriorityScore} signal={insight.signal} size="sm" />
            </div>
            <span className="text-xs px-1.5 py-0.5 rounded border border-border text-muted-foreground bg-secondary font-medium">
              {frameworkLabels[insight.framework]}
            </span>
          </div>
        </div>

        {/* Expand toggle */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex-shrink-0 p-1.5 rounded hover:bg-secondary transition-colors"
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
          <div key={label} className="space-y-0.5">
            <div className="flex justify-between items-center">
              <span className="text-xs text-muted-foreground">{label}</span>
              <span className="text-xs font-mono">{value}</span>
            </div>
            <div className="h-1 rounded-full bg-muted overflow-hidden">
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
        <div className="border-t divide-y animate-fade-in">
          {[
            {
              icon: <Stethoscope className="w-3.5 h-3.5" />,
              label: "Diagnosis",
              content: insight.diagnosis,
              color: "text-signal-yellow",
            },
            {
              icon: <Target className="w-3.5 h-3.5" />,
              label: "Recommendation",
              content: insight.recommendation,
              color: "text-signal-green",
            },
            {
              icon: <Wrench className="w-3.5 h-3.5" />,
              label: "System Remedy",
              content: insight.systemRemedy,
              color: "text-electric-blue",
            },
          ].map(({ icon, label, content, color }) => (
            <div key={label} className="p-4">
              <div className={cn("flex items-center gap-1.5 text-xs font-semibold mb-1.5 uppercase tracking-wide", color)}>
                {icon}
                {label}
              </div>
              <p className="text-sm text-foreground/80 leading-relaxed">{content}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
