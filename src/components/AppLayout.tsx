import { NavLink } from "react-router-dom";
import { useState } from "react";
import {
  LayoutDashboard, Rocket, Activity, Building2,
  Settings, Zap, ChevronRight, FileText, ToggleLeft, ToggleRight, CheckSquare,
  BookOpen, Plug, Users, ChevronLeft, Headphones, TrendingUp, GitBranch, Database } from
"lucide-react";
import { cn } from "@/lib/utils";
import type { CompanyProfile } from "@/lib/companyStore";
import { saveProfile } from "@/lib/companyStore";
import { orgMetrics } from "@/lib/pmoData";

const navItems = [
{ to: "/", label: "Dashboard", icon: LayoutDashboard, group: "main" },
{ to: "/initiatives", label: "Initiatives", icon: Rocket, group: "main" },
{ to: "/action-items", label: "Action Items", icon: CheckSquare, group: "main" },
{ to: "/departments", label: "Departments", icon: Building2, group: "main" },
{ to: "/team", label: "Team", icon: Users, group: "main" },
{ to: "/diagnostics", label: "Diagnostics", icon: Activity, group: "main" },
{ to: "/reports", label: "Reports", icon: FileText, group: "tools" },
{ to: "/knowledge", label: "Resource Hub", icon: BookOpen, group: "tools" },
{ to: "/workflows", label: "Workflows", icon: GitBranch, group: "tools" },
{ to: "/advisory", label: "Advisory", icon: Headphones, group: "tools" },
{ to: "/integrations", label: "Integrations", icon: Plug, group: "tools" },
{ to: "/admin", label: "Systems", icon: Settings, group: "tools" },
{ to: "/superbase", label: "Knowledge Engine", icon: Database, group: "tools" }];


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

  const mainNav = navItems.filter((n) => n.group === "main");
  const toolsNav = navItems.filter((n) => n.group === "tools");

  return (
    <div className="pmo-grid" style={{ gridTemplateColumns: collapsed ? "56px 1fr" : "220px 1fr" }}>

      {/* ── Sidebar ── */}
      <aside
        className="flex flex-col h-screen sticky top-0 overflow-hidden transition-all duration-300"
        style={{
          background: "hsl(var(--sidebar-background))",
          borderRight: "1px solid hsl(var(--sidebar-border))",
          width: collapsed ? 56 : 220
        }}>
        

        {/* Brand */}
        <div
          className="flex items-center gap-3 px-3.5 py-4 border-b"
          style={{ borderColor: "hsl(var(--sidebar-border))" }}>
          
          <div
            className="w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0"
            style={{ background: "var(--gradient-electric)" }}>
            
            <Zap className="w-3.5 h-3.5 text-white" />
          </div>

          {!collapsed &&
          <div className="flex-1 min-w-0">
              <div
              className="text-[11px] font-black tracking-[0.16em] uppercase truncate"
              style={{ color: "hsl(var(--sidebar-primary))" }}>
              
                {profile.orgName ?
              profile.orgName.length > 14 ?
              profile.orgName.slice(0, 13) + "…" :
              profile.orgName :
              "MARTIN"}
              </div>
              <div
              className="text-[10px] mt-0.5 font-medium tracking-wide text-white"
              style={{ color: "hsl(var(--sidebar-foreground) / 0.35)" }}>
              
                PMO Command
              </div>
            </div>
          }

          <button
            onClick={() => setCollapsed((c) => !c)}
            className="flex-shrink-0 w-5 h-5 rounded flex items-center justify-center transition-opacity hover:opacity-100 opacity-40"
            style={{ color: "hsl(var(--sidebar-foreground))" }}>
            
            {collapsed ?
            <ChevronRight className="w-3 h-3" /> :
            <ChevronLeft className="w-3 h-3" />}
          </button>
        </div>

        {/* Health mini-bar */}
        {!collapsed &&
        <div
          className="px-3.5 py-3 border-b"
          style={{ borderColor: "hsl(var(--sidebar-border))" }}>
          
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-1.5">
                <span
                className="relative flex h-1.5 w-1.5">
                
                  <span
                  className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
                  style={{ background: "hsl(var(--signal-green))" }} />
                
                  <span
                  className="relative inline-flex rounded-full h-1.5 w-1.5"
                  style={{ background: "hsl(var(--signal-green))" }} />
                
                </span>
                <span
                className="text-[10px] font-medium text-white"
                style={{ color: "hsl(var(--sidebar-foreground) / 0.5)" }}>
                
                  Operational Health
                </span>
              </div>
              <span
              className="text-[10px] font-mono font-bold"
              style={{ color: "hsl(var(--sidebar-primary))" }}>
              
                {orgMetrics.overallMaturityScore}
              </span>
            </div>
            <div
            className="h-0.5 rounded-full overflow-hidden"
            style={{ background: "hsl(var(--sidebar-border))" }}>
            
              <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${orgMetrics.overallMaturityScore}%`,
                background: "hsl(var(--sidebar-primary))"
              }} />
            
            </div>

            {/* Analytics toggle */}
            <button
            onClick={toggleAnalytics}
            className="mt-2.5 flex items-center gap-1.5 text-[10px] font-medium transition-opacity hover:opacity-100"
            style={{
              color: analyticsOn ?
              "hsl(var(--sidebar-primary))" :
              "hsl(var(--sidebar-foreground) / 0.35)"
            }}>
            
              {analyticsOn ?
            <ToggleRight className="w-3.5 h-3.5" /> :
            <ToggleLeft className="w-3.5 h-3.5" />}
              Analytics {analyticsOn ? "on" : "off"}
            </button>
          </div>
        }

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">

          {!collapsed &&
          <p
            className="text-[9px] font-black uppercase tracking-[0.2em] px-2 pb-1 pt-1"
            style={{ color: "hsl(var(--sidebar-foreground) / 0.25)" }}>
            
              Command
            </p>
          }

          {mainNav.map(({ to, label, icon: Icon }) =>
          <NavLink
            key={to}
            to={to}
            end={to === "/"}
            className={({ isActive }) =>
            cn(
              "flex items-center gap-2.5 px-2 py-2 rounded-md text-[13px] font-medium transition-all duration-150 group",
              !isActive && "hover:bg-white/5"
            )
            }
            style={({ isActive }) => ({
              color: isActive ?
              "hsl(var(--sidebar-primary))" :
              "hsl(var(--sidebar-foreground) / 0.6)",
              background: isActive ? "hsl(var(--sidebar-primary) / 0.12)" : undefined
            })}>
            
              <Icon className="w-4 h-4 flex-shrink-0" />
              {!collapsed &&
            <span className="flex-1 truncate">{label}</span>
            }
              {!collapsed &&
            <ChevronRight className="w-2.5 h-2.5 opacity-0 group-hover:opacity-30 transition-opacity" />
            }
            </NavLink>
          )}

          <div className="mt-3">
            {!collapsed &&
            <p
              className="text-[9px] font-black uppercase tracking-[0.2em] px-2 pb-1 pt-2"
              style={{ color: "hsl(var(--sidebar-foreground) / 0.25)" }}>
              
                Tools
              </p>
            }
            {toolsNav.map(({ to, label, icon: Icon }) =>
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
              cn(
                "flex items-center gap-2.5 px-2 py-2 rounded-md text-[13px] font-medium transition-all duration-150 group",
                !isActive && "hover:bg-white/5"
              )
              }
              style={({ isActive }) => ({
                color: isActive ?
                "hsl(var(--sidebar-primary))" :
                "hsl(var(--sidebar-foreground) / 0.6)",
                background: isActive ? "hsl(var(--sidebar-primary) / 0.12)" : undefined
              })}>
              
                <Icon className="w-4 h-4 flex-shrink-0" />
                {!collapsed &&
              <span className="flex-1 truncate">{label}</span>
              }
                {!collapsed &&
              <ChevronRight className="w-2.5 h-2.5 opacity-0 group-hover:opacity-30 transition-opacity" />
              }
              </NavLink>
            )}
          </div>
        </nav>

        {/* Footer */}
        {!collapsed &&
        <div
          className="px-3.5 py-3 border-t"
          style={{ borderColor: "hsl(var(--sidebar-border))" }}>
          
            <div
            className="flex items-center gap-1.5 text-[10px]"
            style={{ color: "hsl(var(--sidebar-foreground) / 0.3)" }}>
            
              <TrendingUp className="w-3 h-3" />
              <span>7 analysis modules active</span>
            </div>
          </div>
        }
      </aside>

      {/* Main content */}
      <main className="min-h-screen overflow-auto bg-background">
        {children}
      </main>
    </div>);

}