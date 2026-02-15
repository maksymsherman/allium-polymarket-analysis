# Plan: Live Data Dashboard + Allium Attribution

## Context
The dashboard currently hardcodes all numbers in `data.ts`. The user wants numbers to come from actual query results, proper Allium citation, and report findings integrated into the dashboard.

## Approach: Python refresh script generates JSON, Next.js imports at build time

### 1. Create data refresh script (`refresh_dashboard_data.py`)
- Imports `run_sql_file` from existing `run_query.py`
- Runs queries 01, 02, 03 sequentially with `sleep(2)` between
- Transforms raw rows into dashboard-ready shapes (bucket label → midpoint mapping, category pivoting, aggregate stats)
- Writes JSON files to `dashboard/app/generated/`:
  - `calibration.json` — `{ binary: CalibrationRow[], multi: CalibrationRow[] }`
  - `categories.json` — `CategoryRow[]`
  - `quarters.json` — `QuarterRow[]` (new — enables temporal trend chart)
  - `sub_daily.json` — `SubDailyRow[]`
  - `market_structure.json` — token/question counts, tail %, avg bias
  - `_metadata.json` — `{ generated_at: ISO timestamp }`

### 2. Update `dashboard/app/data.ts`
- Replace hardcoded arrays with JSON imports from `generated/`
- Keep same export names so all chart components work unchanged
- Add new `QuarterRow` and `SubDailyRow` interfaces

### 3. Update `dashboard/app/page.tsx`
- Compute stat card values from imported data (weighted avg bias) instead of hardcoded `"+1.9 pp"`
- Add "Last refreshed" timestamp from `_metadata.json` in footer
- Add **Allium attribution**: "Powered by Allium" with link to allium.so in footer
- Wire in new QuarterlyTrendChart

### 4. New component: `QuarterlyTrendChart.tsx`
- Line chart showing competitive accuracy over time (quarterly)
- Separate lines for binary vs multi-outcome
- Same BLUE/AMBER color scheme as existing charts
- Flag incomplete quarters visually

### 5. Daily build pipeline
- Add `"refresh": "cd .. && uv run refresh_dashboard_data.py"` to dashboard `package.json`
- Daily workflow: `npm run refresh && npm run build` (cron or CI)
- Generated JSON files committed to git so `npm run build` works without an API key for local dev

### 6. Run the refresh script now to populate live data

## Files Modified
- **New**: `refresh_dashboard_data.py`, `dashboard/app/generated/*.json`, `dashboard/app/components/QuarterlyTrendChart.tsx`
- **Modified**: `dashboard/app/data.ts`, `dashboard/app/page.tsx`, `dashboard/package.json`
- **Unchanged**: All existing chart components (CalibrationChart, BiasChart, CategoryChart, CompositionChart)

## Data Flow
```
Daily cron: .env → refresh_dashboard_data.py → generated/*.json → npm build → static HTML
```

## Verification
1. Run `uv run refresh_dashboard_data.py` — should produce JSON files with non-empty data
2. Run `cd dashboard && npm run build` — should compile without errors
3. Run `npm run dev` — verify all charts render with real data, stat cards show computed values, Allium attribution visible in footer, quarterly trend chart appears
