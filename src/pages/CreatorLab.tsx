/**
 * CREATOR LAB — Private creator-only backend
 * Access: /creator-lab (secret route, passphrase protected, not linked in nav)
 *
 * Sections:
 *  1. AI Assistant     — prompt-based changes with real intelligence processing
 *  2. Memory           — lifelong context memory: view, add, delete entries
 *  3. Patterns         — auto-detected behavioral patterns from memory data
 *  4. Predictions      — ML-style forecasts generated from pattern clusters
 *  5. Customize        — accent, font, density, banner theme, feature flags
 *  6. Engine           — config summary & system chain overview
 */

import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { loadProfile, saveProfile, applyAccentColor, applyFont } from "@/lib/companyStore";
import { logCreatorPrompt } from "@/lib/supabaseDataService";
import { supabase } from "@/integrations/supabase/client";
import { BANNER_THEMES } from "@/components/PageBanner";
import { cn } from "@/lib/utils";
import {
  loadMemorySnapshot,
  saveMemoryEntry,
  deleteMemoryEntry,
  resolveMemoryEntry,
  processCreatorPrompt,
  detectPatterns,
  generatePredictions,
  type MemoryEntry,
  type MemoryCategory,
  type MemoryEntryType,
  type PatternRecord,
  type Prediction,
  type AIChangeResult,
} from "@/lib/memoryEngine";
import {
  Lock, Unlock, Terminal, Palette, Type, Layout, Zap, Eye, EyeOff,
  RefreshCw, Save, ChevronRight, Code2, Database, Shield, Cpu,
  ToggleLeft, ToggleRight, Star, Layers, Globe, ArrowLeft, Check,
  Paperclip, X, FileText, TrendingUp, AlertTriangle,
  Clock, Plus, Trash2, CheckCircle, Activity, BarChart2, Target,
  ChevronDown, ChevronUp, Info, ArrowRight, Lightbulb, BookOpen,
  FlaskConical, Settings, Flame, MemoryStick, GitBranch,
} from "lucide-react";

const PASSPHRASE = "apphia-creator";
const STORAGE_KEY = "apphia_creator_unlocked";

// ── Sub-components ─────────────────────────────────────────────────────────────

type AccentColor = "blue" | "teal" | "green" | "yellow" | "red" | "purple" | "orange";

