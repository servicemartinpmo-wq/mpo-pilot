/**
 * PMO-OPS FALLBACK DATA LAYER
 * Static templates, rule-based recommendations, and community signals
 * that power the app when the live PMO-Ops engine is unavailable.
 */

// ── Template Categories ───────────────────────────────────────────────────────

export type TemplateCategory = "project-planning" | "marketing" | "portfolio-growth" | "operations";

export interface TemplateItem {
  id: string;
  title: string;
  description: string;
  category: TemplateCategory;
  frequency?: "daily" | "weekly" | "monthly";
  steps: string[];
  estimatedTime?: string;
  icon: string;
}

export const FALLBACK_TEMPLATES: TemplateItem[] = [
  // ── Project Planning ──────────────────────────────────────────────────────
  {
    id: "daily-standup",
    title: "Daily Goal Setting",
    description: "Structure your day with clear priorities and a 3-task focus system.",
    category: "project-planning",
    frequency: "daily",
    icon: "☀️",
    estimatedTime: "10 min",
    steps: [
      "Identify your top 3 priorities for today",
      "Block 90-minute deep-work sessions for each",
      "List potential blockers and pre-solve them",
      "Set a clear end-of-day definition of done",
      "Review yesterday's carry-overs and re-prioritise",
    ],
  },
  {
    id: "weekly-review",
    title: "Weekly Operations Review",
    description: "Assess progress, clear blockers, and align the team for the week ahead.",
    category: "project-planning",
    frequency: "weekly",
    icon: "📋",
    estimatedTime: "45 min",
    steps: [
      "Review all open initiatives and update their status",
      "Flag any items at risk of missing deadlines",
      "Confirm team capacity for the upcoming week",
      "Align on top 3 strategic wins to aim for",
      "Close out completed action items",
      "Document key decisions made this week",
    ],
  },
  {
    id: "monthly-strategy",
    title: "Monthly Strategy Checkpoint",
    description: "Measure quarterly OKR progress and recalibrate if needed.",
    category: "project-planning",
    frequency: "monthly",
    icon: "🎯",
    estimatedTime: "2 hrs",
    steps: [
      "Review all OKRs against current progress percentages",
      "Identify the top 2 gaps and root causes",
      "Conduct a department health review",
      "Evaluate budget vs. actual spend",
      "Update the risk register for any new threats",
      "Set next month's focus areas and communicate to leads",
    ],
  },
  {
    id: "project-kickoff",
    title: "Project Kickoff Checklist",
    description: "Ensure every new initiative launches with clarity, alignment, and accountability.",
    category: "project-planning",
    icon: "🚀",
    estimatedTime: "1 hr",
    steps: [
      "Define the project objective and success metrics",
      "Assign a RACI matrix (Responsible, Accountable, Consulted, Informed)",
      "Set milestones with target dates",
      "Identify dependencies and external blockers",
      "Agree on a communication cadence",
      "Create the first sprint or action plan",
    ],
  },

  // ── Marketing ─────────────────────────────────────────────────────────────
  {
    id: "social-media-campaign",
    title: "Social Media Campaign Plan",
    description: "Build a repeatable content engine for consistent audience growth.",
    category: "marketing",
    frequency: "weekly",
    icon: "📣",
    estimatedTime: "30 min setup",
    steps: [
      "Define the campaign theme and core message",
      "Choose 2–3 platforms based on your audience",
      "Plan content formats: posts, reels, stories, threads",
      "Schedule at least 4 posts per week per platform",
      "Write hooks for each piece (first line/frame does the heavy lifting)",
      "Track engagement rate, reach, and follower growth",
      "Review and adjust weekly based on top-performing posts",
    ],
  },
  {
    id: "community-engagement",
    title: "Community Engagement Playbook",
    description: "Deepen relationships with your audience through authentic interaction.",
    category: "marketing",
    frequency: "daily",
    icon: "🤝",
    estimatedTime: "20 min/day",
    steps: [
      "Reply to every comment and DM within 24 hours",
      "Comment meaningfully on 5 posts from peers or collaborators",
      "Share community wins or user-generated content weekly",
      "Run a poll or question to stimulate audience participation",
      "Feature a community member or collaborator monthly",
    ],
  },
  {
    id: "launch-campaign",
    title: "Product / Release Launch Template",
    description: "Coordinate a multi-channel launch to maximise visibility on day one.",
    category: "marketing",
    icon: "📦",
    estimatedTime: "3–5 days prep",
    steps: [
      "Set a launch date and count-down the major milestones",
      "Prepare teaser content (1 week before)",
      "Draft email announcement to your list",
      "Line up 3 collaborators or partners to amplify the launch",
      "Schedule posts across all channels for launch day",
      "Prepare a FAQ and a clear CTA for every piece",
      "Monitor DMs, comments, and reviews in real-time on day one",
      "Post a results wrap-up 48 hrs after launch",
    ],
  },

  // ── Portfolio Growth ───────────────────────────────────────────────────────
  {
    id: "visibility-growth",
    title: "Visibility & Discovery Guide",
    description: "Step-by-step actions to increase your work's reach and discoverability.",
    category: "portfolio-growth",
    icon: "🔭",
    steps: [
      "Audit your portfolio for SEO — optimise titles, descriptions, and tags",
      "Submit work to at least 2 curated galleries or directories this month",
      "Collaborate with one peer to cross-promote each other's work",
      "Add a clear 'contact / commission' CTA to every portfolio page",
      "Create a highlight reel or best-of compilation",
      "Share the story or process behind a recent piece",
    ],
  },
  {
    id: "audience-building",
    title: "Audience Building Roadmap",
    description: "Systematically grow a loyal audience from 0 to your first 1,000 true fans.",
    category: "portfolio-growth",
    icon: "🌱",
    steps: [
      "Define your niche and ideal audience in one sentence",
      "Pick ONE primary platform and go deep before expanding",
      "Post consistent content 4–5x per week for the first 90 days",
      "Collaborate with 2 creators per month in adjacent niches",
      "Build an email list from day one — use a lead magnet",
      "Document your journey (process videos, behind-the-scenes)",
      "Celebrate milestones publicly to build social proof",
    ],
  },
  {
    id: "monetisation-steps",
    title: "Monetisation Checklist",
    description: "Turn your creative output into sustainable income streams.",
    category: "portfolio-growth",
    icon: "💰",
    steps: [
      "Identify your top 3 monetisation channels (commissions, prints, licensing, etc.)",
      "Set clear pricing tiers for each offering",
      "Create a simple terms-of-service or contract template",
      "Build a professional inquiry / contact form",
      "Set monthly revenue and client targets",
      "Ask every satisfied client for a testimonial",
    ],
  },

  // ── Operations ────────────────────────────────────────────────────────────
  {
    id: "sop-creation",
    title: "SOP Creation Template",
    description: "Document any recurring process so it runs consistently without you.",
    category: "operations",
    icon: "📄",
    estimatedTime: "1–2 hrs per SOP",
    steps: [
      "Name the process and state its purpose in 1–2 sentences",
      "List who owns it and who performs each step",
      "Write each step in plain language (assume the reader is new)",
      "Add screenshots, diagrams, or video walkthroughs where possible",
      "Include edge cases and how to handle them",
      "Set a review date (every 6 months recommended)",
    ],
  },
  {
    id: "capacity-check",
    title: "Team Capacity Check-In",
    description: "Understand actual vs. available bandwidth before committing to new work.",
    category: "operations",
    frequency: "weekly",
    icon: "⚡",
    estimatedTime: "15 min",
    steps: [
      "Ask each team member to rate their capacity (1–10) for next week",
      "Map open tasks to available hours",
      "Identify anyone above 80% capacity and re-distribute",
      "Flag any upcoming PTOs or conflicts",
      "Confirm who owns each active initiative",
    ],
  },
];

