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
type DbTeamMember   = Database["public"]["Tables"]["team_members"]["Row"];
type DbProject      = Database["public"]["Tables"]["projects"]["Row"];
type DbKpi          = Database["public"]["Tables"]["kpis"]["Row"];
type DbKpiHistory   = Database["public"]["Tables"]["kpi_history"]["Row"];
type DbMilestone    = Database["public"]["Tables"]["milestones"]["Row"];
type DbRisk         = Database["public"]["Tables"]["risks"]["Row"];
type DbDependency   = Database["public"]["Tables"]["dependencies"]["Row"];
type DbSignal       = Database["public"]["Tables"]["signals"]["Row"];
type DbSignalDef    = Database["public"]["Tables"]["signal_definitions"]["Row"];
type DbAdvisory     = Database["public"]["Tables"]["advisories"]["Row"];
type DbNotification = Database["public"]["Tables"]["notifications"]["Row"];
type DbActivityFeed = Database["public"]["Tables"]["activity_feed"]["Row"];
type DbNextBestAction = Database["public"]["Tables"]["next_best_actions"]["Row"];
type DbKnowledgeItem  = Database["public"]["Tables"]["knowledge_items"]["Row"];
type DbFramework      = Database["public"]["Tables"]["frameworks"]["Row"];
type DbAlert          = Database["public"]["Tables"]["alerts"]["Row"];
type DbWorkflowRun    = Database["public"]["Tables"]["workflow_runs"]["Row"];
type DbAiCallLog      = Database["public"]["Tables"]["ai_call_logs"]["Row"];
type DbOrganization   = Database["public"]["Tables"]["organizations"]["Row"];
type DbOrgMember      = Database["public"]["Tables"]["organization_members"]["Row"];
type DbTeam           = Database["public"]["Tables"]["teams"]["Row"];

export type {
  DbProfile, DbDepartment, DbInitiative, DbActionItem, DbInsight,
  DbGovLog, DbSopRecord, DbOrgMetrics, DbIntegration, DbTeamMember,
  DbProject, DbKpi, DbKpiHistory, DbMilestone, DbRisk, DbDependency,
  DbSignal, DbSignalDef, DbAdvisory, DbNotification, DbActivityFeed,
  DbNextBestAction, DbKnowledgeItem, DbFramework, DbAlert, DbWorkflowRun,
  DbAiCallLog, DbOrganization, DbOrgMember, DbTeam,
};

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
// Remote table uses `user_id` (not `profile_id`) and `completed_at` (not `completed_date`)
// ─────────────────────────────────────────────────────────────────────
export async function getActionItems(userId: string): Promise<DbActionItem[]> {
  const { data } = await supabase
    .from("action_items")
    .select("*")
    .or(`user_id.eq.${userId},owner_id.eq.${userId},assigned_to.eq.${userId}`)
    .order("due_date", { ascending: true });
  return data ?? [];
}

export async function getActionItemsByInitiative(initiativeId: string): Promise<DbActionItem[]> {
  const { data } = await supabase
    .from("action_items")
    .select("*")
    .eq("initiative_id", initiativeId)
    .order("due_date", { ascending: true });
  return data ?? [];
}

export async function upsertActionItem(item: Partial<DbActionItem> & { title: string }) {
  return supabase.from("action_items").upsert(item, { onConflict: "id" }).select().single();
}

