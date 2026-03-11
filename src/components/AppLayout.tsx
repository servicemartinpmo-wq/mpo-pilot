import { NavLink, useLocation } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import {
  LayoutDashboard, Rocket, Activity, Building2,
  Settings, Zap, ChevronRight, FileText, CheckSquare,
  BookOpen, Plug, Users, ChevronLeft, Headphones,
  GitBranch, Brain, BarChart3, Moon, Bell, Clock,
  FolderOpen, Scale, Layers, UserCircle, TrendingUp,
  Network, ShoppingBag, CreditCard, Tag,
} from "lucide-react";
import pmoLogoLight from "@/assets/pmo-logo-light.png";
import { useUserMode } from "@/hooks/useUserMode";
import { cn } from "@/lib/utils";
import type { CompanyProfile } from "@/lib/companyStore";
import { saveProfile } from "@/lib/companyStore";
import { runOrgHealthScoring, runMaturityScoring } from "@/lib/engine/maturity";
import NotificationsPanel from "./NotificationsPanel";
import { useAuth } from "@/hooks/useAuth";
import { getNotifications } from "@/lib/supabaseDataService";
import { playAlertSound, playSuccessSound, playPingSound } from "@/lib/notificationSound";

const navItems = [
  { to: "/",             label: "Dashboard",    icon: LayoutDashboard, group: "command" },
  { to: "/decisions",    label: "Decisions",    icon: Scale,           group: "command" },
  { to: "/departments",  label: "Departments",  icon: Building2,       group: "command" },
  { to: "/team",         label: "Team",         icon: Users,           group: "command" },
  { to: "/diagnostics",  label: "Diagnostics",  icon: Activity,        group: "command" },
  { to: "/crm",          label: "CRM",          icon: ShoppingBag,     group: "growth" },
  { to: "/marketing",    label: "Marketing",    icon: TrendingUp,      group: "growth" },
  { to: "/pricing",      label: "Upgrade",      icon: CreditCard,      group: "tools" },
  { to: "/reports",      label: "Reports",      icon: FileText,        group: "tools" },
  { to: "/knowledge",    label: "Resource Hub", icon: BookOpen,        group: "tools" },
  { to: "/graph",        label: "Graph View",   icon: Network,         group: "tools" },
  { to: "/workflows",    label: "Workflows",    icon: GitBranch,       group: "tools" },
  { to: "/advisory",     label: "Advisory",     icon: Headphones,      group: "tools" },
  { to: "/integrations", label: "Integrations", icon: Plug,            group: "tools" },
  { to: "/admin",        label: "Systems",      icon: Settings,        group: "tools" },
];

const workMgmtItems = [
  { to: "/initiatives",  label: "Initiatives",  icon: Rocket       },
  { to: "/projects",     label: "Projects",     icon: FolderOpen   },
  { to: "/action-items", label: "Action Items", icon: CheckSquare  },
  { to: "/agile",        label: "Agile Board",  icon: Layers       },
];

type SnoozeDuration = "off" | "1h" | "3h" | "tonight" | "weekend";

interface SnoozeState {
  active: boolean;
  duration: SnoozeDuration;
  until?: Date;
  label: string;
}

interface Props {
  children: React.ReactNode;
  profile: CompanyProfile;
  onProfileUpdate: (p: CompanyProfile) => void;
}

