import { initiatives, actionItems, directives, governanceLogs, departments, formatCurrency, getScoreSignal, getHealthStatusSignal, getRiskSeveritySignal } from "@/lib/pmoData";
import { ScoreBadge, SignalDot } from "@/components/ScoreBadge";
import { cn } from "@/lib/utils";
import {
  Calendar, DollarSign, User, Link, Filter, ArrowUpDown,
  ChevronDown, ChevronUp, CheckCircle, Clock,
  GitBranch, Target, Shield, FileText, X, Users, AlertTriangle, Flag
} from "lucide-react";
import { useState } from "react";
import type { InitiativeStatus, InitiativeCategory, Initiative } from "@/lib/pmoData";

// ── Initiative Category badge styles ──
const categoryStyles: Record<InitiativeCategory, { cls: string; label: string }> = {
  Directive:    { label: "Directive",    cls: "text-electric-blue bg-electric-blue/10 border-electric-blue/30" },
  Supportive:   { label: "Supportive",   cls: "text-teal bg-teal/10 border-teal/30" },
  Controlling:  { label: "Controlling",  cls: "text-signal-yellow bg-signal-yellow/10 border-signal-yellow/30" },
  Diagnostic:   { label: "Diagnostic",   cls: "text-signal-orange bg-signal-orange/10 border-signal-orange/30" },
  Strategic:    { label: "Strategic",    cls: "text-signal-green bg-signal-green/10 border-signal-green/30" },
};

// ── Status styles — updated color coding per user spec ──
// On Track = blue, Completed = green, Delayed = orange, Blocked → "Needs Attention" = distinct purple/amber
const statusStyles: Record<InitiativeStatus, { label: string; cls: string }> = {
  "On Track":  { label: "On Track",       cls: "text-electric-blue bg-electric-blue/10 border-electric-blue/30" },
  "At Risk":   { label: "Needs Attention", cls: "text-signal-orange bg-signal-orange/10 border-signal-orange/30" },
  "Delayed":   { label: "Delayed",        cls: "text-signal-orange bg-signal-orange/10 border-signal-orange/30" },
  "Blocked":   { label: "Needs Attention", cls: "text-signal-orange bg-signal-orange/10 border-signal-orange/30" },
  "Completed": { label: "Completed",      cls: "text-signal-green bg-signal-green/10 border-signal-green/30" },
};

// ── MOCHA colors ──
const mochaColors: Record<string, string> = {
  Responsible: "text-signal-green bg-signal-green/10",
  Accountable: "text-electric-blue bg-electric-blue/10",
  Consulted:   "text-signal-yellow bg-signal-yellow/10",
  Informed:    "text-muted-foreground bg-secondary",
};

// Map RACI → MOCHA labels
const raciToMocha: Record<string, { key: string; label: string; desc: string }> = {
  Responsible: { key: "O", label: "Owner", desc: "Overall responsibility for driving the project forward. One owner only." },
  Accountable: { key: "M", label: "Manager", desc: "Supports and holds owner accountable. Reviews progress, intervenes if off-track." },
  Consulted:   { key: "C", label: "Consulted", desc: "Provides input and perspective." },
  Informed:    { key: "H", label: "Helper / FYI", desc: "Actively contributes or stays informed." },
};

type SortKey = "priorityScore" | "strategicAlignment" | "dependencyRisk" | "completionPct";

