import { useDepartments, useInitiatives, useActionItems, useInsights, useGovernanceLogs, useOrgMetrics } from "@/hooks/useLiveData";
import { formatCurrency, getScoreSignal } from "@/lib/pmoData";
import { ScoreBadge } from "@/components/ScoreBadge";
import { cn } from "@/lib/utils";
import { useState, useRef } from "react";
import {
  FileText, TrendingUp, AlertTriangle, CheckCircle, BarChart3,
  Download, ChevronDown, ChevronUp, Upload, X, Plus, Image, Folder,
  Calendar, CalendarDays, Award, Clock, DollarSign, Activity
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend, AreaChart, Area } from "recharts";

const SIGNAL_COLORS = {
  red: "hsl(var(--signal-red))", yellow: "hsl(var(--signal-yellow))",
  green: "hsl(var(--signal-green))", blue: "hsl(var(--electric-blue))",
};

type ReportTab = "executive" | "operations" | "departments" | "initiatives" | "quarterly" | "ytd" | "yearend" | "custom";

interface UploadedAsset {
  id: string;
  name: string;
  type: "text" | "file" | "image" | "folder";
  content?: string;
  size?: string;
}

function SectionCard({ title, icon: Icon, children, accent }: {
  title: string; icon: React.ElementType; children: React.ReactNode; accent?: string;
}) {
  return (
    <div className="bg-card rounded-xl border-2 border-border shadow-card overflow-hidden">
      <div className={cn("px-5 py-3.5 border-b-2 border-border flex items-center gap-2.5 bg-secondary", accent)}>
        <Icon className="w-4 h-4 text-electric-blue" />
        <h2 className="text-sm font-bold text-foreground uppercase tracking-wide">{title}</h2>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

function KpiTile({ label, value, sub, color }: { label: string; value: string | number; sub?: string; color: string }) {
  return (
    <div className="bg-secondary rounded-xl p-4 border border-border">
      <div className={cn("text-2xl font-black font-mono mb-1", color)}>{value}</div>
      <div className="text-xs font-semibold text-foreground">{label}</div>
      {sub && <div className="text-[11px] text-muted-foreground mt-0.5">{sub}</div>}
    </div>
  );
}

const ANNUAL_TREND_BASE = [
  { month: "Jan", health: 58, maturity: 50, revenue: 3.9 },
  { month: "Feb", health: 60, maturity: 51, revenue: 4.1 },
  { month: "Mar", health: 61, maturity: 54, revenue: 4.2 },
  { month: "Apr", health: 63, maturity: 55, revenue: 4.6 },
  { month: "May", health: 65, maturity: 57, revenue: 4.9 },
  { month: "Jun", health: 66, maturity: 58, revenue: 5.1 },
  { month: "Jul", health: 68, maturity: 59, revenue: 5.3 },
  { month: "Aug", health: 68, maturity: 60, revenue: 5.4 },
  { month: "Sep", health: 69, maturity: 61, revenue: 5.6 },
  { month: "Oct", health: 70, maturity: 62, revenue: 5.8 },
  { month: "Nov", health: 71, maturity: 63, revenue: 6.0 },
];

const currentYear = new Date().getFullYear();

export default function Reports() {
  const { data: initiatives = [] } = useInitiatives();
  const { data: actionItems = [] } = useActionItems();
  const { data: insights = [] } = useInsights();
  const { data: departments = [] } = useDepartments();
  const { data: governanceLogs = [] } = useGovernanceLogs();
  const { data: orgMetrics } = useOrgMetrics();

  const [tab, setTab] = useState<ReportTab>("executive");
  const [showAllInsights, setShowAllInsights] = useState(false);
  const [uploadedAssets, setUploadedAssets] = useState<UploadedAsset[]>([]);
  const [textInput, setTextInput] = useState("");
  const [reportTitle, setReportTitle] = useState("Custom Report");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const criticalInsights = insights.filter(i => i.signal === "red");
  const topInsights = insights.slice(0, showAllInsights ? insights.length : 5);
  const totalBudgetUsed = orgMetrics?.total_budget_used ?? 0;
  const totalBudgetAllocated = orgMetrics?.total_budget_allocated ?? 1;
  const budgetPct = Math.round((Number(totalBudgetUsed) / Math.max(Number(totalBudgetAllocated), 1)) * 100);
  const completedInitiatives = initiatives.filter(i => i.status === "Completed").length;
  const onTrackInitiatives = initiatives.filter(i => i.status === "On Track").length;
  const blockedInitiatives = initiatives.filter(i => i.status === "Blocked").length;
  const pendingActions = actionItems.filter(a => a.status !== "Completed");

  const deptChartData = [...departments].sort((a, b) => (b.maturity_score ?? 0) - (a.maturity_score ?? 0)).slice(0, 8)
    .map(d => ({ name: d.name.length > 14 ? d.name.slice(0, 13) + "…" : d.name, score: d.maturity_score ?? 0, health: d.execution_health ?? 0 }));

  const statusCounts = ["On Track", "At Risk", "Delayed", "Blocked", "Completed"].map(s => ({
    name: s,
    value: initiatives.filter(i => i.status === s).length,
    color: s === "On Track" ? SIGNAL_COLORS.green : s === "Completed" ? SIGNAL_COLORS.blue : SIGNAL_COLORS.red,
  })).filter(s => s.value > 0);

  const execHealth = orgMetrics?.avg_execution_health ?? 70;
  const overallMaturity = orgMetrics?.overall_maturity_score ?? 65;

  const healthTrend = [
    { month: "Aug", health: 58, maturity: 52 }, { month: "Sep", health: 61, maturity: 54 },
    { month: "Oct", health: 65, maturity: 57 }, { month: "Nov", health: 68, maturity: 60 },
    { month: "Dec", health: 71, maturity: 63 },
    { month: "Jan", health: execHealth, maturity: overallMaturity },
  ];

  const QUARTERS = [
    { q: "Q1", months: "Jan–Mar", revenue: 4.2, burn: 3.1, health: 61, maturity: 54, completed: 3, atRisk: 5, highlight: "Onboarding of new CTO; Infrastructure migration began" },
    { q: "Q2", months: "Apr–Jun", revenue: 4.9, burn: 3.4, health: 65, maturity: 57, completed: 5, atRisk: 4, highlight: "Customer Portal v1 shipped; SOP coverage +12%" },
    { q: "Q3", months: "Jul–Sep", revenue: 5.4, burn: 3.8, health: 69, maturity: 61, completed: 6, atRisk: 3, highlight: "Series B close; Headcount grew from 84 to 118" },
    { q: "Q4", months: "Oct–Dec", revenue: 6.1, burn: 4.1, health: execHealth, maturity: overallMaturity, completed: completedInitiatives, atRisk: initiatives.filter(i => i.status !== "On Track" && i.status !== "Completed").length, highlight: "AI integration roadmap approved; Full diagnostic capability live" },
  ];

  const ANNUAL_TREND = [
    ...ANNUAL_TREND_BASE,
    { month: "Dec", health: execHealth, maturity: overallMaturity, revenue: 6.1 },
  ];

  const tabs: { id: ReportTab; label: string; icon?: React.ElementType }[] = [
    { id: "executive",  label: "Executive Summary" },
    { id: "operations", label: "Operations" },
    { id: "departments",label: "Departments" },
    { id: "initiatives",label: "Initiatives" },
    { id: "quarterly",  label: "Quarterly", icon: Calendar },
    { id: "ytd",        label: "Year to Date", icon: TrendingUp },
    { id: "yearend",    label: "Year-End", icon: Award },
    { id: "custom",     label: "Custom Report" },
  ];

  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    const newAssets: UploadedAsset[] = files.map(f => ({
      id: Math.random().toString(36).slice(2),
      name: f.name,
      type: f.type.startsWith("image/") ? "image" : "file",
      size: `${(f.size / 1024).toFixed(1)} KB`,
    }));
    setUploadedAssets(prev => [...prev, ...newAssets]);
  }

  function addTextBlock() {
    if (!textInput.trim()) return;
    setUploadedAssets(prev => [...prev, {
      id: Math.random().toString(36).slice(2),
      name: textInput.slice(0, 40) + (textInput.length > 40 ? "…" : ""),
      type: "text",
      content: textInput,
    }]);
    setTextInput("");
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground mb-0.5">Reports</h1>
          <p className="text-sm text-muted-foreground">Organizational reports — executive, operational, quarterly, and annual</p>
        </div>
        <button className="flex items-center gap-2 text-xs px-3 py-2 rounded-lg border border-border bg-card hover:bg-secondary transition-colors font-medium text-foreground">
          <Download className="w-3.5 h-3.5" /> Export PDF
        </button>
      </div>

      {/* Tab bar — wraps on smaller screens */}
      <div className="flex flex-wrap gap-1 p-1 bg-secondary rounded-xl border border-border">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={cn(
              "flex items-center gap-1.5 text-xs px-4 py-2 rounded-lg font-semibold transition-all",
              tab === t.id ? "bg-card text-foreground shadow-card border border-border" : "text-muted-foreground hover:text-foreground"
            )}>
            {t.icon && <t.icon className="w-3 h-3" />}
            {t.label}
          </button>
        ))}
      </div>

      {/* ── EXECUTIVE SUMMARY ── */}
      {tab === "executive" && (
        <div className="space-y-5 animate-fade-in">
          <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
            {[
              { label: "Operational Maturity", value: `${overallMaturity}%`, signal: getScoreSignal(overallMaturity), icon: BarChart3 },
              { label: "Initiatives On Track", value: `${onTrackInitiatives}/${initiatives.length}`, signal: getScoreSignal(initiatives.length > 0 ? (onTrackInitiatives / initiatives.length) * 100 : 0), icon: CheckCircle },
              { label: "Budget Deployed", value: `${budgetPct}%`, signal: budgetPct > 80 ? "yellow" as const : "green" as const, icon: TrendingUp },
              { label: "Critical Alerts", value: criticalInsights.length, signal: criticalInsights.length > 3 ? "red" as const : criticalInsights.length > 1 ? "yellow" as const : "green" as const, icon: AlertTriangle },
            ].map(({ label, value, signal, icon: Icon }) => (
              <div key={label} className="bg-card rounded-xl border-2 border-border p-4 shadow-card">
                <div className="flex items-center justify-between mb-3">
                  <Icon className="w-4 h-4 text-muted-foreground" />
                  <ScoreBadge score={typeof value === "number" ? value : parseInt(String(value))} signal={signal} size="sm" />
                </div>
                <div className="text-2xl font-bold font-mono text-foreground">{value}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{label}</div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
            <div className="bg-card rounded-xl border-2 border-signal-green/30 p-5 shadow-card">
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle className="w-4 h-4 text-signal-green" />
                <h3 className="text-sm font-bold text-foreground">What's Working Well</h3>
              </div>
              <ul className="space-y-2.5">
                {[
                  `${onTrackInitiatives} of ${initiatives.length} initiatives are on track`,
                  `${orgMetrics?.sop_coverage ?? 0}% SOP coverage across the organization`,
                  `${departments.filter(d => (d.maturity_score ?? 0) >= 70).length} departments at Managed or Optimized tier`,
                  `${actionItems.filter(a => a.status === "Completed").length} action items completed this period`,
                  `Strategic alignment averaging ${orgMetrics?.avg_strategic_alignment ?? 0}% across active initiatives`,
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-foreground/80">
                    <span className="w-1.5 h-1.5 rounded-full bg-signal-green mt-1.5 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-card rounded-xl border-2 border-signal-red/30 p-5 shadow-card">
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle className="w-4 h-4 text-signal-red" />
                <h3 className="text-sm font-bold text-foreground">Needs Your Attention</h3>
              </div>
              <ul className="space-y-2.5">
                {[
                  `${blockedInitiatives} initiative${blockedInitiatives !== 1 ? "s" : ""} currently blocked`,
                  `${governanceLogs.filter(g => g.status === "Escalated").length} governance items escalated`,
                  `${pendingActions.filter(a => a.priority === "High").length} high-priority actions still pending`,
                  `${departments.filter(d => (d.maturity_score ?? 0) < 40).length} departments in Foundational maturity`,
                  `${orgMetrics?.blocked_tasks ?? 0} tasks blocked across the organization`,
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-foreground/80">
                    <span className="w-1.5 h-1.5 rounded-full bg-signal-red mt-1.5 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <SectionCard title="Top Priority Signals" icon={FileText}>
            <div className="space-y-2.5">
              {topInsights.map((ins, i) => (
                <div key={ins.id} className="flex items-start gap-3 p-3 rounded-lg bg-secondary/50 border border-border">
                  <div className="w-6 h-6 rounded flex items-center justify-center text-xs font-bold font-mono bg-muted text-muted-foreground flex-shrink-0 mt-0.5">{i + 1}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className={cn("text-xs font-medium px-1.5 py-0.5 rounded border",
                        ins.signal === "red" ? "text-signal-red bg-signal-red/10 border-signal-red/30" :
                        ins.signal === "yellow" ? "text-signal-yellow bg-signal-yellow/10 border-signal-yellow/30" :
                        "text-signal-green bg-signal-green/10 border-signal-green/30"
                      )}>{ins.type}</span>
                      <span className="text-xs text-muted-foreground">{ins.department}</span>
                    </div>
                    <p className="text-sm text-foreground/80 leading-snug">{ins.situation}</p>
                    <p className="text-xs text-muted-foreground mt-1">{ins.recommendation}</p>
                  </div>
                  <ScoreBadge score={ins.executive_priority_score ?? 50} signal={(ins.signal ?? "yellow") as "red" | "yellow" | "green" | "blue"} size="sm" />
                </div>
              ))}
            </div>
            {insights.length > 5 && (
              <button onClick={() => setShowAllInsights(v => !v)}
                className="mt-3 flex items-center gap-1 text-xs text-electric-blue hover:underline">
                {showAllInsights ? <><ChevronUp className="w-3.5 h-3.5" /> Show less</> : <><ChevronDown className="w-3.5 h-3.5" /> Show all {insights.length} signals</>}
              </button>
            )}
          </SectionCard>
        </div>
      )}

      {/* ── OPERATIONS ── */}
      {tab === "operations" && (
        <div className="space-y-5 animate-fade-in">
          <SectionCard title="Execution Health Trend" icon={TrendingUp}>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={healthTrend} margin={{ top: 5, right: 10, bottom: 0, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis domain={[40, 100]} tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
                <Legend />
                <Line type="monotone" dataKey="health" stroke="hsl(var(--electric-blue))" strokeWidth={2.5} dot={false} name="Execution Health" />
                <Line type="monotone" dataKey="maturity" stroke="hsl(var(--teal))" strokeWidth={2} strokeDasharray="4 2" dot={false} name="Maturity Score" />
              </LineChart>
            </ResponsiveContainer>
          </SectionCard>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
            <SectionCard title="Action Items Summary" icon={CheckCircle}>
              <div className="grid grid-cols-2 gap-3 mb-4">
                {[
                  { label: "Total", value: actionItems.length, color: "text-foreground" },
                  { label: "In Progress", value: actionItems.filter(a => a.status === "In Progress").length, color: "text-electric-blue" },
                  { label: "Pending", value: pendingActions.length, color: "text-signal-yellow" },
                  { label: "Completed", value: actionItems.filter(a => a.status === "Completed").length, color: "text-signal-green" },
                ].map(({ label, value, color }) => (
                  <div key={label} className="bg-secondary rounded-lg p-3 text-center">
                    <div className={cn("text-2xl font-bold font-mono", color)}>{value}</div>
                    <div className="text-xs text-muted-foreground">{label}</div>
                  </div>
                ))}
              </div>
            </SectionCard>

            <SectionCard title="Budget Overview" icon={BarChart3}>
              <div className="mb-4">
                <div className="flex justify-between text-xs text-muted-foreground mb-1">
                  <span>Budget Deployed</span>
                  <span className="font-mono font-semibold text-foreground">{budgetPct}%</span>
                </div>
                <div className="h-3 rounded-full bg-secondary overflow-hidden border border-border">
                  <div className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${budgetPct}%`, background: budgetPct > 85 ? "hsl(var(--signal-red))" : budgetPct > 65 ? "hsl(var(--signal-yellow))" : "hsl(var(--signal-green))" }} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-secondary rounded-lg p-3">
                  <div className="text-xs text-muted-foreground mb-1">Total Allocated</div>
                  <div className="text-sm font-bold font-mono text-foreground">{formatCurrency(orgMetrics?.total_budget_allocated ?? 0)}</div>
                </div>
                <div className="bg-secondary rounded-lg p-3">
                  <div className="text-xs text-muted-foreground mb-1">Total Used</div>
                  <div className="text-sm font-bold font-mono text-foreground">{formatCurrency(orgMetrics?.total_budget_used ?? 0)}</div>
                </div>
              </div>
            </SectionCard>
          </div>
        </div>
      )}

      {/* ── DEPARTMENTS ── */}
      {tab === "departments" && (
        <div className="space-y-5 animate-fade-in">
          <SectionCard title="Maturity & Execution Health by Department" icon={BarChart3}>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={deptChartData} margin={{ top: 5, right: 10, bottom: 30, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} angle={-30} textAnchor="end" stroke="hsl(var(--muted-foreground))" />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
                <Legend />
                <Bar dataKey="score" fill="hsl(var(--electric-blue))" radius={[3, 3, 0, 0]} name="Maturity Score" />
                <Bar dataKey="health" fill="hsl(var(--teal))" radius={[3, 3, 0, 0]} name="Execution Health" />
              </BarChart>
            </ResponsiveContainer>
          </SectionCard>

          <div className="bg-card rounded-xl border-2 border-border shadow-card overflow-hidden">
            <div className="px-5 py-3.5 border-b-2 border-border bg-secondary">
              <h2 className="text-sm font-bold text-foreground uppercase tracking-wide">Full Department Scorecard</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-border bg-secondary/50">
                    {["Department", "Maturity Tier", "Score", "Execution", "Capacity", "Risk", "SOPs"].map(h => (
                      <th key={h} className="px-4 py-2.5 text-left font-semibold text-muted-foreground">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {[...departments].sort((a, b) => b.maturityScore - a.maturityScore).map(d => (
                    <tr key={d.id} className="hover:bg-secondary/30 transition-colors">
                      <td className="px-4 py-2.5 font-medium text-foreground">{d.name}</td>
                      <td className="px-4 py-2.5">
                        <span className={cn("px-2 py-0.5 rounded-full text-xs font-medium",
                          d.maturityTier === "Optimized" ? "bg-signal-green/10 text-signal-green" :
                          d.maturityTier === "Managed" ? "bg-electric-blue/10 text-electric-blue" :
                          d.maturityTier === "Structured" ? "bg-teal/10 text-teal" :
                          d.maturityTier === "Developing" ? "bg-signal-yellow/10 text-signal-yellow" :
                          "bg-signal-red/10 text-signal-red"
                        )}>{d.maturityTier}</span>
                      </td>
                      <td className="px-4 py-2.5 font-mono font-bold text-foreground">{d.maturityScore}</td>
                      <td className="px-4 py-2.5 font-mono text-muted-foreground">{d.executionHealth}</td>
                      <td className="px-4 py-2.5 font-mono text-muted-foreground">{d.capacityUsed}%</td>
                      <td className="px-4 py-2.5 font-mono text-muted-foreground">{d.riskScore}</td>
                      <td className="px-4 py-2.5 font-mono text-muted-foreground">{d.sopAdherence}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── INITIATIVES ── */}
      {tab === "initiatives" && (
        <div className="space-y-5 animate-fade-in">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
            <SectionCard title="Initiative Status Distribution" icon={BarChart3}>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={statusCounts} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, value }) => `${name}: ${value}`} labelLine={false}>
                    {statusCounts.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
                </PieChart>
              </ResponsiveContainer>
            </SectionCard>
            <SectionCard title="Initiative Summary" icon={FileText}>
              <div className="space-y-3">
                {initiatives.slice(0, 6).map(ini => (
                  <div key={ini.id} className="flex items-center gap-3">
                    <div className={cn("w-2 h-2 rounded-full flex-shrink-0",
                      ini.status === "On Track" ? "bg-signal-green" :
                      ini.status === "Completed" ? "bg-electric-blue" :
                      ini.status === "Blocked" ? "bg-signal-orange animate-pulse" : "bg-signal-yellow"
                    )} />
                    <span className="text-xs text-foreground flex-1 truncate">{ini.name}</span>
                    <span className="text-xs font-mono text-muted-foreground flex-shrink-0">{ini.completionPct}%</span>
                  </div>
                ))}
              </div>
            </SectionCard>
          </div>
        </div>
      )}

      {/* ── QUARTERLY REPORT ── */}
      {tab === "quarterly" && (
        <div className="space-y-6 animate-fade-in">
          <div className="flex items-center gap-3 px-5 py-4 rounded-xl border border-electric-blue/20 bg-electric-blue/5">
            <Calendar className="w-5 h-5 text-electric-blue flex-shrink-0" />
            <div>
              <div className="text-sm font-bold text-foreground">Quarterly Performance Report — {currentYear}</div>
              <div className="text-xs text-muted-foreground">Q1 through Q4 comparative view · Revenue in $M</div>
            </div>
            <button className="ml-auto flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-electric-blue/30 text-electric-blue font-semibold hover:bg-electric-blue/10 transition-colors">
              <Download className="w-3.5 h-3.5" /> Export
            </button>
          </div>

          {/* Quarter cards */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
            {QUARTERS.map((q, i) => {
              const isCurrentQ = i === QUARTERS.length - 1;
              return (
                <div key={q.q} className={cn(
                  "bg-card rounded-xl border-2 shadow-card overflow-hidden",
                  isCurrentQ ? "border-electric-blue/30" : "border-border"
                )}>
                  <div className={cn(
                    "px-5 py-3.5 border-b-2 flex items-center justify-between",
                    isCurrentQ ? "border-electric-blue/20 bg-electric-blue/5" : "border-border bg-secondary"
                  )}>
                    <div className="flex items-center gap-3">
                      <span className="text-lg font-black text-foreground">{q.q}</span>
                      <span className="text-xs text-muted-foreground">{q.months}</span>
                    </div>
                    {isCurrentQ && <span className="text-[10px] font-bold text-electric-blue bg-electric-blue/10 px-2 py-0.5 rounded-full">Current Quarter</span>}
                  </div>
                  <div className="p-5">
                    <div className="grid grid-cols-3 gap-3 mb-4">
                      <KpiTile label="Revenue" value={`$${q.revenue}M`} sub="Quarterly" color="text-signal-green" />
                      <KpiTile label="Org Health" value={q.health} sub="/ 100" color={q.health >= 70 ? "text-signal-green" : q.health >= 55 ? "text-signal-yellow" : "text-signal-red"} />
                      <KpiTile label="Completed" value={q.completed} sub="Initiatives" color="text-electric-blue" />
                    </div>
                    <div className="mb-3">
                      <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
                        <span>Maturity Score</span>
                        <span className="font-mono font-semibold text-foreground">{q.maturity}</span>
                      </div>
                      <div className="h-2 rounded-full bg-secondary overflow-hidden">
                        <div className="h-full rounded-full transition-all duration-700"
                          style={{ width: `${q.maturity}%`, background: "hsl(var(--electric-blue))" }} />
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed border-t border-border pt-3 mt-3">
                      <span className="font-semibold text-foreground">Key highlight — </span>{q.highlight}
                    </p>
                    {q.atRisk > 0 && (
                      <div className="flex items-center gap-1.5 mt-2">
                        <AlertTriangle className="w-3 h-3 text-signal-yellow" />
                        <span className="text-xs text-signal-yellow">{q.atRisk} initiatives at risk this quarter</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quarterly comparison chart */}
          <SectionCard title="Quarterly Performance Comparison" icon={BarChart3}>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={QUARTERS} margin={{ top: 5, right: 10, bottom: 0, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="q" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis yAxisId="left" domain={[0, 100]} tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis yAxisId="right" orientation="right" domain={[0, 10]} tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
                <Legend />
                <Bar yAxisId="left" dataKey="health" fill="hsl(var(--electric-blue))" radius={[3, 3, 0, 0]} name="Org Health" />
                <Bar yAxisId="left" dataKey="maturity" fill="hsl(var(--teal))" radius={[3, 3, 0, 0]} name="Maturity" />
                <Bar yAxisId="right" dataKey="revenue" fill="hsl(var(--signal-green) / 0.7)" radius={[3, 3, 0, 0]} name="Revenue ($M)" />
              </BarChart>
            </ResponsiveContainer>
          </SectionCard>
        </div>
      )}

      {/* ── YEAR TO DATE ── */}
      {tab === "ytd" && (
        <div className="space-y-6 animate-fade-in">
          <div className="flex items-center gap-3 px-5 py-4 rounded-xl border border-teal/20 bg-teal/5">
            <TrendingUp className="w-5 h-5 text-teal flex-shrink-0" />
            <div>
              <div className="text-sm font-bold text-foreground">Year-to-Date Report — {currentYear}</div>
              <div className="text-xs text-muted-foreground">Jan 1 – {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric" })} · Cumulative performance</div>
            </div>
            <button className="ml-auto flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-teal/30 text-teal font-semibold hover:bg-teal/10 transition-colors">
              <Download className="w-3.5 h-3.5" /> Export
            </button>
          </div>

          {/* YTD KPIs */}
          <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
            {[
              { label: "YTD Revenue", value: "$20.6M", sub: "+18% vs prior year", color: "text-signal-green" },
              { label: "Initiatives Closed", value: completedInitiatives + 14, sub: "Including prior quarters", color: "text-electric-blue" },
              { label: "Avg Org Health", value: "66", sub: "Across 12 months", color: "text-signal-yellow" },
              { label: "Budget Variance", value: "−3%", sub: "Under budget YTD", color: "text-signal-green" },
            ].map(({ label, value, sub, color }) => (
              <div key={label} className="bg-card rounded-xl border-2 border-border p-4 shadow-card">
                <div className={cn("text-2xl font-bold font-mono mb-1", color)}>{value}</div>
                <div className="text-xs font-semibold text-foreground">{label}</div>
                <div className="text-[11px] text-muted-foreground mt-0.5">{sub}</div>
              </div>
            ))}
          </div>

          {/* YTD trend chart */}
          <SectionCard title="12-Month Organizational Health Trend" icon={Activity}>
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={ANNUAL_TREND} margin={{ top: 5, right: 10, bottom: 0, left: -20 }}>
                <defs>
                  <linearGradient id="healthGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--electric-blue))" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="hsl(var(--electric-blue))" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="maturityGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--teal))" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="hsl(var(--teal))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis domain={[40, 100]} tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
                <Legend />
                <Area type="monotone" dataKey="health" stroke="hsl(var(--electric-blue))" strokeWidth={2.5} fill="url(#healthGrad)" name="Execution Health" />
                <Area type="monotone" dataKey="maturity" stroke="hsl(var(--teal))" strokeWidth={2} fill="url(#maturityGrad)" name="Maturity Score" />
              </AreaChart>
            </ResponsiveContainer>
          </SectionCard>

          {/* YTD initiatives */}
          <SectionCard title="Initiative Progress YTD" icon={CheckCircle}>
            <div className="space-y-3">
              {YTD_INITIATIVES.map(ini => (
                <div key={ini.id} className="flex items-center gap-4 p-3 rounded-lg bg-secondary/40 border border-border">
                  <div className={cn("w-2 h-2 rounded-full flex-shrink-0",
                    ini.status === "On Track" ? "bg-signal-green" :
                    ini.status === "Completed" ? "bg-electric-blue" :
                    ini.status === "Blocked" ? "bg-signal-orange" : "bg-signal-yellow"
                  )} />
                  <span className="text-xs text-foreground flex-1 truncate font-medium">{ini.name}</span>
                  <span className="text-[10px] text-muted-foreground w-16 text-right">{ini.department}</span>
                  <div className="w-24 h-1.5 rounded-full bg-muted overflow-hidden">
                    <div className="h-full rounded-full" style={{
                      width: `${ini.completionPct}%`,
                      background: ini.status === "On Track" ? "hsl(var(--signal-green))" : ini.status === "Completed" ? "hsl(var(--electric-blue))" : "hsl(var(--signal-yellow))"
                    }} />
                  </div>
                  <span className="text-xs font-mono text-muted-foreground w-8 text-right">{ini.completionPct}%</span>
                  <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full",
                    ini.status === "On Track" ? "bg-signal-green/10 text-signal-green" :
                    ini.status === "Completed" ? "bg-electric-blue/10 text-electric-blue" :
                    ini.status === "Blocked" ? "bg-signal-orange/10 text-signal-orange" :
                    "bg-signal-yellow/10 text-signal-yellow"
                  )}>{ini.status}</span>
                </div>
              ))}
            </div>
          </SectionCard>
        </div>
      )}

      {/* ── YEAR-END REPORT ── */}
      {tab === "yearend" && (
        <div className="space-y-6 animate-fade-in">
          <div className="flex items-center gap-3 px-5 py-4 rounded-xl border border-signal-yellow/20 bg-signal-yellow/5">
            <Award className="w-5 h-5 text-signal-yellow flex-shrink-0" />
            <div>
              <div className="text-sm font-bold text-foreground">Year-End Report — {currentYear}</div>
              <div className="text-xs text-muted-foreground">Full-year summary · Strategic achievements · Looking ahead</div>
            </div>
            <button className="ml-auto flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-signal-yellow/30 text-signal-yellow font-semibold hover:bg-signal-yellow/10 transition-colors">
              <Download className="w-3.5 h-3.5" /> Export Report
            </button>
          </div>

          {/* Year-end summary KPIs */}
          <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
            {[
              { label: "Full-Year Revenue", value: "$20.6M", sub: "+18% YoY", color: "text-signal-green", icon: DollarSign },
              { label: "Org Health Peak", value: `${orgMetrics.avgExecutionHealth}`, sub: `+${orgMetrics.avgExecutionHealth - 58} pts since Jan`, color: "text-electric-blue", icon: Activity },
              { label: "Initiatives Closed", value: completedInitiatives + 14, sub: "Across all departments", color: "text-teal", icon: CheckCircle },
              { label: "SOP Coverage", value: `${orgMetrics.sopCoverage}%`, sub: "+14 pts growth YoY", color: "text-signal-yellow", icon: FileText },
            ].map(({ label, value, sub, color, icon: Icon }) => (
              <div key={label} className="bg-card rounded-xl border-2 border-border p-4 shadow-card">
                <div className="flex items-center justify-between mb-2">
                  <Icon className="w-4 h-4 text-muted-foreground" />
                  <div className={cn("text-2xl font-bold font-mono", color)}>{value}</div>
                </div>
                <div className="text-xs font-semibold text-foreground">{label}</div>
                <div className="text-[11px] text-muted-foreground mt-0.5">{sub}</div>
              </div>
            ))}
          </div>

          {/* Strategic achievements */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
            <div className="bg-card rounded-xl border-2 border-signal-green/30 p-5 shadow-card">
              <div className="flex items-center gap-2 mb-4">
                <Award className="w-4 h-4 text-signal-yellow" />
                <h3 className="text-sm font-bold text-foreground">Top Strategic Achievements</h3>
              </div>
              <ul className="space-y-3">
                {[
                  { text: "Series B fundraise closed — $12M growth capital secured", owner: "Sarah Chen", dept: "Executive" },
                  { text: "Customer Portal v1 shipped — 3 months ahead of schedule", owner: "Ryan Torres", dept: "Technology" },
                  { text: "SOP coverage grew from 64% to 78% across all departments", owner: "David Kim", dept: "Operations" },
                  { text: "Headcount scaled from 84 to 118 FTE with no attrition spike", owner: "Elena Vasquez", dept: "People" },
                  { text: "AI integration roadmap approved and diagnostic capability live", owner: "Ryan Torres", dept: "Technology" },
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3 p-3 rounded-lg bg-secondary/50">
                    <span className="w-5 h-5 rounded-full bg-signal-yellow/15 text-signal-yellow text-[10px] font-bold flex items-center justify-center flex-shrink-0">{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-foreground leading-snug mb-1">{item.text}</p>
                      <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                        <span>{item.owner}</span>
                        <span>·</span>
                        <span>{item.dept}</span>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-card rounded-xl border-2 border-electric-blue/20 p-5 shadow-card space-y-5">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUp className="w-4 h-4 text-electric-blue" />
                  <h3 className="text-sm font-bold text-foreground">Year-Over-Year Growth</h3>
                </div>
                <div className="space-y-3">
                  {[
                    { label: "Revenue", current: "$20.6M", prev: "$17.5M", delta: "+18%", positive: true },
                    { label: "Org Health Score", current: `${orgMetrics.avgExecutionHealth}`, prev: "58", delta: `+${orgMetrics.avgExecutionHealth - 58}`, positive: true },
                    { label: "Maturity Score", current: `${orgMetrics.overallMaturityScore}`, prev: "50", delta: `+${orgMetrics.overallMaturityScore - 50}`, positive: true },
                    { label: "Team Size", current: "118 FTE", prev: "84 FTE", delta: "+40%", positive: true },
                    { label: "SOP Coverage", current: `${orgMetrics.sopCoverage}%`, prev: "64%", delta: "+14pp", positive: true },
                  ].map(({ label, current, prev, delta, positive }) => (
                    <div key={label} className="flex items-center gap-3 py-2 border-b border-border/50 last:border-0">
                      <span className="text-xs text-muted-foreground w-32 flex-shrink-0">{label}</span>
                      <span className="text-xs text-foreground/60 font-mono">{prev}</span>
                      <span className="text-muted-foreground text-xs">→</span>
                      <span className="text-xs font-bold font-mono text-foreground">{current}</span>
                      <span className={cn("ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full",
                        positive ? "text-signal-green bg-signal-green/10" : "text-signal-red bg-signal-red/10"
                      )}>{delta}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Looking ahead */}
          <div className="bg-card rounded-xl border-2 border-border p-5 shadow-card">
            <div className="flex items-center gap-2 mb-4">
              <CalendarDays className="w-4 h-4 text-electric-blue" />
              <h3 className="text-sm font-bold text-foreground">{currentYear + 1} Strategic Priorities</h3>
            </div>
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
              {[
                { priority: "Scale to 150 FTE", owner: "Elena Vasquez", target: "Q2", type: "People" },
                { priority: "Launch AI-native workflow builder", owner: "Ryan Torres", target: "Q1", type: "Product" },
                { priority: "Achieve Tier 4 Maturity in all 5 core depts", owner: "David Kim", target: "Q3", type: "Operations" },
                { priority: "Close enterprise anchor client (>$2M ARR)", owner: "Sarah Chen", target: "Q1", type: "Revenue" },
                { priority: "Full SOP coverage (95%+)", owner: "David Kim", target: "Q2", type: "Governance" },
                { priority: "International expansion — 2 new markets", owner: "Sarah Chen", target: "Q4", type: "Growth" },
              ].map((item, i) => (
                <div key={i} className="p-3 rounded-lg bg-secondary/50 border border-border">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold text-electric-blue bg-electric-blue/10 px-2 py-0.5 rounded">{item.type}</span>
                    <span className="text-[10px] text-muted-foreground font-mono">{item.target}</span>
                  </div>
                  <p className="text-xs font-semibold text-foreground mb-1">{item.priority}</p>
                  <p className="text-[10px] text-muted-foreground">Owner: {item.owner}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── CUSTOM REPORT ── */}
      {tab === "custom" && (
        <div className="space-y-5 animate-fade-in">
          <div className="bg-card rounded-xl border-2 border-border shadow-card p-5">
            <div className="flex items-center gap-3 mb-5">
              <FileText className="w-4 h-4 text-electric-blue flex-shrink-0" />
              <input
                className="flex-1 text-lg font-bold bg-transparent border-none outline-none text-foreground placeholder-muted-foreground"
                value={reportTitle}
                onChange={e => setReportTitle(e.target.value)}
                placeholder="Report title..."
              />
            </div>

            <div className="flex flex-wrap gap-2 mb-5">
              <button onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg border-2 border-border font-semibold text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors">
                <Upload className="w-3.5 h-3.5" /> Upload Files
              </button>
              <button onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg border-2 border-border font-semibold text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors">
                <Image className="w-3.5 h-3.5" /> Upload Images
              </button>
              <button onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg border-2 border-border font-semibold text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors">
                <Folder className="w-3.5 h-3.5" /> Upload Folder
              </button>
              <span className="text-xs text-muted-foreground self-center">Max 200 pages per batch</span>
              <input ref={fileInputRef} type="file" multiple className="hidden" onChange={handleFileUpload} />
            </div>

            <div className="mb-5">
              <div className="text-xs font-semibold text-foreground uppercase tracking-wide mb-2">Add Text Block</div>
              <div className="flex gap-2">
                <textarea
                  className="flex-1 min-h-[80px] px-3 py-2.5 text-sm rounded-xl border-2 bg-secondary text-foreground focus:outline-none transition-all resize-none"
                  style={{ borderColor: "hsl(var(--border))" }}
                  placeholder="Paste text, notes, observations, or context for this report..."
                  value={textInput}
                  onChange={e => setTextInput(e.target.value)}
                />
                <button onClick={addTextBlock}
                  className="flex-shrink-0 px-4 rounded-xl border-2 border-electric-blue/40 text-electric-blue font-semibold text-xs hover:bg-electric-blue/8 transition-colors self-start mt-0 h-10">
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {uploadedAssets.length > 0 && (
              <div>
                <div className="text-xs font-semibold text-foreground uppercase tracking-wide mb-2">Report Assets ({uploadedAssets.length})</div>
                <div className="space-y-2">
                  {uploadedAssets.map(asset => (
                    <div key={asset.id} className="flex items-start gap-3 p-3 rounded-xl border border-border bg-secondary/40">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{ background: "hsl(var(--electric-blue) / 0.1)" }}>
                        {asset.type === "text" ? <FileText className="w-4 h-4 text-electric-blue" /> :
                         asset.type === "image" ? <Image className="w-4 h-4 text-teal" /> :
                         <Folder className="w-4 h-4 text-signal-yellow" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold text-foreground truncate">{asset.name}</div>
                        {asset.size && <div className="text-xs text-muted-foreground">{asset.size}</div>}
                        {asset.content && <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{asset.content}</p>}
                      </div>
                      <button
                        onClick={() => setUploadedAssets(prev => prev.filter(a => a.id !== asset.id))}
                        className="flex-shrink-0 p-1 rounded hover:bg-secondary transition-colors opacity-40 hover:opacity-80">
                        <X className="w-3.5 h-3.5 text-muted-foreground" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {uploadedAssets.length === 0 && (
              <div className="text-center py-10 border-2 border-dashed border-border rounded-xl">
                <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2.5 opacity-40" />
                <p className="text-sm text-muted-foreground">Upload files, images, folders, or add text blocks to build your custom report</p>
              </div>
            )}
          </div>

          {uploadedAssets.length > 0 && (
            <div className="flex gap-2">
              <button className="flex items-center gap-2 text-xs px-4 py-2.5 rounded-xl border-2 border-electric-blue text-electric-blue font-bold hover:bg-electric-blue/10 transition-colors">
                <Download className="w-3.5 h-3.5" /> Generate Report
              </button>
              <button className="flex items-center gap-2 text-xs px-4 py-2.5 rounded-xl border border-border text-muted-foreground hover:text-foreground transition-colors">
                Save as Template
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
