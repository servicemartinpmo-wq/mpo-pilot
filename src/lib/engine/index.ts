/**
 * APPHIA ENGINE — MAIN EXPORT
 * [Apphia.Logic] Unified entry point for all intelligence engine modules
 *
 * System Architecture:
 *  Signal Detection → Diagnosis → Advisory → Structural Remediation → System Updates
 *
 * Modules:
 *  - signals:      Layer 1 — detect organizational anomalies
 *  - diagnosis:    Layer 2 — root cause analysis via frameworks
 *  - advisory:     Layer 3 — actionable recommendations
 *  - maturity:     Layer 4 — CMMI-based scoring
 *  - dependency:   Layer 5 — dependency intelligence (TOC/CCPM)
 *  - systemChains: Layer 6 — orchestrated AI execution pipelines
 */

export * from "./signals";
export * from "./diagnosis";
export * from "./advisory";
export * from "./maturity";
export * from "./dependency";
export * from "./systemChains";

// Convenience: run the full engine and return complete state
export { runFullEngine, getEngineState } from "./systemChains";
