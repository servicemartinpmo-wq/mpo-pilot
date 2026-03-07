import {
  insights, departments, frameworks, orgMetrics, getScoreSignal, formatCurrency,
  actionItems, governanceLogs, initiatives
} from "@/lib/pmoData";
import InsightCard from "@/components/InsightCard";
import DepartmentCard from "@/components/DepartmentCard";
import FrameworkPanel from "@/components/FrameworkPanel";
import { ScoreBadge } from "@/components/ScoreBadge";
import {
  AlertTriangle, Rocket, Users, TrendingUp, Clock, DollarSign, Shield,
  BarChart3, Target, FileText, CheckCircle, ChevronRight, Building2,
  Sparkles, Zap, Lock, Star, ArrowUpRight, Activity, X, Bell
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";
import { loadProfile } from "@/lib/companyStore";
import { useState } from "react";

const sortedInsights = [...insights].sort((a, b) => b.executivePriorityScore - a.executivePriorityScore);
const topDepts = [...departments].sort((a, b) => b.maturityScore - a.maturityScore).slice(0, 6);

const TIERS = [
  {
    id: "free", label: "Free", price: null, tagline: "Personal Command View",
    color: "hsl(var(--muted-foreground))", bg: "hsl(var(--secondary))", border: "hsl(var(--border))",
    features: ["Daily command dashboard", "3 projects", "Manual email/WhatsApp", "Copy/paste export", "Limited automation"],
    cta: "Current Plan", status: "current" as const,
  },
  {
    id: "tier1", label: "Tier 1", price: "$30/mo", tagline: "Professional Operator",
    color: "hsl(var(--electric-blue))", bg: "hsl(var(--electric-blue) / 0.07)", border: "hsl(var(--electric-blue) / 0.3)",
    features: ["PDF/CSV/Slides export", "G-Suite & MS integrations", "Basic AI prioritization", "10 automations", "WhatsApp integration"],
    cta: "Subscribe — $30/mo", status: "subscribe" as const,
  },
  {
    id: "tier2", label: "Tier 2", price: "$50/mo", tagline: "Workflow Builder",
    color: "hsl(var(--teal))", bg: "hsl(var(--teal) / 0.07)", border: "hsl(var(--teal) / 0.3)",
    features: ["Workflow builder", "SOP automation", "Approval flows", "Custom reporting", "API integrations", "Unlimited projects"],
    cta: "Start 7-Day Free Trial", status: "trial" as const, badge: "7-Day Free Trial",
  },
  {
    id: "tier3", label: "Tier 3", price: "$120–150/mo", tagline: "Command Center",
    color: "hsl(var(--signal-purple))", bg: "hsl(var(--secondary))", border: "hsl(var(--border))",
    features: ["Automated inbox intelligence", "System builder", "Org diagnostics", "Executive dashboard", "Branding layer", "Up to 5 users"],
    cta: "Coming Soon", status: "locked" as const,
  },
];

function getAdvisoryBlurb(currentState: string, futureState: string, orgName: string): string {
  if (futureState) {
    const lower = futureState.toLowerCase();
    if (lower.includes("restructur") || lower.includes("reorganiz"))
      return `Let's map the restructure of ${orgName || "your org"} — diagnose bottlenecks, design your future-state structure, and build a sequenced execution plan with clear ownership.`;
    if (lower.includes("scale") || lower.includes("grow") || lower.includes("expand"))
      return `Scaling ${orgName || "your org"} requires more than headcount — we'll build the operational infrastructure, governance frameworks, and decision architecture needed to grow without chaos.`;
    if (lower.includes("revenue") || lower.includes("sales") || lower.includes("pipeline"))
      return `Let's accelerate revenue for ${orgName || "your org"} — align your pipeline strategy, remove execution drag, and build the operational playbook that converts vision into consistent growth.`;
    if (lower.includes("process") || lower.includes("efficienc") || lower.includes("streamlin"))
      return `We'll systematically eliminate friction inside ${orgName || "your org"} — mapping processes, closing SOP gaps, and embedding governance that frees your team to execute at full capacity.`;
  }
  if (currentState)
    return `Based on where ${orgName || "your org"} stands today, Martin PMO will turn your current state into a structured roadmap — diagnosing gaps, sequencing priorities, and ensuring every initiative has a clear owner.`;
  return `Martin PMO brings years of consulting expertise to help ${orgName || "your organization"} convert ambition into governed, measurable execution.`;
}

// Operational Status tile
function StatusTile({ label, value, signal, sub }: { label: string; value: string | number; signal: "green" | "yellow" | "red" | "blue"; sub?: string }) {
  const cfg = {
    green: { dot: "bg-signal-green", text: "text-signal-green", bg: "bg-signal-green/8 border-signal-green/25", label: "On Track" },
    yellow: { dot: "bg-signal-yellow", text: "text-signal-yellow", bg: "bg-signal-yellow/8 border-signal-yellow/25", label: "Needs Attention" },
    red: { dot: "bg-signal-red", text: "text-signal-red", bg: "bg-signal-red/8 border-signal-red/25", label: "Critical" },
    blue: { dot: "bg-electric-blue", text: "text-electric-blue", bg: "bg-electric-blue/8 border-electric-blue/30", label: "Above Board" },
  }[signal];
  return (
    <div className={cn("rounded-2xl border-2 p-4 flex flex-col gap-2", cfg.bg)}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-foreground/70 uppercase tracking-wide">{label}</span>
        <span className={cn("w-2.5 h-2.5 rounded-full", cfg.dot)} />
      </div>
      <div className={cn("text-3xl font-black font-mono", cfg.text)}>{value}</div>
      <div className="text-xs text-muted-foreground">{sub || cfg.label}</div>
    </div>
  );
}

export default function Dashboard() {
  const profile = loadProfile();
  const [upsellDismissed, setUpsellDismissed] = useState(false);

  const criticalCount = insights.filter(i => i.signal === "red").length;
  const budgetPct = Math.round((orgMetrics.totalBudgetUsed / orgMetrics.totalBudgetAllocated) * 100);
  const pendingActions = actionItems.filter(a => a.status !== "Completed").length;
  const escalatedGov = governanceLogs.filter(g => g.status === "Escalated").length;
  const blockedInitiatives = initiatives.filter(i => i.status === "Blocked").length;
  const onTrackCount = initiatives.filter(i => i.status === "On Track").length;
  const atRiskCount = initiatives.filter(i => i.status === "At Risk" || i.status === "Delayed" || i.status === "Blocked").length;

  const advisoryBlurb = getAdvisoryBlurb(profile.currentState, profile.futureState, profile.orgName);
  const firstName = profile.userName?.split(" ")[0] || "";
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  // Today's priority items (top 5 by urgency/overdue)
  const todayItems = actionItems
    .filter(a => a.status !== "Completed")
    .sort((a, b) => (a.priority === "High" ? -1 : 1))
    .slice(0, 5);

  return (
    <div className="flex flex-col min-h-screen">

      {/* ── Upsell top bar ── */}
      {!upsellDismissed && (
        <div className="flex items-center justify-between px-5 py-2 text-xs font-medium"
          style={{ background: "linear-gradient(90deg, hsl(var(--electric-blue) / 0.12), hsl(var(--teal) / 0.10))", borderBottom: "1px solid hsl(var(--electric-blue) / 0.2)" }}>
          <div className="flex items-center gap-2">
            <Zap className="w-3.5 h-3.5 text-electric-blue flex-shrink-0" />
            <span className="text-foreground">
              <span className="font-bold text-electric-blue">Unlock more with Martin PMO-Ops</span>
              {" "}— Workflow builder, SOP automation, AI inbox intelligence &amp; more.
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button className="text-electric-blue font-bold hover:underline whitespace-nowrap">View Plans →</button>
            <button onClick={() => setUpsellDismissed(true)} className="text-muted-foreground hover:text-foreground transition-colors">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      <div className="p-6 space-y-5 max-w-none">

        {/* ── Greeting header ── */}
        <div className="rounded-2xl border-2 overflow-hidden"
          style={{ borderColor: "hsl(var(--electric-blue) / 0.2)", background: "linear-gradient(135deg, hsl(var(--electric-blue) / 0.05) 0%, hsl(var(--teal) / 0.03) 50%, hsl(var(--background)) 100%)" }}>
          <div className="px-6 pt-6 pb-0 flex flex-col md:flex-row md:items-start gap-4 justify-between">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 bg-signal-green" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-signal-green" />
                </span>
                <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: "hsl(var(--muted-foreground))" }}>
                  {new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
                </span>
              </div>
              <h1 className="text-3xl font-black text-foreground leading-tight mb-1">
                {greeting}{firstName ? `, ${firstName}` : ""}.
              </h1>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mb-2 text-sm">
                {profile.orgName && <span className="font-bold text-foreground">{profile.orgName}</span>}
                {profile.industry && <span className="text-muted-foreground">{profile.industry}</span>}
                {profile.orgType && (
                  <span className="text-xs px-2 py-0.5 rounded-full font-semibold"
                    style={{ background: "hsl(var(--teal) / 0.1)", color: "hsl(var(--teal))", border: "1px solid hsl(var(--teal) / 0.3)" }}>
                    {profile.orgType}
                  </span>
                )}
              </div>
              {profile.futureState && (
                <p className="text-xs leading-relaxed max-w-xl" style={{ color: "hsl(var(--electric-blue) / 0.8)" }}>
                  <span className="font-bold">Vision: </span>{profile.futureState}
                </p>
              )}
            </div>
            <div className="flex-shrink-0 text-right flex flex-col items-end gap-1">
              <div className="text-xs text-muted-foreground font-medium">Overall Maturity</div>
              <ScoreBadge score={orgMetrics.overallMaturityScore} signal={getScoreSignal(orgMetrics.overallMaturityScore)} size="lg" showLabel />
            </div>
          </div>

          {/* Advisory strip */}
          <div className="mt-4 mx-6 mb-0 rounded-xl px-4 py-3 flex items-start gap-3 mb-5"
            style={{ background: "hsl(var(--electric-blue) / 0.06)", border: "1px solid hsl(var(--electric-blue) / 0.15)" }}>
            <Sparkles className="w-4 h-4 flex-shrink-0 mt-0.5 text-electric-blue" />
            <p className="text-xs leading-relaxed text-foreground/80">
              <span className="font-bold text-foreground">Martin PMO Advisory — </span>
              {advisoryBlurb}
            </p>
          </div>
        </div>

        {/* ── Critical alert banner ── */}
        {criticalCount > 0 && (
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl border-2 border-signal-red/30"
            style={{ background: "hsl(var(--signal-red) / 0.06)" }}>
            <AlertTriangle className="w-4 h-4 text-signal-red flex-shrink-0 animate-pulse" />
            <span className="text-sm text-signal-red font-bold">
              {criticalCount} critical alert{criticalCount > 1 ? "s" : ""} require immediate attention
            </span>
            <Link to="/diagnostics" className="ml-auto text-xs text-signal-red/70 hover:text-signal-red flex items-center gap-1 font-semibold">
              View all <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
        )}

        {/* ── Operational Status — 4 tiles ── */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold text-foreground uppercase tracking-wide flex items-center gap-2">
              <Activity className="w-4 h-4 text-electric-blue" />
              Operational Status
            </h2>
            <span className="text-xs text-muted-foreground">Color key: Green = On Track · Yellow = Needs Attention · Red = Critical · Blue = Above Board</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <StatusTile label="On Track" value={onTrackCount} signal="green" sub="Initiatives running clean" />
            <StatusTile label="Needs Attention" value={atRiskCount} signal="yellow" sub="Delayed or at risk" />
            <StatusTile label="Critical Alerts" value={criticalCount} signal="red" sub="Immediate action required" />
            <StatusTile label="Above Board" value={insights.filter(i => i.signal === "blue").length + onTrackCount} signal="blue" sub="Exceeding expectations" />
          </div>
        </div>

        {/* ── Today's Priorities + Org Health 2-col ── */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">

          {/* Today's Priorities */}
          <div className="xl:col-span-2 bg-card rounded-2xl border-2 border-border shadow-card overflow-hidden">
            <div className="px-5 py-3.5 border-b-2 border-border flex items-center justify-between"
              style={{ background: "hsl(var(--secondary))" }}>
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 text-signal-yellow" />
                <span className="text-sm font-bold text-foreground uppercase tracking-wide">Today's Priorities</span>
              </div>
              <Link to="/action-items" className="text-xs text-electric-blue hover:underline flex items-center gap-0.5 font-semibold">
                All items <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="divide-y divide-border">
              {todayItems.map(item => {
                const due = new Date(item.dueDate);
                const isOverdue = due < new Date();
                const ini = initiatives.find(i => i.id === item.initiativeId);
                return (
                  <div key={item.id} className="px-5 py-3.5 hover:bg-secondary/30 transition-colors cursor-pointer group">
                    <div className="flex items-start gap-3">
                      <div className={cn("w-2 h-2 rounded-full mt-2 flex-shrink-0",
                        item.priority === "High" ? "bg-signal-red" :
                        item.priority === "Medium" ? "bg-signal-yellow" : "bg-signal-green"
                      )} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-semibold text-foreground">{item.title}</span>
                          <span className={cn("text-xs px-1.5 py-0.5 rounded font-medium",
                            item.priority === "High" ? "text-signal-red bg-signal-red/10" :
                            item.priority === "Medium" ? "text-signal-yellow bg-signal-yellow/10" :
                            "text-signal-green bg-signal-green/10"
                          )}>{item.priority}</span>
                        </div>
                        <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground flex-wrap">
                          <span className="flex items-center gap-1"><Users className="w-3 h-3" />{item.assignedTo}</span>
                          <span className={cn("flex items-center gap-1", isOverdue ? "text-signal-orange font-bold" : "")}>
                            <Clock className="w-3 h-3" />{item.dueDate}{isOverdue ? " · OVERDUE" : ""}
                          </span>
                          {ini && <span className="text-electric-blue truncate">{ini.name}</span>}
                        </div>
                      </div>
                      <ArrowUpRight className="w-3.5 h-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 mt-1" />
                    </div>
                  </div>
                );
              })}
              {todayItems.length === 0 && (
                <div className="px-5 py-8 text-center">
                  <CheckCircle className="w-8 h-8 text-signal-green mx-auto mb-2 opacity-60" />
                  <p className="text-sm text-muted-foreground">All caught up — no pending items.</p>
                </div>
              )}
            </div>
          </div>

          {/* Operational Health */}
          <div className="bg-card rounded-2xl border-2 border-border shadow-card overflow-hidden">
            <div className="px-5 py-3.5 border-b-2 border-border" style={{ background: "hsl(var(--secondary))" }}>
              <span className="text-sm font-bold text-foreground uppercase tracking-wide">Operational Health</span>
            </div>
            <div className="p-5 space-y-4">
              {[
                { label: "Execution Health", val: orgMetrics.avgExecutionHealth, sig: getScoreSignal(orgMetrics.avgExecutionHealth) },
                { label: "SOP Coverage", val: orgMetrics.sopCoverage, sig: getScoreSignal(orgMetrics.sopCoverage) },
                { label: "Avg: Maturity", val: orgMetrics.overallMaturityScore, sig: getScoreSignal(orgMetrics.overallMaturityScore) },
                { label: "Avg: SOP Adherence", val: orgMetrics.avgSopAdherence, sig: getScoreSignal(orgMetrics.avgSopAdherence) },
                { label: "Strategic Alignment", val: orgMetrics.avgStrategicAlignment, sig: getScoreSignal(orgMetrics.avgStrategicAlignment) },
              ].map(({ label, val, sig }) => (
                <div key={label}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-foreground font-medium">{label}</span>
                    <span className="font-mono font-bold text-foreground">{val}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-secondary overflow-hidden border border-border">
                    <div className="h-full rounded-full transition-all duration-700"
                      style={{
                        width: `${val}%`,
                        background: sig === "green" ? "hsl(var(--signal-green))" :
                          sig === "blue" ? "hsl(var(--electric-blue))" :
                          sig === "yellow" ? "hsl(var(--signal-yellow))" : "hsl(var(--signal-red))"
                      }} />
                  </div>
                </div>
              ))}
              <div className="pt-2 border-t border-border grid grid-cols-2 gap-2">
                <div className="text-center p-2 rounded-lg bg-secondary">
                  <div className="text-lg font-black font-mono text-foreground">{orgMetrics.activeInitiatives}</div>
                  <div className="text-xs text-muted-foreground">Active Initiatives</div>
                </div>
                <div className="text-center p-2 rounded-lg bg-secondary">
                  <div className="text-lg font-black font-mono text-foreground">{orgMetrics.totalHeadcount}</div>
                  <div className="text-xs text-muted-foreground">Total Headcount</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── KPI metrics row ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "Blocked Items", value: blockedInitiatives, icon: AlertTriangle, color: "text-signal-red", bg: "bg-signal-red/8 border-signal-red/25" },
            { label: "Pending Actions", value: pendingActions, icon: Target, color: "text-signal-yellow", bg: "bg-signal-yellow/8 border-signal-yellow/25" },
            { label: "Escalated Risks", value: escalatedGov, icon: Shield, color: escalatedGov > 1 ? "text-signal-red" : "text-signal-yellow", bg: escalatedGov > 1 ? "bg-signal-red/8 border-signal-red/25" : "bg-signal-yellow/8 border-signal-yellow/25" },
            { label: "Budget Deployed", value: `${budgetPct}%`, icon: DollarSign, color: budgetPct > 85 ? "text-signal-red" : "text-signal-yellow", bg: budgetPct > 85 ? "bg-signal-red/8 border-signal-red/25" : "bg-signal-yellow/8 border-signal-yellow/25" },
          ].map(({ label, value, icon: Icon, color, bg }) => (
            <div key={label} className={cn("rounded-2xl border-2 p-4 flex items-center gap-3", bg)}>
              <Icon className={cn("w-5 h-5 flex-shrink-0", color)} />
              <div>
                <div className={cn("text-2xl font-black font-mono leading-none", color)}>{value}</div>
                <div className="text-xs text-muted-foreground mt-0.5 font-medium">{label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* ── Initiatives at Risk ── */}
        <div className="bg-card rounded-2xl border-2 border-border shadow-card overflow-hidden">
          <div className="px-5 py-3.5 border-b-2 border-border flex items-center justify-between"
            style={{ background: "hsl(var(--secondary))" }}>
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-signal-orange" />
              <span className="text-sm font-bold text-foreground uppercase tracking-wide">Initiatives at Risk</span>
            </div>
            <Link to="/initiatives" className="text-xs text-electric-blue hover:underline flex items-center gap-0.5 font-semibold">
              All initiatives <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="divide-y divide-border">
            {initiatives.filter(i => i.status === "Blocked" || i.status === "At Risk" || i.status === "Delayed").slice(0, 4).map(ini => (
              <div key={ini.id} className="px-5 py-3.5 hover:bg-secondary/30 transition-colors cursor-pointer group">
                <div className="flex items-center gap-3">
                  <div className={cn("w-2.5 h-2.5 rounded-full flex-shrink-0",
                    ini.status === "Blocked" ? "bg-signal-orange" :
                    ini.status === "At Risk" ? "bg-signal-yellow" : "bg-signal-orange"
                  )} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-semibold text-foreground truncate">{ini.name}</span>
                      <span className={cn("text-xs px-2 py-0.5 rounded-full font-semibold flex-shrink-0",
                        ini.status === "Blocked" ? "text-signal-orange bg-signal-orange/10" :
                        ini.status === "Delayed" ? "text-signal-orange bg-signal-orange/10" :
                        "text-signal-yellow bg-signal-yellow/10"
                      )}>
                        {ini.status === "Blocked" ? "Needs Attention" : ini.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 mt-0.5 text-xs text-muted-foreground">
                      <span>{ini.department}</span>
                      <span className="flex items-center gap-1"><Users className="w-3 h-3" />{ini.owner}</span>
                      <span className="flex items-center gap-1"><Target className="w-3 h-3" />{ini.targetDate}</span>
                      <span className="font-mono">{ini.completionPct}% complete</span>
                    </div>
                  </div>
                  <ArrowUpRight className="w-3.5 h-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                </div>
              </div>
            ))}
            {initiatives.filter(i => i.status === "Blocked" || i.status === "At Risk" || i.status === "Delayed").length === 0 && (
              <div className="px-5 py-8 text-center">
                <CheckCircle className="w-8 h-8 text-signal-green mx-auto mb-2 opacity-60" />
                <p className="text-sm text-muted-foreground">No initiatives at risk.</p>
              </div>
            )}
          </div>
        </div>

        {/* ── AI Insights ── */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold text-foreground uppercase tracking-wide flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-electric-blue" />
              AI Insights — Priority Signals
            </h2>
            <Link to="/diagnostics" className="text-xs text-electric-blue hover:underline flex items-center gap-1 font-semibold">
              Full diagnostics <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="space-y-3">
            {sortedInsights.slice(0, 4).map((ins, i) => (
              <InsightCard key={ins.id} insight={ins} rank={i + 1} />
            ))}
          </div>
        </div>

        {/* ── 3 col: SOP / Governance / Actions ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-card rounded-2xl border-2 border-border shadow-card p-5">
            <div className="flex items-center gap-2 mb-3">
              <FileText className="w-4 h-4 text-teal" />
              <span className="text-xs font-bold text-foreground uppercase tracking-wide">SOP Coverage</span>
            </div>
            <div className="text-3xl font-black font-mono text-foreground mb-1.5">{orgMetrics.sopCoverage}%</div>
            <div className="h-2 rounded-full bg-secondary overflow-hidden border border-border mb-1.5">
              <div className="h-full rounded-full transition-all" style={{ width: `${orgMetrics.sopCoverage}%`, background: "hsl(var(--teal))" }} />
            </div>
            <div className="text-xs text-muted-foreground">Avg adherence: <span className="font-semibold text-foreground">{orgMetrics.avgSopAdherence}%</span></div>
          </div>
          <div className="bg-card rounded-2xl border-2 border-border shadow-card p-5">
            <div className="flex items-center gap-2 mb-3">
              <Shield className="w-4 h-4 text-signal-yellow" />
              <span className="text-xs font-bold text-foreground uppercase tracking-wide">Open Governance</span>
            </div>
            <div className="text-3xl font-black font-mono text-signal-yellow mb-1.5">{orgMetrics.governanceOpenItems}</div>
            <div className="space-y-1 mt-2">
              {governanceLogs.filter(g => g.status !== "Resolved").slice(0, 2).map(g => (
                <div key={g.id} className="text-xs text-muted-foreground truncate flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-signal-yellow flex-shrink-0" />
                  {g.title}
                </div>
              ))}
            </div>
          </div>
          <div className="bg-card rounded-2xl border-2 border-border shadow-card p-5">
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle className="w-4 h-4 text-signal-green" />
              <span className="text-xs font-bold text-foreground uppercase tracking-wide">Action Items</span>
            </div>
            <div className="text-3xl font-black font-mono text-foreground mb-1.5">
              {pendingActions}
              <span className="text-sm font-normal text-muted-foreground ml-1.5">pending</span>
            </div>
            <div className="text-xs text-muted-foreground">
              <span className="text-signal-red font-semibold">{actionItems.filter(a => a.priority === "High" && a.status !== "Completed").length} high priority</span>
              {" · "}{actionItems.filter(a => a.status === "In Progress").length} in progress
            </div>
          </div>
        </div>

        {/* ── Department Health ── */}
        <div className="bg-card rounded-2xl border-2 border-border shadow-card overflow-hidden">
          <div className="px-5 py-3.5 border-b-2 border-border flex items-center justify-between"
            style={{ background: "hsl(var(--secondary))" }}>
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-electric-blue" />
              <span className="text-sm font-bold text-foreground uppercase tracking-wide">Department Health</span>
            </div>
            <Link to="/departments" className="text-xs text-electric-blue hover:underline flex items-center gap-0.5 font-semibold">
              All {departments.length} departments <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="p-5 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {topDepts.map(dept => <DepartmentCard key={dept.id} dept={dept} />)}
          </div>
        </div>

        {/* ── Analysis Modules ── */}
        <FrameworkPanel frameworks={frameworks} />

        {/* ── Tier / Membership ── */}
        <div className="rounded-2xl border-2 overflow-hidden"
          style={{ borderColor: "hsl(var(--navy) / 0.15)", background: "linear-gradient(135deg, hsl(var(--navy) / 0.05) 0%, hsl(var(--secondary)) 100%)" }}>
          <div className="px-6 py-4 border-b-2 flex items-center justify-between"
            style={{ borderColor: "hsl(var(--navy) / 0.12)" }}>
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-electric-blue" />
              <span className="text-sm font-bold text-foreground uppercase tracking-wide">Unlock More with Martin PMO-Ops</span>
            </div>
            <span className="text-xs text-muted-foreground">Years of consulting expertise, built into every tier</span>
          </div>
          <div className="p-5 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            {TIERS.map(tier => {
              const isCurrent = tier.status === "current";
              const isLocked = tier.status === "locked";
              const isTrial = tier.status === "trial";
              return (
                <div key={tier.id} className="rounded-xl border-2 p-4 flex flex-col gap-3 relative"
                  style={{ borderColor: tier.border, background: tier.bg, opacity: isLocked ? 0.55 : 1 }}>
                  {"badge" in tier && tier.badge && isTrial && (
                    <div className="absolute -top-2.5 left-1/2 -translate-x-1/2">
                      <span className="text-xs font-bold px-2.5 py-0.5 rounded-full whitespace-nowrap text-white"
                        style={{ background: "hsl(var(--teal))" }}>{tier.badge}</span>
                    </div>
                  )}
                  {isLocked && <div className="absolute top-3 right-3"><Lock className="w-3.5 h-3.5 text-muted-foreground opacity-60" /></div>}
                  {isCurrent && <div className="absolute top-3 right-3"><CheckCircle className="w-3.5 h-3.5 opacity-50" style={{ color: tier.color }} /></div>}
                  <div>
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-xs font-bold uppercase tracking-wider" style={{ color: tier.color }}>{tier.label}</span>
                      {tier.price && <span className="text-xs font-mono font-bold text-foreground">{tier.price}</span>}
                    </div>
                    <p className="text-xs font-semibold text-foreground/70">{tier.tagline}</p>
                  </div>
                  <ul className="space-y-1.5 flex-1">
                    {tier.features.map(f => (
                      <li key={f} className="flex items-start gap-1.5 text-xs" style={{ color: isLocked ? "hsl(var(--muted-foreground))" : "hsl(var(--foreground) / 0.8)" }}>
                        <CheckCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" style={{ color: isLocked ? "hsl(var(--muted-foreground))" : tier.color }} />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <button disabled={isCurrent || isLocked}
                    className="w-full text-xs font-bold py-2.5 px-3 rounded-lg border-2 transition-all"
                    style={{
                      borderColor: isCurrent || isLocked ? "hsl(var(--border))" : tier.color,
                      color: isCurrent || isLocked ? "hsl(var(--muted-foreground))" : tier.color,
                      background: isTrial ? `hsl(var(--teal) / 0.1)` : tier.status === "subscribe" ? `hsl(var(--electric-blue) / 0.08)` : "transparent",
                      cursor: isCurrent || isLocked ? "default" : "pointer",
                    }}>
                    {tier.cta}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
