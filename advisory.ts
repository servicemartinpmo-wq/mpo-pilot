/**
 * ADVISORY GUIDANCE ENGINE
 * [Apphia.Logic] — Generates actionable recommendations from diagnostic results
 *
 * Canonical Sources:
 *  - The Practice of Management (Drucker)
 *  - Execution (Bossidy & Charan)
 *  - Decision Traps (Hammond, Keeney, Raiffa)
 *  - Influence (Cialdini)
 *  - The Lean Startup (Eric Ries)
 *  - Thinking Fast and Slow (Kahneman)
 */

import type { DiagnosisResult, RootCauseCategory } from "./diagnosis";
import type { DetectedSignal } from "./signals";

export type AdvisoryCategory =
  | "Strategic Realignment"
  | "Initiative Reprioritization"
  | "Resource Reallocation"
  | "Process Redesign"
  | "Dependency Restructuring"
  | "Organizational Restructuring"
  | "Risk Mitigation"
  | "Execution Acceleration"
  | "Structural Remediation"
  | "Capability Building";

export type AdvisoryPriority = "Immediate" | "This Week" | "This Month" | "This Quarter";

export interface AdvisoryRecommendation {
  id: string;
  signalId: string;
  diagnosisId: string;
  category: AdvisoryCategory;
  priority: AdvisoryPriority;
  title: string;
  rationale: string;           // WHY this recommendation (Drucker-based)
  action: string;              // WHAT to do (Bossidy/Charan — Execution)
  behavioralInsight: string;   // HOW to influence change (Cialdini/Kahneman)
  expectedOutcome: string;
  timeToImpact: string;        // e.g., "2–4 weeks"
  owner: string;               // suggested responsible role
  outputsTo: string[];         // modules that will be updated
  relatedFrameworks: string[];
  generatedAt: string;
}

export interface ActionGenerated {
  id: string;
  recommendationId: string;
  title: string;
  assignedTo: string;
  dueDate: string;
  outputModule: "Initiatives" | "Action Items" | "Team" | "Departments";
  type: "Create Initiative" | "Assign Task" | "Process Review" | "Risk Plan" | "Structural Change";
}

