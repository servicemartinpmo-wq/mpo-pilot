// MARTIN PMO-OPs Command Center — Organizational Intelligence Data Layer

export type SignalLevel = "red" | "yellow" | "green" | "blue";
export type MaturityTier = "Foundational" | "Developing" | "Structured" | "Managed" | "Optimized";
export type InsightType = "Risk Escalation" | "Strategic Misalignment" | "Capacity Constraint" | "Dependency Bottleneck" | "Performance Anomaly" | "Execution Delay";
export type InitiativeStatus = "On Track" | "At Risk" | "Delayed" | "Blocked" | "Completed";
export type InitiativeCategory = "Directive" | "Supportive" | "Controlling" | "Diagnostic" | "Strategic";
export type Framework = "Porter" | "Rumelt" | "BSC" | "OKR" | "Lean" | "Six Sigma" | "TOC";
export type GovernanceLogType = "Risk" | "Decision" | "Change";
export type ActionItemStatus = "Not Started" | "In Progress" | "Completed" | "Blocked";
export type DirectiveStatus = "Pending" | "In Progress" | "Completed";
export type RiskSeverity = "Critical" | "High" | "Medium" | "Low";

// ──────────────────────────────────────────────
// INTERFACES
// ──────────────────────────────────────────────

export interface Insight {
  id: string;
  type: InsightType;
  department: string;
  situation: string;
  diagnosis: string;
  recommendation: string;
  systemRemedy: string;
  executivePriorityScore: number;
  strategicImpact: number;
  urgency: number;
  operationalRisk: number;
  leverage: number;
  framework: Framework;
  signal: SignalLevel;
  createdAt: string;
}

export interface Department {
  id: string;
  name: string;
  head: string;
  headcount: number;
  capacityUsed: number;
  riskScore: number;
  executionHealth: number;
  maturityScore: number;
  maturityTier: MaturityTier;
  activeInitiatives: number;
  blockedTasks: number;
  signal: SignalLevel;
  keyKPIs: { label: string; value: string; trend: "up" | "down" | "flat" }[];
  coreResponsibilities: string[];
  keyFunctions: string[];
  authorityLevel: "Executive" | "Senior" | "Manager" | "Analyst" | "Coordinator";
  sopAdherence: number;
  decisionRights: string[];
  frameworks: Framework[];
}

export interface Initiative {
  id: string;
  name: string;
  department: string;
  category: InitiativeCategory;
  owner: string;
  executiveOwner: string;
  strategicPillar: string;
  status: InitiativeStatus;
  healthStatus: "Green" | "Yellow" | "Red";
  priorityScore: number;
  strategicAlignment: number;
  dependencyRisk: number;
  estimatedImpact: "High" | "Medium" | "Low";
  budget: number;
  budgetUsed: number;
  startDate: string;
  targetDate: string;
  completionPct: number;
  signal: SignalLevel;
  frameworks: Framework[];
  dependencies: string[];
  description: string;
  kpis: string[];
  risks: { label: string; probability: "High" | "Medium" | "Low"; impact: "High" | "Medium" | "Low" }[];
  raci: { role: string; name: string; type: "Responsible" | "Accountable" | "Consulted" | "Informed" }[];
}

export interface ActionItem {
  id: string;
  title: string;
  initiativeId: string;
  assignedTo: string;
  dueDate: string;
  status: ActionItemStatus;
  priority: "High" | "Medium" | "Low";
  description: string;
  dependency?: string;
  completedDate?: string;
}

export interface Directive {
  id: string;
  title: string;
  initiativeId: string;
  owner: string;
  startDate?: string;
  dueDate?: string;
  status: DirectiveStatus;
  priority: "High" | "Medium" | "Low";
  description: string;
}

export interface GovernanceLog {
  id: string;
  initiativeId: string;
  type: GovernanceLogType;
  title: string;
  severity: number;
  owner: string;
  status: "Open" | "In Review" | "Resolved" | "Escalated";
  notes: string;
  createdDate: string;
}

export interface FrameworkEngine {
  id: Framework;
  name: string;
  description: string;
  expertDomain: string;
  activeInsights: number;
  status: "Active" | "Monitoring" | "Alerting";
  coverage: string[];
  lastTriggered: string;
  diagnosticFocus: string[];
}

export interface AuthorityMatrixEntry {
  role: string;
  department: string;
  person: string;
  budgetAuthority: string;
  hiringAuthority: string;
  initiativeApproval: string;
  riskApproval: string;
  level: "L1" | "L2" | "L3" | "L4";
}

export interface SOPRecord {
  id: string;
  title: string;
  department: string;
  version: string;
  status: "Active" | "Under Review" | "Outdated";
  lastReviewed: string;
  adherenceRate: number;
  owner: string;
}

export interface OrgProfile {
  name: string;
  mission: string;
  vision: string;
  orgType: string;
  teamSize: number;
  revenueRange: string;
  departments: string[];
  hasSops: boolean;
  strategicPillars: string[];
}

// ──────────────────────────────────────────────
// ORG PROFILE
// ──────────────────────────────────────────────

export const orgProfile: OrgProfile = {
  name: "Martin Enterprises",
  mission: "Convert unstructured ambition and ideas into governed execution using embedded PMO logic, operational intelligence, and persistent executive memory.",
  vision: "To provide PMO+Ops grade authority inside every growing business, giving clarity, control, and confidence.",
  orgType: "SaaS / Professional Services",
  teamSize: 104,
  revenueRange: "$5M–$25M",
  departments: ["Executive Leadership", "Strategy", "Product Development", "Program Delivery", "Finance", "Human Capital", "Marketing", "Legal & Compliance", "IT / Systems", "Customer Experience", "Sales & Development", "Data & Analytics", "Operations"],
  hasSops: true,
  strategicPillars: ["Revenue Acceleration", "Operational Excellence", "Customer Experience", "Talent & Culture", "Technology Modernization"],
};

// ──────────────────────────────────────────────
// INSIGHTS
// ──────────────────────────────────────────────

