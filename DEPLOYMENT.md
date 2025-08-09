# Deployment Instructions

1. Build the project and publish to Cloudflare Pages:
   ```bash
   npm ci && npm run build && wrangler pages publish dist
   ```
2. After deployment, purge the Cloudflare cache so the latest bundle is served:
   - **Dashboard:** Cloudflare Dashboard → your site → *Caching* → *Configuration* → **Purge Everything**.
   - **API:**
     ```bash
     export ZONE_ID="<your_zone_id>"
     export API_TOKEN="<your_api_token>"
     curl -X POST "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/purge_cache" \
       -H "Authorization: Bearer $API_TOKEN" \
       -H "Content-Type: application/json" \
       --data '{"purge_everything":true}'
     ```
     Replace the placeholders with your actual zone ID and API token.
