1. Create D1 DB:
   wrangler d1 create cisadex-ti
   wrangler d1 execute cisadex-ti --file=./schema/d1.sql
   wrangler d1 list   # copy the database_id

2. Paste the database_id into both root wrangler.toml and worker/wrangler.toml under [[d1_databases]].

3. Create KV for CACHE:
   wrangler kv namespace create CACHE

4. Create Queue:
   wrangler queues create enrich-queue

5. Deploy Worker:
   cd worker
   npm i
   wrangler deploy

6. Redeploy Pages (so APIs see DB binding and SPA fallback function is active):
   wrangler pages publish dist

7. Wait a few minutes for the cron to ingest; hit:
   /api/stats and /api/items

Note: SPA routing is handled by functions/[[catchall]].ts, so the previous public/_redirects rule is no longer required.