export const insights: Insight[] = [
  {
    id: "ins-001",
    type: "Capacity Constraint",
    department: "Program Delivery",
    situation: "Program Delivery is operating at 94% capacity across 7 concurrent initiatives. Three senior PMs are allocated to conflicting sprint cycles with overlapping delivery windows in Q2.",
    diagnosis: "Theory of Constraints analysis identifies the PM resource pool as the primary system constraint. Bottleneck is compounded by unresolved upstream dependency on IT/Systems (INI-004). Lean flow analysis shows WIP accumulation exceeding 3× optimal throughput rate.",
    recommendation: "Immediately defer INI-007 (Brand Refresh Campaign) by 6 weeks. Reallocate one senior PM from INI-003 to unblock INI-004. Initiate cross-training with Strategy team to build delivery surge capacity.",
    systemRemedy: "Establish a Resource Governance Committee with fortnightly capacity reviews. Implement WIP limits per PM (max 3 active initiatives). Create a formal initiative prioritization gate tied to capacity availability before new project intake.",
    executivePriorityScore: 94,
    strategicImpact: 88,
    urgency: 96,
    operationalRisk: 92,
    leverage: 85,
    framework: "TOC",
    signal: "red",
    createdAt: "2025-03-06",
  },
  {
    id: "ins-002",
    type: "Strategic Misalignment",
    department: "Marketing",
    situation: "Marketing Q2 campaign plan allocates 68% of budget to brand awareness activities, while the Strategic OKR framework requires 80% focus on pipeline acceleration and demand generation through Q3.",
    diagnosis: "Balanced Scorecard analysis reveals a critical divergence between the Marketing financial perspective (spend patterns) and the Customer perspective (pipeline targets). OKR key results for pipeline are at 23% completion with 11 weeks remaining in the cycle.",
    recommendation: "Redirect $240K from brand awareness campaigns to high-intent demand generation channels. Align Marketing OKRs with Sales pipeline targets. Establish weekly alignment sync between CMO and VP Sales through Q3.",
    systemRemedy: "Implement a Strategy-to-Execution alignment layer: all departmental budget allocations must be reviewed against Balanced Scorecard objectives quarterly. Create shared OKR ownership between Marketing and Sales for pipeline metrics.",
    executivePriorityScore: 89,
    strategicImpact: 95,
    urgency: 78,
    operationalRisk: 72,
    leverage: 91,
    framework: "BSC",
    signal: "red",
    createdAt: "2025-03-05",
  },
  {
    id: "ins-003",
    type: "Dependency Bottleneck",
    department: "Product Development",
    situation: "INI-002 (Customer Portal v2) is blocked pending API documentation from IT/Systems. The dependency has been unresolved for 19 days, causing a cascade delay to INI-005 (CX Onboarding Redesign) and INI-008 (Data Analytics Integration).",
    diagnosis: "Dependency mapping reveals a three-initiative cascade risk. Porter Value Chain analysis identifies IT/Systems as a critical support activity degrading three primary activities simultaneously. Six Sigma DMAIC root cause: no formal SLA exists for internal API delivery.",
    recommendation: "Escalate API documentation request to CTO with 48-hour resolution mandate. Establish interim workaround: Product team to begin parallel development using API mock contracts. Assign an IT liaison embedded in Product sprint cycles.",
    systemRemedy: "Create an Internal SLA Framework for cross-department dependencies. Implement dependency tracking in the initiative register with automated escalation triggers at 7 and 14 days. Define API delivery standards with 5-day turnaround SLA.",
    executivePriorityScore: 86,
    strategicImpact: 82,
    urgency: 90,
    operationalRisk: 88,
    leverage: 78,
    framework: "Porter",
    signal: "red",
    createdAt: "2025-03-06",
  },
  {
    id: "ins-004",
    type: "Performance Anomaly",
    department: "Sales & Development",
    situation: "Sales pipeline velocity has declined 31% over 6 weeks. Win rate dropped from 38% to 26%. Average deal cycle has extended from 22 to 34 days. Three enterprise opportunities (combined value $1.4M) are stalled in proposal stage.",
    diagnosis: "Rumelt diagnostic identifies a lack of coherent action logic in the sales motion. Current strategy conflates SMB and enterprise approaches under a single playbook. Six Sigma process analysis shows high variance in proposal quality and follow-up timing, indicating absence of standardized sales process.",
    recommendation: "Bifurcate sales process into distinct SMB and Enterprise tracks immediately. Implement a 5-step enterprise sales SOP with defined decision gates. Assign a dedicated account executive to each stalled enterprise opportunity with a 10-day re-engagement plan.",
    systemRemedy: "Adopt a formal Sales Methodology (MEDDIC or SPIN for enterprise). Create a CRM hygiene protocol with mandatory stage-gate criteria. Establish weekly pipeline review cadence with structured deal inspection.",
    executivePriorityScore: 83,
    strategicImpact: 88,
    urgency: 85,
    operationalRisk: 75,
    leverage: 82,
    framework: "Rumelt",
    signal: "red",
    createdAt: "2025-03-04",
  },
  {
    id: "ins-005",
    type: "Execution Delay",
    department: "Finance",
    situation: "Q2 financial close process is tracking 8 days behind schedule. Three budget reforecast requests from Operations and HR are pending Finance review. Procurement approvals for INI-006 ($180K infrastructure investment) remain unprocessed for 12 days.",
    diagnosis: "Lean operations analysis identifies process waste in the finance approval workflow: 4 unnecessary handoff points, manual data consolidation from 3 disconnected systems, and absence of tiered approval authority. Current workflow adds 6–9 days of non-value-added processing time.",
    recommendation: "Implement tiered approval authority: approvals under $50K delegated to Finance Manager; $50K–$200K to CFO; above $200K to Board. Automate budget consolidation from Operations, HR, and Project systems. Clear the 3 pending reforecasts within 48 hours.",
    systemRemedy: "Redesign the financial close process using Lean value stream mapping. Implement a Finance Operations Platform integrating GL, procurement, and project budgets. Establish a 5-day financial close standard with automated variance reporting.",
    executivePriorityScore: 76,
    strategicImpact: 72,
    urgency: 80,
    operationalRisk: 78,
    leverage: 70,
    framework: "Lean",
    signal: "yellow",
    createdAt: "2025-03-03",
  },
  {
    id: "ins-006",
    type: "Risk Escalation",
    department: "Human Capital",
    situation: "Talent pipeline for 4 critical technical roles (Senior Engineer ×2, Data Architect ×1, DevOps Lead ×1) shows zero qualified candidates at final stage. Time-to-fill is tracking at 67 days vs. 30-day target. INI-002 and INI-004 have direct dependency on these roles.",
    diagnosis: "Balanced Scorecard Learning & Growth perspective shows critical gap in talent acquisition capacity. OKR analysis: HC Objective 'Build High-Performance Engineering Team' is at 18% completion. Root cause: over-reliance on a single recruitment channel (job boards) with 94% rejection rate.",
    recommendation: "Activate contingency talent strategy: engage 2 specialist technical recruiters immediately. Launch employee referral incentive program ($5K bonus). Explore 90-day interim contractors for the DevOps Lead and Senior Engineer roles to unblock INI-002 and INI-004.",
    systemRemedy: "Build a multi-channel talent acquisition infrastructure: employee referrals, LinkedIn Recruiter, specialized agencies, university partnerships, and a talent community. Create a 90-day talent pipeline view updated weekly. Integrate HC capacity planning with initiative intake process.",
    executivePriorityScore: 72,
    strategicImpact: 85,
    urgency: 70,
    operationalRisk: 80,
    leverage: 65,
    framework: "BSC",
    signal: "yellow",
    createdAt: "2025-03-02",
  },
  {
    id: "ins-007",
    type: "Capacity Constraint",
    department: "IT / Systems",
    situation: "IT infrastructure provisioning backlog has grown to 23 open tickets with an average resolution time of 11 days. System availability for the Customer Portal environment dropped to 97.2% against a 99.5% SLA commitment.",
    diagnosis: "Lean operations analysis identifies the IT/Systems team as a shared service bottleneck. Six Sigma measurement shows process capability below acceptable limits for infrastructure provisioning (Cpk < 1.0). Root cause: 40% of IT capacity is consumed by unplanned reactive maintenance vs. planned project delivery.",
    recommendation: "Shift IT operating model to 60% planned / 40% reactive ratio. Implement Infrastructure-as-Code to reduce provisioning time from 11 days to 2 days. Escalate the Customer Portal availability gap to SLA breach status and convene a 24-hour fix team.",
    systemRemedy: "Implement IT service management maturity framework (ITIL-aligned). Create a formal change management process. Establish automated infrastructure monitoring with proactive alerting. Develop a quarterly IT capacity plan aligned with the initiative roadmap.",
    executivePriorityScore: 68,
    strategicImpact: 74,
    urgency: 72,
    operationalRisk: 76,
    leverage: 60,
    framework: "Six Sigma",
    signal: "yellow",
    createdAt: "2025-03-01",
  },
  {
    id: "ins-008",
    type: "Performance Anomaly",
    department: "Customer Experience",
    situation: "NPS score declined from 61 to 44 over the past 8 weeks. Support ticket volume increased 42%, with average resolution time rising from 4.2 to 7.8 hours. Three enterprise customer accounts have escalated to executive review.",
    diagnosis: "Porter Customer Value Chain analysis shows degradation in post-sale service activities correlating directly with the IT/Systems availability issue (ins-007) and the delayed Customer Portal v2 rollout (ins-003). OKR tracking: CX Objective 'Deliver World-Class Customer Experience' at 34% completion.",
    recommendation: "Activate a CX Recovery Plan: assign a dedicated Customer Success Manager to each escalated enterprise account. Implement daily check-ins for 30 days. Create a transparent status page for known system issues. Fast-track the Customer Portal v2 fix for the top 3 pain points.",
    systemRemedy: "Establish a Customer Health Scoring system with early warning triggers at NPS < 50. Create a cross-functional CX Council (CX + Product + IT) with weekly cadence. Link CX performance metrics directly to product roadmap prioritization.",
    executivePriorityScore: 65,
    strategicImpact: 78,
    urgency: 68,
    operationalRisk: 70,
    leverage: 62,
    framework: "Porter",
    signal: "yellow",
    createdAt: "2025-03-01",
  },
];

