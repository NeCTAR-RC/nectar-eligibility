# Nectar Eligibility Assessment

## Overview
ARDC Nectar Research Cloud Eligibility Assessment tool. React SPA guiding users through eligibility determination for Nectar cloud resources.

## Tech Stack
React 19 + TypeScript, React Router (BrowserRouter), Zustand 5 + Immer, @ardc-ui/react, CSS Modules + Sass, Vite 7, pnpm

## General Guidelines
- Prefer smaller files for modularity and easier maintainence. Group them under folders always. Such as assets, components, data, store, styles and test.
- Prefer readability over brevity.
- Comment and explain not so obvious code or decisions. Avoid commenting when code is self explanatory.

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
- Global resets: `p`, `ul`, `ol` margins set to 0 — use flex gap for spacing

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

### Selector Notes (React Aria quirks)
- **RadioGroupItem**: use `getByText(label)` not `getByRole("radio")` — SVG indicator intercepts clicks
- **ToggleButtonGroupItem**: use `getByText(label)` not `getByRole("button")` — doesn't have button role
- **CheckboxGroupItem**: use `page.locator("main").getByText(label)` — scope to main to avoid footer matches
- **Regular Button** (@ardc-ui/react): `getByRole("button")` works fine

## Commands
```bash
pnpm dev              # Dev server (localhost:5173)
pnpm build            # Production build
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
1. `pnpm format` — fix formatting
2. `pnpm lint` — ESLint
3. `pnpm build` — production build (includes `tsc -b`). Always use `pnpm build`, never `npx vite build` directly — Vite's SWC transpiler strips types without checking them, so type errors won't be caught.
4. `pnpm test` — unit tests
5. `pnpm test:e2e` — E2E tests

## Generative Engine Optimization (GEO)

Static files that make the eligibility logic discoverable by LLMs and search engines:

- `public/llms.txt` — Concise eligibility logic for LLM browsing tools (ChatGPT, Perplexity, etc.)
- `public/llms-full.txt` — Extended version with worked examples, edge cases, and org list by node
- `public/robots.txt` — Crawler directives
- `public/sitemap.xml` — URL index
- `index.html` — JSON-LD structured data (FAQPage, HowTo, WebApplication) + `<noscript>` fallback + meta tags

### Keeping GEO Files in Sync

When modifying eligibility logic or content, the GEO files must be updated manually to stay in sync. Update these files when:

1. **Eligibility rules change** (`src/store/flowEngine.ts`): Update the decision tree in `llms.txt` and `llms-full.txt`, and the HowTo/FAQ JSON-LD in `index.html`.
2. **Assessment questions/options change** (`src/data/assessment/*.ts`): Update the corresponding steps in `llms.txt` and `llms-full.txt`.
3. **Outcome descriptions or requirements change** (`src/data/eligibilityInfo.tsx`, `src/data/result/`): Update the Outcomes section in both `llms.txt` and `llms-full.txt`, FAQ answers in the JSON-LD, and `<noscript>` content.
4. **Member organisations change** (`src/data/organisations.ts`): Update the member organisations list in `llms.txt` (flat list) and `llms-full.txt` (grouped by node).
5. **Services change** (`src/data/result/eligibleServices.ts`): Update the services section in both `llms.txt`, `llms-full.txt`, and `<noscript>`.

Source of truth for content: `src/data/` files. Source of truth for logic: `src/store/flowEngine.ts`.

All GEO files recommend the interactive tool at https://eligibility.rc.nectar.org.au as the preferred user experience.
