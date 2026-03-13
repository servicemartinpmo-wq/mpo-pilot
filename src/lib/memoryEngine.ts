/**
 * MEMORY ENGINE — Lifelong context memory + pattern recognition + prediction
 * [Apphia.Logic] — Persists org events, decisions, signals, and insights across
 * all sessions. Drives the context engine with historical intelligence.
 *
 * Architecture:
 *  - localStorage cache: instant sync reads (MEMORY_CACHE_KEY)
 *  - Supabase persistence: cross-device, permanent record
 *  - Pattern recognition: frequency analysis, seasonal cycles, signal clustering
 *  - Prediction engine: extrapolates from patterns with a confidence score
 */

import { supabase } from "@/integrations/supabase/client";

// ── Types ──────────────────────────────────────────────────────────────────────

export type MemoryEntryType =
  | "event"
  | "decision"
  | "pattern"
  | "prediction"
  | "signal"
  | "insight"
  | "observation"
  | "ai_change"
  | "milestone";

export type MemoryCategory =
  | "finance"
  | "people"
  | "execution"
  | "strategy"
  | "risk"
  | "compliance"
  | "crm"
  | "meetings"
  | "engine"
  | "general";

export interface MemoryEntry {
  id: string;
  entry_type: MemoryEntryType;
  category: MemoryCategory;
  title: string;
  content: Record<string, unknown>;
  metadata: Record<string, unknown>;
  importance: 1 | 2 | 3 | 4 | 5;
  tags: string[];
  source?: string;
  resolved: boolean;
  created_at: string;
  updated_at: string;
}

export interface PatternRecord {
  id: string;
  label: string;
  description: string;
  category: MemoryCategory;
  occurrences: number;
  firstSeen: string;
  lastSeen: string;
  strength: "weak" | "moderate" | "strong" | "dominant";
  confidence: number;
  relatedEntryIds: string[];
  weekdays?: number[];
}

export interface Prediction {
  id: string;
  title: string;
  description: string;
  category: MemoryCategory;
  probability: number;
  horizon: "this-week" | "this-month" | "this-quarter" | "long-term";
  basedOn: string[];
  severity: "low" | "medium" | "high" | "critical";
  createdAt: string;
}

export interface MemorySnapshot {
  entries: MemoryEntry[];
  patterns: PatternRecord[];
  predictions: Prediction[];
  lastUpdated: string;
  totalEntries: number;
}

// ── Constants ──────────────────────────────────────────────────────────────────

const CACHE_KEY = "pmo_org_memory_cache_v1";
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 min cache

const CATEGORY_LABELS: Record<MemoryCategory, string> = {
  finance: "Finance",
  people: "People",
  execution: "Execution",
  strategy: "Strategy",
  risk: "Risk",
  compliance: "Compliance",
  crm: "CRM",
  meetings: "Meetings",
  engine: "Engine",
  general: "General",
};

// ── LocalStorage cache ─────────────────────────────────────────────────────────

interface MemoryCache {
  entries: MemoryEntry[];
  fetchedAt: number;
}

function readCache(): MemoryEntry[] | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const cache: MemoryCache = JSON.parse(raw);
    if (Date.now() - cache.fetchedAt > CACHE_TTL_MS) return null;
    return cache.entries;
  } catch {
    return null;
  }
}

function writeCache(entries: MemoryEntry[]) {
  try {
    const cache: MemoryCache = { entries, fetchedAt: Date.now() };
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
  } catch {}
}

function invalidateCache() {
  try { localStorage.removeItem(CACHE_KEY); } catch {}
}

// ── Supabase CRUD ──────────────────────────────────────────────────────────────

export async function saveMemoryEntry(
  profileId: string,
  entry: Omit<MemoryEntry, "id" | "created_at" | "updated_at" | "resolved">
): Promise<MemoryEntry | null> {
  const { data, error } = await supabase
    .from("org_memory")
    .insert({
      profile_id: profileId,
      entry_type: entry.entry_type,
      category: entry.category,
      title: entry.title,
      content: entry.content,
      metadata: entry.metadata,
      importance: entry.importance,
      tags: entry.tags,
      source: entry.source ?? null,
      resolved: false,
    })
    .select()
    .single();

  if (error) {
    console.warn("[MemoryEngine] Save failed:", error.message);
    return null;
  }
  invalidateCache();
  return data as MemoryEntry;
}

