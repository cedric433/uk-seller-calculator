# Getting started

The UK Seller Profit Calculator estimates what you keep after selling fees and costs on eBay UK, Etsy UK, Depop and Vinted. Try the [live calculator](https://cedric433.github.io/uk-seller-calculator/).

## Use the calculator

Enter the item price and postage charged to the buyer, then add your item cost, postage cost, packaging or other costs, and quantity. Choose an eBay business fee for your category, set a target profit, and switch on any options that apply to the sale:

- **VAT on seller fees** adds 20% to eBay business and Etsy fees. The calculator defaults this on; switch it off when it does not apply to your situation.
- **Etsy Offsite Ads** adds the 15% fee when an order came through an Offsite Ad.
- **Depop Boosted Listing** adds the 12% boost fee when the order incurred it.

Results compare estimated seller fees, profit, margin and the item price needed to reach your target profit. Open **Fee breakdown and assumptions** on a platform card for included and excluded fees and links to the platform's fee information. The comparison ranks estimated profit only; it does not account for demand, selling speed or account eligibility.

Calculations and up to 20 saved scenarios are stored in your browser, not on a server. Use **Save this calculation** to keep a scenario, then load or delete it from the saved list.

## How estimates work

Percentage fees are generally applied to the item price plus postage charged. Profit subtracts seller fees, item cost, postage paid and packaging or other costs. Margin is profit divided by the order amount (item price plus postage charged). Target prices are rounded up to the next penny.

Current fee assumptions are defined in [`fees.js`](https://github.com/cedric433/uk-seller-calculator/blob/main/fees.js):

| Platform | Included in the estimate | Important exclusions or caveats |
| --- | --- | --- |
| eBay UK (private) | No final value or order fee | Intended for casual private selling; extra listing fees and Promoted Listings are excluded. |
| eBay UK (business) | Editable category rate, £0.30 order fee (£0.40 for orders over £10), 0.35% regulatory fee | Promoted Listings, Shop subscription and category-specific rates beyond the entered rate are excluded. VAT on fees is optional. |
| Etsy UK | £0.15 listing fee, 6.5% transaction fee, 4% + £0.20 processing fee, 0.48% regulatory fee, optional 15% Offsite Ads fee | Etsy Ads, currency conversion, shipping labels and payment reserves are excluded. VAT on fees is optional. |
| Depop UK | 2.9% + £0.30 payment processing fee, optional 12% Boost fee | Assumes a 0% UK selling fee because published sources conflict. Verify current fees. Shipping label costs are excluded. |
| Vinted UK | No seller fee | Optional Bump and Showcase costs are excluded. Buyer protection fees are not part of the seller payout estimate. |

Rates and platform policies can change. Check the source links in the calculator before relying on an estimate. The displayed rate-update date comes from the deployed `fees.js` file's `Last-Modified` response header; it indicates when that file changed, not independent confirmation that every fee was re-verified.

## Run locally

The project is a static HTML, CSS and JavaScript site. It does not require a build step or application server for the calculator itself.

```sh
npm install
npm run lint
npm test
```

`npm run lint` checks the main HTML and JavaScript. `npm test` runs the Playwright browser suite, including checks against live platform fee pages, so those source checks require internet access. Install the Playwright Chromium browser if it is not already available in your environment:

```sh
npx playwright install chromium
```

The standalone [`tests.html`](https://github.com/cedric433/uk-seller-calculator/blob/main/tests.html) page also contains browser checks that can be opened directly.

## Project map

| File | Purpose |
| --- | --- |
| `index.html` | Main calculator page and inputs |
| `ebay-fee-calculator-uk.html`, `etsy-fee-calculator-uk.html`, `depop-fee-calculator-uk.html`, `vinted-profit-calculator.html` | Platform-specific entry pages |
| `app.js` | Input handling, results, and browser-saved calculations |
| `fees.js` | Platform fee assumptions and calculation logic |
| `styles.css` | Shared page styling |
| `tests.html`, `tests/` | Manual checks and Playwright tests |

## Updating fee assumptions

Update rates and any related inclusions, exclusions, source URLs or caveats in `fees.js`. The calculator shows those assumptions in its source panel. Run `npm run lint` and `npm test`, and review the calculator's results for representative values before publishing the change.

## Disclaimer

Results are estimates, not tax, legal or financial advice. Confirm current fees and account eligibility directly with each selling platform before making a pricing decision.
