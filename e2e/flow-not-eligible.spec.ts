import { test, expect } from "@playwright/test";
import {
  selectRole,
  clickToggle,
  clickContinue,
  checkFunding,
  checkAcknowledge,
  expectHeading,
} from "./helpers";

test.describe("Not eligible - no affiliation", () => {
  test("AU no + Auckland no", async ({ page }) => {
    await page.goto("/");

    await selectRole(page, "Researcher");
    await clickContinue(page);
    await clickToggle(page, "No");
    await clickContinue(page);
    await clickToggle(page, "No");
    await clickContinue(page);

    await expectHeading(page, /not eligible for an allocation/i);
    await expect(
      page.getByText(/project trial or ARDC services/i),
    ).toBeVisible();
    await checkAcknowledge(page);
    await clickContinue(page);

    await expectHeading(page, "Assessment Complete");
    await expect(page.getByText(/not eligible/i).first()).toBeVisible();
    await expect(page.getByText(/project trial/i).first()).toBeVisible();
    await expect(
      page.getByRole("link", { name: "Explore resources for researcher" }),
    ).toBeVisible();
  });
});

test.describe("Not eligible - no member org", () => {
  test("AU yes, no funding, member org no", async ({ page }) => {
    await page.goto("/");

    await selectRole(page, "Researcher");
    await clickContinue(page);
    await clickToggle(page, "Yes");
    await clickContinue(page);

    await checkFunding(page, /None of the above/i);
    await clickContinue(page);

    await clickToggle(page, "No");
    await clickContinue(page);

    await expectHeading(page, /not eligible for an allocation/i);
    await checkAcknowledge(page);
    await clickContinue(page);

    await expectHeading(page, "Assessment Complete");
    await expect(page.getByText(/not eligible/i).first()).toBeVisible();
  });
});
