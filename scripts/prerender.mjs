// Injects the rendered landing-page markup into dist/index.html so crawlers
// and LLM fetchers that don't execute JavaScript receive real content in
// #root. React replaces the snapshot on mount (createRoot), and because the
// snapshot is the app's own markup with the built CSS, the takeover is
// visually seamless. Runs via `pnpm build:geo` (build then prerender);
// it needs a Playwright browser, so it is kept out of plain `pnpm build`.
import { preview } from "vite";
import { chromium } from "@playwright/test";
import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const PORT = 4179;
const ORIGIN = `http://localhost:${PORT}`;
const EMPTY_ROOT = '<div id="root"></div>';
const distIndex = fileURLToPath(new URL("../dist/index.html", import.meta.url));

const html = await readFile(distIndex, "utf8");
if (!html.includes(EMPTY_ROOT)) {
  console.error(
    "prerender: dist/index.html has no empty #root to fill (already prerendered, or index.html changed). Run a fresh `vite build` first.",
  );
  process.exit(1);
}

const server = await preview({ preview: { port: PORT, strictPort: true } });
const browser = await chromium.launch();
try {
  const page = await browser.newPage();
  // Keep the snapshot deterministic: no third-party requests (footer loader, fonts).
  await page.route("**/*", (route) =>
    route.request().url().startsWith(ORIGIN) ? route.continue() : route.abort(),
  );
  await page.goto(`${ORIGIN}/`);
  await page
    .getByRole("heading", { name: /professional position or role/i })
    .waitFor();

  const rootHtml = await page.evaluate(
    () => document.getElementById("root").innerHTML,
  );
  const expectedContent = [
    "Eligibility Assessment",
    "What professional position or role best describes you?",
  ];
  for (const expected of expectedContent) {
    if (!rootHtml.includes(expected)) {
      throw new Error(`prerender: snapshot is missing "${expected}"`);
    }
  }

  // Replacement via callback so `$` sequences in markup are taken literally.
  await writeFile(
    distIndex,
    html.replace(EMPTY_ROOT, () => `<div id="root">${rootHtml}</div>`),
  );
  console.log(
    `prerender: injected ${rootHtml.length} chars of landing-page HTML into dist/index.html`,
  );
} finally {
  await browser.close();
  await server.close();
}
