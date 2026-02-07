-- Accuracy, calibration curve, and denominator breakdown by market type
--
-- Replaces old queries: 01, 03, 05, 07
--
-- Fixes applied (responding to McCullough critique):
--   1. Separates binary markets from multi-outcome (NEG_RISK) markets
--   2. Uses DATEDIFF BETWEEN 1 AND 2 (strict day-before, excludes resolution day)
--   3. Handles price = 0.50 explicitly (excluded from binary accuracy)
--   4. Adds 95% confidence intervals on win rates
--   5. Reports question-level counts via market_id grouping

WITH resolved_markets AS (
  SELECT
    m.condition_id,
    m.token_id,
    m.market_id,
    m.neg_risk,
    m.is_winner,
    m.resolved_at,
    CASE
      WHEN m.neg_risk = true THEN 'multi_outcome'
      WHEN m.neg_risk = false THEN 'binary'
      ELSE 'unknown'
    END AS market_type,
    -- Effective question grouping: market_id for multi-outcome, condition_id for binary
    CASE
      WHEN m.neg_risk = true THEN m.market_id
      ELSE m.condition_id
    END AS effective_question_id
  FROM polygon.predictions.markets m
  WHERE m.resolved_at IS NOT NULL
    AND m.token_outcome = 'Yes'
    AND m.is_winner IS NOT NULL
),

day_before_prices AS (
  SELECT
    r.condition_id,
    r.effective_question_id,
    r.market_type,
    r.is_winner,
    p.price,
    CASE WHEN r.is_winner THEN 1 ELSE 0 END AS outcome,
    CASE
      WHEN price < 0.05 THEN '01: 0-5%'
      WHEN price < 0.10 THEN '02: 5-10%'
      WHEN price < 0.20 THEN '03: 10-20%'
      WHEN price < 0.30 THEN '04: 20-30%'
      WHEN price < 0.40 THEN '05: 30-40%'
      WHEN price < 0.50 THEN '06: 40-50%'
      WHEN price = 0.50 THEN '07: 50% exact'
      WHEN price < 0.60 THEN '08: 50-60%'
      WHEN price < 0.70 THEN '09: 60-70%'
      WHEN price < 0.80 THEN '10: 70-80%'
      WHEN price < 0.90 THEN '11: 80-90%'
      WHEN price < 0.95 THEN '12: 90-95%'
      ELSE '13: 95-100%'
    END AS price_bucket,
    CASE
      WHEN price > 0.50 AND r.is_winner THEN 1
      WHEN price < 0.50 AND NOT r.is_winner THEN 1
      WHEN price = 0.50 THEN NULL
      ELSE 0
    END AS is_correct
  FROM polygon.predictions.token_prices_daily p
  INNER JOIN resolved_markets r
    ON p.condition_id = r.condition_id
    AND p.token_id = r.token_id
  WHERE DATEDIFF('day', p.day, r.resolved_at::date) BETWEEN 1 AND 2
    AND p.price IS NOT NULL
    AND p.price > 0
    AND p.price < 1
  QUALIFY ROW_NUMBER() OVER (
    PARTITION BY p.condition_id
    ORDER BY p.day DESC
  ) = 1
)

SELECT
  market_type,
  price_bucket,
  COUNT(*) AS n_tokens,
  COUNT(DISTINCT effective_question_id) AS n_questions,
  ROUND(100.0 * AVG(is_correct), 1) AS accuracy_pct,
  ROUND(100.0 * AVG(outcome), 1) AS actual_win_rate_pct,
  ROUND(100.0 * AVG(price), 1) AS avg_implied_prob_pct,
  ROUND(100.0 * AVG(outcome) - 100.0 * AVG(price), 1) AS bias_pp,
  ROUND(AVG(POWER(price - outcome, 2)), 4) AS brier_score,
  ROUND(
    100.0 * AVG(outcome)
    - 1.96 * 100.0 * SQRT(AVG(outcome) * (1 - AVG(outcome)) / NULLIF(COUNT(*), 0)),
    1
  ) AS win_rate_ci_lo_pct,
  ROUND(
    100.0 * AVG(outcome)
    + 1.96 * 100.0 * SQRT(AVG(outcome) * (1 - AVG(outcome)) / NULLIF(COUNT(*), 0)),
    1
  ) AS win_rate_ci_hi_pct
FROM day_before_prices
GROUP BY market_type, price_bucket
ORDER BY market_type, price_bucket
