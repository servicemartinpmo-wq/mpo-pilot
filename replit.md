# PMO-Ops Command Center

## Overview
The PMO-Ops Command Center, codenamed "Apphia," is a single-page application designed for Martin PMO. It serves as a centralized hub for managing projects, decisions, initiatives, action items, departments, and teams. The application integrates strategic advisory frameworks, robust reporting, workflow automation, and an AI-driven organizational health engine. Its vision is to provide actionable insights and intelligent tools to enhance operational efficiency, strategic alignment, and decision-making. Key capabilities include an executive dashboard, comprehensive project and initiative management, AI-powered diagnostics, extensive reporting, workflow automation, knowledge management, expense management, subscription management, and finance report generation.

## User Preferences
- **Communication Style**: Clear, direct, and concise. Avoid jargon where simpler terms suffice.
- **Workflow**: Iterative development with clear milestones. Prioritize foundational features before advanced enhancements.
- **Interaction**: Ask for clarification or confirmation before implementing significant architectural changes or complex features. Provide options when multiple valid approaches exist.
- **Explanations**: Detailed explanations for non-trivial changes or design decisions are preferred.
- **Feedback**: Integrate feedback actively, ensuring changes align with specified requirements.
- **Deployment**: Focus on a stable and deployable product at each major iteration.

## System Architecture
The PMO-Ops Command Center is a Single Page Application (SPA) built with React 18 and TypeScript, using Vite for development.

- **UI/UX**: Utilizes Tailwind CSS for styling and `shadcn/ui` for accessible components. It features a light theme with a dark sidebar, specific accent colors (Electric Blue, Amber/Gold, Teal, Rose), and typography (Inter, JetBrains Mono). Visual elements include cinematic background images and interactive patterns like a global Command Palette, Top Status Bar, animated SVG progress rings, and card hover effects.
- **Authentication & Database**: Supabase handles authentication and database management. Replit Auth is also supported via an Express server using OpenID Connect (OIDC) and Passport.js, with user data upserted into a `replit_users` table. The `useAuth` hook manages both authentication states.
- **Server Stability**: The Express server includes global error handlers, a singleton database pool, Supabase admin client, keep-alive/headers timeouts, graceful shutdown, and a `/health` endpoint.
- **Demo Mode**: A guest access flow is available, bypassing Supabase auth and pre-loading a demo profile.
- **Routing**: React Router v6 manages client-side navigation.
- **State Management**: React Query for server-state, complemented by local React hooks for UI state.
- **Charting**: Recharts is used for data visualization.
- **AI Engine**: An internal AI engine (`src/lib/engine/`) provides advisory, maturity assessments, and signal generation. A Contextual Scoring Layer calibrates all outputs based on organizational profile, using factors like industry, company stage, and team size.
- **Core Components**: Key reusable components include `AppLayout`, `CompanyHealthScore`, `NotificationsPanel`, `InsightCard`, `OrgHealthOrb`, `OnboardingWizard`, and `PageBanner`.
- **PMO-Ops Fallback System**: Provides a static fallback experience with templates and rule-based recommendations when the live engine is unavailable.
- **Tech-Ops Module**: A system for backup, file management, and data reorganization at `/tech-ops`. It allows syncing integrated data into `integration_backups`, browsing backed-up data, creating custom folders, and tracking sync history.
- **Memory Engine**: Implements a lifelong persistent context memory system (`src/lib/memoryEngine.ts`) storing events, decisions, and predictions in the `org_memory` Supabase table. It includes pattern recognition and prediction generation capabilities.
- **Creator Lab**: A private, creator-only interface for advanced management, including a Prompt Console for structured change proposals, a UI Builder for dashboard customization, access tier management, memory management, and system configuration.
- **Tier System**: Manages different user access tiers (`free|solo|growth|command|enterprise`), including fetching definitions, saving definitions, and managing user grants.
- **Team Members Management**: A dedicated page at `/members` (`src/pages/Members.tsx`) for workspace owners to invite, view, edit roles, and remove team members. Backed by a `workspace_members` table (via `server/memberSchema.ts`) with Express API routes in `server/memberRoutes.ts` (`GET/POST/PUT/DELETE /api/members`). Enforces tier-based seat limits (Free=1, Solo=5, Growth=15, Command=50, Enterprise=unlimited). Members have roles: owner, admin, manager, member, viewer. Includes a "Copy Invite Link" feature and soft-remove (status=removed) pattern.
- **Migration Hub**: A wizard at `/migrate` for importing data from various project management tools (Asana, Trello, ClickUp, Jira, Notion, Generic CSV) into `action_items` with auto-mapping and status normalization.
- **Starred Nav / Shortcuts**: Allows users to star navigation items for quick access, persisted in `localStorage`.
- **AI Note Taker**: A tiered feature at `/note-taker` for capturing meeting notes, transcribing voice-to-text, and generating AI summaries of decisions and action items.
- **Data Services**: `supabaseDataService.ts` centralizes all Supabase CRUD operations.
- **Project Structure**: Organized into `pages/`, `components/`, `hooks/`, `lib/`, and `integrations/supabase/`.

## External Dependencies
- **Supabase**: Authentication, PostgreSQL Database, Realtime subscriptions.
- **React**: Frontend UI library.
- **Vite**: Build tool and development server.
- **TypeScript**: For type safety.
- **Tailwind CSS**: Utility-first CSS framework.
- **shadcn/ui**: Component library.
- **React Router v6**: Client-side routing.
- **React Query**: Data-fetching and state management.
- **Recharts**: Charting library.