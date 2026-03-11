import { useEffect, useState } from "react";
import { Rocket, Plus, Search, MoreHorizontal, Calendar, User, TrendingUp, CheckCircle, AlertTriangle, Clock, XCircle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { getProjects, upsertProject } from "@/lib/supabaseDataService";
import { format } from "date-fns";

interface DbProject {
  id: string;
  name: string;
  description?: string | null;
  status?: string | null;
  start_date?: string | null;
  end_date?: string | null;
  owner_id?: string | null;
  completion_percentage?: number | null;
  priority?: string | null;
  tags?: string[] | null;
  created_at?: string | null;
}

const STATUS_CONFIG: Record<string, { color: string; bg: string; border: string; icon: React.ElementType; label: string }> = {
  active:      { color: "text-signal-green", bg: "bg-signal-green/10", border: "border-signal-green/25", icon: CheckCircle, label: "Active" },
  on_track:    { color: "text-signal-green", bg: "bg-signal-green/10", border: "border-signal-green/25", icon: TrendingUp, label: "On Track" },
  at_risk:     { color: "text-amber", bg: "bg-amber/10", border: "border-amber/25", icon: AlertTriangle, label: "At Risk" },
  delayed:     { color: "text-rose", bg: "bg-rose/10", border: "border-rose/25", icon: Clock, label: "Delayed" },
  blocked:     { color: "text-rose", bg: "bg-rose/10", border: "border-rose/25", icon: XCircle, label: "Blocked" },
  completed:   { color: "text-muted-foreground", bg: "bg-muted", border: "border-border", icon: CheckCircle, label: "Completed" },
  planning:    { color: "text-electric-blue", bg: "bg-electric-blue/10", border: "border-electric-blue/25", icon: Clock, label: "Planning" },
};

function statusCfg(status: string | null | undefined) {
  const key = (status ?? "planning").toLowerCase().replace(" ", "_");
  return STATUS_CONFIG[key] ?? STATUS_CONFIG["planning"];
}

interface AddProjectModalProps {
  userId: string;
  onClose: () => void;
  onSaved: () => void;
}

function AddProjectModal({ userId, onClose, onSaved }: AddProjectModalProps) {
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: "",
    description: "",
    status: "planning",
    priority: "medium",
    start_date: new Date().toISOString().split("T")[0],
    end_date: "",
  });

  async function handleSave() {
    if (!form.name.trim()) return;
    setSaving(true);
    try {
      await upsertProject({
        name: form.name,
        description: form.description || null,
        status: form.status,
        priority: form.priority,
        start_date: form.start_date || null,
        end_date: form.end_date || null,
      } as any);
      onSaved();
      onClose();
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  }

  const fieldClass = "w-full px-3.5 py-2.5 rounded-xl text-sm text-foreground border outline-none focus:ring-1 focus:ring-electric-blue transition-all";
  const fieldStyle = { background: "hsl(224 18% 16%)", borderColor: "hsl(224 16% 22%)" };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg rounded-2xl border animate-fade-up"
        style={{ background: "hsl(224 20% 11%)", borderColor: "hsl(224 16% 18%)" }}>
        <div className="flex items-center justify-between px-6 py-5 border-b" style={{ borderColor: "hsl(224 16% 18%)" }}>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: "hsl(222 88% 65% / 0.12)" }}>
              <Rocket className="w-4 h-4 text-electric-blue" />
            </div>
            <h2 className="font-bold text-foreground">New Project</h2>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors text-xl leading-none">&times;</button>
        </div>

        <div className="p-6 space-y-4">
          <div className="space-y-1.5">
            <label className="section-label">Project Name</label>
            <input className={fieldClass} style={fieldStyle} placeholder="What are you building?"
              value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div className="space-y-1.5">
            <label className="section-label">Description</label>
            <textarea className={cn(fieldClass, "resize-none")} style={fieldStyle} rows={2}
              placeholder="Brief overview..."
              value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="section-label">Status</label>
              <select className={fieldClass} style={fieldStyle}
                value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
                  <option key={key} value={key}>{cfg.label}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="section-label">Priority</label>
              <select className={fieldClass} style={fieldStyle}
                value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>
                {["critical", "high", "medium", "low"].map((p) => (
                  <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="section-label">Start Date</label>
              <input type="date" className={fieldClass} style={fieldStyle}
                value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <label className="section-label">Target Date</label>
              <input type="date" className={fieldClass} style={fieldStyle}
                value={form.end_date} onChange={(e) => setForm({ ...form, end_date: e.target.value })} />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 px-6 pb-6">
          <button onClick={onClose} className="px-5 py-2.5 rounded-xl text-sm text-muted-foreground hover:text-foreground transition-colors hover:bg-white/5">
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!form.name.trim() || saving}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-40 hover:opacity-90"
            style={{ background: "hsl(222 88% 65%)" }}>
            {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            Create Project
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Projects() {
  const { user } = useAuth();
  const [projects, setProjects] = useState<DbProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState("");

  async function load() {
    if (!user?.id) return;
    setLoading(true);
    try {
      const data = await getProjects(user.id);
      setProjects(data as DbProject[]);
    } catch {
      setProjects([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [user?.id]);

  const filtered = projects.filter((p) =>
    !search || p.name.toLowerCase().includes(search.toLowerCase())
  );

  const stats = [
    { label: "Total", value: projects.length, color: "text-electric-blue" },
    { label: "Active", value: projects.filter((p) => ["active", "on_track"].includes((p.status ?? "").toLowerCase())).length, color: "text-signal-green" },
    { label: "At Risk", value: projects.filter((p) => ["at_risk", "delayed", "blocked"].includes((p.status ?? "").toLowerCase())).length, color: "text-amber" },
    { label: "Completed", value: projects.filter((p) => p.status === "completed").length, color: "text-muted-foreground" },
  ];

  return (
    <div className="min-h-screen bg-background p-7 max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="flex items-center gap-2.5 mb-2">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: "hsl(222 88% 65% / 0.12)", border: "1px solid hsl(222 88% 65% / 0.2)" }}>
              <Rocket className="w-4.5 h-4.5 text-electric-blue" />
            </div>
            <h1 className="text-2xl font-black text-foreground tracking-tight">Projects</h1>
          </div>
          <p className="text-sm text-muted-foreground">Track, manage, and ship your projects.</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 active:scale-95"
          style={{ background: "hsl(222 88% 65%)" }}>
          <Plus className="w-4 h-4" />
          New Project
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-7">
        {stats.map(({ label, value, color }) => (
          <div key={label} className="rounded-xl border p-5"
            style={{ background: "hsl(var(--card))", borderColor: "hsl(var(--border))", boxShadow: "var(--shadow-card)" }}>
            <p className="section-label mb-2">{label}</p>
            <p className={cn("text-2xl font-black font-mono", color)}>{value}</p>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="relative mb-5">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          className="w-full max-w-xs pl-9 pr-4 py-2.5 rounded-xl text-sm border outline-none focus:ring-1 focus:ring-electric-blue transition-all text-foreground"
          style={{ background: "hsl(224 18% 13%)", borderColor: "hsl(224 16% 20%)" }}
          placeholder="Search projects..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Project grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="rounded-xl border p-5 animate-pulse" style={{ background: "hsl(224 20% 12%)", borderColor: "hsl(224 16% 18%)" }}>
              <div className="h-4 rounded w-3/4 mb-3" style={{ background: "hsl(224 16% 20%)" }} />
              <div className="h-3 rounded w-full mb-2" style={{ background: "hsl(224 16% 18%)" }} />
              <div className="h-3 rounded w-1/2" style={{ background: "hsl(224 16% 18%)" }} />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border flex flex-col items-center justify-center py-20 gap-4"
          style={{ background: "hsl(var(--card))", borderColor: "hsl(var(--border))" }}>
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
            style={{ background: "hsl(222 88% 65% / 0.1)", border: "1px solid hsl(222 88% 65% / 0.15)" }}>
            <Rocket className="w-6 h-6 text-electric-blue opacity-60" />
          </div>
          <div className="text-center">
            <p className="text-sm font-semibold text-foreground mb-1">{search ? "No projects found" : "No projects yet"}</p>
            <p className="text-xs text-muted-foreground">
              {search ? "Try a different search term" : "Create your first project to get started"}
            </p>
          </div>
          {!search && (
            <button onClick={() => setShowModal(true)} className="text-xs text-electric-blue font-semibold hover:underline">
              Create a project →
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((p) => {
            const sc = statusCfg(p.status);
            const StatusIcon = sc.icon;
            const completion = p.completion_percentage ?? 0;
            const completionColor = completion >= 75 ? "hsl(160 56% 42%)" : completion >= 40 ? "hsl(222 88% 65%)" : "hsl(38 92% 52%)";

            return (
              <div key={p.id} className="rounded-xl border p-5 transition-all duration-200 hover:border-white/10 group"
                style={{ background: "hsl(var(--card))", borderColor: "hsl(var(--border))", boxShadow: "var(--shadow-card)" }}>
                {/* Top row */}
                <div className="flex items-start justify-between gap-2 mb-3">
                  <h3 className="text-sm font-bold text-foreground leading-snug group-hover:text-white transition-colors">
                    {p.name}
                  </h3>
                  <span className={cn("flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full border flex-shrink-0", sc.color, sc.bg, sc.border)}>
                    <StatusIcon className="w-3 h-3" />
                    {sc.label}
                  </span>
                </div>

                {/* Description */}
                {p.description && (
                  <p className="text-xs text-muted-foreground leading-relaxed mb-3 line-clamp-2">{p.description}</p>
                )}

                {/* Completion bar */}
                {completion > 0 && (
                  <div className="mb-3">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10px] text-muted-foreground">Completion</span>
                      <span className="text-[10px] font-mono font-semibold" style={{ color: completionColor }}>{completion}%</span>
                    </div>
                    <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "hsl(224 16% 20%)" }}>
                      <div className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${completion}%`, background: completionColor }} />
                    </div>
                  </div>
                )}

                {/* Meta row */}
                <div className="flex items-center gap-3 text-[11px] text-muted-foreground mt-auto pt-3 border-t" style={{ borderColor: "hsl(224 16% 18%)" }}>
                  {p.end_date && (
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {format(new Date(p.end_date), "MMM d")}
                    </span>
                  )}
                  {p.priority && (
                    <span className={cn(
                      "px-1.5 py-0.5 rounded text-[10px] font-semibold",
                      p.priority === "critical" || p.priority === "high" ? "text-rose bg-rose/10" :
                      p.priority === "medium" ? "text-amber bg-amber/10" : "text-muted-foreground bg-muted"
                    )}>
                      {p.priority.charAt(0).toUpperCase() + p.priority.slice(1)}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showModal && user?.id && (
        <AddProjectModal userId={user.id} onClose={() => setShowModal(false)} onSaved={load} />
      )}
    </div>
  );
}
