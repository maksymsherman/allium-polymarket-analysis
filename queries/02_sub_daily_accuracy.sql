-- Sub-daily accuracy: 4h and 12h before resolution using trade-level data
WITH resolved_markets AS (
  SELECT condition_id, token_id, is_winner, resolved_at
  FROM polygon.predictions.markets
  WHERE resolved_at IS NOT NULL
    AND token_outcome = 'Yes'
    AND is_winner IS NOT NULL
    AND resolved_at >= '2024-01-01'
),
trades_with_horizon AS (
  SELECT
    t.condition_id,
    t.price as trade_price,
    m.is_winner,
    DATEDIFF('hour', t.block_timestamp, m.resolved_at) as hours_before,
    CASE
      WHEN DATEDIFF('hour', t.block_timestamp, m.resolved_at) BETWEEN 3 AND 5 THEN '4h'
      WHEN DATEDIFF('hour', t.block_timestamp, m.resolved_at) BETWEEN 11 AND 13 THEN '12h'
    END as horizon
  FROM polygon.predictions.trades t
  INNER JOIN resolved_markets m ON t.condition_id = m.condition_id AND t.asset_id = m.token_id
  WHERE t.block_timestamp >= '2024-01-01'
    AND t.price > 0 AND t.price < 1
    AND DATEDIFF('hour', t.block_timestamp, m.resolved_at) BETWEEN 3 AND 13
  QUALIFY ROW_NUMBER() OVER (
    PARTITION BY t.condition_id,
      CASE
        WHEN DATEDIFF('hour', t.block_timestamp, m.resolved_at) BETWEEN 3 AND 5 THEN '4h'
        WHEN DATEDIFF('hour', t.block_timestamp, m.resolved_at) BETWEEN 11 AND 13 THEN '12h'
      END
    ORDER BY ABS(DATEDIFF('hour', t.block_timestamp, m.resolved_at) -
      CASE
        WHEN DATEDIFF('hour', t.block_timestamp, m.resolved_at) BETWEEN 3 AND 5 THEN 4
        ELSE 12
      END)
  ) = 1
)
SELECT
  horizon,
  COUNT(*) as num_markets,
  ROUND(100.0 * SUM(CASE
    WHEN (trade_price > 0.5 AND is_winner) OR (trade_price < 0.5 AND NOT is_winner) THEN 1 ELSE 0
  END) / COUNT(*), 1) as accuracy_pct,
  ROUND(AVG(POWER(trade_price - CASE WHEN is_winner THEN 1 ELSE 0 END, 2)), 4) as brier_score,
  ROUND(AVG(CASE WHEN is_winner THEN trade_price END), 3) as avg_winner_price,
  ROUND(AVG(CASE WHEN NOT is_winner THEN trade_price END), 3) as avg_loser_price
FROM trades_with_horizon
WHERE horizon IS NOT NULL
GROUP BY horizon
ORDER BY horizon
