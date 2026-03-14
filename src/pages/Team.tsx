/**
 * Team Page — MOCHA per project/action item, task counts per role, delegation
 */
import { departments as _departments } from "@/lib/pmoData";
import { isDemoMode } from "@/lib/companyStore";
import { cn } from "@/lib/utils";
import { useState } from "react";
import {
  Users, ChevronDown, Target, Clock, Star, Building2,
  AlertTriangle, ArrowRight, Heart, CheckCircle, ChevronRight,
  Flame, MessageSquare, UserCheck, Lightbulb, X,
} from "lucide-react";

const departments = isDemoMode() ? _departments : [];

type MOCHARole = "M" | "O" | "C" | "H" | "A";
type TeamSize = "1" | "2-10" | "11-50" | "51-200" | "200+";

const mochaConfig: Record<MOCHARole, { label: string; desc: string; color: string; bg: string; border: string }> = {
  M: { label: "Manager",   desc: "Supports and holds owner accountable. Asks probing questions, intervenes if off-track.", color: "text-electric-blue", bg: "bg-electric-blue/10", border: "border-electric-blue/25" },
  O: { label: "Owner",     desc: "Overall responsibility for driving the work. Ensures everything gets done. One owner only.", color: "text-teal",          bg: "bg-teal/10",          border: "border-teal/25" },
  C: { label: "Consulted", desc: "Provides input and perspective. May share resources or referrals.", color: "text-signal-yellow", bg: "bg-signal-yellow/10", border: "border-signal-yellow/25" },
  H: { label: "Helper",    desc: "Actively contributes. May own a significant area (cascading accountability).", color: "text-signal-green",  bg: "bg-signal-green/10",  border: "border-signal-green/25" },
  A: { label: "Approver",  desc: "Signs off on the final product or key decisions.", color: "text-signal-purple", bg: "bg-signal-purple/10", border: "border-signal-purple/25" },
};

// Each assignment: which project/initiative + role + task count
interface MOCHAAssignment {
  project: string;
  role: MOCHARole;
  tasks: number;
}

interface TeamMember {
  id: string;
  name: string;
  role: string;
  dept: string;
  load: number;
  delegated: number;
  blocked: number;
  assignments: MOCHAAssignment[];
  updates: string[];
  achievements: string[];
}

