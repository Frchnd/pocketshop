# Pocket Shop — M1-A Day 1–5 Progression Build

Static PWA. No npm, backend, account, database, or API key required.

## What changed from M0

- Day 1–5 duration, target, spawn timing, queue size and demand progression.
- Day 3 unlock: Juice.
- Day 5 unlock: Coffee.
- New-item unlock popup.
- Restock only shows unlocked products.
- Drinks rack visually gains Juice and Coffee as they unlock.
- Day 3+ supports 3 visible customers.
- Existing M0 local save is automatically migrated.
- New service-worker cache version forces the updated build to replace M0 assets.

## Current milestone boundary

M1-A intentionally still uses **Normal customers only**. Impatient/Bulk are M1-B. Upgrades and full reward choices are M1-C. Events are M2.

The source specification does not provide a Day 4 demand table. This build transparently inherits Day 3 demand weights for Day 4 as a temporary balancing fallback. Day 6+ also temporarily reuse Day 5 tuning until later progression is authored.

## Deploy to GitHub Pages

1. Upload the **contents of this folder** to the root of your existing Pocket Shop repository.
2. Replace the old files when GitHub asks.
3. Commit the changes.
4. GitHub Pages will redeploy automatically.
5. Open the game once while online.
6. If the installed PWA still shows the old M0 build, fully close it and reopen. The new service worker uses cache `pocket-shop-m1a-v2` and will replace the old cache.

## Day configuration

- Day 1: 60 sec, target 100, 7–9 sec spawn, max 2.
- Day 2: 70 sec, target 160, 6–8 sec spawn, max 2.
- Day 3: 80 sec, target 240, 5–7 sec spawn, max 3, Juice unlock.
- Day 4: 90 sec, target 340, 4.5–6.5 sec spawn, max 3.
- Day 5: 100 sec, target 470, 4–6 sec spawn, max 3, Coffee unlock.

## Economy source-of-truth

- Bread: buy 6 / sell 10
- Snack: buy 7 / sell 12
- Milk: buy 9 / sell 15
- Juice: buy 10 / sell 17
- Coffee: buy 12 / sell 21

## Testing checklist

- Existing M0 save opens without reset.
- Day 2 target/duration changes.
- Day 3 queue allows 3 customers and Juice unlock popup appears.
- Juice can be restocked and requested.
- Day 5 Coffee unlock popup appears.
- Coffee can be restocked and requested.
- Reload during RUNNING returns safely to PREP on the same day.
- Offline reopen works after one online load.
