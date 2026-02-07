# Polymarket's Accuracy Numbers — What They Actually Tell You

*An on-chain analysis of 78,000 resolved prediction market tokens, corrected for market structure*

---

You've probably seen the claim: Polymarket is right 92% of the time. It comes from a [widely-cited Dune dashboard](https://dune.com/alexmccullough/how-accurate-is-polymarket) by Alex McCullough, which applies a simple test — if a market is priced above 50 cents and the event happens, that's a correct prediction.

We [initially replicated](critique.md) that methodology and drew strong conclusions about systematic overpricing. Then a [detailed critique](critique.md) from McCullough's perspective exposed a fundamental flaw in our approach: we were treating every Yes token as an independent market. This revision fixes that and several other methodological problems. The story is more nuanced than either the original "92% accurate!" or our v1 "it's an illusion!" framing.

## The market structure problem

Polymarket has two kinds of markets. **Binary markets** are simple yes/no questions: "Will Bitcoin hit $100K by Friday?" — one Yes token, one No token. **Multi-outcome markets** are questions with many candidates: "Who will win the Super Bowl?" — one Yes token per team, with 30+ outcomes sharing a single parent question.

The `NEG_RISK` flag in the on-chain data distinguishes them:

| Type | Yes Tokens | Actual Questions | Avg Outcomes |
|---|---|---|---|
| Binary | 13,108 | 13,108 | 1 |
| Multi-outcome | 93,876 | 13,160 | 7.1 |

Multi-outcome tokens outnumber binary 7:1 in the dataset. A 30-candidate election produces 30 Yes tokens — 29 priced near zero — all mechanically "correct" when they lose. Our original analysis counted these as 30 independent predictions. They aren't. The [critique](critique.md) was right to flag this as the fundamental flaw.

## Binary markets: well-calibrated, no longshot bias

When you isolate the 11,296 binary-market tokens with a strict day-before price (excluding resolution-day data, which our v1 analysis incorrectly included), the calibration picture inverts:

| Market Price | Actual Win Rate | Bias | N | 95% CI |
|---|---|---|---|---|
| 0-5% | 0.8% | +0.1 pp | 4,945 | [0.6%, 1.1%] |
| 5-10% | 7.0% | +0.3 pp | 517 | [4.8%, 9.2%] |
| 10-20% | 15.7% | **+1.7 pp** | 649 | [12.9%, 18.5%] |
| 20-30% | 25.7% | **+1.5 pp** | 498 | [21.9%, 29.5%] |
| 30-40% | 35.5% | +1.2 pp | 504 | [31.3%, 39.7%] |
| 40-50% | 47.8% | +3.2 pp | 500 | [43.4%, 52.2%] |
| 50-60% | 56.7% | +2.2 pp | 402 | [51.9%, 61.6%] |
| 60-70% | 67.9% | +3.4 pp | 405 | [63.4%, 72.4%] |
| 70-80% | 82.5% | **+8.0 pp** | 428 | [78.9%, 86.1%] |
| 80-90% | 84.8% | +0.4 pp | 481 | [81.6%, 88.0%] |
| 90-95% | 92.7% | +0.8 pp | 330 | [89.9%, 95.5%] |
| 95-100% | 98.8% | -0.1 pp | 1,525 | [98.2%, 99.3%] |

Almost every bucket shows **positive** bias — events happen slightly *more* often than prices predict. The 70-80% bucket is the most underpriced (+8.0pp), meaning a market priced at 75% actually happens about 83% of the time. There is no longshot bias in binary markets. If anything, participants slightly underpay for likely outcomes.

This is the opposite of what we reported in v1. The "systematic overpricing across all probability ranges" was an artifact of mixing correlated multi-outcome tokens with independent binary observations.

## Multi-outcome markets: moderate overpricing, correlated observations

The 65,145 multi-outcome tokens tell a different story — but a milder one than v1 suggested:

| Market Price | Actual Win Rate | Bias | N |
|---|---|---|---|
| 0-5% | 0.5% | -0.1 pp | 40,605 |
| 10-20% | 12.2% | -2.2 pp | 3,958 |
| 20-30% | 24.6% | **0.0 pp** | 4,874 |
| 30-40% | 31.5% | -2.5 pp | 2,612 |
| 40-50% | 38.8% | **-5.4 pp** | 1,846 |
| 50-60% | 52.4% | -2.4 pp | 1,096 |
| 70-80% | 72.4% | -1.8 pp | 626 |
| 95-100% | 98.4% | -1.0 pp | 4,550 |

