import { BigQuery } from '@google-cloud/bigquery';

// Initialise BigQuery client from GOOGLE_APPLICATION_CREDENTIALS_JSON env var
function getBigQueryClient() {
  const credentialsJson = process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON;
  if (!credentialsJson) {
    throw new Error('GOOGLE_APPLICATION_CREDENTIALS_JSON environment variable not set');
  }
  const credentials = JSON.parse(credentialsJson);
  return new BigQuery({
    projectId: credentials.project_id,
    credentials,
  });
}

// GL actuals + budget by period (auto-detects latest period with data)
const GL_QUERY = `
WITH date_dim AS (
  SELECT DISTINCT date_key, retail_period_number, retail_year
  FROM \`pj-suitsupply-data-dwh-prd\`.dwh_view.dim__date
  WHERE (retail_year = 2026 OR retail_year = 2025) AND retail_period_number BETWEEN 1 AND 13
),
gl_actuals AS (
  SELECT d.retail_year, d.retail_period_number, t.main_account as account,
    SUM(t.amount_in_reporting_currency) as amount
  FROM \`pj-suitsupply-data-dwh-prd\`.dwh_view.fct__ledger_transactions_d365 t
  JOIN date_dim d ON t.transaction_date_key = d.date_key
  JOIN \`pj-suitsupply-data-dwh-prd\`.dwh_view.dim__main_account_d365 a ON t.main_account = a.main_account_number
  WHERE a.category_label = '56 Logistics'
  GROUP BY 1,2,3
),
gl_budget AS (
  SELECT d.retail_year, d.retail_period_number, b.d365_account_key as account,
    SUM(b.budget_amount_budget_rate_eur) as amount
  FROM \`pj-suitsupply-data-dwh-prd\`.dwh_view.fct__ledger_budget b
  JOIN date_dim d ON b.budget_period_date_key = d.date_key
  WHERE b.pnl_account_category = '56 Logistics' AND d.retail_year = 2026
  GROUP BY 1,2,3
)
SELECT 
  a26.retail_period_number as period,
  a26.account,
  n.main_account_name as name,
  ROUND(a26.amount, 0) as actual,
  ROUND(COALESCE(b.amount, 0), 0) as budget,
  ROUND(COALESCE(ly.amount, 0), 0) as ly
FROM gl_actuals a26
LEFT JOIN gl_budget b ON a26.retail_period_number = b.retail_period_number AND a26.account = b.account
LEFT JOIN gl_actuals ly ON ly.retail_year = 2025 AND ly.retail_period_number = a26.retail_period_number AND ly.account = a26.account
LEFT JOIN \`pj-suitsupply-data-dwh-prd\`.dwh_view.dim__main_account_d365 n ON a26.account = n.main_account_number
WHERE a26.retail_year = 2026
  AND ABS(a26.amount) + ABS(COALESCE(b.amount, 0)) + ABS(COALESCE(ly.amount, 0)) > 0
ORDER BY period, account
LIMIT 300
`;

// Trisco Store-to-Warehouse transfers by period and region
const TRISCO_QUERY = `
WITH date_dim AS (
  SELECT DISTINCT CAST(date_key AS DATE) as date_val, retail_period_number
  FROM \`pj-suitsupply-data-dwh-prd\`.dwh_view.dim__date
  WHERE retail_year = 2026 AND retail_period_number BETWEEN 1 AND 13
)
SELECT 
  d.retail_period_number as period,
  CASE WHEN l.location_country IN ('United States', 'Canada') THEN 'NAM' ELSE 'EMEA' END as region,
  SUM(t.transfer_fulfilled_quantity) as units,
  ROUND(SUM(t.transfer_fulfilled_cost_amount_eur), 0) as inventory_cost
FROM \`pj-suitsupply-data-dwh-prd\`.dwh_view.fct__inventory_transfers t
JOIN \`pj-suitsupply-data-dwh-prd\`.dwh_view.dim__product p ON t.product_key = p.product_key
JOIN \`pj-suitsupply-data-dwh-prd\`.dwh_view.dim__location l ON t.ship_from_location_key = l.location_key
JOIN date_dim d ON t.transfer_fulfilled_date_utc = d.date_val
WHERE t.transfer_direction_description = 'Store to Warehouse'
  AND t.transfer_fulfilled_quantity > 0
  AND t.is_transfer_cancelled = FALSE AND t.is_transfer_deleted = FALSE
  AND p.item_code IN (
    'C261008','C6906','C7505','C7506','P7004','P7011','P7113','P7144',
    'P7135','P7203','P7217','P7221','P7275','C2299','C25201','C25209',
    'C9354','C3768','P7230','P7235','P7249','C6855','C7010','C261021',
    'C9555','C9565','C7334','C7777','C2148','C6860'
  )
GROUP BY 1, 2
ORDER BY 1, 2
`;

// UPS charges on HQ Transport (GL 5213115) for Trisco connection
const UPS_HQ_QUERY = `
WITH date_dim AS (
  SELECT DISTINCT date_key, retail_period_number
  FROM \`pj-suitsupply-data-dwh-prd\`.dwh_view.dim__date
  WHERE retail_year = 2026 AND retail_period_number BETWEEN 1 AND 13
)
SELECT 
  d.retail_period_number as period,
  ROUND(SUM(CASE WHEN LOWER(t.description) LIKE '%ups%' THEN t.amount_in_reporting_currency ELSE 0 END), 0) as ups_cost,
  ROUND(SUM(t.amount_in_reporting_currency), 0) as total_cost
FROM \`pj-suitsupply-data-dwh-prd\`.dwh_view.fct__ledger_transactions_d365 t
JOIN date_dim d ON t.transaction_date_key = d.date_key
WHERE t.main_account = '5213115'
GROUP BY 1
ORDER BY 1
`;

// Revenue for % of revenue calculation
const REVENUE_QUERY = `
WITH date_dim AS (
  SELECT DISTINCT date_key, retail_period_number, retail_year
  FROM \`pj-suitsupply-data-dwh-prd\`.dwh_view.dim__date
  WHERE (retail_year = 2026 OR retail_year = 2025) AND retail_period_number BETWEEN 1 AND 13
)
SELECT 
  d.retail_year as year, d.retail_period_number as period,
  ROUND(SUM(t.amount_in_reporting_currency), 0) as revenue
FROM \`pj-suitsupply-data-dwh-prd\`.dwh_view.fct__ledger_transactions_d365 t
JOIN date_dim d ON t.transaction_date_key = d.date_key
JOIN \`pj-suitsupply-data-dwh-prd\`.dwh_view.dim__main_account_d365 a ON t.main_account = a.main_account_number
WHERE a.category_label = '50 Net Sales'
GROUP BY 1, 2
ORDER BY 1, 2
`;

export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=7200');

  try {
    const bq = getBigQueryClient();

    const [glRows] = await bq.query({ query: GL_QUERY });
    const [triscoRows] = await bq.query({ query: TRISCO_QUERY });
    const [upsRows] = await bq.query({ query: UPS_HQ_QUERY });
    const [revenueRows] = await bq.query({ query: REVENUE_QUERY });

    res.status(200).json({
      generated_at: new Date().toISOString(),
      gl: glRows,
      trisco_transfers: triscoRows,
      ups_hq_transport: upsRows,
      revenue: revenueRows,
    });
  } catch (err) {
    console.error('BigQuery error:', err);
    res.status(500).json({ error: err.message });
  }
}
