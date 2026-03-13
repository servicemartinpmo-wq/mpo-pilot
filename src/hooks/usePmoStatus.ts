/**
 * usePmoStatus — Tracks whether the PMO-Ops engine is operational.
 *
 * The engine is considered "online" when:
 *   1. The user has completed onboarding (has org data to analyse)
 *   2. The engine has not hit 3+ consecutive failures
 *   3. The user has not manually forced fallback mode
 *
 * When offline, the app surfaces static templates, rule-based
 * recommendations, and community signals from fallbackData.ts.
 */
import { useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "martin_pmo_status";
const FAILURE_KEY = "martin_pmo_failures";
const MAX_FAILURES = 3;

export type PmoStatus = "online" | "offline" | "degraded";

interface PmoStatusState {
  status: PmoStatus;
  isFallback: boolean;
  failureCount: number;
  manualOverride: boolean;
  lastChecked: string | null;
}

function readState(): PmoStatusState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return {
    status: "online",
    isFallback: false,
    failureCount: 0,
    manualOverride: false,
    lastChecked: null,
  };
}

function writeState(s: PmoStatusState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
  } catch {}
}

export function usePmoStatus(hasOrgData: boolean) {
  const [state, setState] = useState<PmoStatusState>(readState);

  // Persist whenever state changes
  useEffect(() => {
    writeState(state);
  }, [state]);

  // Determine effective status based on org data availability
  useEffect(() => {
    if (state.manualOverride) return;

    if (!hasOrgData) {
      setState((prev) => ({
        ...prev,
        status: "offline",
        isFallback: true,
        lastChecked: new Date().toISOString(),
      }));
    } else if (state.failureCount >= MAX_FAILURES) {
      setState((prev) => ({
        ...prev,
        status: "degraded",
        isFallback: true,
        lastChecked: new Date().toISOString(),
      }));
    } else {
      setState((prev) => ({
        ...prev,
        status: "online",
        isFallback: false,
        lastChecked: new Date().toISOString(),
      }));
    }
  }, [hasOrgData, state.failureCount, state.manualOverride]);

  /** Call this when the engine encounters an error */
  const recordFailure = useCallback(() => {
    setState((prev) => {
      const next = prev.failureCount + 1;
      return {
        ...prev,
        failureCount: next,
        status: next >= MAX_FAILURES ? "degraded" : prev.status,
        isFallback: next >= MAX_FAILURES ? true : prev.isFallback,
      };
    });
  }, []);

  /** Call this when the engine runs successfully */
  const recordSuccess = useCallback(() => {
    setState((prev) => ({
      ...prev,
      failureCount: 0,
      status: "online",
      isFallback: prev.manualOverride ? prev.isFallback : false,
    }));
  }, []);

  /** User manually forces fallback mode */
  const forceFallback = useCallback(() => {
    setState((prev) => ({
      ...prev,
      status: "offline",
      isFallback: true,
      manualOverride: true,
    }));
  }, []);

  /** User re-enables PMO-Ops */
  const enablePmo = useCallback(() => {
    setState((prev) => ({
      ...prev,
      status: "online",
      isFallback: false,
      manualOverride: false,
      failureCount: 0,
    }));
  }, []);

  return {
    status: state.status,
    isFallback: state.isFallback,
    failureCount: state.failureCount,
    manualOverride: state.manualOverride,
    lastChecked: state.lastChecked,
    recordFailure,
    recordSuccess,
    forceFallback,
    enablePmo,
  };
}
