/**
 * ApphiaPanel — Apphia AI assistant (ay-fee-uh).
 * Context-aware AI support available on every page.
 * Activated by the floating button, Ctrl+K, or "Hey Apphia" voice wake.
 */
import { useState, useEffect, useRef, useCallback } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  X, Send, Mic, MicOff, ChevronRight,
  RefreshCw, Zap, PlayCircle, CheckCircle2, Loader2, AlertCircle, ClipboardList,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { actionItems, initiatives, departments } from "@/lib/pmoData";
import { loadProfile, isDemoMode } from "@/lib/companyStore";
import { runMaturityScoring, runOrgHealthScoring } from "@/lib/engine/maturity";
import { buildOrgContext, getContextFactors } from "@/lib/engine/contextEngine";
import type { OrgContext } from "@/lib/engine/contextEngine";
import WalkthroughPlayer, { type WalkthroughScript } from "@/components/WalkthroughPlayer";
import {
  getWalkthrough, PAGE_DEFAULT_WALKTHROUGH, type WalkthroughId,
} from "@/lib/walkthroughs";
import { upsertActionItem } from "@/lib/supabaseDataService";
import { useAuth } from "@/hooks/useAuth";

// ── Types ──────────────────────────────────────────────────────────────
interface ApphiaMsg {
  id: string;
  role: "user" | "apphia";
  text: string;
  timestamp: Date;
  actions?: { label: string; href?: string; onClick?: () => void }[];
  list?: string[];
  /** If set, this message offers a walkthrough the user can launch */
  walkthroughId?: WalkthroughId;
  /** If set, this message offers a "create task" confirmation card */
  createTask?: string;
}

type TaskSaveStatus = "idle" | "saving" | "saved" | "error";

// ── Page suggestion chips ─────────────────────────────────────────────
const PAGE_CHIPS: Record<string, string[]> = {
  "/":                  ["What needs my attention?", "Remind me to review Q2 budget", "Walk me through diagnostics", "What's blocked?"],
  "/action-items":      ["What's overdue?", "Create a task to review Q2 goals", "What's most critical?", "Read my top 3 items"],
  "/initiatives":       ["Walk me through the portfolio", "What's blocked?", "What's at risk?", "Explain priority scores"],
  "/diagnostics":       ["Explain my health score", "Walk me through diagnostics", "What should I fix first?", "Show me why"],
  "/departments":       ["Which department needs help?", "Summarize team capacity", "Where are the bottlenecks?"],
  "/workflows":         ["Walk me through workflows", "What workflows should I run?", "Explain workflow packages"],
  "/decisions":         ["Walk me through decisions", "What decisions are pending?", "Help me frame a decision"],
  "/knowledge":         ["Find a framework for strategy", "Suggest templates for onboarding", "What resources do I need?"],
  "/advisory":          ["Give me a strategic brief", "What's the biggest risk right now?", "Help me prioritize"],
  "/reports":           ["Walk me through the report", "Explain this report", "What KPIs need attention?"],
  "/projects":          ["What projects are delayed?", "What's overdue?", "Show me blocked projects"],
  "/agile":             ["What's in sprint?", "What's blocked on the board?", "How's velocity?"],
  "/crm":               ["How's the pipeline?", "Any at-risk accounts?", "What follow-ups are due?"],
  "/team":              ["Who's over capacity?", "Any hiring gaps?", "Summarize team health"],
};

function getChips(path: string): string[] {
  return PAGE_CHIPS[path] ?? PAGE_CHIPS["/"];
}

// ── Task title extractor ───────────────────────────────────────────────
function extractTaskTitle(raw: string): string {
  const s = raw.trim()
    .replace(/^(please\s+)?create\s+(a\s+)?(?:new\s+)?(?:action\s+item|task)\s*(?:to\s+|for\s+|called\s+|titled\s+|named\s+|:)?\s*/i, "")
    .replace(/^(please\s+)?add\s+(a\s+)?(?:new\s+)?(?:action\s+item|task)\s*(?:to\s+(?:my\s+)?(?:list|plate|action\s+items?)\s*)?(?:to\s+|for\s+|:|called\s+|titled\s+)?\s*/i, "")
    .replace(/^remind\s+me\s+to\s+/i, "")
    .replace(/^make\s+(?:a\s+)?task\s+(?:to\s+|for\s+)?/i, "")
    .replace(/^add\s+(?:this\s+)?to\s+(?:my\s+)?(?:list|plate|action\s+items?)\s*:?\s*/i, "")
    .replace(/^(please\s+)?log\s+(?:a\s+)?task\s*(?:to\s+|for\s+|:)?\s*/i, "")
    .trim();
  if (!s) return "";
  return s.charAt(0).toUpperCase() + s.slice(1);
}

// ── Response engine ────────────────────────────────────────────────────
function buildCtx() {
  const now = new Date();
  const profile = loadProfile();
  const overdue = actionItems.filter(a =>
    a.status !== "Completed" && new Date(a.dueDate) < now
  );
  const blocked   = initiatives.filter(i => i.status === "Blocked");
  const atRisk    = initiatives.filter(i => i.status === "At Risk");
  const delayed   = initiatives.filter(i => i.status === "Delayed");

  let orgCtx: OrgContext | undefined;
  try {
    if (profile.onboardingComplete) orgCtx = buildOrgContext(profile);
  } catch {}

  let healthScore = 0;
  try {
    const scores = runMaturityScoring(orgCtx);
    healthScore  = runOrgHealthScoring(scores, orgCtx).overall;
  } catch { /* silent */ }

  return { overdue, blocked, atRisk, delayed, healthScore, profile, orgCtx };
}

