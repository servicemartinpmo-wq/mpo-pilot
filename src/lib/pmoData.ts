// MARTIN PMO-OPs Command Center — Mock Organizational Data

export type SignalLevel = "red" | "yellow" | "green" | "blue";
export type MaturityTier = "Foundational" | "Developing" | "Structured" | "Managed" | "Optimized";
export type InsightType = "Risk Escalation" | "Strategic Misalignment" | "Capacity Constraint" | "Dependency Bottleneck" | "Performance Anomaly" | "Execution Delay";
export type InitiativeStatus = "On Track" | "At Risk" | "Delayed" | "Blocked" | "Completed";
export type Framework = "Porter" | "Rumelt" | "BSC" | "OKR" | "Lean" | "Six Sigma" | "TOC";

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
  capacityUsed: number; // 0-100
  riskScore: number; // 0-100
  executionHealth: number; // 0-100
  maturityScore: number; // 0-100
  maturityTier: MaturityTier;
  activeInitiatives: number;
  blockedTasks: number;
  signal: SignalLevel;
  keyKPIs: { label: string; value: string; trend: "up" | "down" | "flat" }[];
}

export interface Initiative {
  id: string;
  name: string;
  department: string;
  owner: string;
  status: InitiativeStatus;
  priorityScore: number; // 0-100
  strategicAlignment: number; // 0-100
  dependencyRisk: number; // 0-100
  estimatedImpact: "High" | "Medium" | "Low";
  budget: number;
  budgetUsed: number;
  startDate: string;
  targetDate: string;
  completionPct: number;
  signal: SignalLevel;
  frameworks: Framework[];
  dependencies: string[]; // other initiative IDs
  description: string;
}

export interface FrameworkEngine {
  id: Framework;
  name: string;
  description: string;
  activeInsights: number;
  status: "Active" | "Monitoring" | "Alerting";
  coverage: string[];
  lastTriggered: string;
}

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
    diagnosis: "Dependency mapping reveals a three-initiative cascade risk. Porter Value Chain analysis identifies IT/Systems as a critical support activity that is currently degrading three primary activities simultaneously. Six Sigma DMAIC root cause: no formal SLA exists for internal API delivery.",
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
    keyKPIs: [
      { label: "Process Efficiency", value: "83%", trend: "up" },
      { label: "SOP Adherence", value: "91%", trend: "up" },
      { label: "Cost per Transaction", value: "$4.20", trend: "up" },
    ],
  },
];

export const initiatives: Initiative[] = [
  {
    id: "ini-001",
    name: "Enterprise GTM Acceleration",
    department: "Sales & Development",
    owner: "Omar Patel",
    status: "At Risk",
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
  },
  {
    id: "ini-002",
    name: "Customer Portal v2",
    department: "Product Development",
    owner: "Priya Nair",
    status: "Blocked",
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
  },
  {
    id: "ini-003",
    name: "Operational Excellence Program",
    department: "Operations",
    owner: "Nadia Wolfe",
    status: "On Track",
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
  },
  {
    id: "ini-004",
    name: "IT Infrastructure Modernization",
    department: "IT / Systems",
    owner: "Ryan Torres",
    status: "Delayed",
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
  },
  {
    id: "ini-005",
    name: "CX Onboarding Redesign",
    department: "Customer Experience",
    owner: "Leila Hassan",
    status: "Blocked",
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
  },
  {
    id: "ini-006",
    name: "Technical Talent Acquisition Sprint",
    department: "Human Capital",
    owner: "Amara Diallo",
    status: "At Risk",
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
  },
  {
    id: "ini-007",
    name: "Brand Refresh Campaign",
    department: "Marketing",
    owner: "Chloe Berger",
    status: "At Risk",
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
  },
  {
    id: "ini-008",
    name: "Data Analytics Integration",
    department: "Data & Analytics",
    owner: "Sasha Novak",
    status: "Delayed",
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
  },
  {
    id: "ini-009",
    name: "Financial Systems Optimization",
    department: "Finance",
    owner: "Elena Vasquez",
    status: "On Track",
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
  },
  {
    id: "ini-010",
    name: "Leadership Development Program",
    department: "Human Capital",
    owner: "Amara Diallo",
    status: "On Track",
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
  },
];

export const frameworks: FrameworkEngine[] = [
  {
    id: "Porter",
    name: "Porter Competitive Strategy",
    description: "Five Forces + Value Chain analysis applied to strategic positioning and competitive advantage identification.",
    activeInsights: 3,
    status: "Alerting",
    coverage: ["Strategy", "Marketing", "Sales & Development", "Customer Experience"],
    lastTriggered: "2 hours ago",
  },
  {
    id: "Rumelt",
    name: "Rumelt Good Strategy",
    description: "Kernel of strategy: diagnosis, guiding policy, and coherent actions. Detects incoherent or fragmented strategy execution.",
    activeInsights: 2,
    status: "Alerting",
    coverage: ["Strategy", "Sales & Development", "Executive Leadership"],
    lastTriggered: "6 hours ago",
  },
  {
    id: "BSC",
    name: "Balanced Scorecard",
    description: "Financial, Customer, Internal Process, and Learning & Growth perspectives mapped to organizational performance.",
    activeInsights: 4,
    status: "Alerting",
    coverage: ["All Departments"],
    lastTriggered: "1 hour ago",
  },
  {
    id: "OKR",
    name: "OKRs",
    description: "Objective and Key Result tracking aligned to strategic priorities. Monitors completion rates and misalignment signals.",
    activeInsights: 3,
    status: "Monitoring",
    coverage: ["Executive Leadership", "Strategy", "Marketing", "Human Capital"],
    lastTriggered: "3 hours ago",
  },
  {
    id: "Lean",
    name: "Lean Operations",
    description: "Value stream mapping, WIP reduction, waste identification, and flow optimization across operational processes.",
    activeInsights: 2,
    status: "Alerting",
    coverage: ["Program Delivery", "Operations", "Finance", "IT / Systems"],
    lastTriggered: "4 hours ago",
  },
  {
    id: "Six Sigma",
    name: "Six Sigma",
    description: "DMAIC root cause analysis and process capability measurement for quality and variance reduction.",
    activeInsights: 2,
    status: "Monitoring",
    coverage: ["Operations", "IT / Systems", "Program Delivery"],
    lastTriggered: "8 hours ago",
  },
  {
    id: "TOC",
    name: "Theory of Constraints",
    description: "System constraint identification and bottleneck elimination. Maps the critical constraint limiting throughput.",
    activeInsights: 1,
    status: "Alerting",
    coverage: ["Program Delivery", "IT / Systems"],
    lastTriggered: "1 hour ago",
  },
];

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
};

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
