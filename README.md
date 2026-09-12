# Pocket Shop — M3 Visual & Feel

This folder is the complete static deploy build for **Pocket Shop M3**.
No npm install, backend, database, API key, or build command is required.

## Deploy / update on GitHub Pages

1. Extract the ZIP.
2. Replace the contents of the same GitHub repository you already use for Pocket Shop.
3. Keep `index.html` in the repository root.
4. Commit to `main`.
5. Wait for GitHub Pages to finish deploying.
6. Open the Pages URL once in the phone browser and refresh it.
7. Fully close the installed PWA, then open Pocket Shop again.

The M3 service worker cache is `pocket-shop-m3-v7`, so the new static files replace the previous M2 cache.

## M3 changes

M3 keeps the existing locked layout and adds feel instead of redesigning it:

- keyed customer rendering so customer DOM is no longer rebuilt every simulation update;
- customer enter / idle / buy / disappointed / leave motion;
- Impatient customer micro-motion and Bulk visual cue retained;
- customer reaction feedback on successful / failed service;
- cashier reaction on a completed sale;
- rack bounce on restock and rack stock feedback on sale;
- coin pop, smoother progress feedback, button press feedback;
- lightweight target confetti;
- event, unlock, reward, upgrade and day-complete feedback;
- procedural offline SFX generated with Web Audio (no remote audio files);
- light procedural cozy background melody;
- persistent Music and Sound FX settings;
- settings button added as a small utility control, not a fourth main gameplay button;
- Settings pauses an active day so the player is not punished for using the menu;
- gameplay simulation now uses a 100 ms fixed step while CSS handles visual animation;
- `prefers-reduced-motion` is respected.

## Audio on phones

Mobile browsers do not allow sound to start before a user interaction. Pocket Shop initializes/resumes audio after the first tap. This is expected browser behavior, not a bug.

## Save compatibility

M2 save key/version is migrated automatically to M3.

M3 persists:
- day;
- coins;
- inventory;
- unlocked items;
- upgrades;
- next-day boost;
- tutorial completion;
- Music / SFX settings.

Active customers, active events, animation state and open modals are intentionally not persisted. Reload during a running day returns safely to PREP for that same day.

## QA

See `QA_REPORT.md`. The deploy ZIP is produced only after the automated game-logic, save migration, UI smoke, audio runtime, syntax, PWA resource, local HTTP and package checks pass.
