import { test, expect } from "@playwright/test";
import {
  selectRole,
  clickToggle,
  clickContinue,
  checkFunding,
  checkAcknowledge,
  expectHeading,
} from "./helpers";

test.describe("National allocation via Australian affiliation", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("national grant", async ({ page }) => {
    await expectHeading(page, /professional position or role/i);
    await selectRole(page, "Researcher");
    await clickContinue(page);

    await expectHeading(page, /Australian University/i);
    await clickToggle(page, "Yes");
    await clickContinue(page);

    await expectHeading(page, /funded by/i);
    await checkFunding(page, /national or international research grant/i);
    await clickContinue(page);

    await expectHeading(page, /eligible for a national allocation/i);
    await expect(
      page.getByText(/Requirements for Nectar Project Allocations/i),
    ).toBeVisible();
    await checkAcknowledge(page);
    await clickContinue(page);

    await expectHeading(page, "Assessment Complete");
    await expect(page.getByText(/national allocation/i).first()).toBeVisible();
    await expect(page.getByText(/does not guarantee/i)).toBeVisible();
    await expect(
      page.getByRole("link", { name: "Apply for an allocation" }),
    ).toBeVisible();
  });

  test("NCRIS funding", async ({ page }) => {
    await selectRole(page, "Librarian/Trainer");
    await clickContinue(page);
    await clickToggle(page, "Yes");
    await clickContinue(page);
    await checkFunding(page, /NCRIS/i);
    await clickContinue(page);

    await expectHeading(page, /eligible for a national allocation/i);
    await checkAcknowledge(page);
    await clickContinue(page);
    await expectHeading(page, "Assessment Complete");
  });

  test("multiple funding sources", async ({ page }) => {
    await selectRole(page, "Researcher");
    await clickContinue(page);
    await clickToggle(page, "Yes");
    await clickContinue(page);

    await checkFunding(page, /national or international research grant/i);
    await checkFunding(page, /government department grant/i);
    await checkFunding(page, /industry supporting research/i);
    await clickContinue(page);

    await expectHeading(page, /eligible for a national allocation/i);
  });
});

test.describe("National allocation via Auckland affiliation", () => {
  test("Auckland affiliation with NCRIS funding", async ({ page }) => {
    await page.goto("/");

    await selectRole(page, "Researcher");
    await clickContinue(page);
    await clickToggle(page, "No");
    await clickContinue(page);

    await expectHeading(page, /University of Auckland/i);
    await clickToggle(page, "Yes");
    await clickContinue(page);

    await checkFunding(page, /NCRIS/i);
    await clickContinue(page);

    await expectHeading(page, /eligible for a national allocation/i);
    await checkAcknowledge(page);
    await clickContinue(page);
    await expectHeading(page, "Assessment Complete");
  });
});

test.describe("Each funding source leads to national allocation", () => {
  const fundingSources = [
    "A national or international research grant",
    /NCRIS/,
    /government department grant/,
    /industry supporting research/,
  ];

  for (const funding of fundingSources) {
    const label = typeof funding === "string" ? funding : funding.source;
    test(`Funding: ${label}`, async ({ page }) => {
      await page.goto("/");
      await selectRole(page, "Researcher");
      await clickContinue(page);
      await clickToggle(page, "Yes");
      await clickContinue(page);

      await checkFunding(page, funding);
      await clickContinue(page);

      await expectHeading(page, /eligible for a national allocation/i);
    });
  }
});
