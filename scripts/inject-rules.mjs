// Injects the full eligibility rules into the <noscript> of dist/index.html at
// build time, so clients that do not execute JavaScript (crawlers, LLM page
// fetchers, no-JS users) get the real rules instead of falling back to the
// support knowledge base. The rules are rendered from the same src/data modules
// the app uses (via renderToStaticMarkup), so they cannot drift, and are themed
// by the .static-rules block in src/styles/_static-rules.scss (shipped through
// global.scss). This is pure server-side rendering with no browser, so it runs
// as the last step of `pnpm build`. Source index.html keeps a <!--STATIC_RULES-->
// placeholder; never edit dist/index.html by hand.
import { createServer } from "vite";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const PLACEHOLDER = "<!--STATIC_RULES-->";
const distIndex = fileURLToPath(new URL("../dist/index.html", import.meta.url));

const html = await readFile(distIndex, "utf8");
if (!html.includes(PLACEHOLDER)) {
  console.error(
    `inject-rules: dist/index.html has no ${PLACEHOLDER} placeholder to fill (already injected, or index.html changed). Run a fresh \`vite build\` first.`,
  );
  process.exit(1);
}

// SSR-only Vite server to render the rules. Disable the client dependency
// scanner: it is unnecessary for ssrLoadModule, spuriously crawls stray root
// HTML (e.g. playwright-report/index.html), and errors when this short-lived
// server closes mid-scan.
const server = await createServer({
  server: { middlewareMode: true },
  appType: "custom",
  optimizeDeps: { noDiscovery: true },
  logLevel: "warn",
});
let rulesHtml;
try {
  const { default: StaticRules } = await server.ssrLoadModule(
    "/src/components/StaticRules/StaticRules.tsx",
  );
  rulesHtml = renderToStaticMarkup(createElement(StaticRules));
} finally {
  await server.close();
}
if (!rulesHtml.includes("Eligibility rules")) {
  throw new Error(
    "inject-rules: static rules render is missing expected content",
  );
}

// Replacement via callback so `$` sequences in the markup are taken literally.
await writeFile(
  distIndex,
  html.replace(PLACEHOLDER, () => rulesHtml),
);
console.log(
  `inject-rules: injected ${rulesHtml.length} chars of rules into <noscript>`,
);