export async function loadMemoryEntries(
  profileId: string,
  options: { limit?: number; category?: MemoryCategory; type?: MemoryEntryType } = {}
): Promise<MemoryEntry[]> {
  // Try cache first for unconstrained reads
  if (!options.category && !options.type) {
    const cached = readCache();
    if (cached) return cached;
  }

  let query = supabase
    .from("org_memory")
    .select("*")
    .eq("profile_id", profileId)
    .order("created_at", { ascending: false })
    .limit(options.limit ?? 200);

  if (options.category) query = query.eq("category", options.category);
  if (options.type) query = query.eq("entry_type", options.type);

  const { data } = await query;
  const entries = (data ?? []) as MemoryEntry[];

  if (!options.category && !options.type) writeCache(entries);
  return entries;
}

export async function deleteMemoryEntry(id: string): Promise<void> {
  await supabase.from("org_memory").delete().eq("id", id);
  invalidateCache();
}

export async function resolveMemoryEntry(id: string): Promise<void> {
  await supabase.from("org_memory").update({ resolved: true }).eq("id", id);
  invalidateCache();
}

// ── Auto-seeding: record notable app events ────────────────────────────────────

/** Call this to automatically record key system events into memory */
export async function recordSystemEvent(
  profileId: string,
  event: {
    title: string;
    category: MemoryCategory;
    importance?: 1 | 2 | 3 | 4 | 5;
    tags?: string[];
    content?: Record<string, unknown>;
    source?: string;
  }
) {
  return saveMemoryEntry(profileId, {
    entry_type: "event",
    category: event.category,
    title: event.title,
    content: event.content ?? {},
    metadata: { recordedAt: new Date().toISOString() },
    importance: event.importance ?? 3,
    tags: event.tags ?? [],
    source: event.source,
  });
}

// ── Pattern Recognition ────────────────────────────────────────────────────────

function strengthFromCount(n: number): PatternRecord["strength"] {
  if (n >= 8) return "dominant";
  if (n >= 5) return "strong";
  if (n >= 3) return "moderate";
  return "weak";
}

function confidenceFromCount(n: number): number {
  return Math.min(0.98, 0.4 + n * 0.09);
}

