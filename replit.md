# Martin PMO — PMO-Ops Command Center

A PMO/Ops command center SPA built with React, Vite, TypeScript, Tailwind CSS, and Supabase. Internal engine name: Apphia (never shown to users). Company: Martin PMO. App: PMO-Ops Command Center.

## Architecture

- **Frontend**: React 18 + TypeScript + Vite (port 5000)
- **UI**: Tailwind CSS + shadcn/ui (Radix primitives)
- **Auth & Database**: Supabase (project ID: `okgpcsfqkshdzbfuigfq`)
- **Routing**: React Router v6
- **State**: React Query + local hooks
- **Charts**: Recharts

## Design System

**Dark mode forced globally** — `class="dark"` on `<html>` in index.html. Command center aesthetic throughout.
- Background: `hsl(224 22% 8%)` — deep midnight navy
- Cards: `hsl(224 20% 12%)` — slightly lighter navy card surfaces
- Sidebar: `hsl(222 28% 9%)` — deepest navy (always dark)
- **Electric Blue** `hsl(222 88% 65%)` — primary/tools nav active, data accents
- **Amber/Gold** `hsl(38 92% 52%)` — focus/important/command nav active
- **Teal** `hsl(174 68% 42%)` — success/secondary
- **Rose** `hsl(350 84% 62%)` — alerts/critical
- Section headers: cinematic `diag-slide-bg-*.jpg` images at 15-18% opacity (luminosity blend) with gradient overlay
- Hero banner: `onboard-hero.jpg` at 22% opacity (luminosity) + `onboard-network.jpg` at 8% (screen blend)
- Fonts: Inter (body), JetBrains Mono (scores/metrics)
- User Modes: founder | executive | startup | creative | freelance | simple (Guided Mode)
- Toast duration: 12 seconds (Sonner + Radix + PopupToast all unified)

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
- **Paste-as-Attachment**: In Reports (Custom Report tab) and Advisory, pasting text converts it to an attachment card instead of raw text. For paid tiers only (default=paid; free tier set via `localStorage.setItem("apphia_tier","free")`).
- **Auth loading hang fix (permanent)**: `loadProfile` uses `Promise.race` with a 4-second timeout so every sign-in event resolves within 4 seconds max. Belt-and-suspenders 5-second safety timer on mount.
- **Notification sounds**: `src/lib/notificationSound.ts` uses Web Audio API — alert tone (urgent/risk), success chime (wins/completions), soft ping (general). Wired into NotificationsPanel on open and AppLayout background poll (every 90s, respects snooze).
- **Knowledge Hub — Formulas tab**: 6 formula categories (Org Health, EVM, Finance, Risk, SPC, Marketing) with 16+ expandable formula cards — notation, variables, description, worked example + result.
- **Knowledge Hub — SOP viewer**: SOP rows expand to reveal numbered step-by-step procedure with vertical connector timeline. Click-to-expand per SOP.
- **Knowledge Hub — Lessons Learned**: Expandable Add Lesson form (title, outcome, impact, summary, tags) appends to local state. Combined display of user-added + seed lessons.
- **Knowledge Hub — Frameworks category filter**: Pill-button row above framework table filters categories in-place. "All" resets to full view.
- **Knowledge Hub — Document download**: Documents tab download button generates a `.txt` file from saved template fields and triggers browser download.
- **Reports — Lessons Learned tab**: Full Lessons Learned tab in Reports with Add Lesson form and complete card view. Seed data contains 5 real-world PMO lessons.

## Notes

- Migrated from Lovable to Replit (March 2026)
- Removed `@lovable.dev/cloud-auth-js` and `lovable-tagger` — replaced with standard Supabase OAuth
- CSS `@import` moved before `@tailwind` directives to fix build warning
- UI/UX upgrade applied March 2026 per planning document
- Onboarding: cinematic WelcomeScreen added before 4-step intake; industry selector replaced with searchable dropdown; "MARTIN" branding corrected to "Apphia"
- Auth page: Google/Apple OAuth removed (providers not configured in Supabase); improved inline error messages
- Backend (Supabase): added missing deleteInsight, deleteSopRecord, deleteGovernanceLog operations; added team_members table (schema, types, CRUD); added real-time Supabase channel subscriptions via useRealtimeSync() hook mounted in App.tsx root
- Migration file: supabase/migrations/20260309000001_team_members.sql — must be applied via Supabase dashboard SQL editor
