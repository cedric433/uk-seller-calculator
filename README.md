# UK Seller Profit Calculator

Shows what UK sellers keep after fees on eBay, Etsy, Depop and Vinted. Live site: https://marginhatch.com/

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
Edit rates in `fees.js` after checking the linked platform source. Set that platform's `verifiedOn` date to the day you checked it; leave it `null` when the assumptions have not been verified. Update the matching source assertion in `tests/monitor.spec.js` when published rates change, then check `tests.html`.

## Automated checks
Every pull request and push to `main` runs HTML validation on all calculator pages, ESLint, and the Playwright end-to-end suite in Chromium (including the accessibility scan). A separate weekly workflow checks published eBay, Etsy, and Vinted fee sources and summarizes failures with the affected test and suggested review steps. A source blocked by anti-bot protection is reported as unavailable, not as a rate change. Depop is not included because its linked Help Centre does not publish a verifiable fee schedule; its fee assumptions remain unverified. These checks are defined in `.github/workflows/`.

To run locally: `npm ci`, then `npm run lint` and `npm test`. Run the live source checks separately with `npm run test:monitor`.

## Disclaimer
Estimates only. Platforms change fees often. This is not tax, legal or financial advice. Always confirm on each platform's own fee page.
