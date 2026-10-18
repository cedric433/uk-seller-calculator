const { test, expect } = require("@playwright/test");
const AxeBuilder = require("@axe-core/playwright").default;

test("built-in calculator checks all pass", async ({ page }) => {
  await page.goto("/tests.html");
  await expect(page.locator("#out li")).toHaveCount(12);
  await expect(page.locator("#out li", { hasText: "FAIL" })).toHaveCount(0);
});

test("shows all five platforms and a winner", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator(".platform-result")).toHaveCount(5);
  await expect(page.locator("#summary")).toContainText("Highest estimated profit");
  await expect(page.locator("#table")).toHaveCount(0);
});

test("calculator pages use the custom domain for canonical and social URLs", async ({ page }) => {
  for (const path of ["/", "/ebay-fee-calculator-uk.html", "/etsy-fee-calculator-uk.html", "/depop-fee-calculator-uk.html", "/vinted-profit-calculator.html"]) {
    const canonical = `https://marginhatch.com${path}`;
    await page.goto(path);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", canonical);
    await expect(page.locator('meta[property="og:url"]')).toHaveAttribute("content", canonical);
  }
});

test("fee verification dates are shown per platform and former hero badges are absent", async ({ page }) => {
  for (const path of ["/", "/ebay-fee-calculator-uk.html", "/etsy-fee-calculator-uk.html", "/depop-fee-calculator-uk.html", "/vinted-profit-calculator.html"]) {
    await page.goto(path);
    await expect(page.locator("#upd")).toContainText("Verification dates appear with each fee source");
    await expect(page.locator("#sources")).toContainText("Rates last checked 18 October 2026");
    await expect(page.locator("#sources")).toContainText("Rate verification date not recorded");
    await expect(page.locator(".chips")).not.toContainText(/Free tool|No sign-up/);
  }
});

test("input panel stays sticky within its grid row without overlapping source details", async ({ page }) => {
  for (const viewport of [{ width: 1280, height: 800 }, { width: 640, height: 800 }]) {
    await page.setViewportSize(viewport);
    await page.goto("/");
    const inputPanel = page.locator(".inputs");
    const inputWrapper = page.locator(".inputs-wrapper");
    const sourceDetails = page.locator("#sources details summary").first();
    if (viewport.width > 820) {
      await page.evaluate("window.scrollTo(0, 450)");
      const [inputBox, wrapperBox] = await Promise.all([inputPanel.boundingBox(), inputWrapper.boundingBox()]);
      expect(inputBox).not.toBeNull();
      expect(wrapperBox).not.toBeNull();
      expect(inputBox.y).toBeCloseTo(16, 0);
      expect(inputBox.y + inputBox.height).toBeLessThanOrEqual(wrapperBox.y + wrapperBox.height + 1);
    } else {
      await expect(inputPanel).toHaveCSS("position", "static");
    }
    await sourceDetails.scrollIntoViewIfNeeded();
    const [inputBox, sourceBox] = await Promise.all([inputPanel.boundingBox(), sourceDetails.boundingBox()]);
    expect(inputBox).not.toBeNull();
    expect(sourceBox).not.toBeNull();
    const overlaps = inputBox.x < sourceBox.x + sourceBox.width &&
      inputBox.x + inputBox.width > sourceBox.x &&
      inputBox.y < sourceBox.y + sourceBox.height &&
      inputBox.y + inputBox.height > sourceBox.y;
    expect(overlaps).toBe(false);
  }
});

test("default numbers give the right Vinted profit", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator(".platform-result", { hasText: "Vinted UK" })).toContainText("£21.50");
});

test("quantity and category selections recalculate every calculator page", async ({ page }) => {
  await page.addInitScript("localStorage.clear()");
  for (const path of ["/", "/ebay-fee-calculator-uk.html", "/etsy-fee-calculator-uk.html", "/depop-fee-calculator-uk.html", "/vinted-profit-calculator.html"]) {
    await page.goto(path);
    await expect(page.locator("#qty")).toHaveValue("1");
    await expect(page.locator("#ebay-fee-input")).toHaveValue("11.9");
    await expect(page.locator("#platformCards .platform-result")).toHaveCount(5);
    await page.selectOption("#ebay-category", "6.9");
    await expect(page.locator("#ebay-fee-input")).toHaveValue("6.9");
    await expect(page.locator("#platformCards .platform-result").filter({ hasText: "eBay UK (business)" })).toContainText("Final value fee (6.9%)");
    await page.fill("#qty", "2");
    await expect(page.locator(".platform-result", { hasText: "Vinted UK" })).toContainText("£43.50");
    await expect(page.locator(".profit-details summary").first()).toHaveText("Profit breakdown");
    await page.locator(".profit-details summary").first().click();
    await expect(page.locator(".profit-breakdown").first()).toContainText("Total Revenue");
    await expect(page.locator(".profit-breakdown").first()).toContainText("Total Item Cost");
    await expect(page.locator(".profit-breakdown").first()).toContainText("Shipping & Packaging");
    await expect(page.locator(".profit-breakdown").first()).toContainText("Net Profit");
  }
});

