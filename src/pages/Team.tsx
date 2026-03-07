/**
 * Team Page — MOCHA framework, team size, delegated work
 * Accessible under /departments/team
 */
import { departments } from "@/lib/pmoData";
import { cn } from "@/lib/utils";
import { useState } from "react";
import {
  Users, User, ChevronDown, ChevronRight, Target, CheckCircle,
  Clock, AlertTriangle, Star, Building2, ArrowUpRight
} from "lucide-react";

type MOCHARole = "M" | "O" | "C" | "H" | "A";
type TeamSize = "1" | "2-10" | "11-50" | "51-200" | "200+";

const mochaConfig: Record<MOCHARole, { label: string; desc: string; color: string; bg: string; border: string }> = {
  M: { label: "Manager",    desc: "Supports and holds owner accountable. Asks probing questions, intervenes if off-track.", color: "text-electric-blue", bg: "bg-electric-blue/10", border: "border-electric-blue/25" },
  O: { label: "Owner",      desc: "Overall responsibility for driving the work. Ensures everything gets done. One owner only.", color: "text-teal",          bg: "bg-teal/10",          border: "border-teal/25" },
  C: { label: "Consulted",  desc: "Provides input and perspective. May share resources or referrals.", color: "text-signal-yellow", bg: "bg-signal-yellow/10", border: "border-signal-yellow/25" },
  H: { label: "Helper",     desc: "Actively contributes. May own a significant area (cascading accountability).", color: "text-signal-green",  bg: "bg-signal-green/10",  border: "border-signal-green/25" },
  A: { label: "Approver",   desc: "Signs off on the final product or key decisions.", color: "text-signal-purple", bg: "bg-signal-purple/10", border: "border-signal-purple/25" },
};

const TEAM_MEMBERS = [
  { id: "tm1", name: "Sarah Chen",    role: "CEO", dept: "Executive Leadership", mochaRole: "M" as MOCHARole, load: 94, delegated: 3, blocked: 1, updates: ["Q2 board package submitted", "Reviewing portfolio capacity"], tasks: 8, achievements: ["Board approval for INI-001 secured"] },
  { id: "tm2", name: "David Kim",     role: "CFO", dept: "Finance",              mochaRole: "O" as MOCHARole, load: 78, delegated: 5, blocked: 0, updates: ["Q1 close tracking — 8 days behind", "Tiered approval policy draft ready"], tasks: 6, achievements: ["$2.4M budget reforecast completed"] },
  { id: "tm3", name: "Ryan Torres",   role: "CTO", dept: "IT / Systems",         mochaRole: "A" as MOCHARole, load: 91, delegated: 4, blocked: 1, updates: ["API docs escalation unresolved 19 days", "Cloud migration scope pending sign-off"], tasks: 11, achievements: ["ITIL framework rollout — Phase 1 done"] },
  { id: "tm4", name: "Elena Vasquez", role: "CMO", dept: "Marketing",            mochaRole: "H" as MOCHARole, load: 86, delegated: 2, blocked: 2, updates: ["$240K budget reallocation pending CFO", "Q2 OKR misalignment flagged"], tasks: 7, achievements: ["Brand awareness campaign launched"] },
  { id: "tm5", name: "Marcus Webb",   role: "VP Sales", dept: "Sales & Development", mochaRole: "O" as MOCHARole, load: 74, delegated: 6, blocked: 0, updates: ["Pipeline velocity down 31%", "Enterprise deal review scheduled"], tasks: 9, achievements: ["3 enterprise accounts re-engaged"] },
  { id: "tm6", name: "Priya Sharma",  role: "HR Director", dept: "Human Capital", mochaRole: "C" as MOCHARole, load: 68, delegated: 3, blocked: 0, updates: ["4 critical roles at 67 days unfilled", "Contingency talent strategy in progress"], tasks: 5, achievements: ["New onboarding SOP published"] },
];

const TEAM_SIZES: TeamSize[] = ["1", "2-10", "11-50", "51-200", "200+"];

