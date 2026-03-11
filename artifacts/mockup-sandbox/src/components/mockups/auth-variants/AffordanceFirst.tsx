import './_group.css';
import { useState } from "react";
import { Tag, ArrowRight, Mail, Lock, Eye, EyeOff, User } from "lucide-react";

const ReplitIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-[#F26207]">
    <path d="M2 5.5C2 4.119 3.119 3 4.5 3H11v7H4.5A2.5 2.5 0 0 1 2 7.5v-2ZM13 3h6.5C20.881 3 22 4.119 22 5.5v2A2.5 2.5 0 0 1 19.5 10H13V3ZM2 16.5A2.5 2.5 0 0 1 4.5 14H11v7H4.5C3.119 21 2 19.881 2 18.5v-2ZM13 14h6.5c1.381 0 2.5 1.119 2.5 2.5v2c0 1.381-1.119 2.5-2.5 2.5H13v-7ZM11 10h2v4h-2z"/>
  </svg>
);

function Field({ label, type, placeholder, value, onChange, children }: {
  label: string; type: string; placeholder: string;
  value: string; onChange: (v: string) => void; children?: React.ReactNode;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-semibold" style={{ color: "hsl(var(--foreground))" }}>
        {label}
      </label>
      <div className="relative">
        <input
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={e => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className="w-full pl-4 pr-10 py-3 rounded-xl text-sm transition-all outline-none"
          style={{
            background: "hsl(var(--card))",
            border: `2px solid ${focused ? "hsl(var(--electric-blue))" : "hsl(var(--border))"}`,
            color: "hsl(var(--foreground))",
            boxShadow: focused ? "0 0 0 3px hsl(var(--electric-blue) / 0.15)" : "none",
          }}
        />
        {children && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">{children}</div>
        )}
      </div>
    </div>
  );
}

