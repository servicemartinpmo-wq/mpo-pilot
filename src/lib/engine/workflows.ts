/**
 * WORKFLOW CATALOG ENGINE
 * [Apphia.Logic] — Master library of 100 workflows + 10 system bundles
 * Backend only — no frontend rendering
 *
 * 4-Layer Architecture:
 *  Layer 1: Organizational Data Layer
 *  Layer 2: Signal Detection Layer
 *  Layer 3: Diagnostic Intelligence Layer
 *  Layer 4: Advisory Layer
 */

import type { SystemChainId } from "./systemChains";

export type WorkflowCategory =
  | "Strategic"
  | "Organizational Structure"
  | "Operations"
  | "Project / Initiative"
  | "Decision Support"
  | "Performance Management"
  | "Risk Management"
  | "Process Improvement"
  | "Communication"
  | "Administrative"
  | "HR / Team"
  | "Knowledge & Learning"
  | "Governance"
  | "Organizational Diagnostics"
  | "AI Growth"
  | "Executive Support";

export type WorkflowTrigger =
  | "Manual"
  | "Signal-Triggered"
  | "Scheduled-Weekly"
  | "Scheduled-Monthly"
  | "Scheduled-Quarterly"
  | "Scheduled-Annual"
  | "Event-Triggered";

export type WorkflowOutputModule =
  | "Dashboard"
  | "Initiatives"
  | "Action Items"
  | "Departments"
  | "Team"
  | "Diagnostics"
  | "Tools"
  | "Reports"
  | "Resource Hub"
  | "Advisory"
  | "Integrations"
  | "Systems";

export interface WorkflowDefinition {
  id: number;
  name: string;
  category: WorkflowCategory;
  description: string;
  trigger: WorkflowTrigger;
  frameworks: string[];         // framework IDs from frameworkData
  inputSources: string[];       // data sources consumed
  outputModules: WorkflowOutputModule[];
  systemChains: SystemChainId[];
  estimatedDurationMins: number;
  automationLevel: "Full" | "Semi" | "Manual";
}

export interface WorkflowBundle {
  id: string;
  name: string;
  bundleNumber: number;
  description: string;
  workflowIds: number[];
  systemChains: SystemChainId[];
  outputModules: WorkflowOutputModule[];
  category: "System" | "Department" | "Project" | "Admin & Execution";
  runCadence: string;
}

