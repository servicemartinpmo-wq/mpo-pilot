/**
 * Apphia Walkthrough Scripts
 * Context-aware guided tour scripts for each section of the command center.
 * Narration text embeds real org data so explanations are always accurate.
 */
import type { WalkthroughScript } from "@/components/WalkthroughPlayer";

export interface WalkthroughCtx {
  healthScore: number;
  overdue: number;
  blocked: number;
  atRisk: number;
  delayed: number;
  orgName: string;
}

// ── Org Health / Diagnostics ────────────────────────────────────────────
export function orgHealthWalkthrough(ctx: WalkthroughCtx): WalkthroughScript {
  const level = ctx.healthScore >= 70 ? "strong" : ctx.healthScore >= 50 ? "developing" : "needs foundational work";
  const levelAdvice = ctx.healthScore >= 70
    ? "Your focus should be on scaling and optimizing what's working."
    : ctx.healthScore >= 50
      ? "You have a solid base — target the weakest dimensions to gain the most ground."
      : "Prioritize foundational systems: clear ownership, documented processes, and consistent review cadences.";

  return {
    id: "org-health",
    title: "Org Health Score Explained",
    subtitle: "Live diagnostic walkthrough · Martin PMO",
    steps: [
      {
        id: "s1",
        title: "Your Operational Health Score",
        narration: `${ctx.orgName}'s organizational health score is ${ctx.healthScore} out of 100 — rated ${level}. This composite score is calculated from 6 operational dimensions that reflect how well-structured, governed, and execution-ready your organization is.`,
        selector: "[data-walkthrough='health-score'], .org-health-score, [class*='health'] [class*='score']",
        region: { x: 18, y: 8, w: 60, h: 22 },
        duration: 8000,
      },
      {
        id: "s2",
        title: "What Your Score Means",
        narration: levelAdvice + ` Scores in the range of ${ctx.healthScore} typically indicate ${ctx.healthScore >= 70 ? "mature processes, clear accountability structures, and strong execution velocity" : ctx.healthScore >= 50 ? "some documented processes but gaps in consistency, accountability, or measurement" : "informal or undocumented processes that create execution risk"}.`,
        region: { x: 18, y: 28, w: 78, h: 22 },
        duration: 8000,
      },
      {
        id: "s3",
        title: "The 6 Operational Dimensions",
        narration: "Your score is built from six pillars: Strategy Alignment, Execution Capability, Team & Culture, Financial Governance, Customer Intelligence, and Technology Readiness. Each dimension is independently weighted. Weak scores in one area pull down your overall composite.",
        region: { x: 18, y: 46, w: 80, h: 32 },
        duration: 8000,
      },
      {
        id: "s4",
        title: "Active Signals Impacting Your Score",
        narration: ctx.overdue > 0 || ctx.blocked > 0
          ? `Right now ${ctx.overdue} overdue action item${ctx.overdue !== 1 ? "s" : ""} and ${ctx.blocked} blocked initiative${ctx.blocked !== 1 ? "s" : ""} are signals that reduce your execution score. Every overdue item signals a breakdown in follow-through — resolving them directly improves your health rating.`
          : `Your action items and initiatives are currently in good standing — no overdue or blocked items dragging your score down. Keep this rhythm to maintain or improve your ${ctx.healthScore} score.`,
        region: { x: 18, y: 60, w: 78, h: 24 },
        duration: 8000,
      },
      {
        id: "s5",
        title: "How to Improve Your Score",
        narration: `To move your score from ${ctx.healthScore} toward 80+: resolve overdue action items quickly, unblock stalled initiatives, document your top 5 department processes as SOPs, and establish weekly executive review cadences. Each of these directly feeds the health score algorithm.`,
        region: { x: 18, y: 74, w: 78, h: 22 },
        duration: 8000,
      },
    ],
  };
}

