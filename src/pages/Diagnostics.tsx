import { insights, frameworks, initiatives, departments, actionItems, governanceLogs } from "@/lib/pmoData";
import UpgradeBanner from "@/components/UpgradeBanner";
import { ScoreBadge, SignalDot } from "@/components/ScoreBadge";
import ScoreExplainer from "@/components/ScoreExplainer";
import { cn } from "@/lib/utils";
import {
  Activity, AlertCircle, GitBranch, Layers, Target, Shield, Clock,
  CheckCircle, Eye, Zap, ChevronDown, ChevronUp, X, Users,
  ChevronRight, ArrowRightCircle, ArrowRight, Database, Brain, Network, TrendingUp,
  FlaskConical, AlertTriangle, BarChart3, Cpu, ClipboardList, Building2, Search, Lock
} from "lucide-react";
import { useState, useMemo } from "react";
import type { InsightType } from "@/lib/pmoData";
import { getEngineState } from "@/lib/engine";
import type { DetectedSignal } from "@/lib/engine/signals";
import type { DiagnosisResult } from "@/lib/engine/diagnosis";
import { getFrameworksRunBy } from "@/lib/frameworkData";

// ── 4-Stage Pipeline ──
const pipeline = [
  { stage: "Signal Detection", icon: Activity, color: "text-electric-blue", bg: "bg-electric-blue/10", border: "border-electric-blue/30", count: insights.length, desc: "Capacity, delays, conflicts, dependency bottlenecks, misalignment, risk escalation" },
  { stage: "Diagnosis", icon: Layers, color: "text-teal", bg: "bg-teal/10", border: "border-teal/30", count: insights.filter(i => i.executivePriorityScore > 60).length, desc: "Root cause analysis via 7 embedded management analysis modules" },
  { stage: "Guidance", icon: Target, color: "text-signal-green", bg: "bg-signal-green/10", border: "border-signal-green/30", count: insights.filter(i => i.executivePriorityScore > 70).length, desc: "Actionable recommendations with owner assignment and resolution timeline" },
  { stage: "Structural Remedies", icon: GitBranch, color: "text-signal-yellow", bg: "bg-signal-yellow/10", border: "border-signal-yellow/30", count: insights.filter(i => i.executivePriorityScore > 80).length, desc: "Long-term improvement proposals: governance, process architecture, capability building" },
];

const clarityChecks = [
  { label: "Defined Outcome", status: "pass", note: "All 10 initiatives have defined KPIs", detail: "Across the portfolio, every initiative has at least 3 measurable KPIs tied to strategic pillars. Last audited 2025-03-01." },
  { label: "OKR Alignment", status: "warn", note: "Marketing Q2 OKRs misaligned with pipeline targets", detail: "Marketing's brand awareness allocation (68%) conflicts with the OKR demand-gen target. Historical pattern: this gap has been flagged in Q1 and Q3 of the prior year." },
  { label: "Scope Defined", status: "pass", note: "9/10 initiatives have scoped deliverables", detail: "INI-007 still lacks a formal scope document. All others have approved scope with change control." },
  { label: "Priority Coherence", status: "warn", note: "INI-007 priority conflicts with delivery capacity", detail: "Program Delivery is at 94% capacity. Adding INI-007 without deferral creates WIP accumulation." },
  { label: "Strategic Pillar Coverage", status: "pass", note: "5 strategic pillars covered across portfolio", detail: "Revenue Acceleration (3), Operational Excellence (2), Customer Experience (2), Technology Modernization (2), Talent & Culture (1). Balanced distribution confirmed." },
];

const integrityChecks = [
  { label: "Single Accountable Owner", status: "pass", note: "All 10 initiatives have a designated owner", detail: "Accountability ownership is confirmed for all active initiatives." },
  { label: "Approval Authority Defined", status: "warn", note: "3 initiatives lack board-level approval thresholds", detail: "INI-002, INI-005, INI-009 have no documented board approval threshold." },
  { label: "Risk Register Active", status: "pass", note: "7/10 initiatives have documented risk registers", detail: "INI-001, INI-002, INI-003 have comprehensive risk registers updated weekly." },
  { label: "Accountability Assigned", status: "pass", note: "All active initiatives have accountability matrices defined", detail: "Full accountability clarity across the portfolio since Q4 rollout." },
  { label: "Escalation Path Defined", status: "warn", note: "2 initiatives lack documented escalation triggers", detail: "INI-006 and INI-009 have no defined escalation thresholds. Un-escalated blockers average 11 extra days to resolve." },
];

type FilterType = InsightType | "All";

// Signal severity color helpers
const severityColor = (s: DetectedSignal["severity"]) =>
  s === "Critical" ? "text-signal-red bg-signal-red/10 border-signal-red/30" :
  s === "High" ? "text-signal-yellow bg-signal-yellow/10 border-signal-yellow/30" :
  s === "Medium" ? "text-electric-blue bg-electric-blue/10 border-electric-blue/30" :
  "text-signal-green bg-signal-green/10 border-signal-green/30";

const severityDot = (s: DetectedSignal["severity"]) =>
  s === "Critical" ? "bg-signal-red" :
  s === "High" ? "bg-signal-yellow" :
  s === "Medium" ? "bg-electric-blue" : "bg-signal-green";

type AuditType = "internal" | "external";
type AuditStatus = "idle" | "selecting" | "running" | "complete";

interface AuditFinding {
  area: string;
  status: "pass" | "warn" | "fail";
  finding: string;
  recommendation: string;
  source: string;
}

