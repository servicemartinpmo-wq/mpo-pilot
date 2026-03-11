import { useState } from "react";
import {
  Layers, GitBranch, Bug, Zap, Plus, ChevronDown, ChevronRight,
  User, Calendar, Flag, Circle, CheckCircle2, Clock, AlertTriangle,
  MessageSquare, ArrowUpRight, MoreHorizontal, Flame,
} from "lucide-react";
import { cn } from "@/lib/utils";

type AgileTab = "board" | "backlog" | "sprints" | "bugs";

type StoryStatus = "backlog" | "todo" | "in_progress" | "review" | "done";
type BugSeverity = "critical" | "high" | "medium" | "low";
type BugStatus = "open" | "in_progress" | "resolved" | "closed" | "wont_fix";
type Priority = "critical" | "high" | "medium" | "low";

interface Story {
  id: string;
  title: string;
  description?: string;
  epicName: string;
  status: StoryStatus;
  priority: Priority;
  storyPoints: number;
  assignee?: string;
  comments: number;
}

interface Epic {
  id: string;
  name: string;
  status: "active" | "completed" | "on_hold";
  progress: number;
  storyCount: number;
  owner?: string;
}

interface Sprint {
  id: string;
  name: string;
  status: "planning" | "active" | "completed";
  startDate: string;
  endDate: string;
  totalPoints: number;
  completedPoints: number;
  velocity: number;
  stories: number;
}

interface BugRecord {
  id: string;
  title: string;
  severity: BugSeverity;
  status: BugStatus;
  priority: Priority;
  assignee?: string;
  reporter: string;
  created: string;
}

const BOARD_COLUMNS: { status: StoryStatus; label: string }[] = [
  { status: "todo", label: "To Do" },
  { status: "in_progress", label: "In Progress" },
  { status: "review", label: "Review" },
  { status: "done", label: "Done" },
];

const PRIORITY_CONFIG: Record<Priority, { label: string; color: string; icon: typeof Flame }> = {
  critical: { label: "Critical", color: "hsl(350 84% 62%)", icon: Flame },
  high: { label: "High", color: "hsl(28 94% 58%)", icon: AlertTriangle },
  medium: { label: "Medium", color: "hsl(38 92% 52%)", icon: Flag },
  low: { label: "Low", color: "hsl(222 88% 65%)", icon: Circle },
};

const STATUS_COLORS: Record<StoryStatus, string> = {
  backlog: "hsl(0 0% 100% / 0.3)",
  todo: "hsl(222 88% 65%)",
  in_progress: "hsl(38 92% 52%)",
  review: "hsl(268 68% 62%)",
  done: "hsl(160 56% 42%)",
};

const BUG_SEVERITY_CONFIG: Record<BugSeverity, { label: string; color: string }> = {
  critical: { label: "Critical", color: "hsl(350 84% 62%)" },
  high: { label: "High", color: "hsl(28 94% 58%)" },
  medium: { label: "Medium", color: "hsl(38 92% 52%)" },
  low: { label: "Low", color: "hsl(222 88% 65%)" },
};

const BUG_STATUS_CONFIG: Record<BugStatus, { label: string; color: string }> = {
  open: { label: "Open", color: "hsl(350 84% 62%)" },
  in_progress: { label: "In Progress", color: "hsl(38 92% 52%)" },
  resolved: { label: "Resolved", color: "hsl(160 56% 42%)" },
  closed: { label: "Closed", color: "hsl(0 0% 100% / 0.3)" },
  wont_fix: { label: "Won't Fix", color: "hsl(0 0% 100% / 0.25)" },
};

const STORIES: Story[] = [
  { id: "s1", title: "Executive dashboard data integration", epicName: "Command Center v2", status: "in_progress", priority: "critical", storyPoints: 8, assignee: "Sarah C.", comments: 4 },
  { id: "s2", title: "Notification bell real-time sync", epicName: "Command Center v2", status: "review", priority: "high", storyPoints: 5, assignee: "Marcus T.", comments: 2 },
  { id: "s3", title: "Projects CRUD with Supabase", epicName: "Work Management", status: "done", priority: "high", storyPoints: 13, assignee: "Priya K.", comments: 7 },
  { id: "s4", title: "Decision log accuracy tracking", epicName: "Decision Intelligence", status: "todo", priority: "medium", storyPoints: 5, assignee: "James R.", comments: 1 },
  { id: "s5", title: "CRM contact scoring model", epicName: "CRM Module", status: "todo", priority: "medium", storyPoints: 8, assignee: "Elena W.", comments: 0 },
  { id: "s6", title: "Graph visualization — org chart", epicName: "Graph Intelligence", status: "backlog", priority: "low", storyPoints: 13, assignee: undefined, comments: 0 },
  { id: "s7", title: "Automation rules trigger engine", epicName: "Automation Engine", status: "in_progress", priority: "high", storyPoints: 21, assignee: "Sarah C.", comments: 5 },
  { id: "s8", title: "Subscription tier access control", epicName: "Platform Infrastructure", status: "backlog", priority: "high", storyPoints: 8, assignee: undefined, comments: 2 },
];

