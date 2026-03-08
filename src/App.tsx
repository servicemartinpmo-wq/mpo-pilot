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
import { applyAccentColor, applyFont } from "./lib/companyStore";
import { seedUserData } from "./lib/supabaseDataService";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 1,
    },
  },
});

function AppInner() {
  const { user, profile, loading } = useAuth();
  const [seeded, setSeeded] = useState(false);

  // Apply theme from DB profile
  useEffect(() => {
    if (profile) {
      applyAccentColor(profile.accentHue ?? 210);
      applyFont((profile.font as "inter" | "mono" | "rounded") ?? "inter");
    }
  }, [profile]);

  // Seed initial data for new users after onboarding completes
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

  // Not logged in → show auth
  if (!user) {
    return (
      <Routes>
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="*" element={<Navigate to="/auth" replace />} />
      </Routes>
    );
  }

  // Logged in but onboarding not complete → show onboarding
  if (profile && !profile.onboardingComplete) {
    return (
      <OnboardingWizard
        onComplete={async (p) => {
          const { updateProfile } = await import("./hooks/useAuth").then(m => {
            // The profile will update via useAuth subscription
            return { updateProfile: null };
          });
          // The useAuth hook will re-render with updated profile
        }}
      />
    );
  }

  // Profile still loading (just signed in)
  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-2 border-electric-blue/30 border-t-electric-blue rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <BrowserRouter>
      <AppLayout
        profile={{
          userName: profile.userName ?? "",
          orgName: profile.orgName ?? "",
          orgType: profile.orgType ?? "",
          industry: profile.industry ?? "",
          teamSize: profile.teamSize ?? "",
          revenueRange: profile.revenueRange ?? "",
          currentState: profile.currentState ?? "",
          futureState: profile.futureState ?? "",
          departments: profile.departments ?? [],
          hasSops: profile.hasSops ?? false,
          accentHue: profile.accentHue ?? 210,
          font: (profile.font as "inter" | "mono" | "rounded") ?? "inter",
          density: (profile.density as "compact" | "comfortable" | "spacious") ?? "comfortable",
          analyticsEnabled: true,
          onboardingComplete: profile.onboardingComplete ?? false,
        }}
        onProfileUpdate={() => {}}
      >
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
    </BrowserRouter>
  );
}

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AppInner />
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
