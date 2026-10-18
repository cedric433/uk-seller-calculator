const { test, expect } = require("@playwright/test");

test("eBay UK business fees have not changed", async ({ page }) => {
  await page.goto("https://www.ebay.co.uk/help/selling/selling-fees/Fees-business-sellers?id=4809");
  const text = await page.locator("body").innerText();
  expect(text).toContain("11.9%");
  expect(text).toContain("0.35%");
});

test("Etsy UK fees have not changed", async ({ page }) => {
  await page.goto("https://www.etsy.com/legal/fees");
  const text = await page.locator("body").innerText();
  expect(text).toContain("6.5%");
  expect(text).toContain("0.48%");
  expect(text).toContain("15%");
});

test("Vinted UK seller fees are still zero", async ({ page }) => {
  await page.goto("https://www.vinted.co.uk/pricelist");
  const text = await page.locator("body").innerText();
  expect(text.toLowerCase()).toContain("no fees for selling");
});