// ──────────────────────────────────────────────
// DEPARTMENTS
// ──────────────────────────────────────────────

export const departments: Department[] = [
  {
    id: "dept-exec",
    name: "Executive Leadership",
    head: "Sarah Chen",
    headcount: 4,
    capacityUsed: 72,
    riskScore: 28,
    executionHealth: 81,
    maturityScore: 84,
    maturityTier: "Managed",
    activeInitiatives: 8,
    blockedTasks: 2,
    signal: "blue",
    authorityLevel: "Executive",
    sopAdherence: 91,
    coreResponsibilities: ["Vision setting", "Strategic prioritization", "Cross-department alignment", "Board governance"],
    keyFunctions: ["Ensure organizational alignment", "Provide foresight-driven recommendations", "Prioritize initiatives", "Executive decision authority"],
    decisionRights: ["Strategic direction", "Budget > $500K", "Organizational restructure", "Senior hire approval"],
    frameworks: ["Rumelt", "BSC", "OKR"],
    keyKPIs: [
      { label: "Strategic Alignment", value: "86%", trend: "up" },
      { label: "Decision Velocity", value: "4.2 days", trend: "down" },
      { label: "OKR Completion", value: "61%", trend: "up" },
    ],
  },
  {
    id: "dept-strategy",
    name: "Strategy",
    head: "Marcus Osei",
    headcount: 6,
    capacityUsed: 68,
    riskScore: 32,
    executionHealth: 79,
    maturityScore: 77,
    maturityTier: "Structured",
    activeInitiatives: 5,
    blockedTasks: 1,
    signal: "green",
    authorityLevel: "Senior",
    sopAdherence: 86,
    coreResponsibilities: ["Initiative evaluation", "Scenario modeling", "Trend analysis", "Strategic planning"],
    keyFunctions: ["Translate strategy into actionable tasks", "Identify high-leverage opportunities", "Porter & Rumelt framework application"],
    decisionRights: ["Initiative prioritization", "Budget allocation up to $200K", "Strategic pillar definition"],
    frameworks: ["Porter", "Rumelt", "OKR"],
    keyKPIs: [
      { label: "Initiative Pipeline Value", value: "$4.2M", trend: "up" },
      { label: "Strategy-to-Execution Lag", value: "18 days", trend: "flat" },
      { label: "Scenario Models Active", value: "7", trend: "up" },
    ],
  },
  {
    id: "dept-product",
    name: "Product Development",
    head: "Priya Nair",
    headcount: 14,
    capacityUsed: 88,
    riskScore: 67,
    executionHealth: 54,
    maturityScore: 62,
    maturityTier: "Structured",
    activeInitiatives: 6,
    blockedTasks: 8,
    signal: "yellow",
    authorityLevel: "Senior",
    sopAdherence: 74,
    coreResponsibilities: ["Roadmap management", "Feature prioritization", "Market validation", "Delivery risk tracking"],
    keyFunctions: ["Convert insights into deliverable products", "Track dependencies and delivery risk", "Sprint and release planning"],
    decisionRights: ["Product roadmap", "Feature scope", "Technical architecture", "Vendor tool selection"],
    frameworks: ["Porter", "BSC", "Lean"],
    keyKPIs: [
      { label: "Sprint Velocity", value: "42 pts", trend: "down" },
      { label: "Feature Throughput", value: "3.1/wk", trend: "down" },
      { label: "Dependency Blocks", value: "8 open", trend: "down" },
    ],
  },
  {
    id: "dept-delivery",
    name: "Program Delivery",
    head: "James Okoye",
    headcount: 11,
    capacityUsed: 94,
    riskScore: 82,
    executionHealth: 38,
    maturityScore: 48,
    maturityTier: "Developing",
    activeInitiatives: 7,
    blockedTasks: 14,
    signal: "red",
    authorityLevel: "Manager",
    sopAdherence: 58,
    coreResponsibilities: ["Workflow optimization", "Capacity planning", "SOP enforcement", "Milestone monitoring"],
    keyFunctions: ["Transform strategy into execution-ready tasks", "Monitor operational KPIs", "Risk and dependency management", "Reporting cadence"],
    decisionRights: ["Project scope changes", "Resource allocation within team", "SOP updates", "Escalation triggers"],
    frameworks: ["Lean", "TOC", "Six Sigma"],
    keyKPIs: [
      { label: "On-Time Delivery", value: "44%", trend: "down" },
      { label: "WIP Items", value: "34", trend: "down" },
      { label: "Avg Cycle Time", value: "22 days", trend: "down" },
    ],
  },
  {
    id: "dept-finance",
    name: "Finance",
    head: "Elena Vasquez",
    headcount: 8,
    capacityUsed: 71,
    riskScore: 55,
    executionHealth: 63,
    maturityScore: 71,
    maturityTier: "Structured",
    activeInitiatives: 3,
    blockedTasks: 5,
    signal: "yellow",
    authorityLevel: "Senior",
    sopAdherence: 82,
    coreResponsibilities: ["Budgeting", "Cash flow management", "Procurement oversight", "Regulatory compliance"],
    keyFunctions: ["Ensure financial sustainability", "Provide cost/benefit insights", "Flag financial risk", "Tiered approval authority"],
    decisionRights: ["Budget approval $50K–$500K", "Procurement sign-off", "Financial reporting standards", "Cost centre management"],
    frameworks: ["BSC", "Lean"],
    keyKPIs: [
      { label: "Budget Variance", value: "+7.2%", trend: "down" },
      { label: "Financial Close Days", value: "D+8", trend: "down" },
      { label: "Pending Approvals", value: "12", trend: "down" },
    ],
  },
  {
    id: "dept-hc",
    name: "Human Capital",
    head: "Amara Diallo",
    headcount: 5,
    capacityUsed: 79,
    riskScore: 61,
    executionHealth: 55,
    maturityScore: 56,
    maturityTier: "Developing",
    activeInitiatives: 4,
    blockedTasks: 6,
    signal: "yellow",
    authorityLevel: "Manager",
    sopAdherence: 71,
    coreResponsibilities: ["Recruitment & onboarding", "Performance management", "Talent planning", "Compliance & policy"],
    keyFunctions: ["Align workforce with strategy", "Optimize talent utilization", "Maintain HR compliance", "Leadership development"],
    decisionRights: ["Hiring approval under $120K", "Performance review process", "Training budget", "HC policy changes"],
    frameworks: ["BSC", "OKR"],
    keyKPIs: [
      { label: "Time-to-Fill", value: "67 days", trend: "down" },
      { label: "Retention Rate", value: "88%", trend: "flat" },
      { label: "Open Critical Roles", value: "4", trend: "down" },
    ],
  },
  {
    id: "dept-marketing",
    name: "Marketing",
    head: "Chloe Berger",
    headcount: 9,
    capacityUsed: 83,
    riskScore: 58,
    executionHealth: 49,
    maturityScore: 52,
    maturityTier: "Developing",
    activeInitiatives: 5,
    blockedTasks: 7,
    signal: "red",
    authorityLevel: "Manager",
    sopAdherence: 64,
    coreResponsibilities: ["Branding & positioning", "Campaign planning", "Analytics & attribution", "Content strategy"],
    keyFunctions: ["Align messaging with vision", "Prioritize high-impact campaigns", "Track ROI and pipeline contribution", "Drive MQL generation"],
    decisionRights: ["Campaign budget up to $100K", "Brand guidelines", "Channel selection", "Agency management"],
    frameworks: ["Porter", "BSC", "OKR"],
    keyKPIs: [
      { label: "Pipeline Contribution", value: "23%", trend: "down" },
      { label: "Campaign ROI", value: "1.8×", trend: "flat" },
      { label: "MQL-to-SQL Rate", value: "18%", trend: "down" },
    ],
  },
  {
    id: "dept-legal",
    name: "Legal & Compliance",
    head: "David Kim",
    headcount: 3,
    capacityUsed: 58,
    riskScore: 24,
    executionHealth: 88,
    maturityScore: 88,
    maturityTier: "Optimized",
    activeInitiatives: 2,
    blockedTasks: 0,
    signal: "blue",
    authorityLevel: "Senior",
    sopAdherence: 98,
    coreResponsibilities: ["Regulatory compliance", "Contract management", "Governance oversight", "Risk & legal advisory"],
    keyFunctions: ["Prevent legal risks", "Provide legal recommendations", "Maintain audit trails", "Governance framework enforcement"],
    decisionRights: ["Contract approval", "Compliance standards", "Legal risk escalation", "Regulatory filings"],
    frameworks: ["BSC"],
    keyKPIs: [
      { label: "Compliance Rate", value: "99.1%", trend: "up" },
      { label: "Contract Cycle Time", value: "6.2 days", trend: "up" },
      { label: "Open Risk Items", value: "2", trend: "up" },
    ],
  },
  {
    id: "dept-it",
    name: "IT / Systems",
    head: "Ryan Torres",
    headcount: 10,
    capacityUsed: 91,
    riskScore: 74,
    executionHealth: 42,
    maturityScore: 44,
    maturityTier: "Developing",
    activeInitiatives: 6,
    blockedTasks: 11,
    signal: "yellow",
    authorityLevel: "Manager",
    sopAdherence: 62,
    coreResponsibilities: ["Infrastructure management", "Data integrity", "Automation & tooling", "System reliability"],
    keyFunctions: ["Ensure system reliability and SLA compliance", "Support operational efficiency", "Maintain SOPs", "Infrastructure provisioning"],
    decisionRights: ["Technical architecture", "Vendor tech selection", "IT budget up to $150K", "Change management"],
    frameworks: ["Lean", "Six Sigma", "TOC"],
    keyKPIs: [
      { label: "System Uptime", value: "97.2%", trend: "down" },
      { label: "Ticket Backlog", value: "23 open", trend: "down" },
      { label: "Provisioning SLA", value: "44%", trend: "down" },
    ],
  },
  {
    id: "dept-cx",
    name: "Customer Experience",
    head: "Leila Hassan",
    headcount: 7,
    capacityUsed: 86,
    riskScore: 63,
    executionHealth: 47,
    maturityScore: 58,
    maturityTier: "Developing",
    activeInitiatives: 3,
    blockedTasks: 9,
    signal: "yellow",
    authorityLevel: "Manager",
    sopAdherence: 69,
    coreResponsibilities: ["Customer feedback analysis", "Journey mapping", "Onboarding", "Retention strategy"],
    keyFunctions: ["Optimize engagement, retention, and satisfaction", "CX health scoring", "Enterprise account management"],
    decisionRights: ["CX process design", "Customer success budget up to $80K", "Escalation management"],
    frameworks: ["Porter", "BSC", "OKR"],
    keyKPIs: [
      { label: "NPS Score", value: "44", trend: "down" },
      { label: "Avg Resolution Time", value: "7.8 hrs", trend: "down" },
      { label: "Ticket Volume", value: "+42%", trend: "down" },
    ],
  },
  {
    id: "dept-sales",
    name: "Sales & Development",
    head: "Omar Patel",
    headcount: 12,
    capacityUsed: 77,
    riskScore: 58,
    executionHealth: 52,
    maturityScore: 54,
    maturityTier: "Developing",
    activeInitiatives: 4,
    blockedTasks: 5,
    signal: "red",
    authorityLevel: "Senior",
    sopAdherence: 61,
    coreResponsibilities: ["Pipeline management", "Lead prioritization", "Enterprise & SMB sales", "Revenue forecasting"],
    keyFunctions: ["Identify high-impact opportunities", "Track conversions and pipeline velocity", "CRM management", "Proposal & negotiation"],
    decisionRights: ["Discount authority up to 15%", "Deal prioritization", "Sales process design", "Channel partnerships"],
    frameworks: ["Porter", "Rumelt", "OKR"],
    keyKPIs: [
      { label: "Pipeline Velocity", value: "−31%", trend: "down" },
      { label: "Win Rate", value: "26%", trend: "down" },
      { label: "Avg Deal Cycle", value: "34 days", trend: "down" },
    ],
  },
  {
    id: "dept-data",
    name: "Data & Analytics",
    head: "Sasha Novak",
    headcount: 6,
    capacityUsed: 74,
    riskScore: 38,
    executionHealth: 74,
    maturityScore: 72,
    maturityTier: "Structured",
    activeInitiatives: 3,
    blockedTasks: 3,
    signal: "green",
    authorityLevel: "Manager",
    sopAdherence: 84,
    coreResponsibilities: ["KPI dashboard management", "Trend analysis", "Predictive insights", "Data governance"],
    keyFunctions: ["Provide visibility across org", "Inform decisions with data", "Highlight operational risks", "Executive intelligence reporting"],
    decisionRights: ["Data architecture", "BI tooling selection", "Analytics methodology", "Data privacy protocols"],
    frameworks: ["BSC", "OKR"],
    keyKPIs: [
      { label: "Dashboard Coverage", value: "78%", trend: "up" },
      { label: "Data Quality Score", value: "91%", trend: "up" },
      { label: "Report Latency", value: "2.1 hrs", trend: "flat" },
    ],
  },
  {
    id: "dept-ops",
    name: "Operations",
    head: "Nadia Wolfe",
    headcount: 9,
    capacityUsed: 69,
    riskScore: 34,
    executionHealth: 78,
    maturityScore: 76,
    maturityTier: "Structured",
    activeInitiatives: 5,
    blockedTasks: 2,
    signal: "green",
    authorityLevel: "Senior",
    sopAdherence: 91,
    coreResponsibilities: ["Process design", "Resource planning", "Supply chain oversight", "Continuous improvement"],
    keyFunctions: ["Optimize workflows and track bottlenecks", "Standardize processes via SOPs", "Cross-department operational support"],
    decisionRights: ["Process standards", "SOP approval", "Operational budget up to $250K", "Vendor contracts"],
    frameworks: ["Lean", "Six Sigma", "TOC"],
    keyKPIs: [
      { label: "Process Efficiency", value: "83%", trend: "up" },
      { label: "SOP Adherence", value: "91%", trend: "up" },
      { label: "Cost per Transaction", value: "$4.20", trend: "up" },
    ],
  },
];

