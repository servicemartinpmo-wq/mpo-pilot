/**
 * supabaseDataService — Live CRUD layer for all org data
 * Replaces static pmoData with real-time Supabase queries.
 */
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

// ── Types derived from DB ────────────────────────────────────────
type DbProfile      = Database["public"]["Tables"]["profiles"]["Row"];
type DbDepartment   = Database["public"]["Tables"]["departments"]["Row"];
type DbInitiative   = Database["public"]["Tables"]["initiatives"]["Row"];
type DbActionItem   = Database["public"]["Tables"]["action_items"]["Row"];
type DbInsight      = Database["public"]["Tables"]["insights"]["Row"];
type DbGovLog       = Database["public"]["Tables"]["governance_logs"]["Row"];
type DbSopRecord    = Database["public"]["Tables"]["sop_records"]["Row"];
type DbOrgMetrics   = Database["public"]["Tables"]["org_metrics"]["Row"];
type DbIntegration  = Database["public"]["Tables"]["integration_connections"]["Row"];

// ─────────────────────────────────────────────────────────────────────
// PROFILE
// ─────────────────────────────────────────────────────────────────────
export async function getProfile(userId: string): Promise<DbProfile | null> {
  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();
  return data;
}

export async function upsertProfile(userId: string, updates: Partial<Omit<DbProfile, "id" | "created_at" | "updated_at">>) {
  const { data, error } = await supabase
    .from("profiles")
    .upsert({ id: userId, ...updates }, { onConflict: "id" })
    .select()
    .single();
  return { data, error };
}

// ─────────────────────────────────────────────────────────────────────
// DEPARTMENTS
// ─────────────────────────────────────────────────────────────────────
export async function getDepartments(profileId: string): Promise<DbDepartment[]> {
  const { data } = await supabase
    .from("departments")
    .select("*")
    .eq("profile_id", profileId)
    .order("name");
  return data ?? [];
}

export async function upsertDepartment(dept: Partial<DbDepartment> & { id: string; profile_id: string; name: string }) {
  return supabase.from("departments").upsert(dept, { onConflict: "id" }).select().single();
}

export async function deleteDepartment(id: string) {
  return supabase.from("departments").delete().eq("id", id);
}

// ─────────────────────────────────────────────────────────────────────
// INITIATIVES
// ─────────────────────────────────────────────────────────────────────
export async function getInitiatives(profileId: string): Promise<DbInitiative[]> {
  const { data } = await supabase
    .from("initiatives")
    .select("*")
    .eq("profile_id", profileId)
    .order("priority_score", { ascending: false });
  return data ?? [];
}

export async function upsertInitiative(ini: Partial<DbInitiative> & { id: string; profile_id: string; name: string }) {
  return supabase.from("initiatives").upsert(ini, { onConflict: "id" }).select().single();
}

export async function updateInitiativeStatus(id: string, status: string) {
  return supabase.from("initiatives").update({ status }).eq("id", id);
}

export async function deleteInitiative(id: string) {
  return supabase.from("initiatives").delete().eq("id", id);
}

// ─────────────────────────────────────────────────────────────────────
// ACTION ITEMS
// ─────────────────────────────────────────────────────────────────────
export async function getActionItems(profileId: string): Promise<DbActionItem[]> {
  const { data } = await supabase
    .from("action_items")
    .select("*")
    .eq("profile_id", profileId)
    .order("due_date", { ascending: true });
  return data ?? [];
}

export async function upsertActionItem(item: Partial<DbActionItem> & { id: string; profile_id: string; title: string }) {
  return supabase.from("action_items").upsert(item, { onConflict: "id" }).select().single();
}

export async function updateActionItemStatus(id: string, status: string) {
  return supabase
    .from("action_items")
    .update({
      status,
      completed_date: status === "Completed" ? new Date().toISOString().split("T")[0] : null,
    })
    .eq("id", id);
}

export async function deleteActionItem(id: string) {
  return supabase.from("action_items").delete().eq("id", id);
}

// ─────────────────────────────────────────────────────────────────────
// INSIGHTS
// ─────────────────────────────────────────────────────────────────────
export async function getInsights(profileId: string): Promise<DbInsight[]> {
  const { data } = await supabase
    .from("insights")
    .select("*")
    .eq("profile_id", profileId)
    .order("executive_priority_score", { ascending: false });
  return data ?? [];
}

export async function upsertInsight(ins: Partial<DbInsight> & { id: string; profile_id: string; type: string }) {
  return supabase.from("insights").upsert(ins, { onConflict: "id" }).select().single();
}

// ─────────────────────────────────────────────────────────────────────
// GOVERNANCE LOGS
// ─────────────────────────────────────────────────────────────────────
export async function getGovernanceLogs(profileId: string): Promise<DbGovLog[]> {
  const { data } = await supabase
    .from("governance_logs")
    .select("*")
    .eq("profile_id", profileId)
    .order("created_at", { ascending: false });
  return data ?? [];
}

