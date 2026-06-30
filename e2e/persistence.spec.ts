import { test, expect } from "./fixtures";
import {
  selectRole,
  clickToggle,
  clickContinue,
  checkFunding,
  expectHeading,
  expectPath,
  startOver,
  completeNationalPath,
} from "./helpers";

test.describe("localStorage persistence", () => {
  test("refreshing preserves progress mid-assessment", async ({ page }) => {
    await page.goto("/");

    await selectRole(page, "Researcher");
    await clickContinue(page);
    await clickToggle(page, "Yes");
    await clickContinue(page);

    // On funding step, reload
    expectPath(page, "/australian-affiliation/funding-source");
    await page.reload();
    await expectHeading(page, /funded by/i);
    expectPath(page, "/australian-affiliation/funding-source");
  });

  test("refreshing on eligibility info preserves outcome", async ({ page }) => {
    await page.goto("/");

    await selectRole(page, "Researcher");
    await clickContinue(page);
    await clickToggle(page, "No");
    await clickContinue(page);
    await clickToggle(page, "No");
    await clickContinue(page);

    // On eligibility info, reload
    await expectHeading(page, /not eligible for an allocation/i);
    expectPath(
      page,
      "/australian-affiliation/auckland-affiliation/eligibility-info",
    );
    await page.reload();
    await expectHeading(page, /not eligible for an allocation/i);
    expectPath(
      page,
      "/australian-affiliation/auckland-affiliation/eligibility-info",
    );
  });

  test("Start Over clears persisted state", async ({ page }) => {
    await page.goto("/");

    await selectRole(page, "Researcher");
    await clickContinue(page);
    await clickToggle(page, "Yes");
    await clickContinue(page);

    await startOver(page);
    expectPath(page, "/");
    await page.reload();

    // Should be back on step 1 (no persisted state)
    await expectHeading(page, /professional position or role/i);
    expectPath(page, "/");
  });

  test("completing flow and refreshing preserves result", async ({ page }) => {
    await page.goto("/");
    await completeNationalPath(page, "Researcher");

    await expectHeading(page, "Assessment Summary");
    expectPath(
      page,
      "/australian-affiliation/funding-source/eligibility-info/result",
    );
    await page.reload();
    await expectHeading(page, "Assessment Summary");
    await expect(page.getByText(/national allocation/i).first()).toBeVisible();
    expectPath(
      page,
      "/australian-affiliation/funding-source/eligibility-info/result",
    );
  });
});

test.describe("Funding mutual exclusion", () => {
  test("selecting none-of-the-above then a real source unchecks none", async ({
    page,
  }) => {
    await page.goto("/");

    await selectRole(page, "Researcher");
    await clickContinue(page);
    await clickToggle(page, "Yes");
    await clickContinue(page);

    await checkFunding(page, /None of the above/i);
    await expect(
      page.locator("main").getByLabel(/None of the above/i),
    ).toBeChecked();

    await checkFunding(page, /NCRIS/i);
    await expect(
      page.locator("main").getByLabel(/None of the above/i),
    ).not.toBeChecked();
  });

  test("selecting a real source then none-of-the-above unchecks the real source", async ({
    page,
  }) => {
    await page.goto("/");

    await selectRole(page, "Researcher");
    await clickContinue(page);
    await clickToggle(page, "Yes");
    await clickContinue(page);

    await checkFunding(page, /national or international research grant/i);
    await expect(
      page
        .locator("main")
        .getByLabel(/national or international research grant/i),
    ).toBeChecked();

    await checkFunding(page, /None of the above/i);
    await expect(
      page
        .locator("main")
        .getByLabel(/national or international research grant/i),
    ).not.toBeChecked();
    await expect(
      page.locator("main").getByLabel(/None of the above/i),
    ).toBeChecked();
  });
});
