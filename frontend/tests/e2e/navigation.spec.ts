import { test, expect } from "@playwright/test";

test.describe("Navigation & App Shell E2E Flow", () => {
  test("should navigate through all main menu items successfully", async ({ page }) => {
    // 1. Log in
    await page.goto("/login");
    await page.fill("input[type='email']", "admin@example.com");
    await page.fill("input[type='password']", "change_this_password");
    await page.click("button[type='submit']");
    await page.waitForURL("/");

    // 2. Dashboard
    await expect(page.locator("h1")).toHaveText("داشبورد انتشار");

    // 3. Calendar Planner
    await page.click("aside a[href='/calendar']");
    await expect(page.locator("h1")).toHaveText("تقویم محتوا");

    // 4. Inbox
    await page.click("aside a[href='/inbox']");
    await expect(page.locator("h1")).toHaveText("صندوق پیام (Inbox Pro)");

    // 5. Reports
    await page.click("aside a[href='/reports']");
    await expect(page.locator("h1")).toHaveText("گزارش‌ها و تحلیل‌ها");
  });
});

