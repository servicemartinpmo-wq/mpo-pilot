import { NavLink } from "react-router-dom";
import { useState } from "react";
import {
  LayoutDashboard, Rocket, Activity, Building2,
  Settings, Zap, ChevronRight, FileText, ToggleLeft, ToggleRight, CheckSquare
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { CompanyProfile } from "@/lib/companyStore";
import { saveProfile } from "@/lib/companyStore";
import { orgMetrics } from "@/lib/pmoData";

const navItems = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/initiatives", label: "Initiatives", icon: Rocket },
  { to: "/diagnostics", label: "Diagnostics", icon: Activity },
  { to: "/action-items", label: "Action Items", icon: CheckSquare },
  { to: "/departments", label: "Departments", icon: Building2 },
  { to: "/reports", label: "Reports", icon: FileText },
  { to: "/admin", label: "Admin", icon: Settings },
];

interface Props {
  children: React.ReactNode;
  profile: CompanyProfile;
  onProfileUpdate: (p: CompanyProfile) => void;
}

export default function AppLayout({ children, profile, onProfileUpdate }: Props) {
  const [analyticsOn, setAnalyticsOn] = useState(profile.analyticsEnabled);

  function toggleAnalytics() {
    const updated = { ...profile, analyticsEnabled: !analyticsOn };
    setAnalyticsOn(!analyticsOn);
    saveProfile(updated);
    onProfileUpdate(updated);
  }

  return (
    <div className="pmo-grid">
      {/* Sidebar */}
      <aside className="flex flex-col h-screen sticky top-0 border-r-2" style={{ background: "hsl(var(--sidebar-background))", borderColor: "hsl(var(--sidebar-border))" }}>
        {/* Logo / Brand */}
        <div className="px-5 pt-6 pb-4 border-b-2" style={{ borderColor: "hsl(var(--sidebar-border))" }}>
          <div className="flex items-center gap-2.5 mb-1">
            <div className="w-7 h-7 rounded flex items-center justify-center" style={{ background: "var(--gradient-electric)" }}>
              <Zap className="w-3.5 h-3.5 text-white" />
            </div>
            <div className="min-w-0">
              <span className="text-xs font-bold tracking-widest uppercase block truncate" style={{ color: "hsl(var(--sidebar-primary))" }}>
                {profile.orgName
                  ? (profile.orgName.length > 18 ? profile.orgName.slice(0, 17) + "…" : profile.orgName)
                  : "MARTIN"}
              </span>
            </div>
          </div>
          {profile.currentState && (
            <p className="text-xs mt-1 leading-snug line-clamp-2" style={{ color: "hsl(var(--sidebar-foreground) / 0.45)" }}>
              {profile.currentState}
            </p>
          )}
          <p className="text-xs mt-0.5" style={{ color: "hsl(var(--sidebar-foreground) / 0.4)" }}>
            PMO-OPs Command Center
          </p>
        </div>

        {/* Live status + Analytics toggle */}
        <div className="px-4 py-3 border-b-2 space-y-2.5" style={{ borderColor: "hsl(var(--sidebar-border))" }}>
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2 flex-shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ background: "hsl(var(--signal-green))" }} />
              <span className="relative inline-flex rounded-full h-2 w-2" style={{ background: "hsl(var(--signal-green))" }} />
            </span>
            <span className="text-xs flex-1" style={{ color: "hsl(var(--sidebar-foreground) / 0.55)" }}>
              System Active
            </span>
            <button
              onClick={toggleAnalytics}
              className="flex items-center gap-1.5 text-xs transition-colors"
              style={{ color: analyticsOn ? "hsl(var(--sidebar-primary))" : "hsl(var(--sidebar-foreground) / 0.4)" }}
              title="Toggle Analytics"
            >
              {analyticsOn ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
              <span>Analytics</span>
            </button>
          </div>

          {/* Org health mini bar */}
          <div>
            <div className="flex justify-between text-xs mb-1" style={{ color: "hsl(var(--sidebar-foreground) / 0.45)" }}>
              <span>Org Health</span>
              <span className="font-mono" style={{ color: "hsl(var(--sidebar-primary))" }}>{orgMetrics.overallMaturityScore}%</span>
            </div>
            <div className="h-1 rounded-full" style={{ background: "hsl(var(--sidebar-border))" }}>
              <div className="h-full rounded-full transition-all duration-700"
                style={{ width: `${orgMetrics.overallMaturityScore}%`, background: "hsl(var(--sidebar-primary))" }} />
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/"}
              className={({ isActive }) =>
                cn("flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 group",
                  isActive ? "" : "hover:text-white"
                )
              }
              style={({ isActive }) => ({
                background: isActive ? "hsl(var(--sidebar-primary) / 0.15)" : "transparent",
                color: isActive ? "hsl(var(--sidebar-primary))" : "hsl(var(--sidebar-foreground) / 0.65)",
                borderLeft: isActive ? `2px solid hsl(var(--sidebar-primary))` : "2px solid transparent",
              })}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              <span className="flex-1">{label}</span>
              <ChevronRight className="w-3 h-3 opacity-0 group-hover:opacity-50 transition-opacity" />
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div className="px-5 py-4 border-t-2" style={{ borderColor: "hsl(var(--sidebar-border))" }}>
          <div className="text-xs space-y-0.5" style={{ color: "hsl(var(--sidebar-foreground) / 0.35)" }}>
            <p className="font-medium" style={{ color: "hsl(var(--sidebar-foreground) / 0.5)" }}>
              7 Analysis Modules Active
            </p>
            <p>Last sync: 2 min ago</p>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="min-h-screen overflow-auto">
        {children}
      </main>
    </div>
  );
}
