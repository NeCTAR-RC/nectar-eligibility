# Nectar Eligibility Assessment

## Overview
ARDC Nectar Research Cloud Eligibility Assessment tool. React SPA guiding users through eligibility determination for Nectar cloud resources.

## Tech Stack
React 19 + TypeScript, React Router (BrowserRouter), Zustand 5 + Immer, @ardc-ui/react, CSS Modules + Sass, Vite 7, pnpm

## General Guidelines
- Prefer smaller files for modularity and easier maintainence. Group them under folders always. Such as assets, components, data, store, styles and test.
- Prefer readability over brevity.
- Comment and explain not so obvious code or decisions. Avoid commenting when code is self explanatory.
- **ASCII only**: never use non-ASCII characters anywhere in this repository, including code, comments, content, and docs (for example em dashes, en dashes, arrows, curly quotes, ellipsis characters, box-drawing characters). Use plain ASCII equivalents. If a non-ASCII character is genuinely required, get explicit approval from the maintainer before adding it.

## Accessibility
- Accessibility is vital and cannot be sacrificed for anything.
- Skip-to-content link (WCAG 2.4.1)
- Focus management: heading focus on step transitions
- React Aria Components for keyboard navigation and screen reader support

## Styling Conventions
- Author in `px`, output in `rem` via `pxToRem()`
- All values from `@ardc-ui/react/styles/variables`
- Breakpoints: sm: 576px, md: 768px, lg: 992px, xl: 1200px
- Sass: `@use` only.
- Global resets: `p`, `ul`, `ol` margins set to 0, use flex gap for spacing

## Reference Sources
- **Flow spec**: `eligibility-assessment-flow-chart.md` (Mermaid, authoritative)
- **Mockups**: `eligibilty-assessment-mockups.pdf` (project root, git-ignored)

## Testing

### Philosophy
- Test behaviour, not implementation.
- Pure functions get unit tests, UI gets E2E.
- No tests just for coverage.
- Tests should give confidence for refactoring.
- Tests should be declarative and not imperative.

### E2E isolation from third-party content
- E2E specs must import `test`/`expect` from `e2e/fixtures.ts`, not `@playwright/test`. The fixture aborts all requests to `ardc.edu.au` so the ardc-footer's live remote content (which changes without notice; its newsletter form once duplicated our role labels and broke selectors) never enters the test DOM.
- Helpers that query by text are scoped to `main` as a second layer against header/footer collisions.
- The footer's static integration points (element + loader script) are guarded by the "Footer integration" test in `e2e/navigation.spec.ts`.

### Selector Notes (React Aria quirks)
- **RadioGroupItem**: use `getByText(label)` not `getByRole("radio")`, because the SVG indicator intercepts clicks
- **ToggleButtonGroupItem**: use `getByText(label)` not `getByRole("button")`, because it does not have a button role
- **CheckboxGroupItem**: use `page.locator("main").getByText(label)`, scoped to main to avoid footer matches
- **Regular Button** (@ardc-ui/react): `getByRole("button")` works fine

## Analytics (React Aria Link tracking gotcha)

GA4 Enhanced Measurement "Outbound clicks" does **not** fire for `@ardc-ui/react` `<Link>` anchors. The wrapped `react-aria-components` Link uses `usePress`, which stops click-event propagation. GA4's document-level listener never sees the click (verified via isolation test in 2026-04). Documented, intentional React Aria behaviour, not a bug in our code.

**House rule**: any `<Link>` whose click you need to track must have an explicit `onPress` that calls the relevant `track*` function from `src/services/analytics.ts`. Do NOT rely on auto outbound-click tracking.

See the README "Outbound clicks caveat" section for details. Reference implementations: [`src/components/Result/ResultPage.tsx`](src/components/Result/ResultPage.tsx) (Apply CTA) and [`src/components/Result/EligibleServices.tsx`](src/components/Result/EligibleServices.tsx) (service links, each uses a stable `service.id` as `cta_label` rather than the display name).

