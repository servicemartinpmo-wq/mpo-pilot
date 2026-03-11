import { useDepartments, useInsights } from "@/hooks/useLiveData";
import DepartmentCard from "@/components/DepartmentCard";
import { ScoreBadge, MaturityBadge, ScoreBar } from "@/components/ScoreBadge";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { X, Target, Shield, FileText, Users, ChevronRight, AlertTriangle, BarChart3, Activity, Loader2 } from "lucide-react";
import { getScoreSignal } from "@/lib/pmoData";
import type { MaturityTier } from "@/lib/pmoData";
import MiniSparkline from "@/components/MiniSparkline";

function mockTrend(current: number, seed: number): number[] {
  const base = Math.max(current - 12, 10);
  const step = (current - base) / 5;
  return [0, 1, 2, 3, 4, 5].map(i => {
    const noise = ((seed * (i + 7) * 13) % 9) - 4;
    return Math.min(100, Math.max(10, Math.round(base + step * i + noise)));
  });
}

const tiers: MaturityTier[] = ["Foundational", "Developing", "Structured", "Managed", "Optimized"];
type SortKey = "maturity_score" | "execution_health" | "risk_score" | "capacity_used";

const authorityColors: Record<string, string> = {
  Executive:   "text-electric-blue bg-electric-blue/10 border-electric-blue/20",
  Senior:      "text-signal-green bg-signal-green/10 border-signal-green/20",
  Manager:     "text-teal bg-teal/10 border-teal/25",
  Analyst:     "text-signal-yellow bg-signal-yellow/10 border-signal-yellow/20",
  Coordinator: "text-muted-foreground bg-secondary border-border",
};

const tierStyles: Record<MaturityTier, { bar: string; text: string; bg: string; border: string }> = {
  Foundational: { bar: "bg-signal-red",    text: "text-signal-red",    bg: "bg-signal-red/8",    border: "border-signal-red/25" },
  Developing:   { bar: "bg-signal-yellow", text: "text-signal-yellow", bg: "bg-signal-yellow/8", border: "border-signal-yellow/25" },
  Structured:   { bar: "bg-teal",          text: "text-teal",          bg: "bg-teal/8",          border: "border-teal/25" },
  Managed:      { bar: "bg-electric-blue", text: "text-electric-blue", bg: "bg-electric-blue/8", border: "border-electric-blue/25" },
  Optimized:    { bar: "bg-signal-green",  text: "text-signal-green",  bg: "bg-signal-green/8",  border: "border-signal-green/25" },
};

type LiveDept = ReturnType<typeof useDepartments>["data"] extends (infer T)[] | undefined ? T : never;