// ── Initiative Portfolio ────────────────────────────────────────────────
export function initiativesWalkthrough(ctx: WalkthroughCtx): WalkthroughScript {
  return {
    id: "initiatives",
    title: "Initiative Portfolio Review",
    subtitle: "Visual status walkthrough · Martin PMO",
    steps: [
      {
        id: "s1",
        title: "Your Strategic Portfolio",
        narration: `This is your full initiative portfolio — the strategic bets ${ctx.orgName} is executing right now. Each initiative represents a significant commitment of time, money, and people. Keeping this view current is essential for executive decision-making.`,
        region: { x: 18, y: 8, w: 78, h: 20 },
        duration: 7000,
      },
      {
        id: "s2",
        title: "Initiative Health at a Glance",
        narration: "Each card shows the status, priority score, strategic alignment rating, and owner. The color coding is intentional — green means on track, amber means attention needed, red means actively blocked. Don't let red items sit without an owner taking action.",
        region: { x: 18, y: 26, w: 78, h: 38 },
        duration: 8000,
      },
      {
        id: "s3",
        title: `${ctx.blocked} Blocked Initiative${ctx.blocked !== 1 ? "s" : ""} Right Now`,
        narration: ctx.blocked > 0
          ? `You have ${ctx.blocked} blocked initiative${ctx.blocked !== 1 ? "s" : ""}. A blocked initiative means something external is preventing progress — a missing decision, a resource constraint, or an unresolved dependency. Blocked items need your direct intervention. They don't resolve themselves.`
          : "No blocked initiatives right now. This is a strong signal — it means your team has clear ownership and is escalating blockers appropriately. Maintain this by reviewing blockers at least weekly.",
        region: { x: 18, y: 38, w: 78, h: 32 },
        duration: 8000,
      },
      {
        id: "s4",
        title: "At-Risk Signals",
        narration: ctx.atRisk > 0
          ? `${ctx.atRisk} initiative${ctx.atRisk !== 1 ? "s are" : " is"} flagged at risk. At-risk doesn't mean broken yet — it means the warning signs are there. Delayed milestones, dependency slippage, or team capacity issues. These need a proactive check-in now before they become blocked.`
          : "No at-risk initiatives. Your portfolio is tracking well. Continue weekly status reviews to catch early warning signs before they escalate.",
        region: { x: 18, y: 52, w: 78, h: 28 },
        duration: 7000,
      },
      {
        id: "s5",
        title: "Priority Scoring — How Initiatives Get Ranked",
        narration: "Priority scores are calculated from strategic alignment, business impact, implementation cost, and urgency. A high priority score means this initiative is both strategically important and executable now. Low-priority items should be deprioritized or deferred unless they're compliance or risk-related.",
        region: { x: 18, y: 64, w: 78, h: 26 },
        duration: 8000,
      },
    ],
  };
}

// ── Reports / KPI Performance ───────────────────────────────────────────
export function reportsWalkthrough(ctx: WalkthroughCtx): WalkthroughScript {
  return {
    id: "reports",
    title: "Performance Report Explained",
    subtitle: "KPI and metric walkthrough · Martin PMO",
    steps: [
      {
        id: "s1",
        title: "Executive Performance Overview",
        narration: `This is your real-time executive dashboard — a consolidated view of ${ctx.orgName}'s performance across revenue, operations, customers, and team metrics. Each number tells part of a bigger story. Let me walk you through what matters most.`,
        region: { x: 18, y: 8, w: 78, h: 20 },
        duration: 7000,
      },
      {
        id: "s2",
        title: "Trend Indicators — The Arrows Matter",
        narration: "The trend arrows show direction over the last 30 days. An upward green arrow means the metric is improving. A flat or downward red arrow requires investigation. Don't just look at the current number — look at the direction. A good number trending downward is a warning sign.",
        region: { x: 18, y: 26, w: 78, h: 28 },
        duration: 8000,
      },
      {
        id: "s3",
        title: "KPIs vs. Targets — The Gap Analysis",
        narration: "Every KPI is benchmarked against a target. The gap between actual and target reveals your execution effectiveness. A consistent shortfall in the same KPI over multiple periods suggests either the target is wrong or the process generating that metric needs intervention.",
        region: { x: 18, y: 46, w: 78, h: 28 },
        duration: 8000,
      },
      {
        id: "s4",
        title: "Departmental Contribution",
        narration: "Each department's metrics roll up to the executive view. Poor performance in Operations cascades into customer and revenue metrics. That's the most common pattern in high-growth companies — the ops bottleneck surfaces in revenue 60 to 90 days later. This view lets you catch it early.",
        region: { x: 18, y: 60, w: 78, h: 28 },
        duration: 8000,
      },
      {
        id: "s5",
        title: "What to Review Weekly",
        narration: "Your recommended weekly review sequence: Start with revenue and pipeline health, check operational efficiency KPIs, review customer satisfaction signals, then inspect team capacity. That 10-minute weekly review is the single highest-leverage executive habit for performance management.",
        region: { x: 18, y: 72, w: 78, h: 22 },
        duration: 7000,
      },
    ],
  };
}

