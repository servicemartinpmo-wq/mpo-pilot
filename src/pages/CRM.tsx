import { useState } from "react";
import {
  Building2, Users, TrendingUp, Plus, Search, Filter,
  Mail, Phone, Globe, MapPin, ChevronRight, Star,
  MoreHorizontal, X, ArrowRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

type CRMTab = "companies" | "contacts" | "pipeline";

interface Company {
  id: string;
  name: string;
  industry: string;
  website?: string;
  employeeCount: string;
  estimatedRevenue: string;
  city?: string;
  status: "prospect" | "active" | "inactive" | "churned";
  contacts: number;
  opportunities: number;
}

interface Contact {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  title?: string;
  company?: string;
  industry?: string;
  relevanceScore: number;
  interestScore: number;
  engagementRank: number;
}

interface Opportunity {
  id: string;
  name: string;
  stage: "lead" | "qualified" | "proposal" | "negotiation" | "closed_won" | "closed_lost";
  value: number;
  probability: number;
  company?: string;
  contact?: string;
  expectedCloseDate?: string;
}

const STAGE_CONFIG = {
  lead: { label: "Lead", color: "hsl(222 88% 65%)" },
  qualified: { label: "Qualified", color: "hsl(268 68% 62%)" },
  proposal: { label: "Proposal", color: "hsl(38 92% 52%)" },
  negotiation: { label: "Negotiation", color: "hsl(28 94% 58%)" },
  closed_won: { label: "Closed Won", color: "hsl(160 56% 42%)" },
  closed_lost: { label: "Closed Lost", color: "hsl(350 84% 62%)" },
};

const STATUS_CONFIG = {
  prospect: { label: "Prospect", color: "hsl(222 88% 65%)" },
  active: { label: "Active", color: "hsl(160 56% 42%)" },
  inactive: { label: "Inactive", color: "hsl(0 0% 100% / 0.3)" },
  churned: { label: "Churned", color: "hsl(350 84% 62%)" },
};

const SAMPLE_COMPANIES: Company[] = [
  { id: "c1", name: "Nexus Analytics", industry: "Information Technology", employeeCount: "51–200", estimatedRevenue: "$5M–$20M", city: "Austin", status: "active", contacts: 4, opportunities: 2 },
  { id: "c2", name: "BridgePoint Capital", industry: "Financial Services", employeeCount: "11–50", estimatedRevenue: "$20M–$100M", city: "New York", status: "active", contacts: 2, opportunities: 1 },
  { id: "c3", name: "Verdant Health Systems", industry: "Healthcare Services", employeeCount: "200+", estimatedRevenue: "$100M+", city: "Chicago", status: "prospect", contacts: 3, opportunities: 1 },
  { id: "c4", name: "Atlas Creative Studio", industry: "Arts, Entertainment & Recreation", employeeCount: "2–10", estimatedRevenue: "$500K–$2M", city: "Los Angeles", status: "prospect", contacts: 1, opportunities: 1 },
  { id: "c5", name: "Summit Engineering Group", industry: "Engineering", employeeCount: "51–200", estimatedRevenue: "$10M–$50M", city: "Denver", status: "inactive", contacts: 2, opportunities: 0 },
];

const SAMPLE_CONTACTS: Contact[] = [
  { id: "p1", firstName: "Marcus", lastName: "Rodriguez", email: "m.rodriguez@nexusanalytics.com", phone: "+1 512 555 0192", title: "VP of Operations", company: "Nexus Analytics", industry: "Information Technology", relevanceScore: 92, interestScore: 85, engagementRank: 88 },
  { id: "p2", firstName: "Jennifer", lastName: "Walsh", email: "j.walsh@bridgepoint.com", phone: "+1 212 555 0341", title: "Chief Strategy Officer", company: "BridgePoint Capital", industry: "Financial Services", relevanceScore: 88, interestScore: 72, engagementRank: 79 },
  { id: "p3", firstName: "Dr. Sandra", lastName: "Okafor", email: "s.okafor@verdanthealth.org", phone: "+1 312 555 0876", title: "COO", company: "Verdant Health Systems", industry: "Healthcare Services", relevanceScore: 95, interestScore: 60, engagementRank: 71 },
  { id: "p4", firstName: "Liam", lastName: "Park", email: "liam@atlascreative.co", phone: "+1 310 555 0223", title: "Creative Director", company: "Atlas Creative Studio", industry: "Arts, Entertainment & Recreation", relevanceScore: 65, interestScore: 88, engagementRank: 75 },
];

const SAMPLE_OPPORTUNITIES: Opportunity[] = [
  { id: "o1", name: "Nexus Analytics — Command Center Rollout", stage: "proposal", value: 18000, probability: 65, company: "Nexus Analytics", contact: "Marcus Rodriguez", expectedCloseDate: "2026-04-15" },
  { id: "o2", name: "BridgePoint Capital — Enterprise Tier", stage: "negotiation", value: 24000, probability: 80, company: "BridgePoint Capital", contact: "Jennifer Walsh", expectedCloseDate: "2026-03-28" },
  { id: "o3", name: "Verdant Health Systems — Pilot Program", stage: "qualified", value: 48000, probability: 40, company: "Verdant Health Systems", contact: "Dr. Sandra Okafor", expectedCloseDate: "2026-06-01" },
  { id: "o4", name: "Atlas Creative Studio — Workflow Builder", stage: "lead", value: 6000, probability: 20, company: "Atlas Creative Studio", contact: "Liam Park", expectedCloseDate: "2026-05-10" },
];

const PIPELINE_STAGES: Opportunity["stage"][] = ["lead", "qualified", "proposal", "negotiation", "closed_won", "closed_lost"];

function ScoreBar({ value, color }: { value: number; color: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 rounded-full" style={{ background: "hsl(0 0% 100% / 0.08)" }}>
        <div className="h-full rounded-full transition-all" style={{ width: `${value}%`, background: color }} />
      </div>
      <span className="text-xs font-mono w-7 text-right" style={{ color: "hsl(0 0% 100% / 0.5)" }}>{value}</span>
    </div>
  );
}

export default function CRM() {
  const [tab, setTab] = useState<CRMTab>("companies");
  const [search, setSearch] = useState("");

  const pipelineValue = SAMPLE_OPPORTUNITIES.filter(o => !["closed_won","closed_lost"].includes(o.stage))
    .reduce((s, o) => s + o.value, 0);
  const wonValue = SAMPLE_OPPORTUNITIES.filter(o => o.stage === "closed_won").reduce((s, o) => s + o.value, 0);

  return (
    <div className="min-h-screen p-6 space-y-6">

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-black mb-1" style={{ color: "hsl(38 15% 94%)" }}>
            CRM & Sales Intelligence
          </h1>
          <p className="text-sm" style={{ color: "hsl(0 0% 100% / 0.45)" }}>
            Companies, contacts, and opportunity pipeline
          </p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all"
          style={{ background: "hsl(38 92% 52%)", color: "hsl(224 22% 8%)" }}>
          <Plus className="w-4 h-4" />
          Add {tab === "companies" ? "Company" : tab === "contacts" ? "Contact" : "Opportunity"}
        </button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Total Companies", value: SAMPLE_COMPANIES.length.toString(), icon: Building2, color: "hsl(222 88% 65%)" },
          { label: "Total Contacts", value: SAMPLE_CONTACTS.length.toString(), icon: Users, color: "hsl(268 68% 62%)" },
          { label: "Pipeline Value", value: `$${(pipelineValue / 1000).toFixed(0)}K`, icon: TrendingUp, color: "hsl(38 92% 52%)" },
          { label: "Won Revenue", value: `$${(wonValue / 1000).toFixed(0)}K`, icon: Star, color: "hsl(160 56% 42%)" },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="rounded-xl border p-4"
            style={{ background: "hsl(224 20% 12%)", borderColor: "hsl(0 0% 100% / 0.07)" }}>
            <div className="flex items-center gap-2 mb-2">
              <Icon className="w-4 h-4" style={{ color }} />
              <span className="text-xs font-medium" style={{ color: "hsl(0 0% 100% / 0.4)" }}>{label}</span>
            </div>
            <div className="text-2xl font-black font-mono" style={{ color: "hsl(38 15% 94%)" }}>{value}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 p-1 rounded-xl w-fit border"
        style={{ background: "hsl(224 20% 12%)", borderColor: "hsl(0 0% 100% / 0.06)" }}>
        {(["companies", "contacts", "pipeline"] as CRMTab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              "px-5 py-2 rounded-lg text-sm font-semibold capitalize transition-all",
              tab === t ? "text-white" : "text-white/40 hover:text-white/60"
            )}
            style={tab === t ? { background: "hsl(222 88% 65% / 0.15)", color: "hsl(222 88% 72%)" } : {}}>
            {t}
          </button>
        ))}
      </div>

      {/* Search bar */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "hsl(0 0% 100% / 0.3)" }} />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={`Search ${tab}…`}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm outline-none transition-all"
          style={{
            background: "hsl(224 20% 12%)",
            borderColor: "hsl(0 0% 100% / 0.08)",
            color: "hsl(38 15% 94%)",
          }}
        />
      </div>

      {/* Companies Tab */}
      {tab === "companies" && (
        <div className="rounded-2xl border overflow-hidden"
          style={{ background: "hsl(224 20% 11%)", borderColor: "hsl(0 0% 100% / 0.07)" }}>
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: "1px solid hsl(0 0% 100% / 0.06)" }}>
                {["Company", "Industry", "Size", "Revenue", "Status", "Contacts", "Opportunities", ""].map((h) => (
                  <th key={h} className="px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-wider"
                    style={{ color: "hsl(0 0% 100% / 0.3)" }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {SAMPLE_COMPANIES.filter(c => c.name.toLowerCase().includes(search.toLowerCase())).map((co) => {
                const statusConf = STATUS_CONFIG[co.status];
                return (
                  <tr key={co.id}
                    className="cursor-pointer transition-all hover:bg-white/[0.025]"
                    style={{ borderBottom: "1px solid hsl(0 0% 100% / 0.04)" }}>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-xs font-black"
                          style={{ background: "hsl(222 88% 65% / 0.1)", color: "hsl(222 88% 65%)" }}>
                          {co.name[0]}
                        </div>
                        <div>
                          <div className="text-sm font-semibold" style={{ color: "hsl(38 15% 94%)" }}>{co.name}</div>
                          {co.city && <div className="text-xs flex items-center gap-1" style={{ color: "hsl(0 0% 100% / 0.35)" }}>
                            <MapPin className="w-3 h-3" />{co.city}
                          </div>}
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-sm" style={{ color: "hsl(0 0% 100% / 0.55)" }}>{co.industry}</td>
                    <td className="px-5 py-4 text-sm" style={{ color: "hsl(0 0% 100% / 0.55)" }}>{co.employeeCount}</td>
                    <td className="px-5 py-4 text-sm" style={{ color: "hsl(0 0% 100% / 0.55)" }}>{co.estimatedRevenue}</td>
                    <td className="px-5 py-4">
                      <span className="px-2.5 py-1 rounded-lg text-xs font-semibold"
                        style={{ background: `${statusConf.color}18`, color: statusConf.color }}>
                        {statusConf.label}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-sm font-mono text-center" style={{ color: "hsl(0 0% 100% / 0.55)" }}>{co.contacts}</td>
                    <td className="px-5 py-4 text-sm font-mono text-center" style={{ color: "hsl(0 0% 100% / 0.55)" }}>{co.opportunities}</td>
                    <td className="px-5 py-4">
                      <ChevronRight className="w-4 h-4" style={{ color: "hsl(0 0% 100% / 0.2)" }} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Contacts Tab */}
      {tab === "contacts" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {SAMPLE_CONTACTS.filter(c => `${c.firstName} ${c.lastName}`.toLowerCase().includes(search.toLowerCase())).map((contact) => (
            <div key={contact.id} className="rounded-xl border p-5 hover:bg-white/[0.02] transition-all cursor-pointer"
              style={{ background: "hsl(224 20% 11%)", borderColor: "hsl(0 0% 100% / 0.07)" }}>
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-black"
                    style={{ background: "hsl(268 68% 62% / 0.12)", color: "hsl(268 68% 72%)" }}>
                    {contact.firstName[0]}{contact.lastName[0]}
                  </div>
                  <div>
                    <div className="font-semibold text-sm" style={{ color: "hsl(38 15% 94%)" }}>
                      {contact.firstName} {contact.lastName}
                    </div>
                    <div className="text-xs" style={{ color: "hsl(0 0% 100% / 0.4)" }}>
                      {contact.title} · {contact.company}
                    </div>
                  </div>
                </div>
                <button className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-white/[0.06]">
                  <MoreHorizontal className="w-4 h-4" style={{ color: "hsl(0 0% 100% / 0.3)" }} />
                </button>
              </div>

              <div className="flex gap-3 mb-4">
                {contact.email && (
                  <a href={`mailto:${contact.email}`} className="flex items-center gap-1.5 text-xs hover:opacity-80 transition-opacity"
                    style={{ color: "hsl(222 88% 65%)" }}>
                    <Mail className="w-3 h-3" />{contact.email}
                  </a>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: "hsl(0 0% 100% / 0.25)" }}>Scores</span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-[10px]" style={{ color: "hsl(0 0% 100% / 0.35)" }}>
                  <span>Relevance</span><span>Interest</span><span>Engagement</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <ScoreBar value={contact.relevanceScore} color="hsl(38 92% 52%)" />
                  <ScoreBar value={contact.interestScore} color="hsl(222 88% 65%)" />
                  <ScoreBar value={contact.engagementRank} color="hsl(268 68% 62%)" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pipeline Tab */}
      {tab === "pipeline" && (
        <div className="overflow-x-auto pb-4">
          <div className="flex gap-4 min-w-max">
            {PIPELINE_STAGES.map((stage) => {
              const conf = STAGE_CONFIG[stage];
              const opportunities = SAMPLE_OPPORTUNITIES.filter(o => o.stage === stage);
              const stageValue = opportunities.reduce((s, o) => s + o.value, 0);
              return (
                <div key={stage} className="w-64 flex-shrink-0">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <span className="text-xs font-bold" style={{ color: conf.color }}>{conf.label}</span>
                      <span className="text-xs ml-2 font-mono" style={{ color: "hsl(0 0% 100% / 0.3)" }}>
                        {opportunities.length} · ${(stageValue / 1000).toFixed(0)}K
                      </span>
                    </div>
                  </div>
                  <div className="h-1 rounded-full mb-3" style={{ background: `${conf.color}30` }}>
                    <div className="h-full rounded-full" style={{
                      background: conf.color,
                      width: `${opportunities.length > 0 ? 100 : 10}%`
                    }} />
                  </div>
                  <div className="space-y-3">
                    {opportunities.map((opp) => (
                      <div key={opp.id} className="rounded-xl border p-4 cursor-pointer transition-all hover:bg-white/[0.03]"
                        style={{ background: "hsl(224 20% 11%)", borderColor: "hsl(0 0% 100% / 0.07)" }}>
                        <div className="font-semibold text-sm mb-1.5 leading-snug" style={{ color: "hsl(38 15% 94%)" }}>
                          {opp.name}
                        </div>
                        <div className="text-xs mb-2" style={{ color: "hsl(0 0% 100% / 0.4)" }}>
                          {opp.company}
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-bold font-mono" style={{ color: conf.color }}>
                            ${opp.value.toLocaleString()}
                          </span>
                          <span className="text-xs px-2 py-0.5 rounded-lg"
                            style={{ background: `${conf.color}15`, color: conf.color }}>
                            {opp.probability}%
                          </span>
                        </div>
                        {opp.expectedCloseDate && (
                          <div className="text-[10px] mt-2" style={{ color: "hsl(0 0% 100% / 0.28)" }}>
                            Close: {new Date(opp.expectedCloseDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                          </div>
                        )}
                      </div>
                    ))}
                    <button className="w-full py-2.5 rounded-xl border text-xs font-medium flex items-center justify-center gap-1.5 transition-all hover:bg-white/[0.03]"
                      style={{ borderColor: "hsl(0 0% 100% / 0.06)", color: "hsl(0 0% 100% / 0.25)", borderStyle: "dashed" }}>
                      <Plus className="w-3 h-3" /> Add opportunity
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