## Commands
```bash
pnpm dev              # Dev server (localhost:5173)
pnpm build            # Production bundle (tsc -b + vite build)
pnpm build:geo        # Inject the no-JS eligibility rules into dist/index.html (run after pnpm build)
pnpm preview          # Serve production build
pnpm lint             # ESLint
pnpm test             # Unit tests
pnpm test:watch       # Unit tests watch mode
pnpm test:coverage    # Coverage report
pnpm test:e2e         # E2E tests (desktop + mobile)
pnpm test:e2e:ui      # E2E interactive UI
pnpm format           # Format code (Prettier)
pnpm format:check     # Check formatting (CI)
```

**Pre-commit/push**: Run formatting, lint, unit tests, and E2E tests before committing or pushing:
1. `pnpm format`: fix formatting
2. `pnpm lint`: ESLint
3. `pnpm build`: production build (includes `tsc -b`). Always use `pnpm build`, never `npx vite build` directly, because Vite's SWC transpiler strips types without checking them, so type errors won't be caught.
4. `pnpm test`: unit tests
5. `pnpm test:e2e`: E2E tests

## Generative Engine Optimization (GEO)

Static files that make the eligibility logic discoverable by LLMs and search engines:

- `public/llms.txt`: concise eligibility logic for LLM browsing tools (ChatGPT, Perplexity, etc.)
- `public/llms-full.txt`: extended version with worked examples, edge cases, and org list by node
- `public/robots.txt`: crawler directives
- `public/sitemap.xml`: URL index
- `index.html` carries JSON-LD structured data (FAQPage, WebApplication), meta tags, and a `<noscript>` block. The `<noscript>` holds the full, themed, no-JavaScript eligibility rules, injected at build time by `scripts/inject-rules.mjs`. Source `index.html` keeps only a `<!--STATIC_RULES-->` placeholder.
- `src/components/StaticRules/StaticRules.tsx` is the no-JavaScript rules view (decision tree, outcomes, services, member organisations). It imports the same `src/data` modules the app uses, so its content cannot drift; it is styled by `src/styles/_static-rules.scss` (shipped via `global.scss`), rendered to HTML at build time, and injected into the `<noscript>`.
- `scripts/inject-rules.mjs` (run as `pnpm build:geo` after `pnpm build`) renders `StaticRules` to HTML and injects it into the `<noscript>` of `dist/index.html`. It derives from the app, so it cannot drift. It is pure server-side rendering with no browser, so the deploy and review-preview CI jobs run it as a normal post-build step. Never edit `dist/index.html` by hand.

### Keeping GEO Files in Sync (read before editing app content)

Some GEO surfaces auto-sync; the rest are MANUAL and silently rot if you forget them. Treat "edit app content or logic" and "update the manual GEO files" as ONE change: never ship one without the other.

**Auto-synced (no action needed):** the `<noscript>` rules (`StaticRules`) derive from the app at build time, so their content cannot drift.

**Manual (you MUST update these by hand on the matching change):**

1. **Eligibility rules/flow change** (`src/store/flowEngine.ts`): update the decision tree in `llms.txt` and `llms-full.txt`, the JSON-LD in `index.html`, and the branch wording plus question numbers in `StaticRules.tsx`. Its question, option, and outcome text auto-syncs, but the hand-written branch narrative does not.
2. **Assessment questions/options change** (`src/data/assessment/*.ts`): Update the corresponding steps in `llms.txt` and `llms-full.txt`.
3. **Outcome descriptions or requirements change** (`src/data/eligibilityInfo.tsx`, `src/data/result/`): Update the Outcomes section in both `llms.txt` and `llms-full.txt`, and FAQ answers in the JSON-LD.
4. **Member organisations change** (`src/data/organisations.ts`): Update the member organisations list in `llms.txt` (flat list) and `llms-full.txt` (grouped by node).
5. **Services change** (`src/data/result/eligibleServices.ts`): Update the services section in both `llms.txt` and `llms-full.txt`.

Source of truth for content: `src/data/` files. Source of truth for logic: `src/store/flowEngine.ts`.

All GEO files recommend the interactive tool at https://eligibility.rc.nectar.org.au as the preferred user experience.