// ──────────────────────────────────────────────
// INITIATIVES
// ──────────────────────────────────────────────

export const initiatives: Initiative[] = [
  {
    id: "ini-001",
    name: "Enterprise GTM Acceleration",
    department: "Sales & Development",
    category: "Strategic",
    owner: "Omar Patel",
    executiveOwner: "Sarah Chen",
    strategicPillar: "Revenue Acceleration",
    status: "At Risk",
    healthStatus: "Red",
    priorityScore: 92,
    strategicAlignment: 96,
    dependencyRisk: 44,
    estimatedImpact: "High",
    budget: 380000,
    budgetUsed: 210000,
    startDate: "2025-01-15",
    targetDate: "2025-06-30",
    completionPct: 34,
    signal: "red",
    frameworks: ["Rumelt", "Porter"],
    dependencies: ["ini-004", "ini-006"],
    description: "Accelerate enterprise market penetration with bifurcated SMB/Enterprise sales motion, new playbook, and CRM optimization.",
    kpis: ["Win rate ≥ 35%", "Deal cycle < 25 days", "Pipeline velocity +25%", "Enterprise ARR +$1.2M"],
    risks: [
      { label: "Talent gap in enterprise AE roles", probability: "High", impact: "High" },
      { label: "CRM migration delay", probability: "Medium", impact: "High" },
      { label: "Playbook adoption resistance", probability: "Low", impact: "Medium" },
    ],
    raci: [
      { role: "Initiative Owner", name: "Omar Patel", type: "Responsible" },
      { role: "Executive Sponsor", name: "Sarah Chen", type: "Accountable" },
      { role: "Strategy Lead", name: "Marcus Osei", type: "Consulted" },
      { role: "Finance", name: "Elena Vasquez", type: "Informed" },
      { role: "HR", name: "Amara Diallo", type: "Consulted" },
    ],
  },
  {
    id: "ini-002",
    name: "Customer Portal v2",
    department: "Product Development",
    category: "Directive",
    owner: "Priya Nair",
    executiveOwner: "Sarah Chen",
    strategicPillar: "Customer Experience",
    status: "Blocked",
    healthStatus: "Red",
    priorityScore: 88,
    strategicAlignment: 91,
    dependencyRisk: 88,
    estimatedImpact: "High",
    budget: 520000,
    budgetUsed: 290000,
    startDate: "2025-02-01",
    targetDate: "2025-07-15",
    completionPct: 28,
    signal: "red",
    frameworks: ["Porter", "BSC"],
    dependencies: ["ini-004"],
    description: "Redesign and rebuild the customer-facing portal with improved UX, API integrations, and self-service capabilities.",
    kpis: ["Time-to-value < 3 days", "Self-service rate 60%", "Portal NPS ≥ 70", "Support ticket reduction 30%"],
    risks: [
      { label: "API dependency on INI-004 unresolved 19 days", probability: "High", impact: "High" },
      { label: "UX scope creep", probability: "Medium", impact: "Medium" },
      { label: "Security review delays", probability: "Low", impact: "High" },
    ],
    raci: [
      { role: "Initiative Owner", name: "Priya Nair", type: "Responsible" },
      { role: "Executive Sponsor", name: "Sarah Chen", type: "Accountable" },
      { role: "IT Lead", name: "Ryan Torres", type: "Consulted" },
      { role: "CX Lead", name: "Leila Hassan", type: "Consulted" },
      { role: "Legal", name: "David Kim", type: "Informed" },
    ],
  },
  {
    id: "ini-003",
    name: "Operational Excellence Program",
    department: "Operations",
    owner: "Nadia Wolfe",
    executiveOwner: "Sarah Chen",
    strategicPillar: "Operational Excellence",
    status: "On Track",
    healthStatus: "Green",
    priorityScore: 85,
    strategicAlignment: 88,
    dependencyRisk: 22,
    estimatedImpact: "High",
    budget: 240000,
    budgetUsed: 98000,
    startDate: "2025-01-01",
    targetDate: "2025-09-30",
    completionPct: 52,
    signal: "green",
    frameworks: ["Lean", "Six Sigma"],
    dependencies: [],
    description: "Standardize and optimize core operational processes across all departments. Implement SOP library and continuous improvement framework.",
    kpis: ["Process efficiency +20%", "SOP coverage 100%", "Defect rate < 2%", "WIP reduction 40%"],
    risks: [
      { label: "Change resistance from departments", probability: "Medium", impact: "Medium" },
      { label: "Resource allocation conflict with delivery", probability: "Low", impact: "Medium" },
    ],
    raci: [
      { role: "Initiative Owner", name: "Nadia Wolfe", type: "Responsible" },
      { role: "Executive Sponsor", name: "Sarah Chen", type: "Accountable" },
      { role: "Program Delivery", name: "James Okoye", type: "Consulted" },
      { role: "All Dept Heads", name: "All Departments", type: "Informed" },
    ],
  },
  {
    id: "ini-004",
    name: "IT Infrastructure Modernization",
    department: "IT / Systems",
    owner: "Ryan Torres",
    executiveOwner: "Sarah Chen",
    strategicPillar: "Technology Modernization",
    status: "Delayed",
    healthStatus: "Yellow",
    priorityScore: 84,
    strategicAlignment: 82,
    dependencyRisk: 76,
    estimatedImpact: "High",
    budget: 680000,
    budgetUsed: 320000,
    startDate: "2025-01-15",
    targetDate: "2025-08-31",
    completionPct: 31,
    signal: "yellow",
    frameworks: ["Lean", "Six Sigma"],
    dependencies: [],
    description: "Migrate legacy infrastructure to cloud-native architecture. Implement IaC, automated provisioning, and 99.9% uptime SLA capability.",
    kpis: ["Uptime SLA 99.9%", "Provisioning time < 2 days", "IaC coverage 80%", "Security compliance 100%"],
    risks: [
      { label: "Migration complexity underestimated", probability: "High", impact: "High" },
      { label: "Vendor delivery delays", probability: "Medium", impact: "High" },
      { label: "Team capacity constraint", probability: "High", impact: "Medium" },
    ],
    raci: [
      { role: "Initiative Owner", name: "Ryan Torres", type: "Responsible" },
      { role: "Executive Sponsor", name: "Sarah Chen", type: "Accountable" },
      { role: "Finance", name: "Elena Vasquez", type: "Consulted" },
      { role: "Legal", name: "David Kim", type: "Consulted" },
      { role: "Product", name: "Priya Nair", type: "Informed" },
    ],
  },
  {
    id: "ini-005",
    name: "CX Onboarding Redesign",
    department: "Customer Experience",
    owner: "Leila Hassan",
    executiveOwner: "Sarah Chen",
    strategicPillar: "Customer Experience",
    status: "Blocked",
    healthStatus: "Red",
    priorityScore: 79,
    strategicAlignment: 84,
    dependencyRisk: 82,
    estimatedImpact: "High",
    budget: 190000,
    budgetUsed: 65000,
    startDate: "2025-02-15",
    targetDate: "2025-06-30",
    completionPct: 18,
    signal: "red",
    frameworks: ["Porter", "BSC"],
    dependencies: ["ini-002", "ini-004"],
    description: "Redesign the end-to-end customer onboarding journey. Reduce time-to-value from 14 days to 3 days. Automate 60% of onboarding steps.",
    kpis: ["Time-to-value 3 days", "Onboarding automation 60%", "Onboarding NPS ≥ 75", "Churn in first 90 days < 5%"],
    risks: [
      { label: "Portal v2 dependency unresolved", probability: "High", impact: "High" },
      { label: "IT infrastructure blockers", probability: "High", impact: "High" },
    ],
    raci: [
      { role: "Initiative Owner", name: "Leila Hassan", type: "Responsible" },
      { role: "Executive Sponsor", name: "Sarah Chen", type: "Accountable" },
      { role: "Product", name: "Priya Nair", type: "Consulted" },
      { role: "IT", name: "Ryan Torres", type: "Consulted" },
    ],
  },
  {
    id: "ini-006",
    name: "Technical Talent Acquisition Sprint",
    department: "Human Capital",
    owner: "Amara Diallo",
    executiveOwner: "Sarah Chen",
    strategicPillar: "Talent & Culture",
    status: "At Risk",
    healthStatus: "Yellow",
    priorityScore: 77,
    strategicAlignment: 86,
    dependencyRisk: 38,
    estimatedImpact: "High",
    budget: 120000,
    budgetUsed: 44000,
    startDate: "2025-02-01",
    targetDate: "2025-05-31",
    completionPct: 22,
    signal: "yellow",
    frameworks: ["BSC", "OKR"],
    dependencies: [],
    description: "Fill 4 critical technical roles (Senior Engineer ×2, Data Architect ×1, DevOps Lead ×1) within 60 days using multi-channel talent acquisition.",
    kpis: ["4 roles filled", "Time-to-fill < 45 days", "Offer acceptance rate > 80%", "30-day retention 100%"],
    risks: [
      { label: "Market shortage of qualified candidates", probability: "High", impact: "High" },
      { label: "Competitor compensation gap", probability: "Medium", impact: "High" },
    ],
    raci: [
      { role: "Initiative Owner", name: "Amara Diallo", type: "Responsible" },
      { role: "Executive Sponsor", name: "Sarah Chen", type: "Accountable" },
      { role: "IT Lead", name: "Ryan Torres", type: "Consulted" },
      { role: "Finance", name: "Elena Vasquez", type: "Informed" },
    ],
  },
  {
    id: "ini-007",
    name: "Brand Refresh Campaign",
    department: "Marketing",
    owner: "Chloe Berger",
    executiveOwner: "Marcus Osei",
    strategicPillar: "Revenue Acceleration",
    status: "At Risk",
    healthStatus: "Yellow",
    priorityScore: 58,
    strategicAlignment: 61,
    dependencyRisk: 18,
    estimatedImpact: "Medium",
    budget: 310000,
    budgetUsed: 180000,
    startDate: "2025-01-20",
    targetDate: "2025-05-31",
    completionPct: 41,
    signal: "yellow",
    frameworks: ["Porter", "BSC"],
    dependencies: ["ini-001"],
    description: "Refresh brand identity, update all marketing materials, and launch integrated awareness campaign across digital and event channels.",
    kpis: ["Brand awareness +30%", "Campaign reach 500K+", "MQL uplift 25%", "Agency NPS ≥ 70"],
    risks: [
      { label: "OKR misalignment with pipeline focus", probability: "High", impact: "Medium" },
      { label: "Budget overspend risk", probability: "Medium", impact: "Medium" },
    ],
    raci: [
      { role: "Initiative Owner", name: "Chloe Berger", type: "Responsible" },
      { role: "Executive Sponsor", name: "Marcus Osei", type: "Accountable" },
      { role: "Sales", name: "Omar Patel", type: "Consulted" },
      { role: "Finance", name: "Elena Vasquez", type: "Informed" },
    ],
  },
  {
    id: "ini-008",
    name: "Data Analytics Integration",
    department: "Data & Analytics",
    owner: "Sasha Novak",
    executiveOwner: "Sarah Chen",
    strategicPillar: "Technology Modernization",
    status: "Delayed",
    healthStatus: "Yellow",
    priorityScore: 74,
    strategicAlignment: 78,
    dependencyRisk: 64,
    estimatedImpact: "Medium",
    budget: 160000,
    budgetUsed: 52000,
    startDate: "2025-02-10",
    targetDate: "2025-07-31",
    completionPct: 24,
    signal: "yellow",
    frameworks: ["BSC", "OKR"],
    dependencies: ["ini-002", "ini-004"],
    description: "Build unified analytics platform integrating data from Sales, Marketing, Finance, and Operations into a real-time executive intelligence layer.",
    kpis: ["Real-time dashboard coverage 90%", "Data pipeline reliability 99.5%", "Exec report latency < 1hr"],
    risks: [
      { label: "API dependency on Portal v2", probability: "High", impact: "High" },
      { label: "Data quality issues upstream", probability: "Medium", impact: "Medium" },
    ],
    raci: [
      { role: "Initiative Owner", name: "Sasha Novak", type: "Responsible" },
      { role: "Executive Sponsor", name: "Sarah Chen", type: "Accountable" },
      { role: "IT", name: "Ryan Torres", type: "Consulted" },
      { role: "All Dept Heads", name: "All Departments", type: "Informed" },
    ],
  },
  {
    id: "ini-009",
    name: "Financial Systems Optimization",
    department: "Finance",
    owner: "Elena Vasquez",
    executiveOwner: "Sarah Chen",
    strategicPillar: "Operational Excellence",
    status: "On Track",
    healthStatus: "Green",
    priorityScore: 71,
    strategicAlignment: 74,
    dependencyRisk: 20,
    estimatedImpact: "Medium",
    budget: 145000,
    budgetUsed: 78000,
    startDate: "2025-01-10",
    targetDate: "2025-06-30",
    completionPct: 48,
    signal: "green",
    frameworks: ["Lean", "BSC"],
    dependencies: [],
    description: "Streamline financial close process, automate budget consolidation, implement tiered approval authority, and reduce close cycle from D+8 to D+3.",
    kpis: ["Financial close D+3", "Approval cycle < 48 hrs", "Budget variance < 3%"],
    risks: [
      { label: "System integration complexity", probability: "Low", impact: "Medium" },
    ],
    raci: [
      { role: "Initiative Owner", name: "Elena Vasquez", type: "Responsible" },
      { role: "Executive Sponsor", name: "Sarah Chen", type: "Accountable" },
      { role: "IT", name: "Ryan Torres", type: "Consulted" },
      { role: "Operations", name: "Nadia Wolfe", type: "Informed" },
    ],
  },
  {
    id: "ini-010",
    name: "Leadership Development Program",
    department: "Human Capital",
    owner: "Amara Diallo",
    executiveOwner: "Sarah Chen",
    strategicPillar: "Talent & Culture",
    status: "On Track",
    healthStatus: "Green",
    priorityScore: 66,
    strategicAlignment: 72,
    dependencyRisk: 14,
    estimatedImpact: "Medium",
    budget: 85000,
    budgetUsed: 28000,
    startDate: "2025-03-01",
    targetDate: "2025-12-31",
    completionPct: 12,
    signal: "green",
    frameworks: ["BSC", "OKR"],
    dependencies: [],
    description: "Develop a structured leadership development curriculum for 12 senior managers. Focus on strategic thinking, execution discipline, and organizational design.",
    kpis: ["12 managers enrolled", "90-day retention post-program 100%", "Leadership readiness score +20pts"],
    risks: [
      { label: "Scheduling conflicts with operational demands", probability: "Medium", impact: "Low" },
    ],
    raci: [
      { role: "Initiative Owner", name: "Amara Diallo", type: "Responsible" },
      { role: "Executive Sponsor", name: "Sarah Chen", type: "Accountable" },
      { role: "All Dept Heads", name: "All Departments", type: "Informed" },
    ],
  },
];

