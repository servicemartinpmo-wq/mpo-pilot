/**
 * useAuth — Central auth hook
 * Provides session, user, profile and auth actions.
 */
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User, Session } from "@supabase/supabase-js";
import { upsertProfile, getProfile } from "@/lib/supabaseDataService";
import { isDemoMode } from "@/lib/companyStore";

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

export interface ReplitUser {
  id: string;
  email: string | null;
  first_name: string | null;
  last_name: string | null;
  profile_image_url: string | null;
}

export function useAuth() {
  const [isDemo] = useState(() => isDemoMode());
  const [session, setSession]     = useState<Session | null>(null);
  const [user, setUser]           = useState<User | null>(null);
  const [replitUser, setReplitUser] = useState<ReplitUser | null>(null);
  const [profile, setProfile]     = useState<AuthProfile | null>(null);
  const [loading, setLoading]     = useState(() => !isDemoMode());

  const loadProfile = useCallback(async (userId: string) => {
    // Race the DB fetch against a 4-second timeout so the spinner
    // never hangs indefinitely when Supabase is slow / unreachable.
    const raw = await Promise.race([
      getProfile(userId),
      new Promise<null>((resolve) => setTimeout(() => resolve(null), 4000)),
    ]);
    setProfile(mapProfile(raw));
  }, []);

  const checkReplitAuth = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/user", { credentials: "include" });
      if (res.ok) {
        const data = await res.json() as ReplitUser;
        setReplitUser(data);
        await loadProfile(data.id);
        return true;
      }
    } catch {
      // Replit auth not available
    }
    return false;
  }, [loadProfile]);

  useEffect(() => {
    if (isDemo) return;

    const safetyTimer = setTimeout(() => setLoading(false), 5000);

    const checkAuth = async () => {
      const hasReplitSession = await checkReplitAuth();
      if (hasReplitSession) {
        clearTimeout(safetyTimer);
        setLoading(false);
        return;
      }
    };
    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        if (event === "TOKEN_REFRESHED") {
          setSession(newSession);
          return;
        }

        clearTimeout(safetyTimer);
        setSession(newSession);
        setUser(newSession?.user ?? null);

        try {
          if (newSession?.user) {
            if (event === "SIGNED_IN" || event === "INITIAL_SESSION" || event === "USER_UPDATED") {
              await loadProfile(newSession.user.id);
            }
          } else if (!replitUser) {
            setProfile(null);
          }
        } catch {
          // profile stays null — onboarding wizard will handle it
        } finally {
          setLoading(false);
        }
      }
    );

    supabase.auth.getSession().then(({ data: { session: s } }) => {
      if (s?.user) {
        clearTimeout(safetyTimer);
        setSession(s);
        setUser(s.user);
        loadProfile(s.user.id).catch(() => {}).finally(() => setLoading(false));
      }
    });

    return () => {
      clearTimeout(safetyTimer);
      subscription.unsubscribe();
    };
  }, [isDemo, loadProfile, checkReplitAuth, replitUser]);

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
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.origin },
    });
    return { error };
  }, []);

  const signInWithApple = useCallback(async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "apple",
      options: { redirectTo: window.location.origin },
    });
    return { error };
  }, []);

  const signInWithReplit = useCallback(() => {
    window.location.href = "/api/login";
  }, []);

  const signOut = useCallback(async () => {
    if (replitUser) {
      window.location.href = "/api/logout";
      return;
    }
    await supabase.auth.signOut();
  }, [replitUser]);

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

  const effectiveUserId = user?.id ?? replitUser?.id ?? null;

  return {
    session,
    user,
    replitUser,
    profile,
    loading,
    signUp,
    signIn,
    signInWithGoogle,
    signInWithApple,
    signOut,
    resetPassword,
    updateProfile,
    signInWithReplit,
    refreshProfile: () => effectiveUserId ? loadProfile(effectiveUserId) : Promise.resolve(),
    isAuthenticated: !!(user || replitUser),
  };
}
