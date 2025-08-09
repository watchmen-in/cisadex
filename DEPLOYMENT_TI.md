1. Create D1 DB:
   wrangler d1 create cisadex-ti
   wrangler d1 execute cisadex-ti --file=./schema/d1.sql

2. Create KV for CACHE:
   wrangler kv namespace create CACHE

3. Create Queue:
   wrangler queues create enrich-queue

4. Put IDs into worker/wrangler.toml and root wrangler.toml under [[d1_databases]] and [[kv_namespaces]].

5. Deploy Worker:
   cd worker
   npm i
   wrangler deploy

6. Redeploy Pages (so APIs see DB binding):
   wrangler pages publish dist

7. Wait a few minutes for the cron to ingest; hit:
   /api/stats and /api/items
