import { initiatives, departments, formatCurrency, getScoreSignal } from "@/lib/pmoData";
import { ScoreBadge, SignalDot } from "@/components/ScoreBadge";
import { cn } from "@/lib/utils";
import { Calendar, DollarSign, User, Link, Filter, ArrowUpDown } from "lucide-react";
import { useState } from "react";
import type { InitiativeStatus } from "@/lib/pmoData";

const statusStyles: Record<InitiativeStatus, string> = {
  "On Track": "text-signal-green bg-signal-green/10 border-signal-green/30",
  "At Risk": "text-signal-yellow bg-signal-yellow/10 border-signal-yellow/30",
  Delayed: "text-signal-yellow bg-signal-yellow/10 border-signal-yellow/30",
  Blocked: "text-signal-red bg-signal-red/10 border-signal-red/30",
  Completed: "text-electric-blue bg-electric-blue/10 border-electric-blue/30",
};

type SortKey = "priorityScore" | "strategicAlignment" | "dependencyRisk" | "completionPct";

export default function Initiatives() {
  const [filter, setFilter] = useState<InitiativeStatus | "All">("All");
  const [sortKey, setSortKey] = useState<SortKey>("priorityScore");

  const filtered = [...initiatives]
    .filter((i) => filter === "All" || i.status === filter)
    .sort((a, b) => b[sortKey] - a[sortKey]);

  const statusCounts: Record<string, number> = { All: initiatives.length };
  initiatives.forEach((i) => {
    statusCounts[i.status] = (statusCounts[i.status] || 0) + 1;
  });

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-foreground mb-0.5">Initiative Management</h1>
        <p className="text-sm text-muted-foreground">
          {initiatives.length} initiatives · Priority-scored against strategic OKRs
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {(["On Track", "At Risk", "Blocked", "Delayed"] as const).map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={cn(
              "bg-card rounded-lg border p-3 text-left transition-all shadow-card hover:shadow-elevated",
              filter === status ? "ring-2 ring-electric-blue" : ""
            )}
          >
            <div className={cn("text-2xl font-bold font-mono mb-0.5", statusStyles[status].split(" ")[0])}>
              {statusCounts[status] || 0}
            </div>
            <div className="text-xs text-muted-foreground">{status}</div>
          </button>
        ))}
      </div>

      {/* Filter + sort bar */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Filter className="w-3.5 h-3.5" /> Filter:
        </div>
        {(["All", "On Track", "At Risk", "Blocked", "Delayed", "Completed"] as const).map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={cn(
              "text-xs px-2.5 py-1 rounded-full border transition-all",
              filter === s
                ? "bg-electric-blue/10 text-electric-blue border-electric-blue/40 font-medium"
                : "bg-card text-muted-foreground border-border hover:border-foreground/20"
            )}
          >
            {s} {s !== "All" && `(${statusCounts[s] || 0})`}
          </button>
        ))}

        <div className="ml-auto flex items-center gap-1 text-xs text-muted-foreground">
          <ArrowUpDown className="w-3.5 h-3.5" /> Sort by:
        </div>
        {([
          ["priorityScore", "Priority"],
          ["strategicAlignment", "Alignment"],
          ["dependencyRisk", "Dep. Risk"],
          ["completionPct", "Progress"],
        ] as [SortKey, string][]).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setSortKey(key)}
            className={cn(
              "text-xs px-2.5 py-1 rounded-full border transition-all",
              sortKey === key
                ? "bg-electric-blue/10 text-electric-blue border-electric-blue/40 font-medium"
                : "bg-card text-muted-foreground border-border hover:border-foreground/20"
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Initiative table */}
      <div className="bg-card rounded-lg border shadow-card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-secondary/50">
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Initiative</th>
              <th className="text-left px-3 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Status</th>
              <th className="text-center px-3 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Priority</th>
              <th className="text-center px-3 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Alignment</th>
              <th className="text-center px-3 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Dep. Risk</th>
              <th className="text-center px-3 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Impact</th>
              <th className="text-left px-3 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Progress</th>
              <th className="text-left px-3 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Budget</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filtered.map((ini) => {
              const budgetPct = Math.round((ini.budgetUsed / ini.budget) * 100);
              const budgetSignal = getScoreSignal(budgetPct > 90 ? 20 : budgetPct > 70 ? 50 : 80);
              return (
                <tr key={ini.id} className="hover:bg-secondary/30 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-start gap-2">
                      <SignalDot signal={ini.signal} />
                      <div className="min-w-0">
                        <div className="font-medium text-foreground text-sm truncate max-w-[180px]">{ini.name}</div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-xs text-muted-foreground">{ini.department}</span>
                          <span className="text-xs text-muted-foreground flex items-center gap-0.5">
                            <User className="w-3 h-3" />
                            {ini.owner.split(" ")[0]}
                          </span>
                          {ini.dependencies.length > 0 && (
                            <span className="text-xs text-signal-yellow flex items-center gap-0.5">
                              <Link className="w-3 h-3" />
                              {ini.dependencies.length}
                            </span>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {ini.frameworks.map((f) => (
                            <span key={f} className="text-xs bg-secondary text-muted-foreground px-1 rounded">{f}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-3">
                    <span className={cn("text-xs font-medium px-2 py-0.5 rounded border whitespace-nowrap", statusStyles[ini.status])}>
                      {ini.status}
                    </span>
                  </td>
                  <td className="px-3 py-3 text-center">
                    <ScoreBadge score={ini.priorityScore} signal={getScoreSignal(ini.priorityScore)} size="sm" />
                  </td>
                  <td className="px-3 py-3 text-center">
                    <ScoreBadge score={ini.strategicAlignment} signal={getScoreSignal(ini.strategicAlignment)} size="sm" />
                  </td>
                  <td className="px-3 py-3 text-center">
                    <ScoreBadge score={ini.dependencyRisk} signal={getScoreSignal(100 - ini.dependencyRisk)} size="sm" />
                  </td>
                  <td className="px-3 py-3 text-center">
                    <span className={cn(
                      "text-xs font-medium px-2 py-0.5 rounded",
                      ini.estimatedImpact === "High" ? "text-electric-blue bg-electric-blue/10" :
                      ini.estimatedImpact === "Medium" ? "text-signal-yellow bg-signal-yellow/10" :
                      "text-muted-foreground bg-secondary"
                    )}>
                      {ini.estimatedImpact}
                    </span>
                  </td>
                  <td className="px-3 py-3 min-w-[100px]">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                        <div
                          className={cn("h-full rounded-full",
                            ini.completionPct >= 70 ? "bg-signal-green" :
                            ini.completionPct >= 40 ? "bg-electric-blue" :
                            "bg-signal-yellow"
                          )}
                          style={{ width: `${ini.completionPct}%` }}
                        />
                      </div>
                      <span className="text-xs font-mono text-muted-foreground w-8 text-right">{ini.completionPct}%</span>
                    </div>
                  </td>
                  <td className="px-3 py-3">
                    <div className="text-xs font-mono">
                      <div className={cn("font-semibold", budgetPct > 85 ? "text-signal-red" : "text-foreground")}>
                        {formatCurrency(ini.budgetUsed)}
                      </div>
                      <div className="text-muted-foreground">/ {formatCurrency(ini.budget)}</div>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
