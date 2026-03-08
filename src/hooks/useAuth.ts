/**
 * useAuth — Central auth hook
 * Provides session, user, profile and auth actions.
 */
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import type { User, Session } from "@supabase/supabase-js";
import { upsertProfile, getProfile } from "@/lib/supabaseDataService";

export interface AuthProfile {
  id: string;
  email: string | null;
  userName: string | null;
  orgName: string | null;
  orgType: string | null;
  industry: string | null;
  teamSize: string | null;
  revenueRange: string | null;
  currentState: string | null;
  futureState: string | null;
  departments: string[];
  hasSops: boolean;
  accentHue: number;
  font: string;
  density: string;
  onboardingComplete: boolean;
  avatarUrl: string | null;
}

function mapProfile(raw: Awaited<ReturnType<typeof getProfile>>): AuthProfile | null {
  if (!raw) return null;
  return {
    id: raw.id,
    email: raw.email ?? null,
    userName: raw.user_name ?? null,
    orgName: raw.org_name ?? null,
    orgType: raw.org_type ?? null,
    industry: raw.industry ?? null,
    teamSize: raw.team_size ?? null,
    revenueRange: raw.revenue_range ?? null,
    currentState: raw.current_state ?? null,
    futureState: raw.future_state ?? null,
    departments: raw.departments ?? [],
    hasSops: raw.has_sops ?? false,
    accentHue: raw.accent_hue ?? 210,
    font: raw.font ?? "inter",
    density: raw.density ?? "comfortable",
    onboardingComplete: raw.onboarding_complete ?? false,
    avatarUrl: raw.avatar_url ?? null,
  };
}

export function useAuth() {
  const [session, setSession]     = useState<Session | null>(null);
  const [user, setUser]           = useState<User | null>(null);
  const [profile, setProfile]     = useState<AuthProfile | null>(null);
  const [loading, setLoading]     = useState(true);

  // Load profile from DB when user is available
  const loadProfile = useCallback(async (userId: string) => {
    const raw = await getProfile(userId);
    setProfile(mapProfile(raw));
  }, []);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, newSession) => {
        setSession(newSession);
        setUser(newSession?.user ?? null);
        if (newSession?.user) {
          await loadProfile(newSession.user.id);
        } else {
          setProfile(null);
        }
        setLoading(false);
      }
    );

    // Then get existing session
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s);
      setUser(s?.user ?? null);
      if (s?.user) {
        loadProfile(s.user.id).finally(() => setLoading(false));
      } else {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, [loadProfile]);

  // ── Auth actions ──────────────────────────────────────────────
  const signUp = useCallback(async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: window.location.origin },
    });
    return { data, error };
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    return { data, error };
  }, []);

  const signInWithGoogle = useCallback(async () => {
    const { error } = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    return { error };
  }, []);

  const signInWithApple = useCallback(async () => {
    const { error } = await lovable.auth.signInWithOAuth("apple", {
      redirect_uri: window.location.origin,
    });
    return { error };
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
  }, []);

  const resetPassword = useCallback(async (email: string) => {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    return { data, error };
  }, []);

  const updateProfile = useCallback(async (updates: Partial<Omit<AuthProfile, "id">>) => {
    if (!user) return { error: new Error("Not authenticated") };
    const { data, error } = await upsertProfile(user.id, {
      email: updates.email ?? undefined,
      user_name: updates.userName ?? undefined,
      org_name: updates.orgName ?? undefined,
      org_type: updates.orgType ?? undefined,
      industry: updates.industry ?? undefined,
      team_size: updates.teamSize ?? undefined,
      revenue_range: updates.revenueRange ?? undefined,
      current_state: updates.currentState ?? undefined,
      future_state: updates.futureState ?? undefined,
      departments: updates.departments ?? undefined,
      has_sops: updates.hasSops ?? undefined,
      accent_hue: updates.accentHue ?? undefined,
      font: updates.font ?? undefined,
      density: updates.density ?? undefined,
      onboarding_complete: updates.onboardingComplete ?? undefined,
      avatar_url: updates.avatarUrl ?? undefined,
    });
    if (data) setProfile(mapProfile(data));
    return { data, error };
  }, [user]);

  return {
    session,
    user,
    profile,
    loading,
    signUp,
    signIn,
    signInWithGoogle,
    signInWithApple,
    signOut,
    resetPassword,
    updateProfile,
    refreshProfile: () => user ? loadProfile(user.id) : Promise.resolve(),
  };
}
