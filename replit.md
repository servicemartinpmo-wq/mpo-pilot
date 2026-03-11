# Apphia Command Center

A PMO/Ops command center SPA built with React, Vite, TypeScript, Tailwind CSS, and Supabase.

## Architecture

- **Frontend**: React 18 + TypeScript + Vite (port 5000)
- **UI**: Tailwind CSS + shadcn/ui (Radix primitives)
- **Auth & Database**: Supabase (project ID: `okgpcsfqkshdzbfuigfq`)
- **Routing**: React Router v6
- **State**: React Query + local hooks
- **Charts**: Recharts

## Design System

**Light theme by default** — professional, clean, SaaS-standard.
- Background: `hsl(220 18% 97%)` — soft off-white (light mode default in `:root`)
- Cards: `hsl(0 0% 100%)` — white cards with soft shadows
- Sidebar: `hsl(225 50% 11%)` — deep navy (always dark, regardless of theme)
- **Electric Blue** `hsl(222 72% 48%)` — primary/tools nav active, data accents
- **Amber/Gold** `hsl(38 85% 46%)` — focus/important/command nav active
- **Teal** `hsl(174 65% 34%)` — success/secondary
- **Rose** `hsl(350 72% 52%)` — alerts/critical
- Text: dark navy `hsl(225 30% 8%)` — high contrast on white
- Dark mode available via `.dark` class
- Fonts: Inter (body), JetBrains Mono (scores/metrics)
- User Modes: founder | executive | startup | creative | freelance | simple (Guided Mode)

## Pages & Routes

| Path | Page | Notes |
|------|------|-------|
| `/` | Dashboard (Index) | Executive command center |
| `/projects` | Projects | NEW — project grid with CRUD |
| `/decisions` | Decisions | NEW — decision log with outcomes |
| `/initiatives` | Initiatives | Initiative portfolio |
| `/action-items` | Action Items | Task management |
| `/departments` | Departments | Dept cards |
| `/team` | Team | Team members |
| `/diagnostics` | Diagnostics | Signal → Diagnosis → Advisory pipeline |
| `/reports` | Reports | Analytics outputs |
| `/knowledge` | Resource Hub | Knowledge base |
| `/workflows` | Workflows | Workflow automation |
| `/advisory` | Advisory | Strategic advisory frameworks |
| `/integrations` | Integrations | External connections |
| `/admin` | Systems | App settings |

## Key Components

- `AppLayout.tsx` — Sidebar (collapsed/expanded), notification bell, health score bar, snooze
- `CompanyHealthScore.tsx` — Animated SVG ring gauge with dimension breakdown
- `NotificationsPanel.tsx` — Slide-in notifications panel from DB `notifications` table
- `InsightCard.tsx` — Intelligence signal cards ranked by priority score
- `OrgHealthOrb.tsx` — Living 3D-style health orb
- `OnboardingWizard.tsx` — 4-step onboarding + 6-slide diagnostic deck + 5-slide app walkthrough
- `PageBanner.tsx` — Contextual page banners

## Project Structure