// ──────────────────────────────────────────────
// ACTION ITEMS
// ──────────────────────────────────────────────

export const actionItems: ActionItem[] = [
  { id: "act-001", title: "Escalate API docs to CTO — 48hr mandate", initiativeId: "ini-002", assignedTo: "Ryan Torres", dueDate: "2025-03-08", status: "In Progress", priority: "High", description: "Formal escalation with resolution deadline. Unblocks INI-002, INI-005, INI-008." },
  { id: "act-002", title: "Begin parallel dev with API mock contracts", initiativeId: "ini-002", assignedTo: "Priya Nair", dueDate: "2025-03-10", status: "Not Started", priority: "High", description: "Parallel workstream to avoid full block while API dependency resolves." },
  { id: "act-003", title: "Bifurcate SMB and Enterprise sales tracks", initiativeId: "ini-001", assignedTo: "Omar Patel", dueDate: "2025-03-12", status: "In Progress", priority: "High", description: "Create two distinct playbooks, CRM stages, and reporting metrics for SMB vs Enterprise." },
  { id: "act-004", title: "Implement tiered approval authority", initiativeId: "ini-009", assignedTo: "Elena Vasquez", dueDate: "2025-03-09", status: "Not Started", priority: "High", description: "<$50K → Finance Mgr; $50K–$200K → CFO; >$200K → Board." },
  { id: "act-005", title: "Engage 2 specialist technical recruiters", initiativeId: "ini-006", assignedTo: "Amara Diallo", dueDate: "2025-03-07", status: "In Progress", priority: "High", description: "Specialist agencies for DevOps and Senior Engineer pipeline." },
  { id: "act-006", title: "Defer INI-007 Brand Refresh by 6 weeks", initiativeId: "ini-007", assignedTo: "Marcus Osei", dueDate: "2025-03-07", status: "Not Started", priority: "Medium", description: "Resource reallocation decision to resolve Program Delivery capacity constraint." },
  { id: "act-007", title: "Assign dedicated CSM to 3 escalated accounts", initiativeId: "ini-005", assignedTo: "Leila Hassan", dueDate: "2025-03-08", status: "In Progress", priority: "High", description: "Enterprise account recovery: daily check-ins for 30 days." },
  { id: "act-008", title: "Redirect $240K to demand generation channels", initiativeId: "ini-007", assignedTo: "Chloe Berger", dueDate: "2025-03-14", status: "Not Started", priority: "High", description: "Realign Q2 marketing budget per BSC pipeline objective." },
  { id: "act-009", title: "Implement WIP limits per PM (max 3 active)", initiativeId: "ini-003", assignedTo: "James Okoye", dueDate: "2025-03-15", status: "Not Started", priority: "Medium", description: "TOC constraint remedy: cap concurrent initiative assignment per PM." },
  { id: "act-010", title: "Launch employee referral program ($5K bonus)", initiativeId: "ini-006", assignedTo: "Amara Diallo", dueDate: "2025-03-14", status: "Not Started", priority: "Medium", description: "Multi-channel talent strategy activation." },
];

