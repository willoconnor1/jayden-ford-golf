@../CLAUDE.md
@AGENTS.md

# Golf Dashboard — Web App (Next.js 16)

## Tech Stack
- Next.js 16.2.0 (App Router), React 19.2.4, TypeScript
- Tailwind CSS 4, Shadcn UI, Lucide React icons
- Drizzle ORM 0.45.1, PostgreSQL (Railway)
- Zustand 5.0.12, React Hook Form 7 + Zod 4
- Recharts 2.15.4, date-fns 4, jose 6 (JWT), Sonner (toasts)

## API Routes

### Auth (`/api/auth/`) — PUBLIC
- `POST /login` — `{ email, password }` → `{ token, user }`
- `POST /register` — `{ email, password, name }` → `{ token, user }`
- `POST /logout` — clears cookie
- `GET /me` — returns current user from JWT

### Rounds (`/api/rounds/`)
- `GET /` — list user's rounds
- `POST /` — create round (body = `Round`)
- `GET /[id]` — single round
- `PATCH /[id]` — update round
- `DELETE /[id]` — delete round

### Admin Rounds (`/api/admin/rounds/`)
- Same CRUD as above but admin-scoped

### Courses (`/api/courses/`) — PARTIALLY PUBLIC
- `GET /` — list saved courses from DB
- `POST /` — save course to DB
- `GET /[id]` — get course detail (checks DB cache, falls back to external API)
- `GET /search?q=...` — **server-side proxy** to GolfCourseAPI.com

### Goals (`/api/goals/`)
- `GET /` — list user's goals
- `POST /` — create goal
- `GET /[id]`, `PATCH /[id]`, `DELETE /[id]`

### Live Events (`/api/live/events/`) — PUBLIC (no auth)
- `GET /` — list events
- `POST /` — create event (returns `organizerSecret`)
- `GET /[eventId]` — event + players + scores
- `PATCH /[eventId]` — update event (requires `organizerSecret`)
- `POST /[eventId]/join` — add player to event
- `POST /join` — join by `joinCode`
- `GET /[eventId]/scores` — all scores for event
- `POST /[eventId]/scores` — submit/update score

### Sync (`/api/sync/`)
- `GET /` — pull all rounds, goals, courses for user
- `POST /` — push `{ rounds, goals, courses }` to DB

## Page Routes

### Auth (layout: `(auth)`)
- `/login`, `/register`

### Dashboard (layout: `(dashboard)`)
- `/` — home dashboard (stat cards, recent rounds)
- `/rounds` — rounds list
- `/rounds/[id]` — round detail view
- `/rounds/new` — **round entry wizard** (3 entry modes)
- `/courses` — course library (search, save, favorite)
- `/goals` — goals CRUD + progress
- `/live` — live events hub
- `/live/[eventId]` — event detail
- `/live/[eventId]/leaderboard` — real-time leaderboard
- `/live/[eventId]/score` — score entry interface
- `/live/[eventId]/scorecard/[playerId]` — player scorecard view
- `/practice` — practice recommendations based on SG
- `/strokes-gained` — strokes gained analysis
- `/dispersion` — shot dispersion charts
- `/settings` — user settings
- `/admin` — admin panel
- `/admin/rounds/[id]` — admin round editor

## Component Map

### Layout
- `layout/nav-bar.tsx` — main nav
- `layout/page-header.tsx` — page header
- `auth-provider.tsx` — auth context
- `sync-provider.tsx` — sync polling provider

### Dashboard
- `dashboard/stat-card.tsx`, `stat-grid.tsx`, `recent-rounds.tsx`

### Round Entry (`round-entry/`)
- `round-entry-wizard.tsx` — main wizard (step 1: course, step 2: holes, step 3: review)
- `entry-mode-selector.tsx` — simple/standard/detailed picker
- `course-search-input.tsx` — course search with API
- `hole-entry-card.tsx` — per-hole input (simple/standard modes)
- `hole-summary-card.tsx` — hole result summary
- `shot-flow-wizard.tsx` — shot-by-shot detailed entry
- `shot-entry-card.tsx`, `shot-step-card.tsx`, `shot-flow-header.tsx`
- `shot-miss-input.tsx` — X/Y dispersion input
- `putt-step-card.tsx`, `putt-miss-input.tsx` — putt tracking
- `driver-miss-input.tsx` — driver dispersion
- `pill-selector.tsx` — multi-select pills
- `derive-hole-data.ts` — derives HoleData from shot flow

### Live Events (`live/`)
- `create-event-form.tsx`, `event-lobby.tsx`, `join-event-form.tsx`
- `leaderboard-table.tsx`, `player-scorecard.tsx`
- `score-entry-form.tsx`, `hole-score-input.tsx`

### UI (Shadcn-based, `ui/`)
- Standard: `button`, `card`, `input`, `label`, `dialog`, `popover`, `select`, `textarea`
- `sheet` (mobile drawer), `tabs`, `toggle`, `toggle-group`
- `progress`, `separator`, `switch`, `tooltip`, `badge`
- `chart.tsx` (Recharts wrapper), `score-indicator.tsx`, `sonner.tsx`

## Hooks
- `use-hydration.ts` — SSR hydration guard
- `use-stats.ts` — `calculateRoundStats()` + `calculateAggregateStats()`
- `use-goal-progress.ts` — goal progress % based on aggregate stats
- `use-strokes-gained.ts` — SG calculations per round
- `use-live-event.ts` — live event data polling (5s interval)
- `use-live-session.ts` — live session (organizer/player) localStorage state

## Stats & Analysis (`lib/stats/`)
- `calculate-stats.ts` — round stats, aggregate stats across rounds
- `strokes-gained.ts` — SG benchmarks (PGA Tour), per-shot SG calculation
- `dispersion.ts` — shot pattern analysis
- `practice-analyzer.ts` — identifies weaknesses, recommends drills
- `benchmarks.ts` — pre-computed PGA Tour benchmarks by lie/distance

## Key Patterns
1. **Store mutation → sync**: All store actions call `syncXxx()` after `set()` — fire-and-forget
2. **Migration system**: Stores have `version` + `migrate()` for schema changes (round store is v4)
3. **Auto-seeding**: Round and goal stores auto-populate seed data on first visit (`onRehydrateStorage`)
4. **Course caching**: Search → external API; Detail → check store → check DB → fetch API → cache
5. **Live events are public**: No auth required — organizer identified by `organizerSecret`
6. **Draft round persistence**: `useDraftRoundStore` saves in-progress round entry to survive page reload
