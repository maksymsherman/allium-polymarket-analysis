-- The denominator problem: tail concentration inflates headline accuracy
-- Shows that ~89% of markets are near-certain outcomes
WITH resolved_yes_tokens AS (
  SELECT m.condition_id, m.token_id, m.is_winner, m.resolved_at
  FROM polygon.predictions.markets m
  WHERE m.resolved_at IS NOT NULL
    AND m.token_outcome = 'Yes'
    AND m.is_winner IS NOT NULL
),
day_before_prices AS (
  SELECT p.condition_id, p.price, r.is_winner
  FROM polygon.predictions.token_prices_daily p
  INNER JOIN resolved_yes_tokens r
    ON p.condition_id = r.condition_id AND p.token_id = r.token_id
  WHERE DATEDIFF('day', p.day, r.resolved_at::date) BETWEEN 0 AND 1
    AND p.price IS NOT NULL AND p.price > 0 AND p.price < 1
  QUALIFY ROW_NUMBER() OVER (PARTITION BY p.condition_id ORDER BY p.day DESC) = 1
)
SELECT
  COUNT(*) as total_markets,
  SUM(CASE WHEN price < 0.05 OR price > 0.95 THEN 1 ELSE 0 END) as near_certain_5pct,
  ROUND(100.0 * SUM(CASE WHEN price < 0.05 OR price > 0.95 THEN 1 ELSE 0 END) / COUNT(*), 1) as pct_near_certain_5pct,
  SUM(CASE WHEN price < 0.10 OR price > 0.90 THEN 1 ELSE 0 END) as near_certain_10pct,
  ROUND(100.0 * SUM(CASE WHEN price < 0.10 OR price > 0.90 THEN 1 ELSE 0 END) / COUNT(*), 1) as pct_near_certain_10pct,
  SUM(CASE WHEN price BETWEEN 0.10 AND 0.90 THEN 1 ELSE 0 END) as competitive_markets,
  ROUND(100.0 * SUM(CASE WHEN price BETWEEN 0.10 AND 0.90 THEN 1 ELSE 0 END) / COUNT(*), 1) as pct_competitive,
  -- Accuracy: near-certain vs competitive
  ROUND(100.0 * SUM(CASE WHEN (price < 0.05 OR price > 0.95) AND ((price > 0.5 AND is_winner) OR (price < 0.5 AND NOT is_winner)) THEN 1 ELSE 0 END)
    / NULLIF(SUM(CASE WHEN price < 0.05 OR price > 0.95 THEN 1 ELSE 0 END), 0), 1) as accuracy_near_certain,
  ROUND(100.0 * SUM(CASE WHEN price BETWEEN 0.10 AND 0.90 AND ((price > 0.5 AND is_winner) OR (price < 0.5 AND NOT is_winner)) THEN 1 ELSE 0 END)
    / NULLIF(SUM(CASE WHEN price BETWEEN 0.10 AND 0.90 THEN 1 ELSE 0 END), 0), 1) as accuracy_competitive
FROM day_before_prices
