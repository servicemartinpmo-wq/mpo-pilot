import { insights, frameworks, initiatives, departments, actionItems, governanceLogs } from "@/lib/pmoData";
import InsightCard from "@/components/InsightCard";
import { ScoreBadge, SignalDot } from "@/components/ScoreBadge";
import { cn } from "@/lib/utils";
import { Activity, AlertCircle, GitBranch, Layers, Target, Shield, Clock, CheckCircle, Eye, Zap, ChevronDown, ChevronUp } from "lucide-react";
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
    desc: "Monitoring capacity, delays, conflicts, dependency bottlenecks, misalignment, risk escalation, performance anomalies",
  },
  {
    stage: "Diagnosis",
    icon: Layers,
    color: "text-teal",
    bg: "bg-teal/10",
    border: "border-teal/30",
    count: insights.filter((i) => i.executivePriorityScore > 60).length,
    desc: "Root cause analysis via 7 embedded management frameworks: Porter, Rumelt, BSC, OKR, Lean, Six Sigma, TOC",
  },
  {
    stage: "Advisory Guidance",
    icon: Target,
    color: "text-signal-green",
    bg: "bg-signal-green/10",
    border: "border-signal-green/30",
    count: insights.filter((i) => i.executivePriorityScore > 70).length,
    desc: "Actionable executive recommendations with owner assignment and resolution timeline",
  },
  {
    stage: "Structural Remedies",
    icon: GitBranch,
    color: "text-signal-yellow",
    bg: "bg-signal-yellow/10",
    border: "border-signal-yellow/30",
    count: insights.filter((i) => i.executivePriorityScore > 80).length,
    desc: "Long-term organizational improvement proposals: governance structures, process architecture, capability building",
  },
];

type FilterType = InsightType | "All";

