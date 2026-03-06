import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Rocket,
  Activity,
  Building2,
  Settings,
  Zap,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/initiatives", label: "Initiatives", icon: Rocket },
  { to: "/diagnostics", label: "Diagnostics", icon: Activity },
  { to: "/departments", label: "Departments", icon: Building2 },
  { to: "/admin", label: "Admin", icon: Settings },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="pmo-grid">
      {/* Sidebar */}
      <aside className="flex flex-col h-screen sticky top-0" style={{ background: "hsl(var(--sidebar-background))" }}>
        {/* Logo */}
        <div className="px-5 pt-6 pb-5 border-b" style={{ borderColor: "hsl(var(--sidebar-border))" }}>
          <div className="flex items-center gap-2.5 mb-1">
            <div className="w-7 h-7 rounded flex items-center justify-center" style={{ background: "var(--gradient-electric)" }}>
              <Zap className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="text-xs font-semibold tracking-widest uppercase" style={{ color: "hsl(var(--sidebar-primary))" }}>
              MARTIN
            </span>
          </div>
          <p className="text-xs mt-0.5 leading-tight" style={{ color: "hsl(var(--sidebar-foreground) / 0.55)" }}>
            PMO-OPs Command Center
          </p>
        </div>

        {/* Live indicator */}
        <div className="px-5 py-3 flex items-center gap-2 border-b" style={{ borderColor: "hsl(var(--sidebar-border))" }}>
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ background: "hsl(var(--signal-green))" }} />
            <span className="relative inline-flex rounded-full h-2 w-2" style={{ background: "hsl(var(--signal-green))" }} />
          </span>
          <span className="text-xs" style={{ color: "hsl(var(--sidebar-foreground) / 0.55)" }}>
            Reasoning Engine Active
          </span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/"}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-all duration-150 group",
                  isActive
                    ? "text-white"
                    : "hover:text-white"
                )
              }
              style={({ isActive }) => ({
                background: isActive ? "hsl(var(--sidebar-primary) / 0.15)" : "transparent",
                color: isActive ? "hsl(var(--sidebar-primary))" : "hsl(var(--sidebar-foreground) / 0.7)",
                borderLeft: isActive ? `2px solid hsl(var(--sidebar-primary))` : "2px solid transparent",
              })}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              <span className="flex-1">{label}</span>
              <ChevronRight className="w-3 h-3 opacity-0 group-hover:opacity-60 transition-opacity" />
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div className="px-5 py-4 border-t" style={{ borderColor: "hsl(var(--sidebar-border))" }}>
          <div className="text-xs space-y-0.5" style={{ color: "hsl(var(--sidebar-foreground) / 0.4)" }}>
            <p className="font-medium" style={{ color: "hsl(var(--sidebar-foreground) / 0.6)" }}>
              7 Frameworks Active
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
