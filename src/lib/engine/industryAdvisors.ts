export interface IndustryAdvisor {
  industry: string;
  icon: string;
  description: string;
  terminology: Record<string, string>;
  keyKPIs: string[];
  frameworks: string[];
  benchmarks: { label: string; value: string; unit: string }[];
  color: string;
}

export const INDUSTRY_ADVISORS: IndustryAdvisor[] = [
  {
    industry: "Technology",
    icon: "💻",
    description: "Engineering velocity, product-led growth, agile execution, and tech debt management.",
    terminology: {
      "Projects": "Sprints",
      "Departments": "Squads / Tribes",
      "Lead": "Engineering Manager",
      "Operations": "Platform Engineering",
    },
    keyKPIs: ["Deploy frequency", "MTTR (mean time to recovery)", "Lead time for changes", "Change failure rate", "Sprint velocity", "Burn rate"],
    frameworks: ["DORA Metrics", "Shape Up", "SAFe", "OKRs", "CMMI Level 3+"],
    benchmarks: [
      { label: "Deploy frequency (Elite)", value: "Multiple / day", unit: "" },
      { label: "MTTR (Elite)", value: "< 1 hr", unit: "" },
      { label: "Eng / PM ratio", value: "5–8:1", unit: "" },
    ],
    color: "hsl(222 88% 65%)",
  },
  {
    industry: "Healthcare",
    icon: "🏥",
    description: "Patient outcomes, regulatory compliance, clinical workflow optimization, and care coordination.",
    terminology: {
      "Initiatives": "Clinical Programs",
      "Departments": "Clinical Units",
      "Lead": "Clinical Director",
      "Workflows": "Care Protocols",
    },
    keyKPIs: ["Patient satisfaction (HCAHPS)", "Readmission rate", "Average LOS", "Bed utilization", "Staff-to-patient ratio", "Compliance audit score"],
    frameworks: ["Lean Healthcare", "Six Sigma DMAIC", "Joint Commission Standards", "ISO 9001", "HIPAA Compliance"],
    benchmarks: [
      { label: "Readmission rate (top quartile)", value: "< 12%", unit: "" },
      { label: "Bed utilization", value: "75–85%", unit: "" },
      { label: "Staff-to-patient ratio (ICU)", value: "1:2", unit: "" },
    ],
    color: "hsl(160 56% 42%)",
  },
  {
    industry: "Manufacturing",
    icon: "🏭",
    description: "Production efficiency, quality control, supply chain optimization, and lean operations.",
    terminology: {
      "Initiatives": "Production Programs",
      "Departments": "Production Lines / Cells",
      "Lead": "Plant Manager",
      "Workflows": "Standard Work Instructions",
    },
    keyKPIs: ["OEE (Overall Equipment Effectiveness)", "Defect rate (PPM)", "On-time delivery", "Inventory turns", "First-pass yield", "Safety incident rate"],
    frameworks: ["Toyota Production System", "5S", "Kaizen", "Six Sigma", "Theory of Constraints", "ISO 9001"],
    benchmarks: [
      { label: "OEE (World Class)", value: "> 85%", unit: "" },
      { label: "Defect rate (top quartile)", value: "< 500 PPM", unit: "" },
      { label: "On-time delivery", value: "> 95%", unit: "" },
    ],
    color: "hsl(28 94% 58%)",
  },
  {
    industry: "Financial Services",
    icon: "🏦",
    description: "Risk management, regulatory compliance, portfolio performance, and client servicing excellence.",
    terminology: {
      "Initiatives": "Programs / Mandates",
      "Departments": "Business Units / Desks",
      "Lead": "Head of Function",
      "Workflows": "Operating Procedures",
    },
    keyKPIs: ["AUM growth", "Cost-to-income ratio", "NPL ratio", "Compliance audit score", "Client NPS", "ROE / ROA"],
    frameworks: ["Basel III/IV", "COSO ERM", "COBIT", "Balanced Scorecard", "ISO 31000 Risk"],
    benchmarks: [
      { label: "Cost-to-income ratio (best-in-class)", value: "< 45%", unit: "" },
      { label: "NPL ratio (best-in-class)", value: "< 2%", unit: "" },
      { label: "Client NPS (top quartile)", value: "> 55", unit: "" },
    ],
    color: "hsl(222 88% 65%)",
  },
  {
    industry: "Education",
    icon: "🎓",
    description: "Student outcomes, program quality, institutional effectiveness, and accreditation compliance.",
    terminology: {
      "Initiatives": "Academic Programs",
      "Departments": "Faculties / Schools",
      "Lead": "Dean / Department Chair",
      "Workflows": "Curriculum Frameworks",
    },
    keyKPIs: ["Graduation rate", "Student-faculty ratio", "Employment rate (6mo post-grad)", "Research output (publications)", "Student satisfaction score", "Accreditation compliance"],
    frameworks: ["Bloom's Taxonomy", "PDCA (Deming)", "Baldrige Education Framework", "ISO 21001", "QAA Standards"],
    benchmarks: [
      { label: "Graduation rate (top quartile)", value: "> 85%", unit: "" },
      { label: "Student-faculty ratio", value: "15:1 or better", unit: "" },
      { label: "Student satisfaction", value: "> 80%", unit: "" },
    ],
    color: "hsl(38 92% 52%)",
  },
  {
    industry: "Retail / E-commerce",
    icon: "🛍️",
    description: "Customer acquisition, conversion optimization, supply chain agility, and brand loyalty.",
    terminology: {
      "Initiatives": "Campaigns / Launches",
      "Departments": "Channels / Verticals",
      "Lead": "Category Manager",
      "Workflows": "Fulfillment Processes",
    },
    keyKPIs: ["Conversion rate", "Average order value (AOV)", "Customer LTV", "CAC payback period", "Inventory turnover", "NPS / CSAT"],
    frameworks: ["RFM Analysis", "Jobs-to-be-Done", "AARRR Funnel", "Lean Supply Chain", "NPS System"],
    benchmarks: [
      { label: "E-commerce conversion rate", value: "2–4%", unit: "" },
      { label: "Cart abandonment (industry avg)", value: "70%", unit: "" },
      { label: "CAC payback period", value: "< 12 months", unit: "" },
    ],
    color: "hsl(160 56% 42%)",
  },
  {
    industry: "Startup",
    icon: "🚀",
    description: "Rapid iteration, product-market fit, fundraising readiness, and lean growth.",
    terminology: {
      "Initiatives": "Experiments / Bets",
      "Departments": "Pods",
      "Lead": "Founding Lead",
      "Workflows": "Playbooks",
    },
    keyKPIs: ["MRR / ARR", "MoM growth rate", "Churn rate", "Runway (months)", "Burn multiple", "NPS"],
    frameworks: ["OKRs", "Lean Startup", "AARRR", "Jobs-to-be-Done", "North Star Metric"],
    benchmarks: [
      { label: "Seed-stage MoM growth", value: "10–15%", unit: "" },
      { label: "Good burn multiple", value: "< 1.5x", unit: "" },
      { label: "Minimum runway", value: "18 months", unit: "" },
    ],
    color: "hsl(350 84% 62%)",
  },
  {
    industry: "Logistics / Supply Chain",
    icon: "🚚",
    description: "End-to-end supply chain visibility, transportation optimization, warehouse efficiency, and demand-supply synchronization.",
    terminology: {
      "Initiatives": "Supply Chain Programs",
      "Departments": "Nodes / Distribution Centers",
      "Lead": "VP Supply Chain / Logistics Director",
      "Workflows": "Standard Operating Procedures",
    },
    keyKPIs: ["Perfect order rate", "On-time in-full (OTIF)", "Inventory turns", "Freight cost per unit", "Warehouse utilization", "Order cycle time"],
    frameworks: ["SCOR Model", "Lean Supply Chain", "S&OP", "Theory of Constraints", "Demand Planning"],
    benchmarks: [
      { label: "Perfect order rate (best-in-class)", value: "> 95%", unit: "" },
      { label: "OTIF (top quartile)", value: "> 97%", unit: "" },
      { label: "Inventory turns (top quartile)", value: "> 12x", unit: "" },
    ],
    color: "hsl(200 70% 50%)",
  },
  {
    industry: "Aviation",
    icon: "✈️",
    description: "Fleet utilization, safety compliance, route profitability, and operational turnaround efficiency.",
    terminology: {
      "Initiatives": "Fleet / Route Programs",
      "Departments": "Stations / Operations Centers",
      "Lead": "VP Operations / Chief Pilot",
      "Workflows": "Standard Operating Procedures (SOPs)",
    },
    keyKPIs: ["CASM (cost per available seat mile)", "Load factor", "On-time performance (OTP)", "Aircraft utilization (block hours)", "Revenue per ASM (RASM)", "Safety incident rate"],
    frameworks: ["IOSA Standards", "SMS (Safety Management Systems)", "Lean MRO", "SCOR Model", "Six Sigma"],
    benchmarks: [
      { label: "Load factor (profitable)", value: "> 80%", unit: "" },
      { label: "On-time performance (top quartile)", value: "> 85%", unit: "" },
      { label: "CASM (low-cost benchmark)", value: "< 8 cents", unit: "" },
    ],
    color: "hsl(210 80% 55%)",
  },
  {
    industry: "Consulting / Professional Services",
    icon: "💼",
    description: "Utilization optimization, client delivery excellence, knowledge management, and talent development.",
    terminology: {
      "Initiatives": "Engagements / Mandates",
      "Departments": "Practice Areas / Service Lines",
      "Lead": "Managing Director / Partner",
      "Workflows": "Delivery Methodologies",
    },
    keyKPIs: ["Billable utilization rate", "Revenue per consultant", "Project margin", "Client satisfaction (CSAT)", "Employee attrition rate", "Proposal win rate"],
    frameworks: ["Balanced Scorecard", "OKRs", "PMBOK", "Knowledge Management", "Capability Maturity Model"],
    benchmarks: [
      { label: "Billable utilization (best-in-class)", value: "> 75%", unit: "" },
      { label: "Project margin (healthy)", value: "> 35%", unit: "" },
      { label: "Employee attrition (top quartile)", value: "< 15%", unit: "" },
    ],
    color: "hsl(260 60% 55%)",
  },
  {
    industry: "Energy & Utilities",
    icon: "⚡",
    description: "Asset reliability, regulatory compliance, grid stability, safety, and energy transition management.",
    terminology: {
      "Initiatives": "Capital Programs / Regulatory Filings",
      "Departments": "Operating Units / Generation Assets",
      "Lead": "VP Operations / Plant Manager",
      "Workflows": "Operating Procedures / Outage Plans",
    },
    keyKPIs: ["System Average Interruption Duration (SAIDI)", "System Average Interruption Frequency (SAIFI)", "Heat rate efficiency", "Capacity factor", "OSHA recordable incident rate", "Regulatory compliance score"],
    frameworks: ["ISO 55001 (Asset Mgmt)", "NERC Reliability Standards", "Bowtie Risk Analysis", "SCOR Model", "Six Sigma"],
    benchmarks: [
      { label: "SAIDI (top quartile)", value: "< 90 min/yr", unit: "" },
      { label: "Capacity factor (combined cycle)", value: "> 85%", unit: "" },
      { label: "OSHA recordable rate (best-in-class)", value: "< 1.0", unit: "" },
    ],
    color: "hsl(45 90% 50%)",
  },
  {
    industry: "Real Estate",
    icon: "🏢",
    description: "Portfolio performance, asset valuation, tenant satisfaction, and capital deployment optimization.",
    terminology: {
      "Initiatives": "Development Projects / Acquisitions",
      "Departments": "Asset Classes / Portfolios",
      "Lead": "Portfolio Manager / VP Asset Management",
      "Workflows": "Lease Administration / Due Diligence",
    },
    keyKPIs: ["Cap rate", "Net Operating Income (NOI)", "Occupancy rate", "Debt service coverage ratio (DSCR)", "Tenant retention rate", "Funds from Operations (FFO)"],
    frameworks: ["DCF Valuation", "NPV / IRR", "Balanced Scorecard", "ARGUS Modeling", "Risk-Adjusted Return"],
    benchmarks: [
      { label: "Cap rate (Class A office)", value: "4–6%", unit: "" },
      { label: "Occupancy rate (stabilized)", value: "> 92%", unit: "" },
      { label: "DSCR (healthy)", value: "> 1.25x", unit: "" },
    ],
    color: "hsl(15 70% 55%)",
  },
  {
    industry: "Media & Entertainment",
    icon: "🎬",
    description: "Content performance, audience engagement, monetization optimization, and IP portfolio management.",
    terminology: {
      "Initiatives": "Productions / Campaigns",
      "Departments": "Studios / Verticals / Channels",
      "Lead": "SVP Content / GM",
      "Workflows": "Production Pipelines",
    },
    keyKPIs: ["Audience reach / impressions", "Engagement rate", "Content ROI", "Subscriber growth rate", "ARPU (average revenue per user)", "Churn rate"],
    frameworks: ["AARRR Metrics", "North Star Metric", "Content Scoring Models", "Customer Journey Mapping", "Product-Led Growth"],
    benchmarks: [
      { label: "Engagement rate (social, good)", value: "> 3%", unit: "" },
      { label: "Subscriber churn (streaming, top quartile)", value: "< 5% / mo", unit: "" },
      { label: "Content ROI (profitable)", value: "> 2x", unit: "" },
    ],
    color: "hsl(320 70% 55%)",
  },
];

export function getAdvisorForIndustry(industry: string): IndustryAdvisor | undefined {
  if (!industry) return undefined;
  const lower = industry.toLowerCase();
  return INDUSTRY_ADVISORS.find(a =>
    a.industry.toLowerCase().includes(lower) ||
    lower.includes(a.industry.toLowerCase().split(" ")[0].toLowerCase())
  );
}