// ── Advisory Knowledge Base (Canonical Framework Outputs) ────────────────────
const ADVISORY_TEMPLATES: Record<string, {
  title: string;
  rationale: string;
  action: string;
  behavioralInsight: string;
  expectedOutcome: string;
  timeToImpact: string;
  owner: string;
}> = {
  "Strategic Realignment": {
    title: "Realign Department Strategy to Organizational OKRs",
    rationale: "Drucker's MBO principle: objectives must be cascaded coherently from organization to individual. A broken cascade is the root cause of execution waste.",
    action: "Convene a Strategy-Execution alignment session. Map current departmental activities to strategic OKRs. Identify and eliminate non-contributing work streams. Require written alignment confirmation from each department head.",
    behavioralInsight: "Cialdini's Commitment principle: publicly commit each department head to their OKR contribution in writing. Social commitment reduces drift. Kahneman's System 2 thinking: frame misalignment as a threat to departmental success metrics.",
    expectedOutcome: "OKR completion rate improves by 20–35% within one quarter. Budget reallocated to highest-impact activities.",
    timeToImpact: "2–4 weeks",
    owner: "CEO / Chief of Staff",
  },
  "Initiative Reprioritization": {
    title: "Reprioritize Initiative Portfolio Using Impact/Capacity Matrix",
    rationale: "Bossidy & Charan (Execution): organizations fail not from bad strategy but from over-commitment. WIP overload destroys throughput. Defer or kill low-value initiatives immediately.",
    action: "Run a full portfolio review using BCG Matrix and MoSCoW prioritization. Score each initiative on strategic alignment and delivery capacity. Immediately defer or cancel initiatives scoring below threshold. Implement a WIP limit of max 7 active initiatives.",
    behavioralInsight: "Kahneman's Sunk Cost fallacy: leaders resist stopping initiatives due to invested resources. Frame deferral as resource liberation, not failure. Use objective scoring to neutralize political pressure.",
    expectedOutcome: "Delivery velocity increases 30–50%. Team capacity freed for highest-value work.",
    timeToImpact: "1–2 weeks",
    owner: "COO / Program Director",
  },
  "Resource Reallocation": {
    title: "Emergency Resource Reallocation to Relieve System Constraint",
    rationale: "Goldratt's TOC: the only way to increase throughput is to exploit and then elevate the constraint. Reallocating resources to non-constraints before resolving the constraint is waste.",
    action: "Identify the binding constraint. Immediately reallocate 1–2 senior resources from non-critical initiatives to the constrained area. Implement a temporary WIP freeze on all non-Priority-1 work. Schedule a 2-week sprint to clear the backlog.",
    behavioralInsight: "Bossidy: execution requires 'robust dialogue' — involve resource owners in the reallocation decision to gain buy-in. Frame as temporary surge to protect team morale.",
    expectedOutcome: "Constraint throughput increases by 40–60%. Cascading delays prevented across dependent initiatives.",
    timeToImpact: "Immediate – 1 week",
    owner: "COO / Department Head",
  },
  "Process Redesign": {
    title: "Initiate Lean Process Redesign to Eliminate Bottleneck",
    rationale: "Lean Thinking (Womack & Jones): every process has waste (muda). The current process is delivering below potential because of unnecessary steps, handoffs, and waiting time.",
    action: "Commission a Value Stream Mapping exercise. Identify the 3 highest-waste process steps. Design a streamlined process removing non-value-added activities. Pilot the new process within 2 weeks. Measure cycle time improvement.",
    behavioralInsight: "Kaizen philosophy: small, incremental improvements build confidence and momentum. Do not redesign the entire process at once — target the biggest pain point first.",
    expectedOutcome: "Process cycle time reduced by 30–50%. Error rate decreases. Team satisfaction improves.",
    timeToImpact: "3–6 weeks",
    owner: "Operations Manager / Process Owner",
  },
  "Dependency Restructuring": {
    title: "Resolve Critical Dependency Conflict with Escalated SLA",
    rationale: "CCPM (Goldratt): unresolved dependencies are the primary cause of project delay. Every day a dependency is unresolved compresses the critical chain and increases cascade risk.",
    action: "Escalate the dependency to the executive sponsor with a 48-hour resolution mandate. Create a parallel development plan using mock contracts or interim solutions. Establish a formal internal SLA for all cross-team dependencies (5-business-day standard). Track in RAID Log with automated alerts.",
    behavioralInsight: "Cialdini's Authority principle: executive escalation reframes the dependency as an organizational priority, not a team request. Creates immediate behavioral compliance.",
    expectedOutcome: "Dependency resolved within 48–72 hours. Cascade risk neutralized. 3+ downstream initiatives unblocked.",
    timeToImpact: "Immediate – 48 hours",
    owner: "Program Director / CTO",
  },
  "Organizational Restructuring": {
    title: "Review Organizational Spans and Accountability Clarity",
    rationale: "Galbraith Star Model: structure must follow strategy. When spans are too broad, decision speed slows and accountability diffuses. McKinsey 7S shows Staff-Structure misalignment is degrading execution.",
    action: "Conduct a Span of Control Analysis. Identify managers with >7 direct reports. Define accountability boundaries using MOCHA. Create or revise department charters. Clarify escalation paths. Consider introducing a middle-management layer in the affected area.",
    behavioralInsight: "Self-Determination Theory: people perform better with clear roles and autonomy within defined boundaries. Restructuring must be communicated as empowerment, not control.",
    expectedOutcome: "Decision speed increases. Manager effectiveness improves. Employee clarity score rises.",
    timeToImpact: "4–8 weeks",
    owner: "CEO / CHRO",
  },
  "Risk Mitigation": {
    title: "Activate Risk Mitigation Protocol for Escalated Risk",
    rationale: "ISO 31000: risks above acceptable threshold must be treated immediately. FMEA analysis confirms failure mode severity requires direct mitigation, not monitoring.",
    action: "Register risk in the formal Risk Register with owner, severity, and treatment plan. Identify immediate mitigation actions. Define early-warning trigger thresholds. Assign a Risk Owner with weekly review obligation. Escalate to Board if risk score exceeds 8/10.",
    behavioralInsight: "Decision Traps (Hammond et al.): over-confidence bias causes leaders to underestimate tail risks. Present risk scenarios with concrete financial and operational impact estimates.",
    expectedOutcome: "Risk score reduced by 40–60% within one month. Escalation path clearly defined. Board visibility established.",
    timeToImpact: "Immediate – 1 week",
    owner: "Risk Officer / COO",
  },
  "Execution Acceleration": {
    title: "Implement Execution Sprint to Recover Delayed Deliverables",
    rationale: "Bossidy & Charan: execution requires follow-through discipline and accountability at every level. Delays compound — every week of recovery delay costs 2–3 weeks of schedule.",
    action: "Declare a 2-week execution sprint on the delayed initiative. Daily standups. Clear daily deliverable targets. Remove all low-priority distractions for the team. Assign an execution monitor to track daily progress. Use Lean Startup iteration: build-measure-learn in compressed cycles.",
    behavioralInsight: "Ries (Lean Startup): small batch sizes and rapid feedback loops accelerate learning and delivery. Shorten feedback cycles to 24–48 hours to maintain momentum.",
    expectedOutcome: "Recovery of 60–80% of schedule slippage within 2 weeks. Team morale improves through visible progress.",
    timeToImpact: "Immediate",
    owner: "Project Manager / Team Lead",
  },
  "Structural Remediation": {
    title: "Design Structural System Improvement for Long-Term Remediation",
    rationale: "Hoshin Kanri (Akao): systemic problems require systemic solutions. A band-aid advisory fix will re-emerge if the underlying structural cause is not addressed. Long-term governance is the only durable solution.",
    action: "Commission a structural improvement working group. Define the root system failure. Design a governance structure to prevent recurrence. Implement Hoshin Kanri policy deployment to cascade the improvement mandate. Review quarterly.",
    behavioralInsight: "Laloux (Reinventing Organizations): structural changes work best when co-designed with the teams affected. Include frontline input in the redesign to build adoption.",
    expectedOutcome: "Permanent elimination of root cause. System maturity score increases by 1 tier within 6 months.",
    timeToImpact: "6–12 weeks",
    owner: "COO / Systems Architect",
  },
  "Capability Building": {
    title: "Launch Targeted Capability Development Program",
    rationale: "CMMI: advancing from one maturity level to the next requires deliberate capability investment. The detected gap signals a process or skills area below the threshold required for the current strategic load.",
    action: "Identify the specific capability gap using CMMI or Balanced Scorecard Learning & Growth lens. Design a 90-day capability building plan. Assign a learning sponsor. Integrate capability milestones into OKRs. Track progress weekly.",
    behavioralInsight: "Fogg Behavior Model: capability building requires motivation + ability + trigger. Provide clear motivation (linked to org goals), build ability incrementally, and trigger practice through daily habits.",
    expectedOutcome: "Capability score increases by one CMMI level within 90 days. Team confidence and output quality improve measurably.",
    timeToImpact: "4–12 weeks",
    owner: "CHRO / Department Head",
  },
};