// ── Master Workflow Library (100 Workflows) ───────────────────────────────────
export const MASTER_WORKFLOW_LIBRARY: WorkflowDefinition[] = [

  // ── STRATEGIC (1–10) ───────────────────────────────────────────────────────
  { id: 1,  name: "Strategy Formulation Workflow",          category: "Strategic", description: "Full strategy development cycle using Porter, Rumelt, BSC, and OKR frameworks.", trigger: "Scheduled-Annual",    frameworks: ["porterFiveForces","bsc","okr","swot","pestel"], inputSources: ["OrgProfile","Departments"], outputModules: ["Initiatives","Reports"], systemChains: ["strategic-alignment","strategic-planning"], estimatedDurationMins: 120, automationLevel: "Semi" },
  { id: 2,  name: "Annual Planning Workflow",               category: "Strategic", description: "End-to-end annual planning including OKR setting, budget allocation, and initiative roadmap.", trigger: "Scheduled-Annual",    frameworks: ["hoshinKanri","bsc","okr"], inputSources: ["OrgProfile","Initiatives","Departments"], outputModules: ["Initiatives","Dashboard","Reports"], systemChains: ["strategic-planning","strategic-alignment"], estimatedDurationMins: 90,  automationLevel: "Semi" },
  { id: 3,  name: "Quarterly Strategy Review",             category: "Strategic", description: "Quarterly check on OKR progress, initiative alignment, and market positioning.", trigger: "Scheduled-Quarterly", frameworks: ["bsc","okr","scenarioPlanning"], inputSources: ["Initiatives","Departments"], outputModules: ["Dashboard","Reports"], systemChains: ["strategic-alignment","performance-benchmarking"], estimatedDurationMins: 60,  automationLevel: "Semi" },
  { id: 4,  name: "Market Positioning Analysis",           category: "Strategic", description: "Porter Five Forces + Blue Ocean analysis to define competitive positioning.", trigger: "Scheduled-Quarterly", frameworks: ["porterFiveForces","blueOcean","pestel"], inputSources: ["ExternalData"], outputModules: ["Advisory","Reports"], systemChains: ["strategic-opportunity"], estimatedDurationMins: 45,  automationLevel: "Manual" },
  { id: 5,  name: "Strategic Initiative Prioritization",   category: "Strategic", description: "Score and rank initiatives using impact/effort matrix and strategic alignment.", trigger: "Signal-Triggered",   frameworks: ["bcgMatrix","mosCoW","weightedDecisionMatrix"], inputSources: ["Initiatives"], outputModules: ["Initiatives","Dashboard"], systemChains: ["initiative-portfolio","strategic-alignment"], estimatedDurationMins: 30,  automationLevel: "Full" },
  { id: 6,  name: "Competitive Analysis Workflow",         category: "Strategic", description: "Systematic competitive landscape review using Porter and VRIO.", trigger: "Scheduled-Quarterly", frameworks: ["porterFiveForces","vrio","swot"], inputSources: ["ExternalData"], outputModules: ["Advisory","Reports"], systemChains: ["strategic-planning"], estimatedDurationMins: 60,  automationLevel: "Manual" },
  { id: 7,  name: "Strategic Alignment Check",             category: "Strategic", description: "Cross-reference all active initiatives against strategic pillars.", trigger: "Scheduled-Weekly",   frameworks: ["bsc","okr","hoshinKanri"], inputSources: ["Initiatives","OrgProfile"], outputModules: ["Dashboard","Reports"], systemChains: ["strategic-alignment"], estimatedDurationMins: 15,  automationLevel: "Full" },
  { id: 8,  name: "Corporate OKR Setup",                   category: "Strategic", description: "Generate org-level OKRs from strategic pillars and cascade to departments.", trigger: "Scheduled-Quarterly", frameworks: ["okr","hoshinKanri","bsc"], inputSources: ["OrgProfile","Departments"], outputModules: ["Initiatives","Reports"], systemChains: ["strategic-alignment","strategic-planning"], estimatedDurationMins: 45,  automationLevel: "Semi" },
  { id: 9,  name: "Initiative Feasibility Analysis",       category: "Strategic", description: "Multi-criteria feasibility scoring before initiative approval.", trigger: "Event-Triggered",    frameworks: ["costBenefitAnalysis","npv","weightedDecisionMatrix"], inputSources: ["Initiatives"], outputModules: ["Advisory","Initiatives"], systemChains: ["initiative-portfolio"], estimatedDurationMins: 30,  automationLevel: "Semi" },
  { id: 10, name: "Strategic Risk Evaluation",             category: "Strategic", description: "Assess strategic-level risks using scenario planning and Monte Carlo.", trigger: "Scheduled-Quarterly", frameworks: ["scenarioPlanning","monteCarlo","riskHeatMap"], inputSources: ["Initiatives","Departments"], outputModules: ["Reports","Dashboard"], systemChains: ["strategic-risk-forecasting","risk-escalation"], estimatedDurationMins: 45,  automationLevel: "Semi" },

  // ── ORGANIZATIONAL STRUCTURE (11–18) ───────────────────────────────────────
  { id: 11, name: "Organizational Structure Design",        category: "Organizational Structure", description: "Galbraith Star + McKinsey 7S org design analysis.", trigger: "Event-Triggered",    frameworks: ["galbraithStar","mckinsey7s"], inputSources: ["Departments","Team"], outputModules: ["Departments","Reports"], systemChains: ["org-structure"], estimatedDurationMins: 90,  automationLevel: "Semi" },
  { id: 12, name: "Role Definition Workflow",              category: "Organizational Structure", description: "Define role boundaries, MOCHA assignments, and decision rights.", trigger: "Event-Triggered",    frameworks: ["galbraithStar","spanOfControl"], inputSources: ["Team","Departments"], outputModules: ["Team","Departments"], systemChains: ["org-structure","leadership-bandwidth"], estimatedDurationMins: 45,  automationLevel: "Semi" },
  { id: 13, name: "Decision Authority Mapping",            category: "Organizational Structure", description: "Create authority matrix with tiered decision rights.", trigger: "Event-Triggered",    frameworks: ["spanOfControl","galbraithStar"], inputSources: ["Team"], outputModules: ["Departments","Reports"], systemChains: ["leadership-bandwidth"], estimatedDurationMins: 30,  automationLevel: "Semi" },
  { id: 14, name: "Department Capability Mapping",         category: "Organizational Structure", description: "Map current vs. required capabilities by department.", trigger: "Scheduled-Quarterly", frameworks: ["galbraithStar","cmmi"], inputSources: ["Departments"], outputModules: ["Departments","Reports"], systemChains: ["org-structure"], estimatedDurationMins: 60,  automationLevel: "Semi" },
  { id: 15, name: "Leadership Structure Analysis",         category: "Organizational Structure", description: "Review leadership layers, spans, and effectiveness.", trigger: "Scheduled-Quarterly", frameworks: ["spanOfControl","leadershipPipeline","mckinsey7s"], inputSources: ["Team","Departments"], outputModules: ["Team","Reports"], systemChains: ["leadership-bandwidth"], estimatedDurationMins: 45,  automationLevel: "Semi" },
  { id: 16, name: "Span of Control Analysis",             category: "Organizational Structure", description: "Calculate and optimize manager-to-report ratios.", trigger: "Signal-Triggered",   frameworks: ["spanOfControl"], inputSources: ["Team","Departments"], outputModules: ["Departments","Reports"], systemChains: ["leadership-bandwidth"], estimatedDurationMins: 20,  automationLevel: "Full" },
  { id: 17, name: "Organizational Maturity Assessment",   category: "Organizational Structure", description: "CMMI-based five-level maturity assessment across all departments.", trigger: "Scheduled-Quarterly", frameworks: ["cmmi","bsc","operationalMaturityModels"], inputSources: ["Departments"], outputModules: ["Dashboard","Reports"], systemChains: ["org-health-monitoring"], estimatedDurationMins: 60,  automationLevel: "Full" },
  { id: 18, name: "Cross-Department Dependency Mapping",  category: "Organizational Structure", description: "Map all cross-department initiative dependencies and risks.", trigger: "Scheduled-Weekly",   frameworks: ["criticalPath","pert","raidLog"], inputSources: ["Initiatives","Departments"], outputModules: ["Dashboard","Initiatives"], systemChains: ["dependency-intelligence"], estimatedDurationMins: 20,  automationLevel: "Full" },

  // ── OPERATIONS (19–26) ─────────────────────────────────────────────────────
  { id: 19, name: "Operational Health Assessment",         category: "Operations", description: "Comprehensive operational health scoring across all departments.", trigger: "Scheduled-Weekly",   frameworks: ["lean","toc","bsc","operationalMaturityModels"], inputSources: ["Departments"], outputModules: ["Dashboard","Reports"], systemChains: ["org-health-monitoring"], estimatedDurationMins: 15,  automationLevel: "Full" },
  { id: 20, name: "Capacity Analysis Workflow",            category: "Operations", description: "Analyze team capacity utilization and forecast overload risks.", trigger: "Scheduled-Weekly",   frameworks: ["toc","lean","statisticalProcessControl"], inputSources: ["Departments","Team"], outputModules: ["Dashboard","Departments"], systemChains: ["org-capacity"], estimatedDurationMins: 10,  automationLevel: "Full" },
  { id: 21, name: "Process Bottleneck Detection",          category: "Operations", description: "TOC Five Focusing Steps to find and rank organizational constraints.", trigger: "Signal-Triggered",   frameworks: ["toc","lean","valueStreamMapping"], inputSources: ["Departments","Initiatives"], outputModules: ["Diagnostics","Action Items"], systemChains: ["operational-bottleneck"], estimatedDurationMins: 20,  automationLevel: "Full" },
  { id: 22, name: "Resource Allocation Optimization",      category: "Operations", description: "Optimize distribution of people, budget, and time across priorities.", trigger: "Signal-Triggered",   frameworks: ["toc","activityBasedCosting","weightedDecisionMatrix"], inputSources: ["Departments","Initiatives"], outputModules: ["Departments","Initiatives"], systemChains: ["resource-allocation"], estimatedDurationMins: 30,  automationLevel: "Semi" },
  { id: 23, name: "Operations Performance Analysis",       category: "Operations", description: "KPI-driven performance analysis across all operational departments.", trigger: "Scheduled-Weekly",   frameworks: ["kpiTree","leadingLagging","bsc"], inputSources: ["Departments"], outputModules: ["Dashboard","Reports"], systemChains: ["operational-performance"], estimatedDurationMins: 15,  automationLevel: "Full" },
  { id: 24, name: "Workflow Efficiency Analysis",          category: "Operations", description: "Analyze workflow steps for waste, redundancy, and automation opportunities.", trigger: "Signal-Triggered",   frameworks: ["lean","valueStreamMapping","sipoc"], inputSources: ["Departments"], outputModules: ["Departments","Action Items"], systemChains: ["process-improvement"], estimatedDurationMins: 30,  automationLevel: "Semi" },
  { id: 25, name: "Operating Model Review",                category: "Operations", description: "Annual operating model assessment against strategic requirements.", trigger: "Scheduled-Annual",    frameworks: ["galbraithStar","mckinsey7s","bpr"], inputSources: ["Departments","OrgProfile"], outputModules: ["Departments","Reports"], systemChains: ["org-structure"], estimatedDurationMins: 90,  automationLevel: "Semi" },
  { id: 26, name: "Service Delivery Evaluation",          category: "Operations", description: "Evaluate service delivery quality and SLA compliance.", trigger: "Scheduled-Monthly",  frameworks: ["tqm","bsc","statisticalProcessControl"], inputSources: ["Departments"], outputModules: ["Reports","Dashboard"], systemChains: ["performance-benchmarking"], estimatedDurationMins: 30,  automationLevel: "Semi" },

  // ── PROJECT / INITIATIVE (27–38) ───────────────────────────────────────────
  { id: 27, name: "Project Intake Workflow",               category: "Project / Initiative", description: "Structured intake process for new initiatives including feasibility gate.", trigger: "Event-Triggered",    frameworks: ["stageGate","mosCoW","pmbok"], inputSources: ["Initiatives"], outputModules: ["Initiatives","Action Items"], systemChains: ["initiative-portfolio"], estimatedDurationMins: 20,  automationLevel: "Semi" },
  { id: 28, name: "Project Prioritization Workflow",       category: "Project / Initiative", description: "Score and rank all active initiatives using strategic alignment and capacity.", trigger: "Scheduled-Weekly",   frameworks: ["bcgMatrix","mosCoW","weightedDecisionMatrix"], inputSources: ["Initiatives"], outputModules: ["Initiatives","Dashboard"], systemChains: ["initiative-portfolio"], estimatedDurationMins: 15,  automationLevel: "Full" },
  { id: 29, name: "Project Kickoff Automation",            category: "Project / Initiative", description: "Auto-generate kickoff checklist, RACI, and initial action items.", trigger: "Event-Triggered",    frameworks: ["pmbok","wbs"], inputSources: ["Initiatives"], outputModules: ["Action Items","Initiatives"], systemChains: ["initiative-health"], estimatedDurationMins: 10,  automationLevel: "Full" },
  { id: 30, name: "Project Plan Generation",               category: "Project / Initiative", description: "Generate WBS, timeline, and resource plan from initiative scope.", trigger: "Event-Triggered",    frameworks: ["wbs","criticalPath","pmbok"], inputSources: ["Initiatives"], outputModules: ["Initiatives","Dashboard"], systemChains: ["initiative-health"], estimatedDurationMins: 20,  automationLevel: "Semi" },
  { id: 31, name: "Milestone Definition Workflow",         category: "Project / Initiative", description: "Define and validate initiative milestones with owners and dates.", trigger: "Event-Triggered",    frameworks: ["pmbok","criticalPath"], inputSources: ["Initiatives"], outputModules: ["Initiatives","Dashboard"], systemChains: ["initiative-health"], estimatedDurationMins: 15,  automationLevel: "Semi" },
  { id: 32, name: "Risk Register Generation",              category: "Project / Initiative", description: "Auto-generate RAID log and risk register from initiative data.", trigger: "Event-Triggered",    frameworks: ["raidLog","riskHeatMap","fmea"], inputSources: ["Initiatives"], outputModules: ["Initiatives","Reports"], systemChains: ["risk-escalation"], estimatedDurationMins: 15,  automationLevel: "Full" },
  { id: 33, name: "Issue Tracking Workflow",               category: "Project / Initiative", description: "Log, triage, and escalate initiative issues through structured workflow.", trigger: "Signal-Triggered",   frameworks: ["raidLog","pmbok"], inputSources: ["Initiatives","Action Items"], outputModules: ["Action Items","Initiatives"], systemChains: ["execution-discipline"], estimatedDurationMins: 10,  automationLevel: "Full" },
  { id: 34, name: "Status Reporting Automation",           category: "Project / Initiative", description: "Auto-generate weekly initiative status reports for stakeholders.", trigger: "Scheduled-Weekly",   frameworks: ["pmbok","bsc"], inputSources: ["Initiatives","Action Items"], outputModules: ["Reports","Dashboard"], systemChains: ["initiative-health"], estimatedDurationMins: 5,   automationLevel: "Full" },
  { id: 35, name: "Initiative Health Diagnostics",         category: "Project / Initiative", description: "Full diagnostic on initiative health using critical path and buffer analysis.", trigger: "Scheduled-Weekly",   frameworks: ["criticalPath","ccpm","pert"], inputSources: ["Initiatives"], outputModules: ["Diagnostics","Dashboard"], systemChains: ["initiative-health"], estimatedDurationMins: 10,  automationLevel: "Full" },
  { id: 36, name: "Portfolio Prioritization Workflow",     category: "Project / Initiative", description: "Rank and rebalance full initiative portfolio using GE McKinsey matrix.", trigger: "Scheduled-Monthly",  frameworks: ["geMcKinseyMatrix","bcgMatrix"], inputSources: ["Initiatives"], outputModules: ["Initiatives","Reports"], systemChains: ["initiative-portfolio"], estimatedDurationMins: 20,  automationLevel: "Full" },
  { id: 37, name: "Program Coordination Workflow",         category: "Project / Initiative", description: "Coordinate cross-initiative dependencies and shared resources.", trigger: "Scheduled-Weekly",   frameworks: ["criticalPath","ccpm","raidLog"], inputSources: ["Initiatives","Departments"], outputModules: ["Initiatives","Dashboard"], systemChains: ["dependency-intelligence"], estimatedDurationMins: 15,  automationLevel: "Semi" },
  { id: 38, name: "Initiative Closure Review",             category: "Project / Initiative", description: "Structured closure review: lessons learned, value delivered, handoff.", trigger: "Event-Triggered",    frameworks: ["pmbok"], inputSources: ["Initiatives","Action Items"], outputModules: ["Reports","Resource Hub"], systemChains: ["knowledge-intelligence"], estimatedDurationMins: 30,  automationLevel: "Semi" },

  // ── DECISION SUPPORT (39–44) ───────────────────────────────────────────────
  { id: 39, name: "Decision Framework Analysis",           category: "Decision Support", description: "Select and apply the right decision framework for a given choice.", trigger: "Manual",             frameworks: ["decisionTrees","weightedDecisionMatrix"], inputSources: ["Advisory"], outputModules: ["Advisory","Reports"], systemChains: ["decision-support"], estimatedDurationMins: 30,  automationLevel: "Semi" },
  { id: 40, name: "Decision Impact Analysis",              category: "Decision Support", description: "Model downstream impact of a decision across systems.", trigger: "Manual",             frameworks: ["sensitivityAnalysis","monteCarlo"], inputSources: ["Initiatives","Departments"], outputModules: ["Advisory","Reports"], systemChains: ["decision-support"], estimatedDurationMins: 45,  automationLevel: "Semi" },
  { id: 41, name: "Executive Briefing Generation",         category: "Decision Support", description: "Generate concise executive briefing from engine state.", trigger: "Scheduled-Weekly",   frameworks: ["bsc","kpiTree","riskHeatMap"], inputSources: ["Dashboard"], outputModules: ["Reports","Advisory"], systemChains: ["executive-insight"], estimatedDurationMins: 5,   automationLevel: "Full" },
  { id: 42, name: "Tradeoff Analysis Workflow",            category: "Decision Support", description: "Multi-criteria tradeoff analysis for resource or priority decisions.", trigger: "Manual",             frameworks: ["weightedDecisionMatrix","sensitivityAnalysis"], inputSources: ["Initiatives"], outputModules: ["Advisory"], systemChains: ["decision-support"], estimatedDurationMins: 30,  automationLevel: "Semi" },
  { id: 43, name: "Scenario Modeling Workflow",            category: "Decision Support", description: "Build and compare three strategic scenarios using Monte Carlo.", trigger: "Manual",             frameworks: ["scenarioPlanning","monteCarlo"], inputSources: ["Initiatives","Departments"], outputModules: ["Reports","Advisory"], systemChains: ["strategic-risk-forecasting"], estimatedDurationMins: 60,  automationLevel: "Semi" },
  { id: 44, name: "Strategic Option Evaluation",           category: "Decision Support", description: "Evaluate competing strategic options with NPV, IRR, and Real Options.", trigger: "Manual",             frameworks: ["npv","irr","realOptions","costBenefitAnalysis"], inputSources: ["Initiatives"], outputModules: ["Advisory","Initiatives"], systemChains: ["decision-support","initiative-portfolio"], estimatedDurationMins: 60,  automationLevel: "Semi" },

  // ── PERFORMANCE MANAGEMENT (45–50) ────────────────────────────────────────
  { id: 45, name: "KPI Design Workflow",                   category: "Performance Management", description: "Design KPI trees from strategic objectives down to team metrics.", trigger: "Scheduled-Quarterly", frameworks: ["kpiTree","leadingLagging","bsc"], inputSources: ["Departments","OrgProfile"], outputModules: ["Dashboard","Reports"], systemChains: ["performance-benchmarking"], estimatedDurationMins: 45,  automationLevel: "Semi" },
  { id: 46, name: "Performance Dashboard Generation",      category: "Performance Management", description: "Auto-generate performance dashboard tiles from latest KPI data.", trigger: "Scheduled-Weekly",   frameworks: ["bsc","kpiTree"], inputSources: ["Departments"], outputModules: ["Dashboard"], systemChains: ["performance-benchmarking"], estimatedDurationMins: 5,   automationLevel: "Full" },
  { id: 47, name: "Balanced Scorecard Generation",         category: "Performance Management", description: "Generate four-perspective BSC scorecard for the organization.", trigger: "Scheduled-Quarterly", frameworks: ["bsc"], inputSources: ["Departments","Initiatives"], outputModules: ["Reports","Dashboard"], systemChains: ["strategic-alignment"], estimatedDurationMins: 30,  automationLevel: "Full" },
  { id: 48, name: "Performance Variance Analysis",         category: "Performance Management", description: "Identify and explain performance variances using statistical methods.", trigger: "Signal-Triggered",   frameworks: ["statisticalProcessControl","sixSigmaDMAIC","bsc"], inputSources: ["Departments"], outputModules: ["Reports","Diagnostics"], systemChains: ["performance-benchmarking"], estimatedDurationMins: 20,  automationLevel: "Full" },
  { id: 49, name: "Department Performance Review",         category: "Performance Management", description: "Structured department performance review with maturity scoring.", trigger: "Scheduled-Monthly",  frameworks: ["bsc","cmmi","operationalMaturityModels"], inputSources: ["Departments"], outputModules: ["Reports","Departments"], systemChains: ["org-health-monitoring"], estimatedDurationMins: 30,  automationLevel: "Full" },
  { id: 50, name: "Executive Performance Summary",         category: "Performance Management", description: "One-page executive summary of organizational performance.", trigger: "Scheduled-Weekly",   frameworks: ["bsc","kpiTree","leadingLagging"], inputSources: ["Dashboard"], outputModules: ["Reports"], systemChains: ["executive-insight"], estimatedDurationMins: 5,   automationLevel: "Full" },

  // ── RISK MANAGEMENT (51–55) ────────────────────────────────────────────────
  { id: 51, name: "Risk Identification Workflow",          category: "Risk Management", description: "Systematic risk identification across all active initiatives.", trigger: "Scheduled-Weekly",   frameworks: ["riskHeatMap","erm","raidLog"], inputSources: ["Initiatives","Departments"], outputModules: ["Reports","Dashboard"], systemChains: ["risk-escalation"], estimatedDurationMins: 20,  automationLevel: "Full" },
  { id: 52, name: "Risk Classification Workflow",          category: "Risk Management", description: "Classify and score identified risks using ISO 31000.", trigger: "Signal-Triggered",   frameworks: ["iso31000","riskHeatMap","fmea"], inputSources: ["Initiatives"], outputModules: ["Reports"], systemChains: ["risk-escalation"], estimatedDurationMins: 15,  automationLevel: "Full" },
  { id: 53, name: "Risk Mitigation Planning",              category: "Risk Management", description: "Generate mitigation plans for high-severity risks.", trigger: "Signal-Triggered",   frameworks: ["iso31000","erm","bowtie"], inputSources: ["Initiatives"], outputModules: ["Action Items","Reports"], systemChains: ["risk-escalation","strategic-risk-forecasting"], estimatedDurationMins: 30,  automationLevel: "Semi" },
  { id: 54, name: "Crisis Escalation Workflow",            category: "Risk Management", description: "Activate crisis response protocol for critical risk events.", trigger: "Signal-Triggered",   frameworks: ["erm","iso31000"], inputSources: ["Initiatives","Departments"], outputModules: ["Action Items","Dashboard"], systemChains: ["risk-escalation"], estimatedDurationMins: 10,  automationLevel: "Full" },
  { id: 55, name: "Dependency Risk Detection",             category: "Risk Management", description: "Scan initiative dependencies for cascade failure risks.", trigger: "Scheduled-Weekly",   frameworks: ["criticalPath","ccpm","pert","raidLog"], inputSources: ["Initiatives"], outputModules: ["Dashboard","Initiatives"], systemChains: ["dependency-intelligence"], estimatedDurationMins: 10,  automationLevel: "Full" },

  // ── PROCESS IMPROVEMENT (56–62) ───────────────────────────────────────────
  { id: 56, name: "Process Mapping Workflow",              category: "Process Improvement", description: "Create SIPOC and value stream maps for target processes.", trigger: "Manual",             frameworks: ["sipoc","valueStreamMapping","lean"], inputSources: ["Departments"], outputModules: ["Departments","Tools"], systemChains: ["process-improvement"], estimatedDurationMins: 60,  automationLevel: "Semi" },
  { id: 57, name: "Root Cause Analysis",                   category: "Process Improvement", description: "Six Sigma DMAIC root cause analysis for recurring problems.", trigger: "Signal-Triggered",   frameworks: ["sixSigmaDMAIC","fmea","toc"], inputSources: ["Departments","Action Items"], outputModules: ["Diagnostics","Action Items"], systemChains: ["process-improvement"], estimatedDurationMins: 30,  automationLevel: "Semi" },
  { id: 58, name: "Continuous Improvement Workflow",       category: "Process Improvement", description: "PDCA cycle execution for ongoing operational improvements.", trigger: "Scheduled-Weekly",   frameworks: ["pdca","kaizen"], inputSources: ["Departments"], outputModules: ["Action Items"], systemChains: ["process-improvement"], estimatedDurationMins: 15,  automationLevel: "Full" },
  { id: 59, name: "Waste Detection Workflow",              category: "Process Improvement", description: "Identify the eight forms of Lean waste across departments.", trigger: "Signal-Triggered",   frameworks: ["lean","valueStreamMapping"], inputSources: ["Departments"], outputModules: ["Departments","Action Items"], systemChains: ["operational-bottleneck","process-improvement"], estimatedDurationMins: 20,  automationLevel: "Full" },
  { id: 60, name: "Lean Process Redesign",                 category: "Process Improvement", description: "Redesign processes using Lean principles to eliminate waste.", trigger: "Signal-Triggered",   frameworks: ["lean","valueStreamMapping","bpr"], inputSources: ["Departments"], outputModules: ["Departments","Action Items"], systemChains: ["process-improvement"], estimatedDurationMins: 60,  automationLevel: "Semi" },
  { id: 61, name: "Six Sigma Variance Analysis",           category: "Process Improvement", description: "Statistical analysis of process variation and defect rates.", trigger: "Signal-Triggered",   frameworks: ["sixSigmaDMAIC","statisticalProcessControl","controlCharts"], inputSources: ["Departments"], outputModules: ["Reports","Diagnostics"], systemChains: ["process-improvement"], estimatedDurationMins: 30,  automationLevel: "Semi" },
  { id: 62, name: "Automation Opportunity Detection",      category: "Process Improvement", description: "Identify manual processes suitable for automation.", trigger: "Scheduled-Monthly",  frameworks: ["lean","valueStreamMapping"], inputSources: ["Departments"], outputModules: ["Action Items","Reports"], systemChains: ["process-improvement"], estimatedDurationMins: 20,  automationLevel: "Full" },

  // ── COMMUNICATION (63–68) ─────────────────────────────────────────────────
  { id: 63, name: "Executive Weekly Briefing",             category: "Communication", description: "Auto-generate executive weekly briefing from engine outputs.", trigger: "Scheduled-Weekly",   frameworks: ["bsc","kpiTree","riskHeatMap"], inputSources: ["Dashboard"], outputModules: ["Reports","Advisory"], systemChains: ["executive-insight"], estimatedDurationMins: 5,   automationLevel: "Full" },
  { id: 64, name: "Meeting Preparation Workflow",          category: "Communication", description: "Generate pre-read, agenda, and decision questions for meetings.", trigger: "Event-Triggered",    frameworks: ["pmbok"], inputSources: ["Initiatives","Action Items"], outputModules: ["Reports"], systemChains: ["decision-support"], estimatedDurationMins: 10,  automationLevel: "Full" },
  { id: 65, name: "Meeting Summary Generation",            category: "Communication", description: "Structure and distribute meeting outcomes, decisions, and actions.", trigger: "Event-Triggered",    frameworks: ["pmbok"], inputSources: ["Action Items"], outputModules: ["Action Items","Reports"], systemChains: ["execution-discipline"], estimatedDurationMins: 10,  automationLevel: "Full" },
  { id: 66, name: "Decision Documentation Workflow",       category: "Communication", description: "Document and circulate formal decision records.", trigger: "Event-Triggered",    frameworks: ["pmbok"], inputSources: ["Advisory"], outputModules: ["Reports","Resource Hub"], systemChains: ["knowledge-intelligence"], estimatedDurationMins: 10,  automationLevel: "Full" },
  { id: 67, name: "Stakeholder Communication Planning",    category: "Communication", description: "Design stakeholder engagement plan for initiatives.", trigger: "Event-Triggered",    frameworks: ["pmbok"], inputSources: ["Initiatives"], outputModules: ["Initiatives","Reports"], systemChains: ["initiative-health"], estimatedDurationMins: 20,  automationLevel: "Semi" },
  { id: 68, name: "Organizational Announcement Planning",  category: "Communication", description: "Plan and stage major organizational announcements.", trigger: "Event-Triggered",    frameworks: ["kotter8Step"], inputSources: ["Departments"], outputModules: ["Departments"], systemChains: ["change-management"], estimatedDurationMins: 15,  automationLevel: "Semi" },

  // ── ADMINISTRATIVE (69–73) ────────────────────────────────────────────────
  { id: 69, name: "Calendar Prioritization Workflow",      category: "Administrative", description: "Analyze and prioritize executive calendar against strategic priorities.", trigger: "Scheduled-Weekly",   frameworks: ["bsc","okr"], inputSources: ["Team"], outputModules: ["Dashboard"], systemChains: ["leadership-bandwidth"], estimatedDurationMins: 10,  automationLevel: "Full" },
  { id: 70, name: "Task Prioritization Workflow",          category: "Administrative", description: "Score and rank all open tasks by urgency and strategic impact.", trigger: "Scheduled-Weekly",   frameworks: ["mosCoW","weightedDecisionMatrix"], inputSources: ["Action Items"], outputModules: ["Action Items","Dashboard"], systemChains: ["execution-discipline"], estimatedDurationMins: 5,   automationLevel: "Full" },
  { id: 71, name: "Executive Task Review",                 category: "Administrative", description: "Weekly review of executive-level tasks and decisions outstanding.", trigger: "Scheduled-Weekly",   frameworks: ["pmbok"], inputSources: ["Action Items"], outputModules: ["Action Items","Dashboard"], systemChains: ["execution-discipline"], estimatedDurationMins: 10,  automationLevel: "Full" },
  { id: 72, name: "Administrative Backlog Cleanup",        category: "Administrative", description: "Identify and resolve overdue administrative tasks and approvals.", trigger: "Scheduled-Weekly",   frameworks: ["lean","pdca"], inputSources: ["Action Items"], outputModules: ["Action Items"], systemChains: ["execution-discipline"], estimatedDurationMins: 10,  automationLevel: "Full" },
  { id: 73, name: "Executive Delegation Suggestions",      category: "Administrative", description: "Suggest delegation opportunities to free executive bandwidth.", trigger: "Signal-Triggered",   frameworks: ["spanOfControl","leadershipPipeline"], inputSources: ["Team","Action Items"], outputModules: ["Team","Advisory"], systemChains: ["leadership-bandwidth"], estimatedDurationMins: 10,  automationLevel: "Full" },

  // ── HR / TEAM (74–78) ─────────────────────────────────────────────────────
  { id: 74, name: "Team Capacity Assessment",              category: "HR / Team", description: "Full team capacity analysis with utilization and overload signals.", trigger: "Scheduled-Weekly",   frameworks: ["toc","lean","spanOfControl"], inputSources: ["Team","Departments"], outputModules: ["Team","Departments"], systemChains: ["org-capacity"], estimatedDurationMins: 10,  automationLevel: "Full" },
  { id: 75, name: "Skill Gap Analysis",                    category: "HR / Team", description: "Map current team capabilities against strategic requirements.", trigger: "Scheduled-Quarterly", frameworks: ["galbraithStar","cmmi","leadershipPipeline"], inputSources: ["Team","Departments"], outputModules: ["Team","Reports"], systemChains: ["org-structure"], estimatedDurationMins: 30,  automationLevel: "Semi" },
  { id: 76, name: "Workforce Planning Workflow",           category: "HR / Team", description: "Forward-looking headcount and capability planning.", trigger: "Scheduled-Quarterly", frameworks: ["galbraithStar","spanOfControl"], inputSources: ["Departments","Initiatives"], outputModules: ["Team","Reports"], systemChains: ["resource-allocation"], estimatedDurationMins: 45,  automationLevel: "Semi" },
  { id: 77, name: "Role Redundancy Detection",             category: "HR / Team", description: "Identify duplicated or unclear roles in the organization.", trigger: "Signal-Triggered",   frameworks: ["galbraithStar","spanOfControl"], inputSources: ["Team","Departments"], outputModules: ["Departments","Reports"], systemChains: ["org-structure"], estimatedDurationMins: 20,  automationLevel: "Full" },
  { id: 78, name: "Hiring Prioritization Workflow",        category: "HR / Team", description: "Rank and justify open roles by strategic impact.", trigger: "Signal-Triggered",   frameworks: ["toc","weightedDecisionMatrix"], inputSources: ["Departments","Initiatives"], outputModules: ["Team","Advisory"], systemChains: ["resource-allocation"], estimatedDurationMins: 20,  automationLevel: "Semi" },

  // ── KNOWLEDGE & LEARNING (79–83) ──────────────────────────────────────────
  { id: 79, name: "Knowledge Base Update Workflow",        category: "Knowledge & Learning", description: "Capture and structure new knowledge into the Resource Hub.", trigger: "Event-Triggered",    frameworks: ["cmmi"], inputSources: ["Resource Hub","Reports"], outputModules: ["Resource Hub"], systemChains: ["knowledge-intelligence"], estimatedDurationMins: 15,  automationLevel: "Semi" },
  { id: 80, name: "Lessons Learned Capture",               category: "Knowledge & Learning", description: "Structured post-initiative lessons capture and synthesis.", trigger: "Event-Triggered",    frameworks: ["pmbok","pdca"], inputSources: ["Initiatives"], outputModules: ["Resource Hub","Reports"], systemChains: ["knowledge-intelligence"], estimatedDurationMins: 30,  automationLevel: "Semi" },
  { id: 81, name: "Best Practice Recommendation Engine",   category: "Knowledge & Learning", description: "Surface relevant best practices from the knowledge base.", trigger: "Signal-Triggered",   frameworks: ["bsc","cmmi"], inputSources: ["Resource Hub"], outputModules: ["Advisory","Resource Hub"], systemChains: ["knowledge-intelligence"], estimatedDurationMins: 5,   automationLevel: "Full" },
  { id: 82, name: "Operational Playbook Creation",         category: "Knowledge & Learning", description: "Generate department-specific operational playbooks.", trigger: "Event-Triggered",    frameworks: ["pmbok","lean"], inputSources: ["Departments","Resource Hub"], outputModules: ["Resource Hub","Departments"], systemChains: ["knowledge-intelligence"], estimatedDurationMins: 60,  automationLevel: "Semi" },
  { id: 83, name: "Policy Generation Workflow",            category: "Knowledge & Learning", description: "Draft policy documents from governance decisions.", trigger: "Event-Triggered",    frameworks: ["iso31000","pmbok"], inputSources: ["Departments"], outputModules: ["Resource Hub","Reports"], systemChains: ["knowledge-intelligence"], estimatedDurationMins: 45,  automationLevel: "Semi" },

  // ── GOVERNANCE (84–87) ────────────────────────────────────────────────────
  { id: 84, name: "Governance Structure Design",           category: "Governance", description: "Design governance committees, charters, and escalation paths.", trigger: "Event-Triggered",    frameworks: ["iso31000","erm","galbraithStar"], inputSources: ["Departments","OrgProfile"], outputModules: ["Departments","Reports"], systemChains: ["risk-escalation"], estimatedDurationMins: 90,  automationLevel: "Semi" },
  { id: 85, name: "Board Reporting Workflow",              category: "Governance", description: "Generate board-ready reporting pack from engine outputs.", trigger: "Scheduled-Monthly",  frameworks: ["bsc","erm","pmbok"], inputSources: ["Dashboard"], outputModules: ["Reports"], systemChains: ["executive-insight"], estimatedDurationMins: 20,  automationLevel: "Full" },
  { id: 86, name: "Compliance Tracking Workflow",          category: "Governance", description: "Monitor and report on compliance obligations.", trigger: "Scheduled-Monthly",  frameworks: ["iso31000","erm"], inputSources: ["Departments"], outputModules: ["Reports","Dashboard"], systemChains: ["risk-escalation"], estimatedDurationMins: 20,  automationLevel: "Full" },
  { id: 87, name: "Policy Review Workflow",                category: "Governance", description: "Systematic review and update cycle for organizational policies.", trigger: "Scheduled-Annual",    frameworks: ["iso31000"], inputSources: ["Resource Hub"], outputModules: ["Resource Hub","Reports"], systemChains: ["knowledge-intelligence"], estimatedDurationMins: 30,  automationLevel: "Semi" },

  // ── ORGANIZATIONAL DIAGNOSTICS (88–92) ────────────────────────────────────
  { id: 88, name: "Organizational Health Diagnostic",      category: "Organizational Diagnostics", description: "Full organizational health assessment across all dimensions.", trigger: "Scheduled-Weekly",   frameworks: ["bsc","cmmi","operationalMaturityModels","baldrige"], inputSources: ["Departments","Initiatives"], outputModules: ["Dashboard","Diagnostics","Reports"], systemChains: ["org-health-monitoring"], estimatedDurationMins: 10,  automationLevel: "Full" },
  { id: 89, name: "Strategic Execution Diagnostic",        category: "Organizational Diagnostics", description: "Diagnose gaps between strategy and execution.", trigger: "Scheduled-Monthly",  frameworks: ["bsc","okr","hoshinKanri"], inputSources: ["Initiatives","Departments"], outputModules: ["Diagnostics","Advisory"], systemChains: ["strategic-alignment"], estimatedDurationMins: 20,  automationLevel: "Full" },
  { id: 90, name: "Leadership Alignment Diagnostic",       category: "Organizational Diagnostics", description: "Assess alignment of leadership on strategic priorities.", trigger: "Scheduled-Monthly",  frameworks: ["mckinsey7s","galbraithStar"], inputSources: ["Team","Departments"], outputModules: ["Diagnostics","Reports"], systemChains: ["leadership-bandwidth"], estimatedDurationMins: 20,  automationLevel: "Semi" },
  { id: 91, name: "Decision Speed Diagnostic",             category: "Organizational Diagnostics", description: "Measure and diagnose organizational decision velocity.", trigger: "Signal-Triggered",   frameworks: ["spanOfControl","leadershipPipeline"], inputSources: ["Action Items","Team"], outputModules: ["Diagnostics","Dashboard"], systemChains: ["decision-support","leadership-bandwidth"], estimatedDurationMins: 15,  automationLevel: "Full" },
  { id: 92, name: "Operational Maturity Assessment",       category: "Organizational Diagnostics", description: "CMMI 5-level maturity scoring across all departments.", trigger: "Scheduled-Quarterly", frameworks: ["cmmi","bsc","efqm"], inputSources: ["Departments"], outputModules: ["Dashboard","Reports","Diagnostics"], systemChains: ["org-health-monitoring"], estimatedDurationMins: 15,  automationLevel: "Full" },

  // ── AI GROWTH (93–97) ─────────────────────────────────────────────────────
  { id: 93, name: "Pattern Detection Across Organizations", category: "AI Growth", description: "Identify recurring organizational patterns from historical data.", trigger: "Scheduled-Monthly",  frameworks: ["statisticalProcessControl","leadingLagging"], inputSources: ["Dashboard","Reports"], outputModules: ["Advisory","Resource Hub"], systemChains: ["predictive-analytics","knowledge-intelligence"], estimatedDurationMins: 15,  automationLevel: "Full" },
  { id: 94, name: "Knowledge Superbase Enrichment",         category: "AI Growth", description: "Update framework mappings and knowledge base from new learnings.", trigger: "Scheduled-Monthly",  frameworks: ["cmmi"], inputSources: ["Resource Hub","Reports"], outputModules: ["Resource Hub"], systemChains: ["knowledge-intelligence"], estimatedDurationMins: 10,  automationLevel: "Full" },
  { id: 95, name: "AI Insight Generation",                 category: "AI Growth", description: "Generate cross-domain organizational insights from all signals.", trigger: "Scheduled-Weekly",   frameworks: ["bsc","kpiTree","leadingLagging"], inputSources: ["Dashboard","Diagnostics"], outputModules: ["Advisory","Dashboard"], systemChains: ["executive-insight","predictive-analytics"], estimatedDurationMins: 5,   automationLevel: "Full" },
  { id: 96, name: "Predictive Operational Risk Detection",  category: "AI Growth", description: "Forecast operational risks using leading indicator patterns.", trigger: "Scheduled-Weekly",   frameworks: ["statisticalProcessControl","monteCarlo","leadingLagging"], inputSources: ["Departments","Initiatives"], outputModules: ["Dashboard","Reports"], systemChains: ["predictive-analytics","strategic-risk-forecasting"], estimatedDurationMins: 10,  automationLevel: "Full" },
  { id: 97, name: "Organizational Benchmarking",           category: "AI Growth", description: "Benchmark org performance against industry standards.", trigger: "Scheduled-Quarterly", frameworks: ["benchmarking","efqm","baldrige","bsc"], inputSources: ["Departments"], outputModules: ["Reports","Dashboard"], systemChains: ["performance-benchmarking"], estimatedDurationMins: 15,  automationLevel: "Full" },

  // ── EXECUTIVE SUPPORT (98–100) ────────────────────────────────────────────
  { id: 98,  name: "Executive Daily Briefing",             category: "Executive Support", description: "Auto-generate concise daily briefing with top signals and priorities.", trigger: "Scheduled-Weekly",   frameworks: ["bsc","riskHeatMap","kpiTree"], inputSources: ["Dashboard"], outputModules: ["Reports","Advisory"], systemChains: ["executive-insight"], estimatedDurationMins: 3,   automationLevel: "Full" },
  { id: 99,  name: "Executive Decision Assistant",         category: "Executive Support", description: "Provide structured decision support for complex executive choices.", trigger: "Manual",             frameworks: ["decisionTrees","weightedDecisionMatrix","scenarioPlanning"], inputSources: ["Advisory","Initiatives"], outputModules: ["Advisory","Reports"], systemChains: ["decision-support"], estimatedDurationMins: 20,  automationLevel: "Semi" },
  { id: 100, name: "Executive Operational Command Report", category: "Executive Support", description: "Comprehensive operational command report covering all 25 systems.", trigger: "Scheduled-Weekly",   frameworks: ["bsc","cmmi","riskHeatMap","kpiTree","criticalPath"], inputSources: ["Dashboard","Diagnostics"], outputModules: ["Reports","Dashboard"], systemChains: ["executive-insight","org-health-monitoring"], estimatedDurationMins: 5,   automationLevel: "Full" },
];

