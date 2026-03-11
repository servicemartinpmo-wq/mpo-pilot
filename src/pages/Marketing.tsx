import { useState } from "react";
import { BarChart3, TrendingUp, Target, Zap, Plus, Activity, ArrowUp, ArrowDown } from "lucide-react";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, Radar, PolarGrid, PolarAngleAxis } from "recharts";
import { cn } from "@/lib/utils";

type MarketingTab = "scores" | "insights" | "trends";

interface Campaign {
  id: string;
  name: string;
  platform: string;
  megaScore: number;
  engagement: number;
  relevance: number;
  conversion: number;
  authority: number;
  freshness: number;
  network: number;
  efficiency: number;
  diagnosis: string;
  recommendation: string;
  trend: "up" | "down" | "flat";
  trendDelta: number;
}

const CAMPAIGNS: Campaign[] = [
  {
    id: "cam1",
    name: "SaaS Executive Launch",
    platform: "LinkedIn",
    megaScore: 82,
    engagement: 88,
    relevance: 76,
    conversion: 71,
    authority: 80,
    freshness: 92,
    network: 75,
    efficiency: 79,
    diagnosis: "Strong engagement and freshness scores indicate high-quality targeting and creative. Conversion gap (71) vs engagement (88) suggests friction in the post-click experience.",
    recommendation: "Optimize landing page CTA hierarchy and reduce form fields. A/B test social proof placement. Increase LinkedIn thought leadership content to boost authority score.",
    trend: "up",
    trendDelta: 4.2,
  },
  {
    id: "cam2",
    name: "Healthcare Operations Outreach",
    platform: "Google Ads",
    megaScore: 67,
    engagement: 62,
    relevance: 78,
    conversion: 58,
    authority: 71,
    freshness: 55,
    network: 60,
    efficiency: 82,
    diagnosis: "High relevance score confirms correct audience targeting. Low freshness (55) and engagement (62) indicate creative fatigue — assets need rotation.",
    recommendation: "Refresh ad creative immediately. Introduce video formats for Google Display. Leverage high efficiency score (82) by increasing budget allocation on top performers.",
    trend: "down",
    trendDelta: -2.8,
  },
  {
    id: "cam3",
    name: "Command Center Brand Awareness",
    platform: "Meta Ads",
    megaScore: 74,
    engagement: 81,
    relevance: 72,
    conversion: 65,
    authority: 68,
    freshness: 78,
    network: 70,
    efficiency: 73,
    diagnosis: "Balanced performance across dimensions. Engagement (81) is strong. Authority (68) is the ceiling — building credibility signals will unlock conversion improvements.",
    recommendation: "Launch retargeting sequence for warm audiences. Develop case study creative to drive authority score. Test lookalike audiences based on top-converting segments.",
    trend: "up",
    trendDelta: 1.5,
  },
];

const TREND_DATA = [
  { week: "W1", saas: 74, healthcare: 70, brand: 68 },
  { week: "W2", saas: 76, healthcare: 69, brand: 70 },
  { week: "W3", saas: 78, healthcare: 68, brand: 71 },
  { week: "W4", saas: 80, healthcare: 67, brand: 73 },
  { week: "W5", saas: 82, healthcare: 67, brand: 74 },
];

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

