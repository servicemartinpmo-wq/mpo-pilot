/**
 * CommandPalette — ⌘K / Ctrl+K global search and navigation.
 * Searches pages, initiatives, departments, and quick actions.
 */
import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  Search, LayoutDashboard, TrendingUp, Building2, BarChart3,
  FileText, Zap, BookOpen, GitBranch, Users, Settings,
  MessageSquare, ShoppingCart, Kanban, Megaphone, Network,
  DollarSign, ChevronRight, Clock, ArrowRight, Sparkles,
  CheckSquare, X
} from "lucide-react";

interface Command {
  id: string;
  label: string;
  sublabel?: string;
  icon: React.ElementType;
  path?: string;
  action?: () => void;
  group: string;
  keywords?: string;
}

const NAV_COMMANDS: Command[] = [
  { id: "home",       label: "Dashboard",       sublabel: "Command Center overview",            icon: LayoutDashboard, path: "/",              group: "Navigate" },
  { id: "init",       label: "Initiatives",      sublabel: "Projects & strategic programs",      icon: TrendingUp,      path: "/initiatives",    group: "Navigate" },
  { id: "diag",       label: "Diagnostics",      sublabel: "Org health & scoring",               icon: BarChart3,       path: "/diagnostics",    group: "Navigate" },
  { id: "dept",       label: "Departments",      sublabel: "Teams, capacity & maturity",         icon: Building2,       path: "/departments",    group: "Navigate" },
  { id: "reports",    label: "Reports",          sublabel: "Analytics & performance data",       icon: FileText,        path: "/reports",        group: "Navigate" },
  { id: "actions",    label: "Action Items",     sublabel: "Tasks & follow-ups",                 icon: CheckSquare,     path: "/action-items",   group: "Navigate" },
  { id: "advisory",   label: "Advisory",         sublabel: "AI-powered guidance",                icon: MessageSquare,   path: "/advisory",       group: "Navigate" },
  { id: "knowledge",  label: "Resource Hub",     sublabel: "Frameworks & templates",             icon: BookOpen,        path: "/knowledge",      group: "Navigate" },
  { id: "workflows",  label: "Workflows",        sublabel: "Process automation",                 icon: GitBranch,       path: "/workflows",      group: "Navigate" },
  { id: "team",       label: "Team",             sublabel: "People & org structure",             icon: Users,           path: "/team",           group: "Navigate" },
  { id: "crm",        label: "CRM",              sublabel: "Customers & contacts",               icon: ShoppingCart,    path: "/crm",            group: "Navigate" },
  { id: "agile",      label: "Agile Board",      sublabel: "Sprints & kanban",                   icon: Kanban,          path: "/agile",          group: "Navigate" },
  { id: "marketing",  label: "Marketing",        sublabel: "Campaigns & brand",                  icon: Megaphone,       path: "/marketing",      group: "Navigate" },
  { id: "decisions",  label: "Decisions",        sublabel: "Decision log & analysis",            icon: Zap,             path: "/decisions",      group: "Navigate" },
  { id: "creator",    label: "Creator Lab",      sublabel: "AI content & generation",            icon: Sparkles,        path: "/creator-lab",    group: "Navigate" },
  { id: "graph",      label: "Knowledge Graph",  sublabel: "Visual relationship map",            icon: Network,         path: "/graph",          group: "Navigate" },
  { id: "pricing",    label: "Pricing & Plans",  sublabel: "Upgrade your plan",                  icon: DollarSign,      path: "/pricing",        group: "Navigate" },
  { id: "systems",    label: "Systems",          sublabel: "Settings & customization",           icon: Settings,        path: "/admin",          group: "Navigate" },
];

const RECENT_KEY = "apphia_cmd_recent";
const MAX_RECENT = 5;

function saveRecent(cmd: Command) {
  try {
    const prev: string[] = JSON.parse(localStorage.getItem(RECENT_KEY) || "[]");
    const next = [cmd.id, ...prev.filter(id => id !== cmd.id)].slice(0, MAX_RECENT);
    localStorage.setItem(RECENT_KEY, JSON.stringify(next));
  } catch {}
}

function getRecent(): string[] {
  try { return JSON.parse(localStorage.getItem(RECENT_KEY) || "[]"); } catch { return []; }
}