const TEAM_MEMBERS: TeamMember[] = [
  {
    id: "tm1", name: "Sarah Chen", role: "CEO", dept: "Executive Leadership", load: 94, delegated: 3, blocked: 1,
    assignments: [
      { project: "Board Package Q2",        role: "M", tasks: 3 },
      { project: "Portfolio Capacity Review", role: "O", tasks: 1 },
      { project: "INI-001 Expansion",       role: "C", tasks: 4 },
    ],
    updates: ["Q2 board package submitted", "Reviewing portfolio capacity"],
    achievements: ["Board approval for INI-001 secured"],
  },
  {
    id: "tm2", name: "David Kim", role: "CFO", dept: "Finance", load: 78, delegated: 5, blocked: 0,
    assignments: [
      { project: "Q1 Financial Close",       role: "O", tasks: 4 },
      { project: "Tiered Approval Policy",   role: "O", tasks: 2 },
      { project: "Budget Reforecast",        role: "M", tasks: 2 },
      { project: "Marketing Reallocation",   role: "A", tasks: 1 },
    ],
    updates: ["Q1 close tracking — 8 days behind", "Tiered approval policy draft ready"],
    achievements: ["$2.4M budget reforecast completed"],
  },
  {
    id: "tm3", name: "Ryan Torres", role: "CTO", dept: "IT / Systems", load: 91, delegated: 4, blocked: 1,
    assignments: [
      { project: "Cloud Migration",          role: "O", tasks: 5 },
      { project: "API Documentation",        role: "M", tasks: 2 },
      { project: "ITIL Framework Rollout",   role: "O", tasks: 4 },
      { project: "Security Audit",           role: "C", tasks: 2 },
    ],
    updates: ["API docs escalation unresolved 19 days", "Cloud migration scope pending sign-off"],
    achievements: ["ITIL framework rollout — Phase 1 done"],
  },
  {
    id: "tm4", name: "Elena Vasquez", role: "CMO", dept: "Marketing", load: 86, delegated: 2, blocked: 2,
    assignments: [
      { project: "Brand Awareness Campaign", role: "O", tasks: 4 },
      { project: "Q2 OKR Alignment",         role: "C", tasks: 3 },
      { project: "Budget Reallocation",      role: "M", tasks: 1 },
      { project: "Customer Research",        role: "H", tasks: 3 },
    ],
    updates: ["$240K budget reallocation pending CFO", "Q2 OKR misalignment flagged"],
    achievements: ["Brand awareness campaign launched"],
  },
  {
    id: "tm5", name: "Marcus Webb", role: "VP Sales", dept: "Sales & Development", load: 74, delegated: 6, blocked: 0,
    assignments: [
      { project: "Enterprise Deal Review",   role: "O", tasks: 4 },
      { project: "Pipeline Velocity Fix",    role: "M", tasks: 2 },
      { project: "Account Re-engagement",    role: "O", tasks: 3 },
      { project: "Pricing Strategy",         role: "C", tasks: 2 },
    ],
    updates: ["Pipeline velocity down 31%", "Enterprise deal review scheduled"],
    achievements: ["3 enterprise accounts re-engaged"],
  },
  {
    id: "tm6", name: "Priya Sharma", role: "HR Director", dept: "Human Capital", load: 68, delegated: 3, blocked: 0,
    assignments: [
      { project: "Talent Acquisition (4 Roles)", role: "O", tasks: 4 },
      { project: "Contingency Talent Plan",      role: "O", tasks: 2 },
      { project: "Onboarding SOP",               role: "H", tasks: 1 },
      { project: "Leadership Review",            role: "C", tasks: 2 },
    ],
    updates: ["4 critical roles at 67 days unfilled", "Contingency talent strategy in progress"],
    achievements: ["New onboarding SOP published"],
  },
];

const TEAM_SIZES: TeamSize[] = ["1", "2-10", "11-50", "51-200", "200+"];

// ── Wellness Watch ──────────────────────────────────────────────────────────
// Simulate weeks at high load from the current load score.
// In production this would come from a rolling capacity history table.
function estimateWeeksOverCapacity(load: number): number {
  if (load >= 95) return 8;
  if (load >= 91) return 6;
  if (load >= 88) return 5;
  if (load >= 85) return 4;
  return 0;
}

function wellnessRisk(weeks: number, load: number): "critical" | "high" | "moderate" | null {
  if (load >= 91 && weeks >= 6) return "critical";
  if (load >= 88 && weeks >= 5) return "high";
  if (load >= 85 && weeks >= 4) return "moderate";
  return null;
}

function getWellnessSuggestions(member: TeamMember): string[] {
  const s: string[] = [];
  s.push(`Schedule a private 1:1 with ${member.name.split(" ")[0]} — not a status update, a genuine "how are you doing?" conversation`);
  if (member.blocked > 0)
    s.push(`Unblock ${member.blocked} stalled item${member.blocked > 1 ? "s" : ""} — unresolved blockers amplify burnout faster than raw workload`);
  const ownerCount = member.assignments.filter(a => a.role === "O").reduce((t, a) => t + a.tasks, 0);
  if (ownerCount >= 3)
    s.push(`${member.name.split(" ")[0]} owns ${ownerCount} O-tasks — review whether one can be transferred to a Helper or paused`);
  if (member.load >= 90)
    s.push(`Pause new intake for ${member.name.split(" ")[0]} until capacity drops below 80% — even one week of relief matters`);
  s.push(`Acknowledge ${member.name.split(" ")[0]}'s output publicly — recognition is protective against burnout at high load`);
  return s;
}
// ───────────────────────────────────────────────────────────────────────────

// Compute per-member role summary: { M: 3, O: 1, C: 4 } etc.
function roleSummary(assignments: MOCHAAssignment[]) {
  const map: Partial<Record<MOCHARole, number>> = {};
  for (const a of assignments) {
    map[a.role] = (map[a.role] ?? 0) + a.tasks;
  }
  return map;
}

