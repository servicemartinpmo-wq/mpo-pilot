/**
 * Systems — Operational nerve center: analytics, delegation matrix, signal detection, quality control, roles & access
 */
import { frameworks, departments, orgMetrics, orgProfile, authorityMatrix, sopRecords, actionItems, governanceLogs } from "@/lib/pmoData";
import { loadProfile, saveProfile, applyAccentColor, applyFont, resetOnboarding } from "@/lib/companyStore";
import type { CompanyProfile } from "@/lib/companyStore";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { BANNER_THEMES } from "@/components/PageBanner";
import { BusinessMode, MODE_KITS } from "@/pages/Knowledge";
import {
  RINGTONE_STYLES, previewRingtone, requestNotificationPermission,
  getNotificationPermission, type RingtoneStyle
} from "@/lib/notificationSound";
import {
  Settings, Database, Cpu, Users, FileText, Shield, Building2,
  AlertTriangle, CheckCircle, Clock, Target, GitBranch, BarChart3,
  Activity, TrendingUp, TrendingDown, Minus, ChevronDown, Zap,
  UserCheck, Lock, ArrowUpRight, RefreshCw, Bell, Layout, Check, FlaskConical,
  PlayCircle, Volume2, SlidersHorizontal, Globe, Linkedin, Link2,
} from "lucide-react";
import {
  loadCRMSettings, saveCRMSettings,
  SOURCE_CHANNEL_META, CONFIDENCE_META,
  type CRMSettings, type SourceChannel, type Confidence,
} from "@/lib/crmConfig";

function Block({ title, icon: Icon, children, badge, accent }: {
  title: string; icon: React.ElementType; children: React.ReactNode;
  badge?: React.ReactNode; accent?: "blue" | "teal" | "green" | "yellow" | "red";
}) {
  const accentColor = {
    blue: "hsl(var(--electric-blue))", teal: "hsl(var(--teal))",
    green: "hsl(var(--signal-green))", yellow: "hsl(var(--signal-yellow))", red: "hsl(var(--signal-red))"
  }[accent || "blue"];
  return (
    <div className="bg-card rounded-2xl border-2 border-border shadow-card overflow-hidden">
      <div className="px-5 py-4 border-b-2 border-border flex items-center gap-3"
        style={{ background: "hsl(var(--secondary))" }}>
        <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: `${accentColor}18` }}>
          <Icon className="w-4 h-4" style={{ color: accentColor }} />
        </div>
        <h2 className="text-sm font-bold text-foreground uppercase tracking-wide flex-1">{title}</h2>
        {badge && <div>{badge}</div>}
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