function apphiaRespond(input: string, page: string): Omit<ApphiaMsg, "id" | "timestamp"> {
  const lower = input.toLowerCase().trim();
  const ctx   = buildCtx();
  const { overdue, blocked, atRisk, delayed, healthScore, profile, orgCtx: orgContext } = ctx;
  const org   = profile.orgName || "your organization";
  const ctxLabel = orgContext
    ? ` (${orgContext.companyStage}-stage ${orgContext.industry || "org"}, Q${orgContext.fiscalQuarter})`
    : "";

  // ── Greetings ──────────────────────────────────────────────────────
  if (/^(hi|hello|hey|good morning|howdy|yo)/.test(lower) && lower.length < 20) {
    const urgency = overdue.length > 0 || blocked.length > 0;
    return {
      role: "apphia",
      text: `Hey${profile.userName ? ` ${profile.userName}` : ""}! I'm Apphia — your executive intelligence engine. Pattern recognition, decision-making, efficiency. ${urgency
        ? `There's some urgency to address: ${overdue.length > 0 ? `${overdue.length} overdue action item${overdue.length !== 1 ? "s" : ""}` : ""}${overdue.length > 0 && blocked.length > 0 ? " and " : ""}${blocked.length > 0 ? `${blocked.length} blocked initiative${blocked.length !== 1 ? "s" : ""}` : ""}.`
        : `${org} looks stable right now — operational health is at ${healthScore}${ctxLabel}.`} What can I help you with?`,
    };
  }

  // ── Summarize / What's my day / What needs attention ──────────────
  if (/summarize|my day|what.*need|need.*attention|where.*stand|status update|brief me|daily/i.test(lower)) {
    const lines: string[] = [];
    if (overdue.length > 0) lines.push(`${overdue.length} overdue action item${overdue.length !== 1 ? "s" : ""}`);
    if (blocked.length > 0) lines.push(`${blocked.length} blocked initiative${blocked.length !== 1 ? "s" : ""}`);
    if (atRisk.length  > 0) lines.push(`${atRisk.length} initiative${atRisk.length !== 1 ? "s" : ""} at risk`);
    if (delayed.length > 0) lines.push(`${delayed.length} delayed initiative${delayed.length !== 1 ? "s" : ""}`);

    if (lines.length === 0) {
      return {
        role: "apphia",
        text: `${org} is looking healthy today${ctxLabel}. No overdue items, no blocked initiatives. Operational health: ${healthScore}. A good day to make progress on strategic priorities.`,
        actions: [{ label: "View Dashboard", href: "/" }],
      };
    }
    return {
      role: "apphia",
      text: `Here's your daily pulse for ${org}:`,
      list: lines,
      actions: [
        ...(overdue.length > 0 ? [{ label: "Action Items", href: "/action-items" }] : []),
        ...(blocked.length > 0 ? [{ label: "Initiatives", href: "/initiatives" }] : []),
      ],
    };
  }

  // ── Action items — overdue / what's due ───────────────────────────
  if (/overdue|action item|task|what.*due|to.?do|on my plate|behind|what do i have/i.test(lower)) {
    if (overdue.length === 0) {
      return {
        role: "apphia",
        text: "Great news — no overdue action items right now. You're on top of your plate. Keep the momentum.",
        actions: [{ label: "View All Items", href: "/action-items" }],
      };
    }
    const top = overdue
      .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
      .slice(0, 5);
    return {
      role: "apphia",
      text: `You have ${overdue.length} overdue action item${overdue.length !== 1 ? "s" : ""}. Here are the most time-sensitive:`,
      list: top.map(a => `${a.title} — ${a.priority} Priority`),
      actions: [{ label: "Open Action Items", href: "/action-items" }],
    };
  }

  // ── Read items aloud ────────────────────────────────────────────────
  if (/read.*aloud|read.*items|speak.*items|read.*to me/i.test(lower)) {
    const top = overdue.slice(0, 3);
    if (top.length === 0) {
      return { role: "apphia", text: "Nothing overdue to read out — your action list is clear." };
    }
    const speech = `You have ${overdue.length} overdue items. The top three are: ${top.map((a, i) => `${i + 1}. ${a.title}`).join(". ")}.`;
    try {
      const utterance = new SpeechSynthesisUtterance(speech);
      utterance.rate = 0.92;
      utterance.pitch = 1.05;
      window.speechSynthesis.speak(utterance);
    } catch { /* silent */ }
    return {
      role: "apphia",
      text: `Reading your top ${top.length} overdue items now…`,
      list: top.map(a => a.title),
    };
  }

  // ── Initiatives — blocked / at risk ───────────────────────────────
  if (/blocked|initiative|project.*status|what.*blocked|at.?risk|delayed|slow/i.test(lower)) {
    if (blocked.length === 0 && atRisk.length === 0) {
      return {
        role: "apphia",
        text: "All initiatives are moving. No blocked or at-risk items detected right now.",
        actions: [{ label: "View Initiatives", href: "/initiatives" }],
      };
    }
    const combined = [
      ...blocked.map(i => `${i.title} — Blocked`),
      ...atRisk.map(i => `${i.title} — At Risk`),
    ].slice(0, 5);
    return {
      role: "apphia",
      text: `${blocked.length > 0 ? `${blocked.length} blocked` : ""}${blocked.length > 0 && atRisk.length > 0 ? " and " : ""}${atRisk.length > 0 ? `${atRisk.length} at-risk` : ""} initiative${(blocked.length + atRisk.length) !== 1 ? "s" : ""} need your attention:`,
      list: combined,
      actions: [{ label: "Open Initiatives", href: "/initiatives" }],
    };
  }

  // ── Health score ──────────────────────────────────────────────────
  if (/health|how.*doing|score|how.*we|status.*org|org.*status|maturity/i.test(lower)) {
    const level = healthScore >= 70 ? "strong" : healthScore >= 50 ? "developing" : "needs work";
    const advice = healthScore >= 70
      ? "Focus on maintaining momentum and scaling what's working."
      : healthScore >= 50
      ? "You have a solid base — focus on closing the gaps in your weakest areas."
      : "Prioritize foundational processes: clear ownership, documented SOPs, and weekly performance reviews.";
    return {
      role: "apphia",
      text: `${org}'s organizational health score is ${healthScore} — rated ${level}${ctxLabel}. ${advice}`,
      actions: [{ label: "Full Diagnostics", href: "/diagnostics" }],
    };
  }

  // ── What should I focus on / priorities ─────────────────────────
  if (/focus|priority|prioriti|what should i do|where.*start|most important|today/i.test(lower)) {
    const topItem = overdue[0];
    const topBlocked = blocked[0];
    const lines: string[] = [];
    if (topItem)    lines.push(`Clear your most overdue item: "${topItem.title}"`);
    if (topBlocked) lines.push(`Unblock "${topBlocked.title}" — review dependencies and escalate if needed`);
    if (healthScore < 50) lines.push("Review diagnostics — operational health is below 50. Quick wins are available.");
    if (lines.length === 0) lines.push("Strategic planning and OKR review — no urgent fires burning right now.");

    return {
      role: "apphia",
      text: "Here's where I'd focus your energy right now:",
      list: lines,
      actions: [{ label: "Action Items", href: "/action-items" }, { label: "Initiatives", href: "/initiatives" }],
    };
  }

  // ── Workflow suggestions ──────────────────────────────────────────
  if (/workflow|automate|automation|process|what.*run|deploy|bundle|package/i.test(lower)) {
    const suggestions: string[] = [];
    if (overdue.length > 0) suggestions.push("Action Item Tracking workflow — auto-monitors deadlines");
    if (blocked.length > 0) suggestions.push("Issue Escalation workflow — routes blockers to decision owners");
    suggestions.push("Weekly Governance Bundle — performance, meetings, escalations");
    if (healthScore < 60) suggestions.push("Operational Health Assessment — diagnose and score gaps");
    return {
      role: "apphia",
      text: "Based on your current org state, here are the workflows I'd suggest activating:",
      list: suggestions,
      actions: [{ label: "Go to Workflows", href: "/workflows" }],
    };
  }

  // ── Departments ───────────────────────────────────────────────────
  if (/department|team|capacity|staff|people|headcount|hiring/i.test(lower)) {
    const names = departments.slice(0, 5).map(d => d.name);
    return {
      role: "apphia",
      text: `${org} has ${departments.length} departments tracked. Your teams:`,
      list: names,
      actions: [{ label: "View Departments", href: "/departments" }],
    };
  }

  // ── Strategy / goals ─────────────────────────────────────────────
  if (/strategy|goal|okr|objective|quarterly|annual|plan|roadmap/i.test(lower)) {
    return {
      role: "apphia",
      text: `Strategy execution is one of the most common failure points for growing organizations. The key is aligning your OKRs to your initiatives and ensuring quarterly planning cadences are in place. ${healthScore < 60 ? "Your current health score suggests some alignment gaps worth addressing." : "Your health indicators suggest reasonable alignment — keep reviewing quarterly."}`,
      actions: [{ label: "View Initiatives", href: "/initiatives" }, { label: "Advisory", href: "/advisory" }],
    };
  }

  // ── Decisions ─────────────────────────────────────────────────────
  if (/decision|decide|pending.*decision|outstanding/i.test(lower)) {
    return {
      role: "apphia",
      text: "Unresolved decisions are silent blockers. Every open decision is creating downstream uncertainty for your team. I recommend reviewing your pending decisions this week and applying a simple Decision Matrix or SPADE framework to the most complex ones.",
      actions: [{ label: "View Decisions", href: "/decisions" }],
    };
  }

  // ── Help / what can you do ────────────────────────────────────────
  if (/help|what.*can.*you|how.*work|capability|feature|what.*do/i.test(lower)) {
    return {
      role: "apphia",
      text: "I'm Apphia — your executive AI engine. I specialize in pattern recognition, decision intelligence, and operational efficiency. Here's what I do:",
      list: [
        "Recognize patterns across tasks, initiatives, and KPIs — before they become problems",
        "Frame and prioritize executive decisions with structured intelligence",
        "Diagnose operational bottlenecks and surface efficiency gaps",
        "Translate your org data into strategic recommendations",
        "Surface the highest-leverage actions for right now",
        "Navigate any section of your command center — just ask",
      ],
    };
  }

  // ── Walkthrough / screen share / explain why ──────────────────────
  if (/walk(through| me through|through)|screen share|visual walkthrough|explain.*report|explain.*dashboard|show me the|explain.*why|why.*score|explain.*health|explain.*relationship|how.*connect|explain.*number|explain.*metric|explain.*kpi|explain.*initiative|explain.*priority|explain.*workflow|explain.*decision|explain.*execution/i.test(lower)) {
    const pageWtMap: Record<string, WalkthroughId> = {
      "/diagnostics":    "org-health",
      "/":               "org-health",
      "/initiatives":    "initiatives",
      "/reports":        "reports",
      "/decisions":      "decisions",
      "/action-items":   "action-items",
      "/workflows":      "workflows",
    };

    let wtId: WalkthroughId = pageWtMap[page] ?? "org-health";

    if (/initiative|portfolio|blocked.*init|init.*blocked/i.test(lower)) wtId = "initiatives";
    if (/report|kpi|metric|performance|dashboard/i.test(lower)) wtId = "reports";
    if (/health|score|diagnostic|why.*score|explain.*score|maturity/i.test(lower)) wtId = "org-health";
    if (/decision/i.test(lower)) wtId = "decisions";
    if (/action item|execution|overdue.*item|task/i.test(lower)) wtId = "action-items";
    if (/workflow|automation|package/i.test(lower)) wtId = "workflows";
    if (/connect|relationship|how.*work.*together|system|architecture/i.test(lower)) wtId = "relationships";

    const titles: Record<WalkthroughId, string> = {
      "org-health":    "your org health score",
      "initiatives":   "your initiative portfolio",
      "reports":       "your performance report",
      "decisions":     "your decision queue",
      "action-items":  "your execution layer",
      "workflows":     "the workflow system",
      "relationships": "how all modules connect",
    };

    return {
      role: "apphia",
      text: `I'll walk you through ${titles[wtId]} now — with live highlights on the actual data so you can see exactly what each number means and why it matters.`,
      walkthroughId: wtId,
    };
  }

  // ── Create task / remind me to ───────────────────────────────────
  if (/create\s+(a\s+)?(?:new\s+)?(?:action\s+item|task)|add\s+(a\s+)?(?:new\s+)?(?:action\s+item|task)|remind\s+me\s+to|make\s+(a\s+)?(?:new\s+)?task|log\s+(a\s+)?task|add\s+(this\s+)?to\s+(my\s+)?(list|plate|action\s+items?)/i.test(lower)) {
    const title = extractTaskTitle(lower);
    if (title.length >= 3) {
      return {
        role: "apphia",
        text: `Got it — I'll save this as an action item for you:`,
        createTask: title,
      };
    }
    return {
      role: "apphia",
      text: `I'd be happy to create a task for you. What's the title? For example, try: "Create a task to review the Q2 budget."`,
    };
  }

  // ── Navigation / go to ────────────────────────────────────────────
  const navMap: [RegExp, string, string][] = [
    [/dashboard|home/i,       "/",            "Dashboard"],
    [/action.*item|task/i,    "/action-items", "Action Items"],
    [/initiative/i,           "/initiatives",  "Initiatives"],
    [/diagnostic/i,           "/diagnostics",  "Diagnostics"],
    [/department/i,           "/departments",  "Departments"],
    [/workflow/i,             "/workflows",    "Workflows"],
    [/knowledge|resource/i,   "/knowledge",    "Knowledge Hub"],
    [/advisory|advisor/i,     "/advisory",     "Advisory"],
    [/report/i,               "/reports",      "Reports"],
    [/decision/i,             "/decisions",    "Decisions"],
    [/crm|customer/i,         "/crm",          "CRM"],
    [/team|people/i,          "/team",         "Team"],
  ];
  if (/go to|take me|open|navigate|show me/i.test(lower)) {
    for (const [pattern, href, label] of navMap) {
      if (pattern.test(lower)) {
        return {
          role: "apphia",
          text: `Taking you to ${label} now.`,
          actions: [{ label: `Open ${label}`, href }],
        };
      }
    }
  }

  // ── Default fallback ──────────────────────────────────────────────
  const fallbacks = [
    `I'm reading your org data in real time and looking for patterns. Try asking "what's overdue", "what's blocked", "how's our operational health", or "what should I focus on today".`,
    `I specialize in recognizing patterns and surfacing executive decisions. Ask me "what's overdue", "what's blocked", or "what workflows should I run" — I'll give you a direct, actionable answer.`,
    `Let me know what you need. I'm connected to your action items, initiatives, departments, and operational health data — and I'm built to help you make better decisions, faster.`,
  ];
  return {
    role: "apphia",
    text: fallbacks[Math.floor(Math.random() * fallbacks.length)],
  };
}

