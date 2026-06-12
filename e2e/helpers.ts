import { expect, type Page } from "@playwright/test";

// Scoped to main: the ardc-footer newsletter form renders the same role
// labels ("Researcher", etc.) once its remote content loads.
export async function selectRole(page: Page, label: string) {
  await page.locator("main").getByText(label, { exact: true }).click();
}

export async function clickToggle(page: Page, label: string) {
  await page.locator("main").getByText(label, { exact: true }).click();
}

export async function clickContinue(page: Page) {
  await page.getByRole("button", { name: "Continue" }).click();
}

export async function clickPrevious(page: Page) {
  await page.getByRole("button", { name: "Previous" }).click();
}

export async function checkFunding(page: Page, label: string | RegExp) {
  await page.getByRole("group").getByText(label).click();
}

export async function checkAcknowledge(page: Page) {
  await page.getByText("I understand the requirements.").click();
}

export async function expectHeading(page: Page, text: string | RegExp) {
  await expect(page.getByRole("heading", { name: text })).toBeVisible();
}

export async function startOver(page: Page) {
  await page.getByRole("button", { name: "Start over" }).click();
}

/**
 * Asserts the step portion of the URL path.
 * URL `/australian-affiliation?session=1` -> step path `/australian-affiliation`
 */
export function expectPath(page: Page, expectedStepPath: string) {
  const url = new URL(page.url());
  expect(url.pathname).toBe(expectedStepPath);
}

export function getSessionId(page: Page): string {
  const url = new URL(page.url());
  return url.searchParams.get("session") ?? "";
}

/**
 * Complete the shortest not-eligible path from step 1.
 * Role -> AU No -> Auckland No -> Acknowledge -> Result
 */
export async function completeNotEligiblePath(page: Page, role: string) {
  await selectRole(page, role);
  await clickContinue(page);
  await clickToggle(page, "No");
  await clickContinue(page);
  await clickToggle(page, "No");
  await clickContinue(page);
  await checkAcknowledge(page);
  await clickContinue(page);
}

/**
 * Complete the national allocation path from step 1.
 * Role -> AU Yes -> Funding -> Acknowledge -> Result
 */
export async function completeNationalPath(page: Page, role: string) {
  await selectRole(page, role);
  await clickContinue(page);
  await clickToggle(page, "Yes");
  await clickContinue(page);
  await checkFunding(page, /national or international research grant/i);
  await clickContinue(page);
  await checkAcknowledge(page);
  await clickContinue(page);
}

/**
 * Complete the local allocation path from step 1.
 * Role -> AU Yes -> None funding -> Member org Yes -> Acknowledge -> Result
 */
export async function completeLocalPath(page: Page, role: string) {
  await selectRole(page, role);
  await clickContinue(page);
  await clickToggle(page, "Yes");
  await clickContinue(page);
  await checkFunding(page, /None of the above/i);
  await clickContinue(page);
  await clickToggle(page, "Yes");
  await clickContinue(page);
  await checkAcknowledge(page);
  await clickContinue(page);
}
