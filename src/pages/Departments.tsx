import { departments, getScoreSignal } from "@/lib/pmoData";
import DepartmentCard from "@/components/DepartmentCard";
import { ScoreBadge, MaturityBadge, ScoreBar } from "@/components/ScoreBadge";
import { cn } from "@/lib/utils";
import { useState } from "react";
import type { MaturityTier } from "@/lib/pmoData";

const tiers: MaturityTier[] = ["Foundational", "Developing", "Structured", "Managed", "Optimized"];
type SortKey = "maturityScore" | "executionHealth" | "riskScore" | "capacityUsed";

export default function Departments() {
  const [filter, setFilter] = useState<MaturityTier | "All">("All");
  const [sortKey, setSortKey] = useState<SortKey>("maturityScore");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const tierCounts = tiers.reduce((acc, tier) => {
    acc[tier] = departments.filter((d) => d.maturityTier === tier).length;
    return acc;
  }, {} as Record<MaturityTier, number>);

  const filtered = [...departments]
    .filter((d) => filter === "All" || d.maturityTier === filter)
    .sort((a, b) => {
      const diff = a[sortKey] - b[sortKey];
      return sortDir === "desc" ? -diff : diff;
    });

  const avgMaturity = Math.round(departments.reduce((s, d) => s + d.maturityScore, 0) / departments.length);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground mb-0.5">Department Engine</h1>
          <p className="text-sm text-muted-foreground">
            {departments.length} departments · Operational Maturity Scoring
          </p>
        </div>
        <div className="text-right">
          <div className="text-xs text-muted-foreground mb-0.5">Org Avg Maturity</div>
          <ScoreBadge score={avgMaturity} signal={getScoreSignal(avgMaturity)} size="lg" showLabel />
        </div>
      </div>

      {/* Maturity distribution */}
      <div className="bg-card rounded-lg border shadow-card p-4">
        <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-4">Maturity Distribution</h2>
        <div className="grid grid-cols-5 gap-3">
          {tiers.map((tier) => {
            const count = tierCounts[tier];
            const styles: Record<MaturityTier, { bar: string; text: string; bg: string }> = {
              Foundational: { bar: "bg-signal-red", text: "text-signal-red", bg: "bg-signal-red/10" },
              Developing: { bar: "bg-signal-yellow", text: "text-signal-yellow", bg: "bg-signal-yellow/10" },
              Structured: { bar: "bg-teal", text: "text-teal", bg: "bg-teal/10" },
              Managed: { bar: "bg-electric-blue", text: "text-electric-blue", bg: "bg-electric-blue/10" },
              Optimized: { bar: "bg-signal-green", text: "text-signal-green", bg: "bg-signal-green/10" },
            };
            const s = styles[tier];
            return (
              <button
                key={tier}
                onClick={() => setFilter(tier)}
                className={cn(
                  "rounded-lg border p-3 text-center transition-all",
                  s.bg,
                  filter === tier ? "ring-2 ring-offset-1 ring-current" : "opacity-80 hover:opacity-100"
                )}
              >
                <div className={cn("text-2xl font-bold font-mono mb-0.5", s.text)}>{count}</div>
                <div className="text-xs text-muted-foreground font-medium">{tier}</div>
                <div className={cn("h-1 rounded-full mt-2", s.bar)} style={{ opacity: count > 0 ? 1 : 0.2 }} />
              </button>
            );
          })}
        </div>
      </div>

      {/* Maturity ranking table */}
      <div className="bg-card rounded-lg border shadow-card overflow-hidden">
        <div className="px-4 py-3 border-b flex flex-wrap items-center gap-2">
          <h2 className="text-sm font-semibold text-foreground">Maturity Rankings</h2>
          <div className="ml-auto flex flex-wrap gap-1.5">
            {(["All", ...tiers] as const).map((t) => (
              <button
                key={t}
                onClick={() => setFilter(t)}
                className={cn(
                  "text-xs px-2.5 py-1 rounded-full border transition-all",
                  filter === t
                    ? "bg-electric-blue/10 text-electric-blue border-electric-blue/40 font-medium"
                    : "bg-background text-muted-foreground border-border"
                )}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-secondary/40">
              <th className="text-left px-4 py-2.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide">#</th>
              <th className="text-left px-3 py-2.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Department</th>
              <th className="text-center px-3 py-2.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide cursor-pointer hover:text-foreground" onClick={() => setSortKey("maturityScore")}>
                Maturity {sortKey === "maturityScore" ? "↓" : ""}
              </th>
              <th className="text-center px-3 py-2.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide cursor-pointer hover:text-foreground hidden md:table-cell" onClick={() => setSortKey("executionHealth")}>
                Exec Health {sortKey === "executionHealth" ? "↓" : ""}
              </th>
              <th className="text-center px-3 py-2.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide cursor-pointer hover:text-foreground hidden lg:table-cell" onClick={() => setSortKey("capacityUsed")}>
                Capacity {sortKey === "capacityUsed" ? "↓" : ""}
              </th>
              <th className="text-center px-3 py-2.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide cursor-pointer hover:text-foreground hidden lg:table-cell" onClick={() => setSortKey("riskScore")}>
                Risk {sortKey === "riskScore" ? "↓" : ""}
              </th>
              <th className="text-left px-3 py-2.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Head</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filtered.map((dept, idx) => (
              <tr key={dept.id} className="hover:bg-secondary/30 transition-colors">
                <td className="px-4 py-3 text-xs font-mono text-muted-foreground">{idx + 1}</td>
                <td className="px-3 py-3">
                  <div className="font-medium text-foreground">{dept.name}</div>
                  <MaturityBadge tier={dept.maturityTier} score={dept.maturityScore} />
                </td>
                <td className="px-3 py-3 text-center">
                  <ScoreBadge score={dept.maturityScore} signal={getScoreSignal(dept.maturityScore)} size="sm" />
                </td>
                <td className="px-3 py-3 hidden md:table-cell min-w-[100px]">
                  <ScoreBar value={dept.executionHealth} signal={getScoreSignal(dept.executionHealth)} />
                </td>
                <td className="px-3 py-3 text-center hidden lg:table-cell">
                  <span className={cn(
                    "text-xs font-mono font-semibold",
                    dept.capacityUsed > 90 ? "text-signal-red" : dept.capacityUsed > 75 ? "text-signal-yellow" : "text-signal-green"
                  )}>
                    {dept.capacityUsed}%
                  </span>
                </td>
                <td className="px-3 py-3 text-center hidden lg:table-cell">
                  <span className={cn(
                    "text-xs font-mono font-semibold",
                    dept.riskScore > 70 ? "text-signal-red" : dept.riskScore > 50 ? "text-signal-yellow" : "text-signal-green"
                  )}>
                    {dept.riskScore}
                  </span>
                </td>
                <td className="px-3 py-3 text-xs text-muted-foreground">{dept.head}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Cards grid */}
      <div>
        <h2 className="text-sm font-semibold text-foreground mb-3">Department Engine Cards</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((dept) => (
            <DepartmentCard key={dept.id} dept={dept} />
          ))}
        </div>
      </div>
    </div>
  );
}
