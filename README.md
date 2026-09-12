# Pocket Shop — M1-D Tutorial + Progression Polish

Deploy-ready static PWA. No npm, backend, database, account, or API key is required.

## What's new from M1-C

### First-time tutorial
A first-time onboarding sequence now follows the master specification's four-step flow:

1. **Stock your shelves.** — Restock is highlighted and the player buys one item.
2. **Open your shop.** — Open Shop becomes the focus.
3. **Customers want this.** — the customer lane and request bubble are explained.
4. **Earn coins and reach the target.** — the daily progress bar becomes the focus after the first sale.

The tutorial is kept short, can be skipped, and is saved so it does not repeat on later sessions.

### Progression polish
- Opening a day now shows a short day banner using the source-defined progression labels:
  - Day 1 — LEARN
  - Day 2 — MANAGE
  - Day 3 — FIRST RUSH
  - Day 4 — STRATEGY
  - Day 5 — FIRST MILESTONE
- Reaching the daily target now triggers a compact `Target Reached!` celebration while the day continues running.
- PREP lane copy includes the current progression label.
- The first tutorial customer waits slightly longer before its automatic sale so the request bubble can actually be read. Outside onboarding, automatic sale timing remains within the source-defined 0.7–1.2 second window.

### Save migration
- Save key is now `pocket-shop-save-v4`.
- M1-C `v3`, M1-A/M1-B `v2`, and M0 `v1` saves migrate automatically.
- Existing M1-C players beyond Day 1 are treated as tutorial-complete so onboarding does not interrupt established progression.
- Day 1 M1-C saves may receive the tutorial once so the new onboarding can still be tested.

## Existing systems retained

- Day 1–5 tuning.
- Juice unlock Day 3.
- Coffee unlock Day 5.
- Normal / Impatient / Bulk customers.
- Impatient early-service +2 coin bonus.
- Bulk ×2 request with partial sale if only one unit remains.
- Reward choice after successful days.
- +30 consolation coins on failed target.
- Rack+, Profit+, Patience+ permanent upgrades.
- Next-day +10% sell boost reward.
- Restock pauses the simulation.
- Local save and offline PWA support.

## Source-defined vs provisional rules still unchanged

The master specification does not define an exact Day 4 demand table, so Day 4 continues to inherit Day 3 demand until M2 balancing.

Bulk customers are defined as more patient but no exact baseline is provided, so M1-D retains the provisional 14-second Bulk baseline from M1-B/M1-C.

The exact daily Cash reward ramp and number of Free Stock targets also remain the M1-C provisional balancing values until M2.

## Update an existing GitHub Pages deployment

1. Extract this ZIP.
2. Replace the existing Pocket Shop repository files with the contents of this folder.
3. Commit to `main`.
4. Wait for GitHub Pages deployment to finish.
5. Open the public URL in the phone browser and refresh once.
6. Fully close the installed Pocket Shop PWA and reopen it.

The service-worker cache is now `pocket-shop-m1d-v5`, so the installed PWA should replace M1-C assets after the new worker activates.

## How to test the first-time tutorial again

Because tutorial completion is intentionally persistent, an existing progressed save may not show it. For a clean onboarding test, clear Pocket Shop site data in the browser / uninstall the PWA and clear its site storage, then reopen the site. This resets local game progress as well.

## M1-D acceptance checks

- Fresh Day 1 starts with tutorial Step 1 and highlights Restock.
- Open Shop cannot be used until the first tutorial restock action is completed.
- A successful restock advances onboarding to Open Shop.
- Opening the shop advances onboarding to the customer request explanation.
- First tutorial customer request remains visible long enough to read.
- First sale advances onboarding to the target/progress explanation.
- Tutorial completion persists after reload.
- Skip permanently completes onboarding.
- Day-start banner uses the correct Day 1–5 progression label.
- Target Reached celebration fires only once per day when revenue crosses the target.
- Existing M1-C gameplay systems remain functional.
- JavaScript syntax, core file references, save migration, and tutorial persistence checks pass.

## Milestone status

**Milestone 1 — FULL GAME LOOP: complete.**

Next milestone: **M2 — Events & Balance**

Planned M2 systems from the master specification:
- Snack Rush
- Hot Day
- Busy Hour
- Morning Rush
- event demand / price / spawn modifiers
- weighted-demand tuning
- anti-frustration tuning
- economy / reward / difficulty balancing
