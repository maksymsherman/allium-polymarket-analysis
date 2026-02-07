-- Asymmetric bias: Do markets systematically overpredict "Yes"?
-- Shows the 4.3x skew toward No-favored markets
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
  CASE WHEN price > 0.5 THEN 'Yes favored (>50%)' ELSE 'No favored (<50%)' END as market_direction,
  COUNT(*) as num_markets,
  SUM(CASE WHEN is_winner THEN 1 ELSE 0 END) as yes_won,
  SUM(CASE WHEN NOT is_winner THEN 1 ELSE 0 END) as no_won,
  ROUND(100.0 * SUM(CASE WHEN is_winner THEN 1 ELSE 0 END) / COUNT(*), 1) as yes_win_rate,
  ROUND(AVG(price), 3) as avg_price,
  ROUND(100.0 * SUM(CASE
    WHEN (price > 0.5 AND is_winner) OR (price < 0.5 AND NOT is_winner) THEN 1 ELSE 0
  END) / COUNT(*), 1) as accuracy_pct
FROM day_before_prices
GROUP BY 1
