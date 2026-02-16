# Polymarket Accuracy Analysis — Critical Replication (v2)

Replicating and critically examining the [Dune "How Accurate is Polymarket" dashboard](https://dune.com/alexmccullough/how-accurate-is-polymarket) by @alexmccullough using Allium's on-chain prediction market data. **v2** addresses a [methodological critique](critique.md).

## Data Source
- **Allium tables**: `polygon.predictions.markets`, `polygon.predictions.trades`, `polygon.predictions.token_prices_daily`
- **Coverage**: 108,861 resolved tokens across ~28,145 actual questions, 2022-01-14 to 2026-02-07
- **Methodology**: McCullough's approach — market priced >50% resolving "Yes" = correct, <50% resolving "No" = correct

## Market Structure

Polymarket has two market types, distinguished by the `NEG_RISK` flag:

| Type | `NEG_RISK` | Tokens | Actual Questions | Tokens/Question |
|------|-----------|--------|-----------------|-----------------|
| Binary | `false` | 13,108 | 13,108 | 1.0 |
| Multi-outcome | `true` | 93,876 | 13,160 | 7.1 |
| Unknown | `NULL` | 1,877 | 1,877 | 1.0 |
| **Total** | | **108,861** | **~28,145** | **3.9** |

**Grouping key**: `market_id` groups multi-outcome tokens into their parent question. For binary markets, `market_id` is a shared placeholder — use `condition_id` instead. Effective grouping: `CASE WHEN neg_risk THEN market_id ELSE condition_id END`.

**Why this matters**: The v1 analysis treated each Yes token as an independent "market." A 30-candidate election question generated 30 observations — 29 near zero — all counted as independent predictions. This mechanically inflates tail concentration, inflates sample sizes, and introduces correlation into the calibration curve.

## v1 Methodological Errors (Fixed in v2)

1. **Multi-outcome conflation**: Treated correlated tokens from the same question as independent. Fixed by separating binary vs multi-outcome throughout.
2. **Resolution-day price inclusion**: `DATEDIFF BETWEEN 0 AND 1` included day-of-resolution prices. Fixed to `BETWEEN 1 AND 2`.
3. **Price = 0.50 mishandled**: Counted as incorrect regardless of outcome. Now excluded from binary accuracy.
4. **No confidence intervals**: Added 95% CIs using normal approximation.
5. **Asymmetric bias query**: Removed — trivially explained by multi-outcome structure.
6. **Sub-daily data source undisclosed**: Query 03 uses `trades` table (2024+) vs `token_prices_daily` for others. Now documented.

## Key Findings

- **Binary markets are well-calibrated** with slight positive bias (events happen more than predicted). No longshot bias.
- **Multi-outcome markets show moderate negative bias** (worst −5.4pp at 40–50%).
- **The v1 "systematic overpricing" was an artifact** of mixing market types.

## Queries

| File | Purpose |
|------|---------|
| `queries/01_accuracy_and_calibration.sql` | Calibration curve + headline accuracy, split by market type |
| `queries/02_by_category_and_quarter.sql` | Category breakdown + temporal trend, split by market type |
| `queries/03_sub_daily_accuracy.sql` | 4h/12h accuracy from trades (2024+, different data source) |
