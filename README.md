# Pocket Shop — M1-C Rewards + Upgrades

Deploy-ready static PWA. No npm, backend, database, account, or API key is required.

## What's new from M1-B

### Reward system
If the daily target is reached, the End of Day screen now asks the player to choose exactly one reward:

- **Cash** — +60 to +120 coins depending on progression.
- **Free Stock** — gives +2 stock to up to two random unlocked items that are not full.
- **Next-Day Boost** — +10% sell price on the next day only.

If the target is missed, the existing **+30 consolation coins** remains and no reward choice is shown.

### Permanent upgrades
After every completed day, the player chooses one permanent upgrade:

- **Rack+** — +2 max stock per level, max Lv.3.
- **Profit+** — +8% sell price per level, max Lv.5.
- **Patience+** — +1.5 seconds customer patience per level, max Lv.5.

Maxed upgrades can no longer be chosen. The bottom **Upgrade** button is now active during PREP and shows current levels without letting the player buy an upgrade outside the end-of-day progression flow.

### Economy integration
- Profit+ affects actual sell prices and therefore daily revenue/target progress.
- Next-Day Boost stacks multiplicatively with Profit+ and expires after its one applicable day.
- Patience+ affects all customer types, including Day 4's shorter Normal/Impatient baseline.
- Rack+ immediately changes restock capacity and stock UI limits.

### Save migration / anti-duplication
- M1-A/M1-B `v2` saves migrate automatically into the new `v3` save.
- Upgrades and next-day boost are persistent.
- Claiming a reward saves an `UPGRADE` progression marker. If the app is killed after claiming a reward, it resumes at the upgrade choice instead of letting the reward be claimed twice.
- Choosing an upgrade prepares and saves the next day before the visible `Next Day` button is dismissed, preventing duplicate upgrade/reward exploits.

## Source-defined vs provisional rules

The master source defines **Cash** as `+60..+120 according to progression`, but does not define an exact day-by-day table. M1-C uses a simple linear Day 1–5 ramp:

- Day 1: +60
- Day 2: +75
- Day 3: +90
- Day 4: +105
- Day 5+: +120

The source says **Free Stock = +2 for several random items** but does not define how many items. M1-C uses **up to two distinct unlocked non-full items**. Both values are isolated in `js/data.js` for later M2 balancing.

The source also leaves exact upgrade cadence slightly broad (`after certain days/summary`). M1-C follows the supplied progression flow `Day Complete → Get Reward → Choose Upgrade → Next Day`, so one free permanent upgrade choice is offered after each completed day.

## Existing M1-A / M1-B systems retained

- Day 1–5 tuning.
- Juice unlock Day 3.
- Coffee unlock Day 5.
- Normal / Impatient / Bulk customers.
- Impatient early-service +2 coin bonus.
- Bulk ×2 order with partial sale when only one item remains.
- Restock pauses simulation.
- Day 4 item demand still inherits Day 3 because the master source does not provide a Day 4 demand table.
- Bulk baseline patience remains provisional at 14 seconds because the source only says it is more patient.

## Update existing GitHub Pages deployment

1. Extract this ZIP.
2. Replace the files in the existing Pocket Shop repository with the contents of this folder.
3. Commit to `main`.
4. Wait for GitHub Pages to finish deploying.
5. Open the public URL in the phone browser and refresh once.
6. Fully close the installed Pocket Shop PWA and reopen it.

The service-worker cache is now `pocket-shop-m1c-v4`, so the installed PWA should replace M1-B assets after the new worker activates.

## M1-C acceptance checks

- Success day shows exactly three reward choices.
- Failure day shows +30 consolation and no reward cards.
- Cash reward adds the correct progression amount once.
- Free Stock never exceeds current Rack+ capacity.
- Next-Day Boost changes sell prices only on the next day.
- Rack+ raises max stock by 2 per level.
- Profit+ raises sale price by 8% per level with integer rounding.
- Patience+ adds 1.5 seconds per level.
- Maxed upgrades cannot be selected.
- Upgrade levels survive reload.
- Reward cannot be duplicated by reloading after it was claimed.
- Old M1-B save migrates without losing day, coins, stock or unlocks.

Next milestone: **M1-D — first-time tutorial + progression polish**, then M2 Events & Balance.
