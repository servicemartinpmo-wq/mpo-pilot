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
import type { ToneMode } from "@/hooks/useUserMode";
import type { OrgContext } from "./contextEngine";
import { getContextMultipliers } from "./contextEngine";

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
    title: "Get Your Team Pulling in the Same Direction",
    rationale: "Your team's daily work isn't lining up with your top priorities. When people are busy but not moving the needle on what matters most, effort gets wasted and results stall.",
    action: "Block 2 hours with your team lead this week. List your top 3 business goals and map every active project to one of them. Anything that doesn't connect to a goal gets paused or dropped. Have each person confirm what they're focused on and why it matters.",
    behavioralInsight: "When people write down their commitment publicly, they follow through at a much higher rate. Ask each team member to state their top priority in writing — it keeps everyone honest and reduces drift.",
    expectedOutcome: "Goal completion rate improves by 20–35% within one quarter. Time and budget shift to your highest-impact work.",
    timeToImpact: "2–4 weeks",
    owner: "You / Founder",
  },
  "Initiative Reprioritization": {
    title: "Stop Doing Too Many Things at Once",
    rationale: "Your team isn't failing because of bad ideas — you're just running too many of them at the same time. When everything is a priority, nothing gets finished well.",
    action: "List every active project. Score each one on how much it moves the business forward vs. how much capacity it takes. Pause or kill anything that scores low. Limit your team to 5–7 active projects max. Revisit monthly.",
    behavioralInsight: "It's natural to resist stopping something you've already invested in, but keeping low-value projects alive drains your best people. Frame pausing a project as freeing up your team, not giving up.",
    expectedOutcome: "Delivery speed increases 30–50%. Your team has breathing room to focus on the work that actually matters.",
    timeToImpact: "1–2 weeks",
    owner: "You / Founder",
  },
  "Resource Reallocation": {
    title: "Move Your Best People to the Biggest Bottleneck",
    rationale: "One part of your operation is holding everything else back. Until you fix the bottleneck, adding effort anywhere else won't speed things up (a core idea from bottleneck analysis).",
    action: "Figure out exactly where things are getting stuck. Pull 1–2 of your strongest people off lower-priority work and point them at the bottleneck. Temporarily freeze all non-urgent tasks. Run a focused 2-week push to clear the backlog.",
    behavioralInsight: "Talk to the people being moved — explain it's a temporary sprint to fix a critical problem. When people understand the 'why' and know it's short-term, they stay motivated.",
    expectedOutcome: "Bottleneck throughput increases by 40–60%. Downstream delays across other projects are prevented.",
    timeToImpact: "Immediate – 1 week",
    owner: "Your ops lead or team lead",
  },
  "Process Redesign": {
    title: "Fix the Process That's Slowing Everyone Down",
    rationale: "Your current process has unnecessary steps, handoffs, or waiting time baked in. It's not a people problem — the process itself is creating waste and dragging down output.",
    action: "Map out the process step by step. Identify the 3 biggest time-wasters (extra approvals, redundant handoffs, waiting on someone). Redesign the flow to cut those out. Test the new process for 2 weeks and measure whether cycle time drops.",
    behavioralInsight: "Don't try to redesign everything at once — pick the single biggest pain point first. Small wins build confidence and make the team more open to further changes.",
    expectedOutcome: "Process cycle time reduced by 30–50%. Fewer errors. Team feels less frustrated.",
    timeToImpact: "3–6 weeks",
    owner: "Your ops lead or team lead",
  },
  "Dependency Restructuring": {
    title: "Unblock the Thing That's Holding Up Everything Else",
    rationale: "When one task depends on another team or person and that dependency isn't resolved, everything downstream gets delayed. Each day of waiting compounds the schedule hit.",
    action: "Identify the specific blocker and who can resolve it. Give them a clear 48-hour deadline. If possible, find a workaround so your team can keep moving in parallel. Set a simple rule going forward: cross-team requests get a 5-business-day response commitment.",
    behavioralInsight: "When you escalate a blocker clearly and attach a deadline, it shifts from a side request to a real priority. People respond faster when there's a visible owner and a timeline.",
    expectedOutcome: "Blocker resolved within 48–72 hours. Multiple downstream tasks get unblocked.",
    timeToImpact: "Immediate – 48 hours",
    owner: "You or your most senior person",
  },
  "Organizational Restructuring": {
    title: "Clarify Who Owns What So Decisions Don't Stall",
    rationale: "When one person manages too many people or too many responsibilities, decisions slow down and accountability gets fuzzy. Your structure needs to match how your team actually works.",
    action: "Look at who reports to whom. If anyone has more than 7 direct reports, that's too many. Write down clear ownership for each major area. Make sure everyone knows who makes which decisions. If needed, promote a team lead to take some of the load.",
    behavioralInsight: "People do their best work when they have clear responsibilities and real autonomy within their lane. Frame any changes as giving people more ownership, not more oversight.",
    expectedOutcome: "Decisions happen faster. Managers are more effective. Team members know exactly what they own.",
    timeToImpact: "4–8 weeks",
    owner: "You / Founder",
  },
  "Risk Mitigation": {
    title: "Deal With This Risk Before It Becomes a Real Problem",
    rationale: "This risk has crossed the line from 'something to watch' into 'something to fix now.' Ignoring it at this point means you're accepting the damage when it hits.",
    action: "Write the risk down: what could go wrong, how bad it would be, and who owns fixing it. Identify 2–3 things you can do right now to reduce the likelihood or impact. Set a trigger — a clear signal that tells you things are getting worse. Check in on it weekly.",
    behavioralInsight: "It's human nature to assume risks won't actually materialize. Counter that by putting real numbers on the impact — what would it cost you in time, money, or customers if this goes sideways?",
    expectedOutcome: "Risk level drops significantly within one month. You have a clear plan and someone accountable for watching it.",
    timeToImpact: "Immediate – 1 week",
    owner: "You / Founder",
  },
  "Execution Acceleration": {
    title: "Run a Focused Sprint to Get Back on Track",
    rationale: "This deliverable is behind schedule, and delays compound fast — every extra week of slippage costs 2–3 weeks to recover. A short, focused push now prevents a much bigger problem later.",
    action: "Declare a 2-week sprint. Run quick daily check-ins (15 min max). Set clear daily targets. Remove all distractions and low-priority work from the team for the sprint period. Track progress visibly so everyone can see momentum building.",
    behavioralInsight: "Short feedback loops keep energy high. When people see daily progress instead of waiting weeks for results, they stay motivated and course-correct faster.",
    expectedOutcome: "Recover 60–80% of the schedule gap within 2 weeks. Team morale improves through visible progress.",
    timeToImpact: "Immediate",
    owner: "Your team lead or project owner",
  },
  "Structural Remediation": {
    title: "Fix the Root Cause So This Problem Stops Coming Back",
    rationale: "This issue keeps recurring because there's a structural gap underneath it. A quick fix will help temporarily, but until you address the underlying cause, it'll keep resurfacing.",
    action: "Get your team together and define exactly what keeps going wrong and why. Design a simple, lasting fix — a new process, a clearer ownership rule, or a regular check-in. Write it down and assign someone to own it. Review how it's working in 90 days.",
    behavioralInsight: "Structural changes stick best when the people affected help design them. Include your team in the fix — they'll understand the problem better and be more committed to the solution.",
    expectedOutcome: "The root cause is permanently addressed. Your operations become noticeably more reliable within 3–6 months.",
    timeToImpact: "6–12 weeks",
    owner: "You / Founder",
  },
  "Capability Building": {
    title: "Build the Skills Your Team Is Missing",
    rationale: "There's a gap between what your team can do today and what you need them to handle. Closing that gap is the fastest way to unlock the next level of performance.",
    action: "Pinpoint the specific skill or process gap. Create a simple 90-day plan: what to learn, who's responsible, and how you'll measure improvement. Pair it with a real project so people learn by doing. Check progress weekly.",
    behavioralInsight: "People build new skills when three things line up: they understand why it matters, the steps are small enough to follow, and there's a regular nudge to keep practicing. Tie the learning to a real business goal to keep motivation high.",
    expectedOutcome: "Noticeable improvement in team capability within 90 days. Output quality and confidence both go up.",
    timeToImpact: "4–12 weeks",
    owner: "You or your most senior person",
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
export function runAdvisory(diagnoses: DiagnosisResult[], signals: DetectedSignal[], ctx?: OrgContext): {
  recommendations: AdvisoryRecommendation[];
  generatedActions: ActionGenerated[];
} {
  const bias = ctx ? getContextMultipliers(ctx).advisoryBias : {
    prioritizeExecution: false, prioritizeStrategy: false, prioritizeProcess: false,
    prioritizeRisk: false, quarterlyUrgency: false, compressRoadmap: false,
  };
  const recommendations: AdvisoryRecommendation[] = [];
  const generatedActions: ActionGenerated[] = [];

  for (const diag of diagnoses) {
    const signal = signals.find(s => s.id === diag.signalId);
    if (!signal) continue;

    for (const trigger of diag.advisoryTriggers) {
      const template = ADVISORY_TEMPLATES[trigger];
      if (!template) continue;

      let priority: AdvisoryPriority =
        signal.severity === "Critical" ? "Immediate" :
        signal.severity === "High" ? "This Week" :
        signal.severity === "Medium" ? "This Month" : "This Quarter";

      if (bias.quarterlyUrgency && priority === "This Month") priority = "This Week";
      if (bias.compressRoadmap && priority === "This Quarter") priority = "This Month";
      const isExecCategory = trigger === "Execution Acceleration" || trigger === "Resource Reallocation";
      const isStratCategory = trigger === "Strategic Realignment" || trigger === "Initiative Reprioritization";
      const isProcessCategory = trigger === "Process Redesign" || trigger === "Structural Remediation";
      const isRiskCategory = trigger === "Risk Mitigation";
      if (bias.prioritizeExecution && isExecCategory && priority !== "Immediate") priority = "This Week";
      if (bias.prioritizeStrategy && isStratCategory && priority !== "Immediate") priority = "This Week";
      if (bias.prioritizeProcess && isProcessCategory && priority !== "Immediate") priority = "This Week";
      if (bias.prioritizeRisk && isRiskCategory && priority !== "Immediate") priority = "This Week";

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