The worst bucket is 40-50% at -5.4pp — meaningful, but nothing like the -8.1pp we originally reported. The 20-30% bucket, our former "worst offender," is now **perfectly calibrated** (0.0pp bias) when isolated to multi-outcome markets.

An important caveat: these tokens are **not independent observations**. Multiple tokens from the same question are correlated — if one goes up, others go down. Treating them as independent data points for calibration analysis overstates statistical confidence. The sample sizes look large, but the effective sample size is closer to the question count (13,160) than the token count (65,145).

## The denominator problem still exists — but it's structural

The v1 finding that most markets are near-certain outcomes is real, but the magnitude depends on market type:

| Type | Tokens | % in Tails (<10% or >90%) |
|---|---|---|
| Binary | 11,296 | ~54% |
| Multi-outcome | 65,145 | ~75% |

Binary markets have a much healthier distribution — about half have prices in the competitive range. Multi-outcome markets are structurally skewed toward tails because most candidates in a multi-outcome question are longshots by definition.

## Where predictions are hardest

Category breakdown, showing competitive accuracy (10-90% price range) for the two market types:

| Category | Binary Competitive Acc. | Multi-outcome Competitive Acc. | Binary N | Multi-outcome N |
|---|---|---|---|---|
| Sports | 67.9% | 72.0% | 778 | 10,448 |
| Politics | 72.1% | 78.4% | 2,012 | 577 |
| Crypto | 78.7% | 70.5% | 480 | 1,987 |
| Culture | 76.3% | 75.2% | 135 | 1,007 |
| Weather | 75.0% | 87.8% | 9 | 1,205 |
| Business | 70.3% | 74.2% | 238 | 298 |
| Technology | 81.7% | 71.2% | 62 | 114 |

Sports binary markets are the hardest to predict (67.9%). Weather multi-outcome markets are the easiest (87.8%) — likely because weather has well-understood probability distributions. The categories have very different binary vs. multi-outcome compositions, which explains why blending them gave misleading results in v1.

## What this means

Polymarket's accuracy is neither the "92%" headline nor the "76% illusion" we originally claimed. The right answer depends on what you're measuring:

- **Binary markets are well-calibrated.** Prices match reality across nearly all probability ranges. No longshot bias. If you're looking at a simple yes/no question, the price is a reliable probability estimate.
- **Multi-outcome markets have moderate overpricing** in the 30-50% range (3-5pp), but the effect is smaller than we originally reported and the observations aren't independent.
- **The headline accuracy metric is still inflated by composition** — too many near-certain outcomes padding the denominator. But the inflation is worse for multi-outcome markets (structural) than binary (moderate).
- **Longshot bias is a multi-outcome phenomenon**, not a platform-wide pattern. This makes sense: in a 30-candidate field, overpricing one candidate mechanically underprices others.

---

## Methodology

**Data**: On-chain records from Polygon via [Allium](https://www.allium.so/), covering 108,861 resolved Yes tokens across ~28,145 actual questions from January 2022 to February 2026. After filtering to tokens with a strict day-before price (excluding resolution-day snapshots), 78,089 tokens remain.

**Market type split**: Binary markets (`NEG_RISK = false`, 13,108 tokens) are analyzed as independent observations. Multi-outcome markets (`NEG_RISK = true`, 93,876 tokens) are identified using the `market_id` field, which groups tokens from the same parent question. We report both token-level and question-level counts.

**Price timing**: Strict day-before price using `DATEDIFF('day', price_date, resolution_date) BETWEEN 1 AND 2`, selecting the closest price. This excludes resolution-day prices, which the v1 analysis incorrectly included (reducing coverage by ~7.5%).

**Accuracy definition**: A market priced above 50 cents that resolves "Yes," or below 50 cents that resolves "No," counts as correct. Markets priced at exactly 50 cents are excluded from binary accuracy but included in Brier score calculations.

**Confidence intervals**: 95% CIs on win rates using normal approximation. For multi-outcome markets, these overstate precision due to within-question correlation.

**Reproducibility**: All SQL queries are in the [`queries/`](queries/) directory (3 files, down from 7 in v1). This analysis builds on Alex McCullough's [original Dune dashboard](https://dune.com/alexmccullough/how-accurate-is-polymarket) and addresses the [methodological critique](critique.md) of our v1 report.