function fuzzyScore(query: string, text: string): number {
  const q = query.toLowerCase();
  const t = text.toLowerCase();
  if (t.startsWith(q)) return 3;
  if (t.includes(q)) return 2;
  const words = t.split(/\s+/);
  if (words.some(w => w.startsWith(q))) return 1.5;
  return 0;
}

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function CommandPalette({ open, onClose }: Props) {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const recentIds = getRecent();
  const recentCommands = recentIds
    .map(id => NAV_COMMANDS.find(c => c.id === id))
    .filter(Boolean) as Command[];

  const filtered = query.trim()
    ? NAV_COMMANDS
        .map(cmd => {
          const haystack = `${cmd.label} ${cmd.sublabel ?? ""} ${cmd.keywords ?? ""}`;
          const score = fuzzyScore(query, haystack);
          return { cmd, score };
        })
        .filter(({ score }) => score > 0)
        .sort((a, b) => b.score - a.score)
        .map(({ cmd }) => cmd)
    : recentCommands.length > 0 ? recentCommands : NAV_COMMANDS.slice(0, 8);

  const isEmpty = filtered.length === 0;

  useEffect(() => {
    if (open) {
      setQuery("");
      setSelected(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  useEffect(() => { setSelected(0); }, [query]);

  const execute = useCallback((cmd: Command) => {
    saveRecent(cmd);
    if (cmd.path) navigate(cmd.path);
    if (cmd.action) cmd.action();
    onClose();
  }, [navigate, onClose]);

  useEffect(() => {
    if (!open) return;
    const handle = (e: KeyboardEvent) => {
      if (e.key === "Escape") { onClose(); return; }
      if (e.key === "ArrowDown") { e.preventDefault(); setSelected(s => Math.min(s + 1, filtered.length - 1)); }
      if (e.key === "ArrowUp")   { e.preventDefault(); setSelected(s => Math.max(s - 1, 0)); }
      if (e.key === "Enter" && filtered[selected]) execute(filtered[selected]);
    };
    window.addEventListener("keydown", handle);
    return () => window.removeEventListener("keydown", handle);
  }, [open, filtered, selected, execute, onClose]);

  useEffect(() => {
    const el = listRef.current?.children[selected] as HTMLElement;
    el?.scrollIntoView({ block: "nearest" });
  }, [selected]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-start justify-center pt-[12vh] px-4"
      style={{ background: "hsl(0 0% 0% / 0.55)", backdropFilter: "blur(6px)" }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>

      <div className="w-full max-w-xl rounded-2xl overflow-hidden shadow-2xl"
        style={{
          background: "hsl(var(--card))",
          border: "1px solid hsl(var(--border))",
          boxShadow: "0 32px 80px hsl(0 0% 0% / 0.4), 0 0 0 1px hsl(var(--border))",
        }}>

        {/* Search input */}
        <div className="flex items-center gap-3 px-4 py-3 border-b" style={{ borderColor: "hsl(var(--border))" }}>
          <Search className="w-4 h-4 flex-shrink-0 text-muted-foreground" />
          <input
            ref={inputRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search pages, actions…"
            className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
          />
          {query && (
            <button onClick={() => setQuery("")} className="p-0.5 rounded hover:bg-muted transition-colors">
              <X className="w-3.5 h-3.5 text-muted-foreground" />
            </button>
          )}
          <kbd className="hidden sm:flex items-center gap-1 text-[10px] font-mono px-1.5 py-0.5 rounded border text-muted-foreground"
            style={{ borderColor: "hsl(var(--border))", background: "hsl(var(--muted))" }}>
            Esc
          </kbd>
        </div>

        {/* Results */}
        <div ref={listRef} className="max-h-[400px] overflow-y-auto py-1.5">
          {!query && recentCommands.length > 0 && (
            <div className="px-3 py-1.5">
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1.5 mb-1">
                <Clock className="w-3 h-3" /> Recent
              </p>
            </div>
          )}
          {!query && recentCommands.length === 0 && (
            <div className="px-3 py-1.5">
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Navigate</p>
            </div>
          )}
          {query && filtered.length > 0 && (
            <div className="px-3 py-1.5">
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Results</p>
            </div>
          )}

          {isEmpty ? (
            <div className="px-4 py-8 text-center">
              <Search className="w-8 h-8 mx-auto mb-2 text-muted-foreground opacity-40" />
              <p className="text-sm text-muted-foreground">No results for "{query}"</p>
            </div>
          ) : (
            filtered.map((cmd, i) => {
              const Icon = cmd.icon;
              const isSelected = i === selected;
              return (
                <button key={cmd.id}
                  onMouseEnter={() => setSelected(i)}
                  onClick={() => execute(cmd)}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2.5 mx-1.5 rounded-xl text-left transition-all",
                    "hover:bg-secondary",
                    isSelected && "bg-secondary"
                  )}
                  style={{ width: "calc(100% - 12px)" }}>
                  <div className={cn(
                    "w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors",
                    isSelected ? "bg-electric-blue/15" : "bg-muted"
                  )}>
                    <Icon className={cn("w-4 h-4 transition-colors", isSelected ? "text-electric-blue" : "text-muted-foreground")} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-foreground truncate">{cmd.label}</div>
                    {cmd.sublabel && <div className="text-[11px] text-muted-foreground truncate">{cmd.sublabel}</div>}
                  </div>
                  {isSelected && <ArrowRight className="w-3.5 h-3.5 text-electric-blue flex-shrink-0" />}
                </button>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-4 py-2.5 border-t" style={{ borderColor: "hsl(var(--border))", background: "hsl(var(--muted) / 0.5)" }}>
          <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
            <span className="flex items-center gap-1"><kbd className="font-mono px-1 py-0.5 rounded border" style={{ borderColor: "hsl(var(--border))" }}>↑↓</kbd> navigate</span>
            <span className="flex items-center gap-1"><kbd className="font-mono px-1 py-0.5 rounded border" style={{ borderColor: "hsl(var(--border))" }}>↵</kbd> open</span>
          </div>
          <span className="text-[10px] text-muted-foreground font-mono">⌘K</span>
        </div>
      </div>
    </div>
  );
}
