import { cn } from "@/lib/utils";
import type { Insight } from "@/lib/pmoData";
import { ScoreBadge, SignalDot } from "./ScoreBadge";
import { ChevronDown, ChevronUp, Stethoscope, Target, Wrench, Eye } from "lucide-react";
import { useState } from "react";

const typeLabels: Record<string, string> = {
  "Risk Escalation":        "Risk Escalation",
  "Strategic Misalignment": "Strategic Misalignment",
  "Capacity Constraint":    "Capacity Constraint",
  "Dependency Bottleneck":  "Dependency Bottleneck",
  "Performance Anomaly":    "Performance Anomaly",
  "Execution Delay":        "Execution Delay",
};

// Plain-language names shown instead of technical framework labels
const FRAMEWORK_LABELS: Record<string, string> = {
  "SWOT Analysis":                "Strategic Position",
  "SWOT":                         "Strategic Position",
  "Porter Analysis":              "Competitive Position",
  "Porter's Five Forces":         "Competitive Position",
  "Porter Competitive Strategy":  "Competitive Position",
  "McKinsey 7S":                  "Organizational Alignment",
  "McKinsey 7-S":                 "Organizational Alignment",
  "BCG Matrix":                   "Portfolio Balance",
  "BCG Growth-Share Matrix":      "Portfolio Balance",
  "PESTLE":                       "Environmental Scan",
  "PESTEL":                       "Environmental Scan",
  "Hoshin Kanri":                 "Strategic Focus",
  "OKRs":                         "Goal Alignment",
  "OKR":                          "Goal Alignment",
  "Balanced Scorecard":           "Performance Balance",
  "BSC":                          "Performance Balance",
  "Ansoff Matrix":                "Growth Strategy",
  "Lean Six Sigma":               "Process Efficiency",
  "Six Sigma":                    "Process Efficiency",
  "Lean":                         "Waste Reduction",
  "RACI":                         "Accountability Map",
  "VRIO":                         "Competitive Advantage",
  "Blue Ocean Strategy":          "Market Differentiation",
  "Kotter":                       "Change Execution",
  "Kotter's 8-Step":              "Change Execution",
  "ADKAR":                        "Change Readiness",
  "Stage-Gate":                   "Initiative Governance",
  "Agile":                        "Adaptive Delivery",
  "Scrum":                        "Adaptive Delivery",
  "PMBOK":                        "Project Standards",
  "PRINCE2":                      "Project Governance",
};

function friendlyFramework(raw: string | undefined): string | undefined {
  if (!raw) return undefined;
  return FRAMEWORK_LABELS[raw] ?? undefined;
}

const insightTypeColors: Record<string, string> = {
  "Risk Escalation":        "text-signal-red bg-signal-red/8 border-signal-red/25",
  "Strategic Misalignment": "text-signal-red bg-signal-red/8 border-signal-red/25",
  "Capacity Constraint":    "text-signal-yellow bg-signal-yellow/8 border-signal-yellow/25",
  "Dependency Bottleneck":  "text-signal-yellow bg-signal-yellow/8 border-signal-yellow/25",
  "Performance Anomaly":    "text-signal-yellow bg-signal-yellow/8 border-signal-yellow/25",
  "Execution Delay":        "text-electric-blue bg-electric-blue/8 border-electric-blue/25",
};

const signalAccent: Record<string, string> = {
  red:    "bg-signal-red",
  yellow: "bg-signal-yellow",
  green:  "bg-signal-green",
  blue:   "bg-electric-blue",
};

interface InsightCardProps {
  insight: Insight;
  rank: number;
}

