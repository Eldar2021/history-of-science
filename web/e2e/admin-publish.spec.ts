import { expect, test, type Page } from "@playwright/test";
import { ADMIN, serviceFetch } from "./env";

const slug = `e2e-publish-${Date.now()}`;
const title = `E2E: an admin adds an event (${slug.slice(-6)})`;
const titleTr = `E2E: yönetici bir olay ekler (${slug.slice(-6)})`;

test.afterAll(async () => {
  await serviceFetch(`/rest/v1/events?slug=eq.${slug}`, { method: "DELETE" });
});

async function signIn(page: Page) {
  await page.goto("/admin/login");
  await page.getByLabel("Email").fill(ADMIN.email);
  await page.getByLabel("Password").fill(ADMIN.password);
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page).toHaveURL(/\/admin$/);
}

test.describe.configure({ mode: "serial" });

test("anonymous requests to /admin are redirected to the login page (302)", async ({ request }) => {
  const res = await request.get("/admin/events", { maxRedirects: 0 });
  expect(res.status()).toBe(302);
  expect(res.headers()["location"]).toContain("/admin/login");
});

test("a wrong password stays on the login page with an error", async ({ page }) => {
  await page.goto("/admin/login");
  await page.getByLabel("Email").fill(ADMIN.email);
  await page.getByLabel("Password").fill("not-the-password");
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page.locator("main [role=alert]")).toHaveText(/wrong email or password/i);
});

test("admin adds a published event in two languages and it appears on the site at once", async ({ page }) => {
  await signIn(page);
  await page.goto("/admin/events/new");
  await page.getByLabel("Year", { exact: true }).fill("1543");
  await page.getByLabel("Precision").selectOption("exact");
  await page.getByLabel("How well the place is known").selectOption("city");
  await page.getByLabel("Place name (en)").fill("Frombork");
  await page.getByLabel("Latitude").fill("54.3586");
  await page.getByLabel("Longitude").fill("19.6807");
  await page.locator("#tr_en_title").fill(title);
  await page.locator("#tr_en_summary").fill("Written by the Playwright test; deleted afterwards.");

  // The second language is a click away and keeps what the first one holds (ADR-034).
  await page.getByRole("button", { name: "Türkçe" }).click();
  await page.locator("#tr_tr_title").fill(titleTr);
  await page.locator("#tr_tr_summary").fill("Playwright testinin yazdığı olay; sonra silinir.");
  await page.getByRole("button", { name: "English" }).click();
  await expect(page.locator("#tr_en_title")).toHaveValue(title);

  await page.getByLabel("Slug").fill(slug);
  await page.getByLabel("Astronomy & Space").check();
  await page.getByLabel("Status", { exact: true }).selectOption("published");
  await page.getByRole("button", { name: "Save", exact: true }).click();

  // Saving lands on the list, with the event in it.
  await expect(page).toHaveURL(/\/admin\/events\?saved=1/);
  await expect(page.getByRole("status")).toHaveText(/saved/i);
  await page.getByRole("link", { name: title }).click();

  // Everything survived the round trip: the place through place_needs_coords, both languages.
  await expect(page.getByLabel("Place name (en)")).toHaveValue("Frombork");
  await expect(page.getByLabel("Latitude")).toHaveValue("54.3586");
  await expect(page.getByLabel("Longitude")).toHaveValue("19.6807");
  await expect(page.locator("#tr_tr_title")).toHaveValue(titleTr);

  // The public site, as a visitor (no cookies): a fresh context.
  const visitor = await page.context().browser()!.newContext();
  const site = await visitor.newPage();
  await site.goto("/en");
  await expect(site.getByRole("link", { name: new RegExp(title.replace(/[()]/g, "\\$&")) })).toBeVisible();
  await site.goto(`/en/event/${slug}`);
  await expect(site.getByRole("heading", { level: 1 })).toHaveText(title);
  await site.goto(`/tr/event/${slug}`);
  await expect(site.getByRole("heading", { level: 1 })).toHaveText(titleTr);
  await visitor.close();
});

test("switching the event back to draft hides it from the site", async ({ page }) => {
  await signIn(page);
  await page.goto("/admin/events?status=published");
  await page.getByRole("link", { name: title }).click();
  await expect(page).toHaveURL(/\/admin\/events\/[0-9a-f-]+/);
  await page.getByLabel("Status", { exact: true }).selectOption("draft");
  // "Save and stay" keeps the editor open, so a long body does not send you back to the list.
  await page.getByRole("button", { name: "Save and stay" }).click();
  await expect(page).toHaveURL(/\/admin\/events\/[0-9a-f-]+\?saved=1/);
  await expect(page.getByRole("status")).toHaveText(/saved/i);

  const visitor = await page.context().browser()!.newContext();
  const res = await visitor.request.get(`/en/event/${slug}`);
  expect(res.status()).toBe(404);
  const home = await (await visitor.request.get("/en")).text();
  expect(home).not.toContain(slug);
  await visitor.close();
});

test("the list finds an event by its Turkish title and by a missing language", async ({ page }) => {
  await signIn(page);
  await page.goto(`/admin/events?q=${encodeURIComponent(titleTr.slice(0, 20))}&status=draft`);
  await expect(page.getByRole("link", { name: title })).toBeVisible();

  // It has English and Turkish, so it shows up under "no Russian" and not under "no Turkish".
  await page.goto("/admin/events?missing=ru&status=draft");
  await expect(page.getByRole("link", { name: title })).toBeVisible();
  await page.goto("/admin/events?missing=tr&status=draft");
  await expect(page.getByRole("link", { name: title })).toHaveCount(0);
});
