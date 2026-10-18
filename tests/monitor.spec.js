const { test, expect } = require("@playwright/test");

async function readSource(page, platform, url) {
  const response = await page.goto(url);
  expect(response && response.ok(), `${platform} source ${url} could not be checked (HTTP ${response ? response.status() : "no response"}). Review the source manually; an inaccessible page is not evidence that rates changed.`).toBeTruthy();
  const text = await page.locator("body").innerText();
  expect(text, `${platform} source ${url} returned an empty page. Review the source manually; an empty response is not evidence that rates changed.`).not.toBe("");
  expect(text, `${platform} source ${url} showed an anti-bot or verification page. Review the source manually; blocked access is not evidence that rates changed.`).not.toMatch(/please verify yourself|captcha|robot check/i);
  return text;
}

function expectSourceRates(text, platform, url, expectedRates) {
  for (const rate of expectedRates) {
    expect(text, `${platform} source ${url} no longer contains "${rate}". Review the current fee schedule and update fees.js and this monitor if the model changed.`).toContain(rate);
  }
}

test("eBay UK business fees have not changed", async ({ page }) => {
  const url = "https://www.ebay.co.uk/help/selling/selling-fees/Fees-business-sellers?id=4809";
  const text = await readSource(page, "eBay UK business", url);
  expectSourceRates(text, "eBay UK business", url, ["11.9%", "0.35%"]);
});

test("Etsy transaction, regulatory, and advertising fees have not changed", async ({ page }) => {
  const url = "https://help.etsy.com/hc/en-gb/articles/115014483627-What-are-the-Fees-and-Taxes-for-Selling-on-Etsy-?segment=selling";
  const text = await readSource(page, "Etsy UK", url);
  expectSourceRates(text, "Etsy UK", url, ["6.5%", "15%"]);
});

test("Etsy UK regulatory fee has not changed", async ({ page }) => {
  const url = "https://help.etsy.com/hc/en-gb/articles/1500011073202-Regulatory-Operating-Fee";
  const text = await readSource(page, "Etsy UK regulatory fee", url);
  expectSourceRates(text, "Etsy UK regulatory fee", url, ["United Kingdom", "0.48%"]);
});

test("Etsy UK payment processing rate has not changed", async ({ page }) => {
  const url = "https://help.etsy.com/hc/en-gb/articles/115015628847-What-are-Payment-Processing-Fees-for-Selling-on-Etsy";
  const text = await readSource(page, "Etsy UK payment processing", url);
  expect(text, `Etsy source ${url} no longer lists the UK processing fee as 4% + £0.20. Review the current fee schedule and update fees.js and this monitor if the model changed.`).toMatch(/United Kingdom\s+4%\s*\+\s*0\.20 GBP/);
});

test("Vinted price list identifies buyer transaction fees and optional seller services", async ({ page }) => {
  const url = "https://www.vinted.co.uk/pricelist";
  const text = await readSource(page, "Vinted UK", url);
  expect(text, `Vinted source ${url} no longer describes the buyer-paid transaction fee. Review the current fee schedule and update fees.js and this monitor if the model changed.`).toContain("mandatory platform fee paid at checkout");
  expect(text, `Vinted source ${url} no longer describes seller services as optional. Review the current fee schedule and update fees.js and this monitor if the model changed.`).toContain("Sellers can improve the visibility of items by opting for the following services");
});
