/**
 * Auth — Sign in / Sign up / Forgot password
 * Email + password only. OAuth buttons removed (providers not configured in Supabase).
 */
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import { Eye, EyeOff, Mail, Lock, User, ArrowRight, Tag, CheckCircle, AlertCircle } from "lucide-react";
import { SiReplit } from "react-icons/si";

type Mode = "signin" | "signup" | "forgot";

export default function AuthPage() {
  const navigate = useNavigate();
  const { signIn, signUp, resetPassword } = useAuth();
  const { signInWithReplit: authSignInWithReplit } = useAuth();
  
  // Use the local wrapper for better error handling/logging
  const handleReplitSignIn = () => {
    console.log("Replit login button clicked");
    authSignInWithReplit();
  };

  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const signInWithReplit = () => {
    try {
      console.log("Initiating Replit Auth...");
      const domain = window.location.host;
      window.location.href = `https://replit.com/auth_with_repl_site?domain=${domain}`;
    } catch (err) {
      console.error("Replit Auth redirect failed:", err);
      setError("Could not redirect to Replit Auth. Ensure you are viewing this through a Replit domain.");
    }
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
      const { error: err } = await signUp(email, password);
      if (err) { setError(err.message); setLoading(false); return; }
      setSuccess("Account created! Check your email to confirm, then come back to sign in. Check spam if you don't see it.");
      setMode("signin");
      setLoading(false);
      return;
    }

    const { error: err } = await signIn(email, password);
    if (err) {
      if (err.message.toLowerCase().includes("email not confirmed")) {
        setError("Please confirm your email first. Check your inbox (and spam folder) for the confirmation link.");
      } else if (err.message.toLowerCase().includes("invalid login")) {
        setError("Incorrect email or password. Please try again.");
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
          <div className="w-12 h-12 rounded-2xl mx-auto mb-4 flex items-center justify-center"
            style={{ background: "var(--gradient-electric)", boxShadow: `0 0 28px ${ACCENT}33` }}>
            <Tag className="w-6 h-6 text-white" />
          </div>
          <div className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground mb-1">Martin PMO</div>
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

          <div className="p-6 space-y-4">
            {/* Replit Auth Button */}
            <div className="grid grid-cols-1 gap-3 mb-2">
              <button
                type="button"
                onClick={handleReplitSignIn}
                className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl border-2 border-border bg-background hover:bg-secondary transition-all font-semibold text-sm group"
              >
                <SiReplit className="w-5 h-5 text-[#F26207] group-hover:scale-110 transition-transform" />
                Continue with Replit
              </button>
            </div>

            <div className="relative mb-4">
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

            {/* Form */}
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
                  After signing up, check your email for a confirmation link. Check your spam folder if it doesn't arrive within a minute.
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
          </div>
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
