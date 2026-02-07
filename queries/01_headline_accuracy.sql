-- Polymarket Headline Accuracy: 1 day, 1 week, 1 month before resolution
-- Replicates McCullough's Dune dashboard methodology using daily price data
WITH resolved_markets AS (
  SELECT
    condition_id,
    token_id,
    token_outcome,
    is_winner,
    resolved_at,
    category,
    question
  FROM polygon.predictions.markets
  WHERE resolved_at IS NOT NULL
    AND token_outcome = 'Yes'
    AND is_winner IS NOT NULL
),
prices_with_resolution AS (
  SELECT
    p.condition_id,
    p.token_id,
    p.day,
    p.price,
    m.resolved_at,
    m.is_winner,
    m.category,
    DATEDIFF('day', p.day, m.resolved_at::date) as days_before_resolution
  FROM polygon.predictions.token_prices_daily p
  INNER JOIN resolved_markets m
    ON p.condition_id = m.condition_id AND p.token_id = m.token_id
  WHERE p.price IS NOT NULL
    AND p.price > 0 AND p.price < 1
),
horizon_prices AS (
  SELECT
    condition_id,
    is_winner,
    category,
    price,
    days_before_resolution,
    CASE
      WHEN days_before_resolution BETWEEN 0 AND 1 THEN '1_day'
      WHEN days_before_resolution BETWEEN 6 AND 8 THEN '1_week'
      WHEN days_before_resolution BETWEEN 28 AND 32 THEN '1_month'
    END as horizon,
    ROW_NUMBER() OVER (
      PARTITION BY condition_id,
        CASE
          WHEN days_before_resolution BETWEEN 0 AND 1 THEN '1_day'
          WHEN days_before_resolution BETWEEN 6 AND 8 THEN '1_week'
          WHEN days_before_resolution BETWEEN 28 AND 32 THEN '1_month'
        END
      ORDER BY ABS(days_before_resolution - CASE
          WHEN days_before_resolution BETWEEN 0 AND 1 THEN 1
          WHEN days_before_resolution BETWEEN 6 AND 8 THEN 7
          WHEN days_before_resolution BETWEEN 28 AND 32 THEN 30
        END)
    ) as rn
  FROM prices_with_resolution
  WHERE days_before_resolution BETWEEN 0 AND 32
)
SELECT
  horizon,
  COUNT(*) as num_markets,
  ROUND(100.0 * SUM(CASE
    WHEN (price > 0.5 AND is_winner = true) OR (price < 0.5 AND is_winner = false) THEN 1
    ELSE 0
  END) / COUNT(*), 1) as accuracy_pct,
  ROUND(AVG(POWER(price - CASE WHEN is_winner THEN 1 ELSE 0 END, 2)), 4) as brier_score,
  ROUND(AVG(CASE WHEN is_winner THEN price END), 3) as avg_winner_price,
  ROUND(AVG(CASE WHEN NOT is_winner THEN price END), 3) as avg_loser_price
FROM horizon_prices
WHERE horizon IS NOT NULL AND rn = 1
GROUP BY horizon
ORDER BY horizon
