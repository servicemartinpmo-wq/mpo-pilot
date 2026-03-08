import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import AppLayout from "./components/AppLayout";
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
import AuthPage from "./pages/Auth";
import ResetPassword from "./pages/ResetPassword";
import { useAuth } from "./hooks/useAuth";
import { applyAccentColor, applyFont, saveProfile } from "./lib/companyStore";
import { seedUserData } from "./lib/supabaseDataService";
import type { CompanyProfile } from "./lib/companyStore";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 30_000, retry: 1 },
  },
});

function AppRoutes() {
  const { user, profile, loading, updateProfile } = useAuth();
  const [seeded, setSeeded] = useState(false);

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
          <p className="text-xs text-muted-foreground">Loading Apphia…</p>
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

  // Onboarding not complete
  if (profile && !profile.onboardingComplete) {
    const handleOnboardingComplete = async (p: CompanyProfile) => {
      // Save to companyStore (legacy)
      saveProfile(p);
      // Also save to DB
      await updateProfile({
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
      });
    };
    return <OnboardingWizard onComplete={handleOnboardingComplete} />;
  }

  // Profile still loading
  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-2 border-electric-blue/30 border-t-electric-blue rounded-full animate-spin" />
      </div>
    );
  }

  const legacyProfile: CompanyProfile = {
    userName:          profile.userName ?? "",
    orgName:           profile.orgName ?? "",
    orgType:           profile.orgType ?? "",
    industry:          profile.industry ?? "",
    teamSize:          profile.teamSize ?? "",
    revenueRange:      profile.revenueRange ?? "",
    currentState:      profile.currentState ?? "",
    futureState:       profile.futureState ?? "",
    departments:       profile.departments ?? [],
    hasSops:           profile.hasSops ?? false,
    accentHue:         profile.accentHue ?? 210,
    font:              (profile.font as "inter" | "mono" | "rounded") ?? "inter",
    density:           (profile.density as "compact" | "comfortable" | "spacious") ?? "comfortable",
    analyticsEnabled:  true,
    onboardingComplete: profile.onboardingComplete ?? false,
  };

  return (
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
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AppLayout>
      } />
    </Routes>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
