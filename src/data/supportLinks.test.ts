import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import type { ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { ELIGIBILITY_INFO_CONTENT } from "./eligibilityInfo";
import { NEXT_STEPS } from "./result/nextSteps";
import { MEMBER_ORGANISATION_DESCRIPTION } from "./assessment/memberOrganisation";

// Support knowledge-base articles resolve by their numeric ID alone. A URL of
// the form .../articles/<id>-<title-slug> carries a slug derived from the
// article's current title, so it breaks if the article is renamed. Every
// support link must therefore use the bare-ID form. This guard fails if a slug
// suffix is reintroduced anywhere, in the JSX data modules or in the static
// GEO files that mirror their content.
const SLUG_SUFFIX = /support\/solutions\/articles\/\d+-/;

// ---------------------------------------------------------------------------
// JSX data modules
// ---------------------------------------------------------------------------

describe("support links in data modules", () => {
  const renderedNodes: Record<string, ReactNode> = {
    "eligibilityInfo (national)":
      ELIGIBILITY_INFO_CONTENT.national.requirements,
    "eligibilityInfo (local)": ELIGIBILITY_INFO_CONTENT.local.requirements,
    "eligibilityInfo (not-eligible)":
      ELIGIBILITY_INFO_CONTENT["not-eligible"].requirements,
    "nextSteps (national)": NEXT_STEPS.national,
    "nextSteps (local)": NEXT_STEPS.local,
    "nextSteps (not-eligible)": NEXT_STEPS["not-eligible"],
    memberOrganisation: MEMBER_ORGANISATION_DESCRIPTION,
  };

  for (const [label, node] of Object.entries(renderedNodes)) {
    it(`${label} uses bare-ID support URLs`, () => {
      const markup = renderToStaticMarkup(node);
      expect(markup).not.toMatch(SLUG_SUFFIX);
    });
  }
});

// ---------------------------------------------------------------------------
// Static GEO files (mirror the data-module content; not type-checked or linted)
// ---------------------------------------------------------------------------

describe("support links in static GEO files", () => {
  const geoFiles = ["index.html", "public/llms.txt", "public/llms-full.txt"];

  for (const relativePath of geoFiles) {
    it(`${relativePath} uses bare-ID support URLs`, () => {
      const contents = readFileSync(join(process.cwd(), relativePath), "utf8");
      const offender = contents
        .split("\n")
        .find((line) => SLUG_SUFFIX.test(line));
      expect(offender, `slug suffix found in ${relativePath}`).toBeUndefined();
    });
  }
});
