/**
 * VoiceCommand — Navigation-only voice shortcut panel.
 * Triggered by Ctrl+Space. Say "hey apphia" to open the Apphia panel.
 */
import { useState, useEffect, useRef, useCallback } from "react";
import { Mic, MicOff, X, Loader2, ChevronRight, Keyboard } from "lucide-react";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { openApphia } from "@/components/ApphiaPanel";

type State = "idle" | "listening" | "processing" | "result" | "error";

type SpeechRecognitionCtor = new () => SpeechRecognition;
function getSR(): SpeechRecognitionCtor | undefined {
  const w = window as unknown as { SpeechRecognition?: SpeechRecognitionCtor; webkitSpeechRecognition?: SpeechRecognitionCtor };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition;
}

interface RouteHint {
  keywords: string[];
  path: string;
  label: string;
}

const ROUTE_HINTS: RouteHint[] = [
  { keywords: ["dashboard", "home", "overview", "command center"], path: "/", label: "Go to Dashboard" },
  { keywords: ["initiative", "initiatives", "projects", "project"], path: "/initiatives", label: "Go to Initiatives" },
  { keywords: ["department", "departments", "team", "teams"], path: "/departments", label: "Go to Departments" },
  { keywords: ["diagnostic", "diagnostics", "health", "score"], path: "/diagnostics", label: "Go to Diagnostics" },
  { keywords: ["report", "reports", "analytics"], path: "/reports", label: "Go to Reports" },
  { keywords: ["action", "actions", "task", "tasks", "todo"], path: "/action-items", label: "Go to Action Items" },
  { keywords: ["knowledge", "resource", "hub", "framework", "template"], path: "/knowledge", label: "Go to Resource Hub" },
  { keywords: ["workflow", "workflows", "automation"], path: "/workflows", label: "Go to Workflows" },
  { keywords: ["advisory", "advisor", "advice", "consult"], path: "/advisory", label: "Go to Advisory" },
  { keywords: ["crm", "customer", "clients", "contacts"], path: "/crm", label: "Go to CRM" },
  { keywords: ["marketing", "campaign", "brand"], path: "/marketing", label: "Go to Marketing" },
  { keywords: ["system", "systems", "admin", "settings", "customize"], path: "/admin", label: "Go to Systems" },
  { keywords: ["agile", "sprint", "kanban", "scrum"], path: "/agile", label: "Go to Agile Board" },
  { keywords: ["decision", "decisions", "decide"], path: "/decisions", label: "Go to Decisions" },
  { keywords: ["creator", "lab", "create", "generate"], path: "/creator-lab", label: "Go to Creator Lab" },
  { keywords: ["pricing", "upgrade", "plan"], path: "/pricing", label: "Go to Pricing" },
  { keywords: ["graph", "knowledge graph", "map"], path: "/graph", label: "Go to Graph View" },
];

function parseIntent(transcript: string): RouteHint | null {
  const lower = transcript.toLowerCase();
  for (const hint of ROUTE_HINTS) {
    if (hint.keywords.some(k => lower.includes(k))) return hint;
  }
  return null;
}

const PROMPTS = [
  "Try: 'Go to diagnostics'",
  "Try: 'Show my initiatives'",
  "Try: 'Open action items'",
  "Try: 'Take me to reports'",
  "Or say 'Hey Apphia' to ask anything",
];

