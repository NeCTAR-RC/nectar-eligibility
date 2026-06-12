import { test as base } from "@playwright/test";

// The ardc-footer hydrates itself via a loader script from ardc.edu.au,
// pulling live remote content into the page (newsletter form, links).
// Abort those requests so third-party content changes can never reach the
// test DOM; the static fallback markup inside <ardc-footer> remains.
export const test = base.extend({
  // Playwright names this callback "use"; renamed to avoid the react-hooks
  // lint rule misreading it as a React hook.
  page: async ({ page }, provide) => {
    await page.route("https://ardc.edu.au/**", (route) => route.abort());
    await provide(page);
  },
});

export { expect } from "@playwright/test";