// ── Wake word — listens for "hey apphia" or "apphia" ─────────────────
function useApphiaWakeWord(onWake: () => void, enabled: boolean) {
  const recRef = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    if (!enabled) return;
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) return;

    function start() {
      try {
        const rec: SpeechRecognition = new SR();
        rec.lang = "en-US";
        rec.continuous = false;
        rec.interimResults = false;
        recRef.current = rec;

        rec.onresult = (e: SpeechRecognitionEvent) => {
          const t = Array.from(e.results).map(r => r[0].transcript).join(" ").toLowerCase();
          if (t.includes("apphia")) {
            onWake();
          }
        };
        rec.onend = () => { setTimeout(start, 800); };
        rec.onerror = () => { setTimeout(start, 3000); };
        rec.start();
      } catch { /* silent */ }
    }

    start();
    return () => {
      recRef.current?.abort();
    };
  }, [enabled, onWake]);
}

// ── Main component ────────────────────────────────────────────────────
let _apphiaOpen: ((v: boolean) => void) | null = null;
export function openApphia() { _apphiaOpen?.(true); }

export default function ApphiaPanel() {
  const location = useLocation();
  const { user } = useAuth();
  const [open, setOpen]                   = useState(false);
  const [messages, setMessages]           = useState<ApphiaMsg[]>([]);
  const [input, setInput]                 = useState("");
  const [loading, setLoading]             = useState(false);
  const [listening, setListening]         = useState(false);
  const [wakeEnabled, setWakeEnabled]     = useState(false);
  const [activeWT, setActiveWT]           = useState<WalkthroughScript | null>(null);
  const [taskStatus, setTaskStatus]       = useState<Record<string, TaskSaveStatus>>({});
  const inputRef   = useRef<HTMLInputElement>(null);
  const bottomRef  = useRef<HTMLDivElement>(null);
  const recRef     = useRef<SpeechRecognition | null>(null);

  _apphiaOpen = setOpen;

  /** Launch a walkthrough: close the panel, build the script, start player */
  function launchWalkthrough(id: WalkthroughId) {
    const ctx = buildCtx();
    const wtCtx = {
      healthScore: ctx.healthScore,
      overdue:     ctx.overdue.length,
      blocked:     ctx.blocked.length,
      atRisk:      ctx.atRisk.length,
      delayed:     ctx.delayed.length,
      orgName:     ctx.profile.orgName || "Your Organization",
    };
    setOpen(false);
    setActiveWT(getWalkthrough(id, wtCtx));
  }

  /** Save a task to Supabase (or simulate in demo mode) */
  async function handleCreateTask(msgId: string, title: string) {
    setTaskStatus(s => ({ ...s, [msgId]: "saving" }));
    try {
      if (isDemoMode()) {
        await new Promise(r => setTimeout(r, 700));
        setTaskStatus(s => ({ ...s, [msgId]: "saved" }));
        return;
      }
      if (!user) { setTaskStatus(s => ({ ...s, [msgId]: "error" })); return; }
      const dueDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        .toISOString().split("T")[0];
      const { error } = await upsertActionItem({
        title,
        user_id:    user.id,
        created_by: user.id,
        status:     "Not Started",
        priority:   "Medium",
        due_date:   dueDate,
      });
      setTaskStatus(s => ({ ...s, [msgId]: error ? "error" : "saved" }));
    } catch {
      setTaskStatus(s => ({ ...s, [msgId]: "error" }));
    }
  }

  // Global keyboard shortcut Ctrl+K
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setOpen(o => !o);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  // Listen for external open event (from VoiceCommand wake word)
  useEffect(() => {
    const handler = () => setOpen(true);
    window.addEventListener("apphia:open", handler);
    return () => window.removeEventListener("apphia:open", handler);
  }, []);

  // Auto-scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Focus input when opened
  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 120);
  }, [open]);

  // Welcome message on first open
  useEffect(() => {
    if (open && messages.length === 0) {
      const ctx = buildCtx();
      const org = ctx.profile.orgName || "your organization";
      const urgency = ctx.overdue.length + ctx.blocked.length;
      setMessages([{
        id: "welcome",
        role: "apphia",
        text: urgency > 0
          ? `Hey! I'm Apphia — your PMO intelligence layer. ${ctx.overdue.length > 0 ? `You have ${ctx.overdue.length} overdue action item${ctx.overdue.length !== 1 ? "s" : ""}` : ""}${ctx.overdue.length > 0 && ctx.blocked.length > 0 ? " and " : ""}${ctx.blocked.length > 0 ? `${ctx.blocked.length} blocked initiative${ctx.blocked.length !== 1 ? "s" : ""}` : ""}. What do you need?`
          : `Hey! I'm Apphia. ${org} looks stable — no urgent fires. How can I help you today?`,
        timestamp: new Date(),
        actions: urgency > 0 ? [
          ...(ctx.overdue.length > 0 ? [{ label: "Action Items", href: "/action-items" }] : []),
          ...(ctx.blocked.length > 0 ? [{ label: "Initiatives", href: "/initiatives" }] : []),
        ] : [{ label: "Diagnostics", href: "/diagnostics" }],
      }]);
    }
  }, [open]);

  const wakeCallback = useCallback(() => {
    setOpen(true);
  }, []);

  useApphiaWakeWord(wakeCallback, wakeEnabled);

  function send(text?: string) {
    const query = (text ?? input).trim();
    if (!query) return;
    setInput("");

    const userMsg: ApphiaMsg = {
      id: `u-${Date.now()}`,
      role: "user",
      text: query,
      timestamp: new Date(),
    };
    setMessages(m => [...m, userMsg]);
    setLoading(true);

    // Simulate brief processing delay for natural feel
    setTimeout(() => {
      const res = apphiaRespond(query, location.pathname);
      setMessages(m => [...m, {
        id: `a-${Date.now()}`,
        timestamp: new Date(),
        ...res,
      }]);
      setLoading(false);
    }, 380);
  }

  function startVoice() {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) return;
    const rec: SpeechRecognition = new SR();
    rec.lang = "en-US";
    rec.interimResults = false;
    recRef.current = rec;
    setListening(true);
    rec.onresult = (e: SpeechRecognitionEvent) => {
      const t = e.results[0][0].transcript;
      setInput(t);
      setListening(false);
      setTimeout(() => send(t), 100);
    };
    rec.onerror = () => setListening(false);
    rec.onend = () => setListening(false);
    rec.start();
  }

  function stopVoice() {
    recRef.current?.stop();
    setListening(false);
  }

  function clearChat() {
    setMessages([]);
  }

  const chips = getChips(location.pathname);

  if (!open) {
    return (
      <>
        {/* Walkthrough player — runs when Apphia panel is closed */}
        {activeWT && (
          <WalkthroughPlayer
            script={activeWT}
            onClose={() => setActiveWT(null)}
          />
        )}
        <button
          onClick={() => setOpen(true)}
          title="Ask Apphia (Ctrl+K)"
          className="fixed bottom-20 right-4 sm:bottom-6 sm:right-6 z-40 rounded-full flex items-center justify-center shadow-lg transition-all hover:scale-105 active:scale-95 select-none"
          style={{
            width: 52, height: 52,
            background: "linear-gradient(135deg, hsl(268 72% 52%), hsl(183 62% 42%))",
            boxShadow: "0 8px 28px hsl(268 72% 52% / 0.45), 0 2px 8px hsl(0 0% 0% / 0.2)",
          }}>
          <span className="text-white font-black text-lg tracking-tight select-none">A</span>
          <span className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white animate-pulse"
            style={{ background: "hsl(160 56% 46%)" }} />
        </button>
      </>
    );
  }

  return (
    <>
      {/* Mobile: full-screen overlay backdrop */}
      <div className="fixed inset-0 z-50 sm:hidden bg-black/60 backdrop-blur-sm" onClick={() => setOpen(false)} />

      {/* Mobile: full-screen panel sliding up from bottom */}
      <div className="fixed inset-x-0 bottom-0 z-[60] flex flex-col sm:hidden"
        style={{ height: "90dvh", paddingBottom: "env(safe-area-inset-bottom, 0px)" }}>
        <div className="flex-1 overflow-hidden flex flex-col rounded-t-2xl"
          style={{
            background: "hsl(226 48% 9%)",
            border: "1px solid hsl(226 40% 18%)",
            boxShadow: "0 -16px 40px hsl(0 0% 0% / 0.55), 0 0 0 1px hsl(268 72% 52% / 0.18)",
          }}>

          {/* Header */}
          <div className="flex items-center justify-between px-4 pt-4 pb-3 flex-shrink-0"
            style={{ borderBottom: "1px solid hsl(226 40% 16%)" }}>
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: "linear-gradient(135deg, hsl(268 72% 52%), hsl(183 62% 42%))" }}>
                <span className="text-white font-black text-sm select-none">A</span>
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-black text-white">Apphia</span>
                  <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: "hsl(160 56% 46%)" }} />
                </div>
                <p className="text-[10px]" style={{ color: "hsl(0 0% 100% / 0.32)" }}>PMO Intelligence Layer</p>
              </div>
            </div>
            <button onClick={() => setOpen(false)} className="p-2 rounded-lg hover:bg-white/10 transition-colors">
              <X className="w-4 h-4" style={{ color: "hsl(0 0% 100% / 0.50)" }} />
            </button>
          </div>

          <ApphiaContextStrip />

          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 min-h-0" style={{ scrollbarWidth: "none" }}>
            {messages.map(msg => <MessageBubble key={msg.id} msg={msg} onLaunchWT={launchWalkthrough} taskSaveStatus={taskStatus[msg.id] ?? "idle"} onCreateTask={(title) => handleCreateTask(msg.id, title)} />)}
            {loading && (
              <div className="flex items-center gap-2 py-1">
                <div className="w-6 h-6 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: "linear-gradient(135deg, hsl(268 72% 52%), hsl(183 62% 42%))" }}>
                  <span className="text-white font-black text-xs">A</span>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-2 rounded-2xl rounded-tl-sm"
                  style={{ background: "hsl(226 40% 15%)" }}>
                  {[0, 1, 2].map(i => (
                    <div key={i} className="w-1.5 h-1.5 rounded-full animate-bounce"
                      style={{ background: "hsl(268 72% 70%)", animationDelay: `${i * 0.18}s`, animationDuration: "0.8s" }} />
                  ))}
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          <div className="px-4 pb-2 flex-shrink-0">
            <div className="flex gap-1.5 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
              {/* Walkthrough quick-launch chip */}
              {PAGE_DEFAULT_WALKTHROUGH[location.pathname] && (
                <button
                  onClick={() => launchWalkthrough(PAGE_DEFAULT_WALKTHROUGH[location.pathname] as WalkthroughId)}
                  className="flex-shrink-0 flex items-center gap-1 text-[11px] px-2.5 py-1.5 rounded-xl border font-semibold whitespace-nowrap"
                  style={{
                    borderColor: "hsl(268 72% 52% / 0.45)",
                    color: "hsl(268 72% 72%)",
                    background: "hsl(268 72% 52% / 0.10)",
                  }}>
                  <PlayCircle className="w-3 h-3" />
                  Watch Walkthrough
                </button>
              )}
              {chips.map(chip => (
                <button key={chip} onClick={() => send(chip)}
                  className="flex-shrink-0 text-[11px] px-2.5 py-1.5 rounded-xl border font-medium whitespace-nowrap"
                  style={{ borderColor: "hsl(226 40% 22%)", color: "hsl(0 0% 100% / 0.42)" }}>
                  {chip}
                </button>
              ))}
            </div>
          </div>

          <div className="px-4 pb-4 flex-shrink-0">
            <div className="flex items-center gap-2 rounded-xl px-3 py-2"
              style={{ background: "hsl(226 40% 14%)", border: "1px solid hsl(226 40% 22%)" }}>
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter") send(); }}
                placeholder="Ask Apphia anything…"
                className="flex-1 bg-transparent text-sm text-white placeholder:text-white/25 focus:outline-none"
                style={{ caretColor: "hsl(268 72% 70%)" }}
              />
              <button onClick={listening ? stopVoice : startVoice} className="flex-shrink-0 p-1 rounded-lg"
                style={{ color: listening ? "hsl(0 72% 65%)" : "hsl(0 0% 100% / 0.32)" }}>
                {listening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>
              <button onClick={() => send()} disabled={!input.trim()}
                className="flex-shrink-0 p-1 rounded-lg transition-all disabled:opacity-30"
                style={{ color: "hsl(268 72% 70%)" }}>
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop: fixed bottom-right popup */}
    <div className="hidden sm:flex fixed bottom-6 right-6 z-50 flex-col"
      style={{ width: 368, maxHeight: "calc(100vh - 48px)" }}>

      {/* Panel */}
      <div className="rounded-2xl overflow-hidden flex flex-col shadow-2xl"
        style={{
          background: "hsl(226 48% 9%)",
          border: "1px solid hsl(226 40% 18%)",
          boxShadow: "0 32px 80px hsl(0 0% 0% / 0.55), 0 0 0 1px hsl(268 72% 52% / 0.18)",
          maxHeight: "calc(100vh - 80px)",
        }}>

        {/* Header */}
        <div className="flex items-center justify-between px-4 pt-4 pb-3 flex-shrink-0"
          style={{ borderBottom: "1px solid hsl(226 40% 16%)" }}>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: "linear-gradient(135deg, hsl(268 72% 52%), hsl(183 62% 42%))" }}>
              <span className="text-white font-black text-sm select-none">A</span>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-black text-white">Apphia</span>
                <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: "hsl(160 56% 46%)" }} />
              </div>
              <p className="text-[10px]" style={{ color: "hsl(0 0% 100% / 0.32)" }}>PMO Intelligence Layer</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {/* Wake word toggle */}
            <button
              onClick={() => setWakeEnabled(v => !v)}
              title={wakeEnabled ? "Hey Apphia: ON — click to disable" : "Enable Hey Apphia wake word"}
              className={cn("p-1.5 rounded-lg transition-colors text-[10px] font-bold flex items-center gap-1",
                wakeEnabled ? "text-white" : "hover:bg-white/10"
              )}
              style={{
                background: wakeEnabled ? "hsl(268 72% 52% / 0.35)" : "transparent",
                color: wakeEnabled ? "hsl(268 72% 80%)" : "hsl(0 0% 100% / 0.30)",
                border: wakeEnabled ? "1px solid hsl(268 72% 52% / 0.4)" : "1px solid transparent",
              }}>
              <Zap className="w-3 h-3" />
              {wakeEnabled && <span className="hidden sm:inline">Hey Apphia</span>}
            </button>
            <button onClick={clearChat} title="Clear chat"
              className="p-1.5 rounded-lg hover:bg-white/10 transition-colors">
              <RefreshCw className="w-3.5 h-3.5" style={{ color: "hsl(0 0% 100% / 0.30)" }} />
            </button>
            <button onClick={() => setOpen(false)} className="p-1.5 rounded-lg hover:bg-white/10 transition-colors">
              <X className="w-3.5 h-3.5" style={{ color: "hsl(0 0% 100% / 0.40)" }} />
            </button>
          </div>
        </div>

        {/* Org context strip */}
        <ApphiaContextStrip />

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 min-h-0"
          style={{ scrollbarWidth: "none" }}>
          {messages.map(msg => (
            <MessageBubble key={msg.id} msg={msg} onLaunchWT={launchWalkthrough} taskSaveStatus={taskStatus[msg.id] ?? "idle"} onCreateTask={(title) => handleCreateTask(msg.id, title)} />
          ))}
          {loading && (
            <div className="flex items-center gap-2 py-1">
              <div className="w-6 h-6 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: "linear-gradient(135deg, hsl(268 72% 52%), hsl(183 62% 42%))" }}>
                <span className="text-white font-black text-xs">A</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-2 rounded-2xl rounded-tl-sm"
                style={{ background: "hsl(226 40% 15%)" }}>
                {[0, 1, 2].map(i => (
                  <div key={i} className="w-1.5 h-1.5 rounded-full animate-bounce"
                    style={{
                      background: "hsl(268 72% 70%)",
                      animationDelay: `${i * 0.18}s`,
                      animationDuration: "0.8s",
                    }} />
                ))}
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Suggestion chips */}
        <div className="px-4 pb-2 flex-shrink-0">
          <div className="flex gap-1.5 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
            {/* Walkthrough quick-launch chip */}
            {PAGE_DEFAULT_WALKTHROUGH[location.pathname] && (
              <button
                onClick={() => launchWalkthrough(PAGE_DEFAULT_WALKTHROUGH[location.pathname] as WalkthroughId)}
                className="flex-shrink-0 flex items-center gap-1 text-[11px] px-2.5 py-1.5 rounded-xl border font-semibold whitespace-nowrap"
                style={{
                  borderColor: "hsl(268 72% 52% / 0.45)",
                  color: "hsl(268 72% 72%)",
                  background: "hsl(268 72% 52% / 0.10)",
                }}>
                <PlayCircle className="w-3 h-3" />
                Watch Walkthrough
              </button>
            )}
            {chips.map(chip => (
              <button key={chip}
                onClick={() => send(chip)}
                className="flex-shrink-0 text-[11px] px-2.5 py-1.5 rounded-xl border font-medium transition-all hover:border-purple-400/50 hover:text-purple-200 whitespace-nowrap"
                style={{
                  borderColor: "hsl(226 40% 22%)",
                  color: "hsl(0 0% 100% / 0.42)",
                  background: "transparent",
                }}>
                {chip}
              </button>
            ))}
          </div>
        </div>

        {/* Input */}
        <div className="px-4 pb-4 flex-shrink-0">
          <div className="flex items-center gap-2 rounded-xl px-3 py-2"
            style={{
              background: "hsl(226 40% 14%)",
              border: "1px solid hsl(226 40% 22%)",
            }}>
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter") send(); }}
              placeholder="Ask Apphia anything…"
              className="flex-1 bg-transparent text-sm text-white placeholder:text-white/25 focus:outline-none"
              style={{ caretColor: "hsl(268 72% 70%)" }}
            />
            <button
              onClick={listening ? stopVoice : startVoice}
              className="flex-shrink-0 p-1 rounded-lg transition-colors"
              style={{ color: listening ? "hsl(0 72% 65%)" : "hsl(0 0% 100% / 0.32)" }}>
              {listening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>
            <button
              onClick={() => send()}
              disabled={!input.trim()}
              className="flex-shrink-0 p-1 rounded-lg transition-all disabled:opacity-30"
              style={{ color: "hsl(268 72% 70%)" }}>
              <Send className="w-4 h-4" />
            </button>
          </div>
          <p className="text-[9px] text-center mt-1.5" style={{ color: "hsl(0 0% 100% / 0.15)" }}>
            Ctrl+K to toggle · "Hey Apphia" voice wake
          </p>
        </div>
      </div>
    </div>
    </>
  );
}