const EXTERNAL_AUDIT_AREAS: AuditFinding[] = [
  { area: "Financial Controls", status: "warn", finding: "Budget approval thresholds exceed single-signatory limits on 3 initiatives", recommendation: "Implement dual-control approval for expenditures >$50K", source: "Financial Control Best Practice" },
  { area: "Risk Register Compliance", status: "pass", finding: "7/10 initiatives have documented, active risk registers", recommendation: "Extend to all initiatives — INI-001, INI-002, INI-003 remain undocumented", source: "Risk Management Standard" },
  { area: "Governance Documentation", status: "warn", finding: "3 initiatives lack board-level approval thresholds", recommendation: "Define escalation thresholds for all capital commitments", source: "Enterprise Risk Management" },
  { area: "Policy Adherence", status: "pass", finding: "Operational policies reviewed and current across 8/9 departments", recommendation: "Refresh Technology policy — last reviewed 14 months ago", source: "Quality Management Standard" },
  { area: "Audit Trail Integrity", status: "pass", finding: "Governance log entries present for all major decisions", recommendation: "Introduce automated timestamping for decision log entries", source: "Audit Trail Requirements" },
  { area: "Segregation of Duties", status: "fail", finding: "2 departments lack segregation between approver and executor roles", recommendation: "Immediate role separation required for Program Delivery and Finance", source: "Internal Control Standard" },
  { area: "Regulatory Alignment", status: "warn", finding: "GDPR data handling review overdue by 60 days", recommendation: "Schedule immediate data privacy audit with DPO", source: "Data Privacy Regulation" },
  { area: "Compliance Reporting", status: "pass", finding: "Board reports issued quarterly with no missed cycles", recommendation: "Add risk register summary to board pack for completeness", source: "Corporate Governance Best Practice" },
];

const INTERNAL_AUDIT_AREAS: AuditFinding[] = [
  { area: "Strategic Alignment", status: "warn", finding: "Marketing Q2 targets misaligned with pipeline goals (68% brand vs 45% demand-gen)", recommendation: "Realign Marketing targets in next planning cycle", source: "Strategic Alignment Diagnostics" },
  { area: "Initiative Health", status: "warn", finding: "INI-007 at 94% capacity load with no deferral plan in place", recommendation: "Pause or rescope INI-007 until Program Delivery capacity drops below 80%", source: "Resource Management Analysis" },
  { area: "Execution Discipline", status: "fail", finding: "Average action item close rate: 61% — target is 80%", recommendation: "Introduce weekly action item review cadence with department leads", source: "Execution Performance Analysis" },
  { area: "Capacity Utilization", status: "warn", finding: "Program Delivery at 94%, Technology at 87% — above sustainable threshold", recommendation: "Reallocate 2 FTEs from underutilized Customer Success (62%) to delivery", source: "Workload Distribution Analysis" },
  { area: "Dependency Mapping", status: "pass", finding: "Critical dependencies mapped for 8/10 active initiatives", recommendation: "Complete dependency mapping for INI-004 and INI-009", source: "Initiative Dependency Scan" },
  { area: "Process Adherence", status: "pass", finding: "Core operational processes documented and followed in 7/9 departments", recommendation: "Update Sales process SOPs to reflect new CRM workflow", source: "Process Compliance Audit" },
  { area: "Leadership Bandwidth", status: "warn", finding: "COO approval required for 14 items currently pending — creating bottleneck", recommendation: "Delegate Tier 3 decisions to department heads via updated authority matrix", source: "Decision Flow Analysis" },
  { area: "Knowledge Capture", status: "fail", finding: "No lessons-learned documentation in last 2 completed initiatives", recommendation: "Implement post-project retrospective template — mandatory for all closures", source: "Knowledge Management Audit" },
  { area: "Communication Flows", status: "pass", finding: "Weekly status reports issued for all active Tier 1 initiatives", recommendation: "Extend to Tier 2 — currently only 40% have standing updates", source: "Communications Health Check" },
  { area: "Maturity Progression", status: "warn", finding: "2 departments have shown no maturity improvement for 3+ consecutive quarters", recommendation: "Assign improvement sponsor and 90-day maturity improvement plan", source: "Organizational Maturity Assessment" },
];

