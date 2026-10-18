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
