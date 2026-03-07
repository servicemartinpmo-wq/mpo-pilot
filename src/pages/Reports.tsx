import { insights, departments, initiatives, orgMetrics, actionItems, governanceLogs, formatCurrency, getScoreSignal } from "@/lib/pmoData";
import { ScoreBadge } from "@/components/ScoreBadge";
import { cn } from "@/lib/utils";
import { useState, useRef } from "react";
import {
  FileText, TrendingUp, AlertTriangle, CheckCircle, BarChart3,
  Download, ChevronDown, ChevronUp, Upload, X, Plus, Image, Folder
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend } from "recharts";

const SIGNAL_COLORS = {
  red: "hsl(var(--signal-red))", yellow: "hsl(var(--signal-yellow))",
  green: "hsl(var(--signal-green))", blue: "hsl(var(--electric-blue))",
};

type ReportTab = "executive" | "operations" | "departments" | "initiatives" | "custom";

interface UploadedAsset {
  id: string;
  name: string;
  type: "text" | "file" | "image" | "folder";
  content?: string;
  size?: string;
}

function SectionCard({ title, icon: Icon, children }: { title: string; icon: React.ElementType; children: React.ReactNode }) {
  return (
    <div className="bg-card rounded-xl border-2 border-border shadow-card overflow-hidden">
      <div className="px-5 py-3.5 border-b-2 border-border flex items-center gap-2.5 bg-secondary">
        <Icon className="w-4 h-4 text-electric-blue" />
        <h2 className="text-sm font-bold text-foreground uppercase tracking-wide">{title}</h2>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

export default function Reports() {
  const [tab, setTab] = useState<ReportTab>("executive");
  const [showAllInsights, setShowAllInsights] = useState(false);
  const [uploadedAssets, setUploadedAssets] = useState<UploadedAsset[]>([]);
  const [textInput, setTextInput] = useState("");
  const [reportTitle, setReportTitle] = useState("Custom Report");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const criticalInsights = insights.filter(i => i.signal === "red");
  const topInsights = insights.slice(0, showAllInsights ? insights.length : 5);
  const budgetPct = Math.round((orgMetrics.totalBudgetUsed / orgMetrics.totalBudgetAllocated) * 100);
  const completedInitiatives = initiatives.filter(i => i.status === "Completed").length;
  const onTrackInitiatives = initiatives.filter(i => i.status === "On Track").length;
  const blockedInitiatives = initiatives.filter(i => i.status === "Blocked").length;
  const pendingActions = actionItems.filter(a => a.status !== "Completed");

  const deptChartData = [...departments].sort((a, b) => b.maturityScore - a.maturityScore).slice(0, 8)
    .map(d => ({ name: d.name.length > 14 ? d.name.slice(0, 13) + "…" : d.name, score: d.maturityScore, health: d.executionHealth }));

  const statusCounts = ["On Track", "At Risk", "Delayed", "Blocked", "Completed"].map(s => ({
    name: s,
    value: initiatives.filter(i => i.status === s).length,
    color: s === "On Track" ? SIGNAL_COLORS.green : s === "Completed" ? SIGNAL_COLORS.blue : SIGNAL_COLORS.red,
  })).filter(s => s.value > 0);

  const healthTrend = [
    { month: "Aug", health: 58, maturity: 52 }, { month: "Sep", health: 61, maturity: 54 },
    { month: "Oct", health: 65, maturity: 57 }, { month: "Nov", health: 68, maturity: 60 },
    { month: "Dec", health: 71, maturity: 63 },
    { month: "Jan", health: orgMetrics.avgExecutionHealth, maturity: orgMetrics.overallMaturityScore },
  ];

  const tabs: { id: ReportTab; label: string }[] = [
    { id: "executive", label: "Executive Summary" },
    { id: "operations", label: "Operations" },
    { id: "departments", label: "Departments" },
    { id: "initiatives", label: "Initiatives" },
    { id: "custom", label: "Custom Report" },
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
          <p className="text-sm text-muted-foreground">Full organizational reports — generated from your live data</p>
        </div>
        <button className="flex items-center gap-2 text-xs px-3 py-2 rounded-lg border border-border bg-card hover:bg-secondary transition-colors font-medium text-foreground">
          <Download className="w-3.5 h-3.5" /> Export PDF
        </button>
      </div>

      <div className="flex gap-1 p-1 bg-secondary rounded-xl w-fit border border-border">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={cn("text-xs px-4 py-2 rounded-lg font-semibold transition-all",
              tab === t.id ? "bg-card text-foreground shadow-card border border-border" : "text-muted-foreground hover:text-foreground"
            )}>{t.label}</button>
        ))}
      </div>

      {/* ── EXECUTIVE SUMMARY ── */}
      {tab === "executive" && (
        <div className="space-y-5 animate-fade-in">
          <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
            {[
              { label: "Operational Maturity", value: `${orgMetrics.overallMaturityScore}%`, signal: getScoreSignal(orgMetrics.overallMaturityScore), icon: BarChart3 },
              { label: "Initiatives On Track", value: `${onTrackInitiatives}/${initiatives.length}`, signal: getScoreSignal((onTrackInitiatives / initiatives.length) * 100), icon: CheckCircle },
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
                  `${orgMetrics.sopCoverage}% SOP coverage across the organization`,
                  `${departments.filter(d => d.maturityScore >= 70).length} departments at Managed or Optimized tier`,
                  `${actionItems.filter(a => a.status === "Completed").length} action items completed this period`,
                  `Strategic alignment averaging ${orgMetrics.avgStrategicAlignment}% across active initiatives`,
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
                  `${departments.filter(d => d.maturityScore < 40).length} departments in Foundational maturity`,
                  `${orgMetrics.blockedTasks} tasks blocked across the organization`,
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
                  <ScoreBadge score={ins.executivePriorityScore} signal={ins.signal} size="sm" />
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
                  <div className="text-sm font-bold font-mono text-foreground">{formatCurrency(orgMetrics.totalBudgetAllocated)}</div>
                </div>
                <div className="bg-secondary rounded-lg p-3">
                  <div className="text-xs text-muted-foreground mb-1">Total Used</div>
                  <div className="text-sm font-bold font-mono text-foreground">{formatCurrency(orgMetrics.totalBudgetUsed)}</div>
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

            {/* Upload buttons */}
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

            {/* Text input */}
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

            {/* Uploaded assets */}
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