```
src/
  App.tsx              — Root routing and auth guard
  main.tsx             — Entry point
  pages/               — Page components
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
    supabase/               — Supabase client + generated types (4,088 lines)
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

Supabase project: `okgpcsfqkshdzbfuigfq`. Migrations in `supabase/migrations/`.

**Original profile-centric tables** (use `profile_id` FK):
- `profiles`, `departments`, `initiatives`
- `insights`, `governance_logs`, `sop_records`
- `org_metrics`, `integration_connections`, `creator_prompts`
- `authority_matrix`, `team_members`

**New org/user-centric tables** (migration 20260311000002):
- `organizations`, `organization_members`, `users`, `teams`, `department_membership`
- `projects`, `kpis`, `kpi_history`, `milestones`
- `risks`, `dependencies`, `task_dependencies`
- `signals`, `signal_definitions`
- `frameworks`, `knowledge_items`, `modules`, `framework_knowledge_link`
- `decision_weights`, `attachments`
- `advisories`, `advisory_modules`, `advisory_recommendations`
- `notifications`, `activity_feed`, `next_best_actions`
- `ai_call_logs`, `ai_usage`, `algorithm_signals`, `algorithm_scores`
- `alerts`, `api_keys`, `workflow_runs`
- `reminders`, `task_reminders`, `meetings`
- `user_work_capacity`, `user_snoozes`, `org_health_metrics`
- `kg_nodes`, `kg_relationships` (knowledge graph)

**Key DB functions**: `compute_next_best_for_user`, `generate_daily_plan`, `get_initiative_details`, `get_project_progress`, `get_project_milestones`, `get_project_kpi_summary`, `get_signal_summary`, `get_milestone_progress`, `compute_predicted_duration`, `calculate_algorithm_score`, `validate_dependency`, `track_kpi_history`, `record_history`, `enqueue_update_notification_v2`

**Note**: `action_items` in remote Supabase uses `user_id` (not `profile_id`). The data service handles both via `or()` filters.

## UI/UX Design System

- **Mission-control aesthetic**: White cards on light-gray background, deep navy sidebar, electric blue + teal accents
- **DepartmentCard**: 4 explicit numeric metric tiles — Capacity %, Execution Health, Risk Score, SOP Adherence — color-coded Red/Yellow/Green with colored accent top bar
- **Initiatives page**: Dual view (Table / Cards toggle). Table shows Priority Score, Strategic Alignment, Estimated Impact, Dependency Risk, Progress, Owner, Due Date — all sortable. Cards show full detail.
- **InsightCard**: Standardized 4-section format — Situation (always visible), Diagnosis, Recommendation, System Remedy (expandable). Scored mini-bar row for Impact/Urgency/Risk/Leverage.
- **FrameworkPanel**: Grid of labeled framework cards showing full names (Porter's Five Forces, Balanced Scorecard, OKRs, Lean, Six Sigma, TOC, Rumelt) with status chips

## Features (Recent)

- **App Walkthrough**: 5-slide interactive walkthrough shown after onboarding diagnostic deck (before launch). Covers Dashboard, Work/Strategy, Diagnostics, Reports, and Advisory. Skip button available. Can be triggered again from Help section.
- **Guided / Simple Mode**: `useUserMode` hook returns `isSimpleMode`. `Dashboard` component shows `SimpleDashboard` when in simple mode — plain-language KPIs, priority list, setup checklist, quick links, mode switch. Mode also shown in onboarding selection screen for small orgs.
- **Paste-as-Attachment**: In Reports (Custom Report tab) and CreatorLab, pasting text converts it to an attachment card instead of raw text. For paid tiers only (default=paid; free tier set via `localStorage.setItem("apphia_tier","free")`). Short pastes (<5 words) in CreatorLab pass through as normal.
- **Dashboard hang fix**: App.tsx now treats a null/missing profile as needing onboarding (shows wizard) instead of rendering an infinite loading spinner. All hardcoded dark border values in Dashboard replaced with `hsl(var(--border))` and `hsl(var(--muted))` for light theme compatibility.

## Notes

- Migrated from Lovable to Replit (March 2026)
- Removed `@lovable.dev/cloud-auth-js` and `lovable-tagger` — replaced with standard Supabase OAuth
- CSS `@import` moved before `@tailwind` directives to fix build warning
- UI/UX upgrade applied March 2026 per planning document
- Onboarding: cinematic WelcomeScreen added before 4-step intake; industry selector replaced with searchable dropdown; "MARTIN" branding corrected to "Apphia"
- Auth page: Google/Apple OAuth removed (providers not configured in Supabase); improved inline error messages
- Backend (Supabase): added missing deleteInsight, deleteSopRecord, deleteGovernanceLog operations; added team_members table (schema, types, CRUD); added real-time Supabase channel subscriptions via useRealtimeSync() hook mounted in App.tsx root
- Migration file: supabase/migrations/20260309000001_team_members.sql — must be applied via Supabase dashboard SQL editor
