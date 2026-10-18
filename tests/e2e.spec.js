const { test, expect } = require("@playwright/test");
const AxeBuilder = require("@axe-core/playwright").default;

test("built-in calculator checks all pass", async ({ page }) => {
  await page.goto("/tests.html");
  await expect(page.locator("#out li")).toHaveCount(8);
  await expect(page.locator("#out li", { hasText: "FAIL" })).toHaveCount(0);
});

test("shows all five platforms and a winner", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("#table tbody tr")).toHaveCount(5);
  await expect(page.locator("#summary")).toContainText("Highest profit");
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
  await expect(page.locator("#table tbody tr", { hasText: "Vinted UK" })).toContainText("£21.50");
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