export default function VoiceCommand() {
  const [open, setOpen]           = useState(false);
  const [state, setState]         = useState<State>("idle");
  const [transcript, setTranscript] = useState("");
  const [intent, setIntent]       = useState<RouteHint | null>(null);
  const [errorMsg, setErrorMsg]   = useState("");
  const [promptIdx, setPromptIdx] = useState(0);
  const [supported, setSupported] = useState(true);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const SR = getSR();
    if (!SR) setSupported(false);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => setPromptIdx(i => (i + 1) % PROMPTS.length), 3200);
    return () => clearInterval(interval);
  }, []);

  const handleKeyboard = useCallback((e: KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.code === "Space") {
      e.preventDefault();
      setOpen(o => !o);
    }
    if (e.code === "Escape") setOpen(false);
  }, []);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyboard);
    return () => window.removeEventListener("keydown", handleKeyboard);
  }, [handleKeyboard]);

  const startListening = () => {
    const SR = getSR();
    if (!SR) { setErrorMsg("Voice input is not supported in this browser. Try Chrome or Edge."); setState("error"); return; }

    const recognition: SpeechRecognition = new SR();
    recognition.lang = "en-US";
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;
    recognitionRef.current = recognition;
    setState("listening");
    setTranscript("");
    setIntent(null);

    recognition.onresult = (event) => {
      const current = Array.from(event.results).map(r => r[0].transcript).join("");
      setTranscript(current);
      if (event.results[event.results.length - 1].isFinal) {
        // "Hey Apphia" wake phrase — open Apphia panel
        if (current.toLowerCase().includes("apphia")) {
          setOpen(false);
          openApphia();
          return;
        }
        setState("processing");
        const found = parseIntent(current);
        setIntent(found);
        setState("result");
      }
    };

    recognition.onerror = (event) => {
      setErrorMsg(
        event.error === "not-allowed"
          ? "Microphone permission denied. Please allow access in your browser settings."
          : event.error === "no-speech"
          ? "No speech detected. Please try again."
          : `Voice error: ${event.error}`
      );
      setState("error");
    };

    recognition.onend = () => { if (state === "listening") setState("idle"); };
    recognition.start();
  };

  const stopListening = () => { recognitionRef.current?.stop(); setState("idle"); };
  const reset = () => { setState("idle"); setTranscript(""); setIntent(null); setErrorMsg(""); };

  const executeIntent = () => {
    if (intent) { navigate(intent.path); setOpen(false); setState("idle"); setTranscript(""); setIntent(null); }
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        title="Voice Navigation (Ctrl+Space)"
        className="fixed bottom-[70px] right-6 z-40 w-10 h-10 rounded-full flex items-center justify-center shadow-md transition-all hover:scale-105 active:scale-95"
        style={{
          background: "hsl(222 30% 18%)",
          border: "1px solid hsl(222 30% 28%)",
          boxShadow: "0 4px 14px hsl(0 0% 0% / 0.28)",
        }}>
        <Mic className="w-4 h-4" style={{ color: "hsl(0 0% 100% / 0.55)" }} />
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-6"
      style={{ background: "hsl(0 0% 0% / 0.50)", backdropFilter: "blur(4px)" }}
      onClick={(e) => { if (e.target === e.currentTarget) setOpen(false); }}>
      <div className="w-full max-w-sm rounded-3xl overflow-hidden"
        style={{
          background: "hsl(225 48% 10%)",
          border: "1px solid hsl(225 40% 22%)",
          boxShadow: "0 40px 100px hsl(0 0% 0% / 0.6)",
        }}>
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-xl flex items-center justify-center"
              style={{ background: "hsl(222 40% 20%)" }}>
              <Mic className="w-3.5 h-3.5" style={{ color: "hsl(0 0% 100% / 0.60)" }} />
            </div>
            <div>
              <span className="text-sm font-bold text-white block">Voice Navigation</span>
              <span className="text-[10px]" style={{ color: "hsl(0 0% 100% / 0.28)" }}>
                Say "Hey Apphia" to open AI assistant
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono flex items-center gap-1" style={{ color: "hsl(0 0% 100% / 0.28)" }}>
              <Keyboard className="w-3 h-3" /> Ctrl+Space
            </span>
            <button onClick={() => setOpen(false)} className="p-1 rounded-lg hover:bg-white/10 transition-colors">
              <X className="w-4 h-4" style={{ color: "hsl(0 0% 100% / 0.50)" }} />
            </button>
          </div>
        </div>

        {/* Mic area */}
        <div className="px-5 py-4">
          <div className="flex flex-col items-center py-5">
            <button
              onClick={state === "listening" ? stopListening : startListening}
              disabled={state === "processing"}
              className={cn("w-16 h-16 rounded-full flex items-center justify-center transition-all", state === "listening" && "scale-110")}
              style={{
                background: state === "listening"
                  ? "linear-gradient(135deg, hsl(0 72% 55%), hsl(350 84% 62%))"
                  : "hsl(222 40% 20%)",
                boxShadow: state === "listening"
                  ? "0 0 0 14px hsl(0 72% 55% / 0.10), 0 8px 24px hsl(0 72% 55% / 0.35)"
                  : "0 4px 16px hsl(0 0% 0% / 0.35)",
              }}>
              {state === "processing" ? <Loader2 className="w-7 h-7 text-white animate-spin" />
                : state === "listening" ? <MicOff className="w-7 h-7 text-white" />
                : <Mic className="w-7 h-7" style={{ color: "hsl(0 0% 100% / 0.65)" }} />}
            </button>
            <p className="mt-3 text-sm font-medium" style={{ color: "hsl(0 0% 100% / 0.60)" }}>
              {state === "idle"       && "Tap mic to start"}
              {state === "listening"  && "Listening…"}
              {state === "processing" && "Processing…"}
              {state === "result"     && (intent ? "Found — confirm to go" : "Not recognized")}
              {state === "error"      && "Error"}
            </p>
            {state === "idle" && (
              <p className="mt-1 text-xs" style={{ color: "hsl(0 0% 100% / 0.28)" }}>{PROMPTS[promptIdx]}</p>
            )}
          </div>

          {transcript && (
            <div className="rounded-xl px-4 py-2.5 mb-3"
              style={{ background: "hsl(225 40% 14%)", border: "1px solid hsl(225 30% 20%)" }}>
              <p className="text-[10px] uppercase tracking-widest mb-1" style={{ color: "hsl(0 0% 100% / 0.28)" }}>Heard</p>
              <p className="text-sm text-white">"{transcript}"</p>
            </div>
          )}

          {state === "result" && intent && (
            <button onClick={executeIntent}
              className="w-full flex items-center justify-between rounded-xl px-4 py-3 mb-3 transition-all hover:opacity-90"
              style={{
                background: "hsl(222 88% 62% / 0.16)",
                border: "1px solid hsl(222 88% 62% / 0.35)",
              }}>
              <div>
                <p className="text-[10px] uppercase tracking-widest mb-0.5" style={{ color: "hsl(222 88% 65% / 0.60)" }}>Navigate to</p>
                <p className="text-sm font-bold text-white">{intent.label}</p>
              </div>
              <ChevronRight className="w-4 h-4" style={{ color: "hsl(222 88% 65%)" }} />
            </button>
          )}

          {state === "result" && !intent && transcript && (
            <div className="rounded-xl px-4 py-2.5 mb-3"
              style={{ background: "hsl(38 92% 52% / 0.10)", border: "1px solid hsl(38 92% 52% / 0.22)" }}>
              <p className="text-xs text-center" style={{ color: "hsl(38 92% 60%)" }}>
                Try "diagnostics", "action items", or say "Hey Apphia" to ask anything.
              </p>
            </div>
          )}

          {state === "error" && (
            <div className="rounded-xl px-4 py-2.5 mb-3"
              style={{ background: "hsl(0 72% 55% / 0.10)", border: "1px solid hsl(0 72% 55% / 0.22)" }}>
              <p className="text-xs text-center" style={{ color: "hsl(0 72% 65%)" }}>{errorMsg}</p>
            </div>
          )}

          <div className="relative">
            <input type="text" value={transcript}
              onChange={e => {
                setTranscript(e.target.value);
                setIntent(parseIntent(e.target.value));
                setState(e.target.value ? "result" : "idle");
              }}
              onKeyDown={e => { if (e.key === "Enter" && intent) executeIntent(); }}
              placeholder="Or type a page name…"
              className="w-full bg-transparent text-sm text-white placeholder:text-white/25 rounded-xl px-4 py-3 focus:outline-none"
              style={{ border: "1px solid hsl(225 30% 20%)", caretColor: "hsl(222 88% 62%)" }}
            />
          </div>

          <div className="flex items-center justify-between mt-3 pb-1">
            {state !== "idle" && (
              <button onClick={reset} className="text-xs font-semibold hover:opacity-70 transition-opacity"
                style={{ color: "hsl(0 0% 100% / 0.28)" }}>Reset</button>
            )}
            <p className="text-[10px] ml-auto" style={{ color: "hsl(0 0% 100% / 0.16)" }}>
              Navigation only · Ctrl+Space
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
