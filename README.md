# Pocket Shop M4.5 — Premium UI/UX Polish

M4.5 is a presentation-focused update on top of the stable M4 PWA build. Gameplay, economy, Day 1–5 progression, rewards, upgrades, events, tutorial, save schema and offline architecture are intentionally unchanged.

## What changed

- Rebuilt the HUD as one integrated control deck instead of three floating cards.
- Reworked scene lighting, grounding shadows and visual depth around racks, cashier and counter.
- Cleaned the original art cutouts so product, rack, character, sign, counter and icon backgrounds are genuinely transparent instead of looking pasted onto the scene.
- Integrated the customer queue visually with the shop floor.
- Rebuilt the three primary actions with consistent custom SVG icons and tactile button treatment.
- Reworked Restock cards with a clear art / price / stock / action hierarchy and a compact stock meter.
- Unified Restock, Upgrade, Settings, Summary and Unlock surfaces into one visual system.
- Reworked reward cards and Day Complete presentation.
- Tightened typography, spacing, borders, shadows, focus states and micro-interactions.
- Kept reduced-motion support and the existing touch-first behavior.
- Updated release identity to **M4.5** and service-worker cache to `pocket-shop-m45-v9`.

## Important compatibility notes

- Save schema remains **v7**, so M4 progress carries over without migration or reset.
- All M4 gameplay values and systems remain intact.
- Existing installed M4 PWAs can update to M4.5 through the release/update system already added in M4.
- Cleaned/optimized game art is about **23.7% smaller** than the M4 asset payload while preserving the same visual identity.

## Update your GitHub Pages deployment

1. Extract this ZIP.
2. Replace the files in the existing Pocket Shop repository with all files from this folder.
3. Commit/push to `main`.
4. Wait for GitHub Pages to finish deploying.
5. Open the installed Pocket Shop PWA.
6. Open **Settings → App Update → Check**.
7. If `Update ready` appears, choose **Refresh**.
8. Confirm the footer says **M4.5**.

If the old version is still displayed after GitHub Pages has deployed, fully close Pocket Shop and its browser tab once, reopen it, then use **App Update → Check** again.

## What to inspect on your phone

The logic build has already passed automated regression checks. Device QA should focus on the things that cannot be faithfully reproduced in this execution environment:

- whether the new HUD feels visually integrated;
- whether racks/items look clean without rectangular cutout backgrounds;
- customer queue spacing on your actual screen;
- bottom-button proportions and thumb comfort;
- Restock/Upgrade/Summary modal scale;
- Android standalone PWA safe areas;
- Web Audio behavior after first tap.

See `QA_REPORT.md` for the exact automated checks completed before the deployment ZIP was created.
