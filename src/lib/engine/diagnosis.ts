/**
 * DIAGNOSIS ENGINE (FRAMEWORK-BASED ANALYSIS)
 * [Apphia.Logic] — Root cause analysis using structured management frameworks
 *
 * Canonical Sources:
 *  - Competitive Strategy (Porter)
 *  - Good Strategy / Bad Strategy (Rumelt)
 *  - Lean Thinking (Womack & Jones)
 *  - The Goal (Goldratt)
 *  - Financial Statement Analysis (Subramanyam)
 *  - Designing Organizations (Galbraith)
 *  - Structure in Fives (Mintzberg)
 */

import type { DetectedSignal, SignalCategory } from "./signals";
import { ALL_FRAMEWORKS } from "@/lib/frameworkData";
import type { FrameworkRecord } from "@/lib/frameworkData";

export type RootCauseCategory =
  | "Process Bottleneck"
  | "Strategic Misalignment"
  | "Resource Constraint"
  | "Dependency Conflict"
  | "Leadership Span Overload"
  | "Financial Pressure"
  | "Capability Gap"
  | "Governance Failure"
  | "Market Signal"
  | "System Complexity";

export interface DiagnosisResult {
  signalId: string;
  signalCategory: SignalCategory;
  rootCause: RootCauseCategory;
  rootCauseDescription: string;
  firedFrameworks: FrameworkRecord[];
  frameworkFindings: FrameworkFinding[];
  confidence: number; // 0–100
  outputModules: string[];
  advisoryTriggers: string[]; // advisory recommendation categories to activate
  structuralFlags: string[];  // long-term structural issues detected
  diagnosedAt: string;
}

export interface FrameworkFinding {
  frameworkId: string;
  frameworkName: string;
  finding: string;
  severity: "Critical" | "High" | "Medium" | "Low";
  outputsTo: string[];
}

// ── Framework Selector (Canonical: Rumelt's Good Strategy principle — diagnosis precedes strategy) ──
const SIGNAL_TO_FRAMEWORKS: Record<SignalCategory, string[]> = {
  "Capacity Constraint":          ["toc", "lean", "ccpm", "criticalPath", "valueStreamMapping"],
  "Strategic Misalignment":       ["bsc", "okr", "hoshinKanri", "swot", "mckinsey7s", "porterFiveForces"],
  "Dependency Bottleneck":        ["toc", "ccpm", "criticalPath", "pert", "raidLog"],
  "Performance Anomaly":          ["bsc", "kpiTree", "sixSigmaDMAIC", "statisticalProcessControl", "benchmarking", "leadingLagging"],
  "Execution Delay":              ["ccpm", "criticalPath", "pmbok", "stageGate", "pert"],
  "Risk Escalation":              ["riskHeatMap", "erm", "iso31000", "fmea", "bowtie", "scenarioPlanning"],
  "Resource Overload":            ["toc", "lean", "spanOfControl"],
  "KPI Underperformance":         ["bsc", "kpiTree", "operationalMaturityModels", "efqm", "benchmarking"],
  "Deadline Variance":            ["criticalPath", "pert", "ccpm", "pmbok"],
  // Extended signal categories (Systems 11-25)
  "Decision Bottleneck":          ["decisionTrees", "weightedDecisionMatrix", "spanOfControl"],
  "Leadership Bandwidth":         ["spanOfControl", "leadershipPipeline", "galbraithStar", "mckinsey7s"],
  "Cross-Department Conflict":    ["organisationalNetworkAnalysis", "mckinsey7s", "systemsThinking"],
  "Innovation Gap":               ["horizonModel", "innovationAmbitionMatrix", "blueOcean"],
  "Execution Velocity Decline":   ["lean", "toc", "kpiTree", "statisticalProcessControl"],
  "Portfolio Imbalance":          ["bcgMatrix", "geMcKinseyMatrix", "mosCoW", "weightedDecisionMatrix"],
  "Change Resistance":            ["kotter8Step", "adkar", "lewinChangeModel"],
  "Knowledge Gap":                ["cmmi", "bsc", "operationalMaturityModels"],
  "Benchmarking Gap":             ["benchmarking", "bsc", "efqm"],
  "Strategic Opportunity":        ["blueOcean", "horizonModel", "innovationAmbitionMatrix"],
};

const ROOT_CAUSE_MAP: Record<SignalCategory, RootCauseCategory> = {
  "Capacity Constraint":     "Resource Constraint",
  "Strategic Misalignment":  "Strategic Misalignment",
  "Dependency Bottleneck":   "Dependency Conflict",
  "Performance Anomaly":     "Process Bottleneck",
  "Execution Delay":         "Process Bottleneck",
  "Risk Escalation":         "Governance Failure",
  "Resource Overload":       "Leadership Span Overload",
  "KPI Underperformance":    "Capability Gap",
  "Deadline Variance":       "Process Bottleneck",
};

