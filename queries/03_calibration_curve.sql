-- Calibration curve: Are markets priced at X% actually correct X% of the time?
-- Reveals systematic overpricing / longshot bias
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
  CASE
    WHEN price < 0.05 THEN '0-5%'
    WHEN price < 0.10 THEN '5-10%'
    WHEN price < 0.20 THEN '10-20%'
    WHEN price < 0.30 THEN '20-30%'
    WHEN price < 0.40 THEN '30-40%'
    WHEN price < 0.50 THEN '40-50%'
    WHEN price < 0.60 THEN '50-60%'
    WHEN price < 0.70 THEN '60-70%'
    WHEN price < 0.80 THEN '70-80%'
    WHEN price < 0.90 THEN '80-90%'
    WHEN price < 0.95 THEN '90-95%'
    ELSE '95-100%'
  END as price_bucket,
  COUNT(*) as num_markets,
  ROUND(100.0 * SUM(CASE WHEN is_winner THEN 1 ELSE 0 END) / COUNT(*), 1) as actual_win_rate,
  ROUND(AVG(price) * 100, 1) as avg_implied_probability,
  ROUND(100.0 * SUM(CASE WHEN is_winner THEN 1 ELSE 0 END) / COUNT(*) - AVG(price) * 100, 1) as bias_ppts
FROM day_before_prices
GROUP BY 1
ORDER BY avg_implied_probability
