# Suitsupply Logistics Cost Analysis Dashboard

Live, auto-updating logistics cost dashboard. Pulls GL actuals, budget, inventory transfers, and revenue directly from BigQuery. New periods appear automatically as they land in D365.

## Architecture

```
Browser â Vercel (React SPA) â /api/data (serverless function) â BigQuery
```

- **Frontend**: Vite + React â interactive GL table with expandable decomposition panels
- **API**: Vercel serverless function (`/api/data.js`) â runs 4 BigQuery queries, returns JSON
- **Data**: D365 GL actuals, budget, Trisco inventory transfers, UPS transport, revenue
- **Caching**: 1-hour server-side cache (`s-maxage=3600`) to limit BigQuery usage
- **Fallback**: Hardcoded P1+P2 data if API is unavailable (works offline)

## Deploy to Vercel (5 minutes)

### 1. Push to GitHub

```bash
cd logistics-dashboard
git init && git add . && git commit -m "Logistics dashboard v1"
git remote add origin git@github.com:YOUR-ORG/suitsupply-logistics-dashboard.git
git push -u origin main
```

### 2. Create GCP Service Account

In the GCP console (`pj-suitsupply-data-dwh-prd` project):
1. Go to IAM â Service Accounts â Create
2. Name: `logistics-dashboard-reader`
3. Grant role: `BigQuery Data Viewer` + `BigQuery Job User`
4. Create key â JSON â Download

### 3. Deploy on Vercel

1. Go to [vercel.com](https://vercel.com) â New Project â Import GitHub repo
2. Add environment variable:
   - Key: `GOOGLE_APPLICATION_CREDENTIALS_JSON`
   - Value: Paste the **entire** contents of the service account JSON key file
3. Deploy

### 4. Done

Every push to `main` auto-deploys. The dashboard automatically shows new periods as they appear in D365.

## Local Development

```bash
npm install
npm run dev
```

The dashboard works locally with hardcoded fallback data (no BigQuery needed for development). To test the API locally, create a `.env` file:

```
GOOGLE_APPLICATION_CREDENTIALS_JSON={"type":"service_account",...}
```

## Data Queries

The serverless function runs 4 queries on each request:

1. **GL actuals + budget**: All Category 56 Logistics accounts, by period (auto-discovers periods)
2. **Trisco transfers**: Store-to-Warehouse inventory transfers for 30 Trisco item codes
3. **UPS HQ transport**: GL 5213115 UPS charges (Trisco consolidation connection)
4. **Revenue**: Category 50 Net Sales for % of revenue calculation

## Updating the Dashboard

**Data updates automatically** â new periods appear as they land in D365.

**To update commentary/insights** (savings estimates, decomposition notes, Trisco timeline):
1. Edit `src/Dashboard.jsx`
2. Commit and push â Vercel deploys within seconds

## Tables Referenced

- `pj-suitsupply-data-dwh-prd.dwh_view.fct__ledger_transactions_d365`
- `pj-suitsupply-data-dwh-prd.dwh_view.fct__ledger_budget`
- `pj-suitsupply-data-dwh-prd.dwh_view.dim__main_account_d365`
- `pj-suitsupply-data-dwh-prd.dwh_view.dim__date`
- `pj-suitsupply-data-dwh-prd.dwh_view.fct__inventory_transfers`
- `pj-suitsupply-data-dwh-prd.dwh_view.dim__product`
- `pj-suitsupply-data-dwh-prd.dwh_view.dim__location`