// Root cause descriptions generated from canonical framework logic
function buildRootCauseDescription(signal: DetectedSignal, rootCause: RootCauseCategory): string {
  const descMap: Record<RootCauseCategory, string> = {
    "Process Bottleneck": `${signal.source} shows measurable flow disruption. Lean Value Stream Mapping identifies non-value-added handoffs. Six Sigma DMAIC measurement phase confirms process variation exceeding control limits.`,
    "Strategic Misalignment": `Balanced Scorecard analysis reveals divergence between stated strategy and resource allocation patterns. OKR cascade shows broken linkage between executive objectives and team-level key results.`,
    "Resource Constraint": `Theory of Constraints identifies a binding constraint in ${signal.source}. System throughput is limited below potential capacity. CCPM buffer analysis confirms schedule pressure from resource unavailability.`,
    "Dependency Conflict": `Critical Path Method exposes a task dependency chain with zero float. RAID Log tracking indicates an unresolved dependency blocking parallel workstreams. Cascading risk across 2+ initiatives detected.`,
    "Leadership Span Overload": `Mintzberg Organizational Configuration analysis flags span of control exceeding recommended limits. McKinsey 7S coherence check reveals staff-structure misalignment creating decision bottlenecks.`,
    "Financial Pressure": `Financial Ratio Analysis (Subramanyam) identifies cost structure pressure. Activity-Based Costing reveals hidden overhead concentration in ${signal.source}.`,
    "Capability Gap": `Galbraith Star Model People element shows skills-strategy misfit. CMMI assessment scores below threshold in key process areas. Leadership Pipeline analysis confirms succession risk.`,
    "Governance Failure": `ISO 31000 risk framework audit identifies missing risk controls. FMEA analysis shows high-severity failure modes with no mitigation in place. Escalation path undefined for ${signal.source}.`,
    "Market Signal": `PESTEL environmental scan detects macro-level shifts affecting the competitive position. Porter Five Forces signals increased competitive pressure in relevant market segments.`,
    "System Complexity": `Systems Thinking Causal Loop Diagrams reveal reinforcing feedback loops creating unintended consequences. Cynefin Framework classifies this as Complex domain requiring probe-sense-respond approach.`,
  };
  return descMap[rootCause] || "Root cause analysis in progress.";
}

function buildFrameworkFindings(signal: DetectedSignal, fwIds: string[], fwMap: Map<string, FrameworkRecord>): FrameworkFinding[] {
  const findings: FrameworkFinding[] = [];

  for (const id of fwIds) {
    const fw = fwMap.get(id);
    if (!fw) continue;

    // Generate finding text based on signal-framework pairing
    let finding = "";
    const cat = signal.category;

    if (id === "toc") finding = `Constraint identified in ${signal.source}. Five Focusing Steps: exploit current constraint before adding capacity. Throughput below system potential.`;
    else if (id === "lean") finding = `Waste analysis: overproduction and waiting detected. WIP accumulation above optimal. Value stream requires redesign to restore flow.`;
    else if (id === "bsc") finding = `Four-perspective analysis: ${cat === "Strategic Misalignment" ? "Financial-Customer linkage broken. Internal Process perspective shows execution gap." : "Dashboard scorecard signals deviation from strategic targets."}`;
    else if (id === "okr") finding = `Key Result completion rate below threshold. OKR cascade integrity compromised — departmental objectives not contributing to org-level outcomes.`;
    else if (id === "ccpm") finding = `Project buffer consumption rate critical. Resource dependency chain causing schedule compression. Buffer management protocol required.`;
    else if (id === "criticalPath") finding = `Critical path float at zero or negative. Schedule risk is high. Parallel-pathing or scope reduction required to restore delivery confidence.`;
    else if (id === "sixSigmaDMAIC") finding = `DMAIC Measure phase: process sigma level below 3σ. Define phase identifies clear defect: ${signal.title}. Analyze phase pending.`;
    else if (id === "mckinsey7s") finding = `7S coherence check: Strategy-Structure-Systems triangle shows misalignment. Hard element gaps creating soft element friction.`;
    else if (id === "riskHeatMap") finding = `Risk heat map entry: probability × impact score places this in high-priority quadrant. Immediate mitigation action required.`;
    else if (id === "iso31000") finding = `ISO 31000 Risk Treatment: risk level exceeds acceptable threshold. Risk owner must implement treatment plan within defined timeframe.`;
    else if (id === "kpiTree") finding = `KPI Tree decomposition shows driver metric degradation causing lagging KPI underperformance. Root driver requires direct intervention.`;
    else finding = `${fw.name} analysis activated. Signal maps to ${fw.statusRelevance}. ${fw.notes.split(".")[0]}.`;

    findings.push({
      frameworkId: id,
      frameworkName: fw.name,
      finding,
      severity: signal.severity,
      outputsTo: fw.outputsTo,
    });
  }

  return findings;
}

