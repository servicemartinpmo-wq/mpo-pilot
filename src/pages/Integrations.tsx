import { useState, useRef } from "react";
import {
  CheckCircle, Lock, ExternalLink, Mail, MessageSquare,
  Calendar, FileText, BarChart2, Video, ArrowRight, Zap,
  RefreshCw, Settings, AlertTriangle, HardDrive, DollarSign,
  Users, Star, ChevronDown, ChevronUp, Plug, Cpu, Inbox, X
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useIntegrationConnections, useUpsertIntegration, useRemoveIntegration } from "@/hooks/useLiveData";

type IntegrationStatus = "connected" | "available" | "coming_soon";
type IntegrationTier = "free" | "t1" | "t2" | "t3";

interface Integration {
  id: string;
  suite: string;
  name: string;
  category: string;
  description: string;
  features: string[];
  icon: React.ElementType;
  iconColor: string;
  iconBg: string;
  status: IntegrationStatus;
  tier: IntegrationTier;
  badge?: string;
  aiFeature?: string;
}

const GSUITE: Integration[] = [
  {
    id: "gmail", suite: "Google Workspace", name: "Gmail", category: "Email Intelligence",
    description: "AI reads starred emails, extracts action items, assigns priority, and flags risks — added directly to your Command Center.",
    aiFeature: "AI extracts tasks · assigns priority · flags risks · starred items prioritized",
    features: ["Inbox → action item extraction", "Starred emails prioritized", "Side-by-side snapshot for quality checks", "Task creation with owner + due date", "Risk flagging and escalation alerts"],
    icon: Mail, iconColor: "hsl(4 82% 55%)", iconBg: "hsl(4 82% 55% / 0.08)",
    status: "coming_soon", tier: "t1",
  },
  {
    id: "gcalendar", suite: "Google Workspace", name: "Google Calendar", category: "Meeting Intelligence",
    description: "Automatically logs meetings, detects missing agendas, builds prep checklists, and surfaces priority sessions on Today's view.",
    aiFeature: "Auto meeting shortlist · prep checklist · agenda detection",
    features: ["Automatic meeting logging (no attendance)", "Missing agenda detection with override", "Meeting shortlist on Today's Priorities", "Pre-meeting prep suggestions", "Linked to Events & Action Items page"],
    icon: Calendar, iconColor: "hsl(214 82% 51%)", iconBg: "hsl(214 82% 51% / 0.08)",
    status: "coming_soon", tier: "t1",
  },
  {
    id: "gdocs", suite: "Google Workspace", name: "Google Docs", category: "Document References",
    description: "Docs linked to action items and initiatives as references. SOPs auto-saved and synced to Resource Hub.",
    features: ["Documents as action item references", "SOP library auto-sync", "Version-controlled document tracking", "Links to initiatives in Command Center"],
    icon: FileText, iconColor: "hsl(206 82% 47%)", iconBg: "hsl(206 82% 47% / 0.08)",
    status: "coming_soon", tier: "t2",
  },
  {
    id: "gsheets", suite: "Google Workspace", name: "Google Sheets", category: "Project Data",
    description: "Pull project data, budget actuals, and KPI tracking directly from Sheets into initiative dashboards.",
    features: ["Project data integration", "Budget actual vs. plan sync", "KPI data surfaced in Diagnostics", "Variance alerts when thresholds breached"],
    icon: BarChart2, iconColor: "hsl(138 52% 40%)", iconBg: "hsl(138 52% 40% / 0.08)",
    status: "coming_soon", tier: "t2",
  },
  {
    id: "gmeet", suite: "Google Workspace", name: "Google Meet / Gemini", category: "Meetings & AI",
    description: "Meetings logged automatically in Events page. Gemini-generated summaries linked to action items.",
    features: ["Meeting auto-log in Events page", "AI-generated meeting summaries", "Action items extracted from transcripts", "Linked to initiative and department context"],
    icon: Video, iconColor: "hsl(268 62% 54%)", iconBg: "hsl(268 62% 54% / 0.08)",
    status: "coming_soon", tier: "t3",
  },
  {
    id: "gdrive", suite: "Google Workspace", name: "Google Drive", category: "File Storage",
    description: "Auto-organize SOPs, templates, and reports in Drive by department. Version controlled and shareable.",
    features: ["Auto-save generated templates to Drive", "Organize SOPs by department folder", "Version control on uploaded documents", "Share reports directly from Command Center"],
    icon: HardDrive, iconColor: "hsl(20 82% 48%)", iconBg: "hsl(20 82% 48% / 0.08)",
    status: "coming_soon", tier: "t2",
  },
];