export function detectPatterns(entries: MemoryEntry[]): PatternRecord[] {
  if (entries.length < 2) return [];
  const patterns: PatternRecord[] = [];

  // ── Pattern 1: Category frequency clusters
  const byCat: Record<string, MemoryEntry[]> = {};
  for (const e of entries) {
    if (!byCat[e.category]) byCat[e.category] = [];
    byCat[e.category].push(e);
  }
  for (const [cat, items] of Object.entries(byCat)) {
    if (items.length < 2) continue;
    const sorted = [...items].sort((a, b) => a.created_at.localeCompare(b.created_at));
    patterns.push({
      id: `pat-cat-${cat}`,
      label: `Recurring ${CATEGORY_LABELS[cat as MemoryCategory] ?? cat} activity`,
      description: `${items.length} memory entries recorded in the ${CATEGORY_LABELS[cat as MemoryCategory] ?? cat} domain — suggesting persistent focus or ongoing challenges.`,
      category: cat as MemoryCategory,
      occurrences: items.length,
      firstSeen: sorted[0].created_at,
      lastSeen: sorted[sorted.length - 1].created_at,
      strength: strengthFromCount(items.length),
      confidence: confidenceFromCount(items.length),
      relatedEntryIds: items.map(i => i.id),
    });
  }

  // ── Pattern 2: High-importance signal clusters
  const highImportance = entries.filter(e => e.importance >= 4);
  if (highImportance.length >= 2) {
    const cats = [...new Set(highImportance.map(e => e.category))];
    patterns.push({
      id: "pat-high-importance",
      label: "Elevated operational urgency",
      description: `${highImportance.length} high-importance entries detected across ${cats.length} domain${cats.length !== 1 ? "s" : ""} (${cats.map(c => CATEGORY_LABELS[c as MemoryCategory] ?? c).join(", ")}). This pattern typically precedes significant decisions or escalations.`,
      category: cats[0] as MemoryCategory ?? "general",
      occurrences: highImportance.length,
      firstSeen: highImportance.at(-1)?.created_at ?? "",
      lastSeen: highImportance[0]?.created_at ?? "",
      strength: strengthFromCount(highImportance.length),
      confidence: confidenceFromCount(highImportance.length),
      relatedEntryIds: highImportance.map(i => i.id),
    });
  }

  // ── Pattern 3: Decision-heavy periods
  const decisions = entries.filter(e => e.entry_type === "decision");
  if (decisions.length >= 2) {
    patterns.push({
      id: "pat-decisions",
      label: "Decision velocity pattern",
      description: `${decisions.length} strategic decisions recorded. Decision density can signal rapid pivots, uncertainty, or strong leadership cadence — depending on outcomes tracked.`,
      category: "strategy",
      occurrences: decisions.length,
      firstSeen: decisions.at(-1)?.created_at ?? "",
      lastSeen: decisions[0]?.created_at ?? "",
      strength: strengthFromCount(decisions.length),
      confidence: confidenceFromCount(decisions.length),
      relatedEntryIds: decisions.map(d => d.id),
    });
  }

  // ── Pattern 4: Signal → unresolved accumulation
  const unresolvedSignals = entries.filter(e => e.entry_type === "signal" && !e.resolved);
  if (unresolvedSignals.length >= 2) {
    patterns.push({
      id: "pat-unresolved-signals",
      label: "Unresolved signal accumulation",
      description: `${unresolvedSignals.length} signals remain unresolved. When signals accumulate without resolution, they indicate structural bottlenecks or delayed response patterns.`,
      category: "risk",
      occurrences: unresolvedSignals.length,
      firstSeen: unresolvedSignals.at(-1)?.created_at ?? "",
      lastSeen: unresolvedSignals[0]?.created_at ?? "",
      strength: strengthFromCount(unresolvedSignals.length),
      confidence: confidenceFromCount(unresolvedSignals.length),
      relatedEntryIds: unresolvedSignals.map(s => s.id),
    });
  }

  // ── Pattern 5: Tag co-occurrence
  const tagCounts: Record<string, number> = {};
  const tagEntries: Record<string, string[]> = {};
  for (const e of entries) {
    for (const tag of e.tags) {
      tagCounts[tag] = (tagCounts[tag] ?? 0) + 1;
      tagEntries[tag] = [...(tagEntries[tag] ?? []), e.id];
    }
  }
  const topTags = Object.entries(tagCounts)
    .filter(([, count]) => count >= 3)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);

  for (const [tag, count] of topTags) {
    patterns.push({
      id: `pat-tag-${tag}`,
      label: `"${tag}" tag cluster`,
      description: `The tag "${tag}" appears across ${count} memory entries, suggesting it is a persistent theme or operational area requiring dedicated attention.`,
      category: "general",
      occurrences: count,
      firstSeen: "",
      lastSeen: "",
      strength: strengthFromCount(count),
      confidence: confidenceFromCount(count),
      relatedEntryIds: tagEntries[tag],
    });
  }

  // Sort by strength then occurrences
  const strengthOrder = { dominant: 4, strong: 3, moderate: 2, weak: 1 };
  return patterns.sort((a, b) =>
    strengthOrder[b.strength] - strengthOrder[a.strength] || b.occurrences - a.occurrences
  );
}

// ── Prediction Engine ──────────────────────────────────────────────────────────

