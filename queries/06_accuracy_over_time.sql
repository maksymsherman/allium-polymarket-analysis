-- Temporal trend: Is Polymarket getting more accurate over time?
-- Compares overall vs competitive-only accuracy by quarter
WITH resolved_yes_tokens AS (
  SELECT m.condition_id, m.token_id, m.is_winner, m.resolved_at, m.category
  FROM polygon.predictions.markets m
  WHERE m.resolved_at IS NOT NULL
    AND m.token_outcome = 'Yes'
    AND m.is_winner IS NOT NULL
    AND m.resolved_at >= '2023-01-01'
),
day_before_prices AS (
  SELECT
    p.condition_id, p.price, r.is_winner, r.resolved_at,
    DATE_TRUNC('quarter', r.resolved_at) as resolution_quarter
  FROM polygon.predictions.token_prices_daily p
  INNER JOIN resolved_yes_tokens r
    ON p.condition_id = r.condition_id AND p.token_id = r.token_id
  WHERE DATEDIFF('day', p.day, r.resolved_at::date) BETWEEN 0 AND 1
    AND p.price IS NOT NULL AND p.price > 0 AND p.price < 1
  QUALIFY ROW_NUMBER() OVER (PARTITION BY p.condition_id ORDER BY p.day DESC) = 1
)
SELECT
  resolution_quarter,
  COUNT(*) as total_markets,
  SUM(CASE WHEN price BETWEEN 0.10 AND 0.90 THEN 1 ELSE 0 END) as competitive_markets,
  -- Overall accuracy
  ROUND(100.0 * SUM(CASE WHEN (price > 0.5 AND is_winner) OR (price < 0.5 AND NOT is_winner) THEN 1 ELSE 0 END) / COUNT(*), 1) as overall_accuracy,
  -- Competitive-only accuracy
  ROUND(100.0 * SUM(CASE WHEN price BETWEEN 0.10 AND 0.90 AND ((price > 0.5 AND is_winner) OR (price < 0.5 AND NOT is_winner)) THEN 1 ELSE 0 END)
    / NULLIF(SUM(CASE WHEN price BETWEEN 0.10 AND 0.90 THEN 1 ELSE 0 END), 0), 1) as competitive_accuracy,
  -- Overall Brier
  ROUND(AVG(POWER(price - CASE WHEN is_winner THEN 1 ELSE 0 END, 2)), 4) as overall_brier,
  -- Competitive-only Brier
  ROUND(AVG(CASE WHEN price BETWEEN 0.10 AND 0.90 THEN POWER(price - CASE WHEN is_winner THEN 1 ELSE 0 END, 2) END), 4) as competitive_brier
FROM day_before_prices
GROUP BY resolution_quarter
ORDER BY resolution_quarter
