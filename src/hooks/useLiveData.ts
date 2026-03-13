/**
 * useLiveData — React Query hooks for live Supabase data
 * All pages should import from here instead of static pmoData.
 */
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  getDepartments, getInitiatives, getActionItems, getInsights,
  getGovernanceLogs, getSopRecords, getOrgMetrics, getIntegrationConnections,
  updateActionItemStatus, updateInitiativeStatus, updateGovernanceStatus,
  upsertDepartment, upsertInitiative, upsertActionItem, upsertInsight,
  upsertGovernanceLog, deleteActionItem, deleteInitiative, deleteDepartment,
  upsertIntegration, removeIntegration,
  deleteInsight, deleteSopRecord, deleteGovernanceLog,
  getTeamMembers, upsertTeamMember, deleteTeamMember,
  type DbTeamMember,
  getIntegrationBackups, upsertIntegrationBackup, deleteIntegrationBackup,
  getIntegrationSyncLogs, insertSyncLog, updateSyncLog,
  getTechOpsFolders, upsertTechOpsFolder, deleteTechOpsFolder,
  getTechOpsFolderItems, upsertTechOpsFolderItem, deleteTechOpsFolderItem,
  runIntegrationSync,
  type TechOpsBackup, type TechOpsSyncLog, type TechOpsFolder, type TechOpsFolderItem,
} from "@/lib/supabaseDataService";

// ── Get current user ID ──────────────────────────────────────────────
async function getCurrentUserId(): Promise<string | null> {
  const { data: { user } } = await supabase.auth.getUser();
  return user?.id ?? null;
}

// ── Departments ──────────────────────────────────────────────────────
export function useDepartments() {
  return useQuery({
    queryKey: ["departments"],
    queryFn: async () => {
      const uid = await getCurrentUserId();
      if (!uid) return [];
      return getDepartments(uid);
    },
  });
}

export function useUpsertDepartment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dept: Parameters<typeof upsertDepartment>[0]) => upsertDepartment(dept),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["departments"] }),
  });
}

export function useDeleteDepartment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteDepartment(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["departments"] }),
  });
}

// ── Initiatives ──────────────────────────────────────────────────────
export function useInitiatives() {
  return useQuery({
    queryKey: ["initiatives"],
    queryFn: async () => {
      const uid = await getCurrentUserId();
      if (!uid) return [];
      return getInitiatives(uid);
    },
  });
}

export function useUpsertInitiative() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (ini: Parameters<typeof upsertInitiative>[0]) => upsertInitiative(ini),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["initiatives"] }),
  });
}

export function useUpdateInitiativeStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => updateInitiativeStatus(id, status),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["initiatives"] }),
  });
}

export function useDeleteInitiative() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteInitiative(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["initiatives"] }),
  });
}

// ── Action Items ──────────────────────────────────────────────────────
export function useActionItems() {
  return useQuery({
    queryKey: ["action_items"],
    queryFn: async () => {
      const uid = await getCurrentUserId();
      if (!uid) return [];
      return getActionItems(uid);
    },
  });
}

export function useUpsertActionItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (item: Parameters<typeof upsertActionItem>[0]) => upsertActionItem(item),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["action_items"] }),
  });
}

export function useUpdateActionItemStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => updateActionItemStatus(id, status),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["action_items"] }),
  });
}

export function useDeleteActionItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteActionItem(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["action_items"] }),
  });
}

// ── Insights ──────────────────────────────────────────────────────────
export function useInsights() {
  return useQuery({
    queryKey: ["insights"],
    queryFn: async () => {
      const uid = await getCurrentUserId();
      if (!uid) return [];
      return getInsights(uid);
    },
  });
}

export function useUpsertInsight() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (ins: Parameters<typeof upsertInsight>[0]) => upsertInsight(ins),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["insights"] }),
  });
}

// ── Governance Logs ──────────────────────────────────────────────────
export function useGovernanceLogs() {
  return useQuery({
    queryKey: ["governance_logs"],
    queryFn: async () => {
      const uid = await getCurrentUserId();
      if (!uid) return [];
      return getGovernanceLogs(uid);
    },
  });
}

export function useUpsertGovernanceLog() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (log: Parameters<typeof upsertGovernanceLog>[0]) => upsertGovernanceLog(log),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["governance_logs"] }),
  });
}

export function useUpdateGovernanceStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => updateGovernanceStatus(id, status),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["governance_logs"] }),
  });
}

// ── SOP Records ──────────────────────────────────────────────────────
export function useSopRecords() {
  return useQuery({
    queryKey: ["sop_records"],
    queryFn: async () => {
      const uid = await getCurrentUserId();
      if (!uid) return [];
      return getSopRecords(uid);
    },
  });
}

