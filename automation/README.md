# automation/

n8n workflow backups for TotalTechPicks. These are exported automatically whenever workflows are updated.

## Workflows

| File | Schedule | Purpose |
|------|----------|---------|
| `reddit-insights-totaltechpicks.json` | Every 8 hours | Fetches Reddit posts for 12 category slugs → commits to `src/data/reddit-insights.json` |
| `product-health-check.json` | Weekly (Sun 2am) | Checks 124 Amazon ASINs for availability → commits to `src/data/product-health.json` |

## Restoring workflows to n8n

1. Start n8n: `pm2 start C:\n8n-data\ecosystem.config.cjs`
2. Open http://localhost:5678 → Settings → n8n API → create an API key
3. Run:
```powershell
$env:N8N_API_KEY="your-api-key"
node automation/restore-workflows.mjs
```

## Updating backups

After editing workflows in the n8n UI, re-export:
```powershell
node automation/export-workflows.mjs
git add automation/
git commit -m "chore: update n8n workflow backups"
git push
```
