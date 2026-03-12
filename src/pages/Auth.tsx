/**
 * Auth — Sign in / Sign up / Forgot password
 * Google OAuth (primary) + Microsoft SSO + email/password fallback
 */
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import { Eye, EyeOff, Mail, Lock, User, ArrowRight, CheckCircle, AlertCircle, Building2, Sparkles } from "lucide-react";
import pmoLogoDark from "@/assets/pmo-logo-dark.png";
import { SiGoogle } from "react-icons/si";
import { activateDemo } from "@/lib/companyStore";

type Mode = "signin" | "signup" | "forgot";

export default function AuthPage() {
  const navigate = useNavigate();
  const { signIn, signUp, resetPassword, signInWithGoogle, signInWithReplit } = useAuth();

  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<"google" | "microsoft" | "replit" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleDemoAccess = () => {
    // Use a full page load via ?demo=1 param — main.tsx detects this,
    // calls activateDemo() before React initializes, then strips the param.
    window.location.replace("/?demo=1");
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setOauthLoading("google");
    const { error: err } = await signInWithGoogle();
    if (err) {
      setError("Google sign-in failed. Please try email login or contact support.");
      setOauthLoading(null);
    }
    // On success, Supabase redirects — no need to do anything
  };

  const handleReplitSignIn = () => {
    setError(null);
    setOauthLoading("replit");
    signInWithReplit();
  };

  const handleMicrosoftSignIn = () => {
    setError(null);
    setOauthLoading("microsoft");
    // Placeholder — Microsoft/SAML SSO requires Azure AD app registration
    // and Supabase Enterprise SSO configuration
    setTimeout(() => {
      setError("Microsoft SSO is available on the Command & Enterprise plans. Contact us at sso@martinpmo.com to configure your tenant.");
      setOauthLoading(null);
    }, 600);
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    if (mode === "forgot") {
      const { error: err } = await resetPassword(email);
      if (err) setError(err.message);
      else setSuccess("Reset link sent — check your inbox (and spam folder).");
      setLoading(false);
      return;
    }

    if (mode === "signup") {
      const { data, error: err } = await signUp(email, password);
      if (err) { setError(err.message); setLoading(false); return; }
      // If session returned immediately, Supabase has email confirmation disabled
      if ((data as any)?.session) {
        navigate("/");
        return;
      }
      setSuccess("Check your inbox for a confirmation link — then come back to sign in. (Check spam if it doesn't arrive.)");
      setMode("signin");
      setLoading(false);
      return;
    }

    const { error: err } = await signIn(email, password);
    if (err) {
      if (err.message.toLowerCase().includes("email not confirmed")) {
        setError("Please confirm your email first. Check your inbox (and spam) for the confirmation link.");
      } else if (err.message.toLowerCase().includes("invalid login")) {
        setError("Incorrect email or password.");
      } else {
        setError(err.message);
      }
      setLoading(false);
      return;
    }
    navigate("/");
    setLoading(false);
  }

  function switchMode(m: Mode) {
    setMode(m);
    setError(null);
    setSuccess(null);
  }

  const ACCENT = "hsl(var(--electric-blue))";

  return (
    <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden">
      {/* Background glows */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px]"
          style={{ background: "radial-gradient(ellipse at top, hsl(233 65% 60% / 0.08) 0%, transparent 70%)" }} />
        <div className="absolute bottom-0 right-1/4 w-[600px] h-[400px]"
          style={{ background: "radial-gradient(ellipse at bottom, hsl(183 55% 40% / 0.06) 0%, transparent 70%)" }} />
        <div className="absolute inset-0"
          style={{
            backgroundImage: `linear-gradient(hsl(233 72% 58% / 0.025) 1px, transparent 1px), linear-gradient(90deg, hsl(233 72% 58% / 0.025) 1px, transparent 1px)`,
            backgroundSize: "48px 48px",
          }} />
      </div>

      <div className="relative z-10 w-full max-w-md px-6 py-10">
        {/* Brand */}
        <div className="text-center mb-8">
          <img src={pmoLogoDark} alt="PMO-Ops" className="w-16 h-16 rounded-2xl mx-auto mb-4 object-cover" style={{ boxShadow: `0 0 28px ${ACCENT}33` }} />
          <div className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground mb-1">PMO-Ops</div>
          <h1 className="text-2xl font-black text-foreground tracking-tight">
            {mode === "signin" ? "Welcome back" : mode === "signup" ? "Create your account" : "Reset your password"}
          </h1>
          <p className="text-sm text-muted-foreground mt-1.5">
            {mode === "signin"
              ? "Sign in to your Command Center"
              : mode === "signup"
              ? "Set up your org intelligence platform"
              : "We'll send a reset link to your email"}
          </p>
        </div>

        <div className="bg-card border-2 border-border rounded-2xl shadow-elevated overflow-hidden">
          {/* Mode tabs */}
          {mode !== "forgot" && (
            <div className="flex border-b-2 border-border">
              {(["signin", "signup"] as Mode[]).map(m => (
                <button
                  key={m}
                  type="button"
                  onClick={() => switchMode(m)}
                  className={cn(
                    "flex-1 py-3.5 text-sm font-semibold transition-all",
                    mode === m
                      ? "text-electric-blue bg-electric-blue/5 border-b-2 border-electric-blue -mb-[2px]"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {m === "signin" ? "Sign In" : "Sign Up"}
                </button>
              ))}
            </div>
          )}

          <div className="p-6 space-y-3">

            {/* ── OAuth buttons ── */}
            <div className="space-y-2.5">
              {/* Google */}
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={oauthLoading !== null}
                className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl border-2 border-border bg-background hover:bg-secondary transition-all font-semibold text-sm group disabled:opacity-60"
              >
                {oauthLoading === "google" ? (
                  <div className="w-4 h-4 border-2 border-muted-foreground/30 border-t-muted-foreground rounded-full animate-spin" />
                ) : (
                  <SiGoogle className="w-4 h-4 text-[#EA4335] group-hover:scale-110 transition-transform" />
                )}
                Continue with Google
              </button>

              {/* Replit */}
              <button
                type="button"
                onClick={handleReplitSignIn}
                disabled={oauthLoading !== null}
                className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl border-2 border-border bg-background hover:bg-secondary transition-all font-semibold text-sm group disabled:opacity-60"
              >
                {oauthLoading === "replit" ? (
                  <div className="w-4 h-4 border-2 border-muted-foreground/30 border-t-muted-foreground rounded-full animate-spin" />
                ) : (
                  <svg width="16" height="16" viewBox="0 0 32 32" className="flex-shrink-0 group-hover:scale-110 transition-transform">
                    <path d="M7 5.5C7 4.67157 7.67157 4 8.5 4H15.5C16.3284 4 17 4.67157 17 5.5V12H8.5C7.67157 12 7 11.3284 7 10.5V5.5Z" fill="#F26207"/>
                    <path d="M17 12H25.5C26.3284 12 27 12.6716 27 13.5V18.5C27 19.3284 26.3284 20 25.5 20H17V12Z" fill="#F26207"/>
                    <path d="M7 21.5C7 20.6716 7.67157 20 8.5 20H17V28H8.5C7.67157 28 7 27.3284 7 26.5V21.5Z" fill="#F26207"/>
                  </svg>
                )}
                Continue with Replit
              </button>

              {/* Microsoft / SSO */}
              <button
                type="button"
                onClick={handleMicrosoftSignIn}
                disabled={oauthLoading !== null}
                className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl border-2 border-border bg-background hover:bg-secondary transition-all font-semibold text-sm group disabled:opacity-60"
              >
                {oauthLoading === "microsoft" ? (
                  <div className="w-4 h-4 border-2 border-muted-foreground/30 border-t-muted-foreground rounded-full animate-spin" />
                ) : (
                  <svg width="16" height="16" viewBox="0 0 21 21" className="flex-shrink-0 group-hover:scale-110 transition-transform">
                    <rect x="1" y="1" width="9" height="9" fill="#f25022"/>
                    <rect x="11" y="1" width="9" height="9" fill="#7fba00"/>
                    <rect x="1" y="11" width="9" height="9" fill="#00a4ef"/>
                    <rect x="11" y="11" width="9" height="9" fill="#ffb900"/>
                  </svg>
                )}
                <span>Continue with Microsoft</span>
                <span className="ml-auto text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded"
                  style={{ background: "hsl(var(--electric-blue) / 0.12)", color: "hsl(var(--electric-blue))" }}>
                  SSO / SAML
                </span>
              </button>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-[10px] uppercase tracking-widest font-bold">
                <span className="bg-card px-3 text-muted-foreground/60">Or email login</span>
              </div>
            </div>

            {/* Feedback banners */}
            {error && (
              <div className="flex items-start gap-2.5 rounded-xl px-4 py-3 text-sm"
                style={{ background: "hsl(var(--signal-red) / 0.08)", border: "1px solid hsl(var(--signal-red) / 0.25)" }}>
                <AlertCircle className="w-4 h-4 text-signal-red flex-shrink-0 mt-0.5" />
                <p className="text-signal-red font-medium leading-relaxed">{error}</p>
              </div>
            )}
            {success && (
              <div className="flex items-start gap-2.5 rounded-xl px-4 py-3 text-sm"
                style={{ background: "hsl(var(--signal-green) / 0.08)", border: "1px solid hsl(var(--signal-green) / 0.25)" }}>
                <CheckCircle className="w-4 h-4 text-signal-green flex-shrink-0 mt-0.5" />
                <p className="text-signal-green font-medium leading-relaxed">{success}</p>
              </div>
            )}

            {/* Email/password form */}
            <form onSubmit={handleSubmit} className="space-y-3">
              {mode === "signup" && (
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Full name"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    autoComplete="name"
                    className="w-full bg-secondary border border-border rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-electric-blue/30 focus:border-electric-blue/50 text-foreground placeholder:text-muted-foreground transition-all"
                  />
                </div>
              )}

              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                <input
                  type="email"
                  placeholder="Email address"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  className="w-full bg-secondary border border-border rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-electric-blue/30 focus:border-electric-blue/50 text-foreground placeholder:text-muted-foreground transition-all"
                />
              </div>

              {mode !== "forgot" && (
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                  <input
                    type={showPw ? "text" : "password"}
                    placeholder="Password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    minLength={6}
                    autoComplete={mode === "signup" ? "new-password" : "current-password"}
                    className="w-full bg-secondary border border-border rounded-xl pl-10 pr-10 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-electric-blue/30 focus:border-electric-blue/50 text-foreground placeholder:text-muted-foreground transition-all"
                  />
                  <button type="button" onClick={() => setShowPw(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 opacity-40 hover:opacity-70 transition-opacity">
                    {showPw ? <EyeOff className="w-4 h-4 text-foreground" /> : <Eye className="w-4 h-4 text-foreground" />}
                  </button>
                </div>
              )}

              {mode === "signup" && (
                <p className="text-[11px] text-muted-foreground px-1 leading-relaxed">
                  Prefer instant access? Use Google sign-in above — no email confirmation needed.
                </p>
              )}

              {mode === "signin" && (
                <div className="text-right">
                  <button type="button" onClick={() => switchMode("forgot")}
                    className="text-xs text-muted-foreground hover:text-electric-blue transition-colors">
                    Forgot password?
                  </button>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ background: "var(--gradient-electric)", boxShadow: loading ? "none" : `0 4px 14px ${ACCENT}28` }}
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    {mode === "signin" ? "Sign In" : mode === "signup" ? "Create Account" : "Send Reset Link"}
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {mode === "forgot" && (
              <button
                type="button"
                onClick={() => switchMode("signin")}
                className="w-full text-xs text-muted-foreground hover:text-foreground transition-colors text-center pt-1"
              >
                ← Back to sign in
              </button>
            )}

            {/* Enterprise SSO note */}
            <div className="flex items-center gap-2 rounded-xl px-3 py-2.5 mt-1"
              style={{ background: "hsl(var(--electric-blue) / 0.04)", border: "1px solid hsl(var(--electric-blue) / 0.12)" }}>
              <Building2 className="w-3.5 h-3.5 flex-shrink-0" style={{ color: "hsl(var(--electric-blue))" }} />
              <p className="text-[10px] text-muted-foreground leading-relaxed">
                <span className="font-semibold text-foreground">Enterprise SAML/SSO</span> — Okta, Azure AD, and custom IdP available on Command+ plans.
              </p>
            </div>
          </div>
        </div>

        {/* ── Demo mode CTA ── */}
        <div className="mt-5 text-center space-y-2">
          <p className="text-[11px] text-muted-foreground/60 uppercase tracking-widest font-semibold">Or</p>
          <button
            type="button"
            onClick={handleDemoAccess}
            className="w-full flex items-center justify-center gap-2.5 py-3 px-4 rounded-xl border-2 transition-all font-semibold text-sm group"
            style={{
              borderColor: "hsl(var(--electric-blue) / 0.3)",
              background: "hsl(var(--electric-blue) / 0.05)",
              color: "hsl(var(--electric-blue))",
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLButtonElement).style.background = "hsl(var(--electric-blue) / 0.1)";
              (e.currentTarget as HTMLButtonElement).style.borderColor = "hsl(var(--electric-blue) / 0.5)";
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLButtonElement).style.background = "hsl(var(--electric-blue) / 0.05)";
              (e.currentTarget as HTMLButtonElement).style.borderColor = "hsl(var(--electric-blue) / 0.3)";
            }}
          >
            <Sparkles className="w-4 h-4 flex-shrink-0" />
            Explore the Demo — no account needed
            <ArrowRight className="w-3.5 h-3.5 ml-auto opacity-60 group-hover:translate-x-0.5 transition-transform" />
          </button>
          <p className="text-[10px] text-muted-foreground/50 leading-relaxed">
            Pre-loaded with a 45-person tech company · No data saved
          </p>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-6 leading-relaxed">
          By signing in, you agree to our{" "}
          <span className="text-electric-blue cursor-pointer hover:underline">Terms of Service</span>
          {" "}and{" "}
          <span className="text-electric-blue cursor-pointer hover:underline">Privacy Policy</span>
        </p>
      </div>
    </div>
  );
}