export default function AppLayout({ children, profile, onProfileUpdate }: Props) {
  const { user } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [healthScore, setHealthScore] = useState(0);
  const [animatedScore, setAnimatedScore] = useState(0);
  const [snoozeOpen, setSnoozeOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const prevUnreadRef = useRef(0);
  const [snooze, setSnooze] = useState<SnoozeState>(() => {
    try {
      const raw = localStorage.getItem("apphia_snooze");
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed.until && new Date(parsed.until) > new Date()) return parsed;
      }
    } catch {}
    return { active: false, duration: "off", label: "Notifications on" };
  });

  useEffect(() => {
    const scores = runMaturityScoring();
    const orgHealth = runOrgHealthScoring(scores);
    setHealthScore(orgHealth.overall);
    let current = 0;
    const step = orgHealth.overall / 40;
    const interval = setInterval(() => {
      current = Math.min(current + step, orgHealth.overall);
      setAnimatedScore(Math.round(current));
      if (current >= orgHealth.overall) clearInterval(interval);
    }, 30);
    return () => clearInterval(interval);
  }, []);

  // Background notification poll — checks every 90 seconds, plays sound when new items arrive
  useEffect(() => {
    if (!user?.id) return;
    const poll = async () => {
      try {
        const data = await getNotifications(user.id, 30);
        const unreadItems = (data as any[]).filter((n) => !n.read);
        const count = unreadItems.length;
        const prev = prevUnreadRef.current;
        prevUnreadRef.current = count;
        setUnreadCount(count);
        if (count > prev && !snooze.active) {
          const types = unreadItems.map((n: any) => (n.type ?? "").toLowerCase());
          const hasUrgent = types.some((t: string) =>
            t.includes("risk") || t.includes("alert") || t.includes("critical") || t.includes("urgent")
          );
          const hasWin = types.some((t: string) =>
            t.includes("success") || t.includes("complete") || t.includes("win")
          );
          if (hasUrgent) playAlertSound();
          else if (hasWin) playSuccessSound();
          else playPingSound();
        }
      } catch {
        // silent — network issues shouldn't crash the sidebar
      }
    };
    poll();
    const pollInterval = setInterval(poll, 90_000);
    return () => clearInterval(pollInterval);
  }, [user?.id, snooze.active]);

  function activateSnooze(duration: SnoozeDuration, label: string) {
    const now = new Date();
    let until: Date | undefined;
    if (duration === "1h") { until = new Date(now.getTime() + 60 * 60 * 1000); }
    else if (duration === "3h") { until = new Date(now.getTime() + 3 * 60 * 60 * 1000); }
    else if (duration === "tonight") {
      until = new Date(now);
      until.setHours(23, 59, 59, 0);
    } else if (duration === "weekend") {
      const monday = new Date(now);
      const daysUntilMonday = (8 - monday.getDay()) % 7 || 7;
      monday.setDate(monday.getDate() + daysUntilMonday);
      monday.setHours(7, 0, 0, 0);
      until = monday;
    }
    const newSnooze: SnoozeState = { active: true, duration, until, label };
    setSnooze(newSnooze);
    localStorage.setItem("apphia_snooze", JSON.stringify(newSnooze));
    setSnoozeOpen(false);
  }

  function clearSnooze() {
    const newSnooze: SnoozeState = { active: false, duration: "off", label: "Notifications on" };
    setSnooze(newSnooze);
    localStorage.removeItem("apphia_snooze");
    setSnoozeOpen(false);
  }

  const commandNav = navItems.filter((n) => n.group === "command");
  const growthNav = navItems.filter((n) => n.group === "growth");
  const toolsNav = navItems.filter((n) => n.group === "tools");
  const { mode, setMode, label: modeLabel, allModes } = useUserMode();
  const [modeMenuOpen, setModeMenuOpen] = useState(false);
  const location = useLocation();
  const isOnWorkMgmt = workMgmtItems.some(i => location.pathname.startsWith(i.to));
  const [workMgmtOpen, setWorkMgmtOpen] = useState(() => isOnWorkMgmt);

  const scoreColor =
    animatedScore >= 70 ? "hsl(160 56% 46%)" :
    animatedScore >= 50 ? "hsl(38 92% 52%)" :
    "hsl(350 84% 62%)";

  const sidebarWidth = collapsed ? 58 : 234;

  return (
    <div className="pmo-grid" style={{ gridTemplateColumns: `${sidebarWidth}px 1fr` }}>

      {/* ── Sidebar ── */}
      <aside
        className="flex flex-col h-screen sticky top-0 overflow-hidden transition-all duration-300 relative"
        style={{ width: sidebarWidth }}>

        {/* Base background — rich layered gradient */}
        <div className="absolute inset-0 z-0" style={{
          background: "linear-gradient(160deg, hsl(222 32% 13%) 0%, hsl(222 28% 9%) 50%, hsl(220 30% 7%) 100%)"
        }} />

        {/* Laminated sheen — diagonal gloss */}
        <div className="absolute inset-0 z-0 pointer-events-none" style={{
          background: "linear-gradient(130deg, hsl(0 0% 100% / 0.045) 0%, transparent 38%, transparent 62%, hsl(0 0% 100% / 0.018) 100%)"
        }} />

        {/* Fine horizontal texture — subtle banding */}
        <div className="absolute inset-0 z-0 pointer-events-none" style={{
          backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 3px, hsl(0 0% 100% / 0.009) 3px, hsl(0 0% 100% / 0.009) 4px)"
        }} />

        {/* Embossed top edge */}
        <div className="absolute top-0 left-0 right-0 h-px z-1 pointer-events-none" style={{
          background: "linear-gradient(90deg, transparent, hsl(0 0% 100% / 0.16) 20%, hsl(0 0% 100% / 0.16) 80%, transparent)"
        }} />

        {/* Top glow */}
        <div className="absolute top-0 left-0 right-0 h-44 z-0 pointer-events-none" style={{
          background: "radial-gradient(ellipse 150% 80% at 50% -10%, hsl(222 88% 65% / 0.10) 0%, transparent 70%)"
        }} />

        {/* Bottom amber warmth */}
        <div className="absolute bottom-0 left-0 right-0 h-36 z-0 pointer-events-none" style={{
          background: "radial-gradient(ellipse 120% 80% at 50% 115%, hsl(38 92% 52% / 0.08) 0%, transparent 70%)"
        }} />

        {/* Right edge separator */}
        <div className="absolute inset-y-0 right-0 w-px z-10" style={{
          background: "linear-gradient(180deg, transparent 0%, hsl(0 0% 100% / 0.09) 15%, hsl(0 0% 100% / 0.09) 85%, transparent 100%)"
        }} />

        {/* ── Content ── */}
        <div className="relative z-10 flex flex-col h-full">

          {/* Brand header */}
          <div className="flex items-center gap-2.5 px-3 py-3 border-b" style={{ borderColor: "hsl(0 0% 100% / 0.06)" }}>
            {/* Tag icon — always visible */}
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: "linear-gradient(135deg, hsl(222 88% 65%), hsl(174 68% 42%))" }}>
              <Tag className="w-4 h-4 text-white" />
            </div>

            {/* Company + app name — only when expanded */}
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <div className="text-[13px] font-black text-white leading-none tracking-tight truncate">Martin PMO</div>
                <div className="text-[9px] font-medium mt-0.5 truncate" style={{ color: "hsl(0 0% 100% / 0.38)" }}>PMO-Ops Command Center</div>
              </div>
            )}

            <button
              onClick={() => setCollapsed((c) => !c)}
              className="flex-shrink-0 w-5 h-5 rounded flex items-center justify-center transition-all opacity-20 hover:opacity-60"
              style={{ color: "hsl(0 0% 100% / 0.8)" }}>
              {collapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
            </button>
          </div>

          {/* Org Health Card */}
          {!collapsed && (
            <div className="mx-3 mt-3 mb-1 rounded-xl p-3 border relative overflow-hidden" style={{
              background: "hsl(0 0% 100% / 0.03)",
              borderColor: "hsl(0 0% 100% / 0.07)"
            }}>
              <div className="absolute -top-4 -right-3 w-16 h-16 rounded-full pointer-events-none" style={{
                background: `radial-gradient(circle, ${scoreColor}30 0%, transparent 70%)`
              }} />
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ background: "hsl(160 56% 46%)" }} />
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5" style={{ background: "hsl(160 56% 46%)" }} />
                  </span>
                  <span className="text-[9px] font-bold uppercase tracking-widest" style={{ color: "hsl(0 0% 100% / 0.35)" }}>
                    Org Health
                  </span>
                </div>
                <span className="text-sm font-black font-mono" style={{ color: scoreColor }}>{animatedScore}</span>
              </div>
              <div className="h-1 rounded-full overflow-hidden" style={{ background: "hsl(0 0% 100% / 0.08)" }}>
                <div className="h-full rounded-full transition-all duration-1000" style={{
                  width: `${animatedScore}%`,
                  background: `linear-gradient(90deg, ${scoreColor}, hsl(174 68% 42%))`
                }} />
              </div>
            </div>
          )}

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto py-2 px-2 space-y-0.5" style={{ scrollbarWidth: "none" }}>

            {!collapsed && (
              <p className="text-[9px] font-bold uppercase tracking-[0.22em] px-2 pb-1 pt-1.5"
                style={{ color: "hsl(0 0% 100% / 0.18)" }}>
                Command
              </p>
            )}

            {commandNav.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                end={to === "/"}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-[13px] font-medium transition-all duration-150 group relative",
                    !isActive && "hover:bg-white/[0.04]"
                  )
                }
                style={({ isActive }) => ({
                  color: isActive ? "#fff" : undefined,
                  background: isActive ? "hsl(38 92% 52% / 0.12)" : undefined,
                  boxShadow: isActive ? "inset 2px 0 0 hsl(38 92% 52% / 0.7)" : undefined,
                })}>
                {({ isActive }) => (
                  <>
                    <Icon className="w-4 h-4 flex-shrink-0"
                      style={{ color: isActive ? "hsl(38 92% 62%)" : "hsl(0 0% 100% / 0.38)" }} />
                    {!collapsed && (
                      <>
                        <span className="flex-1 truncate"
                          style={{ color: isActive ? "hsl(38 10% 96%)" : "hsl(0 0% 100% / 0.58)" }}>
                          {label}
                        </span>
                        {isActive && <div className="w-1 h-1 rounded-full flex-shrink-0" style={{ background: "hsl(38 92% 52%)" }} />}
                      </>
                    )}
                  </>
                )}
              </NavLink>
            ))}

            {/* Work Management collapsible section */}
            <div className="mt-1">
              <button
                onClick={() => setWorkMgmtOpen(o => !o)}
                className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-[13px] font-medium transition-all duration-150 hover:bg-white/[0.04]">
                <Layers className="w-4 h-4 flex-shrink-0" style={{ color: "hsl(0 0% 100% / 0.38)" }} />
                {!collapsed && (
                  <>
                    <span className="flex-1 truncate text-left" style={{ color: "hsl(0 0% 100% / 0.58)" }}>Work Management</span>
                    <ChevronRight className="w-3 h-3 flex-shrink-0 transition-transform duration-200"
                      style={{ color: "hsl(0 0% 100% / 0.25)", transform: workMgmtOpen ? "rotate(90deg)" : "rotate(0deg)" }} />
                  </>
                )}
              </button>

              {/* Sub-items */}
              {workMgmtOpen && (
                <div className={collapsed ? "" : "ml-3 pl-2.5 border-l"} style={{ borderColor: "hsl(0 0% 100% / 0.08)" }}>
                  {workMgmtItems.map(({ to, label, icon: Icon }) => (
                    <NavLink
                      key={to}
                      to={to}
                      className={({ isActive }) =>
                        cn(
                          "flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl text-[12px] font-medium transition-all duration-150",
                          !isActive && "hover:bg-white/[0.04]"
                        )
                      }
                      style={({ isActive }) => ({
                        background: isActive ? "hsl(38 92% 52% / 0.10)" : undefined,
                        boxShadow: isActive ? "inset 2px 0 0 hsl(38 92% 52% / 0.5)" : undefined,
                      })}>
                      {({ isActive }) => (
                        <>
                          <Icon className="w-3.5 h-3.5 flex-shrink-0"
                            style={{ color: isActive ? "hsl(38 92% 62%)" : "hsl(0 0% 100% / 0.30)" }} />
                          {!collapsed && (
                            <span className="flex-1 truncate"
                              style={{ color: isActive ? "hsl(38 10% 96%)" : "hsl(0 0% 100% / 0.50)" }}>
                              {label}
                            </span>
                          )}
                        </>
                      )}
                    </NavLink>
                  ))}
                </div>
              )}
            </div>

            {/* Growth group */}
            <div className="mt-3">
              {!collapsed && (
                <p className="text-[9px] font-bold uppercase tracking-[0.22em] px-2 pb-1 pt-1.5"
                  style={{ color: "hsl(0 0% 100% / 0.18)" }}>
                  Growth
                </p>
              )}
              {growthNav.map(({ to, label, icon: Icon }) => (
                <NavLink
                  key={to}
                  to={to}
                  className={({ isActive }) =>
                    cn(
                      "flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-[13px] font-medium transition-all duration-150 group relative",
                      !isActive && "hover:bg-white/[0.04]"
                    )
                  }
                  style={({ isActive }) => ({
                    background: isActive ? "hsl(160 56% 42% / 0.1)" : undefined,
                    boxShadow: isActive ? "inset 2px 0 0 hsl(160 56% 42% / 0.6)" : undefined,
                  })}>
                  {({ isActive }) => (
                    <>
                      <Icon className="w-4 h-4 flex-shrink-0"
                        style={{ color: isActive ? "hsl(160 56% 52%)" : "hsl(0 0% 100% / 0.38)" }} />
                      {!collapsed && (
                        <>
                          <span className="flex-1 truncate"
                            style={{ color: isActive ? "#fff" : "hsl(0 0% 100% / 0.58)" }}>
                            {label}
                          </span>
                          {isActive && <div className="w-1 h-1 rounded-full flex-shrink-0" style={{ background: "hsl(160 56% 42%)" }} />}
                        </>
                      )}
                    </>
                  )}
                </NavLink>
              ))}
            </div>

            <div className="mt-3">
              {!collapsed && (
                <p className="text-[9px] font-bold uppercase tracking-[0.22em] px-2 pb-1 pt-2"
                  style={{ color: "hsl(0 0% 100% / 0.18)" }}>
                  Tools
                </p>
              )}
              {toolsNav.map(({ to, label, icon: Icon }) => (
                <NavLink
                  key={to}
                  to={to}
                  className={({ isActive }) =>
                    cn(
                      "flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-[13px] font-medium transition-all duration-150 group relative",
                      !isActive && "hover:bg-white/[0.04]"
                    )
                  }
                  style={({ isActive }) => ({
                    background: isActive ? "hsl(272 60% 52% / 0.12)" : undefined,
                    boxShadow: isActive ? "inset 2px 0 0 hsl(272 60% 52% / 0.65)" : undefined,
                  })}>
                  {({ isActive }) => (
                    <>
                      <Icon className="w-4 h-4 flex-shrink-0"
                        style={{ color: isActive ? "hsl(272 60% 68%)" : "hsl(0 0% 100% / 0.38)" }} />
                      {!collapsed && (
                        <>
                          <span className="flex-1 truncate"
                            style={{ color: isActive ? "#fff" : "hsl(0 0% 100% / 0.58)" }}>
                            {label}
                          </span>
                          {isActive && <div className="w-1 h-1 rounded-full flex-shrink-0" style={{ background: "hsl(272 60% 52%)" }} />}
                        </>
                      )}
                    </>
                  )}
                </NavLink>
              ))}
            </div>
          </nav>

          {/* ── Footer ── */}
          <div className="px-3 pb-3 pt-2 border-t space-y-2 relative" style={{ borderColor: "hsl(0 0% 100% / 0.06)" }}>

            {/* User mode + Engine status */}
            {!collapsed && (
              <div className="relative">
                <button
                  onClick={() => setModeMenuOpen(o => !o)}
                  className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-white/[0.04] transition-all">
                  <UserCircle className="w-3 h-3 flex-shrink-0" style={{ color: "hsl(38 92% 52% / 0.6)" }} />
                  <span className="text-[10px] font-semibold flex-1 truncate text-left" style={{ color: "hsl(38 92% 52% / 0.7)" }}>
                    {modeLabel} Mode
                  </span>
                  <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: "hsl(160 56% 46%)" }} />
                </button>
                {modeMenuOpen && (
                  <div className="absolute bottom-full mb-1 left-0 right-0 rounded-xl border overflow-hidden shadow-deep z-50"
                    style={{ background: "hsl(222 28% 12%)", borderColor: "hsl(0 0% 100% / 0.08)" }}>
                    <div className="px-3 py-2 border-b" style={{ borderColor: "hsl(0 0% 100% / 0.06)" }}>
                      <span className="text-[9px] font-bold uppercase tracking-widest" style={{ color: "hsl(0 0% 100% / 0.3)" }}>
                        Switch Mode
                      </span>
                    </div>
                    {allModes.map(({ key, label }) => (
                      <button
                        key={key}
                        onClick={() => { setMode(key); setModeMenuOpen(false); }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-left text-[12px] transition-all hover:bg-white/[0.06]"
                        style={{ color: mode === key ? "hsl(38 92% 62%)" : "hsl(0 0% 100% / 0.5)" }}>
                        <UserCircle className="w-3.5 h-3.5 flex-shrink-0" style={{ color: mode === key ? "hsl(38 92% 52%)" : "hsl(0 0% 100% / 0.25)" }} />
                        {label}
                        {mode === key && <div className="ml-auto w-1.5 h-1.5 rounded-full" style={{ background: "hsl(38 92% 52%)" }} />}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Bell / Notifications */}
            <button
              onClick={() => setNotifOpen(true)}
              className={cn(
                "w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl transition-all hover:bg-white/[0.05] relative"
              )}>
              <div className="relative flex-shrink-0">
                <Bell className="w-4 h-4" style={{ color: "hsl(0 0% 100% / 0.38)" }} />
                {unreadCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-black text-white"
                    style={{ background: "hsl(38 92% 52%)" }}>
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </div>
              {!collapsed && (
                <span className="text-[12px] font-medium" style={{ color: "hsl(0 0% 100% / 0.38)" }}>
                  {unreadCount > 0 ? `${unreadCount} new alert${unreadCount > 1 ? "s" : ""}` : "Notifications"}
                </span>
              )}
            </button>

            {/* ── Snooze Control ── */}
            <div className="relative">
              <button
                onClick={() => setSnoozeOpen(o => !o)}
                className={cn(
                  "w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl transition-all",
                  snooze.active
                    ? "bg-amber/8 border border-amber/20"
                    : "hover:bg-white/[0.04]"
                )}>
                {snooze.active
                  ? <Moon className="w-4 h-4 flex-shrink-0 text-amber" />
                  : <Clock className="w-4 h-4 flex-shrink-0" style={{ color: "hsl(0 0% 100% / 0.28)" }} />
                }
                {!collapsed && (
                  <span className="text-[12px] font-medium truncate" style={{
                    color: snooze.active ? "hsl(38 92% 55%)" : "hsl(0 0% 100% / 0.28)"
                  }}>
                    {snooze.active ? snooze.label : "Do Not Disturb"}
                  </span>
                )}
              </button>

              {/* Snooze dropdown */}
              {snoozeOpen && (
                <div className="absolute bottom-full mb-2 left-0 right-0 rounded-xl border overflow-hidden shadow-deep z-50"
                  style={{
                    background: "hsl(222 28% 12%)",
                    borderColor: "hsl(0 0% 100% / 0.08)"
                  }}>
                  <div className="px-3 py-2 border-b" style={{ borderColor: "hsl(0 0% 100% / 0.06)" }}>
                    <span className="text-[9px] font-bold uppercase tracking-widest" style={{ color: "hsl(0 0% 100% / 0.3)" }}>
                      Snooze Alerts
                    </span>
                  </div>
                  {[
                    { d: "1h" as const, label: "For 1 hour" },
                    { d: "3h" as const, label: "For 3 hours" },
                    { d: "tonight" as const, label: "Until tomorrow" },
                    { d: "weekend" as const, label: "Weekend mode" },
                  ].map(({ d, label }) => (
                    <button
                      key={d}
                      onClick={() => activateSnooze(d, label)}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-left text-[12px] transition-all hover:bg-white/[0.06]"
                      style={{ color: "hsl(0 0% 100% / 0.6)" }}>
                      <Moon className="w-3.5 h-3.5 flex-shrink-0 text-amber opacity-60" />
                      {!collapsed && label}
                    </button>
                  ))}
                  {snooze.active && (
                    <button
                      onClick={clearSnooze}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-left text-[12px] transition-all hover:bg-white/[0.06] border-t"
                      style={{ borderColor: "hsl(0 0% 100% / 0.06)", color: "hsl(160 56% 48%)" }}>
                      <Bell className="w-3.5 h-3.5 flex-shrink-0" />
                      {!collapsed && "Turn alerts back on"}
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

        </div>
      </aside>

      {/* Main content */}
      <main className="min-h-screen overflow-auto bg-background">
        {children}
      </main>

      {/* Notifications Panel */}
      {user?.id && (
        <NotificationsPanel
          userId={user.id}
          open={notifOpen}
          onClose={() => setNotifOpen(false)}
          onUnreadChange={setUnreadCount}
        />
      )}
    </div>
  );
}
