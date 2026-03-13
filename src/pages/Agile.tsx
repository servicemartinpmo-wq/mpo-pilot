import { useState } from "react";
import {
  Layers, GitBranch, Bug, Zap, Plus, ChevronDown, ChevronRight,
  User, Calendar, Flag, Circle, CheckCircle2, Clock, AlertTriangle,
  MessageSquare, ArrowUpRight, MoreHorizontal, Flame, Loader2, X, Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useModuleData } from "@/hooks/useModuleData";

type AgileTab = "board" | "backlog" | "sprints" | "bugs";
type StoryStatus = "backlog" | "todo" | "in_progress" | "review" | "done";
type BugSeverity = "critical" | "high" | "medium" | "low";
type BugStatus = "open" | "in_progress" | "resolved" | "closed" | "wont_fix";
type Priority = "critical" | "high" | "medium" | "low";

interface StoryRow { id: string; title: string; description?: string; epic_name: string; status: StoryStatus; priority: Priority; story_points: number; assignee?: string; comments: number; }
interface EpicRow { id: string; name: string; status: string; progress: number; story_count: number; owner?: string; }
interface SprintRow { id: string; name: string; status: string; start_date: string; end_date: string; total_points: number; completed_points: number; velocity: number; stories: number; }
interface BugRow { id: string; title: string; severity: BugSeverity; status: BugStatus; assignee?: string; reported_by: string; reported_date: string; component?: string; }

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
  closed: { label: "Closed", color: "hsl(var(--muted-foreground))" },
  wont_fix: { label: "Won't Fix", color: "hsl(0 0% 100% / 0.25)" },
};

function StoryCard({ story, onUpdate }: { story: StoryRow; onUpdate: (id: string, data: Partial<StoryRow>) => void }) {
  const prConf = PRIORITY_CONFIG[story.priority] || PRIORITY_CONFIG.medium;
  const PrIcon = prConf.icon;
  return (
    <div className="rounded-xl border p-3.5 cursor-pointer transition-all hover:bg-white/[0.025] group"
      style={{ background: "hsl(var(--card))", borderColor: "hsl(var(--border))" }}>
      <div className="flex items-start justify-between gap-2 mb-2">
        <span className="text-xs font-medium line-clamp-2 leading-snug flex-1" style={{ color: "hsl(var(--foreground))" }}>{story.title}</span>
        <button className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
          <MoreHorizontal className="w-4 h-4" style={{ color: "hsl(var(--muted-foreground))" }} />
        </button>
      </div>
      <div className="text-[10px] mb-3" style={{ color: "hsl(var(--muted-foreground))" }}>{story.epic_name}</div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <PrIcon className="w-3 h-3" style={{ color: prConf.color }} />
          <span className="w-5 h-5 rounded flex items-center justify-center text-[10px] font-black"
            style={{ background: "hsl(222 88% 65% / 0.12)", color: "hsl(222 88% 65%)" }}>{story.story_points}</span>
        </div>
        <div className="flex items-center gap-2">
          {(story.comments || 0) > 0 && (
            <div className="flex items-center gap-1 text-[10px]" style={{ color: "hsl(var(--muted-foreground))" }}>
              <MessageSquare className="w-3 h-3" />{story.comments}
            </div>
          )}
          {story.assignee && (
            <div className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold"
              style={{ background: "hsl(268 68% 62% / 0.15)", color: "hsl(268 68% 72%)" }}>{story.assignee[0]}</div>
          )}
        </div>
      </div>
    </div>
  );
}

