const { test, expect } = require("@playwright/test");

test("eBay UK business fees have not changed", async ({ page }) => {
  await page.goto("https://www.ebay.co.uk/help/selling/selling-fees/Fees-business-sellers?id=4809");
  const text = await page.locator("body").innerText();
  expect(text).toContain("11.9%");
  expect(text).toContain("0.35%"); // Regulatory fee
});

test("Etsy UK fees have not changed", async ({ page }) => {
  await page.goto("https://www.etsy.com/legal/fees");
  const text = await page.locator("body").innerText();
  expect(text).toContain("6.5%");
  expect(text).toContain("0.48%"); // Regulatory fee
  expect(text).toContain("15%"); // Offsite ads
});

test("Vinted UK seller fees are still zero", { tag: "@monitor" }, async ({ page }) => {
  await page.goto("https://www.vinted.co.uk/pricelist");
  const body = page.locator("body");
  // Vinted uses Cloudflare heavily, so this may occasionally fail just from bot-blocking, 
  // which safely acts as a prompt for you to check it manually.
  await expect(body).toContainText(/no fees for selling/i);
});
