/**
 * useLiveData — React Query hooks for live Supabase data
 * All pages should import from here instead of static pmoData.
 */
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  getDepartments, getInitiatives, getActionItems, getInsights,
  getGovernanceLogs, getSopRecords, getOrgMetrics, getIntegrationConnections,
  updateActionItemStatus, updateInitiativeStatus, updateGovernanceStatus,
  upsertDepartment, upsertInitiative, upsertActionItem, upsertInsight,
  upsertGovernanceLog, deleteActionItem, deleteInitiative, deleteDepartment,
  upsertIntegration, removeIntegration,
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
    onSuccess: () => qc.invalidateQueries({ queryKey: ["integration_connections"] }),
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
