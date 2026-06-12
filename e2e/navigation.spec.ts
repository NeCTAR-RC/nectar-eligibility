import { test, expect } from "./fixtures";
import {
  selectRole,
  clickToggle,
  clickContinue,
  clickPrevious,
  checkFunding,
  expectHeading,
  expectPath,
  startOver,
  completeNotEligiblePath,
  completeNationalPath,
} from "./helpers";

test.describe("Button states", () => {
  test("Previous is disabled on first step", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("button", { name: "Previous" })).toBeDisabled();
  });

  test("Continue is disabled without a selection", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("button", { name: "Continue" })).toBeDisabled();
  });

  test("Continue enables after selecting a role", async ({ page }) => {
    await page.goto("/");
    await selectRole(page, "Researcher");
    await expect(page.getByRole("button", { name: "Continue" })).toBeEnabled();
  });
});

test.describe("Back navigation", () => {
  test("go back one step and see previous question", async ({ page }) => {
    await page.goto("/");

    await selectRole(page, "Researcher");
    await clickContinue(page);
    expectPath(page, "/australian-affiliation");
    await clickToggle(page, "Yes");
    await clickContinue(page);
    expectPath(page, "/australian-affiliation/funding-source");

    await clickPrevious(page);
    await expectHeading(page, /Australian University/i);
    expectPath(page, "/australian-affiliation");
  });

  test("go back and change AU affiliation from Yes to No", async ({ page }) => {
    await page.goto("/");

    await selectRole(page, "Researcher");
    await clickContinue(page);
    await clickToggle(page, "Yes");
    await clickContinue(page);

    // On funding step — go back
    await clickPrevious(page);
    await expectHeading(page, /Australian University/i);

    // Change to No
    await clickToggle(page, "No");
    await clickContinue(page);

    // Should now be on Auckland (new branch)
    await expectHeading(page, /University of Auckland/i);
  });

  test("go back multiple steps to first question", async ({ page }) => {
    await page.goto("/");

    await selectRole(page, "Researcher");
    await clickContinue(page);
    await clickToggle(page, "Yes");
    await clickContinue(page);
    await checkFunding(page, /national or international research grant/i);
    await clickContinue(page);

    // On eligibility info — go back 3 steps
    expectPath(page, "/australian-affiliation/funding-source/eligibility-info");
    await clickPrevious(page);
    await expectHeading(page, /funded by/i);
    expectPath(page, "/australian-affiliation/funding-source");
    await clickPrevious(page);
    await expectHeading(page, /Australian University/i);
    expectPath(page, "/australian-affiliation");
    await clickPrevious(page);
    await expectHeading(page, /professional position or role/i);
    expectPath(page, "/");
    await expect(page.getByRole("button", { name: "Previous" })).toBeDisabled();
  });

  test("change funding from grant to none reveals member org step", async ({
    page,
  }) => {
    await page.goto("/");

    await selectRole(page, "Researcher");
    await clickContinue(page);
    await clickToggle(page, "Yes");
    await clickContinue(page);

    // Select a real grant
    await checkFunding(page, /national or international research grant/i);
    await clickContinue(page);
    await expectHeading(page, /eligible for a national allocation/i);

    // Go back and change to none
    await clickPrevious(page);
    await checkFunding(page, /national or international research grant/i); // uncheck
    await checkFunding(page, /None of the above/i);
    await clickContinue(page);

    // Should now be on member organisation (not eligibility info)
    await expectHeading(page, /ARDC Nectar member organisation/i);
  });

  test("change answer mid-flow leads to different outcome", async ({
    page,
  }) => {
    await page.goto("/");

    // Go through AU Yes → national grant → eligibility info
    await selectRole(page, "Researcher");
    await clickContinue(page);
    await clickToggle(page, "Yes");
    await clickContinue(page);
    await checkFunding(page, /national or international research grant/i);
    await clickContinue(page);
    await expectHeading(page, /eligible for a national allocation/i);

    // Go all the way back to AU affiliation and change to No
    await clickPrevious(page);
    await clickPrevious(page);
    await clickToggle(page, "No");
    await clickContinue(page);

    // Auckland = No → not eligible
    await clickToggle(page, "No");
    await clickContinue(page);
    await expectHeading(page, /not eligible for an allocation/i);
  });
});

test.describe("Footer integration", () => {
  // Footer hydration is blocked in e2e (see fixtures.ts); this guards the
  // static integration points so a regression in index.html is still caught.
  test("ardc-footer element and loader script are present", async ({
    page,
  }) => {
    await page.goto("/");
    await expect(page.locator("ardc-footer")).toBeAttached();
    await expect(
      page.locator('script[src*="loaders/footer.min.js"]'),
    ).toBeAttached();
  });
});

test.describe("Document titles", () => {
  const baseTitle = "ARDC Nectar Research Cloud Eligibility Assessment";

  test("steps prefix the title, first step keeps the base title", async ({
    page,
  }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(baseTitle);

    await selectRole(page, "Researcher");
    await clickContinue(page);
    await expect(page).toHaveTitle(`Australian Affiliation | ${baseTitle}`);

    await clickPrevious(page);
    await expect(page).toHaveTitle(baseTitle);
  });

  test("result page sets the assessment complete title", async ({ page }) => {
    await page.goto("/");
    await completeNationalPath(page, "Researcher");
    await expect(page).toHaveTitle(`Assessment Complete | ${baseTitle}`);
  });
});

test.describe("Start Over", () => {
  test("from mid-assessment", async ({ page }) => {
    await page.goto("/");

    await selectRole(page, "Researcher");
    await clickContinue(page);
    await clickToggle(page, "Yes");
    await clickContinue(page);

    await startOver(page);
    expectPath(page, "/");

    await expectHeading(page, /professional position or role/i);
    await expect(page.getByRole("button", { name: "Previous" })).toBeDisabled();
  });

  test("from result page", async ({ page }) => {
    await page.goto("/");
    await completeNotEligiblePath(page, "Researcher");

    await expectHeading(page, "Assessment Complete");
    await startOver(page);
    expectPath(page, "/");
    await expectHeading(page, /professional position or role/i);
  });

  test("start over then complete a different path", async ({ page }) => {
    await page.goto("/");

    // First: not eligible path
    await completeNotEligiblePath(page, "Researcher");
    await expectHeading(page, "Assessment Complete");
    await expect(page.getByText(/not eligible/i).first()).toBeVisible();

    // Start over and take national path
    await startOver(page);
    await completeNationalPath(page, "Researcher");
    await expectHeading(page, "Assessment Complete");
    await expect(page.getByText(/national allocation/i).first()).toBeVisible();
  });
});
