# Pocket Shop M4.5 — QA Report

Build: **M4.5 Premium UI/UX Polish**

## Result

**PASS — deployment package approved after automated checks.**

M4.5 changes presentation heavily but intentionally leaves gameplay/save rules intact. Before packaging, the build was syntax-checked, its complete static/PWA package was validated, game and save modules were executed, the updated UI module was run against DOM test doubles, the release manager and audio module were executed, every offline-core resource was served over local HTTP, and every WebP asset was decoded. The new transparent-asset pass was also explicitly verified.

## 1. JavaScript syntax — 8 PASS

`node --check` passed for:

- `js/app.js`
- `js/audio.js`
- `js/data.js`
- `js/game.js`
- `js/release.js`
- `js/save.js`
- `js/ui.js`
- `service-worker.js`

## 2. Static / PWA / visual package validation — 146 PASS

Checks include:

- unique HTML IDs;
- all local scripts, styles and HTML image references exist;
- custom SVG action icons are present for Restock / Upgrade / Open Shop;
- premium HUD / summary / action hooks exist;
- manifest parses as standalone portrait PWA;
- PWA icon files exist and match declared dimensions;
- CSS parses without top-level syntax errors;
- M4.5 premium design-system selectors exist;
- all 24 WebP assets decode successfully;
- all non-background art assets contain real transparent pixels after cleanup;
- all service-worker `CORE` paths exist;
- cache identity is `pocket-shop-m45-v9`;
- release manager and stylesheet are included in offline core;
- `SKIP_WAITING` update flow remains present;
- M4.5 version labels are consistent.

### Asset integration improvement

M4 asset payload: **601,612 bytes**  
M4.5 asset payload: **458,828 bytes**  
Reduction: **23.7%**

More importantly, racks, products, characters, counter, sign, awning and UI icons were cleaned from their original light rectangular crop backgrounds. This directly targets the previous pasted-on visual appearance.

## 3. Game + save executable regression — 61 PASS

Executed scenarios include:

- fresh Day 1 state, starting coins, target, inventory and capacity;
- Bread restock exact quantity/cost and full-rack rejection;
- PREP → RUNNING transition and duplicate-open rejection;
- automatic sale changes stock, revenue and coins;
- gameplay pause freezes time;
- Profit+ sell-price calculation;
- M3 save v6 → current v7 migration;
- migrated day, coin, Rack+, capacity and audio settings preservation;
- corrupt v7 backup and fallback recovery from valid v6;
- RUNNING save reload safety back to PREP;
- Day 3 Snack Rush trigger, price modifier, expiry and reset;
- Day 5 Morning Rush and Coffee price modifier;
- cash reward → upgrade flow;
- Rack+ capacity change and next-day progression;
- complete Day 1 → Day 5 progression smoke;
- Juice unlock on Day 3;
- Coffee unlock on Day 5;
- Day 5 target/duration configuration intact;
- Music preference persistence;
- reset removes current and legacy saves.

## 4. UI module executable smoke — 20 PASS

`ui.js` was executed against DOM and game-state test doubles. Checks include:

- UI module export and event binding;
- coin / day / target / progress render;
- bakery and drinks stock render;
- empty customer-lane hint render;
- Restock action binding and overlay opening;
- new M4.5 Restock card markup (`restock-art`, price chip, stock meter, CTA);
- summary opening and success text;
- reward section visibility;
- new premium reward-art and stock-box markup.

## 5. PWA release-manager executable smoke — 19 PASS

`release.js` was executed against service-worker/connectivity/DOM test doubles. Checks include:

- build identity **M4.5**;
- service-worker registration and scope;
- install-event listener;
- online/offline listeners;
- Check Update / Reset / Install / Refresh / Later bindings;
- startup-cover dismissal;
- offline status badge and toast;
- two-tap reset protection;
- explicit service-worker update check.

## 6. Audio runtime smoke — 5 PASS

`audio.js` was executed with an `AudioContext` test double. Checks include:

- module export;
- first-gesture music start;
- sale SFX execution;
- disabled-audio safety;
- disposal cleanup.

## 7. Offline core local HTTP — 39 PASS

Every URL listed in service-worker `CORE` returned HTTP 200 from a local static server, including the document, manifest, CSS, JavaScript modules, PWA icons, shop art, racks, items, customers and HUD assets.

## Automated total before ZIP integrity

**298 checks passed.**

## Visual integration inspection

A local composite of the cleaned shop assets was generated and inspected to verify that the shop sign, racks, counter, cashier, register and cat now sit on the same scene without the light rectangular crop backgrounds that previously made the game look assembled from separate cards.

## Browser-driven E2E attempt

A real Playwright run using system Chromium was attempted against the M4.5 local HTTP build. Chromium launches, but navigation to localhost is blocked by this execution environment:

`net::ERR_BLOCKED_BY_ADMINISTRATOR`

Therefore this report does **not** claim a browser click-through test that did not occur. Functional behavior was instead executed through the game/save modules, UI test doubles, PWA release-manager test doubles, audio test doubles and local HTTP resource validation.

Final phone QA remains necessary for actual Android rendering, safe-area behavior, touch feel, installed-PWA shell and Web Audio unlock behavior.

## ZIP integrity

The ZIP is tested after creation with `unzip -t`. It is only handed off if that integrity test passes.
