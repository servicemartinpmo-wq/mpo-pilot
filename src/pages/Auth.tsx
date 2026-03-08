/**
 * Auth — Sign up / Sign in page with Google + Apple SSO
 */
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import { Eye, EyeOff, Mail, Lock, User, ArrowRight, Zap, Chrome } from "lucide-react";

type Mode = "signin" | "signup" | "forgot";

export default function AuthPage() {
  const navigate = useNavigate();
  const { signIn, signUp, signInWithGoogle, signInWithApple, resetPassword } = useAuth();

  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    if (mode === "forgot") {
      const { error: err } = await resetPassword(email);
      if (err) setError(err.message);
      else setSuccess("Check your email for a password reset link.");
      setLoading(false);
      return;
    }

    if (mode === "signup") {
      const { error: err } = await signUp(email, password);
      if (err) { setError(err.message); setLoading(false); return; }
      setSuccess("Account created! Check your email to verify, then sign in.");
      setMode("signin");
      setLoading(false);
      return;
    }

    const { error: err } = await signIn(email, password);
    if (err) { setError(err.message); setLoading(false); return; }
    navigate("/");
    setLoading(false);
  }

  async function handleGoogle() {
    setError(null);
    const { error: err } = await signInWithGoogle();
    if (err) setError(String(err));
  }

  async function handleApple() {
    setError(null);
    const { error: err } = await signInWithApple();
    if (err) setError(String(err));
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden">
      {/* Background glows */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px]"
          style={{ background: "radial-gradient(ellipse at top, hsl(233 65% 60% / 0.08) 0%, transparent 70%)" }} />
        <div className="absolute bottom-0 right-1/4 w-[600px] h-[400px]"
          style={{ background: "radial-gradient(ellipse at bottom, hsl(183 55% 40% / 0.06) 0%, transparent 70%)" }} />
      </div>

      <div className="relative z-10 w-full max-w-md px-6 py-10">
        {/* Brand */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-elevated"
            style={{ background: "var(--gradient-electric)" }}>
            <Zap className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-black text-foreground tracking-tight">
            {mode === "signin" ? "Welcome back" : mode === "signup" ? "Create your account" : "Reset password"}
          </h1>
          <p className="text-sm text-muted-foreground mt-1.5">
            {mode === "signin"
              ? "Sign in to your Apphia Command Center"
              : mode === "signup"
              ? "Set up your org intelligence platform"
              : "We'll send you a reset link"}
          </p>
        </div>

        <div className="bg-card border-2 border-border rounded-2xl shadow-elevated overflow-hidden">
          {/* Mode tabs */}
          {mode !== "forgot" && (
            <div className="flex border-b-2 border-border">
              {(["signin", "signup"] as Mode[]).map(m => (
                <button
                  key={m}
                  onClick={() => { setMode(m); setError(null); setSuccess(null); }}
                  className={cn(
                    "flex-1 py-3.5 text-sm font-semibold transition-all",
                    mode === m
                      ? "text-electric-blue bg-electric-blue/5 border-b-2 border-electric-blue"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {m === "signin" ? "Sign In" : "Sign Up"}
                </button>
              ))}
            </div>
          )}

          <div className="p-6 space-y-4">
            {/* SSO Buttons */}
            {mode !== "forgot" && (
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={handleGoogle}
                  className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border-2 border-border hover:border-border/80 bg-secondary hover:bg-secondary/80 text-sm font-semibold text-foreground transition-all"
                >
                  <Chrome className="w-4 h-4" style={{ color: "hsl(4 82% 55%)" }} />
                  Google
                </button>
                <button
                  onClick={handleApple}
                  className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border-2 border-border hover:border-border/80 bg-secondary hover:bg-secondary/80 text-sm font-semibold text-foreground transition-all"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                  </svg>
                  Apple
                </button>
              </div>
            )}

            {mode !== "forgot" && (
              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-border" />
                <span className="text-xs text-muted-foreground font-medium">or continue with email</span>
                <div className="flex-1 h-px bg-border" />
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-3">
              {mode === "signup" && (
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Full name"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="w-full bg-secondary border border-border rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-electric-blue/30 text-foreground placeholder:text-muted-foreground"
                  />
                </div>
              )}

              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="email"
                  placeholder="Email address"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  className="w-full bg-secondary border border-border rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-electric-blue/30 text-foreground placeholder:text-muted-foreground"
                />
              </div>

              {mode !== "forgot" && (
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type={showPw ? "text" : "password"}
                    placeholder="Password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    minLength={6}
                    className="w-full bg-secondary border border-border rounded-xl pl-10 pr-10 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-electric-blue/30 text-foreground placeholder:text-muted-foreground"
                  />
                  <button type="button" onClick={() => setShowPw(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 opacity-40 hover:opacity-70 transition-opacity">
                    {showPw ? <EyeOff className="w-4 h-4 text-foreground" /> : <Eye className="w-4 h-4 text-foreground" />}
                  </button>
                </div>
              )}

              {error && (
                <p className="text-xs text-signal-red font-medium px-1">{error}</p>
              )}
              {success && (
                <p className="text-xs text-signal-green font-medium px-1">{success}</p>
              )}

              {mode === "signin" && (
                <div className="text-right">
                  <button type="button" onClick={() => { setMode("forgot"); setError(null); }}
                    className="text-xs text-muted-foreground hover:text-electric-blue transition-colors">
                    Forgot password?
                  </button>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-50"
                style={{ background: "var(--gradient-electric)" }}
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
                onClick={() => { setMode("signin"); setError(null); setSuccess(null); }}
                className="w-full text-xs text-muted-foreground hover:text-foreground transition-colors text-center"
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
