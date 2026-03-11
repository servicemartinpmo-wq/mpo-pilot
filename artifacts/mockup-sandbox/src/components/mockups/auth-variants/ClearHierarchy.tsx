import './_group.css';
import { useState } from "react";
import { Tag, ArrowRight, Mail, Lock, Eye, EyeOff, CheckCircle, AlertCircle } from "lucide-react";

const ReplitIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-[#F26207]">
    <path d="M2 5.5C2 4.119 3.119 3 4.5 3H11v7H4.5A2.5 2.5 0 0 1 2 7.5v-2ZM13 3h6.5C20.881 3 22 4.119 22 5.5v2A2.5 2.5 0 0 1 19.5 10H13V3ZM2 16.5A2.5 2.5 0 0 1 4.5 14H11v7H4.5C3.119 21 2 19.881 2 18.5v-2ZM13 14h6.5c1.381 0 2.5 1.119 2.5 2.5v2c0 1.381-1.119 2.5-2.5 2.5H13v-7ZM11 10h2v4h-2z"/>
  </svg>
);

export function ClearHierarchy() {
  const [tab, setTab] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);

  return (
    <div className="min-h-screen flex" style={{ background: "hsl(var(--background))", fontFamily: "'Inter', system-ui, sans-serif" }}>

      {/* LEFT — Brand panel */}
      <div className="hidden lg:flex w-[42%] flex-col justify-between p-10 relative overflow-hidden"
        style={{ background: "linear-gradient(160deg, hsl(222 28% 9%), hsl(224 24% 14%))" }}>
        <div className="absolute inset-0 pointer-events-none"
          style={{ backgroundImage: `radial-gradient(circle at 20% 80%, hsl(222 72% 48% / 0.12) 0%, transparent 50%)` }} />

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, hsl(222 72% 48%), hsl(202 70% 48%))" }}>
            <Tag className="w-4 h-4 text-white" />
          </div>
          <div>
            <div className="text-[9px] font-black uppercase tracking-[0.25em] text-white/40">Martin</div>
            <div className="text-sm font-bold text-white leading-none">PMO Command</div>
          </div>
        </div>

        {/* Trust signals */}
        <div className="relative z-10 space-y-5">
          <div>
            <h2 className="text-2xl font-black text-white leading-tight">Your org's intelligence layer</h2>
            <p className="text-sm text-white/50 mt-2 leading-relaxed">Track initiatives, signals, and decisions — all in one command center.</p>
          </div>
          {[
            "Real-time org health scoring",
            "Signal detection & diagnostics",
            "Executive-ready reports",
          ].map(item => (
            <div key={item} className="flex items-center gap-2.5">
              <CheckCircle className="w-4 h-4 flex-shrink-0" style={{ color: "hsl(160 50% 60%)" }} />
              <span className="text-sm text-white/70">{item}</span>
            </div>
          ))}
        </div>

        <p className="relative z-10 text-[11px] text-white/25 leading-relaxed">
          Trusted by operators who can't afford ambiguity.
        </p>
      </div>

      {/* RIGHT — Form panel */}
      <div className="flex-1 flex flex-col items-center justify-center px-8 py-10">
        <div className="w-full max-w-sm">

          {/* Page heading — clear hierarchy */}
          <div className="mb-7">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] mb-2" style={{ color: "hsl(var(--electric-blue))" }}>
              Command Center Access
            </p>
            <h1 className="text-2xl font-black" style={{ color: "hsl(var(--foreground))" }}>
              {tab === "signin" ? "Welcome back" : "Create your account"}
            </h1>
            <p className="text-sm mt-1" style={{ color: "hsl(var(--muted-foreground))" }}>
              {tab === "signin" ? "Sign in to continue." : "Set up your org intelligence platform."}
            </p>
          </div>

          {/* ① PRIMARY ACTION — dominant weight */}
          <div className="mb-6">
            <p className="text-[10px] font-bold uppercase tracking-widest mb-2.5" style={{ color: "hsl(var(--muted-foreground))" }}>
              ① Recommended
            </p>
            <button className="w-full flex items-center justify-center gap-3 py-3.5 px-5 rounded-xl font-bold text-sm transition-all border-2"
              style={{
                background: "hsl(var(--card))",
                borderColor: "hsl(var(--electric-blue) / 0.4)",
                color: "hsl(var(--foreground))",
                boxShadow: "0 0 0 3px hsl(var(--electric-blue) / 0.06)",
              }}>
              <ReplitIcon />
              Continue with Replit — one click
            </button>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1 border-t" style={{ borderColor: "hsl(var(--border))" }} />
            <span className="text-[10px] uppercase tracking-widest font-bold px-1" style={{ color: "hsl(var(--muted-foreground) / 0.5)" }}>
              ② Or email
            </span>
            <div className="flex-1 border-t" style={{ borderColor: "hsl(var(--border))" }} />
          </div>

          {/* Tabs — smaller, clearly secondary */}
          <div className="flex rounded-lg p-0.5 mb-5" style={{ background: "hsl(var(--secondary))" }}>
            {(["signin", "signup"] as const).map(t => (
              <button key={t} onClick={() => setTab(t)}
                className="flex-1 py-2 text-xs font-semibold rounded-md transition-all"
                style={{
                  background: tab === t ? "hsl(var(--card))" : "transparent",
                  color: tab === t ? "hsl(var(--foreground))" : "hsl(var(--muted-foreground))",
                  boxShadow: tab === t ? "0 1px 4px hsl(224 30% 20% / 0.08)" : "none",
                }}>
                {t === "signin" ? "Sign In" : "Sign Up"}
              </button>
            ))}
          </div>

          {/* ② SECONDARY — email form, clearly subordinate */}
          <form className="space-y-3" onSubmit={e => e.preventDefault()}>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" style={{ color: "hsl(var(--muted-foreground))" }} />
              <input type="email" placeholder="Email address" value={email} onChange={e => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm border transition-all outline-none"
                style={{
                  background: "hsl(var(--secondary))",
                  borderColor: "hsl(var(--border))",
                  color: "hsl(var(--foreground))",
                }} />
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" style={{ color: "hsl(var(--muted-foreground))" }} />
              <input type={showPw ? "text" : "password"} placeholder="Password" value={password} onChange={e => setPassword(e.target.value)}
                className="w-full pl-10 pr-10 py-2.5 rounded-xl text-sm border transition-all outline-none"
                style={{
                  background: "hsl(var(--secondary))",
                  borderColor: "hsl(var(--border))",
                  color: "hsl(var(--foreground))",
                }} />
              <button type="button" onClick={() => setShowPw(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 opacity-40 hover:opacity-70 transition-opacity">
                {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {tab === "signin" && (
              <div className="text-right">
                <button type="button" className="text-xs transition-colors" style={{ color: "hsl(var(--muted-foreground))" }}>
                  Forgot password?
                </button>
              </div>
            )}
            <button type="submit"
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold text-white transition-all"
              style={{ background: "linear-gradient(135deg, hsl(222 72% 48%), hsl(202 70% 48%))" }}>
              {tab === "signin" ? "Sign In" : "Create Account"}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <p className="text-center text-xs mt-6 leading-relaxed" style={{ color: "hsl(var(--muted-foreground))" }}>
            By signing in you agree to our{" "}
            <span className="underline cursor-pointer" style={{ color: "hsl(var(--electric-blue))" }}>Terms</span>
            {" "}&amp;{" "}
            <span className="underline cursor-pointer" style={{ color: "hsl(var(--electric-blue))" }}>Privacy</span>
          </p>

          {/* Tradeoff note */}
          <div className="mt-6 rounded-lg p-3 text-[11px] leading-relaxed" style={{ background: "hsl(var(--secondary))", color: "hsl(var(--muted-foreground))" }}>
            <strong style={{ color: "hsl(var(--foreground))" }}>Tradeoff:</strong> Primary path (Replit SSO) is visually dominant. Email form is visually demoted — users who prefer email must scan past the recommended action.
          </div>
        </div>
      </div>
    </div>
  );
}
