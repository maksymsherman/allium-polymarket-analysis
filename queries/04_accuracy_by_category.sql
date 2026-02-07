-- Accuracy by category at 1-day horizon
-- Compares headline accuracy vs accuracy excluding tail markets (10-90%)
WITH resolved_yes_tokens AS (
  SELECT m.condition_id, m.token_id, m.is_winner, m.resolved_at, m.category
  FROM polygon.predictions.markets m
  WHERE m.resolved_at IS NOT NULL
    AND m.token_outcome = 'Yes'
    AND m.is_winner IS NOT NULL
),
day_before_prices AS (
  SELECT p.condition_id, p.price, r.is_winner, r.category
  FROM polygon.predictions.token_prices_daily p
  INNER JOIN resolved_yes_tokens r
    ON p.condition_id = r.condition_id AND p.token_id = r.token_id
  WHERE DATEDIFF('day', p.day, r.resolved_at::date) BETWEEN 0 AND 1
    AND p.price IS NOT NULL AND p.price > 0 AND p.price < 1
  QUALIFY ROW_NUMBER() OVER (PARTITION BY p.condition_id ORDER BY p.day DESC) = 1
)
SELECT
  category,
  COUNT(*) as num_markets,
  ROUND(100.0 * SUM(CASE
    WHEN (price > 0.5 AND is_winner) OR (price < 0.5 AND NOT is_winner) THEN 1 ELSE 0
  END) / COUNT(*), 1) as accuracy_pct,
  ROUND(100.0 * SUM(CASE
    WHEN price BETWEEN 0.10 AND 0.90 AND ((price > 0.5 AND is_winner) OR (price < 0.5 AND NOT is_winner)) THEN 1 ELSE 0
  END) / NULLIF(SUM(CASE WHEN price BETWEEN 0.10 AND 0.90 THEN 1 ELSE 0 END), 0), 1) as accuracy_excl_tails_pct,
  ROUND(AVG(POWER(price - CASE WHEN is_winner THEN 1 ELSE 0 END, 2)), 4) as brier_score,
  ROUND(100.0 * SUM(CASE WHEN price < 0.10 OR price > 0.90 THEN 1 ELSE 0 END) / COUNT(*), 1) as pct_in_tails
FROM day_before_prices
GROUP BY category
ORDER BY num_markets DESC