// ── Org Metrics ──────────────────────────────────────────────────────
export function useOrgMetrics() {
  return useQuery({
    queryKey: ["org_metrics"],
    queryFn: async () => {
      const uid = await getCurrentUserId();
      if (!uid) return null;
      return getOrgMetrics(uid);
    },
  });
}

// ── Integration Connections ──────────────────────────────────────────
export function useIntegrationConnections() {
  return useQuery({
    queryKey: ["integration_connections"],
    queryFn: async () => {
      const uid = await getCurrentUserId();
      if (!uid) return [];
      return getIntegrationConnections(uid);
    },
  });
}

export function useUpsertIntegration() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ integrationId, status, config }: { integrationId: string; status: string; config?: Record<string, unknown> }) => {
      const uid = await getCurrentUserId();
      if (!uid) throw new Error("Not authenticated");
      return upsertIntegration(uid, integrationId, status, config);
    },
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: ["integration_connections"] });
      if (variables.status === "connected") {
        const name = variables.integrationId.charAt(0).toUpperCase() + variables.integrationId.slice(1);
        runIntegrationSync("", variables.integrationId, name)
          .then(() => {
            qc.invalidateQueries({ queryKey: ["integration_backups"] });
            qc.invalidateQueries({ queryKey: ["integration_sync_logs"] });
          })
          .catch(() => {});
      }
    },
  });
}

export function useRemoveIntegration() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (integrationId: string) => {
      const uid = await getCurrentUserId();
      if (!uid) throw new Error("Not authenticated");
      return removeIntegration(uid, integrationId);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["integration_connections"] }),
  });
}

// ── Insights delete ───────────────────────────────────────────────────
export function useDeleteInsight() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteInsight(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["insights"] }),
  });
}

// ── SOP Records delete ────────────────────────────────────────────────
export function useDeleteSopRecord() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteSopRecord(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["sop_records"] }),
  });
}

// ── Governance Logs delete ────────────────────────────────────────────
export function useDeleteGovernanceLog() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteGovernanceLog(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["governance_logs"] }),
  });
}

// ── Team Members ──────────────────────────────────────────────────────
export function useTeamMembers() {
  return useQuery({
    queryKey: ["team_members"],
    queryFn: async () => {
      const uid = await getCurrentUserId();
      if (!uid) return [];
      return getTeamMembers(uid);
    },
  });
}

export function useUpsertTeamMember() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (member: Parameters<typeof upsertTeamMember>[0]) => upsertTeamMember(member),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["team_members"] }),
  });
}

export function useDeleteTeamMember() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteTeamMember(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["team_members"] }),
  });
}