export async function upsertGovernanceLog(log: Partial<DbGovLog> & { id: string; profile_id: string; title: string }) {
  return supabase.from("governance_logs").upsert(log, { onConflict: "id" }).select().single();
}

export async function updateGovernanceStatus(id: string, status: string) {
  return supabase.from("governance_logs").update({ status }).eq("id", id);
}

// ─────────────────────────────────────────────────────────────────────
// SOP RECORDS
// ─────────────────────────────────────────────────────────────────────
export async function getSopRecords(profileId: string): Promise<DbSopRecord[]> {
  const { data } = await supabase
    .from("sop_records")
    .select("*")
    .eq("profile_id", profileId)
    .order("title");
  return data ?? [];
}

export async function upsertSopRecord(sop: Partial<DbSopRecord> & { id: string; profile_id: string; title: string }) {
  return supabase.from("sop_records").upsert(sop, { onConflict: "id" }).select().single();
}

// ─────────────────────────────────────────────────────────────────────
// ORG METRICS
// ─────────────────────────────────────────────────────────────────────
export async function getOrgMetrics(profileId: string): Promise<DbOrgMetrics | null> {
  const { data } = await supabase
    .from("org_metrics")
    .select("*")
    .eq("profile_id", profileId)
    .single();
  return data;
}

export async function upsertOrgMetrics(profileId: string, metrics: Partial<Omit<DbOrgMetrics, "id" | "profile_id">>) {
  return supabase
    .from("org_metrics")
    .upsert({ profile_id: profileId, ...metrics }, { onConflict: "profile_id" })
    .select()
    .single();
}

// ─────────────────────────────────────────────────────────────────────
// INTEGRATION CONNECTIONS
// ─────────────────────────────────────────────────────────────────────
export async function getIntegrationConnections(profileId: string): Promise<DbIntegration[]> {
  const { data } = await supabase
    .from("integration_connections")
    .select("*")
    .eq("profile_id", profileId);
  return data ?? [];
}

export async function upsertIntegration(profileId: string, integrationId: string, status: string, config?: Record<string, unknown>) {
  // Use insert with onConflict do update pattern to avoid array overload TS ambiguity
  const { data, error } = await supabase
    .from("integration_connections")
    .upsert(
      [{ profile_id: profileId, integration_id: integrationId, status, config: (config ?? {}) as import("@/integrations/supabase/types").Json }],
      { onConflict: "profile_id,integration_id" }
    )
    .select()
    .maybeSingle();
  return { data, error };
}

export async function removeIntegration(profileId: string, integrationId: string) {
  return supabase
    .from("integration_connections")
    .delete()
    .eq("profile_id", profileId)
    .eq("integration_id", integrationId);
}

// ─────────────────────────────────────────────────────────────────────
// MISSING DELETE OPERATIONS
// ─────────────────────────────────────────────────────────────────────
export async function deleteInsight(id: string) {
  return supabase.from("insights").delete().eq("id", id);
}

export async function deleteSopRecord(id: string) {
  return supabase.from("sop_records").delete().eq("id", id);
}

export async function deleteGovernanceLog(id: string) {
  return supabase.from("governance_logs").delete().eq("id", id);
}

// ─────────────────────────────────────────────────────────────────────
// TEAM MEMBERS (stored as authority_matrix until team_members table exists)
// ─────────────────────────────────────────────────────────────────────
export type DbTeamMember = {
  id: string;
  profile_id: string;
  name: string | null;
  role: string | null;
  department: string | null;
  email: string | null;
  created_at: string;
  updated_at: string;
};

export async function getTeamMembers(profileId: string): Promise<DbTeamMember[]> {
  // team_members table not in schema yet — return empty until migrated
  return [];
}

export async function upsertTeamMember(member: Partial<DbTeamMember>) {
  return { data: null, error: new Error("team_members table not yet created") };
}

export async function deleteTeamMember(id: string) {
  return { data: null, error: new Error("team_members table not yet created") };
}

// ─────────────────────────────────────────────────────────────────────
// CREATOR PROMPTS
// ─────────────────────────────────────────────────────────────────────
export async function logCreatorPrompt(profileId: string, promptText: string, category?: string) {
  return supabase
    .from("creator_prompts")
    .insert({ profile_id: profileId, prompt_text: promptText, category: category ?? "General" });
}

export async function getCreatorPrompts(profileId: string) {
  const { data } = await supabase
    .from("creator_prompts")
    .select("*")
    .eq("profile_id", profileId)
    .order("created_at", { ascending: false })
    .limit(50);
  return data ?? [];
}

