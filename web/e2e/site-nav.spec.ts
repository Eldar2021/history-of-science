import { expect, test } from "@playwright/test";

/** The right-hand side of the site bar: About, Contact and the language (ADR-024). */

test("the language chooser switches locale and keeps the page", async ({ page }) => {
  await page.goto("/en?event=euclid-elements");
  await page.getByRole("button", { name: "Language" }).click();
  await page.getByRole("button", { name: /Türkçe/ }).click();
  await expect(page).toHaveURL(/\/tr\?event=euclid-elements$/);
  await expect(page.getByRole("button", { name: "Dil" })).toContainText("TR");
});

test("About says what the site is, in the builder's own words", async ({ page }) => {
  await page.goto("/en");
  await page.getByRole("button", { name: "About", exact: true }).click();
  const sheet = page.getByRole("dialog");
  await expect(sheet).toContainText("spark");
  await expect(sheet).toContainText("We use everything as though we knew it");
  await page.keyboard.press("Escape");
  await expect(sheet).toBeHidden();
});

test("Contact offers an address and an issue, and admits what we are not", async ({ page }) => {
  await page.goto("/en");
  await page.getByRole("button", { name: "Contact" }).click();
  const sheet = page.getByRole("dialog");
  await expect(sheet).toContainText("not a historian");
  await expect(sheet.getByRole("link", { name: "Report an error" })).toHaveAttribute("href", /^mailto:/);
  await expect(sheet.getByRole("link", { name: /GitHub/ })).toHaveAttribute("href", /github\.com/);
});

test.describe("on a phone", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test("the menu leads to About, and the language stays a flag in the bar", async ({ page }) => {
    await page.goto("/en");
    // About and Contact do not fit beside the wordmark, so they are behind the menu.
    await expect(page.getByRole("button", { name: "About", exact: true })).toBeHidden();
    await page.getByRole("button", { name: "Menu" }).click();
    await page.getByRole("button", { name: "About", exact: true }).click();
    await expect(page.getByRole("dialog")).toContainText("spark");

    await page.keyboard.press("Escape");
    await page.getByRole("button", { name: "Language" }).click();
    await expect(page.getByRole("dialog")).toContainText("Кыргызча");
  });
});
