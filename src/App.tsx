import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
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
import Integrations from "./pages/Integrations";
import { loadProfile, applyAccentColor, applyFont, resetOnboarding } from "./lib/companyStore";
import type { CompanyProfile } from "./lib/companyStore";

const queryClient = new QueryClient();

const App = () => {
  const [profile, setProfile] = useState<CompanyProfile | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // DEV RESET: uncomment the next line to force onboarding, then recomment it
    // resetOnboarding();
    const p = loadProfile();
    if (p.onboardingComplete) {
      applyAccentColor(p.accentHue);
      applyFont(p.font);
      setProfile(p);
    }
    setReady(true);
  }, []);

  if (!ready) return null;

  if (!profile) {
    return (
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <OnboardingWizard onComplete={(p) => setProfile(p)} />
        </TooltipProvider>
      </QueryClientProvider>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AppLayout profile={profile} onProfileUpdate={setProfile}>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/initiatives" element={<Initiatives />} />
              <Route path="/diagnostics" element={<Diagnostics />} />
              <Route path="/departments" element={<Departments />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/action-items" element={<ActionItems />} />
              <Route path="/knowledge" element={<Knowledge />} />
              <Route path="/integrations" element={<Integrations />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AppLayout>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
