-- Category breakdown and temporal trend by market type
--
-- Replaces old queries: 04, 06
--
-- Fixes applied (responding to McCullough critique):
--   1. Separates binary vs multi-outcome (NEG_RISK) markets
--   2. Strict day-before price (excludes resolution day)
--   3. Handles price = 0.50 explicitly
--   4. Reports question-level counts via market_id grouping
--   5. Flags incomplete quarters via max resolution date

WITH resolved_markets AS (
  SELECT
    m.condition_id,
    m.token_id,
    m.market_id,
    m.neg_risk,
    m.is_winner,
    m.resolved_at,
    m.category,
    CASE
      WHEN m.neg_risk = true THEN 'multi_outcome'
      WHEN m.neg_risk = false THEN 'binary'
      ELSE 'unknown'
    END AS market_type,
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
    r.category,
    r.is_winner,
    r.resolved_at,
    p.price,
    CASE WHEN r.is_winner THEN 1 ELSE 0 END AS outcome,
    DATE_TRUNC('quarter', r.resolved_at) AS resolution_quarter,
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

-- Part 1: By category
SELECT
  'category' AS group_type,
  category AS group_value,
  market_type,
  COUNT(*) AS n_tokens,
  COUNT(DISTINCT effective_question_id) AS n_questions,
  SUM(CASE WHEN price BETWEEN 0.10 AND 0.90 THEN 1 ELSE 0 END) AS n_competitive,
  ROUND(100.0 * AVG(is_correct), 1) AS accuracy_pct,
  ROUND(
    100.0 * SUM(
      CASE WHEN price BETWEEN 0.10 AND 0.90 THEN is_correct END
    ) / NULLIF(
      SUM(CASE WHEN price BETWEEN 0.10 AND 0.90 AND is_correct IS NOT NULL THEN 1 ELSE 0 END),
      0
    ),
    1
  ) AS competitive_accuracy_pct,
  ROUND(AVG(POWER(price - outcome, 2)), 4) AS brier_score,
  ROUND(100.0 * SUM(CASE WHEN price < 0.10 OR price > 0.90 THEN 1 ELSE 0 END) / COUNT(*), 1) AS pct_in_tails,
  NULL AS max_resolution_date
FROM day_before_prices
GROUP BY category, market_type

UNION ALL

-- Part 2: By quarter
SELECT
  'quarter' AS group_type,
  TO_CHAR(resolution_quarter, 'YYYY-MM') AS group_value,
  market_type,
  COUNT(*) AS n_tokens,
  COUNT(DISTINCT effective_question_id) AS n_questions,
  SUM(CASE WHEN price BETWEEN 0.10 AND 0.90 THEN 1 ELSE 0 END) AS n_competitive,
  ROUND(100.0 * AVG(is_correct), 1) AS accuracy_pct,
  ROUND(
    100.0 * SUM(
      CASE WHEN price BETWEEN 0.10 AND 0.90 THEN is_correct END
    ) / NULLIF(
      SUM(CASE WHEN price BETWEEN 0.10 AND 0.90 AND is_correct IS NOT NULL THEN 1 ELSE 0 END),
      0
    ),
    1
  ) AS competitive_accuracy_pct,
  ROUND(AVG(POWER(price - outcome, 2)), 4) AS brier_score,
  ROUND(100.0 * SUM(CASE WHEN price < 0.10 OR price > 0.90 THEN 1 ELSE 0 END) / COUNT(*), 1) AS pct_in_tails,
  MAX(resolved_at)::date AS max_resolution_date
FROM day_before_prices
WHERE resolution_quarter >= '2023-01-01'
GROUP BY resolution_quarter, market_type

ORDER BY group_type, group_value, market_type