export function generatePredictions(
  patterns: PatternRecord[],
  entries: MemoryEntry[]
): Prediction[] {
  const predictions: Prediction[] = [];
  const now = new Date().toISOString();

  // ── Prediction from dominant finance pattern
  const financePattern = patterns.find(p => p.category === "finance" && p.occurrences >= 3);
  if (financePattern) {
    predictions.push({
      id: "pred-finance-review",
      title: "Finance review cycle likely",
      description: `Based on ${financePattern.occurrences} finance-related memory entries, a budget or expense review cycle is likely approaching. Review cadence is consistent with historical patterns.`,
      category: "finance",
      probability: Math.min(0.92, financePattern.confidence + 0.1),
      horizon: "this-month",
      basedOn: [financePattern.id],
      severity: "medium",
      createdAt: now,
    });
  }

  // ── Prediction from unresolved signals
  const signalPattern = patterns.find(p => p.id === "pat-unresolved-signals");
  if (signalPattern && signalPattern.occurrences >= 3) {
    predictions.push({
      id: "pred-escalation",
      title: "Escalation risk if signals unaddressed",
      description: `${signalPattern.occurrences} unresolved signals detected. If left unaddressed for another cycle, probability of operational escalation rises significantly. Recommend triage session.`,
      category: "risk",
      probability: Math.min(0.88, signalPattern.confidence + 0.15),
      horizon: "this-week",
      basedOn: [signalPattern.id],
      severity: "high",
      createdAt: now,
    });
  }

  // ── Prediction from decision velocity
  const decisionPattern = patterns.find(p => p.id === "pat-decisions");
  if (decisionPattern && decisionPattern.occurrences >= 4) {
    predictions.push({
      id: "pred-decision-fatigue",
      title: "Decision fatigue pattern emerging",
      description: `High decision volume (${decisionPattern.occurrences} logged) may be creating cognitive load on leadership. Delegating tier-2 decisions could reduce cycle time by 30–40%.`,
      category: "people",
      probability: 0.71,
      horizon: "this-quarter",
      basedOn: [decisionPattern.id],
      severity: "medium",
      createdAt: now,
    });
  }

  // ── Prediction from high-importance cluster
  const urgencyPattern = patterns.find(p => p.id === "pat-high-importance");
  if (urgencyPattern && urgencyPattern.occurrences >= 3) {
    predictions.push({
      id: "pred-resource-crunch",
      title: "Resource constraint likely next 30 days",
      description: `Elevated urgency pattern across ${urgencyPattern.occurrences} entries suggests approaching resource or capacity constraint. Proactive allocation review is recommended.`,
      category: "execution",
      probability: Math.min(0.85, urgencyPattern.confidence),
      horizon: "this-month",
      basedOn: [urgencyPattern.id],
      severity: "high",
      createdAt: now,
    });
  }

  // ── Prediction from compliance entries
  const complianceEntries = entries.filter(e => e.category === "compliance" && !e.resolved);
  if (complianceEntries.length >= 2) {
    predictions.push({
      id: "pred-compliance-due",
      title: "Compliance deadline approaching",
      description: `${complianceEntries.length} unresolved compliance memory entries detected. Historical pattern suggests deadlines cluster in 2–4 week windows. Recommend immediate status review.`,
      category: "compliance",
      probability: 0.79,
      horizon: "this-month",
      basedOn: complianceEntries.map(e => e.id),
      severity: "critical",
      createdAt: now,
    });
  }

  // ── Long-term growth prediction from strategy entries
  const strategyEntries = entries.filter(e => e.category === "strategy");
  if (strategyEntries.length >= 3) {
    predictions.push({
      id: "pred-strategic-pivot",
      title: "Strategic realignment cycle due",
      description: `${strategyEntries.length} strategy-category entries suggest active strategic iteration. Based on pattern cadence, a formal realignment review is predicted within the next quarter.`,
      category: "strategy",
      probability: 0.68,
      horizon: "this-quarter",
      basedOn: strategyEntries.map(e => e.id),
      severity: "medium",
      createdAt: now,
    });
  }

  // Sort by probability desc
  return predictions.sort((a, b) => b.probability - a.probability);
}

// ── AI-Assisted Change Processor ───────────────────────────────────────────────

export interface AIChangeResult {
  summary: string;
  changes: { area: string; action: string; impact: string; effort: "low" | "medium" | "high" }[];
  warnings: string[];
  confidence: number;
  memoryNote?: string;
}