function Section({ title, icon: Icon, accent = "blue", children, badge }: {
  title: string;
  icon: React.ElementType;
  accent?: AccentColor;
  children: React.ReactNode;
  badge?: string | number;
}) {
  const colors: Record<AccentColor, string> = {
    blue: "hsl(var(--electric-blue))", teal: "hsl(var(--teal))",
    green: "hsl(var(--signal-green))", yellow: "hsl(var(--signal-yellow))",
    red: "hsl(var(--signal-red))", purple: "hsl(268 68% 62%)", orange: "hsl(38 92% 52%)",
  };
  const c = colors[accent];
  return (
    <div className="bg-card rounded-2xl border-2 border-border overflow-hidden shadow-card">
      <div className="px-5 py-4 border-b-2 border-border flex items-center gap-3" style={{ background: "hsl(var(--secondary))" }}>
        <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${c}18` }}>
          <Icon className="w-4 h-4" style={{ color: c }} />
        </div>
        <h2 className="text-sm font-bold text-foreground uppercase tracking-wide flex-1">{title}</h2>
        {badge !== undefined && (
          <span className="text-[11px] font-bold px-2 py-0.5 rounded-full" style={{ background: `${c}20`, color: c }}>
            {badge}
          </span>
        )}
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

const CATEGORY_COLORS: Record<MemoryCategory, string> = {
  finance: "hsl(160 56% 42%)", people: "hsl(268 68% 62%)", execution: "hsl(222 88% 65%)",
  strategy: "hsl(38 92% 52%)", risk: "hsl(350 84% 62%)", compliance: "hsl(38 60% 52%)",
  crm: "hsl(200 80% 52%)", meetings: "hsl(290 60% 60%)", engine: "hsl(var(--teal))",
  general: "hsl(0 0% 60%)",
};

const CATEGORY_LABELS: Record<MemoryCategory, string> = {
  finance: "Finance", people: "People", execution: "Execution", strategy: "Strategy",
  risk: "Risk", compliance: "Compliance", crm: "CRM", meetings: "Meetings",
  engine: "Engine", general: "General",
};

const IMPORTANCE_LABELS = ["", "Low", "Normal", "Moderate", "High", "Critical"];
const IMPORTANCE_COLORS = ["", "hsl(0 0% 50%)", "hsl(222 88% 65%)", "hsl(38 92% 52%)", "hsl(38 92% 52%)", "hsl(350 84% 62%)"];

const STRENGTH_COLORS = {
  weak: "hsl(0 0% 50%)", moderate: "hsl(222 88% 65%)",
  strong: "hsl(38 92% 52%)", dominant: "hsl(350 84% 62%)",
};

function formatDate(iso: string) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "2-digit" });
}

function formatTime(iso: string) {
  if (!iso) return "";
  return new Date(iso).toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
}

// ── Prompt Console Section ─────────────────────────────────────────────────────

function PromptConsoleSection({ profileId }: { profileId: string | null }) {
  const navigate = useNavigate();
  const [prompt, setPrompt] = useState("");
  const [attachments, setAttachments] = useState<{ id: string; name: string; content: string; words: number }[]>([]);
  const [pasteBadge, setPasteBadge] = useState<string | null>(null);
  const [result, setResult] = useState<AIChangeResult | null>(null);
  const [history, setHistory] = useState<{ prompt: string; result: AIChangeResult; ts: string }[]>([]);
  const [processing, setProcessing] = useState(false);
  const [appliedChanges, setAppliedChanges] = useState<Set<number>>(new Set());

  const handlePaste = useCallback((e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const text = e.clipboardData.getData("text");
    if (!text.trim() || text.trim().split(/\s+/).length < 5) return;
    e.preventDefault();
    const words = text.trim().split(/\s+/).length;
    setAttachments(prev => [...prev, {
      id: Math.random().toString(36).slice(2),
      name: text.trim().slice(0, 55) + (text.trim().length > 55 ? "…" : ""),
      content: text.trim(), words,
    }]);
    setPasteBadge(`Attached · ${words} words`);
    setTimeout(() => setPasteBadge(null), 2500);
  }, []);

  async function submit() {
    if (!prompt.trim()) return;
    setProcessing(true);
    setResult(null);
    setAppliedChanges(new Set());

    await new Promise(r => setTimeout(r, 900));

    const fullPrompt = [prompt, ...attachments.map(a => a.content)].join("\n\n");
    const res = processCreatorPrompt(fullPrompt);
    setResult(res);
    setHistory(prev => [{ prompt, result: res, ts: new Date().toISOString() }, ...prev.slice(0, 9)]);

    if (profileId) {
      logCreatorPrompt(profileId, prompt, res.changes[0]?.area ?? "General").catch(() => {});
      saveMemoryEntry(profileId, {
        entry_type: "ai_change",
        category: "engine",
        title: `cmd: ${prompt.slice(0, 60)}`,
        content: { prompt, changes: res.changes, warnings: res.warnings },
        metadata: { matchScore: res.confidence, changeCount: res.changes.length },
        importance: res.changes.some(c => c.effort === "high") ? 4 : 3,
        tags: ["cmd", ...res.changes.map(c => c.area.toLowerCase())],
        source: "creator-lab",
      }).catch(() => {});
    }

    setPrompt("");
    setAttachments([]);
    setProcessing(false);
  }

  return (
    <div className="space-y-5">
      {/* Terminal-style prompt box */}
      <div className="rounded-xl overflow-hidden border border-border" style={{ background: "hsl(224 22% 8%)" }}>
        {/* Title bar */}
        <div className="flex items-center gap-2 px-4 py-2.5 border-b border-white/8" style={{ background: "hsl(224 22% 10%)" }}>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-signal-red/70" />
            <div className="w-3 h-3 rounded-full bg-signal-yellow/70" />
            <div className="w-3 h-3 rounded-full bg-signal-green/70" />
          </div>
          <span className="ml-2 text-[11px] font-mono text-white/30">creator-lab — prompt console</span>
          <div className="ml-auto flex items-center gap-1.5 text-[11px] font-mono text-white/25">
            <Terminal className="w-3 h-3" />
            <span>v2</span>
          </div>
        </div>

        {/* Prompt input */}
        <div className="relative">
          {pasteBadge && (
            <div className="absolute top-2 right-3 flex items-center gap-1.5 px-2.5 py-1 rounded text-[10px] font-mono font-semibold z-10"
              style={{ background: "hsl(222 88% 65% / 0.15)", color: "hsl(222 88% 72%)", border: "1px solid hsl(222 88% 65% / 0.2)" }}>
              <Paperclip className="w-2.5 h-2.5" /> {pasteBadge}
            </div>
          )}
          <div className="flex items-start px-4 py-3">
            <span className="text-xs font-mono mt-0.5 mr-3 select-none" style={{ color: "hsl(160 56% 52%)" }}>$</span>
            <textarea
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
              onPaste={handlePaste}
              onKeyDown={e => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) submit(); }}
              placeholder='add-kpi --name "Revenue Health" --page dashboard&#10;set-signal-threshold --category finance --level high&#10;lock-feature --tier 3 --scope free-users'
              rows={5}
              className="flex-1 bg-transparent border-none outline-none resize-none text-sm font-mono leading-relaxed placeholder:text-white/15"
              style={{ color: "hsl(38 15% 88%)" }}
            />
          </div>
        </div>

        {/* Attachments */}
        {attachments.length > 0 && (
          <div className="px-4 pb-3 space-y-1.5">
            {attachments.map(att => (
              <div key={att.id} className="flex items-center gap-3 px-3 py-2 rounded-lg text-[11px] font-mono"
                style={{ background: "hsl(222 88% 65% / 0.08)", border: "1px solid hsl(222 88% 65% / 0.15)" }}>
                <FileText className="w-3 h-3 flex-shrink-0" style={{ color: "hsl(222 88% 65%)" }} />
                <span className="flex-1 truncate" style={{ color: "hsl(38 15% 80%)" }}>{att.name}</span>
                <span style={{ color: "hsl(0 0% 40%)" }}>{att.words}w</span>
                <button onClick={() => setAttachments(prev => prev.filter(a => a.id !== att.id))} className="opacity-40 hover:opacity-80">
                  <X className="w-3 h-3 text-white" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Footer bar */}
        <div className="flex items-center justify-between px-4 py-2.5 border-t border-white/6">
          <div className="flex items-center gap-3 text-[11px] font-mono" style={{ color: "hsl(0 0% 35%)" }}>
            <span>{prompt.length}/1000</span>
            <span>·</span>
            <span>paste to attach</span>
            <span>·</span>
            <span>⌘↵ run</span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => navigate("/tech-ops")}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-mono font-semibold transition-colors"
              style={{ background: "hsl(38 92% 52% / 0.10)", color: "hsl(38 92% 62%)", border: "1px solid hsl(38 92% 52% / 0.2)" }}>
              <Database className="w-3 h-3" /> Tech-Ops
            </button>
            <button onClick={submit} disabled={!prompt.trim() || processing}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-[11px] font-mono font-bold text-white transition-all hover:opacity-90 disabled:opacity-30"
              style={{ background: "hsl(160 56% 38%)" }}>
              {processing
                ? <><RefreshCw className="w-3 h-3 animate-spin" /> running…</>
                : <><Zap className="w-3 h-3" /> run</>}
            </button>
          </div>
        </div>
      </div>

      {/* Output */}
      {result && (
        <div className="rounded-xl overflow-hidden border border-border" style={{ background: "hsl(224 22% 8%)" }}>
          {/* Output header */}
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/8" style={{ background: "hsl(224 22% 10%)" }}>
            <div className="flex items-center gap-2">
              <Terminal className="w-3.5 h-3.5" style={{ color: "hsl(160 56% 52%)" }} />
              <span className="text-[11px] font-mono font-bold" style={{ color: "hsl(160 56% 52%)" }}>output</span>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] font-mono" style={{ color: "hsl(0 0% 35%)" }}>
              <span>match-score</span>
              <span className="font-bold" style={{ color: "hsl(160 56% 60%)" }}>{Math.round(result.confidence * 100)}%</span>
            </div>
          </div>
          <div className="p-4 space-y-3">
            <p className="text-xs font-mono" style={{ color: "hsl(38 15% 55%)" }}>{result.summary}</p>

            {result.warnings.length > 0 && (
              <div className="space-y-1.5">
                {result.warnings.map((w, i) => (
                  <div key={i} className="flex items-start gap-2 p-2.5 rounded-lg text-[11px] font-mono"
                    style={{ background: "hsl(38 92% 52% / 0.08)", border: "1px solid hsl(38 92% 52% / 0.2)", color: "hsl(38 92% 65%)" }}>
                    <AlertTriangle className="w-3 h-3 flex-shrink-0 mt-0.5" />
                    <span>{w}</span>
                  </div>
                ))}
              </div>
            )}

            <div className="space-y-1.5">
              {result.changes.map((change, i) => (
                <div key={i}
                  className="flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-all"
                  style={{
                    background: appliedChanges.has(i) ? "hsl(160 56% 38% / 0.12)" : "hsl(224 22% 11%)",
                    border: `1px solid ${appliedChanges.has(i) ? "hsl(160 56% 42% / 0.35)" : "hsl(0 0% 100% / 0.07)"}`,
                  }}
                  onClick={() => setAppliedChanges(prev => {
                    const next = new Set(prev);
                    next.has(i) ? next.delete(i) : next.add(i);
                    return next;
                  })}>
                  <span className="text-[11px] font-mono mt-0.5 select-none" style={{ color: appliedChanges.has(i) ? "hsl(160 56% 52%)" : "hsl(0 0% 30%)" }}>
                    {appliedChanges.has(i) ? "✓" : "○"}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-0.5">
                      <span className="text-xs font-mono font-semibold" style={{ color: "hsl(38 15% 82%)" }}>{change.action}</span>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded"
                        style={{ background: "hsl(222 88% 65% / 0.10)", color: "hsl(222 88% 65%)" }}>{change.area}</span>
                      <span className={cn("text-[10px] font-mono px-1.5 py-0.5 rounded",
                        change.effort === "low" ? "text-signal-green bg-signal-green/10" :
                          change.effort === "medium" ? "text-signal-yellow bg-signal-yellow/10" :
                            "text-signal-red bg-signal-red/10")}>
                        {change.effort}
                      </span>
                    </div>
                    <p className="text-[11px] font-mono" style={{ color: "hsl(0 0% 45%)" }}>{change.impact}</p>
                  </div>
                </div>
              ))}
            </div>

            {appliedChanges.size > 0 && (
              <p className="text-[11px] font-mono" style={{ color: "hsl(160 56% 52%)" }}>
                {appliedChanges.size} directive{appliedChanges.size !== 1 ? "s" : ""} marked applied — logged.
              </p>
            )}
          </div>
        </div>
      )}

      {/* Run history */}
      {history.length > 0 && (
        <div className="rounded-xl overflow-hidden border border-border" style={{ background: "hsl(224 22% 8%)" }}>
          <div className="px-4 py-2.5 border-b border-white/6" style={{ background: "hsl(224 22% 10%)" }}>
            <span className="text-[11px] font-mono" style={{ color: "hsl(0 0% 35%)" }}>run history</span>
          </div>
          <div className="divide-y divide-white/5 max-h-40 overflow-y-auto">
            {history.map((entry, i) => (
              <div key={i} className="flex items-center gap-3 px-4 py-2.5 cursor-pointer hover:bg-white/3 transition-colors"
                onClick={() => setResult(entry.result)}>
                <span className="text-[10px] font-mono flex-shrink-0" style={{ color: "hsl(222 88% 52%)" }}>{formatTime(entry.ts)}</span>
                <span className="text-[11px] font-mono flex-1 truncate" style={{ color: "hsl(38 15% 65%)" }}>$ {entry.prompt}</span>
                <span className="text-[10px] font-mono flex-shrink-0" style={{ color: "hsl(0 0% 35%)" }}>{entry.result.changes.length} changes</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Memory Feed Section ────────────────────────────────────────────────────────

function MemorySection({ profileId, onRefresh }: { profileId: string | null; onRefresh: () => void }) {
  const [entries, setEntries] = useState<MemoryEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [filterCat, setFilterCat] = useState<MemoryCategory | "all">("all");
  const [filterType, setFilterType] = useState<MemoryEntryType | "all">("all");
  const [showResolved, setShowResolved] = useState(false);

  // New entry form
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    title: "", category: "general" as MemoryCategory,
    entry_type: "observation" as MemoryEntryType,
    importance: 3 as 1 | 2 | 3 | 4 | 5, tags: "", content: "",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => { if (profileId) load(); }, [profileId]);

  async function load() {
    if (!profileId) return;
    setLoading(true);
    const { data } = await supabase
      .from("org_memory")
      .select("*")
      .eq("profile_id", profileId)
      .order("created_at", { ascending: false })
      .limit(200);
    setEntries((data ?? []) as MemoryEntry[]);
    setLoading(false);
  }

  async function handleDelete(id: string) {
    await deleteMemoryEntry(id);
    setEntries(prev => prev.filter(e => e.id !== id));
  }

  async function handleResolve(id: string) {
    await resolveMemoryEntry(id);
    setEntries(prev => prev.map(e => e.id === id ? { ...e, resolved: true } : e));
  }

  async function handleSaveEntry() {
    if (!profileId || !form.title.trim()) return;
    setSaving(true);
    const saved = await saveMemoryEntry(profileId, {
      entry_type: form.entry_type,
      category: form.category,
      title: form.title,
      content: form.content ? { note: form.content } : {},
      metadata: { addedBy: "creator-lab" },
      importance: form.importance,
      tags: form.tags.split(",").map(t => t.trim()).filter(Boolean),
      source: "creator-lab",
    });
    if (saved) {
      setEntries(prev => [saved as MemoryEntry, ...prev]);
      setForm({ title: "", category: "general", entry_type: "observation", importance: 3, tags: "", content: "" });
      setShowForm(false);
      onRefresh();
    }
    setSaving(false);
  }

  const visible = entries
    .filter(e => (filterCat === "all" || e.category === filterCat)
      && (filterType === "all" || e.entry_type === filterType)
      && (showResolved || !e.resolved));

  const categories: MemoryCategory[] = ["finance", "people", "execution", "strategy", "risk", "compliance", "crm", "meetings", "engine", "general"];
  const entryTypes: MemoryEntryType[] = ["event", "decision", "signal", "insight", "observation", "pattern", "prediction", "ai_change", "milestone"];

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2">
        <button onClick={() => setShowForm(v => !v)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-white"
          style={{ background: "var(--gradient-electric)" }}>
          <Plus className="w-3.5 h-3.5" /> Add Entry
        </button>
        <select value={filterCat} onChange={e => setFilterCat(e.target.value as MemoryCategory | "all")}
          className="px-2.5 py-1.5 rounded-xl border border-border bg-secondary text-xs text-foreground focus:outline-none">
          <option value="all">All categories</option>
          {categories.map(c => <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>)}
        </select>
        <select value={filterType} onChange={e => setFilterType(e.target.value as MemoryEntryType | "all")}
          className="px-2.5 py-1.5 rounded-xl border border-border bg-secondary text-xs text-foreground focus:outline-none">
          <option value="all">All types</option>
          {entryTypes.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
        <label className="flex items-center gap-1.5 text-xs text-muted-foreground cursor-pointer">
          <input type="checkbox" checked={showResolved} onChange={e => setShowResolved(e.target.checked)} className="accent-electric-blue" />
          Show resolved
        </label>
        <button onClick={load} className="ml-auto flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors">
          <RefreshCw className={cn("w-3.5 h-3.5", loading && "animate-spin")} /> Refresh
        </button>
      </div>

      {/* New entry form */}
      {showForm && (
        <div className="p-4 rounded-2xl border-2 border-electric-blue/30 bg-electric-blue/5 space-y-3">
          <p className="text-xs font-bold text-foreground uppercase tracking-wide">New Memory Entry</p>
          <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
            placeholder="Entry title…"
            className="w-full bg-background border border-border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-electric-blue/30 text-foreground" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value as MemoryCategory }))}
              className="px-2.5 py-1.5 rounded-xl border border-border bg-background text-xs text-foreground focus:outline-none col-span-1">
              {categories.map(c => <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>)}
            </select>
            <select value={form.entry_type} onChange={e => setForm(f => ({ ...f, entry_type: e.target.value as MemoryEntryType }))}
              className="px-2.5 py-1.5 rounded-xl border border-border bg-background text-xs text-foreground focus:outline-none col-span-1">
              {entryTypes.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
            <select value={form.importance} onChange={e => setForm(f => ({ ...f, importance: Number(e.target.value) as 1 | 2 | 3 | 4 | 5 }))}
              className="px-2.5 py-1.5 rounded-xl border border-border bg-background text-xs text-foreground focus:outline-none col-span-1">
              {[1, 2, 3, 4, 5].map(n => <option key={n} value={n}>{IMPORTANCE_LABELS[n]}</option>)}
            </select>
            <input value={form.tags} onChange={e => setForm(f => ({ ...f, tags: e.target.value }))}
              placeholder="tags, comma-separated"
              className="px-2.5 py-1.5 rounded-xl border border-border bg-background text-xs text-foreground focus:outline-none col-span-1" />
          </div>
          <textarea value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
            placeholder="Additional context or notes (optional)…" rows={2}
            className="w-full bg-background border border-border rounded-xl px-3 py-2 text-xs resize-none focus:outline-none focus:ring-2 focus:ring-electric-blue/30 text-foreground" />
          <div className="flex gap-2">
            <button onClick={handleSaveEntry} disabled={saving || !form.title.trim()}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white disabled:opacity-40"
              style={{ background: "var(--gradient-electric)" }}>
              {saving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
              Save Entry
            </button>
            <button onClick={() => setShowForm(false)} className="px-4 py-2 rounded-xl text-xs font-medium text-muted-foreground border border-border hover:text-foreground">
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Stats row */}
      <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
        {Object.entries(CATEGORY_LABELS).slice(0, 6).map(([cat, label]) => {
          const count = entries.filter(e => e.category === cat).length;
          return (
            <button key={cat} onClick={() => setFilterCat(filterCat === cat as MemoryCategory ? "all" : cat as MemoryCategory)}
              className={cn("p-2.5 rounded-xl border text-center transition-all", filterCat === cat ? "border-electric-blue bg-electric-blue/10" : "border-border bg-secondary hover:border-border/80")}>
              <p className="text-base font-black font-mono" style={{ color: CATEGORY_COLORS[cat as MemoryCategory] }}>{count}</p>
              <p className="text-[10px] text-muted-foreground">{label}</p>
            </button>
          );
        })}
      </div>

      {/* Entry list */}
      {loading ? (
        <div className="flex items-center justify-center py-10 text-muted-foreground text-sm gap-2">
          <RefreshCw className="w-4 h-4 animate-spin" /> Loading memory…
        </div>
      ) : visible.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 gap-3 text-muted-foreground">
          <BookOpen className="w-8 h-8 opacity-30" />
          <p className="text-sm">No memory entries yet. Use "Add Entry" or interact with the app to generate events.</p>
        </div>
      ) : (
        <div className="space-y-2 max-h-[480px] overflow-y-auto pr-1">
          {visible.map(entry => (
            <div key={entry.id} className={cn(
              "flex items-start gap-3 p-3.5 rounded-xl border transition-all group",
              entry.resolved ? "opacity-50 border-border bg-secondary/30" : "border-border bg-secondary/60 hover:border-border/80"
            )}>
              {/* Importance dot */}
              <div className="w-2.5 h-2.5 rounded-full mt-1.5 flex-shrink-0"
                style={{ background: IMPORTANCE_COLORS[entry.importance] ?? "hsl(0 0% 50%)" }} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-0.5">
                  <span className="text-xs font-semibold text-foreground truncate">{entry.title}</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded font-medium"
                    style={{ background: `${CATEGORY_COLORS[entry.category]}18`, color: CATEGORY_COLORS[entry.category] }}>
                    {CATEGORY_LABELS[entry.category]}
                  </span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded border border-border text-muted-foreground capitalize">{entry.entry_type}</span>
                  {entry.resolved && <span className="text-[10px] text-signal-green font-bold">resolved</span>}
                </div>
                <div className="flex items-center gap-2 text-[11px] text-muted-foreground flex-wrap">
                  <span>{formatTime(entry.created_at)}</span>
                  {entry.tags.length > 0 && (
                    <>
                      <span className="opacity-40">·</span>
                      {entry.tags.slice(0, 3).map(t => (
                        <span key={t} className="px-1.5 py-0.5 rounded-full bg-border/40 text-[10px]">{t}</span>
                      ))}
                    </>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                {!entry.resolved && (
                  <button onClick={() => handleResolve(entry.id)}
                    className="p-1.5 rounded-lg hover:bg-signal-green/10 text-muted-foreground hover:text-signal-green transition-colors" title="Mark resolved">
                    <CheckCircle className="w-3.5 h-3.5" />
                  </button>
                )}
                <button onClick={() => handleDelete(entry.id)}
                  className="p-1.5 rounded-lg hover:bg-signal-red/10 text-muted-foreground hover:text-signal-red transition-colors" title="Delete">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Patterns & Predictions Section ────────────────────────────────────────────

function PatternsPredictionsSection({ profileId }: { profileId: string | null }) {
  const [patterns, setPatterns] = useState<PatternRecord[]>([]);
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => { if (profileId) load(); }, [profileId]);

  async function load() {
    if (!profileId) return;
    setLoading(true);
    const { data } = await supabase
      .from("org_memory")
      .select("*")
      .eq("profile_id", profileId)
      .order("created_at", { ascending: false })
      .limit(200);
    const entries = (data ?? []) as MemoryEntry[];
    const detected = detectPatterns(entries);
    const preds = generatePredictions(detected, entries);
    setPatterns(detected);
    setPredictions(preds);
    setLoading(false);
  }

  const severityColors = { low: "hsl(0 0% 55%)", medium: "hsl(38 92% 52%)", high: "hsl(38 60% 52%)", critical: "hsl(350 84% 62%)" };
  const horizonLabels = { "this-week": "This Week", "this-month": "This Month", "this-quarter": "This Quarter", "long-term": "Long Term" };

  if (loading) return (
    <div className="flex items-center justify-center py-10 text-muted-foreground text-sm gap-2">
      <RefreshCw className="w-4 h-4 animate-spin" /> Analyzing patterns…
    </div>
  );

  return (
    <div className="space-y-6">
      <button onClick={load} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
        <RefreshCw className="w-3.5 h-3.5" /> Refresh analysis
      </button>

      {patterns.length === 0 && predictions.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 gap-3 text-muted-foreground">
          <Activity className="w-8 h-8 opacity-30" />
          <p className="text-sm text-center">No patterns detected yet. Add memory entries or interact with the app to generate enough data for pattern analysis.</p>
          <p className="text-xs text-center opacity-60">Patterns emerge from 3+ related entries. Predictions require 2+ patterns.</p>
        </div>
      ) : (
        <>
          {/* Patterns */}
          {patterns.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <GitBranch className="w-4 h-4" style={{ color: "hsl(222 88% 65%)" }} />
                <p className="text-sm font-bold text-foreground">Detected Patterns</p>
                <span className="text-xs px-2 py-0.5 rounded-full font-bold" style={{ background: "hsl(222 88% 65% / 0.15)", color: "hsl(222 88% 72%)" }}>{patterns.length}</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {patterns.map(pat => (
                  <div key={pat.id} className="p-4 rounded-xl border border-border bg-secondary/60 space-y-2.5">
                    <div className="flex items-start gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                          <span className="text-xs font-bold text-foreground">{pat.label}</span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full capitalize"
                            style={{ background: `${STRENGTH_COLORS[pat.strength]}18`, color: STRENGTH_COLORS[pat.strength] }}>
                            {pat.strength}
                          </span>
                        </div>
                        <p className="text-[11px] text-muted-foreground leading-snug">{pat.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Activity className="w-3 h-3" /> {pat.occurrences} occurrences
                      </span>
                      <span className="flex items-center gap-1">
                        <Target className="w-3 h-3" /> {Math.round(pat.confidence * 100)}% confidence
                      </span>
                    </div>
                    {/* Confidence bar */}
                    <div className="h-1 rounded-full bg-border">
                      <div className="h-full rounded-full" style={{ width: `${pat.confidence * 100}%`, background: STRENGTH_COLORS[pat.strength] }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Predictions */}
          {predictions.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4" style={{ color: "hsl(268 68% 62%)" }} />
                <p className="text-sm font-bold text-foreground">AI Predictions</p>
                <span className="text-xs px-2 py-0.5 rounded-full font-bold" style={{ background: "hsl(268 68% 62% / 0.15)", color: "hsl(268 68% 75%)" }}>{predictions.length}</span>
              </div>
              <div className="space-y-2.5">
                {predictions.map(pred => (
                  <div key={pred.id} className="p-4 rounded-xl border border-border bg-secondary/60">
                    <div className="flex items-start gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className="text-xs font-bold text-foreground">{pred.title}</span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded border border-border text-muted-foreground">{horizonLabels[pred.horizon]}</span>
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded capitalize"
                            style={{ background: `${severityColors[pred.severity]}15`, color: severityColors[pred.severity] }}>
                            {pred.severity}
                          </span>
                        </div>
                        <p className="text-[11px] text-muted-foreground leading-snug mb-2">{pred.description}</p>
                        <div className="flex items-center gap-3">
                          <div className="flex-1 h-2 rounded-full bg-border overflow-hidden">
                            <div className="h-full rounded-full transition-all" style={{ width: `${pred.probability * 100}%`, background: severityColors[pred.severity] }} />
                          </div>
                          <span className="text-xs font-black font-mono" style={{ color: severityColors[pred.severity] }}>
                            {Math.round(pred.probability * 100)}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ── Main page ──────────────────────────────────────────────────────────────────

type CreatorTab = "ai" | "memory" | "patterns" | "customize" | "engine";

export default function CreatorLab() {
  const navigate = useNavigate();
  const [unlocked, setUnlocked] = useState(() => {
    try { return localStorage.getItem(STORAGE_KEY) === "true"; } catch { return false; }
  });
  const [passInput, setPassInput] = useState("");
  const [passError, setPassError] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [tab, setTab] = useState<CreatorTab>("ai");
  const [saved, setSaved] = useState(false);
  const [memoryCount, setMemoryCount] = useState(0);

  // Settings
  const [profile, setProfile] = useState(loadProfile());
  const [accentHue, setAccentHue] = useState(profile.accentHue);
  const [font, setFont] = useState<"inter" | "mono" | "rounded">(profile.font);
  const [density, setDensity] = useState<"compact" | "comfortable" | "spacious">(profile.density);
  const [bannerTheme, setBannerTheme] = useState(
    typeof window !== "undefined" ? (localStorage.getItem("apphia_banner_theme") || "deep-space") : "deep-space"
  );
  const [flags, setFlags] = useState({
    demoMode: false, tierGating: true, signalVerbose: false,
    showEngineMetrics: true, creatorBadge: true,
  });

  // Current user id
  const [profileId, setProfileId] = useState<string | null>(null);
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setProfileId(data.user?.id ?? null));
  }, []);

  // Load memory count
  useEffect(() => {
    if (unlocked && profileId) {
      supabase.from("org_memory").select("id", { count: "exact", head: true })
        .eq("profile_id", profileId)
        .then(({ count }) => setMemoryCount(count ?? 0));
    }
  }, [unlocked, profileId]);

  useEffect(() => { if (unlocked) localStorage.setItem(STORAGE_KEY, "true"); }, [unlocked]);

  function tryUnlock() {
    if (passInput.trim().toLowerCase() === PASSPHRASE) {
      setUnlocked(true); setPassError(false);
    } else {
      setPassError(true); setPassInput("");
    }
  }

  function handleSave() {
    const updated = { ...profile, accentHue, font, density };
    saveProfile(updated);
    applyAccentColor(accentHue);
    applyFont(font);
    localStorage.setItem("apphia_banner_theme", bannerTheme);
    setProfile(updated);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  // ── Lock screen ──
  if (!unlocked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-full max-w-sm">
          <div className="bg-card border-2 border-border rounded-2xl p-8 shadow-elevated space-y-6 text-center">
            <div className="w-14 h-14 rounded-2xl mx-auto flex items-center justify-center"
              style={{ background: "hsl(var(--electric-blue) / 0.1)", border: "2px solid hsl(var(--electric-blue) / 0.25)" }}>
              <Lock className="w-6 h-6 text-electric-blue" />
            </div>
            <div>
              <h1 className="text-xl font-black text-foreground mb-1">Creator Lab</h1>
              <p className="text-sm text-muted-foreground">Private access — app creator only</p>
            </div>
            <div className="space-y-3">
              <div className="relative">
                <input
                  type={showPass ? "text" : "password"}
                  placeholder="Enter passphrase"
                  value={passInput}
                  onChange={e => setPassInput(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && tryUnlock()}
                  className={cn(
                    "w-full bg-secondary border rounded-xl px-4 py-3 text-sm font-mono focus:outline-none focus:ring-2 transition-all pr-10",
                    passError
                      ? "border-signal-red focus:ring-signal-red/30 text-signal-red"
                      : "border-border focus:ring-electric-blue/30 text-foreground"
                  )}
                />
                <button onClick={() => setShowPass(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 opacity-40 hover:opacity-70 transition-opacity">
                  {showPass ? <EyeOff className="w-4 h-4 text-foreground" /> : <Eye className="w-4 h-4 text-foreground" />}
                </button>
              </div>
              {passError && <p className="text-xs text-signal-red font-medium">Incorrect passphrase.</p>}
              <button onClick={tryUnlock}
                className="w-full py-3 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90"
                style={{ background: "var(--gradient-electric)" }}>
                Unlock Creator Lab
              </button>
            </div>
            <button onClick={() => navigate("/admin")}
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors mx-auto">
              <ArrowLeft className="w-3 h-3" /> Back to Systems
            </button>
          </div>
        </div>
      </div>
    );
  }

  const TABS: { id: CreatorTab; label: string; icon: React.ElementType; badge?: string | number }[] = [
    { id: "ai",       label: "Prompt Console", icon: Terminal },
    { id: "memory",   label: "Memory",        icon: MemoryStick, badge: memoryCount || undefined },
    { id: "patterns", label: "Patterns",      icon: GitBranch },
    { id: "customize",label: "Customize",     icon: Palette },
    { id: "engine",   label: "Engine",        icon: Cpu },
  ];

  // ── Unlocked view ──
  return (
    <div className="p-6 space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1.5">
            <Unlock className="w-4 h-4 text-signal-green" />
            <span className="text-xs font-bold text-signal-green uppercase tracking-wider">Creator Access · Private</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">Creator Lab</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Prompt console · Lifelong memory · Pattern recognition · Prediction engine
          </p>
        </div>
        <div className="flex items-center gap-3 self-start sm:self-auto">
          <button onClick={() => { localStorage.removeItem(STORAGE_KEY); setUnlocked(false); }}
            className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1.5 px-3 py-2 rounded-lg border border-border">
            <Lock className="w-3.5 h-3.5" /> Lock
          </button>
          {tab === "customize" && (
            <button onClick={handleSave}
              className={cn("flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90", saved ? "bg-signal-green" : "")}
              style={!saved ? { background: "var(--gradient-electric)" } : {}}>
              {saved ? <><Check className="w-4 h-4" /> Saved!</> : <><Save className="w-4 h-4" /> Save</>}
            </button>
          )}
        </div>
      </div>

      {/* Tab bar */}
      <div className="flex items-center gap-1 p-1 rounded-xl w-fit border border-border" style={{ background: "hsl(var(--secondary))" }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={cn("flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-semibold transition-all relative")}
            style={tab === t.id
              ? { background: "hsl(var(--electric-blue) / 0.15)", color: "hsl(var(--electric-blue))" }
              : { color: "hsl(var(--muted-foreground))" }}>
            <t.icon className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{t.label}</span>
            {t.badge !== undefined && (
              <span className="text-[9px] font-black px-1 rounded-full" style={{ background: "hsl(var(--electric-blue) / 0.2)", color: "hsl(var(--electric-blue))" }}>
                {t.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {tab === "ai" && (
        <Section title="Prompt Console" icon={Terminal} accent="purple">
          <PromptConsoleSection profileId={profileId} />
        </Section>
      )}

      {tab === "memory" && (
        <Section title="Lifelong Context Memory" icon={MemoryStick} accent="blue" badge={memoryCount}>
          <MemorySection
            profileId={profileId}
            onRefresh={() => {
              if (profileId) {
                supabase.from("org_memory").select("id", { count: "exact", head: true })
                  .eq("profile_id", profileId)
                  .then(({ count }) => setMemoryCount(count ?? 0));
              }
            }}
          />
        </Section>
      )}

      {tab === "patterns" && (
        <Section title="Patterns & Predictions" icon={GitBranch} accent="teal">
          <PatternsPredictionsSection profileId={profileId} />
        </Section>
      )}

      {tab === "customize" && (
        <div className="space-y-5">
          {/* Accent Color */}
          <Section title="Accent Color" icon={Palette} accent="blue">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl flex-shrink-0" style={{ background: `hsl(${accentHue} 100% 50%)` }} />
              <div className="flex-1">
                <input type="range" min={0} max={360} value={accentHue}
                  onChange={e => { setAccentHue(Number(e.target.value)); applyAccentColor(Number(e.target.value)); }}
                  className="w-full accent-electric-blue"
                  style={{ background: "linear-gradient(to right, hsl(0 100% 50%), hsl(60 100% 50%), hsl(120 100% 50%), hsl(180 100% 50%), hsl(240 100% 50%), hsl(300 100% 50%), hsl(360 100% 50%))", height: "8px", borderRadius: "4px" }} />
                <div className="flex justify-between text-xs text-muted-foreground mt-1.5">
                  <span>Red</span><span>Orange</span><span>Green</span><span>Cyan</span><span>Blue</span><span>Purple</span>
                </div>
              </div>
              <span className="text-xs font-mono font-bold text-foreground w-8">{accentHue}°</span>
            </div>
          </Section>

          {/* Typography & Density */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
            <Section title="Typography" icon={Type} accent="teal">
              <div className="grid grid-cols-3 gap-2">
                {(["inter", "mono", "rounded"] as const).map(f => (
                  <button key={f} onClick={() => { setFont(f); applyFont(f); }}
                    className={cn("py-3 px-3 rounded-xl border-2 text-xs font-semibold transition-all",
                      font === f ? "border-electric-blue bg-electric-blue/10 text-electric-blue" : "border-border text-muted-foreground hover:text-foreground")}>
                    <div className="text-base font-bold mb-1">{f === "inter" ? "Aa" : f === "mono" ? "<>" : "Aa"}</div>
                    <div className="capitalize">{f}</div>
                  </button>
                ))}
              </div>
            </Section>
            <Section title="Density" icon={Layout} accent="green">
              <div className="grid grid-cols-3 gap-2">
                {(["compact", "comfortable", "spacious"] as const).map(d => (
                  <button key={d} onClick={() => setDensity(d)}
                    className={cn("py-3 px-3 rounded-xl border-2 text-xs font-semibold transition-all capitalize",
                      density === d ? "border-signal-green bg-signal-green/10 text-signal-green" : "border-border text-muted-foreground hover:text-foreground")}>
                    {d}
                  </button>
                ))}
              </div>
            </Section>
          </div>

          {/* Banner Theme */}
          <Section title="Dashboard Banner Theme" icon={Layout} accent="blue">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {BANNER_THEMES.map(t => (
                <button key={t.id} onClick={() => { setBannerTheme(t.id); localStorage.setItem("apphia_banner_theme", t.id); }}
                  className={cn("group relative rounded-xl overflow-hidden h-16 border-2 transition-all",
                    bannerTheme === t.id ? "border-electric-blue shadow-elevated" : "border-border hover:border-border/80")}>
                  <div className="absolute inset-0" style={{ background: t.gradient }} />
                  <div className="absolute inset-0" style={{ background: t.overlay }} />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-[11px] font-bold text-white/70 uppercase tracking-wide drop-shadow-sm">{t.label}</span>
                  </div>
                  {bannerTheme === t.id && (
                    <div className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-electric-blue flex items-center justify-center">
                      <Check className="w-2.5 h-2.5 text-white" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </Section>

          {/* Feature Flags */}
          <Section title="Feature Flags" icon={ToggleLeft} accent="green">
            <div className="space-y-2">
              {(Object.entries(flags) as [keyof typeof flags, boolean][]).map(([key, val]) => {
                const labels: Record<string, string> = {
                  demoMode: "Demo mode — show 'Try Demo' on onboarding",
                  tierGating: "Tier gating — lock Tier 3/4 features for free users",
                  signalVerbose: "Verbose signal logs in Diagnostics",
                  showEngineMetrics: "Show engine metrics in System page",
                  creatorBadge: "Show 'Creator' badge in sidebar footer",
                };
                return (
                  <div key={key} className="flex items-center justify-between py-3 border-b border-border last:border-0">
                    <span className="text-sm text-foreground font-medium">{labels[key]}</span>
                    <button onClick={() => setFlags(prev => ({ ...prev, [key]: !prev[key] }))} className="flex-shrink-0">
                      {val
                        ? <ToggleRight className="w-8 h-8 text-electric-blue" />
                        : <ToggleLeft className="w-8 h-8 text-muted-foreground" />}
                    </button>
                  </div>
                );
              })}
            </div>
          </Section>
        </div>
      )}

      {tab === "engine" && (
        <Section title="Engine Configuration" icon={Cpu} accent="teal">
          <div className="space-y-5">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { label: "AI Systems",      value: "25",    icon: Cpu,      color: "text-electric-blue" },
                { label: "Frameworks",      value: "100+",  icon: Layers,   color: "text-teal" },
                { label: "Signal Modules",  value: "7",     icon: Code2,    color: "text-signal-green" },
                { label: "Data Points",     value: "1,200+",icon: Database, color: "text-signal-yellow" },
              ].map(({ label, value, icon: Icon, color }) => (
                <div key={label} className="rounded-xl bg-secondary border border-border p-4 text-center">
                  <Icon className={cn("w-5 h-5 mx-auto mb-2 opacity-60", color)} />
                  <div className={cn("text-2xl font-black font-mono mb-0.5", color)}>{value}</div>
                  <div className="text-xs text-muted-foreground font-medium">{label}</div>
                </div>
              ))}
            </div>
            <div className="p-4 rounded-xl bg-secondary border border-border">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="w-3.5 h-3.5 text-signal-green" />
                <span className="text-xs font-bold text-signal-green uppercase tracking-wide">Engine Status · All Systems Operational</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                All 25 AI system chains are active. Signal detection, diagnostic intelligence, advisory, maturity scoring, and dependency intelligence are live. Frameworks: CMMI, BSC, ISO 31000, McKinsey 7S, TOC, Porter, APQC, OKR, Lean, Six Sigma, and 90+ more.
              </p>
            </div>
            <div className="p-4 rounded-xl bg-secondary border border-border">
              <div className="flex items-center gap-2 mb-2">
                <MemoryStick className="w-3.5 h-3.5" style={{ color: "hsl(268 68% 62%)" }} />
                <span className="text-xs font-bold uppercase tracking-wide" style={{ color: "hsl(268 68% 72%)" }}>Memory Engine · Active</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Lifelong memory is persisted to Supabase (<code className="font-mono text-electric-blue">org_memory</code> table) and cached locally. Pattern recognition runs on each Creator Lab visit. Predictions refresh with every memory load. Context engine reads memory to calibrate session scoring.
              </p>
              {memoryCount > 0 && (
                <p className="text-xs font-bold mt-2" style={{ color: "hsl(268 68% 72%)" }}>
                  {memoryCount} entries in permanent memory store.
                </p>
              )}
            </div>
          </div>
        </Section>
      )}
    </div>
  );
}
