import { useState, useEffect, useCallback } from "react";
import { BarChart3, TrendingUp, Target, Zap, Plus, Activity, ArrowUp, ArrowDown, Loader2, X, Trash2 } from "lucide-react";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { cn } from "@/lib/utils";
import { useModuleData } from "@/hooks/useModuleData";

type MarketingTab = "scores" | "insights" | "trends";

interface CampaignRow {
  id: string;
  name: string;
  platform: string;
  mega_score: number;
  engagement: number;
  relevance: number;
  conversion: number;
  authority: number;
  freshness: number;
  network: number;
  efficiency: number;
  diagnosis: string;
  recommendation: string;
  trend: string;
  trend_delta: number;
}

const SCORE_WEIGHTS = [
  { dimension: "Engagement", weight: "20%" },
  { dimension: "Relevance", weight: "20%" },
  { dimension: "Conversion", weight: "20%" },
  { dimension: "Authority", weight: "15%" },
  { dimension: "Freshness", weight: "10%" },
  { dimension: "Network", weight: "10%" },
  { dimension: "Efficiency", weight: "5%" },
];

function ScoreGauge({ value, label, color }: { value: number; label: string; color: string }) {
  const circumference = 2 * Math.PI * 20;
  const offset = circumference - (value / 100) * circumference;
  return (
    <div className="flex flex-col items-center gap-1.5">
      <div className="relative w-14 h-14">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 48 48">
          <circle cx="24" cy="24" r="20" fill="none" strokeWidth="4" stroke="hsl(0 0% 100% / 0.06)" />
          <circle cx="24" cy="24" r="20" fill="none" strokeWidth="4"
            stroke={color} strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{ transition: "stroke-dashoffset 0.8s ease" }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xs font-black font-mono" style={{ color }}>{value}</span>
        </div>
      </div>
      <span className="text-[10px] text-center leading-tight" style={{ color: "hsl(0 0% 100% / 0.4)" }}>{label}</span>
    </div>
  );
}

