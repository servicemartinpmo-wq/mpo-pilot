import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { activateDemo } from "./lib/companyStore";
import { ErrorBoundary } from "./components/ErrorBoundary";

// Activate demo mode via URL param (?demo=1) — runs before React initializes.
const _urlParams = new URLSearchParams(window.location.search);
if (_urlParams.get("demo") === "1") {
  activateDemo();
  window.history.replaceState({}, "", "/");
}

// Global unhandled error handler — catches module-level crashes that the
// React ErrorBoundary cannot (e.g. duplicate exports, bad imports).
// Shows a recovery UI in the boot shell instead of a blank loading screen.
window.addEventListener("error", (e) => {
  const bootShell = document.getElementById("boot-shell");
  if (bootShell && !document.getElementById("root")?.hasChildNodes()) {
    bootShell.innerHTML = `
      <div style="max-width:400px;text-align:center;padding:32px 24px;background:hsl(225 40% 13%);border:1px solid hsl(0 72% 55% / 0.35);border-radius:24px;box-shadow:0 40px 100px hsl(0 0% 0% / 0.6)">
        <div style="font-size:28px;margin-bottom:12px">⚠️</div>
        <p style="color:white;font-weight:800;font-size:15px;margin-bottom:6px">Failed to load</p>
        <p id="boot-error-msg" style="color:hsl(0 0% 100%/0.5);font-size:12px;margin-bottom:20px;line-height:1.6"></p>
        <button onclick="localStorage.clear();location.reload()"
          style="background:hsl(222 88% 62%);color:white;border:none;border-radius:12px;padding:10px 20px;font-weight:700;font-size:13px;cursor:pointer;margin-right:8px">
          Clear Cache &amp; Reload
        </button>
        <button onclick="location.reload()"
          style="background:hsl(225 35% 22%);color:hsl(0 0% 100%/0.7);border:1px solid hsl(225 25% 30%);border-radius:12px;padding:10px 20px;font-weight:700;font-size:13px;cursor:pointer">
          Retry
        </button>
      </div>`;
    const msgEl = document.getElementById("boot-error-msg");
    if (msgEl) msgEl.textContent = e.message || "A startup error occurred.";
    bootShell.style.opacity = "1";
  }
});

createRoot(document.getElementById("root")!).render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
);