export async function updateActionItemStatus(id: string, status: string) {
  return supabase
    .from("action_items")
    .update({
      status,
      completed_at: status === "Completed" ? new Date().toISOString() : null,
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

export async function deleteInsight(id: string) {
  return supabase.from("insights").delete().eq("id", id);
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

export async function deleteGovernanceLog(id: string) {
  return supabase.from("governance_logs").delete().eq("id", id);
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

export async function deleteSopRecord(id: string) {
  return supabase.from("sop_records").delete().eq("id", id);
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
  const { data, error } = await supabase
    .from("integration_connections")
    .upsert(
      [{ profile_id: profileId, integration_id: integrationId, status, config: (config ?? {}) as Database["public"]["Tables"]["integration_connections"]["Row"]["config"] }],
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
// TEAM MEMBERS
// ─────────────────────────────────────────────────────────────────────
export async function getTeamMembers(profileId: string): Promise<DbTeamMember[]> {
  const { data } = await supabase
    .from("team_members")
    .select("*")
    .eq("profile_id", profileId)
    .order("name");
  return data ?? [];
}

export async function upsertTeamMember(member: Partial<DbTeamMember> & { id: string; profile_id: string; name: string; role: string }) {
  return supabase.from("team_members").upsert(member, { onConflict: "id" }).select().single();
}

export async function deleteTeamMember(id: string) {
  return supabase.from("team_members").delete().eq("id", id);
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
// PROJECTS
// ─────────────────────────────────────────────────────────────────────
export async function getProjects(userId: string): Promise<DbProject[]> {
  const { data } = await supabase
    .from("projects")
    .select("*")
    .or(`owner_id.eq.${userId},profile_id.eq.${userId}`)
    .order("created_at", { ascending: false });
  return data ?? [];
}

export async function getProject(id: string): Promise<DbProject | null> {
  const { data } = await supabase.from("projects").select("*").eq("id", id).single();
  return data;
}

export async function upsertProject(project: Partial<DbProject> & { name: string }) {
  return supabase.from("projects").upsert(project, { onConflict: "id" }).select().single();
}

export async function deleteProject(id: string) {
  return supabase.from("projects").delete().eq("id", id);
}

// ─────────────────────────────────────────────────────────────────────
// KPIs
// ─────────────────────────────────────────────────────────────────────
export async function getKpis(options: { projectId?: string; organizationId?: string; profileId?: string } = {}): Promise<DbKpi[]> {
  let q = supabase.from("kpis").select("*").order("created_at", { ascending: false });
  if (options.projectId)      q = q.eq("project_id", options.projectId);
  if (options.organizationId) q = q.eq("organization_id", options.organizationId);
  if (options.profileId)      q = q.eq("profile_id", options.profileId);
  const { data } = await q;
  return data ?? [];
}

export async function upsertKpi(kpi: Partial<DbKpi> & { name: string }) {
  return supabase.from("kpis").upsert(kpi, { onConflict: "id" }).select().single();
}

export async function updateKpiValue(id: string, currentValue: number) {
  return supabase.from("kpis").update({ current_value: currentValue }).eq("id", id);
}

export async function deleteKpi(id: string) {
  return supabase.from("kpis").delete().eq("id", id);
}

export async function getKpiHistory(kpiId: string): Promise<DbKpiHistory[]> {
  const { data } = await supabase
    .from("kpi_history")
    .select("*")
    .eq("kpi_id", kpiId)
    .order("measured_at", { ascending: false })
    .limit(100);
  return data ?? [];
}

// ─────────────────────────────────────────────────────────────────────
// MILESTONES
// ─────────────────────────────────────────────────────────────────────
export async function getMilestones(options: { projectId?: string; initiativeId?: string; profileId?: string } = {}): Promise<DbMilestone[]> {
  let q = supabase.from("milestones").select("*").order("due_date", { ascending: true });
  if (options.projectId)    q = q.eq("project_id", options.projectId);
  if (options.initiativeId) q = q.eq("initiative_id", options.initiativeId);
  if (options.profileId)    q = q.eq("profile_id", options.profileId);
  const { data } = await q;
  return data ?? [];
}

export async function upsertMilestone(milestone: Partial<DbMilestone> & { title: string }) {
  return supabase.from("milestones").upsert(milestone, { onConflict: "id" }).select().single();
}

export async function deleteMilestone(id: string) {
  return supabase.from("milestones").delete().eq("id", id);
}

// ─────────────────────────────────────────────────────────────────────
// RISKS
// ─────────────────────────────────────────────────────────────────────
export async function getRisks(options: { initiativeId?: string; organizationId?: string; profileId?: string } = {}): Promise<DbRisk[]> {
  let q = supabase.from("risks").select("*").order("created_at", { ascending: false });
  if (options.initiativeId)   q = q.eq("initiative_id", options.initiativeId);
  if (options.organizationId) q = q.eq("organization_id", options.organizationId);
  if (options.profileId)      q = q.eq("profile_id", options.profileId);
  const { data } = await q;
  return data ?? [];
}

export async function upsertRisk(risk: Partial<DbRisk> & { title: string }) {
  return supabase.from("risks").upsert(risk, { onConflict: "id" }).select().single();
}

export async function deleteRisk(id: string) {
  return supabase.from("risks").delete().eq("id", id);
}

// ─────────────────────────────────────────────────────────────────────
// DEPENDENCIES
// ─────────────────────────────────────────────────────────────────────
export async function getDependencies(profileId: string): Promise<DbDependency[]> {
  const { data } = await supabase
    .from("dependencies")
    .select("*")
    .eq("profile_id", profileId);
  return data ?? [];
}

export async function upsertDependency(dep: Partial<DbDependency> & { dependent_id: string; depends_on_id: string }) {
  return supabase.from("dependencies").upsert(dep, { onConflict: "id" }).select().single();
}

export async function deleteDependency(id: string) {
  return supabase.from("dependencies").delete().eq("id", id);
}

// ─────────────────────────────────────────────────────────────────────
// SIGNALS
// ─────────────────────────────────────────────────────────────────────
export async function getSignalDefinitions(profileId: string): Promise<DbSignalDef[]> {
  const { data } = await supabase
    .from("signal_definitions")
    .select("*")
    .eq("profile_id", profileId);
  return data ?? [];
}

export async function upsertSignalDefinition(def: Partial<DbSignalDef> & { name: string }) {
  return supabase.from("signal_definitions").upsert(def, { onConflict: "id" }).select().single();
}

export async function getSignals(options: { initiativeId?: string; profileId?: string } = {}): Promise<DbSignal[]> {
  let q = supabase.from("signals").select("*").order("captured_at", { ascending: false });
  if (options.initiativeId) q = q.eq("initiative_id", options.initiativeId);
  if (options.profileId)    q = q.eq("profile_id", options.profileId);
  const { data } = await q;
  return data ?? [];
}

export async function insertSignal(signal: Omit<DbSignal, "id" | "created_at">) {
  return supabase.from("signals").insert(signal).select().single();
}

// ─────────────────────────────────────────────────────────────────────
// ADVISORIES
// ─────────────────────────────────────────────────────────────────────
export async function getAdvisories(options: { profileId?: string; organizationId?: string } = {}): Promise<DbAdvisory[]> {
  let q = supabase.from("advisories").select("*").order("created_at", { ascending: false });
  if (options.profileId)      q = q.eq("profile_id", options.profileId);
  if (options.organizationId) q = q.eq("organization_id", options.organizationId);
  const { data } = await q;
  return data ?? [];
}

export async function upsertAdvisory(advisory: Partial<DbAdvisory> & { title: string }) {
  return supabase.from("advisories").upsert(advisory, { onConflict: "id" }).select().single();
}

export async function updateAdvisoryStatus(id: string, status: string) {
  return supabase.from("advisories").update({ status }).eq("id", id);
}

export async function deleteAdvisory(id: string) {
  return supabase.from("advisories").delete().eq("id", id);
}

// ─────────────────────────────────────────────────────────────────────
// NOTIFICATIONS
// ─────────────────────────────────────────────────────────────────────
export async function getNotifications(userId: string, limit = 50): Promise<DbNotification[]> {
  const { data } = await supabase
    .from("notifications")
    .select("*")
    .or(`recipient_user_id.eq.${userId},user_id.eq.${userId}`)
    .order("created_at", { ascending: false })
    .limit(limit);
  return data ?? [];
}

export async function markNotificationRead(id: string) {
  return supabase.from("notifications").update({ is_read: true }).eq("id", id);
}

export async function markAllNotificationsRead(userId: string) {
  return supabase
    .from("notifications")
    .update({ is_read: true })
    .or(`recipient_user_id.eq.${userId},user_id.eq.${userId}`)
    .eq("is_read", false);
}

export async function getUnreadNotificationCount(userId: string): Promise<number> {
  const { count } = await supabase
    .from("notifications")
    .select("id", { count: "exact", head: true })
    .or(`recipient_user_id.eq.${userId},user_id.eq.${userId}`)
    .eq("is_read", false);
  return count ?? 0;
}

// ─────────────────────────────────────────────────────────────────────
// ACTIVITY FEED
// ─────────────────────────────────────────────────────────────────────
export async function getActivityFeed(userId: string, limit = 50): Promise<DbActivityFeed[]> {
  const { data } = await supabase
    .from("activity_feed")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);
  return data ?? [];
}

export async function logActivity(entry: Omit<DbActivityFeed, "id" | "created_at">) {
  return supabase.from("activity_feed").insert(entry).select().single();
}

// ─────────────────────────────────────────────────────────────────────
// NEXT-BEST ACTIONS
// ─────────────────────────────────────────────────────────────────────
export async function getNextBestActions(userId: string): Promise<DbNextBestAction[]> {
  const { data } = await supabase
    .from("next_best_actions")
    .select("*")
    .eq("user_id", userId)
    .order("rank", { ascending: true });
  return data ?? [];
}

export async function computeNextBestActions(userId: string, topN = 5) {
  return supabase.rpc("upsert_next_best_for_user", { p_user: userId, p_top_n: topN });
}

// ─────────────────────────────────────────────────────────────────────
// KNOWLEDGE ITEMS
// ─────────────────────────────────────────────────────────────────────
export async function getKnowledgeItems(profileId: string): Promise<DbKnowledgeItem[]> {
  const { data } = await supabase
    .from("knowledge_items")
    .select("*")
    .eq("profile_id", profileId)
    .order("created_at", { ascending: false });
  return data ?? [];
}

export async function upsertKnowledgeItem(item: Partial<DbKnowledgeItem> & { title: string }) {
  return supabase.from("knowledge_items").upsert(item, { onConflict: "id" }).select().single();
}

export async function deleteKnowledgeItem(id: string) {
  return supabase.from("knowledge_items").delete().eq("id", id);
}

// ─────────────────────────────────────────────────────────────────────
// FRAMEWORKS
// ─────────────────────────────────────────────────────────────────────
export async function getFrameworks(profileId: string): Promise<DbFramework[]> {
  const { data } = await supabase
    .from("frameworks")
    .select("*")
    .eq("profile_id", profileId)
    .order("name");
  return data ?? [];
}

export async function upsertFramework(fw: Partial<DbFramework> & { name: string }) {
  return supabase.from("frameworks").upsert(fw, { onConflict: "id" }).select().single();
}

export async function deleteFramework(id: string) {
  return supabase.from("frameworks").delete().eq("id", id);
}

// ─────────────────────────────────────────────────────────────────────
// ALERTS
// ─────────────────────────────────────────────────────────────────────
export async function getAlerts(profileId: string): Promise<DbAlert[]> {
  const { data } = await supabase
    .from("alerts")
    .select("*")
    .eq("profile_id", profileId)
    .order("created_at", { ascending: false });
  return data ?? [];
}

export async function dismissAlert(id: number) {
  return supabase.from("alerts").update({ status: "dismissed" }).eq("id", id);
}

// ─────────────────────────────────────────────────────────────────────
// WORKFLOW RUNS
// ─────────────────────────────────────────────────────────────────────
export async function getWorkflowRuns(profileId: string, limit = 20): Promise<DbWorkflowRun[]> {
  const { data } = await supabase
    .from("workflow_runs")
    .select("*")
    .eq("profile_id", profileId)
    .order("created_at", { ascending: false })
    .limit(limit);
  return data ?? [];
}

export async function createWorkflowRun(run: Partial<DbWorkflowRun> & { workflow_id: string }) {
  return supabase.from("workflow_runs").insert(run).select().single();
}

// ─────────────────────────────────────────────────────────────────────
// AI CALL LOGS
// ─────────────────────────────────────────────────────────────────────
export async function logAiCall(entry: Omit<DbAiCallLog, "id" | "created_at">) {
  return supabase.from("ai_call_logs").insert(entry).select().single();
}

export async function getAiCallLogs(userId: string, limit = 50): Promise<DbAiCallLog[]> {
  const { data } = await supabase
    .from("ai_call_logs")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);
  return data ?? [];
}

// ─────────────────────────────────────────────────────────────────────
// ORGANIZATIONS
// ─────────────────────────────────────────────────────────────────────
export async function getOrganizations(userId: string): Promise<DbOrganization[]> {
  const { data } = await supabase
    .from("organizations")
    .select("*, organization_members!inner(user_id)")
    .eq("organization_members.user_id", userId);
  return (data ?? []) as unknown as DbOrganization[];
}

export async function createOrganization(org: Partial<DbOrganization> & { name: string }) {
  return supabase.from("organizations").insert(org).select().single();
}

export async function getOrgMembers(organizationId: string): Promise<DbOrgMember[]> {
  const { data } = await supabase
    .from("organization_members")
    .select("*")
    .eq("organization_id", organizationId);
  return data ?? [];
}

// ─────────────────────────────────────────────────────────────────────
// TEAMS
// ─────────────────────────────────────────────────────────────────────
export async function getTeams(options: { organizationId?: string; profileId?: string } = {}): Promise<DbTeam[]> {
  let q = supabase.from("teams").select("*").order("name");
  if (options.organizationId) q = q.eq("organization_id", options.organizationId);
  if (options.profileId)      q = q.eq("profile_id", options.profileId);
  const { data } = await q;
  return data ?? [];
}

export async function upsertTeam(team: Partial<DbTeam> & { name: string }) {
  return supabase.from("teams").upsert(team, { onConflict: "id" }).select().single();
}

export async function deleteTeam(id: string) {
  return supabase.from("teams").delete().eq("id", id);
}

// ─────────────────────────────────────────────────────────────────────
// DB FUNCTIONS (RPCs)
// ─────────────────────────────────────────────────────────────────────
export async function getInitiativeDetails(initiativeId: string) {
  const { data, error } = await supabase.rpc("get_initiative_details", { p_initiative_id: initiativeId });
  return { data, error };
}

export async function generateDailyPlan(userId: string) {
  const { data, error } = await supabase.rpc("generate_daily_plan", { p_user_id: userId });
  return { data, error };
}

export async function getProjectProgress(projectId: string, completedStatus = "completed") {
  const { data, error } = await supabase.rpc("get_project_progress", {
    p_project_id: projectId,
    p_completed_status: completedStatus,
  });
  return { data, error };
}

export async function getProjectMilestones(projectId: string) {
  const { data, error } = await supabase.rpc("get_project_milestones", { p_project_id: projectId });
  return { data, error };
}

export async function getProjectKpiSummary(projectId: string) {
  const { data, error } = await supabase.rpc("get_project_kpi_summary", { p_project_id: projectId });
  return { data, error };
}

export async function getSignalSummary(initiativeId: string) {
  const { data, error } = await supabase.rpc("get_signal_summary", { p_initiative_id: initiativeId });
  return { data, error };
}

export async function getMilestoneProgress(milestoneId: string) {
  const { data, error } = await supabase.rpc("get_milestone_progress", { p_milestone_id: milestoneId });
  return { data, error };
}

// ─────────────────────────────────────────────────────────────────────
// SEED: push pmoData into DB for a new user (called after onboarding)
// ─────────────────────────────────────────────────────────────────────
export async function seedUserData(userId: string) {
  const { departments, initiatives, actionItems, insights, governanceLogs, sopRecords, orgMetrics } =
    await import("@/lib/pmoData");

  const now = new Date().toISOString().split("T")[0];

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

  for (const a of actionItems) {
    await supabase.from("action_items").upsert({
      id: `${userId}-${a.id}`,
      user_id: userId,
      title: a.title,
      initiative_id: `${userId}-${a.initiativeId}`,
      assigned_to: a.assignedTo,
      due_date: a.dueDate,
      status: a.status,
      priority: a.priority,
      description: a.description,
    }, { onConflict: "id" });
  }

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
