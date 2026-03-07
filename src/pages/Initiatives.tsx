import {
  initiatives, actionItems, directives, governanceLogs, departments,
  formatCurrency, getScoreSignal
} from "@/lib/pmoData";
import { ScoreBadge, SignalDot } from "@/components/ScoreBadge";
import { cn } from "@/lib/utils";
import {
  Calendar, DollarSign, User, Filter, ArrowUpDown,
  CheckCircle, Clock, GitBranch, Target, Shield, X, AlertTriangle, Flag,
  ChevronDown, ChevronUp, Search, ArrowUpRight, Sparkles
} from "lucide-react";
import { useState, useMemo } from "react";
import type { InitiativeStatus, InitiativeCategory, Initiative } from "@/lib/pmoData";

// ── Status color coding per spec ──
// Outstanding/Delayed = Purple | Needs Attention/Blocked = Orange | On Track = Yellow | Abandoned/Dropped = Red | Completed = Green
const statusStyles: Record<InitiativeStatus, { label: string; dot: string; badge: string; border: string; bg: string }> = {
  "On Track": {
    label: "On Track",
    dot: "bg-signal-yellow",
    badge: "text-signal-yellow",
    border: "border-signal-yellow/40",
    bg: "bg-signal-yellow/8",
  },
  "At Risk": {
    label: "Needs Attention",
    dot: "bg-signal-orange",
    badge: "text-signal-orange",
    border: "border-signal-orange/40",
    bg: "bg-signal-orange/8",
  },
  "Delayed": {
    label: "Outstanding / Delayed",
    dot: "bg-signal-purple",
    badge: "text-signal-purple",
    border: "border-signal-purple/40",
    bg: "bg-signal-purple/10",
  },
  "Blocked": {
    label: "Needs Attention",
    dot: "bg-signal-orange",
    badge: "text-signal-orange",
    border: "border-signal-orange/40",
    bg: "bg-signal-orange/8",
  },
  "Completed": {
    label: "Completed",
    dot: "bg-signal-green",
    badge: "text-signal-green",
    border: "border-signal-green/40",
    bg: "bg-signal-green/8",
  },
};

// ── Category badge ──
const categoryStyles: Record<InitiativeCategory, { label: string; cls: string }> = {
  Directive:   { label: "Directive",   cls: "text-electric-blue bg-electric-blue/10 border-electric-blue/30" },
  Supportive:  { label: "Supportive",  cls: "text-teal bg-teal/10 border-teal/30" },
  Controlling: { label: "Controlling", cls: "text-signal-yellow bg-signal-yellow/10 border-signal-yellow/30" },
  Diagnostic:  { label: "Diagnostic",  cls: "text-signal-orange bg-signal-orange/10 border-signal-orange/30" },
  Strategic:   { label: "Strategic",   cls: "text-signal-green bg-signal-green/10 border-signal-green/30" },
};

const raciToMocha: Record<string, { key: string; label: string }> = {
  Responsible: { key: "O", label: "Owner" },
  Accountable: { key: "M", label: "Manager" },
  Consulted:   { key: "C", label: "Consulted" },
  Informed:    { key: "H", label: "Helper / FYI" },
};

type SortKey = "impactScore" | "dependencyRisk" | "completionPct" | "targetDate";

// Impact Score = weighted average of priorityScore (60%) + strategicAlignment (40%)
function getImpactScore(ini: Initiative): number {
  return Math.round(ini.priorityScore * 0.6 + ini.strategicAlignment * 0.4);
}

