# Pocket Shop M4 — PWA Release Build

M4 focuses on release reliability rather than adding new gameplay. The Day 1–5 loop, customer types, upgrades, rewards, events, tutorial, animation and audio from M3 remain intact.

## What changed in M4

- safer PWA update lifecycle: a downloaded update waits until the player chooses **Refresh**;
- in-app **Check for Updates** control;
- install prompt support when the browser exposes it;
- startup/loading cover so the game does not flash partially initialized UI;
- visible offline mode indicator;
- network-first navigation with cached offline fallback;
- cache cleanup when a new service worker activates;
- M3 save v6 -> M4 save v7 migration;
- corrupt-current-save backup and safe fallback to an older valid save when available;
- local **Reset Progress** control with a two-tap guard;
- dedicated `any` and `maskable` PWA icons;
- game art converted from PNG to lossless WebP, reducing core art payload by about 26% without intentionally changing the visual design;
- GitHub Pages `.nojekyll` marker included.

## Updating the existing GitHub Pages deployment

1. Extract this ZIP.
2. Replace the files in the same GitHub repository with **the contents of `pocket-shop-m4-deploy/`**.
3. Commit to the branch used by GitHub Pages.
4. Wait until GitHub Pages finishes deployment.
5. Because the current M3 service worker is cache-first, fully close every open Pocket Shop browser tab and the installed PWA once after deploying M4.
6. Reopen Pocket Shop. The footer should say **M4**.
7. Open Settings -> App Update -> Check. It should report that M4 is up to date.

From M4 onward, when a future service worker update finishes downloading, Pocket Shop can show an **Update ready** banner instead of silently replacing files mid-session.

## Fresh deployment

No build command is required. Deploy this folder as a static site. `index.html` must remain at the repository/site root together with `manifest.webmanifest` and `service-worker.js`.

## Save behavior

- Progress is local to the browser/device.
- M3 save data is migrated automatically.
- Active customers, active events, modal state and mid-sale state are intentionally not persisted.
- Reloading during a running day returns safely to PREP for that same saved day.
- If the current M4 save JSON is corrupted, Pocket Shop backs up the bad raw value and attempts to recover from the newest valid older save.
- Reset Progress removes Pocket Shop local saves from this origin and reloads the game.

## M4 validation

See `QA_REPORT.md`. Automated game/save logic, static package integrity, release lifecycle mocks and all service-worker core URLs passed. Real Chromium navigation could not be executed in the build container because localhost navigation is blocked by administrator policy, so final device-specific PWA shell/audio/visual behavior should still be checked on the actual Android phone after deployment.
