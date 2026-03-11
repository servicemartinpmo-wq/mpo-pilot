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
];

export function getAdvisorForIndustry(industry: string): IndustryAdvisor | undefined {
  if (!industry) return undefined;
  const lower = industry.toLowerCase();
  return INDUSTRY_ADVISORS.find(a =>
    a.industry.toLowerCase().includes(lower) ||
    lower.includes(a.industry.toLowerCase().split(" ")[0].toLowerCase())
  );
}