function generateActionItems(rec: AdvisoryRecommendation): ActionGenerated[] {
  const actions: ActionGenerated[] = [];
  const base = new Date();

  if (rec.category === "Initiative Reprioritization" || rec.category === "Strategic Realignment") {
    actions.push({
      id: `act-${rec.id}-1`,
      recommendationId: rec.id,
      title: `Portfolio review: ${rec.title}`,
      assignedTo: rec.owner,
      dueDate: new Date(base.getTime() + 7 * 86400000).toISOString().split("T")[0],
      outputModule: "Initiatives",
      type: "Create Initiative",
    });
  }

  if (rec.category === "Risk Mitigation" || rec.category === "Dependency Restructuring") {
    actions.push({
      id: `act-${rec.id}-2`,
      recommendationId: rec.id,
      title: `Mitigation task: ${rec.title}`,
      assignedTo: rec.owner,
      dueDate: new Date(base.getTime() + 2 * 86400000).toISOString().split("T")[0],
      outputModule: "Action Items",
      type: "Risk Plan",
    });
  }

  if (rec.category === "Organizational Restructuring" || rec.category === "Structural Remediation") {
    actions.push({
      id: `act-${rec.id}-3`,
      recommendationId: rec.id,
      title: `Structural review: ${rec.title}`,
      assignedTo: rec.owner,
      dueDate: new Date(base.getTime() + 21 * 86400000).toISOString().split("T")[0],
      outputModule: "Departments",
      type: "Structural Change",
    });
  }

  return actions;
}

// ── Main Advisory Runner ──────────────────────────────────────────────────────
/**
 * [Apphia.Logic] runAdvisory
 * Takes diagnosis results and generates structured recommendations.
 * Each recommendation includes rationale (Drucker), action (Bossidy), and behavioral insight (Cialdini/Kahneman).
 */
export function runAdvisory(diagnoses: DiagnosisResult[], signals: DetectedSignal[]): {
  recommendations: AdvisoryRecommendation[];
  generatedActions: ActionGenerated[];
} {
  const recommendations: AdvisoryRecommendation[] = [];
  const generatedActions: ActionGenerated[] = [];

  for (const diag of diagnoses) {
    const signal = signals.find(s => s.id === diag.signalId);
    if (!signal) continue;

    for (const trigger of diag.advisoryTriggers) {
      const template = ADVISORY_TEMPLATES[trigger];
      if (!template) continue;

      const priority: AdvisoryPriority =
        signal.severity === "Critical" ? "Immediate" :
        signal.severity === "High" ? "This Week" :
        signal.severity === "Medium" ? "This Month" : "This Quarter";

      const rec: AdvisoryRecommendation = {
        id: `adv-${diag.signalId}-${trigger.replace(/\s+/g, "")}`,
        signalId: diag.signalId,
        diagnosisId: diag.signalId,
        category: trigger as AdvisoryCategory,
        priority,
        title: template.title,
        rationale: template.rationale,
        action: template.action,
        behavioralInsight: template.behavioralInsight,
        expectedOutcome: template.expectedOutcome,
        timeToImpact: template.timeToImpact,
        owner: template.owner,
        outputsTo: ["Advisory", ...diag.outputModules],
        relatedFrameworks: diag.firedFrameworks.map(f => f.id),
        generatedAt: new Date().toISOString(),
      };

      recommendations.push(rec);
      generatedActions.push(...generateActionItems(rec));
    }
  }

  // Deduplicate by category + signalId
  const seen = new Set<string>();
  const unique = recommendations.filter(r => {
    const key = `${r.category}:${r.signalId}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  return { recommendations: unique, generatedActions };
}

export function getRecommendationsByPriority(recs: AdvisoryRecommendation[]): Record<AdvisoryPriority, AdvisoryRecommendation[]> {
  return {
    "Immediate": recs.filter(r => r.priority === "Immediate"),
    "This Week": recs.filter(r => r.priority === "This Week"),
    "This Month": recs.filter(r => r.priority === "This Month"),
    "This Quarter": recs.filter(r => r.priority === "This Quarter"),
  };
}
