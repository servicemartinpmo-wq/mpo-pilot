import {
  insights, departments, frameworks, orgMetrics, getScoreSignal, formatCurrency,
  actionItems, governanceLogs, initiatives
} from "@/lib/pmoData";
import InsightCard from "@/components/InsightCard";
import FrameworkPanel from "@/components/FrameworkPanel";
import { ScoreBadge } from "@/components/ScoreBadge";
import {
  AlertTriangle, Rocket, Users, TrendingUp, Clock, DollarSign, Shield,
  BarChart3, Target, FileText, CheckCircle, ChevronRight, Building2,
  Sparkles, Zap, Lock, Star, ArrowUpRight, Activity, X, Bell,
  Flag, Mail, MessageSquare, CalendarDays, GitBranch, UserCheck
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";
import { loadProfile } from "@/lib/companyStore";
import { useState } from "react";

const sortedInsights = [...insights].sort((a, b) => b.executivePriorityScore - a.executivePriorityScore);

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
    cta: "Start 7-Day Free Trial", status: "trial" as const, badge: "7-Day Trial",
  },
  {
    id: "tier3", label: "Tier 3", price: "$120–150/mo", tagline: "Command Center",
    color: "hsl(var(--signal-purple))", bg: "hsl(var(--secondary))", border: "hsl(var(--border))",
    features: ["Automated inbox intelligence", "System builder", "Org diagnostics", "Executive dashboard", "Branding layer", "Up to 5 users"],
    cta: "Coming Soon", status: "locked" as const,
  },
];

function StatusTile({ label, value, signal, sub }: { label: string; value: string | number; signal: "green" | "yellow" | "red" | "blue"; sub?: string }) {
  const cfg = {
    green: { dot: "bg-signal-green", text: "text-signal-green", bg: "bg-signal-green/8 border-signal-green/25" },
    yellow: { dot: "bg-signal-yellow", text: "text-signal-yellow", bg: "bg-signal-yellow/8 border-signal-yellow/25" },
    red: { dot: "bg-signal-red", text: "text-signal-red", bg: "bg-signal-red/8 border-signal-red/25" },
    blue: { dot: "bg-electric-blue", text: "text-electric-blue", bg: "bg-electric-blue/8 border-electric-blue/30" },
  }[signal];
  return (
    <div className={cn("rounded-2xl border-2 p-5 flex flex-col gap-2 group cursor-pointer hover:scale-[1.02] transition-transform", cfg.bg)}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-foreground/60 uppercase tracking-wider">{label}</span>
        <span className={cn("w-2.5 h-2.5 rounded-full", cfg.dot)} />
      </div>
      <div className={cn("text-4xl font-black font-mono leading-none", cfg.text)}>{value}</div>
      <div className="text-xs text-muted-foreground font-medium">{sub}</div>
    </div>
  );
}

