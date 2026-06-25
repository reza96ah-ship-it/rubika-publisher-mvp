const { chromium } = require(process.cwd() + "/node_modules/playwright");
const fs = require("fs");

(async () => {
  const email = process.env.VISUAL_ADMIN_EMAIL;
  const password = process.env.VISUAL_ADMIN_PASSWORD;
  if (!email || !password) throw new Error("Visual review credentials were not provided by the job environment");

  const login = await fetch("http://127.0.0.1:8000/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password })
  });
  if (!login.ok) throw new Error(`Login failed: ${login.status}`);
  const loginPayload = await login.json();
  const sessionValue = loginPayload.access_token;
  const browser = await chromium.launch({ headless: true });
  const cases = [
    { name: "mobile-light", width: 390, height: 844, theme: "light" },
    { name: "mobile-dark", width: 390, height: 844, theme: "dark" },
    { name: "desktop-light", width: 1440, height: 900, theme: "light" },
    { name: "desktop-dark", width: 1440, height: 900, theme: "dark" }
  ];

  for (const item of cases) {
    const context = await browser.newContext({
      viewport: { width: item.width, height: item.height },
      colorScheme: item.theme
    });
    const page = await context.newPage();
    const browserErrors = [];
    page.on("pageerror", (error) => browserErrors.push(error.message));
    await page.addInitScript(({ sessionValue, theme }) => {
      localStorage.setItem("rubika_publisher_access", sessionValue);
      localStorage.setItem("theme", theme);
      document.documentElement.setAttribute("data-theme", theme);
    }, { sessionValue, theme: item.theme });
    await page.goto("http://127.0.0.1:3100/", { waitUntil: "networkidle" });
    await page.getByRole("heading", { name: "داشبورد", exact: true }).waitFor();
    await page.waitForTimeout(750);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
    if (overflow) throw new Error(`${item.name}: horizontal overflow detected`);
    if (browserErrors.length) throw new Error(`${item.name}: ${browserErrors.join(" | ")}`);
    await page.screenshot({ path: `visual-review/${item.name}.png`, fullPage: true });
    await context.close();
  }

  await browser.close();
  fs.writeFileSync(
    "visual-review/result.txt",
    "Dashboard visual capture passed at 390x844 and 1440x900 in light and dark modes.\n"
  );
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
