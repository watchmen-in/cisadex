# Cisadex

A simple Vite + React application.

## Requirements

This project requires [Node.js](https://nodejs.org/) version 18 or later. Ensure you have a compatible version installed before running the development or build scripts.

## Development

Install dependencies:
```bash
npm install
````

Start the development server:

```bash
npm run dev
```

Build for production:

```bash
npm run build
```

## Deployment

### Vercel

1. Deploy the repository to Vercel using the web interface or the [Vercel CLI](https://vercel.com/docs/cli).
2. Set the build command to:

   ```bash
   npm run build
   ```
3. Set the output directory to `dist`.
4. No environment variables are required by default.

### Cloudflare Pages

1. Create a new project in [Cloudflare Pages](https://developers.cloudflare.com/pages/).
2. When prompted for the build command, use:

   ```bash
   npm run build
   ```
3. Set the build output directory to `dist`.
4. No environment variables are required by default.
5. **For single-page app routing (React Router)**, create a `_redirects` file in the `public` directory (or at the repo root if you don’t have a `public` folder) with:

   ```
   /*    /index.html   200
   ```

6. Ensure `base: "/"` is set in `vite.config.js` to avoid blank pages after deploy.

## Troubleshooting

* **Blank page after deploy**:

  * Set `base: "/"` in `vite.config.js` or `vite.config.ts`.
  * Verify `dist/` contains `index.html` after `npm run build`.
  * For MapLibre maps, import the CSS:

    ```ts
   import "maplibre-gl/dist/maplibre-gl.css";
   ```
  * Ensure map containers have a height in CSS (e.g., `height: 100vh`).

## Atlas

The Atlas surfaces include a splash Home page, a Browse view with map and results, and detailed entity pages.

### Map style

The default map style uses a light basemap. To override, set `VITE_MAP_STYLE_URL` in your environment.

### Data

Place `summary.json` and `offices.json` in the `data/` directory at the project root. `summary.json` should match `schema/entity.schema.json`.
Utility `src/utils/validateEntity.ts` performs basic schema validation.

### URL state

Browse deep‑links store state in the query string:

```
?z=5&c=-98.5,39.8&b=-125,24,-66,49&f={"sectors":["Water"]}&s=ENTITY_ID
```

### Keyboard shortcuts

* `/` – focus global search
* `f` – toggle filters
* `ArrowUp`/`ArrowDown` – navigate results
* `Enter` – open selected result

