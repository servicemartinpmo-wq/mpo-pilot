import type { ToneMode } from "@/hooks/useUserMode";

export interface NoteSummaryResult {
  title: string;
  summary: string;
  actionItems: string[];
  tags: string[];
  keyDecisions: string[];
}

const ACTION_KEYWORDS = [
  "need to", "should", "must", "will", "action", "follow up",
  "schedule", "assign", "complete", "deliver", "review", "update",
  "create", "send", "prepare", "finalize", "plan", "decide",
  "set up", "implement", "launch", "organize", "coordinate",
  "approve", "confirm", "reach out", "deadline", "by end of",
];

const DECISION_KEYWORDS = [
  "decided", "agreed", "confirmed", "approved", "selected",
  "chose", "committed", "resolved", "concluded", "settled on",
  "will go with", "final answer", "the decision is", "moving forward with",
];

const TAG_RULES: Record<string, string[]> = {
  strategy: ["strategy", "roadmap", "vision", "goal", "objective", "plan", "direction", "alignment"],
  product: ["product", "feature", "release", "launch", "design", "ux", "ui", "prototype", "mvp"],
  finance: ["budget", "revenue", "cost", "financial", "funding", "expense", "forecast", "profit"],
  marketing: ["marketing", "campaign", "brand", "growth", "audience", "funnel", "content", "seo"],
  engineering: ["engineering", "technical", "code", "deploy", "architecture", "api", "infrastructure"],
  team: ["team", "hire", "onboard", "culture", "performance", "hr", "talent", "retention"],
  operations: ["operations", "process", "workflow", "efficiency", "sop", "procedure"],
  sales: ["sales", "pipeline", "deal", "client", "customer", "prospect", "close", "lead"],
  risk: ["risk", "compliance", "audit", "security", "mitigation", "incident"],
};

const TONE_TEMPLATES: Record<ToneMode, { summaryPrefix: string; recapLabel: string; actionLabel: string }> = {
  executive: {
    summaryPrefix: "Executive Summary:",
    recapLabel: "Key Takeaways",
    actionLabel: "Required Actions",
  },
  smb: {
    summaryPrefix: "Meeting Recap:",
    recapLabel: "What We Covered",
    actionLabel: "Next Steps",
  },
  simple: {
    summaryPrefix: "Here's what happened:",
    recapLabel: "Main Points",
    actionLabel: "To-Do List",
  },
};

function extractSentences(text: string): string[] {
  return text
    .split(/[.!?\n]+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 5);
}

function scoreSentenceImportance(sentence: string): number {
  let score = 0;
  const lower = sentence.toLowerCase();
  if (ACTION_KEYWORDS.some((kw) => lower.includes(kw))) score += 3;
  if (DECISION_KEYWORDS.some((kw) => lower.includes(kw))) score += 4;
  if (/\d/.test(sentence)) score += 1;
  if (lower.includes("important") || lower.includes("critical") || lower.includes("priority")) score += 2;
  if (lower.includes("deadline") || lower.includes("by end of") || lower.includes("asap")) score += 2;
  if (sentence.length > 20 && sentence.length < 200) score += 1;
  return score;
}

export function summarizeNoteTranscript(
  rawText: string,
  tone: ToneMode = "smb"
): NoteSummaryResult {
  const sentences = extractSentences(rawText);
  const lowerText = rawText.toLowerCase();
  const template = TONE_TEMPLATES[tone];

  const title = sentences.length > 0
    ? sentences[0].slice(0, 60)
    : `Meeting Notes — ${new Date().toLocaleDateString()}`;

  const scoredSentences = sentences.map((s) => ({
    text: s,
    score: scoreSentenceImportance(s),
  }));

  const keyPoints = scoredSentences
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)
    .map((s) => s.text);

  const actionItems = sentences
    .filter((s) => {
      const lower = s.toLowerCase();
      return ACTION_KEYWORDS.some((kw) => lower.includes(kw));
    })
    .slice(0, 6);

  if (actionItems.length === 0 && sentences.length > 2) {
    actionItems.push(
      `Review and follow up on: ${sentences[1]?.slice(0, 80) ?? "meeting items"}`
    );
  }

  const keyDecisions = sentences
    .filter((s) => {
      const lower = s.toLowerCase();
      return DECISION_KEYWORDS.some((kw) => lower.includes(kw));
    })
    .slice(0, 4);

  const tags = Object.entries(TAG_RULES)
    .filter(([, words]) => words.some((w) => lowerText.includes(w)))
    .map(([tag]) => tag)
    .slice(0, 4);

  if (tags.length === 0) tags.push("general");

  const recapLines = keyPoints.length > 0
    ? keyPoints.map((p) => `- ${p}`)
    : [`- ${sentences[0] ?? "Meeting notes captured."}`];

  const summaryParts = [
    `${template.summaryPrefix}`,
    "",
    `${template.recapLabel}:`,
    ...recapLines,
  ];

  if (keyDecisions.length > 0) {
    summaryParts.push("", "Key Decisions:");
    keyDecisions.forEach((d) => summaryParts.push(`- ${d}`));
  }

  if (actionItems.length > 0) {
    summaryParts.push("", `${template.actionLabel}:`);
    actionItems.forEach((a) => summaryParts.push(`- ${a}`));
  }

  return {
    title,
    summary: summaryParts.join("\n"),
    actionItems,
    tags,
    keyDecisions,
  };
}