// ────────────────────────────────────────────────
// DETAIL MODAL
// ────────────────────────────────────────────────
function InitiativeModal({ ini, onClose }: { ini: Initiative; onClose: () => void }) {
  const [tab, setTab] = useState<"overview" | "actions" | "directives" | "governance" | "mocha" | "deadlines">("overview");
  const iniActions   = actionItems.filter(a => a.initiativeId === ini.id);
  const iniDirectives = directives.filter(d => d.initiativeId === ini.id);
  const iniGovLogs   = governanceLogs.filter(g => g.initiativeId === ini.id);
  const budgetPct    = Math.round((ini.budgetUsed / ini.budget) * 100);
  const blockedBy    = ini.dependencies.map(depId => initiatives.find(d => d.id === depId)).filter(Boolean) as Initiative[];
  const statusInfo   = statusStyles[ini.status];
  const decisionDeadlines = iniGovLogs.filter(g => g.type === "Decision");

  const tabs = [
    { key: "overview",    label: "Overview" },
    { key: "actions",     label: `Actions (${iniActions.length})` },
    { key: "directives",  label: `Directives (${iniDirectives.length})` },
    { key: "governance",  label: `Governance (${iniGovLogs.length})` },
    { key: "mocha",       label: "MOCHA" },
    { key: "deadlines",   label: `Deadlines (${decisionDeadlines.length})` },
  ] as const;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end">
      <div className="absolute inset-0 bg-foreground/25 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-2xl h-screen bg-card border-l-2 border-border shadow-elevated overflow-y-auto animate-slide-in-left">

        {/* Header */}
        <div className="sticky top-0 bg-card border-b-2 border-border z-10">
          <div className="px-5 py-4 flex items-start gap-3">
            <div className={cn("w-3 h-3 rounded-full mt-1.5 flex-shrink-0", statusInfo.dot)} />
            <div className="flex-1 min-w-0">
              <h2 className="text-base font-bold text-foreground leading-tight">{ini.name}</h2>
              <div className="flex flex-wrap items-center gap-2 mt-1.5">
                <span className={cn("text-xs font-bold px-2.5 py-0.5 rounded-full border", statusInfo.badge, statusInfo.border, statusInfo.bg)}>
                  {statusInfo.label}
                </span>
                <span className={cn("text-xs font-medium px-2 py-0.5 rounded border", categoryStyles[ini.category].cls)}>
                  {categoryStyles[ini.category].label}
                </span>
                <span className="text-xs text-muted-foreground">{ini.department}</span>
                <span className="text-xs text-muted-foreground">·</span>
                <span className="text-xs text-muted-foreground">{ini.strategicPillar}</span>
              </div>
            </div>
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-secondary transition-colors flex-shrink-0">
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-0.5 px-2 overflow-x-auto">
            {tabs.map(t => (
              <button key={t.key} onClick={() => setTab(t.key)}
                className={cn("text-xs px-3 py-2 rounded-t font-semibold whitespace-nowrap transition-all border-b-2",
                  tab === t.key
                    ? "text-electric-blue border-electric-blue bg-electric-blue/5"
                    : "text-muted-foreground border-transparent hover:text-foreground"
                )}>
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <div className="p-5 space-y-5">

          {/* ── OVERVIEW ── */}
          {tab === "overview" && (
            <>
              <p className="text-sm text-foreground/80 leading-relaxed">{ini.description}</p>

              {(ini.status === "Blocked" || ini.status === "At Risk") && (
                <div className={cn("rounded-xl border-2 p-4", statusInfo.bg, statusInfo.border)}>
                  <div className="flex items-center gap-2 mb-1.5">
                    <Flag className={cn("w-4 h-4", statusInfo.badge)} />
                    <span className={cn("text-xs font-bold uppercase tracking-wide", statusInfo.badge)}>
                      {ini.status === "Blocked" ? "Bottleneck Identified" : "Attention Required"}
                    </span>
                  </div>
                  <p className="text-sm text-foreground/80">
                    {ini.status === "Blocked"
                      ? `${blockedBy.length} blocking dependenc${blockedBy.length === 1 ? "y" : "ies"} must be resolved.`
                      : "Review risks and governance logs for context."}
                  </p>
                </div>
              )}

              {ini.status === "Delayed" && (
                <div className="bg-signal-purple/10 border-2 border-signal-purple/40 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-1.5">
                    <Clock className="w-4 h-4 text-signal-purple" />
                    <span className="text-xs font-bold uppercase tracking-wide text-signal-purple">Outstanding / Delayed</span>
                  </div>
                  <p className="text-sm text-foreground/80">This initiative has passed its expected timeline. Immediate review required.</p>
                </div>
              )}

              {/* Score tiles */}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-secondary rounded-xl p-3 text-center">
                  <div className="text-xs text-muted-foreground mb-1">Impact Score</div>
                  <ScoreBadge score={getImpactScore(ini)} signal={getScoreSignal(getImpactScore(ini))} size="lg" showLabel />
                </div>
                <div className="bg-secondary rounded-xl p-3 text-center">
                  <div className="text-xs text-muted-foreground mb-1">Priority</div>
                  <ScoreBadge score={ini.priorityScore} signal={getScoreSignal(ini.priorityScore)} size="lg" showLabel />
                </div>
                <div className="bg-secondary rounded-xl p-3 text-center">
                  <div className="text-xs text-muted-foreground mb-1">Dependency Risk</div>
                  <ScoreBadge score={ini.dependencyRisk} signal={getScoreSignal(100 - ini.dependencyRisk)} size="lg" showLabel />
                </div>
              </div>

              {/* Budget */}
              <div className="bg-card border-2 border-border rounded-xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <DollarSign className="w-3.5 h-3.5 text-muted-foreground" />
                  <span className="text-xs font-bold text-foreground uppercase tracking-wide">Budget</span>
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

              {/* Progress & dates */}
              <div className="bg-card border-2 border-border rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-foreground uppercase tracking-wide">Completion</span>
                  <span className="text-lg font-black font-mono text-foreground">{ini.completionPct}%</span>
                </div>
                <div className="h-2.5 rounded-full bg-muted overflow-hidden">
                  <div className={cn("h-full rounded-full",
                    ini.completionPct >= 70 ? "bg-signal-green" : ini.completionPct >= 40 ? "bg-electric-blue" : "bg-signal-yellow"
                  )} style={{ width: `${ini.completionPct}%` }} />
                </div>
                <div className="flex justify-between text-xs text-muted-foreground mt-1.5">
                  <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> Start: {ini.startDate}</span>
                  <span className="flex items-center gap-1"><Target className="w-3 h-3" /> Due: {ini.targetDate}</span>
                </div>
              </div>

              {/* Ownership */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-secondary rounded-xl p-3">
                  <div className="text-xs text-muted-foreground mb-1">Operational Owner</div>
                  <div className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-muted-foreground" />{ini.owner}
                  </div>
                </div>
                <div className="bg-secondary rounded-xl p-3">
                  <div className="text-xs text-muted-foreground mb-1">Executive Sponsor</div>
                  <div className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-muted-foreground" />{ini.executiveOwner}
                  </div>
                </div>
              </div>

              {/* KPIs */}
              <div>
                <div className="text-xs font-bold text-foreground uppercase tracking-wide mb-2">KPIs</div>
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
                <div className="text-xs font-bold text-foreground uppercase tracking-wide mb-2 flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-signal-red" /> Risk Register
                </div>
                <div className="space-y-2">
                  {ini.risks.map((risk, i) => (
                    <div key={i} className="bg-card border rounded-xl p-3">
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
                  <div className="text-xs font-bold text-foreground uppercase tracking-wide mb-2 flex items-center gap-1.5">
                    <GitBranch className="w-3.5 h-3.5 text-signal-orange" /> Bottlenecks
                  </div>
                  <div className="space-y-2">
                    {blockedBy.map(dep => (
                      <div key={dep.id} className="flex items-center gap-2 p-2.5 bg-signal-orange/5 border border-signal-orange/20 rounded-xl">
                        <div className={cn("w-2 h-2 rounded-full flex-shrink-0", statusStyles[dep.status].dot)} />
                        <span className="text-sm text-foreground flex-1">{dep.name}</span>
                        <span className={cn("text-xs px-1.5 py-0.5 rounded font-medium border", statusStyles[dep.status].badge, statusStyles[dep.status].border)}>
                          {statusStyles[dep.status].label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {/* ── ACTIONS ── */}
          {tab === "actions" && (
            <div className="space-y-3">
              <div className="text-xs text-muted-foreground">{iniActions.length} action items linked</div>
              {iniActions.length === 0 ? (
                <div className="text-sm text-muted-foreground text-center py-8">No action items recorded</div>
              ) : iniActions.map(act => (
                <div key={act.id} className="bg-card border-2 border-border rounded-xl p-4">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className={cn("text-xs font-semibold px-2 py-0.5 rounded-full",
                      act.status === "Completed" ? "text-signal-green bg-signal-green/10" :
                      act.status === "Blocked"   ? "text-signal-orange bg-signal-orange/10" :
                      act.status === "In Progress" ? "text-signal-yellow bg-signal-yellow/10" :
                      "text-muted-foreground bg-secondary"
                    )}>{act.status === "Blocked" ? "Needs Attention" : act.status}</span>
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Calendar className="w-3 h-3" />{act.dueDate}
                    </span>
                  </div>
                  <div className="text-sm font-semibold text-foreground mb-1">{act.title}</div>
                  <div className="text-xs text-muted-foreground mb-2">{act.description}</div>
                  <div className="text-xs text-muted-foreground flex items-center gap-1">
                    <User className="w-3 h-3" />{act.assignedTo}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ── DIRECTIVES ── */}
          {tab === "directives" && (
            <div className="space-y-3">
              <div className="text-xs text-muted-foreground">{iniDirectives.length} operational directives</div>
              {iniDirectives.length === 0 ? (
                <div className="text-sm text-muted-foreground text-center py-8">No directives generated</div>
              ) : iniDirectives.map(dir => (
                <div key={dir.id} className="bg-card border-2 border-border rounded-xl p-4">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className={cn("text-xs font-semibold px-2 py-0.5 rounded-full",
                      dir.status === "Completed" ? "text-signal-green bg-signal-green/10" :
                      dir.status === "In Progress" ? "text-electric-blue bg-electric-blue/10" :
                      "text-muted-foreground bg-secondary"
                    )}>{dir.status}</span>
                  </div>
                  <div className="text-sm font-bold text-foreground mb-1">{dir.title}</div>
                  <div className="text-sm text-muted-foreground leading-relaxed">{dir.description}</div>
                  <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><User className="w-3 h-3" />{dir.owner}</span>
                    {dir.dueDate && <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{dir.dueDate}</span>}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ── GOVERNANCE ── */}
          {tab === "governance" && (
            <div className="space-y-3">
              <div className="text-xs text-muted-foreground">{iniGovLogs.length} governance entries</div>
              {iniGovLogs.length === 0 ? (
                <div className="text-sm text-muted-foreground text-center py-8">No governance logs</div>
              ) : iniGovLogs.map(log => (
                <div key={log.id} className={cn("border-2 rounded-xl p-4",
                  log.status === "Escalated" ? "bg-signal-red/5 border-signal-red/30" :
                  log.status === "Open" ? "bg-signal-yellow/5 border-signal-yellow/30" : "bg-card border-border"
                )}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className={cn("text-xs font-semibold px-2 py-0.5 rounded-full border",
                      log.type === "Risk" ? "text-signal-red bg-signal-red/10 border-signal-red/30" :
                      log.type === "Decision" ? "text-electric-blue bg-electric-blue/10 border-electric-blue/30" :
                      "text-signal-yellow bg-signal-yellow/10 border-signal-yellow/30"
                    )}>{log.type}</span>
                    <span className={cn("text-xs font-semibold px-2 py-0.5 rounded-full",
                      log.status === "Escalated" ? "text-signal-red bg-signal-red/10" :
                      log.status === "Open" ? "text-signal-yellow bg-signal-yellow/10" :
                      log.status === "In Review" ? "text-electric-blue bg-electric-blue/10" :
                      "text-signal-green bg-signal-green/10"
                    )}>{log.status}</span>
                    <span className="ml-auto text-xs text-muted-foreground">
                      Severity: <span className={cn("font-mono font-bold",
                        log.severity >= 8 ? "text-signal-red" : log.severity >= 6 ? "text-signal-yellow" : "text-signal-green"
                      )}>{log.severity}/10</span>
                    </span>
                  </div>
                  <div className="text-sm font-bold text-foreground mb-1">{log.title}</div>
                  <div className="text-sm text-muted-foreground leading-relaxed">{log.notes}</div>
                  <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><User className="w-3 h-3" />{log.owner}</span>
                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{log.createdDate}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ── MOCHA ── */}
          {tab === "mocha" && (
            <div>
              <div className="text-xs text-muted-foreground mb-4">
                MOCHA accountability matrix — clarity on who drives, who approves, who supports.
              </div>
              <div className="grid grid-cols-5 gap-2 mb-5">
                {[
                  { key: "M", label: "Manager", color: "text-electric-blue bg-electric-blue/10 border-electric-blue/25" },
                  { key: "O", label: "Owner",   color: "text-teal bg-teal/10 border-teal/25" },
                  { key: "C", label: "Consulted", color: "text-signal-yellow bg-signal-yellow/10 border-signal-yellow/25" },
                  { key: "H", label: "Helper",  color: "text-signal-green bg-signal-green/10 border-signal-green/25" },
                  { key: "A", label: "Approver", color: "text-signal-purple bg-signal-purple/10 border-signal-purple/25" },
                ].map(r => (
                  <div key={r.key} className={cn("border rounded-xl p-2.5 text-center", r.color)}>
                    <div className="text-sm font-black mb-0.5">{r.key}</div>
                    <div className="text-[10px] font-medium opacity-80">{r.label}</div>
                  </div>
                ))}
              </div>
              <div className="space-y-2">
                {ini.raci.map((r, i) => {
                  const mocha = raciToMocha[r.type] || { key: "?", label: r.type };
                  return (
                    <div key={i} className="flex items-center gap-3 p-3 bg-secondary rounded-xl">
                      <div className="w-8 h-8 rounded-full bg-teal/15 border border-teal/30 flex items-center justify-center text-xs font-black text-teal flex-shrink-0">
                        {mocha.key}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold text-foreground">{r.name}</div>
                        <div className="text-xs text-muted-foreground">{mocha.label} · {r.role}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── DECISION DEADLINES ── */}
          {tab === "deadlines" && (
            <div className="space-y-3">
              <div className="text-xs text-muted-foreground">{decisionDeadlines.length} decision points requiring action</div>
              {decisionDeadlines.length === 0 ? (
                <div className="text-sm text-muted-foreground text-center py-8">No decision deadlines recorded</div>
              ) : decisionDeadlines.map(d => (
                <div key={d.id} className="bg-signal-orange/8 border-2 border-signal-orange/30 rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <Clock className="w-4 h-4 text-signal-orange mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <div className="text-sm font-bold text-foreground mb-1">{d.title}</div>
                      <p className="text-xs text-muted-foreground leading-relaxed mb-2">{d.notes}</p>
                      <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1"><User className="w-3 h-3" />{d.owner}</span>
                        <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{d.createdDate}</span>
                        <span className={cn("px-2 py-0.5 rounded-full font-semibold",
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

// ────────────────────────────────────────────────
// INITIATIVE CARD
// ────────────────────────────────────────────────
function InitiativeCard({ ini, onClick }: { ini: Initiative; onClick: () => void }) {
  const statusInfo = statusStyles[ini.status];
  const budgetPct  = Math.round((ini.budgetUsed / ini.budget) * 100);
  const hasDeadlines = governanceLogs.some(g => g.initiativeId === ini.id && g.type === "Decision" && g.status !== "Resolved");

  return (
    <div
      onClick={onClick}
      className={cn(
        "bg-card rounded-2xl border-2 shadow-card hover:shadow-elevated transition-all cursor-pointer group relative overflow-hidden",
        statusInfo.border
      )}
    >
      {/* Colored top accent bar */}
      <div className={cn("h-1 w-full", statusInfo.dot)} />

      <div className="p-5">
        {/* Header row */}
        <div className="flex items-start gap-3 mb-3">
          <div className={cn("w-2.5 h-2.5 rounded-full mt-1.5 flex-shrink-0", statusInfo.dot)} />
          <div className="flex-1 min-w-0">
            <div className="flex items-start gap-2 mb-1.5">
              <h3 className="text-sm font-bold text-foreground leading-snug flex-1">{ini.name}</h3>
              <ArrowUpRight className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0 mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <div className="flex flex-wrap items-center gap-1.5">
              <span className={cn("text-xs font-bold px-2 py-0.5 rounded-full border", statusInfo.badge, statusInfo.border, statusInfo.bg)}>
                {statusInfo.label}
              </span>
              <span className={cn("text-xs font-medium px-1.5 py-0.5 rounded border", categoryStyles[ini.category].cls)}>
                {categoryStyles[ini.category].label}
              </span>
              {hasDeadlines && (
                <span className="text-xs px-1.5 py-0.5 rounded-full bg-signal-orange/10 text-signal-orange border border-signal-orange/30 flex items-center gap-1">
                  <Clock className="w-2.5 h-2.5" />Deadline
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Description */}
        <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2 mb-3">{ini.description}</p>

        {/* Progress bar */}
        <div className="mb-3">
          <div className="flex justify-between text-xs mb-1">
            <span className="text-muted-foreground font-medium">Progress</span>
            <span className="font-mono font-bold text-foreground">{ini.completionPct}%</span>
          </div>
          <div className="h-1.5 rounded-full bg-muted overflow-hidden">
            <div className={cn("h-full rounded-full transition-all",
              ini.completionPct >= 70 ? "bg-signal-green" :
              ini.completionPct >= 40 ? "bg-electric-blue" : "bg-signal-yellow"
            )} style={{ width: `${ini.completionPct}%` }} />
          </div>
        </div>

        {/* Footer meta */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <User className="w-3 h-3 flex-shrink-0" />
            <span className="truncate font-medium text-foreground/70">{ini.owner}</span>
          </div>
          <div className="flex items-center gap-1.5 text-muted-foreground justify-end">
            <Calendar className="w-3 h-3 flex-shrink-0" />
            <span className="font-mono">{ini.targetDate}</span>
          </div>
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <DollarSign className="w-3 h-3 flex-shrink-0" />
            <span className="font-mono font-medium text-foreground/70">{formatCurrency(ini.budgetUsed)}<span className="text-muted-foreground font-normal">/{formatCurrency(ini.budget)}</span></span>
          </div>
          <div className="flex items-center gap-1.5 justify-end">
            <span className="text-xs text-muted-foreground">{ini.department}</span>
          </div>
        </div>

        {/* Score chips */}
        <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border">
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] text-muted-foreground uppercase tracking-wide">Impact</span>
            <span className={cn("text-xs font-mono font-bold",
              getImpactScore(ini) >= 70 ? "text-signal-green" : getImpactScore(ini) >= 45 ? "text-signal-yellow" : "text-signal-orange"
            )}>{getImpactScore(ini)}</span>
          </div>
          <div className="w-px h-3 bg-border" />
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] text-muted-foreground uppercase tracking-wide">Risk</span>
            <span className={cn("text-xs font-mono font-bold",
              ini.dependencyRisk > 65 ? "text-signal-red" : ini.dependencyRisk > 40 ? "text-signal-yellow" : "text-signal-green"
            )}>{ini.dependencyRisk}</span>
          </div>
          {ini.dependencies.length > 0 && (
            <>
              <div className="w-px h-3 bg-border" />
              <span className="text-xs text-signal-orange flex items-center gap-1 ml-auto">
                <GitBranch className="w-3 h-3" />{ini.dependencies.length} dep.
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────
// MAIN PAGE
// ────────────────────────────────────────────────
const STATUS_DISPLAY: { key: InitiativeStatus; label: string; dot: string }[] = [
  { key: "On Track",  label: "On Track",              dot: "bg-signal-yellow" },
  { key: "At Risk",   label: "Needs Attention",        dot: "bg-signal-orange" },
  { key: "Blocked",   label: "Needs Attention",        dot: "bg-signal-orange" },
  { key: "Delayed",   label: "Outstanding / Delayed",  dot: "bg-signal-purple" },
  { key: "Completed", label: "Completed",              dot: "bg-signal-green" },
];

export default function Initiatives() {
  const [statusFilter, setStatusFilter]   = useState<InitiativeStatus | "All">("All");
  const [ownerFilter, setOwnerFilter]     = useState<string>("All");
  const [deptFilter, setDeptFilter]       = useState<string>("All");
  const [sortKey, setSortKey]             = useState<SortKey>("impactScore");
  const [sortDir, setSortDir]             = useState<"asc" | "desc">("desc");
  const [search, setSearch]               = useState("");
  const [selectedIni, setSelectedIni]     = useState<Initiative | null>(null);
  const [showFilters, setShowFilters]     = useState(false);

  // Unique owners and departments for filter dropdowns
  const owners = useMemo(() => ["All", ...Array.from(new Set(initiatives.map(i => i.owner)))], []);
  const depts  = useMemo(() => ["All", ...Array.from(new Set(initiatives.map(i => i.department)))], []);

  const filtered = useMemo(() => {
    let list = [...initiatives];
    if (statusFilter !== "All") list = list.filter(i => i.status === statusFilter);
    if (ownerFilter  !== "All") list = list.filter(i => i.owner === ownerFilter);
    if (deptFilter   !== "All") list = list.filter(i => i.department === deptFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(i =>
        i.name.toLowerCase().includes(q) ||
        i.description.toLowerCase().includes(q) ||
        i.owner.toLowerCase().includes(q) ||
        i.department.toLowerCase().includes(q)
      );
    }
    list.sort((a, b) => {
      if (sortKey === "targetDate") {
        const av = new Date(a.targetDate).getTime();
        const bv = new Date(b.targetDate).getTime();
        return sortDir === "asc" ? av - bv : bv - av;
      }
      if (sortKey === "impactScore") {
        return sortDir === "asc" ? getImpactScore(a) - getImpactScore(b) : getImpactScore(b) - getImpactScore(a);
      }
      return sortDir === "asc" ? a[sortKey] - b[sortKey] : b[sortKey] - a[sortKey];
    });
    return list;
  }, [statusFilter, ownerFilter, deptFilter, sortKey, sortDir, search]);

  const totalDecisionDeadlines = governanceLogs.filter(g => g.type === "Decision" && g.status !== "Resolved").length;

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortKey(key); setSortDir("desc"); }
  }

  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = { All: initiatives.length };
    initiatives.forEach(i => { counts[i.status] = (counts[i.status] || 0) + 1; });
    return counts;
  }, []);

  return (
    <div className="p-6 space-y-5">

      {/* ── Header ── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-foreground mb-1">Initiatives</h1>
          <p className="text-sm text-muted-foreground">
            {initiatives.length} initiatives · Priority-scored against strategic OKRs and pillars
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowFilters(v => !v)}
            className={cn("flex items-center gap-2 text-xs font-bold px-4 py-2.5 rounded-xl border-2 transition-all",
              showFilters
                ? "bg-electric-blue/10 text-electric-blue border-electric-blue/40"
                : "bg-card text-muted-foreground border-border hover:border-foreground/20"
            )}>
            <Filter className="w-3.5 h-3.5" />
            Filters
            {showFilters ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* ── Decision deadline banner ── */}
      {totalDecisionDeadlines > 0 && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl border-2 border-signal-orange/30 bg-signal-orange/6">
          <Clock className="w-4 h-4 text-signal-orange flex-shrink-0" />
          <span className="text-sm text-signal-orange font-bold">
            {totalDecisionDeadlines} decision deadline{totalDecisionDeadlines > 1 ? "s" : ""} pending
          </span>
          <span className="text-xs text-signal-orange/70">— click an initiative to review</span>
        </div>
      )}

      {/* ── Status color key ── */}
      <div className="flex flex-wrap items-center gap-2 px-4 py-3 bg-card border-2 border-border rounded-xl">
        <span className="text-xs font-bold text-foreground uppercase tracking-wide mr-1">Status Key:</span>
        {[
          { label: "On Track",             dot: "bg-signal-yellow",  badge: "text-signal-yellow bg-signal-yellow/10 border-signal-yellow/30" },
          { label: "Needs Attention",      dot: "bg-signal-orange",  badge: "text-signal-orange bg-signal-orange/10 border-signal-orange/30" },
          { label: "Outstanding / Delayed",dot: "bg-signal-purple",  badge: "text-signal-purple bg-signal-purple/10 border-signal-purple/30" },
          { label: "Abandoned",            dot: "bg-signal-red",     badge: "text-signal-red bg-signal-red/10 border-signal-red/30" },
          { label: "Completed",            dot: "bg-signal-green",   badge: "text-signal-green bg-signal-green/10 border-signal-green/30" },
        ].map(s => (
          <div key={s.label} className="flex items-center gap-1.5">
            <span className={cn("w-2 h-2 rounded-full", s.dot)} />
            <span className={cn("text-xs font-semibold px-2 py-0.5 rounded-full border", s.badge)}>{s.label}</span>
          </div>
        ))}
      </div>

      {/* ── Summary stat tiles ── */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <button onClick={() => setStatusFilter("All")}
          className={cn("bg-card rounded-2xl border-2 p-4 text-left transition-all shadow-card hover:shadow-elevated",
            statusFilter === "All" ? "border-electric-blue ring-2 ring-electric-blue/20" : "border-border"
          )}>
          <div className="text-2xl font-black font-mono text-foreground mb-0.5">{initiatives.length}</div>
          <div className="text-xs text-muted-foreground font-medium">All Initiatives</div>
        </button>
        {STATUS_DISPLAY.filter((s, i, arr) => arr.findIndex(x => x.key === s.key) === i).map(s => (
          <button key={s.key} onClick={() => setStatusFilter(s.key)}
            className={cn("bg-card rounded-2xl border-2 p-4 text-left transition-all shadow-card hover:shadow-elevated",
              statusFilter === s.key ? `border-electric-blue ring-2 ring-electric-blue/20` : "border-border"
            )}>
            <div className="flex items-center gap-2 mb-1">
              <span className={cn("w-2 h-2 rounded-full", s.dot)} />
              <span className="text-2xl font-black font-mono text-foreground">{statusCounts[s.key] || 0}</span>
            </div>
            <div className="text-xs text-muted-foreground font-medium">{s.label}</div>
          </button>
        ))}
      </div>

      {/* ── Filter panel ── */}
      {showFilters && (
        <div className="bg-card border-2 border-border rounded-2xl p-5 space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm bg-background border-2 border-border outline-none focus:border-electric-blue/60 transition-colors text-foreground"
              placeholder="Search initiatives by name, owner, department..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Status filter */}
            <div>
              <div className="text-xs font-bold uppercase tracking-wide text-muted-foreground mb-2">Status</div>
              <div className="flex flex-wrap gap-1.5">
                {(["All", ...STATUS_DISPLAY.map(s => s.key).filter((k, i, a) => a.indexOf(k) === i)] as (InitiativeStatus | "All")[]).map(s => (
                  <button key={s} onClick={() => setStatusFilter(s)}
                    className={cn("text-xs px-2.5 py-1.5 rounded-lg border font-semibold transition-all",
                      statusFilter === s
                        ? "bg-electric-blue/10 text-electric-blue border-electric-blue/40"
                        : "bg-background text-muted-foreground border-border hover:border-foreground/20"
                    )}>
                    {s === "All" ? "All" : statusStyles[s].label}
                    {s !== "All" && ` (${statusCounts[s] || 0})`}
                  </button>
                ))}
              </div>
            </div>

            {/* Owner filter */}
            <div>
              <div className="text-xs font-bold uppercase tracking-wide text-muted-foreground mb-2">Owner</div>
              <select
                value={ownerFilter}
                onChange={e => setOwnerFilter(e.target.value)}
                className="w-full text-xs rounded-xl px-3 py-2.5 bg-background border-2 border-border text-foreground outline-none focus:border-electric-blue/60 transition-colors cursor-pointer">
                {owners.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>

            {/* Department filter */}
            <div>
              <div className="text-xs font-bold uppercase tracking-wide text-muted-foreground mb-2">Department</div>
              <select
                value={deptFilter}
                onChange={e => setDeptFilter(e.target.value)}
                className="w-full text-xs rounded-xl px-3 py-2.5 bg-background border-2 border-border text-foreground outline-none focus:border-electric-blue/60 transition-colors cursor-pointer">
                {depts.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
          </div>

          {/* Sort */}
          <div>
            <div className="text-xs font-bold uppercase tracking-wide text-muted-foreground mb-2">Sort By</div>
            <div className="flex flex-wrap gap-1.5">
              {([
                ["impactScore",    "Impact Score"],
                ["dependencyRisk", "Dep. Risk"],
                ["completionPct",  "Progress"],
                ["targetDate",     "Due Date"],
              ] as [SortKey, string][]).map(([key, label]) => (
                <button key={key} onClick={() => toggleSort(key)}
                  className={cn("flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg border font-semibold transition-all",
                    sortKey === key
                      ? "bg-electric-blue/10 text-electric-blue border-electric-blue/40"
                      : "bg-background text-muted-foreground border-border hover:border-foreground/20"
                  )}>
                  {label}
                  {sortKey === key && (
                    sortDir === "desc"
                      ? <ChevronDown className="w-3 h-3" />
                      : <ChevronUp className="w-3 h-3" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {(statusFilter !== "All" || ownerFilter !== "All" || deptFilter !== "All" || search) && (
            <button
              onClick={() => { setStatusFilter("All"); setOwnerFilter("All"); setDeptFilter("All"); setSearch(""); }}
              className="text-xs text-signal-red hover:underline font-semibold">
              × Clear all filters
            </button>
          )}
        </div>
      )}

      {/* ── Results count ── */}
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>Showing <span className="font-bold text-foreground">{filtered.length}</span> of {initiatives.length} initiatives</span>
        {!showFilters && (
          <div className="flex items-center gap-1">
            <ArrowUpDown className="w-3.5 h-3.5" />
            <span>Sort:</span>
            {([["impactScore","Impact"], ["dependencyRisk","Risk"], ["completionPct","Progress"], ["targetDate","Due Date"]] as [SortKey,string][]).map(([k, l]) => (
              <button key={k} onClick={() => toggleSort(k)}
                className={cn("px-2 py-0.5 rounded font-semibold transition-all",
                  sortKey === k ? "text-electric-blue" : "text-muted-foreground hover:text-foreground"
                )}>
                {l}{sortKey === k && (sortDir === "desc" ? " ↓" : " ↑")}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── Initiative grid ── */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <Sparkles className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="text-sm font-medium">No initiatives match the current filters.</p>
          <button onClick={() => { setStatusFilter("All"); setOwnerFilter("All"); setDeptFilter("All"); setSearch(""); }}
            className="text-xs text-electric-blue hover:underline mt-2">Clear filters</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map(ini => (
            <InitiativeCard key={ini.id} ini={ini} onClick={() => setSelectedIni(ini)} />
          ))}
        </div>
      )}

      <p className="text-xs text-muted-foreground text-center">
        Click any initiative card to view full detail, MOCHA ownership, governance logs, decision deadlines, and action items.
      </p>

      {selectedIni && <InitiativeModal ini={selectedIni} onClose={() => setSelectedIni(null)} />}
    </div>
  );
}
