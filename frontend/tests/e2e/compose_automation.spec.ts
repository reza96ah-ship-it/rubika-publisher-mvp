import { test, expect } from "@playwright/test";

test.describe("Composer Instagram Comment Automation E2E Flow", () => {
  test("should allow creating a post with comment automation, triggers, suggestions and save it successfully", async ({ page }) => {
    // 1. Log in
    await page.goto("/login");
    await page.fill("input[type='email']", "admin@example.com");
    await page.fill("input[type='password']", "change_this_password");
    await page.click("button[type='submit']");
    await page.waitForURL("/");
    await expect(page.locator("aside")).toBeVisible();

    // 2. Navigate to compose page
    await page.click("aside a[href='/compose']");
    await expect(page.locator("h1")).toHaveText("پست جدید");

    // 3. Fill in content text and caption
    await page.fill("input[placeholder='مثلاً معرفی محصول جدید']", "تست اتوماسیون کلیدواژه");
    await page.fill("textarea[placeholder='متن پست شبکه‌های اجتماعی را وارد کنید...']", "برای دریافت تخفیف عدد 5 را کامنت کنید.");

    // 4. Go to Campaign and Channel setup (workflow Mode)
    await page.click("button:has-text('کانال و کمپین')");

    // 5. Toggle Instagram platform (ensure Instagram is selected)
    // First check if Instagram is active, if not click to toggle
    const instagramBtn = page.locator("button:has-text('اینستاگرام')");
    await expect(instagramBtn).toBeVisible();
    
    const isPressed = await instagramBtn.getAttribute("aria-pressed");
    if (isPressed !== "true") {
      await instagramBtn.click();
    }

    // 6. Verify that the Instagram Comment Automation section is visible
    const automationHeader = page.locator("p:has-text('تعامل خودکار اینستاگرام')");
    await expect(automationHeader).toBeVisible();

    // 7. Toggle on the auto-reply checkbox
    await page.locator("input[type='checkbox'] + div").first().click();


    // 8. Verify trigger keyword suggestion badge "5" is visible and click it
    const suggestionBadge = page.locator("button:has-text('5 +')");
    await expect(suggestionBadge).toBeVisible();
    await suggestionBadge.click();

    // 9. Verify that keyword trigger input contains "5"
    const keywordInput = page.locator("input[placeholder='۵، قیمت، تخفیف']");
    await expect(keywordInput).toHaveValue("5");

    // 10. Select trigger type (exact match)
    await page.selectOption("select:has-text('تطابق دقیق کلمه')", "exact");

    // 11. Write private DM message
    await page.fill("textarea[placeholder='سلام! لینک خرید خدمت شما: https://example.com']", "سلام! پیام آزمایشی تعامل خودکار.");

    // 12. Enable public comment reply
    const publicReplyCheckbox = page.locator("input#publicReplyEnabled");
    await publicReplyCheckbox.check({ force: true });

    // 13. Fill public comment reply
    await page.fill("input[placeholder='ارسال شد؛ لطفاً دایرکت خود را چک کنید 🌹']", "پاسخ دایرکت شد 🌹");

    // 14. Save draft post
    const saveButton = page.locator("button:has-text('ذخیره پیش‌نویس')");
    await expect(saveButton).toBeVisible();
    await saveButton.click();

    // 15. Verify success notification toast/banner
    const successBanner = page.locator("div:has-text('پست به عنوان پیش‌نویس ذخیره شد')").first();
    await expect(successBanner).toBeVisible();
  });
});

