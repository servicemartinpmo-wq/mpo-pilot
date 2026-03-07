import { initiatives, actionItems, directives, governanceLogs, departments, formatCurrency, getScoreSignal, getHealthStatusSignal, getRiskSeveritySignal } from "@/lib/pmoData";
import { ScoreBadge, SignalDot } from "@/components/ScoreBadge";
import { cn } from "@/lib/utils";
import {
  Calendar, DollarSign, User, Link, Filter, ArrowUpDown,
  ChevronDown, ChevronUp, AlertTriangle, CheckCircle, Clock,
  GitBranch, Target, Shield, FileText, X, Users
} from "lucide-react";
import { useState } from "react";
import type { InitiativeStatus, Initiative } from "@/lib/pmoData";

const statusStyles: Record<InitiativeStatus, string> = {
  "On Track": "text-signal-green bg-signal-green/10 border-signal-green/30",
  "At Risk": "text-signal-yellow bg-signal-yellow/10 border-signal-yellow/30",
  Delayed: "text-signal-yellow bg-signal-yellow/10 border-signal-yellow/30",
  Blocked: "text-signal-red bg-signal-red/10 border-signal-red/30",
  Completed: "text-electric-blue bg-electric-blue/10 border-electric-blue/30",
};

const raciColors = {
  Responsible: "text-signal-green bg-signal-green/10",
  Accountable: "text-electric-blue bg-electric-blue/10",
  Consulted: "text-signal-yellow bg-signal-yellow/10",
  Informed: "text-muted-foreground bg-secondary",
};

type SortKey = "priorityScore" | "strategicAlignment" | "dependencyRisk" | "completionPct";

