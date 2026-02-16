// Auto-synced from /report.md — regenerate with refresh script or copy manually.
export const reportMarkdown = `# Polymarket's Binary Markets Are Well-Calibrated. The "92% Accuracy" Headline Isn't.

*An on-chain analysis of 108,861 resolved tokens across ~28,145 questions*

---

Alex McCullough's [Dune dashboard](https://dune.com/alexmccullough/how-accurate-is-polymarket) put Polymarket accuracy on the map — and inspired this deeper look at the on-chain data. His methodology is straightforward: if a market is priced above 50 cents and the event happens, that's a correct prediction. Simple, intuitive — but it treats two structurally different market types as one, and that changes the answer.

Polymarket has **binary markets** (yes/no questions like "Will Bitcoin hit $100K by Friday?") and **multi-outcome markets** (many candidates, like "Who will win the Super Bowl?", where each candidate gets its own Yes token). The \`NEG_RISK\` flag in the on-chain data distinguishes them. Multi-outcome tokens outnumber binary ones 7:1 — 93,876 vs 13,108 — and a 30-candidate election produces 30 Yes tokens, 29 priced near zero, all mechanically "correct" when they lose. Counting each as an independent prediction inflates sample sizes and distorts calibration.

## Binary markets: the prices are good

Isolating the 11,328 binary tokens with a strict day-before price produces a clean calibration picture — each observation is genuinely independent:

| Market Price | Actual Win Rate | Bias | N | 95% CI |
|---|---|---|---|---|
| 10–20% | 15.7% | +1.7 pp | 650 | [12.9%, 18.5%] |
| 20–30% | 25.7% | +1.5 pp | 499 | [21.8%, 29.5%] |
| 30–40% | 35.5% | +1.2 pp | 504 | [31.3%, 39.7%] |
| 40–50% | 47.8% | +3.2 pp | 500 | [43.4%, 52.2%] |
| 50–60% | 56.7% | +2.2 pp | 402 | [51.9%, 61.6%] |
| 60–70% | 67.9% | +3.4 pp | 405 | [63.4%, 72.4%] |
| 70–80% | 82.5% | **+8.0 pp** | 428 | [78.9%, 86.1%] |
| 80–90% | 84.8% | +0.4 pp | 481 | [81.6%, 88.0%] |

Tails behave as expected: 0–10% resolves at ~1–7%, 90–100% at ~93–99%.

Almost every bucket shows **positive** bias — events happen slightly *more* often than prices predict. The 70–80% bucket is the most underpriced (+8.0pp): a market at 75 cents resolves Yes about 83% of the time. No longshot bias. If anything, participants slightly underpay for likely outcomes.

## Multi-outcome markets: 3–5pp overpricing where it counts

The 68,888 multi-outcome tokens show the opposite pattern:

| Market Price | Actual Win Rate | Bias | N |
|---|---|---|---|
| 10–20% | 12.2% | −2.2 pp | 4,153 |
| 20–30% | 24.4% | −0.2 pp | 5,163 |
| 30–40% | 31.6% | −2.4 pp | 2,773 |
| 40–50% | 38.8% | **−5.4 pp** | 1,951 |
| 50–60% | 52.8% | −1.9 pp | 1,183 |
| 60–70% | 62.4% | −1.7 pp | 969 |
| 70–80% | 72.0% | −2.2 pp | 667 |
| 80–90% | 84.0% | −0.1 pp | 555 |

Tails: 0–10% resolves at ~0.5–6%, 90–100% at ~91–99%.

The worst bucket is 40–50% at −5.4pp — a token priced at 45 cents wins just 39% of the time. The effect is real but bounded. These observations are **not independent**: multiple tokens from the same question move together, so the effective sample size is closer to 13,160 distinct questions than the 68,888 token count.

## Why "92% accuracy" is the wrong number

Most of that headline stat comes from near-certain outcomes. About 75% of multi-outcome tokens fall in the tails (<10% or >90%), compared to ~54% for binary. A 30-candidate field guarantees ~29 tokens below 10% — all "correct" when they lose.

Think of a weather forecaster who gets credit for predicting no snow in Phoenix in July. The prediction is right, but it says nothing about skill. The headline accuracy metric has the same problem — dominated by predictions that were never in doubt. Calibration is the right lens.

## Hardest categories

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

Sports binary markets are the hardest to predict (67.9%) — consistent with sports being genuinely uncertain at the competitive margin.

## The bottom line

- **Binary markets are well-calibrated.** Prices track reality across probability ranges, with no longshot bias. The price is a reliable probability estimate — slightly conservative, if anything.
- **Multi-outcome markets overprice by 3–5pp in the competitive range.** The effect is real but bounded, and within-question correlation means statistical confidence is lower than raw counts suggest.
- **The "92% accuracy" headline is a denominator problem.** Near-certain outcomes pad the count — structurally so in multi-outcome markets.
- **Binary and multi-outcome markets have opposite biases.** Binary prices slightly underestimate event probability; multi-outcome prices slightly overestimate it. Mixing them creates an artifact.

Polymarket's prices contain real information. Binary markets are impressively well-calibrated. But evaluating a probability forecaster by binary hit rate is like evaluating a chess engine by how often it beats beginners — the metric is real, it's just not measuring what you think it's measuring.

---

## Methodology

**Data**: On-chain records from Polygon via [Allium](https://www.allium.so/), covering 108,861 resolved Yes tokens across ~28,145 actual questions from January 2022 to February 2026. After filtering to tokens with a strict day-before price and known market type, 80,216 tokens remain (11,328 binary + 68,888 multi-outcome). An additional 28,645 tokens (~26%) lack a day-before price or have unknown market type — 93% are thinly-traded multi-outcome longshots with minimal impact on competitive-range calibration.

**Market type identification**: Binary markets (\`NEG_RISK = false\`) yield one token per question. Multi-outcome markets (\`NEG_RISK = true\`) yield multiple correlated tokens per question (93,876 tokens across 13,160 questions), grouped via \`market_id\`.

**Price timing**: Day-before price using \`DATEDIFF('day', price_date, resolution_date) BETWEEN 1 AND 2\`, strictly excluding resolution-day prices. Known limitation: calendar-day rounding vs exact 24-hour window.

**Accuracy definition**: Token priced above 50 cents resolving Yes, or below 50 cents resolving No, counts as correct. Tokens at exactly 50 cents excluded from accuracy but included in Brier score.

**Reproducibility**: All queries in the [queries/](https://github.com/maksymsherman/allium-polymarket-analysis/tree/main/queries) directory. Inspired by McCullough's [original Dune dashboard](https://dune.com/alexmccullough/how-accurate-is-polymarket).
`;