const LS_KEY = "pmo_wellness_checked";
function loadChecked(): Set<string> {
  try { return new Set(JSON.parse(localStorage.getItem(LS_KEY) ?? "[]")); }
  catch { return new Set(); }
}
function saveChecked(s: Set<string>) {
  localStorage.setItem(LS_KEY, JSON.stringify([...s]));
}

export default function Team() {
  const [teamSize, setTeamSize] = useState<TeamSize>("11-50");
  const [expandedMember, setExpandedMember] = useState<string | null>(null);
  const [checkedMembers, setCheckedMembers] = useState<Set<string>>(loadChecked);
  const [expandedWellness, setExpandedWellness] = useState<string | null>(null);
  const [dismissedWellness, setDismissedWellness] = useState<Set<string>>(new Set());

  function markChecked(id: string) {
    setCheckedMembers(prev => {
      const next = new Set(prev); next.add(id); saveChecked(next); return next;
    });
  }
  function dismissCard(id: string) {
    setDismissedWellness(prev => new Set(prev).add(id));
  }

  const wellnessFlags = TEAM_MEMBERS.filter(m => {
    const weeks = estimateWeeksOverCapacity(m.load);
    return wellnessRisk(weeks, m.load) !== null && !dismissedWellness.has(m.id);
  });

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="flex-1">
          <h1 className="text-xl font-black text-foreground mb-0.5 tracking-tight">Team</h1>
          <p className="text-sm text-muted-foreground">MOCHA accountability by project · delegated work · capacity</p>
        </div>
        <div className="flex items-center gap-1.5 bg-secondary rounded-xl p-1 border border-border self-start sm:self-auto">
          {TEAM_SIZES.map(size => (
            <button key={size} onClick={() => setTeamSize(size)}
              className={cn("text-xs px-2.5 py-1.5 rounded-lg font-semibold transition-all",
                teamSize === size ? "bg-card text-foreground shadow-card border border-border" : "text-muted-foreground hover:text-foreground"
              )}>{size}</button>
          ))}
        </div>
      </div>

      {/* ── Wellness Watch ─────────────────────────────────────────────── */}
      {wellnessFlags.length > 0 && (
        <div className="rounded-xl border-2 overflow-hidden" style={{ borderColor: "hsl(var(--signal-red) / 0.30)", background: "hsl(var(--card))" }}>
          {/* Panel header */}
          <div className="flex items-center gap-3 px-5 py-4 border-b" style={{ borderColor: "hsl(var(--signal-red) / 0.15)" }}>
            <div className="flex items-center justify-center w-8 h-8 rounded-lg" style={{ background: "hsl(340 70% 45% / 0.18)" }}>
              <Heart className="w-4 h-4" style={{ color: "hsl(340 70% 65%)" }} />
            </div>
            <div className="flex-1">
              <h2 className="text-sm font-bold text-foreground">Wellness Watch</h2>
              <p className="text-[11px] text-muted-foreground">Suggested check-ins · members over capacity for 4+ weeks</p>
            </div>
            <span className="text-[10px] font-bold px-2.5 py-1 rounded-full" style={{ background: "hsl(340 70% 45% / 0.18)", color: "hsl(340 70% 65%)" }}>
              {wellnessFlags.filter(m => !checkedMembers.has(m.id)).length} pending
            </span>
          </div>

          {/* Suggestion cards */}
          <div className="divide-y" style={{ borderColor: "hsl(340 70% 45% / 0.15)" }}>
            {wellnessFlags.map(member => {
              const weeks = estimateWeeksOverCapacity(member.load);
              const risk  = wellnessRisk(weeks, member.load)!;
              const done  = checkedMembers.has(member.id);
              const open  = expandedWellness === member.id;
              const suggestions = getWellnessSuggestions(member);

              const riskLabel = risk === "critical" ? "Critical" : risk === "high" ? "High Risk" : "Moderate";
              const riskColor = risk === "critical"
                ? { text: "hsl(0 80% 65%)", bg: "hsl(0 80% 50% / 0.14)", border: "hsl(0 80% 50% / 0.30)" }
                : risk === "high"
                  ? { text: "hsl(28 90% 60%)", bg: "hsl(28 90% 50% / 0.14)", border: "hsl(28 90% 50% / 0.30)" }
                  : { text: "hsl(48 95% 58%)", bg: "hsl(48 95% 50% / 0.12)", border: "hsl(48 95% 50% / 0.28)" };

              return (
                <div key={member.id} className={cn("transition-colors", done && "opacity-50")}>
                  {/* Card summary row */}
                  <div className="flex items-center gap-4 px-5 py-3.5">
                    {/* Avatar */}
                    <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-black text-white flex-shrink-0"
                      style={{ background: done ? "hsl(var(--muted-foreground))" : riskColor.text }}>
                      {member.name.split(" ").map(n => n[0]).join("")}
                    </div>

                    {/* Name + meta */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-0.5">
                        <span className="text-sm font-bold text-foreground">{member.name}</span>
                        <span className="text-xs text-muted-foreground">{member.role}</span>
                        {risk === "critical" && <Flame className="w-3.5 h-3.5" style={{ color: riskColor.text }} />}
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border"
                          style={{ color: riskColor.text, background: riskColor.bg, borderColor: riskColor.border }}>
                          {riskLabel}
                        </span>
                        {done && (
                          <span className="text-[10px] font-semibold text-signal-green flex items-center gap-1">
                            <CheckCircle className="w-3 h-3" /> Check-in suggested
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-muted-foreground">
                        <span className="font-mono font-bold" style={{ color: riskColor.text }}>{member.load}% capacity</span>
                        <span className="mx-1.5 opacity-40">·</span>
                        est. <span className="font-semibold text-foreground">{weeks} weeks</span> at this level
                        <span className="mx-1.5 opacity-40">·</span>
                        {member.dept}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {!done && (
                        <button
                          onClick={() => markChecked(member.id)}
                          className="flex items-center gap-1.5 text-[11px] font-bold px-3 py-1.5 rounded-lg border transition-all hover:opacity-90 active:scale-95"
                          style={{ color: riskColor.text, background: riskColor.bg, borderColor: riskColor.border }}>
                          <UserCheck className="w-3.5 h-3.5" />
                          Suggest Check-in
                        </button>
                      )}
                      <button
                        onClick={() => setExpandedWellness(open ? null : member.id)}
                        className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground transition-colors px-2 py-1.5 rounded-lg hover:bg-secondary/50">
                        <Lightbulb className="w-3.5 h-3.5" />
                        <span>{open ? "Hide" : "View"} actions</span>
                        <ChevronRight className={cn("w-3 h-3 transition-transform", open && "rotate-90")} />
                      </button>
                      <button onClick={() => dismissCard(member.id)}
                        className="p-1.5 rounded-lg hover:bg-secondary/50 text-muted-foreground hover:text-foreground transition-colors">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Expanded suggestions */}
                  {open && (
                    <div className="px-5 pb-4 pt-1">
                      <div className="rounded-xl border p-4 space-y-2.5" style={{ borderColor: riskColor.border, background: riskColor.bg }}>
                        <div className="text-[10px] font-bold uppercase tracking-widest mb-3" style={{ color: riskColor.text }}>
                          Suggested Actions for HR / Chief of Staff
                        </div>
                        {suggestions.map((s, i) => (
                          <div key={i} className="flex items-start gap-2.5 text-xs text-foreground/85 leading-relaxed">
                            <div className="w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-black flex-shrink-0 mt-0.5 text-white"
                              style={{ background: riskColor.text }}>
                              {i + 1}
                            </div>
                            <span>{s}</span>
                          </div>
                        ))}
                        {done && (
                          <div className="flex items-center gap-2 mt-3 pt-3 border-t text-[11px] text-signal-green font-semibold"
                            style={{ borderColor: riskColor.border }}>
                            <CheckCircle className="w-3.5 h-3.5" />
                            Wellness check-in suggestion logged for {member.name}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Footer note */}
          <div className="px-5 py-3 border-t flex items-center gap-2 text-[11px] text-muted-foreground" style={{ borderColor: "hsl(340 70% 45% / 0.20)" }}>
            <MessageSquare className="w-3.5 h-3.5 flex-shrink-0" />
            <span>Thresholds: &gt;85% load sustained 4+ weeks. Capacity history would replace estimates in a live deployment.</span>
          </div>
        </div>
      )}

      {/* Wellness cleared state */}
      {wellnessFlags.length === 0 && TEAM_MEMBERS.some(m => estimateWeeksOverCapacity(m.load) > 0) && (
        <div className="flex items-center gap-3 bg-signal-green/8 border border-signal-green/25 rounded-xl px-5 py-4">
          <CheckCircle className="w-5 h-5 text-signal-green flex-shrink-0" />
          <div>
            <div className="text-sm font-semibold text-foreground">All wellness flags reviewed</div>
            <div className="text-xs text-muted-foreground">No active check-in suggestions — reload to reassess.</div>
          </div>
        </div>
      )}

      {/* Recommended Delegations */}
      {(() => {
        const overloaded = TEAM_MEMBERS.filter(m => m.load >= 85);
        const available  = TEAM_MEMBERS.filter(m => m.load <= 75);
        const pairs: { from: TeamMember; to: TeamMember; task: string }[] = [];
        const usedTo = new Set<string>();
        for (const from of overloaded) {
          const to = available.find(a => !usedTo.has(a.id));
          if (to) { pairs.push({ from, to, task: from.assignments[0]?.project ?? "Unassigned task" }); usedTo.add(to.id); }
        }
        if (pairs.length === 0) return null;
        return (
          <div className="bg-card rounded-xl shadow-card p-5 border-l-4" style={{ borderLeftColor: "hsl(272 60% 52%)" }}>
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle className="w-4 h-4" style={{ color: "hsl(272 60% 52%)" }} />
              <h2 className="text-sm font-bold text-foreground uppercase tracking-wide">Recommended Delegations</h2>
              <span className="ml-1 text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ background: "hsl(272 60% 52% / 0.12)", color: "hsl(272 60% 52%)" }}>
                {pairs.length} suggestion{pairs.length !== 1 ? "s" : ""}
              </span>
              <span className="ml-auto text-[11px] text-muted-foreground">Team members at ≥85% capacity with available bandwidth matches</span>
            </div>
            <div className="space-y-2.5">
              {pairs.map(({ from, to, task }) => {
                const fromLoad = from.load;
                const toLoad   = to.load;
                const loadColor = fromLoad >= 90 ? "text-signal-red" : "text-signal-orange";
                return (
                  <div key={from.id + "-" + to.id} className="flex items-center gap-4 bg-secondary/40 rounded-xl px-4 py-3 border border-border">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-sm font-bold text-foreground">{from.name}</span>
                        <span className="text-[10px] text-muted-foreground font-medium">{from.role}</span>
                        <span className={cn("text-xs font-black ml-1", loadColor)}>{fromLoad}%</span>
                      </div>
                      <p className="text-[11px] text-muted-foreground leading-snug truncate">{task}</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    <div className="flex-shrink-0 text-right min-w-[120px]">
                      <div className="text-sm font-bold text-foreground">{to.name}</div>
                      <div className="text-[11px] text-signal-green font-semibold">{toLoad}% · has capacity</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })()}

      {/* MOCHA Key */}
      <div className="bg-card rounded-xl border-2 border-border shadow-card p-5">
        <div className="flex items-center gap-2 mb-4">
          <Target className="w-4 h-4 text-teal" />
          <h2 className="text-sm font-bold text-foreground uppercase tracking-wide">MOCHA Framework</h2>
        </div>
        <div className="grid grid-cols-5 gap-3">
          {(Object.entries(mochaConfig) as [MOCHARole, (typeof mochaConfig)[MOCHARole]][]).map(([role, cfg]) => (
            <div key={role} className={cn("rounded-xl border p-3.5 group relative", cfg.bg, cfg.border)}>
              <div className={cn("w-9 h-9 rounded-xl border-2 flex items-center justify-center text-sm font-black mb-2.5", cfg.color, cfg.border)}>
                {role}
              </div>
              <div className={cn("text-xs font-bold mb-1", cfg.color)}>{cfg.label}</div>
              <p className="text-xs text-muted-foreground leading-relaxed">{cfg.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Overview stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-card rounded-xl border border-border p-4">
          <div className="text-2xl font-black font-mono text-foreground">{TEAM_MEMBERS.length}</div>
          <div className="text-xs text-muted-foreground mt-1">Team Members</div>
        </div>
        <div className="bg-signal-red/8 border border-signal-red/25 rounded-xl p-4">
          <div className="text-2xl font-black font-mono text-signal-red">{TEAM_MEMBERS.filter(m => m.load > 90).length}</div>
          <div className="text-xs text-muted-foreground mt-1">Over Capacity</div>
        </div>
        <div className="bg-signal-yellow/8 border border-signal-yellow/25 rounded-xl p-4">
          <div className="text-2xl font-black font-mono text-signal-yellow">{TEAM_MEMBERS.reduce((s, m) => s + m.blocked, 0)}</div>
          <div className="text-xs text-muted-foreground mt-1">Blocked Items</div>
        </div>
        <div className="bg-signal-green/8 border border-signal-green/25 rounded-xl p-4">
          <div className="text-2xl font-black font-mono text-signal-green">{TEAM_MEMBERS.reduce((s, m) => s + m.delegated, 0)}</div>
          <div className="text-xs text-muted-foreground mt-1">Total Delegated</div>
        </div>
      </div>

      {/* Team Member Cards */}
      <div className="space-y-3">
        {TEAM_MEMBERS.map(member => {
          const isExpanded = expandedMember === member.id;
          const loadColor = member.load > 90 ? "text-signal-red" : member.load > 80 ? "text-signal-yellow" : "text-signal-green";
          const loadBar   = member.load > 90 ? "hsl(var(--signal-red))" : member.load > 80 ? "hsl(var(--signal-yellow))" : "hsl(var(--signal-green))";
          const summary = roleSummary(member.assignments);
          const totalTasks = member.assignments.reduce((s, a) => s + a.tasks, 0);

          return (
            <div key={member.id} className="bg-card rounded-xl border-2 border-border shadow-card overflow-hidden">
              <button
                className="w-full px-5 py-4 flex items-center gap-4 text-left hover:bg-secondary/30 transition-colors"
                onClick={() => setExpandedMember(isExpanded ? null : member.id)}
              >
                {/* Avatar */}
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-black text-white flex-shrink-0"
                  style={{ background: "hsl(var(--primary))" }}>
                  {member.name.split(" ").map(n => n[0]).join("")}
                </div>

                {/* Identity + MOCHA role summary */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1.5">
                    <span className="text-sm font-bold text-foreground">{member.name}</span>
                    <span className="text-xs text-muted-foreground">{member.role}</span>
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Building2 className="w-3 h-3" />{member.dept}
                    </span>
                  </div>
                  {/* MOCHA role-task chips */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {(Object.entries(summary) as [MOCHARole, number][]).map(([role, count]) => {
                      const cfg = mochaConfig[role];
                      return (
                        <span key={role} className={cn(
                          "inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full border",
                          cfg.color, cfg.bg, cfg.border
                        )}>
                          {role}
                          <span className="font-mono opacity-70">({count})</span>
                        </span>
                      );
                    })}
                    <span className="text-[11px] text-muted-foreground font-mono ml-1">
                      OVERALL: <span className="font-bold text-foreground">{totalTasks}</span> tasks
                      {member.delegated > 0 && (
                        <> · <span className="text-signal-green font-semibold">{member.delegated} delegated</span></>
                      )}
                      {member.blocked > 0 && (
                        <> · <span className="text-signal-red font-semibold">{member.blocked} blocked</span></>
                      )}
                    </span>
                  </div>
                </div>

                {/* Capacity bar */}
                <div className="w-28 flex-shrink-0">
                  <div className="flex justify-between text-[10px] mb-1.5">
                    <span className="text-muted-foreground">Capacity</span>
                    <span className={cn("font-mono font-bold", loadColor)}>{member.load}%</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
                    <div className="h-full rounded-full transition-all" style={{ width: `${member.load}%`, background: loadBar }} />
                  </div>
                </div>

                <ChevronDown className={cn("w-4 h-4 text-muted-foreground transition-transform flex-shrink-0", isExpanded && "rotate-180")} />
              </button>

              {isExpanded && (
                <div className="border-t border-border px-5 py-4 grid grid-cols-1 md:grid-cols-3 gap-5 bg-secondary/30">

                  {/* MOCHA Assignments per project */}
                  <div>
                    <div className="text-xs font-bold text-foreground uppercase tracking-wide mb-3">MOCHA Assignments</div>
                    <div className="space-y-2">
                      {member.assignments.map((a, i) => {
                        const cfg = mochaConfig[a.role];
                        return (
                          <div key={i} className={cn("flex items-center justify-between rounded-lg px-3 py-2 border", cfg.bg, cfg.border)}>
                            <span className="text-xs text-foreground/80 truncate flex-1 mr-2">{a.project}</span>
                            <div className="flex items-center gap-1.5 flex-shrink-0">
                              <span className={cn("text-[11px] font-black px-1.5 py-0.5 rounded", cfg.color)}>{a.role}</span>
                              <span className="text-[10px] font-mono text-muted-foreground">{a.tasks}t</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Updates */}
                  <div>
                    <div className="text-xs font-bold text-foreground uppercase tracking-wide mb-3">Active Updates</div>
                    <div className="space-y-2">
                      {member.updates.map((u, i) => (
                        <div key={i} className="flex items-start gap-2 text-xs">
                          <Clock className="w-3 h-3 text-muted-foreground flex-shrink-0 mt-0.5" />
                          <span className="text-foreground/80">{u}</span>
                        </div>
                      ))}
                    </div>
                    <div className="text-xs font-bold text-foreground uppercase tracking-wide mt-4 mb-3">Achievements</div>
                    <div className="space-y-2">
                      {member.achievements.map((a, i) => (
                        <div key={i} className="flex items-start gap-2 text-xs">
                          <Star className="w-3 h-3 text-signal-yellow flex-shrink-0 mt-0.5" />
                          <span className="text-foreground/80">{a}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Load breakdown */}
                  <div>
                    <div className="text-xs font-bold text-foreground uppercase tracking-wide mb-3">Load Breakdown</div>
                    <div className="space-y-2">
                      {(Object.entries(summary) as [MOCHARole, number][]).map(([role, count]) => {
                        const cfg = mochaConfig[role];
                        const pct = Math.round((count / totalTasks) * 100);
                        return (
                          <div key={role}>
                            <div className="flex justify-between text-[11px] mb-1">
                              <span className={cn("font-bold", cfg.color)}>{cfg.label}</span>
                              <span className="font-mono text-muted-foreground">{count} tasks ({pct}%)</span>
                            </div>
                            <div className="h-1 rounded-full bg-secondary overflow-hidden">
                              <div className="h-full rounded-full" style={{ width: `${pct}%`, background: `hsl(var(--primary))` }} />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    <div className="mt-4 pt-3 border-t border-border">
                      <div className="text-[11px] text-muted-foreground">
                        <span className="font-bold text-foreground">{totalTasks}</span> total ·{" "}
                        <span className="text-signal-green font-semibold">{member.delegated} delegated</span>
                        {member.blocked > 0 && <> · <span className="text-signal-red font-semibold">{member.blocked} blocked</span></>}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Dept quick reference */}
      <div className="bg-card rounded-xl border-2 border-border shadow-card overflow-hidden">
        <div className="px-5 py-4 border-b-2 border-border bg-secondary">
          <h2 className="text-sm font-bold text-foreground uppercase tracking-wide">Department Structure</h2>
        </div>
        <div className="divide-y">
          {departments.slice(0, 8).map(dept => (
            <div key={dept.id} className="flex items-center gap-4 px-5 py-3 hover:bg-secondary/30 transition-colors">
              <Building2 className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-foreground">{dept.name}</div>
                <div className="text-xs text-muted-foreground">{dept.head} · {dept.headcount} FTE</div>
              </div>
              <div className="text-xs text-muted-foreground">{dept.activeInitiatives} initiatives</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