// ── 10 System Bundles ────────────────────────────────────────────────────────
export const WORKFLOW_BUNDLES: WorkflowBundle[] = [
  {
    id: "bundle-strategic-planning",
    name: "Strategic Planning System",
    bundleNumber: 1,
    description: "Full strategy cycle: formulation, prioritization, OKRs, market analysis, risk assessment.",
    workflowIds: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    systemChains: ["strategic-alignment", "strategic-planning", "initiative-portfolio"],
    outputModules: ["Initiatives", "Dashboard", "Reports", "Advisory"],
    category: "System",
    runCadence: "Quarterly (full), Weekly (monitoring)",
  },
  {
    id: "bundle-initiative-management",
    name: "Initiative Management System",
    bundleNumber: 2,
    description: "End-to-end initiative lifecycle: intake, planning, milestones, health tracking, closure.",
    workflowIds: [27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38],
    systemChains: ["initiative-health", "initiative-portfolio", "dependency-intelligence"],
    outputModules: ["Initiatives", "Dashboard", "Action Items", "Reports"],
    category: "System",
    runCadence: "Weekly",
  },
  {
    id: "bundle-org-health",
    name: "Organizational Health System",
    bundleNumber: 3,
    description: "Continuous org health: maturity assessment, operational analysis, leadership alignment, decision speed.",
    workflowIds: [17, 19, 88, 89, 90, 91, 92],
    systemChains: ["org-health-monitoring", "leadership-bandwidth", "decision-support"],
    outputModules: ["Dashboard", "Diagnostics", "Reports"],
    category: "System",
    runCadence: "Weekly",
  },
  {
    id: "bundle-performance-management",
    name: "Performance Management System",
    bundleNumber: 4,
    description: "KPI design, dashboards, balanced scorecard, variance analysis across all departments.",
    workflowIds: [45, 46, 47, 48, 49, 50],
    systemChains: ["performance-benchmarking", "strategic-alignment", "org-health-monitoring"],
    outputModules: ["Dashboard", "Reports", "Departments"],
    category: "System",
    runCadence: "Weekly (monitoring), Quarterly (full review)",
  },
  {
    id: "bundle-operational-efficiency",
    name: "Operational Efficiency System",
    bundleNumber: 5,
    description: "Process mapping, bottleneck detection, waste detection, automation opportunity scanning.",
    workflowIds: [21, 24, 56, 57, 58, 59, 60, 61, 62],
    systemChains: ["operational-bottleneck", "process-improvement", "execution-velocity"],
    outputModules: ["Departments", "Action Items", "Diagnostics"],
    category: "System",
    runCadence: "Continuous",
  },
  {
    id: "bundle-governance-risk",
    name: "Governance & Risk System",
    bundleNumber: 6,
    description: "Risk management, compliance, board reporting, crisis escalation protocols.",
    workflowIds: [51, 52, 53, 54, 55, 84, 85, 86, 87],
    systemChains: ["risk-escalation", "strategic-risk-forecasting"],
    outputModules: ["Reports", "Dashboard", "Action Items"],
    category: "System",
    runCadence: "Weekly",
  },
  {
    id: "bundle-workforce-intelligence",
    name: "Workforce Intelligence System",
    bundleNumber: 7,
    description: "Team capacity, skill gaps, workforce planning, hiring prioritization.",
    workflowIds: [74, 75, 76, 77, 78],
    systemChains: ["org-capacity", "resource-allocation", "leadership-bandwidth"],
    outputModules: ["Team", "Departments", "Reports"],
    category: "System",
    runCadence: "Weekly (capacity), Quarterly (planning)",
  },
  {
    id: "bundle-knowledge-intelligence",
    name: "Knowledge Intelligence System",
    bundleNumber: 8,
    description: "Knowledge base updates, lessons learned, best practice detection, playbook generation.",
    workflowIds: [79, 80, 81, 82, 83],
    systemChains: ["knowledge-intelligence"],
    outputModules: ["Resource Hub", "Reports"],
    category: "System",
    runCadence: "Monthly",
  },
  {
    id: "bundle-executive-operations",
    name: "Executive Operations System",
    bundleNumber: 9,
    description: "Executive briefings, meeting prep, decision support, strategic insights.",
    workflowIds: [41, 63, 64, 65, 66, 69, 70, 71, 98, 99, 100],
    systemChains: ["executive-insight", "decision-support"],
    outputModules: ["Advisory", "Dashboard", "Reports"],
    category: "System",
    runCadence: "Daily (briefing), Weekly (reporting)",
  },
  {
    id: "bundle-org-learning",
    name: "Organizational Learning System",
    bundleNumber: 10,
    description: "Pattern recognition, benchmarking, operational diagnostics, AI advisory insights.",
    workflowIds: [93, 94, 95, 96, 97],
    systemChains: ["predictive-analytics", "performance-benchmarking", "knowledge-intelligence"],
    outputModules: ["Advisory", "Dashboard", "Resource Hub", "Reports"],
    category: "System",
    runCadence: "Weekly (AI), Monthly (full), Quarterly (benchmarking)",
  },
];

