import { departments, getScoreSignal, insights } from "@/lib/pmoData";
import DepartmentCard from "@/components/DepartmentCard";
import { ScoreBadge, MaturityBadge, ScoreBar } from "@/components/ScoreBadge";
import { cn } from "@/lib/utils";
import { useState } from "react";
import type { MaturityTier, Department } from "@/lib/pmoData";
import { X, Target, Shield, FileText, Users, ChevronRight, AlertTriangle, BarChart3, Activity } from "lucide-react";

const tiers: MaturityTier[] = ["Foundational", "Developing", "Structured", "Managed", "Optimized"];
type SortKey = "maturityScore" | "executionHealth" | "riskScore" | "capacityUsed";

const authorityColors = {
  Executive: "text-electric-blue bg-electric-blue/10 border-electric-blue/20",
  Senior:    "text-signal-green bg-signal-green/10 border-signal-green/20",
  Manager:   "text-teal bg-teal/10 border-teal/25",
  Analyst:   "text-signal-yellow bg-signal-yellow/10 border-signal-yellow/20",
  Coordinator: "text-muted-foreground bg-secondary border-border",
};

const tierStyles: Record<MaturityTier, { bar: string; text: string; bg: string; border: string }> = {
  Foundational: { bar: "bg-signal-red",    text: "text-signal-red",    bg: "bg-signal-red/8",    border: "border-signal-red/25" },
  Developing:   { bar: "bg-signal-yellow", text: "text-signal-yellow", bg: "bg-signal-yellow/8", border: "border-signal-yellow/25" },
  Structured:   { bar: "bg-teal",          text: "text-teal",          bg: "bg-teal/8",          border: "border-teal/25" },
  Managed:      { bar: "bg-electric-blue", text: "text-electric-blue", bg: "bg-electric-blue/8", border: "border-electric-blue/25" },
  Optimized:    { bar: "bg-signal-green",  text: "text-signal-green",  bg: "bg-signal-green/8",  border: "border-signal-green/25" },
};

