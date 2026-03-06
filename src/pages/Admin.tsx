import { frameworks, departments, orgMetrics } from "@/lib/pmoData";
import { cn } from "@/lib/utils";
import {
  Settings,
  Database,
  Cpu,
  Users,
  FileText,
  Shield,
  Building2,
  AlertTriangle,
  CheckCircle,
  Clock,
} from "lucide-react";

function AdminSection({ title, icon: Icon, children }: { title: string; icon: React.ElementType; children: React.ReactNode }) {
  return (
    <div className="bg-card rounded-lg border shadow-card">
      <div className="px-4 py-3 border-b flex items-center gap-2">
        <Icon className="w-4 h-4 text-electric-blue" />
        <h2 className="text-sm font-semibold text-foreground">{title}</h2>
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}

export default function Admin() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-xl font-bold text-foreground mb-0.5">Admin</h1>
        <p className="text-sm text-muted-foreground">System configuration · Data management · Framework settings</p>
      </div>

      {/* System health */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Reasoning Engine", status: "Operational", icon: Cpu, ok: true },
          { label: "Data Layer", status: "Synced", icon: Database, ok: true },
          { label: "Framework Logic", status: "7/7 Active", icon: Shield, ok: true },
          { label: "Signal Detection", status: "Live", icon: AlertTriangle, ok: true },
        ].map(({ label, status, icon: Icon, ok }) => (
          <div key={label} className="bg-card rounded-lg border shadow-card p-3">
            <div className="flex items-center gap-2 mb-2">
              <Icon className="w-4 h-4 text-muted-foreground" />
              {ok
                ? <CheckCircle className="w-3.5 h-3.5 text-signal-green ml-auto" />
                : <AlertTriangle className="w-3.5 h-3.5 text-signal-red ml-auto" />}
            </div>
            <div className="text-sm font-medium text-foreground">{label}</div>
            <div className={cn("text-xs", ok ? "text-signal-green" : "text-signal-red")}>{status}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Framework configuration */}
        <AdminSection title="Framework Engine Configuration" icon={Cpu}>
          <div className="space-y-3">
            {frameworks.map((fw) => (
              <div key={fw.id} className="flex items-center gap-3">
                <div className="flex-1">
                  <div className="text-sm font-medium text-foreground">{fw.name}</div>
                  <div className="text-xs text-muted-foreground">{fw.description.slice(0, 60)}…</div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={cn(
                    "text-xs px-2 py-0.5 rounded",
                    fw.status === "Alerting" ? "bg-signal-red/10 text-signal-red" :
                    fw.status === "Monitoring" ? "bg-signal-yellow/10 text-signal-yellow" :
                    "bg-signal-green/10 text-signal-green"
                  )}>
                    {fw.status}
                  </span>
                  <div className="w-9 h-5 rounded-full bg-electric-blue/20 flex items-center justify-end px-0.5 cursor-pointer">
                    <div className="w-4 h-4 rounded-full bg-electric-blue" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </AdminSection>

        {/* Department configuration */}
        <AdminSection title="Department Registry" icon={Building2}>
          <div className="space-y-2">
            {departments.slice(0, 8).map((dept) => (
              <div key={dept.id} className="flex items-center justify-between py-1.5">
                <div>
                  <div className="text-sm font-medium text-foreground">{dept.name}</div>
                  <div className="text-xs text-muted-foreground">{dept.head} · {dept.headcount} FTE</div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-muted-foreground">{dept.activeInitiatives} initiatives</span>
                  <button className="text-xs text-electric-blue hover:underline">Edit</button>
                </div>
              </div>
            ))}
            <button className="w-full text-xs text-electric-blue text-center py-2 border border-dashed rounded-lg border-electric-blue/30 hover:bg-electric-blue/5 transition-colors">
              + Add Department
            </button>
          </div>
        </AdminSection>

        {/* Data inputs */}
        <AdminSection title="Data Input Layer" icon={Database}>
          <div className="space-y-2">
            {[
              { label: "Initiatives Register", records: 10, lastSync: "2 min ago", status: "ok" },
              { label: "Department Data", records: 14, lastSync: "2 min ago", status: "ok" },
              { label: "Budget & Finance", records: 9, lastSync: "15 min ago", status: "ok" },
              { label: "SOPs & Procedures", records: 47, lastSync: "1 hour ago", status: "warning" },
              { label: "OKR Framework", records: 32, lastSync: "30 min ago", status: "ok" },
              { label: "Authority Matrix", records: 14, lastSync: "1 hour ago", status: "ok" },
              { label: "Dependency Map", records: 8, lastSync: "5 min ago", status: "ok" },
            ].map(({ label, records, lastSync, status }) => (
              <div key={label} className="flex items-center gap-3 py-1.5">
                <FileText className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                <div className="flex-1">
                  <div className="text-sm font-medium text-foreground">{label}</div>
                  <div className="text-xs text-muted-foreground">{records} records · synced {lastSync}</div>
                </div>
                <span className={cn(
                  "w-2 h-2 rounded-full",
                  status === "ok" ? "bg-signal-green" : "bg-signal-yellow"
                )} />
              </div>
            ))}
          </div>
        </AdminSection>

        {/* User & access */}
        <AdminSection title="Access & Roles" icon={Users}>
          <div className="space-y-3">
            {[
              { name: "Sarah Chen", role: "Executive — CEO", access: "Full", active: true },
              { name: "Marcus Osei", role: "Strategy Lead", access: "Strategy + Diagnostics", active: true },
              { name: "James Okoye", role: "Program Director", access: "Delivery + Initiatives", active: true },
              { name: "Elena Vasquez", role: "CFO", access: "Finance + Reporting", active: true },
              { name: "PMO Analyst", role: "Analyst", access: "Read Only", active: false },
            ].map(({ name, role, access, active }) => (
              <div key={name} className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-full bg-secondary flex items-center justify-center text-xs font-semibold text-muted-foreground flex-shrink-0">
                  {name.split(" ").map((n) => n[0]).join("")}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-foreground">{name}</div>
                  <div className="text-xs text-muted-foreground">{role} · {access}</div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={cn(
                    "text-xs px-1.5 py-0.5 rounded",
                    active ? "bg-signal-green/10 text-signal-green" : "bg-muted text-muted-foreground"
                  )}>
                    {active ? "Active" : "Inactive"}
                  </span>
                  <button className="text-xs text-electric-blue hover:underline">Edit</button>
                </div>
              </div>
            ))}
            <button className="w-full text-xs text-electric-blue text-center py-2 border border-dashed rounded-lg border-electric-blue/30 hover:bg-electric-blue/5 transition-colors">
              + Invite User
            </button>
          </div>
        </AdminSection>
      </div>

      {/* System log */}
      <AdminSection title="System Audit Log" icon={Clock}>
        <div className="space-y-1.5 font-mono text-xs">
          {[
            { time: "2025-03-06 14:02", msg: "Signal Detection triggered: Capacity Constraint — Program Delivery (Score: 94)", level: "red" },
            { time: "2025-03-06 13:48", msg: "Framework BSC: Strategic Misalignment detected in Marketing OKR alignment", level: "red" },
            { time: "2025-03-06 13:21", msg: "Dependency bottleneck escalated: INI-002 blocked 19 days", level: "yellow" },
            { time: "2025-03-06 12:15", msg: "Insight Advisory generated for Sales pipeline velocity decline", level: "yellow" },
            { time: "2025-03-06 11:40", msg: "Department sync complete: 14 departments refreshed", level: "green" },
            { time: "2025-03-06 10:30", msg: "Framework Engine: Theory of Constraints activated for Program Delivery", level: "blue" },
            { time: "2025-03-06 09:00", msg: "Daily reasoning pipeline executed: 8 insights generated", level: "green" },
          ].map(({ time, msg, level }) => (
            <div key={time} className="flex items-start gap-3 py-1.5 border-b border-border/50 last:border-0">
              <span className="text-muted-foreground flex-shrink-0 w-36">{time}</span>
              <span className={cn(
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
      </AdminSection>
    </div>
  );
}
