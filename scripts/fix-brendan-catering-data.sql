-- Options to handle the "Brendan Catering" system account data skewing

-- Option 1: Mark as system account (soft approach)
-- Add a flag to identify system accounts
-- ALTER TABLE operator_summaries ADD COLUMN is_system_account BOOLEAN DEFAULT FALSE;
-- UPDATE operator_summaries SET is_system_account = TRUE WHERE name = 'Brendan Catering';

-- Option 2: Redistribute Brendan Catering's sales across other operators proportionally
-- This creates a more realistic distribution while preserving total sales

-- Step 1: Get Brendan Catering's total impact
WITH brendan_stats AS (
  SELECT 
    SUM(total_sales) as brendan_total_sales,
    COUNT(*) as brendan_entries
  FROM operator_summaries 
  WHERE name = 'Brendan Catering'
),
normal_operators AS (
  SELECT 
    name,
    total_sales,
    ROW_NUMBER() OVER (ORDER BY total_sales DESC) as sales_rank
  FROM operator_summaries 
  WHERE name != 'Brendan Catering' 
    AND total_sales > 0
),
redistribution_factors AS (
  SELECT 
    name,
    total_sales,
    -- Higher performing operators get a larger share of redistributed sales
    (total_sales / SUM(total_sales) OVER ()) as distribution_factor,
    sales_rank
  FROM normal_operators
  WHERE sales_rank <= 50 -- Distribute among top 50 performers
)
SELECT 
  name,
  total_sales as original_sales,
  ROUND((total_sales + (
    SELECT brendan_total_sales * distribution_factor 
    FROM brendan_stats, redistribution_factors r 
    WHERE r.name = normal_operators.name
  ))::numeric, 2) as adjusted_sales
FROM normal_operators
WHERE sales_rank <= 10
ORDER BY adjusted_sales DESC;

-- Option 3: Cap Brendan Catering entries to reasonable amounts
-- UPDATE operator_summaries 
-- SET total_sales = CASE 
--   WHEN total_sales > 5000 THEN 
--     ROUND((RANDOM() * 3000 + 1000)::numeric, 2) -- Cap between $1000-$4000
--   ELSE total_sales
-- END
-- WHERE name = 'Brendan Catering';

-- Option 4: Merge all Brendan Catering entries into a single "Corporate/System" entry
-- INSERT INTO operator_summaries (name, total_sales, transaction_count, venue) 
-- SELECT 
--   'Corporate/System Sales',
--   SUM(total_sales),
--   SUM(transaction_count),
--   'McBrew - QLD'
-- FROM operator_summaries 
-- WHERE name = 'Brendan Catering';
-- 
-- DELETE FROM operator_summaries WHERE name = 'Brendan Catering';

-- Option 5: Convert to more realistic individual entries
-- This spreads the Brendan Catering data across fictional but realistic operator names