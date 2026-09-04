import { expect, test } from "@playwright/test";

/**
 * The home page: the globe and, along its foot, the timeline (ADR-024).
 * The local seed has ten published events, all of them with a place.
 */

/** The big card beside the globe, which is the reading surface; the strip cards are navigation. */
const card = "main > a";
const progress = "[aria-live=polite]";

test("the first event is in the HTML before any script runs", async ({ request }) => {
  const html = await (await request.get("/en")).text();
  expect(html).toContain("Thales looks for natural causes");
  expect(html).toContain("Miletus");
});

test("every event is a link in the HTML, so the page works without scripts", async ({ request }) => {
  const html = await (await request.get("/en")).text();
  const links = new Set(html.match(/href="\/en\/event\/[a-z0-9-]+"/g) ?? []);
  expect(links.size).toBe(10);
  expect(html).toContain('href="/en/event/ulugh-beg-observatory"');
});

test("the buttons walk the timeline and the URL follows", async ({ page }) => {
  await page.goto("/en");
  await expect(page.locator(progress)).toHaveText("1 of 10");
  await expect(page.getByRole("button", { name: "Previous event" })).toBeDisabled();

  await page.getByRole("button", { name: "Next event" }).click();
  await expect(page.locator(`${card} h2`)).toHaveText("Euclid writes the Elements");
  await expect(page).toHaveURL(/\?event=euclid-elements$/);

  await page.getByRole("button", { name: "Previous event" }).click();
  await expect(page.locator(`${card} h2`)).toHaveText("Thales looks for natural causes");
});

test("the arrow keys do the same as the buttons", async ({ page }) => {
  await page.goto("/en");
  await page.keyboard.press("ArrowRight");
  await page.keyboard.press("ArrowRight");
  await expect(page.locator(progress)).toHaveText("3 of 10");
  await page.keyboard.press("ArrowLeft");
  await expect(page.locator(progress)).toHaveText("2 of 10");
});

test("a card in the strip selects its event rather than leaving the page", async ({ page }) => {
  await page.goto("/en");
  const strip = page.getByRole("list", { name: /all events/i });
  await strip.getByRole("link", { name: /Ulugh Beg/ }).click();
  await expect(page.locator(`${card} h2`)).toHaveText("Ulugh Beg builds the Samarkand observatory");
  await expect(page).toHaveURL(/\?event=ulugh-beg-observatory$/);
});

test("a shared link opens on the event it names", async ({ page }) => {
  await page.goto("/en?event=ulugh-beg-observatory");
  await expect(page.locator(`${card} h2`)).toHaveText("Ulugh Beg builds the Samarkand observatory");
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

test("the honesty admission is one click away and still names the report link", async ({ page }) => {
  await page.goto("/en");
  await page.getByRole("button", { name: /accuracy of this site/i }).click();
  const dialog = page.getByRole("dialog");
  await expect(dialog).toContainText("not a historian");
  await expect(dialog.getByRole("link", { name: "Report an error" })).toHaveAttribute("href", /^mailto:/);
  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
});

test("the old timeline address still leads somewhere", async ({ page }) => {
  await page.goto("/en/timeline");
  await expect(page).toHaveURL(/\/en$/);
  await expect(page.locator(`${card} h2`)).toHaveText("Thales looks for natural causes");
});