export default function Team() {
  const [teamSize, setTeamSize] = useState<TeamSize>("11-50");
  const [expandedMember, setExpandedMember] = useState<string | null>(null);
  const [hoveredRole, setHoveredRole] = useState<MOCHARole | null>(null);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground mb-0.5">Team</h1>
          <p className="text-sm text-muted-foreground">Accountability framework · Delegated work · Real-time updates</p>
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

      {/* MOCHA Framework Reference */}
      <div className="bg-card rounded-xl border-2 border-border shadow-card p-5">
        <div className="flex items-center gap-2 mb-4">
          <Target className="w-4 h-4 text-teal" />
          <h2 className="text-sm font-bold text-foreground uppercase tracking-wide">Accountability Framework (MOCHA)</h2>
        </div>
        <div className="grid grid-cols-5 gap-3">
          {(Object.entries(mochaConfig) as [MOCHARole, (typeof mochaConfig)[MOCHARole]][]).map(([role, cfg]) => (
            <div key={role}
              className={cn("rounded-xl border p-3.5 transition-all cursor-default", cfg.bg, cfg.border,
                hoveredRole === role ? "shadow-elevated scale-[1.02]" : ""
              )}
              onMouseEnter={() => setHoveredRole(role)}
              onMouseLeave={() => setHoveredRole(null)}>
              <div className={cn("w-9 h-9 rounded-xl border-2 flex items-center justify-center text-sm font-black mb-2.5", cfg.color, cfg.border)}>
                {role}
              </div>
              <div className={cn("text-xs font-bold mb-1", cfg.color)}>{cfg.label}</div>
              <p className="text-xs text-muted-foreground leading-relaxed">{cfg.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Team Load Overview */}
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
          const cfg = mochaConfig[member.mochaRole];
          const isExpanded = expandedMember === member.id;
          const loadColor = member.load > 90 ? "text-signal-red" : member.load > 80 ? "text-signal-yellow" : "text-signal-green";
          const loadBar   = member.load > 90 ? "hsl(var(--signal-red))" : member.load > 80 ? "hsl(var(--signal-yellow))" : "hsl(var(--signal-green))";
          return (
            <div key={member.id} className="bg-card rounded-xl border-2 border-border shadow-card overflow-hidden">
              <button className="w-full px-5 py-4 flex items-center gap-4 text-left hover:bg-secondary/30 transition-colors"
                onClick={() => setExpandedMember(isExpanded ? null : member.id)}>
                {/* Avatar */}
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-black text-white flex-shrink-0"
                  style={{ background: "hsl(var(--primary))" }}>
                  {member.name.split(" ").map(n => n[0]).join("")}
                </div>
                {/* Identity */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-0.5">
                    <span className="text-sm font-bold text-foreground">{member.name}</span>
                    <span className="text-xs text-muted-foreground">{member.role}</span>
                    <span className={cn("text-xs font-bold px-2 py-0.5 rounded-full border", cfg.color, cfg.bg, cfg.border)}>
                      {member.mochaRole} · {cfg.label}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><Building2 className="w-3 h-3" />{member.dept}</span>
                    <span><span className="font-bold text-foreground">{member.tasks}</span> tasks</span>
                    <span><span className="font-bold text-foreground">{member.delegated}</span> delegated</span>
                    {member.blocked > 0 && <span className="text-signal-orange font-semibold">{member.blocked} blocked</span>}
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
                  {/* Updates */}
                  <div>
                    <div className="text-xs font-bold text-foreground uppercase tracking-wide mb-2.5">Active Updates</div>
                    <div className="space-y-2">
                      {member.updates.map((u, i) => (
                        <div key={i} className="flex items-start gap-2 text-xs">
                          <Clock className="w-3 h-3 text-muted-foreground flex-shrink-0 mt-0.5" />
                          <span className="text-foreground/80">{u}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  {/* Achievements */}
                  <div>
                    <div className="text-xs font-bold text-foreground uppercase tracking-wide mb-2.5">Recent Achievements</div>
                    <div className="space-y-2">
                      {member.achievements.map((a, i) => (
                        <div key={i} className="flex items-start gap-2 text-xs">
                          <Star className="w-3 h-3 text-signal-yellow flex-shrink-0 mt-0.5" />
                          <span className="text-foreground/80">{a}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  {/* MOCHA assignment summary */}
                  <div>
                    <div className="text-xs font-bold text-foreground uppercase tracking-wide mb-2.5">Role Assignment</div>
                    <div className={cn("rounded-xl border p-3", cfg.bg, cfg.border)}>
                      <div className={cn("w-8 h-8 rounded-lg border-2 flex items-center justify-center text-sm font-black mb-2", cfg.color, cfg.border)}>
                        {member.mochaRole}
                      </div>
                      <div className={cn("text-xs font-bold mb-1", cfg.color)}>{cfg.label}</div>
                      <p className="text-xs text-muted-foreground">{cfg.desc}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Org departments quick reference */}
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
              <div className="flex items-center gap-3 text-xs flex-shrink-0">
                <span className="text-muted-foreground">{dept.activeInitiatives} initiatives</span>
                <span className={cn("font-mono font-bold",
                  dept.sopAdherence >= 80 ? "text-signal-green" : dept.sopAdherence >= 60 ? "text-signal-yellow" : "text-signal-red"
                )}>{dept.sopAdherence}% SOP</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
