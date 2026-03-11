/**
 * Team Page — MOCHA per project/action item, task counts per role, delegation
 */
import { departments } from "@/lib/pmoData";
import { cn } from "@/lib/utils";
import { useState } from "react";
import {
  Users, ChevronDown, Target, Clock, Star, Building2,
  AlertTriangle, ArrowRight,
} from "lucide-react";

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

// Compute per-member role summary: { M: 3, O: 1, C: 4 } etc.
function roleSummary(assignments: MOCHAAssignment[]) {
  const map: Partial<Record<MOCHARole, number>> = {};
  for (const a of assignments) {
    map[a.role] = (map[a.role] ?? 0) + a.tasks;
  }
  return map;
}

export default function Team() {
  const [teamSize, setTeamSize] = useState<TeamSize>("11-50");
  const [expandedMember, setExpandedMember] = useState<string | null>(null);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground mb-0.5 text-center">Team</h1>
          <p className="text-sm text-muted-foreground text-center">MOCHA accountability by project · delegated work · capacity</p>
        </div>
        <div className="flex items-center gap-1.5 bg-secondary rounded-xl p-1 border border-border">
          {TEAM_SIZES.map(size => (
            <button key={size} onClick={() => setTeamSize(size)}
              className={cn("text-xs px-2.5 py-1.5 rounded-lg font-semibold transition-all",
                teamSize === size ? "bg-card text-foreground shadow-card border border-border" : "text-muted-foreground hover:text-foreground"
              )}>{size}</button>
          ))}
        </div>
      </div>

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
