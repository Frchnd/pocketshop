# Pocket Shop — M1-B Customer Types

Deploy-ready static PWA. No npm, backend, account, database, or API key is required.

## What's new from M1-A

- Normal / Impatient / Bulk customers are now functional.
- Day-based type distribution follows the master specification:
  - Day 1: Normal 100%
  - Day 2: Normal 85%, Impatient 15%
  - Day 3: Normal 70%, Impatient 20%, Bulk 10%
  - Day 4: Normal 60%, Impatient 25%, Bulk 15%
  - Day 5: Normal 55%, Impatient 25%, Bulk 20%
- Impatient customers use shorter patience (8 sec baseline; 7 sec on Day 4).
- Serving an Impatient customer while above 50% patience grants +2 bonus coins.
- Bulk customers request 2 of one item, but buy 1 if only 1 remains.
- Bulk request bubbles show ×2.
- Type-specific visual cues are shown without changing the locked main layout.
- Service-worker cache bumped to M1-B v3 so installed PWAs receive the update.

## Provisional tuning

The source says Bulk customers are "more patient" but does not provide an exact patience duration. M1-B uses **14 seconds** as a temporary value isolated in `js/data.js` so it can be tuned later without touching the gameplay system.

The source does not define a Day 4 item-demand table, so Day 4 still inherits Day 3 item-demand weights until the balancing milestone.

## Existing progression retained

- Day 1–5 duration, target and spawn tuning.
- Juice unlocks on Day 3.
- Coffee unlocks on Day 5.
- M0/M1-A local save remains compatible because the persistent save schema did not change.

## Update an existing GitHub Pages deployment

1. Extract this ZIP.
2. Open the same GitHub repository used for Pocket Shop.
3. Replace the repository contents with the files inside this folder.
4. Commit the changes to `main`.
5. Wait for GitHub Pages to deploy.
6. Open the public URL once in the phone browser and refresh it.
7. Fully close and reopen the installed Pocket Shop PWA.

If an old build still appears, refresh the public URL one more time so the new service worker can activate.

## M1-B acceptance checks

- Day 1 only spawns Normal customers.
- Day 2 can spawn an Impatient customer.
- Impatient patience is visibly shorter and can award +2 bonus coins.
- Day 3+ can spawn Bulk customers.
- Bulk shows `×2` and removes 2 stock when 2 are available.
- Bulk removes only 1 stock if only 1 remains.
- Customer queue remains capped at 2 on Day 1–2 and 3 on Day 3+.
- Restock pauses simulation.
- Save/reload still returns safely to PREP.

Next milestone: **M1-C — rewards + Rack+ / Profit+ / Patience+ upgrades.**