export default function Diagnostics() {
  const [typeFilter, setTypeFilter] = useState<FilterType>("All");
  const [govTab, setGovTab] = useState<"all" | "Risk" | "Decision" | "Change">("all");
  const [showSummary, setShowSummary] = useState(false);
  const [selectedCheck, setSelectedCheck] = useState<{ label: string; detail: string; status: string } | null>(null);
  const [engineTab, setEngineTab] = useState<"signals" | "diagnosis">("signals");
  const [expandedDiag, setExpandedDiag] = useState<string | null>(null);
  const [auditStatus, setAuditStatus] = useState<AuditStatus>("idle");
  const [auditType, setAuditType] = useState<AuditType | null>(null);
  const [auditProgress, setAuditProgress] = useState(0);
  const [auditFindings, setAuditFindings] = useState<AuditFinding[]>([]);

  // Run engine once (memoized)
  const engine = useMemo(() => getEngineState(), []);

  // Tier check — defaults to paid
  const isPaidTier = localStorage.getItem("apphia_tier") !== "free";

  function startAudit(type: AuditType) {
    setAuditType(type);
    setAuditStatus("running");
    setAuditProgress(0);
    setAuditFindings([]);
    const findings = type === "external" ? EXTERNAL_AUDIT_AREAS : INTERNAL_AUDIT_AREAS;
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.floor(Math.random() * 12) + 8;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        setAuditFindings(findings);
        setAuditStatus("complete");
      }
      setAuditProgress(Math.min(progress, 100));
    }, 220);
  }

  const auditPass = auditFindings.filter(f => f.status === "pass").length;
  const auditWarn = auditFindings.filter(f => f.status === "warn").length;
  const auditFail = auditFindings.filter(f => f.status === "fail").length;

  const insightTypes = [...new Set(insights.map(i => i.type))];
  const filtered = [...insights]
    .filter(i => typeFilter === "All" || i.type === typeFilter)
    .sort((a, b) => b.executivePriorityScore - a.executivePriorityScore);

  const filteredGovLogs = governanceLogs.filter(g => govTab === "all" || g.type === govTab);
  const openGovCount = governanceLogs.filter(g => g.status !== "Resolved").length;
  const goodSignals = insights.filter(i => i.signal === "green" || i.signal === "blue").length;
  const criticalSignals = insights.filter(i => i.signal === "red").length;
  const pendingActions = actionItems.filter(a => a.status !== "Completed").length;

  const diagnosticsFrameworks = getFrameworksRunBy("Diagnostics");

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <UpgradeBanner storageKey="diag_upgrade_banner" message="Unlock advanced diagnostics — deeper signal analysis, custom thresholds, and automated alerts." />
    <div className="p-4 sm:p-6 space-y-5 sm:space-y-6">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="flex-1 text-center sm:text-left">
          <h1 className="text-xl font-black text-foreground mb-0.5 tracking-tight">Diagnostics</h1>
          <p className="text-sm text-muted-foreground">Signal detection · Root cause analysis · Governance oversight</p>
        </div>
        <div className="flex flex-wrap items-center justify-center sm:justify-end gap-2">
          <button onClick={() => setShowSummary(v => !v)}
            className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg border-2 border-electric-blue/40 text-electric-blue font-semibold hover:bg-electric-blue/8 transition-colors">
            <Zap className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{showSummary ? "Hide" : "Show"} Summary</span>
            <span className="sm:hidden">Summary</span>
            {showSummary ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
          <button onClick={() => setAuditStatus("selecting")}
            className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg border-2 border-teal/40 text-teal font-semibold hover:bg-teal/8 transition-colors">
            <ClipboardList className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Full Org Audit</span>
            <span className="sm:hidden">Audit</span>
          </button>
          <div className="text-right">
            <div className="text-xs text-muted-foreground mb-0.5">Open Items</div>
            <div className={cn("text-2xl font-bold font-mono", openGovCount > 4 ? "text-signal-red" : "text-signal-yellow")}>{openGovCount}</div>
          </div>
        </div>
      </div>

      {/* ── Summary Panel ── */}
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
                `${initiatives.filter(i => i.status === "Blocked").length} initiatives need attention`,
                `${pendingActions} pending action items`,
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

      {/* ── 4-Stage Pipeline ── */}
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

      {/* ── ENGINE INTELLIGENCE PANEL ── */}
      <div className="bg-card rounded-lg border-2 border-border shadow-card">
        <div className="px-4 py-3 border-b-2 border-border bg-secondary/60 rounded-t-lg flex flex-wrap items-center gap-2">
          <Brain className="w-4 h-4 text-electric-blue" />
          <h2 className="text-sm font-bold text-foreground">Operational Intelligence — Live Engine</h2>
          <div className="flex items-center gap-1.5 ml-2">
            <span className="w-2 h-2 rounded-full bg-signal-green animate-pulse" />
            <span className="text-xs text-signal-green font-medium">Running</span>
          </div>
          <div className="ml-auto flex gap-1">
            {([
              { key: "signals", label: "Signals", icon: Activity },
              { key: "diagnosis", label: "Diagnosis", icon: FlaskConical },
            ] as const).map(({ key, label, icon: Icon }) => (
              <button key={key} onClick={() => setEngineTab(key)}
                className={cn("text-xs px-2.5 py-1 rounded-full border transition-all flex items-center gap-1",
                  engineTab === key
                    ? "bg-electric-blue/10 text-electric-blue border-electric-blue/40 font-medium"
                    : "bg-card text-muted-foreground border-border"
                )}>
                <Icon className="w-3 h-3" />
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* ── Signals Tab ── */}
        {engineTab === "signals" && (
          <div>
            {/* Stats row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 divide-x border-b border-border">
              {[
                { label: "Total Signals", value: engine.signals.length, color: "text-foreground" },
                { label: "Critical", value: engine.signals.filter(s => s.severity === "Critical").length, color: "text-signal-red" },
                { label: "High", value: engine.signals.filter(s => s.severity === "High").length, color: "text-signal-yellow" },
                { label: "Active Chains", value: engine.activeChains.length, color: "text-electric-blue" },
              ].map(stat => (
                <div key={stat.label} className="px-4 py-3 text-center">
                  <div className={cn("text-xl font-bold font-mono", stat.color)}>{stat.value}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">{stat.label}</div>
                </div>
              ))}
            </div>
            <div className="divide-y max-h-80 overflow-y-auto relative">
              {engine.signals.map((sig, idx) => {
                const locked = !isPaidTier && idx > 0;
                return (
                  <div key={sig.id} className={cn("px-4 py-3 flex items-start gap-3 hover:bg-secondary/20 transition-colors", locked && "select-none")}
                    style={locked ? { filter: "blur(4px)", pointerEvents: "none", opacity: 0.45 } : undefined}>
                    <span className={cn("w-2 h-2 rounded-full flex-shrink-0 mt-1.5", severityDot(sig.severity))} />
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className={cn("text-xs font-medium px-1.5 py-0.5 rounded border", severityColor(sig.severity))}>
                          {sig.severity}
                        </span>
                        <span className="text-xs font-medium text-foreground">{sig.title}</span>
                        <span className="text-xs text-muted-foreground">{sig.source}</span>
                      </div>
                      <p className="text-xs text-muted-foreground leading-snug line-clamp-2">{sig.description}</p>
                    </div>
                    <div className="text-right flex-shrink-0 flex items-start gap-1">
                      <div>
                        <div className={cn("text-lg font-bold font-mono",
                          sig.score >= 85 ? "text-signal-red" : sig.score >= 70 ? "text-signal-yellow" : "text-signal-green"
                        )}>{sig.score}</div>
                        <div className="text-xs text-muted-foreground">score</div>
                      </div>
                      <ScoreExplainer metricName={sig.category} rawScore={sig.score} size="sm" />
                    </div>
                  </div>
                );
              })}
              {!isPaidTier && engine.signals.length > 1 && (
                <div className="absolute bottom-0 inset-x-0 flex flex-col items-center justify-end pb-4 pt-16 pointer-events-auto"
                  style={{ background: "linear-gradient(to bottom, transparent 0%, hsl(var(--card) / 0.97) 55%)" }}>
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <Lock className="w-3.5 h-3.5 text-electric-blue" />
                    <span className="text-xs font-bold text-foreground">
                      {engine.signals.length - 1} more signal{engine.signals.length - 1 !== 1 ? "s" : ""} available on paid plans
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">Free tier shows one signal area. Upgrade for full diagnostic depth.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── Diagnosis Tab ── */}
        {engineTab === "diagnosis" && (
          <div className="divide-y max-h-[480px] overflow-y-auto">
            {engine.diagnoses.length === 0 && (
              <div className="px-4 py-8 text-center text-sm text-muted-foreground">No diagnoses generated yet.</div>
            )}
            <div className="relative">
            {engine.diagnoses.map((diag, idx) => {
              const locked = !isPaidTier && idx > 0;
              return (
              <div key={diag.signalId} className="hover:bg-secondary/20 transition-colors"
                style={locked ? { filter: "blur(4px)", pointerEvents: "none", opacity: 0.45, userSelect: "none" } : undefined}>
                <button
                  className="w-full px-4 py-3 flex items-start gap-3 text-left"
                  onClick={() => !locked && setExpandedDiag(expandedDiag === diag.signalId ? null : diag.signalId)}
                >
                  <FlaskConical className="w-4 h-4 text-teal mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-0.5">
                      <span className="text-xs font-semibold text-foreground">{diag.rootCause}</span>
                      <span className="text-xs px-1.5 py-0.5 bg-teal/10 text-teal border border-teal/30 rounded">
                        {diag.signalCategory}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2">{diag.rootCauseDescription}</p>
                  </div>
                  <div className="flex-shrink-0 flex items-center gap-2">
                    <div className="text-right">
                      <div className="text-sm font-bold font-mono text-electric-blue">{diag.confidence}%</div>
                      <div className="text-xs text-muted-foreground">confidence</div>
                    </div>
                    <ChevronRight className={cn("w-4 h-4 text-muted-foreground transition-transform",
                      expandedDiag === diag.signalId && "rotate-90")} />
                  </div>
                </button>

                {expandedDiag === diag.signalId && !locked && (
                  <div className="px-4 pb-4 space-y-3 border-t border-border/50 bg-secondary/10">
                    <div className="pt-3">
                      <div className="text-xs font-semibold text-foreground mb-2 uppercase tracking-wide">Framework Findings</div>
                      <div className="space-y-2">
                        {diag.frameworkFindings.map(ff => (
                          <div key={ff.frameworkId} className="bg-card rounded-lg p-3 border border-border">
                            <div className="flex items-center gap-2 mb-1">
                              <Database className="w-3.5 h-3.5 text-electric-blue" />
                              <span className="text-xs font-semibold text-foreground">{ff.frameworkName}</span>
                              <span className={cn("text-xs px-1.5 py-0.5 rounded border ml-auto",
                                ff.severity === "Critical" ? "text-signal-red bg-signal-red/10 border-signal-red/30" :
                                ff.severity === "High" ? "text-signal-yellow bg-signal-yellow/10 border-signal-yellow/30" :
                                "text-electric-blue bg-electric-blue/10 border-electric-blue/30"
                              )}>{ff.severity}</span>
                            </div>
                            <p className="text-xs text-muted-foreground leading-relaxed">{ff.finding}</p>
                            <div className="flex gap-1 mt-1.5">
                              {ff.outputsTo.map(m => (
                                <span key={m} className="text-xs px-1 py-0.5 bg-secondary rounded text-muted-foreground">→ {m}</span>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="bg-card rounded-lg p-3 border border-border">
                        <div className="text-xs font-semibold text-foreground mb-1.5 flex items-center gap-1">
                          <ArrowRightCircle className="w-3.5 h-3.5 text-signal-green" />
                          Advisory Triggers
                        </div>
                        {diag.advisoryTriggers.map(t => (
                          <div key={t} className="text-xs text-muted-foreground flex items-center gap-1.5 mb-1">
                            <span className="w-1 h-1 rounded-full bg-signal-green" />
                            {t}
                          </div>
                        ))}
                      </div>
                      <div className="bg-card rounded-lg p-3 border border-border">
                        <div className="text-xs font-semibold text-foreground mb-1.5 flex items-center gap-1">
                          <AlertTriangle className="w-3.5 h-3.5 text-signal-yellow" />
                          Structural Flags
                        </div>
                        {diag.structuralFlags.map(f => (
                          <div key={f} className="text-xs text-muted-foreground flex items-center gap-1.5 mb-1">
                            <span className="w-1 h-1 rounded-full bg-signal-yellow" />
                            {f}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
              );
            })}
            {!isPaidTier && engine.diagnoses.length > 1 && (
              <div className="absolute bottom-0 inset-x-0 flex flex-col items-center justify-end pb-4 pt-16 pointer-events-auto"
                style={{ background: "linear-gradient(to bottom, transparent 0%, hsl(var(--card) / 0.97) 55%)" }}>
                <div className="flex items-center gap-1.5 mb-1.5">
                  <Lock className="w-3.5 h-3.5 text-electric-blue" />
                  <span className="text-xs font-bold text-foreground">
                    {engine.diagnoses.length - 1} more diagnosis{engine.diagnoses.length - 1 !== 1 ? "es" : ""} available on paid plans
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">Free tier shows one sub-area diagnosis. Upgrade for full depth across all departments.</p>
              </div>
            )}
            </div>
          </div>
        )}

      </div>

      {/* ── Strategic Clarity + Structural Integrity ── */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <div className="bg-card rounded-lg border-2 border-border shadow-card">
          <div className="flex items-center gap-2 px-4 py-3 border-b-2 border-border bg-secondary/60 rounded-t-lg">
            <Target className="w-4 h-4 text-electric-blue" />
            <h2 className="text-sm font-bold text-foreground">Strategic Clarity Check</h2>
            <span className="ml-auto text-xs text-muted-foreground">{clarityChecks.filter(c => c.status === "warn").length} items flagged</span>
          </div>
          <div className="divide-y max-h-72 overflow-y-auto">
            {clarityChecks.map(item => (
              <div key={item.label} className="px-4 py-3 hover:bg-secondary/30 transition-colors cursor-pointer" onClick={() => setSelectedCheck(item)}>
                <div className="flex items-start gap-3">
                  {item.status === "pass"
                    ? <CheckCircle className="w-3.5 h-3.5 text-signal-green mt-0.5 flex-shrink-0" />
                    : <AlertCircle className="w-3.5 h-3.5 text-signal-yellow mt-0.5 flex-shrink-0" />}
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium text-foreground">{item.label}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{item.note}</div>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-card rounded-lg border-2 border-border shadow-card">
          <div className="flex items-center gap-2 px-4 py-3 border-b-2 border-border bg-secondary/60 rounded-t-lg">
            <Shield className="w-4 h-4 text-teal" />
            <h2 className="text-sm font-bold text-foreground">Structural Integrity Check</h2>
            <span className="ml-auto text-xs text-muted-foreground">{integrityChecks.filter(c => c.status === "warn").length} items flagged</span>
          </div>
          <div className="divide-y max-h-72 overflow-y-auto">
            {integrityChecks.map(item => (
              <div key={item.label} className="px-4 py-3 hover:bg-secondary/30 transition-colors cursor-pointer" onClick={() => setSelectedCheck(item)}>
                <div className="flex items-start gap-3">
                  {item.status === "pass"
                    ? <CheckCircle className="w-3.5 h-3.5 text-signal-green mt-0.5 flex-shrink-0" />
                    : <AlertCircle className="w-3.5 h-3.5 text-signal-yellow mt-0.5 flex-shrink-0" />}
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium text-foreground">{item.label}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{item.note}</div>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Insight Signal Stream ── */}
      <div className="bg-card rounded-lg border-2 border-border shadow-card">
        <div className="px-4 py-3 border-b-2 border-border bg-secondary/60 rounded-t-lg flex flex-wrap items-center gap-2">
          <Activity className="w-4 h-4 text-electric-blue" />
          <h2 className="text-sm font-bold text-foreground">Signal Stream</h2>
          <div className="ml-auto flex flex-wrap gap-1.5">
            <button onClick={() => setTypeFilter("All")}
              className={cn("text-xs px-2.5 py-1 rounded-full border transition-all",
                typeFilter === "All" ? "bg-electric-blue/10 text-electric-blue border-electric-blue/40 font-medium" : "bg-card text-muted-foreground border-border"
              )}>All</button>
            {insightTypes.map(t => (
              <button key={t} onClick={() => setTypeFilter(t)}
                className={cn("text-xs px-2.5 py-1 rounded-full border transition-all",
                  typeFilter === t ? "bg-electric-blue/10 text-electric-blue border-electric-blue/40 font-medium" : "bg-card text-muted-foreground border-border"
                )}>{t}</button>
            ))}
          </div>
        </div>
        <div className="divide-y">
          {filtered.map(ins => (
            <div key={ins.id} className="px-4 py-3 flex items-start gap-3 hover:bg-secondary/20 transition-colors">
              <SignalDot signal={ins.signal} />
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <span className={cn("text-xs font-medium px-1.5 py-0.5 rounded border",
                    ins.signal === "red" ? "text-signal-red bg-signal-red/10 border-signal-red/30" :
                    ins.signal === "yellow" ? "text-signal-yellow bg-signal-yellow/10 border-signal-yellow/30" :
                    ins.signal === "green" ? "text-signal-green bg-signal-green/10 border-signal-green/30" :
                    "text-electric-blue bg-electric-blue/10 border-electric-blue/30"
                  )}>{ins.type}</span>
                  <span className="text-xs text-muted-foreground">{ins.department}</span>
                  <span className="text-xs text-muted-foreground">{ins.framework}</span>
                </div>
                <p className="text-sm text-foreground/80 leading-snug line-clamp-2">{ins.situation}</p>
                <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{ins.recommendation}</p>
              </div>
              <ScoreBadge score={ins.executivePriorityScore} signal={ins.signal} size="sm" />
            </div>
          ))}
        </div>
      </div>

      {/* ── Advisory Recommendations from Engine ── */}
      {engine.recommendations.length > 0 && (
        <div className="bg-card rounded-lg border-2 border-border shadow-card">
          <div className="px-4 py-3 border-b-2 border-border bg-secondary/60 rounded-t-lg flex items-center gap-2">
            <Brain className="w-4 h-4 text-signal-green" />
            <h2 className="text-sm font-bold text-foreground">Engine-Generated Recommendations</h2>
            <span className="ml-auto text-xs text-muted-foreground">{engine.recommendations.length} recommendations · {engine.generatedActions.length} actions created</span>
          </div>
          <div className="divide-y max-h-72 overflow-y-auto">
            {engine.recommendations.slice(0, 6).map(rec => (
              <div key={rec.id} className="px-4 py-3 hover:bg-secondary/20 transition-colors">
                <div className="flex items-start gap-3">
                  <ArrowRightCircle className={cn("w-4 h-4 flex-shrink-0 mt-0.5",
                    rec.priority === "Immediate" ? "text-signal-red" :
                    rec.priority === "This Week" ? "text-signal-yellow" : "text-signal-green"
                  )} />
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-0.5">
                      <span className={cn("text-xs font-medium px-1.5 py-0.5 rounded border",
                        rec.priority === "Immediate" ? "text-signal-red bg-signal-red/10 border-signal-red/30" :
                        rec.priority === "This Week" ? "text-signal-yellow bg-signal-yellow/10 border-signal-yellow/30" :
                        "text-signal-green bg-signal-green/10 border-signal-green/30"
                      )}>{rec.priority}</span>
                      <span className="text-xs font-semibold text-foreground">{rec.title}</span>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2">{rec.action}</p>
                    <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                      <span>Owner: {rec.owner}</span>
                      <span>→ {rec.timeToImpact}</span>
                      <span className="text-electric-blue">{rec.category}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Governance Log ── */}
      <div className="bg-card rounded-lg border-2 border-border shadow-card">
        <div className="px-4 py-3 border-b-2 border-border bg-secondary/60 flex flex-wrap items-center gap-2">
          <Shield className="w-4 h-4 text-signal-yellow" />
          <h2 className="text-sm font-bold text-foreground">Governance & Risk Log</h2>
          <span className="ml-auto flex gap-1">
            {(["all", "Risk", "Decision", "Change"] as const).map(t => (
              <button key={t} onClick={() => setGovTab(t)}
                className={cn("text-xs px-2.5 py-1 rounded-full border transition-all",
                  govTab === t ? "bg-electric-blue/10 text-electric-blue border-electric-blue/40 font-medium" : "bg-card text-muted-foreground border-border"
                )}>{t === "all" ? "All" : t}</button>
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

      {/* ── Check detail drawer ── */}
      {selectedCheck && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
          <div className="absolute inset-0 bg-foreground/20 backdrop-blur-sm" onClick={() => setSelectedCheck(null)} />
          <div className="relative w-full sm:max-w-lg bg-card border-2 border-border rounded-t-2xl sm:rounded-2xl shadow-elevated p-6 sm:m-4 animate-fade-in" style={{ paddingBottom: "calc(1.5rem + env(safe-area-inset-bottom, 0px))" }}>
            <div className="flex items-start gap-3 mb-4">
              {selectedCheck.status === "pass"
                ? <CheckCircle className="w-5 h-5 text-signal-green mt-0.5 flex-shrink-0" />
                : <AlertCircle className="w-5 h-5 text-signal-yellow mt-0.5 flex-shrink-0" />}
              <div className="flex-1">
                <h3 className="text-sm font-bold text-foreground">{selectedCheck.label}</h3>
                <div className={cn("text-xs font-medium mt-0.5", selectedCheck.status === "pass" ? "text-signal-green" : "text-signal-yellow")}>
                  {selectedCheck.status === "pass" ? "Passing" : "Needs Attention"}
                </div>
              </div>
              <button onClick={() => setSelectedCheck(null)} className="p-1 rounded hover:bg-secondary">
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>
            <div className="bg-secondary rounded-lg p-4">
              <p className="text-sm text-muted-foreground leading-relaxed">{selectedCheck.detail}</p>
            </div>
          </div>
        </div>
      )}

      {/* ── Org Audit Modal ── */}
      {(auditStatus === "selecting" || auditStatus === "running" || auditStatus === "complete") && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4">
          <div className="absolute inset-0 bg-foreground/30 backdrop-blur-sm" onClick={() => auditStatus !== "running" && setAuditStatus("idle")} />
          <div className="relative w-full sm:max-w-2xl bg-card border-2 border-border rounded-t-2xl sm:rounded-2xl shadow-elevated animate-fade-in max-h-[92dvh] sm:max-h-[90vh] flex flex-col" style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}>

            {/* Modal Header */}
            <div className="flex items-center gap-3 px-6 py-4 border-b-2 border-border bg-secondary/60 rounded-t-2xl">
              <ClipboardList className="w-5 h-5 text-teal" />
              <div className="flex-1">
                <h2 className="text-sm font-bold text-foreground">Full Organizational Audit</h2>
                <p className="text-xs text-muted-foreground">
                  {auditStatus === "selecting" && "Select audit type to begin"}
                  {auditStatus === "running" && `Running ${auditType === "external" ? "External Compliance" : "Internal Operational"} Audit…`}
                  {auditStatus === "complete" && `${auditType === "external" ? "External Compliance" : "Internal Operational"} Audit Complete`}
                </p>
              </div>
              {auditStatus !== "running" && (
                <button onClick={() => setAuditStatus("idle")} className="p-1.5 rounded-lg hover:bg-secondary transition-colors">
                  <X className="w-4 h-4 text-muted-foreground" />
                </button>
              )}
            </div>

            {/* Audit Type Selection */}
            {auditStatus === "selecting" && (
              <div className="p-6 space-y-4">
                <p className="text-sm text-muted-foreground">Choose the type of audit to run against your organization:</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* External Audit */}
                  <button
                    onClick={() => startAudit("external")}
                    className="text-left p-5 rounded-xl border-2 border-border hover:border-teal/50 hover:bg-teal/4 transition-all group"
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-8 h-8 rounded-lg bg-teal/10 border border-teal/30 flex items-center justify-center">
                        <Building2 className="w-4 h-4 text-teal" />
                      </div>
                      <span className="text-sm font-bold text-foreground group-hover:text-teal transition-colors">External Audit</span>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed mb-3">
                      Checks your organization against standards that actual external auditors and compliance bodies use. Focuses on regulatory requirements, governance controls, financial oversight, and legal compliance.
                    </p>
                    <div className="space-y-1">
                      {["SOX compliance & financial controls", "ISO 31000 risk register standards", "COSO internal control framework", "GDPR & regulatory alignment", "Corporate governance (OECD)"].map(item => (
                        <div key={item} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <span className="w-1 h-1 rounded-full bg-teal flex-shrink-0" />
                          {item}
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 text-xs font-semibold text-teal">Run External Audit →</div>
                  </button>

                  {/* Internal Audit */}
                  <button
                    onClick={() => startAudit("internal")}
                    className="text-left p-5 rounded-xl border-2 border-border hover:border-electric-blue/50 hover:bg-electric-blue/4 transition-all group"
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-8 h-8 rounded-lg bg-electric-blue/10 border border-electric-blue/30 flex items-center justify-center">
                        <Search className="w-4 h-4 text-electric-blue" />
                      </div>
                      <span className="text-sm font-bold text-foreground group-hover:text-electric-blue transition-colors">Internal Audit</span>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed mb-3">
                      Checks that everything inside your organization is running smoothly. Focuses on operational health, strategic alignment, execution discipline, and process adherence.
                    </p>
                    <div className="space-y-1">
                      {["Strategic & OKR alignment", "Initiative health & delivery", "Execution discipline & backlog", "Leadership bandwidth & span", "Knowledge capture & maturity"].map(item => (
                        <div key={item} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <span className="w-1 h-1 rounded-full bg-electric-blue flex-shrink-0" />
                          {item}
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 text-xs font-semibold text-electric-blue">Run Internal Audit →</div>
                  </button>
                </div>
              </div>
            )}

            {/* Running State */}
            {auditStatus === "running" && (
              <div className="p-8 flex flex-col items-center gap-6">
                <div className="w-16 h-16 rounded-full border-4 border-teal/20 border-t-teal animate-spin" />
                <div className="text-center">
                  <div className="text-sm font-bold text-foreground mb-1">Scanning organizational data…</div>
                  <div className="text-xs text-muted-foreground">Running {auditType === "external" ? "compliance and governance" : "operational and strategic"} checks</div>
                </div>
                <div className="w-full max-w-xs">
                  <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
                    <span>Progress</span>
                    <span>{auditProgress}%</span>
                  </div>
                  <div className="h-2 bg-secondary rounded-full overflow-hidden">
                    <div
                      className="h-full bg-teal rounded-full transition-all duration-300"
                      style={{ width: `${auditProgress}%` }}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Results */}
            {auditStatus === "complete" && (
              <div className="flex flex-col overflow-hidden">
                {/* Score summary */}
                <div className="grid grid-cols-3 divide-x border-b border-border">
                  <div className="py-3 text-center">
                    <div className="text-xl font-bold font-mono text-signal-green">{auditPass}</div>
                    <div className="text-xs text-muted-foreground">Passed</div>
                  </div>
                  <div className="py-3 text-center">
                    <div className="text-xl font-bold font-mono text-signal-yellow">{auditWarn}</div>
                    <div className="text-xs text-muted-foreground">Warnings</div>
                  </div>
                  <div className="py-3 text-center">
                    <div className="text-xl font-bold font-mono text-signal-red">{auditFail}</div>
                    <div className="text-xs text-muted-foreground">Failed</div>
                  </div>
                </div>

                <div className="overflow-y-auto divide-y">
                  {auditFindings.map((finding, i) => (
                    <div key={i} className="px-5 py-4 hover:bg-secondary/20 transition-colors">
                      <div className="flex items-start gap-3">
                        {finding.status === "pass"
                          ? <CheckCircle className="w-4 h-4 text-signal-green mt-0.5 flex-shrink-0" />
                          : finding.status === "warn"
                          ? <AlertCircle className="w-4 h-4 text-signal-yellow mt-0.5 flex-shrink-0" />
                          : <AlertTriangle className="w-4 h-4 text-signal-red mt-0.5 flex-shrink-0" />}
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            <span className="text-xs font-bold text-foreground">{finding.area}</span>
                            <span className={cn("text-xs px-1.5 py-0.5 rounded border font-medium",
                              finding.status === "pass" ? "text-signal-green bg-signal-green/10 border-signal-green/30" :
                              finding.status === "warn" ? "text-signal-yellow bg-signal-yellow/10 border-signal-yellow/30" :
                              "text-signal-red bg-signal-red/10 border-signal-red/30"
                            )}>{finding.status === "pass" ? "Pass" : finding.status === "warn" ? "Warning" : "Fail"}</span>
                          </div>
                          <p className="text-xs text-muted-foreground mb-1.5 leading-relaxed">{finding.finding}</p>
                          <div className="flex items-start gap-1.5">
                            <ArrowRightCircle className="w-3 h-3 text-teal mt-0.5 flex-shrink-0" />
                            <p className="text-xs text-foreground/70 leading-relaxed">{finding.recommendation}</p>
                          </div>
                          <div className="mt-1.5 text-xs text-muted-foreground/70 italic">Source: {finding.source}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="px-6 py-4 border-t border-border bg-secondary/30 rounded-b-2xl flex items-center justify-between gap-3">
                  <span className="text-xs text-muted-foreground">
                    {auditType === "external" ? "External Compliance Audit" : "Internal Operational Audit"} · {new Date().toLocaleDateString()}
                  </span>
                  <button
                    onClick={() => setAuditStatus("selecting")}
                    className="text-xs px-3 py-1.5 rounded-lg border border-teal/40 text-teal hover:bg-teal/8 transition-colors font-medium"
                  >
                    Run Other Audit
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      {/* ════════════════════════════════════════
          EXEC CAPACITY & DELEGATION METER
          ════════════════════════════════════════ */}
      {(() => {
        const depts = [...departments].sort((a, b) => b.capacityUsed - a.capacityUsed);
        const overloaded = depts.filter(d => d.capacityUsed >= 80);
        const available  = depts.filter(d => d.capacityUsed < 65);
        const avgLoad    = depts.length ? Math.round(depts.reduce((s, d) => s + d.capacityUsed, 0) / depts.length) : 0;

        const delegationRecs: { action: string; from: string; to: string; toCapacity: number }[] = [];
        if (overloaded.length > 0 && available.length > 0 && actionItems.length > 0) {
          actionItems.filter(a => a.status !== "Completed").slice(0, 3).forEach((item, i) => {
            const receiver = available[i % available.length];
            const sender   = overloaded[i % overloaded.length];
            if (receiver && sender) {
              delegationRecs.push({
                action: item.title,
                from:   sender.head.split(" ").pop() ?? sender.head,
                to:     receiver.head,
                toCapacity: 100 - receiver.capacityUsed,
              });
            }
          });
        }

        return (
          <div className="rounded-2xl border overflow-hidden"
            style={{ background: "hsl(var(--card))", borderColor: "hsl(var(--border))", boxShadow: "0 4px 24px rgba(0,0,0,0.07)" }}>

            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-secondary/40">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-electric-blue/10">
                  <Users className="w-3.5 h-3.5 text-electric-blue" />
                </div>
                <div>
                  <span className="text-sm font-bold text-foreground">Exec Capacity &amp; Delegation Meter</span>
                  <span className="text-[10px] text-muted-foreground ml-2">Avg load: {avgLoad}%</span>
                </div>
              </div>
              {overloaded.length > 0 && (
                <span className="text-[10px] font-bold px-2.5 py-1 rounded-full text-amber bg-amber/10 border border-amber/20">
                  {overloaded.length} overloaded
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 divide-y xl:divide-y-0 xl:divide-x divide-border">

              {/* Left — all department capacity bars */}
              <div className="divide-y divide-border">
                {depts.map((d) => {
                  const load = d.capacityUsed;
                  const loadColor = load >= 90 ? "hsl(350 72% 46%)" : load >= 80 ? "hsl(38 82% 44%)" : "hsl(160 56% 36%)";
                  const isOverloaded = load >= 80;
                  return (
                    <div key={d.head} className="px-6 py-3.5">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="text-xs font-semibold text-foreground truncate">{d.head}</span>
                          <span className="text-[10px] text-muted-foreground hidden sm:inline">{d.name.split(" ")[0]}</span>
                        </div>
                        <div className="flex items-center gap-1.5 flex-shrink-0">
                          {d.blockedTasks > 0 && (
                            <span className="text-[10px] text-amber bg-amber/10 px-1.5 py-0.5 rounded font-semibold">
                              {d.blockedTasks} blocked
                            </span>
                          )}
                          {isOverloaded && (
                            <span className="text-[10px] font-bold text-rose bg-rose/10 px-1.5 py-0.5 rounded border border-rose/20">Overloaded</span>
                          )}
                          <span className="text-sm font-black font-mono" style={{ color: loadColor }}>{load}%</span>
                        </div>
                      </div>
                      <div className="h-2 rounded-full overflow-hidden" style={{ background: "hsl(var(--muted))" }}>
                        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${load}%`, background: loadColor }} />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Right — delegation recommendations */}
              <div className="px-6 py-5">
                <div className="flex items-center gap-1.5 mb-4">
                  <ArrowRight className="w-3.5 h-3.5 text-electric-blue" />
                  <span className="text-[11px] font-bold uppercase tracking-wider text-electric-blue">Auto-Recommended Delegations</span>
                </div>
                {delegationRecs.length > 0 ? (
                  <div className="space-y-3">
                    {delegationRecs.map((rec, i) => (
                      <div key={i} className="rounded-xl px-4 py-3 border flex items-start gap-3"
                        style={{ background: "hsl(222 70% 46% / 0.04)", borderColor: "hsl(222 70% 50% / 0.14)" }}>
                        <div className="w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 mt-0.5"
                          style={{ background: "hsl(222 70% 46% / 0.12)" }}>
                          <ArrowRight className="w-3 h-3 text-electric-blue" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-foreground leading-snug mb-1.5">{rec.action}</p>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-[10px] text-muted-foreground">Delegate from</span>
                            <span className="text-[10px] font-bold text-amber">{rec.from}</span>
                            <span className="text-[10px] text-muted-foreground">→ to</span>
                            <span className="text-[10px] font-bold text-electric-blue">{rec.to}</span>
                            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-signal-green/10 text-signal-green font-semibold">{rec.toCapacity}% available</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-10 text-center">
                    <CheckCircle className="w-8 h-8 text-signal-green mb-2 opacity-40" />
                    <p className="text-xs text-muted-foreground">All executives within capacity.</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">No delegations recommended.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })()}

    </div>
    </div>
  );
}
