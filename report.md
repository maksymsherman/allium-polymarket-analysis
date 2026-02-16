# How Accurate Is Polymarket, Really?

*An on-chain analysis of 108,000 resolved tokens across 28,000 questions — and why the answer depends on what you're counting*

---

Polymarket is often described as "right 92% of the time," a figure from Alex McCullough's [widely-cited Dune dashboard](https://dune.com/alexmccullough/how-accurate-is-polymarket). The methodology is straightforward: if a market is priced above 50 cents and the event happens, that's a correct prediction. Simple, intuitive — and misleading, because it treats two structurally different market types as one.

## Two kinds of markets, one dataset

Polymarket has **binary markets** — simple yes/no questions like "Will Bitcoin hit $100K by Friday?" — and **multi-outcome markets** — questions with many candidates like "Who will win the Super Bowl?", where each candidate gets its own Yes token.

The `NEG_RISK` flag in the on-chain data distinguishes them:

| Type | Yes Tokens | Actual Questions | Tokens per Question |
|---|---|---|---|
| Binary (`NEG_RISK = false`) | 13,108 | 13,108 | 1.0 |
| Multi-outcome (`NEG_RISK = true`) | 93,876 | 13,160 | 7.1 |
| Unknown (`NEG_RISK` is NULL) | 1,877 | 1,877 | — |
| **Total** | **108,861** | **~28,145** | **3.9** |

Multi-outcome tokens outnumber binary ones 7:1. A 30-candidate election produces 30 Yes tokens — 29 priced near zero — all mechanically "correct" when they lose. Counting each token as an independent prediction inflates sample sizes and distorts calibration, because tokens within the same question are correlated: if one goes up, others must go down.

Multi-outcome questions range from 3 outcomes (the most common, with 6,971 questions) up to 159 outcomes per question.

## Binary markets: well-calibrated, slightly underpriced

Isolating the 11,328 binary tokens with a strict day-before price produces a clean calibration picture — each observation is genuinely independent:

| Market Price | Actual Win Rate | Bias | N | 95% CI |
|---|---|---|---|---|
| 0–5% | 0.8% | +0.1 pp | 4,972 | [0.6%, 1.1%] |
| 5–10% | 6.9% | +0.3 pp | 519 | [4.8%, 9.1%] |
| 10–20% | 15.7% | +1.7 pp | 650 | [12.9%, 18.5%] |
| 20–30% | 25.7% | +1.5 pp | 499 | [21.8%, 29.5%] |
| 30–40% | 35.5% | +1.2 pp | 504 | [31.3%, 39.7%] |
| 40–50% | 47.8% | +3.2 pp | 500 | [43.4%, 52.2%] |
| 50–60% | 56.7% | +2.2 pp | 402 | [51.9%, 61.6%] |
| 60–70% | 67.9% | +3.4 pp | 405 | [63.4%, 72.4%] |
| 70–80% | 82.5% | **+8.0 pp** | 428 | [78.9%, 86.1%] |
| 80–90% | 84.8% | +0.4 pp | 481 | [81.6%, 88.0%] |
| 90–95% | 92.7% | +0.8 pp | 330 | [89.9%, 95.5%] |
| 95–100% | 98.8% | −0.1 pp | 1,526 | [98.2%, 99.3%] |

Almost every bucket shows **positive** bias — events happen slightly *more* often than prices predict. The 70–80% bucket is the most underpriced (+8.0pp): a market priced at 75 cents actually resolves Yes about 83% of the time. There is no longshot bias in binary markets. If anything, participants slightly underpay for likely outcomes.

Blending these with multi-outcome tokens obscures this picture entirely. The "systematic overpricing" that appears in a combined analysis is an artifact of mixing correlated multi-outcome tokens with independent binary observations.

## Multi-outcome markets: moderate overpricing, correlated data

The 68,888 multi-outcome tokens show mild negative bias:

| Market Price | Actual Win Rate | Bias | N |
|---|---|---|---|
| 0–5% | 0.5% | −0.1 pp | 42,976 |
| 5–10% | 5.6% | −1.1 pp | 3,130 |
| 10–20% | 12.2% | −2.2 pp | 4,153 |
| 20–30% | 24.4% | −0.2 pp | 5,163 |
| 30–40% | 31.6% | −2.4 pp | 2,773 |
| 40–50% | 38.8% | **−5.4 pp** | 1,951 |
| 50–60% | 52.8% | −1.9 pp | 1,183 |
| 60–70% | 62.4% | −1.7 pp | 969 |
| 70–80% | 72.0% | −2.2 pp | 667 |
| 80–90% | 84.0% | −0.1 pp | 555 |
| 90–95% | 90.8% | −1.5 pp | 346 |
| 95–100% | 98.9% | −0.5 pp | 4,804 |

The worst bucket is 40–50% at −5.4pp — meaningful but modest. The 20–30% range is essentially calibrated (−0.2pp bias).

These observations are **not independent**. Multiple tokens from the same question move together. The effective sample size is closer to the 13,160 distinct questions than the 65,145 token count, so the statistical confidence these sample sizes imply is overstated.

