# Pocket Shop M3 — QA Report

Build: **M3 Visual & Feel**

## Result

**PASS — deploy package approved after automated checks.**

The build was not approved merely because files existed or JavaScript parsed. Game modules were executed, progression/event regressions were checked, the new UI state renderer was exercised with a DOM test double, the Web Audio module was executed against an AudioContext test double, and all service-worker core resources were served over local HTTP.

## Checks executed

### 1. Game logic & save regression — 37 assertions

Passed checks include:
- fresh Day 1 state and starting inventory/coins;
- exact Bread restock quantity/cost;
- PREP -> RUNNING transition;
- customer spawn and automatic sale;
- revenue, stock and coin mutation;
- persistent Music/SFX defaults and settings mutation;
- M2 v5 -> M3 v6 save migration;
- migration preserves day, coins and upgrades;
- settings are injected safely for older saves;
- running-day saves resume at PREP;
- runtime customers/events are not persisted;
- Day 3 Snack Rush planning, trigger, price effect, expiry and reset;
- Day 5 Morning Rush immediate trigger and Coffee reward modifier;
- successful reward -> upgrade flow;
- Rack+ upgrade advances progression and capacity;
- audio settings survive day transitions.

### 2. UI state smoke test — 10 assertions

Passed checks include:
- M3 UI module loads with required DOM references;
- customer node creation;
- stable keyed customer ID;
- event badge rendering;
- customer arrival/event sound hooks;
- the same customer DOM node survives a WAITING -> BUYING update;
- customer state CSS class updates correctly;
- sale / target sound hooks fire;
- target confetti is generated;
- rack sale visual feedback is triggered.

### 3. Audio runtime smoke — 5 assertions

The Web Audio module was executed with a browser API test double and passed:
- module initialization;
- one background-music scheduler;
- multiple SFX calls without runtime exceptions;
- disabled Music/SFX mode without runtime exceptions;
- clean audio disposal.

### 4. Package / static validation — 178 checks

Passed checks include:
- `node --check` for data.js, save.js, game.js, audio.js, ui.js, app.js and service-worker.js;
- manifest JSON parse;
- standalone display, portrait orientation, start URL and scope;
- exact 192x192 and 512x512 PWA icon dimensions;
- required M3 HTML IDs;
- every local HTML script/style/image reference resolves;
- every literal UI `#id` reference resolves to an element in index.html;
- all data image assets exist;
- service-worker M3 cache name validated;
- audio.js is part of the offline core cache;
- all service-worker core paths exist;
- CSS brace balance;
- M3 settings/customer/rack/confetti/cashier animation rules present;
- expected M3 UI/game feature hooks present;
- all required M3 SFX definitions present.

### 5. Offline-core local HTTP check — 35 resources

Every item in the service-worker `CORE` list returned HTTP 200 from a local static server, including:
- index / manifest / CSS;
- all six JavaScript modules;
- PWA icons;
- shop/rack/item/customer/UI art used by the build.

## Automated total before ZIP

**265 assertions/checks passed.**

## Browser-driven E2E limitation

A real headless Chromium run was attempted. Chromium in this execution environment does not complete headless initialization/navigation because its Linux DBus/browser process setup hangs, so click-driven Chromium E2E could not be used here.

This limitation is not hidden: browser E2E is the one check that could not be completed in the container. To compensate, game logic was executed directly, the UI was run against a DOM test double, audio was run against an AudioContext test double, and the complete offline core was served/fetched over local HTTP. The user should still do the final real-device visual/audio check after GitHub Pages deploy, because only the actual phone can verify device-specific browser audio, display scaling and PWA shell behavior.
