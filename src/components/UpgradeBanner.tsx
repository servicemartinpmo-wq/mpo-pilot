import { useState, useEffect } from "react";
import { X, Sparkles, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Props {
  storageKey: string;
  message?: string;
}

export default function UpgradeBanner({ storageKey, message }: Props) {
  const navigate = useNavigate();
  const [dismissed, setDismissed] = useState(() => {
    try {
      return localStorage.getItem(storageKey) === "dismissed";
    } catch {
      return false;
    }
  });

  const dismiss = () => {
    setDismissed(true);
    try {
      localStorage.setItem(storageKey, "dismissed");
    } catch {}
  };

  if (dismissed) return null;

  return (
    <div className="flex items-center justify-between px-5 py-2.5 border-b"
      style={{
        background: "hsl(222 40% 10%)",
        borderColor: "hsl(38 92% 52% / 0.15)"
      }}>
      <div className="flex items-center gap-2.5 text-sm">
        <Sparkles className="w-3.5 h-3.5 flex-shrink-0" style={{ color: "hsl(38 92% 52%)" }} />
        <span style={{ color: "hsl(0 0% 100% / 0.55)" }}>
          {message ?? "Unlock more with PMO-Ops Command Center —"}
          <span style={{ color: "hsl(38 92% 52%)" }}> decades of consulting expertise, built into every tier.</span>
        </span>
      </div>
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate("/pricing")}
          className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-all hover:opacity-90"
          style={{ background: "hsl(38 92% 52% / 0.12)", color: "hsl(38 92% 62%)" }}>
          View Plans
          <ArrowRight className="w-3 h-3" />
        </button>
        <button
          onClick={dismiss}
          className="w-6 h-6 rounded flex items-center justify-center hover:bg-white/[0.06] transition-all">
          <X className="w-3.5 h-3.5" style={{ color: "hsl(0 0% 100% / 0.35)" }} />
        </button>
      </div>
    </div>
  );
}