const MICROSOFT: Integration[] = [
  {
    id: "outlook", suite: "Microsoft 365", name: "Outlook", category: "Email Intelligence",
    description: "AI reads and extracts tasks from Outlook inbox. Starred/flagged emails prioritized and added to dashboard.",
    aiFeature: "AI extracts tasks · flags risks · starred items first",
    features: ["Inbox → task extraction with AI prioritization", "Flagged emails promoted to Today's Priorities", "Risk flagging and escalation alerts", "Side-by-side snapshot view for quality checks"],
    icon: Mail, iconColor: "hsl(214 72% 51%)", iconBg: "hsl(214 72% 51% / 0.08)",
    status: "coming_soon", tier: "t1",
  },
  {
    id: "outlook-cal", suite: "Microsoft 365", name: "Outlook Calendar", category: "Meeting Intelligence",
    description: "Meetings logged to Events page automatically. Missing agenda detection with prep checklist.",
    aiFeature: "Auto meeting log · prep checklist · agenda detection",
    features: ["Automatic meeting logging (no attendance)", "Missing agenda detection with override", "Meeting shortlist on Today's Priorities", "Sync with Teams and initiative context"],
    icon: Calendar, iconColor: "hsl(214 72% 46%)", iconBg: "hsl(214 72% 46% / 0.08)",
    status: "coming_soon", tier: "t1",
  },
  {
    id: "word", suite: "Microsoft 365", name: "Word", category: "Document References",
    description: "Word documents linked as references to action items. SOPs synced to Resource Hub.",
    features: ["Documents linked to action items", "SOP auto-sync to Resource Hub", "Version control and access tracking", "Initiative and department context linking"],
    icon: FileText, iconColor: "hsl(214 72% 48%)", iconBg: "hsl(214 72% 48% / 0.08)",
    status: "coming_soon", tier: "t2",
  },
  {
    id: "excel", suite: "Microsoft 365", name: "Excel", category: "Project Data",
    description: "Project data, budget actuals, and KPIs pulled from Excel into initiative dashboards.",
    features: ["Budget actual vs. plan sync", "KPI data in Diagnostics", "Project data integration", "Variance threshold alerts"],
    icon: BarChart2, iconColor: "hsl(138 52% 36%)", iconBg: "hsl(138 52% 36% / 0.08)",
    status: "coming_soon", tier: "t2",
  },
  {
    id: "teams", suite: "Microsoft 365", name: "Teams", category: "Meetings & Comms",
    description: "Meetings logged to Events page. Channel alerts for critical signals and initiative status updates.",
    features: ["Meeting auto-log in Events page", "Channel alerts for escalations", "Status update posts to relevant channels", "Action item notifications"],
    icon: Video, iconColor: "hsl(262 52% 50%)", iconBg: "hsl(262 52% 50% / 0.08)",
    status: "coming_soon", tier: "t3",
  },
  {
    id: "powerpoint", suite: "Microsoft 365", name: "PowerPoint", category: "Initiatives",
    description: "Presentations linked to initiatives and reports. Slide decks accessible from initiative detail view.",
    features: ["Presentations linked to initiatives", "Slide deck previews in detail modal", "Reports exportable as PowerPoint", "Meeting prep deck generation"],
    icon: FileText, iconColor: "hsl(26 82% 52%)", iconBg: "hsl(26 82% 52% / 0.08)",
    status: "coming_soon", tier: "t2",
  },
];

