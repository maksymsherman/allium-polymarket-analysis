# Polymarket's 92% Accuracy Is a Statistical Illusion

*An on-chain analysis of 84,000 resolved prediction markets*

---

You've probably seen the claim: Polymarket is right 92% of the time. It comes from a [widely-cited Dune dashboard](https://dune.com/alexmccullough/how-accurate-is-polymarket) by Alex McCullough, which applies a simple test — if a market is priced above 50 cents and the event happens, that's a correct prediction.

We replicated that methodology across 84,458 resolved markets using [Allium's](https://www.allium.so/) on-chain data and got a similar result: 92.1% accuracy one day before resolution. The number checks out.

But it's the wrong number to look at. Here's why.

## Most markets aren't predictions — they're foregone conclusions

One day before resolution, **88.8% of all Polymarket markets are priced below 5 cents or above 95 cents.** These aren't uncertain outcomes. They're markets where Bitcoin didn't hit $1 million by Friday, or where a candidate dropped out of a race weeks ago, or where the weather already happened. The result is already known or nearly known — the market just hasn't formally closed yet.

Think of a weather forecaster who gets credit for correctly predicting it won't snow in July. Technically accurate. Not very useful.

When you split the data, the picture changes completely:

| Market Type | Share of All Markets | Accuracy |
|---|---|---|
| Near-certain (priced <5% or >95%) | 88.8% | 99.7% |
| Competitive (priced 10-90%) | 8.3% | 75.6% |

Only 7,039 of 84,458 markets — **8.3%** — are genuinely competitive, meaning the outcome is still in play at the one-day mark. For those markets, Polymarket gets the direction right about three out of four times. That's respectable, but it's a very different story from 92%.

## Prices are systematically too high

A well-calibrated market should have its prices match reality. If you look at all the markets priced around 30 cents, about 30% of them should end up happening. We checked every price range. None of them pass that test.

| Market Price | How Often the Event Actually Happened | Overestimate |  N |
|---|---|---|---|
| 0-5% | 0.2% | -0.2 pp | 61,525 |
| 5-10% | 4.2% | -2.5 pp | 2,027 |
| 10-20% | 7.6% | -6.0 pp | 1,976 |
| **20-30%** | **15.9%** | **-8.1 pp** | **1,288** |
| 30-40% | 28.4% | -5.7 pp | 830 |
| 40-50% | 40.2% | -4.5 pp | 789 |
| 50-60% | 53.2% | -0.2 pp | 726 |
| 60-70% | 60.9% | -3.4 pp | 447 |
| 70-80% | 72.5% | -1.8 pp | 403 |
| 80-90% | 79.1% | -5.6 pp | 497 |
| 90-95% | 88.2% | -3.9 pp | 389 |
| 95-100% | 99.2% | -0.4 pp | 13,561 |

Every single row shows negative bias — prices overestimate how likely events are to happen. The worst offender is the 20-30% range: a market priced at 25 cents implies a 25% chance, but the event only happens about 16% of the time. That's a 9-cent gap between what the market says and what actually occurs.

This pattern has a name in forecasting research: **longshot bias**. People consistently overpay for unlikely outcomes. It shows up in horse racing, sports betting, and now prediction markets.

## Where predictions are hardest

The accuracy gap varies by category. Here's how different market types compare when you strip out the near-certain outcomes:

| Category | Headline Accuracy | Competitive Accuracy | % Near-Certain |
|---|---|---|---|
| Sports | 96.9% | 73.8% | 89.9% |
| Crypto | 98.6% | 79.8% | 94.2% |
| Politics | 96.6% | 75.5% | 87.5% |
| Weather | 99.3% | 76.5% | 98.3% |
| Culture | 98.3% | 78.4% | 93.7% |
| Business | 98.0% | 76.0% | 95.2% |
| Technology | 99.2% | 76.5% | 97.9% |

Sports markets are the hardest to predict — competitive accuracy is just 73.8%. This makes intuitive sense: athletic outcomes have irreducible randomness. Crypto markets perform best at 79.8%, possibly because the participants are more quantitatively sophisticated or have better information.

The headline accuracy column makes every category look stellar (96-99%). The competitive accuracy column tells the real story: a 6-percentage-point spread between the easiest and hardest categories, all in the mid-to-high 70s.

## The "improving accuracy" story is a mirage

Polymarket's headline accuracy has climbed from 83% in early 2023 to nearly 99% today. But that improvement is almost entirely explained by a shift in market composition — a growing share of markets are near-certain outcomes rather than competitive ones.

| Period | Overall Accuracy | Competitive Accuracy | Competitive Markets |
|---|---|---|---|
| Q1 2023 | 83.3% | 56.4% | 39 |
| Q1 2024 | 96.6% | 79.5% | 83 |
| Q4 2024 | 95.9% | 75.8% | 743 |
| Q4 2025 | 98.5% | 80.3% | 1,512 |
| Q1 2026 | 98.8% | 75.4% | 499 |

Competitive accuracy has hovered between 70% and 80% since mid-2023, with no clear upward trend. The platform has gotten much bigger — Q4 2025 had 24,000+ resolved markets — but not measurably better at pricing uncertain outcomes.

## What this means

None of this makes Polymarket useless. Getting uncertain outcomes right 76% of the time is better than most individual forecasters, pundits, or polls. And the prices, while systematically too high, still contain real information about relative probabilities.

But anyone citing "92% accuracy" as evidence that prediction markets are highly reliable should know what that number actually contains. The takeaways:

- **The headline accuracy is inflated by composition.** Nearly 9 in 10 markets are already resolved in all but name one day before they close. Exclude those, and accuracy drops to 76%.
- **Prices overestimate probabilities across the board.** The worst miscalibration is in the 20-30% range, where markets overstate the likelihood of events by about 8 percentage points.
- **The platform is growing, not improving.** Volume has increased dramatically, but the ability to price genuinely uncertain outcomes has been roughly flat for two years.
- **Ask what's in the denominator.** Any accuracy metric is only as meaningful as the set of predictions it covers.

---

## Methodology

**Data**: On-chain records from Polygon via [Allium](https://www.allium.so/), covering 124,000+ resolved prediction markets from January 2022 to February 2026. We analyzed the "Yes" token for each market and used the last daily price snapshot before resolution as the market's implied probability.

**Accuracy definition**: Following McCullough's methodology — a market priced above 50 cents that resolves "Yes," or below 50 cents that resolves "No," counts as correct. We also compute Brier scores (the squared difference between predicted probability and actual outcome, averaged across markets) as a more granular measure of calibration quality.

**"Competitive" market definition**: Markets priced between 10% and 90% one day before resolution. We chose this range to exclude outcomes that are effectively decided. Using a tighter range (20-80%) or looser range (5-95%) produces qualitatively identical conclusions.

**Reproducibility**: All SQL queries are available in the [`queries/`](queries/) directory and can be run against Allium's public prediction market tables. This analysis builds on and extends Alex McCullough's [original Dune dashboard](https://dune.com/alexmccullough/how-accurate-is-polymarket).
