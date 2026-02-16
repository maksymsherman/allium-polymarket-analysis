-- Replication of McCullough's "How Accurate is Polymarket" methodology
--
-- Purpose: Verify that Allium data produces the same numbers as McCullough's
-- Dune dashboard. This uses his EXACT approach — no corrections.
--
-- McCullough's methodology:
--   1. All resolved Yes tokens treated as independent observations
--   2. DATEDIFF BETWEEN 0 AND 1 (includes resolution-day prices)
--   3. Price = 0.50 counted as incorrect regardless of outcome
--   4. No binary vs multi-outcome split
--   5. Simple >50% = Yes prediction, <50% = No prediction

WITH resolved_markets AS (
  SELECT
    m.condition_id,
    m.token_id,
    m.is_winner,
    m.resolved_at
  FROM polygon.predictions.markets m
  WHERE m.resolved_at IS NOT NULL
    AND m.token_outcome = 'Yes'
    AND m.is_winner IS NOT NULL
),

day_before_prices AS (
  SELECT
    r.condition_id,
    r.is_winner,
    p.price,
    CASE WHEN r.is_winner THEN 1 ELSE 0 END AS outcome,
    -- McCullough's accuracy: >50% and wins, or <50% and loses = correct
    -- Price = 50% is always "incorrect" in his methodology
    CASE
      WHEN p.price > 0.50 AND r.is_winner THEN 1
      WHEN p.price < 0.50 AND NOT r.is_winner THEN 1
      ELSE 0
    END AS is_correct,
    -- Bucket assignment (McCullough uses 10pp buckets)
    CASE
      WHEN p.price < 0.10 THEN '0-10%'
      WHEN p.price < 0.20 THEN '10-20%'
      WHEN p.price < 0.30 THEN '20-30%'
      WHEN p.price < 0.40 THEN '30-40%'
      WHEN p.price < 0.50 THEN '40-50%'
      WHEN p.price < 0.60 THEN '50-60%'
      WHEN p.price < 0.70 THEN '60-70%'
      WHEN p.price < 0.80 THEN '70-80%'
      WHEN p.price < 0.90 THEN '80-90%'
      ELSE '90-100%'
    END AS price_bucket
  FROM polygon.predictions.token_prices_daily p
  INNER JOIN resolved_markets r
    ON p.condition_id = r.condition_id
    AND p.token_id = r.token_id
  -- McCullough uses BETWEEN 0 AND 1 (includes resolution day)
  WHERE DATEDIFF('day', p.day, r.resolved_at::date) BETWEEN 0 AND 1
    AND p.price IS NOT NULL
    AND p.price > 0
    AND p.price < 1
  QUALIFY ROW_NUMBER() OVER (
    PARTITION BY p.condition_id
    ORDER BY p.day DESC
  ) = 1
)

-- Headline accuracy + calibration by bucket
SELECT
  'all' AS grouping,
  price_bucket,
  COUNT(*) AS n_tokens,
  ROUND(100.0 * AVG(is_correct), 1) AS accuracy_pct,
  ROUND(100.0 * AVG(outcome), 1) AS actual_win_rate_pct,
  ROUND(100.0 * AVG(price), 1) AS avg_implied_prob_pct,
  ROUND(100.0 * AVG(outcome) - 100.0 * AVG(price), 1) AS bias_pp
FROM day_before_prices
GROUP BY price_bucket

UNION ALL

-- Overall headline number
SELECT
  'headline' AS grouping,
  'TOTAL' AS price_bucket,
  COUNT(*) AS n_tokens,
  ROUND(100.0 * AVG(is_correct), 1) AS accuracy_pct,
  ROUND(100.0 * AVG(outcome), 1) AS actual_win_rate_pct,
  ROUND(100.0 * AVG(price), 1) AS avg_implied_prob_pct,
  ROUND(100.0 * AVG(outcome) - 100.0 * AVG(price), 1) AS bias_pp
FROM day_before_prices

ORDER BY grouping, price_bucket
