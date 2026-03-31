# nectar-eligibility

A web application that determines user eligibility for the ARDC Nectar Research Cloud through a guided assessment.

## Overview

This application walks users through an eligibility assessment by asking a series of questions about their professional role, institutional affiliation, and funding sources. Based on the answers, it determines one of three outcomes:

- **National allocation** — eligible via a research grant or NCRIS funding
- **Local allocation** — eligible via an ARDC Nectar member organisation
- **Not eligible** — may still access a 6-month project trial or other ARDC services

The assessment flow is defined in [`eligibility-assessment-flow-chart.md`](eligibility-assessment-flow-chart.md) (Mermaid diagram).

This is the first project to use the **@ardc-ui/react** component library.

## Tech Stack

- **React 19** — UI framework
- **TypeScript** — Type safety
- **Zustand + Immer** — Answer state management
- **React Router** — URL path-based navigation and browser history
- **@ardc-ui/react** — ARDC component library (based on React Aria Components)
- **CSS Modules + Sass** — Scoped component styling with design tokens
- **Vite + SWC** — Build tool and dev server
- **pnpm** — Package manager

## Project Structure

```
src/
├── components/
│   ├── Assessment/              # Assessment flow
│   │   ├── AssessmentPage.tsx    # Step orchestrator with hydration and navigation
│   │   ├── StepNavigation.tsx    # Previous/Continue buttons + Start Over
│   │   └── steps/               # Individual step components
│   │       ├── ProfessionalRole.tsx
│   │       ├── AustralianAffiliation.tsx
│   │       ├── AucklandAffiliation.tsx
│   │       ├── FundingSource.tsx
│   │       ├── MemberOrganisation.tsx
│   │       └── EligibilityInfo.tsx
│   ├── Result/                  # Result page after assessment
│   │   ├── ResultPage.tsx       # Outcome display with action buttons
│   │   ├── AssessmentResult.tsx # Assessment result heading + disclaimer
│   │   ├── AssessmentPath.tsx   # Timeline of answered questions
│   │   ├── NextSteps.tsx        # Next steps checklist per outcome
│   │   └── EligibleServices.tsx # ARDC services cards
│   ├── ContentSection/          # Reusable titled section with description
│   ├── PageShell/               # Card container used by Assessment and Result
│   ├── Header/                  # ARDC Nectar branding + Support Centre link
│   ├── Footer/                  # ARDC footer (logos, newsletter, quick links)
│   └── Layout/                  # Skip-to-content + Header + main + Footer
├── hooks/
│   └── useAnalytics.ts          # GA4 initialization hook (called in App.tsx)
├── services/
│   └── analytics.ts             # GA4 event tracking functions
├── store/
│   ├── types.ts                 # Assessment types, step IDs, enums
│   ├── flowEngine.ts            # Pure flow functions (resolveNextStep, resolveOutcome, etc.)
│   ├── assessmentStore.ts       # Zustand store + persistence subscription
│   └── persistence.ts           # localStorage + enum-based URL param encoding
├── data/
│   ├── assessment/              # Content for each assessment step
│   │   ├── professionalRole.ts
│   │   ├── australianAffiliation.ts
│   │   ├── aucklandAffiliation.ts
│   │   ├── fundingSource.ts
│   │   └── memberOrganisation.tsx
│   ├── eligibilityInfo.tsx      # Eligibility info content per outcome
│   ├── organisations.ts         # ARDC Nectar member organisations list
│   └── result/                  # Content for result page components
│       ├── headings.ts
│       ├── actions.ts
│       ├── nextSteps.tsx
│       ├── eligibleServices.ts
│       └── pathLabels.ts
└── styles/
    ├── global.scss              # Global resets, ARDC design tokens
    ├── _mixins.scss             # pxToRem, container, breakpoint mixins, gap variables
    └── _utilities.scss          # Shared SCSS mixins (action-buttons, nav-actions)
```

## Architecture

### Assessment Flow Engine

The flow engine in `flowEngine.ts` contains pure functions with no side effects:

- **`resolveNextStep()`** — determines the next step based on current answers (branching logic)
- **`resolveOutcome()`** — determines eligibility outcome from completed answers
- **`replayAnswers()`** — walks through the flow from step 1 to derive current step, history, and outcome from persisted answers
- **`hasAnswerForStep()`** — checks whether a step has been answered (used to control navigation)

`assessmentStore.ts` is a thin Zustand store that calls these functions. Components that need flow engine logic import directly from `flowEngine.ts`.

### Content / Data Separation

All copy, labels, and links live in `src/data/` — components are thin renderers. This makes it easy to update content without touching component logic:

- `data/assessment/` — one file per assessment step (question text, options, descriptions)
- `data/eligibilityInfo.tsx` — requirements and body text for each eligibility outcome
- `data/result/` — headings, disclaimers, next steps, services, and path labels for the result page

### Navigation — URL Path as Step History

The URL path encodes the steps visited, enabling native browser back/forward navigation and human-readable deep links:

```
/                                                    → professional-role (first step)
/australian-affiliation                              → second step
/australian-affiliation/funding-source               → third step
```

- `/` is the professional-role step — the first step has no path segment
- Each subsequent segment is a `StepId` (kebab-case enum value)
- Current step = last segment (or `/` for the first)
- React Router manages the browser history stack; Continue pushes a new path, Previous uses `navigate(-1)`

### State Sources

Navigation and answers are managed by two distinct sources:

**Navigation — URL path or query params**

| Priority    | Source                           | Behaviour                                                                                                                          |
| ----------- | -------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| 1 (highest) | Query params (`?v=1&r=0&a=0...`) | Parse answers, clear localStorage, save to localStorage, reconstruct full path via `replayAnswers()`, navigate there, strip params |
| 2           | URL path                         | Walk path segments in order — stop at the first invalid step                                                                       |

A path segment is invalid if:

- The step is not the correct next step given the previous answers (wrong sequence per flow engine), or
- localStorage has no answer for the preceding step (missing answer — can't validate sequence)

When stopped early, show the user a contextual explanation of why they landed at this step. Pre-populate that step's answer from localStorage if available. Answers cached in localStorage beyond the current path position are kept for future steps.

**Visiting `/`** — always show the professional-role step. Pre-populate from localStorage if available. No path reconstruction or auto-redirect.

**Answers — localStorage as pre-population cache**

localStorage stores answers as the user progresses. It is not a navigation source — it never drives where the user is. Each step reads localStorage to pre-populate its answer field.

localStorage is cleared only when:

- A query param URL is consumed (replaced with fresh answers from the URL), or
- The version stored in localStorage doesn't match the app's `FLOW_VERSION` (show a dismissible alert that the user is starting fresh)

**Shareable URL format** (compact enum-indexed encoding for short QR codes):

```
?v=1&r=0&a=0&f=0,2&w=1
```

`generateShareableUrl()` can be called at any point in the flow — not just the result page — enabling bookmarking or sharing mid-assessment.

## Prerequisites

- Node.js 24.12.0 or later (recommend using nvm)
- pnpm (managed via Corepack)
- Corepack enabled

## Getting Started

```bash
corepack enable
cd nectar-eligibility
pnpm install
pnpm dev
```

The app will be available at `http://localhost:5173`

## Available Scripts

- `pnpm dev` — Start Vite development server with HMR
- `pnpm build` — TypeScript check + production build
- `pnpm preview` — Preview production build locally
- `pnpm lint` — Run ESLint
- `pnpm test` — Run unit tests (Vitest)
- `pnpm test:watch` — Run unit tests in watch mode
- `pnpm test:e2e` — Run end-to-end tests (Playwright)
- `pnpm test:e2e:ui` — Run E2E tests with interactive UI
- `pnpm test:e2e:install` — Install Playwright browser (required once after checkout)

## Testing

### Unit Tests (Vitest)

Unit tests cover the pure-function flow engine and persistence layer:

- **`src/store/flowEngine.test.ts`** — `resolveNextStep()`, `resolveOutcome()`, `hasAnswerForStep()`, and `replayAnswers()` across all branching paths
- **`src/store/persistence.test.ts`** — localStorage round-trip, URL param encoding/decoding, version mismatch handling

```bash
pnpm test          # Run once
pnpm test:watch    # Watch mode
```

### End-to-End Tests (Playwright)

E2E tests exercise the full user flow through the browser, covering every path in the flowchart:

- **`e2e/flow-national.spec.ts`** — national allocation paths (AU affiliation + real funding, each funding type)
- **`e2e/flow-local.spec.ts`** — local allocation paths (no funding + member org, AU and Auckland paths)
- **`e2e/flow-not-eligible.spec.ts`** — not-eligible paths + all professional roles
- **`e2e/navigation.spec.ts`** — Previous/Continue states, back-and-change, Start Over from assessment and result
- **`e2e/persistence.spec.ts`** — page refresh restores progress, shareable URL, funding mutual exclusion

```bash
pnpm test:e2e:install   # First time: install Chromium browser
pnpm build              # E2E tests run against the production build
pnpm test:e2e           # Run tests
pnpm test:e2e:ui        # Interactive mode with trace viewer
```

## Conventions

### Styling

- **CSS Modules + Sass** for scoped component styles (`.module.scss` files)
- **Design tokens** from `@ardc-ui/react/styles/variables` — no hardcoded colors or magic numbers
- **`pxToRem()`** — Author sizes in pixels, compiled to `rem` for accessibility
- **Media queries** use modern range syntax: `width >= 768px`
- **Breakpoints**: sm (576px), md (768px), lg (992px), xl (1200px)
- **CSS class naming**: kebab-case in SCSS → camelCase in TypeScript

### Content Spacing

Three-tier gap system for flex/grid layouts — deeper nesting uses tighter gaps:

| Variable  | Value | Use case                                              |
| --------- | ----- | ----------------------------------------------------- |
| `$gap-sm` | 8px   | Heading + description, grouped fields, related items  |
| `$gap-md` | 16px  | Section children, form fields within a card section   |
| `$gap-lg` | 24px  | Card-level sections, major visual breaks, nav actions |

### Sass

- Use `@use` (not `@import`) — Dart Sass module system
- Use `@use "sass:map"` for `map.get()` instead of deprecated global `map-get()`
- Components import design tokens via `@use "@ardc-ui/react/styles/variables" as *`
- Components import mixins via `@use "mixins" as *` (resolved by Vite's `loadPaths`)

### Accessibility

- Semantic HTML landmarks: `<header>`, `<main>`, `<footer>`, `<nav>`
- Skip-to-content link (WCAG 2.4.1)
- `aria-label` on external links and navigation regions
- `rel="noopener noreferrer"` on all `target="_blank"` links
- React Aria Components (via @ardc-ui/react) for keyboard navigation and screen reader support

### Git

- Conventional commits: `feat(scope): subject`, `fix(scope): subject`
- Branch naming: `feature/`, `fix/`, `docs/`, `refactor/`
- Default branch: `master`, code review via Gerrit

## Analytics (Google Analytics 4)

The application uses [Google Analytics 4](https://analytics.google.com/) via the [`react-ga4`](https://www.npmjs.com/package/react-ga4) library to track user behaviour through the assessment flow. Analytics are entirely client-side — no backend required.

### GA4 Properties

| Environment | Property name                   |
| ----------- | ------------------------------- |
| Non-prod    | Nectar Eligibility - Non-Prod   |
| Production  | Nectar Eligibility - Production |

Measurement IDs are managed via environment variables and must not be committed to source. See the team's password manager or CI/CD configuration for the actual values.

### Configuration

Analytics are configured via environment variables. Create a `.env.local` file (gitignored via `*.local`) from the provided template:

```bash
cp .env.example .env.local
```

| Variable                 | Description                           | Default |
| ------------------------ | ------------------------------------- | ------- |
| `VITE_GA_MEASUREMENT_ID` | GA4 measurement ID (`G-XXXXXXX`)      | —       |
| `VITE_GA_DEBUG_MODE`     | Enable GA4 DebugView (`true`/`false`) | —       |

For production deployments, set `VITE_GA_MEASUREMENT_ID` to the production measurement ID via CI/CD environment variables. If no measurement ID is provided, analytics are silently disabled — the app works normally without it.

### Events

Events fire on step **exit** (when the user clicks Continue, Previous, or Start over), not on step entry. This avoids inflated counts from users toggling answers before committing.

| Event                  | When fired                                        | Parameters                                                       |
| ---------------------- | ------------------------------------------------- | ---------------------------------------------------------------- |
| `step_completed`       | User clicks Continue                              | `step_id`, `answer_value`, `question_number`, `session_id`       |
| `step_back`            | User clicks Previous                              | `from_step`, `to_step`, `session_id`                             |
| `assessment_complete`  | User clicks Continue on eligibility info step     | `outcome`, `path`, `session_id`, `is_repeat`, `duration_seconds` |
| `result_viewed`        | Result page loads                                 | `outcome`, `session_id`                                          |
| `assessment_abandoned` | Start over clicked before reaching result         | `last_step`, `session_id`                                        |
| `assessment_restarted` | Start over clicked on result page                 | `outcome`, `session_id`                                          |
| `pdf_download`         | Download PDF button clicked                       | `outcome`, `session_id`, `is_first_download`                     |
| `cta_click`            | Apply/Explore link clicked on result              | `outcome`, `cta_label`, `session_id`                             |
| `session_restored`     | Returning user's session loaded from localStorage | `session_id`                                                     |
| `session_expired`      | Deep link points to expired/missing session       | `session_id`                                                     |

### Key parameters explained

- **`session_id`** — Incremental ID per assessment run (per browser). Each "Start over" creates a new session. Sent on every event for granular analysis.
- **`is_repeat`** — `"true"` if this browser has completed an assessment before. Uses a localStorage flag (`nectar-eligibility:has-completed`). Allows filtering first-time vs. repeat completions.
- **`duration_seconds`** — Wall-clock seconds from the first `step_completed` to `assessment_complete`. Resets on Start over. If a user leaves and returns, duration is 0 (the clock runs in-memory only).
- **`is_first_download`** — `"true"` if this is the user's first-ever PDF download (per browser). Uses a localStorage flag (`nectar-eligibility:has-downloaded-pdf`).

### GA4 custom definitions setup

Custom parameters must be registered in GA4 Admin before they appear in reports. Do this **once per property** (non-prod and production).

**Admin > Data display > Custom definitions > Custom dimensions > Create custom dimension:**

| Dimension name    | Scope | Event parameter     |
| ----------------- | ----- | ------------------- |
| Step ID           | Event | `step_id`           |
| Answer Value      | Event | `answer_value`      |
| Outcome           | Event | `outcome`           |
| Assessment Path   | Event | `path`              |
| Last Step         | Event | `last_step`         |
| From Step         | Event | `from_step`         |
| To Step           | Event | `to_step`           |
| CTA Label         | Event | `cta_label`         |
| Is Repeat         | Event | `is_repeat`         |
| Is First Download | Event | `is_first_download` |

Note: `session_id` is sent on every event but intentionally not registered as a custom dimension due to high cardinality. GA4's built-in session tracking handles session grouping. The raw `session_id` remains available via BigQuery export if needed for deep analysis.

**Admin > Data display > Custom definitions > Custom metrics > Create custom metric:**

| Metric name      | Scope | Event parameter    | Unit     |
| ---------------- | ----- | ------------------ | -------- |
| Duration Seconds | Event | `duration_seconds` | Seconds  |
| Question Number  | Event | `question_number`  | Standard |

**Admin > Data display > Events > + Create event > Create with code:**

Mark `assessment_complete` as a key event. Toggle "Mark as key event" on, keep counting method as "Once per event". This surfaces it on the main GA4 dashboard.

### What GA4 tracks automatically

With Enhanced Measurement enabled (configured on both properties), GA4 automatically collects:

- **Page views** — tracks each step URL change, useful for funnel analysis
- **Scrolls** — 90% scroll depth
- **Outbound clicks** — clicks to external links (Apply, Explore, service links)
- **User location** — approximate geo from IP (country/city level)
- **Device and browser** — device category (mobile/tablet/desktop), OS, browser
- **Unique users** — via GA4's built-in `client_id` cookie

These require no code — they work out of the box.

### Handling repeat users

A single user can complete the assessment multiple times (each "Start over" creates a new `session_id`). Events are **not deduplicated** — every run fires its own events. This is intentional:

- **Total event counts** reflect actual usage volume (useful for infrastructure capacity)
- **Unique users** can be derived from GA4's built-in Active Users metric
- **`is_repeat`** on `assessment_complete` lets you filter to first-time completions only
- **`session_id`** lets you count distinct assessment runs per user
- **`is_first_download`** on `pdf_download` identifies the meaningful first PDF download vs. curious re-downloads

### Architecture

```
src/
├── services/
│   └── analytics.ts        # Core: init, event functions, duration clock, localStorage flags
├── hooks/
│   └── useAnalytics.ts     # React hook: initializes GA4 on mount (called in App.tsx)
├── store/
│   ├── useAssessmentNav.ts  # Fires: step_completed, step_back, assessment_complete, assessment_abandoned, assessment_restarted
│   └── useHydration.ts      # Fires: session_restored, session_expired
└── components/
    └── Result/
        └── ResultPage.tsx   # Fires: result_viewed, pdf_download, cta_click
```

All event functions are defined in `analytics.ts` and imported where needed. If `VITE_GA_MEASUREMENT_ID` is not set, `initializeAnalytics()` returns early and all tracking functions silently no-op.

### Testing with GA4 DebugView

1. Set `VITE_GA_DEBUG_MODE=true` in `.env.local`
2. Run `pnpm dev`
3. Open the app in your browser
4. In GA4: **Admin > DebugView** (under the non-prod property)
5. Events should appear in real-time as you navigate the assessment

DebugView shows each event with its parameters, making it easy to verify tracking is correct before deploying to production.

## AI Usage

This project uses AI-assisted development via [Claude Code](https://claude.ai/claude-code) (Anthropic). AI was used for code generation, debugging, and refactoring — all output was reviewed and tested by a human developer before committing.

## Notes

- Static application (no backend required)
- Uses @ardc-ui/react components for consistent ARDC UI/UX
- Print styles included for the result page
