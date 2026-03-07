import { NavLink } from "react-router-dom";
import { useState } from "react";
import {
  LayoutDashboard, Rocket, Activity, Building2,
  Settings, Zap, ChevronRight, FileText, ToggleLeft, ToggleRight, CheckSquare,
  BookOpen, Plug, Users, Briefcase, ChevronLeft
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { CompanyProfile } from "@/lib/companyStore";
import { saveProfile } from "@/lib/companyStore";
import { orgMetrics } from "@/lib/pmoData";

const navItems = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, group: "main" },
  { to: "/initiatives", label: "Initiatives", icon: Rocket, group: "main" },
  { to: "/action-items", label: "Action Items", icon: CheckSquare, group: "main" },
  { to: "/departments", label: "Departments", icon: Building2, group: "main" },
  { to: "/diagnostics", label: "Diagnostics", icon: Activity, group: "main" },
  { to: "/reports", label: "Reports", icon: FileText, group: "tools" },
  { to: "/knowledge", label: "Resource Hub", icon: BookOpen, group: "tools" },
  { to: "/integrations", label: "Integrations", icon: Plug, group: "tools" },
  { to: "/admin", label: "Systems", icon: Settings, group: "tools" },
];

interface Props {
  children: React.ReactNode;
  profile: CompanyProfile;
  onProfileUpdate: (p: CompanyProfile) => void;
}