function InitiativeDrawer({ ini, onClose }: { ini: Initiative; onClose: () => void }) {
  const [tab, setTab] = useState<"overview" | "actions" | "directives" | "governance" | "raci">("overview");
  const iniActions = actionItems.filter(a => a.initiativeId === ini.id);
  const iniDirectives = directives.filter(d => d.initiativeId === ini.id);
  const iniGovLogs = governanceLogs.filter(g => g.initiativeId === ini.id);
  const budgetPct = Math.round((ini.budgetUsed / ini.budget) * 100);
  const budgetSignal = getScoreSignal(budgetPct > 90 ? 20 : budgetPct > 70 ? 50 : 80);
  const blockedBy = ini.dependencies.map(depId => initiatives.find(d => d.id === depId)).filter(Boolean) as Initiative[];

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end">
      <div className="absolute inset-0 bg-foreground/20 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-2xl h-screen bg-card border-l shadow-elevated overflow-y-auto animate-slide-in-left">
        {/* Header */}
        <div className="sticky top-0 bg-card border-b px-5 py-4 z-10">
          <div className="flex items-start gap-3">
            <SignalDot signal={ini.signal} pulse={ini.signal === "red"} />
            <div className="flex-1 min-w-0">
              <h2 className="text-base font-bold text-foreground leading-tight">{ini.name}</h2>
              <div className="flex flex-wrap items-center gap-2 mt-1">
                <span className={cn("text-xs font-medium px-2 py-0.5 rounded border", statusStyles[ini.status])}>{ini.status}</span>
                <span className="text-xs text-muted-foreground">{ini.department}</span>
                <span className="text-xs text-muted-foreground">·</span>
                <span className="text-xs text-muted-foreground">{ini.strategicPillar}</span>
              </div>
            </div>
            <button onClick={onClose} className="p-1.5 rounded hover:bg-secondary transition-colors flex-shrink-0">
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-0.5 mt-3 -mx-1 overflow-x-auto">
            {(["overview", "actions", "directives", "governance", "raci"] as const).map(t => (
              <button key={t} onClick={() => setTab(t)}
                className={cn("text-xs px-3 py-1.5 rounded font-medium capitalize whitespace-nowrap transition-all",
                  tab === t ? "bg-electric-blue/10 text-electric-blue" : "text-muted-foreground hover:text-foreground"
                )}>
                {t === "raci" ? "RACI" : t.charAt(0).toUpperCase() + t.slice(1)}
                {t === "actions" && iniActions.length > 0 && <span className="ml-1 text-xs bg-secondary rounded-full px-1">{iniActions.length}</span>}
                {t === "governance" && iniGovLogs.length > 0 && <span className="ml-1 text-xs bg-signal-red/10 text-signal-red rounded-full px-1">{iniGovLogs.length}</span>}
              </button>
            ))}
          </div>
        </div>

        <div className="p-5 space-y-5">
          {/* OVERVIEW */}
          {tab === "overview" && (
            <>
              <p className="text-sm text-muted-foreground leading-relaxed">{ini.description}</p>

              {/* Score bar */}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-secondary rounded-lg p-3 text-center">
                  <div className="text-xs text-muted-foreground mb-1">Priority Score</div>
                  <ScoreBadge score={ini.priorityScore} signal={getScoreSignal(ini.priorityScore)} size="lg" showLabel />
                </div>
                <div className="bg-secondary rounded-lg p-3 text-center">
                  <div className="text-xs text-muted-foreground mb-1">Strategic Alignment</div>
                  <ScoreBadge score={ini.strategicAlignment} signal={getScoreSignal(ini.strategicAlignment)} size="lg" showLabel />
                </div>
                <div className="bg-secondary rounded-lg p-3 text-center">
                  <div className="text-xs text-muted-foreground mb-1">Dependency Risk</div>
                  <ScoreBadge score={ini.dependencyRisk} signal={getScoreSignal(100 - ini.dependencyRisk)} size="lg" showLabel />
                </div>
              </div>

              {/* Budget */}
              <div className="bg-card border rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <DollarSign className="w-3.5 h-3.5 text-muted-foreground" />
                  <span className="text-xs font-semibold text-foreground uppercase tracking-wide">Budget</span>
                </div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm font-mono font-bold text-foreground">{formatCurrency(ini.budgetUsed)}</span>
                  <span className="text-xs text-muted-foreground">of {formatCurrency(ini.budget)}</span>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <div className={cn("h-full rounded-full transition-all",
                    budgetPct > 90 ? "bg-signal-red" : budgetPct > 70 ? "bg-signal-yellow" : "bg-signal-green"
                  )} style={{ width: `${budgetPct}%` }} />
                </div>
                <div className="text-xs text-muted-foreground mt-1">{budgetPct}% deployed · {formatCurrency(ini.budget - ini.budgetUsed)} remaining</div>
              </div>

              {/* Progress */}
              <div className="bg-card border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-foreground uppercase tracking-wide">Completion</span>
                  <span className="text-sm font-mono font-bold text-foreground">{ini.completionPct}%</span>
                </div>
                <div className="h-2.5 rounded-full bg-muted overflow-hidden">
                  <div className={cn("h-full rounded-full",
                    ini.completionPct >= 70 ? "bg-signal-green" : ini.completionPct >= 40 ? "bg-electric-blue" : "bg-signal-yellow"
                  )} style={{ width: `${ini.completionPct}%` }} />
                </div>
                <div className="flex justify-between text-xs text-muted-foreground mt-1.5">
                  <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {ini.startDate}</span>
                  <span className="flex items-center gap-1"><Target className="w-3 h-3" /> {ini.targetDate}</span>
                </div>
              </div>

              {/* Owners */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-secondary rounded-lg p-3">
                  <div className="text-xs text-muted-foreground mb-1">Operational Owner</div>
                  <div className="text-sm font-medium text-foreground flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-muted-foreground" /> {ini.owner}
                  </div>
                </div>
                <div className="bg-secondary rounded-lg p-3">
                  <div className="text-xs text-muted-foreground mb-1">Executive Sponsor</div>
                  <div className="text-sm font-medium text-foreground flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-muted-foreground" /> {ini.executiveOwner}
                  </div>
                </div>
              </div>

              {/* KPIs */}
              <div>
                <div className="text-xs font-semibold text-foreground uppercase tracking-wide mb-2">Key Performance Indicators</div>
                <div className="space-y-1.5">
                  {ini.kpis.map((kpi, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm">
                      <Target className="w-3 h-3 text-electric-blue flex-shrink-0" />
                      <span className="text-foreground/80">{kpi}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Risks */}
              <div>
                <div className="text-xs font-semibold text-foreground uppercase tracking-wide mb-2 flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-signal-red" /> Risk Register
                </div>
                <div className="space-y-2">
                  {ini.risks.map((risk, i) => (
                    <div key={i} className="bg-card border rounded-lg p-3">
                      <div className="text-sm text-foreground mb-1.5">{risk.label}</div>
                      <div className="flex gap-2">
                        <span className={cn("text-xs px-1.5 py-0.5 rounded font-medium",
                          risk.probability === "High" ? "text-signal-red bg-signal-red/10" :
                          risk.probability === "Medium" ? "text-signal-yellow bg-signal-yellow/10" :
                          "text-signal-green bg-signal-green/10"
                        )}>P: {risk.probability}</span>
                        <span className={cn("text-xs px-1.5 py-0.5 rounded font-medium",
                          risk.impact === "High" ? "text-signal-red bg-signal-red/10" :
                          risk.impact === "Medium" ? "text-signal-yellow bg-signal-yellow/10" :
                          "text-signal-green bg-signal-green/10"
                        )}>I: {risk.impact}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Dependencies */}
              {blockedBy.length > 0 && (
                <div>
                  <div className="text-xs font-semibold text-foreground uppercase tracking-wide mb-2 flex items-center gap-1.5">
                    <GitBranch className="w-3.5 h-3.5 text-signal-yellow" /> Blocked By
                  </div>
                  <div className="space-y-2">
                    {blockedBy.map(dep => (
                      <div key={dep.id} className="flex items-center gap-2 p-2.5 bg-signal-yellow/5 border border-signal-yellow/20 rounded-lg">
                        <SignalDot signal={dep.signal} />
                        <span className="text-sm text-foreground flex-1">{dep.name}</span>
                        <span className={cn("text-xs px-1.5 py-0.5 rounded font-medium", statusStyles[dep.status])}>{dep.status}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Frameworks */}
              <div>
                <div className="text-xs font-semibold text-foreground uppercase tracking-wide mb-2">Applied Frameworks</div>
                <div className="flex flex-wrap gap-1.5">
                  {ini.frameworks.map(f => (
                    <span key={f} className="text-xs bg-electric-blue/10 text-electric-blue border border-electric-blue/20 px-2 py-0.5 rounded font-medium">{f}</span>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* ACTION ITEMS */}
          {tab === "actions" && (
            <div className="space-y-3">
              <div className="text-xs text-muted-foreground">{iniActions.length} action items linked to this initiative</div>
              {iniActions.length === 0 ? (
                <div className="text-sm text-muted-foreground text-center py-8">No action items recorded</div>
              ) : iniActions.map(act => (
                <div key={act.id} className="bg-card border rounded-lg p-4">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <span className={cn("text-xs font-medium px-1.5 py-0.5 rounded",
                        act.status === "Completed" ? "text-signal-green bg-signal-green/10" :
                        act.status === "Blocked" ? "text-signal-red bg-signal-red/10" :
                        act.status === "In Progress" ? "text-electric-blue bg-electric-blue/10" :
                        "text-muted-foreground bg-secondary"
                      )}>{act.status}</span>
                      <span className={cn("text-xs px-1.5 py-0.5 rounded",
                        act.priority === "High" ? "text-signal-red bg-signal-red/8" :
                        act.priority === "Medium" ? "text-signal-yellow bg-signal-yellow/8" :
                        "text-muted-foreground bg-secondary"
                      )}>{act.priority} Priority</span>
                    </div>
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Calendar className="w-3 h-3" /> {act.dueDate}
                    </span>
                  </div>
                  <div className="text-sm font-medium text-foreground mb-1">{act.title}</div>
                  <div className="text-xs text-muted-foreground mb-2">{act.description}</div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <User className="w-3 h-3" /> {act.assignedTo}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* DIRECTIVES */}
          {tab === "directives" && (
            <div className="space-y-3">
              <div className="text-xs text-muted-foreground">{iniDirectives.length} operational directives</div>
              {iniDirectives.length === 0 ? (
                <div className="text-sm text-muted-foreground text-center py-8">No directives generated</div>
              ) : iniDirectives.map(dir => (
                <div key={dir.id} className="bg-card border rounded-lg p-4">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className={cn("text-xs font-medium px-1.5 py-0.5 rounded",
                      dir.status === "Completed" ? "text-signal-green bg-signal-green/10" :
                      dir.status === "In Progress" ? "text-electric-blue bg-electric-blue/10" :
                      "text-muted-foreground bg-secondary"
                    )}>{dir.status}</span>
                    <span className={cn("text-xs px-1.5 py-0.5 rounded",
                      dir.priority === "High" ? "text-signal-red bg-signal-red/8" :
                      "text-signal-yellow bg-signal-yellow/8"
                    )}>{dir.priority}</span>
                  </div>
                  <div className="text-sm font-semibold text-foreground mb-1">{dir.title}</div>
                  <div className="text-sm text-muted-foreground leading-relaxed">{dir.description}</div>
                  <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><User className="w-3 h-3" /> {dir.owner}</span>
                    {dir.dueDate && <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {dir.dueDate}</span>}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* GOVERNANCE */}
          {tab === "governance" && (
            <div className="space-y-3">
              <div className="text-xs text-muted-foreground">{iniGovLogs.length} governance entries</div>
              {iniGovLogs.length === 0 ? (
                <div className="text-sm text-muted-foreground text-center py-8">No governance logs</div>
              ) : iniGovLogs.map(log => (
                <div key={log.id} className={cn("bg-card border rounded-lg p-4",
                  log.status === "Escalated" ? "border-signal-red/30" :
                  log.status === "Open" ? "border-signal-yellow/30" :
                  ""
                )}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className={cn("text-xs font-medium px-1.5 py-0.5 rounded border",
                      log.type === "Risk" ? "text-signal-red bg-signal-red/10 border-signal-red/30" :
                      log.type === "Decision" ? "text-electric-blue bg-electric-blue/10 border-electric-blue/30" :
                      "text-signal-yellow bg-signal-yellow/10 border-signal-yellow/30"
                    )}>{log.type}</span>
                    <span className={cn("text-xs px-1.5 py-0.5 rounded font-medium",
                      log.status === "Escalated" ? "text-signal-red bg-signal-red/10" :
                      log.status === "Open" ? "text-signal-yellow bg-signal-yellow/10" :
                      log.status === "In Review" ? "text-electric-blue bg-electric-blue/10" :
                      "text-signal-green bg-signal-green/10"
                    )}>{log.status}</span>
                    <span className="ml-auto text-xs text-muted-foreground">Severity: <span className={cn("font-mono font-bold",
                      log.severity >= 8 ? "text-signal-red" : log.severity >= 6 ? "text-signal-yellow" : "text-signal-green"
                    )}>{log.severity}/10</span></span>
                  </div>
                  <div className="text-sm font-semibold text-foreground mb-1">{log.title}</div>
                  <div className="text-sm text-muted-foreground leading-relaxed">{log.notes}</div>
                  <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><User className="w-3 h-3" /> {log.owner}</span>
                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {log.createdDate}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* RACI */}
          {tab === "raci" && (
            <div>
              <div className="text-xs text-muted-foreground mb-3">Responsibility Assignment Matrix</div>
              <div className="space-y-2">
                {ini.raci.map((r, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 bg-secondary rounded-lg">
                    <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center text-xs font-semibold text-muted-foreground flex-shrink-0">
                      {r.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-foreground">{r.name}</div>
                      <div className="text-xs text-muted-foreground">{r.role}</div>
                    </div>
                    <span className={cn("text-xs font-semibold px-2 py-0.5 rounded", raciColors[r.type])}>{r.type}</span>
                  </div>
                ))}
              </div>
              <div className="mt-4 grid grid-cols-2 gap-2">
                {(Object.entries(raciColors) as [string, string][]).map(([label, cls]) => (
                  <div key={label} className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span className={cn("px-1.5 py-0.5 rounded text-xs font-semibold", cls)}>{label[0]}</span>
                    <span>{label}</span>
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

export default function Initiatives() {
  const [filter, setFilter] = useState<InitiativeStatus | "All">("All");
  const [sortKey, setSortKey] = useState<SortKey>("priorityScore");
  const [selectedIni, setSelectedIni] = useState<Initiative | null>(null);

  const filtered = [...initiatives]
    .filter((i) => filter === "All" || i.status === filter)
    .sort((a, b) => b[sortKey] - a[sortKey]);

  const statusCounts: Record<string, number> = { All: initiatives.length };
  initiatives.forEach((i) => {
    statusCounts[i.status] = (statusCounts[i.status] || 0) + 1;
  });

  // Pillar breakdown
  const pillarMap: Record<string, number> = {};
  initiatives.forEach(i => { pillarMap[i.strategicPillar] = (pillarMap[i.strategicPillar] || 0) + 1; });

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground mb-0.5">Initiative Management</h1>
          <p className="text-sm text-muted-foreground">
            {initiatives.length} initiatives · Priority-scored against strategic OKRs and pillars
          </p>
        </div>
        <div className="text-right text-xs text-muted-foreground">
          <div className="font-medium text-foreground mb-1">Strategic Pillars</div>
          {Object.entries(pillarMap).map(([pillar, count]) => (
            <div key={pillar} className="flex items-center gap-2 justify-end">
              <span className="text-muted-foreground">{pillar}</span>
              <span className="font-mono font-semibold text-foreground w-4 text-right">{count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {(["On Track", "At Risk", "Blocked", "Delayed", "Completed"] as const).map((status) => (
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
              return (
                <tr
                  key={ini.id}
                  className="hover:bg-secondary/30 transition-colors cursor-pointer"
                  onClick={() => setSelectedIni(ini)}
                >
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
      <p className="text-xs text-muted-foreground text-center">Click any initiative row to view full detail, RACI, governance logs, and action items</p>

      {/* Detail Drawer */}
      {selectedIni && (
        <InitiativeDrawer ini={selectedIni} onClose={() => setSelectedIni(null)} />
      )}
    </div>
  );
}
