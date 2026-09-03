import { expect, test } from "@playwright/test";

/** The globe home page (ADR-024). The local seed has ten published events with a place. */

test("the first event is in the HTML before any script runs", async ({ request }) => {
  const html = await (await request.get("/en")).text();
  expect(html).toContain("Thales looks for natural causes");
  expect(html).toContain("Miletus");
});

test("the buttons walk the timeline and the URL follows", async ({ page }) => {
  await page.goto("/en");
  await expect(page.getByText("1 of 10")).toBeVisible();
  await expect(page.getByRole("button", { name: "Previous event" })).toBeDisabled();

  await page.getByRole("button", { name: "Next event" }).click();
  await expect(page.getByRole("heading", { level: 2 })).toHaveText("Euclid writes the Elements");
  await expect(page).toHaveURL(/\?event=euclid-elements$/);

  await page.getByRole("button", { name: "Previous event" }).click();
  await expect(page.getByRole("heading", { level: 2 })).toHaveText("Thales looks for natural causes");
});

test("the arrow keys do the same as the buttons", async ({ page }) => {
  await page.goto("/en");
  await page.keyboard.press("ArrowRight");
  await page.keyboard.press("ArrowRight");
  await expect(page.getByText("3 of 10")).toBeVisible();
  await page.keyboard.press("ArrowLeft");
  await expect(page.getByText("2 of 10")).toBeVisible();
});

test("a shared link opens on the event it names", async ({ page }) => {
  await page.goto("/en?event=ulugh-beg-observatory");
  await expect(page.getByRole("heading", { level: 2 })).toHaveText("Ulugh Beg builds the Samarkand observatory");
  // exact: the summary mentions Samarkand too; this is the place line under the card.
  await expect(page.getByText("Samarkand", { exact: true })).toBeVisible();
});

test("the card opens the event over the globe, and Escape closes it", async ({ page }) => {
  await page.goto("/en");
  await page.getByRole("link", { name: /Read the story/ }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await expect(page).toHaveURL(/\/en\/event\/thales-natural-explanations$/);

  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(page).toHaveURL(/\/en$/);
});
