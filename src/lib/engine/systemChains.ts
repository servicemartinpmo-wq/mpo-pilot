/**
 * SYSTEM CHAINS — AI EXECUTION ARCHITECTURE
 * [Apphia.Logic] — Orchestrates complete Signal → Diagnosis → Advisory → Action pipelines
 *
 * 25 Core AI Systems for the PMO-Ops Command Center
 * Covering: Strategy, Execution, Operations, Risk, Leadership, Innovation, Analytics
 *
 * Each System Chain bundles frameworks into an automated operating sequence
 * that continuously updates the organizational profile.
 */

import { runSignalDetection } from "./signals";
import { runDiagnosis } from "./diagnosis";
import { runAdvisory } from "./advisory";
import { runMaturityScoring, runOrgHealthScoring } from "./maturity";
import { runDependencyIntelligence } from "./dependency";
import type { DetectedSignal } from "./signals";
import type { DiagnosisResult } from "./diagnosis";
import type { AdvisoryRecommendation, ActionGenerated } from "./advisory";
import type { DependencyMap } from "./dependency";
import type { MaturityScore, OrgHealthScore } from "./maturity";
import type { OrgContext } from "./contextEngine";
import { buildOrgContext } from "./contextEngine";
import { loadProfile } from "@/lib/companyStore";

// ── System Chain IDs — All 25 Core AI Systems ────────────────────────────────
export type SystemChainId =
  // Project & Program Management Systems
  | "strategic-alignment"         // 1
  | "initiative-health"           // 2
  | "execution-discipline"        // 3
  | "dependency-intelligence"     // 4
  | "org-capacity"                // 5
  | "operational-bottleneck"      // 6
  | "risk-escalation"             // 7
  | "initiative-portfolio"        // 8
  | "org-health-monitoring"       // 9
  | "process-improvement"         // 10
  // Operations Management Systems
  | "strategic-risk-forecasting"  // 11
  | "resource-allocation"         // 12
  | "leadership-bandwidth"        // 13
  | "cross-dept-coordination"     // 14
  | "execution-velocity"          // 15
  | "strategic-opportunity"       // 16
  | "decision-support"            // 17
  | "initiative-recovery"         // 18
  | "strategic-planning"          // 19
  | "innovation-pipeline"         // 20
  | "change-management"           // 21
  | "performance-benchmarking"    // 22
  | "knowledge-intelligence"      // 23
  | "predictive-analytics"        // 24
  | "executive-insight"           // 25
  // Legacy aliases (kept for backward compat)
  | "project-delivery"
  | "org-structure"
  | "risk-management"
  | "resource-capacity"
  | "operational-performance";

export interface SystemChainDefinition {
  id: SystemChainId;
  name: string;
  systemNumber: number;
  purpose: string;
  description: string;
  triggerCondition: string;
  signals: string[];              // signal descriptions
  frameworks: string[];           // framework IDs
  diagnosisMethods: string[];
  advisoryCategories: string[];
  outputModules: string[];
  updateTargets: string[];        // org profile fields updated
  cadence: "Continuous" | "Weekly" | "Monthly" | "Quarterly" | "Annual" | "On-Trigger";
  layer: "Project & Program Management" | "Operations Management";
}

export interface SystemChainResult {
  chainId: SystemChainId;
  chainName: string;
  status: "Active" | "Triggered" | "Healthy" | "Warning";
  signals: DetectedSignal[];
  diagnoses: DiagnosisResult[];
  recommendations: AdvisoryRecommendation[];
  generatedActions: ActionGenerated[];
  dependencyMap?: DependencyMap;
  maturityScores?: MaturityScore[];
  orgHealth?: OrgHealthScore;
  executedAt: string;
  signalCount: number;
  criticalCount: number;
  updatedModules: string[];
}