// ──────────────────────────────────────────────
// DIRECTIVES
// ──────────────────────────────────────────────

export const directives: Directive[] = [
  { id: "dir-001", title: "IT Systems SLA Recovery Plan", initiativeId: "ini-004", owner: "Ryan Torres", dueDate: "2025-03-20", status: "In Progress", priority: "High", description: "Establish 60/40 planned/reactive IT model. Provision Infrastructure-as-Code pipeline. Resolve 24hr SLA breach on Customer Portal environment." },
  { id: "dir-002", title: "Sales Methodology Transformation", initiativeId: "ini-001", owner: "Omar Patel", dueDate: "2025-04-01", status: "Pending", priority: "High", description: "Adopt MEDDIC for enterprise track. Implement 5-step deal qualification gates. CRM hygiene protocol with mandatory stage criteria." },
  { id: "dir-003", title: "Marketing Budget Reallocation", initiativeId: "ini-007", owner: "Chloe Berger", dueDate: "2025-03-14", status: "Pending", priority: "High", description: "Redirect $240K from brand awareness to pipeline acceleration channels. Establish shared OKR ownership with Sales for pipeline metrics." },
  { id: "dir-004", title: "Resource Governance Committee Setup", initiativeId: "ini-003", owner: "James Okoye", dueDate: "2025-03-25", status: "Pending", priority: "Medium", description: "Fortnightly capacity reviews. WIP limits enforcement. Initiative intake gate process tied to capacity availability." },
  { id: "dir-005", title: "Internal SLA Framework Creation", initiativeId: "ini-002", owner: "Ryan Torres", dueDate: "2025-03-18", status: "In Progress", priority: "High", description: "Define cross-department dependency SLAs. 5-day API delivery standard. Automated escalation triggers at 7 and 14 days unresolved." },
  { id: "dir-006", title: "Finance Close Process Redesign", initiativeId: "ini-009", owner: "Elena Vasquez", dueDate: "2025-04-15", status: "Pending", priority: "Medium", description: "Lean value stream mapping of financial close. Automate budget consolidation. Establish D+3 close standard with variance reporting." },
];

