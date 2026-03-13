/**
 * TIER SYSTEM — Canonical tier definitions and access resolution
 *
 * Effective tier resolution order:
 *   1. Creator override (localStorage "apphia_creator_unlocked") → enterprise
 *   2. user_tier_grants table (manual grant, may have expiry)
 *   3. profiles.subscription_tier (normal subscription)
 *   4. Fallback → free
 */

import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

// ── Types ─────────────────────────────────────────────────────────────────────

export type TierId = "free" | "solo" | "growth" | "command" | "enterprise";

export interface TierDefinition {
  id: TierId;
  display_name: string;
  price_label: string;
  price_monthly: number;
  sort_order: number;
  color: string;
  features: string[];
}

export interface UserTierGrant {
  id: string;
  user_email: string;
  granted_tier: TierId;
  granted_by: string;
  is_temp: boolean;
  expires_at: string | null;
  note: string | null;
  created_at: string;
}

// ── Constants ─────────────────────────────────────────────────────────────────

export const TIER_ORDER: TierId[] = ["free", "solo", "growth", "command", "enterprise"];

/** Map old DB subscription_tier values → our canonical TierIds */
const DB_TIER_MAP: Record<string, TierId> = {
  free:         "free",
  professional: "solo",
  workflow:     "growth",
  command:      "command",
  enterprise:   "enterprise",
};

const CREATOR_STORAGE_KEY = "apphia_creator_unlocked";

// ── Utilities ─────────────────────────────────────────────────────────────────

export function isCreatorUnlocked(): boolean {
  try {
    return localStorage.getItem(CREATOR_STORAGE_KEY) === "true";
  } catch {
    return false;
  }
}

export function tierIndex(tier: TierId): number {
  return TIER_ORDER.indexOf(tier);
}

export function isTierAtLeast(userTier: TierId, required: TierId): boolean {
  return tierIndex(userTier) >= tierIndex(required);
}

function mapDbTier(dbTier: string | null | undefined): TierId {
  if (!dbTier) return "free";
  return DB_TIER_MAP[dbTier] ?? "free";
}

// ── Tier Definitions ──────────────────────────────────────────────────────────

/** Fetch tier definitions from DB. Falls back to hardcoded defaults on error. */
export async function fetchTierDefinitions(): Promise<TierDefinition[]> {
  const { data, error } = await supabase
    .from("tier_definitions")
    .select("*")
    .order("sort_order");

  if (error || !data || data.length === 0) {
    return DEFAULT_TIER_DEFINITIONS;
  }

  return data.map((row: Record<string, unknown>) => ({
    id: row.id as TierId,
    display_name: row.display_name as string,
    price_label: row.price_label as string,
    price_monthly: Number(row.price_monthly),
    sort_order: Number(row.sort_order),
    color: row.color as string,
    features: Array.isArray(row.features) ? (row.features as string[]) : [],
  }));
}

export async function saveTierDefinition(
  id: TierId,
  features: string[]
): Promise<void> {
  await supabase
    .from("tier_definitions")
    .update({ features, updated_at: new Date().toISOString() })
    .eq("id", id);
}

// ── User Tier Grants ──────────────────────────────────────────────────────────

export async function fetchTierGrants(): Promise<UserTierGrant[]> {
  const { data, error } = await supabase
    .from("user_tier_grants")
    .select("*")
    .order("created_at", { ascending: false });

  if (error || !data) return [];
  return data as UserTierGrant[];
}

