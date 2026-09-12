# Pocket Shop — M0 Deploy Build

Static PWA. No npm, backend, API key, or paid service required.

## What is implemented
- Mobile portrait UI
- Starting coin 80
- Day 1 starting stock: Bread 4, Snack 4, Milk 3
- Day 1 target: 100 revenue
- Day length: 60 seconds
- Restock +2, including partial refill when only one slot is free
- Normal customers only, max 2 visible
- Weighted item requests
- Empty-stock anti-frustration weight reduction
- 12s customer patience
- Automatic sale after a short wait when stock exists
- Coin, stock and target progress updates
- End-of-day summary
- +30 consolation coins if target is missed
- Local save for coins, inventory and day
- Installable PWA + offline cache

## Deploy on GitHub Pages
1. Create a new GitHub repository.
2. Upload **the contents of this folder** to the repository root.
3. Open repository `Settings` → `Pages`.
4. Under `Build and deployment`, select `Deploy from a branch`.
5. Choose branch `main`, folder `/ (root)`, then Save.
6. Open the Pages URL once while online. The PWA can then cache its core files for offline use.

## Deploy on Netlify / Cloudflare Pages
Upload the folder as a static site. There is no build command and the publish directory is the project root.

## Local testing
Service workers need HTTP/HTTPS, not `file://`.
Run any static server, e.g. Python:

```bash
python -m http.server 8080
```

Then open `http://localhost:8080`.

## Important
This is **M0**, not the final v1.0 game. The visual language is based on the locked Pocket Shop reference and its generated M0 asset sheet, but later milestones still need Day 2–5 configs, Impatient/Bulk customers, upgrades, rewards, events, final animation/audio and balance pass.