// ── Real-time Supabase channel subscriptions ─────────────────────────
// Mount this hook once at the app root (AppLayout) to keep all data live.
export function useRealtimeSync(userId: string | null | undefined) {
  const qc = useQueryClient();

  useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel(`realtime:${userId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "departments",     filter: `profile_id=eq.${userId}` }, () => qc.invalidateQueries({ queryKey: ["departments"] }))
      .on("postgres_changes", { event: "*", schema: "public", table: "initiatives",     filter: `profile_id=eq.${userId}` }, () => qc.invalidateQueries({ queryKey: ["initiatives"] }))
      .on("postgres_changes", { event: "*", schema: "public", table: "action_items",    filter: `profile_id=eq.${userId}` }, () => qc.invalidateQueries({ queryKey: ["action_items"] }))
      .on("postgres_changes", { event: "*", schema: "public", table: "insights",        filter: `profile_id=eq.${userId}` }, () => qc.invalidateQueries({ queryKey: ["insights"] }))
      .on("postgres_changes", { event: "*", schema: "public", table: "governance_logs", filter: `profile_id=eq.${userId}` }, () => qc.invalidateQueries({ queryKey: ["governance_logs"] }))
      .on("postgres_changes", { event: "*", schema: "public", table: "sop_records",     filter: `profile_id=eq.${userId}` }, () => qc.invalidateQueries({ queryKey: ["sop_records"] }))
      .on("postgres_changes", { event: "*", schema: "public", table: "org_metrics",     filter: `profile_id=eq.${userId}` }, () => qc.invalidateQueries({ queryKey: ["org_metrics"] }))
      .on("postgres_changes", { event: "*", schema: "public", table: "team_members",    filter: `profile_id=eq.${userId}` }, () => qc.invalidateQueries({ queryKey: ["team_members"] }))
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [userId, qc]);
}

// ── Live KPIs computed from DB data ──────────────────────────────────
export function useLiveKPIs() {
  const { data: initiatives = [] } = useInitiatives();
  const { data: actionItems = [] } = useActionItems();
  const { data: insights = [] } = useInsights();
  const { data: governanceLogs = [] } = useGovernanceLogs();
  const { data: departments = [] } = useDepartments();
  const { data: orgMetrics } = useOrgMetrics();

  const now = new Date();

  return {
    onTrack:          initiatives.filter(i => i.status === "On Track").length,
    atRisk:           initiatives.filter(i => i.status === "At Risk" || i.status === "Delayed").length,
    blocked:          initiatives.filter(i => i.status === "Blocked").length,
    completed:        initiatives.filter(i => i.status === "Completed").length,
    criticalSignals:  insights.filter(i => i.signal === "red").length,
    pendingActions:   actionItems.filter(a => a.status !== "Completed").length,
    overdueActions:   actionItems.filter(a => a.status !== "Completed" && a.due_date && new Date(a.due_date) < now).length,
    completedActions: actionItems.filter(a => a.status === "Completed").length,
    escalatedGov:     governanceLogs.filter(g => g.status === "Escalated").length,
    openGov:          governanceLogs.filter(g => g.status !== "Resolved").length,
    budgetPct:        orgMetrics
      ? Math.round(((orgMetrics.total_budget_used ?? 0) / Math.max(orgMetrics.total_budget_allocated ?? 1, 1)) * 100)
      : 0,
    totalHeadcount:   departments.reduce((s, d) => s + (d.headcount ?? 0), 0),
    avgCapacity:      departments.length
      ? Math.round(departments.reduce((s, d) => s + (d.capacity_used ?? 0), 0) / departments.length)
      : 0,
    avgMaturity:      departments.length
      ? Math.round(departments.reduce((s, d) => s + (d.maturity_score ?? 0), 0) / departments.length)
      : 0,
    avgExecution:     departments.length
      ? Math.round(departments.reduce((s, d) => s + (d.execution_health ?? 0), 0) / departments.length)
      : 0,
    blockedTasks:     departments.reduce((s, d) => s + (d.blocked_tasks ?? 0), 0),
    overallMaturity:  orgMetrics?.overall_maturity_score ?? 0,
    executionHealth:  orgMetrics?.avg_execution_health ?? 0,
    sopAdherence:     orgMetrics?.avg_sop_adherence ?? 0,
  };
}

// ── Tech-Ops: Backups ─────────────────────────────────────────────────
export function useIntegrationBackups() {
  return useQuery({
    queryKey: ["integration_backups"],
    queryFn: async () => {
      const uid = await getCurrentUserId();
      if (!uid) return [];
      return getIntegrationBackups(uid);
    },
  });
}

export function useUpsertIntegrationBackup() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (backup: Parameters<typeof upsertIntegrationBackup>[0]) => upsertIntegrationBackup(backup),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["integration_backups"] }),
  });
}

export function useDeleteIntegrationBackup() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteIntegrationBackup(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["integration_backups"] }),
  });
}

// ── Tech-Ops: Sync Logs ──────────────────────────────────────────────
export function useIntegrationSyncLogs() {
  return useQuery({
    queryKey: ["integration_sync_logs"],
    queryFn: async () => {
      const uid = await getCurrentUserId();
      if (!uid) return [];
      return getIntegrationSyncLogs(uid);
    },
  });
}

// ── Tech-Ops: Folders ────────────────────────────────────────────────
export function useTechOpsFolders() {
  return useQuery({
    queryKey: ["techops_folders"],
    queryFn: async () => {
      const uid = await getCurrentUserId();
      if (!uid) return [];
      return getTechOpsFolders(uid);
    },
  });
}

export function useUpsertTechOpsFolder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (folder: Parameters<typeof upsertTechOpsFolder>[0]) => upsertTechOpsFolder(folder),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["techops_folders"] });
    },
  });
}

export function useDeleteTechOpsFolder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteTechOpsFolder(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["techops_folders"] });
      qc.invalidateQueries({ queryKey: ["techops_folder_items"] });
    },
  });
}

// ── Tech-Ops: Folder Items ──────────────────────────────────────────
export function useTechOpsFolderItems() {
  return useQuery({
    queryKey: ["techops_folder_items"],
    queryFn: async () => {
      const uid = await getCurrentUserId();
      if (!uid) return [];
      return getTechOpsFolderItems(uid);
    },
  });
}

export function useUpsertTechOpsFolderItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (item: Parameters<typeof upsertTechOpsFolderItem>[0]) => upsertTechOpsFolderItem(item),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["techops_folder_items"] }),
  });
}

export function useDeleteTechOpsFolderItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteTechOpsFolderItem(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["techops_folder_items"] }),
  });
}

// ── Tech-Ops: Run Sync ──────────────────────────────────────────────
export function useRunIntegrationSync() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ integrationId, integrationName }: { integrationId: string; integrationName: string }) => {
      const uid = await getCurrentUserId();
      if (!uid) throw new Error("Not authenticated");
      return runIntegrationSync(uid, integrationId, integrationName);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["integration_backups"] });
      qc.invalidateQueries({ queryKey: ["integration_sync_logs"] });
    },
  });
}

export type { TechOpsBackup, TechOpsSyncLog, TechOpsFolder, TechOpsFolderItem };