export default function Dashboard() {
  const profile = loadProfile();
  const [upsellDismissed, setUpsellDismissed] = useState(false);
  const [selectedTask, setSelectedTask] = useState<string | null>(null);

  const criticalCount = insights.filter(i => i.signal === "red").length;
  const budgetPct = Math.round((orgMetrics.totalBudgetUsed / orgMetrics.totalBudgetAllocated) * 100);
  const pendingActions = actionItems.filter(a => a.status !== "Completed").length;
  const escalatedGov = governanceLogs.filter(g => g.status === "Escalated").length;
  const blockedInitiatives = initiatives.filter(i => i.status === "Blocked").length;
  const onTrackCount = initiatives.filter(i => i.status === "On Track").length;
  const atRiskCount = initiatives.filter(i => i.status === "At Risk" || i.status === "Delayed" || i.status === "Blocked").length;
  const aboveBoard = insights.filter(i => i.signal === "blue").length + onTrackCount;

  const firstName = profile.userName?.split(" ")[0] || "";
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  const todayItems = actionItems
    .filter(a => a.status !== "Completed")
    .sort((a, b) => (a.priority === "High" ? -1 : 1))
    .slice(0, 6);

  const atRiskInitiatives = initiatives.filter(i => i.status === "Blocked" || i.status === "At Risk" || i.status === "Delayed").slice(0, 5);

  // Executive load data
  const execLoadData = [
    { name: "Sarah Chen", role: "CEO", load: 94, delegated: 3, blocked: 1 },
    { name: "David Kim", role: "CFO", load: 78, delegated: 5, blocked: 0 },
    { name: "Elena Vasquez", role: "CMO", load: 86, delegated: 2, blocked: 2 },
    { name: "Ryan Torres", role: "CTO", load: 91, delegated: 4, blocked: 1 },
  ];

  return (
    <div className="flex flex-col min-h-screen">

      {/* ── Upsell top bar ── */}
      {!upsellDismissed && (
        <div className="flex items-center justify-between px-5 py-2 text-xs font-medium sticky top-0 z-30"
          style={{ background: "linear-gradient(90deg, hsl(var(--electric-blue) / 0.1), hsl(var(--teal) / 0.08))", borderBottom: "1px solid hsl(var(--electric-blue) / 0.18)" }}>
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

      <div className="p-6 space-y-6 max-w-none">

        {/* ── Greeting header ── */}
        <div className="rounded-2xl border-2 overflow-hidden"
          style={{ borderColor: "hsl(var(--electric-blue) / 0.2)", background: "linear-gradient(135deg, hsl(var(--electric-blue) / 0.06) 0%, hsl(var(--teal) / 0.03) 60%, hsl(var(--background)) 100%)" }}>
          <div className="px-7 pt-7 pb-5 flex flex-col md:flex-row md:items-start gap-5 justify-between">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 bg-signal-green" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-signal-green" />
                </span>
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
                </span>
              </div>
              <h1 className="text-4xl font-black text-foreground leading-tight mb-2 tracking-tight">
                {greeting}{firstName ? `, ${firstName}` : ""}.
              </h1>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mb-3 text-sm">
                {profile.orgName && <span className="font-bold text-foreground text-base">{profile.orgName}</span>}
                {profile.industry && <span className="text-muted-foreground">{profile.industry}</span>}
                {profile.orgType && (
                  <span className="text-xs px-2.5 py-1 rounded-full font-semibold"
                    style={{ background: "hsl(var(--teal) / 0.1)", color: "hsl(var(--teal))", border: "1px solid hsl(var(--teal) / 0.3)" }}>
                    {profile.orgType}
                  </span>
                )}
              </div>
              {profile.futureState && (
                <p className="text-sm leading-relaxed max-w-xl font-medium" style={{ color: "hsl(var(--electric-blue) / 0.85)" }}>
                  <span className="font-bold">Vision: </span>{profile.futureState}
                </p>
              )}
            </div>
            <div className="flex flex-col items-end gap-3">
              <div className="text-right">
                <div className="text-xs text-muted-foreground font-medium mb-1">Overall Maturity</div>
                <ScoreBadge score={orgMetrics.overallMaturityScore} signal={getScoreSignal(orgMetrics.overallMaturityScore)} size="lg" showLabel />
              </div>
              <div className="text-right">
                <div className="text-xs text-muted-foreground font-medium mb-1">Structural Health</div>
                <ScoreBadge score={orgMetrics.sopCoverage} signal={getScoreSignal(orgMetrics.sopCoverage)} size="sm" />
              </div>
            </div>
          </div>

          {/* Advisory strip */}
          <div className="mx-7 mb-6 rounded-xl px-5 py-3.5 flex items-start gap-3"
            style={{ background: "hsl(var(--electric-blue) / 0.06)", border: "1px solid hsl(var(--electric-blue) / 0.15)" }}>
            <Sparkles className="w-4 h-4 flex-shrink-0 mt-0.5 text-electric-blue" />
            <p className="text-xs leading-relaxed text-foreground/80">
              <span className="font-bold text-foreground">Martin PMO Advisory — </span>
              {profile.futureState
                ? `Based on your vision to ${profile.futureState.slice(0, 80)}..., your immediate focus should be unblocking ${atRiskCount} at-risk initiatives and clearing ${criticalCount} critical signals before they cascade.`
                : `Your Command Center is active. ${criticalCount} critical signals require immediate attention. Focus today: unblock INI-002, address capacity constraints, and clear the ${pendingActions} pending action items.`
              }
            </p>
            <Link to="/diagnostics" className="flex-shrink-0 text-xs font-bold text-electric-blue hover:underline whitespace-nowrap">
              Full diagnostics →
            </Link>
          </div>
        </div>

        {/* ── Critical alert banner ── */}
        {criticalCount > 0 && (
          <div className="flex items-center gap-3 px-5 py-3.5 rounded-xl border-2 border-signal-red/30"
            style={{ background: "hsl(var(--signal-red) / 0.06)" }}>
            <AlertTriangle className="w-4.5 h-4.5 text-signal-red flex-shrink-0 animate-pulse" />
            <span className="text-sm text-signal-red font-bold">
              {criticalCount} critical signal{criticalCount > 1 ? "s" : ""} require immediate attention
            </span>
            <div className="flex gap-4 ml-auto text-xs">
              {insights.filter(i => i.signal === "red").slice(0, 2).map(ins => (
                <span key={ins.id} className="text-signal-red/70 font-medium truncate max-w-[200px]">{ins.department}</span>
              ))}
              <Link to="/diagnostics" className="text-signal-red/80 hover:text-signal-red flex items-center gap-0.5 font-bold whitespace-nowrap">
                View all <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        )}

        {/* ── Operational Status — 4 tiles ── */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-foreground uppercase tracking-widest flex items-center gap-2">
              <Activity className="w-4 h-4 text-electric-blue" />
              Operational Status
            </h2>
            <span className="text-xs text-muted-foreground font-medium">
              Green = On Track · Yellow = Needs Attention · Red = Critical · Blue = Above Board
            </span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatusTile label="On Track" value={onTrackCount} signal="green" sub="Initiatives running clean" />
            <StatusTile label="Needs Attention" value={atRiskCount} signal="yellow" sub="Delayed or at risk" />
            <StatusTile label="Critical Alerts" value={criticalCount} signal="red" sub="Immediate action required" />
            <StatusTile label="Above Board" value={aboveBoard} signal="blue" sub="Exceeding expectations" />
          </div>
        </div>

        {/* ── Today's Priorities + Operational Health ── */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">

          {/* Today's Priorities */}
          <div className="xl:col-span-2 bg-card rounded-2xl border-2 border-border shadow-elevated overflow-hidden">
            <div className="px-6 py-4 border-b-2 border-border flex items-center justify-between"
              style={{ background: "hsl(var(--secondary))" }}>
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center"
                  style={{ background: "hsl(var(--signal-yellow) / 0.15)" }}>
                  <Star className="w-3.5 h-3.5 text-signal-yellow" />
                </div>
                <div>
                  <span className="text-sm font-bold text-foreground uppercase tracking-wide">Today's Priorities</span>
                  <span className="text-xs text-muted-foreground ml-2 font-medium">{todayItems.length} pending</span>
                </div>
              </div>
              <Link to="/action-items" className="text-xs text-electric-blue hover:underline flex items-center gap-0.5 font-bold">
                All items <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="divide-y divide-border">
              {todayItems.map(item => {
                const due = new Date(item.dueDate);
                const isOverdue = due < new Date();
                const ini = initiatives.find(i => i.id === item.initiativeId);
                const isSelected = selectedTask === item.id;
                return (
                  <div key={item.id}
                    className="px-6 py-4 hover:bg-secondary/40 transition-colors cursor-pointer group"
                    onClick={() => setSelectedTask(isSelected ? null : item.id)}>
                    <div className="flex items-start gap-3.5">
                      <div className={cn("w-2.5 h-2.5 rounded-full mt-1.5 flex-shrink-0",
                        item.priority === "High" ? "bg-signal-red" :
                        item.priority === "Medium" ? "bg-signal-yellow" : "bg-signal-green"
                      )} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className="text-sm font-semibold text-foreground">{item.title}</span>
                          <span className={cn("text-xs px-2 py-0.5 rounded-full font-semibold",
                            item.priority === "High" ? "text-signal-red bg-signal-red/10" :
                            item.priority === "Medium" ? "text-signal-yellow bg-signal-yellow/10" :
                            "text-signal-green bg-signal-green/10"
                          )}>{item.priority}</span>
                          {isOverdue && <span className="text-xs font-bold text-signal-orange bg-signal-orange/10 px-2 py-0.5 rounded-full">OVERDUE</span>}
                        </div>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
                          <span className="flex items-center gap-1.5 font-medium">
                            <Users className="w-3 h-3" />{item.assignedTo}
                          </span>
                          <span className={cn("flex items-center gap-1.5", isOverdue ? "text-signal-orange font-bold" : "")}>
                            <Clock className="w-3 h-3" />{item.dueDate}
                          </span>
                          {ini && <span className="text-electric-blue font-medium truncate">{ini.name}</span>}
                        </div>
                        {isSelected && (
                          <div className="mt-3 p-3 rounded-lg text-xs text-foreground/80 leading-relaxed"
                            style={{ background: "hsl(var(--secondary))", border: "1px solid hsl(var(--border))" }}>
                            {item.description}
                          </div>
                        )}
                      </div>
                      <ArrowUpRight className="w-3.5 h-3.5 text-muted-foreground opacity-0 group-hover:opacity-60 transition-opacity flex-shrink-0 mt-1" />
                    </div>
                  </div>
                );
              })}
              {todayItems.length === 0 && (
                <div className="px-6 py-10 text-center">
                  <CheckCircle className="w-9 h-9 text-signal-green mx-auto mb-3 opacity-50" />
                  <p className="text-sm font-medium text-muted-foreground">All caught up — no pending items.</p>
                </div>
              )}
            </div>
          </div>

          {/* Operational Health */}
          <div className="bg-card rounded-2xl border-2 border-border shadow-elevated overflow-hidden">
            <div className="px-6 py-4 border-b-2 border-border"
              style={{ background: "hsl(var(--secondary))" }}>
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center"
                  style={{ background: "hsl(var(--electric-blue) / 0.12)" }}>
                  <Activity className="w-3.5 h-3.5 text-electric-blue" />
                </div>
                <span className="text-sm font-bold text-foreground uppercase tracking-wide">Operational Health</span>
              </div>
            </div>
            <div className="p-5 space-y-4">
              {[
                { label: "Avg: Maturity", val: orgMetrics.overallMaturityScore, sig: getScoreSignal(orgMetrics.overallMaturityScore) },
                { label: "Execution Health", val: orgMetrics.avgExecutionHealth, sig: getScoreSignal(orgMetrics.avgExecutionHealth) },
                { label: "Avg: SOP Adherence", val: orgMetrics.avgSopAdherence, sig: getScoreSignal(orgMetrics.avgSopAdherence) },
                { label: "SOP Coverage", val: orgMetrics.sopCoverage, sig: getScoreSignal(orgMetrics.sopCoverage) },
                { label: "Strategic Alignment", val: orgMetrics.avgStrategicAlignment, sig: getScoreSignal(orgMetrics.avgStrategicAlignment) },
              ].map(({ label, val, sig }) => (
                <div key={label}>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-foreground font-semibold">{label}</span>
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
              <div className="pt-3 border-t border-border grid grid-cols-2 gap-2.5">
                <div className="text-center p-3 rounded-xl bg-secondary">
                  <div className="text-2xl font-black font-mono text-foreground">{orgMetrics.activeInitiatives}</div>
                  <div className="text-xs text-muted-foreground font-medium">Active Initiatives</div>
                </div>
                <div className="text-center p-3 rounded-xl bg-secondary">
                  <div className="text-2xl font-black font-mono text-foreground">{orgMetrics.totalHeadcount}</div>
                  <div className="text-xs text-muted-foreground font-medium">Total Headcount</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── KPI metrics row ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Blocked Items", value: blockedInitiatives, icon: AlertTriangle, color: "text-signal-red", bg: "bg-signal-red/8 border-signal-red/25" },
            { label: "Pending Actions", value: pendingActions, icon: Target, color: "text-signal-yellow", bg: "bg-signal-yellow/8 border-signal-yellow/25" },
            { label: "Escalated Risks", value: escalatedGov, icon: Shield, color: escalatedGov > 1 ? "text-signal-red" : "text-signal-yellow", bg: escalatedGov > 1 ? "bg-signal-red/8 border-signal-red/25" : "bg-signal-yellow/8 border-signal-yellow/25" },
            { label: "Budget Deployed", value: `${budgetPct}%`, icon: DollarSign, color: budgetPct > 85 ? "text-signal-red" : "text-signal-yellow", bg: budgetPct > 85 ? "bg-signal-red/8 border-signal-red/25" : "bg-signal-yellow/8 border-signal-yellow/25" },
          ].map(({ label, value, icon: Icon, color, bg }) => (
            <div key={label} className={cn("rounded-2xl border-2 p-5 flex items-center gap-4 hover:scale-[1.01] transition-transform cursor-pointer", bg)}>
              <Icon className={cn("w-6 h-6 flex-shrink-0", color)} />
              <div>
                <div className={cn("text-3xl font-black font-mono leading-none", color)}>{value}</div>
                <div className="text-xs text-muted-foreground mt-1 font-semibold">{label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* ── Initiatives at Risk ── */}
        <div className="bg-card rounded-2xl border-2 border-border shadow-elevated overflow-hidden">
          <div className="px-6 py-4 border-b-2 border-border flex items-center justify-between"
            style={{ background: "hsl(var(--secondary))" }}>
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center"
                style={{ background: "hsl(var(--signal-orange) / 0.15)" }}>
                <AlertTriangle className="w-3.5 h-3.5 text-signal-orange" />
              </div>
              <div>
                <span className="text-sm font-bold text-foreground uppercase tracking-wide">Initiatives at Risk</span>
                <span className="text-xs text-muted-foreground ml-2">{atRiskInitiatives.length} flagged</span>
              </div>
            </div>
            <Link to="/initiatives" className="text-xs text-electric-blue hover:underline flex items-center gap-0.5 font-bold">
              All initiatives <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="divide-y divide-border">
            {atRiskInitiatives.map(ini => {
              const statusColor = ini.status === "Blocked" ? "text-signal-orange bg-signal-orange/10" :
                ini.status === "Delayed" ? "text-signal-orange bg-signal-orange/10" : "text-signal-yellow bg-signal-yellow/10";
              return (
                <Link to="/initiatives" key={ini.id}
                  className="px-6 py-4 hover:bg-secondary/40 transition-colors cursor-pointer group flex items-center gap-4 block">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className={cn("w-2.5 h-2.5 rounded-full flex-shrink-0",
                      ini.status === "Blocked" ? "bg-signal-orange animate-pulse" :
                      ini.status === "At Risk" ? "bg-signal-yellow" : "bg-signal-orange"
                    )} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2.5 flex-wrap mb-1">
                        <span className="text-sm font-semibold text-foreground truncate">{ini.name}</span>
                        <span className={cn("text-xs px-2 py-0.5 rounded-full font-bold flex-shrink-0", statusColor)}>
                          {ini.status === "Blocked" ? "Needs Attention" : ini.status}
                        </span>
                        <span className="text-xs font-mono text-muted-foreground">{ini.completionPct}% complete</span>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="font-medium">{ini.department}</span>
                        <span className="flex items-center gap-1"><Users className="w-3 h-3" />{ini.owner}</span>
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{ini.targetDate}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex-shrink-0 w-24">
                    <div className="h-1.5 rounded-full bg-secondary overflow-hidden border border-border">
                      <div className="h-full rounded-full transition-all"
                        style={{ width: `${ini.completionPct}%`, background: ini.status === "Blocked" ? "hsl(var(--signal-orange))" : "hsl(var(--signal-yellow))" }} />
                    </div>
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-60 transition-opacity flex-shrink-0" />
                </Link>
              );
            })}
            {atRiskInitiatives.length === 0 && (
              <div className="px-6 py-10 text-center">
                <CheckCircle className="w-9 h-9 text-signal-green mx-auto mb-3 opacity-50" />
                <p className="text-sm font-medium text-muted-foreground">No initiatives at risk.</p>
              </div>
            )}
          </div>
        </div>

        {/* ── AI Insights ── */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-foreground uppercase tracking-widest flex items-center gap-2.5">
              <div className="w-6 h-6 rounded-lg flex items-center justify-center"
                style={{ background: "hsl(var(--electric-blue) / 0.12)" }}>
                <Sparkles className="w-3.5 h-3.5 text-electric-blue" />
              </div>
              AI Insights — Priority Signals
            </h2>
            <Link to="/diagnostics" className="text-xs text-electric-blue hover:underline flex items-center gap-1 font-bold">
              Full diagnostics <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="space-y-3">
            {sortedInsights.slice(0, 4).map((ins, i) => (
              <InsightCard key={ins.id} insight={ins} rank={i + 1} />
            ))}
          </div>
        </div>

        {/* ── Executive Load / Delegation Matrix ── */}
        <div className="bg-card rounded-2xl border-2 border-border shadow-elevated overflow-hidden">
          <div className="px-6 py-4 border-b-2 border-border flex items-center justify-between"
            style={{ background: "hsl(var(--secondary))" }}>
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center"
                style={{ background: "hsl(var(--teal) / 0.12)" }}>
                <UserCheck className="w-3.5 h-3.5 text-teal" />
              </div>
              <div>
                <span className="text-sm font-bold text-foreground uppercase tracking-wide">Executive Load & Delegation Matrix</span>
                <span className="text-xs text-muted-foreground ml-2">Real-time capacity</span>
              </div>
            </div>
            <Link to="/admin" className="text-xs text-electric-blue hover:underline flex items-center gap-0.5 font-bold">
              Full matrix <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="p-5 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            {execLoadData.map(exec => {
              const loadSig = exec.load > 90 ? "red" : exec.load > 80 ? "yellow" : "green";
              const loadColor = loadSig === "red" ? "text-signal-red" : loadSig === "yellow" ? "text-signal-yellow" : "text-signal-green";
              const loadBg = loadSig === "red" ? "hsl(var(--signal-red))" : loadSig === "yellow" ? "hsl(var(--signal-yellow))" : "hsl(var(--signal-green))";
              return (
                <div key={exec.name} className="rounded-xl border-2 border-border p-4 space-y-3 hover:shadow-card transition-shadow cursor-pointer group">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-black text-white flex-shrink-0"
                      style={{ background: "hsl(var(--primary))" }}>
                      {exec.name.split(" ").map(n => n[0]).join("")}
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-bold text-foreground truncate">{exec.name}</div>
                      <div className="text-xs text-muted-foreground">{exec.role}</div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="text-muted-foreground font-medium">Capacity Load</span>
                      <span className={cn("font-mono font-bold", loadColor)}>{exec.load}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-secondary overflow-hidden border border-border">
                      <div className="h-full rounded-full transition-all" style={{ width: `${exec.load}%`, background: loadBg }} />
                    </div>
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground border-t border-border pt-2.5">
                    <span><span className="font-bold text-foreground">{exec.delegated}</span> delegated</span>
                    {exec.blocked > 0 && (
                      <span className="text-signal-orange font-bold">{exec.blocked} blocked</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── 3 col status: SOP / Governance / Actions ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-card rounded-2xl border-2 border-border shadow-card p-5 hover:shadow-elevated transition-shadow">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "hsl(var(--teal) / 0.12)" }}>
                <FileText className="w-3.5 h-3.5 text-teal" />
              </div>
              <span className="text-xs font-bold text-foreground uppercase tracking-wide">SOP Coverage</span>
            </div>
            <div className="text-4xl font-black font-mono text-foreground mb-2">{orgMetrics.sopCoverage}%</div>
            <div className="h-2 rounded-full bg-secondary overflow-hidden border border-border mb-2">
              <div className="h-full rounded-full transition-all" style={{ width: `${orgMetrics.sopCoverage}%`, background: "hsl(var(--teal))" }} />
            </div>
            <div className="text-xs text-muted-foreground font-medium">
              Avg SOP Adherence: <span className="font-bold text-foreground">{orgMetrics.avgSopAdherence}%</span>
            </div>
          </div>

          <div className="bg-card rounded-2xl border-2 border-border shadow-card p-5 hover:shadow-elevated transition-shadow">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "hsl(var(--signal-yellow) / 0.12)" }}>
                <Shield className="w-3.5 h-3.5 text-signal-yellow" />
              </div>
              <span className="text-xs font-bold text-foreground uppercase tracking-wide">Open Governance</span>
            </div>
            <div className="text-4xl font-black font-mono text-signal-yellow mb-2">{orgMetrics.governanceOpenItems}</div>
            <div className="space-y-1.5 mt-1">
              {governanceLogs.filter(g => g.status !== "Resolved").slice(0, 2).map(g => (
                <div key={g.id} className="text-xs text-muted-foreground flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-signal-yellow flex-shrink-0" />
                  <span className="truncate">{g.title}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-card rounded-2xl border-2 border-border shadow-card p-5 hover:shadow-elevated transition-shadow">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "hsl(var(--signal-green) / 0.12)" }}>
                <CheckCircle className="w-3.5 h-3.5 text-signal-green" />
              </div>
              <span className="text-xs font-bold text-foreground uppercase tracking-wide">Action Items</span>
            </div>
            <div className="text-4xl font-black font-mono text-foreground mb-2">
              {pendingActions}
              <span className="text-sm font-normal text-muted-foreground ml-2">pending</span>
            </div>
            <div className="text-xs text-muted-foreground font-medium">
              <span className="text-signal-red font-bold">{actionItems.filter(a => a.priority === "High" && a.status !== "Completed").length} high priority</span>
              {" · "}{actionItems.filter(a => a.status === "In Progress").length} in progress
            </div>
          </div>
        </div>

        {/* ── Analysis Modules ── */}
        <FrameworkPanel frameworks={frameworks} />

        {/* ── Tier / Membership ── */}
        <div className="rounded-2xl border-2 overflow-hidden"
          style={{ borderColor: "hsl(var(--navy) / 0.15)", background: "linear-gradient(135deg, hsl(var(--navy) / 0.05) 0%, hsl(var(--secondary)) 100%)" }}>
          <div className="px-6 py-5 border-b-2 flex items-center justify-between"
            style={{ borderColor: "hsl(var(--navy) / 0.12)" }}>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ background: "var(--gradient-electric)" }}>
                <Zap className="w-4 h-4 text-white" />
              </div>
              <div>
                <span className="text-base font-bold text-foreground">Unlock More with Martin PMO-Ops</span>
                <p className="text-xs text-muted-foreground mt-0.5">Years of consulting expertise, built into every tier</p>
              </div>
            </div>
          </div>
          <div className="p-5 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            {TIERS.map(tier => {
              const isCurrent = tier.status === "current";
              const isLocked = tier.status === "locked";
              const isTrial = tier.status === "trial";
              return (
                <div key={tier.id} className="rounded-xl border-2 p-5 flex flex-col gap-4 relative"
                  style={{ borderColor: tier.border, background: tier.bg, opacity: isLocked ? 0.5 : 1 }}>
                  {"badge" in tier && tier.badge && isTrial && (
                    <div className="absolute -top-2.5 left-1/2 -translate-x-1/2">
                      <span className="text-xs font-bold px-2.5 py-1 rounded-full whitespace-nowrap text-white"
                        style={{ background: "hsl(var(--teal))" }}>{tier.badge}</span>
                    </div>
                  )}
                  {isLocked && <div className="absolute top-3 right-3"><Lock className="w-3.5 h-3.5 text-muted-foreground opacity-50" /></div>}
                  {isCurrent && <div className="absolute top-3 right-3"><CheckCircle className="w-3.5 h-3.5 opacity-40" style={{ color: tier.color }} /></div>}
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-bold uppercase tracking-wider" style={{ color: tier.color }}>{tier.label}</span>
                      {tier.price && <span className="text-sm font-mono font-bold text-foreground">{tier.price}</span>}
                    </div>
                    <p className="text-xs font-semibold text-foreground/65">{tier.tagline}</p>
                  </div>
                  <ul className="space-y-2 flex-1">
                    {tier.features.map(f => (
                      <li key={f} className="flex items-start gap-2 text-xs text-foreground/80">
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
