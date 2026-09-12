# Pocket Shop — M2 Events & Balance

Deploy-ready static PWA. No npm, backend, database, account, or API key is required.

## What's new from M1-D

### Limited-time events
- **Day 3 — Snack Rush**: 15 seconds, Snack demand x2, Snack sell price x1.2.
- **Day 4 — Random event**: one of Snack Rush, Hot Day, or Busy Hour.
- **Hot Day**: 20 seconds, Juice demand x1.8 and Milk demand x1.4.
- **Busy Hour**: 15 seconds, spawn delay x0.7.
- **Day 5 — Morning Rush**: 20 seconds, Coffee demand x2, Coffee sell reward x1.2, and spawn speed +40% (implemented as delay x 1/1.4).

Events use a short visual banner, then remain visible as a compact event badge with a countdown. Events never open a modal and never intentionally stop the day.

### Event-safe gameplay
- Restock still pauses the entire simulation, including event timers and customer patience.
- Event demand, price, and spawn modifiers are read from active game state only.
- When an event ends, its modifier is removed immediately.
- Busy Hour re-rolls the pending spawn using normal day timing when it ends so spawn acceleration cannot leak beyond the event.
- Reload during RUNNING still returns safely to PREP; active events are not persisted.

### Weighted demand / anti-frustration
The existing source-defined anti-frustration rule remains active: a zero-stock item's demand weight is multiplied by 0.65 instead of being removed completely. Event demand multipliers are applied before that adjustment.

## Source-defined rules vs production pacing decisions

The master specification defines each event's duration and gameplay modifiers, but it does **not** define the exact second when a regular event starts. M2 therefore isolates this as a production pacing rule:

- regular Day 3/4 events start after 25% of the day has elapsed;
- Morning Rush starts at the beginning of Day 5.

The master specification also does not define a Day 4 base demand table, so Day 4 continues to use the Day 3 base demand table, with its selected event providing the variation.

The prior provisional values remain unchanged:
- Bulk baseline patience: 14 seconds;
- Cash reward Day 1–5 ramp: 60 / 75 / 90 / 105 / 120;
- Free Stock: up to two eligible random items receive +2.

These values are intentionally centralized in `js/data.js` for later balancing.

## Existing systems retained

- Day 1–5 progression and targets.
- Juice unlock Day 3, Coffee unlock Day 5.
- Normal / Impatient / Bulk customer types.
- Impatient +2 early-service bonus.
- Bulk x2 request and partial fulfillment.
- Reward choice and failed-day consolation.
- Rack+, Profit+, Patience+ upgrades.
- First-time tutorial.
- Target-reached celebration.
- Local save migration.
- Offline service worker / installable PWA.

## Save migration

Save key is now `pocket-shop-save-v5`.

M1-D `pocket-shop-save-v4` saves migrate automatically. Older M1 and M0 migration paths are also preserved. Active event state is deliberately not saved.

## Update an existing GitHub Pages deployment

1. Extract the ZIP.
2. Replace the existing repository files with the contents of this folder.
3. Commit to `main`.
4. Wait for GitHub Pages deployment to finish.
5. Open the public URL in the phone browser and refresh once.
6. Fully close the installed Pocket Shop PWA and reopen it.

The service-worker cache is now `pocket-shop-m2-v6`.

## QA

See `QA_REPORT.md`. The deploy ZIP is created only after the automated checks in that report pass.

## Milestone status

- M0 Playable Core — complete
- M1 Full Game Loop — complete
- **M2 Events & Balance — complete for the Day 1–5 v1 scope**

Next: **M3 — Final Visual & Feel pass** (animation, expressions, feedback, audio, and final art consistency without changing the locked layout).
