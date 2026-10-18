---
target: MarginHatch homepage
total_score: 28
max_score: 40
na_heuristics:
p0_count: 0
p1_count: 2
timestamp: 2026-10-18T16-21-57Z
slug: marginhatch-com
---
Method: dual-agent (A: 6b0004ec-74a5-4cf7-8bb7-6cd554f5dbeb · B: e168ca81-e1f5-4112-955c-b2d9559865bc)

## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|---|---:|---|
| 1 | Visibility of System Status | 3 | Live results are clear; preset and save actions have little confirmation. |
| 2 | Match System / Real World | 3 | UK seller language fits; fee assumptions need to be visible where they affect choices. |
| 3 | User Control and Freedom | 3 | Inputs, reset, saved-history controls are available. |
| 4 | Consistency and Standards | 3 | Familiar controls, but the table and cards repeat the results. |
| 5 | Error Prevention | 2 | Some input checks exist; eligibility and fee uncertainty can still mislead. |
| 6 | Recognition Rather Than Recall | 3 | Labeled fields and breakdowns help; fee switches need contextual guidance. |
| 7 | Flexibility and Efficiency | 4 | Presets, live recalculation, and saved scenarios support repeat use. |
| 8 | Aesthetic and Minimalist Design | 2 | Readable, but duplicated results and generic visual styling dilute hierarchy. |
| 9 | Help users Recognize, Diagnose, and Recover from Errors | 2 | Warnings do not identify which field needs correction. |
| 10 | Help and Documentation | 3 | Useful source and inclusion/exclusion details, though not contextual enough. |
| **Total** | | **28/40** | **Good — solid foundation; address the weak points.** |

## Design Specificity Verdict

**LLM assessment:** The UK marketplace focus, pounds, platform fee breakdowns, and seller-specific assumptions give the calculator real product relevance. The visual language itself is less authored: system typography, white cards on pale grey, and a single green accent could belong to many calculator products. Make the visual hierarchy feel like a trusted selling decision tool, not a generic form.

**Deterministic scan:** The target is a live URL, so the file-scoped CLI detector was not run. The independent source/markup review found that the responsive CSS stacks the calculator at widths below 821px, while the results markup contains both a comparison table and platform cards. No separate automated detector count is available.

**Browser evidence and overlays:** I inspected the rendered page at 615×867, confirmed the one-column layout, and clicked “High-value”; the item values and calculated results updated. Both the comparison table and detailed cards appear in the same narrow-screen results flow. The detector overlay injection was attempted, but the browser could not load the local `detect.js`; no reliable user-visible overlay is available.

## Overall Impression

A useful, fast calculator with practical seller-focused features. The biggest opportunity is to turn it into a more confident decision experience: remove repeated results, surface caveats beside the numbers, and give the product a more intentional visual identity.

## What's Working

- The calculator immediately compares five UK selling options using take-home profit, margin, fees, and a target-price estimate.
- Presets, live recalculation, and browser-local saved calculations make repeat scenarios quick.
- Sources and included/excluded fee assumptions are disclosed rather than hidden entirely; the clean light surface is easy to scan.

## Priority Issues

1. **[P1] Repeated results obscure the decision.** The comparison table and platform cards both present the same platform outcomes; at a 615px viewport, the table is followed by the full card list, extending an already tall page. **Why it matters:** Users must scan duplicate information to answer one question, and the strongest result loses focus. **Fix:** Use one responsive comparison view; make each row/card expandable for its detailed fee breakdown instead of rendering a second complete results set. **Suggested command:** `/impeccable layout`, `/impeccable adapt`.
2. **[P1] Important fee caveats are separated from the affected results.** The assumptions disclose that the Depop selling-fee source conflicts and 0% is assumed, that Vinted buyer fees are excluded, and that eBay private rates are for casual—not trading—accounts. These qualifications are below the comparison. **Why it matters:** The apparent winner may look more certain or eligible than it is. **Fix:** Add concise “assumption”/“verify fee” and eligibility notes beside the affected platform result, with a direct source link. **Suggested command:** `/impeccable clarify`, `/impeccable harden`.
3. **[P2] First-time users must interpret several controls without enough guidance.** Seven numeric fields, four scenario presets, and three fee switches are visible together; the ad switches do not say when to turn them on, and preset labels do not preview which values they change. **Why it matters:** Sellers may model the wrong fee or mistake a preset for a recommendation. **Fix:** Add one-line guidance at the switch, show a short “changes these values” preview for presets, and progressively disclose advanced fee options without hiding core costs. **Suggested command:** `/impeccable clarify`, `/impeccable onboard`.
4. **[P2] Mobile users have to move through the full input panel before reaching the result.** At narrow widths, the desktop sticky input panel becomes a long first column, then the duplicated table/cards follow. **Why it matters:** Changing a value and checking its effect requires substantial scrolling. **Fix:** Keep a compact, non-obscuring result summary or “View comparison” jump control available on mobile; ensure keyboard focus and the on-screen keyboard are not blocked. **Suggested command:** `/impeccable adapt`, `/impeccable layout`.
5. **[P3] The visual system is clean but interchangeable.** The neutral system font, repeated white panels, and lone green accent create little visual distinction between inputs, conclusions, and supporting detail. **Why it matters:** This is a money decision tool; stronger craft and hierarchy would help the output feel deliberate and trustworthy. **Fix:** Define a restrained typography and spacing scale, reserve green for positive/result emphasis, and give the profit comparison a distinctive but quiet visual anchor. Keep it data-led rather than adding decorative illustration. **Suggested command:** `/impeccable typeset`, `/impeccable colorize`, `/impeccable polish`.

## Persona Red Flags

- **Jordan (first-time seller):** Sees “Add 20% VAT … (on if you’re not VAT-registered)” plus ad-fee switches without enough inline explanation; may not know which assumptions apply. The private eBay winner is caveated below the results, so the recommendation can feel unsafe to act on.
- **Sam (screen-reader/keyboard user):** The full results region is `aria-live="polite"` while its table and cards are regenerated on every input; test whether changing one number causes an overly verbose announcement. The switches are custom-styled, so verify checked state and focus announcement with actual assistive technology.
- **Alex (repeat seller):** Presets and saved calculations are useful, but each result comparison is long because table and card views repeat; there is no compact comparison mode for quickly checking multiple scenarios.

## Minor Observations

- “Rates updated” correctly includes a date, but fee volatility makes a direct source link or a short verification cue useful at the point of comparison.
- The source disclosures are collapsible and the main input labels are associated with their fields; preserve those strengths while improving contextual guidance.
- Browser inspection covered the rendered 615×867 view and one preset interaction only; keyboard, screen-reader, and other viewport behaviour were not fully tested.

## Questions to Consider

- Should MarginHatch remain a quiet, utility-first calculator, or should it feel more distinctive and confidence-building while staying data-focused?
- What deserves first priority: trustworthy fee caveats, faster mobile comparison, or the visual identity?
