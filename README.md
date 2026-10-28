# CGC Census Data Visualization

Bubble charts and tables of CGC census data for key Golden Age and Silver Age comics, in one Vite + TypeScript + D3 app. Choose an era with the selector or the URL: `?era=golden-age` or `?era=silver-age`.

Datasets live in `public/data/<era>.json` (schema: `EraDataset` in `src/types.ts`, dates are ISO `YYYY-MM-DD`) and covers in `public/img/<era>/<id>.jpg`. Averages, populations, ranks and values are precomputed census figures, not derived from raw grade distributions. The era's `chartMetric` picks the plotted grade (`top50Average` falls back to `average` when unavailable).

## Scripts

- `npm ci` – install dependencies
- `npm run dev` – local dev server
- `npm run typecheck` – strict `tsc --noEmit`
- `npm test` – Vitest
- `npm run build` – typecheck + production build into `dist/`
- `npm run preview` – serve the build

## GitHub Pages

In the repository settings set **Pages → Source** to **GitHub Actions**. `.github/workflows/deploy.yml` (the only active root workflow) runs `npm ci`, `tsc --noEmit`, tests and `vite build` on Node 22, then deploys `dist/`. The build uses a relative base by default; the workflow passes the Pages base path (`BASE_PATH` env or `--base` flag also work locally), so data and image URLs work on project subpaths.

The original `cgc-census-data-visualization/` and `cgc-census-data-visualization-silver-age/` folders are kept for reference and are no longer deployed.
