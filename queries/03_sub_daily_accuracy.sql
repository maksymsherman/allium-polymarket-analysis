-- Sub-daily accuracy: 4h and 12h before resolution using trade-level data
--
-- NOTE: This query uses polygon.predictions.trades (individual trades),
-- NOT token_prices_daily. Results cover 2024-01-01 onwards only.
-- These numbers should NOT be presented alongside daily-snapshot results
-- without disclosing the different data source and time range.
--
-- Fixes applied (responding to McCullough critique):
--   1. Separates binary vs multi-outcome (NEG_RISK) markets
--   2. Handles price = 0.50 explicitly

WITH resolved_markets AS (
  SELECT
    m.condition_id,
    m.token_id,
    m.is_winner,
    m.resolved_at,
    CASE
      WHEN m.neg_risk = true THEN 'multi_outcome'
      WHEN m.neg_risk = false THEN 'binary'
      ELSE 'unknown'
    END AS market_type
  FROM polygon.predictions.markets m
  WHERE m.resolved_at IS NOT NULL
    AND m.token_outcome = 'Yes'
    AND m.is_winner IS NOT NULL
    AND m.resolved_at >= '2024-01-01'
),

trades_with_horizon AS (
  SELECT
    t.condition_id,
    t.price AS trade_price,
    m.is_winner,
    m.market_type,
    DATEDIFF('hour', t.block_timestamp, m.resolved_at) AS hours_before,
    CASE
      WHEN DATEDIFF('hour', t.block_timestamp, m.resolved_at) BETWEEN 3 AND 5 THEN '4h'
      WHEN DATEDIFF('hour', t.block_timestamp, m.resolved_at) BETWEEN 11 AND 13 THEN '12h'
    END AS horizon
  FROM polygon.predictions.trades t
  INNER JOIN resolved_markets m
    ON t.condition_id = m.condition_id
    AND t.asset_id = m.token_id
  WHERE t.block_timestamp >= '2024-01-01'
    AND t.price > 0
    AND t.price < 1
    AND DATEDIFF('hour', t.block_timestamp, m.resolved_at) BETWEEN 3 AND 13
  QUALIFY ROW_NUMBER() OVER (
    PARTITION BY t.condition_id, horizon
    ORDER BY ABS(DATEDIFF('hour', t.block_timestamp, m.resolved_at) -
      CASE
        WHEN DATEDIFF('hour', t.block_timestamp, m.resolved_at) BETWEEN 3 AND 5 THEN 4
        ELSE 12
      END)
  ) = 1
)

SELECT
  horizon,
  market_type,
  COUNT(*) AS n_tokens,
  ROUND(100.0 * SUM(CASE
    WHEN trade_price > 0.5 AND is_winner THEN 1
    WHEN trade_price < 0.5 AND NOT is_winner THEN 1
    WHEN trade_price = 0.5 THEN NULL
    ELSE 0
  END) / NULLIF(SUM(CASE WHEN trade_price != 0.5 THEN 1 ELSE 0 END), 0), 1) AS accuracy_pct,
  ROUND(AVG(POWER(trade_price - CASE WHEN is_winner THEN 1 ELSE 0 END, 2)), 4) AS brier_score
FROM trades_with_horizon
WHERE horizon IS NOT NULL
GROUP BY horizon, market_type
ORDER BY horizon, market_type