const EPICS: Epic[] = [
  { id: "e1", name: "Command Center v2", status: "active", progress: 68, storyCount: 12, owner: "Sarah C." },
  { id: "e2", name: "Work Management", status: "active", progress: 82, storyCount: 8, owner: "Marcus T." },
  { id: "e3", name: "Decision Intelligence", status: "active", progress: 45, storyCount: 6, owner: "James R." },
  { id: "e4", name: "CRM Module", status: "active", progress: 20, storyCount: 9, owner: "Elena W." },
  { id: "e5", name: "Graph Intelligence", status: "planning" as any, progress: 0, storyCount: 5, owner: undefined },
  { id: "e6", name: "Automation Engine", status: "active", progress: 35, storyCount: 11, owner: "Sarah C." },
];

const SPRINTS: Sprint[] = [
  { id: "sp1", name: "Sprint 8 — Command Center", status: "active", startDate: "2026-03-10", endDate: "2026-03-24", totalPoints: 42, completedPoints: 28, velocity: 38, stories: 11 },
  { id: "sp2", name: "Sprint 7 — Foundation Build", status: "completed", startDate: "2026-02-24", endDate: "2026-03-09", totalPoints: 38, completedPoints: 36, velocity: 36, stories: 9 },
  { id: "sp3", name: "Sprint 9 — CRM & Growth", status: "planning", startDate: "2026-03-24", endDate: "2026-04-07", totalPoints: 0, completedPoints: 0, velocity: 0, stories: 0 },
];

const BUGS: BugRecord[] = [
  { id: "b1", title: "Dashboard KPI tiles not navigating on mobile", severity: "high", status: "in_progress", priority: "high", assignee: "Marcus T.", reporter: "Sarah C.", created: "2026-03-09" },
  { id: "b2", title: "Notifications panel shows stale count after mark-all-read", severity: "medium", status: "open", priority: "medium", assignee: undefined, reporter: "James R.", created: "2026-03-10" },
  { id: "b3", title: "Supabase type error on initiatives.status field", severity: "low", status: "resolved", priority: "low", assignee: "Elena W.", reporter: "Priya K.", created: "2026-03-08" },
  { id: "b4", title: "Decision log accuracy % shows NaN when no decisions", severity: "medium", status: "open", priority: "medium", assignee: "Priya K.", reporter: "Priya K.", created: "2026-03-11" },
];