function InitiativeDrawer({ ini, onClose }: { ini: Initiative; onClose: () => void }) {
  const [tab, setTab] = useState<"overview" | "actions" | "directives" | "governance" | "mocha" | "deadlines">("overview");
  const iniActions = actionItems.filter(a => a.initiativeId === ini.id);
  const iniDirectives = directives.filter(d => d.initiativeId === ini.id);
  const iniGovLogs = governanceLogs.filter(g => g.initiativeId === ini.id);
  const budgetPct = Math.round((ini.budgetUsed / ini.budget) * 100);
  const blockedBy = ini.dependencies.map(depId => initiatives.find(d => d.id === depId)).filter(Boolean) as Initiative[];
  const statusInfo = statusStyles[ini.status];

  // Decision deadlines from governance logs
  const decisionDeadlines = iniGovLogs.filter(g => g.type === "Decision");

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end">
      <div className="absolute inset-0 bg-foreground/20 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-2xl h-screen bg-card border-l-2 border-border shadow-elevated overflow-y-auto animate-slide-in-left">
        {/* Header */}
        <div className="sticky top-0 bg-card border-b-2 border-border px-5 py-4 z-10">
          <div className="flex items-start gap-3">
            <SignalDot signal={ini.signal} pulse={ini.signal === "red"} />
            <div className="flex-1 min-w-0">
              <h2 className="text-base font-bold text-foreground leading-tight">{ini.name}</h2>
              <div className="flex flex-wrap items-center gap-2 mt-1">
                <span className={cn("text-xs font-medium px-2 py-0.5 rounded border", statusInfo.cls)}>{statusInfo.label}</span>
                <span className={cn("text-xs font-medium px-2 py-0.5 rounded border", categoryStyles[ini.category].cls)}>{categoryStyles[ini.category].label}</span>
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
            {(["overview", "actions", "directives", "governance", "mocha", "deadlines"] as const).map(t => (
              <button key={t} onClick={() => setTab(t)}
                className={cn("text-xs px-3 py-1.5 rounded font-medium capitalize whitespace-nowrap transition-all",
                  tab === t ? "bg-electric-blue/10 text-electric-blue" : "text-muted-foreground hover:text-foreground"
                )}>
                {t === "mocha" ? "MOCHA" : t === "deadlines" ? "Deadlines" : t.charAt(0).toUpperCase() + t.slice(1)}
                {t === "actions" && iniActions.length > 0 && <span className="ml-1 text-xs bg-secondary rounded-full px-1">{iniActions.length}</span>}
                {t === "governance" && iniGovLogs.length > 0 && <span className="ml-1 text-xs bg-signal-red/10 text-signal-red rounded-full px-1">{iniGovLogs.length}</span>}
                {t === "deadlines" && decisionDeadlines.length > 0 && <span className="ml-1 text-xs bg-signal-orange/10 text-signal-orange rounded-full px-1">{decisionDeadlines.length}</span>}
              </button>
            ))}
          </div>
        </div>

        <div className="p-5 space-y-5">
          {/* OVERVIEW */}
          {tab === "overview" && (
            <>
              <p className="text-sm text-muted-foreground leading-relaxed">{ini.description}</p>

              {/* Needs Attention detail if blocked */}
              {(ini.status === "Blocked" || ini.status === "At Risk") && (
                <div className="bg-signal-orange/8 border-2 border-signal-orange/30 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Flag className="w-4 h-4 text-signal-orange" />
                    <span className="text-xs font-bold text-signal-orange uppercase tracking-wide">
                      {ini.status === "Blocked" ? "Bottleneck Identified" : "Attention Required"}
                    </span>
                  </div>
                  <p className="text-sm text-foreground/80">
                    {ini.status === "Blocked"
                      ? `This initiative has ${blockedBy.length} blocking dependenc${blockedBy.length === 1 ? "y" : "ies"} that must be resolved to move forward.`
                      : "This initiative is at risk. Review the risks and governance logs for details."}
                  </p>
                </div>
              )}

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

              {blockedBy.length > 0 && (
                <div>
                  <div className="text-xs font-semibold text-foreground uppercase tracking-wide mb-2 flex items-center gap-1.5">
                    <GitBranch className="w-3.5 h-3.5 text-signal-orange" /> Bottlenecks
                  </div>
                  <div className="space-y-2">
                    {blockedBy.map(dep => (
                      <div key={dep.id} className="flex items-center gap-2 p-2.5 bg-signal-orange/5 border border-signal-orange/20 rounded-lg">
                        <SignalDot signal={dep.signal} />
                        <span className="text-sm text-foreground flex-1">{dep.name}</span>
                        <span className={cn("text-xs px-1.5 py-0.5 rounded font-medium", statusStyles[dep.status].cls)}>{statusStyles[dep.status].label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
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
                        act.status === "Blocked" ? "text-signal-orange bg-signal-orange/10" :
                        act.status === "In Progress" ? "text-signal-yellow bg-signal-yellow/10" :
                        "text-muted-foreground bg-secondary"
                      )}>
                        {act.status === "Blocked" ? "Needs Attention" : act.status}
                      </span>
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
                  log.status === "Open" ? "border-signal-yellow/30" : ""
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

          {/* MOCHA */}
          {tab === "mocha" && (
            <div>
              <div className="text-xs text-muted-foreground mb-4">
                MOCHA accountability matrix — clarity on who drives, who approves, who supports.
              </div>
              {/* MOCHA legend */}
              <div className="grid grid-cols-5 gap-2 mb-5">
                {[
                  { key: "M", label: "Manager" },
                  { key: "O", label: "Owner" },
                  { key: "C", label: "Consulted" },
                  { key: "H", label: "Helper" },
                  { key: "A", label: "Approver" },
                ].map(r => (
                  <div key={r.key} className="bg-teal/8 border border-teal/25 rounded-lg p-2 text-center">
                    <div className="text-sm font-bold text-teal mb-0.5">{r.key}</div>
                    <div className="text-xs text-muted-foreground">{r.label}</div>
                  </div>
                ))}
              </div>
              <div className="space-y-2">
                {ini.raci.map((r, i) => {
                  const mocha = raciToMocha[r.type] || { key: "?", label: r.type, desc: "" };
                  return (
                    <div key={i} className="flex items-center gap-3 p-3 bg-secondary rounded-lg">
                      <div className="w-8 h-8 rounded-full bg-teal/15 border border-teal/30 flex items-center justify-center text-xs font-bold text-teal flex-shrink-0">
                        {mocha.key}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-foreground">{r.name}</div>
                        <div className="text-xs text-muted-foreground">{mocha.label} · {r.role}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* DECISION DEADLINES */}
          {tab === "deadlines" && (
            <div className="space-y-3">
              <div className="text-xs text-muted-foreground">{decisionDeadlines.length} decision points requiring action</div>
              {decisionDeadlines.length === 0 ? (
                <div className="text-sm text-muted-foreground text-center py-8">No decision deadlines recorded</div>
              ) : decisionDeadlines.map(d => (
                <div key={d.id} className="bg-signal-orange/8 border-2 border-signal-orange/30 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Clock className="w-4 h-4 text-signal-orange mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <div className="text-sm font-semibold text-foreground mb-1">{d.title}</div>
                      <p className="text-xs text-muted-foreground leading-relaxed mb-2">{d.notes}</p>
                      <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1"><User className="w-3 h-3" /> {d.owner}</span>
                        <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {d.createdDate}</span>
                        <span className={cn("px-1.5 py-0.5 rounded font-medium",
                          d.status === "Escalated" ? "text-signal-red bg-signal-red/10" :
                          d.status === "Open" ? "text-signal-orange bg-signal-orange/10" :
                          "text-signal-green bg-signal-green/10"
                        )}>{d.status}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
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

  const pillarMap: Record<string, number> = {};
  initiatives.forEach(i => { pillarMap[i.strategicPillar] = (pillarMap[i.strategicPillar] || 0) + 1; });

  // Decision deadlines count across all initiatives
  const totalDecisionDeadlines = governanceLogs.filter(g => g.type === "Decision" && g.status !== "Resolved").length;

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

      {/* Decision Deadlines banner */}
      {totalDecisionDeadlines > 0 && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl border-2 border-signal-orange/30 bg-signal-orange/6">
          <Clock className="w-4 h-4 text-signal-orange flex-shrink-0" />
          <span className="text-sm text-signal-orange font-semibold">
            {totalDecisionDeadlines} decision deadline{totalDecisionDeadlines > 1 ? "s" : ""} pending — click an initiative to review
          </span>
        </div>
      )}

      {/* Status Color Key */}
      <div className="flex flex-wrap items-center gap-2 px-4 py-3 bg-card border-2 border-border rounded-xl">
        <span className="text-xs font-bold text-foreground uppercase tracking-wide mr-2">Status Key:</span>
        {[
          { label: "On Track", cls: "text-electric-blue bg-electric-blue/10 border-electric-blue/30" },
          { label: "Needs Attention", cls: "text-signal-orange bg-signal-orange/10 border-signal-orange/30" },
          { label: "Delayed", cls: "text-signal-orange bg-signal-orange/10 border-signal-orange/30" },
          { label: "Completed", cls: "text-signal-green bg-signal-green/10 border-signal-green/30" },
        ].map(s => (
          <span key={s.label} className={cn("text-xs font-medium px-2.5 py-1 rounded-full border", s.cls)}>{s.label}</span>
        ))}
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {(["On Track", "At Risk", "Blocked", "Delayed", "Completed"] as const).map((status) => {
          const info = statusStyles[status];
          return (
            <button key={status} onClick={() => setFilter(status)}
              className={cn("bg-card rounded-lg border p-3 text-left transition-all shadow-card hover:shadow-elevated",
                filter === status ? "ring-2 ring-electric-blue" : ""
              )}>
              <div className={cn("text-2xl font-bold font-mono mb-0.5", info.cls.split(" ")[0])}>
                {statusCounts[status] || 0}
              </div>
              <div className="text-xs text-muted-foreground">{info.label}</div>
            </button>
          );
        })}
      </div>

      {/* Filter + sort bar */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Filter className="w-3.5 h-3.5" /> Filter:
        </div>
        {(["All", "On Track", "At Risk", "Blocked", "Delayed", "Completed"] as const).map((s) => {
          const info = s === "All" ? null : statusStyles[s];
          return (
            <button key={s} onClick={() => setFilter(s)}
              className={cn("text-xs px-2.5 py-1 rounded-full border transition-all",
                filter === s
                  ? "bg-electric-blue/10 text-electric-blue border-electric-blue/40 font-medium"
                  : "bg-card text-muted-foreground border-border hover:border-foreground/20"
              )}>
              {info ? info.label : "All"} {s !== "All" && `(${statusCounts[s] || 0})`}
            </button>
          );
        })}

        <div className="ml-auto flex items-center gap-1 text-xs text-muted-foreground">
          <ArrowUpDown className="w-3.5 h-3.5" /> Sort:
        </div>
        {([
          ["priorityScore", "Priority"],
          ["strategicAlignment", "Alignment"],
          ["dependencyRisk", "Risk"],
          ["completionPct", "Progress"],
        ] as [SortKey, string][]).map(([key, label]) => (
          <button key={key} onClick={() => setSortKey(key)}
            className={cn("text-xs px-2.5 py-1 rounded-full border transition-all",
              sortKey === key ? "bg-electric-blue/10 text-electric-blue border-electric-blue/40 font-medium" :
              "bg-card text-muted-foreground border-border hover:border-foreground/20"
            )}>
            {label}
          </button>
        ))}
      </div>

      {/* Initiative table */}
      <div className="bg-card rounded-lg border-2 border-border shadow-card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b-2 border-border bg-secondary/60">
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Initiative</th>
              <th className="text-left px-3 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Status</th>
              <th className="text-center px-3 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Priority</th>
              <th className="text-center px-3 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Alignment</th>
              <th className="text-center px-3 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Dep. Risk</th>
              <th className="text-left px-3 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Progress</th>
              <th className="text-left px-3 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Budget</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filtered.map((ini) => {
              const budgetPct = Math.round((ini.budgetUsed / ini.budget) * 100);
              const statusInfo = statusStyles[ini.status];
              const hasDeadlines = governanceLogs.some(g => g.initiativeId === ini.id && g.type === "Decision" && g.status !== "Resolved");
              return (
                <tr key={ini.id} className="hover:bg-secondary/30 transition-colors cursor-pointer" onClick={() => setSelectedIni(ini)}>
                  <td className="px-4 py-3">
                    <div className="flex items-start gap-2">
                      <SignalDot signal={ini.signal} />
                      <div className="min-w-0">
                        <div className="font-medium text-foreground text-sm truncate max-w-[180px] flex items-center gap-1.5">
                          {ini.name}
                          {hasDeadlines && <Clock className="w-3 h-3 text-signal-orange flex-shrink-0" />}
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className={cn("text-xs font-medium px-1.5 py-0.5 rounded border", categoryStyles[ini.category].cls)}>
                            {categoryStyles[ini.category].label}
                          </span>
                          <span className="text-xs text-muted-foreground flex items-center gap-0.5">
                            <User className="w-3 h-3" />
                            {ini.owner.split(" ")[0]}
                          </span>
                          {ini.dependencies.length > 0 && (
                            <span className="text-xs text-signal-orange flex items-center gap-0.5">
                              <Link className="w-3 h-3" />
                              {ini.dependencies.length} dep.
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-3">
                    <span className={cn("text-xs font-medium px-2 py-0.5 rounded border whitespace-nowrap", statusInfo.cls)}>
                      {statusInfo.label}
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
                  <td className="px-3 py-3 min-w-[100px]">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                        <div className={cn("h-full rounded-full",
                          ini.completionPct >= 70 ? "bg-signal-green" :
                          ini.completionPct >= 40 ? "bg-electric-blue" :
                          "bg-signal-yellow"
                        )} style={{ width: `${ini.completionPct}%` }} />
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
      <p className="text-xs text-muted-foreground text-center">Click any initiative to view detail, MOCHA, governance logs, decision deadlines, and action items</p>

      {selectedIni && <InitiativeDrawer ini={selectedIni} onClose={() => setSelectedIni(null)} />}
    </div>
  );
}
