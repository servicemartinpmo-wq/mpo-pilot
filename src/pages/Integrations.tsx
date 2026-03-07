import { useState } from "react";
import {
  Plug, CheckCircle, AlertTriangle, Lock, ExternalLink,
  MessageSquare, HardDrive, ClipboardList, DollarSign, Users,
  ArrowRight, Zap, RefreshCw, Settings
} from "lucide-react";
import { cn } from "@/lib/utils";

type IntegrationStatus = "connected" | "available" | "coming_soon";
type IntegrationTier = "t1" | "t2" | "t3";

interface Integration {
  id: string; name: string; category: string; description: string; longDesc: string;
  icon: React.ElementType; color: string; bg: string; status: IntegrationStatus;
  tier: IntegrationTier; features: string[]; badge?: string;
}

const INTEGRATIONS: Integration[] = [
  { id: "slack", name: "Slack", category: "Communication", description: "Send alerts, escalations, and initiative updates directly to Slack channels.", longDesc: "Route critical signals, governance escalations, and initiative status updates to the right Slack channels automatically.", icon: MessageSquare, color: "hsl(262 52% 47%)", bg: "hsl(262 52% 47% / 0.08)", status: "available", tier: "t1", badge: "Ready to Connect", features: ["Send critical alerts to #ops-alerts", "Post initiative status updates weekly", "Escalate governance flags to leadership channels", "Daily digest of blocked tasks and pending actions"] },
  { id: "gdrive", name: "Google Drive", category: "File Management", description: "Store SOPs, templates, and reports directly in your Drive — auto-organized by department.", longDesc: "Sync your Knowledge Repository with Google Drive so documents are automatically organized, versioned, and accessible.", icon: HardDrive, color: "hsl(20 82% 48%)", bg: "hsl(20 82% 48% / 0.08)", status: "available", tier: "t2", badge: "7-Day Free Trial", features: ["Auto-save generated templates to Drive", "Organize SOPs by department folder", "Version control on uploaded documents", "Share reports directly from Command Center"] },
  { id: "asana", name: "Asana", category: "Project Management", description: "Sync initiatives, action items, and workflows bidirectionally with Asana projects.", longDesc: "Push initiatives and action items from the Command Center into Asana and pull status updates back.", icon: ClipboardList, color: "hsl(12 72% 54%)", bg: "hsl(12 72% 54% / 0.08)", status: "coming_soon", tier: "t2", features: ["Sync initiatives as Asana projects", "Map action items to Asana tasks with owners", "Pull status updates back to Command Center", "Map RACI roles to Asana task assignments"] },
  { id: "quickbooks", name: "QuickBooks", category: "Finance", description: "Pull budget actuals, P&L summaries, and variance data into financial dashboards.", longDesc: "Connect QuickBooks to automatically surface budget actuals, variance data, and financial health signals.", icon: DollarSign, color: "hsl(148 60% 38%)", bg: "hsl(148 60% 38% / 0.08)", status: "coming_soon", tier: "t3", features: ["Pull budget actuals vs. plan automatically", "Surface P&L and cash flow signals", "Map financial data to departmental KPIs", "Trigger variance alerts when thresholds breached"] },
  { id: "hris", name: "HRIS", category: "Human Resources", description: "Sync headcount, org chart, and talent pipeline data from Workday, BambooHR, or Rippling.", longDesc: "Connect your HRIS platform to keep headcount, roles, and talent pipeline data current.", icon: Users, color: "hsl(233 65% 62%)", bg: "hsl(233 65% 62% / 0.08)", status: "coming_soon", tier: "t3", features: ["Sync headcount and org chart live", "Surface open role and time-to-fill data", "Track talent pipeline per department", "Trigger alerts for critical role vacancies"] },
];

const TIER_LABELS: Record<IntegrationTier, string> = { t1: "Tier 1", t2: "Tier 2", t3: "Tier 3" };
const TIER_PRICE: Record<IntegrationTier, string> = { t1: "$29.99/mo", t2: "7-Day Free Trial", t3: "$129.99/mo" };
const TIER_COLOR: Record<IntegrationTier, string> = { t1: "hsl(var(--electric-blue))", t2: "hsl(var(--teal))", t3: "hsl(var(--navy))" };
const STATUS_CONFIG = {
  connected: { label: "Connected", icon: CheckCircle, color: "text-signal-green", bg: "bg-signal-green/10" },
  available: { label: "Available", icon: Plug, color: "text-electric-blue", bg: "bg-electric-blue/10" },
  coming_soon: { label: "Coming Soon", icon: Lock, color: "text-muted-foreground", bg: "bg-secondary" },
};

