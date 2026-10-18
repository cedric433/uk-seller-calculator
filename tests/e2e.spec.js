const { test, expect } = require("@playwright/test");
const AxeBuilder = require("@axe-core/playwright").default;

test("built-in calculator checks all pass", async ({ page }) => {
  await page.goto("/tests.html");
  await expect(page.locator("#out li")).toHaveCount(8);
  await expect(page.locator("#out li", { hasText: "FAIL" })).toHaveCount(0);
});

test("shows all five platforms and a winner", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator(".platform-result")).toHaveCount(5);
  await expect(page.locator("#summary")).toContainText("Highest estimated profit");
  await expect(page.locator("#table")).toHaveCount(0);
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
  await page.fill("#note", "Test item");
  await page.click("#saveCalc");
  await page.reload();
  await expect(page.locator("#history .hrow")).toHaveCount(1);
  await expect(page.locator("#history")).toContainText("Test item");
});

test("no critical accessibility problems", async ({ page }) => {
  await page.goto("/");
  const results = await new AxeBuilder({ page }).analyze();
  for (const v of results.violations) console.log(`[a11y ${v.impact}] ${v.id}: ${v.help} (${v.nodes.length} elements)`);
  expect(results.violations.filter((v) => v.impact === "critical")).toEqual([]);
});