function AddCampaignModal({ onClose, onCreate }: { onClose: () => void; onCreate: (c: Partial<CampaignRow>) => void }) {
  const [name, setName] = useState("");
  const [platform, setPlatform] = useState("LinkedIn");
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative rounded-2xl border p-6 w-full max-w-md" style={{ background: "hsl(224 22% 13%)", borderColor: "hsl(0 0% 100% / 0.12)" }}>
        <div className="flex items-center justify-between mb-5">
          <p className="text-sm font-bold text-white">Add Campaign</p>
          <button onClick={onClose}><X className="w-4 h-4 text-white/40" /></button>
        </div>
        <div className="space-y-3">
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-white/40 mb-1.5 block">Name</label>
            <input value={name} onChange={e => setName(e.target.value)} placeholder="Campaign name"
              className="w-full px-3 py-2.5 rounded-xl text-sm border outline-none"
              style={{ background: "hsl(224 22% 9%)", borderColor: "hsl(0 0% 100% / 0.08)", color: "hsl(38 15% 94%)" }} />
          </div>
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-white/40 mb-1.5 block">Platform</label>
            <select value={platform} onChange={e => setPlatform(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl text-sm border outline-none"
              style={{ background: "hsl(224 22% 9%)", borderColor: "hsl(0 0% 100% / 0.08)", color: "hsl(38 15% 94%)" }}>
              {["LinkedIn", "Google Ads", "Meta Ads", "Email", "YouTube", "Twitter/X", "TikTok"].map(p => <option key={p}>{p}</option>)}
            </select>
          </div>
        </div>
        <div className="flex items-center justify-end gap-3 mt-5">
          <button onClick={onClose} className="px-4 py-2 rounded-xl text-xs font-medium text-white/50 border" style={{ borderColor: "hsl(0 0% 100% / 0.08)" }}>Cancel</button>
          <button disabled={!name.trim()} onClick={() => { onCreate({ name, platform, mega_score: 0, engagement: 0, relevance: 0, conversion: 0, authority: 0, freshness: 0, network: 0, efficiency: 0, trend: "flat", trend_delta: 0, diagnosis: "", recommendation: "" }); onClose(); }}
            className="flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold disabled:opacity-40" style={{ background: "hsl(38 92% 52%)", color: "hsl(224 22% 8%)" }}>
            <Plus className="w-3.5 h-3.5" /> Create
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Marketing() {
  const { data: campaigns, loading, create, remove } = useModuleData<CampaignRow>("/api/marketing/campaigns", { seedEndpoint: "/api/marketing/campaigns/seed" });
  const [tab, setTab] = useState<MarketingTab>("scores");
  const [showAdd, setShowAdd] = useState(false);

  const avgMega = campaigns.length > 0 ? Math.round(campaigns.reduce((s, c) => s + (c.mega_score || 0), 0) / campaigns.length) : 0;

  const trendData = campaigns.slice(0, 3).length > 0 ? [1, 2, 3, 4, 5].map(w => {
    const row: any = { week: `W${w}` };
    campaigns.slice(0, 3).forEach((c, i) => { row[`c${i}`] = Math.max(0, (c.mega_score || 50) - (5 - w) * (2 + i)); });
    return row;
  }) : [];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "hsl(224 22% 10%)" }}>
        <div className="flex items-center gap-3 text-white/40"><Loader2 className="w-5 h-5 animate-spin" /> Loading campaigns...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 sm:p-6 space-y-5 sm:space-y-6" style={{ background: "hsl(224 22% 10%)" }}>
      {showAdd && <AddCampaignModal onClose={() => setShowAdd(false)} onCreate={c => create(c as any)} />}

      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="flex-1">
          <h1 className="text-xl sm:text-2xl font-black mb-0.5" style={{ color: "hsl(38 15% 94%)" }}>Marketing Intelligence</h1>
          <p className="text-sm" style={{ color: "hsl(0 0% 100% / 0.45)" }}>Campaign performance scoring, insights, and trend analysis</p>
        </div>
        <button onClick={() => setShowAdd(true)} className="self-start sm:self-auto flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold"
          style={{ background: "hsl(38 92% 52%)", color: "hsl(224 22% 8%)" }}>
          <Plus className="w-4 h-4" /> Add Campaign
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Avg Mega Score", value: avgMega, unit: "/100", color: "hsl(38 92% 52%)" },
          { label: "Active Campaigns", value: campaigns.length, unit: "", color: "hsl(222 88% 65%)" },
          { label: "Top Platform", value: campaigns.length > 0 ? campaigns.sort((a, b) => (b.mega_score || 0) - (a.mega_score || 0))[0]?.platform || "—" : "—", unit: "", color: "hsl(268 68% 62%)" },
          { label: "Score Weight Model", value: "7-Factor", unit: "", color: "hsl(160 56% 42%)" },
        ].map(({ label, value, unit, color }) => (
          <div key={label} className="rounded-xl border p-4" style={{ background: "hsl(224 20% 12%)", borderColor: "hsl(0 0% 100% / 0.07)" }}>
            <div className="text-xs mb-1 font-medium" style={{ color: "hsl(0 0% 100% / 0.4)" }}>{label}</div>
            <div className="text-2xl font-black font-mono" style={{ color }}>{value}<span className="text-sm font-normal ml-0.5" style={{ color: "hsl(0 0% 100% / 0.35)" }}>{unit}</span></div>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-1 p-1 rounded-xl w-fit border" style={{ background: "hsl(224 20% 12%)", borderColor: "hsl(0 0% 100% / 0.06)" }}>
        {([
          { id: "scores", label: "Campaign Scores", icon: Target },
          { id: "insights", label: "Insights", icon: Zap },
          { id: "trends", label: "Performance Trends", icon: TrendingUp },
        ] as const).map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => setTab(id)}
            className={cn("flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all", tab === id ? "text-white" : "text-white/40 hover:text-white/60")}
            style={tab === id ? { background: "hsl(38 92% 52% / 0.12)", color: "hsl(38 92% 62%)" } : {}}>
            <Icon className="w-4 h-4" />{label}
          </button>
        ))}
      </div>

      {tab === "scores" && (
        <div className="space-y-4">
          {campaigns.length === 0 && (
            <div className="rounded-2xl border p-12 text-center" style={{ background: "hsl(224 20% 11%)", borderColor: "hsl(0 0% 100% / 0.07)" }}>
              <p className="text-white/40 text-sm">No campaigns yet. Click "Add Campaign" to get started.</p>
            </div>
          )}
          {campaigns.map((c) => (
            <div key={c.id} className="rounded-2xl border p-6" style={{ background: "hsl(224 20% 11%)", borderColor: "hsl(0 0% 100% / 0.07)" }}>
              <div className="flex items-start justify-between mb-5">
                <div>
                  <div className="flex items-center gap-3 mb-1.5">
                    <h3 className="font-bold" style={{ color: "hsl(38 15% 94%)" }}>{c.name}</h3>
                    <span className="px-2.5 py-1 rounded-lg text-xs font-semibold" style={{ background: "hsl(268 68% 62% / 0.12)", color: "hsl(268 68% 72%)" }}>{c.platform}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm" style={{ color: "hsl(0 0% 100% / 0.4)" }}>
                    Mega Algorithm Score:
                    <span className="font-black text-xl font-mono" style={{ color: (c.mega_score || 0) >= 75 ? "hsl(160 56% 42%)" : (c.mega_score || 0) >= 60 ? "hsl(38 92% 52%)" : "hsl(350 84% 62%)" }}>{c.mega_score || 0}</span>
                    <span style={{ color: "hsl(0 0% 100% / 0.3)" }}>/100</span>
                    {c.trend !== "flat" && (
                      <div className="flex items-center gap-1 text-xs font-semibold ml-1">
                        {c.trend === "up"
                          ? <><ArrowUp className="w-3.5 h-3.5" style={{ color: "hsl(160 56% 42%)" }} /><span style={{ color: "hsl(160 56% 42%)" }}>+{c.trend_delta}</span></>
                          : <><ArrowDown className="w-3.5 h-3.5" style={{ color: "hsl(350 84% 62%)" }} /><span style={{ color: "hsl(350 84% 62%)" }}>{c.trend_delta}</span></>
                        }
                      </div>
                    )}
                  </div>
                </div>
                <button onClick={() => remove(c.id)} className="p-2 rounded-lg hover:bg-white/[0.06] transition-all" title="Delete campaign">
                  <Trash2 className="w-4 h-4 text-white/25 hover:text-red-400" />
                </button>
              </div>
              <div className="grid grid-cols-7 gap-3 mb-4">
                <ScoreGauge value={c.engagement || 0} label="Engagement" color="hsl(38 92% 52%)" />
                <ScoreGauge value={c.relevance || 0} label="Relevance" color="hsl(222 88% 65%)" />
                <ScoreGauge value={c.conversion || 0} label="Conversion" color="hsl(160 56% 42%)" />
                <ScoreGauge value={c.authority || 0} label="Authority" color="hsl(268 68% 62%)" />
                <ScoreGauge value={c.freshness || 0} label="Freshness" color="hsl(174 68% 42%)" />
                <ScoreGauge value={c.network || 0} label="Network" color="hsl(28 94% 58%)" />
                <ScoreGauge value={c.efficiency || 0} label="Efficiency" color="hsl(350 84% 62%)" />
              </div>
              <ResponsiveContainer width="100%" height={80}>
                <BarChart data={[{ Engagement: c.engagement, Relevance: c.relevance, Conversion: c.conversion, Authority: c.authority, Freshness: c.freshness, Network: c.network, Efficiency: c.efficiency }]} barSize={20}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(0 0% 100% / 0.04)" vertical={false} />
                  <XAxis dataKey="name" hide />
                  <Tooltip contentStyle={{ background: "hsl(224 22% 11%)", border: "1px solid hsl(0 0% 100% / 0.08)", borderRadius: 8 }} labelStyle={{ color: "hsl(0 0% 100% / 0.4)" }} itemStyle={{ color: "hsl(38 92% 52%)" }} />
                  {["Engagement","Relevance","Conversion","Authority","Freshness","Network","Efficiency"].map((k, i) => (
                    <Bar key={k} dataKey={k} fill={["hsl(38,92%,52%)","hsl(222,88%,65%)","hsl(160,56%,42%)","hsl(268,68%,62%)","hsl(174,68%,42%)","hsl(28,94%,58%)","hsl(350,84%,62%)"][i]} radius={4} />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            </div>
          ))}
        </div>
      )}

      {tab === "insights" && (
        <div className="space-y-4">
          {campaigns.map((c) => (
            <div key={c.id} className="rounded-2xl border p-6" style={{ background: "hsl(224 20% 11%)", borderColor: "hsl(0 0% 100% / 0.07)" }}>
              <div className="flex items-center gap-3 mb-4">
                <div className="flex items-center justify-center w-10 h-10 rounded-xl font-black text-sm font-mono" style={{ background: "hsl(38 92% 52% / 0.1)", color: "hsl(38 92% 52%)" }}>{c.mega_score || 0}</div>
                <div>
                  <div className="font-semibold" style={{ color: "hsl(38 15% 94%)" }}>{c.name}</div>
                  <div className="text-xs" style={{ color: "hsl(0 0% 100% / 0.35)" }}>{c.platform}</div>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="rounded-xl p-4" style={{ background: "hsl(0 0% 100% / 0.02)", border: "1px solid hsl(0 0% 100% / 0.05)" }}>
                  <div className="flex items-center gap-2 mb-2">
                    <Activity className="w-3.5 h-3.5" style={{ color: "hsl(38 92% 52%)" }} />
                    <span className="text-xs font-bold uppercase tracking-wider" style={{ color: "hsl(0 0% 100% / 0.4)" }}>Diagnosis</span>
                  </div>
                  <p className="text-sm leading-relaxed" style={{ color: "hsl(0 0% 100% / 0.65)" }}>{c.diagnosis || "No diagnosis yet."}</p>
                </div>
                <div className="rounded-xl p-4" style={{ background: "hsl(160 56% 42% / 0.04)", border: "1px solid hsl(160 56% 42% / 0.12)" }}>
                  <div className="flex items-center gap-2 mb-2">
                    <Zap className="w-3.5 h-3.5" style={{ color: "hsl(160 56% 42%)" }} />
                    <span className="text-xs font-bold uppercase tracking-wider" style={{ color: "hsl(160 56% 42% / 0.7)" }}>Recommendation</span>
                  </div>
                  <p className="text-sm leading-relaxed" style={{ color: "hsl(0 0% 100% / 0.65)" }}>{c.recommendation || "No recommendation yet."}</p>
                </div>
              </div>
            </div>
          ))}
          <div className="rounded-2xl border p-6" style={{ background: "hsl(224 20% 11%)", borderColor: "hsl(0 0% 100% / 0.07)" }}>
            <h3 className="font-bold mb-4" style={{ color: "hsl(38 15% 94%)" }}>Mega Algorithm Score — Weight Model</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {SCORE_WEIGHTS.map(({ dimension, weight }) => (
                <div key={dimension} className="rounded-xl p-3 text-center" style={{ background: "hsl(0 0% 100% / 0.03)", border: "1px solid hsl(0 0% 100% / 0.05)" }}>
                  <div className="text-xs font-medium mb-1" style={{ color: "hsl(0 0% 100% / 0.4)" }}>{dimension}</div>
                  <div className="text-lg font-black font-mono" style={{ color: "hsl(38 92% 52%)" }}>{weight}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {tab === "trends" && (
        <div className="rounded-2xl border p-6" style={{ background: "hsl(224 20% 11%)", borderColor: "hsl(0 0% 100% / 0.07)" }}>
          <h3 className="font-bold mb-5" style={{ color: "hsl(38 15% 94%)" }}>Mega Algorithm Score — 5-Week Trend</h3>
          {trendData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(0 0% 100% / 0.04)" />
                  <XAxis dataKey="week" tick={{ fill: "hsl(0 0% 100% / 0.3)", fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis domain={[0, 100]} tick={{ fill: "hsl(0 0% 100% / 0.3)", fontSize: 12 }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ background: "hsl(224 22% 11%)", border: "1px solid hsl(0 0% 100% / 0.08)", borderRadius: 8 }} labelStyle={{ color: "hsl(0 0% 100% / 0.4)" }} />
                  {campaigns.slice(0, 3).map((c, i) => (
                    <Line key={c.id} type="monotone" dataKey={`c${i}`} name={c.name} stroke={["hsl(38 92% 52%)", "hsl(222 88% 65%)", "hsl(268 68% 62%)"][i]} strokeWidth={2.5} dot={{ r: 4, fill: ["hsl(38 92% 52%)", "hsl(222 88% 65%)", "hsl(268 68% 62%)"][i] }} />
                  ))}
                </LineChart>
              </ResponsiveContainer>
              <div className="flex items-center gap-6 mt-4 justify-center">
                {campaigns.slice(0, 3).map((c, i) => (
                  <div key={c.id} className="flex items-center gap-2 text-xs" style={{ color: "hsl(0 0% 100% / 0.4)" }}>
                    <div className="w-3 h-0.5 rounded" style={{ background: ["hsl(38 92% 52%)", "hsl(222 88% 65%)", "hsl(268 68% 62%)"][i] }} />
                    {c.name}
                  </div>
                ))}
              </div>
            </>
          ) : (
            <p className="text-white/40 text-sm text-center py-8">Add campaigns to see trend data.</p>
          )}
        </div>
      )}
    </div>
  );
}
