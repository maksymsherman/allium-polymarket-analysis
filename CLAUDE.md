# Polymarket Accuracy Analysis — Critical Replication (v2)

Replicating and critically examining the [Dune "How Accurate is Polymarket" dashboard](https://dune.com/alexmccullough/how-accurate-is-polymarket) by @alexmccullough using Allium's on-chain prediction market data. **v2** addresses [methodological critique](critique.md) from McCullough's perspective.

## API Key
- **Always use the local `.env` file** for the Allium API key (`ALLIUM_API_KEY`).
- Do not use the MCP server's built-in key — it lacks access to prediction market tables.
- Run queries via `uv run run_query.py <file.sql>` or the Allium REST API.

## Data Source
- **Allium tables**: `polygon.predictions.markets`, `polygon.predictions.trades`, `polygon.predictions.token_prices_daily`
- **Coverage**: 108,861 resolved tokens across ~28,145 actual questions, 2022-01-14 to 2026-02-07
- **Methodology**: McCullough's approach — market priced >50% resolving "Yes" = correct, <50% resolving "No" = correct

---

## Market Structure (Critical — Missed in v1)

Polymarket has two market types, distinguished by the `NEG_RISK` flag:

| Type | `NEG_RISK` | Tokens | Actual Questions | Tokens/Question |
|------|-----------|--------|-----------------|-----------------|
| Binary | `false` | 13,108 | 13,108 | 1.0 |
| Multi-outcome | `true` | 93,876 | 13,160 | 7.1 |
| Unknown | `NULL` | 1,877 | 1,877 | 1.0 |
| **Total** | | **108,861** | **~28,145** | **3.9** |

**Grouping key**: `market_id` groups multi-outcome tokens into their parent question. For binary markets, `market_id` is a shared placeholder — use `condition_id` instead. The effective grouping key is `CASE WHEN neg_risk THEN market_id ELSE condition_id END`.

**Why this matters**: The v1 analysis treated each Yes token as an independent "market." A 30-candidate election question generated 30 observations — 29 of them near zero — all counted as independent predictions. This mechanically inflates tail concentration, inflates sample sizes, and introduces correlation into the calibration curve. The critique was right.

**Tokens-per-question distribution** (multi-outcome): mode = 3 (6,971 questions), followed by 11 (1,309) and 7 (1,600). Ranges up to 159 outcomes per question.

---

## v1 Methodological Errors (Fixed in v2)

1. **Multi-outcome conflation**: Treated correlated tokens from the same question as independent. Fixed by separating binary vs multi-outcome throughout, and reporting question-level counts.
2. **Resolution-day price inclusion**: `DATEDIFF BETWEEN 0 AND 1` included day-of-resolution prices. Fixed to `BETWEEN 1 AND 2`. This reduces coverage from 84,458 to 78,089 tokens (7.5% drop).
3. **Price = 0.50 mishandled**: Counted as incorrect regardless of outcome. Now explicitly excluded from binary accuracy (still included in Brier score).
4. **No confidence intervals**: Added 95% CIs on win rates using normal approximation.
5. **Query 07 (asymmetric bias)**: Removed — trivially explained by multi-outcome structure, doesn't support thesis.
6. **Sub-daily data source undisclosed**: Query 02 uses `trades` table (2024+) vs `token_prices_daily` for other queries. Now documented.

---

## v2 Results (Updated with Binary/Multi-outcome Split)

### Key Finding: Binary Markets Are Well-Calibrated

Binary market calibration (11,328 tokens, strict day-before price):

| Implied Prob | Actual Win Rate | Bias (pp) | N | 95% CI |
|---|---|---|---|---|
| 0-5% | 0.8% | +0.1 | 4,972 | [0.6%, 1.1%] |
| 10-20% | 15.7% | +1.7 | 650 | [12.9%, 18.5%] |
| 20-30% | 25.7% | +1.5 | 499 | [21.8%, 29.5%] |
| 40-50% | 47.8% | +3.2 | 500 | [43.4%, 52.2%] |
| 70-80% | 82.5% | **+8.0** | 428 | [78.9%, 86.1%] |
| 95-100% | 98.8% | -0.1 | 1,526 | [98.2%, 99.3%] |

**Positive bias throughout** — events happen slightly more than prices predict. No longshot bias. The v1 "systematic overpricing" was an artifact of mixing market types.

### Multi-outcome Calibration (68,888 tokens)

| Implied Prob | Actual Win Rate | Bias (pp) | N |
|---|---|---|---|
| 0-5% | 0.5% | -0.1 | 42,976 |
| 20-30% | 24.4% | -0.2 | 5,163 |
| 40-50% | 38.8% | **-5.4** | 1,951 |
| 95-100% | 98.9% | -0.5 | 4,804 |

Moderate negative bias. Worst bucket 40-50% at -5.4pp (vs v1's -8.1pp in 20-30%). The former "worst offender" (20-30%) is now essentially calibrated.

### Category Breakdown

| Category | Binary Comp. Acc. | Multi-outcome Comp. Acc. | Binary N | Multi N |
|---|---|---|---|---|
| Sports | 67.9% | 72.0% | 779 | 11,091 |
| Politics | 72.1% | 78.7% | 2,012 | 590 |
| Crypto | 78.7% | 70.6% | 480 | 2,074 |
| Weather | 75.0% | 87.6% | 9 | 1,333 |

---

## Concessions to the Critique

**Accepted:**
1. Multi-outcome token conflation is the fundamental flaw of v1 — it affects every table
2. Resolution-day price inclusion inflated accuracy numbers
3. Price = 0.50 edge case was silently miscounted
4. Calibration curve lacked confidence intervals and had uneven bucket widths
5. ~29K tokens dropped without investigation (mostly low-activity multi-outcome tokens)
6. Sub-daily results used a different data source without disclosure
7. Query 07 (asymmetric bias) was filler

**Partially accepted:**
8. Longshot bias is universal, not novel — should frame as "confirms known pattern" rather than discovery
9. Small-N early quarters (Q1 2023 N=39) shouldn't anchor temporal narrative
10. Q1 2026 is incomplete and subject to survivorship bias

**Pushed back:**
11. The 50-60% bucket being well-calibrated (-0.2pp) doesn't exonerate the other 11 buckets
12. The weather analogy stands — the point is about informativeness of the accuracy metric, not whether prices contain information

---

## Queries (3 files, down from 7)

| File | Purpose | Replaces |
|------|---------|----------|
| `01_accuracy_and_calibration.sql` | Calibration curve + headline accuracy + denominator, split by market type | Old 01, 03, 05, 07 |
| `02_by_category_and_quarter.sql` | Category breakdown + temporal trend, split by market type | Old 04, 06 |
| `03_sub_daily_accuracy.sql` | 4h/12h accuracy from trades (2024+, different data source) | Old 02 |

---

## Known Limitation: Daily Price Rounding

Queries 01 and 02 use `token_prices_daily` (DATE granularity). The "day before" filter `DATEDIFF('day', p.day, r.resolved_at::date) BETWEEN 1 AND 2` truncates `resolved_at` to a calendar date, so "1 day before" is really "the previous calendar day's end-of-day price" — not exactly 24 hours before resolution.

**Better approach**: derive prices from the `trades` table using exact timestamps:

```sql
FROM polygon.predictions.trades t
JOIN resolved_markets r
  ON t.condition_id = r.condition_id AND t.asset_id = r.token_id
WHERE t.block_timestamp < DATEADD('hour', -24, r.resolved_at)
QUALIFY ROW_NUMBER() OVER (
  PARTITION BY t.condition_id
  ORDER BY t.block_timestamp DESC
) = 1
```

This gets the last trade before exactly 24 hours pre-resolution. Trade-offs: heavier query, stale prices for thin markets, single-trade noise vs end-of-day aggregate. But eliminates calendar-day rounding and any resolution-day contamination.

---

## Testing & Development Workflow

**Always test on a small sample first.** Before running queries on the full dataset (~108K tokens), test on a handful of recent resolved markets to verify logic:

1. **Start small**: Filter to 5-10 specific recent markets by `condition_id` or `market_id`. Confirm joins, price filters, and grouping logic produce expected results.
2. **Only scale up after queries are finalized.** Full-data runs are expensive and slow — don't iterate on the full dataset.
3. **Add asserts to full queries.** Small samples may not exhibit the same data characteristics as the full dataset. When running at scale, validate assumptions:
   - `NEG_RISK` is not NULL (1,877 tokens have NULL — decide how to handle)
   - `market_id` is not NULL for multi-outcome tokens
   - `price` is within expected bounds (0 < price < 1)
   - Row counts are in expected ranges (e.g., 78K+ tokens after day-before filter)
   - No duplicate `condition_id` after deduplication (`QUALIFY ROW_NUMBER()`)
4. **Small samples differ from full data.** A sample of 10 markets may all be binary, all have prices, and all have `NEG_RISK` set. The full dataset has NULLs, missing prices, edge cases, and multi-outcome markets with 100+ tokens. Don't assume what works on the sample generalizes without asserts.

---

## TODO
- [x] ~~Analyze multi-outcome markets separately~~ (done in v2)
- [ ] Switch queries 01/02 from `token_prices_daily` to `trades`-derived exact-time prices
- [ ] Save key queries as reusable Allium explorer queries
- [ ] Compare Polymarket calibration to other prediction market platforms
- [ ] Deep dive on longshot bias — is it exploitable as a trading strategy?
- [ ] Volume-weighted analysis (do higher-liquidity markets calibrate better?)
