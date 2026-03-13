# PMO-Ops Command Center

## Overview

The PMO-Ops Command Center, internally codenamed "Apphia," is a single-page application designed for Martin PMO to serve as a comprehensive command center for Project Management Office (PMO) and Operations tasks. It aims to provide a centralized hub for managing projects, decisions, initiatives, action items, departments, and teams. The application integrates strategic advisory frameworks, robust reporting, and workflow automation, underpinned by an AI-driven organizational health engine to provide diagnostics, signals, and recommendations.

The project's vision is to empower organizations with actionable insights and intelligent tools to enhance operational efficiency, strategic alignment, and decision-making. Key capabilities include:

- Executive dashboard for high-level oversight
- Project and initiative management with CRUD operations
- AI-powered diagnostics and strategic advisory
- Comprehensive reporting and analytics
- Workflow automation and integrations
- Knowledge management and resource hub
- Expense management with receipt upload (camera capture on mobile + file picker), allocation lines (GL codes + cost centers), shared team notes, and financial document templates
- Subscription Management with sortable table, ROI/waste scoring, summary dashboard cards (monthly spend, MoM change, projected YoY, flagged waste), and add/edit forms

## User Preferences

- **Communication Style**: Clear, direct, and concise. Avoid jargon where simpler terms suffice.
- **Workflow**: Iterative development with clear milestones. Prioritize foundational features before advanced enhancements.
- **Interaction**: Ask for clarification or confirmation before implementing significant architectural changes or complex features. Provide options when multiple valid approaches exist.
- **Explanations**: Detailed explanations for non-trivial changes or design decisions are preferred.
- **Feedback**: Integrate feedback actively, ensuring changes align with specified requirements.
- **Deployment**: Focus on a stable and deployable product at each major iteration.

## System Architecture

The PMO-Ops Command Center is built as a Single Page Application (SPA) using a modern web development stack.

- **Frontend**: React 18 with TypeScript, powered by Vite for fast development. The application runs on port 5000.
- **UI/UX**: Tailwind CSS is used for utility-first styling, complemented by `shadcn/ui` (built on Radix primitives) for accessible and customizable UI components.
    - **Color Scheme**: The application defaults to a light theme with a hardcoded dark sidebar (`hsl(222 28% 9%)`). Specific pages like CRM and Marketing maintain a dark background (`hsl(224 22% 10%)`) for an immersive look.
    - **Accent Colors**: Electric Blue (`hsl(222 88% 65%)`) for primary actions, Amber/Gold (`hsl(38 92% 52%)`) for focus, Teal (`hsl(174 68% 42%)`) for success, and Rose (`hsl(350 84% 62%)`) for critical alerts.
    - **Typography**: Inter for body text and JetBrains Mono for metrics and scores.
    - **Visual Elements**: Cinematic background images (`diag-slide-bg-*.jpg`, `onboard-hero.jpg`, `onboard-network.jpg`) with opacity and blend modes are used for section headers and hero banners to create a distinct aesthetic.
    - **Interaction Patterns**: Features like a global Command Palette (⌘K / Ctrl+K), a fixed Top Status Bar, animated SVG progress rings, delta pills, mini sparklines, activity heatmaps, and typewriter effects are implemented for an enhanced user experience. Card hover lifts and focus mode (`.focus-group`) are used for visual interaction.
