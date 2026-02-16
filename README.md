# How Accurate Is Polymarket, Really?

On-chain calibration analysis of 108,000+ resolved prediction market tokens across ~28,000 questions — replicating and critically examining [McCullough's Dune dashboard](https://dune.com/alexmccullough/how-accurate-is-polymarket).

**[Live dashboard](https://dashboard-wine-six-87.vercel.app)** · **[Full report](https://dashboard-wine-six-87.vercel.app/report)**

## Key findings

Polymarket's widely-cited "92% accuracy" is misleading because it conflates two structurally different market types:

- **Binary markets** (simple yes/no) **are well-calibrated**. Slight positive bias throughout — events happen more often than prices predict. No longshot bias.
- **Multi-outcome markets** (e.g. "Who will win?") **show moderate overpricing**, worst at −5.4pp in the 40–50% range. Each candidate token is correlated with others in the same question, inflating apparent sample sizes.
- **The headline number is inflated** by multi-outcome markets, where 75% of tokens fall in the tails (<10% or >90%). Like crediting a weather forecaster for predicting no snow in Phoenix in July.

## Project structure

```
queries/                   SQL queries against Allium's Polygon prediction tables
  01_accuracy_and_calibration.sql
  02_by_category_and_quarter.sql
  03_sub_daily_accuracy.sql
dashboard/                 Next.js static site (deployed to Vercel)
  app/components/          Recharts visualizations (Tufte-inspired)
  app/generated/           Auto-generated JSON from query results
  app/report/              Full written analysis
run_query.py               CLI to run SQL files against the Allium API
refresh_dashboard_data.py  Runs all queries and writes dashboard JSON
critique.md                Methodological critique of v1 analysis
report.md                  Full report (markdown source)
```

## How to refresh data

Requires an [Allium API key](https://app.allium.so/settings/api-keys) in `.env`:

```bash
echo "ALLIUM_API_KEY=your_key_here" > .env
uv run refresh_dashboard_data.py
```

This runs the three SQL queries, transforms results, and writes JSON files to `dashboard/app/generated/`.

## How to run locally

```bash
cd dashboard
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Data source

On-chain data from [Polygon](https://polygon.technology/) via [Allium](https://allium.so). Tables: `polygon.predictions.markets`, `polygon.predictions.trades`, `polygon.predictions.token_prices_daily`. Coverage: January 2022 – February 2026.
