1) Create D1 database and initialize schema
   wrangler d1 create cisadex-ti
   wrangler d1 execute cisadex-ti --file=./schema/d1.sql
   wrangler d1 list   # copy the database_id (UUID)

2) Paste the D1 database_id into BOTH config files under [[d1_databases]]
   - root ./wrangler.toml      (Pages / Functions)
   - ./worker/wrangler.toml    (ingest worker)
   Example block:
     [[d1_databases]]
     binding = "DB"
     database_name = "cisadex-ti"
     database_id = "5da7e67b-d0d0-4e5e-b87b-bcbdfb12368e"

3) Create KV namespace for caching
   wrangler kv namespace create CACHE

4) Create Queue for enrichment jobs
   wrangler queues create enrich-queue

5) Add the new IDs to your wrangler files
   - In ./worker/wrangler.toml and ./wrangler.toml, add/update:
     [[kv_namespaces]]
     binding = "CACHE"
     id = "<PASTE_KV_NAMESPACE_ID>"
   - (If Queue is used by the worker) add:
     [[queues.producers]]
     queue = "enrich-queue"
     binding = "ENRICH_QUEUE"

6) Deploy the ingest worker (so cron/queues run with the right bindings)
   cd worker
   npm i
   wrangler deploy
   cd ..

7) Build and redeploy Pages (so API/Functions see the DB binding)
   npm ci
   npm run build
   wrangler pages deploy dist   # use 'deploy' (not 'publish')

8) Verify after a few minutes (cron may need time)
   - Check bindings health:
     open https://<your-pages-domain>/api/health
   - Inspect data:
     open https://<your-pages-domain>/api/stats
     open https://<your-pages-domain>/api/items?limit=10

Note: SPA routing is handled by functions/[[catchall]].ts; you do NOT need the old public/_redirects rule.