- **Authentication & Database**: Supabase serves as the backend for authentication and database management. It handles user profiles, organizational data, project specifics, and real-time updates. Replit Auth is also supported via a dedicated Express server (`server/index.ts`, port 3001) using OpenID Connect (OIDC) with Passport.js. The OIDC flow uses `connect-pg-simple` for session storage (sharing the single `pg.Pool` from `server/db.ts`) and upserts user data into `replit_users` table. Vite proxies `/api/*` requests to the Express server. The `useAuth` hook checks both Supabase and Replit auth states.
- **Server Stability**: The Express server (`server/index.ts`) includes: global `uncaughtException` and `unhandledRejection` handlers to prevent silent crashes; a singleton database pool (`server/db.ts`, max 10 connections) shared by both the session store and auth queries; a singleton Supabase admin client; keep-alive/headers timeouts set to prevent socket hangs behind proxies; graceful shutdown with a 10-second force-exit fallback; and a `/health` endpoint reporting uptime and memory usage. The deployment config uses `autoscale` with the default replica count.
- **Demo Mode**: A guest access flow that bypasses Supabase auth entirely. Activated via the "Explore the Demo" button on the auth page (routes through `/?demo=1` → `main.tsx` → `activateDemo()` in `companyStore.ts`). `useAuth` initializes with `loading=false` and skips all Supabase subscriptions when `isDemoMode()` is true. The demo profile (Apex Operations Group, 45-person tech company) is pre-loaded from localStorage. A sticky amber banner appears in `AppLayout` with a "Sign Up Free" CTA and dismiss button. Calling `clearDemo()` + `window.location.replace('/auth')` exits demo mode with a full page reload.
- **Routing**: React Router v6 manages client-side navigation.
- **State Management**: React Query is used for server-state management, complemented by local React hooks for UI state.
- **Charting**: Recharts is utilized for data visualization and analytics outputs.
- **AI Engine**: An internal AI engine, located in `src/lib/engine/`, provides advisory, maturity assessments, and signal generation for organizational health. The **Contextual Scoring Layer** (`contextEngine.ts`) calibrates all scores, signals, and recommendations based on the organization's profile: industry, company stage, team size, revenue, fiscal quarter, and goal urgency. It exports `OrgContext`, `buildOrgContext()`, `getContextMultipliers()`, `explainScore()`, and `getContextFactors()`. All engine functions (`maturity.ts`, `signals.ts`, `advisory.ts`) accept optional `OrgContext` — `runFullEngine()` in `systemChains.ts` automatically builds and passes context from the stored company profile.
- **Core Components**: Key reusable components include `AppLayout`, `CompanyHealthScore` (animated SVG ring gauge), `NotificationsPanel`, `InsightCard`, `OrgHealthOrb` (3D-style health orb), `OnboardingWizard`, and `PageBanner`.
- **PMO-Ops Fallback System**: When the live engine is unavailable (no org data, repeated engine failures, or manual override), the app surfaces a static fallback experience accessible via the "Offline Guidance" nav item. Built from: `src/lib/fallbackData.ts` (12 templates across 4 categories, 7 rule-based recommendations with interactive checklists, 6 community signals), `src/hooks/usePmoStatus.ts` (tracks engine health with localStorage persistence and failure counting), `src/components/PmoFallbackPanel.tsx` (3-tab panel UI), `src/pages/FallbackMode.tsx` (dedicated page at `/fallback`). All 6 mode nav configs include the "Offline Guidance" link in the Tools section.
- **Bug Fix**: Resolved a temporal dead zone (TDZ) crash in `AppLayout.tsx` — `const location = useLocation()` was declared after a `useEffect` whose dependency array (`[location.pathname]`) was evaluated during render. Moved the `useLocation()` call to the top of the component function, before any hooks that reference `location`.
- **Tech-Ops Module**: A full backup, file-manager, and data reorganization system at `/tech-ops`. Connected integrations can be synced (manually or all-at-once) to mirror key data objects into `integration_backups`. Users can browse backed-up data in a two-pane file-manager layout (sources on left, records on right), create custom folders, drag-and-drop records between folders, rename/delete folders — all persisted in `techops_folders` and `techops_folder_items` tables without modifying source apps. A sync log tab shows per-integration sync history (records added/updated, errors, duration). The dashboard surfaces a "Backup Health" KPI card showing synced vs. connected integrations, total records, and last sync time. Tables: `integration_backups`, `integration_sync_log`, `techops_folders`, `techops_folder_items`. Migration: `supabase/migrations/20260313000001_techops.sql`.
- **Data Services**: `supabaseDataService.ts` centralizes all CRUD operations with Supabase.
- **Project Structure**: Organized into `pages/`, `components/` (with `components/ui/` for shadcn components), `hooks/`, `lib/` (for services, stores, engine logic, and static data), and `integrations/supabase/`.

## External Dependencies

- **Supabase**:
    - **Project ID**: `okgpcsfqkshdzbfuigfq`
    - **Environment Variables**: `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`, `VITE_SUPABASE_PROJECT_ID`
    - **Services Used**: Authentication, PostgreSQL Database (with various custom functions for data processing and aggregation), Realtime subscriptions.
- **React**: Frontend UI library.
- **Vite**: Build tool and development server.
- **TypeScript**: Superset of JavaScript for type safety.
- **Tailwind CSS**: Utility-first CSS framework.
- **shadcn/ui**: Component library built on Radix UI primitives.
- **React Router v6**: Declarative routing for React.
- **React Query**: Data-fetching and state management library.
- **Recharts**: Composable charting library built with React and D3.