import './_group.css';
import { useState } from "react";
import { Tag, ArrowRight, CheckCircle, AlertCircle } from "lucide-react";

const ReplitIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-[#F26207]" aria-hidden="true">
    <path d="M2 5.5C2 4.119 3.119 3 4.5 3H11v7H4.5A2.5 2.5 0 0 1 2 7.5v-2ZM13 3h6.5C20.881 3 22 4.119 22 5.5v2A2.5 2.5 0 0 1 19.5 10H13V3ZM2 16.5A2.5 2.5 0 0 1 4.5 14H11v7H4.5C3.119 21 2 19.881 2 18.5v-2ZM13 14h6.5c1.381 0 2.5 1.119 2.5 2.5v2c0 1.381-1.119 2.5-2.5 2.5H13v-7ZM11 10h2v4h-2z"/>
  </svg>
);

function LabeledField({ id, label, type, hint, value, onChange }: {
  id: string; label: string; type: string; hint?: string;
  value: string; onChange: (v: string) => void;
}) {
  const [showPw, setShowPw] = useState(false);
  const [focused, setFocused] = useState(false);
  const isPassword = type === "password";
  return (
    <div className="space-y-2">
      <label htmlFor={id} className="block text-base font-semibold" style={{ color: "hsl(var(--foreground))" }}>
        {label}
      </label>
      {hint && <p className="text-sm" style={{ color: "hsl(var(--muted-foreground))" }}>{hint}</p>}
      <div className="relative">
        <input
          id={id}
          type={isPassword ? (showPw ? "text" : "password") : type}
          value={value}
          onChange={e => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          aria-describedby={hint ? `${id}-hint` : undefined}
          className="w-full px-4 py-4 rounded-xl text-base transition-all outline-none"
          style={{
            background: "hsl(var(--card))",
            border: `2px solid ${focused ? "hsl(var(--electric-blue))" : "hsl(220 15% 75%)"}`,
            color: "hsl(var(--foreground))",
            minHeight: "52px",
            boxShadow: focused ? "0 0 0 4px hsl(var(--electric-blue) / 0.12)" : "none",
          }}
          placeholder=""
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPw(v => !v)}
            aria-label={showPw ? "Hide password" : "Show password"}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold px-2 py-1 rounded-md transition-colors"
            style={{ color: "hsl(var(--electric-blue))", minWidth: "44px", minHeight: "36px" }}>
            {showPw ? "Hide" : "Show"}
          </button>
        )}
      </div>
    </div>
  );
}