// ── Rule-Based Recommendations ────────────────────────────────────────────────

export interface RuleRecommendation {
  id: string;
  signal: string;
  trigger: string;
  action: string;
  priority: "critical" | "high" | "medium" | "low";
  category: string;
  checklist: string[];
}

export const RULE_RECOMMENDATIONS: RuleRecommendation[] = [
  {
    id: "rb-capacity-overload",
    signal: "Capacity Overload",
    trigger: "Team operating above 80% utilisation",
    action: "Reduce scope or add resources immediately",
    priority: "critical",
    category: "Operations",
    checklist: [
      "Identify the top 3 highest-effort open tasks",
      "Defer or cancel any non-critical initiatives",
      "Check if any tasks can be delegated or outsourced",
      "Communicate the scope reduction to stakeholders",
    ],
  },
  {
    id: "rb-missed-deadline",
    signal: "Deadline Risk",
    trigger: "Initiative has no update in the last 7 days",
    action: "Schedule a recovery sprint planning session",
    priority: "high",
    category: "Execution",
    checklist: [
      "Hold a 30-min check-in with the initiative owner",
      "Re-estimate remaining effort honestly",
      "Communicate revised ETA to stakeholders",
      "Break next steps into 2-day micro-milestones",
    ],
  },
  {
    id: "rb-no-strategy",
    signal: "Strategic Drift",
    trigger: "Active initiatives not linked to a strategic pillar",
    action: "Conduct a strategy alignment workshop",
    priority: "high",
    category: "Strategy",
    checklist: [
      "List all active work and tag each with a strategic goal",
      "Retire or pause any work that doesn't map to a goal",
      "Update initiative briefs with clear strategic rationale",
      "Share the updated portfolio view with leadership",
    ],
  },
  {
    id: "rb-low-engagement",
    signal: "Low Engagement Signal",
    trigger: "Community or content engagement below baseline",
    action: "Run a community re-engagement sprint",
    priority: "medium",
    category: "Marketing",
    checklist: [
      "Audit your last 10 posts for format and hook quality",
      "Switch content format (e.g., try video if you've been posting images)",
      "Run a poll to ask your audience what they want to see",
      "Reach out to 5 engaged followers with a personal message",
    ],
  },
  {
    id: "rb-no-sops",
    signal: "Process Risk",
    trigger: "Key workflows undocumented (single point of failure)",
    action: "Document your top 3 critical processes this week",
    priority: "medium",
    category: "Operations",
    checklist: [
      "Identify the 3 processes that would break if you were unavailable",
      "Record a Loom walkthrough for each",
      "Write the step-by-step in a shared doc",
      "Assign ownership to a second person for each process",
    ],
  },
  {
    id: "rb-revenue-plateau",
    signal: "Revenue Plateau",
    trigger: "Revenue flat for 2+ consecutive months",
    action: "Activate a growth experiment this week",
    priority: "medium",
    category: "Growth",
    checklist: [
      "Audit your top 3 revenue sources for untapped potential",
      "Test one new pricing tier or offering",
      "Re-activate lapsed customers with a personal outreach",
      "Launch a limited-time offer to create urgency",
    ],
  },
  {
    id: "rb-team-health",
    signal: "Team Morale Risk",
    trigger: "No team wins celebrated in the last 2 weeks",
    action: "Run a wins retrospective and recognition session",
    priority: "low",
    category: "Leadership",
    checklist: [
      "List every win (no matter how small) from the last 2 weeks",
      "Share the wins in your team channel",
      "Recognise 1–2 individuals publicly",
      "Ask the team what they're proud of",
    ],
  },
];

