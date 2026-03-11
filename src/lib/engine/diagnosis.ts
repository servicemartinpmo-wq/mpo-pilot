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
  "Capacity Constraint":          "Resource Constraint",
  "Strategic Misalignment":       "Strategic Misalignment",
  "Dependency Bottleneck":        "Dependency Conflict",
  "Performance Anomaly":          "Process Bottleneck",
  "Execution Delay":              "Process Bottleneck",
  "Risk Escalation":              "Governance Failure",
  "Resource Overload":            "Leadership Span Overload",
  "KPI Underperformance":         "Capability Gap",
  "Deadline Variance":            "Process Bottleneck",
  // Extended signal categories (Systems 11-25)
  "Decision Bottleneck":          "Leadership Span Overload",
  "Leadership Bandwidth":         "Leadership Span Overload",
  "Cross-Department Conflict":    "System Complexity",
  "Innovation Gap":               "Capability Gap",
  "Execution Velocity Decline":   "Process Bottleneck",
  "Portfolio Imbalance":          "Strategic Misalignment",
  "Change Resistance":            "System Complexity",
  "Knowledge Gap":                "Capability Gap",
  "Benchmarking Gap":             "Capability Gap",
  "Strategic Opportunity":        "Market Signal",
};

// Root cause descriptions generated from canonical framework logic
function buildRootCauseDescription(signal: DetectedSignal, rootCause: RootCauseCategory): string {
  const descMap: Record<RootCauseCategory, string> = {
    "Process Bottleneck": `Work is getting stuck or piling up around ${signal.source}. There are unnecessary handoffs and wait times slowing things down. A process mapping exercise (like Lean value stream mapping) confirms the flow is broken and needs to be streamlined.`,
    "Strategic Misalignment": `Your team's daily work isn't lined up with your top business priorities. When you look at where time and resources are actually going, there's a gap between your goals and what people are working on.`,
    "Resource Constraint": `One part of your workflow is backing everything else up. A bottleneck analysis (Theory of Constraints) shows the constraint is in ${signal.source} — until it's cleared, the rest of the team stays stuck.`,
    "Dependency Conflict": `A task or project is blocked because it depends on something that hasn't been delivered yet. There's no slack in the schedule, so every day this stays unresolved pushes other work back too.`,
    "Leadership Span Overload": `Someone on your team is stretched too thin — managing too many people or too many responsibilities. Decisions are slowing down because everything has to go through one person.`,
    "Financial Pressure": `Costs are building up in ${signal.source} in ways that aren't sustainable. When you break down where the money is actually going, there's hidden overhead that needs to be addressed.`,
    "Capability Gap": `Your team doesn't yet have the skills or processes needed to handle what's being asked of them. There's a gap between the current capability level and what your business goals require.`,
    "Governance Failure": `There are risks in ${signal.source} that don't have a clear owner or a plan to handle them. If something goes wrong, there's no defined path for who steps in or how it gets escalated.`,
    "Market Signal": `External market conditions are shifting in ways that affect your competitive position. New pressures — from competitors, regulations, or customer behavior — are changing the landscape.`,
    "System Complexity": `Multiple parts of your operation are tangled together in ways that create unexpected side effects. Fixing one thing makes another worse because the pieces are too tightly connected. This kind of situation requires small experiments to find what works, not big sweeping changes.`,
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

    if (id === "toc") finding = `There's a bottleneck in ${signal.source} that's limiting your overall output. The fix is to focus on clearing this specific constraint before adding more resources elsewhere.`;
    else if (id === "lean") finding = `There's waste building up in the process — things are being done too early, sitting idle, or piling up. The workflow needs to be simplified to get things moving again.`;
    else if (id === "bsc") finding = `${cat === "Strategic Misalignment" ? "Your goals and your day-to-day execution are out of sync. The work being done isn't connecting back to business results." : "Key metrics are drifting away from where they need to be. Time to check what's changed and course-correct."}`;
    else if (id === "okr") finding = `Your team's progress on key goals is falling behind. Individual work isn't adding up to the outcomes you set at the company level — the connection is broken somewhere.`;
    else if (id === "ccpm") finding = `Project timelines are getting squeezed because of resource conflicts. The schedule buffer is nearly gone, so any new delay will push the deadline.`;
    else if (id === "criticalPath") finding = `The project timeline has zero room for slippage. If anything else goes wrong, the deadline will slip. Consider running tasks in parallel or cutting scope to create breathing room.`;
    else if (id === "sixSigmaDMAIC") finding = `The process quality is below acceptable levels. The specific problem area is: ${signal.title}. Next step is to dig into the root cause and fix it systematically.`;
    else if (id === "mckinsey7s") finding = `Your strategy, team structure, and systems aren't in sync. The mismatch between how your business is set up and what you're trying to achieve is creating friction.`;
    else if (id === "riskHeatMap") finding = `This risk scores high on both likelihood and potential damage. It needs to be dealt with now, not just monitored.`;
    else if (id === "iso31000") finding = `This risk has crossed the threshold where it needs active mitigation, not just tracking. Someone needs to own the fix and execute within a clear timeline.`;
    else if (id === "kpiTree") finding = `An upstream metric is dragging down your overall performance numbers. Fixing the root driver will have a cascading positive effect on the KPIs that matter.`;
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
    "Process Bottleneck":       ["Document your process steps and cut unnecessary ones", "Set clear rules for how work flows between people"],
    "Strategic Misalignment":   ["Write down your top 3 priorities and share them with the team", "Check that every active project ties back to a real goal"],
    "Resource Constraint":      ["Map out who's working on what so you can spot overload", "Limit the number of projects running at the same time"],
    "Dependency Conflict":      ["Agree on response-time expectations between teams or roles", "Track blockers in one shared place and review them weekly"],
    "Leadership Span Overload": ["Write down who owns which decisions", "Pick one or two things to delegate this week"],
    "Financial Pressure":       ["Break down costs by activity to find hidden waste", "Set spending limits and review them monthly"],
    "Capability Gap":           ["Identify the top skill your team is missing and create a plan to build it", "Cross-train at least one person on every critical task"],
    "Governance Failure":       ["Assign a clear owner for every major risk", "Set a weekly check-in rhythm to review open issues"],
    "Market Signal":            ["Set up a simple way to track competitor and market changes monthly", "Revisit your positioning and pricing quarterly"],
    "System Complexity":        ["Map out how your key processes connect and find the tangles", "Simplify by removing one unnecessary dependency or handoff"],
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
