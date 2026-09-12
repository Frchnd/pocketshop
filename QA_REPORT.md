# Pocket Shop M2 — QA Report

Build: M2 Events & Balance

## Result

**PASS — deploy package approved after automated checks.**

## Checks executed

### JavaScript / package integrity
- `node --check` passes for app.js, data.js, save.js, game.js, ui.js, service-worker.js.
- manifest JSON parses successfully.
- all local file references used by HTML/data/service-worker resolve.
- all UI IDs referenced by `ui.js` exist in `index.html`.
- all service-worker CORE resources return HTTP 200 from a local static server.
- PWA icons are exactly 192×192 and 512×512.
- manifest standalone/orientation/start_url/scope fields validated.

### M2 game-logic assertions
26 assertions passed, covering:
- base load, restock, shop open, customer spawn;
- Day 3 Snack Rush trigger;
- Snack Rush demand/price lifecycle;
- Restock pausing event timer;
- event timer resume;
- modifier reset after event;
- Busy Hour spawn acceleration and no modifier leak;
- Hot Day weighted demand uplift;
- Day 5 Morning Rush immediate start;
- Morning Rush Coffee +20% sell reward;
- Morning Rush Coffee demand uplift;
- summary/reward/upgrade regression;
- M1-D v4 → M2 v5 save migration;
- zero-stock items remain requestable with reduced weight.

### M1 regression assertions
25 assertions passed, covering:
- Day 1/2 no event regression;
- Impatient customer +2 early-service bonus;
- Bulk customer x2 stock consumption;
- failed-day +30 consolation;
- failure → upgrade flow;
- successful Day 1→5 progression;
- reward and upgrade transitions;
- Juice unlock on Day 3;
- Coffee unlock on Day 5.

### UI render smoke test
5 UI assertions passed with a DOM test double:
- active-event badge renders;
- event name renders;
- event countdown renders;
- full event banner renders at event start;
- badge hides after event ends.

## Total

69 automated assertions/checks passed across syntax, package integrity, game logic, progression regression, event systems, save migration, UI render smoke, and PWA resource validation.

## Environment limitation

A headless Chromium end-to-end navigation test was attempted, but this execution environment blocks Chromium navigation with `ERR_BLOCKED_BY_ADMINISTRATOR`, including localhost/file/data URLs. Therefore browser-driven click E2E could not be executed here. The build was not approved solely on static syntax: actual game-state modules were executed in Node VM tests, UI rendering was smoke-tested, and every service-worker core resource was served and fetched successfully through a local HTTP server.
