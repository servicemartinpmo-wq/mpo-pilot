import { NavLink } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  LayoutDashboard, Rocket, Activity, Building2,
  Settings, Zap, ChevronRight, FileText, ToggleLeft, ToggleRight, CheckSquare,
  BookOpen, Plug, Users, ChevronLeft, Headphones, TrendingUp, GitBranch,
  Brain, BarChart3
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { CompanyProfile } from "@/lib/companyStore";
import { saveProfile } from "@/lib/companyStore";
import { runOrgHealthScoring, runMaturityScoring } from "@/lib/engine/maturity";

const navItems = [
  { to: "/",             label: "Dashboard",    icon: LayoutDashboard, group: "command" },
  { to: "/initiatives",  label: "Initiatives",  icon: Rocket,          group: "command" },
  { to: "/action-items", label: "Action Items", icon: CheckSquare,     group: "command" },
  { to: "/departments",  label: "Departments",  icon: Building2,       group: "command" },
  { to: "/team",         label: "Team",         icon: Users,           group: "command" },
  { to: "/diagnostics",  label: "Diagnostics",  icon: Activity,        group: "command" },
  { to: "/reports",      label: "Reports",      icon: FileText,        group: "tools" },
  { to: "/knowledge",    label: "Resource Hub", icon: BookOpen,        group: "tools" },
  { to: "/workflows",    label: "Workflows",    icon: GitBranch,       group: "tools" },
  { to: "/advisory",     label: "Advisory",     icon: Headphones,      group: "tools" },
  { to: "/integrations", label: "Integrations", icon: Plug,            group: "tools" },
  { to: "/admin",        label: "Systems",      icon: Settings,        group: "tools" },
];

interface Props {
  children: React.ReactNode;
  profile: CompanyProfile;
  onProfileUpdate: (p: CompanyProfile) => void;
}