## The denominator problem

Most of the "92% accuracy" comes from near-certain outcomes:

| Type | Tokens | % in Tails (<10% or >90%) |
|---|---|---|
| Binary | 11,296 | ~54% |
| Multi-outcome | 65,145 | ~75% |

Binary markets have a healthy distribution — about half fall in the competitive range. Multi-outcome markets are structurally skewed toward the tails because most candidates in a multi-candidate question are longshots by definition. A 30-candidate field guarantees ~29 tokens below 10%.

Think of a weather forecaster who gets credit for correctly predicting it won't snow in Phoenix in July. The prediction is technically correct, but it tells you nothing about the forecaster's skill. The headline accuracy metric has the same problem — it's dominated by predictions that were never really in doubt. This doesn't mean the prices are uninformative (they are), but binary hit rate is the wrong way to measure that. Calibration is the right lens.

## Where predictions are hardest

Competitive accuracy (10–90% price range) by category and market type:

| Category | Binary Comp. Acc. | Multi-outcome Comp. Acc. | Binary N | Multi-outcome N |
|---|---|---|---|---|
| Sports | 67.9% | 72.0% | 779 | 11,091 |
| Politics | 72.1% | 78.7% | 2,012 | 590 |
| Crypto | 78.7% | 70.6% | 480 | 2,074 |
| Culture | 76.5% | 75.1% | 136 | 1,050 |
| Weather | 75.0% | 87.6% | 9 | 1,333 |
| Business | 70.3% | 74.9% | 238 | 318 |
| Technology | 81.7% | 72.3% | 62 | 115 |

Sports binary markets are the hardest to predict (67.9%), consistent with sports being genuinely uncertain at the competitive margin. Weather multi-outcome markets are the easiest (87.6%) — weather has well-understood probability distributions and likely attracts less noisy speculation.

## Coverage gaps

Of the 108,861 resolved tokens, 28,645 (~26%) lack a day-before price or have unknown market type and are excluded from the calibration analysis. These are not randomly distributed:

- **93% are multi-outcome tokens** — thin markets where no trade occurred on the day before resolution
- Most are longshot outcomes in sparsely-traded multi-candidate questions

Excluding them likely has minimal impact on calibration in the competitive range, but the gap is worth noting.

## Takeaways

- **Binary markets are well-calibrated.** Prices track reality across nearly all probability ranges, with no longshot bias. If you're looking at a simple yes/no market, the price is a reliable probability estimate — and if anything, slightly conservative.
- **Multi-outcome markets show moderate overpricing** in the 30–50% range (3–5pp). The effect is real but modest, and the observations aren't independent, so statistical confidence is lower than raw sample sizes suggest.
- **The "92% accurate" headline is inflated by composition.** Too many near-certain outcomes pad the denominator — especially in multi-outcome markets, where this is structural rather than incidental.
- **Longshot bias is a multi-outcome phenomenon**, not a platform-wide pattern. In a multi-candidate field, overpricing one candidate mechanically underprices others.

Polymarket's prices contain real information. Binary markets are impressively well-calibrated. But evaluating a probability forecaster by binary hit rate is like evaluating a chess engine by how often it beats beginners — the metric is real, it's just not measuring what you think it's measuring.

---

## Methodology

**Data**: On-chain records from Polygon via [Allium](https://www.allium.so/), covering 108,861 resolved Yes tokens across ~28,145 actual questions from January 2022 to February 2026. After filtering to tokens with a strict day-before price and known market type, 80,216 tokens remain (11,328 binary + 68,888 multi-outcome). An additional 1,877 tokens with unknown market type (`NEG_RISK = NULL`) are excluded from type-specific analysis.

**Market type identification**: Binary markets (`NEG_RISK = false`) yield one token per question (13,108 independent observations). Multi-outcome markets (`NEG_RISK = true`) yield multiple correlated tokens per question (93,876 tokens across 13,160 questions). Tokens are grouped into questions using `market_id` for multi-outcome markets and `condition_id` for binary markets.

**Price timing**: Day-before price using `DATEDIFF('day', price_date, resolution_date) BETWEEN 1 AND 2`, selecting the closest available price. This strictly excludes resolution-day prices, which could reflect the outcome itself. A known limitation: this uses calendar-day rounding rather than an exact 24-hour window. A trade-level approach using exact timestamps from `polygon.predictions.trades` would be more precise but heavier to compute.

**Accuracy definition**: A token priced above 50 cents that resolves Yes, or below 50 cents that resolves No, counts as correct. Tokens priced at exactly 50 cents are excluded from accuracy calculations but included in Brier score.

**Confidence intervals**: 95% CIs on binary market win rates using normal approximation. For multi-outcome markets, reported CIs overstate precision due to within-question correlation.

**Reproducibility**: All queries are in the [`queries/`](queries/) directory. This analysis builds on McCullough's [original Dune dashboard](https://dune.com/alexmccullough/how-accurate-is-polymarket).
