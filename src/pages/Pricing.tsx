import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Check, Zap, Star, Building2, Crown, Users,
  ArrowRight, Sparkles, Shield, Clock, BarChart3, Heart,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useUserMode, type UserMode } from "@/hooks/useUserMode";

interface Feature { text: string; highlight?: boolean }

interface Tier {
  id: string;
  name: string;
  audience: string;
  price: string;
  priceNote: string;
  tagline: string;
  icon: typeof Zap;
  accent: string;
  accentBg: string;
  border: string;
  badge?: string;
  features: Feature[];
  cta: string;
  ctaPrimary?: boolean;
}

const tiers: Tier[] = [
  {
    id: "free",
    name: "Free",
    audience: "Get started",
    price: "Free",
    priceNote: "Ad-supported",
    tagline: "Try the command experience with no commitment.",
    icon: Zap,
    accent: "hsl(220 70% 65%)",
    accentBg: "hsl(220 70% 65% / 0.10)",
    border: "hsl(220 30% 25%)",
    features: [
      { text: "Limited insights & recommendations" },
      { text: "10–20 frameworks" },
      { text: "Basic KPI dashboards" },
      { text: "Single workspace" },
      { text: "Basic growth templates" },
      { text: "In-app advertising" },
    ],
    cta: "Get Started Free",
  },
  {
    id: "solo",
    name: "Solo",
    audience: "Solopreneurs · Creatives · Freelancers",
    price: "$30",
    priceNote: "/ month",
    tagline: "Insights, frameworks, and goal tracking for individual operators.",
    icon: Users,
    accent: "hsl(174 72% 50%)",
    accentBg: "hsl(174 72% 50% / 0.10)",
    border: "hsl(174 40% 25%)",
    features: [
      { text: "Insights and recommendations" },
      { text: "50–100 frameworks" },
      { text: "Project-level KPI dashboards" },
      { text: "OKR templates & goal tracking" },
      { text: "Single workspace (up to 5 users)" },
      { text: "Basic reporting" },
    ],
    cta: "Start Solo",
  },
  {
    id: "growth",
    name: "Growth",
    audience: "Small Teams · Growth-Oriented Founders",
    price: "$75",
    priceNote: "/ month",
    tagline: "Business-wide dashboards, scenario modeling, and benchmarking.",
    icon: BarChart3,
    accent: "hsl(38 92% 55%)",
    accentBg: "hsl(38 92% 55% / 0.10)",
    border: "hsl(38 50% 28%)",
    badge: "MOST POPULAR",
    features: [
      { text: "200–300 frameworks", highlight: true },
      { text: "Business dashboards — Sales, Marketing, Finance", highlight: true },
      { text: "Scenario modeling" },
      { text: "Financial templates (P&L, cash flow, unit economics)", highlight: true },
      { text: "Industry benchmarking" },
      { text: "Workspace up to 15 users" },
    ],
    cta: "Start Growth",
    ctaPrimary: true,
  },
  {
    id: "smb",
    name: "Command",
    audience: "Growing SMBs · Established Teams",
    price: "$250",
    priceNote: "/ month",
    tagline: "Full analysis engine, cross-department intelligence, and integrations.",
    icon: Crown,
    accent: "hsl(268 68% 65%)",
    accentBg: "hsl(268 68% 65% / 0.10)",
    border: "hsl(268 35% 28%)",
    features: [
      { text: "Full analysis engine — complete coverage", highlight: true },
      { text: "Cross-department dashboards (Finance, Sales, Marketing, Operations, Product)", highlight: true },
      { text: "Scenario simulations & stress testing" },
      { text: "Integrations — CRM, ERP, Accounting, HR", highlight: true },
      { text: "Operational recommendations & gap scoring" },
      { text: "Multi-user collaboration (up to 50 users)" },
      { text: "Industry benchmarking" },
      { text: "Tier 4–5 maturity roadmap included", highlight: true },
    ],
    cta: "Start Command",
  },
  {
    id: "enterprise",
    name: "Enterprise",
    audience: "Large organizations",
    price: "$1,500–$2,000",
    priceNote: "/ month",
    tagline: "Custom decision engine, white-label modules, and unlimited scale.",
    icon: Building2,
    accent: "hsl(350 72% 62%)",
    accentBg: "hsl(350 72% 62% / 0.10)",
    border: "hsl(350 35% 25%)",
    features: [
      { text: "Custom decision engine", highlight: true },
      { text: "White-label / brandable modules", highlight: true },
      { text: "API access & full data integration", highlight: true },
      { text: "Enterprise-grade security & compliance" },
      { text: "Unlimited users" },
      { text: "Advanced predictive analysis", highlight: true },
      { text: "Dedicated support & onboarding" },
    ],
    cta: "Contact Sales",
  },
];