function DepartmentDetailPanel({ dept, deptInsights, onClose }: {
  dept: NonNullable<LiveDept>;
  deptInsights: ReturnType<typeof useInsights>["data"] extends (infer T)[] | undefined ? T[] : never[];
  onClose: () => void;
}) {
  const keyKPIs: { label: string; value: string; trend: string }[] = Array.isArray(dept.key_kpis)
    ? (dept.key_kpis as { label: string; value: string; trend: string }[])
    : [];

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end">
      <div className="absolute inset-0 bg-foreground/20 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-xl h-screen bg-card border-l border-border shadow-deep overflow-y-auto animate-slide-in-left">

        <div className="sticky top-0 bg-card border-b border-border px-5 py-4 z-10">
          <div className="flex items-start gap-3">
            <div className="flex-1 min-w-0">
              <h2 className="text-base font-bold text-foreground">{dept.name}</h2>
              <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                <MaturityBadge tier={(dept.maturity_tier ?? "Foundational") as MaturityTier} score={dept.maturity_score ?? 0} />
                <span className={cn("text-xs px-2 py-0.5 rounded-full border font-medium", authorityColors[dept.authority_level ?? "Manager"])}>
                  {dept.authority_level ?? "Manager"}
                </span>
              </div>
            </div>
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-secondary border border-border transition-colors flex-shrink-0">
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
        </div>

        <div className="p-5 space-y-5">
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-secondary rounded-xl p-3">
              <div className="section-label mb-1.5">Department Lead</div>
              <div className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-muted-foreground" /> {dept.head ?? "—"}
              </div>
            </div>
            <div className="bg-secondary rounded-xl p-3">
              <div className="section-label mb-1.5">Team Size</div>
              <div className="text-sm font-bold font-mono text-foreground">{dept.headcount ?? 0} <span className="text-xs font-normal text-muted-foreground">FTE</span></div>
            </div>
            <div className="bg-secondary rounded-xl p-3">
              <div className="section-label mb-1.5">Active Initiatives</div>
              <div className="text-2xl font-bold font-mono text-foreground">{dept.active_initiatives ?? 0}</div>
            </div>
            <div className={cn("rounded-xl p-3",
              (dept.blocked_tasks ?? 0) > 5 ? "bg-signal-red/8" : (dept.blocked_tasks ?? 0) > 0 ? "bg-signal-yellow/8" : "bg-signal-green/8"
            )}>
              <div className="section-label mb-1.5">Blocked Tasks</div>
              <div className={cn("text-2xl font-bold font-mono",
                (dept.blocked_tasks ?? 0) > 5 ? "text-signal-red" : (dept.blocked_tasks ?? 0) > 0 ? "text-signal-yellow" : "text-signal-green"
              )}>{dept.blocked_tasks ?? 0}</div>
            </div>
          </div>

          <div className="data-card">
            <div className="px-4 py-3 border-b border-border flex items-center gap-2">
              <BarChart3 className="w-3.5 h-3.5 text-electric-blue" />
              <span className="text-xs font-bold text-foreground uppercase tracking-wide">Performance Dimensions</span>
            </div>
            <div className="p-4 space-y-3">
              <ScoreBar value={dept.maturity_score ?? 0} signal={getScoreSignal(dept.maturity_score ?? 0)} label="Operational Maturity" />
              <ScoreBar value={dept.execution_health ?? 0} signal={getScoreSignal(dept.execution_health ?? 0)} label="Execution Health" />
              <ScoreBar value={dept.capacity_used ?? 0} signal={(dept.capacity_used ?? 0) > 90 ? "red" : (dept.capacity_used ?? 0) > 75 ? "yellow" : "green"} label="Capacity Utilization" />
              <ScoreBar value={100 - (dept.risk_score ?? 0)} signal={getScoreSignal(100 - (dept.risk_score ?? 0))} label="Risk Index (inverted)" />
              <ScoreBar value={dept.sop_adherence ?? 0} signal={getScoreSignal(dept.sop_adherence ?? 0)} label="SOP Adherence" />
            </div>
          </div>

          {(dept.core_responsibilities?.length ?? 0) > 0 && (
            <div>
              <div className="flex items-center gap-1.5 mb-2.5">
                <Target className="w-3.5 h-3.5 text-electric-blue" />
                <span className="text-xs font-bold text-foreground uppercase tracking-wide">Core Responsibilities</span>
              </div>
              <div className="space-y-1.5">
                {dept.core_responsibilities!.map((r, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm">
                    <ChevronRight className="w-3.5 h-3.5 text-electric-blue flex-shrink-0 mt-0.5" />
                    <span className="text-foreground/80">{r}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {(dept.key_functions?.length ?? 0) > 0 && (
            <div>
              <div className="flex items-center gap-1.5 mb-2.5">
                <FileText className="w-3.5 h-3.5 text-teal" />
                <span className="text-xs font-bold text-foreground uppercase tracking-wide">Key Functions</span>
              </div>
              <div className="space-y-1.5">
                {dept.key_functions!.map((f, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm">
                    <ChevronRight className="w-3.5 h-3.5 text-teal flex-shrink-0 mt-0.5" />
                    <span className="text-foreground/80">{f}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {(dept.decision_rights?.length ?? 0) > 0 && (
            <div>
              <div className="flex items-center gap-1.5 mb-2.5">
                <Shield className="w-3.5 h-3.5 text-signal-green" />
                <span className="text-xs font-bold text-foreground uppercase tracking-wide">Decision Rights & Authority</span>
              </div>
              <div className="space-y-1.5">
                {dept.decision_rights!.map((d, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm">
                    <span className="w-1.5 h-1.5 rounded-full bg-signal-green flex-shrink-0 mt-1.5" />
                    <span className="text-foreground/80">{d}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {(dept.frameworks?.length ?? 0) > 0 && (
            <div>
              <div className="text-xs font-bold text-foreground uppercase tracking-wide mb-2.5">Applied Frameworks</div>
              <div className="flex flex-wrap gap-1.5">
                {dept.frameworks!.map(f => (
                  <span key={f} className="text-xs bg-electric-blue/8 text-electric-blue border border-electric-blue/20 px-2.5 py-0.5 rounded-full font-medium">{f}</span>
                ))}
              </div>
            </div>
          )}

          {keyKPIs.length > 0 && (
            <div>
              <div className="text-xs font-bold text-foreground uppercase tracking-wide mb-2.5">Key Performance Indicators</div>
              <div className="data-card overflow-hidden">
                <div className="divide-y divide-border">
                  {keyKPIs.map(kpi => (
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
          )}

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
                      <ScoreBadge score={ins.executive_priority_score ?? 0} signal={(ins.signal ?? "blue") as any} size="sm" />
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
  const { data: departments = [], isLoading } = useDepartments();
  const { data: allInsights = [] } = useInsights();

  const [filter, setFilter] = useState<MaturityTier | "All">("All");
  const [sortKey, setSortKey] = useState<SortKey>("maturity_score");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [selectedDept, setSelectedDept] = useState<NonNullable<LiveDept> | null>(null);

  const tierCounts = tiers.reduce((acc, tier) => {
    acc[tier] = departments.filter(d => d.maturity_tier === tier).length;
    return acc;
  }, {} as Record<MaturityTier, number>);

  const avgMaturity = departments.length
    ? Math.round(departments.reduce((s, d) => s + (d.maturity_score ?? 0), 0) / departments.length)
    : 0;
  const avgCapacity = departments.length
    ? Math.round(departments.reduce((s, d) => s + (d.capacity_used ?? 0), 0) / departments.length)
    : 0;
  const overloaded = departments.filter(d => (d.capacity_used ?? 0) > 85).length;

  const filtered = [...departments]
    .filter(d => filter === "All" || d.maturity_tier === filter)
    .sort((a, b) => {
      const av = (a[sortKey] ?? 0) as number;
      const bv = (b[sortKey] ?? 0) as number;
      return sortDir === "desc" ? bv - av : av - bv;
    });

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortDir(d => d === "desc" ? "asc" : "desc");
    else { setSortKey(key); setSortDir("desc"); }
  }

  const deptInsightsFor = (name: string) => allInsights.filter(i => i.department === name);

  // Adapt DB row to DepartmentCard's expected shape (camelCase)
  function adaptDept(d: NonNullable<LiveDept>) {
    return {
      id: d.id,
      name: d.name,
      head: d.head ?? "—",
      headcount: d.headcount ?? 0,
      capacityUsed: d.capacity_used ?? 0,
      riskScore: d.risk_score ?? 0,
      executionHealth: d.execution_health ?? 0,
      maturityScore: d.maturity_score ?? 0,
      maturityTier: (d.maturity_tier ?? "Foundational") as MaturityTier,
      activeInitiatives: d.active_initiatives ?? 0,
      blockedTasks: d.blocked_tasks ?? 0,
      signal: (d.signal ?? "blue") as any,
      keyKPIs: Array.isArray(d.key_kpis) ? d.key_kpis as any : [],
      coreResponsibilities: d.core_responsibilities ?? [],
      keyFunctions: d.key_functions ?? [],
      authorityLevel: (d.authority_level ?? "Manager") as any,
      sopAdherence: d.sop_adherence ?? 0,
      decisionRights: d.decision_rights ?? [],
      frameworks: (d.frameworks ?? []) as any[],
    };
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 animate-spin text-electric-blue" />
        <span className="ml-3 text-muted-foreground">Loading departments…</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <div className="page-header bg-card">
        <div className="relative flex items-center justify-center gap-4">
          <div className="text-center">
            <div className="section-label mb-1.5">Organization</div>
            <h1 className="text-2xl font-black text-foreground tracking-tight mb-1">Department Engine</h1>
            <p className="text-sm text-muted-foreground">
              {departments.length} departments · Operational Maturity Scoring · CMMI-based assessment
            </p>
          </div>
          <div className="absolute right-0 flex gap-3">
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
              const count = tierCounts[tier] ?? 0;
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
          {departments.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground text-sm">No departments yet. Complete onboarding to generate your org data.</div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-secondary/40">
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide">#</th>
                  <th className="text-left px-3 py-2.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Department</th>
                  <th className="text-center px-3 py-2.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide cursor-pointer hover:text-foreground" onClick={() => toggleSort("maturity_score")}>
                    Maturity {sortKey === "maturity_score" ? (sortDir === "desc" ? "↓" : "↑") : ""}
                  </th>
                  <th className="text-center px-3 py-2.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide cursor-pointer hover:text-foreground hidden md:table-cell" onClick={() => toggleSort("execution_health")}>
                    Exec Health {sortKey === "execution_health" ? (sortDir === "desc" ? "↓" : "↑") : ""}
                  </th>
                  <th className="text-center px-3 py-2.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide cursor-pointer hover:text-foreground hidden lg:table-cell" onClick={() => toggleSort("capacity_used")}>
                    Capacity {sortKey === "capacity_used" ? (sortDir === "desc" ? "↓" : "↑") : ""}
                  </th>
                  <th className="text-center px-3 py-2.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide cursor-pointer hover:text-foreground hidden lg:table-cell" onClick={() => toggleSort("risk_score")}>
                    Risk Score {sortKey === "risk_score" ? (sortDir === "desc" ? "↓" : "↑") : ""}
                  </th>
                  <th className="text-center px-3 py-2.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide hidden xl:table-cell">
                    6-Mo Trend
                  </th>
                  <th className="text-left px-3 py-2.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Lead</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((dept, idx) => (
                  <tr key={dept.id} className="hover:bg-secondary/30 transition-colors cursor-pointer group" onClick={() => setSelectedDept(dept)}>
                    <td className="px-4 py-3 text-xs font-mono text-muted-foreground">{idx + 1}</td>
                    <td className="px-3 py-3">
                      <div className="font-semibold text-foreground group-hover:text-electric-blue transition-colors">{dept.name}</div>
                      <MaturityBadge tier={(dept.maturity_tier ?? "Foundational") as MaturityTier} score={dept.maturity_score ?? 0} />
                    </td>
                    <td className="px-3 py-3 text-center">
                      <ScoreBadge score={dept.maturity_score ?? 0} signal={getScoreSignal(dept.maturity_score ?? 0)} size="sm" />
                    </td>
                    <td className="px-3 py-3 hidden md:table-cell min-w-[110px]">
                      <ScoreBar value={dept.execution_health ?? 0} signal={getScoreSignal(dept.execution_health ?? 0)} />
                    </td>
                    <td className="px-3 py-3 text-center hidden lg:table-cell">
                      <span className={cn("text-xs font-mono font-bold px-2 py-0.5 rounded",
                        (dept.capacity_used ?? 0) > 90 ? "text-signal-red bg-signal-red/10" : (dept.capacity_used ?? 0) > 75 ? "text-signal-yellow bg-signal-yellow/10" : "text-signal-green bg-signal-green/10"
                      )}>{dept.capacity_used ?? 0}%</span>
                    </td>
                    <td className="px-3 py-3 text-center hidden lg:table-cell">
                      <span className={cn("text-xs font-mono font-bold",
                        (dept.risk_score ?? 0) > 70 ? "text-signal-red" : (dept.risk_score ?? 0) > 50 ? "text-signal-yellow" : "text-signal-green"
                      )}>{dept.risk_score ?? 0}</span>
                    </td>
                    <td className="px-3 py-3 hidden xl:table-cell">
                      <div className="flex items-center justify-center">
                        <MiniSparkline
                          values={mockTrend(dept.maturity_score ?? 50, (dept.maturity_score ?? 50) + (dept.execution_health ?? 50))}
                          color="auto"
                        />
                      </div>
                    </td>
                    <td className="px-3 py-3 text-xs text-muted-foreground">{dept.head ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div>
          <h2 className="section-label mb-3 flex items-center gap-2">
            <span>Department Detail Cards</span>
            <span className="text-muted-foreground/50">·</span>
            <span>{filtered.length} shown</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map(dept => (
              <div key={dept.id} className="cursor-pointer" onClick={() => setSelectedDept(dept)}>
                <DepartmentCard dept={adaptDept(dept)} />
              </div>
            ))}
          </div>
        </div>
      </div>

      {selectedDept && (
        <DepartmentDetailPanel
          dept={selectedDept}
          deptInsights={deptInsightsFor(selectedDept.name)}
          onClose={() => setSelectedDept(null)}
        />
      )}
    </div>
  );
}
