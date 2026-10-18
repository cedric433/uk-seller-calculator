/* Fee rates and calculation logic. Update RATES here when platforms change fees. */
var CONFIG = {
  updated: "18 October 2026",
  vat: 0.20,
  platforms: [
    {k:"ebayp", name:"eBay UK (private)", tag:"Casual sellers", src:"https://www.ebay.co.uk/help/selling/selling-fees/Fees-business-sellers?id=4809", srcName:"eBay UK fees page",
      incl:"No final value or order fee for private sellers.", excl:"Extra listing fees after the monthly free allowance, Promoted Listings."},
    {k:"ebayb", name:"eBay UK (business)", tag:"Trader account", src:"https://www.ebay.co.uk/help/selling/selling-fees/Fees-business-sellers?id=4809", srcName:"eBay UK fees page",
      incl:"Category % on item + postage, £0.30 order fee (£0.40 over £10), 0.35% regulatory fee, optional 20% VAT on fees.", excl:"Promoted Listings, Shop subscription, banded category rates (enter your own %)."},
    {k:"etsy", name:"Etsy UK", tag:"Handmade, vintage, supplies", src:"https://www.etsy.com/legal/fees", srcName:"Etsy fees policy",
      incl:"£0.15 listing, 6.5% transaction, 4% + £0.20 processing, 0.48% regulatory fee (from 22 June 2026), optional 15% Offsite Ads, optional 20% VAT on fees.", excl:"Etsy Ads, currency conversion, shipping labels, payment reserves."},
    {k:"depop", name:"Depop UK", tag:"Fashion resale", src:"https://depophelp.zendesk.com", srcName:"Depop Help Centre",
      incl:"2.9% + £0.30 payment processing, optional 12% boost fee.", excl:"Shipping label costs. Sources conflict on the UK selling fee; 0% is assumed, so verify."},
    {k:"vinted", name:"Vinted UK", tag:"Zero seller fees", src:"https://www.vinted.co.uk/pricelist", srcName:"Vinted price list (updated 8 Oct 2026)",
      incl:"No seller fee on sales.", excl:"Optional paid Bump and Showcase fees (price varies), and shipping. Buyers pay the Vinted fee (about 3% to 8% + £0.30 to £0.80), which is not shown."}
  ]
};
function clean(v, max) { v = parseFloat(v); if (!isFinite(v) || v < 0) return 0; return Math.min(v, max || 100000); }
function fees(k, price, o) {
  var base = price + o.ship, L = [], sum = 0;
  function add(l, v) { L.push([l, v]); sum += v; }
  if (k === "ebayb") { add("Final value fee (" + o.cat + "%)", base * o.cat / 100); add("Per-order fee", base > 10 ? 0.40 : 0.30); add("Regulatory fee (0.35%)", base * 0.0035); }
  else if (k === "etsy") { add("Listing fee", 0.15); add("Transaction fee (6.5%)", base * 0.065); add("Processing (4% + £0.20)", base * 0.04 + 0.20); add("Regulatory fee (0.48%)", base * 0.0048); if (o.ads) add("Offsite Ads (15%)", base * 0.15); }
  else if (k === "depop") { add("Processing (2.9% + £0.30)", base * 0.029 + 0.30); if (o.boost) add("Boost fee (12%)", price * 0.12); }
  if (o.vat && (k === "ebayb" || k === "etsy")) add("VAT on fees (20%)", sum * CONFIG.vat);
  if (!L.length) L.push(["Platform fees", 0]);
  return {L: L, total: sum, base: base};
}
function profit(k, price, o) { var f = fees(k, price, o); return f.base - f.total - o.cost - o.shipCost - o.other; }
function need(k, o) { /* price needed for target profit, rounded up to the next penny */
  var lo = 0, hi = 5000, i, m;
  if (profit(k, hi, o) < o.target) return null;
  for (i = 0; i < 60; i++) { m = (lo + hi) / 2; if (profit(k, m, o) < o.target) lo = m; else hi = m; }
  return Math.ceil(hi * 100) / 100;
}
