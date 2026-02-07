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

Binary market calibration (11,296 tokens, strict day-before price):

| Implied Prob | Actual Win Rate | Bias (pp) | N | 95% CI |
|---|---|---|---|---|
| 0-5% | 0.8% | +0.1 | 4,945 | [0.6%, 1.1%] |
| 10-20% | 15.7% | +1.7 | 649 | [12.9%, 18.5%] |
| 20-30% | 25.7% | +1.5 | 498 | [21.9%, 29.5%] |
| 40-50% | 47.8% | +3.2 | 500 | [43.4%, 52.2%] |
| 70-80% | 82.5% | **+8.0** | 428 | [78.9%, 86.1%] |
| 95-100% | 98.8% | -0.1 | 1,525 | [98.2%, 99.3%] |

**Positive bias throughout** — events happen slightly more than prices predict. No longshot bias. The v1 "systematic overpricing" was an artifact of mixing market types.

### Multi-outcome Calibration (65,145 tokens)

| Implied Prob | Actual Win Rate | Bias (pp) | N |
|---|---|---|---|
| 0-5% | 0.5% | -0.1 | 40,605 |
| 20-30% | 24.6% | **0.0** | 4,874 |
| 40-50% | 38.8% | **-5.4** | 1,846 |
| 95-100% | 98.4% | -1.0 | 4,550 |

Moderate negative bias. Worst bucket 40-50% at -5.4pp (vs v1's -8.1pp in 20-30%). The former "worst offender" (20-30%) is now perfectly calibrated.

### Category Breakdown

| Category | Binary Comp. Acc. | Multi-outcome Comp. Acc. | Binary N | Multi N |
|---|---|---|---|---|
| Sports | 67.9% | 72.0% | 778 | 10,448 |
| Politics | 72.1% | 78.4% | 2,012 | 577 |
| Crypto | 78.7% | 70.5% | 480 | 1,987 |
| Weather | 75.0% | 87.8% | 9 | 1,205 |

---

## Concessions to the Critique

**Accepted:**
1. Multi-outcome token conflation is the fundamental flaw of v1 — it affects every table
2. Resolution-day price inclusion inflated accuracy numbers
3. Price = 0.50 edge case was silently miscounted
4. Calibration curve lacked confidence intervals and had uneven bucket widths
5. ~24K tokens dropped without investigation (mostly low-activity multi-outcome tokens, 9.1% win rate)
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

## TODO
- [x] ~~Analyze multi-outcome markets separately~~ (done in v2)
- [ ] Re-run all v2 queries and update results tables above
- [ ] Save key queries as reusable Allium explorer queries
- [ ] Compare Polymarket calibration to other prediction market platforms
- [ ] Deep dive on longshot bias — is it exploitable as a trading strategy?
- [ ] Volume-weighted analysis (do higher-liquidity markets calibrate better?)
