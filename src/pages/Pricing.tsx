import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Check, Zap, Star, Building2, Crown, Users,
  ArrowRight, Sparkles, Shield, Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Feature {
  text: string;
  highlight?: boolean;
}

interface Tier {
  id: string;
  name: string;
  price: string;
  priceNote: string;
  tagline: string;
  icon: typeof Zap;
  iconColor: string;
  cardStyle: string;
  badge?: string;
  trial?: string;
  features: Feature[];
  cta: string;
  ctaStyle: string;
}

const tiers: Tier[] = [
  {
    id: "free",
    name: "Personal Command View",
    price: "Free",
    priceNote: "Forever",
    tagline: "Experience the executive command experience",
    icon: Zap,
    iconColor: "hsl(222 88% 65%)",
    cardStyle: "border-white/10",
    features: [
      { text: "1 user" },
      { text: "3 projects" },
      { text: "Daily command dashboard" },
      { text: "Task & project tracking" },
      { text: "Basic operational status" },
      { text: "Manual email forwarding (button in email)" },
      { text: "Copy/paste export only" },
      { text: "Template downloads only" },
      { text: "Limited automation" },
    ],
    cta: "Get Started Free",
    ctaStyle: "bg-white/8 hover:bg-white/12 text-white border border-white/15",
  },
  {
    id: "professional",
    name: "Professional Operator",
    price: "$30",
    priceNote: "per user / month",
    tagline: "For executive assistants, solo operators, and consultants",
    icon: Users,
    iconColor: "hsl(222 88% 65%)",
    cardStyle: "border-white/10",
    features: [
      { text: "Everything in Free" },
      { text: "Exports — PDF, CSV, Doc, PPT" },
      { text: "Up to 3 integrations" },
      { text: "Custom dashboards" },
      { text: "Email → task forwarding" },
      { text: "Once-daily operational prioritization" },
      { text: "Calendar sync" },
      { text: "Workflow templates" },
      { text: "10 automations" },
      { text: "File exports" },
    ],
    cta: "Start Professional",
    ctaStyle: "bg-white/8 hover:bg-white/12 text-white border border-white/15",
  },
  {
    id: "workflow",
    name: "Workflow Builder",
    price: "$50",
    priceNote: "per user / month",
    tagline: "For operations managers, project teams, and founders",
    icon: Sparkles,
    iconColor: "hsl(38 92% 52%)",
    cardStyle: "border-amber/20",
    features: [
      { text: "Everything in Professional" },
      { text: "Workflow builder + auto deployment" },
      { text: "SOP automation" },
      { text: "Approval flows" },
      { text: "Internal dashboards" },
      { text: "Custom reporting" },
      { text: "Up to 10 integrations" },
      { text: "Data imports" },
      { text: "Knowledge base linking" },
      { text: "Unlimited projects" },
      { text: "Monthly operational advisory session", highlight: true },
    ],
    cta: "Start Workflow Builder",
    ctaStyle: "bg-amber/15 hover:bg-amber/20 text-amber border border-amber/30",
  },
  {
    id: "command",
    name: "Command Center",
    price: "$149",
    priceNote: "/ month · up to 5 users",
    tagline: "Your AI-assisted operations command center",
    icon: Crown,
    iconColor: "hsl(38 92% 52%)",
    cardStyle: "border-amber/30 ring-1 ring-amber/20",
    badge: "FLAGSHIP",
    trial: "7-day free trial",
    features: [
      { text: "Everything in Workflow Builder" },
      { text: "Automated email intelligence", highlight: true },
      { text: "Inbox → task extraction with priority detection", highlight: true },
      { text: "Risk flagging + deadline detection", highlight: true },
      { text: "Cross-platform data import (email, PDFs, images)", highlight: true },
      { text: "System builder — SOPs + department structures" },
      { text: "Organizational diagnostics" },
      { text: "Executive command dashboard" },
      { text: "Continual dedicated operational advisor", highlight: true },
      { text: "Non-profit: 20% monthly discount" },
      { text: "Annual billing discount available" },
    ],
    cta: "Start Free Trial",
    ctaStyle: "bg-amber text-[hsl(224_22%_8%)] hover:bg-amber/90 font-bold",
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: "$1,000–$2,000",
    priceNote: "/ month · unlimited users",
    tagline: "Full PMO-Ops as a service — the ADP model for operations",
    icon: Building2,
    iconColor: "hsl(174 68% 42%)",
    cardStyle: "border-teal/20",
    features: [
      { text: "Everything in Command Center" },
      { text: "Unlimited users + integrations" },
      { text: "Dedicated multi-discipline advisor (all channels)", highlight: true },
      { text: "Workflow design + SOP building" },
      { text: "Internal operational audits" },
      { text: "Quarterly multipoint audits" },
      { text: "Team operational audit (collaboration optimization)", highlight: true },
      { text: "Continuous system configuration" },
      { text: "Leadership dashboards" },
      { text: "PMO-Ops as a continuous service" },
    ],
    cta: "Contact Sales",
    ctaStyle: "bg-teal/15 hover:bg-teal/20 text-teal border border-teal/30",
  },
];

const integrationLogos = [
  "Google Workspace", "Microsoft 365", "Slack", "Jira", "Asana",
  "Monday.com", "Salesforce", "HubSpot", "DocuSign", "Zapier",
];

