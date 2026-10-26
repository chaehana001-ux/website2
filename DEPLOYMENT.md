# Vercel deployment

Deploy from the repository root, where `KARST/`, `image/` and `vercel.json` live.

- Framework Preset: **Other**
- Root Directory: repository root (leave empty; do not select `KARST`)
- Build Command: `node scripts/build.mjs` (set by `vercel.json`)
- Output Directory: `dist` (set by `vercel.json`)
- No dependency installation or environment variables are required.

The build copies the page, its active stylesheets, JavaScript and images into
`dist/`, adjusting asset paths for the site's root URL. Source files remain in
`KARST/`, so the existing local preview continues to work.

Local build:

```sh
node scripts/build.mjs
python3 -m http.server 8080 --directory dist
```

Open `http://localhost:8080/`. For Vercel CLI deployment, run `vercel` from
the repository root after signing in. Use `vercel --prod` to publish to production.

To repeat the browser audit after building, run `node scripts/check.mjs`.
It uses local Google Chrome on macOS; set `CHROME_BIN` to use a different Chrome
executable. It checks six viewport widths, images, menu keyboard interaction,
product selection, scroll effects, reduced motion and mobile navigation.
External Google Fonts are blocked during the audit to test font fallback too.
Screenshots are saved to the ignored `.content-backup/deployment-audit/` folder.