export default function InsightCard({ insight, rank }: InsightCardProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className={cn(
      "bg-card rounded-xl border transition-all duration-200 overflow-hidden",
      expanded ? "shadow-elevated border-electric-blue/30" : "shadow-card border-border hover:border-border/60 hover:shadow-elevated"
    )}>
      <div className="flex">
        {/* Left accent bar */}
        <div className={cn("w-[3px] flex-shrink-0", signalAccent[insight.signal] || "bg-electric-blue")} />

        <div className="flex-1 min-w-0">

          {/* ── Card header ── */}
          <div className="p-4 flex items-start gap-3">
            {/* Rank badge */}
            <div className="flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold font-mono border border-border bg-secondary/80 text-muted-foreground mt-0.5">
              {rank}
            </div>

            <div className="flex-1 min-w-0">
              {/* Type + department + date row */}
              <div className="flex items-center gap-2 flex-wrap mb-2">
                <SignalDot signal={insight.signal} pulse={insight.signal === "red"} />
                <span className={cn("text-xs font-semibold px-2 py-0.5 rounded-full border", insightTypeColors[insight.type] || "text-muted-foreground bg-muted border-border")}>
                  {typeLabels[insight.type] || insight.type}
                </span>
                {insight.department && (
                  <span className="text-xs text-muted-foreground font-medium">{insight.department}</span>
                )}
                {friendlyFramework(insight.framework) && (
                  <span className="ml-auto text-xs text-muted-foreground">{friendlyFramework(insight.framework)}</span>
                )}
              </div>

              {/* Situation — always visible */}
              <div className="mb-2">
                <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-0.5">Situation</div>
                <p className="text-sm font-medium text-foreground leading-snug line-clamp-2">
                  {insight.situation}
                </p>
              </div>

              {/* Priority + score row */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] text-muted-foreground uppercase tracking-wide">Priority Score</span>
                  <ScoreBadge score={insight.executivePriorityScore} signal={insight.signal} size="sm" />
                </div>
              </div>
            </div>

            <button
              onClick={() => setExpanded(!expanded)}
              className="flex-shrink-0 p-1.5 rounded-lg hover:bg-secondary border border-border transition-colors mt-0.5"
            >
              {expanded
                ? <ChevronUp className="w-3.5 h-3.5 text-muted-foreground" />
                : <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />}
            </button>
          </div>

          {/* ── Score mini-bars ── */}
          <div className="px-4 pb-3.5 grid grid-cols-4 gap-3">
            {[
              { label: "Impact",  value: insight.strategicImpact },
              { label: "Urgency", value: insight.urgency },
              { label: "Risk",    value: insight.operationalRisk },
              { label: "Leverage",value: insight.leverage },
            ].map(({ label, value }) => (
              <div key={label} className="space-y-1">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] text-muted-foreground">{label}</span>
                  <span className="text-[10px] font-mono font-semibold text-foreground">{value}</span>
                </div>
                <div className="h-1.5 rounded-full bg-secondary overflow-hidden border border-border">
                  <div
                    className={cn("h-full rounded-full",
                      value >= 80 ? "bg-electric-blue" :
                      value >= 60 ? "bg-teal" :
                      value >= 40 ? "bg-signal-yellow" : "bg-signal-red"
                    )}
                    style={{ width: `${value}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* ── Expanded — standardized format ── */}
          {expanded && (
            <div className="border-t border-border/60 animate-fade-in">
              {[
                {
                  icon: <Eye className="w-3.5 h-3.5" />,
                  label: "Situation",
                  content: insight.situation,
                  color: "text-muted-foreground",
                  bg: "bg-secondary/30",
                },
                {
                  icon: <Stethoscope className="w-3.5 h-3.5" />,
                  label: "Diagnosis",
                  content: insight.diagnosis,
                  color: "text-signal-yellow",
                  bg: "",
                },
                {
                  icon: <Target className="w-3.5 h-3.5" />,
                  label: "Recommendation",
                  content: insight.recommendation,
                  color: "text-signal-green",
                  bg: "",
                },
                {
                  icon: <Wrench className="w-3.5 h-3.5" />,
                  label: "System Remedy",
                  content: insight.systemRemedy,
                  color: "text-electric-blue",
                  bg: "",
                },
              ].map(({ icon, label, content, color, bg }) => (
                <div key={label} className={cn("p-4 border-b border-border/40 last:border-0", bg)}>
                  <div className={cn("flex items-center gap-1.5 text-xs font-bold mb-1.5 uppercase tracking-wider", color)}>
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