// ── Community Signals ─────────────────────────────────────────────────────────

export interface CommunitySignal {
  id: string;
  type: "trending" | "spotlight" | "engagement" | "growth";
  title: string;
  description: string;
  metric?: string;
  metricLabel?: string;
  trend: "up" | "down" | "stable";
  trendPercent?: number;
  category: string;
  timestamp: string;
  actionLabel?: string;
}

export const COMMUNITY_SIGNALS: CommunitySignal[] = [
  {
    id: "cs-001",
    type: "trending",
    title: "Short-Form Video Outperforming Static",
    description: "Creators using video content are seeing 3× the reach of static posts this quarter.",
    metric: "3×",
    metricLabel: "reach multiplier",
    trend: "up",
    trendPercent: 210,
    category: "Content Strategy",
    timestamp: "This week",
    actionLabel: "Create video template",
  },
  {
    id: "cs-002",
    type: "spotlight",
    title: "Behind-the-Process Posts Trending",
    description: "Workflow and process content is driving the highest save rates across creative platforms.",
    metric: "+47%",
    metricLabel: "save rate",
    trend: "up",
    trendPercent: 47,
    category: "Content Format",
    timestamp: "This month",
    actionLabel: "Plan process post",
  },
  {
    id: "cs-003",
    type: "engagement",
    title: "Community Q&A Format Driving Replies",
    description: "Posts structured as questions are generating 4× more comments than statements.",
    metric: "4×",
    metricLabel: "comment rate",
    trend: "up",
    trendPercent: 300,
    category: "Engagement",
    timestamp: "This week",
    actionLabel: "Draft a question post",
  },
  {
    id: "cs-004",
    type: "growth",
    title: "Collaborations Accelerating Follower Growth",
    description: "Creators who published at least 1 collab this month grew their audience 2.5× faster.",
    metric: "2.5×",
    metricLabel: "growth rate",
    trend: "up",
    trendPercent: 150,
    category: "Audience Growth",
    timestamp: "This month",
    actionLabel: "Find collaborators",
  },
  {
    id: "cs-005",
    type: "trending",
    title: "Email List Conversions Outpacing Social",
    description: "Email subscribers are converting to paid at 6× the rate of social followers.",
    metric: "6×",
    metricLabel: "conversion rate",
    trend: "up",
    trendPercent: 500,
    category: "Monetisation",
    timestamp: "This quarter",
    actionLabel: "Set up email capture",
  },
  {
    id: "cs-006",
    type: "engagement",
    title: "Peak Posting Times Shifting to Evenings",
    description: "Engagement rates are 38% higher for content posted between 6–9pm in the user's timezone.",
    metric: "+38%",
    metricLabel: "engagement at peak",
    trend: "stable",
    category: "Distribution",
    timestamp: "This week",
    actionLabel: "Adjust posting schedule",
  },
];

// ── Helper: get templates by category ────────────────────────────────────────

export function getTemplatesByCategory(category: TemplateCategory): TemplateItem[] {
  return FALLBACK_TEMPLATES.filter((t) => t.category === category);
}

export function getRecommendationsByPriority(priority: RuleRecommendation["priority"]): RuleRecommendation[] {
  return RULE_RECOMMENDATIONS.filter((r) => r.priority === priority);
}

export const CATEGORY_META: Record<TemplateCategory, { label: string; icon: string; description: string }> = {
  "project-planning": {
    label: "Project Planning",
    icon: "📋",
    description: "Daily, weekly, and monthly planning frameworks",
  },
  marketing: {
    label: "Marketing & Campaigns",
    icon: "📣",
    description: "Social media, community engagement, and launch playbooks",
  },
  "portfolio-growth": {
    label: "Portfolio & Growth",
    icon: "🌱",
    description: "Visibility, audience building, and monetisation guides",
  },
  operations: {
    label: "Operations",
    icon: "⚙️",
    description: "SOPs, capacity planning, and process documentation",
  },
};