export async function upsertTierGrant(
  userEmail: string,
  tier: TierId,
  isTemp: boolean,
  expiresAt: string | null,
  note?: string
): Promise<void> {
  await supabase.from("user_tier_grants").upsert(
    {
      user_email: userEmail,
      granted_tier: tier,
      is_temp: isTemp,
      expires_at: expiresAt,
      note: note ?? null,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_email" }
  );
}

export async function revokeTierGrant(id: string): Promise<void> {
  await supabase.from("user_tier_grants").delete().eq("id", id);
}

/** Resolve effective tier for a given email (checks grant table, then profile). */
export async function resolveEffectiveTier(
  email: string | null | undefined
): Promise<TierId> {
  if (!email) return "free";

  // 1. Check manual grant
  const { data: grant } = await supabase
    .from("user_tier_grants")
    .select("granted_tier, is_temp, expires_at")
    .eq("user_email", email)
    .maybeSingle();

  if (grant) {
    if (grant.is_temp && grant.expires_at) {
      if (new Date(grant.expires_at) < new Date()) {
        // Expired — ignore
      } else {
        return grant.granted_tier as TierId;
      }
    } else {
      return grant.granted_tier as TierId;
    }
  }

  // 2. Check profile subscription_tier
  const { data: profile } = await supabase
    .from("profiles")
    .select("subscription_tier")
    .eq("email", email)
    .maybeSingle();

  if (profile?.subscription_tier) {
    return mapDbTier(profile.subscription_tier);
  }

  return "free";
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export interface TierAccessState {
  effectiveTier: TierId;
  isCreator: boolean;
  isLoading: boolean;
  refresh: () => void;
}

export function useTierAccess(userEmail?: string | null): TierAccessState {
  const [effectiveTier, setEffectiveTier] = useState<TierId>("free");
  const [isLoading, setIsLoading] = useState(true);
  const [tick, setTick] = useState(0);

  const isCreator = isCreatorUnlocked();

  useEffect(() => {
    if (isCreator) {
      setEffectiveTier("enterprise");
      setIsLoading(false);
      return;
    }
    if (!userEmail) {
      setEffectiveTier("free");
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    resolveEffectiveTier(userEmail).then((tier) => {
      setEffectiveTier(tier);
      setIsLoading(false);
    });
  }, [userEmail, isCreator, tick]);

  return {
    effectiveTier,
    isCreator,
    isLoading,
    refresh: () => setTick((t) => t + 1),
  };
}

// ── Hardcoded fallback defaults ───────────────────────────────────────────────

export const DEFAULT_TIER_DEFINITIONS: TierDefinition[] = [
  {
    id: "free",
    display_name: "Free",
    price_label: "Free",
    price_monthly: 0,
    sort_order: 0,
    color: "hsl(220 70% 65%)",
    features: [
      "Limited insights & recommendations",
      "10–20 frameworks",
      "Basic KPI dashboards",
      "Single workspace",
      "In-app advertising",
    ],
  },
  {
    id: "solo",
    display_name: "Solo",
    price_label: "$30/mo",
    price_monthly: 30,
    sort_order: 1,
    color: "hsl(174 72% 50%)",
    features: [
      "Insights and recommendations",
      "50–100 frameworks",
      "Project-level KPI dashboards",
      "OKR templates & goal tracking",
      "Workspace up to 5 users",
      "Basic reporting",
    ],
  },
  {
    id: "growth",
    display_name: "Growth",
    price_label: "$75/mo",
    price_monthly: 75,
    sort_order: 2,
    color: "hsl(38 92% 55%)",
    features: [
      "200–300 frameworks",
      "Business dashboards (Sales, Marketing, Finance)",
      "Scenario modeling",
      "Financial templates (P&L, cash flow)",
      "Industry benchmarking",
      "Workspace up to 15 users",
    ],
  },
  {
    id: "command",
    display_name: "Command",
    price_label: "$250/mo",
    price_monthly: 250,
    sort_order: 3,
    color: "hsl(268 68% 65%)",
    features: [
      "Full analysis engine",
      "Cross-department dashboards",
      "Scenario simulations & stress testing",
      "Integrations — CRM, ERP, Accounting, HR",
      "Multi-user collaboration (up to 50 users)",
      "Tier 4–5 maturity roadmap",
    ],
  },
  {
    id: "enterprise",
    display_name: "Enterprise",
    price_label: "Custom",
    price_monthly: -1,
    sort_order: 4,
    color: "hsl(38 92% 52%)",
    features: [
      "Unlimited users",
      "Custom integrations",
      "White-label options",
      "Dedicated support & SLA",
      "Advanced security & compliance",
      "Custom AI training",
      "Quarterly business reviews",
    ],
  },
];
