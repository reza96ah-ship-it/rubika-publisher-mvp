import { test, expect } from "@playwright/test";

test.describe("Sanity & Authentication E2E Flow", () => {
  test("should load login page, check elements, and authenticate successfully", async ({ page }) => {
    // 1. Go to login page
    await page.goto("/login");

    // 2. Assert page headers and elements are loaded correctly
    await expect(page.locator("h1")).toHaveText("ورود به داشبورد محتوا");
    await expect(page.locator("button[type='submit']")).toHaveText("ورود به پنل");

    // 3. Enter seeded admin credentials
    await page.fill("input[type='email']", "admin@example.com");
    await page.fill("input[type='password']", "change_this_password");

    // 4. Click submit
    await page.click("button[type='submit']");

    // 5. Verify redirect to the dashboard (root URL "/")
    await page.waitForURL("/");
    await expect(page).toHaveURL("/");

    // 6. Assert dashboard sidebar layout is visible
    await expect(page.locator("aside")).toBeVisible();
  });
});