export function ReadabilityAccess() {
  const [tab, setTab] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error] = useState<string | null>(null);
  const [success] = useState<string | null>(null);

  return (
    <div className="min-h-screen flex items-start justify-center px-5 py-10"
      style={{ background: "#f7f8fa", fontFamily: "'Inter', system-ui, sans-serif" }}>
      <div className="w-full max-w-sm space-y-6">

        {/* Brand — simple, not decorative */}
        <div className="flex flex-col items-center gap-2">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
            style={{ background: "hsl(222 72% 48%)" }}>
            <Tag className="w-6 h-6 text-white" aria-hidden="true" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-center" style={{ color: "hsl(225 18% 44%)" }}>Martin PMO</p>
            <h1 className="text-2xl font-black text-center mt-0.5" style={{ color: "hsl(225 30% 8%)", letterSpacing: "-0.01em" }}>Sign in to continue</h1>
          </div>
        </div>

        {/* Feedback — always visible when present */}
        {error && (
          <div role="alert" className="flex items-start gap-3 rounded-xl px-4 py-3"
            style={{ background: "#fef2f2", border: "2px solid #fca5a5" }}>
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: "#dc2626" }} />
            <p className="text-sm font-medium" style={{ color: "#991b1b" }}>{error}</p>
          </div>
        )}
        {success && (
          <div role="status" className="flex items-start gap-3 rounded-xl px-4 py-3"
            style={{ background: "#f0fdf4", border: "2px solid #86efac" }}>
            <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: "#16a34a" }} />
            <p className="text-sm font-medium" style={{ color: "#15803d" }}>{success}</p>
          </div>
        )}

        {/* Option 1 — SSO */}
        <section aria-labelledby="sso-heading">
          <h2 id="sso-heading" className="text-sm font-bold uppercase tracking-wide mb-3" style={{ color: "hsl(225 18% 44%)" }}>
            Option 1 — Single sign-on
          </h2>
          <button
            className="w-full flex items-center gap-4 px-5 rounded-xl font-bold text-base transition-all border-2"
            style={{
              background: "#fff",
              borderColor: "hsl(220 15% 75%)",
              color: "hsl(225 30% 8%)",
              minHeight: "56px",
            }}>
            <ReplitIcon />
            <span>Continue with Replit</span>
            <ArrowRight className="w-5 h-5 ml-auto" style={{ color: "hsl(225 18% 44%)" }} />
          </button>
          <p className="text-sm mt-2" style={{ color: "hsl(225 18% 44%)" }}>
            No password needed. Uses your Replit account.
          </p>
        </section>

        {/* Divider */}
        <div className="flex items-center gap-3" role="separator" aria-label="or">
          <div className="flex-1 border-t-2" style={{ borderColor: "hsl(220 15% 85%)" }} />
          <span className="text-sm font-semibold px-2" style={{ color: "hsl(225 18% 44%)" }}>or</span>
          <div className="flex-1 border-t-2" style={{ borderColor: "hsl(220 15% 85%)" }} />
        </div>

        {/* Option 2 — Email */}
        <section aria-labelledby="email-heading">
          <h2 id="email-heading" className="text-sm font-bold uppercase tracking-wide mb-3" style={{ color: "hsl(225 18% 44%)" }}>
            Option 2 — Email &amp; password
          </h2>

          {/* Mode toggle — large, clear */}
          <div className="flex rounded-xl border-2 mb-5 overflow-hidden" style={{ borderColor: "hsl(220 15% 85%)" }}>
            {(["signin", "signup"] as const).map(t => (
              <button key={t}
                onClick={() => setTab(t)}
                aria-pressed={tab === t}
                className="flex-1 text-base font-bold transition-all"
                style={{
                  minHeight: "48px",
                  background: tab === t ? "hsl(222 72% 48%)" : "#fff",
                  color: tab === t ? "#fff" : "hsl(225 18% 44%)",
                  borderRight: t === "signin" ? "2px solid hsl(220 15% 85%)" : "none",
                }}>
                {t === "signin" ? "Sign In" : "Sign Up"}
              </button>
            ))}
          </div>

          <form className="space-y-5" onSubmit={e => e.preventDefault()} noValidate>
            <LabeledField
              id="email"
              label="Email address"
              type="email"
              hint="We'll never share your email."
              value={email}
              onChange={setEmail}
            />
            <LabeledField
              id="password"
              label="Password"
              type="password"
              hint={tab === "signup" ? "At least 6 characters." : undefined}
              value={password}
              onChange={setPassword}
            />
            {tab === "signin" && (
              <div>
                <a href="#" className="text-base font-semibold underline" style={{ color: "hsl(222 72% 48%)" }}>
                  Forgot your password?
                </a>
              </div>
            )}
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 font-bold text-base text-white rounded-xl transition-all"
              style={{
                background: "hsl(222 72% 48%)",
                minHeight: "56px",
              }}>
              {tab === "signin" ? "Sign In" : "Create Account"}
              <ArrowRight className="w-5 h-5" />
            </button>
          </form>
        </section>

        <p className="text-sm text-center leading-relaxed" style={{ color: "hsl(225 18% 44%)" }}>
          By signing in, you agree to our{" "}
          <a href="#" className="underline font-semibold" style={{ color: "hsl(222 72% 48%)" }}>Terms of Service</a>
          {" "}and{" "}
          <a href="#" className="underline font-semibold" style={{ color: "hsl(222 72% 48%)" }}>Privacy Policy</a>.
        </p>

        <div className="rounded-lg p-3 text-[11px] leading-relaxed" style={{ background: "hsl(var(--secondary))", color: "hsl(var(--muted-foreground))" }}>
          <strong style={{ color: "hsl(var(--foreground))" }}>Tradeoff:</strong> WCAG AA/AAA — labels above inputs, 48px+ touch targets, 16px+ text, high-contrast borders, semantic HTML. Tradeoff: taller page, more vertical scroll on small screens.
        </div>
      </div>
    </div>
  );
}
