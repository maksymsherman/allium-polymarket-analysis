# Critique of "Polymarket's 92% Accuracy Is a Statistical Illusion"

*From the perspective of Alex McCullough, creator of the original Dune dashboard*

---

## The Biggest Problem: You Don't Know What a "Market" Is

The entire analysis rests on treating each **Yes token** as a separate "market." But Polymarket has multi-outcome questions. The `markets` table has a `QUESTION_ID` field and a `NEG_RISK` flag (which identifies multi-outcome markets) — and **neither field is used in any of the 7 queries.**

When someone asks "Who will win the Super Bowl?", Polymarket creates 32 conditions — one per team — each with a Yes token. This analysis counts those as **32 separate markets.** Of those, ~31 will trade at low prices (only one team wins). This means:

- The "84,458 resolved markets" count is inflated. The actual number of resolved **questions** is likely far smaller. The report never states this or attempts to de-duplicate.
- The "88.8% of markets are priced below 5% or above 95%" finding is **mechanically guaranteed** by multi-outcome markets. If a question has 20 candidates, at least 19 Yes tokens will be near zero. The tail concentration the report presents as a damning critique is substantially an artifact of market structure, not evidence of meaningless predictions.
- The calibration curve in the low-probability buckets (0-5%, 5-10%, 10-20%) is dominated by **correlated tokens from the same question.** These are not independent observations. Treating them as independent to compute "longshot bias" violates the basic assumptions of the calibration analysis.
- The Brier score calculation uses the binary formula `(forecast - outcome)^2`, but for multi-outcome markets the correct proper scoring rule is the multivariate Brier score. Applying the binary version to tokens from multinomial events produces biased estimates.

**This single flaw undermines the denominator problem argument (Section 1), the calibration curve (Section 2), the asymmetric structure finding (CLAUDE.md Section 6), and the sample counts in every table in the report.** The report never addresses it.

---

## The Replication Doesn't Actually Replicate

The report claims to have gotten "a similar result" — 92.1% accuracy at the 1-day horizon. But my dashboard shows **88.2%** for 1 day. A 4-percentage-point gap is not "similar." It's a substantial discrepancy that the report waves away as "likely due to larger dataset."

A real replication would explain the gap. Possible causes: different price timing (daily snapshot vs. actual 24h-before price), different market inclusion criteria, the multi-outcome token counting problem above. The report doesn't investigate any of these.

---

## The "Day Before" Price Isn't Actually 1 Day Before

Every query from 03 through 07 uses this filter for the "day before resolution" price:

```sql
WHERE DATEDIFF('day', p.day, r.resolved_at::date) BETWEEN 0 AND 1
```

`BETWEEN 0 AND 1` includes **day 0** — the day of resolution itself. The `token_prices_daily` table captures **end-of-day** prices. If a market resolves at 3 PM but the daily price snapshot reflects trading through that day, the "prediction" is actually capturing prices that incorporate the resolution event.

The `QUALIFY ROW_NUMBER() OVER (PARTITION BY p.condition_id ORDER BY p.day DESC) = 1` then selects the **latest** price, which preferentially picks the resolution-day price (day 0) over the actual day-before price (day 1). This inflates the accuracy of every analysis that uses this CTE — which is 5 of the 7 queries.

A proper "1 day before" filter would use `BETWEEN 1 AND 2` or select the day strictly before the resolution date.

---

## The Calibration Curve Has Uneven Buckets and Low N

The calibration curve (Query 03, report Section 2) uses uneven bucket widths:

| Bucket | Width | N |
|--------|-------|---|
| 0-5% | 5pp | 61,525 |
| 5-10% | 5pp | 2,027 |
| 10-20% | 10pp | 1,976 |
| 20-30% | 10pp | 1,288 |
| 95-100% | 5pp | 13,561 |

The "worst offender" bucket (20-30%, -8.1pp bias) has only **1,288 observations** — and many of those are correlated tokens from multi-outcome markets. A proper calibration analysis would:

1. Use equal-width buckets or equal-count quantiles
2. Report confidence intervals
3. Account for the non-independence of tokens from the same question

Without confidence intervals, we can't know if the observed bias is statistically significant or just noise in a sample dominated by dependent observations.

---

## The 50-60% Bucket Undermines the Report's Own Thesis

The calibration table's 50-60% bucket shows **-0.2pp bias** — essentially perfect calibration. These are the markets closest to a coin flip, the ones where calibration matters most. The report claims "every single row shows negative bias" and frames it as "systematic overpricing," but the most important row shows the market is nearly perfectly calibrated.

If Polymarket correctly prices the close-call markets (50-60%), that's strong evidence of market efficiency where it matters most — not evidence of failure. The report buries this.

---

## "Longshot Bias" Is Expected, Not a Market Failure

The report presents longshot bias as if it were a novel discovery about Polymarket. It isn't. Longshot bias is **present in every betting market ever studied** — horse racing, sports books, options markets, insurance. It has well-understood economic explanations: risk-loving preferences, entertainment value, information asymmetry.

Polymarket's longshot bias (~8pp at the worst bucket) is actually quite mild compared to horse racing, where it can exceed 20pp. Framing a universal market phenomenon as a Polymarket-specific failure is misleading.

---

## The "Not Improving" Claim Contradicts the Data

The report's own temporal table shows:

| Period | Competitive Accuracy | N |
|--------|---------------------|---|
| Q1 2023 | 56.4% | 39 |
| Q1 2024 | 79.5% | 83 |
| Q4 2025 | 80.3% | 1,512 |
| Q1 2026 | 75.4% | 499 |

The report says competitive accuracy "has hovered between 70% and 80% since mid-2023, with no clear upward trend." Three problems:

1. **Q1 2023 has N=39.** Drawing any conclusion from 39 observations is statistically irresponsible. The 56.4% number has a 95% confidence interval of roughly +/-16pp.
2. Going from ~70% in early periods to ~80% in Q4 2025 **is** improvement. A 10pp gain in competitive accuracy is meaningful. The report dismisses this.
3. **Q1 2026 is incomplete** — the analysis date is February 7, 2026. Only markets that resolve quickly appear in incomplete quarters, introducing survivorship bias. The report treats this partial number alongside completed quarters as if they're equivalent.

---

## Query 02 Mixes Apples and Oranges

The sub-daily accuracy results (4h and 12h) come from Query 02, which:

- Uses `polygon.predictions.trades` (individual trades), not `token_prices_daily`
- Is filtered to `>= 2024-01-01` only
- Selects a single trade near the target horizon

These numbers are presented in the **same table** as the 1-day, 1-week, and 1-month results, which come from a completely different data source (daily snapshots), cover all time periods, and use different selection logic. The reader has no way to know this from the report.

Additionally, the CLAUDE.md lists the data source as `polygon.predictions.trades_enriched`, but the actual query uses `polygon.predictions.trades`. Minor, but sloppy.

---

## Query 07 (Asymmetric Bias) Is Unnecessary

The asymmetric structure finding — 4.3x more "No favored" than "Yes favored" markets — is entirely explained by multi-outcome markets generating many low-probability Yes tokens. The report acknowledges this ("partly structural") but still devotes a section to it.

This query doesn't support any of the report's four takeaway bullets. It's filler.

---

## 40,000 Markets Silently Dropped

The CLAUDE.md says "Coverage: 124K resolved markets" but the report analyzes only 84,458 — those with a daily price snapshot 0-1 days before resolution. The remaining **~40,000 resolved markets are excluded** without investigation.

Are these excluded markets systematically different? Markets that resolve quickly or have low trading volume might lack daily price snapshots. These could be exactly the "easy" markets that pad headline accuracy, or they could be genuinely interesting ones. The report never addresses this selection bias.

---

## The Weather Forecaster Analogy Is Backward

The report says: *"Think of a weather forecaster who gets credit for correctly predicting it won't snow in July."*

But that's not what's happening. These markets were created, traded, and priced by participants who put money at risk. A market priced at 2% for "Bitcoin hits $1M by Friday" is providing real information — it's telling you the crowd-estimated probability is 2%. That IS the forecast, and it IS useful.

The better analogy: a weather forecaster who says "98% chance of sun in Phoenix tomorrow" is technically easy, but the specific probability (98%, not 60%) is still valuable information. The correct critique is that you shouldn't judge a forecaster by binary hit rate alone — you should judge them by calibration. But then the report's own calibration analysis is compromised by the correlated-token and resolution-day-price problems described above.

---

## Price = 0.50 Exactly Is Silently Mishandled

The accuracy formula across all queries:

```sql
WHEN (price > 0.5 AND is_winner) OR (price < 0.5 AND NOT is_winner) THEN 1 ELSE 0
```

Markets priced at exactly 0.50 are counted as **incorrect** regardless of outcome. Minor in practice, but it reveals a lack of attention to edge cases in an analysis that claims methodological rigor.

---

## Summary

**What the report gets right:**
- The binary accuracy metric is too crude (Brier score is better)
- There IS a composition effect from near-certain markets inflating the headline number
- Longshot bias exists on Polymarket

**What the report gets wrong or fails to address:**
- Treats correlated tokens from multi-outcome markets as independent observations (fundamental flaw that affects every table)
- Uses resolution-day prices as "day before" prices (inflates all accuracy numbers)
- Doesn't separate binary from multi-outcome markets
- Presents longshot bias as novel rather than universal
- Cherry-picks the temporal narrative while relying on N=39 baselines
- Mixes data sources across time horizons without disclosure
- Drops ~40K markets without investigating selection bias
- Reports no confidence intervals on any metric

The core thesis — that 92% overstates Polymarket's predictive power — is directionally correct. But the analysis replaces one oversimplification (binary accuracy on all markets) with another (binary accuracy on an arbitrary "competitive" subset) without fixing the deeper methodological problems. You can't critique a denominator while miscounting what goes into your own.

---

## Query-by-Query Assessment

| Query | Verdict | Issue |
|-------|---------|-------|
| 01 — Headline Accuracy | Useful but flawed | Day-0 price inclusion inflates results |
| 02 — Sub-daily Accuracy | Apples-to-oranges | Different data source and time range, presented alongside Query 01 |
| 03 — Calibration Curve | Fundamentally flawed | Correlated tokens, uneven buckets, no confidence intervals |
| 04 — By Category | Best of the set | Still has the token independence problem |
| 05 — Denominator Problem | Inflated by design | Multi-outcome tokens mechanically create tail concentration |
| 06 — Accuracy Over Time | Misleading | Small-N early periods, incomplete final quarter |
| 07 — Asymmetric Bias | Unnecessary | Trivially explained by market structure, doesn't support thesis |
