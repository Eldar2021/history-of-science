import { chromium, devices } from "playwright";
const browser = await chromium.launch({ channel: "chrome" });
const out = process.argv[2];

const desktop = await browser.newPage({ viewport: { width: 1280, height: 800 } });
await desktop.goto("http://127.0.0.1:3123/tr", { waitUntil: "networkidle" });
await desktop.waitForTimeout(2500);
await desktop.screenshot({ path: `${out}/home-desktop.png` });

// hover the strip so the cards grow
await desktop.mouse.move(640, 740);
await desktop.waitForTimeout(600);
await desktop.screenshot({ path: `${out}/home-desktop-hover.png` });

// the honesty dialog
await desktop.mouse.move(640, 400);
await desktop.waitForTimeout(300);
await desktop.getByRole("button", { name: /doğruluğu/i }).click();
await desktop.waitForTimeout(400);
await desktop.screenshot({ path: `${out}/home-dialog.png` });

const phone = await browser.newPage({ ...devices["iPhone 13"] });
await phone.goto("http://127.0.0.1:3123/tr", { waitUntil: "networkidle" });
await phone.waitForTimeout(2500);
await phone.screenshot({ path: `${out}/home-phone.png` });
await phone.getByRole("button", { name: /büyüt/i }).click();
await phone.waitForTimeout(500);
await phone.screenshot({ path: `${out}/home-phone-expanded.png` });

console.log("shots done");
await browser.close();
