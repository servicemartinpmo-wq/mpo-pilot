/**
 * BACKEND FRAMEWORK ANALYTICS DATA LAYER
 *
 * This file is the internal engine map for all analytical frameworks used by the
 * Apphia Superbase logic system. It does NOT render on the frontend.
 *
 * Each framework entry documents:
 *  - executionModule: which app module runs this framework
 *  - outputsTo: which modules receive updated data from this framework
 *  - statusRelevance: what type of signal or health status this contributes to
 *  - temporalContext: when/how often this framework fires
 *  - dependencies: other frameworks or modules this depends on
 *  - notes: historical context, canonical source, methodology notes
 */

export type AppModule =
  | "Diagnostics"
  | "Advisory"
  | "Systems"
  | "Tools"
  | "Dashboard"
  | "Reports"
  | "Initiatives"
  | "Departments"
  | "Action Items"
  | "Team"
  | "Resource Hub";

export type FrameworkDomain =
  | "Strategy & Organizational Alignment"
  | "Initiative & Project Management"
  | "Operations & Process Management"
  | "Performance & Metrics"
  | "Risk & Decision Science"
  | "Finance & Investment Decisioning"
  | "Team & Organizational Behavior"
  | "Change Management"
  | "Product / Customer / Marketing"
  | "Systems Thinking & Complexity"
  | "Behavioral & Decision Psychology"
  | "Innovation & Product Development"
  | "IT & Governance";

export type TemporalContext =
  | "Continuous"
  | "Weekly"
  | "Monthly"
  | "Quarterly"
  | "On-Trigger"
  | "On-Demand"
  | "Annual";

export interface FrameworkRecord {
  id: string;
  name: string;
  domain: FrameworkDomain;
  executionModule: AppModule;
  outputsTo: AppModule[];
  statusRelevance: string;
  temporalContext: TemporalContext;
  dependencies: string[]; // other framework IDs or module names
  notes: string; // canonical source, methodology, historical context
  systemChains?: string[]; // which System Chain bundles this participates in
}

// ─────────────────────────────────────────────────────────────────────────────
// STRATEGY & ORGANIZATIONAL ALIGNMENT
// ─────────────────────────────────────────────────────────────────────────────