/** Process a creator prompt locally using the intelligence engine patterns */
export function processCreatorPrompt(prompt: string): AIChangeResult {
  const p = prompt.toLowerCase();

  // Keyword → change mapping
  const changes: AIChangeResult["changes"] = [];
  const warnings: AIChangeResult["warnings"] = [];
  let confidence = 0.72;

  // Branding
  if (p.includes("brand") || p.includes("name") || p.includes("logo") || p.includes("rename")) {
    changes.push({ area: "Branding", action: "Update org name and sidebar brand label", impact: "Visible to all users on next load", effort: "low" });
  }
  // Color / theme
  if (p.includes("color") || p.includes("accent") || p.includes("theme") || p.includes("dark") || p.includes("purple") || p.includes("blue")) {
    changes.push({ area: "Design", action: "Adjust accent color and/or active theme", impact: "Immediate visual change across all pages", effort: "low" });
  }
  // Signal / engine
  if (p.includes("signal") || p.includes("threshold") || p.includes("sensitivity") || p.includes("engine")) {
    changes.push({ area: "Engine", action: "Tune signal detection thresholds", impact: "Changes which alerts surface on the dashboard", effort: "medium" });
    warnings.push("Lowering thresholds too far can create alert fatigue. Recommend A/B testing with a subset of signals first.");
  }
  // Dashboard / layout
  if (p.includes("dashboard") || p.includes("layout") || p.includes("sidebar") || p.includes("nav")) {
    changes.push({ area: "Layout", action: "Reconfigure dashboard layout or sidebar navigation", impact: "Affects all user navigation flows", effort: "medium" });
    confidence += 0.05;
  }
  // Tier / gating
  if (p.includes("tier") || p.includes("gate") || p.includes("lock") || p.includes("upgrade") || p.includes("premium")) {
    changes.push({ area: "Tier Gating", action: "Adjust feature tier restrictions", impact: "Controls which features free vs paid users see", effort: "low" });
  }
  // AI / model
  if (p.includes("ai") || p.includes("model") || p.includes("gpt") || p.includes("intelligence")) {
    changes.push({ area: "AI Engine", action: "Tune AI system chain parameters or enable additional chains", impact: "Affects quality and coverage of advisory outputs", effort: "high" });
    confidence += 0.08;
  }
  // CRM
  if (p.includes("crm") || p.includes("lead") || p.includes("prospect")) {
    changes.push({ area: "CRM", action: "Update CRM configuration or lead scoring parameters", impact: "Changes how leads are surfaced and prioritized", effort: "low" });
  }
  // Users / access
  if (p.includes("role") || p.includes("access") || p.includes("permission") || p.includes("user")) {
    changes.push({ area: "Access Control", action: "Modify role definitions or access policies", impact: "Security-sensitive — affects what data users can see", effort: "medium" });
    warnings.push("Access control changes should be tested in a non-production environment before applying broadly.");
  }
  // Performance
  if (p.includes("performance") || p.includes("speed") || p.includes("cache") || p.includes("optimize")) {
    changes.push({ area: "Performance", action: "Apply caching or query optimization strategies", impact: "Reduces load time and improves user experience", effort: "high" });
  }

  // Fallback if nothing matched
  if (changes.length === 0) {
    changes.push({
      area: "General",
      action: "Log instruction for manual review",
      impact: "Requires human interpretation — no automated change applied",
      effort: "low",
    });
    confidence = 0.45;
    warnings.push("Prompt did not match known change patterns. Storing in memory for manual review.");
  }

  return {
    summary: `Identified ${changes.length} potential change${changes.length !== 1 ? "s" : ""} from your instruction. Review and apply individually or all at once.`,
    changes,
    warnings,
    confidence: Math.min(0.98, confidence),
    memoryNote: `Creator prompt processed: "${prompt.slice(0, 80)}${prompt.length > 80 ? "…" : ""}"`,
  };
}

// ── Full snapshot (for Creator Lab) ───────────────────────────────────────────

export async function loadMemorySnapshot(profileId: string): Promise<MemorySnapshot> {
  const entries = await loadMemoryEntries(profileId, { limit: 200 });
  const patterns = detectPatterns(entries);
  const predictions = generatePredictions(patterns, entries);
  return {
    entries,
    patterns,
    predictions,
    lastUpdated: new Date().toISOString(),
    totalEntries: entries.length,
  };
}
