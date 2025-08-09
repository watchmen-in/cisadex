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

