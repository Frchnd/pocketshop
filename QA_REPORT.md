# Pocket Shop M4 — QA Report

Build: **M4 PWA Release Build**

## Result

**PASS — package approved for deploy after automated checks.**

The ZIP is not being treated as ready merely because the JavaScript parses. The underlying game/save modules were executed, M3-to-M4 migration and corruption recovery were exercised, PWA release controls were executed against browser API test doubles, all static references were verified, every service-worker core file was fetched over a local HTTP server, and optimized image files were decoded.

## Checks completed

### 1. JavaScript syntax — 8 PASS

`node --check` passed for:
- `js/app.js`
- `js/audio.js`
- `js/data.js`
- `js/game.js`
- `js/release.js`
- `js/save.js`
- `js/ui.js`
- `service-worker.js`

### 2. Static / PWA package validation — 191 PASS

Checks include:
- all local HTML scripts, styles and images exist;
- HTML IDs are unique;
- literal UI/release `#id` selectors resolve to actual elements;
- manifest parses and uses standalone + portrait-primary;
- 192 and 512 `any` icons have exact dimensions;
- 192 and 512 dedicated `maskable` icons have exact dimensions;
- all lossless WebP art decodes successfully;
- all service-worker CORE paths exist;
- M4 cache version and `SKIP_WAITING` message hook exist;
- navigation has cached offline fallback;
- `release.js` is part of the offline core cache;
- CSS brace balance is valid;
- M4 startup/update/offline/install UI hooks are present;
- no removed PNG game-art paths remain referenced;
- art payload is smaller than M3 by more than 15%.

Measured art payload:
- M3 assets: **814,051 bytes**
- M4 assets: **601,612 bytes**
- reduction: **26.1%**

### 3. Game + save executable regression — 30 PASS

Passed scenarios include:
- fresh Day 1 / 80 coins / starting inventory;
- Bread restock exact quantity and cost;
- PREP -> RUNNING transition;
- automatic customer sale mutates stock/revenue/coins;
- M3 save v6 -> M4 save v7 migration;
- migrated coins/day/upgrades/audio settings preserved;
- corrupt v7 JSON is backed up and recovery falls back to valid v6 data;
- RUNNING save normalizes to PREP on reload;
- Day 3 Snack Rush trigger, price modifier, expiry and modifier reset;
- Day 5 Morning Rush immediate trigger and Coffee price modifier;
- reward -> upgrade flow;
- Rack+ advances day and increases capacity;
- Music setting persists;
- Reset removes the current M4 save.

### 4. PWA release-manager executable smoke — 13 PASS

`release.js` was executed with DOM, service-worker and connectivity test doubles. Passed checks include:
- build identity M4;
- install event binding;
- online/offline listeners;
- update-check button binding;
- reset button binding;
- service-worker registration update watcher;
- controller-change watcher;
- startup cover dismissal;
- offline badge + toast behavior;
- reset two-tap arming state;
- update-check status flow.

### 5. Offline core local HTTP — 39 PASS

Every URL listed in service-worker `CORE` returned HTTP 200 from a local static server, including:
- document, manifest and CSS;
- seven JavaScript modules;
- any + maskable PWA icons;
- all shop, rack, product, customer and HUD assets required by the game.

## Automated total before ZIP integrity

**281 checks passed.**

## Browser-driven E2E attempt

A Playwright/Chromium run was attempted against the local server. Chromium launches, but navigation to localhost is blocked by the execution environment with:

`net::ERR_BLOCKED_BY_ADMINISTRATOR`

Therefore this report does **not** claim a real Chromium click-through/offline-navigation test that did not happen. Game behavior was instead executed directly, the PWA release manager was run against browser API test doubles, and the complete service-worker core was fetched over HTTP.

Final phone QA remains necessary for device-specific display scaling, Web Audio unlock behavior, Android install UI, and the standalone PWA shell.

## ZIP integrity

**PASS.** The final deployment archive was tested with `unzip -t`; all archived files passed compressed-data integrity checks.