export function AffordanceFirst() {
  const [tab, setTab] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [hovering, setHovering] = useState(false);
  const [pressing, setPressing] = useState(false);

  const pwStrength = password.length === 0 ? 0 : password.length < 6 ? 1 : password.length < 10 ? 2 : 3;
  const strengthColor = ["transparent", "#ef4444", "#f59e0b", "#22c55e"][pwStrength];
  const strengthLabel = ["", "Weak", "Fair", "Strong"][pwStrength];

  return (
    <div className="min-h-screen flex items-center justify-center px-5 py-8"
      style={{ background: "hsl(var(--background))", fontFamily: "'Inter', system-ui, sans-serif" }}>
      <div className="w-full max-w-sm">

        {/* Brand */}
        <div className="text-center mb-7">
          <div className="w-12 h-12 rounded-2xl mx-auto mb-4 flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, hsl(222 72% 48%), hsl(202 70% 48%))", boxShadow: "0 0 28px hsl(222 72% 48% / 0.3)" }}>
            <Tag className="w-6 h-6 text-white" />
          </div>
          <div className="text-[10px] font-black uppercase tracking-[0.3em] mb-1" style={{ color: "hsl(var(--muted-foreground))" }}>Martin PMO</div>
          <h1 className="text-2xl font-black" style={{ color: "hsl(var(--foreground))" }}>Welcome back</h1>
        </div>

        {/* Tabs — raised, physical feel */}
        <div className="flex mb-5 rounded-t-xl overflow-hidden border-b-2" style={{ borderColor: "hsl(var(--border))" }}>
          {(["signin", "signup"] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className="flex-1 py-3.5 text-sm font-bold transition-all"
              style={{
                background: tab === t ? "hsl(var(--card))" : "hsl(var(--secondary))",
                color: tab === t ? "hsl(var(--electric-blue))" : "hsl(var(--muted-foreground))",
                borderBottom: tab === t ? "2px solid hsl(var(--electric-blue))" : "2px solid transparent",
                marginBottom: "-2px",
              }}>
              {t === "signin" ? "Sign In" : "Sign Up"}
            </button>
          ))}
        </div>

        <div className="rounded-b-2xl rounded-tr-2xl p-6 space-y-4 border-2"
          style={{ background: "hsl(var(--card))", borderColor: "hsl(var(--border))", borderTop: "none" }}>

          {/* Replit button — tactile with press state */}
          <button
            onMouseEnter={() => setHovering(true)}
            onMouseLeave={() => { setHovering(false); setPressing(false); }}
            onMouseDown={() => setPressing(true)}
            onMouseUp={() => setPressing(false)}
            className="w-full flex items-center justify-center gap-3 py-3.5 rounded-xl font-semibold text-sm transition-all border-2"
            style={{
              background: hovering ? "hsl(var(--secondary))" : "hsl(var(--card))",
              borderColor: hovering ? "hsl(222 72% 48% / 0.5)" : "hsl(var(--border))",
              color: "hsl(var(--foreground))",
              transform: pressing ? "scale(0.98) translateY(1px)" : "scale(1)",
              boxShadow: pressing
                ? "0 1px 3px hsl(224 30% 20% / 0.1)"
                : hovering
                  ? "0 4px 12px hsl(222 72% 48% / 0.15)"
                  : "0 2px 6px hsl(224 30% 20% / 0.07)",
            }}>
            <ReplitIcon />
            Continue with Replit
            <ArrowRight className="w-4 h-4 ml-auto opacity-40" />
          </button>

          <div className="flex items-center gap-3">
            <div className="flex-1 border-t" style={{ borderColor: "hsl(var(--border))" }} />
            <span className="text-[10px] uppercase tracking-widest font-bold" style={{ color: "hsl(var(--muted-foreground) / 0.5)" }}>
              Or email
            </span>
            <div className="flex-1 border-t" style={{ borderColor: "hsl(var(--border))" }} />
          </div>

          <form className="space-y-4" onSubmit={e => e.preventDefault()}>
            {tab === "signup" && (
              <Field label="Full name" type="text" placeholder="Jane Smith" value={name} onChange={setName} />
            )}
            <Field label="Email address" type="email" placeholder="you@company.com" value={email} onChange={setEmail} />
            <div className="space-y-1">
              <Field label="Password" type={showPw ? "text" : "password"} placeholder="Min. 6 characters" value={password} onChange={setPassword}>
                <button type="button" onClick={() => setShowPw(v => !v)}
                  className="flex items-center gap-1 text-[11px] font-semibold rounded-md px-2 py-1 transition-colors"
                  style={{ background: "hsl(var(--secondary))", color: "hsl(var(--muted-foreground))" }}>
                  {showPw ? <><EyeOff className="w-3 h-3" /> Hide</> : <><Eye className="w-3 h-3" /> Show</>}
                </button>
              </Field>
              {tab === "signup" && password.length > 0 && (
                <div className="space-y-1 pt-1">
                  <div className="flex gap-1">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="flex-1 h-1 rounded-full transition-all"
                        style={{ background: i <= pwStrength ? strengthColor : "hsl(var(--border))" }} />
                    ))}
                  </div>
                  <p className="text-[11px] font-medium" style={{ color: strengthColor }}>{strengthLabel} password</p>
                </div>
              )}
            </div>

            {tab === "signin" && (
              <div className="text-right -mt-1">
                <button type="button" className="text-xs font-medium transition-colors hover:underline"
                  style={{ color: "hsl(var(--electric-blue))" }}>
                  Forgot password?
                </button>
              </div>
            )}

            <button type="submit"
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-bold text-white transition-all active:scale-[0.98]"
              style={{
                background: "linear-gradient(135deg, hsl(222 72% 48%), hsl(202 70% 48%))",
                boxShadow: "0 4px 14px hsl(222 72% 48% / 0.3), inset 0 1px 0 hsl(0 0% 100% / 0.15)",
              }}>
              {tab === "signin" ? "Sign In" : "Create Account"}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>

        <p className="text-center text-xs mt-5" style={{ color: "hsl(var(--muted-foreground))" }}>
          By signing in you agree to our{" "}
          <span className="underline cursor-pointer" style={{ color: "hsl(var(--electric-blue))" }}>Terms</span>
          {" "}&amp;{" "}
          <span className="underline cursor-pointer" style={{ color: "hsl(var(--electric-blue))" }}>Privacy Policy</span>
        </p>

        <div className="mt-5 rounded-lg p-3 text-[11px] leading-relaxed" style={{ background: "hsl(var(--secondary))", color: "hsl(var(--muted-foreground))" }}>
          <strong style={{ color: "hsl(var(--foreground))" }}>Tradeoff:</strong> Every interactive element has exaggerated affordances (visible labels, 2px borders, press states, hover shadows). Tradeoff: heavier visual density — more elements competing for attention.
        </div>
      </div>
    </div>
  );
}