export default function Integrations() {
  const [expanded, setExpanded] = useState<string | null>("slack");
  const connected = INTEGRATIONS.filter(i => i.status === "connected");
  const available = INTEGRATIONS.filter(i => i.status === "available");
  const comingSoon = INTEGRATIONS.filter(i => i.status === "coming_soon");

  return (
    <div className="p-6 space-y-6 max-w-none">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <h1 className="text-2xl font-black text-foreground tracking-tight">Integrations</h1>
          <span className="text-xs px-2 py-0.5 rounded font-semibold" style={{ background: "hsl(var(--electric-blue) / 0.12)", color: "hsl(var(--electric-blue))", border: "1px solid hsl(var(--electric-blue) / 0.3)" }}>BETA</span>
        </div>
        <p className="text-sm text-muted-foreground font-medium">Connect the Command Center to the tools your team already uses.</p>
      </div>
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Connected", value: connected.length, color: "text-signal-green", bg: "bg-signal-green/8 border-signal-green/25" },
          { label: "Available Now", value: available.length, color: "text-electric-blue", bg: "bg-electric-blue/8 border-electric-blue/20" },
          { label: "Coming Soon", value: comingSoon.length, color: "text-muted-foreground", bg: "bg-secondary border-border" },
        ].map(s => (
          <div key={s.label} className={cn("rounded-xl border-2 p-4 text-center", s.bg)}>
            <div className={cn("text-2xl font-bold font-mono", s.color)}>{s.value}</div>
            <div className="text-xs text-muted-foreground mt-0.5 font-medium">{s.label}</div>
          </div>
        ))}
      </div>
      <div className="rounded-xl border-2 px-5 py-4 flex items-start gap-3" style={{ borderColor: "hsl(var(--signal-yellow) / 0.35)", background: "hsl(var(--signal-yellow) / 0.06)" }}>
        <AlertTriangle className="w-4 h-4 text-signal-yellow flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <p className="text-sm font-semibold text-foreground mb-0.5">Backend required for live integrations</p>
          <p className="text-xs text-muted-foreground">Enable Lovable Cloud to activate real-time data sync.</p>
        </div>
        <button className="flex-shrink-0 text-xs font-semibold px-3 py-1.5 rounded-lg border-2 transition-all" style={{ borderColor: "hsl(var(--electric-blue) / 0.4)", color: "hsl(var(--electric-blue))", background: "hsl(var(--electric-blue) / 0.08)" }}>Enable Cloud</button>
      </div>
      <div className="space-y-3">
        {INTEGRATIONS.map(intg => {
          const status = STATUS_CONFIG[intg.status];
          const StatusIcon = status.icon;
          const IntgIcon = intg.icon;
          const isOpen = expanded === intg.id;
          const isComingSoon = intg.status === "coming_soon";
          return (
            <div key={intg.id} className="bg-card rounded-xl border-2 border-border shadow-card overflow-hidden" style={{ opacity: isComingSoon ? 0.7 : 1 }}>
              <button className="w-full px-5 py-4 flex items-center gap-4 text-left hover:bg-secondary/20 transition-colors" onClick={() => setExpanded(isOpen ? null : intg.id)}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 border-2" style={{ background: intg.bg, borderColor: intg.color + "40" }}>
                  <IntgIcon className="w-5 h-5" style={{ color: intg.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-0.5">
                    <span className="text-sm font-semibold text-foreground">{intg.name}</span>
                    <span className="text-xs text-muted-foreground bg-secondary px-1.5 py-0.5 rounded border border-border">{intg.category}</span>
                    {intg.badge && <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: `${TIER_COLOR[intg.tier]}18`, color: TIER_COLOR[intg.tier], border: `1px solid ${TIER_COLOR[intg.tier]}40` }}>{intg.badge}</span>}
                  </div>
                  <p className="text-xs text-muted-foreground truncate">{intg.description}</p>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <div className={cn("flex items-center gap-1.5 text-xs font-semibold px-2 py-1 rounded-lg", status.bg, status.color)}>
                    <StatusIcon className="w-3 h-3" />{status.label}
                  </div>
                  <span className="text-xs font-semibold" style={{ color: TIER_COLOR[intg.tier] }}>{TIER_LABELS[intg.tier]}</span>
                  <ArrowRight className={cn("w-4 h-4 text-muted-foreground transition-transform", isOpen && "rotate-90")} />
                </div>
              </button>
              {isOpen && (
                <div className="px-5 pb-5 border-t border-border pt-4 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-foreground/80 leading-relaxed mb-3">{intg.longDesc}</p>
                      <ul className="space-y-1.5">{intg.features.map(f => (<li key={f} className="flex items-start gap-2 text-xs text-muted-foreground"><Zap className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" style={{ color: intg.color }} />{f}</li>))}</ul>
                    </div>
                    <div className="rounded-xl border-2 p-4 flex flex-col gap-3" style={{ borderColor: intg.color + "35", background: intg.bg }}>
                      <div>
                        <span className="text-xs font-bold uppercase tracking-wider" style={{ color: intg.color }}>{TIER_LABELS[intg.tier]} · {TIER_PRICE[intg.tier]}</span>
                        <p className="text-xs text-muted-foreground mt-0.5">{isComingSoon ? "Under development — available soon." : intg.status === "connected" ? "Active and syncing." : "Connect to activate real-time sync."}</p>
                      </div>
                      {!isComingSoon ? (
                        <button className="w-full text-xs font-semibold py-2.5 px-3 rounded-lg border-2 transition-all flex items-center justify-center gap-2" style={{ borderColor: intg.color, color: intg.color, background: `${intg.color.replace(')', ' / 0.1)')}` }}>
                          {intg.status === "connected" ? <><RefreshCw className="w-3.5 h-3.5" /> Manage</> : <><Plug className="w-3.5 h-3.5" /> Connect {intg.name}</>}
                        </button>
                      ) : (
                        <div className="flex items-center gap-2 text-xs text-muted-foreground"><Lock className="w-3.5 h-3.5" />Join waitlist for early access</div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
      <div className="rounded-xl border-2 border-dashed p-5 text-center" style={{ borderColor: "hsl(var(--border))" }}>
        <Settings className="w-5 h-5 mx-auto mb-2 text-muted-foreground opacity-40" />
        <p className="text-sm font-semibold text-foreground mb-1">More integrations coming</p>
        <p className="text-xs text-muted-foreground">G-Suite, Microsoft 365, WhatsApp Business, Notion, Jira, HubSpot — built on your feedback.</p>
      </div>
    </div>
  );
}