test("no scroll tracker is rendered on calculator pages", async ({ page }) => {
  for (const path of ["/", "/ebay-fee-calculator-uk.html", "/etsy-fee-calculator-uk.html", "/depop-fee-calculator-uk.html", "/vinted-profit-calculator.html"]) {
    await page.goto(path);
    await expect(page.locator(".scroll-tracker")).toHaveCount(0);
    await expect(page.locator(".track-step")).toHaveCount(0);
  }
});

test("calculator initializes when optional saved-calculation controls are absent", async ({ page }) => {
  await page.route("**/", async (route) => {
    const response = await route.fetch();
    const html = await response.text();
    await route.fulfill({
      response,
      body: html.replace('id="save-calc-name"', 'id="removed-save-calc-name"')
        .replace('id="save-calc-btn"', 'id="removed-save-calc-btn"')
    });
  });
  await page.goto("/");
  await expect(page.locator(".platform-result")).toHaveCount(5);
});

test("shows fee caveats next to the affected platform estimates", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator(".platform-result", { hasText: "Depop UK" })).toContainText("assumes a 0% UK selling fee");
  await expect(page.locator(".platform-result", { hasText: "Vinted UK" })).toContainText("Buyer protection fees are not included");
  await expect(page.locator(".platform-result", { hasText: "eBay UK (private)" })).toContainText("casual selling");
});

test("preset feedback explains the changed scenario", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "High-value" }).click();
  await expect(page.locator("#resultStatus")).toContainText("High-value example applied");
  await expect(page.getByRole("button", { name: "High-value" })).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator("#price")).toHaveValue("250");
});

test("mobile comparison fits the viewport and keeps fee details expandable", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("/");
  await expect(page.locator(".platform-result")).toHaveCount(5);
  await expect(page.locator(".fee-details").first()).toBeVisible();
  const contentWidth = await page.locator("html").evaluate((html) => html.scrollWidth);
  expect(contentWidth).toBeLessThanOrEqual(page.viewportSize().width);
  const mobileJump = page.locator("#mobileJump");
  await expect(mobileJump).toHaveText("Compare platforms ↓");
  await page.locator("#results").scrollIntoViewIfNeeded();
  await expect(mobileJump).toHaveText("Edit sale details ↑");
  await mobileJump.click();
  await expect(page).toHaveURL(/#price$/);
  await page.locator("#price").focus();
  await expect(mobileJump).toBeHidden();
  await page.locator(".fee-details summary").first().click();
  await expect(page.locator(".fee-details").first()).toHaveAttribute("open", "");
});

test("empty and negative prices show a warning", async ({ page }) => {
  await page.goto("/");
  await page.fill("#price", "0");
  await expect(page.locator("#warn")).toContainText("Enter an item price");
  await page.fill("#price", "-5");
  await expect(page.locator("#warn")).toContainText("Negative");
});

test("saved calculations survive a reload", async ({ page }) => {
  await page.goto("/");
  await page.fill("#save-calc-name", "Test item");
  await page.click("#save-calc-btn");
  await page.reload();
  await expect(page.locator("#history .hrow")).toHaveCount(1);
  await expect(page.locator("#history")).toContainText("Test item");
});

test("Enter saves a named calculation", async ({ page }) => {
  await page.goto("/");
  await page.fill("#save-calc-name", "Keyboard item");
  await page.locator("#save-calc-name").press("Enter");
  await expect(page.locator("#history")).toContainText("Keyboard item");
  await expect(page.locator("#resultStatus")).toContainText("Calculation saved");
});

test("Enter recalculates a numeric input without submitting the page", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("/");
  await page.fill("#price", "40");
  await page.locator("#price").press("Enter");
  await expect(page.locator(".platform-result", { hasText: "Vinted UK" })).toContainText("£31.50");
  await expect(page.locator("#resultStatus")).toContainText("Platform comparison updated");
  await expect(page.locator("#price")).not.toBeFocused();
  await expect(page.locator("#mobileJump")).toBeVisible();
  await expect(page).toHaveURL("/");
});

test("interactive controls show a visible keyboard focus indicator", async ({ page }) => {
  await page.goto("/");
  await page.locator("#price").focus();
  await expect(page.locator("#price")).toHaveCSS("outline-style", "solid");
  await expect(page.locator("#price")).toHaveCSS("outline-width", "2px");
  await expect(page.locator("#price")).toHaveCSS("transform", "none");
  await page.locator("#save-calc-name").focus();
  await expect(page.locator("#save-calc-name")).not.toHaveCSS("transform", "none");
});

test("no critical accessibility problems", async ({ page }) => {
  await page.goto("/");
  const results = await new AxeBuilder({ page }).analyze();
  for (const v of results.violations) console.log(`[a11y ${v.impact}] ${v.id}: ${v.help} (${v.nodes.length} elements)`);
  expect(results.violations.filter((v) => v.impact === "critical")).toEqual([]);
});