// ── Decisions Queue ─────────────────────────────────────────────────────
export function decisionsWalkthrough(ctx: WalkthroughCtx): WalkthroughScript {
  return {
    id: "decisions",
    title: "Decision Queue Walkthrough",
    subtitle: "Decision management · Martin PMO",
    steps: [
      {
        id: "s1",
        title: "Your Decision Register",
        narration: `The Decision Register is one of the most high-leverage tools for ${ctx.orgName}. Every major decision your organization makes should be logged here — with the decision owner, the rationale, the alternatives considered, and the outcome. This creates organizational memory.`,
        region: { x: 18, y: 8, w: 78, h: 20 },
        duration: 7000,
      },
      {
        id: "s2",
        title: "Why Unresolved Decisions Are Expensive",
        narration: "An unresolved decision is a silent tax on your team. People waiting on a decision can't move forward — they hold work in progress, duplicate effort, or make unauthorized micro-decisions that are harder to reverse. Every day a decision sits unresolved, the cost compounds.",
        region: { x: 18, y: 26, w: 78, h: 28 },
        duration: 8000,
      },
      {
        id: "s3",
        title: "Decision Frameworks — When to Use Each",
        narration: "Use a Decision Matrix for choices with multiple competing options and weighted criteria. Use SPADE for strategic, high-stakes, or controversial decisions that need buy-in. Use RAPID for decisions involving cross-functional teams where roles need to be clearly defined. The framework isn't bureaucracy — it's speed.",
        region: { x: 18, y: 46, w: 78, h: 30 },
        duration: 9000,
      },
      {
        id: "s4",
        title: "Tracking Decision Outcomes",
        narration: "Logging outcomes is what separates organizations that learn from organizations that repeat mistakes. When you can review 12 months of decisions and their outcomes, you start to see patterns — what types of decisions you get right consistently, and where you tend to underestimate.",
        region: { x: 18, y: 68, w: 78, h: 24 },
        duration: 7000,
      },
    ],
  };
}

// ── Action Items / Execution ────────────────────────────────────────────
export function actionItemsWalkthrough(ctx: WalkthroughCtx): WalkthroughScript {
  return {
    id: "action-items",
    title: "Action Item Execution Review",
    subtitle: "Execution health walkthrough · Martin PMO",
    steps: [
      {
        id: "s1",
        title: "Your Execution Layer",
        narration: `Action items are the atomic units of your org's execution. ${ctx.overdue > 0 ? `Right now ${ctx.overdue} of them are overdue — that's execution debt accumulating in real time.` : "Currently all items are on track — your team is executing well."} What you'll see here is the gap between what was committed and what's getting done.`,
        region: { x: 18, y: 8, w: 78, h: 20 },
        duration: 7000,
      },
      {
        id: "s2",
        title: "Priority and Ownership",
        narration: "Every action item has a priority level and an owner. The single most important field is the owner. If an action item has no owner, it has no accountability — and it will not get done. Review items without assigned owners first. Those are your highest risk items.",
        region: { x: 18, y: 26, w: 78, h: 32 },
        duration: 8000,
      },
      {
        id: "s3",
        title: `Overdue Items — What They Signal`,
        narration: ctx.overdue > 0
          ? `You have ${ctx.overdue} overdue item${ctx.overdue !== 1 ? "s" : ""}. Overdue items aren't just missed deadlines — they're signals about capacity, clarity, or priority conflicts. The most common causes: the item was unclear, the owner didn't have capacity, or a blocker wasn't surfaced. Each needs a different resolution.`
          : "No overdue items — your team is executing at a high level. Protect this by keeping action items specific, time-bound, and assigned to a single owner. Vague items with shared ownership are what typically cause overdue accumulation.",
        region: { x: 18, y: 46, w: 78, h: 32 },
        duration: 8000,
      },
      {
        id: "s4",
        title: "The 48-Hour Rule",
        narration: "Best practice: any action item not progressed in 48 hours should be escalated or re-assigned. After 72 hours without update, it becomes a management issue. Use the priority filter to surface items that are both high-priority and overdue — those are your most critical execution gaps.",
        region: { x: 18, y: 68, w: 78, h: 24 },
        duration: 7000,
      },
    ],
  };
}

// ── Workflow System ─────────────────────────────────────────────────────
export function workflowsWalkthrough(ctx: WalkthroughCtx): WalkthroughScript {
  return {
    id: "workflows",
    title: "Workflow System Explained",
    subtitle: "Automation walkthrough · Martin PMO",
    steps: [
      {
        id: "s1",
        title: "What Workflows Do",
        narration: `Workflows are your org's automated operating system. Instead of manually checking every department for status updates, a workflow does it on a schedule — collecting data, generating alerts, and routing actions to the right people. This is how ${ctx.orgName} scales without adding headcount.`,
        region: { x: 18, y: 8, w: 78, h: 20 },
        duration: 7000,
      },
      {
        id: "s2",
        title: "Workflow Categories",
        narration: "Workflows are organized by function: Governance (reviews, audits, reporting), Operations (process execution, escalation), Analytics (data gathering, KPI tracking), Communication (alerts, briefings, notifications), and HR (hiring, onboarding, performance). Each category maps to a core executive concern.",
        region: { x: 18, y: 26, w: 78, h: 30 },
        duration: 8000,
      },
      {
        id: "s3",
        title: "Packages — Bundled Workflow Sets",
        narration: "Packages combine multiple related workflows into a single deployment. A 'Weekly Governance Bundle' might include a status review workflow, an escalation workflow, and a performance report workflow — all running in sequence. Packages reduce setup time and ensure workflows that depend on each other stay coordinated.",
        region: { x: 18, y: 48, w: 78, h: 30 },
        duration: 8000,
      },
      {
        id: "s4",
        title: `Recommended for ${ctx.orgName} Right Now`,
        narration: ctx.overdue > 0 || ctx.blocked > 0
          ? `Given your ${ctx.overdue} overdue items and ${ctx.blocked} blocked initiatives, I'd recommend activating the Action Item Escalation workflow and the Issue Resolution workflow immediately. These will automatically surface stalled items and route them to the right decision-makers.`
          : `With your org in a healthy state, I'd focus on the Weekly Governance Bundle to maintain your rhythm, and the KPI Tracking workflow to get ahead of any performance shifts before they become problems.`,
        region: { x: 18, y: 66, w: 78, h: 28 },
        duration: 8000,
      },
    ],
  };
}