// ──────────────────────────────────────────────
// GOVERNANCE LOGS
// ──────────────────────────────────────────────

export const governanceLogs: GovernanceLog[] = [
  { id: "gov-001", initiativeId: "ini-002", type: "Risk", title: "API Dependency SLA Breach", severity: 9, owner: "Ryan Torres", status: "Escalated", notes: "19-day unresolved dependency. Cascading to INI-005 and INI-008. CTO escalation required within 48 hours.", createdDate: "2025-03-06" },
  { id: "gov-002", initiativeId: "ini-001", type: "Risk", title: "Enterprise AE Talent Gap", severity: 8, owner: "Amara Diallo", status: "Open", notes: "4 critical technical roles at zero final-stage candidates. Direct risk to INI-001 and INI-004 timelines.", createdDate: "2025-03-05" },
  { id: "gov-003", initiativeId: "ini-004", type: "Decision", title: "Cloud Migration Scope Decision", severity: 7, owner: "Sarah Chen", status: "In Review", notes: "Board decision required: phased migration (18 months) vs full cutover (12 months). Cost delta $420K.", createdDate: "2025-03-04" },
  { id: "gov-004", initiativeId: "ini-007", type: "Change", title: "Marketing Budget Reallocation Request", severity: 6, owner: "Chloe Berger", status: "Open", notes: "Proposed $240K shift from brand awareness to demand generation. Awaiting CMO and CFO approval.", createdDate: "2025-03-05" },
  { id: "gov-005", initiativeId: "ini-003", type: "Risk", title: "Program Delivery Capacity at 94%", severity: 9, owner: "James Okoye", status: "Escalated", notes: "WIP exceeds 3× optimal rate. Recommending INI-007 deferral and cross-training initiative.", createdDate: "2025-03-06" },
  { id: "gov-006", initiativeId: "ini-009", type: "Decision", title: "Tiered Approval Authority Adoption", severity: 5, owner: "Elena Vasquez", status: "In Review", notes: "Policy change to implement delegated approval framework. Legal sign-off required.", createdDate: "2025-03-03" },
  { id: "gov-007", initiativeId: "ini-005", type: "Risk", title: "CX Enterprise Account Escalation", severity: 8, owner: "Leila Hassan", status: "Open", notes: "3 enterprise accounts at executive review risk. NPS drop from 61 to 44 in 8 weeks.", createdDate: "2025-03-01" },
];

// ──────────────────────────────────────────────
// AUTHORITY MATRIX
// ──────────────────────────────────────────────

export const authorityMatrix: AuthorityMatrixEntry[] = [
  { role: "CEO", department: "Executive Leadership", person: "Sarah Chen", budgetAuthority: "Unlimited", hiringAuthority: "All levels", initiativeApproval: "All", riskApproval: "All", level: "L1" },
  { role: "CFO", department: "Finance", person: "Elena Vasquez", budgetAuthority: "$50K–$500K", hiringAuthority: "Finance team", initiativeApproval: "Financial impact > $100K", riskApproval: "Financial risks", level: "L2" },
  { role: "Strategy Lead", department: "Strategy", person: "Marcus Osei", budgetAuthority: "Up to $200K", hiringAuthority: "Strategy team", initiativeApproval: "Strategic initiatives", riskApproval: "Strategic risks", level: "L2" },
  { role: "Head of Product", department: "Product Development", person: "Priya Nair", budgetAuthority: "Up to $150K", hiringAuthority: "Product team", initiativeApproval: "Product roadmap items", riskApproval: "Product risks", level: "L2" },
  { role: "Program Director", department: "Program Delivery", person: "James Okoye", budgetAuthority: "Up to $100K", hiringAuthority: "Delivery team", initiativeApproval: "Delivery scope changes", riskApproval: "Delivery risks", level: "L3" },
  { role: "CTO", department: "IT / Systems", person: "Ryan Torres", budgetAuthority: "Up to $150K", hiringAuthority: "IT team", initiativeApproval: "Technical initiatives", riskApproval: "Technical risks", level: "L2" },
  { role: "Head of HR", department: "Human Capital", person: "Amara Diallo", budgetAuthority: "Up to $120K", hiringAuthority: "All teams (facilitation)", initiativeApproval: "HR initiatives", riskApproval: "People risks", level: "L3" },
  { role: "CMO", department: "Marketing", person: "Chloe Berger", budgetAuthority: "Up to $100K", hiringAuthority: "Marketing team", initiativeApproval: "Marketing campaigns", riskApproval: "Brand risks", level: "L3" },
  { role: "VP Sales", department: "Sales & Development", person: "Omar Patel", budgetAuthority: "Up to $80K", hiringAuthority: "Sales team", initiativeApproval: "Sales initiatives", riskApproval: "Revenue risks", level: "L3" },
  { role: "General Counsel", department: "Legal & Compliance", person: "David Kim", budgetAuthority: "Up to $150K", hiringAuthority: "Legal team", initiativeApproval: "Compliance initiatives", riskApproval: "Legal/compliance risks", level: "L2" },
];

// ──────────────────────────────────────────────
// SOP RECORDS
// ──────────────────────────────────────────────