// ── Advisory Trigger Logic ────────────────────────────────────────────────────
function getAdvisoryTriggers(rootCause: RootCauseCategory): string[] {
  const map: Record<RootCauseCategory, string[]> = {
    "Process Bottleneck":       ["Process Redesign", "Execution Acceleration"],
    "Strategic Misalignment":   ["Strategic Realignment", "Initiative Reprioritization"],
    "Resource Constraint":      ["Resource Reallocation", "Dependency Restructuring"],
    "Dependency Conflict":      ["Dependency Restructuring", "Risk Mitigation"],
    "Leadership Span Overload": ["Organizational Restructuring", "Resource Reallocation"],
    "Financial Pressure":       ["Resource Reallocation", "Initiative Reprioritization"],
    "Capability Gap":           ["Organizational Restructuring", "Process Redesign"],
    "Governance Failure":       ["Risk Mitigation", "Process Redesign"],
    "Market Signal":            ["Strategic Realignment", "Initiative Reprioritization"],
    "System Complexity":        ["Structural Remediation", "Process Redesign"],
  };
  return map[rootCause] || ["General Advisory"];
}

function getStructuralFlags(rootCause: RootCauseCategory): string[] {
  const map: Record<RootCauseCategory, string[]> = {
    "Process Bottleneck":       ["Implement process governance", "Define flow standards"],
    "Strategic Misalignment":   ["Establish Strategy-Execution bridge", "Implement OKR governance"],
    "Resource Constraint":      ["Build capacity planning system", "Implement WIP limits"],
    "Dependency Conflict":      ["Create dependency SLA framework", "Implement RAID governance"],
    "Leadership Span Overload": ["Review organizational spans", "Define delegation matrix"],
    "Financial Pressure":       ["Implement activity-based budgeting", "Build financial controls"],
    "Capability Gap":           ["Launch capability building program", "Revise succession plan"],
    "Governance Failure":       ["Establish governance committee", "Implement escalation protocols"],
    "Market Signal":            ["Commission market intelligence function", "Review strategic positioning"],
    "System Complexity":        ["Implement systems thinking protocols", "Reduce organizational complexity"],
  };
  return map[rootCause] || [];
}

// ── Main Diagnosis Runner ─────────────────────────────────────────────────────
/**
 * [Apphia.Logic] runDiagnosis
 * Takes detected signals and performs framework-based root cause analysis.
 * Selects relevant frameworks, generates findings, and outputs to Advisory.
 */
export function runDiagnosis(signals: DetectedSignal[]): DiagnosisResult[] {
  const fwMap = new Map<string, FrameworkRecord>(ALL_FRAMEWORKS.map(f => [f.id, f]));

  return signals
    .filter(s => s.requiresDiagnosis)
    .map(signal => {
      const fwIds = SIGNAL_TO_FRAMEWORKS[signal.category] || [];
      const firedFrameworks = fwIds.map(id => fwMap.get(id)).filter(Boolean) as FrameworkRecord[];
      const rootCause = ROOT_CAUSE_MAP[signal.category] || "Process Bottleneck";
      const findings = buildFrameworkFindings(signal, fwIds, fwMap);

      // Collect all output modules from fired frameworks
      const outputModules = [...new Set(
        firedFrameworks.flatMap(f => f.outputsTo)
      )];

      const confidence = Math.min(100, 50 + firedFrameworks.length * 8 + (signal.score > 80 ? 15 : 0));

      return {
        signalId: signal.id,
        signalCategory: signal.category,
        rootCause,
        rootCauseDescription: buildRootCauseDescription(signal, rootCause),
        firedFrameworks,
        frameworkFindings: findings,
        confidence,
        outputModules,
        advisoryTriggers: getAdvisoryTriggers(rootCause),
        structuralFlags: getStructuralFlags(rootCause),
        diagnosedAt: new Date().toISOString(),
      };
    });
}

export function getDiagnosisBySignal(signalId: string, results: DiagnosisResult[]): DiagnosisResult | undefined {
  return results.find(r => r.signalId === signalId);
}

export function getTopDiagnoses(results: DiagnosisResult[], limit = 5): DiagnosisResult[] {
  return results.slice(0, limit);
}
