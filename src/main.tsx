import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { activateDemo } from "./lib/companyStore";

// Activate demo mode via URL param (?demo=1) — runs before React initializes.
// This is the most reliable activation path (used by Auth page demo button).
const _urlParams = new URLSearchParams(window.location.search);
if (_urlParams.get("demo") === "1") {
  activateDemo();
  window.history.replaceState({}, "", "/");
}

createRoot(document.getElementById("root")!).render(<App />);