export const sopRecords: SOPRecord[] = [
  { id: "sop-001", title: "Initiative Intake & Prioritization Process", department: "Program Delivery", version: "2.1", status: "Active", lastReviewed: "2025-02-01", adherenceRate: 78, owner: "James Okoye" },
  { id: "sop-002", title: "Financial Close & Reporting Protocol", department: "Finance", version: "3.0", status: "Active", lastReviewed: "2025-01-15", adherenceRate: 91, owner: "Elena Vasquez" },
  { id: "sop-003", title: "IT Change Management Process", department: "IT / Systems", version: "1.4", status: "Under Review", lastReviewed: "2024-11-20", adherenceRate: 62, owner: "Ryan Torres" },
  { id: "sop-004", title: "Recruitment & Onboarding Framework", department: "Human Capital", version: "2.0", status: "Active", lastReviewed: "2025-01-10", adherenceRate: 84, owner: "Amara Diallo" },
  { id: "sop-005", title: "Risk Escalation & Governance Protocol", department: "Executive Leadership", version: "1.2", status: "Active", lastReviewed: "2025-02-15", adherenceRate: 92, owner: "Sarah Chen" },
  { id: "sop-006", title: "Customer Onboarding Journey", department: "Customer Experience", version: "1.8", status: "Outdated", lastReviewed: "2024-09-01", adherenceRate: 58, owner: "Leila Hassan" },
  { id: "sop-007", title: "Sales Pipeline & CRM Management", department: "Sales & Development", version: "1.5", status: "Under Review", lastReviewed: "2024-12-01", adherenceRate: 61, owner: "Omar Patel" },
  { id: "sop-008", title: "Campaign Planning & Budget Approval", department: "Marketing", version: "2.2", status: "Active", lastReviewed: "2025-01-20", adherenceRate: 74, owner: "Chloe Berger" },
  { id: "sop-009", title: "Contract Review & Legal Sign-Off", department: "Legal & Compliance", version: "3.1", status: "Active", lastReviewed: "2025-02-28", adherenceRate: 99, owner: "David Kim" },
  { id: "sop-010", title: "Operational Process Improvement Protocol", department: "Operations", version: "2.4", status: "Active", lastReviewed: "2025-02-10", adherenceRate: 91, owner: "Nadia Wolfe" },
];

// ──────────────────────────────────────────────
// FRAMEWORKS
// ──────────────────────────────────────────────

export const frameworks: FrameworkEngine[] = [
  {
    id: "Porter",
    name: "Porter Competitive Strategy",
    description: "Five Forces + Value Chain analysis applied to strategic positioning and competitive advantage identification.",
    expertDomain: "Strategy & Competitive Intelligence",
    activeInsights: 3,
    status: "Alerting",
    coverage: ["Strategy", "Marketing", "Sales & Development", "Customer Experience"],
    lastTriggered: "2 hours ago",
    diagnosticFocus: ["Value chain degradation", "Competitive position erosion", "Support activity failures", "Differentiation risks"],
  },
  {
    id: "Rumelt",
    name: "Rumelt Good Strategy",
    description: "Kernel of strategy: diagnosis, guiding policy, and coherent actions. Detects incoherent or fragmented strategy execution.",
    expertDomain: "Strategic Coherence",
    activeInsights: 2,
    status: "Alerting",
    coverage: ["Strategy", "Sales & Development", "Executive Leadership"],
    lastTriggered: "6 hours ago",
    diagnosticFocus: ["Strategy incoherence", "Fragmented action logic", "Missing guiding policy", "Conflicting priorities"],
  },
  {
    id: "BSC",
    name: "Balanced Scorecard",
    description: "Financial, Customer, Internal Process, and Learning & Growth perspectives mapped to organizational performance.",
    expertDomain: "Multi-Dimensional Performance",
    activeInsights: 4,
    status: "Alerting",
    coverage: ["All Departments"],
    lastTriggered: "1 hour ago",
    diagnosticFocus: ["Cross-perspective imbalance", "OKR misalignment", "Financial vs customer trade-offs", "Learning gap risks"],
  },
  {
    id: "OKR",
    name: "OKRs",
    description: "Objective and Key Result tracking aligned to strategic priorities. Monitors completion rates and misalignment signals.",
    expertDomain: "Objective Alignment",
    activeInsights: 3,
    status: "Monitoring",
    coverage: ["Executive Leadership", "Strategy", "Marketing", "Human Capital"],
    lastTriggered: "3 hours ago",
    diagnosticFocus: ["KR completion tracking", "OKR cascade failures", "Priority drift", "Accountability gaps"],
  },
  {
    id: "Lean",
    name: "Lean Operations",
    description: "Value stream mapping, WIP reduction, waste identification, and flow optimization across operational processes.",
    expertDomain: "Operational Flow & Waste Elimination",
    activeInsights: 2,
    status: "Alerting",
    coverage: ["Program Delivery", "Operations", "Finance", "IT / Systems"],
    lastTriggered: "4 hours ago",
    diagnosticFocus: ["WIP accumulation", "Handoff waste", "Process cycle time", "Value-added ratio"],
  },
  {
    id: "Six Sigma",
    name: "Six Sigma",
    description: "DMAIC root cause analysis and process capability measurement for quality and variance reduction.",
    expertDomain: "Quality & Process Capability",
    activeInsights: 2,
    status: "Monitoring",
    coverage: ["Operations", "IT / Systems", "Program Delivery"],
    lastTriggered: "8 hours ago",
    diagnosticFocus: ["Process capability (Cpk)", "Root cause analysis", "Variance sources", "Defect rate measurement"],
  },
  {
    id: "TOC",
    name: "Theory of Constraints",
    description: "System constraint identification and bottleneck elimination. Maps the critical constraint limiting throughput.",
    expertDomain: "Constraint & Throughput Optimization",
    activeInsights: 1,
    status: "Alerting",
    coverage: ["Program Delivery", "IT / Systems"],
    lastTriggered: "1 hour ago",
    diagnosticFocus: ["System bottleneck identification", "Throughput optimization", "WIP exploitation", "Constraint elevation"],
  },
];

// ──────────────────────────────────────────────
// ORG METRICS
// ──────────────────────────────────────────────

export const orgMetrics = {
  overallMaturityScore: 64,
  activeInitiatives: 10,
  criticalInsights: 4,
  blockedTasks: 70,
  totalHeadcount: 104,
  totalBudgetAllocated: 2830000,
  totalBudgetUsed: 1365000,
  avgExecutionHealth: 62,
  avgStrategicAlignment: 81,
  sopCoverage: 78,
  governanceOpenItems: 5,
  decisionDeadlines: 3,
  avgSopAdherence: 77,
};

// ──────────────────────────────────────────────
// UTILITY FUNCTIONS
// ──────────────────────────────────────────────

export function getSignalColor(signal: SignalLevel): string {
  switch (signal) {
    case "red": return "signal-red";
    case "yellow": return "signal-yellow";
    case "green": return "signal-green";
    case "blue": return "signal-blue";
  }
}

export function getScoreSignal(score: number): SignalLevel {
  if (score <= 40) return "red";
  if (score <= 60) return "yellow";
  if (score <= 80) return "green";
  return "blue";
}

export function getMaturityColor(tier: MaturityTier): string {
  switch (tier) {
    case "Foundational": return "signal-red";
    case "Developing": return "signal-yellow";
    case "Structured": return "teal";
    case "Managed": return "signal-blue";
    case "Optimized": return "signal-green";
  }
}

export function formatCurrency(value: number): string {
  if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`;
  return `$${value}`;
}

export function getRiskSeveritySignal(severity: number): SignalLevel {
  if (severity >= 8) return "red";
  if (severity >= 6) return "yellow";
  if (severity >= 4) return "green";
  return "blue";
}

export function getHealthStatusSignal(status: "Green" | "Yellow" | "Red"): SignalLevel {
  if (status === "Red") return "red";
  if (status === "Yellow") return "yellow";
  return "green";
}