function StoryCard({ story }: { story: Story }) {
  const prConf = PRIORITY_CONFIG[story.priority];
  const PrIcon = prConf.icon;
  return (
    <div className="rounded-xl border p-3.5 cursor-pointer transition-all hover:bg-white/[0.025] group"
      style={{ background: "hsl(224 22% 10%)", borderColor: "hsl(0 0% 100% / 0.07)" }}>
      <div className="flex items-start justify-between gap-2 mb-2">
        <span className="text-xs font-medium line-clamp-2 leading-snug flex-1"
          style={{ color: "hsl(38 15% 92%)" }}>
          {story.title}
        </span>
        <button className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
          <MoreHorizontal className="w-4 h-4" style={{ color: "hsl(0 0% 100% / 0.3)" }} />
        </button>
      </div>
      <div className="text-[10px] mb-3" style={{ color: "hsl(0 0% 100% / 0.35)" }}>{story.epicName}</div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <PrIcon className="w-3 h-3" style={{ color: prConf.color }} />
          <span className="w-5 h-5 rounded flex items-center justify-center text-[10px] font-black"
            style={{ background: "hsl(222 88% 65% / 0.12)", color: "hsl(222 88% 65%)" }}>
            {story.storyPoints}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {story.comments > 0 && (
            <div className="flex items-center gap-1 text-[10px]" style={{ color: "hsl(0 0% 100% / 0.3)" }}>
              <MessageSquare className="w-3 h-3" />{story.comments}
            </div>
          )}
          {story.assignee && (
            <div className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold"
              style={{ background: "hsl(268 68% 62% / 0.15)", color: "hsl(268 68% 72%)" }}>
              {story.assignee[0]}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Agile() {
  const [tab, setTab] = useState<AgileTab>("board");

  const totalPoints = SPRINTS.find(s => s.status === "active")?.totalPoints ?? 0;
  const completedPoints = SPRINTS.find(s => s.status === "active")?.completedPoints ?? 0;
  const sprintProgress = totalPoints > 0 ? Math.round((completedPoints / totalPoints) * 100) : 0;

  return (
    <div className="min-h-screen p-6 space-y-6">

      {/* Header */}
      <div className="relative flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-black mb-1" style={{ color: "hsl(38 15% 94%)" }}>
            Work Management
          </h1>
          <p className="text-sm" style={{ color: "hsl(0 0% 100% / 0.45)" }}>
            Board, backlog, sprints, and bug tracking
          </p>
        </div>
        <div className="absolute right-0 flex items-center gap-3">
          {tab === "board" || tab === "backlog" ? (
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl border text-sm"
              style={{ background: "hsl(38 92% 52% / 0.08)", borderColor: "hsl(38 92% 52% / 0.2)", color: "hsl(38 92% 62%)" }}>
              <Zap className="w-4 h-4" />
              Sprint 8 — {sprintProgress}% complete
            </div>
          ) : null}
          <button className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold"
            style={{ background: "hsl(38 92% 52%)", color: "hsl(224 22% 8%)" }}>
            <Plus className="w-4 h-4" />
            Add {tab === "bugs" ? "Bug" : "Story"}
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Active Epics", value: EPICS.filter(e => e.status === "active").length, color: "hsl(222 88% 65%)" },
          { label: "Stories in Sprint", value: STORIES.filter(s => s.status !== "backlog").length, color: "hsl(38 92% 52%)" },
          { label: "Open Bugs", value: BUGS.filter(b => b.status === "open").length, color: "hsl(350 84% 62%)" },
          { label: "Sprint Velocity", value: `${SPRINTS.find(s => s.status === "active")?.velocity ?? 0}pt`, color: "hsl(160 56% 42%)" },
        ].map(({ label, value, color }) => (
          <div key={label} className="rounded-xl border p-4"
            style={{ background: "hsl(224 20% 12%)", borderColor: "hsl(0 0% 100% / 0.07)" }}>
            <div className="text-xs mb-1 font-medium" style={{ color: "hsl(0 0% 100% / 0.4)" }}>{label}</div>
            <div className="text-2xl font-black font-mono" style={{ color }}>{value}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 p-1 rounded-xl w-fit border"
        style={{ background: "hsl(224 20% 12%)", borderColor: "hsl(0 0% 100% / 0.06)" }}>
        {([
          { id: "board", label: "Board", icon: Layers },
          { id: "backlog", label: "Backlog", icon: GitBranch },
          { id: "sprints", label: "Sprints", icon: Zap },
          { id: "bugs", label: "Bugs", icon: Bug },
        ] as const).map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all",
              tab === id ? "text-white" : "text-white/40 hover:text-white/60"
            )}
            style={tab === id ? { background: "hsl(222 88% 65% / 0.15)", color: "hsl(222 88% 72%)" } : {}}>
            <Icon className="w-4 h-4" />{label}
          </button>
        ))}
      </div>

      {/* Board View */}
      {tab === "board" && (
        <div className="flex gap-4 overflow-x-auto pb-4">
          {BOARD_COLUMNS.map(({ status, label }) => {
            const colStories = STORIES.filter(s => s.status === status);
            return (
              <div key={status} className="w-64 flex-shrink-0">
                <div className="flex items-center justify-between mb-3 px-1">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ background: STATUS_COLORS[status] }} />
                    <span className="text-sm font-bold" style={{ color: "hsl(38 15% 90%)" }}>{label}</span>
                    <span className="text-xs font-mono px-1.5 py-0.5 rounded"
                      style={{ background: "hsl(0 0% 100% / 0.06)", color: "hsl(0 0% 100% / 0.4)" }}>
                      {colStories.length}
                    </span>
                  </div>
                  <button className="w-6 h-6 rounded-lg flex items-center justify-center hover:bg-white/[0.06] transition-all">
                    <Plus className="w-3.5 h-3.5" style={{ color: "hsl(0 0% 100% / 0.3)" }} />
                  </button>
                </div>
                <div className="space-y-2.5">
                  {colStories.map(s => <StoryCard key={s.id} story={s} />)}
                  {colStories.length === 0 && (
                    <div className="rounded-xl border py-8 text-center text-xs border-dashed"
                      style={{ borderColor: "hsl(0 0% 100% / 0.07)", color: "hsl(0 0% 100% / 0.2)" }}>
                      Drop stories here
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Backlog View */}
      {tab === "backlog" && (
        <div className="space-y-6">
          {EPICS.map(epic => {
            const epicStories = STORIES.filter(s => s.epicName === epic.name);
            const statusColor = epic.status === "active" ? "hsl(160 56% 42%)" : epic.status === "completed" ? "hsl(222 88% 65%)" : "hsl(38 92% 52%)";
            return (
              <div key={epic.id} className="rounded-2xl border overflow-hidden"
                style={{ background: "hsl(224 20% 11%)", borderColor: "hsl(0 0% 100% / 0.07)" }}>
                <div className="flex items-center justify-between px-5 py-4 border-b"
                  style={{ borderColor: "hsl(0 0% 100% / 0.06)" }}>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full" style={{ background: statusColor }} />
                    <span className="font-bold" style={{ color: "hsl(38 15% 94%)" }}>{epic.name}</span>
                    <span className="text-xs px-2 py-0.5 rounded-lg"
                      style={{ background: `${statusColor}15`, color: statusColor }}>
                      {epic.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 text-xs" style={{ color: "hsl(0 0% 100% / 0.4)" }}>
                      <div className="w-24 h-1.5 rounded-full" style={{ background: "hsl(0 0% 100% / 0.08)" }}>
                        <div className="h-full rounded-full" style={{ width: `${epic.progress}%`, background: statusColor }} />
                      </div>
                      {epic.progress}%
                    </div>
                    {epic.owner && (
                      <span className="text-xs" style={{ color: "hsl(0 0% 100% / 0.35)" }}>{epic.owner}</span>
                    )}
                  </div>
                </div>
                {epicStories.length > 0 && (
                  <table className="w-full">
                    <tbody>
                      {epicStories.map((story, i) => {
                        const prConf = PRIORITY_CONFIG[story.priority];
                        const PrIcon = prConf.icon;
                        return (
                          <tr key={story.id} className="cursor-pointer hover:bg-white/[0.02] transition-all"
                            style={{ borderBottom: i < epicStories.length - 1 ? "1px solid hsl(0 0% 100% / 0.04)" : "none" }}>
                            <td className="px-5 py-3 w-8">
                              {story.status === "done"
                                ? <CheckCircle2 className="w-4 h-4" style={{ color: "hsl(160 56% 42%)" }} />
                                : <Circle className="w-4 h-4" style={{ color: STATUS_COLORS[story.status] }} />
                              }
                            </td>
                            <td className="px-3 py-3 flex-1">
                              <span className="text-sm" style={{ color: "hsl(38 15% 90%)", textDecoration: story.status === "done" ? "line-through" : undefined }}>
                                {story.title}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <PrIcon className="w-3.5 h-3.5" style={{ color: prConf.color }} />
                            </td>
                            <td className="px-4 py-3 text-xs font-mono text-center w-12" style={{ color: "hsl(222 88% 65%)" }}>
                              {story.storyPoints}pt
                            </td>
                            <td className="px-5 py-3 text-xs text-right" style={{ color: "hsl(0 0% 100% / 0.35)" }}>
                              {story.assignee ?? "—"}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Sprints View */}
      {tab === "sprints" && (
        <div className="space-y-4">
          {SPRINTS.map(sprint => {
            const progress = sprint.totalPoints > 0 ? Math.round((sprint.completedPoints / sprint.totalPoints) * 100) : 0;
            const statusColor = sprint.status === "active" ? "hsl(38 92% 52%)" : sprint.status === "completed" ? "hsl(160 56% 42%)" : "hsl(222 88% 65%)";
            return (
              <div key={sprint.id} className="rounded-2xl border p-6"
                style={{ background: "hsl(224 20% 11%)", borderColor: "hsl(0 0% 100% / 0.07)" }}>
                <div className="flex items-start justify-between mb-5">
                  <div>
                    <div className="flex items-center gap-3 mb-1.5">
                      <h3 className="font-bold" style={{ color: "hsl(38 15% 94%)" }}>{sprint.name}</h3>
                      <span className="px-2.5 py-1 rounded-lg text-xs font-semibold capitalize"
                        style={{ background: `${statusColor}15`, color: statusColor }}>
                        {sprint.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-xs" style={{ color: "hsl(0 0% 100% / 0.4)" }}>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(sprint.startDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })} —
                        {new Date(sprint.endDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                      </span>
                      <span>{sprint.stories} stories</span>
                    </div>
                  </div>
                  {sprint.status === "active" && (
                    <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-semibold"
                      style={{ borderColor: "hsl(38 92% 52% / 0.3)", color: "hsl(38 92% 52%)" }}>
                      Complete Sprint
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-4 mb-5">
                  {[
                    { label: "Total Points", value: sprint.totalPoints || "—", color: "hsl(38 15% 94%)" },
                    { label: "Completed", value: sprint.completedPoints || "—", color: "hsl(160 56% 42%)" },
                    { label: "Velocity", value: sprint.velocity ? `${sprint.velocity}pt` : "—", color: "hsl(222 88% 65%)" },
                  ].map(({ label, value, color }) => (
                    <div key={label} className="rounded-xl p-3 text-center"
                      style={{ background: "hsl(0 0% 100% / 0.03)" }}>
                      <div className="text-xs mb-1" style={{ color: "hsl(0 0% 100% / 0.35)" }}>{label}</div>
                      <div className="text-xl font-black font-mono" style={{ color }}>{value}</div>
                    </div>
                  ))}
                </div>

                {sprint.totalPoints > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs" style={{ color: "hsl(0 0% 100% / 0.4)" }}>Progress</span>
                      <span className="text-xs font-bold" style={{ color: statusColor }}>{progress}%</span>
                    </div>
                    <div className="h-2 rounded-full" style={{ background: "hsl(0 0% 100% / 0.08)" }}>
                      <div className="h-full rounded-full transition-all" style={{ width: `${progress}%`, background: statusColor }} />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Bugs View */}
      {tab === "bugs" && (
        <div className="rounded-2xl border overflow-hidden"
          style={{ background: "hsl(224 20% 11%)", borderColor: "hsl(0 0% 100% / 0.07)" }}>
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: "1px solid hsl(0 0% 100% / 0.06)" }}>
                {["Bug", "Severity", "Priority", "Status", "Assignee", "Reporter", "Reported", ""].map(h => (
                  <th key={h} className="px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-wider"
                    style={{ color: "hsl(0 0% 100% / 0.3)" }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {BUGS.map((bug, i) => {
                const sevConf = BUG_SEVERITY_CONFIG[bug.severity];
                const statusConf = BUG_STATUS_CONFIG[bug.status];
                const prConf = PRIORITY_CONFIG[bug.priority];
                return (
                  <tr key={bug.id} className="cursor-pointer hover:bg-white/[0.02] transition-all"
                    style={{ borderBottom: i < BUGS.length - 1 ? "1px solid hsl(0 0% 100% / 0.04)" : "none" }}>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <Bug className="w-3.5 h-3.5 flex-shrink-0" style={{ color: sevConf.color }} />
                        <span className="text-sm" style={{ color: "hsl(38 15% 90%)" }}>{bug.title}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="px-2.5 py-1 rounded-lg text-xs font-semibold"
                        style={{ background: `${sevConf.color}18`, color: sevConf.color }}>
                        {sevConf.label}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-xs" style={{ color: prConf.color }}>{prConf.label}</span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="px-2.5 py-1 rounded-lg text-xs font-semibold"
                        style={{ background: `${statusConf.color}15`, color: statusConf.color }}>
                        {statusConf.label}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-sm" style={{ color: "hsl(0 0% 100% / 0.5)" }}>
                      {bug.assignee ?? <span style={{ color: "hsl(0 0% 100% / 0.2)" }}>Unassigned</span>}
                    </td>
                    <td className="px-5 py-4 text-sm" style={{ color: "hsl(0 0% 100% / 0.4)" }}>{bug.reporter}</td>
                    <td className="px-5 py-4 text-sm" style={{ color: "hsl(0 0% 100% / 0.35)" }}>
                      {new Date(bug.created).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </td>
                    <td className="px-5 py-4">
                      <MoreHorizontal className="w-4 h-4" style={{ color: "hsl(0 0% 100% / 0.2)" }} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
