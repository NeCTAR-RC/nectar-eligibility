import { test, expect } from "./fixtures";
import {
  selectRole,
  clickToggle,
  clickContinue,
  checkFunding,
  checkAcknowledge,
  expectHeading,
} from "./helpers";

test.describe("Local allocation path", () => {
  test("AU affiliation, no funding, member org", async ({ page }) => {
    await page.goto("/");

    await selectRole(page, "Manager of People and/or Policy");
    await clickContinue(page);
    await clickToggle(page, "Yes");
    await clickContinue(page);

    await checkFunding(page, /None of the above/i);
    await clickContinue(page);

    await expectHeading(page, /ARDC Nectar member organisation/i);
    await clickToggle(page, "Yes");
    await clickContinue(page);

    await expectHeading(page, /eligible for a local allocation/i);
    await checkAcknowledge(page);
    await clickContinue(page);

    await expectHeading(page, "Assessment Complete");
    await expect(page.getByText(/local allocation/i).first()).toBeVisible();
    await expect(page.getByText(/local Nectar Node/i)).toBeVisible();
  });

  test("via Auckland + no funding + member org", async ({ page }) => {
    await page.goto("/");

    await selectRole(page, "Research Data/Software/Support Professional");
    await clickContinue(page);
    await clickToggle(page, "No");
    await clickContinue(page);
    await clickToggle(page, "Yes");
    await clickContinue(page);

    await checkFunding(page, /None of the above/i);
    await clickContinue(page);

    await clickToggle(page, "Yes");
    await clickContinue(page);

    await expectHeading(page, /eligible for a local allocation/i);
    await checkAcknowledge(page);
    await clickContinue(page);
    await expectHeading(page, "Assessment Complete");
  });
});
