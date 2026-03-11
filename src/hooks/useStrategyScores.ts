import { useMemo } from "react";
import { useAppData } from "./useAppData";

export interface StrategyScore {
  id: string;
  label: string;
  value: number;
  trend: "up" | "down" | "flat";
  trendDelta: number;
  description: string;
  color: string;
}

export function useStrategyScores(): StrategyScore[] {
  const data = useAppData();

  return useMemo(() => {
    const kpis = data?.kpis ?? {
      onTrack: 0,
      atRisk: 0,
      blocked: 0,
      completed: 0,
      pendingActions: 0,
      criticalSignals: 0,
    };

    const total = kpis.onTrack + kpis.atRisk + kpis.blocked + kpis.completed;
    const onTrackRate = total > 0 ? Math.round((kpis.onTrack / total) * 100) : 0;

    const growthScore = Math.min(100, Math.max(0,
      Math.round(onTrackRate * 0.5 + (kpis.completed * 5) + (kpis.onTrack * 2))
    ));

    const executionScore = Math.min(100, Math.max(0,
      Math.round(
        onTrackRate * 0.6 +
        Math.max(0, 40 - kpis.blocked * 5) +
        Math.max(0, 20 - kpis.pendingActions * 0.5)
      )
    ));

    const financialScore = Math.min(100, Math.max(0,
      Math.round(
        onTrackRate * 0.4 +
        (kpis.criticalSignals < 3 ? 40 : 20) +
        (kpis.blocked < 2 ? 20 : 5)
      )
    ));

    const teamScore = Math.min(100, Math.max(0,
      Math.round(
        onTrackRate * 0.5 +
        Math.max(0, 30 - kpis.blocked * 8) +
        (kpis.criticalSignals < 2 ? 20 : 8)
      )
    ));

    return [
      {
        id: "growth",
        label: "Growth",
        value: growthScore,
        trend: growthScore > 60 ? "up" : "flat",
        trendDelta: 3.2,
        description: "Initiative velocity + delivery rate",
        color: growthScore >= 70 ? "hsl(160 56% 42%)" : growthScore >= 50 ? "hsl(38 92% 52%)" : "hsl(350 84% 62%)",
      },
      {
        id: "execution",
        label: "Execution",
        value: executionScore,
        trend: executionScore > 65 ? "up" : "down",
        trendDelta: 1.8,
        description: "Task completion rate + deadline adherence",
        color: executionScore >= 70 ? "hsl(160 56% 42%)" : executionScore >= 50 ? "hsl(38 92% 52%)" : "hsl(350 84% 62%)",
      },
      {
        id: "financial",
        label: "Financial Health",
        value: financialScore,
        trend: financialScore > 60 ? "up" : "flat",
        trendDelta: 0.9,
        description: "Budget utilization + KPI performance",
        color: financialScore >= 70 ? "hsl(160 56% 42%)" : financialScore >= 50 ? "hsl(38 92% 52%)" : "hsl(350 84% 62%)",
      },
      {
        id: "team",
        label: "Team Efficiency",
        value: teamScore,
        trend: teamScore > 65 ? "up" : "flat",
        trendDelta: 2.4,
        description: "Capacity balance + workload distribution",
        color: teamScore >= 70 ? "hsl(160 56% 42%)" : teamScore >= 50 ? "hsl(38 92% 52%)" : "hsl(350 84% 62%)",
      },
    ];
  }, [data]);
}