const strategyFrameworks: FrameworkRecord[] = [
  {
    id: "bsc",
    name: "Balanced Scorecard",
    domain: "Strategy & Organizational Alignment",
    executionModule: "Diagnostics",
    outputsTo: ["Dashboard", "Reports"],
    statusRelevance: "Strategic alignment score, initiative health, departmental balance",
    temporalContext: "Quarterly",
    dependencies: ["okr", "kpiTree"],
    notes:
      "Kaplan & Norton (1992). Four perspectives: Financial, Customer, Internal Process, Learning & Growth. Core scoring engine for strategy-to-execution translation. Powers Executive Performance Summary and Dept Scorecards.",
    systemChains: ["Strategic Alignment System", "Operational Performance System"],
  },
  {
    id: "okr",
    name: "OKR Alignment",
    domain: "Strategy & Organizational Alignment",
    executionModule: "Initiatives",
    outputsTo: ["Dashboard", "Reports"],
    statusRelevance: "Objective completion rate, key result health",
    temporalContext: "Quarterly",
    dependencies: ["bsc", "strategicGoalDefinition"],
    notes:
      "Andy Grove (Intel), popularized by John Doerr (Measure What Matters). Cascading objective structure. Signals misalignment between team execution and org-level strategy.",
    systemChains: ["Strategic Alignment System"],
  },
  {
    id: "strategicChoiceCascade",
    name: "Strategic Choice Cascade",
    domain: "Strategy & Organizational Alignment",
    executionModule: "Advisory",
    outputsTo: ["Initiatives"],
    statusRelevance: "Strategy clarity, playing field, winning aspiration",
    temporalContext: "Annual",
    dependencies: ["bsc", "vrio"],
    notes:
      "Roger Martin & A.G. Lafley (Playing to Win). Five cascading choices: Winning Aspiration, Where to Play, How to Win, Capabilities, Management Systems. Used in Advisory to explain WHY an initiative matters.",
  },
  {
    id: "hoshinKanri",
    name: "Hoshin Kanri",
    domain: "Strategy & Organizational Alignment",
    executionModule: "Systems",
    outputsTo: ["Initiatives", "Departments"],
    statusRelevance: "Catchball alignment, annual policy deployment",
    temporalContext: "Annual",
    dependencies: ["bsc", "okr"],
    notes:
      "Yoji Akao (Hoshin Kanri for the Lean Enterprise). Policy deployment system that aligns executive goals to department-level execution. Powers the Annual Strategic Planning and Quarterly Planning Cycle workflows.",
    systemChains: ["Strategic Alignment System"],
  },
  {
    id: "mckinsey7s",
    name: "McKinsey 7S",
    domain: "Strategy & Organizational Alignment",
    executionModule: "Diagnostics",
    outputsTo: ["Departments"],
    statusRelevance: "Organizational coherence, hard/soft factor alignment",
    temporalContext: "Quarterly",
    dependencies: ["galbraithStar"],
    notes:
      "Peters & Waterman (In Search of Excellence), refined by McKinsey. Seven elements: Strategy, Structure, Systems, Shared Values, Style, Staff, Skills. Used in org health diagnostics to flag coherence gaps.",
    systemChains: ["Organizational Structure System"],
  },
  {
    id: "galbraithStar",
    name: "Galbraith Star Model",
    domain: "Strategy & Organizational Alignment",
    executionModule: "Diagnostics",
    outputsTo: ["Departments"],
    statusRelevance: "Design alignment, capability-strategy fit",
    temporalContext: "Quarterly",
    dependencies: ["mckinsey7s"],
    notes:
      "Jay Galbraith (Designing Organizations). Five design elements: Strategy, Structure, Processes, Rewards, People. Core model for Org Design diagnostics and Department Charter Creation.",
    systemChains: ["Organizational Structure System"],
  },
  {
    id: "vrio",
    name: "VRIO",
    domain: "Strategy & Organizational Alignment",
    executionModule: "Diagnostics",
    outputsTo: ["Initiatives"],
    statusRelevance: "Competitive advantage sustainability",
    temporalContext: "Annual",
    dependencies: ["porterFiveForces"],
    notes:
      "Barney (1991). Valuable, Rare, Inimitable, Organized. Used in Initiative Impact Assessment to determine if a strategic initiative leverages a true competitive advantage.",
  },
  {
    id: "swot",
    name: "SWOT Analysis",
    domain: "Strategy & Organizational Alignment",
    executionModule: "Diagnostics",
    outputsTo: ["Initiatives"],
    statusRelevance: "Situational awareness, strategic positioning",
    temporalContext: "Quarterly",
    dependencies: ["porterFiveForces", "pestel"],
    notes:
      "Classic strategic planning tool. Used as an input layer before OKR setting and initiative prioritization. Outputs feed Advisory with internal/external positioning context.",
  },
  {
    id: "pestel",
    name: "PESTEL Analysis",
    domain: "Strategy & Organizational Alignment",
    executionModule: "Diagnostics",
    outputsTo: ["Advisory"],
    statusRelevance: "Macro-environmental risk signals",
    temporalContext: "Quarterly",
    dependencies: ["porterFiveForces"],
    notes:
      "Environmental scanning framework (Political, Economic, Social, Technological, Environmental, Legal). Feeds into Risk Identification and Scenario Planning.",
  },
  {
    id: "porterFiveForces",
    name: "Porter Five Forces",
    domain: "Strategy & Organizational Alignment",
    executionModule: "Diagnostics",
    outputsTo: ["Advisory"],
    statusRelevance: "Industry competitive intensity",
    temporalContext: "Annual",
    dependencies: [],
    notes:
      "Michael Porter (Competitive Strategy, 1980). Five forces: threat of new entrants, buyer power, supplier power, substitutes, rivalry. Canonical competitive position diagnostic. Also powers Porter Value Chain.",
  },
  {
    id: "blueOcean",
    name: "Blue Ocean Strategy",
    domain: "Strategy & Organizational Alignment",
    executionModule: "Advisory",
    outputsTo: ["Initiatives"],
    statusRelevance: "Value innovation, uncontested market space",
    temporalContext: "Annual",
    dependencies: ["porterFiveForces", "vrio"],
    notes:
      "Kim & Mauborgne (Blue Ocean Strategy, 2005). Eliminate-Reduce-Raise-Create grid. Used in Advisory when competitive saturation signals require market repositioning.",
  },
  {
    id: "bcgMatrix",
    name: "BCG Growth Share Matrix",
    domain: "Strategy & Organizational Alignment",
    executionModule: "Diagnostics",
    outputsTo: ["Initiatives"],
    statusRelevance: "Portfolio balance, resource allocation priority",
    temporalContext: "Quarterly",
    dependencies: ["okr"],
    notes:
      "Boston Consulting Group (1970). Stars, Cash Cows, Question Marks, Dogs. Used in Initiative Prioritization to classify and balance the initiative portfolio.",
  },
  {
    id: "geMcKinseyMatrix",
    name: "GE McKinsey Matrix",
    domain: "Strategy & Organizational Alignment",
    executionModule: "Diagnostics",
    outputsTo: ["Initiatives"],
    statusRelevance: "Business unit attractiveness, competitive strength",
    temporalContext: "Quarterly",
    dependencies: ["bcgMatrix", "vrio"],
    notes:
      "General Electric / McKinsey nine-cell matrix. More nuanced than BCG for multi-department portfolio prioritization. Powers Initiative Prioritization for orgs with 5+ concurrent initiatives.",
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// INITIATIVE & PROJECT MANAGEMENT
// ─────────────────────────────────────────────────────────────────────────────

const projectFrameworks: FrameworkRecord[] = [
  {
    id: "pmbok",
    name: "PMBOK Knowledge Areas",
    domain: "Initiative & Project Management",
    executionModule: "Systems",
    outputsTo: ["Initiatives"],
    statusRelevance: "Project delivery health across 10 knowledge areas",
    temporalContext: "Continuous",
    dependencies: ["criticalPath", "wbs"],
    notes:
      "Project Management Institute (PMBOK Guide). 10 knowledge areas: Integration, Scope, Time, Cost, Quality, Resources, Communications, Risk, Procurement, Stakeholders. Backbone of the Project Delivery System.",
    systemChains: ["Project Delivery System"],
  },
  {
    id: "prince2",
    name: "PRINCE2",
    domain: "Initiative & Project Management",
    executionModule: "Systems",
    outputsTo: ["Initiatives"],
    statusRelevance: "Project governance, stage-gate compliance",
    temporalContext: "Continuous",
    dependencies: ["pmbok", "stageGate"],
    notes:
      "Office of Government Commerce (UK). Process-based method: 7 principles, 7 themes, 7 processes. Runs parallel to PMBOK in governance-heavy initiatives.",
    systemChains: ["Project Delivery System"],
  },
  {
    id: "ccpm",
    name: "Critical Chain Project Management",
    domain: "Initiative & Project Management",
    executionModule: "Diagnostics",
    outputsTo: ["Initiatives"],
    statusRelevance: "Buffer health, resource-constrained schedule risk",
    temporalContext: "Weekly",
    dependencies: ["toc", "criticalPath"],
    notes:
      "Eliyahu Goldratt (Critical Chain, 1997). Extends TOC into project scheduling. Identifies the critical chain (resource + task dependencies). Powers Dependency Bottleneck signal detection.",
    systemChains: ["Project Delivery System", "Operational Bottleneck Detection System"],
  },
  {
    id: "criticalPath",
    name: "Critical Path Method",
    domain: "Initiative & Project Management",
    executionModule: "Diagnostics",
    outputsTo: ["Initiatives"],
    statusRelevance: "Schedule float, delivery risk",
    temporalContext: "Weekly",
    dependencies: ["pert", "wbs"],
    notes:
      "Morgan Walker & James Kelley (DuPont, 1957). Identifies the longest path of dependent tasks. Used in Initiative Roadmap Creation and Dependency Mapping workflows.",
    systemChains: ["Operational Bottleneck Detection System"],
  },
  {
    id: "pert",
    name: "PERT Analysis",
    domain: "Initiative & Project Management",
    executionModule: "Diagnostics",
    outputsTo: ["Initiatives"],
    statusRelevance: "Schedule uncertainty, probabilistic completion",
    temporalContext: "On-Demand",
    dependencies: ["criticalPath"],
    notes:
      "US Navy / Booz Allen Hamilton (1957). Three-point estimation (optimistic, most likely, pessimistic). Powers probabilistic delivery date estimates in Initiative Health scoring.",
  },
  {
    id: "stageGate",
    name: "Stage Gate Process",
    domain: "Initiative & Project Management",
    executionModule: "Systems",
    outputsTo: ["Initiatives"],
    statusRelevance: "Initiative advancement gates, go/kill decisions",
    temporalContext: "On-Trigger",
    dependencies: ["pmbok", "mosCoW"],
    notes:
      "Robert Cooper (Winning at New Products). Structured review gates between phases. Prevents premature resource commitment. Signals when initiatives are blocked at stage gates.",
  },
  {
    id: "wbs",
    name: "Work Breakdown Structure",
    domain: "Initiative & Project Management",
    executionModule: "Tools",
    outputsTo: ["Initiatives"],
    statusRelevance: "Scope decomposition, task completeness",
    temporalContext: "On-Demand",
    dependencies: ["pmbok"],
    notes:
      "PMI/PMBOK standard. Hierarchical decomposition of total project scope. Foundation for task creation and resource allocation in Action Items.",
  },
  {
    id: "gantt",
    name: "Gantt Charts",
    domain: "Initiative & Project Management",
    executionModule: "Tools",
    outputsTo: ["Dashboard"],
    statusRelevance: "Timeline visualization, milestone tracking",
    temporalContext: "Continuous",
    dependencies: ["criticalPath", "wbs"],
    notes:
      "Henry Gantt (1910). Visual project schedule. Rendered on Dashboard for executive timeline view. Updated by Project Scheduling workflow.",
  },
  {
    id: "raidLog",
    name: "RAID Log",
    domain: "Initiative & Project Management",
    executionModule: "Tools",
    outputsTo: ["Initiatives"],
    statusRelevance: "Risk, assumption, issue, dependency tracking",
    temporalContext: "Continuous",
    dependencies: ["riskHeatMap", "issueEscalation"],
    notes:
      "PMO standard. Risks, Assumptions, Issues, Dependencies. Feeds the Risk & Issue Management workflow cluster. Triggers escalation when entries hit threshold.",
  },
  {
    id: "mosCoW",
    name: "MoSCoW Prioritization",
    domain: "Initiative & Project Management",
    executionModule: "Advisory",
    outputsTo: ["Initiatives"],
    statusRelevance: "Scope prioritization, requirement classification",
    temporalContext: "On-Demand",
    dependencies: ["weightedDecisionMatrix"],
    notes:
      "Dynamic Systems Development Method (DSDM). Must Have, Should Have, Could Have, Won't Have. Used in Initiative Scoping to classify features/deliverables.",
  },
  {
    id: "weightedDecisionMatrix",
    name: "Weighted Decision Matrix",
    domain: "Initiative & Project Management",
    executionModule: "Advisory",
    outputsTo: ["Initiatives"],
    statusRelevance: "Objective decision scoring",
    temporalContext: "On-Demand",
    dependencies: [],
    notes:
      "Operations research technique. Scores alternatives across weighted criteria. Used in Initiative Prioritization and resource allocation decisions.",
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// OPERATIONS & PROCESS MANAGEMENT
// ─────────────────────────────────────────────────────────────────────────────

const operationsFrameworks: FrameworkRecord[] = [
  {
    id: "lean",
    name: "Lean",
    domain: "Operations & Process Management",
    executionModule: "Diagnostics",
    outputsTo: ["Departments"],
    statusRelevance: "Waste detection, flow efficiency, WIP accumulation",
    temporalContext: "Continuous",
    dependencies: ["valueStreamMapping", "toc"],
    notes:
      "Womack & Jones (Lean Thinking, 1996). Five principles: value, value stream, flow, pull, perfection. Core diagnostic for operational efficiency. Fires on Process Bottleneck Detection.",
    systemChains: ["Process Improvement System", "Operational Bottleneck Detection System"],
  },
  {
    id: "toc",
    name: "Theory of Constraints",
    domain: "Operations & Process Management",
    executionModule: "Diagnostics",
    outputsTo: ["Initiatives"],
    statusRelevance: "System constraint identification, throughput",
    temporalContext: "Continuous",
    dependencies: ["ccpm"],
    notes:
      "Eliyahu Goldratt (The Goal, 1984). Five focusing steps: Identify, Exploit, Subordinate, Elevate, Repeat. Primary bottleneck detection engine. Powers Dependency Intelligence layer.",
    systemChains: ["Operational Bottleneck Detection System", "Process Improvement System"],
  },
  {
    id: "sixSigmaDMAIC",
    name: "Six Sigma DMAIC",
    domain: "Operations & Process Management",
    executionModule: "Diagnostics",
    outputsTo: ["Action Items"],
    statusRelevance: "Process defect rate, variation, capability",
    temporalContext: "On-Trigger",
    dependencies: ["statisticalProcessControl", "controlCharts"],
    notes:
      "Motorola (1980s), GE (Jack Welch). Define, Measure, Analyze, Improve, Control. Used when quality signals breach threshold. Triggers root cause analysis workflow.",
    systemChains: ["Process Improvement System", "Operational Bottleneck Detection System"],
  },
  {
    id: "valueStreamMapping",
    name: "Value Stream Mapping",
    domain: "Operations & Process Management",
    executionModule: "Tools",
    outputsTo: ["Departments"],
    statusRelevance: "End-to-end flow efficiency, non-value-added time",
    temporalContext: "Quarterly",
    dependencies: ["lean"],
    notes:
      "Rother & Shook (Learning to See, 1999). Maps information and material flows. Identifies improvement targets for Process Improvement workflows.",
  },
  {
    id: "sipoc",
    name: "SIPOC Mapping",
    domain: "Operations & Process Management",
    executionModule: "Tools",
    outputsTo: ["Departments"],
    statusRelevance: "Process boundary definition, supplier/customer clarity",
    temporalContext: "On-Demand",
    dependencies: ["sixSigmaDMAIC", "wbs"],
    notes:
      "Six Sigma tool. Suppliers, Inputs, Process, Outputs, Customers. Used in Process Documentation to ensure complete scope definition before SOP creation.",
  },
  {
    id: "bpr",
    name: "Business Process Reengineering",
    domain: "Operations & Process Management",
    executionModule: "Advisory",
    outputsTo: ["Departments"],
    statusRelevance: "Fundamental redesign trigger, transformation need",
    temporalContext: "Annual",
    dependencies: ["lean", "valueStreamMapping"],
    notes:
      "Hammer & Champy (Reengineering the Corporation, 1993). Radical process redesign vs. incremental improvement. Advisory fires BPR when maturity scoring indicates foundational process failure.",
  },
  {
    id: "kaizen",
    name: "Kaizen",
    domain: "Operations & Process Management",
    executionModule: "Systems",
    outputsTo: ["Action Items"],
    statusRelevance: "Incremental improvement culture, small-change velocity",
    temporalContext: "Continuous",
    dependencies: ["lean", "pdca"],
    notes:
      "Masaaki Imai (Kaizen, 1986). Continuous small improvements. Drives the Continuous Improvement workflow cluster. Creates Action Items for rapid-cycle improvements.",
    systemChains: ["Process Improvement System"],
  },
  {
    id: "pdca",
    name: "PDCA Cycle",
    domain: "Operations & Process Management",
    executionModule: "Systems",
    outputsTo: ["Action Items"],
    statusRelevance: "Improvement cycle completion rate",
    temporalContext: "Weekly",
    dependencies: ["kaizen"],
    notes:
      "Walter Shewhart / W. Edwards Deming. Plan-Do-Check-Act. Foundation of systematic improvement loops. Used in Process Improvement Review and Root Cause Analysis.",
    systemChains: ["Process Improvement System"],
  },
  {
    id: "tqm",
    name: "Total Quality Management",
    domain: "Operations & Process Management",
    executionModule: "Diagnostics",
    outputsTo: ["Dashboard"],
    statusRelevance: "Quality culture health, customer satisfaction link",
    temporalContext: "Monthly",
    dependencies: ["sixSigmaDMAIC", "pdca"],
    notes:
      "Feigenbaum, Deming, Juran. Organization-wide quality management. Powers overall quality health score on Dashboard.",
  },
  {
    id: "statisticalProcessControl",
    name: "Statistical Process Control",
    domain: "Operations & Process Management",
    executionModule: "Diagnostics",
    outputsTo: ["Dashboard"],
    statusRelevance: "Process stability, control limit breaches",
    temporalContext: "Continuous",
    dependencies: ["sixSigmaDMAIC"],
    notes:
      "Walter Shewhart (1920s). Uses statistical methods to monitor/control processes. Triggers alerts when processes go out of control. Part of Operational Bottleneck Detection.",
    systemChains: ["Operational Bottleneck Detection System"],
  },
  {
    id: "controlCharts",
    name: "Control Charts",
    domain: "Operations & Process Management",
    executionModule: "Diagnostics",
    outputsTo: ["Reports"],
    statusRelevance: "Variation monitoring, signal vs. noise",
    temporalContext: "Continuous",
    dependencies: ["statisticalProcessControl"],
    notes:
      "Shewhart control charts (X-bar, R, P, C charts). Distinguish special cause from common cause variation. Exported to Reports for quality monitoring.",
    systemChains: ["Operational Bottleneck Detection System"],
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// PERFORMANCE & METRICS
// ─────────────────────────────────────────────────────────────────────────────

const performanceFrameworks: FrameworkRecord[] = [
  {
    id: "kpiTree",
    name: "KPI Tree",
    domain: "Performance & Metrics",
    executionModule: "Diagnostics",
    outputsTo: ["Dashboard"],
    statusRelevance: "KPI hierarchy health, leading indicator signals",
    temporalContext: "Weekly",
    dependencies: ["bsc", "leadingLagging"],
    notes:
      "Strategic KPI decomposition. Maps top-level outcomes to driver metrics. Powers KPI Alert Trigger and Dashboard performance tiles.",
    systemChains: ["Operational Performance System", "Operational Bottleneck Detection System"],
  },
  {
    id: "leadingLagging",
    name: "Leading vs. Lagging Indicators",
    domain: "Performance & Metrics",
    executionModule: "Diagnostics",
    outputsTo: ["Dashboard"],
    statusRelevance: "Predictive vs. historical performance separation",
    temporalContext: "Weekly",
    dependencies: ["kpiTree"],
    notes:
      "Kaplan & Norton, Balanced Scorecard. Leading indicators predict future performance; lagging confirm past. Used to build predictive alert logic on Dashboard.",
    systemChains: ["Operational Performance System"],
  },
  {
    id: "benchmarking",
    name: "Benchmarking",
    domain: "Performance & Metrics",
    executionModule: "Diagnostics",
    outputsTo: ["Reports"],
    statusRelevance: "External performance gap identification",
    temporalContext: "Quarterly",
    dependencies: ["kpiTree", "cmmi"],
    notes:
      "APQC (American Productivity & Quality Center). Internal and external benchmarking. Used in Department Performance Review to surface gaps vs. industry peers.",
  },
  {
    id: "operationalMaturityModels",
    name: "Operational Maturity Models",
    domain: "Performance & Metrics",
    executionModule: "Diagnostics",
    outputsTo: ["Dashboard"],
    statusRelevance: "Org-wide process maturity level",
    temporalContext: "Quarterly",
    dependencies: ["cmmi", "bsc"],
    notes:
      "SEI CMMI, APQC, Lean Enterprise Institute. Five-level maturity scoring (Foundational → Optimized). Foundation for all maturity score tiles on Dashboard.",
    systemChains: ["Organizational Health Monitoring System"],
  },
  {
    id: "pmoMaturityModel",
    name: "PMO Maturity Model",
    domain: "Performance & Metrics",
    executionModule: "Diagnostics",
    outputsTo: ["Reports"],
    statusRelevance: "PMO function capability and governance maturity",
    temporalContext: "Quarterly",
    dependencies: ["cmmi", "pmbok"],
    notes:
      "PMI/Gartner PMO Maturity frameworks. 5-level scale. Tracks PMO governance, methodology, tools, and integration maturity.",
  },
  {
    id: "efqm",
    name: "EFQM Excellence Model",
    domain: "Performance & Metrics",
    executionModule: "Diagnostics",
    outputsTo: ["Reports"],
    statusRelevance: "Organizational excellence score",
    temporalContext: "Annual",
    dependencies: ["bsc", "tqm"],
    notes:
      "European Foundation for Quality Management (1988). Enablers (leadership, strategy, people, partnerships, processes) + Results. Used in Annual Strategic Review.",
  },
  {
    id: "baldrige",
    name: "Malcolm Baldrige Framework",
    domain: "Performance & Metrics",
    executionModule: "Diagnostics",
    outputsTo: ["Reports"],
    statusRelevance: "National quality award criteria scoring",
    temporalContext: "Annual",
    dependencies: ["efqm", "tqm"],
    notes:
      "US National Institute of Standards (1987). 7 categories: Leadership, Strategy, Customers, Measurement/Analysis, Workforce, Operations, Results. Used for executive-level organizational health assessment.",
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// RISK & DECISION SCIENCE
// ─────────────────────────────────────────────────────────────────────────────

const riskFrameworks: FrameworkRecord[] = [
  {
    id: "riskHeatMap",
    name: "Risk Heat Map",
    domain: "Risk & Decision Science",
    executionModule: "Diagnostics",
    outputsTo: ["Dashboard"],
    statusRelevance: "Risk severity matrix, red/yellow/green signals",
    temporalContext: "Weekly",
    dependencies: ["erm", "fmea"],
    notes:
      "Standard risk management visualization (probability × impact). Drives Dashboard risk tiles. Source of red signal generation for high-probability, high-impact risks.",
    systemChains: ["Risk Management System"],
  },
  {
    id: "erm",
    name: "Enterprise Risk Management",
    domain: "Risk & Decision Science",
    executionModule: "Systems",
    outputsTo: ["Reports"],
    statusRelevance: "Enterprise-wide risk posture",
    temporalContext: "Monthly",
    dependencies: ["iso31000"],
    notes:
      "COSO ERM Framework (2004, updated 2017). Eight components. Integrates risk management into strategy and performance. Full risk register management.",
    systemChains: ["Risk Management System"],
  },
  {
    id: "iso31000",
    name: "ISO 31000",
    domain: "Risk & Decision Science",
    executionModule: "Systems",
    outputsTo: ["Reports"],
    statusRelevance: "Risk management process standards compliance",
    temporalContext: "Annual",
    dependencies: [],
    notes:
      "ISO International Standard (2009, rev 2018). Risk management principles, framework, and process. Compliance baseline for governance-heavy organizations.",
    systemChains: ["Risk Management System", "Governance & Compliance System"],
  },
  {
    id: "fmea",
    name: "FMEA",
    domain: "Risk & Decision Science",
    executionModule: "Diagnostics",
    outputsTo: ["Action Items"],
    statusRelevance: "Failure mode severity, occurrence, detection scores",
    temporalContext: "On-Trigger",
    dependencies: ["sixSigmaDMAIC"],
    notes:
      "Failure Mode and Effects Analysis (MIL-STD-1629, 1949). Scores failure modes by Severity × Occurrence × Detection (RPN). Generates Action Items when RPN exceeds threshold.",
  },
  {
    id: "bowtie",
    name: "Bowtie Risk Analysis",
    domain: "Risk & Decision Science",
    executionModule: "Diagnostics",
    outputsTo: ["Reports"],
    statusRelevance: "Cause-to-consequence pathway mapping",
    temporalContext: "On-Trigger",
    dependencies: ["fmea", "riskHeatMap"],
    notes:
      "Shell Oil Co. (1970s), Energy Institute standard. Maps causes (threats) → hazard → consequences with barrier controls. Used for high-severity risk events.",
  },
  {
    id: "monteCarlo",
    name: "Monte Carlo Simulation",
    domain: "Risk & Decision Science",
    executionModule: "Tools",
    outputsTo: ["Reports"],
    statusRelevance: "Probabilistic outcome range modeling",
    temporalContext: "On-Demand",
    dependencies: ["pert", "sensitivityAnalysis"],
    notes:
      "Stanislaw Ulam / Nicholas Metropolis (1940s). Statistical simulation for project schedule and cost risk. Produces P50/P80/P90 confidence intervals for initiative timelines.",
  },
  {
    id: "decisionTrees",
    name: "Decision Trees",
    domain: "Risk & Decision Science",
    executionModule: "Tools",
    outputsTo: ["Advisory"],
    statusRelevance: "Decision pathway expected value",
    temporalContext: "On-Demand",
    dependencies: [],
    notes:
      "Operations research / Decision analysis (Hammond, Keeney, Raiffa — Decision Traps). Visual expected value calculations for multi-stage decisions. Used in Advisory for resource reallocation choices.",
  },
  {
    id: "sensitivityAnalysis",
    name: "Sensitivity Analysis",
    domain: "Risk & Decision Science",
    executionModule: "Tools",
    outputsTo: ["Advisory"],
    statusRelevance: "Variable impact ranking on outcomes",
    temporalContext: "On-Demand",
    dependencies: ["monteCarlo"],
    notes:
      "Classic quantitative analysis. Identifies which input variables most affect outcomes. Used in Advisory to rank risk factors before mitigation planning.",
  },
  {
    id: "scenarioPlanning",
    name: "Scenario Planning",
    domain: "Risk & Decision Science",
    executionModule: "Advisory",
    outputsTo: ["Initiatives"],
    statusRelevance: "Strategic resilience, alternative future readiness",
    temporalContext: "Quarterly",
    dependencies: ["pestel", "monteCarlo"],
    notes:
      "Shell International (Pierre Wack, 1970s). Constructs plausible future scenarios for strategic stress-testing. Used in Annual Strategic Planning and initiative re-evaluation.",
  },
  {
    id: "realOptions",
    name: "Real Options Analysis",
    domain: "Risk & Decision Science",
    executionModule: "Advisory",
    outputsTo: ["Initiatives"],
    statusRelevance: "Strategic flexibility valuation",
    temporalContext: "On-Demand",
    dependencies: ["npv", "monteCarlo"],
    notes:
      "Stewart Myers (MIT, 1977). Extension of financial options theory to strategic investments. Values flexibility (defer, expand, abandon options). Used for high-uncertainty initiatives.",
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// FINANCE & INVESTMENT DECISIONING
// ─────────────────────────────────────────────────────────────────────────────

const financeFrameworks: FrameworkRecord[] = [
  {
    id: "npv",
    name: "NPV",
    domain: "Finance & Investment Decisioning",
    executionModule: "Tools",
    outputsTo: ["Initiatives"],
    statusRelevance: "Initiative financial return",
    temporalContext: "On-Demand",
    dependencies: ["irr", "paybackPeriod"],
    notes:
      "Net Present Value. Standard capital budgeting technique (Brealey & Myers — Principles of Corporate Finance). Required for initiatives above budget threshold.",
  },
  {
    id: "irr",
    name: "IRR",
    domain: "Finance & Investment Decisioning",
    executionModule: "Tools",
    outputsTo: ["Initiatives"],
    statusRelevance: "Internal return threshold relative to hurdle rate",
    temporalContext: "On-Demand",
    dependencies: ["npv"],
    notes:
      "Internal Rate of Return. Used alongside NPV for initiative financial approval. Flags when IRR falls below the org's cost of capital threshold.",
  },
  {
    id: "paybackPeriod",
    name: "Payback Period",
    domain: "Finance & Investment Decisioning",
    executionModule: "Tools",
    outputsTo: ["Initiatives"],
    statusRelevance: "Liquidity risk, cash recovery speed",
    temporalContext: "On-Demand",
    dependencies: ["npv"],
    notes:
      "Simple capital recovery calculation. Used when liquidity constraint is primary concern. Feeds Initiative Prioritization for cash-constrained orgs.",
  },
  {
    id: "costBenefitAnalysis",
    name: "Cost Benefit Analysis",
    domain: "Finance & Investment Decisioning",
    executionModule: "Advisory",
    outputsTo: ["Initiatives"],
    statusRelevance: "Go/no-go financial justification",
    temporalContext: "On-Demand",
    dependencies: ["npv"],
    notes:
      "Classic welfare economics technique. Full cost and benefit enumeration. Used in Advisory to justify or challenge initiative business cases.",
  },
  {
    id: "eva",
    name: "Economic Value Added",
    domain: "Finance & Investment Decisioning",
    executionModule: "Diagnostics",
    outputsTo: ["Dashboard"],
    statusRelevance: "True economic profit above cost of capital",
    temporalContext: "Monthly",
    dependencies: ["bsc"],
    notes:
      "Stern Stewart & Co. (1990s). EVA = NOPAT − (WACC × Invested Capital). Signals whether business operations are destroying or creating shareholder value.",
  },
  {
    id: "activityBasedCosting",
    name: "Activity Based Costing",
    domain: "Finance & Investment Decisioning",
    executionModule: "Diagnostics",
    outputsTo: ["Reports"],
    statusRelevance: "True cost allocation by activity",
    temporalContext: "Quarterly",
    dependencies: ["valueStreamMapping"],
    notes:
      "Robin Cooper & Robert Kaplan (1987). Assigns overhead costs to specific activities. Reveals true cost of departments and processes hidden by traditional costing.",
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// TEAM & ORGANIZATIONAL BEHAVIOR
// ─────────────────────────────────────────────────────────────────────────────

const teamFrameworks: FrameworkRecord[] = [
  {
    id: "emotionalIntelligence",
    name: "Emotional Intelligence",
    domain: "Team & Organizational Behavior",
    executionModule: "Advisory",
    outputsTo: ["Team"],
    statusRelevance: "Leadership effectiveness, team cohesion",
    temporalContext: "Monthly",
    dependencies: [],
    notes:
      "Daniel Goleman (Emotional Intelligence, 1995). Four domains: Self-Awareness, Self-Management, Social Awareness, Relationship Management. Used in Advisory when leadership friction signals appear.",
  },
  {
    id: "situationalLeadership",
    name: "Situational Leadership",
    domain: "Team & Organizational Behavior",
    executionModule: "Advisory",
    outputsTo: ["Team"],
    statusRelevance: "Leader-follower development stage alignment",
    temporalContext: "Monthly",
    dependencies: ["emotionalIntelligence"],
    notes:
      "Hersey & Blanchard (Management of Organizational Behavior). Four styles matched to follower development level. Advisory uses this when capacity or morale signals appear in Team data.",
  },
  {
    id: "servantLeadership",
    name: "Servant Leadership",
    domain: "Team & Organizational Behavior",
    executionModule: "Advisory",
    outputsTo: ["Team"],
    statusRelevance: "Organizational trust, empowerment culture",
    temporalContext: "Monthly",
    dependencies: ["emotionalIntelligence"],
    notes:
      "Robert Greenleaf (The Servant as Leader, 1970). 10 characteristics of servant leaders. Advisory fires this when blockers are consistently leader-caused in Team MOCHA data.",
  },
  {
    id: "leadershipPipeline",
    name: "Leadership Pipeline",
    domain: "Team & Organizational Behavior",
    executionModule: "Diagnostics",
    outputsTo: ["Team"],
    statusRelevance: "Leadership transition readiness, succession gaps",
    temporalContext: "Quarterly",
    dependencies: ["galbraithStar"],
    notes:
      "Ram Charan, Stephen Drotter, James Noel (The Leadership Pipeline). Six passage model. Used in Leadership Coverage Analysis and succession risk diagnostics.",
    systemChains: ["Organizational Structure System"],
  },
  {
    id: "tuckman",
    name: "Tuckman Team Model",
    domain: "Team & Organizational Behavior",
    executionModule: "Diagnostics",
    outputsTo: ["Team"],
    statusRelevance: "Team development stage, performance plateau detection",
    temporalContext: "Monthly",
    dependencies: [],
    notes:
      "Bruce Tuckman (1965). Forming, Storming, Norming, Performing, Adjourning. Used in Team diagnostics when execution gaps appear in team MOCHA load data.",
  },
  {
    id: "spanOfControl",
    name: "Span of Control Analysis",
    domain: "Team & Organizational Behavior",
    executionModule: "Diagnostics",
    outputsTo: ["Departments"],
    statusRelevance: "Management overhead, control efficiency",
    temporalContext: "Quarterly",
    dependencies: ["galbraithStar", "leadershipPipeline"],
    notes:
      "Classical organizational design principle (Graicunas, 1933; Urwick, 1956). Analyzes ratio of direct reports per manager. Flags over- or under-managed structures.",
    systemChains: ["Organizational Structure System"],
  },
  {
    id: "orgNetworkAnalysis",
    name: "Organizational Network Analysis",
    domain: "Team & Organizational Behavior",
    executionModule: "Tools",
    outputsTo: ["Departments"],
    statusRelevance: "Collaboration network health, information flow",
    temporalContext: "Quarterly",
    dependencies: [],
    notes:
      "Rob Cross & Andrew Parker (The Hidden Power of Social Networks). Maps informal communication and influence networks. Identifies collaboration bottlenecks and knowledge silos.",
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// CHANGE MANAGEMENT
// ─────────────────────────────────────────────────────────────────────────────

const changeFrameworks: FrameworkRecord[] = [
  {
    id: "kotter8Step",
    name: "Kotter 8 Step Model",
    domain: "Change Management",
    executionModule: "Systems",
    outputsTo: ["Initiatives"],
    statusRelevance: "Change program stage, urgency and coalition strength",
    temporalContext: "On-Trigger",
    dependencies: ["adkar"],
    notes:
      "John Kotter (Leading Change, 1996). Eight steps from urgency creation to embedding change. Used in Change Implementation Plan workflow.",
    systemChains: ["Organizational Health Monitoring System"],
  },
  {
    id: "adkar",
    name: "ADKAR",
    domain: "Change Management",
    executionModule: "Systems",
    outputsTo: ["Initiatives"],
    statusRelevance: "Individual change readiness, adoption rate",
    temporalContext: "On-Trigger",
    dependencies: ["kotter8Step", "emotionalIntelligence"],
    notes:
      "Prosci (Jeff Hiatt, 2006). Awareness, Desire, Knowledge, Ability, Reinforcement. Individual-level change model. Used alongside Kotter for people-side change tracking.",
    systemChains: ["Organizational Health Monitoring System"],
  },
  {
    id: "lewinChange",
    name: "Lewin Change Model",
    domain: "Change Management",
    executionModule: "Systems",
    outputsTo: ["Initiatives"],
    statusRelevance: "Change phase (unfreeze / change / refreeze)",
    temporalContext: "On-Trigger",
    dependencies: [],
    notes:
      "Kurt Lewin (1947). Three-stage change process. Foundational change model. Used when org restructuring or process reengineering workflows trigger.",
  },
  {
    id: "culturalWeb",
    name: "Cultural Web",
    domain: "Change Management",
    executionModule: "Diagnostics",
    outputsTo: ["Departments"],
    statusRelevance: "Cultural alignment, paradigm resistance to change",
    temporalContext: "Annual",
    dependencies: ["mckinsey7s"],
    notes:
      "Johnson & Scholes (Exploring Corporate Strategy). Six elements: stories, rituals, symbols, org structure, control systems, power structures. Used in org-wide culture change initiatives.",
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// PRODUCT / CUSTOMER / MARKETING
// ─────────────────────────────────────────────────────────────────────────────

const productFrameworks: FrameworkRecord[] = [
  {
    id: "jtbd",
    name: "Jobs to Be Done",
    domain: "Product / Customer / Marketing",
    executionModule: "Advisory",
    outputsTo: ["Initiatives"],
    statusRelevance: "Customer motivation alignment, product-market fit",
    temporalContext: "On-Demand",
    dependencies: ["valuePropositionCanvas"],
    notes:
      "Clayton Christensen (The Innovator's Dilemma, Competing Against Luck). Focuses on the functional, emotional, and social jobs customers hire products to do. Used in new initiative scoping.",
  },
  {
    id: "valuePropositionCanvas",
    name: "Value Proposition Canvas",
    domain: "Product / Customer / Marketing",
    executionModule: "Advisory",
    outputsTo: ["Initiatives"],
    statusRelevance: "Value-customer fit score",
    temporalContext: "On-Demand",
    dependencies: ["jtbd"],
    notes:
      "Osterwalder, Pigneur, Bernarda (Value Proposition Design, 2014). Customer Profile × Value Map. Used in Initiative Scoping to validate product-market alignment.",
  },
  {
    id: "customerJourneyMapping",
    name: "Customer Journey Mapping",
    domain: "Product / Customer / Marketing",
    executionModule: "Tools",
    outputsTo: ["Reports"],
    statusRelevance: "CX touchpoint quality, friction points",
    temporalContext: "Quarterly",
    dependencies: ["nps"],
    notes:
      "Service design / CX standard. Maps customer touchpoints across awareness, purchase, and retention stages. Generates insight reports for CX improvement initiatives.",
  },
  {
    id: "nps",
    name: "Net Promoter Score",
    domain: "Product / Customer / Marketing",
    executionModule: "Diagnostics",
    outputsTo: ["Dashboard"],
    statusRelevance: "Customer loyalty and satisfaction signal",
    temporalContext: "Monthly",
    dependencies: [],
    notes:
      "Fred Reichheld (The Ultimate Question, 2006). NPS = % Promoters − % Detractors. Dashboard CX health signal. Triggers Advisory when NPS drops > 10 points in a cycle.",
  },
  {
    id: "aarrr",
    name: "AARRR Metrics",
    domain: "Product / Customer / Marketing",
    executionModule: "Diagnostics",
    outputsTo: ["Dashboard"],
    statusRelevance: "Growth funnel health, conversion gaps",
    temporalContext: "Weekly",
    dependencies: ["kpiTree"],
    notes:
      "Dave McClure (500 Startups, 2007). Acquisition, Activation, Retention, Revenue, Referral. Used for growth-stage organizations. Powers growth funnel tiles on Dashboard.",
  },
  {
    id: "marketingMix4Ps",
    name: "Marketing Mix 4Ps",
    domain: "Product / Customer / Marketing",
    executionModule: "Advisory",
    outputsTo: ["Initiatives"],
    statusRelevance: "Go-to-market alignment, mix balance",
    temporalContext: "Quarterly",
    dependencies: ["porterFiveForces"],
    notes:
      "E. Jerome McCarthy (Basic Marketing, 1960). Product, Price, Place, Promotion. Used in Advisory for GTM initiative validation and market approach coherence.",
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// SYSTEMS THINKING & COMPLEXITY
// ─────────────────────────────────────────────────────────────────────────────

const systemsThinkingFrameworks: FrameworkRecord[] = [
  {
    id: "cynefin",
    name: "Cynefin Framework",
    domain: "Systems Thinking & Complexity",
    executionModule: "Advisory",
    outputsTo: ["Initiatives"],
    statusRelevance: "Problem domain classification (simple/complicated/complex/chaotic)",
    temporalContext: "On-Demand",
    dependencies: ["systemsThinking"],
    notes:
      "Dave Snowden (IBM, 1999). Five domains: Simple, Complicated, Complex, Chaotic, Disorder. Used in Advisory to classify whether a problem requires best practice, expertise, experimentation, or rapid stabilization.",
  },
  {
    id: "systemsThinking",
    name: "Systems Thinking",
    domain: "Systems Thinking & Complexity",
    executionModule: "Advisory",
    outputsTo: ["Diagnostics"],
    statusRelevance: "Interconnected cause detection, emergent behavior",
    temporalContext: "Continuous",
    dependencies: ["feedbackLoopMapping", "causalLoopDiagrams"],
    notes:
      "Peter Senge (The Fifth Discipline, 1990). Five disciplines: Systems Thinking, Personal Mastery, Mental Models, Shared Vision, Team Learning. Core reasoning layer for Dependency Intelligence.",
    systemChains: ["Organizational Health Monitoring System"],
  },
  {
    id: "causalLoopDiagrams",
    name: "Causal Loop Diagrams",
    domain: "Systems Thinking & Complexity",
    executionModule: "Tools",
    outputsTo: ["Diagnostics"],
    statusRelevance: "Feedback loop strength, amplifying vs. balancing dynamics",
    temporalContext: "On-Demand",
    dependencies: ["systemsThinking"],
    notes:
      "Jay Forrester (Industrial Dynamics, 1961). Visual mapping of reinforcing and balancing loops. Used in diagnostic deep-dives for systemic root cause analysis.",
  },
  {
    id: "feedbackLoopMapping",
    name: "Feedback Loop Mapping",
    domain: "Systems Thinking & Complexity",
    executionModule: "Tools",
    outputsTo: ["Diagnostics"],
    statusRelevance: "System dynamic patterns, delay identification",
    temporalContext: "On-Demand",
    dependencies: ["causalLoopDiagrams", "toc"],
    notes:
      "System Dynamics methodology. Maps positive (reinforcing) and negative (balancing) feedback loops. Part of the Dependency Intelligence layer.",
    systemChains: ["Operational Bottleneck Detection System"],
  },
  {
    id: "complexityTheory",
    name: "Complexity Theory",
    domain: "Systems Thinking & Complexity",
    executionModule: "Advisory",
    outputsTo: ["Diagnostics"],
    statusRelevance: "Emergence, self-organization, non-linear response signals",
    temporalContext: "On-Demand",
    dependencies: ["cynefin", "systemsThinking"],
    notes:
      "Santa Fe Institute (1980s–present). Complex Adaptive Systems theory. Applied in Advisory when diagnostic patterns show non-linear organizational behavior.",
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// BEHAVIORAL & DECISION PSYCHOLOGY
// ─────────────────────────────────────────────────────────────────────────────

const behavioralFrameworks: FrameworkRecord[] = [
  {
    id: "cognitiveBiasCodex",
    name: "Cognitive Bias Codex",
    domain: "Behavioral & Decision Psychology",
    executionModule: "Advisory",
    outputsTo: ["Advisory"],
    statusRelevance: "Decision quality risk, known bias patterns in choices",
    temporalContext: "On-Demand",
    dependencies: ["prospectTheory"],
    notes:
      "Buster Benson codex of 188+ cognitive biases (based on Kahneman, Tversky, Thaler et al.). Used in Advisory to flag when decision patterns exhibit known biases (anchoring, availability heuristic, etc.).",
  },
  {
    id: "prospectTheory",
    name: "Prospect Theory",
    domain: "Behavioral & Decision Psychology",
    executionModule: "Advisory",
    outputsTo: ["Initiatives"],
    statusRelevance: "Loss aversion patterns in prioritization decisions",
    temporalContext: "On-Demand",
    dependencies: [],
    notes:
      "Daniel Kahneman & Amos Tversky (1979). Loss aversion, reference dependence, probability weighting. Used in Advisory when organizations over-invest in failing initiatives due to sunk cost effects.",
  },
  {
    id: "nudgeTheory",
    name: "Nudge Theory",
    domain: "Behavioral & Decision Psychology",
    executionModule: "Advisory",
    outputsTo: ["Action Items"],
    statusRelevance: "Behavior change design, choice architecture",
    temporalContext: "On-Demand",
    dependencies: ["foggBehaviorModel"],
    notes:
      "Richard Thaler & Cass Sunstein (Nudge, 2008). Choice architecture to guide behavior without mandates. Used in Action Items design to improve task completion rates.",
  },
  {
    id: "foggBehaviorModel",
    name: "Fogg Behavior Model",
    domain: "Behavioral & Decision Psychology",
    executionModule: "Advisory",
    outputsTo: ["Team"],
    statusRelevance: "Behavior = Motivation × Ability × Prompt",
    temporalContext: "On-Demand",
    dependencies: [],
    notes:
      "BJ Fogg (Tiny Habits, 2019). Behavior activation requires motivation + ability + prompt to align. Used in Advisory for team behavior change and adoption initiatives.",
  },
  {
    id: "combModel",
    name: "COM-B Model",
    domain: "Behavioral & Decision Psychology",
    executionModule: "Advisory",
    outputsTo: ["Team"],
    statusRelevance: "Behavior change barriers (capability, opportunity, motivation)",
    temporalContext: "On-Demand",
    dependencies: ["foggBehaviorModel"],
    notes:
      "Michie et al. (Centre for Behaviour Change, UCL, 2011). Capability, Opportunity, Motivation → Behavior. Used in Advisory when process adoption or training interventions are recommended.",
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// INNOVATION & PRODUCT DEVELOPMENT
// ─────────────────────────────────────────────────────────────────────────────

const innovationFrameworks: FrameworkRecord[] = [
  {
    id: "designThinking",
    name: "Design Thinking",
    domain: "Innovation & Product Development",
    executionModule: "Advisory",
    outputsTo: ["Initiatives"],
    statusRelevance: "Human-centered solution quality",
    temporalContext: "On-Demand",
    dependencies: ["jtbd", "doubleDiamond"],
    notes:
      "IDEO / Stanford d.school. Five stages: Empathize, Define, Ideate, Prototype, Test. Used in Advisory for customer problem-solution fit validation.",
  },
  {
    id: "doubleDiamond",
    name: "Double Diamond",
    domain: "Innovation & Product Development",
    executionModule: "Advisory",
    outputsTo: ["Initiatives"],
    statusRelevance: "Diverge-converge problem framing quality",
    temporalContext: "On-Demand",
    dependencies: ["designThinking"],
    notes:
      "UK Design Council (2005). Two diamonds: Discover/Define (problem) + Develop/Deliver (solution). Structures the innovation process from problem space to solution space.",
  },
  {
    id: "leanStartup",
    name: "Lean Startup",
    domain: "Innovation & Product Development",
    executionModule: "Systems",
    outputsTo: ["Initiatives"],
    statusRelevance: "Build-Measure-Learn cycle velocity",
    temporalContext: "Weekly",
    dependencies: ["jtbd", "lean"],
    notes:
      "Eric Ries (The Lean Startup, 2011). Build-Measure-Learn cycle, MVP, pivot/persevere decision. Used in initiative rapid-iteration tracking and innovation initiative health.",
    systemChains: ["Project Delivery System"],
  },
  {
    id: "horizon123",
    name: "Horizon 1-3 Innovation",
    domain: "Innovation & Product Development",
    executionModule: "Diagnostics",
    outputsTo: ["Initiatives"],
    statusRelevance: "Innovation portfolio balance across time horizons",
    temporalContext: "Quarterly",
    dependencies: ["bcgMatrix", "bsc"],
    notes:
      "McKinsey & Company (The Alchemy of Growth, 1999). H1: core business, H2: emerging, H3: new ventures. Classifies initiative portfolio by innovation horizon.",
  },
  {
    id: "innovationAmbitionMatrix",
    name: "Innovation Ambition Matrix",
    domain: "Innovation & Product Development",
    executionModule: "Diagnostics",
    outputsTo: ["Initiatives"],
    statusRelevance: "Innovation investment distribution balance",
    temporalContext: "Quarterly",
    dependencies: ["horizon123"],
    notes:
      "Nagji & Tuff (HBR, 2012). 2×2 of offerings vs. markets (core/adjacent/transformational). Complements Horizon 1-3 for portfolio investment allocation.",
  },
  {
    id: "disruptiveInnovation",
    name: "Disruptive Innovation Model",
    domain: "Innovation & Product Development",
    executionModule: "Advisory",
    outputsTo: ["Initiatives"],
    statusRelevance: "Disruption risk / opportunity from low-end or new-market entrants",
    temporalContext: "Annual",
    dependencies: ["porterFiveForces", "jtbd"],
    notes:
      "Clayton Christensen (The Innovator's Dilemma, 1997). Explains how smaller companies displace incumbents. Used in Advisory when competitive signals indicate disruptive threat.",
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// IT & GOVERNANCE
// ─────────────────────────────────────────────────────────────────────────────

const itGovernanceFrameworks: FrameworkRecord[] = [
  {
    id: "itil",
    name: "ITIL",
    domain: "IT & Governance",
    executionModule: "Systems",
    outputsTo: ["Departments"],
    statusRelevance: "IT service management maturity, SLA compliance",
    temporalContext: "Continuous",
    dependencies: ["cmmi"],
    notes:
      "Axelos (UK OGC, originally 1989). IT Infrastructure Library. Service lifecycle management. Used in IT/Systems department diagnostics for infrastructure provisioning and change management.",
    systemChains: ["Governance & Compliance System"],
  },
  {
    id: "cobit",
    name: "COBIT",
    domain: "IT & Governance",
    executionModule: "Systems",
    outputsTo: ["Reports"],
    statusRelevance: "IT governance framework compliance",
    temporalContext: "Annual",
    dependencies: ["iso31000", "itil"],
    notes:
      "ISACA (Control Objectives for Information and Related Technology). Aligns IT with business goals through governance and management objectives.",
    systemChains: ["Governance & Compliance System"],
  },
  {
    id: "iso9001",
    name: "ISO 9001",
    domain: "IT & Governance",
    executionModule: "Systems",
    outputsTo: ["Reports"],
    statusRelevance: "Quality management system compliance",
    temporalContext: "Annual",
    dependencies: ["tqm"],
    notes:
      "ISO International Standard. Quality Management System requirements. Used in Compliance Checklist Execution and Audit Preparation workflows.",
    systemChains: ["Governance & Compliance System"],
  },
  {
    id: "cmmi",
    name: "Capability Maturity Model (CMMI)",
    domain: "IT & Governance",
    executionModule: "Diagnostics",
    outputsTo: ["Reports"],
    statusRelevance: "Process maturity level (1-5) across all departments",
    temporalContext: "Quarterly",
    dependencies: ["bsc"],
    notes:
      "Software Engineering Institute, Carnegie Mellon (1986). Five maturity levels: Initial → Managed → Defined → Quantitatively Managed → Optimizing. Primary scoring engine for Operational Maturity scoring.",
    systemChains: ["Organizational Health Monitoring System", "Process Improvement System"],
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// MASTER FRAMEWORK REGISTRY
// ─────────────────────────────────────────────────────────────────────────────

export const ALL_FRAMEWORKS: FrameworkRecord[] = [
  ...strategyFrameworks,
  ...projectFrameworks,
  ...operationsFrameworks,
  ...performanceFrameworks,
  ...riskFrameworks,
  ...financeFrameworks,
  ...teamFrameworks,
  ...changeFrameworks,
  ...productFrameworks,
  ...systemsThinkingFrameworks,
  ...behavioralFrameworks,
  ...innovationFrameworks,
  ...itGovernanceFrameworks,
];

// ─────────────────────────────────────────────────────────────────────────────
// SYSTEM CHAINS
// These are orchestrated multi-framework pipelines that run sequentially
// to produce cross-module intelligence outputs.
// ─────────────────────────────────────────────────────────────────────────────

export interface SystemChain {
  id: string;
  name: string;
  description: string;
  frameworks: string[]; // framework IDs in execution order
  output: {
    initiativeRecommendation?: boolean;
    actionItems?: boolean;
    dashboardAlert?: boolean;
    reportSection?: boolean;
    advisoryGuidance?: boolean;
  };
  primarySignal: "red" | "yellow" | "green" | "blue";
  triggerCondition: string;
}

export const SYSTEM_CHAINS: SystemChain[] = [
  {
    id: "sc-bottleneck",
    name: "Operational Bottleneck Detection System",
    description:
      "Detects systemic bottlenecks using layered operational intelligence frameworks. Activates when capacity or flow signals breach thresholds.",
    frameworks: ["kpiTree", "controlCharts", "toc", "ccpm", "criticalPath", "statisticalProcessControl", "feedbackLoopMapping"],
    output: {
      initiativeRecommendation: true,
      actionItems: true,
      dashboardAlert: true,
    },
    primarySignal: "red",
    triggerCondition:
      "Capacity utilization > 85% in any department OR critical path float < 5 days OR KPI breach on leading indicator",
  },
  {
    id: "sc-strategic-alignment",
    name: "Strategic Alignment System",
    description:
      "Continuously validates that initiatives, OKRs, and departmental execution are aligned to the declared strategic direction.",
    frameworks: ["bsc", "okr", "hoshinKanri", "strategicChoiceCascade", "vrio"],
    output: {
      dashboardAlert: true,
      advisoryGuidance: true,
      initiativeRecommendation: true,
    },
    primarySignal: "yellow",
    triggerCondition:
      "OKR completion < 60% at 50% of quarter OR BSC perspective score divergence > 20 points OR initiative misalignment detected",
  },
  {
    id: "sc-risk",
    name: "Risk Intelligence System",
    description:
      "Multi-framework risk orchestration from signal to mitigation action.",
    frameworks: ["riskHeatMap", "fmea", "bowtie", "erm", "iso31000", "scenarioPlanning"],
    output: {
      dashboardAlert: true,
      actionItems: true,
      reportSection: true,
      advisoryGuidance: true,
    },
    primarySignal: "red",
    triggerCondition:
      "Risk heat map score > 16 (4×4) OR FMEA RPN > 200 OR enterprise risk trigger event",
  },
  {
    id: "sc-process-improvement",
    name: "Process Improvement Chain",
    description:
      "Structured progression from process documentation through defect reduction to automation identification.",
    frameworks: ["lean", "valueStreamMapping", "sixSigmaDMAIC", "pdca", "kaizen", "statisticalProcessControl", "controlCharts"],
    output: {
      actionItems: true,
      reportSection: true,
      advisoryGuidance: true,
    },
    primarySignal: "yellow",
    triggerCondition:
      "Process defect rate > 3% OR cycle time deviation > 30% OR waste identification in value stream mapping",
  },
  {
    id: "sc-org-health",
    name: "Organizational Health Monitoring Chain",
    description:
      "Continuous multi-dimension health assessment combining maturity, structure, culture, and leadership signals.",
    frameworks: ["cmmi", "mckinsey7s", "galbraithStar", "tuckman", "spanOfControl", "systemsThinking"],
    output: {
      dashboardAlert: true,
      reportSection: true,
      advisoryGuidance: true,
    },
    primarySignal: "yellow",
    triggerCondition: "Maturity score change > 5 points OR org structure change event OR leadership gap detected",
  },
  {
    id: "sc-initiative-prioritization",
    name: "Initiative Prioritization Chain",
    description:
      "Full-stack initiative evaluation combining strategic, financial, and portfolio lenses.",
    frameworks: ["bcgMatrix", "geMcKinseyMatrix", "horizon123", "npv", "weightedDecisionMatrix", "mosCoW"],
    output: {
      initiativeRecommendation: true,
      dashboardAlert: true,
    },
    primarySignal: "blue",
    triggerCondition: "New initiative intake OR quarterly planning cycle OR portfolio imbalance detected",
  },
  {
    id: "sc-customer-intelligence",
    name: "Customer Intelligence Chain",
    description:
      "Connects customer behavior signals to product and operational recommendations.",
    frameworks: ["nps", "aarrr", "customerJourneyMapping", "jtbd", "valuePropositionCanvas"],
    output: {
      dashboardAlert: true,
      initiativeRecommendation: true,
      reportSection: true,
    },
    primarySignal: "yellow",
    triggerCondition: "NPS drop > 10 points OR AARRR funnel stage conversion drop > 15% OR churn signal",
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// UTILITY FUNCTIONS (backend logic — not for direct UI rendering)
// ─────────────────────────────────────────────────────────────────────────────

/** Get all frameworks that output to a specific app module */
export function getFrameworksOutputtingTo(module: AppModule): FrameworkRecord[] {
  return ALL_FRAMEWORKS.filter(f => f.outputsTo.includes(module));
}

/** Get all frameworks executed by a specific module */
export function getFrameworksRunBy(module: AppModule): FrameworkRecord[] {
  return ALL_FRAMEWORKS.filter(f => f.executionModule === module);
}

/** Get all frameworks in a specific system chain */
export function getChainFrameworks(chainId: string): FrameworkRecord[] {
  const chain = SYSTEM_CHAINS.find(c => c.id === chainId);
  if (!chain) return [];
  return chain.frameworks.map(id => ALL_FRAMEWORKS.find(f => f.id === id)).filter(Boolean) as FrameworkRecord[];
}

/** Get frameworks participating in any system chain */
export function getFrameworksByDomain(domain: FrameworkDomain): FrameworkRecord[] {
  return ALL_FRAMEWORKS.filter(f => f.domain === domain);
}

/** Trigger a system chain — returns the chain's output specification */
export function triggerSystemChain(chainId: string): SystemChain | undefined {
  return SYSTEM_CHAINS.find(c => c.id === chainId);
}

/** Get all frameworks with red-signal relevance (continuous monitoring) */
export function getCriticalMonitoringFrameworks(): FrameworkRecord[] {
  return ALL_FRAMEWORKS.filter(f => f.temporalContext === "Continuous" || f.temporalContext === "Weekly");
}
