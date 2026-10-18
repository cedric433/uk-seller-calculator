# UK Seller Profit Calculator

Free tool that shows what UK sellers keep after fees on eBay, Etsy, Depop and Vinted. Live site: https://cedric433.github.io/uk-seller-calculator/

## What it does
Enter your item price, postage, costs and target profit. It shows fees, profit, margin and the price you would need to charge on each platform, plus a source panel for each fee model.

**Example:** £30 item + £3 postage, cost £8, postage paid £3, packaging £0.50. On Vinted you keep £21.50. On eBay (business, 11.9%) and Etsy, fees come off the £33 order total, so profit is lower.

## Saved calculations
Click "Save this calculation" to keep the current inputs (up to 20, newest first). Use Load to restore one or Delete to remove it. They are stored in your own browser only.

## How fees are calculated
Rates live in `fees.js`. Percentage fees apply to item price plus postage charged. Margin is profit ÷ (item price + postage charged). Target prices are rounded up to the next penny.

## Files
`index.html` page · `styles.css` look · `app.js` interface · `fees.js` rates and maths · `tests.html` browser checks (open it and look for green PASS lines)

## Updating fees
Edit the numbers in `fees.js`, change `CONFIG.updated`, and check `tests.html` still passes.

## Automated checks
Every pull request and push to main runs (see `.github/workflows/ci.yml`):
- **Lint:** html-validate for the HTML, ESLint for the JavaScript.
- **Browser tests:** Playwright runs the calculator in Chromium, including `tests.html` and an accessibility scan (axe).
- **Lighthouse:** speed, accessibility, best-practice and SEO scores (warnings only).
- **Link check:** finds broken links (advisory only).

AI code review comes from the Gemini Code Assist GitHub app, guided by `.gemini/styleguide.md`.

To run locally: `npm install`, then `npm run lint` and `npm test`.

## Disclaimer
Estimates only. Platforms change fees often. This is not tax, legal or financial advice. Always confirm on each platform's own fee page.
