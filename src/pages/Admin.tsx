import { frameworks, departments, orgMetrics, orgProfile, authorityMatrix, sopRecords, actionItems, governanceLogs } from "@/lib/pmoData";
import { loadProfile, saveProfile, applyAccentColor, applyFont, resetOnboarding } from "@/lib/companyStore";
import type { CompanyProfile } from "@/lib/companyStore";
import { cn } from "@/lib/utils";
import { useState, useRef } from "react";
import {
  Settings, Database, Cpu, Users, FileText, Shield, Building2,
  AlertTriangle, CheckCircle, Clock, Target, GitBranch, BookOpen,
  BarChart3
} from "lucide-react";


function AdminSection({ title, icon: Icon, children, badge }: { title: string; icon: React.ElementType; children: React.ReactNode; badge?: React.ReactNode }) {
  return (
    <div className="bg-card rounded-lg border shadow-card">
      <div className="px-4 py-3 border-b flex items-center gap-2">
        <Icon className="w-4 h-4 text-electric-blue" />
        <h2 className="text-sm font-semibold text-foreground">{title}</h2>
        {badge && <div className="ml-auto">{badge}</div>}
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}

export default function Admin() {
  const [activeTab, setActiveTab] = useState<"system" | "org" | "frameworks" | "authority" | "sops" | "access" | "customize">("system");
  const [companyProfile, setCompanyProfile] = useState<CompanyProfile>(loadProfile());
  const fileRef = useRef<HTMLInputElement | null>(null);
  function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setCompanyProfile(p => ({ ...p, logo: ev.target?.result as string }));
    reader.readAsDataURL(file);
  }
  function saveCustomize() {
    saveProfile(companyProfile);
    applyAccentColor(companyProfile.accentHue);
    applyFont(companyProfile.font);
  }

  const pendingActions = actionItems.filter(a => a.status !== "Completed").length;
  const openGovItems = governanceLogs.filter(g => g.status !== "Resolved").length;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground mb-0.5">Admin</h1>
          <p className="text-sm text-muted-foreground">System configuration · Organization profile · Authority matrix · Data management</p>
        </div>
        <div className="flex gap-2 text-xs">
          <span className="bg-signal-yellow/10 text-signal-yellow border border-signal-yellow/30 px-2 py-1 rounded font-medium">
            {pendingActions} Pending Actions
          </span>
          <span className="bg-signal-red/10 text-signal-red border border-signal-red/30 px-2 py-1 rounded font-medium">
            {openGovItems} Open Gov Items
          </span>
        </div>
      </div>

      {/* System health summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Analytics Engine", status: "Operational", icon: Cpu, ok: true },
          { label: "Data Layer", status: "Synced", icon: Database, ok: true },
          { label: "Analysis Modules", status: "7/7 Active", icon: Shield, ok: true },
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

      {/* Tab nav */}
      <div className="flex flex-wrap gap-1 border-b pb-0">
        {([
          { key: "system", label: "System" },
          { key: "org", label: "Org Profile" },
          { key: "frameworks", label: "Analysis Modules" },
          { key: "authority", label: "Authority Matrix" },
          { key: "sops", label: "SOP Library" },
          { key: "access", label: "Access & Roles" },
          { key: "customize", label: "Customize" },
        ] as const).map(({ key, label }) => (
          <button key={key} onClick={() => setActiveTab(key)}
            className={cn("text-sm px-4 py-2.5 font-medium transition-all border-b-2 -mb-px",
              activeTab === key ? "border-electric-blue text-electric-blue" : "border-transparent text-muted-foreground hover:text-foreground"
            )}>
            {label}
          </button>
        ))}
      </div>

      {/* SYSTEM TAB */}
      {activeTab === "system" && (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* Data inputs */}
          <AdminSection title="Data Input Layer" icon={Database}>
            <div className="space-y-2">
              {[
                { label: "Initiatives Register", records: 10, lastSync: "2 min ago", status: "ok" },
                { label: "Department Data", records: 14, lastSync: "2 min ago", status: "ok" },
                { label: "Budget & Finance", records: 9, lastSync: "15 min ago", status: "ok" },
                { label: "Action Items", records: actionItems.length, lastSync: "5 min ago", status: "ok" },
                { label: "Governance Logs", records: governanceLogs.length, lastSync: "3 min ago", status: "ok" },
                { label: "SOPs & Procedures", records: sopRecords.length, lastSync: "1 hour ago", status: "warning" },
                { label: "Goals Tracking", records: 32, lastSync: "30 min ago", status: "ok" },
                { label: "Authority Matrix", records: authorityMatrix.length, lastSync: "1 hour ago", status: "ok" },
                { label: "Dependency Map", records: 8, lastSync: "5 min ago", status: "ok" },
                { label: "RACI Matrices", records: 10, lastSync: "10 min ago", status: "ok" },
              ].map(({ label, records, lastSync, status }) => (
                <div key={label} className="flex items-center gap-3 py-1.5">
                  <FileText className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                  <div className="flex-1">
                    <div className="text-sm font-medium text-foreground">{label}</div>
                    <div className="text-xs text-muted-foreground">{records} records · synced {lastSync}</div>
                  </div>
                  <span className={cn("w-2 h-2 rounded-full", status === "ok" ? "bg-signal-green" : "bg-signal-yellow")} />
                </div>
              ))}
            </div>
          </AdminSection>

          {/* System audit log */}
          <AdminSection title="System Audit Log" icon={Clock}>
            <div className="space-y-1.5 font-mono text-xs">
              {[
                { time: "2025-03-06 14:02", msg: "Signal Detection triggered: Capacity Constraint — Program Delivery (Score: 94)", level: "red" },
                { time: "2025-03-06 13:48", msg: "Balanced Scorecard Module: Strategic Misalignment detected in Marketing OKR alignment", level: "red" },
                { time: "2025-03-06 13:21", msg: "Dependency bottleneck escalated: INI-002 blocked 19 days", level: "yellow" },
                { time: "2025-03-06 12:15", msg: "Advisory generated for Sales pipeline velocity decline", level: "yellow" },
                { time: "2025-03-06 11:40", msg: "Department sync complete: 14 departments refreshed", level: "green" },
                { time: "2025-03-06 10:30", msg: "Bottleneck Analysis Module: Theory of Constraints activated for Program Delivery", level: "blue" },
                { time: "2025-03-06 09:00", msg: "Daily analysis pipeline executed: 8 insights generated", level: "green" },
                { time: "2025-03-05 17:22", msg: "Governance log gov-001 escalated: API Dependency SLA Breach", level: "red" },
                { time: "2025-03-05 15:10", msg: "Action items generated for 8 active insights", level: "blue" },
                { time: "2025-03-05 09:00", msg: "SOP adherence scan: 3 departments below 70% threshold", level: "yellow" },
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

          {/* Org metrics summary */}
          <AdminSection title="Operational Intelligence Snapshot" icon={BarChart3}>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Overall Maturity Score", value: `${orgMetrics.overallMaturityScore}/100`, signal: orgMetrics.overallMaturityScore >= 80 ? "text-signal-green" : orgMetrics.overallMaturityScore >= 60 ? "text-signal-yellow" : "text-signal-red" },
                { label: "Active Initiatives", value: orgMetrics.activeInitiatives, signal: "text-foreground" },
                { label: "Blocked Tasks", value: orgMetrics.blockedTasks, signal: "text-signal-yellow" },
                { label: "Governance Open Items", value: orgMetrics.governanceOpenItems, signal: "text-signal-red" },
                { label: "Total Headcount", value: orgMetrics.totalHeadcount, signal: "text-foreground" },
                { label: "Avg Execution Health", value: `${orgMetrics.avgExecutionHealth}%`, signal: "text-signal-yellow" },
                { label: "SOP Coverage", value: `${orgMetrics.sopCoverage}%`, signal: "text-signal-yellow" },
                { label: "Avg SOP Adherence", value: `${orgMetrics.avgSopAdherence}%`, signal: "text-signal-yellow" },
              ].map(({ label, value, signal }) => (
                <div key={label} className="bg-secondary rounded-lg p-2.5">
                  <div className="text-xs text-muted-foreground mb-0.5">{label}</div>
                  <div className={cn("text-sm font-bold font-mono", signal)}>{value}</div>
                </div>
              ))}
            </div>
          </AdminSection>

          {/* Decision deadlines */}
          <AdminSection title="Decision Deadlines" icon={Target}
            badge={<span className="text-xs text-signal-red bg-signal-red/10 px-2 py-0.5 rounded font-medium">{orgMetrics.decisionDeadlines} pending</span>}>
            <div className="space-y-3">
              {[
                { title: "Cloud Migration Scope", deadline: "2025-03-10", owner: "Sarah Chen", urgency: "red", type: "Board Decision" },
                { title: "Marketing Budget Reallocation", deadline: "2025-03-14", owner: "Elena Vasquez", urgency: "yellow", type: "CFO Approval" },
                { title: "Tiered Approval Authority Policy", deadline: "2025-03-18", owner: "David Kim", urgency: "yellow", type: "Legal Sign-Off" },
              ].map(item => (
                <div key={item.title} className="flex items-start gap-3 p-3 rounded-lg bg-secondary">
                  <div className={cn("w-2 h-2 rounded-full mt-1 flex-shrink-0",
                    item.urgency === "red" ? "bg-signal-red" : "bg-signal-yellow"
                  )} />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-foreground">{item.title}</div>
                    <div className="text-xs text-muted-foreground">{item.type} · {item.owner}</div>
                  </div>
                  <span className="text-xs font-mono text-muted-foreground flex-shrink-0">{item.deadline}</span>
                </div>
              ))}
            </div>
          </AdminSection>
        </div>
      )}

      {/* ORG PROFILE TAB */}
      {activeTab === "org" && (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <AdminSection title="Organization Profile" icon={Building2}>
            <div className="space-y-4">
              <div>
                <div className="text-xs text-muted-foreground mb-0.5">Organization Name</div>
                <div className="text-sm font-semibold text-foreground">{orgProfile.name}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground mb-0.5">Org Type</div>
                <div className="text-sm text-foreground">{orgProfile.orgType}</div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="text-xs text-muted-foreground mb-0.5">Team Size</div>
                  <div className="text-sm font-mono font-bold text-foreground">{orgProfile.teamSize}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground mb-0.5">Revenue Range</div>
                  <div className="text-sm font-mono font-bold text-foreground">{orgProfile.revenueRange}</div>
                </div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground mb-1">Mission</div>
                <div className="text-sm text-foreground leading-relaxed">{orgProfile.mission}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground mb-1">Vision</div>
                <div className="text-sm text-foreground leading-relaxed">{orgProfile.vision}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground mb-1.5">SOP Status</div>
                <span className={cn("text-xs px-2 py-0.5 rounded font-medium",
                  orgProfile.hasSops ? "text-signal-green bg-signal-green/10" : "text-signal-red bg-signal-red/10"
                )}>{orgProfile.hasSops ? "SOPs Active" : "No SOPs"}</span>
              </div>
            </div>
          </AdminSection>

          <AdminSection title="Strategic Pillars" icon={Target}>
            <div className="space-y-2">
              {orgProfile.strategicPillars.map((pillar, i) => {
                const count = frameworks.filter(f => true).length; // placeholder
                const iniCount = [10, 4, 3, 2, 3][i];
                return (
                  <div key={pillar} className="flex items-center gap-3 p-3 bg-secondary rounded-lg">
                    <div className="w-6 h-6 rounded bg-electric-blue/10 flex items-center justify-center text-xs font-bold text-electric-blue flex-shrink-0">
                      {i + 1}
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-foreground">{pillar}</div>
                    </div>
                    <span className="text-xs font-mono text-muted-foreground">{iniCount} initiatives</span>
                  </div>
                );
              })}
            </div>
          </AdminSection>

          <AdminSection title="Department Registry" icon={Building2}>
            <div className="space-y-2">
              {departments.map((dept) => (
                <div key={dept.id} className="flex items-center justify-between py-1.5">
                  <div>
                    <div className="text-sm font-medium text-foreground">{dept.name}</div>
                    <div className="text-xs text-muted-foreground">{dept.head} · {dept.headcount} FTE · {dept.authorityLevel}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-muted-foreground">{dept.activeInitiatives} initiatives</span>
                    <span className={cn("text-xs px-1.5 py-0.5 rounded font-medium",
                      dept.sopAdherence >= 80 ? "text-signal-green bg-signal-green/10" :
                      dept.sopAdherence >= 60 ? "text-signal-yellow bg-signal-yellow/10" :
                      "text-signal-red bg-signal-red/10"
                    )}>{dept.sopAdherence}%</span>
                  </div>
                </div>
              ))}
              <button className="w-full text-xs text-electric-blue text-center py-2 border border-dashed rounded-lg border-electric-blue/30 hover:bg-electric-blue/5 transition-colors">
                + Add Department
              </button>
            </div>
          </AdminSection>
        </div>
      )}

      {/* FRAMEWORKS TAB */}
      {activeTab === "frameworks" && (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <AdminSection title="Framework Engine Configuration" icon={Cpu}>
            <div className="space-y-4">
              {frameworks.map((fw) => (
                <div key={fw.id} className="border rounded-lg p-3">
                  <div className="flex items-start gap-3 mb-2">
                    <div className="flex-1">
                      <div className="text-sm font-semibold text-foreground">{fw.name}</div>
                      <div className="text-xs text-muted-foreground">{fw.expertDomain}</div>
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
                  <div className="text-xs text-muted-foreground mb-2">{fw.description}</div>
                  <div className="flex flex-wrap gap-1 mb-1">
                    {fw.coverage.map(c => (
                      <span key={c} className="text-xs bg-secondary text-muted-foreground px-1.5 py-0.5 rounded">{c}</span>
                    ))}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {fw.activeInsights} active insights · Last triggered {fw.lastTriggered}
                  </div>
                </div>
              ))}
            </div>
          </AdminSection>

          <AdminSection title="Framework Diagnostic Focus Areas" icon={Target}>
            <div className="space-y-4">
              {frameworks.map(fw => (
                <div key={fw.id}>
                  <div className="text-xs font-semibold text-foreground mb-1.5">{fw.name}</div>
                  <div className="flex flex-wrap gap-1.5">
                    {fw.diagnosticFocus.map(f => (
                      <span key={f} className="text-xs text-electric-blue/80 bg-electric-blue/8 border border-electric-blue/15 px-1.5 py-0.5 rounded">{f}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </AdminSection>
        </div>
      )}

      {/* AUTHORITY MATRIX TAB */}
      {activeTab === "authority" && (
        <AdminSection title="Authority Matrix" icon={Shield}>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b bg-secondary/50">
                  <th className="text-left px-3 py-2.5 font-semibold text-muted-foreground uppercase tracking-wide">Role</th>
                  <th className="text-left px-3 py-2.5 font-semibold text-muted-foreground uppercase tracking-wide">Person</th>
                  <th className="text-left px-3 py-2.5 font-semibold text-muted-foreground uppercase tracking-wide hidden md:table-cell">Department</th>
                  <th className="text-left px-3 py-2.5 font-semibold text-muted-foreground uppercase tracking-wide">Budget Auth.</th>
                  <th className="text-left px-3 py-2.5 font-semibold text-muted-foreground uppercase tracking-wide hidden lg:table-cell">Initiative Approval</th>
                  <th className="text-left px-3 py-2.5 font-semibold text-muted-foreground uppercase tracking-wide hidden xl:table-cell">Risk Approval</th>
                  <th className="text-center px-3 py-2.5 font-semibold text-muted-foreground uppercase tracking-wide">Level</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {authorityMatrix.map(entry => (
                  <tr key={entry.role} className="hover:bg-secondary/30 transition-colors">
                    <td className="px-3 py-3">
                      <div className="font-semibold text-foreground">{entry.role}</div>
                    </td>
                    <td className="px-3 py-3 text-muted-foreground">{entry.person}</td>
                    <td className="px-3 py-3 text-muted-foreground hidden md:table-cell">{entry.department}</td>
                    <td className="px-3 py-3">
                      <span className={cn("font-medium",
                        entry.budgetAuthority === "Unlimited" ? "text-electric-blue" : "text-foreground"
                      )}>{entry.budgetAuthority}</span>
                    </td>
                    <td className="px-3 py-3 text-muted-foreground hidden lg:table-cell">{entry.initiativeApproval}</td>
                    <td className="px-3 py-3 text-muted-foreground hidden xl:table-cell">{entry.riskApproval}</td>
                    <td className="px-3 py-3 text-center">
                      <span className={cn("font-mono font-bold",
                        entry.level === "L1" ? "text-electric-blue" :
                        entry.level === "L2" ? "text-signal-green" :
                        entry.level === "L3" ? "text-signal-yellow" :
                        "text-muted-foreground"
                      )}>{entry.level}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </AdminSection>
      )}

      {/* SOPs TAB */}
      {activeTab === "sops" && (
        <AdminSection title="SOP Library" icon={BookOpen}>
          <div className="space-y-2">
            {sopRecords.map(sop => (
              <div key={sop.id} className="flex items-start gap-3 p-3 border rounded-lg hover:bg-secondary/30 transition-colors">
                <FileText className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-sm font-medium text-foreground">{sop.title}</span>
                    <span className="text-xs text-muted-foreground">v{sop.version}</span>
                    <span className={cn("text-xs px-1.5 py-0.5 rounded font-medium",
                      sop.status === "Active" ? "text-signal-green bg-signal-green/10" :
                      sop.status === "Under Review" ? "text-signal-yellow bg-signal-yellow/10" :
                      "text-signal-red bg-signal-red/10"
                    )}>{sop.status}</span>
                  </div>
                  <div className="text-xs text-muted-foreground">{sop.department} · Owner: {sop.owner} · Last reviewed: {sop.lastReviewed}</div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className={cn("text-xs font-mono font-bold",
                    sop.adherenceRate >= 80 ? "text-signal-green" : sop.adherenceRate >= 60 ? "text-signal-yellow" : "text-signal-red"
                  )}>{sop.adherenceRate}%</div>
                  <div className="text-xs text-muted-foreground">adherence</div>
                </div>
              </div>
            ))}
            <button className="w-full text-xs text-electric-blue text-center py-2.5 border border-dashed rounded-lg border-electric-blue/30 hover:bg-electric-blue/5 transition-colors mt-2">
              + Add SOP
            </button>
          </div>
        </AdminSection>
      )}

      {/* ACCESS TAB */}
      {activeTab === "access" && (
        <AdminSection title="Access & Roles" icon={Users}>
          <div className="space-y-3">
            {[
              { name: "Sarah Chen", role: "Executive — CEO", access: "Full System Access", active: true, level: "L1" },
              { name: "Marcus Osei", role: "Strategy Lead", access: "Strategy + Diagnostics + Initiatives", active: true, level: "L2" },
              { name: "James Okoye", role: "Program Director", access: "Delivery + Initiatives + Governance", active: true, level: "L3" },
              { name: "Elena Vasquez", role: "CFO", access: "Finance + Reporting + Admin", active: true, level: "L2" },
              { name: "Ryan Torres", role: "CTO", access: "IT + Systems + Initiatives", active: true, level: "L2" },
              { name: "Amara Diallo", role: "Head of HR", access: "Human Capital + Reporting", active: true, level: "L3" },
              { name: "David Kim", role: "General Counsel", access: "Legal + Governance + Compliance", active: true, level: "L2" },
              { name: "PMO Analyst", role: "Analyst", access: "Read Only", active: false, level: "L4" },
            ].map(({ name, role, access, active, level }) => (
              <div key={name} className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-full bg-secondary flex items-center justify-center text-xs font-semibold text-muted-foreground flex-shrink-0">
                  {name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-foreground">{name}</div>
                  <div className="text-xs text-muted-foreground">{role} · {access}</div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={cn("text-xs font-mono font-bold",
                    level === "L1" ? "text-electric-blue" :
                    level === "L2" ? "text-signal-green" :
                    level === "L3" ? "text-signal-yellow" :
                    "text-muted-foreground"
                  )}>{level}</span>
                  <span className={cn("text-xs px-1.5 py-0.5 rounded",
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
      )}

      {/* CUSTOMIZE TAB */}
      {activeTab === "customize" && (
        <AdminSection title="Customize Your Command Center" icon={Settings}>
          <div className="space-y-5 max-w-lg">
            <div>
              <label className="text-xs font-semibold text-foreground uppercase tracking-wide block mb-1.5">Organization Name</label>
              <input className="w-full border rounded-lg px-3 py-2.5 text-sm bg-background text-foreground focus:outline-none focus:ring-2" value={companyProfile.orgName} onChange={e => setCompanyProfile(p => ({ ...p, orgName: e.target.value }))} />
            </div>
            <div>
              <label className="text-xs font-semibold text-foreground uppercase tracking-wide block mb-1.5">Your Name</label>
              <input className="w-full border rounded-lg px-3 py-2.5 text-sm bg-background text-foreground focus:outline-none focus:ring-2" value={companyProfile.userName} onChange={e => setCompanyProfile(p => ({ ...p, userName: e.target.value }))} />
            </div>
            <div>
              <label className="text-xs font-semibold text-foreground uppercase tracking-wide block mb-2">Accent Color</label>
              <input type="range" min={0} max={359} value={companyProfile.accentHue}
                onChange={e => setCompanyProfile(p => ({ ...p, accentHue: Number(e.target.value) }))}
                className="w-full h-3 rounded-full cursor-pointer appearance-none"
                style={{ background: "linear-gradient(to right, hsl(0,90%,50%), hsl(60,90%,50%), hsl(120,90%,50%), hsl(180,90%,50%), hsl(240,90%,50%), hsl(300,90%,50%), hsl(360,90%,50%))" }} />
              <div className="w-6 h-6 rounded-full mt-2 border" style={{ background: `hsl(${companyProfile.accentHue} 90% 50%)` }} />
            </div>
            <button onClick={saveCustomize}
              className="px-4 py-2 rounded-lg text-sm font-semibold text-white transition-all hover:opacity-90"
              style={{ background: `hsl(${companyProfile.accentHue} 90% 45%)` }}>
              Save Changes
            </button>
            <button
              onClick={() => { resetOnboarding(); window.location.reload(); }}
              className="px-4 py-2 rounded-lg text-sm font-semibold border transition-all hover:bg-signal-red/10 text-signal-red border-signal-red/30">
              Reset Onboarding
            </button>
          </div>
        </AdminSection>
      )}
    </div>
  );
}