export default function Diagnostics() {
  const [typeFilter, setTypeFilter] = useState<FilterType>("All");
  const [signalFilter, setSignalFilter] = useState<"all" | "red" | "yellow" | "green" | "blue">("all");
  const [govTab, setGovTab] = useState<"all" | "Risk" | "Decision" | "Change">("all");
  const [showSummary, setShowSummary] = useState(false);

  const insightTypes = [...new Set(insights.map((i) => i.type))];

  const filtered = [...insights]
    .filter((i) => typeFilter === "All" || i.type === typeFilter)
    .filter((i) => signalFilter === "all" || i.signal === signalFilter)
    .sort((a, b) => b.executivePriorityScore - a.executivePriorityScore);

  const blockedInitiatives = initiatives.filter((i) => i.dependencies.length > 0);
  const filteredGovLogs = governanceLogs.filter(g => govTab === "all" || g.type === govTab);
  const pendingActions = actionItems.filter(a => a.status !== "Completed");

  const openGovCount = governanceLogs.filter(g => g.status !== "Resolved").length;
  const goodSignals = insights.filter(i => i.signal === "green" || i.signal === "blue").length;
  const criticalSignals = insights.filter(i => i.signal === "red").length;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground mb-0.5">Diagnostics</h1>
          <p className="text-sm text-muted-foreground">4-stage analysis · Root cause breakdown · Governance oversight</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowSummary(v => !v)}
            className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg border-2 border-electric-blue/40 text-electric-blue font-semibold hover:bg-electric-blue/8 transition-colors"
          >
            <Zap className="w-3.5 h-3.5" />
            {showSummary ? "Hide" : "Summarize"} Status
            {showSummary ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
          <div className="text-right">
            <div className="text-xs text-muted-foreground mb-0.5">Open Items</div>
            <div className={cn("text-2xl font-bold font-mono",
              openGovCount > 4 ? "text-signal-red" : "text-signal-yellow"
            )}>{openGovCount}</div>
          </div>
        </div>
      </div>

      {/* Summary panel */}
      {showSummary && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in">
          <div className="bg-signal-green/8 border-2 border-signal-green/30 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="w-4 h-4 text-signal-green" />
              <span className="text-xs font-bold text-signal-green uppercase tracking-wide">What's Going Right</span>
            </div>
            <ul className="space-y-2">
              {[
                `${goodSignals} positive signals across all departments`,
                `${initiatives.filter(i => i.status === "On Track").length} initiatives currently on track`,
                `${actionItems.filter(a => a.status === "Completed").length} action items resolved`,
                `${departments.filter(d => d.maturityScore >= 70).length} departments at Managed or Optimized tier`,
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-foreground/80">
                  <span className="w-1.5 h-1.5 rounded-full bg-signal-green mt-1.5 flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-signal-red/8 border-2 border-signal-red/30 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="w-4 h-4 text-signal-red" />
              <span className="text-xs font-bold text-signal-red uppercase tracking-wide">What Needs Fixing</span>
            </div>
            <ul className="space-y-2">
              {[
                `${criticalSignals} critical alerts require immediate action`,
                `${initiatives.filter(i => i.status === "Blocked").length} initiatives are blocked`,
                `${pendingActions.filter(a => a.priority === "High").length} high-priority actions are overdue`,
                `${governanceLogs.filter(g => g.status === "Escalated").length} governance items escalated`,
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-foreground/80">
                  <span className="w-1.5 h-1.5 rounded-full bg-signal-red mt-1.5 flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* 4-Stage Pipeline */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
        {pipeline.map(({ stage, icon: Icon, color, bg, border, count, desc }) => (
          <div key={stage} className={cn("rounded-lg border p-4 shadow-card", bg, border)}>
            <div className={cn("flex items-center gap-2 mb-2", color)}>
              <Icon className="w-4 h-4" />
              <span className="text-xs font-semibold uppercase tracking-wide">{stage}</span>
            </div>
            <div className={cn("text-3xl font-bold font-mono mb-1", color)}>{count}</div>
            <p className="text-xs text-muted-foreground leading-relaxed">{desc}</p>
          </div>
        ))}
      </div>

      {/* Strategic Clarity + Structural Integrity Checks */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {/* Strategic Clarity */}
        <div className="bg-card rounded-lg border shadow-card p-4">
          <div className="flex items-center gap-2 mb-3">
            <Target className="w-4 h-4 text-electric-blue" />
            <h2 className="text-sm font-semibold text-foreground">Strategic Clarity Check</h2>
          </div>
          <div className="space-y-2">
            {[
              { label: "Defined Outcome", status: "pass", note: "All 10 initiatives have defined KPIs" },
              { label: "OKR Alignment", status: "warn", note: "Marketing Q2 OKRs misaligned with pipeline targets" },
              { label: "Scope Defined", status: "pass", note: "9/10 initiatives have scoped deliverables" },
              { label: "Priority Coherence", status: "warn", note: "INI-007 priority conflicts with delivery capacity" },
              { label: "Strategic Pillar Coverage", status: "pass", note: "5 strategic pillars covered across initiative portfolio" },
            ].map(item => (
              <div key={item.label} className="flex items-start gap-3">
                {item.status === "pass"
                  ? <CheckCircle className="w-3.5 h-3.5 text-signal-green mt-0.5 flex-shrink-0" />
                  : <AlertCircle className="w-3.5 h-3.5 text-signal-yellow mt-0.5 flex-shrink-0" />}
                <div>
                  <div className="text-xs font-medium text-foreground">{item.label}</div>
                  <div className="text-xs text-muted-foreground">{item.note}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Structural Integrity */}
        <div className="bg-card rounded-lg border shadow-card p-4">
          <div className="flex items-center gap-2 mb-3">
            <Shield className="w-4 h-4 text-teal" />
            <h2 className="text-sm font-semibold text-foreground">Structural Integrity Check</h2>
          </div>
          <div className="space-y-2">
            {[
              { label: "Single Accountable Owner", status: "pass", note: "All 10 initiatives have a designated executive owner" },
              { label: "Approval Authority Defined", status: "warn", note: "3 initiatives lack clear board-level approval thresholds" },
              { label: "Risk Register Active", status: "pass", note: "7/10 initiatives have documented risk registers" },
              { label: "RACI Assigned", status: "pass", note: "All active initiatives have RACI matrices defined" },
              { label: "Escalation Path Defined", status: "warn", note: "2 initiatives lack documented escalation triggers" },
            ].map(item => (
              <div key={item.label} className="flex items-start gap-3">
                {item.status === "pass"
                  ? <CheckCircle className="w-3.5 h-3.5 text-signal-green mt-0.5 flex-shrink-0" />
                  : <AlertCircle className="w-3.5 h-3.5 text-signal-yellow mt-0.5 flex-shrink-0" />}
                <div>
                  <div className="text-xs font-medium text-foreground">{item.label}</div>
                  <div className="text-xs text-muted-foreground">{item.note}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Framework Diagnosis Summary */}
      <div className="bg-card rounded-lg border shadow-card">
        <div className="px-4 py-3 border-b flex items-center gap-2">
          <Activity className="w-4 h-4 text-electric-blue" />
          <h2 className="text-sm font-semibold text-foreground">Analysis Module Summary</h2>
        </div>
        <div className="divide-y">
          {frameworks.map((fw) => (
            <div key={fw.id} className="px-4 py-3 flex items-start gap-4">
              <div className="w-44 flex-shrink-0">
                <div className="text-xs font-semibold text-foreground">{fw.name}</div>
                <div className="text-xs text-muted-foreground">{fw.expertDomain}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{fw.lastTriggered}</div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap gap-1 mb-1.5">
                  {fw.coverage.map((c) => (
                    <span key={c} className="text-xs bg-secondary text-muted-foreground px-1.5 py-0.5 rounded">{c}</span>
                  ))}
                </div>
                <div className="flex flex-wrap gap-1">
                  {fw.diagnosticFocus.map((f) => (
                    <span key={f} className="text-xs text-electric-blue/70 bg-electric-blue/5 border border-electric-blue/15 px-1.5 py-0.5 rounded">{f}</span>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
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

      {/* Governance Log */}
      <div className="bg-card rounded-lg border shadow-card">
        <div className="px-4 py-3 border-b flex flex-wrap items-center gap-2">
          <Shield className="w-4 h-4 text-signal-yellow" />
          <h2 className="text-sm font-semibold text-foreground">Governance & Risk Log</h2>
          <span className="ml-auto flex gap-1">
            {(["all", "Risk", "Decision", "Change"] as const).map(t => (
              <button key={t} onClick={() => setGovTab(t as typeof govTab)}
                className={cn("text-xs px-2.5 py-1 rounded-full border transition-all",
                  govTab === t ? "bg-electric-blue/10 text-electric-blue border-electric-blue/40 font-medium" :
                  "bg-card text-muted-foreground border-border"
                )}>
                {t === "all" ? "All" : t}
              </button>
            ))}
          </span>
        </div>
        <div className="divide-y">
          {filteredGovLogs.map(log => {
            const relatedIni = initiatives.find(i => i.id === log.initiativeId);
            return (
              <div key={log.id} className="px-4 py-3 flex items-start gap-3 hover:bg-secondary/30 transition-colors">
                <div className="flex-shrink-0 mt-0.5">
                  {log.status === "Escalated" ? <AlertCircle className="w-4 h-4 text-signal-red" /> :
                   log.status === "Open" ? <Clock className="w-4 h-4 text-signal-yellow" /> :
                   log.status === "Resolved" ? <CheckCircle className="w-4 h-4 text-signal-green" /> :
                   <Activity className="w-4 h-4 text-electric-blue" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className={cn("text-xs font-medium px-1.5 py-0.5 rounded border",
                      log.type === "Risk" ? "text-signal-red bg-signal-red/10 border-signal-red/30" :
                      log.type === "Decision" ? "text-electric-blue bg-electric-blue/10 border-electric-blue/30" :
                      "text-signal-yellow bg-signal-yellow/10 border-signal-yellow/30"
                    )}>{log.type}</span>
                    <span className="text-xs font-semibold text-foreground">{log.title}</span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-snug">{log.notes}</p>
                  <div className="flex items-center gap-3 mt-1.5 text-xs text-muted-foreground">
                    {relatedIni && <span className="text-electric-blue">{relatedIni.name}</span>}
                    <span>Owner: {log.owner}</span>
                    <span>{log.createdDate}</span>
                  </div>
                </div>
                <div className="flex-shrink-0 text-right">
                  <div className={cn("text-xs font-mono font-bold",
                    log.severity >= 8 ? "text-signal-red" : log.severity >= 6 ? "text-signal-yellow" : "text-signal-green"
                  )}>{log.severity}/10</div>
                  <span className={cn("text-xs px-1.5 py-0.5 rounded font-medium",
                    log.status === "Escalated" ? "text-signal-red bg-signal-red/10" :
                    log.status === "Open" ? "text-signal-yellow bg-signal-yellow/10" :
                    log.status === "In Review" ? "text-electric-blue bg-electric-blue/10" :
                    "text-signal-green bg-signal-green/10"
                  )}>{log.status}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Dependency intelligence */}
      <div>
        <h2 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
          <GitBranch className="w-4 h-4 text-electric-blue" />
          Dependency Intelligence Map
          <span className="text-xs font-normal text-muted-foreground ml-1">{blockedInitiatives.length} initiatives with active dependencies</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {blockedInitiatives.map((ini) => (
            <div key={ini.id} className="bg-card rounded-lg border shadow-card p-4">
              <div className="flex items-start gap-2 mb-2">
                <SignalDot signal={ini.signal} pulse={ini.signal === "red"} />
                <div className="flex-1 min-w-0">
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
                      <span className="text-xs text-foreground flex-1">{dep.name}</span>
                      <span className={cn(
                        "text-xs px-1.5 py-0.5 rounded font-medium",
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
