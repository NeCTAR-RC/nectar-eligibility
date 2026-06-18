import { test, expect } from "./fixtures";
import {
  selectRole,
  clickToggle,
  clickContinue,
  clickContinueToSummary,
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
    await clickContinueToSummary(page);

    await expectHeading(page, "Assessment Summary");
    await expect(page.getByText(/not eligible/i).first()).toBeVisible();
    await expect(page.getByText(/project trial/i).first()).toBeVisible();
    await expect(
      page.getByRole("link", { name: "Explore resources for researcher" }),
    ).toBeVisible();

    // Feedback banner: heading is visible and the survey link points to the
    // external form in a new tab (assert attributes only — don't navigate out).
    const main = page.locator("main");
    await expect(
      main.getByRole("heading", {
        name: "Help us improve the Eligibility Assessment Tool",
      }),
    ).toBeVisible();
    const surveyLink = main.getByRole("link", { name: /Start the survey/i });
    await expect(surveyLink).toHaveAttribute(
      "href",
      "https://forms.gle/1Z1EYSUJmd6YWFjk8",
    );
    await expect(surveyLink).toHaveAttribute("target", "_blank");
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
    await clickContinueToSummary(page);

    await expectHeading(page, "Assessment Summary");
    await expect(page.getByText(/not eligible/i).first()).toBeVisible();
  });
});