export default function Marketing() {
  const [tab, setTab] = useState<MarketingTab>("scores");
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);

  const avgMega = Math.round(CAMPAIGNS.reduce((s, c) => s + c.megaScore, 0) / CAMPAIGNS.length);

  return (
    <div className="min-h-screen p-6 space-y-6">

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-black mb-1" style={{ color: "hsl(38 15% 94%)" }}>
            Marketing Intelligence
          </h1>
          <p className="text-sm" style={{ color: "hsl(0 0% 100% / 0.45)" }}>
            Campaign performance scoring, insights, and trend analysis
          </p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold"
          style={{ background: "hsl(38 92% 52%)", color: "hsl(224 22% 8%)" }}>
          <Plus className="w-4 h-4" />
          Add Campaign
        </button>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Avg Mega Score", value: avgMega, unit: "/100", color: "hsl(38 92% 52%)" },
          { label: "Active Campaigns", value: CAMPAIGNS.length, unit: "", color: "hsl(222 88% 65%)" },
          { label: "Top Platform", value: "LinkedIn", unit: "", color: "hsl(268 68% 62%)" },
          { label: "Score Weight Model", value: "7-Factor", unit: "", color: "hsl(160 56% 42%)" },
        ].map(({ label, value, unit, color }) => (
          <div key={label} className="rounded-xl border p-4"
            style={{ background: "hsl(224 20% 12%)", borderColor: "hsl(0 0% 100% / 0.07)" }}>
            <div className="text-xs mb-1 font-medium" style={{ color: "hsl(0 0% 100% / 0.4)" }}>{label}</div>
            <div className="text-2xl font-black font-mono" style={{ color }}>
              {value}<span className="text-sm font-normal ml-0.5" style={{ color: "hsl(0 0% 100% / 0.35)" }}>{unit}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 p-1 rounded-xl w-fit border"
        style={{ background: "hsl(224 20% 12%)", borderColor: "hsl(0 0% 100% / 0.06)" }}>
        {([
          { id: "scores", label: "Campaign Scores", icon: Target },
          { id: "insights", label: "AI Insights", icon: Zap },
          { id: "trends", label: "Performance Trends", icon: TrendingUp },
        ] as const).map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all",
              tab === id ? "text-white" : "text-white/40 hover:text-white/60"
            )}
            style={tab === id ? { background: "hsl(38 92% 52% / 0.12)", color: "hsl(38 92% 62%)" } : {}}>
            <Icon className="w-4 h-4" />{label}
          </button>
        ))}
      </div>

      {/* Campaign Scores */}
      {tab === "scores" && (
        <div className="space-y-4">
          {CAMPAIGNS.map((campaign) => (
            <div key={campaign.id} className="rounded-2xl border p-6"
              style={{ background: "hsl(224 20% 11%)", borderColor: "hsl(0 0% 100% / 0.07)" }}>
              <div className="flex items-start justify-between mb-5">
                <div>
                  <div className="flex items-center gap-3 mb-1.5">
                    <h3 className="font-bold" style={{ color: "hsl(38 15% 94%)" }}>{campaign.name}</h3>
                    <span className="px-2.5 py-1 rounded-lg text-xs font-semibold"
                      style={{ background: "hsl(268 68% 62% / 0.12)", color: "hsl(268 68% 72%)" }}>
                      {campaign.platform}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm" style={{ color: "hsl(0 0% 100% / 0.4)" }}>
                    Mega Algorithm Score:
                    <span className="font-black text-xl font-mono" style={{ color: campaign.megaScore >= 75 ? "hsl(160 56% 42%)" : campaign.megaScore >= 60 ? "hsl(38 92% 52%)" : "hsl(350 84% 62%)" }}>
                      {campaign.megaScore}
                    </span>
                    <span style={{ color: "hsl(0 0% 100% / 0.3)" }}>/100</span>
                    <div className={cn("flex items-center gap-1 text-xs font-semibold ml-1")}>
                      {campaign.trend === "up"
                        ? <><ArrowUp className="w-3.5 h-3.5" style={{ color: "hsl(160 56% 42%)" }} /><span style={{ color: "hsl(160 56% 42%)" }}>+{campaign.trendDelta}</span></>
                        : <><ArrowDown className="w-3.5 h-3.5" style={{ color: "hsl(350 84% 62%)" }} /><span style={{ color: "hsl(350 84% 62%)" }}>{campaign.trendDelta}</span></>
                      }
                    </div>
                  </div>
                </div>
              </div>

              {/* 7 sub-scores */}
              <div className="grid grid-cols-7 gap-3 mb-4">
                <ScoreGauge value={campaign.engagement} label="Engagement" color="hsl(38 92% 52%)" />
                <ScoreGauge value={campaign.relevance} label="Relevance" color="hsl(222 88% 65%)" />
                <ScoreGauge value={campaign.conversion} label="Conversion" color="hsl(160 56% 42%)" />
                <ScoreGauge value={campaign.authority} label="Authority" color="hsl(268 68% 62%)" />
                <ScoreGauge value={campaign.freshness} label="Freshness" color="hsl(174 68% 42%)" />
                <ScoreGauge value={campaign.network} label="Network" color="hsl(28 94% 58%)" />
                <ScoreGauge value={campaign.efficiency} label="Efficiency" color="hsl(350 84% 62%)" />
              </div>

              {/* Bar chart */}
              <ResponsiveContainer width="100%" height={80}>
                <BarChart data={[{
                  Engagement: campaign.engagement,
                  Relevance: campaign.relevance,
                  Conversion: campaign.conversion,
                  Authority: campaign.authority,
                  Freshness: campaign.freshness,
                  Network: campaign.network,
                  Efficiency: campaign.efficiency,
                }]} barSize={20}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(0 0% 100% / 0.04)" vertical={false} />
                  <XAxis dataKey="name" hide />
                  <Tooltip
                    contentStyle={{ background: "hsl(224 22% 11%)", border: "1px solid hsl(0 0% 100% / 0.08)", borderRadius: 8 }}
                    labelStyle={{ color: "hsl(0 0% 100% / 0.4)" }}
                    itemStyle={{ color: "hsl(38 92% 52%)" }}
                  />
                  {["Engagement","Relevance","Conversion","Authority","Freshness","Network","Efficiency"].map((k, i) => (
                    <Bar key={k} dataKey={k} fill={["hsl(38,92%,52%)","hsl(222,88%,65%)","hsl(160,56%,42%)","hsl(268,68%,62%)","hsl(174,68%,42%)","hsl(28,94%,58%)","hsl(350,84%,62%)"][i]} radius={4} />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            </div>
          ))}
        </div>
      )}

      {/* Insights Tab */}
      {tab === "insights" && (
        <div className="space-y-4">
          {CAMPAIGNS.map((campaign) => (
            <div key={campaign.id} className="rounded-2xl border p-6"
              style={{ background: "hsl(224 20% 11%)", borderColor: "hsl(0 0% 100% / 0.07)" }}>
              <div className="flex items-center gap-3 mb-4">
                <div className="flex items-center justify-center w-10 h-10 rounded-xl font-black text-sm font-mono"
                  style={{ background: "hsl(38 92% 52% / 0.1)", color: "hsl(38 92% 52%)" }}>
                  {campaign.megaScore}
                </div>
                <div>
                  <div className="font-semibold" style={{ color: "hsl(38 15% 94%)" }}>{campaign.name}</div>
                  <div className="text-xs" style={{ color: "hsl(0 0% 100% / 0.35)" }}>{campaign.platform}</div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="rounded-xl p-4" style={{ background: "hsl(0 0% 100% / 0.02)", border: "1px solid hsl(0 0% 100% / 0.05)" }}>
                  <div className="flex items-center gap-2 mb-2">
                    <Activity className="w-3.5 h-3.5" style={{ color: "hsl(38 92% 52%)" }} />
                    <span className="text-xs font-bold uppercase tracking-wider" style={{ color: "hsl(0 0% 100% / 0.4)" }}>Diagnosis</span>
                  </div>
                  <p className="text-sm leading-relaxed" style={{ color: "hsl(0 0% 100% / 0.65)" }}>
                    {campaign.diagnosis}
                  </p>
                </div>
                <div className="rounded-xl p-4" style={{ background: "hsl(160 56% 42% / 0.04)", border: "1px solid hsl(160 56% 42% / 0.12)" }}>
                  <div className="flex items-center gap-2 mb-2">
                    <Zap className="w-3.5 h-3.5" style={{ color: "hsl(160 56% 42%)" }} />
                    <span className="text-xs font-bold uppercase tracking-wider" style={{ color: "hsl(160 56% 42% / 0.7)" }}>Recommendation</span>
                  </div>
                  <p className="text-sm leading-relaxed" style={{ color: "hsl(0 0% 100% / 0.65)" }}>
                    {campaign.recommendation}
                  </p>
                </div>
              </div>
            </div>
          ))}

          {/* Score weight model */}
          <div className="rounded-2xl border p-6"
            style={{ background: "hsl(224 20% 11%)", borderColor: "hsl(0 0% 100% / 0.07)" }}>
            <h3 className="font-bold mb-4" style={{ color: "hsl(38 15% 94%)" }}>
              Mega Algorithm Score — Weight Model
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {SCORE_WEIGHTS.map(({ dimension, weight }) => (
                <div key={dimension} className="rounded-xl p-3 text-center"
                  style={{ background: "hsl(0 0% 100% / 0.03)", border: "1px solid hsl(0 0% 100% / 0.05)" }}>
                  <div className="text-xs font-medium mb-1" style={{ color: "hsl(0 0% 100% / 0.4)" }}>{dimension}</div>
                  <div className="text-lg font-black font-mono" style={{ color: "hsl(38 92% 52%)" }}>{weight}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Trends Tab */}
      {tab === "trends" && (
        <div className="rounded-2xl border p-6"
          style={{ background: "hsl(224 20% 11%)", borderColor: "hsl(0 0% 100% / 0.07)" }}>
          <h3 className="font-bold mb-5" style={{ color: "hsl(38 15% 94%)" }}>
            Mega Algorithm Score — 5-Week Trend
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={TREND_DATA}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(0 0% 100% / 0.04)" />
              <XAxis dataKey="week" tick={{ fill: "hsl(0 0% 100% / 0.3)", fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis domain={[60, 90]} tick={{ fill: "hsl(0 0% 100% / 0.3)", fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ background: "hsl(224 22% 11%)", border: "1px solid hsl(0 0% 100% / 0.08)", borderRadius: 8 }}
                labelStyle={{ color: "hsl(0 0% 100% / 0.4)" }}
              />
              <Line type="monotone" dataKey="saas" name="SaaS Executive Launch" stroke="hsl(38 92% 52%)" strokeWidth={2.5} dot={{ r: 4, fill: "hsl(38 92% 52%)" }} />
              <Line type="monotone" dataKey="healthcare" name="Healthcare Outreach" stroke="hsl(222 88% 65%)" strokeWidth={2.5} dot={{ r: 4, fill: "hsl(222 88% 65%)" }} />
              <Line type="monotone" dataKey="brand" name="Brand Awareness" stroke="hsl(268 68% 62%)" strokeWidth={2.5} dot={{ r: 4, fill: "hsl(268 68% 62%)" }} />
            </LineChart>
          </ResponsiveContainer>

          <div className="flex items-center gap-6 mt-4 justify-center">
            {[
              { name: "SaaS Executive Launch", color: "hsl(38 92% 52%)" },
              { name: "Healthcare Outreach", color: "hsl(222 88% 65%)" },
              { name: "Brand Awareness", color: "hsl(268 68% 62%)" },
            ].map(({ name, color }) => (
              <div key={name} className="flex items-center gap-2 text-xs" style={{ color: "hsl(0 0% 100% / 0.4)" }}>
                <div className="w-3 h-0.5 rounded" style={{ background: color }} />
                {name}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