function DepartmentDetailPanel({ dept, onClose }: { dept: Department; onClose: () => void }) {
  const deptInsights = insights.filter(i => i.department === dept.name);
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end">
      <div className="absolute inset-0 bg-foreground/20 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-xl h-screen bg-card border-l border-border shadow-deep overflow-y-auto animate-slide-in-left">
        
        {/* Panel header */}
        <div className="sticky top-0 bg-card border-b border-border px-5 py-4 z-10">
          <div className="flex items-start gap-3">
            <div className="flex-1 min-w-0">
              <h2 className="text-base font-bold text-foreground">{dept.name}</h2>
              <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                <MaturityBadge tier={dept.maturityTier} score={dept.maturityScore} />
                <span className={cn("text-xs px-2 py-0.5 rounded-full border font-medium", authorityColors[dept.authorityLevel])}>
                  {dept.authorityLevel}
                </span>
              </div>
            </div>
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-secondary border border-border transition-colors flex-shrink-0">
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
        </div>

        <div className="p-5 space-y-5">

          {/* Overview grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-secondary rounded-xl p-3">
              <div className="section-label mb-1.5">Department Head</div>
              <div className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-muted-foreground" /> {dept.head}
              </div>
            </div>
            <div className="bg-secondary rounded-xl p-3">
              <div className="section-label mb-1.5">Team Size</div>
              <div className="text-sm font-bold font-mono text-foreground">{dept.headcount} <span className="text-xs font-normal text-muted-foreground">FTE</span></div>
            </div>
            <div className="bg-secondary rounded-xl p-3">
              <div className="section-label mb-1.5">Active Initiatives</div>
              <div className="text-2xl font-bold font-mono text-foreground">{dept.activeInitiatives}</div>
            </div>
            <div className={cn("rounded-xl p-3",
              dept.blockedTasks > 5 ? "bg-signal-red/8" : dept.blockedTasks > 0 ? "bg-signal-yellow/8" : "bg-signal-green/8"
            )}>
              <div className="section-label mb-1.5">Blocked Tasks</div>
              <div className={cn("text-2xl font-bold font-mono",
                dept.blockedTasks > 5 ? "text-signal-red" : dept.blockedTasks > 0 ? "text-signal-yellow" : "text-signal-green"
              )}>{dept.blockedTasks}</div>
            </div>
          </div>

          {/* Performance Scores */}
          <div className="data-card">
            <div className="px-4 py-3 border-b border-border flex items-center gap-2">
              <BarChart3 className="w-3.5 h-3.5 text-electric-blue" />
              <span className="text-xs font-bold text-foreground uppercase tracking-wide">Performance Dimensions</span>
            </div>
            <div className="p-4 space-y-3">
              <ScoreBar value={dept.maturityScore} signal={getScoreSignal(dept.maturityScore)} label="Operational Maturity" />
              <ScoreBar value={dept.executionHealth} signal={getScoreSignal(dept.executionHealth)} label="Execution Health" />
              <ScoreBar value={dept.capacityUsed} signal={dept.capacityUsed > 90 ? "red" : dept.capacityUsed > 75 ? "yellow" : "green"} label="Capacity Utilization" />
              <ScoreBar value={100 - dept.riskScore} signal={getScoreSignal(100 - dept.riskScore)} label="Risk Index (inverted)" />
              <ScoreBar value={dept.sopAdherence} signal={getScoreSignal(dept.sopAdherence)} label="SOP Adherence" />
            </div>
          </div>

          {/* Core Responsibilities */}
          <div>
            <div className="flex items-center gap-1.5 mb-2.5">
              <Target className="w-3.5 h-3.5 text-electric-blue" />
              <span className="text-xs font-bold text-foreground uppercase tracking-wide">Core Responsibilities</span>
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

          {/* Key Functions */}
          <div>
            <div className="flex items-center gap-1.5 mb-2.5">
              <FileText className="w-3.5 h-3.5 text-teal" />
              <span className="text-xs font-bold text-foreground uppercase tracking-wide">Key Functions</span>
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

          {/* Decision Rights */}
          <div>
            <div className="flex items-center gap-1.5 mb-2.5">
              <Shield className="w-3.5 h-3.5 text-signal-green" />
              <span className="text-xs font-bold text-foreground uppercase tracking-wide">Decision Rights & Authority</span>
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

          {/* Applied Frameworks */}
          <div>
            <div className="text-xs font-bold text-foreground uppercase tracking-wide mb-2.5">Applied Frameworks</div>
            <div className="flex flex-wrap gap-1.5">
              {dept.frameworks.map(f => (
                <span key={f} className="text-xs bg-electric-blue/8 text-electric-blue border border-electric-blue/20 px-2.5 py-0.5 rounded-full font-medium">{f}</span>
              ))}
            </div>
          </div>

          {/* KPIs */}
          <div>
            <div className="text-xs font-bold text-foreground uppercase tracking-wide mb-2.5">Key Performance Indicators</div>
            <div className="data-card overflow-hidden">
              <div className="divide-y divide-border">
                {dept.keyKPIs.map(kpi => (
                  <div key={kpi.label} className="flex items-center justify-between px-4 py-2.5">
                    <span className="text-xs text-muted-foreground">{kpi.label}</span>
                    <span className={cn("text-xs font-mono font-semibold",
                      kpi.trend === "up" ? "text-signal-green" : kpi.trend === "down" ? "text-signal-red" : "text-muted-foreground"
                    )}>{kpi.value} {kpi.trend === "up" ? "↑" : kpi.trend === "down" ? "↓" : "→"}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Active Signals */}
          {deptInsights.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 mb-2.5">
                <AlertTriangle className="w-3.5 h-3.5 text-signal-yellow" />
                <span className="text-xs font-bold text-foreground uppercase tracking-wide">Active Signals ({deptInsights.length})</span>
              </div>
              <div className="space-y-2">
                {deptInsights.map(ins => (
                  <div key={ins.id} className={cn("rounded-xl border p-3.5",
                    ins.signal === "red" ? "bg-signal-red/5 border-signal-red/20" :
                    ins.signal === "yellow" ? "bg-signal-yellow/5 border-signal-yellow/20" : "bg-secondary border-border"
                  )}>
                    <div className="text-xs font-semibold text-foreground mb-1">{ins.type}</div>
                    <div className="text-xs text-muted-foreground leading-snug line-clamp-2">{ins.situation}</div>
                    <div className="flex items-center gap-2 mt-2">
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

  const avgMaturity = Math.round(departments.reduce((s, d) => s + d.maturityScore, 0) / departments.length);
  const avgCapacity = Math.round(departments.reduce((s, d) => s + d.capacityUsed, 0) / departments.length);
  const overloaded = departments.filter(d => d.capacityUsed > 85).length;

  const filtered = [...departments]
    .filter(d => filter === "All" || d.maturityTier === filter)
    .sort((a, b) => {
      const diff = a[sortKey] - b[sortKey];
      return sortDir === "desc" ? -diff : diff;
    });

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortDir(d => d === "desc" ? "asc" : "desc");
    else { setSortKey(key); setSortDir("desc"); }
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">

      {/* ── LAYER 1: Page Header ── */}
      <div className="page-header bg-card">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="section-label mb-1.5">Organization</div>
            <h1 className="text-2xl font-black text-foreground tracking-tight mb-1">Department Engine</h1>
            <p className="text-sm text-muted-foreground">
              {departments.length} departments · Operational Maturity Scoring · CMMI-based assessment
            </p>
          </div>
          <div className="flex gap-3 flex-shrink-0">
            <div className="bg-secondary rounded-xl px-4 py-2.5 text-center">
              <div className="text-2xl font-black font-mono text-electric-blue">{avgMaturity}</div>
              <div className="section-label">Avg Maturity</div>
            </div>
            <div className={cn("rounded-xl px-4 py-2.5 text-center",
              avgCapacity > 85 ? "bg-signal-red/8" : avgCapacity > 75 ? "bg-signal-yellow/8" : "bg-signal-green/8"
            )}>
              <div className={cn("text-2xl font-black font-mono",
                avgCapacity > 85 ? "text-signal-red" : avgCapacity > 75 ? "text-signal-yellow" : "text-signal-green"
              )}>{avgCapacity}%</div>
              <div className="section-label">Avg Capacity</div>
            </div>
            {overloaded > 0 && (
              <div className="bg-signal-orange/8 rounded-xl px-4 py-2.5 text-center border border-signal-orange/20">
                <div className="text-2xl font-black font-mono text-signal-orange">{overloaded}</div>
                <div className="section-label">Overloaded</div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 p-6 space-y-6">

        {/* ── LAYER 2: Maturity Distribution ── */}
        <div className="data-card">
          <div className="data-card-header">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-electric-blue" />
              <span className="text-sm font-bold text-foreground">Maturity Distribution</span>
              <span className="text-xs text-muted-foreground">CMMI-based · 5 tiers</span>
            </div>
            <button onClick={() => setFilter("All")} className={cn(
              "text-xs px-3 py-1 rounded-full border transition-all font-medium",
              filter === "All" ? "bg-electric-blue/10 text-electric-blue border-electric-blue/30" : "text-muted-foreground border-border"
            )}>All Tiers</button>
          </div>
          <div className="p-4 grid grid-cols-5 gap-3">
            {tiers.map(tier => {
              const count = tierCounts[tier];
              const s = tierStyles[tier];
              return (
                <button key={tier} onClick={() => setFilter(filter === tier ? "All" : tier)}
                  className={cn("rounded-xl border p-4 text-center transition-all", s.bg, s.border,
                    filter === tier ? "ring-2 ring-offset-2 ring-current shadow-elevated" : "hover:shadow-card opacity-85 hover:opacity-100"
                  )}>
                  <div className={cn("text-3xl font-black font-mono mb-1", s.text)}>{count}</div>
                  <div className="text-xs font-semibold text-foreground mb-2">{tier}</div>
                  <div className={cn("h-1.5 rounded-full", s.bar, count === 0 && "opacity-20")} />
                </button>
              );
            })}
          </div>
        </div>

        {/* ── LAYER 3: Rankings Table ── */}
        <div className="data-card overflow-hidden">
          <div className="data-card-header">
            <h2 className="text-sm font-bold text-foreground">Maturity Rankings</h2>
            <div className="flex gap-1.5 flex-wrap">
              {(["All", ...tiers] as const).map(t => (
                <button key={t} onClick={() => setFilter(t as MaturityTier | "All")}
                  className={cn("text-xs px-2.5 py-1 rounded-full border transition-all",
                    filter === t ? "bg-electric-blue/10 text-electric-blue border-electric-blue/30 font-semibold" : "bg-background text-muted-foreground border-border"
                  )}>{t}</button>
              ))}
            </div>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-secondary/40">
                <th className="text-left px-4 py-2.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide">#</th>
                <th className="text-left px-3 py-2.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Department</th>
                <th className="text-center px-3 py-2.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide cursor-pointer hover:text-foreground" onClick={() => toggleSort("maturityScore")}>
                  Maturity {sortKey === "maturityScore" ? (sortDir === "desc" ? "↓" : "↑") : ""}
                </th>
                <th className="text-center px-3 py-2.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide cursor-pointer hover:text-foreground hidden md:table-cell" onClick={() => toggleSort("executionHealth")}>
                  Exec Health {sortKey === "executionHealth" ? (sortDir === "desc" ? "↓" : "↑") : ""}
                </th>
                <th className="text-center px-3 py-2.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide cursor-pointer hover:text-foreground hidden lg:table-cell" onClick={() => toggleSort("capacityUsed")}>
                  Capacity {sortKey === "capacityUsed" ? (sortDir === "desc" ? "↓" : "↑") : ""}
                </th>
                <th className="text-center px-3 py-2.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide cursor-pointer hover:text-foreground hidden lg:table-cell" onClick={() => toggleSort("riskScore")}>
                  Risk Score {sortKey === "riskScore" ? (sortDir === "desc" ? "↓" : "↑") : ""}
                </th>
                <th className="text-center px-3 py-2.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide hidden xl:table-cell">SOP %</th>
                <th className="text-left px-3 py-2.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Head</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((dept, idx) => (
                <tr key={dept.id} className="hover:bg-secondary/30 transition-colors cursor-pointer group" onClick={() => setSelectedDept(dept)}>
                  <td className="px-4 py-3 text-xs font-mono text-muted-foreground">{idx + 1}</td>
                  <td className="px-3 py-3">
                    <div className="font-semibold text-foreground group-hover:text-electric-blue transition-colors">{dept.name}</div>
                    <MaturityBadge tier={dept.maturityTier} score={dept.maturityScore} />
                  </td>
                  <td className="px-3 py-3 text-center">
                    <ScoreBadge score={dept.maturityScore} signal={getScoreSignal(dept.maturityScore)} size="sm" />
                  </td>
                  <td className="px-3 py-3 hidden md:table-cell min-w-[110px]">
                    <ScoreBar value={dept.executionHealth} signal={getScoreSignal(dept.executionHealth)} />
                  </td>
                  <td className="px-3 py-3 text-center hidden lg:table-cell">
                    <span className={cn("text-xs font-mono font-bold px-2 py-0.5 rounded",
                      dept.capacityUsed > 90 ? "text-signal-red bg-signal-red/10" : dept.capacityUsed > 75 ? "text-signal-yellow bg-signal-yellow/10" : "text-signal-green bg-signal-green/10"
                    )}>{dept.capacityUsed}%</span>
                  </td>
                  <td className="px-3 py-3 text-center hidden lg:table-cell">
                    <span className={cn("text-xs font-mono font-bold",
                      dept.riskScore > 70 ? "text-signal-red" : dept.riskScore > 50 ? "text-signal-yellow" : "text-signal-green"
                    )}>{dept.riskScore}</span>
                  </td>
                  <td className="px-3 py-3 text-center hidden xl:table-cell">
                    <span className={cn("text-xs font-mono font-bold",
                      dept.sopAdherence >= 80 ? "text-signal-green" : dept.sopAdherence >= 60 ? "text-signal-yellow" : "text-signal-red"
                    )}>{dept.sopAdherence}%</span>
                  </td>
                  <td className="px-3 py-3 text-xs text-muted-foreground">{dept.head}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* ── LAYER 4: Department Cards Grid ── */}
        <div>
          <h2 className="section-label mb-3 flex items-center gap-2">
            <span>Department Detail Cards</span>
            <span className="text-muted-foreground/50">·</span>
            <span>{filtered.length} shown</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map(dept => (
              <div key={dept.id} className="cursor-pointer" onClick={() => setSelectedDept(dept)}>
                <DepartmentCard dept={dept} />
              </div>
            ))}
          </div>
        </div>
      </div>

      {selectedDept && <DepartmentDetailPanel dept={selectedDept} onClose={() => setSelectedDept(null)} />}
    </div>
  );
}
