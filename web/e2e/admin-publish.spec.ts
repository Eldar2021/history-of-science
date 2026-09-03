import { expect, test, type Page } from "@playwright/test";
import { ADMIN, serviceFetch } from "./env";

const slug = `e2e-publish-${Date.now()}`;
const title = `E2E: an admin adds an event (${slug.slice(-6)})`;

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

test("admin adds a published event and it appears on the site at once", async ({ page }) => {
  await signIn(page);
  await page.goto("/admin/events/new");
  await page.getByLabel("Year", { exact: true }).fill("1543");
  await page.getByLabel("Precision").selectOption("exact");
  await page.getByLabel("Title").fill(title);
  await page.getByLabel("Summary").fill("Written by the Playwright test; deleted afterwards.");
  await page.getByLabel("Slug").fill(slug);
  await page.getByLabel("Astronomy & Space").check();
  await page.getByLabel("Status", { exact: true }).selectOption("published");
  await page.getByRole("button", { name: "Save" }).click();
  await expect(page.getByRole("status")).toHaveText(/saved/i);
  await expect(page).toHaveURL(/\/admin\/events\/[0-9a-f-]+\?saved=1/);

  // The public site, as a visitor (no cookies): a fresh context.
  const visitor = await page.context().browser()!.newContext();
  const site = await visitor.newPage();
  await site.goto("/en/timeline");
  await expect(site.getByRole("link", { name: new RegExp(title.replace(/[()]/g, "\\$&")) })).toBeVisible();
  await site.goto(`/en/event/${slug}`);
  await expect(site.getByRole("heading", { level: 1 })).toHaveText(title);
  await visitor.close();
});

test("switching the event back to draft hides it from the site", async ({ page }) => {
  await signIn(page);
  await page.goto("/admin/events?status=published");
  await page.getByRole("link", { name: title }).click();
  await expect(page).toHaveURL(/\/admin\/events\/[0-9a-f-]+/);
  await page.getByLabel("Status", { exact: true }).selectOption("draft");
  await page.getByRole("button", { name: "Save" }).click();
  await expect(page.getByRole("status")).toHaveText(/saved/i);

  const visitor = await page.context().browser()!.newContext();
  const res = await visitor.request.get(`/en/event/${slug}`);
  expect(res.status()).toBe(404);
  const timeline = await (await visitor.request.get("/en/timeline")).text();
  expect(timeline).not.toContain(slug);
  await visitor.close();
});