// ── Org context strip ─────────────────────────────────────────────────
function ApphiaContextStrip() {
  const [ctx] = useState(() => buildCtx());
  const [showCtxPanel, setShowCtxPanel] = useState(false);
  const healthColor = ctx.healthScore >= 70 ? "hsl(160 56% 46%)" : ctx.healthScore >= 50 ? "hsl(38 92% 52%)" : "hsl(0 84% 60%)";

  let orgCtx: OrgContext | null = null;
  try {
    const profile = loadProfile();
    if (profile.onboardingComplete) orgCtx = buildOrgContext(profile);
  } catch {}

  const factors = orgCtx ? getContextFactors(orgCtx) : [];

  return (
    <>
      <div className="px-4 py-2 flex items-center gap-2 overflow-x-auto flex-shrink-0"
        style={{ scrollbarWidth: "none", borderBottom: "1px solid hsl(226 40% 14%)" }}>
        <CtxChip label={`Health ${ctx.healthScore}`} color={healthColor} />
        {ctx.overdue.length > 0 && (
          <CtxChip label={`${ctx.overdue.length} overdue`} color="hsl(0 84% 60%)" />
        )}
        {ctx.blocked.length > 0 && (
          <CtxChip label={`${ctx.blocked.length} blocked`} color="hsl(38 92% 52%)" />
        )}
        {ctx.atRisk.length > 0 && (
          <CtxChip label={`${ctx.atRisk.length} at risk`} color="hsl(38 92% 52%)" />
        )}
        {ctx.overdue.length === 0 && ctx.blocked.length === 0 && (
          <CtxChip label="All clear" color="hsl(160 56% 46%)" />
        )}
        {orgCtx && (
          <button
            onClick={() => setShowCtxPanel(!showCtxPanel)}
            className="flex-shrink-0 flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap transition-all"
            style={{
              background: showCtxPanel ? "hsl(183 62% 42% / 0.20)" : "hsl(183 62% 42% / 0.10)",
              color: "hsl(183 62% 68%)",
              border: `1px solid hsl(183 62% 42% / ${showCtxPanel ? "0.45" : "0.25"})`,
            }}>
            <Target className="w-2.5 h-2.5" />
            Context
          </button>
        )}
      </div>

      {showCtxPanel && orgCtx && factors.length > 0 && (
        <div className="px-4 py-3 space-y-2 flex-shrink-0"
          style={{ borderBottom: "1px solid hsl(226 40% 14%)", background: "hsl(226 48% 7%)" }}>
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-[0.18em]" style={{ color: "hsl(183 62% 58%)" }}>
              Active Context Factors
            </span>
            <button onClick={() => setShowCtxPanel(false)} className="p-0.5 rounded hover:bg-white/10">
              <X className="w-3 h-3" style={{ color: "hsl(0 0% 100% / 0.30)" }} />
            </button>
          </div>
          <div className="space-y-1.5">
            {factors.map(f => (
              <div key={f.label} className="flex items-start gap-2 text-[11px]">
                <span className="font-semibold flex-shrink-0 w-[80px]" style={{ color: "hsl(0 0% 100% / 0.55)" }}>{f.label}</span>
                <div className="flex-1 min-w-0">
                  <span className="font-bold" style={{ color: "hsl(0 0% 100% / 0.78)" }}>{f.value}</span>
                  <p className="text-[10px] leading-snug mt-0.5" style={{ color: "hsl(0 0% 100% / 0.35)" }}>{f.influence}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-2.5 pt-2" style={{ borderTop: "1px solid hsl(226 40% 16%)" }}>
            <Link
              to="/settings"
              onClick={() => setShowCtxPanel(false)}
              className="text-[10px] font-semibold flex items-center gap-1 hover:underline"
              style={{ color: "hsl(183 62% 58%)" }}>
              <Settings className="w-2.5 h-2.5" />
              Edit org profile &amp; context →
            </Link>
          </div>
        </div>
      )}
    </>
  );
}

function CtxChip({ label, color }: { label: string; color: string }) {
  return (
    <span className="flex-shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap"
      style={{ background: `${color}18`, color, border: `1px solid ${color}35` }}>
      {label}
    </span>
  );
}

// ── Message bubble ────────────────────────────────────────────────────
function MessageBubble({
  msg,
  onLaunchWT,
  taskSaveStatus,
  onCreateTask,
}: {
  msg: ApphiaMsg;
  onLaunchWT: (id: WalkthroughId) => void;
  taskSaveStatus: TaskSaveStatus;
  onCreateTask: (title: string) => void;
}) {
  const isApphia = msg.role === "apphia";
  return (
    <div className={cn("flex gap-2", isApphia ? "items-start" : "items-start justify-end")}>
      {isApphia && (
        <div className="w-6 h-6 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
          style={{ background: "linear-gradient(135deg, hsl(268 72% 52%), hsl(183 62% 42%))" }}>
          <span className="text-white font-black text-[10px] select-none">A</span>
        </div>
      )}
      <div className={cn("max-w-[85%] space-y-1.5", !isApphia && "items-end flex flex-col")}>
        <div className={cn("px-3 py-2.5 rounded-2xl text-sm leading-relaxed",
          isApphia ? "rounded-tl-sm" : "rounded-tr-sm")}
          style={{
            background: isApphia ? "hsl(226 40% 15%)" : "linear-gradient(135deg, hsl(268 72% 52% / 0.85), hsl(183 62% 42% / 0.80))",
            color: "hsl(0 0% 100% / 0.88)",
          }}>
          {msg.text}
        </div>

        {/* Create-task confirmation card */}
        {msg.createTask && (
          <div className="rounded-xl overflow-hidden w-full"
            style={{ background: "hsl(226 40% 13%)", border: "1px solid hsl(226 40% 22%)" }}>
            {/* Task preview row */}
            <div className="flex items-center gap-2.5 px-3 py-2.5">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ background: "hsl(268 72% 52% / 0.22)" }}>
                <ClipboardList className="w-3.5 h-3.5" style={{ color: "hsl(268 72% 75%)" }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[12px] font-semibold text-white truncate">{msg.createTask}</p>
                <p className="text-[10px]" style={{ color: "hsl(0 0% 100% / 0.38)" }}>
                  Medium · Due in 7 days · Not Started
                </p>
              </div>
            </div>
            {/* Action row */}
            <div className="px-3 pb-2.5">
              {taskSaveStatus === "idle" && (
                <button
                  onClick={() => onCreateTask(msg.createTask!)}
                  className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-[11px] font-bold transition-all hover:opacity-90 active:scale-[0.97]"
                  style={{
                    background: "linear-gradient(135deg, hsl(268 72% 52%), hsl(183 62% 42%))",
                    color: "white",
                  }}>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Save to Action Items
                </button>
              )}
              {taskSaveStatus === "saving" && (
                <div className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-[11px]"
                  style={{ background: "hsl(268 72% 52% / 0.15)", color: "hsl(268 72% 72%)" }}>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Saving…
                </div>
              )}
              {taskSaveStatus === "saved" && (
                <div className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-[11px] font-semibold"
                  style={{ background: "hsl(160 56% 46% / 0.15)", color: "hsl(160 56% 58%)" }}>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {isDemoMode() ? "Saved to demo board" : "Saved to Action Items"}
                </div>
              )}
              {taskSaveStatus === "error" && (
                <div className="w-full flex flex-col items-center gap-1 py-1.5 rounded-lg text-[11px]"
                  style={{ color: "hsl(350 84% 65%)" }}>
                  <div className="flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {isDemoMode() ? "Demo mode — sign up to save tasks" : "Sign in to save tasks"}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {msg.list && msg.list.length > 0 && (
          <div className="rounded-xl overflow-hidden"
            style={{ background: "hsl(226 40% 13%)", border: "1px solid hsl(226 40% 20%)" }}>
            {msg.list.map((item, i) => (
              <div key={i} className="flex items-start gap-2 px-3 py-2 text-xs border-b last:border-b-0"
                style={{ borderColor: "hsl(226 40% 16%)", color: "hsl(0 0% 100% / 0.72)" }}>
                <span className="flex-shrink-0 w-4 h-4 rounded-full text-[9px] font-bold flex items-center justify-center mt-0.5"
                  style={{ background: "hsl(268 72% 52% / 0.25)", color: "hsl(268 72% 80%)" }}>
                  {i + 1}
                </span>
                {item}
              </div>
            ))}
          </div>
        )}

        {/* Walkthrough CTA — prominent button when message offers a walkthrough */}
        {msg.walkthroughId && (
          <button
            onClick={() => onLaunchWT(msg.walkthroughId!)}
            className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-[12px] font-bold transition-all hover:opacity-90 active:scale-[0.97] w-full"
            style={{
              background: "linear-gradient(135deg, hsl(268 72% 52% / 0.28), hsl(183 62% 42% / 0.20))",
              color: "hsl(268 72% 78%)",
              border: "1px solid hsl(268 72% 52% / 0.40)",
            }}
          >
            <div
              className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ background: "hsl(268 72% 52%)" }}
            >
              <PlayCircle className="w-3.5 h-3.5 text-white" />
            </div>
            <span>Watch Walkthrough</span>
            <span className="ml-auto text-[10px] opacity-60">Live highlights</span>
          </button>
        )}

        {msg.actions && msg.actions.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {msg.actions.map(action => (
              action.href ? (
                <Link key={action.label} to={action.href}
                  className="flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1.5 rounded-xl transition-all hover:opacity-90 active:scale-[0.97]"
                  style={{
                    background: "hsl(268 72% 52% / 0.20)",
                    color: "hsl(268 72% 80%)",
                    border: "1px solid hsl(268 72% 52% / 0.35)",
                  }}>
                  {action.label} <ChevronRight className="w-3 h-3" />
                </Link>
              ) : (
                <button key={action.label} onClick={action.onClick}
                  className="flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1.5 rounded-xl transition-all hover:opacity-90"
                  style={{
                    background: "hsl(268 72% 52% / 0.20)",
                    color: "hsl(268 72% 80%)",
                    border: "1px solid hsl(268 72% 52% / 0.35)",
                  }}>
                  {action.label}
                </button>
              )
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