export default function AppLayout({ children, profile, onProfileUpdate }: Props) {
  const [analyticsOn, setAnalyticsOn] = useState(profile.analyticsEnabled);
  const [collapsed, setCollapsed] = useState(false);
  const [healthScore, setHealthScore] = useState(0);
  const [animatedScore, setAnimatedScore] = useState(0);

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

  function toggleAnalytics() {
    const updated = { ...profile, analyticsEnabled: !analyticsOn };
    setAnalyticsOn(!analyticsOn);
    saveProfile(updated);
    onProfileUpdate(updated);
  }

  const commandNav = navItems.filter((n) => n.group === "command");
  const toolsNav = navItems.filter((n) => n.group === "tools");

  const scoreColor =
    animatedScore >= 70 ? "hsl(var(--signal-green))" :
    animatedScore >= 50 ? "hsl(var(--signal-yellow))" :
    "hsl(var(--signal-red))";

  const sidebarWidth = collapsed ? 60 : 230;

  return (
    <div className="pmo-grid" style={{ gridTemplateColumns: `${sidebarWidth}px 1fr` }}>

      {/* ── Sidebar ── */}
      <aside
        className="flex flex-col h-screen sticky top-0 overflow-hidden transition-all duration-300 relative"
        style={{ width: sidebarWidth }}>

        {/* ── Base background ── */}
        <div className="absolute inset-0 z-0" style={{
          background: "linear-gradient(180deg, hsl(225 52% 9%) 0%, hsl(227 48% 12%) 50%, hsl(229 44% 14%) 100%)"
        }} />

        {/* ── Subtle grid pattern ── */}
        <div className="absolute inset-0 z-0 opacity-[0.03]" style={{
          backgroundImage: "linear-gradient(hsl(233 65% 65%) 1px, transparent 1px), linear-gradient(90deg, hsl(233 65% 65%) 1px, transparent 1px)",
          backgroundSize: "24px 24px"
        }} />

        {/* ── Top radial glow (electric blue) ── */}
        <div className="absolute top-0 left-0 right-0 h-56 z-0 pointer-events-none" style={{
          background: "radial-gradient(ellipse 160% 120% at 50% -15%, hsl(233 65% 60% / 0.15) 0%, transparent 70%)"
        }} />

        {/* ── Bottom radial glow (teal) ── */}
        <div className="absolute bottom-0 left-0 right-0 h-36 z-0 pointer-events-none" style={{
          background: "radial-gradient(ellipse 130% 100% at 50% 115%, hsl(183 55% 35% / 0.12) 0%, transparent 70%)"
        }} />

        {/* ── Left edge accent line ── */}
        <div className="absolute inset-y-0 right-0 w-px z-10" style={{
          background: "linear-gradient(180deg, transparent 0%, hsl(0 0% 100% / 0.06) 20%, hsl(0 0% 100% / 0.06) 80%, transparent 100%)"
        }} />

        {/* ── Content ── */}
        <div className="relative z-10 flex flex-col h-full">

          {/* Brand header */}
          <div className="flex items-center gap-3 px-3.5 py-4 border-b" style={{ borderColor: "hsl(0 0% 100% / 0.07)" }}>
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 shadow-lg"
              style={{ background: "var(--gradient-electric)" }}>
              <Zap className="w-4 h-4 text-white" />
            </div>

            {!collapsed && (
              <div className="flex-1 min-w-0">
                <div className="text-[12px] font-bold tracking-wide truncate text-white leading-tight">
                  {profile.orgName
                    ? profile.orgName.length > 14
                      ? profile.orgName.slice(0, 13) + "…"
                      : profile.orgName
                    : "PMO Command"}
                </div>
                <div className="text-[10px] mt-0.5" style={{ color: "hsl(0 0% 100% / 0.35)" }}>
                  Apphia Command
                </div>
              </div>
            )}

            <button
              onClick={() => setCollapsed((c) => !c)}
              className="flex-shrink-0 w-5 h-5 rounded flex items-center justify-center transition-all opacity-30 hover:opacity-70"
              style={{ color: "hsl(0 0% 100% / 0.8)" }}>
              {collapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
            </button>
          </div>

          {/* Org Health Card */}
          {!collapsed && (
            <div className="mx-3 mt-3 mb-2 rounded-xl p-3.5 border relative overflow-hidden" style={{
              background: "hsl(0 0% 100% / 0.04)",
              borderColor: "hsl(0 0% 100% / 0.08)"
            }}>
              {/* Score glow */}
              <div className="absolute -top-4 -right-4 w-20 h-20 rounded-full pointer-events-none" style={{
                background: `radial-gradient(circle, ${scoreColor}22 0%, transparent 70%)`
              }} />

              {/* Header */}
              <div className="flex items-center justify-between mb-2.5">
                <div className="flex items-center gap-1.5">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ background: "hsl(var(--signal-green))" }} />
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5" style={{ background: "hsl(var(--signal-green))" }} />
                  </span>
                  <span className="text-[10px] font-semibold" style={{ color: "hsl(0 0% 100% / 0.45)" }}>
                    Org Health
                  </span>
                </div>
                <span className="text-sm font-black font-mono" style={{ color: scoreColor }}>
                  {animatedScore}
                </span>
              </div>

              {/* Score bar */}
              <div className="h-1 rounded-full overflow-hidden mb-2.5" style={{ background: "hsl(0 0% 100% / 0.09)" }}>
                <div className="h-full rounded-full transition-all duration-1000" style={{
                  width: `${animatedScore}%`,
                  background: `linear-gradient(90deg, ${scoreColor}, hsl(183 55% 42%))`
                }} />
              </div>

              {/* Analytics toggle */}
              <button
                onClick={toggleAnalytics}
                className="flex items-center gap-1.5 text-[10px] font-medium transition-all hover:opacity-100"
                style={{ color: analyticsOn ? "hsl(var(--signal-green))" : "hsl(0 0% 100% / 0.3)" }}>
                {analyticsOn
                  ? <ToggleRight className="w-3.5 h-3.5" />
                  : <ToggleLeft className="w-3.5 h-3.5" />}
                Analytics {analyticsOn ? "on" : "off"}
              </button>
            </div>
          )}

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto py-2 px-2 space-y-0.5" style={{ scrollbarWidth: "none" }}>

            {!collapsed && (
              <p className="text-[9px] font-bold uppercase tracking-[0.2em] px-2 pb-1 pt-1.5"
                style={{ color: "hsl(0 0% 100% / 0.2)" }}>
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
                    "flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[13px] font-medium transition-all duration-150 group relative",
                    !isActive && "hover:bg-white/[0.05]"
                  )
                }
                style={({ isActive }) => ({
                  color: isActive ? "#fff" : "hsl(0 0% 100% / 0.5)",
                  background: isActive ? "hsl(233 65% 60% / 0.16)" : undefined,
                  boxShadow: isActive ? "inset 2px 0 0 hsl(233 65% 65% / 0.7)" : undefined,
                })}>
                {({ isActive }) => (
                  <>
                    <Icon className="w-4 h-4 flex-shrink-0"
                      style={{ color: isActive ? "hsl(233 65% 72%)" : "hsl(0 0% 100% / 0.45)" }} />
                    {!collapsed && (
                      <>
                        <span className="flex-1 truncate" style={{ color: isActive ? "#fff" : "hsl(0 0% 100% / 0.62)" }}>{label}</span>
                        <ChevronRight className={cn(
                          "w-2.5 h-2.5 transition-all",
                          isActive ? "opacity-40" : "opacity-0 group-hover:opacity-20"
                        )} style={{ color: "hsl(0 0% 100% / 0.5)" }} />
                      </>
                    )}
                  </>
                )}
              </NavLink>
            ))}

            <div className="mt-3">
              {!collapsed && (
                <p className="text-[9px] font-bold uppercase tracking-[0.2em] px-2 pb-1 pt-2"
                  style={{ color: "hsl(0 0% 100% / 0.2)" }}>
                  Tools
                </p>
              )}
              {toolsNav.map(({ to, label, icon: Icon }) => (
                <NavLink
                  key={to}
                  to={to}
                  className={({ isActive }) =>
                    cn(
                      "flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[13px] font-medium transition-all duration-150 group relative",
                      !isActive && "hover:bg-white/[0.05]"
                    )
                  }
                  style={({ isActive }) => ({
                    color: isActive ? "#fff" : "hsl(0 0% 100% / 0.5)",
                    background: isActive ? "hsl(183 55% 32% / 0.18)" : undefined,
                    boxShadow: isActive ? "inset 2px 0 0 hsl(183 55% 52% / 0.7)" : undefined,
                  })}>
                  {({ isActive }) => (
                    <>
                      <Icon className="w-4 h-4 flex-shrink-0"
                        style={{ color: isActive ? "hsl(183 55% 62%)" : "hsl(0 0% 100% / 0.45)" }} />
                      {!collapsed && (
                        <>
                          <span className="flex-1 truncate" style={{ color: isActive ? "#fff" : "hsl(0 0% 100% / 0.62)" }}>{label}</span>
                          <ChevronRight className={cn(
                            "w-2.5 h-2.5 transition-all",
                            isActive ? "opacity-40" : "opacity-0 group-hover:opacity-20"
                          )} style={{ color: "hsl(0 0% 100% / 0.5)" }} />
                        </>
                      )}
                    </>
                  )}
                </NavLink>
              ))}
            </div>
          </nav>

          {/* Footer */}
          {!collapsed && (
            <div className="px-3.5 py-3.5 border-t space-y-2" style={{ borderColor: "hsl(0 0% 100% / 0.07)" }}>
              <div className="flex items-center gap-2">
                <Brain className="w-3 h-3" style={{ color: "hsl(233 65% 65% / 0.6)" }} />
                <span className="text-[10px] font-semibold" style={{ color: "hsl(0 0% 100% / 0.35)" }}>
                  Apphia Engine Active
                </span>
                <div className="ml-auto w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: "hsl(var(--signal-green))" }} />
              </div>
              <div className="flex items-center gap-1.5" style={{ color: "hsl(0 0% 100% / 0.2)" }}>
                <BarChart3 className="w-3 h-3" />
                <span className="text-[10px]">25 AI systems · 100+ frameworks</span>
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* Main content */}
      <main className="min-h-screen overflow-auto bg-background">
        {children}
      </main>
    </div>
  );
}