// ── Relationships / System Connections ─────────────────────────────────
export function systemRelationshipsWalkthrough(_ctx: WalkthroughCtx): WalkthroughScript {
  return {
    id: "relationships",
    title: "How Everything Connects",
    subtitle: "System architecture walkthrough · Martin PMO",
    steps: [
      {
        id: "s1",
        title: "Your Command Center — One Connected System",
        narration: "Every module in your PMO Command Center feeds into the others. This isn't a collection of separate tools — it's one integrated intelligence system. Let me show you how the key modules connect and how decisions in one area ripple through the whole organization.",
        region: { x: 8, y: 8, w: 84, h: 20 },
        duration: 7000,
      },
      {
        id: "s2",
        title: "Diagnostics → Health Score → Everything",
        narration: "Diagnostics is the foundation. Your answers to the diagnostic questions generate your health score, which then powers the recommendations shown in Advisory, the suggested workflows in Workflows, and the priority calculations for your Initiatives. Change your diagnostic data, and the whole system recalibrates.",
        region: { x: 8, y: 26, w: 84, h: 28 },
        duration: 8000,
      },
      {
        id: "s3",
        title: "Action Items ↔ Initiatives ↔ Departments",
        narration: "Action items are the execution layer of your initiatives. Each initiative breaks down into action items assigned to departments. When an action item is blocked or overdue, it creates upstream risk for the initiative and, by extension, your strategic goals. This is why individual task health matters at the executive level.",
        region: { x: 8, y: 48, w: 84, h: 28 },
        duration: 8000,
      },
      {
        id: "s4",
        title: "Decisions → Knowledge → Future Reference",
        narration: "Decisions you log today become institutional knowledge tomorrow. When a future team member or leader asks 'why did we choose this approach?', the Decision Register has the answer. The Knowledge Hub stores the frameworks and SOPs that govern how those decisions get implemented. Together, they eliminate rediscovery costs.",
        region: { x: 8, y: 60, w: 84, h: 28 },
        duration: 8000,
      },
      {
        id: "s5",
        title: "Reports → Advisory → Strategy Loop",
        narration: "Performance Reports feed the Advisory module with real data, so when your advisors give you a strategic brief, it's grounded in what's actually happening — not assumptions. This creates a closed loop: strategy sets direction, execution tracks progress, reports measure outcomes, advisory adjusts the strategy.",
        region: { x: 8, y: 72, w: 84, h: 22 },
        duration: 8000,
      },
    ],
  };
}

// ── Walkthrough registry ───────────────────────────────────────────────
export type WalkthroughId =
  | "org-health"
  | "initiatives"
  | "reports"
  | "decisions"
  | "action-items"
  | "workflows"
  | "relationships";

export function getWalkthrough(
  id: WalkthroughId,
  ctx: WalkthroughCtx,
): WalkthroughScript {
  switch (id) {
    case "org-health":    return orgHealthWalkthrough(ctx);
    case "initiatives":   return initiativesWalkthrough(ctx);
    case "reports":       return reportsWalkthrough(ctx);
    case "decisions":     return decisionsWalkthrough(ctx);
    case "action-items":  return actionItemsWalkthrough(ctx);
    case "workflows":     return workflowsWalkthrough(ctx);
    case "relationships": return systemRelationshipsWalkthrough(ctx);
  }
}

/** Map page paths to their natural default walkthrough */
export const PAGE_DEFAULT_WALKTHROUGH: Record<string, WalkthroughId> = {
  "/":            "org-health",
  "/diagnostics": "org-health",
  "/initiatives": "initiatives",
  "/reports":     "reports",
  "/decisions":   "decisions",
  "/action-items":"action-items",
  "/workflows":   "workflows",
};