const COMMS: Integration[] = [
  {
    id: "whatsapp", suite: "Messaging", name: "WhatsApp Business", category: "Messaging Intelligence",
    description: "WhatsApp messages scanned by AI. Starred messages prioritized, tasks extracted, and risks flagged — added to Action Items.",
    aiFeature: "AI reads messages · extracts tasks · starred chats prioritized",
    features: ["Starred chats prioritized in Today's view", "Task extraction from messages", "Risk and escalation flagging", "Snapshot attachments saved for quality checks", "Links back to original messages"],
    icon: MessageSquare, iconColor: "hsl(142 52% 40%)", iconBg: "hsl(142 52% 40% / 0.08)",
    status: "coming_soon", tier: "t1", badge: "High Priority",
  },
  {
    id: "slack", suite: "Messaging", name: "Slack", category: "Alert Routing",
    description: "Route governance escalations, critical signals, and initiative updates to the right Slack channels automatically.",
    features: ["Critical signals to #ops-alerts", "Weekly initiative status digests", "Governance escalation notifications", "Daily blocked-task summary"],
    icon: MessageSquare, iconColor: "hsl(262 52% 47%)", iconBg: "hsl(262 52% 47% / 0.08)",
    status: "available", tier: "t1", badge: "Ready to Connect",
  },
];

const FINANCE: Integration[] = [
  {
    id: "quickbooks", suite: "Finance", name: "QuickBooks", category: "Financial Data",
    description: "Pull budget actuals, P&L summaries, and variance data into financial dashboards.",
    features: ["Budget actuals vs. plan auto-pull", "P&L and cash flow signals", "KPI mapping to departmental data", "Variance threshold alerts"],
    icon: DollarSign, iconColor: "hsl(148 60% 38%)", iconBg: "hsl(148 60% 38% / 0.08)",
    status: "coming_soon", tier: "t3",
  },
  {
    id: "hris", suite: "HR", name: "HRIS (Workday / BambooHR)", category: "Headcount & Org",
    description: "Sync headcount, org chart, and talent pipeline data to keep your Team and Authority Matrix current.",
    features: ["Headcount and org chart live sync", "Open role and time-to-fill data", "Talent pipeline per department", "Critical vacancy alerts"],
    icon: Users, iconColor: "hsl(233 65% 58%)", iconBg: "hsl(233 65% 58% / 0.08)",
    status: "coming_soon", tier: "t3",
  },
];

const ALL_GROUPS = [
  { label: "Google Workspace", items: GSUITE },
  { label: "Microsoft 365", items: MICROSOFT },
  { label: "Messaging & Comms", items: COMMS },
  { label: "Finance & HR", items: FINANCE },
];

const TIER_LABELS: Record<IntegrationTier, string> = { free: "Free", t1: "Tier 1", t2: "Tier 2", t3: "Tier 3" };
const TIER_PRICES: Record<IntegrationTier, string> = { free: "$0", t1: "$30/user/mo", t2: "$50/user/mo", t3: "$120–150/mo" };

const STATUS_CFG = {
  connected:    { label: "Connected",    dot: "bg-signal-green",  text: "text-signal-green" },
  available:    { label: "Available",    dot: "bg-electric-blue", text: "text-electric-blue" },
  coming_soon:  { label: "Coming Soon",  dot: "bg-muted",         text: "text-muted-foreground" },
};