export default function Pricing() {
  const navigate = useNavigate();
  const [billing, setBilling] = useState<"monthly" | "annual">("monthly");

  return (
    <div className="min-h-screen" style={{ background: "hsl(224 22% 8%)" }}>

      {/* Header */}
      <div className="max-w-6xl mx-auto px-6 pt-16 pb-10 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border mb-6 text-[12px] font-semibold tracking-widest uppercase"
          style={{ borderColor: "hsl(38 92% 52% / 0.3)", color: "hsl(38 92% 52%)", background: "hsl(38 92% 52% / 0.06)" }}>
          <Shield className="w-3 h-3" />
          Decades of consulting expertise, built into every tier
        </div>

        <h1 className="text-5xl font-black mb-4 leading-tight" style={{ color: "hsl(38 15% 94%)" }}>
          You deserve the structure<br />
          <span style={{ color: "hsl(38 92% 52%)" }}>and support to succeed</span>
        </h1>
        <p className="text-lg max-w-2xl mx-auto mb-8" style={{ color: "hsl(0 0% 100% / 0.5)" }}>
          From solo operators to enterprise teams — Apphia combines software, operational intelligence,
          and advisory expertise in one command center.
        </p>

        {/* Billing toggle */}
        <div className="inline-flex items-center gap-3 p-1 rounded-xl border"
          style={{ background: "hsl(224 20% 12%)", borderColor: "hsl(0 0% 100% / 0.08)" }}>
          {(["monthly", "annual"] as const).map((b) => (
            <button
              key={b}
              onClick={() => setBilling(b)}
              className={cn(
                "px-5 py-2 rounded-lg text-sm font-semibold transition-all",
                billing === b
                  ? "text-white"
                  : "text-white/40 hover:text-white/60"
              )}
              style={billing === b ? { background: "hsl(38 92% 52% / 0.15)", color: "hsl(38 92% 62%)" } : {}}>
              {b === "monthly" ? "Monthly" : "Annual (save ~20%)"}
            </button>
          ))}
        </div>
      </div>

      {/* Tier Cards */}
      <div className="max-w-6xl mx-auto px-6 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {tiers.map((tier) => {
            const Icon = tier.icon;
            return (
              <div
                key={tier.id}
                className={cn(
                  "relative rounded-2xl border p-6 flex flex-col",
                  tier.cardStyle
                )}
                style={{ background: "hsl(224 20% 11%)" }}>

                {tier.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-[10px] font-black tracking-widest uppercase"
                    style={{ background: "hsl(38 92% 52%)", color: "hsl(224 22% 8%)" }}>
                    {tier.badge}
                  </div>
                )}

                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Icon className="w-5 h-5" style={{ color: tier.iconColor }} />
                      <span className="text-sm font-bold" style={{ color: "hsl(0 0% 100% / 0.7)" }}>
                        {tier.name}
                      </span>
                    </div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-black" style={{ color: "hsl(38 15% 94%)" }}>
                        {tier.price}
                      </span>
                      <span className="text-sm" style={{ color: "hsl(0 0% 100% / 0.4)" }}>
                        {tier.priceNote}
                      </span>
                    </div>
                  </div>
                  {tier.trial && (
                    <div className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-semibold"
                      style={{ background: "hsl(160 56% 42% / 0.12)", color: "hsl(160 56% 52%)" }}>
                      <Clock className="w-3 h-3" />
                      {tier.trial}
                    </div>
                  )}
                </div>

                <p className="text-sm mb-5 leading-relaxed" style={{ color: "hsl(0 0% 100% / 0.45)" }}>
                  {tier.tagline}
                </p>

                {/* Features */}
                <ul className="space-y-2.5 flex-1 mb-6">
                  {tier.features.map((f, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-sm">
                      <Check className="w-4 h-4 mt-0.5 flex-shrink-0"
                        style={{ color: f.highlight ? tier.iconColor : "hsl(160 56% 42%)" }} />
                      <span style={{ color: f.highlight ? "hsl(38 15% 90%)" : "hsl(0 0% 100% / 0.58)" }}>
                        {f.text}
                      </span>
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <button
                  onClick={() => navigate(tier.id === "free" ? "/auth" : "/auth")}
                  className={cn(
                    "w-full py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all",
                    tier.ctaStyle
                  )}>
                  {tier.cta}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            );
          })}
        </div>

        {/* Footnotes */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
          {[
            { icon: Shield, label: "Non-Profit Discount", desc: "20% off the Command Center tier for qualifying non-profit organizations" },
            { icon: Star, label: "Annual Discount", desc: "Save approximately 20% when you commit to annual billing on any paid tier" },
            { icon: Clock, label: "7-Day Free Trial", desc: "Try the Command Center tier free for 7 days, no credit card required" },
          ].map(({ icon: Icon, label, desc }) => (
            <div key={label} className="rounded-xl border p-5"
              style={{ background: "hsl(224 20% 11%)", borderColor: "hsl(0 0% 100% / 0.06)" }}>
              <Icon className="w-5 h-5 mx-auto mb-2" style={{ color: "hsl(38 92% 52%)" }} />
              <div className="text-sm font-semibold mb-1" style={{ color: "hsl(38 15% 90%)" }}>{label}</div>
              <div className="text-xs" style={{ color: "hsl(0 0% 100% / 0.4)" }}>{desc}</div>
            </div>
          ))}
        </div>

        {/* Integrations */}
        <div className="mt-14 text-center">
          <p className="text-xs font-bold uppercase tracking-widest mb-5" style={{ color: "hsl(0 0% 100% / 0.2)" }}>
            Connects to the tools you already use
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            {integrationLogos.map((logo) => (
              <span key={logo} className="px-4 py-2 rounded-xl border text-xs font-medium"
                style={{
                  background: "hsl(224 20% 12%)",
                  borderColor: "hsl(0 0% 100% / 0.07)",
                  color: "hsl(0 0% 100% / 0.35)"
                }}>
                {logo}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
