import pmoAppIcon from "@/assets/pmo-logo-ops.png";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState, useCallback } from "react";
import AppLayout from "./components/AppLayout";
import { ErrorBoundary } from "./components/ErrorBoundary";
import VoiceCommand from "./components/VoiceCommand";
import ApphiaPanel from "./components/ApphiaPanel";
import FeedbackPopup from "./components/FeedbackPopup";
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
import Members from "./pages/Members";
import CreatorLab from "./pages/CreatorLab";
import Projects from "./pages/Projects";
import Decisions from "./pages/Decisions";
import Pricing from "./pages/Pricing";
import CRM from "./pages/CRM";
import Agile from "./pages/Agile";
import Marketing from "./pages/Marketing";
import GraphView from "./pages/GraphView";
import FallbackMode from "./pages/FallbackMode";
import Expenses from "./pages/Expenses";
import Meetings from "./pages/Meetings";
import Compliance from "./pages/Compliance";
import TechOps from "./pages/TechOps";
import MigrateHub from "./pages/MigrateHub";
import NoteTaker from "./pages/NoteTaker";
import CollaboratorView from "./pages/CollaboratorView";
import AuthPage from "./pages/Auth";
import ResetPassword from "./pages/ResetPassword";
import { useAuth } from "./hooks/useAuth";
import { applyAccentColor, applyFont, applyDensity, applyFontSize, saveProfile, loadProfile, isDemoMode, DEMO_PROFILE } from "./lib/companyStore";
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

  useRealtimeSync(user?.id);

  // Apply theme from DB profile whenever it changes.
  // In demo mode, fall back to the locally-stored demo profile for theme.
  useEffect(() => {
    if (profile) {
      applyAccentColor(profile.accentHue ?? 210);
      applyFont((profile.font as "inter" | "mono" | "rounded") ?? "inter");
      applyDensity((profile.density as "compact" | "comfortable" | "spacious") ?? "comfortable");
      applyFontSize((profile.fontSize as "small" | "medium" | "large") ?? "medium");
    } else if (isDemoMode()) {
      const local = loadProfile();
      applyAccentColor(local.accentHue ?? 215);
      applyFont(local.font ?? "inter");
      applyDensity(local.density ?? "comfortable");
      applyFontSize(local.fontSize ?? "medium");
    }
  }, [profile]);

  // Seed initial pmoData for new users after onboarding
  useEffect(() => {
    if (user && profile?.onboardingComplete && !seeded) {
      setSeeded(true);
      seedUserData(user.id).catch(console.error);
    }
  }, [user, profile?.onboardingComplete, seeded]);

  if (loading && !isDemoMode()) {
    return (
      <div className="fixed inset-0 flex items-center justify-center"
        style={{ background: "#0c1117" }}>
        <div className="flex flex-col items-center gap-4">
          <img src="/pmo-logo-ops.png" alt="PMO-Ops"
            className="w-24 h-24 rounded-3xl object-contain"
            style={{ boxShadow: "0 0 48px rgba(59,130,246,0.35)" }} />
          <div className="w-7 h-7 rounded-full border-2 animate-spin"
            style={{ borderColor: "rgba(59,130,246,0.18)", borderTopColor: "#3b82f6" }} />
        </div>
      </div>
    );
  }

  // Collaborator portal — always accessible without sign-in
  if (window.location.pathname.startsWith("/collab/")) {
    return (
      <Routes>
        <Route path="/collab/:token" element={<CollaboratorView />} />
      </Routes>
    );
  }

  // Not logged in — redirect to auth unless demo mode is active
  if (!user && !isDemoMode()) {
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
            <Route path="/members" element={<Members />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/creator-panel" element={<CreatorLab />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/decisions" element={<Decisions />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/crm" element={<CRM />} />
            <Route path="/agile" element={<Agile />} />
            <Route path="/marketing" element={<Marketing />} />
            <Route path="/graph" element={<GraphView />} />
            <Route path="/fallback" element={<FallbackMode />} />
            <Route path="/expenses" element={<Expenses />} />
            <Route path="/meetings" element={<Meetings />} />
            <Route path="/compliance" element={<Compliance />} />
            <Route path="/tech-ops" element={<TechOps />} />
            <Route path="/migrate" element={<MigrateHub />} />
            <Route path="/migrate-hub" element={<MigrateHub />} />
            <Route path="/note-taker" element={<NoteTaker />} />
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
      <Sonner position="bottom-right" />
      <BrowserRouter>
        <ErrorBoundary>
          <AppRoutes />
          <ApphiaPanel />
          <VoiceCommand />
          <FeedbackPopup />
        </ErrorBoundary>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