function AddStoryModal({ onClose, onCreate }: { onClose: () => void; onCreate: (s: Partial<StoryRow>) => void }) {
  const [title, setTitle] = useState("");
  const [epicName, setEpicName] = useState("");
  const [priority, setPriority] = useState<Priority>("medium");
  const [points, setPoints] = useState(3);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative rounded-2xl border p-6 w-full max-w-md" style={{ background: "hsl(224 22% 13%)", borderColor: "hsl(0 0% 100% / 0.12)" }}>
        <div className="flex items-center justify-between mb-5">
          <p className="text-sm font-bold text-white">Add Story</p>
          <button onClick={onClose}><X className="w-4 h-4 text-white/40" /></button>
        </div>
        <div className="space-y-3">
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-white/40 mb-1.5 block">Title</label>
            <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Story title"
              className="w-full px-3 py-2.5 rounded-xl text-sm border outline-none"
              style={{ background: "hsl(224 22% 9%)", borderColor: "hsl(0 0% 100% / 0.08)", color: "hsl(38 15% 94%)" }} />
          </div>
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-white/40 mb-1.5 block">Epic</label>
            <input value={epicName} onChange={e => setEpicName(e.target.value)} placeholder="Epic name"
              className="w-full px-3 py-2.5 rounded-xl text-sm border outline-none"
              style={{ background: "hsl(224 22% 9%)", borderColor: "hsl(0 0% 100% / 0.08)", color: "hsl(38 15% 94%)" }} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-white/40 mb-1.5 block">Priority</label>
              <select value={priority} onChange={e => setPriority(e.target.value as Priority)}
                className="w-full px-3 py-2.5 rounded-xl text-sm border outline-none"
                style={{ background: "hsl(224 22% 9%)", borderColor: "hsl(0 0% 100% / 0.08)", color: "hsl(38 15% 94%)" }}>
                {(["critical","high","medium","low"] as const).map(p => <option key={p} value={p}>{PRIORITY_CONFIG[p].label}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-white/40 mb-1.5 block">Story Points</label>
              <input type="number" min={1} max={100} value={points} onChange={e => setPoints(+e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl text-sm border outline-none"
                style={{ background: "hsl(224 22% 9%)", borderColor: "hsl(0 0% 100% / 0.08)", color: "hsl(38 15% 94%)" }} />
            </div>
          </div>
        </div>
        <div className="flex items-center justify-end gap-3 mt-5">
          <button onClick={onClose} className="px-4 py-2 rounded-xl text-xs font-medium text-white/50 border" style={{ borderColor: "hsl(0 0% 100% / 0.08)" }}>Cancel</button>
          <button disabled={!title.trim()} onClick={() => { onCreate({ title, epic_name: epicName || "Uncategorized", priority, story_points: points, status: "backlog" as StoryStatus, comments: 0 }); onClose(); }}
            className="flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold disabled:opacity-40" style={{ background: "hsl(38 92% 52%)", color: "hsl(224 22% 8%)" }}>
            <Plus className="w-3.5 h-3.5" /> Create
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Agile() {
  const { data: stories, loading: loadingStories, create: createStory, update: updateStory, remove: removeStory } = useModuleData<StoryRow>("/api/agile/stories", { seedEndpoint: "/api/agile/seed" });
  const { data: epics, loading: loadingEpics } = useModuleData<EpicRow>("/api/agile/epics");
  const { data: sprints, loading: loadingSprints } = useModuleData<SprintRow>("/api/agile/sprints");
  const { data: bugs, loading: loadingBugs, create: createBug, remove: removeBug } = useModuleData<BugRow>("/api/agile/bugs");

  const [tab, setTab] = useState<AgileTab>("board");
  const [showAdd, setShowAdd] = useState(false);

  const loading = loadingStories || loadingEpics || loadingSprints || loadingBugs;

  const activeSprint = sprints.find(s => s.status === "active");
  const totalPoints = activeSprint?.total_points ?? 0;
  const completedPoints = activeSprint?.completed_points ?? 0;
  const sprintProgress = totalPoints > 0 ? Math.round((completedPoints / totalPoints) * 100) : 0;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center gap-3 text-white/40"><Loader2 className="w-5 h-5 animate-spin" /> Loading work management...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 sm:p-6 space-y-5 sm:space-y-6">
      {showAdd && <AddStoryModal onClose={() => setShowAdd(false)} onCreate={s => createStory(s as any)} />}

      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="flex-1">
          <h1 className="text-xl sm:text-2xl font-black mb-0.5" style={{ color: "hsl(38 15% 94%)" }}>Work Management</h1>
          <p className="text-sm" style={{ color: "hsl(0 0% 100% / 0.45)" }}>Board, backlog, sprints, and bug tracking</p>
        </div>
        <div className="flex flex-wrap items-center justify-start sm:justify-end gap-2">
          {(tab === "board" || tab === "backlog") && activeSprint && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl border text-sm"
              style={{ background: "hsl(38 92% 52% / 0.08)", borderColor: "hsl(38 92% 52% / 0.2)", color: "hsl(38 92% 62%)" }}>
              <Zap className="w-4 h-4" />
              <span className="hidden sm:inline">{activeSprint.name} — </span>{sprintProgress}% complete
            </div>
          )}
          <button onClick={() => setShowAdd(true)} className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold"
            style={{ background: "hsl(38 92% 52%)", color: "hsl(var(--background))" }}>
            <Plus className="w-4 h-4" /> Add {tab === "bugs" ? "Bug" : "Story"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Active Epics", value: epics.filter(e => e.status === "active").length, color: "hsl(222 88% 65%)" },
          { label: "Stories in Sprint", value: stories.filter(s => s.status !== "backlog").length, color: "hsl(38 92% 52%)" },
          { label: "Open Bugs", value: bugs.filter(b => b.status === "open").length, color: "hsl(350 84% 62%)" },
          { label: "Sprint Velocity", value: `${activeSprint?.velocity ?? 0}pt`, color: "hsl(160 56% 42%)" },
        ].map(({ label, value, color }) => (
          <div key={label} className="rounded-xl border p-4" style={{ background: "hsl(var(--card))", borderColor: "hsl(var(--border))" }}>
            <div className="text-xs mb-1 font-medium" style={{ color: "hsl(0 0% 100% / 0.4)" }}>{label}</div>
            <div className="text-2xl font-black font-mono" style={{ color }}>{value}</div>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-1 p-1 rounded-xl w-fit border" style={{ background: "hsl(var(--card))", borderColor: "hsl(var(--border))" }}>
        {([
          { id: "board", label: "Board", icon: Layers },
          { id: "backlog", label: "Backlog", icon: GitBranch },
          { id: "sprints", label: "Sprints", icon: Zap },
          { id: "bugs", label: "Bugs", icon: Bug },
        ] as const).map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => setTab(id)}
            className={cn("flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all", tab === id ? "text-white" : "text-white/40 hover:text-white/60")}
            style={tab === id ? { background: "hsl(222 88% 65% / 0.15)", color: "hsl(222 88% 72%)" } : {}}>
            <Icon className="w-4 h-4" />{label}
          </button>
        ))}
      </div>

      {tab === "board" && (
        <div className="flex gap-4 overflow-x-auto pb-4" style={{ scrollSnapType: "x mandatory", WebkitOverflowScrolling: "touch" }}>
          <div className="flex-shrink-0 w-1 sm:hidden" aria-hidden />
          {BOARD_COLUMNS.map(({ status, label }) => {
            const colStories = stories.filter(s => s.status === status);
            return (
              <div key={status} className="w-[calc(100vw-48px)] sm:w-64 flex-shrink-0" style={{ scrollSnapAlign: "start" }}>
                <div className="flex items-center justify-between mb-3 px-1">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ background: STATUS_COLORS[status] }} />
                    <span className="text-sm font-bold" style={{ color: "hsl(38 15% 90%)" }}>{label}</span>
                    <span className="text-xs font-mono px-1.5 py-0.5 rounded" style={{ background: "hsl(0 0% 100% / 0.06)", color: "hsl(0 0% 100% / 0.4)" }}>{colStories.length}</span>
                  </div>
                </div>
                <div className="space-y-2.5">
                  {colStories.map(s => <StoryCard key={s.id} story={s} onUpdate={updateStory} />)}
                  {colStories.length === 0 && (
                    <div className="rounded-xl border py-8 text-center text-xs border-dashed" style={{ borderColor: "hsl(0 0% 100% / 0.07)", color: "hsl(0 0% 100% / 0.2)" }}>Drop stories here</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {tab === "backlog" && (
        <div className="space-y-6">
          {epics.map(epic => {
            const epicStories = stories.filter(s => s.epic_name === epic.name);
            const statusColor = epic.status === "active" ? "hsl(160 56% 42%)" : epic.status === "completed" ? "hsl(222 88% 65%)" : "hsl(38 92% 52%)";
            return (
              <div key={epic.id} className="rounded-2xl border overflow-hidden" style={{ background: "hsl(var(--card))", borderColor: "hsl(var(--border))" }}>
                <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: "hsl(0 0% 100% / 0.06)" }}>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full" style={{ background: statusColor }} />
                    <span className="font-bold" style={{ color: "hsl(38 15% 94%)" }}>{epic.name}</span>
                    <span className="text-xs px-2 py-0.5 rounded-lg" style={{ background: `${statusColor}15`, color: statusColor }}>{epic.status}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 text-xs" style={{ color: "hsl(0 0% 100% / 0.4)" }}>
                      <div className="w-24 h-1.5 rounded-full" style={{ background: "hsl(0 0% 100% / 0.08)" }}>
                        <div className="h-full rounded-full" style={{ width: `${epic.progress}%`, background: statusColor }} />
                      </div>
                      {epic.progress}%
                    </div>
                    {epic.owner && <span className="text-xs" style={{ color: "hsl(var(--muted-foreground))" }}>{epic.owner}</span>}
                  </div>
                </div>
                {epicStories.length > 0 && (
                  <table className="w-full">
                    <tbody>
                      {epicStories.map((story, i) => {
                        const prConf = PRIORITY_CONFIG[story.priority] || PRIORITY_CONFIG.medium;
                        const PrIcon = prConf.icon;
                        return (
                          <tr key={story.id} className="cursor-pointer hover:bg-white/[0.02] transition-all"
                            style={{ borderBottom: i < epicStories.length - 1 ? "1px solid hsl(0 0% 100% / 0.04)" : "none" }}>
                            <td className="px-5 py-3 w-8">
                              {story.status === "done" ? <CheckCircle2 className="w-4 h-4" style={{ color: "hsl(160 56% 42%)" }} /> : <Circle className="w-4 h-4" style={{ color: STATUS_COLORS[story.status] || "hsl(0 0% 100% / 0.3)" }} />}
                            </td>
                            <td className="px-3 py-3 flex-1">
                              <span className="text-sm" style={{ color: "hsl(38 15% 90%)", textDecoration: story.status === "done" ? "line-through" : undefined }}>{story.title}</span>
                            </td>
                            <td className="px-4 py-3"><PrIcon className="w-3.5 h-3.5" style={{ color: prConf.color }} /></td>
                            <td className="px-4 py-3 text-xs font-mono text-center w-12" style={{ color: "hsl(222 88% 65%)" }}>{story.story_points}pt</td>
                            <td className="px-5 py-3 text-xs text-right" style={{ color: "hsl(var(--muted-foreground))" }}>{story.assignee ?? "—"}</td>
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

      {tab === "sprints" && (
        <div className="space-y-4">
          {sprints.map(sprint => {
            const progress = sprint.total_points > 0 ? Math.round((sprint.completed_points / sprint.total_points) * 100) : 0;
            const statusColor = sprint.status === "active" ? "hsl(38 92% 52%)" : sprint.status === "completed" ? "hsl(160 56% 42%)" : "hsl(222 88% 65%)";
            return (
              <div key={sprint.id} className="rounded-2xl border p-6" style={{ background: "hsl(var(--card))", borderColor: "hsl(var(--border))" }}>
                <div className="flex items-start justify-between mb-5">
                  <div>
                    <div className="flex items-center gap-3 mb-1.5">
                      <h3 className="font-bold" style={{ color: "hsl(38 15% 94%)" }}>{sprint.name}</h3>
                      <span className="px-2.5 py-1 rounded-lg text-xs font-semibold capitalize" style={{ background: `${statusColor}15`, color: statusColor }}>{sprint.status}</span>
                    </div>
                    <div className="flex items-center gap-4 text-xs" style={{ color: "hsl(0 0% 100% / 0.4)" }}>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {sprint.start_date ? new Date(sprint.start_date).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "TBD"} —
                        {sprint.end_date ? new Date(sprint.end_date).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "TBD"}
                      </span>
                      <span>{sprint.stories} stories</span>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4 mb-5">
                  {[
                    { label: "Total Points", value: sprint.total_points || "—", color: "hsl(38 15% 94%)" },
                    { label: "Completed", value: sprint.completed_points || "—", color: "hsl(160 56% 42%)" },
                    { label: "Velocity", value: sprint.velocity ? `${sprint.velocity}pt` : "—", color: "hsl(222 88% 65%)" },
                  ].map(({ label, value, color }) => (
                    <div key={label} className="rounded-xl p-3 text-center" style={{ background: "hsl(0 0% 100% / 0.03)" }}>
                      <div className="text-xs mb-1" style={{ color: "hsl(var(--muted-foreground))" }}>{label}</div>
                      <div className="text-xl font-black font-mono" style={{ color }}>{value}</div>
                    </div>
                  ))}
                </div>
                {sprint.total_points > 0 && (
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

      {tab === "bugs" && (
        <div className="rounded-2xl border overflow-hidden" style={{ background: "hsl(var(--card))", borderColor: "hsl(var(--border))" }}>
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: "1px solid hsl(0 0% 100% / 0.06)" }}>
                {["Bug", "Severity", "Status", "Assignee", "Reporter", "Reported", ""].map(h => (
                  <th key={h} className="px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-wider" style={{ color: "hsl(var(--muted-foreground))" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {bugs.map((bug, i) => {
                const sevConf = BUG_SEVERITY_CONFIG[bug.severity] || BUG_SEVERITY_CONFIG.medium;
                const statusConf = BUG_STATUS_CONFIG[bug.status] || BUG_STATUS_CONFIG.open;
                return (
                  <tr key={bug.id} className="cursor-pointer hover:bg-white/[0.02] transition-all"
                    style={{ borderBottom: i < bugs.length - 1 ? "1px solid hsl(0 0% 100% / 0.04)" : "none" }}>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <Bug className="w-3.5 h-3.5 flex-shrink-0" style={{ color: sevConf.color }} />
                        <span className="text-sm" style={{ color: "hsl(38 15% 90%)" }}>{bug.title}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="px-2.5 py-1 rounded-lg text-xs font-semibold" style={{ background: `${sevConf.color}18`, color: sevConf.color }}>{sevConf.label}</span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="px-2.5 py-1 rounded-lg text-xs font-semibold" style={{ background: `${statusConf.color}18`, color: statusConf.color }}>{statusConf.label}</span>
                    </td>
                    <td className="px-5 py-4 text-xs" style={{ color: "hsl(var(--muted-foreground))" }}>{bug.assignee ?? "—"}</td>
                    <td className="px-5 py-4 text-xs" style={{ color: "hsl(var(--muted-foreground))" }}>{bug.reported_by}</td>
                    <td className="px-5 py-4 text-xs" style={{ color: "hsl(var(--muted-foreground))" }}>{bug.reported_date ? new Date(bug.reported_date).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "—"}</td>
                    <td className="px-5 py-4">
                      <button onClick={() => removeBug(bug.id)} className="opacity-0 group-hover:opacity-100"><Trash2 className="w-3.5 h-3.5 text-white/20 hover:text-red-400" /></button>
                    </td>
                  </tr>
                );
              })}
              {bugs.length === 0 && (
                <tr><td colSpan={7} className="px-5 py-8 text-center text-sm text-white/30">No bugs tracked yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