// ── All 25 System Chain Definitions ──────────────────────────────────────────
export const SYSTEM_CHAIN_DEFINITIONS: SystemChainDefinition[] = [

  // ── 1. STRATEGIC ALIGNMENT SYSTEM ──────────────────────────────────────────
  {
    id: "strategic-alignment",
    name: "Strategic Alignment System",
    systemNumber: 1,
    purpose: "Ensure all initiatives support organizational strategy.",
    description: "Continuously monitors strategy-to-execution coherence across OKRs, BSC, and initiative portfolio. Fires when department initiatives diverge from strategic goals.",
    triggerCondition: "Initiative not mapped to strategic goal OR OKR completion rate < 40% OR strategic misalignment signal detected",
    signals: [
      "Initiative not mapped to strategic goal",
      "Department initiatives conflict",
      "KPI misalignment",
    ],
    frameworks: ["bsc", "okr", "hoshinKanri", "strategicChoiceCascade", "swot"],
    diagnosisMethods: ["Balanced Scorecard", "OKR alignment analysis", "Strategy cascade analysis"],
    advisoryCategories: ["Strategic Realignment", "Initiative Reprioritization"],
    outputModules: ["Dashboard", "Initiatives", "Reports"],
    updateTargets: ["strategy clarity score", "initiative alignment", "OKR completion rate"],
    cadence: "Weekly",
    layer: "Project & Program Management",
  },

  // ── 2. INITIATIVE HEALTH MONITORING SYSTEM ─────────────────────────────────
  {
    id: "initiative-health",
    name: "Initiative Health Monitoring System",
    systemNumber: 2,
    purpose: "Track initiative performance and detect risk early.",
    description: "Monitors initiative milestone adherence, budget variance, and task backlog growth in real time. Triggers recovery protocols when health degrades.",
    triggerCondition: "Milestone delay detected OR budget variance > 10% OR task backlog growing > 2 consecutive weeks",
    signals: [
      "Milestone delays",
      "Budget variance",
      "Task backlog growth",
    ],
    frameworks: ["criticalPath", "pert", "toc", "ccpm", "pmbok"],
    diagnosisMethods: ["Critical Path Method", "PERT analysis", "TOC bottleneck analysis"],
    advisoryCategories: ["Execution Acceleration", "Resource Reallocation"],
    outputModules: ["Initiatives", "Dashboard", "Action Items"],
    updateTargets: ["initiative health", "milestone completion rate", "schedule variance"],
    cadence: "Weekly",
    layer: "Project & Program Management",
  },

  // ── 3. EXECUTION DISCIPLINE SYSTEM ─────────────────────────────────────────
  {
    id: "execution-discipline",
    name: "Execution Discipline System",
    systemNumber: 3,
    purpose: "Detect breakdowns in execution.",
    description: "Monitors task completion rates, deadline adherence, and action item closure. Identifies systemic execution failures rather than isolated incidents.",
    triggerCondition: "Task completion rate < 60% OR missed deadlines > 15% of active tasks OR unclosed action items > 20",
    signals: [
      "Low task completion rates",
      "Frequent missed deadlines",
      "Unclosed action items",
    ],
    frameworks: ["lean", "pmbok", "kpiTree", "leadingLagging"],
    diagnosisMethods: ["Lean execution review", "PMBOK performance metrics", "KPI decomposition"],
    advisoryCategories: ["Process Redesign", "Execution Acceleration"],
    outputModules: ["Dashboard", "Action Items", "Departments"],
    updateTargets: ["execution discipline score", "task completion rate", "deadline adherence"],
    cadence: "Weekly",
    layer: "Project & Program Management",
  },

  // ── 4. DEPENDENCY INTELLIGENCE SYSTEM ──────────────────────────────────────
  {
    id: "dependency-intelligence",
    name: "Dependency Intelligence System",
    systemNumber: 4,
    purpose: "Detect cascading impacts between initiatives and departments.",
    description: "Maps initiative → task → team → department dependency networks. Predicts bottlenecks and cascade risk before they materialize.",
    triggerCondition: "Cross-team dependency unresolved > 7 days OR task blocking chain detected OR cascade risk score > 60",
    signals: [
      "Cross-team dependency conflicts",
      "Task blocking chains",
    ],
    frameworks: ["pert", "criticalPath", "ccpm", "toc", "systemsThinking", "raidLog"],
    diagnosisMethods: ["PERT network analysis", "Systems thinking", "Cascade risk mapping"],
    advisoryCategories: ["Dependency Restructuring", "Risk Mitigation"],
    outputModules: ["Dashboard", "Initiatives", "Departments"],
    updateTargets: ["dependency map", "cascade risk score", "critical chain", "bottleneck index"],
    cadence: "Continuous",
    layer: "Project & Program Management",
  },

  // ── 5. ORGANIZATIONAL CAPACITY SYSTEM ──────────────────────────────────────
  {
    id: "org-capacity",
    name: "Organizational Capacity System",
    systemNumber: 5,
    purpose: "Monitor workload and prevent overload.",
    description: "Tracks resource utilization across departments. Fires when capacity thresholds signal burnout risk or delivery degradation.",
    triggerCondition: "Resource utilization > 85% OR department backlog growing for 2+ weeks",
    signals: [
      "Resource utilization >85%",
      "Department backlog growth",
    ],
    frameworks: ["toc", "lean", "spanOfControl", "capacityAnalysis"],
    diagnosisMethods: ["Capacity modeling", "Lean workload analysis", "TOC constraint identification"],
    advisoryCategories: ["Resource Reallocation", "Organizational Restructuring"],
    outputModules: ["Departments", "Team", "Dashboard"],
    updateTargets: ["team utilization", "staffing needs", "capacity forecast", "overload index"],
    cadence: "Weekly",
    layer: "Project & Program Management",
  },

  // ── 6. OPERATIONAL BOTTLENECK DETECTION SYSTEM ─────────────────────────────
  {
    id: "operational-bottleneck",
    name: "Operational Bottleneck Detection System",
    systemNumber: 6,
    purpose: "Identify operational constraints slowing execution.",
    description: "The $1B feature: end-to-end bottleneck identification and cascade prevention. Uses TOC Five Focusing Steps to find and resolve system constraints.",
    triggerCondition: "Capacity utilization > 85% OR dependency unresolved > 7 days OR process delay signal detected",
    signals: [
      "Process delays",
      "Queue build-up",
      "Capacity constraint",
      "Dependency bottleneck",
    ],
    frameworks: ["kpiTree", "statisticalProcessControl", "lean", "toc", "ccpm", "criticalPath", "valueStreamMapping"],
    diagnosisMethods: ["Theory of Constraints", "Value Stream Mapping", "Statistical Process Control"],
    advisoryCategories: ["Process Redesign", "Resource Reallocation", "Dependency Restructuring"],
    outputModules: ["Diagnostics", "Action Items", "Departments", "Dashboard"],
    updateTargets: ["bottleneck index", "cascade risk", "throughput score", "constraint node"],
    cadence: "Continuous",
    layer: "Project & Program Management",
  },

  // ── 7. RISK ESCALATION SYSTEM ───────────────────────────────────────────────
  {
    id: "risk-escalation",
    name: "Risk Escalation System",
    systemNumber: 7,
    purpose: "Detect and respond to operational risk.",
    description: "Monitors risk indicators across initiatives, departments, and governance. Activates mitigation protocols when risk scores exceed thresholds.",
    triggerCondition: "Risk score > 7/10 OR initiative volatility signal OR new governance escalation",
    signals: [
      "High risk indicators",
      "Initiative volatility",
    ],
    frameworks: ["riskHeatMap", "iso31000", "erm", "fmea", "bowtie", "scenarioPlanning"],
    diagnosisMethods: ["Risk Heat Map analysis", "ISO 31000 framework", "FMEA severity scoring"],
    advisoryCategories: ["Risk Mitigation"],
    outputModules: ["Dashboard", "Reports", "Initiatives"],
    updateTargets: ["organizational risk score", "critical risks", "risk register", "risk posture"],
    cadence: "Weekly",
    layer: "Project & Program Management",
  },

  // ── 8. INITIATIVE PORTFOLIO OPTIMIZATION SYSTEM ─────────────────────────────
  {
    id: "initiative-portfolio",
    name: "Initiative Portfolio Optimization System",
    systemNumber: 8,
    purpose: "Ensure resources go to the highest-impact initiatives.",
    description: "Evaluates the entire initiative portfolio for strategic value, resource demand, and delivery capacity. Recommends pause, accelerate, or kill decisions.",
    triggerCondition: "Active initiatives > 12 OR any initiative flagged Low ROI OR portfolio strategic alignment score < 60",
    signals: [
      "Too many initiatives active",
      "Low ROI initiatives",
    ],
    frameworks: ["bcgMatrix", "geMcKinseyMatrix", "mosCoW", "weightedDecisionMatrix", "costBenefitAnalysis"],
    diagnosisMethods: ["Portfolio prioritization matrix", "Cost-benefit analysis", "BCG Matrix"],
    advisoryCategories: ["Initiative Reprioritization", "Resource Reallocation"],
    outputModules: ["Initiatives", "Dashboard", "Reports"],
    updateTargets: ["initiative portfolio", "priority rankings", "portfolio health", "WIP count"],
    cadence: "Monthly",
    layer: "Project & Program Management",
  },

  // ── 9. ORGANIZATIONAL HEALTH SCORING SYSTEM ────────────────────────────────
  {
    id: "org-health-monitoring",
    name: "Organizational Health Scoring System",
    systemNumber: 9,
    purpose: "Assess overall operational health.",
    description: "Continuously updates the org health score across all dimensions. Aggregates department maturity scores into organizational composites.",
    triggerCondition: "Any signal detected OR weekly health check OR performance degradation signal",
    signals: [
      "Performance degradation",
      "Strategic misalignment",
    ],
    frameworks: ["bsc", "cmmi", "iso31000", "operationalMaturityModels", "baldrige"],
    diagnosisMethods: ["Balanced Scorecard analysis", "CMMI maturity modeling", "Operational maturity models"],
    advisoryCategories: ["Strategic Realignment", "Process Redesign"],
    outputModules: ["Dashboard", "Diagnostics", "Reports"],
    updateTargets: ["org health score", "strategic risk indicators", "maturity tiers", "CMMI level"],
    cadence: "Weekly",
    layer: "Operations Management",
  },

  // ── 10. PROCESS IMPROVEMENT SYSTEM ─────────────────────────────────────────
  {
    id: "process-improvement",
    name: "Process Improvement System",
    systemNumber: 10,
    purpose: "Continuously improve operations.",
    description: "Monitors process maturity and identifies automation and improvement opportunities. Launches improvement initiatives when recurring inefficiencies detected.",
    triggerCondition: "SOP adherence < 70% OR process bottleneck signal OR recurring inefficiency pattern",
    signals: [
      "Recurring inefficiencies",
      "Process errors",
    ],
    frameworks: ["lean", "sixSigmaDMAIC", "valueStreamMapping", "toc", "pdca", "kaizen"],
    diagnosisMethods: ["Lean waste analysis", "Six Sigma DMAIC", "PDCA cycle review"],
    advisoryCategories: ["Process Redesign", "Structural Remediation"],
    outputModules: ["Action Items", "Departments"],
    updateTargets: ["process maturity", "operational efficiency score", "SOP adherence"],
    cadence: "Weekly",
    layer: "Operations Management",
  },

  // ── 11. STRATEGIC RISK FORECASTING SYSTEM ──────────────────────────────────
  {
    id: "strategic-risk-forecasting",
    name: "Strategic Risk Forecasting System",
    systemNumber: 11,
    purpose: "Predict future operational risks.",
    description: "Uses scenario planning and probabilistic modeling to anticipate risks before they materialize. Provides contingency plans for high-probability scenarios.",
    triggerCondition: "Market change signal detected OR strategic initiative uncertainty score > 60 OR external environment shift",
    signals: [
      "Market changes",
      "Strategic initiative uncertainty",
    ],
    frameworks: ["scenarioPlanning", "monteCarlo", "pestel", "sensitivityAnalysis", "realOptions"],
    diagnosisMethods: ["Scenario planning", "Monte Carlo simulation", "PESTEL analysis"],
    advisoryCategories: ["Risk Mitigation", "Strategic Realignment"],
    outputModules: ["Dashboard", "Reports"],
    updateTargets: ["risk forecast", "scenario library", "strategic risk score"],
    cadence: "Monthly",
    layer: "Operations Management",
  },

  // ── 12. RESOURCE ALLOCATION OPTIMIZATION SYSTEM ────────────────────────────
  {
    id: "resource-allocation",
    name: "Resource Allocation Optimization System",
    systemNumber: 12,
    purpose: "Optimize resource distribution.",
    description: "Analyzes resource imbalances across departments and initiatives. Uses activity-based costing to identify inefficient budget allocations.",
    triggerCondition: "Resource imbalance signal OR budget inefficiency > 15% OR department capacity mismatch",
    signals: [
      "Resource imbalance",
      "Budget inefficiency",
    ],
    frameworks: ["activityBasedCosting", "lean", "toc", "weightedDecisionMatrix", "costBenefitAnalysis"],
    diagnosisMethods: ["Activity-based costing", "Capacity modeling", "Resource network analysis"],
    advisoryCategories: ["Resource Reallocation"],
    outputModules: ["Departments", "Initiatives"],
    updateTargets: ["resource allocation map", "budget efficiency score", "capacity balance"],
    cadence: "Monthly",
    layer: "Operations Management",
  },

  // ── 13. LEADERSHIP BANDWIDTH SYSTEM ────────────────────────────────────────
  {
    id: "leadership-bandwidth",
    name: "Leadership Bandwidth System",
    systemNumber: 13,
    purpose: "Monitor leadership workload and decision bottlenecks.",
    description: "Tracks executive and leadership spans, approval queues, and decision velocity. Flags when leadership is the binding constraint on organizational speed.",
    triggerCondition: "Decision delay > 5 business days OR approval queue > 10 items OR leadership span > 8 direct reports",
    signals: [
      "Decision delays",
      "Excess approvals required",
    ],
    frameworks: ["spanOfControl", "leadershipPipeline", "galbraithStar", "mckinsey7s"],
    diagnosisMethods: ["Span of control analysis", "Leadership pipeline framework", "McKinsey 7S coherence"],
    advisoryCategories: ["Organizational Restructuring", "Execution Acceleration"],
    outputModules: ["Team", "Departments"],
    updateTargets: ["leadership bandwidth score", "decision velocity", "delegation index"],
    cadence: "Weekly",
    layer: "Operations Management",
  },

  // ── 14. CROSS-DEPARTMENT COORDINATION SYSTEM ───────────────────────────────
  {
    id: "cross-dept-coordination",
    name: "Cross-Department Coordination System",
    systemNumber: 14,
    purpose: "Improve collaboration between departments.",
    description: "Monitors cross-department communication health, shared initiative ownership, and conflicting priorities. Surfaces coordination gaps before they become blockers.",
    triggerCondition: "Communication breakdown signal OR conflicting priorities detected across 2+ departments",
    signals: [
      "Communication breakdowns",
      "Conflicting priorities",
    ],
    frameworks: ["organisationalNetworkAnalysis", "systemsThinking", "mckinsey7s"],
    diagnosisMethods: ["Organizational network analysis", "Systems thinking", "Dependency mapping"],
    advisoryCategories: ["Dependency Restructuring", "Organizational Restructuring"],
    outputModules: ["Departments", "Initiatives"],
    updateTargets: ["cross-department alignment score", "coordination health", "shared initiative index"],
    cadence: "Weekly",
    layer: "Operations Management",
  },

  // ── 15. EXECUTION VELOCITY SYSTEM ──────────────────────────────────────────
  {
    id: "execution-velocity",
    name: "Execution Velocity System",
    systemNumber: 15,
    purpose: "Measure organizational speed of execution.",
    description: "Tracks cycle time, throughput, and WIP levels across the organization. Identifies systemic slowdowns and recommends WIP reduction strategies.",
    triggerCondition: "Slow project progress signal OR cycle time increasing > 20% vs. baseline OR WIP > threshold",
    signals: [
      "Slow project progress",
      "WIP accumulation",
    ],
    frameworks: ["lean", "toc", "kpiTree", "statisticalProcessControl"],
    diagnosisMethods: ["Cycle time analysis", "Lean metrics", "Throughput accounting"],
    advisoryCategories: ["Process Redesign", "Execution Acceleration"],
    outputModules: ["Dashboard", "Diagnostics"],
    updateTargets: ["execution velocity score", "cycle time", "WIP count", "throughput rate"],
    cadence: "Weekly",
    layer: "Operations Management",
  },

  // ── 16. STRATEGIC OPPORTUNITY DETECTION SYSTEM ─────────────────────────────
  {
    id: "strategic-opportunity",
    name: "Strategic Opportunity Detection System",
    systemNumber: 16,
    purpose: "Identify new strategic initiatives.",
    description: "Scans for emerging trends, operational gaps, and market opportunities. Surfaces initiative proposals when opportunity signals are detected.",
    triggerCondition: "Emerging trend signal OR operational gap identified OR market opportunity score > 70",
    signals: [
      "Emerging trends",
      "Operational gaps",
    ],
    frameworks: ["blueOcean", "jtbd", "horizonModel", "innovationAmbitionMatrix", "pestel"],
    diagnosisMethods: ["Blue Ocean Strategy analysis", "Jobs-to-Be-Done analysis", "Horizon 1-3 scanning"],
    advisoryCategories: ["Strategic Realignment", "Initiative Reprioritization"],
    outputModules: ["Initiatives", "Advisory"],
    updateTargets: ["opportunity pipeline", "innovation score", "strategic initiative backlog"],
    cadence: "Monthly",
    layer: "Operations Management",
  },

  // ── 17. DECISION SUPPORT SYSTEM ────────────────────────────────────────────
  {
    id: "decision-support",
    name: "Decision Support System",
    systemNumber: 17,
    purpose: "Improve executive decision-making.",
    description: "Provides structured decision frameworks when complex choices are required. Reduces cognitive bias and improves decision quality through systematic analysis.",
    triggerCondition: "Complex decision flagged OR executive briefing requested OR decision backlog growing",
    signals: [
      "Complex decisions required",
    ],
    frameworks: ["decisionTrees", "weightedDecisionMatrix", "sensitivityAnalysis", "monteCarlo", "realOptions"],
    diagnosisMethods: ["Decision trees", "Multi-criteria decision analysis", "Sensitivity analysis"],
    advisoryCategories: ["Strategic Realignment"],
    outputModules: ["Advisory", "Reports"],
    updateTargets: ["decision log", "decision quality score", "advisory recommendation queue"],
    cadence: "On-Trigger",
    layer: "Operations Management",
  },

  // ── 18. INITIATIVE RECOVERY SYSTEM ─────────────────────────────────────────
  {
    id: "initiative-recovery",
    name: "Initiative Recovery System",
    systemNumber: 18,
    purpose: "Recover failing initiatives.",
    description: "Detects initiatives below health thresholds and activates structured recovery protocols. Generates recovery plans with specific actions and owners.",
    triggerCondition: "Initiative health score < 40 OR status = Blocked for > 10 days OR completion rate declining",
    signals: [
      "Initiative health score below threshold",
    ],
    frameworks: ["toc", "ccpm", "criticalPath", "lean", "pdca"],
    diagnosisMethods: ["Root cause analysis", "Critical chain review", "TOC constraint identification"],
    advisoryCategories: ["Execution Acceleration", "Dependency Restructuring", "Resource Reallocation"],
    outputModules: ["Initiatives", "Action Items"],
    updateTargets: ["recovery plan status", "initiative health", "blocked initiative count"],
    cadence: "On-Trigger",
    layer: "Project & Program Management",
  },

  // ── 19. STRATEGIC PLANNING SYSTEM ──────────────────────────────────────────
  {
    id: "strategic-planning",
    name: "Strategic Planning System",
    systemNumber: 19,
    purpose: "Support quarterly and annual planning.",
    description: "Orchestrates the full strategic planning cycle including environmental scanning, initiative proposal, OKR setting, and roadmap creation.",
    triggerCondition: "Planning cycle trigger (quarterly/annual) OR major environmental shift detected",
    signals: [
      "Planning cycle trigger",
    ],
    frameworks: ["swot", "pestel", "bsc", "okr", "hoshinKanri", "strategicChoiceCascade"],
    diagnosisMethods: ["SWOT analysis", "PESTEL analysis", "Strategy frameworks"],
    advisoryCategories: ["Strategic Realignment", "Initiative Reprioritization"],
    outputModules: ["Initiatives", "Dashboard", "Reports"],
    updateTargets: ["strategic roadmap", "OKR cycle", "planning calendar", "strategic priorities"],
    cadence: "Quarterly",
    layer: "Operations Management",
  },

  // ── 20. INNOVATION PIPELINE SYSTEM ─────────────────────────────────────────
  {
    id: "innovation-pipeline",
    name: "Innovation Pipeline System",
    systemNumber: 20,
    purpose: "Manage innovation initiatives.",
    description: "Tracks ideas through the innovation funnel from submission to commercialization. Uses Horizon 1-3 model to balance short-term and long-term innovation investments.",
    triggerCondition: "New idea submission OR market opportunity signal OR Horizon 1 saturation detected",
    signals: [
      "Idea submissions",
      "Market opportunities",
    ],
    frameworks: ["horizonModel", "innovationAmbitionMatrix", "designThinking", "leanStartup", "doubleDiamond"],
    diagnosisMethods: ["Innovation ambition matrix", "Horizon 1-3 model", "Design thinking"],
    advisoryCategories: ["Initiative Reprioritization", "Strategic Realignment"],
    outputModules: ["Initiatives"],
    updateTargets: ["innovation pipeline", "Horizon 1-3 balance", "idea-to-initiative conversion rate"],
    cadence: "Monthly",
    layer: "Operations Management",
  },

  // ── 21. CHANGE MANAGEMENT SYSTEM ───────────────────────────────────────────
  {
    id: "change-management",
    name: "Change Management System",
    systemNumber: 21,
    purpose: "Manage organizational change.",
    description: "Activates change management protocols when structural initiatives are launched. Tracks adoption, resistance, and readiness across affected departments.",
    triggerCondition: "Structural initiative launched OR organization redesign signal OR change adoption rate < 50%",
    signals: [
      "Structural initiative launched",
    ],
    frameworks: ["kotter8Step", "adkar", "lewinChangeModel", "culturalWeb"],
    diagnosisMethods: ["Kotter 8-Step model", "ADKAR framework", "Change readiness assessment"],
    advisoryCategories: ["Organizational Restructuring", "Structural Remediation", "Capability Building"],
    outputModules: ["Departments", "Team"],
    updateTargets: ["change adoption rate", "change readiness score", "structural initiative status"],
    cadence: "On-Trigger",
    layer: "Operations Management",
  },

  // ── 22. PERFORMANCE BENCHMARKING SYSTEM ────────────────────────────────────
  {
    id: "performance-benchmarking",
    name: "Performance Benchmarking System",
    systemNumber: 22,
    purpose: "Compare performance against standards.",
    description: "Benchmarks organizational performance against industry peers, best-practice standards, and internal historical baselines.",
    triggerCondition: "Quarterly performance review cycle OR performance gap > 20% vs. benchmark",
    signals: [
      "Performance review cycles",
    ],
    frameworks: ["benchmarking", "bsc", "apqcPCF", "efqm", "baldrige"],
    diagnosisMethods: ["APQC benchmarks", "Balanced Scorecard", "EFQM Excellence Model"],
    advisoryCategories: ["Strategic Realignment", "Process Redesign"],
    outputModules: ["Reports", "Dashboard"],
    updateTargets: ["benchmark scores", "performance gap index", "industry positioning"],
    cadence: "Quarterly",
    layer: "Operations Management",
  },

  // ── 23. KNOWLEDGE INTELLIGENCE SYSTEM ──────────────────────────────────────
  {
    id: "knowledge-intelligence",
    name: "Knowledge Intelligence System",
    systemNumber: 23,
    purpose: "Expand the Resource Hub knowledge base.",
    description: "Manages the continuous learning layer of the engine. Captures lessons learned, updates framework mappings, and ensures the Resource Hub stays current.",
    triggerCondition: "New frameworks added OR organizational learnings captured OR outcome data available from completed initiatives",
    signals: [
      "New frameworks added",
      "New organizational learnings",
    ],
    frameworks: ["cmmi", "bsc", "operationalMaturityModels"],
    diagnosisMethods: ["Framework mapping", "Lessons learned synthesis", "Knowledge gap analysis"],
    advisoryCategories: ["Capability Building"],
    outputModules: ["Resource Hub"],
    updateTargets: ["resource hub content", "framework library", "lessons learned database"],
    cadence: "Monthly",
    layer: "Operations Management",
  },

  // ── 24. PREDICTIVE ANALYTICS SYSTEM ────────────────────────────────────────
  {
    id: "predictive-analytics",
    name: "Predictive Analytics System",
    systemNumber: 24,
    purpose: "Predict operational outcomes.",
    description: "Uses historical data patterns, regression modeling, and forecasting to predict future organizational performance. Provides forward-looking intelligence for planning.",
    triggerCondition: "Historical data pattern shift detected OR forecast model divergence > 15% from actual",
    signals: [
      "Historical data patterns",
    ],
    frameworks: ["monteCarlo", "statisticalProcessControl", "leadingLagging", "kpiTree"],
    diagnosisMethods: ["Regression modeling", "Predictive forecasting", "Time-series analysis"],
    advisoryCategories: ["Strategic Realignment", "Risk Mitigation"],
    outputModules: ["Dashboard", "Reports"],
    updateTargets: ["predictive models", "forecast accuracy", "leading indicator dashboard"],
    cadence: "Weekly",
    layer: "Operations Management",
  },

  // ── 25. EXECUTIVE INSIGHT SYSTEM ───────────────────────────────────────────
  {
    id: "executive-insight",
    name: "Executive Insight System",
    systemNumber: 25,
    purpose: "Provide concise executive-level insights.",
    description: "Synthesizes outputs from all 24 other systems into executive-ready insight cards. Ensures the CEO/COO receives prioritized, actionable intelligence without information overload.",
    triggerCondition: "High-priority event detected across any system OR daily/weekly executive briefing due",
    signals: [
      "High-priority events",
      "Cross-system synthesis trigger",
    ],
    frameworks: ["bsc", "okr", "riskHeatMap", "kpiTree", "leadingLagging"],
    diagnosisMethods: ["Cross-system synthesis", "Multi-dimensional priority scoring", "Executive briefing logic"],
    advisoryCategories: ["Strategic Realignment", "Risk Mitigation", "Execution Acceleration"],
    outputModules: ["Dashboard", "Advisory"],
    updateTargets: ["executive insight cards", "daily briefing", "executive priority queue"],
    cadence: "Weekly",
    layer: "Operations Management",
  },

  // ── LEGACY SYSTEM DEFINITIONS (backward compatibility) ──────────────────────
  {
    id: "project-delivery",
    name: "Project Delivery System",
    systemNumber: 0,
    purpose: "Track project health, delivery velocity, and retrospective learnings.",
    description: "Tracks project health, delivery velocity, and retrospective learnings.",
    triggerCondition: "Project completion % deviation > 10% from schedule",
    signals: ["Project completion deviation", "Schedule variance"],
    frameworks: ["pmbok", "prince2", "ccpm", "criticalPath", "pert", "wbs"],
    diagnosisMethods: ["PMBOK knowledge areas", "Critical path analysis"],
    advisoryCategories: ["Execution Acceleration", "Resource Reallocation"],
    outputModules: ["Initiatives", "Dashboard", "Reports"],
    updateTargets: ["project health", "delivery velocity", "schedule variance"],
    cadence: "Weekly",
    layer: "Project & Program Management",
  },
  {
    id: "org-structure",
    name: "Organizational Structure System",
    systemNumber: 0,
    purpose: "Maps org design, role clarity, and leadership gaps.",
    description: "Maps org design, role clarity, and leadership gaps.",
    triggerCondition: "Headcount change OR leadership bandwidth signal detected",
    signals: ["Headcount change", "Leadership gap"],
    frameworks: ["galbraithStar", "mckinsey7s", "spanOfControl", "leadershipPipeline"],
    diagnosisMethods: ["Galbraith Star Model", "McKinsey 7S"],
    advisoryCategories: ["Organizational Restructuring"],
    outputModules: ["Departments", "Team", "Reports"],
    updateTargets: ["org structure map", "role clarity score", "leadership gaps"],
    cadence: "Monthly",
    layer: "Operations Management",
  },
  {
    id: "risk-management",
    name: "Risk Management System",
    systemNumber: 0,
    purpose: "Identifies, registers, and mitigates organizational risks.",
    description: "Identifies, registers, and mitigates organizational risks.",
    triggerCondition: "Risk score > 7/10 OR new governance escalation",
    signals: ["Risk score threshold breach"],
    frameworks: ["riskHeatMap", "erm", "iso31000", "fmea", "bowtie", "scenarioPlanning"],
    diagnosisMethods: ["Risk heat map", "ISO 31000"],
    advisoryCategories: ["Risk Mitigation"],
    outputModules: ["Dashboard", "Reports", "Diagnostics"],
    updateTargets: ["organizational risk score", "critical risks", "risk register"],
    cadence: "Weekly",
    layer: "Operations Management",
  },
  {
    id: "resource-capacity",
    name: "Resource & Capacity System",
    systemNumber: 0,
    purpose: "Monitors team utilization and forecasts staffing needs.",
    description: "Monitors team utilization and forecasts staffing needs.",
    triggerCondition: "Team utilization > 85% OR staffing gap detected",
    signals: ["Team utilization > 85%", "Staffing gap"],
    frameworks: ["toc", "lean", "spanOfControl"],
    diagnosisMethods: ["Capacity modeling", "TOC constraint"],
    advisoryCategories: ["Resource Reallocation"],
    outputModules: ["Team", "Departments", "Dashboard"],
    updateTargets: ["team utilization", "staffing needs", "capacity forecast"],
    cadence: "Weekly",
    layer: "Operations Management",
  },
  {
    id: "operational-performance",
    name: "Operational Performance System",
    systemNumber: 0,
    purpose: "KPI collection, dashboard updates, and performance review automation.",
    description: "KPI collection, dashboard updates, and performance review automation.",
    triggerCondition: "KPI variance > threshold OR weekly performance review due",
    signals: ["KPI variance", "Performance review cycle"],
    frameworks: ["kpiTree", "leadingLagging", "bsc", "benchmarking", "operationalMaturityModels"],
    diagnosisMethods: ["KPI tree decomposition", "Leading/lagging indicators"],
    advisoryCategories: ["Process Redesign", "Strategic Realignment"],
    outputModules: ["Dashboard", "Departments", "Reports"],
    updateTargets: ["department performance", "KPI trends", "execution health score"],
    cadence: "Weekly",
    layer: "Operations Management",
  },
];

