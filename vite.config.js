import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  base: "/",
  build: {
    chunkSizeWarningLimit: 1000, // Increase warning limit
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunks - separate major dependencies
          'react-vendor': ['react', 'react-dom'],
          'router-vendor': ['react-router-dom'],
          'map-vendor': ['maplibre-gl'],
          'xml-vendor': ['fast-xml-parser'],
          
          // App chunks - group related functionality
          'map-components': [
            './src/components/map/AtlasMap.tsx',
            './src/components/map/DetailDrawer.tsx',
            './src/components/map/SearchBox.tsx',
            './src/map/readyQueue.ts'
          ],
          'utils': [
            './src/utils/cache.ts',
            './src/utils/security.ts',
            './src/utils/validateEntity.ts',
            './src/utils/debounce.ts',
            './src/utils/performance.ts'
          ],
          'pages': [
            './src/pages/Splash.jsx',
            './src/pages/Advisories.tsx'
          ],
          'feed-components': [
            './src/components/RssPanel.jsx',
            './src/utils/rssFetcher.js'
          ]
        }
      }
    },
    // Enable source maps for debugging in production if needed
    sourcemap: false,
    // Optimize CSS
    cssCodeSplit: true,
    // Enable minification with optimizations
    minify: 'esbuild',
    // Additional optimizations
    target: 'esnext',
    assetsInlineLimit: 4096, // Inline assets smaller than 4KB
    reportCompressedSize: false // Faster builds
  },
  // Optimize dependencies - prebundle during development
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom', 'maplibre-gl', 'fast-xml-parser'],
    exclude: [] // Force optimization of all dependencies
  },
  // Performance optimizations
  server: {
    warmup: {
      // Warm up frequently used files
      clientFiles: [
        './src/pages/*.{tsx,jsx}',
        './src/components/**/*.{tsx,jsx}',
        './src/utils/*.{ts,js}'
      ]
    },
    proxy: {
      '/api/proxy-rss': {
        target: 'http://localhost:5173',
        changeOrigin: true,
        configure: (proxy, options) => {
          proxy.on('proxyReq', (proxyReq, req, res) => {
            const url = req.url.replace('/api/proxy-rss?url=', '');
            if (url) {
              // For development, directly fetch the RSS feed
              fetch(decodeURIComponent(url))
                .then(response => response.text())
                .then(data => {
                  res.writeHead(200, { 'Content-Type': 'application/xml' });
                  res.end(data);
                })
                .catch(error => {
                  res.writeHead(500);
                  res.end(JSON.stringify({ error: error.message }));
                });
            }
          });
        }
      }
    }
  },
  // Enable experimental features for better performance
  esbuild: {
    // Drop console.log in production
    drop: process.env.NODE_ENV === 'production' ? ['console', 'debugger'] : []
  }
});
