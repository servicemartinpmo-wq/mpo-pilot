# Apphia Command Center

A PMO/Ops command center SPA built with React, Vite, TypeScript, Tailwind CSS, and Supabase.

## Architecture

- **Frontend**: React 18 + TypeScript + Vite (port 5000)
- **UI**: Tailwind CSS + shadcn/ui (Radix primitives)
- **Auth & Database**: Supabase (project ID: `mifmjhzgtpsbthjwldxx`)
- **Routing**: React Router v6
- **State**: React Query + local hooks
- **Charts**: Recharts

## Project Structure

```
src/
  App.tsx              — Root routing and auth guard
  main.tsx             — Entry point
  pages/               — Page components (Index, Initiatives, Departments, etc.)
  components/          — Shared components (AppLayout, OnboardingWizard, etc.)
  components/ui/       — shadcn/ui component library
  hooks/
    useAuth.ts         — Auth hook (Supabase session, profile, sign-in/out)
    useAppData.ts      — Central data hook (merges engine state + profile)
    useLiveData.ts     — Live data from Supabase
  lib/
    supabaseDataService.ts  — All Supabase CRUD operations
    companyStore.ts         — Local profile store (localStorage)
    engine/                 — AI org-health engine (advisory, maturity, signals, etc.)
    pmoData.ts              — Static seed data for new users
    frameworkData.ts        — Framework reference data
  integrations/
    supabase/               — Supabase client + generated types
```

## Environment Variables

Stored in Replit secrets/environment:
- `VITE_SUPABASE_URL` — Supabase project URL
- `VITE_SUPABASE_PUBLISHABLE_KEY` — Supabase anon/public key
- `VITE_SUPABASE_PROJECT_ID` — Supabase project ID

## Development

```bash
npm run dev    # Start dev server on port 5000
npm run build  # Build for production
```

## Database

Supabase schema is in `supabase/migrations/`. Tables:
- `profiles` — User profiles (extends auth.users)
- `departments`, `initiatives`, `action_items`
- `insights`, `governance_logs`, `sop_records`
- `org_metrics`, `integration_connections`, `creator_prompts`
- `authority_matrix`

## UI/UX Design System

- **Mission-control aesthetic**: White cards on light-gray background, deep navy sidebar, electric blue + teal accents
- **DepartmentCard**: 4 explicit numeric metric tiles — Capacity %, Execution Health, Risk Score, SOP Adherence — color-coded Red/Yellow/Green with colored accent top bar
- **Initiatives page**: Dual view (Table / Cards toggle). Table shows Priority Score, Strategic Alignment, Estimated Impact, Dependency Risk, Progress, Owner, Due Date — all sortable. Cards show full detail.
- **InsightCard**: Standardized 4-section format — Situation (always visible), Diagnosis, Recommendation, System Remedy (expandable). Scored mini-bar row for Impact/Urgency/Risk/Leverage.
- **FrameworkPanel**: Grid of labeled framework cards showing full names (Porter's Five Forces, Balanced Scorecard, OKRs, Lean, Six Sigma, TOC, Rumelt) with status chips

## Notes

- Migrated from Lovable to Replit (March 2026)
- Removed `@lovable.dev/cloud-auth-js` and `lovable-tagger` — replaced with standard Supabase OAuth
- CSS `@import` moved before `@tailwind` directives to fix build warning
- UI/UX upgrade applied March 2026 per planning document