export default function AppLayout({ children, profile, onProfileUpdate }: Props) {
  const [analyticsOn, setAnalyticsOn] = useState(profile.analyticsEnabled);
  const [collapsed, setCollapsed] = useState(false);

  function toggleAnalytics() {
    const updated = { ...profile, analyticsEnabled: !analyticsOn };
    setAnalyticsOn(!analyticsOn);
    saveProfile(updated);
    onProfileUpdate(updated);
  }

  const mainNav = navItems.filter(n => n.group === "main");
  const toolsNav = navItems.filter(n => n.group === "tools");

  return (
    <div className="pmo-grid" style={{ gridTemplateColumns: collapsed ? "64px 1fr" : "240px 1fr" }}>
      {/* Sidebar */}
      <aside className="flex flex-col h-screen sticky top-0 border-r-2 transition-all duration-300"
        style={{ background: "hsl(var(--sidebar-background))", borderColor: "hsl(var(--sidebar-border))", width: collapsed ? 64 : 240 }}>

        {/* Logo / Brand */}
        <div className="px-4 pt-5 pb-4 border-b-2 flex items-center gap-2.5"
          style={{ borderColor: "hsl(var(--sidebar-border))" }}>
          <div className="w-7 h-7 rounded flex items-center justify-center flex-shrink-0"
            style={{ background: "var(--gradient-electric)" }}>
            <Zap className="w-3.5 h-3.5 text-white" />
          </div>
          {!collapsed && (
            <div className="min-w-0 flex-1">
              <span className="text-xs font-bold tracking-widest uppercase block truncate"
                style={{ color: "hsl(var(--sidebar-primary))" }}>
                {profile.orgName ? (profile.orgName.length > 16 ? profile.orgName.slice(0, 15) + "…" : profile.orgName) : "MARTIN"}
              </span>
              <p className="text-xs mt-0.5" style={{ color: "hsl(var(--sidebar-foreground) / 0.4)" }}>
                PMO-Ops
              </p>
            </div>
          )}
          <button
            onClick={() => setCollapsed(c => !c)}
            className="flex-shrink-0 w-6 h-6 rounded flex items-center justify-center transition-colors hover:bg-white/10"
            style={{ color: "hsl(var(--sidebar-foreground) / 0.4)" }}>
            {collapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Live status + Analytics */}
        {!collapsed && (
          <div className="px-4 py-3 border-b-2 space-y-2.5"
            style={{ borderColor: "hsl(var(--sidebar-border))" }}>
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2 flex-shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
                  style={{ background: "hsl(var(--signal-green))" }} />
                <span className="relative inline-flex rounded-full h-2 w-2"
                  style={{ background: "hsl(var(--signal-green))" }} />
              </span>
              <span className="text-xs flex-1" style={{ color: "hsl(var(--sidebar-foreground) / 0.55)" }}>System Active</span>
              <button onClick={toggleAnalytics}
                className="flex items-center gap-1 text-xs transition-colors"
                style={{ color: analyticsOn ? "hsl(var(--sidebar-primary))" : "hsl(var(--sidebar-foreground) / 0.4)" }}>
                {analyticsOn ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                <span>Analytics</span>
              </button>
            </div>
            <div>
              <div className="flex justify-between text-xs mb-1" style={{ color: "hsl(var(--sidebar-foreground) / 0.45)" }}>
                <span>Operational Health</span>
                <span className="font-mono" style={{ color: "hsl(var(--sidebar-primary))" }}>{orgMetrics.overallMaturityScore}%</span>
              </div>
              <div className="h-1 rounded-full" style={{ background: "hsl(var(--sidebar-border))" }}>
                <div className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${orgMetrics.overallMaturityScore}%`, background: "hsl(var(--sidebar-primary))" }} />
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 px-2 py-4 overflow-y-auto space-y-0.5">
          {!collapsed && (
            <div className="text-[10px] font-bold uppercase tracking-[0.15em] px-2 pb-1 mb-1"
              style={{ color: "hsl(var(--sidebar-foreground) / 0.3)" }}>
              Command
            </div>
          )}
          {mainNav.map(({ to, label, icon: Icon }) => (
            <NavLink key={to} to={to} end={to === "/"}
              className={({ isActive }) =>
                cn("flex items-center gap-3 px-2.5 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 group", !isActive && "hover:text-white")
              }
              style={({ isActive }) => ({
                background: isActive ? "hsl(var(--sidebar-primary) / 0.15)" : "transparent",
                color: isActive ? "hsl(var(--sidebar-primary))" : "hsl(var(--sidebar-foreground) / 0.65)",
                borderLeft: isActive ? `2px solid hsl(var(--sidebar-primary))` : "2px solid transparent",
              })}>
              <Icon className="w-4 h-4 flex-shrink-0" />
              {!collapsed && <span className="flex-1 truncate">{label}</span>}
              {!collapsed && <ChevronRight className="w-3 h-3 opacity-0 group-hover:opacity-50 transition-opacity" />}
            </NavLink>
          ))}

          <div className="mt-4">
            {!collapsed && (
              <div className="text-[10px] font-bold uppercase tracking-[0.15em] px-2 pb-1 mb-1"
                style={{ color: "hsl(var(--sidebar-foreground) / 0.3)" }}>
                Tools
              </div>
            )}
            {toolsNav.map(({ to, label, icon: Icon }) => (
              <NavLink key={to} to={to}
                className={({ isActive }) =>
                  cn("flex items-center gap-3 px-2.5 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 group", !isActive && "hover:text-white")
                }
                style={({ isActive }) => ({
                  background: isActive ? "hsl(var(--sidebar-primary) / 0.15)" : "transparent",
                  color: isActive ? "hsl(var(--sidebar-primary))" : "hsl(var(--sidebar-foreground) / 0.65)",
                  borderLeft: isActive ? `2px solid hsl(var(--sidebar-primary))` : "2px solid transparent",
                })}>
                <Icon className="w-4 h-4 flex-shrink-0" />
                {!collapsed && <span className="flex-1 truncate">{label}</span>}
                {!collapsed && <ChevronRight className="w-3 h-3 opacity-0 group-hover:opacity-50 transition-opacity" />}
              </NavLink>
            ))}
          </div>
        </nav>

        {/* Footer */}
        {!collapsed && (
          <div className="px-4 py-4 border-t-2" style={{ borderColor: "hsl(var(--sidebar-border))" }}>
            <div className="text-xs space-y-0.5" style={{ color: "hsl(var(--sidebar-foreground) / 0.35)" }}>
              <p className="font-medium" style={{ color: "hsl(var(--sidebar-foreground) / 0.5)" }}>7 Analysis Modules Active</p>
              <p>Last sync: 2 min ago</p>
            </div>
          </div>
        )}
      </aside>

      {/* Main content */}
      <main className="min-h-screen overflow-auto bg-background">
        {children}
      </main>
    </div>
  );
}
