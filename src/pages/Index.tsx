import { insights, departments, frameworks, orgMetrics, getScoreSignal, formatCurrency, actionItems, governanceLogs, initiatives } from "@/lib/pmoData";
import InsightCard from "@/components/InsightCard";
import DepartmentCard from "@/components/DepartmentCard";
import FrameworkPanel from "@/components/FrameworkPanel";
import OrgHealthOrb from "@/components/OrgHealthOrb";
import { ScoreBadge } from "@/components/ScoreBadge";
import { AlertTriangle, Rocket, Users, TrendingUp, Clock, DollarSign, Shield, BarChart3, ArrowUp, Target, FileText, CheckCircle, ChevronRight, Building2, Sparkles, Zap, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";
import { loadProfile } from "@/lib/companyStore";

const sortedInsights = [...insights].sort((a, b) => b.executivePriorityScore - a.executivePriorityScore);
const topDepts = [...departments].sort((a, b) => b.maturityScore - a.maturityScore).slice(0, 6);

// ── Tier definitions ──
// status: "current" | "subscribe" | "trial" | "locked"
const TIERS: {
  id: string; label: string; price: string | null; tagline: string;
  color: string; bg: string; border: string; features: string[];
  cta: string; status: "current" | "subscribe" | "trial" | "locked";
  badge?: string;
}[] = [
  {
    id: "free",
    label: "Free",
    price: null,
    tagline: "Quick Wins",
    color: "hsl(var(--muted-foreground))",
    bg: "hsl(var(--secondary))",
    border: "hsl(var(--border))",
    features: ["Prioritization Matrix", "Tailored Next Steps", "2 file uploads/day", "Diagnostic (no solution)"],
    cta: "Current Plan",
    status: "current",
  },
  {
    id: "tier1",
    label: "Tier 1",
    price: "$29.99/mo",
    tagline: "Quick Wins+",
    color: "hsl(var(--electric-blue))",
    bg: "hsl(var(--electric-blue) / 0.07)",
    border: "hsl(var(--electric-blue) / 0.3)",
    features: ["Impact/Effort/Risk ranking", "Ambiguity → Actionable steps", "Full diagnostic + solutions", "Priority initiative pipeline"],
    cta: "Subscribe — $29.99/mo",
    status: "subscribe",
  },
  {
    id: "tier2",
    label: "Tier 2",
    price: "$49.99/mo",
    tagline: "High-Impact",
    color: "hsl(var(--teal))",
    bg: "hsl(var(--teal) / 0.07)",
    border: "hsl(var(--teal) / 0.3)",
    features: ["Operational Advisory", "Org Structuring + Design", "Bottleneck Diagnosis", "Executive Voice Development"],
    cta: "Start 7-Day Free Trial",
    status: "trial",
    badge: "7-Day Free Trial",
  },
  {
    id: "tier3",
    label: "Tier 3",
    price: "$129.99/mo",
    tagline: "Automation & Data",
    color: "hsl(var(--navy))",
    bg: "hsl(var(--secondary))",
    border: "hsl(var(--border))",
    features: ["Workflow + KPI automation", "Consolidated reporting", "PMO best practices embedded", "Full strategy execution layer"],
    cta: "Coming Soon",
    status: "locked",
  },
];

// ── Generate advisory blurb from profile data ──
function getAdvisoryBlurb(currentState: string, futureState: string, orgName: string): string {
  if (!currentState && !futureState) return `Martin PMO brings years of consulting expertise to help ${orgName || "your organization"} convert unstructured ambition into governed execution.`;
  if (futureState) {
    const lower = futureState.toLowerCase();
    if (lower.includes("restructur") || lower.includes("reorganiz")) return `Let's map the restructure of ${orgName || "your organization"} — we'll diagnose current bottlenecks, design your future-state org structure, and build a sequenced execution plan with clear ownership at every layer.`;
    if (lower.includes("scale") || lower.includes("grow") || lower.includes("expand")) return `Scaling ${orgName || "your organization"} requires more than headcount — we'll build the operational infrastructure, governance frameworks, and decision architecture needed to grow without chaos.`;
    if (lower.includes("revenue") || lower.includes("sales") || lower.includes("pipeline")) return `Let's accelerate revenue for ${orgName || "your organization"} — we'll align your pipeline strategy, remove execution drag, and build the operational playbook that converts vision into consistent growth.`;
    if (lower.includes("process") || lower.includes("efficienc") || lower.includes("streamlin")) return `We'll systematically eliminate the friction inside ${orgName || "your organization"} — mapping your processes, closing SOP gaps, and embedding governance that frees your team to execute at full capacity.`;
    if (lower.includes("team") || lower.includes("talent") || lower.includes("hire") || lower.includes("culture")) return `Building a high-performance team inside ${orgName || "your organization"} starts with clarity — we'll define roles, authority matrices, and the operating rhythm that turns good people into great execution.`;
  }
  if (currentState) {
    return `Based on where ${orgName || "your organization"} stands today, Martin PMO will turn your current state into a structured roadmap — diagnosing gaps, sequencing priorities, and ensuring every initiative has a clear owner and measurable outcome.`;
  }
  return `Martin PMO brings years of consulting expertise to help ${orgName || "your organization"} convert ambition into governed, measurable execution.`;
}

// ── Section wrapper with clear segmentation ──
function Section({ title, action, actionTo, children }: {
  title?: React.ReactNode; action?: string; actionTo?: string; children: React.ReactNode;
}) {
  return (
    <div className="bg-card rounded-xl border-2 border-border shadow-card overflow-hidden">
      {title && (
        <div className="px-5 py-3 border-b-2 border-border flex items-center justify-between"
          style={{ background: "hsl(var(--secondary))" }}>
          <div className="text-sm font-bold text-foreground uppercase tracking-wide flex items-center gap-2">{title}</div>
          {action && actionTo && (
            <Link to={actionTo} className="text-xs text-electric-blue hover:underline flex items-center gap-0.5">
              {action} <ChevronRight className="w-3 h-3" />
            </Link>
          )}
        </div>
      )}
      <div className="p-5">{children}</div>
    </div>
  );
}

function MetricTile({ label, value, sub, icon: Icon, signal }: {
  label: string; value: string | number; sub?: string;
  icon: React.ElementType; signal?: "red" | "yellow" | "green" | "blue";
}) {
  return (
    <div className="bg-card rounded-xl border-2 border-border shadow-card p-4">
      <div className="flex items-start justify-between mb-3">
        <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center border border-border">
          <Icon className="w-4 h-4 text-muted-foreground" />
        </div>
        {signal && (
          <span className={cn("w-2.5 h-2.5 rounded-full mt-0.5",
            signal === "red" ? "bg-signal-red" : signal === "yellow" ? "bg-signal-yellow" :
            signal === "green" ? "bg-signal-green" : "bg-electric-blue"
          )} />
        )}
      </div>
      <div className="text-2xl font-bold font-mono text-foreground">{value}</div>
      <div className="text-xs text-muted-foreground mt-0.5">{label}</div>
      {sub && <div className="text-xs text-muted-foreground mt-0.5 opacity-60">{sub}</div>}
    </div>
  );
}

export default function Dashboard() {
  const profile = loadProfile();
  const criticalCount = insights.filter((i) => i.signal === "red").length;
  const budgetPct = Math.round((orgMetrics.totalBudgetUsed / orgMetrics.totalBudgetAllocated) * 100);
  const budgetSignal = getScoreSignal(budgetPct > 80 ? 30 : budgetPct > 60 ? 55 : 80);
  const pendingActions = actionItems.filter(a => a.status !== "Completed").length;
  const escalatedGov = governanceLogs.filter(g => g.status === "Escalated").length;
  const blockedInitiatives = initiatives.filter(i => i.status === "Blocked").length;

  // Summary for reports tab preview
  const goodCount = insights.filter(i => i.signal === "green" || i.signal === "blue").length;
  const warnCount = insights.filter(i => i.signal === "yellow").length;

  const advisoryBlurb = getAdvisoryBlurb(profile.currentState, profile.futureState, profile.orgName);
  const firstName = profile.userName?.split(" ")[0] || "";
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <div className="p-6 space-y-5 max-w-none">

      {/* ── Personalized Welcome Header ── */}
      <div className="rounded-2xl border-2 overflow-hidden"
        style={{ borderColor: "hsl(var(--electric-blue) / 0.2)", background: "linear-gradient(135deg, hsl(var(--electric-blue) / 0.06) 0%, hsl(var(--teal) / 0.04) 50%, hsl(var(--secondary)) 100%)" }}>
        <div className="px-6 py-5 flex flex-col md:flex-row md:items-start gap-4 justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full uppercase tracking-wider"
                style={{ background: "hsl(var(--electric-blue) / 0.12)", color: "hsl(var(--electric-blue))", border: "1px solid hsl(var(--electric-blue) / 0.25)" }}>
                LIVE
              </span>
              <span className="text-xs text-muted-foreground">
                {new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
              </span>
            </div>
            <h1 className="text-2xl font-bold text-foreground leading-tight">
              {greeting}{firstName ? `, ${firstName}` : ""}.
            </h1>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-sm text-muted-foreground">
              {profile.orgName && <span className="font-semibold text-foreground">{profile.orgName}</span>}
              {profile.orgName && (profile.industry || profile.orgType) && <span className="opacity-30">·</span>}
              {profile.industry && <span>{profile.industry}</span>}
              {profile.industry && profile.orgType && <span className="opacity-30">·</span>}
              {profile.orgType && (
                <span className="text-xs px-1.5 py-0.5 rounded font-medium"
                  style={{ background: "hsl(var(--teal) / 0.1)", color: "hsl(var(--teal))", border: "1px solid hsl(var(--teal) / 0.25)" }}>
                  {profile.orgType}
                </span>
              )}
            </div>
            {profile.currentState && (
              <p className="mt-2 text-xs text-muted-foreground leading-relaxed max-w-lg line-clamp-2">
                <span className="font-semibold text-foreground/70">Current state: </span>{profile.currentState}
              </p>
            )}
            {profile.futureState && (
              <p className="mt-0.5 text-xs leading-relaxed max-w-lg line-clamp-2"
                style={{ color: "hsl(var(--electric-blue) / 0.8)" }}>
                <span className="font-semibold">Vision: </span>{profile.futureState}
              </p>
            )}
          </div>
          <div className="flex-shrink-0 text-right">
            <div className="text-xs text-muted-foreground mb-0.5">Overall Maturity</div>
            <ScoreBadge score={orgMetrics.overallMaturityScore} signal={getScoreSignal(orgMetrics.overallMaturityScore)} size="lg" showLabel />
          </div>
        </div>

        {/* Advisory blurb strip */}
        <div className="px-6 py-3 border-t flex items-start gap-3"
          style={{ borderColor: "hsl(var(--electric-blue) / 0.15)", background: "hsl(var(--electric-blue) / 0.04)" }}>
          <Sparkles className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: "hsl(var(--electric-blue))" }} />
          <p className="text-xs leading-relaxed text-foreground/75">
            <span className="font-semibold text-foreground">Martin PMO — </span>
            {advisoryBlurb}
          </p>
        </div>
      </div>

      {/* ── Critical alert banner ── */}
      {criticalCount > 0 && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl border-2 border-signal-red/30"
          style={{ background: "hsl(var(--signal-red) / 0.06)" }}>
          <AlertTriangle className="w-4 h-4 text-signal-red flex-shrink-0" />
          <span className="text-sm text-signal-red font-semibold">
            {criticalCount} critical alert{criticalCount > 1 ? "s" : ""} need your attention
          </span>
          <span className="text-xs text-signal-red/60 ml-auto">Priority sorted ↓</span>
        </div>
      )}

      {/* ── Bottleneck flags row ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Blocked Items", value: blockedInitiatives, icon: AlertTriangle, color: "text-signal-red", bg: "bg-signal-red/6 border-signal-red/25" },
          { label: "Pending Actions", value: pendingActions, icon: Target, color: "text-signal-yellow", bg: "bg-signal-yellow/6 border-signal-yellow/25" },
          { label: "Escalated Risks", value: escalatedGov, icon: Shield, color: escalatedGov > 1 ? "text-signal-red" : "text-signal-yellow", bg: escalatedGov > 1 ? "bg-signal-red/6 border-signal-red/25" : "bg-signal-yellow/6 border-signal-yellow/25" },
          { label: "Decision Deadlines", value: orgMetrics.decisionDeadlines, icon: Clock, color: "text-signal-yellow", bg: "bg-signal-yellow/6 border-signal-yellow/25" },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className={cn("rounded-xl border-2 p-3.5 flex items-center gap-3", bg)}>
            <Icon className={cn("w-4 h-4 flex-shrink-0", color)} />
            <div>
              <div className={cn("text-2xl font-bold font-mono leading-none", color)}>{value}</div>
              <div className="text-xs text-muted-foreground mt-0.5">{label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ── 3-col: Org Health Orb + Metrics + Report Snapshot ── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">

        {/* Org Health orb */}
        <div className="bg-card rounded-xl border-2 border-border shadow-card p-5 flex flex-col items-center justify-center gap-4">
          <div className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Organizational Structure</div>
          <OrgHealthOrb score={orgMetrics.overallMaturityScore} size="lg" showLabel animated />
          <div className="w-full space-y-1.5">
            {[
              { label: "Execution Health", val: orgMetrics.avgExecutionHealth },
              { label: "SOP Coverage", val: orgMetrics.sopCoverage },
              { label: "Strategic Alignment", val: orgMetrics.avgStrategicAlignment },
            ].map(({ label, val }) => (
              <div key={label}>
                <div className="flex justify-between text-xs mb-0.5">
                  <span className="text-muted-foreground">{label}</span>
                  <span className="font-mono text-foreground">{val}%</span>
                </div>
                <div className="h-1.5 rounded-full bg-secondary overflow-hidden border border-border">
                  <div className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${val}%`, background: val >= 80 ? "hsl(var(--electric-blue))" : val >= 60 ? "hsl(var(--teal))" : val >= 40 ? "hsl(var(--signal-yellow))" : "hsl(var(--signal-red))" }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 4 core metrics */}
        <div className="xl:col-span-2 grid grid-cols-2 gap-3">
          <MetricTile label="Active Initiatives" value={orgMetrics.activeInitiatives} sub="Across all departments" icon={Rocket} />
          <MetricTile label="Critical Alerts" value={criticalCount} sub={`${insights.length} total signals`} icon={AlertTriangle} signal={criticalCount > 3 ? "red" : criticalCount > 1 ? "yellow" : "green"} />
          <MetricTile label="Blocked Tasks" value={orgMetrics.blockedTasks} sub="Pending resolution" icon={Clock} signal={orgMetrics.blockedTasks > 50 ? "red" : "yellow"} />
          <MetricTile label="Budget Deployed" value={`${budgetPct}%`} sub={`${formatCurrency(orgMetrics.totalBudgetUsed)} used`} icon={DollarSign} signal={budgetSignal} />
          <MetricTile label="Total Headcount" value={orgMetrics.totalHeadcount} sub={`${departments.length} departments`} icon={Users} />
          <MetricTile label="Execution Health" value={`${orgMetrics.avgExecutionHealth}%`} sub="Org average" icon={BarChart3} signal={getScoreSignal(orgMetrics.avgExecutionHealth)} />
          <MetricTile label="Strategic Alignment" value={`${orgMetrics.avgStrategicAlignment}%`} sub="Initiatives vs. goals" icon={TrendingUp} signal={getScoreSignal(orgMetrics.avgStrategicAlignment)} />
          <MetricTile label="Analysis Modules" value={frameworks.length} sub={`${frameworks.filter((f) => f.status === "Alerting").length} alerting`} icon={Shield} />
        </div>
      </div>

      {/* ── Report snapshot ── */}
      <Section title={<><FileText className="w-4 h-4 text-electric-blue" /> What's Happening</>} action="Full Reports" actionTo="/reports">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-signal-green/8 border-2 border-signal-green/25 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="w-4 h-4 text-signal-green" />
              <span className="text-xs font-bold text-signal-green uppercase tracking-wide">Working Well</span>
            </div>
            <div className="text-2xl font-bold font-mono text-signal-green">{goodCount}</div>
            <div className="text-xs text-muted-foreground mt-0.5">Positive signals</div>
            <p className="text-xs text-foreground/70 mt-2 leading-relaxed">
              {initiatives.filter(i => i.status === "On Track").length}/{initiatives.length} initiatives on track · {departments.filter(d => d.maturityScore >= 70).length} depts at Managed+
            </p>
          </div>
          <div className="bg-signal-yellow/8 border-2 border-signal-yellow/25 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-4 h-4 text-signal-yellow" />
              <span className="text-xs font-bold text-signal-yellow uppercase tracking-wide">Needs Attention</span>
            </div>
            <div className="text-2xl font-bold font-mono text-signal-yellow">{warnCount}</div>
            <div className="text-xs text-muted-foreground mt-0.5">Caution signals</div>
            <p className="text-xs text-foreground/70 mt-2 leading-relaxed">
              {pendingActions} actions pending · {escalatedGov} escalated risks · review recommended
            </p>
          </div>
          <div className="bg-signal-red/8 border-2 border-signal-red/25 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-4 h-4 text-signal-red" />
              <span className="text-xs font-bold text-signal-red uppercase tracking-wide">Act Now</span>
            </div>
            <div className="text-2xl font-bold font-mono text-signal-red">{criticalCount}</div>
            <div className="text-xs text-muted-foreground mt-0.5">Critical alerts</div>
            <p className="text-xs text-foreground/70 mt-2 leading-relaxed">
              {blockedInitiatives} blocked initiatives · {orgMetrics.blockedTasks} blocked tasks · immediate action
            </p>
          </div>
        </div>
      </Section>

      {/* ── SOP + Governance + Actions ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-card rounded-xl border-2 border-border shadow-card p-4">
          <div className="flex items-center gap-2 mb-3">
            <FileText className="w-4 h-4 text-teal" />
            <span className="text-xs font-bold text-foreground uppercase tracking-wide">SOP Coverage</span>
          </div>
          <div className="text-3xl font-bold font-mono text-foreground mb-2">{orgMetrics.sopCoverage}%</div>
          <div className="h-2 rounded-full bg-secondary overflow-hidden border border-border">
            <div className="h-full rounded-full bg-teal" style={{ width: `${orgMetrics.sopCoverage}%` }} />
          </div>
          <div className="text-xs text-muted-foreground mt-1.5">Avg adherence: {orgMetrics.avgSopAdherence}%</div>
        </div>
        <div className="bg-card rounded-xl border-2 border-border shadow-card p-4">
          <div className="flex items-center gap-2 mb-3">
            <Shield className="w-4 h-4 text-signal-yellow" />
            <span className="text-xs font-bold text-foreground uppercase tracking-wide">Open Governance Items</span>
          </div>
          <div className="text-3xl font-bold font-mono text-signal-yellow mb-2">{orgMetrics.governanceOpenItems}</div>
          <div className="space-y-1">
            {governanceLogs.filter(g => g.status !== "Resolved").slice(0, 2).map(g => (
              <div key={g.id} className="text-xs text-muted-foreground truncate">{g.title}</div>
            ))}
          </div>
        </div>
        <div className="bg-card rounded-xl border-2 border-border shadow-card p-4">
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle className="w-4 h-4 text-signal-green" />
            <span className="text-xs font-bold text-foreground uppercase tracking-wide">Action Items</span>
          </div>
          <div className="text-3xl font-bold font-mono text-foreground mb-0.5">{pendingActions}<span className="text-sm font-normal text-muted-foreground ml-1">pending</span></div>
          <div className="text-xs text-muted-foreground">
            {actionItems.filter(a => a.priority === "High" && a.status !== "Completed").length} high priority · {actionItems.filter(a => a.status === "In Progress").length} in progress
          </div>
        </div>
      </div>

      {/* ── Initiative flow: input → output ── */}
      <Section title={<><Rocket className="w-4 h-4 text-electric-blue" /> Initiative Pipeline</>} action="Manage All" actionTo="/initiatives">
        <div className="relative">
          {/* Flow rail */}
          <div className="flex items-center gap-0 overflow-x-auto pb-2">
            {[
              { label: "Inputs", desc: "Goals & plans defined", count: initiatives.length, color: "hsl(var(--electric-blue))", bg: "hsl(var(--electric-blue) / 0.08)" },
              null,
              { label: "Active Work", desc: "In execution", count: initiatives.filter(i => i.status !== "Completed" && i.status !== "Blocked").length, color: "hsl(var(--teal))", bg: "hsl(var(--teal) / 0.08)" },
              null,
              { label: "At Risk", desc: "Needs attention", count: initiatives.filter(i => i.status === "At Risk" || i.status === "Delayed" || i.status === "Blocked").length, color: "hsl(var(--signal-yellow))", bg: "hsl(var(--signal-yellow) / 0.08)" },
              null,
              { label: "Outcomes", desc: "Completed", count: initiatives.filter(i => i.status === "Completed").length, color: "hsl(var(--signal-green))", bg: "hsl(var(--signal-green) / 0.08)" },
            ].map((item, i) => item === null ? (
              <div key={i} className="flex-shrink-0 flex items-center">
                <div className="w-8 h-0.5 bg-border" />
                <div className="w-0 h-0 border-t-4 border-b-4 border-l-6 border-transparent" style={{ borderLeftColor: "hsl(var(--border))" }} />
              </div>
            ) : (
              <div key={i} className="flex-shrink-0 rounded-xl border-2 p-3.5 min-w-[130px] text-center"
                style={{ borderColor: item.color + "40", background: item.bg }}>
                <div className="text-2xl font-bold font-mono mb-1" style={{ color: item.color }}>{item.count}</div>
                <div className="text-xs font-semibold text-foreground">{item.label}</div>
                <div className="text-xs text-muted-foreground">{item.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* ── Main 2-col: Insights + Analysis Modules ── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        <div className="xl:col-span-2 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-foreground flex items-center gap-2 uppercase tracking-wide">
              <ArrowUp className="w-4 h-4 text-electric-blue" />
              Priority Insights
            </h2>
            <span className="text-xs text-muted-foreground font-mono">{sortedInsights.length} signals · sorted by priority</span>
          </div>
          {sortedInsights.slice(0, 5).map((ins, i) => (
            <InsightCard key={ins.id} insight={ins} rank={i + 1} />
          ))}
          <Link to="/diagnostics" className="block text-center text-xs text-electric-blue hover:underline py-1">
            View all {sortedInsights.length} insights in Diagnostics →
          </Link>
        </div>
        <div className="space-y-4">
          <FrameworkPanel frameworks={frameworks} />
        </div>
      </div>

      {/* ── Department engine ── */}
      <Section title={<><Building2 className="w-4 h-4 text-electric-blue" /> Department Health</>} action={`All ${departments.length} departments`} actionTo="/departments">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {topDepts.map((dept) => (
            <DepartmentCard key={dept.id} dept={dept} />
          ))}
        </div>
      </Section>

      {/* ── Tier / Membership Cards ── */}
      <div className="rounded-2xl border-2 overflow-hidden"
        style={{ borderColor: "hsl(var(--navy) / 0.15)", background: "linear-gradient(135deg, hsl(var(--navy) / 0.06) 0%, hsl(var(--secondary)) 100%)" }}>
        <div className="px-6 py-4 border-b-2 flex items-center justify-between"
          style={{ borderColor: "hsl(var(--navy) / 0.12)" }}>
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4" style={{ color: "hsl(var(--electric-blue))" }} />
            <span className="text-sm font-bold text-foreground uppercase tracking-wide">Unlock More with Martin PMO</span>
          </div>
          <span className="text-xs text-muted-foreground">Years of consulting expertise, built into every tier</span>
        </div>
        <div className="p-5 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {TIERS.map((tier) => (
            <div key={tier.id} className="rounded-xl border-2 p-4 flex flex-col gap-3 relative"
              style={{ borderColor: tier.border, background: tier.bg }}>
              {tier.locked && (
                <div className="absolute top-3 right-3">
                  <Lock className="w-3.5 h-3.5 text-muted-foreground opacity-50" />
                </div>
              )}
              <div>
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-xs font-bold uppercase tracking-wider" style={{ color: tier.color }}>{tier.label}</span>
                  {tier.price && (
                    <span className="text-xs font-mono font-semibold text-foreground">{tier.price}</span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">{tier.tagline}</p>
              </div>
              <ul className="space-y-1.5 flex-1">
                {tier.features.map((f) => (
                  <li key={f} className="flex items-start gap-1.5 text-xs text-foreground/75">
                    <CheckCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" style={{ color: tier.color }} />
                    {f}
                  </li>
                ))}
              </ul>
              <button
                disabled={!tier.locked}
                className="w-full text-xs font-semibold py-2 px-3 rounded-lg border transition-all"
                style={{
                  borderColor: tier.locked ? tier.color : "hsl(var(--border))",
                  color: tier.locked ? tier.color : "hsl(var(--muted-foreground))",
                  background: tier.locked ? `${tier.bg}` : "transparent",
                  opacity: tier.locked ? 1 : 0.7,
                  cursor: tier.locked ? "pointer" : "default",
                }}
              >
                {tier.cta}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

