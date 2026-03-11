import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState, useCallback } from "react";
import AppLayout from "./components/AppLayout";
import { ErrorBoundary } from "./components/ErrorBoundary";
import VoiceCommand from "./components/VoiceCommand";
import ApphiaPanel from "./components/ApphiaPanel";
import CommandPalette from "./components/CommandPalette";
import TopStatusBar from "./components/TopStatusBar";
import Index from "./pages/Index";
import Initiatives from "./pages/Initiatives";
import Diagnostics from "./pages/Diagnostics";
import Departments from "./pages/Departments";
import Reports from "./pages/Reports";
import Admin from "./pages/Admin";
import NotFound from "./pages/NotFound";
import OnboardingWizard from "./components/OnboardingWizard";
import ActionItems from "./pages/ActionItems";
import Knowledge from "./pages/Knowledge";
import Workflows from "./pages/Workflows";
import Integrations from "./pages/Integrations";
import Advisory from "./pages/Advisory";
import Team from "./pages/Team";
import CreatorLab from "./pages/CreatorLab";
import Projects from "./pages/Projects";
import Decisions from "./pages/Decisions";
import Pricing from "./pages/Pricing";
import CRM from "./pages/CRM";
import Agile from "./pages/Agile";
import Marketing from "./pages/Marketing";
import GraphView from "./pages/GraphView";
import AuthPage from "./pages/Auth";
import ResetPassword from "./pages/ResetPassword";
import { useAuth } from "./hooks/useAuth";
import { applyAccentColor, applyFont, saveProfile, loadProfile } from "./lib/companyStore";
import { seedUserData } from "./lib/supabaseDataService";
import { useRealtimeSync } from "./hooks/useLiveData";
import type { CompanyProfile } from "./lib/companyStore";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 30_000, retry: 1 },
  },
});

function AppRoutes() {
  const { user, profile, loading, updateProfile } = useAuth();
  const [seeded, setSeeded] = useState(false);
  const [onboardingDone, setOnboardingDone] = useState(false);
  const [cmdOpen, setCmdOpen] = useState(false);

  const openCmd = useCallback(() => setCmdOpen(true), []);
  const closeCmd = useCallback(() => setCmdOpen(false), []);

  useEffect(() => {
    const handle = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setCmdOpen(v => !v);
      }
    };
    window.addEventListener("keydown", handle);
    return () => window.removeEventListener("keydown", handle);
  }, []);

  // Keep all live data in sync via Supabase realtime channels
  useRealtimeSync(user?.id);

  // Apply theme from DB profile whenever it changes
  useEffect(() => {
    if (profile) {
      applyAccentColor(profile.accentHue ?? 210);
      applyFont((profile.font as "inter" | "mono" | "rounded") ?? "inter");
    }
  }, [profile]);

  // Seed initial pmoData for new users after onboarding
  useEffect(() => {
    if (user && profile?.onboardingComplete && !seeded) {
      setSeeded(true);
      seedUserData(user.id).catch(console.error);
    }
  }, [user, profile?.onboardingComplete, seeded]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-electric-blue/30 border-t-electric-blue rounded-full animate-spin" />
          <p className="text-xs text-muted-foreground">Loading…</p>
        </div>
      </div>
    );
  }

  // Not logged in
  if (!user) {
    return (
      <Routes>
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="*" element={<Navigate to="/auth" replace />} />
      </Routes>
    );
  }

  // Read local profile once — used both to gate onboarding and as a null-safe fallback.
  const localProfile = loadProfile();

  // Show onboarding only when DB profile is incomplete AND local storage also says not done.
  // This prevents re-triggering onboarding for existing users when DB is slow.
  if (!onboardingDone && (!profile || !profile.onboardingComplete) && !localProfile.onboardingComplete) {
    const handleOnboardingComplete = (p: CompanyProfile) => {
      saveProfile(p);
      setOnboardingDone(true); // immediately navigate to the app
      updateProfile({
        userName: p.userName,
        orgName: p.orgName,
        orgType: p.orgType,
        industry: p.industry,
        teamSize: p.teamSize,
        revenueRange: p.revenueRange,
        currentState: p.currentState,
        futureState: p.futureState,
        departments: p.departments,
        hasSops: p.hasSops,
        accentHue: p.accentHue,
        font: p.font,
        density: p.density,
        onboardingComplete: true,
      }).catch(console.error);
    };
    return <OnboardingWizard onComplete={handleOnboardingComplete} />;
  }

  // profile may still be null for a moment after onboardingDone fires (async DB write).
  // Use the locally-saved profile from companyStore as a reliable fallback.
  const profileSource = profile ?? localProfile;

  const legacyProfile: CompanyProfile = {
    userName:          profileSource.userName ?? "",
    orgName:           profileSource.orgName ?? "",
    orgType:           profileSource.orgType ?? "",
    industry:          profileSource.industry ?? "",
    teamSize:          profileSource.teamSize ?? "",
    revenueRange:      profileSource.revenueRange ?? "",
    currentState:      profileSource.currentState ?? "",
    futureState:       profileSource.futureState ?? "",
    departments:       profileSource.departments ?? [],
    hasSops:           profileSource.hasSops ?? false,
    accentHue:         profileSource.accentHue ?? 210,
    font:              (profileSource.font as "inter" | "mono" | "rounded") ?? "inter",
    density:           (profileSource.density as "compact" | "comfortable" | "spacious") ?? "comfortable",
    analyticsEnabled:  true,
    onboardingComplete: profileSource.onboardingComplete ?? false,
  };

  return (
    <>
      <TopStatusBar onOpenCommandPalette={openCmd} />
      <CommandPalette open={cmdOpen} onClose={closeCmd} />
      <Routes>
      <Route path="/auth" element={<Navigate to="/" replace />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/*" element={
        <AppLayout profile={legacyProfile} onProfileUpdate={async (p) => {
          saveProfile(p);
          await updateProfile({
            accentHue: p.accentHue,
            font: p.font,
            density: p.density,
          });
        }}>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/initiatives" element={<Initiatives />} />
            <Route path="/diagnostics" element={<Diagnostics />} />
            <Route path="/departments" element={<Departments />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/action-items" element={<ActionItems />} />
            <Route path="/knowledge" element={<Knowledge />} />
            <Route path="/workflows" element={<Workflows />} />
            <Route path="/integrations" element={<Integrations />} />
            <Route path="/advisory" element={<Advisory />} />
            <Route path="/team" element={<Team />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/creator-lab" element={<CreatorLab />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/decisions" element={<Decisions />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/crm" element={<CRM />} />
            <Route path="/agile" element={<Agile />} />
            <Route path="/marketing" element={<Marketing />} />
            <Route path="/graph" element={<GraphView />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AppLayout>
      } />
    </Routes>
    </>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <ErrorBoundary>
          <AppRoutes />
          <ApphiaPanel />
          <VoiceCommand />
        </ErrorBoundary>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