// ── Helper Functions ──────────────────────────────────────────────────────────

export function getWorkflowById(id: number): WorkflowDefinition | undefined {
  return MASTER_WORKFLOW_LIBRARY.find(w => w.id === id);
}

export function getWorkflowsByCategory(category: WorkflowCategory): WorkflowDefinition[] {
  return MASTER_WORKFLOW_LIBRARY.filter(w => w.category === category);
}

export function getWorkflowsByChain(chainId: SystemChainId): WorkflowDefinition[] {
  return MASTER_WORKFLOW_LIBRARY.filter(w => w.systemChains.includes(chainId));
}

export function getBundleWorkflows(bundle: WorkflowBundle): WorkflowDefinition[] {
  return bundle.workflowIds.map(id => getWorkflowById(id)).filter(Boolean) as WorkflowDefinition[];
}

export function getWorkflowCategorySummary(): Record<string, number> {
  const summary: Record<string, number> = {};
  for (const wf of MASTER_WORKFLOW_LIBRARY) {
    summary[wf.category] = (summary[wf.category] || 0) + 1;
  }
  return summary;
}

export function getFullyAutomatedWorkflows(): WorkflowDefinition[] {
  return MASTER_WORKFLOW_LIBRARY.filter(w => w.automationLevel === "Full");
}