// ── Engine State (in-memory organizational intelligence) ──────────────────────
export interface EngineState {
  signals: DetectedSignal[];
  diagnoses: DiagnosisResult[];
  recommendations: AdvisoryRecommendation[];
  generatedActions: ActionGenerated[];
  dependencyMap: DependencyMap;
  maturityScores: MaturityScore[];
  orgHealth: OrgHealthScore;
  activeChains: SystemChainId[];
  orgContext: OrgContext | null;
  lastFullRun: string;
}

let _engineState: EngineState | null = null;

/**
 * [Apphia.Logic] runFullEngine
 * Executes the complete Signal → Diagnosis → Advisory → Structural pipeline.
 * This is the master orchestrator for all intelligence layers.
 * Feeds all 25 System Chains.
 */
export function runFullEngine(): EngineState {
  let orgContext: OrgContext | null = null;
  try {
    const profile = loadProfile();
    if (profile.onboardingComplete) {
      orgContext = buildOrgContext(profile);
    }
  } catch { /* neutral defaults if profile unavailable */ }

  // Layer 1: Signal Detection (context-aware thresholds + severity)
  const signals = runSignalDetection(orgContext ?? undefined);

  // Layer 2: Diagnosis
  const diagnoses = runDiagnosis(signals);

  // Layer 3: Advisory (context-aware priority re-ranking)
  const { recommendations, generatedActions } = runAdvisory(diagnoses, signals, orgContext ?? undefined);

  // Layer 4 (parallel): Maturity Scoring (context-aware dimension weights)
  const maturityScores = runMaturityScoring(orgContext ?? undefined);
  const orgHealth = runOrgHealthScoring(maturityScores, orgContext ?? undefined);

  // Layer 5: Dependency Intelligence
  const dependencyMap = runDependencyIntelligence();

  // Determine active chains based on signal types
  const activeChains: SystemChainId[] = [];
  const hasCritical = signals.some(s => s.severity === "Critical");
  const hasCapacity = signals.some(s => s.category === "Capacity Constraint");
  const hasMisalignment = signals.some(s => s.category === "Strategic Misalignment");
  const hasDependency = signals.some(s => s.category === "Dependency Bottleneck");
  const hasRisk = signals.some(s => s.category === "Risk Escalation");
  const hasExecution = signals.some(s => s.category === "Execution Delay");
  const hasPerformance = signals.some(s => s.category === "Performance Anomaly");
  const hasKPI = signals.some(s => s.category === "KPI Underperformance");
  const hasResource = signals.some(s => s.category === "Resource Overload");

  if (hasMisalignment) {
    activeChains.push("strategic-alignment", "strategic-planning");
  }
  if (hasCritical || hasDependency) {
    activeChains.push("operational-bottleneck", "dependency-intelligence", "initiative-recovery");
  }
  if (hasCapacity || hasResource) {
    activeChains.push("org-capacity", "resource-allocation", "leadership-bandwidth");
  }
  if (hasRisk) {
    activeChains.push("risk-escalation", "strategic-risk-forecasting");
  }
  if (hasExecution) {
    activeChains.push("execution-discipline", "execution-velocity", "initiative-health");
  }
  if (hasPerformance || hasKPI) {
    activeChains.push("performance-benchmarking", "predictive-analytics", "process-improvement");
  }

  // Always-running chains
  activeChains.push(
    "org-health-monitoring",
    "executive-insight",
    "knowledge-intelligence",
  );

  _engineState = {
    signals,
    diagnoses,
    recommendations,
    generatedActions,
    dependencyMap,
    maturityScores,
    orgHealth,
    activeChains: [...new Set(activeChains)] as SystemChainId[],
    orgContext,
    lastFullRun: new Date().toISOString(),
  };

  return _engineState;
}

