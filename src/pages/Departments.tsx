import { departments, getScoreSignal, insights } from "@/lib/pmoData";
import DepartmentCard from "@/components/DepartmentCard";
import { ScoreBadge, MaturityBadge, ScoreBar } from "@/components/ScoreBadge";
import { cn } from "@/lib/utils";
import { useState } from "react";
import type { MaturityTier, Department } from "@/lib/pmoData";
import { X, Target, Shield, FileText, Users, ChevronRight, AlertTriangle } from "lucide-react";

const tiers: MaturityTier[] = ["Foundational", "Developing", "Structured", "Managed", "Optimized"];
type SortKey = "maturityScore" | "executionHealth" | "riskScore" | "capacityUsed";

const authorityColors = {
  Executive: "text-electric-blue bg-electric-blue/10",
  Senior: "text-signal-green bg-signal-green/10",
  Manager: "text-teal bg-teal/10",
  Analyst: "text-signal-yellow bg-signal-yellow/10",
  Coordinator: "text-muted-foreground bg-secondary",
};

function DepartmentDetailPanel({ dept, onClose }: { dept: Department; onClose: () => void }) {
  const deptInsights = insights.filter(i => i.department === dept.name);
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end">
      <div className="absolute inset-0 bg-foreground/20 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-xl h-screen bg-card border-l shadow-elevated overflow-y-auto animate-slide-in-left">
        <div className="sticky top-0 bg-card border-b px-5 py-4 z-10">
          <div className="flex items-start gap-3">
            <div className="flex-1 min-w-0">
              <h2 className="text-base font-bold text-foreground">{dept.name}</h2>
              <div className="flex items-center gap-2 mt-1">
                <MaturityBadge tier={dept.maturityTier} score={dept.maturityScore} />
                <span className={cn("text-xs px-1.5 py-0.5 rounded font-medium", authorityColors[dept.authorityLevel])}>
                  {dept.authorityLevel}
                </span>
              </div>
            </div>
            <button onClick={onClose} className="p-1.5 rounded hover:bg-secondary transition-colors flex-shrink-0">
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
        </div>

        <div className="p-5 space-y-5">
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-secondary rounded-lg p-3">
              <div className="text-xs text-muted-foreground mb-1">Department Head</div>
              <div className="text-sm font-medium text-foreground flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-muted-foreground" /> {dept.head}
              </div>
            </div>
            <div className="bg-secondary rounded-lg p-3">
              <div className="text-xs text-muted-foreground mb-1">Headcount</div>
              <div className="text-sm font-bold font-mono text-foreground">{dept.headcount} <span className="text-xs font-normal text-muted-foreground">FTE</span></div>
            </div>
          </div>

          <div className="bg-card border rounded-lg p-4 space-y-3">
            <div className="text-xs font-semibold text-foreground uppercase tracking-wide">Performance Scores</div>
            <ScoreBar value={dept.maturityScore} signal={getScoreSignal(dept.maturityScore)} label="Operational Maturity" />
            <ScoreBar value={dept.executionHealth} signal={getScoreSignal(dept.executionHealth)} label="Execution Health" />
            <ScoreBar value={dept.capacityUsed} signal={dept.capacityUsed > 90 ? "red" : dept.capacityUsed > 75 ? "yellow" : "green"} label="Capacity Used" />
            <ScoreBar value={100 - dept.riskScore} signal={getScoreSignal(100 - dept.riskScore)} label="Risk Index (inv.)" />
            <ScoreBar value={dept.sopAdherence} signal={getScoreSignal(dept.sopAdherence)} label="SOP Adherence" />
          </div>

          <div>
            <div className="text-xs font-semibold text-foreground uppercase tracking-wide mb-2 flex items-center gap-1.5">
              <Target className="w-3.5 h-3.5 text-electric-blue" /> Core Responsibilities
            </div>
            <div className="space-y-1.5">
              {dept.coreResponsibilities.map((r, i) => (
                <div key={i} className="flex items-start gap-2 text-sm">
                  <ChevronRight className="w-3.5 h-3.5 text-electric-blue flex-shrink-0 mt-0.5" />
                  <span className="text-foreground/80">{r}</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="text-xs font-semibold text-foreground uppercase tracking-wide mb-2 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-teal" /> Key Functions
            </div>
            <div className="space-y-1.5">
              {dept.keyFunctions.map((f, i) => (
                <div key={i} className="flex items-start gap-2 text-sm">
                  <ChevronRight className="w-3.5 h-3.5 text-teal flex-shrink-0 mt-0.5" />
                  <span className="text-foreground/80">{f}</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="text-xs font-semibold text-foreground uppercase tracking-wide mb-2 flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-signal-green" /> Decision Rights & Authority
            </div>
            <div className="space-y-1.5">
              {dept.decisionRights.map((d, i) => (
                <div key={i} className="flex items-start gap-2 text-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-signal-green flex-shrink-0 mt-1.5" />
                  <span className="text-foreground/80">{d}</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="text-xs font-semibold text-foreground uppercase tracking-wide mb-2">Applied Frameworks</div>
            <div className="flex flex-wrap gap-1.5">
              {dept.frameworks.map(f => (
                <span key={f} className="text-xs bg-electric-blue/10 text-electric-blue border border-electric-blue/20 px-2 py-0.5 rounded font-medium">{f}</span>
              ))}
            </div>
          </div>

          <div>
            <div className="text-xs font-semibold text-foreground uppercase tracking-wide mb-2">Key Performance Indicators</div>
            <div className="divide-y border rounded-lg overflow-hidden">
              {dept.keyKPIs.map(kpi => (
                <div key={kpi.label} className="flex items-center justify-between px-3 py-2.5 bg-card">
                  <span className="text-xs text-muted-foreground">{kpi.label}</span>
                  <span className={cn("text-xs font-mono font-semibold",
                    kpi.trend === "up" ? "text-signal-green" : kpi.trend === "down" ? "text-signal-red" : "text-muted-foreground"
                  )}>{kpi.value} {kpi.trend === "up" ? "↑" : kpi.trend === "down" ? "↓" : "→"}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-secondary rounded-lg p-3 text-center">
              <div className="text-2xl font-bold font-mono text-foreground">{dept.activeInitiatives}</div>
              <div className="text-xs text-muted-foreground">Active Initiatives</div>
            </div>
            <div className={cn("rounded-lg p-3 text-center",
              dept.blockedTasks > 5 ? "bg-signal-red/8" : dept.blockedTasks > 0 ? "bg-signal-yellow/8" : "bg-signal-green/8"
            )}>
              <div className={cn("text-2xl font-bold font-mono",
                dept.blockedTasks > 5 ? "text-signal-red" : dept.blockedTasks > 0 ? "text-signal-yellow" : "text-signal-green"
              )}>{dept.blockedTasks}</div>
              <div className="text-xs text-muted-foreground">Blocked Tasks</div>
            </div>
          </div>

          {deptInsights.length > 0 && (
            <div>
              <div className="text-xs font-semibold text-foreground uppercase tracking-wide mb-2 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-signal-yellow" /> Active Signals ({deptInsights.length})
              </div>
              <div className="space-y-2">
                {deptInsights.map(ins => (
                  <div key={ins.id} className={cn("rounded-lg border p-3",
                    ins.signal === "red" ? "bg-signal-red/5 border-signal-red/20" :
                    ins.signal === "yellow" ? "bg-signal-yellow/5 border-signal-yellow/20" : "bg-secondary border-border"
                  )}>
                    <div className="text-xs font-medium text-foreground mb-0.5">{ins.type}</div>
                    <div className="text-xs text-muted-foreground leading-snug line-clamp-2">{ins.situation}</div>
                    <div className="flex items-center gap-2 mt-1.5">
                      <ScoreBadge score={ins.executivePriorityScore} signal={ins.signal} size="sm" />
                      <span className="text-xs text-muted-foreground">{ins.framework}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Departments() {
  const [filter, setFilter] = useState<MaturityTier | "All">("All");
  const [sortKey, setSortKey] = useState<SortKey>("maturityScore");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [selectedDept, setSelectedDept] = useState<Department | null>(null);

  const tierCounts = tiers.reduce((acc, tier) => {
    acc[tier] = departments.filter(d => d.maturityTier === tier).length;
    return acc;
  }, {} as Record<MaturityTier, number>);

  const filtered = [...departments]
    .filter(d => filter === "All" || d.maturityTier === filter)
    .sort((a, b) => {
      const diff = a[sortKey] - b[sortKey];
      return sortDir === "desc" ? -diff : diff;
    });

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground mb-0.5">Department Engine</h1>
          <p className="text-sm text-muted-foreground">
            {departments.length} departments · Operational Maturity Scoring · Click any department for full detail
          </p>
        </div>
      </div>

      {/* Maturity distribution */}
      <div className="bg-card rounded-lg border shadow-card p-4">
        <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-4">Maturity Distribution</h2>
        <div className="grid grid-cols-5 gap-3">
          {tiers.map(tier => {
            const count = tierCounts[tier];
            const styles: Record<MaturityTier, { bar: string; text: string; bg: string }> = {
              Foundational: { bar: "bg-signal-red",    text: "text-signal-red",    bg: "bg-signal-red/10" },
              Developing:   { bar: "bg-signal-yellow", text: "text-signal-yellow", bg: "bg-signal-yellow/10" },
              Structured:   { bar: "bg-teal",          text: "text-teal",          bg: "bg-teal/10" },
              Managed:      { bar: "bg-electric-blue", text: "text-electric-blue", bg: "bg-electric-blue/10" },
              Optimized:    { bar: "bg-signal-green",  text: "text-signal-green",  bg: "bg-signal-green/10" },
            };
            const s = styles[tier];
            return (
              <button key={tier} onClick={() => setFilter(tier)}
                className={cn("rounded-lg border p-3 text-center transition-all", s.bg,
                  filter === tier ? "ring-2 ring-offset-1 ring-current" : "opacity-80 hover:opacity-100"
                )}>
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
            <button onClick={() => setFilter("All")}
              className={cn("text-xs px-2.5 py-1 rounded-full border transition-all",
                filter === "All" ? "bg-electric-blue/10 text-electric-blue border-electric-blue/40 font-medium" : "bg-background text-muted-foreground border-border"
              )}>All</button>
            {tiers.map(t => (
              <button key={t} onClick={() => setFilter(t)}
                className={cn("text-xs px-2.5 py-1 rounded-full border transition-all",
                  filter === t ? "bg-electric-blue/10 text-electric-blue border-electric-blue/40 font-medium" : "bg-background text-muted-foreground border-border"
                )}>{t}</button>
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
              <th className="text-center px-3 py-2.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide hidden xl:table-cell">SOP</th>
              <th className="text-left px-3 py-2.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Head</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filtered.map((dept, idx) => (
              <tr key={dept.id} className="hover:bg-secondary/30 transition-colors cursor-pointer" onClick={() => setSelectedDept(dept)}>
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
                  <span className={cn("text-xs font-mono font-semibold",
                    dept.capacityUsed > 90 ? "text-signal-red" : dept.capacityUsed > 75 ? "text-signal-yellow" : "text-signal-green"
                  )}>{dept.capacityUsed}%</span>
                </td>
                <td className="px-3 py-3 text-center hidden lg:table-cell">
                  <span className={cn("text-xs font-mono font-semibold",
                    dept.riskScore > 70 ? "text-signal-red" : dept.riskScore > 50 ? "text-signal-yellow" : "text-signal-green"
                  )}>{dept.riskScore}</span>
                </td>
                <td className="px-3 py-3 text-center hidden xl:table-cell">
                  <span className={cn("text-xs font-mono font-semibold",
                    dept.sopAdherence >= 80 ? "text-signal-green" : dept.sopAdherence >= 60 ? "text-signal-yellow" : "text-signal-red"
                  )}>{dept.sopAdherence}%</span>
                </td>
                <td className="px-3 py-3 text-xs text-muted-foreground">{dept.head}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Cards grid */}
      <div>
        <h2 className="text-sm font-semibold text-foreground mb-3">Department Cards</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map(dept => (
            <div key={dept.id} className="cursor-pointer" onClick={() => setSelectedDept(dept)}>
              <DepartmentCard dept={dept} />
            </div>
          ))}
        </div>
      </div>

      {selectedDept && <DepartmentDetailPanel dept={selectedDept} onClose={() => setSelectedDept(null)} />}
    </div>
  );
}