function IntegrationRow({ intg, isConnected, onConnect, onDisconnect }: {
  intg: Integration;
  isConnected: boolean;
  onConnect: (id: string) => void;
  onDisconnect: (id: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const liveStatus: IntegrationStatus = isConnected ? "connected" : intg.status;
  const status = STATUS_CFG[liveStatus];
  const Icon = intg.icon;
  const isLocked = liveStatus === "coming_soon";

  async function handleConnectClick() {
    if (isConnected) return; // manage modal future
    setConnecting(true);
    await new Promise(r => setTimeout(r, 900)); // simulate OAuth handshake
    onConnect(intg.id);
    setConnecting(false);
  }

  return (
    <div className={cn(
      "bg-card border border-border overflow-hidden transition-all duration-200",
      "first:rounded-t-xl last:rounded-b-xl",
      open && "shadow-elevated",
      isLocked && "opacity-70"
    )}>
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full px-5 py-4 flex items-center gap-4 text-left hover:bg-secondary/30 transition-colors"
      >
        {/* Icon */}
        <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 border"
          style={{ background: intg.iconBg, borderColor: intg.iconColor + "40" }}>
          <Icon className="w-4.5 h-4.5" style={{ color: intg.iconColor }} />
        </div>

        {/* Name + desc */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-sm font-semibold text-foreground">{intg.name}</span>
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium border border-border px-1.5 py-0.5 rounded">
              {intg.category}
            </span>
            {intg.badge && (
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded"
                style={{ background: intg.iconColor.replace(')', ' / 0.12)'), color: intg.iconColor, border: `1px solid ${intg.iconColor.replace(')', ' / 0.3)')}` }}>
                {intg.badge}
              </span>
            )}
          </div>
          {intg.aiFeature ? (
            <p className="text-xs text-muted-foreground truncate">
              <span className="text-electric-blue font-medium">AI: </span>{intg.aiFeature}
            </p>
          ) : (
            <p className="text-xs text-muted-foreground truncate">{intg.description}</p>
          )}
        </div>

        {/* Status + tier */}
        <div className="flex items-center gap-4 flex-shrink-0">
          <div className="flex items-center gap-1.5">
            <span className={cn("w-1.5 h-1.5 rounded-full flex-shrink-0", status.dot)} />
            <span className={cn("text-xs font-medium", status.text)}>{status.label}</span>
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground hidden md:block">
            {TIER_LABELS[intg.tier]}
          </span>
          {open ? <ChevronUp className="w-3.5 h-3.5 text-muted-foreground" /> : <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />}
        </div>
      </button>

      {open && (
        <div className="px-5 pb-5 pt-1 border-t border-border/60 animate-fade-up">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-5 pt-4">
            {/* Features list */}
            <div className="md:col-span-3">
              <p className="text-xs text-muted-foreground leading-relaxed mb-3">{intg.description}</p>
              <ul className="space-y-1.5">
                {intg.features.map(f => (
                  <li key={f} className="flex items-start gap-2 text-xs text-foreground/75">
                    <span className="w-1 h-1 rounded-full mt-1.5 flex-shrink-0" style={{ background: intg.iconColor }} />
                    {f}
                  </li>
                ))}
              </ul>
            </div>

            {/* CTA panel */}
            <div className="md:col-span-2 rounded-xl p-4 border flex flex-col gap-3"
              style={{ background: intg.iconBg, borderColor: intg.iconColor + "35" }}>
              <div>
                <div className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: intg.iconColor }}>
                  {TIER_LABELS[intg.tier]} · {TIER_PRICES[intg.tier]}
                </div>
                <p className="text-xs text-muted-foreground">
                  {isLocked
                    ? "Under development — available soon."
                    : isConnected
                      ? "Active and syncing in real time."
                      : "Connect to activate data sync."}
                </p>
              </div>
              {!isLocked ? (
                isConnected ? (
                  <div className="flex gap-2">
                    <div className="flex-1 text-xs font-semibold py-2.5 px-3 rounded-lg border flex items-center justify-center gap-2 text-signal-green border-signal-green/30 bg-signal-green/5">
                      <CheckCircle className="w-3.5 h-3.5" /> Connected
                    </div>
                    <button
                      onClick={() => onDisconnect(intg.id)}
                      className="text-xs py-2.5 px-3 rounded-lg border border-signal-red/30 text-signal-red hover:bg-signal-red/5 transition-all flex items-center gap-1.5"
                    >
                      <X className="w-3.5 h-3.5" /> Disconnect
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={handleConnectClick}
                    disabled={connecting}
                    className="w-full text-xs font-semibold py-2.5 px-3 rounded-lg border transition-all flex items-center justify-center gap-2 disabled:opacity-60"
                    style={{ borderColor: intg.iconColor, color: intg.iconColor, background: intg.iconColor.replace(')', ' / 0.1)') }}
                  >
                    {connecting
                      ? <><div className="w-3.5 h-3.5 border-2 border-current/30 border-t-current rounded-full animate-spin" /> Connecting…</>
                      : <><Plug className="w-3.5 h-3.5" /> Connect {intg.name}</>}
                  </button>
                )
              ) : (
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Lock className="w-3 h-3" /> Join waitlist for early access
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function IntegrationRequestCard() {
  const [name, setName] = useState("");
  const [tool, setTool] = useState("");
  const [sent, setSent] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tool.trim()) return;
    // Persist request locally and show confirmation
    try {
      const existing = JSON.parse(localStorage.getItem("pmo_integration_requests") ?? "[]");
      existing.push({ tool: tool.trim(), name: name.trim(), ts: Date.now() });
      localStorage.setItem("pmo_integration_requests", JSON.stringify(existing));
    } catch {/* silent */}
    setSent(true);
  };

  return (
    <div className="rounded-xl border border-dashed p-6" style={{ borderColor: "hsl(var(--border))" }}>
      {!sent ? (
        <form onSubmit={handleSubmit}>
          <div className="flex items-start gap-3 mb-4">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: "hsl(var(--electric-blue) / 0.10)", border: "1px solid hsl(var(--electric-blue) / 0.20)" }}>
              <Plug className="w-4 h-4 text-electric-blue" />
            </div>
            <div>
              <p className="text-sm font-bold text-foreground">Request an Integration</p>
              <p className="text-xs text-muted-foreground mt-0.5">Tell us what tool you use and we'll prioritize it on the roadmap. You'll receive a personal update when it's ready.</p>
            </div>
          </div>
          <div className="space-y-2.5">
            <input
              ref={inputRef}
              value={tool}
              onChange={e => setTool(e.target.value)}
              placeholder="Tool name (e.g. Notion, Salesforce, Xero…)"
              className="w-full px-3 py-2.5 rounded-lg text-sm bg-background border border-border text-foreground placeholder:text-muted-foreground outline-none focus:border-electric-blue/50 transition-colors"
              required
            />
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Your name (optional)"
              className="w-full px-3 py-2.5 rounded-lg text-sm bg-background border border-border text-foreground placeholder:text-muted-foreground outline-none focus:border-electric-blue/50 transition-colors"
            />
            <button type="submit"
              className="w-full py-2.5 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 transition-all hover:opacity-90"
              style={{ background: "hsl(var(--electric-blue))", color: "#fff" }}>
              <ArrowRight className="w-3.5 h-3.5" /> Submit Request
            </button>
          </div>
        </form>
      ) : (
        <div className="text-center py-4">
          <div className="text-2xl mb-2">🙏</div>
          <p className="text-sm font-bold text-foreground mb-1">Request received — thank you{name ? `, ${name}` : ""}!</p>
          <p className="text-xs text-muted-foreground">We'll personally update you when <span className="font-semibold text-foreground">{tool}</span> is on the roadmap or ready to connect.</p>
          <button onClick={() => { setSent(false); setTool(""); setName(""); }}
            className="mt-3 text-xs text-muted-foreground underline underline-offset-2 hover:text-foreground transition-colors">
            Request another
          </button>
        </div>
      )}
    </div>
  );
}

export default function Integrations() {
  const { data: connections = [] } = useIntegrationConnections();
  const { mutate: upsertIntegration } = useUpsertIntegration();
  const { mutate: removeIntegration } = useRemoveIntegration();

  const connectedIds = new Set(connections.map(c => c.integration_id));
  const allIntegrations = ALL_GROUPS.flatMap(g => g.items);
  const connectedCount  = connections.length;
  const availableCount  = allIntegrations.filter(i => i.status === "available" && !connectedIds.has(i.id)).length;
  const comingSoonCount = allIntegrations.filter(i => i.status === "coming_soon").length;

  function handleConnect(integrationId: string) {
    upsertIntegration({ integrationId, status: "connected" });
  }

  function handleDisconnect(integrationId: string) {
    removeIntegration(integrationId);
  }

  return (
    <div className="min-h-screen bg-background">

      {/* ── Page header ── */}
      <div className="px-4 sm:px-8 pt-6 sm:pt-8 pb-5 sm:pb-6 border-b border-border">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex-1">
            <p className="section-label mb-2">Command Center</p>
            <h1 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">Integrations</h1>
            <p className="text-sm text-muted-foreground mt-1.5 max-w-lg">
              Connect your inbox, calendar, documents, and messaging — AI reads everything and surfaces what matters.
            </p>
          </div>
          <div className="flex items-center gap-4 sm:gap-6 mt-2 sm:mt-0">
            <div>
              <div className="text-xl sm:text-2xl font-black font-mono text-signal-green">{connectedCount}</div>
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Connected</div>
            </div>
            <div className="w-px h-8 bg-border hidden sm:block" />
            <div>
              <div className="text-xl sm:text-2xl font-black font-mono text-electric-blue">{availableCount}</div>
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Available</div>
            </div>
            <div className="w-px h-8 bg-border hidden sm:block" />
            <div>
              <div className="text-xl sm:text-2xl font-black font-mono text-muted-foreground">{comingSoonCount}</div>
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Soon</div>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 sm:px-8 py-5 sm:py-7 space-y-6 sm:space-y-8 max-w-5xl">

        {/* ── AI Inbox banner ── */}
        <div className="rounded-xl border border-electric-blue/25 px-6 py-5 flex gap-5 items-start"
          style={{ background: "hsl(var(--electric-blue) / 0.04)" }}>
          <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: "hsl(var(--electric-blue) / 0.1)", border: "1px solid hsl(var(--electric-blue) / 0.25)" }}>
            <Inbox className="w-5 h-5 text-electric-blue" />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-bold text-foreground mb-1">AI Inbox Intelligence</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Email &amp; WhatsApp → AI reads → extracts tasks → assigns priority → flags risks → adds to your Command Center dashboard.
              Starred messages are always promoted first. Side-by-side snapshot view for quality checks.
            </p>
          </div>
          <div className="flex-shrink-0">
            <span className="text-[10px] font-bold px-2 py-1 rounded" style={{ background: "hsl(var(--signal-yellow) / 0.12)", color: "hsl(var(--signal-yellow))", border: "1px solid hsl(var(--signal-yellow) / 0.3)" }}>
              Tier 1+
            </span>
          </div>
        </div>

        {/* ── Backend notice — Cloud is now active ── */}
        <div className="flex items-start gap-3 px-5 py-4 rounded-xl border border-signal-green/20"
          style={{ background: "hsl(var(--signal-green) / 0.04)" }}>
          <CheckCircle className="w-4 h-4 text-signal-green flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-foreground">Lovable Cloud is active</p>
            <p className="text-xs text-muted-foreground mt-0.5">Your integration connections are persisted in real-time. Connect any service below to activate data sync.</p>
          </div>
          <span className="flex-shrink-0 text-xs font-bold px-2 py-1 rounded text-signal-green border border-signal-green/30">Live</span>
        </div>

        {/* ── Integration groups ── */}
        {ALL_GROUPS.map(group => (
          <div key={group.label}>
            <div className="flex items-center gap-3 mb-3">
              <span className="section-label">{group.label}</span>
              <div className="flex-1 h-px bg-border/60" />
              <span className="text-[10px] text-muted-foreground">{group.items.length} integrations</span>
            </div>
            <div className="divide-y divide-border/50 rounded-xl border border-border overflow-hidden">
              {group.items.map(intg => (
                <IntegrationRow
                  key={intg.id}
                  intg={intg}
                  isConnected={connectedIds.has(intg.id)}
                  onConnect={handleConnect}
                  onDisconnect={handleDisconnect}
                />
              ))}
            </div>
          </div>
        ))}

        {/* ── Request Integration ── */}
        <IntegrationRequestCard />

      </div>
    </div>
  );
}