export default function Admin() {
  const [activeTab, setActiveTab] = useState<"system" | "org" | "frameworks" | "authority" | "sops" | "access" | "customize" | "banner" | "crm">("system");
  const [crmSettings, setCrmSettings] = useState<CRMSettings>(() => loadCRMSettings());

  function updateCrm(patch: Partial<CRMSettings>) {
    const next = { ...crmSettings, ...patch };
    setCrmSettings(next);
    saveCRMSettings(next);
  }
  const [bannerTheme, setBannerTheme] = useState(
    typeof window !== "undefined" ? (localStorage.getItem("apphia_banner_theme") || "deep-space") : "deep-space"
  )
  const HERO_PHOTOS = [
    { src: "/banner-tiger.png",    label: "Tiger",          category: "Wildlife" },
    { src: "/banner-mountain.png", label: "Mountain Range", category: "Nature" },
    { src: "/banner-city.png",     label: "City Skyline",   category: "Urban" },
    { src: "/banner-fields.png",   label: "Tuscan Fields",  category: "Nature" },
    { src: "/banner-hex.png",      label: "Dark Hex Grid",  category: "Abstract" },
    { src: "/banner-art.png",      label: "Bold Brushwork", category: "Creative" },
    { src: "/banner-space.png",    label: "Deep Space",     category: "Cosmos" },
  ];
  const [heroPhoto, setHeroPhoto] = useState(() => {
    const saved = typeof window !== "undefined" ? parseInt(localStorage.getItem("apphia_hero_photo") ?? "") : NaN;
    return isNaN(saved) || saved >= HERO_PHOTOS.length ? 0 : saved;
  });
  const changeHeroPhoto = (i: number) => {
    setHeroPhoto(i);
    localStorage.setItem("apphia_hero_photo", String(i));
  };
  const resetHeroPhoto = () => {
    setHeroPhoto(0);
    localStorage.removeItem("apphia_hero_photo");
  };
  const [companyProfile, setCompanyProfile] = useState<CompanyProfile>(loadProfile());
  const [expandedRole, setExpandedRole] = useState<string | null>(null);
  const [businessMode, setBusinessMode] = useState<BusinessMode | null>(() => {
    const saved = typeof window !== "undefined" ? localStorage.getItem("apphia_knowledge_mode") : null;
    return (saved as BusinessMode) || null;
  });
  const [ringtone, setRingtone] = useState<RingtoneStyle>(() => {
    const saved = typeof window !== "undefined" ? localStorage.getItem("apphia_ringtone") : null;
    return (saved as RingtoneStyle) || "default";
  });
  const [notifPerm, setNotifPerm] = useState<NotificationPermission>(getNotificationPermission);

  useEffect(() => {
    localStorage.setItem("apphia_ringtone", ringtone);
  }, [ringtone]);

  async function enablePushNotifications() {
    const granted = await requestNotificationPermission();
    setNotifPerm(granted ? "granted" : "denied");
  }

  function saveCustomize() {
    saveProfile(companyProfile);
    applyAccentColor(companyProfile.accentHue);
    applyFont(companyProfile.font);
  }

  const pendingActions = actionItems.filter(a => a.status !== "Completed").length;
  const openGovItems = governanceLogs.filter(g => g.status !== "Resolved").length;

  const TABS = [
    { key: "system", label: "System" },
    { key: "org", label: "Org Profile" },
    { key: "frameworks", label: "Analysis Modules" },
    { key: "authority", label: "Authority Matrix" },
    { key: "sops", label: "SOP Library" },
    { key: "access", label: "Access & Roles" },
    { key: "customize", label: "Customize" },
    { key: "banner", label: "Banner & Theme" },
    { key: "crm", label: "CRM Settings" },
  ] as const;

  const signalMetrics = [
    { label: "Overall Maturity", value: `${orgMetrics.overallMaturityScore}`, unit: "/100", trend: "up" as const, signal: orgMetrics.overallMaturityScore >= 70 ? "green" : "yellow" },
    { label: "Active Initiatives", value: `${orgMetrics.activeInitiatives}`, unit: "", trend: "flat" as const, signal: "blue" },
    { label: "Avg: SOP Adherence", value: `${orgMetrics.avgSopAdherence}`, unit: "%", trend: "down" as const, signal: "yellow" },
    { label: "Execution Health", value: `${orgMetrics.avgExecutionHealth}`, unit: "%", trend: "up" as const, signal: "green" },
    { label: "Governance Open", value: `${orgMetrics.governanceOpenItems}`, unit: "", trend: "up" as const, signal: "red" },
    { label: "Blocked Tasks", value: `${orgMetrics.blockedTasks}`, unit: "", trend: "flat" as const, signal: "yellow" },
    { label: "Budget Deployed", value: `${Math.round((orgMetrics.totalBudgetUsed / orgMetrics.totalBudgetAllocated) * 100)}`, unit: "%", trend: "up" as const, signal: "yellow" },
    { label: "Total Headcount", value: `${orgMetrics.totalHeadcount}`, unit: "", trend: "flat" as const, signal: "blue" },
  ];

  return (
    <div className="p-6 space-y-6 max-w-none">

      {/* ── Header ── */}
      <div className="relative flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-black text-foreground mb-1 tracking-tight">Systems</h1>
          <p className="text-sm text-muted-foreground font-medium">
            Operational nerve center · Analytics · Authority Matrix · Signal Detection · Quality Control
          </p>
        </div>
        <div className="absolute right-0 flex gap-2 text-xs">
          <span className="bg-signal-yellow/10 text-signal-yellow border border-signal-yellow/30 px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />{pendingActions} Pending
          </span>
          <span className="bg-signal-red/10 text-signal-red border border-signal-red/30 px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5" />{openGovItems} Governance
          </span>
        </div>
      </div>

      {/* ── System health summary ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Analytics Engine", status: "Operational", icon: Cpu, sig: "green" as const },
          { label: "Data Layer", status: "Synced · 2 min ago", icon: Database, sig: "green" as const },
          { label: "Analysis Modules", status: "7/7 Active", icon: Shield, sig: "green" as const },
          { label: "Signal Detection", status: "Live", icon: Activity, sig: "blue" as const },
        ].map(({ label, status, icon: Icon, sig }) => {
          const sigColor = { green: "text-signal-green", blue: "text-electric-blue", yellow: "text-signal-yellow", red: "text-signal-red" }[sig];
          const sigBg = { green: "hsl(var(--signal-green))", blue: "hsl(var(--electric-blue))", yellow: "hsl(var(--signal-yellow))", red: "hsl(var(--signal-red))" }[sig];
          return (
            <div key={label} className="bg-card rounded-xl border-2 border-border shadow-card p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${sigBg}18` }}>
                  <Icon className="w-4 h-4" style={{ color: sigBg }} />
                </div>
                <div className="w-2 h-2 rounded-full" style={{ background: sigBg }} />
              </div>
              <div className="text-sm font-bold text-foreground">{label}</div>
              <div className={cn("text-xs font-semibold mt-0.5", sigColor)}>{status}</div>
            </div>
          );
        })}
      </div>

      {/* ── Tab nav ── */}
      <div className="flex flex-wrap gap-0 border-b-2 border-border">
        {TABS.map(({ key, label }) => (
          <button key={key} onClick={() => setActiveTab(key)}
            className={cn("text-sm px-5 py-3 font-semibold transition-all border-b-2 -mb-0.5",
              activeTab === key
                ? "border-electric-blue text-electric-blue"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}>
            {label}
          </button>
        ))}
      </div>

      {/* ═══ SYSTEM TAB ═══ */}
      {activeTab === "system" && (
        <div className="space-y-5">

          {/* Analytics Intelligence Snapshot */}
          <Block title="Operational Intelligence Snapshot" icon={BarChart3} accent="blue">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {signalMetrics.map(({ label, value, unit, trend, signal }) => {
                const sigColor = { green: "text-signal-green", blue: "text-electric-blue", yellow: "text-signal-yellow", red: "text-signal-red" }[signal];
                const TrendIcon = trend === "up" ? TrendingUp : trend === "down" ? TrendingDown : Minus;
                const trendColor = trend === "up" ? "text-signal-green" : trend === "down" ? "text-signal-red" : "text-muted-foreground";
                return (
                  <div key={label} className="rounded-xl border border-border p-3.5 hover:shadow-card transition-shadow cursor-pointer group">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-muted-foreground font-medium">{label}</span>
                      <TrendIcon className={cn("w-3.5 h-3.5", trendColor)} />
                    </div>
                    <div className={cn("text-2xl font-black font-mono", sigColor)}>
                      {value}<span className="text-sm font-normal text-muted-foreground">{unit}</span>
                    </div>
                    <div className="mt-2 h-1 rounded-full bg-secondary overflow-hidden">
                      <div className="h-full rounded-full" style={{
                        width: `${Math.min(parseInt(value), 100)}%`,
                        background: { green: "hsl(var(--signal-green))", blue: "hsl(var(--electric-blue))", yellow: "hsl(var(--signal-yellow))", red: "hsl(var(--signal-red))" }[signal]
                      }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </Block>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">

            {/* Data input layer */}
            <Block title="Data Input Layer" icon={Database} accent="teal">
              <div className="space-y-1.5">
                {[
                  { label: "Initiatives Register", records: 10, lastSync: "2 min ago", status: "ok" },
                  { label: "Department Data", records: 14, lastSync: "2 min ago", status: "ok" },
                  { label: "Action Items", records: actionItems.length, lastSync: "5 min ago", status: "ok" },
                  { label: "Governance Logs", records: governanceLogs.length, lastSync: "3 min ago", status: "ok" },
                  { label: "SOPs & Procedures", records: sopRecords.length, lastSync: "1 hr ago", status: "warning" },
                  { label: "Authority Matrix", records: authorityMatrix.length, lastSync: "1 hr ago", status: "ok" },
                  { label: "Budget & Finance", records: 9, lastSync: "15 min ago", status: "ok" },
                  { label: "Goals Tracking", records: 32, lastSync: "30 min ago", status: "ok" },
                ].map(({ label, records, lastSync, status }) => (
                  <div key={label} className="flex items-center gap-3 py-2 border-b border-border last:border-0">
                    <FileText className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-foreground">{label}</div>
                      <div className="text-xs text-muted-foreground">{records} records · {lastSync}</div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className={cn("text-xs font-semibold", status === "ok" ? "text-signal-green" : "text-signal-yellow")}>
                        {status === "ok" ? "Synced" : "Review"}
                      </span>
                      <span className={cn("w-2 h-2 rounded-full", status === "ok" ? "bg-signal-green" : "bg-signal-yellow")} />
                    </div>
                  </div>
                ))}
              </div>
            </Block>

            {/* System Audit Log */}
            <Block title="System Audit Log" icon={Clock} accent="yellow">
              <div className="space-y-0 font-mono text-xs">
                {[
                  { time: "14:02", date: "03-07", msg: "Signal triggered: Capacity Constraint — Program Delivery (Score: 94)", level: "red" },
                  { time: "13:48", date: "03-07", msg: "Balanced Scorecard: Strategic Misalignment — Marketing OKR", level: "red" },
                  { time: "13:21", date: "03-07", msg: "Dependency bottleneck escalated: INI-002 blocked 19 days", level: "yellow" },
                  { time: "12:15", date: "03-07", msg: "Advisory generated: Sales pipeline velocity decline", level: "yellow" },
                  { time: "11:40", date: "03-07", msg: "Department sync: 14 departments refreshed", level: "green" },
                  { time: "10:30", date: "03-07", msg: "TOC activated: Program Delivery bottleneck", level: "blue" },
                  { time: "09:00", date: "03-07", msg: "Daily analysis: 8 insights generated", level: "green" },
                  { time: "17:22", date: "03-06", msg: "Gov log escalated: API Dependency SLA Breach", level: "red" },
                  { time: "09:00", date: "03-06", msg: "SOP scan: 3 departments below 70% threshold", level: "yellow" },
                ].map(({ time, date, msg, level }) => (
                  <div key={time + msg} className="flex items-start gap-3 py-2 border-b border-border/50 last:border-0">
                    <span className="text-muted-foreground flex-shrink-0 w-14">{date} {time}</span>
                    <span className={cn(
                      "leading-relaxed",
                      level === "red" ? "text-signal-red" :
                      level === "yellow" ? "text-signal-yellow" :
                      level === "green" ? "text-signal-green" :
                      "text-electric-blue"
                    )}>
                      {msg}
                    </span>
                  </div>
                ))}
              </div>
            </Block>

            {/* Decision Deadlines */}
            <Block title="Decision Deadlines" icon={Target} accent="red"
              badge={<span className="text-xs text-signal-red bg-signal-red/10 px-2 py-1 rounded-lg font-bold border border-signal-red/25">{orgMetrics.decisionDeadlines} pending</span>}>
              <div className="space-y-3">
                {[
                  { title: "Cloud Migration Scope", deadline: "2025-03-10", owner: "Sarah Chen", urgency: "red", type: "Board Decision" },
                  { title: "Marketing Budget Reallocation", deadline: "2025-03-14", owner: "Elena Vasquez", urgency: "yellow", type: "CFO Approval" },
                  { title: "Tiered Approval Authority Policy", deadline: "2025-03-18", owner: "David Kim", urgency: "yellow", type: "Legal Sign-Off" },
                ].map(item => (
                  <div key={item.title} className="flex items-start gap-3 p-3.5 rounded-xl bg-secondary border border-border hover:shadow-card transition-shadow cursor-pointer">
                    <div className={cn("w-2.5 h-2.5 rounded-full mt-1 flex-shrink-0",
                      item.urgency === "red" ? "bg-signal-red animate-pulse" : "bg-signal-yellow"
                    )} />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-foreground">{item.title}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">{item.type} · {item.owner}</div>
                    </div>
                    <span className="text-xs font-mono font-bold text-muted-foreground flex-shrink-0">{item.deadline}</span>
                  </div>
                ))}
              </div>
            </Block>

            {/* Quality Control */}
            <Block title="Quality Control" icon={Shield} accent="green">
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: "SOP Coverage", val: orgMetrics.sopCoverage, color: "hsl(var(--teal))" },
                    { label: "Avg Adherence", val: orgMetrics.avgSopAdherence, color: "hsl(var(--signal-yellow))" },
                    { label: "Governance Open", val: orgMetrics.governanceOpenItems, color: "hsl(var(--signal-red))", isCount: true },
                  ].map(({ label, val, color, isCount }) => (
                    <div key={label} className="text-center p-3 rounded-xl bg-secondary border border-border">
                      <div className="text-2xl font-black font-mono" style={{ color }}>{val}{!isCount && "%"}</div>
                      <div className="text-xs text-muted-foreground mt-0.5 font-medium">{label}</div>
                    </div>
                  ))}
                </div>
                <div className="space-y-2">
                  {[
                    { label: "SOPs reviewed this quarter", val: 8, total: 12, sig: "yellow" },
                    { label: "Departments at target adherence", val: 9, total: 14, sig: "green" },
                    { label: "Governance logs resolved", val: 5, total: 9, sig: "blue" },
                  ].map(({ label, val, total, sig }) => {
                    const pct = Math.round((val / total) * 100);
                    const sigColor = { green: "hsl(var(--signal-green))", blue: "hsl(var(--electric-blue))", yellow: "hsl(var(--signal-yellow))" }[sig] || "hsl(var(--electric-blue))";
                    return (
                      <div key={label}>
                        <div className="flex justify-between text-xs mb-1.5">
                          <span className="text-foreground font-medium">{label}</span>
                          <span className="font-mono font-bold text-foreground">{val}/{total}</span>
                        </div>
                        <div className="h-2 rounded-full bg-secondary overflow-hidden border border-border">
                          <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: sigColor }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </Block>
          </div>
        </div>
      )}

      {/* ═══ ORG PROFILE TAB ═══ */}
      {activeTab === "org" && (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
          <Block title="Organization Profile" icon={Building2} accent="blue">
            <div className="space-y-4">
              {[
                { label: "Organization Name", value: orgProfile.name },
                { label: "Org Type", value: orgProfile.orgType },
                { label: "Revenue Range", value: orgProfile.revenueRange },
              ].map(({ label, value }) => (
                <div key={label}>
                  <div className="text-xs text-muted-foreground mb-0.5 font-medium">{label}</div>
                  <div className="text-sm font-bold text-foreground">{value}</div>
                </div>
              ))}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-secondary rounded-xl p-3 text-center border border-border">
                  <div className="text-2xl font-black font-mono text-foreground">{orgProfile.teamSize}</div>
                  <div className="text-xs text-muted-foreground font-medium">Team Size</div>
                </div>
                <div className="bg-secondary rounded-xl p-3 text-center border border-border">
                  <div className="text-2xl font-black font-mono text-foreground">{orgProfile.departments.length}</div>
                  <div className="text-xs text-muted-foreground font-medium">Departments</div>
                </div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground mb-1.5 font-medium">Mission</div>
                <p className="text-sm text-foreground/80 leading-relaxed">{orgProfile.mission}</p>
              </div>
            </div>
          </Block>

          <Block title="Strategic Pillars" icon={Target} accent="teal">
            <div className="space-y-2.5">
              {orgProfile.strategicPillars.map((pillar, i) => {
                const colors = ["hsl(var(--electric-blue))", "hsl(var(--teal))", "hsl(var(--signal-green))", "hsl(var(--signal-yellow))", "hsl(var(--signal-purple))"];
                return (
                  <div key={pillar} className="flex items-center gap-3.5 p-3.5 bg-secondary rounded-xl border border-border hover:shadow-card transition-shadow cursor-pointer">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black text-white flex-shrink-0"
                      style={{ background: colors[i] }}>
                      {i + 1}
                    </div>
                    <span className="text-sm font-semibold text-foreground flex-1">{pillar}</span>
                    <ArrowUpRight className="w-3.5 h-3.5 text-muted-foreground opacity-40" />
                  </div>
                );
              })}
            </div>
          </Block>

          <Block title="Department Registry" icon={Building2} accent="green">
            <div className="space-y-1.5">
              {departments.map(dept => (
                <div key={dept.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-semibold text-foreground truncate">{dept.name}</div>
                    <div className="text-xs text-muted-foreground">{dept.head} · {dept.headcount} FTE</div>
                  </div>
                  <div className="flex items-center gap-2 ml-3">
                    <span className="text-xs font-mono text-muted-foreground">{dept.activeInitiatives} init.</span>
                    <span className={cn("text-xs px-1.5 py-0.5 rounded font-bold",
                      dept.sopAdherence >= 80 ? "text-signal-green bg-signal-green/10" :
                      dept.sopAdherence >= 60 ? "text-signal-yellow bg-signal-yellow/10" :
                      "text-signal-red bg-signal-red/10"
                    )}>{dept.sopAdherence}%</span>
                  </div>
                </div>
              ))}
            </div>
          </Block>
        </div>
      )}

      {/* ═══ FRAMEWORKS TAB ═══ */}
      {activeTab === "frameworks" && (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
          {frameworks.map(fw => (
            <div key={fw.id} className="bg-card rounded-xl border-2 border-border shadow-card p-5 hover:shadow-elevated transition-shadow">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex-1">
                  <div className="text-sm font-bold text-foreground">{fw.name}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">{fw.expertDomain}</div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className={cn("text-xs px-2 py-0.5 rounded-full font-bold",
                    fw.status === "Alerting" ? "bg-signal-red/10 text-signal-red" :
                    fw.status === "Monitoring" ? "bg-signal-yellow/10 text-signal-yellow" :
                    "bg-signal-green/10 text-signal-green"
                  )}>{fw.status}</span>
                  <div className="w-10 h-5 rounded-full flex items-center justify-end pr-0.5 cursor-pointer"
                    style={{ background: "hsl(var(--electric-blue) / 0.2)" }}>
                    <div className="w-4 h-4 rounded-full" style={{ background: "hsl(var(--electric-blue))" }} />
                  </div>
                </div>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed mb-3">{fw.description}</p>
              <div className="flex flex-wrap gap-1.5 mb-3">
                {fw.coverage.map(c => (
                  <span key={c} className="text-xs bg-secondary text-muted-foreground px-2 py-0.5 rounded-lg border border-border font-medium">{c}</span>
                ))}
              </div>
              <div className="flex items-center justify-between text-xs text-muted-foreground border-t border-border pt-3">
                <span><span className="font-bold text-foreground">{fw.activeInsights}</span> active insights</span>
                <span>Last triggered: {fw.lastTriggered}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ═══ AUTHORITY MATRIX TAB ═══ */}
      {activeTab === "authority" && (
        <Block title="Authority Matrix" icon={UserCheck} accent="blue">
          <div className="space-y-2">
            {authorityMatrix.map(entry => {
              const isExpanded = expandedRole === entry.role;
              const levelColors = { L1: "text-electric-blue bg-electric-blue/10", L2: "text-teal bg-teal/10", L3: "text-signal-green bg-signal-green/10", L4: "text-muted-foreground bg-secondary" };
              return (
                <div key={entry.role} className="rounded-xl border-2 border-border overflow-hidden">
                  <button className="w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-secondary/30 transition-colors"
                    onClick={() => setExpandedRole(isExpanded ? null : entry.role)}>
                    <div className={cn("text-xs font-bold px-2 py-0.5 rounded font-mono flex-shrink-0", levelColors[entry.level])}>
                      {entry.level}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-bold text-foreground">{entry.person}</div>
                      <div className="text-xs text-muted-foreground">{entry.role} · {entry.department}</div>
                    </div>
                    <ChevronDown className={cn("w-4 h-4 text-muted-foreground transition-transform", isExpanded && "rotate-180")} />
                  </button>
                  {isExpanded && (
                    <div className="px-4 pb-4 border-t border-border"
                      style={{ background: "hsl(var(--secondary) / 0.4)" }}>
                      <div className="pt-3 grid grid-cols-2 md:grid-cols-4 gap-3">
                        {[
                          { label: "Budget Authority", value: entry.budgetAuthority },
                          { label: "Hiring Authority", value: entry.hiringAuthority },
                          { label: "Initiative Approval", value: entry.initiativeApproval },
                          { label: "Risk Approval", value: entry.riskApproval },
                        ].map(({ label, value }) => (
                          <div key={label} className="bg-card rounded-lg p-3 border border-border">
                            <div className="text-xs text-muted-foreground mb-1 font-medium">{label}</div>
                            <div className="text-xs font-bold text-foreground">{value}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </Block>
      )}

      {/* ═══ SOP LIBRARY TAB ═══ */}
      {activeTab === "sops" && (
        <Block title="SOP Library" icon={FileText} accent="teal">
          <div className="space-y-2">
            {sopRecords.map(sop => (
              <div key={sop.id} className="flex items-center gap-3 p-3.5 rounded-xl border border-border hover:bg-secondary/30 transition-colors cursor-pointer">
                <div className={cn("w-2 h-2 rounded-full flex-shrink-0",
                  sop.status === "Active" ? "bg-signal-green" :
                  sop.status === "Under Review" ? "bg-signal-yellow" : "bg-signal-red"
                )} />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-foreground truncate">{sop.title}</div>
                  <div className="text-xs text-muted-foreground">{sop.department} · {sop.owner} · v{sop.version}</div>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0 text-xs">
                  <span className={cn("font-bold",
                    sop.adherenceRate >= 80 ? "text-signal-green" :
                    sop.adherenceRate >= 60 ? "text-signal-yellow" : "text-signal-red"
                  )}>{sop.adherenceRate}%</span>
                  <span className={cn("px-2 py-0.5 rounded-full font-semibold",
                    sop.status === "Active" ? "bg-signal-green/10 text-signal-green" :
                    sop.status === "Under Review" ? "bg-signal-yellow/10 text-signal-yellow" :
                    "bg-signal-red/10 text-signal-red"
                  )}>{sop.status}</span>
                </div>
              </div>
            ))}
          </div>
        </Block>
      )}

      {/* ═══ ACCESS & ROLES TAB ═══ */}
      {activeTab === "access" && (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
          <Block title="Roles & Access Management" icon={Shield} accent="blue">
            <div className="space-y-3">
              {[
                { role: "Command Center Admin", desc: "Full access — configure, customize, reset onboarding", count: 1, color: "text-electric-blue bg-electric-blue/10" },
                { role: "Executive Viewer", desc: "Read-only dashboard and reports access", count: 3, color: "text-teal bg-teal/10" },
                { role: "Department Manager", desc: "Manage own department data and action items", count: 8, color: "text-signal-green bg-signal-green/10" },
                { role: "Contributor", desc: "Submit action items, update task status", count: 12, color: "text-signal-yellow bg-signal-yellow/10" },
                { role: "Observer", desc: "Read-only access to non-confidential views", count: 0, color: "text-muted-foreground bg-secondary" },
              ].map(({ role, desc, count, color }) => (
                <div key={role} className="flex items-center gap-3 p-3.5 rounded-xl border border-border hover:shadow-card transition-shadow">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className={cn("text-xs font-bold px-2 py-0.5 rounded-full", color)}>{role}</span>
                    </div>
                    <div className="text-xs text-muted-foreground">{desc}</div>
                  </div>
                  <div className="text-sm font-bold font-mono text-foreground flex-shrink-0">{count}</div>
                </div>
              ))}
              <button className="w-full text-xs text-electric-blue text-center py-2.5 border border-dashed rounded-xl border-electric-blue/30 hover:bg-electric-blue/5 transition-colors font-semibold">
                + Invite Team Member
              </button>
            </div>
          </Block>

          <Block title="Subscription & Tier" icon={Zap} accent="teal">
            <div className="space-y-4">
              <div className="rounded-xl border-2 border-electric-blue/25 p-4"
                style={{ background: "hsl(var(--electric-blue) / 0.05)" }}>
                <div className="text-xs font-bold text-electric-blue uppercase tracking-wide mb-1">Current Plan</div>
                <div className="text-2xl font-black text-foreground">Free</div>
                <p className="text-xs text-muted-foreground mt-1">Personal Command View · 1 user · 3 projects</p>
              </div>
              <div className="space-y-2">
                {[
                  { label: "Workflow builder & SOP automation", tier: "Tier 2", locked: true },
                  { label: "G-Suite & Microsoft integrations", tier: "Tier 1", locked: true },
                  { label: "AI inbox intelligence", tier: "Tier 3", locked: true },
                  { label: "Custom reporting & exports", tier: "Tier 1", locked: true },
                ].map(({ label, tier, locked }) => (
                  <div key={label} className="flex items-center gap-2 text-xs">
                    <Lock className="w-3.5 h-3.5 text-muted-foreground" />
                    <span className="text-muted-foreground flex-1">{label}</span>
                    <span className="font-bold text-muted-foreground">{tier}</span>
                  </div>
                ))}
              </div>
              <button className="w-full text-sm font-bold py-3 px-4 rounded-xl border-2 border-electric-blue text-electric-blue hover:bg-electric-blue/10 transition-colors">
                View Upgrade Options →
              </button>
            </div>
          </Block>
        </div>
      )}

      {/* ═══ CUSTOMIZE TAB ═══ */}
      {activeTab === "customize" && (
        <Block title="Customize Command Center" icon={Settings} accent="blue">
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                {[
                  { label: "User Name", key: "userName" as keyof CompanyProfile, type: "text" },
                  { label: "Organization Name", key: "orgName" as keyof CompanyProfile, type: "text" },
                  { label: "Industry", key: "industry" as keyof CompanyProfile, type: "text" },
                ].map(({ label, key, type }) => (
                  <div key={key}>
                    <label className="text-xs font-bold text-foreground uppercase tracking-wide mb-2 block">{label}</label>
                    <input type={type} value={String(companyProfile[key] || "")}
                      onChange={e => setCompanyProfile({ ...companyProfile, [key]: e.target.value })}
                      className="w-full px-3 py-2.5 text-sm rounded-xl border-2 bg-card text-foreground focus:outline-none transition-all"
                      style={{ borderColor: "hsl(var(--border))" }} />
                  </div>
                ))}
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-foreground uppercase tracking-wide mb-2 block">Accent Hue ({companyProfile.accentHue}°)</label>
                  <input type="range" min="0" max="360" value={companyProfile.accentHue}
                    onChange={e => setCompanyProfile({ ...companyProfile, accentHue: parseInt(e.target.value) })}
                    className="w-full" />
                </div>
                <button onClick={saveCustomize}
                  className="w-full text-sm font-bold py-3 px-4 rounded-xl border-2 border-electric-blue text-electric-blue hover:bg-electric-blue/10 transition-colors">
                  Save Changes
                </button>
                <button onClick={() => { if (confirm("Reset onboarding? This will restart the setup wizard.")) { resetOnboarding(); window.location.reload(); } }}
                  className="w-full text-sm font-semibold py-2.5 px-4 rounded-xl border border-border text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors">
                  Reset Onboarding
                </button>
              </div>
            </div>

            {/* ── Business Mode + Experience Style ── */}
            <div className="pt-4 border-t" style={{ borderColor: "hsl(var(--border))" }}>
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-bold text-foreground uppercase tracking-wide">Resource Hub Mode</p>
                {businessMode && (
                  <span className="text-[10px] text-muted-foreground italic">Click active mode to deselect</span>
                )}
              </div>

              <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60 mb-2">Business Type</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
                {(["freelance", "startup", "smb", "enterprise"] as BusinessMode[]).map(key => {
                  const kit = MODE_KITS[key];
                  const active = businessMode === key;
                  return (
                    <button key={key}
                      onClick={() => {
                        const next = active ? null : key;
                        setBusinessMode(next);
                        if (next) localStorage.setItem("apphia_knowledge_mode", next);
                        else localStorage.removeItem("apphia_knowledge_mode");
                      }}
                      className="rounded-xl p-3 border-2 text-left transition-all hover:opacity-90 active:scale-[0.98]"
                      style={{ background: active ? kit.bg : "transparent", borderColor: active ? kit.color : "hsl(var(--border))" }}>
                      <div className="text-lg mb-1">{kit.emoji}</div>
                      <div className="text-xs font-bold text-foreground mb-0.5">{kit.label}</div>
                      <div className="text-[10px] text-muted-foreground leading-snug">{kit.tagline}</div>
                    </button>
                  );
                })}
              </div>

              <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60 mb-2">Experience Style</p>
              <div className="grid grid-cols-2 gap-2">
                {(["creative", "guided"] as BusinessMode[]).map(key => {
                  const kit = MODE_KITS[key];
                  const active = businessMode === key;
                  return (
                    <button key={key}
                      onClick={() => {
                        const next = active ? null : key;
                        setBusinessMode(next);
                        if (next) localStorage.setItem("apphia_knowledge_mode", next);
                        else localStorage.removeItem("apphia_knowledge_mode");
                      }}
                      className="rounded-xl p-3 border-2 text-left transition-all hover:opacity-90 active:scale-[0.98]"
                      style={{ background: active ? kit.bg : "transparent", borderColor: active ? kit.color : "hsl(var(--border))" }}>
                      <div className="text-lg mb-1">{kit.emoji}</div>
                      <div className="text-xs font-bold text-foreground mb-0.5">{kit.label}</div>
                      <div className="text-[10px] text-muted-foreground leading-snug">{kit.tagline}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* ── Notification Sound Settings ── */}
            <div className="pt-4 border-t" style={{ borderColor: "hsl(var(--border))" }}>
              <div className="flex items-center gap-2 mb-3">
                <Volume2 className="w-3.5 h-3.5 text-muted-foreground" />
                <p className="text-xs font-bold text-foreground uppercase tracking-wide">Notification Sound</p>
              </div>
              <p className="text-[11px] text-muted-foreground mb-3">Choose the ringtone style played for alerts, wins, and pings.</p>
              <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 mb-4">
                {RINGTONE_STYLES.map(({ value, label, desc }) => {
                  const active = ringtone === value;
                  return (
                    <div key={value}
                      className="rounded-xl border-2 p-3 cursor-pointer transition-all hover:opacity-90"
                      style={{ borderColor: active ? "hsl(var(--electric-blue))" : "hsl(var(--border))", background: active ? "hsl(var(--electric-blue) / 0.07)" : "transparent" }}
                      onClick={() => setRingtone(value)}>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-bold text-foreground">{label}</span>
                        {active && <Check className="w-3 h-3 text-electric-blue" />}
                      </div>
                      <p className="text-[10px] text-muted-foreground mb-2 leading-snug">{desc}</p>
                      <button
                        onClick={e => { e.stopPropagation(); previewRingtone(value); }}
                        className="flex items-center gap-1 text-[10px] font-semibold transition-opacity hover:opacity-70"
                        style={{ color: "hsl(var(--electric-blue))" }}>
                        <PlayCircle className="w-3 h-3" /> Preview
                      </button>
                    </div>
                  );
                })}
              </div>

              {/* Push Notification Permission */}
              <div className="flex items-center justify-between rounded-xl px-4 py-3" style={{ background: "hsl(var(--secondary))", border: "1px solid hsl(var(--border))" }}>
                <div className="flex items-center gap-3">
                  <Bell className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs font-bold text-foreground">Desktop Push Notifications</p>
                    <p className="text-[10px] text-muted-foreground">
                      {notifPerm === "granted" ? "Enabled — you'll receive alerts even when the app is in the background." :
                       notifPerm === "denied"  ? "Blocked by browser. Reset permissions in your browser site settings." :
                       "Allow Martin PMO to send desktop alerts for critical items."}
                    </p>
                  </div>
                </div>
                {notifPerm === "granted" ? (
                  <span className="text-[10px] font-bold text-signal-green flex items-center gap-1"><CheckCircle className="w-3 h-3" /> On</span>
                ) : notifPerm === "denied" ? (
                  <span className="text-[10px] font-semibold text-signal-red">Blocked</span>
                ) : (
                  <button onClick={enablePushNotifications}
                    className="text-xs font-bold px-3 py-1.5 rounded-lg transition-colors"
                    style={{ background: "hsl(var(--electric-blue) / 0.12)", color: "hsl(var(--electric-blue))" }}>
                    Enable
                  </button>
                )}
              </div>
            </div>
          </div>
        </Block>
      )}

      {/* ═══ BANNER & THEME TAB ═══ */}
      {activeTab === "banner" && (
        <div className="space-y-5">
          <Block title="Dashboard Banner Theme" icon={Layout} accent="blue">
            <p className="text-sm text-muted-foreground mb-4">
              Choose a theme for the animated carousel banner on the Dashboard. It auto-advances every 8 seconds and can also be changed directly on the dashboard by hovering over the banner.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {BANNER_THEMES.map(t => (
                <button
                  key={t.id}
                  onClick={() => { setBannerTheme(t.id); localStorage.setItem("apphia_banner_theme", t.id); }}
                  className={cn(
                    "group relative rounded-2xl overflow-hidden h-24 border-2 transition-all hover:scale-[1.02]",
                    bannerTheme === t.id ? "border-electric-blue shadow-elevated" : "border-border"
                  )}
                >
                  <div className="absolute inset-0" style={{ background: t.gradient }} />
                  <div className="absolute inset-0" style={{ background: t.overlay }} />
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-1">
                    <span className="text-xs font-bold text-white/80 uppercase tracking-wide drop-shadow">{t.label}</span>
                    {bannerTheme === t.id && (
                      <span className="text-[10px] text-white/50">Active</span>
                    )}
                  </div>
                  {bannerTheme === t.id && (
                    <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-electric-blue flex items-center justify-center">
                      <Check className="w-3 h-3 text-white" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </Block>

          <Block title="Hero Lockscreen Wallpaper" icon={Layout} accent="teal">
            <p className="text-sm text-muted-foreground mb-5">
              Choose your dashboard lockscreen background. Your selection is saved to your browser and persists across sessions. Pick from nature, abstract, creative, or cosmos themes.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-5">
              {HERO_PHOTOS.map((p, i) => (
                <button key={i} onClick={() => changeHeroPhoto(i)}
                  className={cn(
                    "group relative rounded-2xl overflow-hidden h-28 border-2 transition-all hover:scale-[1.02]",
                    heroPhoto === i ? "border-electric-blue shadow-elevated" : "border-border"
                  )}>
                  <img src={p.src} alt={p.label} className="absolute inset-0 w-full h-full object-cover" />
                  <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.65) 0%, transparent 55%)" }} />
                  <div className="absolute bottom-0 left-0 right-0 px-3 pb-2 flex items-end justify-between">
                    <div>
                      <div className="text-[11px] font-bold text-white drop-shadow">{p.label}</div>
                      <div className="text-[9px] text-white/60 uppercase tracking-wide">{p.category}</div>
                    </div>
                    {heroPhoto === i && (
                      <div className="w-5 h-5 rounded-full bg-electric-blue flex items-center justify-center flex-shrink-0">
                        <Check className="w-3 h-3 text-white" />
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-muted-foreground">Active: <strong className="text-foreground">{HERO_PHOTOS[heroPhoto]?.label ?? "Alpine Lake"}</strong></span>
              {heroPhoto !== 0 && (
                <button onClick={resetHeroPhoto}
                  className="text-xs px-3 py-1.5 rounded-lg border border-border hover:bg-secondary/60 transition-colors text-muted-foreground">
                  Reset to default
                </button>
              )}
            </div>
          </Block>

          <Block title="Creator Lab" icon={FlaskConical} accent="blue">
            <p className="text-sm text-muted-foreground mb-4">
              Access the private creator workspace to customize the app with prompts, manage feature flags, tweak engine settings, and apply design configurations — visible only to you.
            </p>
            <Link
              to="/creator-lab"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90"
              style={{ background: "linear-gradient(135deg, hsl(272 60% 40%), hsl(233 65% 55%))" }}
            >
              <FlaskConical className="w-4 h-4" />
              Open Creator Lab
            </Link>
          </Block>
        </div>
      )}

      {/* ═══ CRM SETTINGS TAB ═══ */}
      {activeTab === "crm" && (
        <div className="space-y-5">

          {/* Email display preferences */}
          <Block title="Email Display Preferences" icon={SlidersHorizontal} accent="blue">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div>
                <p className="text-xs font-bold text-foreground uppercase tracking-wide mb-3">Email Types Shown</p>
                <div className="space-y-2">
                  {[
                    { key:"showDirectEmail", label:"🎯 Direct Email", sub:"Personal leadership emails (firstname@domain, last@domain)" },
                    { key:"showGeneralEmail", label:"📧 General Email", sub:"Company info emails (info@…, service@…) or inferred" },
                    { key:"showEmailSource", label:"Source Badges", sub:"Show where each email came from and confidence level" },
                  ].map(({ key, label, sub }) => (
                    <label key={key} className="flex items-start gap-3 p-3 rounded-xl border border-border/60 cursor-pointer hover:bg-secondary/50 transition-colors">
                      <input type="checkbox" checked={crmSettings[key as keyof CRMSettings] as boolean}
                        onChange={e => updateCrm({ [key]: e.target.checked })}
                        className="mt-0.5 rounded" />
                      <div>
                        <p className="text-sm font-medium text-foreground">{label}</p>
                        <p className="text-xs text-muted-foreground">{sub}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-xs font-bold text-foreground uppercase tracking-wide mb-3">Default Contact View</p>
                <div className="space-y-2">
                  {[["card","Card grid (Ken Burns covers, score bars)"],["table","Table view (compact, sortable)"]] .map(([v,l]) => (
                    <label key={v} className="flex items-center gap-3 p-3 rounded-xl border border-border/60 cursor-pointer hover:bg-secondary/50 transition-colors">
                      <input type="radio" checked={crmSettings.contactView === v}
                        onChange={() => updateCrm({ contactView: v as "card"|"table" })} />
                      <span className="text-sm text-foreground">{l}</span>
                    </label>
                  ))}
                </div>

                <p className="text-xs font-bold text-foreground uppercase tracking-wide mb-3 mt-5">Confidence Threshold</p>
                <p className="text-xs text-muted-foreground mb-2">Only show data at or above this confidence level</p>
                <div className="space-y-2">
                  {(["verified","high","medium","inferred"] as Confidence[]).map(c => {
                    const m = CONFIDENCE_META[c];
                    return (
                      <label key={c} className="flex items-center gap-3 p-2.5 rounded-xl border border-border/60 cursor-pointer hover:bg-secondary/50 transition-colors">
                        <input type="radio" checked={crmSettings.confidenceThreshold === c}
                          onChange={() => updateCrm({ confidenceThreshold: c })} />
                        <span className="flex items-center gap-2 text-sm">
                          <span className="w-2 h-2 rounded-full" style={{ background: m.color }} />
                          <span className="text-foreground font-medium">{m.label}</span>
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div>
                <p className="text-xs font-bold text-foreground uppercase tracking-wide mb-3">Quick Links</p>
                <div className="space-y-2">
                  <Link to="/crm" className="flex items-center gap-2 p-3 rounded-xl border border-border/60 hover:bg-secondary/50 transition-colors text-sm text-electric-blue">
                    <Link2 className="w-4 h-4" /> Open CRM
                  </Link>
                  <div className="p-3 rounded-xl border border-border/60 bg-secondary/30">
                    <p className="text-xs font-medium text-muted-foreground mb-1">Column changes take effect immediately in the CRM. Source settings apply on the next sourcing run.</p>
                  </div>
                </div>
              </div>
            </div>
          </Block>

          {/* Sourcing channels */}
          <Block title="Assisted Sourcing Channels" icon={Globe} accent="teal">
            <p className="text-sm text-muted-foreground mb-4">Select which data sources are active when running assisted sourcing. Verified sources (Business Registry, Chamber, BBB) produce the highest confidence data.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {(Object.keys(SOURCE_CHANNEL_META) as SourceChannel[]).map(ch => {
                const m = SOURCE_CHANNEL_META[ch];
                const enabled = crmSettings.enabledSources.includes(ch);
                return (
                  <div key={ch} className={cn("rounded-xl border p-4 transition-all", enabled ? "border-electric-blue/30 bg-electric-blue/5" : "border-border/50")}>
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{m.icon}</span>
                        <p className="text-sm font-semibold text-foreground">{m.label}</p>
                      </div>
                      <button
                        onClick={() => {
                          const next = enabled
                            ? crmSettings.enabledSources.filter(s => s !== ch)
                            : [...crmSettings.enabledSources, ch];
                          updateCrm({ enabledSources: next });
                        }}
                        className={cn("px-2.5 py-1 rounded-lg text-[11px] font-bold transition-colors flex-shrink-0",
                          enabled ? "bg-electric-blue/15 text-electric-blue border border-electric-blue/25 hover:bg-electric-blue/25" : "bg-muted text-muted-foreground border border-border hover:text-foreground"
                        )}>
                        {enabled ? "✓ Active" : "Enable"}
                      </button>
                    </div>
                    <div className="space-y-0.5">
                      {m.provides.map(p => <p key={p} className="text-[11px] text-muted-foreground flex items-center gap-1.5"><span className="w-1 h-1 rounded-full bg-muted-foreground/40 flex-shrink-0" />{p}</p>)}
                    </div>
                  </div>
                );
              })}
            </div>
          </Block>

          {/* Contact columns */}
          <Block title="Contact Table Columns" icon={Users} accent="green">
            <p className="text-sm text-muted-foreground mb-4">Configure which columns appear in the Contacts table view. Locked columns (Name) are always shown.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {crmSettings.contactColumns.map(col => (
                <label key={col.id} className={cn("flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-colors hover:bg-secondary/50",
                  col.enabled ? "border-electric-blue/30 bg-electric-blue/5" : "border-border/60"
                )}>
                  <input type="checkbox" checked={col.enabled} disabled={col.locked}
                    onChange={e => updateCrm({ contactColumns: crmSettings.contactColumns.map(c => c.id === col.id ? { ...c, enabled: e.target.checked } : c) })}
                    className={cn("mt-0.5 rounded", col.locked && "opacity-50")} />
                  <div>
                    <p className="text-sm font-medium text-foreground">{col.label} {col.locked && <span className="text-[10px] text-muted-foreground">(locked)</span>}</p>
                    {col.description && <p className="text-[11px] text-muted-foreground">{col.description}</p>}
                  </div>
                </label>
              ))}
            </div>
          </Block>

          {/* Company columns */}
          <Block title="Company Table Columns" icon={Building2} accent="yellow">
            <p className="text-sm text-muted-foreground mb-4">Configure which columns appear in the Companies table. Includes enriched data from Business Registry, Chamber, and BBB.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {crmSettings.companyColumns.map(col => (
                <label key={col.id} className={cn("flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-colors hover:bg-secondary/50",
                  col.enabled ? "border-electric-blue/30 bg-electric-blue/5" : "border-border/60"
                )}>
                  <input type="checkbox" checked={col.enabled} disabled={col.locked}
                    onChange={e => updateCrm({ companyColumns: crmSettings.companyColumns.map(c => c.id === col.id ? { ...c, enabled: e.target.checked } : c) })}
                    className={cn("mt-0.5 rounded", col.locked && "opacity-50")} />
                  <div>
                    <p className="text-sm font-medium text-foreground">{col.label} {col.locked && <span className="text-[10px] text-muted-foreground">(locked)</span>}</p>
                  </div>
                </label>
              ))}
            </div>
          </Block>

        </div>
      )}

    </div>
  );
}
