# Polymarket Accuracy Analysis — Critical Replication

Replicating and critically examining the [Dune "How Accurate is Polymarket" dashboard](https://dune.com/alexmccullough/how-accurate-is-polymarket) by @alexmccullough using Allium's on-chain prediction market data.

## Data Source
- **Allium tables**: `polygon.predictions.markets`, `polygon.predictions.trades_enriched`, `polygon.predictions.token_prices_daily`
- **Coverage**: 124K resolved markets, 2022-01-14 to 2026-02-07, 9 categories
- **Methodology**: McCullough's approach — market priced >50% resolving "Yes" = correct, <50% resolving "No" = correct

---

## 1. Replication: Headline Accuracy by Time Horizon

| Horizon | McCullough | Our Replication | N (markets) | Brier Score |
|---------|-----------|-----------------|-------------|-------------|
| 4 hours | 95.4% | 93.1% | 59,293 | 0.048 |
| 12 hours | 89.4% | 86.8% | 45,723 | 0.089 |
| 1 day | 88.2% | 92.1% | 84,458 | 0.054 |
| 1 week | 88.8% | 88.5% | 38,649 | 0.082 |
| 1 month | 91.9% | 91.8% | 13,666 | 0.059 |

Differences from McCullough likely due to larger dataset (his was built with less historical data).

---

## 2. Critical Finding: The Denominator Problem

**The headline accuracy number is almost meaningless.** Here's why:

One day before resolution:
- **88.8%** of all markets are priced <5% or >95% (near-certain outcomes)
- **91.7%** are in the <10% or >90% tails
- Only **8.3%** (7,039 of 84,458) are genuinely competitive markets

| Market Subset | % of Total | Accuracy |
|--------------|-----------|----------|
| Near-certain (<5% or >95%) | 88.8% | **99.7%** |
| Competitive (10-90%) | 8.3% | **75.6%** |

**The "92% accuracy" headline is driven by markets where the outcome is already obvious.** For markets where the result is genuinely uncertain, Polymarket is right only ~3 out of 4 times.

---

## 3. Calibration Curve — Systematic Overpricing

Every single price bucket shows **negative bias** — markets systematically overestimate the probability of events occurring:

| Implied Probability | Actual Win Rate | Bias (pp) | N |
|--------------------|-----------------|-----------|---|
| 0-5% | 0.2% | -0.2 | 61,525 |
| 5-10% | 4.2% | -2.5 | 2,027 |
| 10-20% | 7.6% | **-6.0** | 1,976 |
| 20-30% | 15.9% | **-8.1** | 1,288 |
| 30-40% | 28.4% | -5.7 | 830 |
| 40-50% | 40.2% | -4.5 | 789 |
| 50-60% | 53.2% | -0.2 | 726 |
| 60-70% | 60.9% | -3.4 | 447 |
| 70-80% | 72.5% | -1.8 | 403 |
| 80-90% | 79.1% | **-5.6** | 497 |
| 90-95% | 88.2% | -3.9 | 389 |
| 95-100% | 99.2% | -0.4 | 13,561 |

**Key insight**: The worst miscalibration is in the 20-30% range (8.1pp overestimate). This is classic **longshot bias** — participants overpay for unlikely outcomes. A market priced at 25% is really more like a 16% event.

---

## 4. Category Breakdown — Where Does Polymarket Struggle?

| Category | Headline Accuracy | Accuracy (excl tails) | % in Tails | Brier |
|----------|------------------|----------------------|------------|-------|
| Sports | 96.9% | **73.8%** | 89.9% | 0.0215 |
| Crypto | 98.6% | **79.8%** | 94.2% | 0.0105 |
| Politics | 96.6% | **75.5%** | 87.5% | 0.0240 |
| Weather | 99.3% | 76.5% | 98.3% | 0.0058 |
| Culture | 98.3% | 78.4% | 93.7% | 0.0133 |
| Business | 98.0% | 76.0% | 95.2% | 0.0160 |
| Technology | 99.2% | 76.5% | 97.9% | 0.0060 |

- **Sports** has the worst competitive accuracy (73.8%) and highest Brier score (0.024), likely because sporting events are inherently less predictable
- **Politics** is second-worst — genuinely uncertain events with strong participant biases
- **Crypto** does best on competitive markets (79.8%) — possibly more sophisticated/informed traders

---

## 5. Temporal Trend — Is Polymarket Actually Improving?

| Quarter | Total Markets | Competitive Markets | Overall Accuracy | Competitive Accuracy | Competitive Brier |
|---------|--------------|--------------------|-----------------|--------------------|-------------------|
| Q1 2023 | 168 | 39 | 83.3% | 56.4% | 0.261 |
| Q1 2024 | 698 | 83 | 96.6% | 79.5% | 0.134 |
| Q3 2024 | 3,542 | 637 | 94.0% | 70.5% | 0.170 |
| Q4 2024 | 4,681 | 743 | 95.9% | 75.8% | 0.160 |
| Q1 2025 | 6,553 | 633 | 97.2% | 76.1% | 0.168 |
| Q3 2025 | 14,983 | 1,282 | 98.0% | 79.6% | 0.147 |
| Q4 2025 | 24,237 | 1,512 | 98.5% | **80.3%** | **0.144** |
| Q1 2026 | 15,759 | 499 | 98.8% | 75.4% | 0.174 |

**The "improving accuracy" narrative is largely a composition effect.** Overall accuracy went from 83% to 99% — but that's because a growing % of markets are near-certain tail outcomes. Competitive accuracy has been **roughly flat at 70-80%** since mid-2023, with modest improvement in late 2025.

---

## 6. Asymmetric Structure

| Direction | N | Avg Price | Actual Win Rate |
|-----------|---|-----------|-----------------|
| Yes favored (>50%) | 15,877 | 95.7% | 95.0% |
| No favored (<50%) | 68,581 | 2.4% | 1.7% |

The dataset is **4.3x skewed** toward "No favored" markets — most Yes tokens trade at very low prices. This is partly structural: many multi-outcome markets (e.g., "Who will win the election?") generate many low-probability Yes tokens.

---

## Summary & Critique of McCullough's Dashboard

1. **The binary accuracy metric is misleading.** Counting ">50% and won" as "correct" treats a market at 51% and 99% identically. Brier score is the right metric.

2. **The headline number is inflated by near-certain outcomes.** ~89% of markets are already in the tails (<5% or >95%) one day before resolution. These are trivially correct.

3. **The real story is competitive markets.** When outcomes are genuinely uncertain (10-90%), Polymarket is right about **76% of the time** — respectable but far from the 92%+ headline.

4. **Systematic overpricing exists across all probability ranges.** Longshot bias is worst in the 20-30% range (-8pp). There's a potential contrarian strategy: systematically betting against events priced at 20-30%.

5. **Polymarket isn't getting dramatically better** at pricing competitive markets. The accuracy improvement over time is largely a volume-composition effect.

---

## Next Steps / TODO
- [ ] Save key queries as reusable Allium explorer queries
- [ ] Analyze multi-outcome markets separately (team picks, election fields)
- [ ] Compare Polymarket calibration to other prediction market platforms
- [ ] Deep dive on the longshot bias — is it exploitable as a trading strategy?
- [ ] Time-weighted Brier score (penalize more for being wrong closer to resolution)
- [ ] Volume-weighted analysis (do higher-liquidity markets calibrate better?)