// ─────────────────────────────────────────────────────────────────────
// SEED: push pmoData into DB for a new user (called after onboarding)
// ─────────────────────────────────────────────────────────────────────
export async function seedUserData(userId: string) {
  const { departments, initiatives, actionItems, insights, governanceLogs, sopRecords, orgMetrics } =
    await import("@/lib/pmoData");

  const now = new Date().toISOString().split("T")[0];

  // Seed departments
  for (const d of departments) {
    await supabase.from("departments").upsert({
      id: `${userId}-${d.id}`,
      profile_id: userId,
      name: d.name,
      head: d.head,
      headcount: d.headcount,
      capacity_used: d.capacityUsed,
      risk_score: d.riskScore,
      execution_health: d.executionHealth,
      maturity_score: d.maturityScore,
      maturity_tier: d.maturityTier,
      active_initiatives: d.activeInitiatives,
      blocked_tasks: d.blockedTasks,
      signal: d.signal,
      authority_level: d.authorityLevel,
      sop_adherence: d.sopAdherence,
      core_responsibilities: d.coreResponsibilities,
      key_functions: d.keyFunctions,
      decision_rights: d.decisionRights,
      frameworks: d.frameworks,
      key_kpis: d.keyKPIs as unknown as Database["public"]["Tables"]["departments"]["Row"]["key_kpis"],
    }, { onConflict: "id" });
  }

  // Seed initiatives
  for (const ini of initiatives) {
    await supabase.from("initiatives").upsert({
      id: `${userId}-${ini.id}`,
      profile_id: userId,
      name: ini.name,
      department: ini.department,
      category: ini.category,
      owner: ini.owner,
      executive_owner: ini.executiveOwner,
      strategic_pillar: ini.strategicPillar,
      status: ini.status,
      health_status: ini.healthStatus,
      priority_score: ini.priorityScore,
      strategic_alignment: ini.strategicAlignment,
      dependency_risk: ini.dependencyRisk,
      estimated_impact: ini.estimatedImpact,
      budget: ini.budget,
      budget_used: ini.budgetUsed,
      start_date: ini.startDate,
      target_date: ini.targetDate,
      completion_pct: ini.completionPct,
      signal: ini.signal,
      frameworks: ini.frameworks,
      dependencies: ini.dependencies,
      description: ini.description,
      kpis: ini.kpis,
      risks: ini.risks as unknown as Database["public"]["Tables"]["initiatives"]["Row"]["risks"],
      raci: ini.raci as unknown as Database["public"]["Tables"]["initiatives"]["Row"]["raci"],
    }, { onConflict: "id" });
  }

  // Seed action items
  for (const a of actionItems) {
    await supabase.from("action_items").upsert({
      id: `${userId}-${a.id}`,
      profile_id: userId,
      title: a.title,
      initiative_id: `${userId}-${a.initiativeId}`,
      assigned_to: a.assignedTo,
      due_date: a.dueDate,
      status: a.status,
      priority: a.priority,
      description: a.description,
      dependency: a.dependency ?? null,
      completed_date: a.completedDate ?? null,
    }, { onConflict: "id" });
  }

  // Seed insights
  for (const ins of insights) {
    await supabase.from("insights").upsert({
      id: `${userId}-${ins.id}`,
      profile_id: userId,
      type: ins.type,
      department: ins.department,
      situation: ins.situation,
      diagnosis: ins.diagnosis,
      recommendation: ins.recommendation,
      system_remedy: ins.systemRemedy,
      executive_priority_score: ins.executivePriorityScore,
      strategic_impact: ins.strategicImpact,
      urgency: ins.urgency,
      operational_risk: ins.operationalRisk,
      leverage: ins.leverage,
      framework: ins.framework,
      signal: ins.signal,
    }, { onConflict: "id" });
  }

  // Seed governance logs
  for (const g of governanceLogs) {
    await supabase.from("governance_logs").upsert({
      id: `${userId}-${g.id}`,
      profile_id: userId,
      initiative_id: `${userId}-${g.initiativeId}`,
      type: g.type,
      title: g.title,
      severity: g.severity,
      owner: g.owner,
      status: g.status,
      notes: g.notes,
      created_date: g.createdDate ?? now,
    }, { onConflict: "id" });
  }

  // Seed SOP records
  for (const s of sopRecords) {
    await supabase.from("sop_records").upsert({
      id: `${userId}-${s.id}`,
      profile_id: userId,
      title: s.title,
      department: s.department,
      version: s.version,
      status: s.status,
      last_reviewed: s.lastReviewed,
      adherence_rate: s.adherenceRate,
      owner: s.owner,
    }, { onConflict: "id" });
  }

  // Seed org metrics
  await supabase.from("org_metrics").upsert({
    profile_id: userId,
    overall_maturity_score: orgMetrics.overallMaturityScore,
    avg_execution_health: orgMetrics.avgExecutionHealth,
    avg_strategic_alignment: orgMetrics.avgStrategicAlignment,
    avg_sop_adherence: orgMetrics.avgSopAdherence,
    active_initiatives: orgMetrics.activeInitiatives,
    blocked_tasks: orgMetrics.blockedTasks,
    governance_open_items: orgMetrics.governanceOpenItems,
    sop_coverage: orgMetrics.sopCoverage,
    decision_deadlines: orgMetrics.decisionDeadlines,
    total_headcount: orgMetrics.totalHeadcount,
    total_budget_allocated: orgMetrics.totalBudgetAllocated,
    total_budget_used: orgMetrics.totalBudgetUsed,
  }, { onConflict: "profile_id" });
}