const annualDiscount = 0.80;

const MODE_TAGLINES: Record<UserMode, string> = {
  founder: "Built for founders scaling their business",
  executive: "Built for executives managing operations",
  startup: "Built for operators who need to move fast",
  creative: "Built for creators managing projects and clients",
  freelance: "Built for freelancers staying organized",
  simple: "Built for anyone who needs clear guidance",
};

export default function Pricing() {
  const navigate = useNavigate();
  const { mode } = useUserMode();
  const [billing, setBilling] = useState<"monthly" | "annual">("monthly");

  const displayPrice = (tier: Tier) => {
    if (tier.price === "Free" || tier.id === "enterprise") return tier.price;
    if (billing === "annual") {
      const base = parseInt(tier.price.replace("$", "").replace(",", ""));
      const discounted = Math.round(base * annualDiscount);
      return `$${discounted.toLocaleString()}`;
    }
    return tier.price;
  };

  return (
    <div className="min-h-screen" style={{ background: "hsl(224 22% 7%)" }}>

      {/* Header */}
      <div className="max-w-6xl mx-auto px-6 pt-14 pb-10 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border mb-6 text-[11px] font-bold tracking-widest uppercase"
          style={{ borderColor: "hsl(38 92% 52% / 0.25)", color: "hsl(38 92% 60%)", background: "hsl(38 92% 52% / 0.06)" }}>
          <Shield className="w-3 h-3" />
          {MODE_TAGLINES[mode]}
        </div>
        <h1 className="text-4xl lg:text-5xl font-black mb-4 leading-tight" style={{ color: "hsl(38 12% 94%)" }}>
          The right level of intelligence<br />
          <span style={{ color: "hsl(38 92% 55%)" }}>for where you are right now</span>
        </h1>
        <p className="text-base max-w-xl mx-auto mb-8" style={{ color: "hsl(0 0% 100% / 0.45)" }}>
          Start free. Upgrade as your business grows. Every tier delivers real operational value.
        </p>

        {/* Billing toggle */}
        <div className="inline-flex items-center p-1 rounded-xl border"
          style={{ background: "hsl(224 20% 11%)", borderColor: "hsl(0 0% 100% / 0.07)" }}>
          {(["monthly", "annual"] as const).map((b) => (
            <button key={b} onClick={() => setBilling(b)}
              className={cn("px-5 py-1.5 rounded-lg text-sm font-semibold transition-all")}
              style={billing === b
                ? { background: "hsl(38 92% 52% / 0.14)", color: "hsl(38 92% 62%)" }
                : { color: "hsl(0 0% 100% / 0.35)" }}>
              {b === "monthly" ? "Monthly" : "Annual · save 20%"}
            </button>
          ))}
        </div>
      </div>

      {/* Tier Cards */}
      <div className="max-w-6xl mx-auto px-6 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {tiers.map((tier) => {
            const Icon = tier.icon;
            const isPrimary = tier.ctaPrimary;
            return (
              <div key={tier.id}
                className="relative rounded-2xl border flex flex-col"
                style={{
                  background: isPrimary ? "hsl(224 22% 13%)" : "hsl(224 20% 10%)",
                  borderColor: isPrimary ? tier.border : "hsl(0 0% 100% / 0.07)",
                  boxShadow: isPrimary ? `0 0 40px ${tier.accentBg}` : "none",
                }}>

                {tier.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full text-[9px] font-black tracking-widest uppercase whitespace-nowrap"
                    style={{ background: tier.accent, color: "hsl(224 22% 8%)" }}>
                    {tier.badge}
                  </div>
                )}

                <div className="p-5 flex flex-col flex-1">
                  {/* Tier header */}
                  <div className="mb-4">
                    <div className="flex items-center gap-1.5 mb-2">
                      <div className="w-6 h-6 rounded-lg flex items-center justify-center"
                        style={{ background: tier.accentBg }}>
                        <Icon className="w-3.5 h-3.5" style={{ color: tier.accent }} />
                      </div>
                      <span className="text-xs font-bold" style={{ color: tier.accent }}>{tier.name}</span>
                    </div>
                    <div className="text-[10px] mb-3" style={{ color: "hsl(0 0% 100% / 0.35)" }}>
                      {tier.audience}
                    </div>
                    <div className="flex items-baseline gap-1 mb-1">
                      <span className="text-2xl font-black" style={{ color: "hsl(38 12% 94%)" }}>
                        {displayPrice(tier)}
                      </span>
                      {tier.id !== "enterprise" && (
                        <span className="text-xs" style={{ color: "hsl(0 0% 100% / 0.35)" }}>
                          {billing === "annual" && tier.price !== "Free" ? "/mo billed annually" : tier.priceNote}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] leading-relaxed" style={{ color: "hsl(0 0% 100% / 0.40)" }}>
                      {tier.tagline}
                    </p>
                  </div>

                  {/* Features */}
                  <ul className="space-y-2 flex-1 mb-5">
                    {tier.features.map((f, i) => (
                      <li key={i} className="flex items-start gap-2 text-[12px]">
                        <Check className="w-3.5 h-3.5 mt-0.5 flex-shrink-0"
                          style={{ color: f.highlight ? tier.accent : "hsl(160 50% 42%)" }} />
                        <span style={{ color: f.highlight ? "hsl(38 12% 90%)" : "hsl(0 0% 100% / 0.52)" }}>
                          {f.text}
                        </span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA */}
                  <button
                    onClick={() => navigate(tier.id === "enterprise" ? "/auth" : "/auth")}
                    className="w-full py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all"
                    style={isPrimary
                      ? { background: tier.accent, color: "hsl(224 22% 8%)" }
                      : { background: tier.accentBg, color: tier.accent, border: `1px solid ${tier.border}` }}>
                    {tier.cta}
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Feature comparison note */}
        <div className="mt-10 rounded-2xl border p-6"
          style={{ background: "hsl(224 20% 10%)", borderColor: "hsl(0 0% 100% / 0.06)" }}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            {[
              { icon: Shield, label: "Non-Profit Discount", desc: "20% off any paid tier for qualifying non-profit organizations" },
              { icon: Star,   label: "Annual Savings",      desc: "Save ~20% when you commit to annual billing on any paid plan" },
              { icon: Clock,  label: "No Lock-In",          desc: "Cancel or downgrade any time — no questions asked" },
            ].map(({ icon: Ic, label, desc }) => (
              <div key={label}>
                <Ic className="w-4 h-4 mx-auto mb-2" style={{ color: "hsl(38 92% 52%)" }} />
                <div className="text-sm font-semibold mb-1" style={{ color: "hsl(38 12% 88%)" }}>{label}</div>
                <div className="text-xs" style={{ color: "hsl(0 0% 100% / 0.35)" }}>{desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Integration row */}
        <div className="mt-10 text-center">
          <p className="text-[10px] font-bold uppercase tracking-widest mb-4" style={{ color: "hsl(0 0% 100% / 0.18)" }}>
            Integrates with the tools you already use
          </p>
          <div className="flex flex-wrap justify-center gap-2.5">
            {["Google Workspace","Microsoft 365","Slack","Jira","Asana","Monday.com","Salesforce","HubSpot","Zapier","QuickBooks"].map((logo) => (
              <span key={logo} className="px-3 py-1.5 rounded-xl border text-[11px] font-medium"
                style={{ background: "hsl(224 20% 11%)", borderColor: "hsl(0 0% 100% / 0.06)", color: "hsl(0 0% 100% / 0.30)" }}>
                {logo}
              </span>
            ))}
          </div>
        </div>

        {/* Commitment to Care */}
        <div className="mt-12 rounded-2xl border p-8 text-center"
          style={{ background: "hsl(224 22% 9%)", borderColor: "hsl(222 60% 48% / 0.20)" }}>
          <Heart className="w-5 h-5 mx-auto mb-3" style={{ color: "hsl(222 60% 58%)" }} />
          <h3 className="text-base font-bold mb-2" style={{ color: "hsl(38 12% 92%)" }}>
            A Commitment to Care
          </h3>
          <p className="text-sm max-w-xl mx-auto leading-relaxed" style={{ color: "hsl(0 0% 100% / 0.42)" }}>
            We built this platform around a simple belief: leaders deserve tools that respect their time, protect their data, and reduce their load — not add to it. Every tier is designed with that in mind.
          </p>
        </div>
      </div>
    </div>
  );
}
