import { insights, frameworks, initiatives, departments } from "@/lib/pmoData";
import InsightCard from "@/components/InsightCard";
import { ScoreBadge, SignalDot } from "@/components/ScoreBadge";
import { cn } from "@/lib/utils";
import { Activity, AlertCircle, GitBranch, Layers, Target } from "lucide-react";
import { useState } from "react";
import type { InsightType } from "@/lib/pmoData";

const pipeline = [
  {
    stage: "Signal Detection",
    icon: Activity,
    color: "text-electric-blue",
    bg: "bg-electric-blue/10",
    border: "border-electric-blue/30",
    count: insights.length,
    desc: "Monitoring capacity, delays, conflicts, dependencies",
  },
  {
    stage: "Diagnosis",
    icon: Layers,
    color: "text-teal",
    bg: "bg-teal/10",
    border: "border-teal/30",
    count: insights.filter((i) => i.executivePriorityScore > 60).length,
    desc: "Root cause analysis via 7 embedded frameworks",
  },
  {
    stage: "Advisory Guidance",
    icon: Target,
    color: "text-signal-green",
    bg: "bg-signal-green/10",
    border: "border-signal-green/30",
    count: insights.filter((i) => i.executivePriorityScore > 70).length,
    desc: "Actionable executive recommendations generated",
  },
  {
    stage: "Structural Remedies",
    icon: GitBranch,
    color: "text-signal-yellow",
    bg: "bg-signal-yellow/10",
    border: "border-signal-yellow/30",
    count: insights.filter((i) => i.executivePriorityScore > 80).length,
    desc: "Long-term organizational improvement proposals",
  },
];

type FilterType = InsightType | "All";

export default function Diagnostics() {
  const [typeFilter, setTypeFilter] = useState<FilterType>("All");
  const [signalFilter, setSignalFilter] = useState<"all" | "red" | "yellow" | "green" | "blue">("all");

  const insightTypes = [...new Set(insights.map((i) => i.type))];

  const filtered = [...insights]
    .filter((i) => typeFilter === "All" || i.type === typeFilter)
    .filter((i) => signalFilter === "all" || i.signal === signalFilter)
    .sort((a, b) => b.executivePriorityScore - a.executivePriorityScore);

  // Dependency map
  const blockedInitiatives = initiatives.filter((i) => i.dependencies.length > 0);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-xl font-bold text-foreground mb-0.5">Diagnostics</h1>
        <p className="text-sm text-muted-foreground">4-stage reasoning pipeline · Framework-driven root cause analysis</p>
      </div>

      {/* Pipeline */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
        {pipeline.map(({ stage, icon: Icon, color, bg, border, count, desc }) => (
          <div key={stage} className={cn("rounded-lg border p-4 shadow-card", bg, border)}>
            <div className={cn("flex items-center gap-2 mb-2", color)}>
              <Icon className="w-4 h-4" />
              <span className="text-xs font-semibold uppercase tracking-wide">{stage}</span>
            </div>
            <div className={cn("text-3xl font-bold font-mono mb-1", color)}>{count}</div>
            <p className="text-xs text-muted-foreground">{desc}</p>
          </div>
        ))}
      </div>

      {/* Framework summary */}
      <div className="bg-card rounded-lg border shadow-card">
        <div className="px-4 py-3 border-b">
          <h2 className="text-sm font-semibold text-foreground">Framework Diagnosis Summary</h2>
        </div>
        <div className="divide-y">
          {frameworks.map((fw) => (
            <div key={fw.id} className="px-4 py-3 flex items-center gap-4">
              <div className="w-40 flex-shrink-0">
                <div className="text-xs font-semibold text-foreground">{fw.name}</div>
                <div className="text-xs text-muted-foreground">{fw.lastTriggered}</div>
              </div>
              <div className="flex-1">
                <div className="flex flex-wrap gap-1">
                  {fw.coverage.map((c) => (
                    <span key={c} className="text-xs bg-secondary text-muted-foreground px-1.5 py-0.5 rounded">{c}</span>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={cn(
                  "text-xs font-medium px-2 py-0.5 rounded",
                  fw.status === "Alerting" ? "text-signal-red bg-signal-red/10" :
                  fw.status === "Monitoring" ? "text-signal-yellow bg-signal-yellow/10" :
                  "text-signal-green bg-signal-green/10"
                )}>
                  {fw.status}
                </span>
                <span className="text-xs font-mono text-muted-foreground">{fw.activeInsights} insights</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Dependency intelligence */}
      <div>
        <h2 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
          <GitBranch className="w-4 h-4 text-electric-blue" />
          Dependency Intelligence Map
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {blockedInitiatives.map((ini) => (
            <div key={ini.id} className="bg-card rounded-lg border shadow-card p-4">
              <div className="flex items-start gap-2 mb-2">
                <SignalDot signal={ini.signal} pulse={ini.signal === "red"} />
                <div>
                  <div className="text-xs font-semibold text-foreground">{ini.name}</div>
                  <div className="text-xs text-muted-foreground">{ini.department}</div>
                </div>
                <ScoreBadge score={ini.dependencyRisk} signal={ini.dependencyRisk > 70 ? "red" : ini.dependencyRisk > 40 ? "yellow" : "green"} size="sm" />
              </div>
              <div className="space-y-1">
                <div className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3 text-signal-yellow" />
                  Blocked by:
                </div>
                {ini.dependencies.map((depId) => {
                  const dep = initiatives.find((d) => d.id === depId);
                  return dep ? (
                    <div key={depId} className="flex items-center gap-2 pl-2">
                      <span className="w-1 h-1 rounded-full bg-signal-yellow" />
                      <span className="text-xs text-foreground">{dep.name}</span>
                      <span className={cn(
                        "text-xs px-1.5 py-0.5 rounded font-medium ml-auto",
                        dep.status === "Blocked" ? "text-signal-red bg-signal-red/10" :
                        dep.status === "Delayed" ? "text-signal-yellow bg-signal-yellow/10" :
                        "text-signal-green bg-signal-green/10"
                      )}>
                        {dep.status}
                      </span>
                    </div>
                  ) : null;
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Filtered insight cards */}
      <div>
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <h2 className="text-sm font-semibold text-foreground mr-2">All Insights</h2>
          {(["All", ...insightTypes] as FilterType[]).map((t) => (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              className={cn(
                "text-xs px-2.5 py-1 rounded-full border transition-all",
                typeFilter === t
                  ? "bg-electric-blue/10 text-electric-blue border-electric-blue/40 font-medium"
                  : "bg-card text-muted-foreground border-border"
              )}
            >
              {t}
            </button>
          ))}
          <div className="ml-auto flex items-center gap-1">
            {(["all", "red", "yellow", "green", "blue"] as const).map((s) => (
              <button
                key={s}
                onClick={() => setSignalFilter(s)}
                className={cn(
                  "text-xs px-2.5 py-1 rounded-full border transition-all capitalize",
                  signalFilter === s
                    ? "bg-electric-blue/10 text-electric-blue border-electric-blue/40 font-medium"
                    : "bg-card text-muted-foreground border-border"
                )}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
        <div className="space-y-3">
          {filtered.map((ins, i) => (
            <InsightCard key={ins.id} insight={ins} rank={i + 1} />
          ))}
        </div>
      </div>
    </div>
  );
}