/**
 * Get cached engine state or run if not yet initialized
 */
export function getEngineState(): EngineState {
  if (!_engineState) return runFullEngine();
  return _engineState;
}

/**
 * Run a specific system chain by ID
 */
export function runSystemChain(chainId: SystemChainId): SystemChainResult {
  const def = SYSTEM_CHAIN_DEFINITIONS.find(c => c.id === chainId);
  if (!def) throw new Error(`Unknown chain: ${chainId}`);

  const state = getEngineState();

  // Filter signals relevant to this chain's frameworks
  const relevantSignals = state.signals.filter(s =>
    s.recommendedFrameworks.some(fw => def.frameworks.includes(fw))
  );

  const relevantDiagnoses = state.diagnoses.filter(d =>
    relevantSignals.some(s => s.id === d.signalId)
  );

  const relevantRecs = state.recommendations.filter(r =>
    relevantSignals.some(s => s.id === r.signalId)
  );

  const criticalCount = relevantSignals.filter(s => s.severity === "Critical").length;

  const status: SystemChainResult["status"] =
    criticalCount > 0 ? "Triggered" :
    relevantSignals.length > 3 ? "Warning" :
    relevantSignals.length > 0 ? "Active" : "Healthy";

  return {
    chainId,
    chainName: def.name,
    status,
    signals: relevantSignals,
    diagnoses: relevantDiagnoses,
    recommendations: relevantRecs,
    generatedActions: state.generatedActions.filter(a =>
      relevantRecs.some(r => r.id === a.recommendationId)
    ),
    dependencyMap: (chainId === "operational-bottleneck" || chainId === "dependency-intelligence")
      ? state.dependencyMap : undefined,
    maturityScores: (chainId === "org-health-monitoring" || chainId === "performance-benchmarking")
      ? state.maturityScores : undefined,
    orgHealth: (chainId === "org-health-monitoring" || chainId === "executive-insight")
      ? state.orgHealth : undefined,
    executedAt: new Date().toISOString(),
    signalCount: relevantSignals.length,
    criticalCount,
    updatedModules: def.outputModules,
  };
}

/**
 * Get all 25 primary system chain definitions (excludes legacy aliases)
 */
export function getPrimarySystemChains(): SystemChainDefinition[] {
  return SYSTEM_CHAIN_DEFINITIONS.filter(c => c.systemNumber > 0)
    .sort((a, b) => a.systemNumber - b.systemNumber);
}

/**
 * Get system chains by layer
 */
export function getSystemChainsByLayer(layer: SystemChainDefinition["layer"]): SystemChainDefinition[] {
  return getPrimarySystemChains().filter(c => c.layer === layer);
}

/**
 * Get active system chain status summary
 */
export function getSystemChainStatusSummary(): {
  total: number;
  active: number;
  triggered: number;
  healthy: number;
  warning: number;
} {
  const state = getEngineState();
  const primary = getPrimarySystemChains();

  let triggered = 0, active = 0, healthy = 0, warning = 0;

  for (const chain of primary) {
    const result = runSystemChain(chain.id as SystemChainId);
    if (result.status === "Triggered") triggered++;
    else if (result.status === "Warning") warning++;
    else if (result.status === "Active") active++;
    else healthy++;
  }

  return { total: primary.length, active, triggered, healthy, warning };
}
