/**
 * FallbackMode — PMO-Ops offline/degraded experience
 * Surfaces static templates, rule-based recommendations, and community signals.
 */
import { usePmoStatus } from "@/hooks/usePmoStatus";
import { loadProfile } from "@/lib/companyStore";
import PmoFallbackPanel from "@/components/PmoFallbackPanel";

export default function FallbackMode() {
  const profile = loadProfile();
  const hasOrgData = Boolean(profile.orgName && profile.onboardingComplete);
  const { status, enablePmo } = usePmoStatus(hasOrgData);

  return (
    <div className="flex flex-col gap-6 p-6 max-w-4xl mx-auto w-full">
      <PmoFallbackPanel
        status={status}
        onEnablePmo={hasOrgData ? enablePmo : undefined}
      />
    </div>
  );
}
