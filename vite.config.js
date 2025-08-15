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
      '/api/rss': {
        target: 'http://localhost:5173',
        changeOrigin: true,
        configure: (proxy, options) => {
          proxy.on('proxyReq', (proxyReq, req, res) => {
            // Serve mock RSS data for development
            const mockFeeds = [
              {
                title: "CISA Cybersecurity Alerts",
                items: [
                  {
                    title: "CISA Adds Three Known Exploited Vulnerabilities to Catalog",
                    link: "https://www.cisa.gov/news-events/alerts/2024/01/15/cisa-adds-three-known-exploited-vulnerabilities-catalog",
                    pubDate: "2024-01-15T16:00:00Z",
                    contentSnippet: "CISA has added three new vulnerabilities to the Known Exploited Vulnerabilities Catalog, based on evidence of active exploitation."
                  },
                  {
                    title: "Alert on Compromised WordPress Sites Used in Cybercrime",
                    link: "https://www.cisa.gov/news-events/alerts/2024/01/12/alert-compromised-wordpress-sites-used-cybercrime",
                    pubDate: "2024-01-12T14:30:00Z",
                    contentSnippet: "CISA and FBI warn of compromised WordPress sites being used to facilitate cybercriminal activities."
                  }
                ]
              },
              {
                title: "FBI Cyber News",
                items: [
                  {
                    title: "FBI Warning: Increase in Ransomware Attacks on Healthcare Sector",
                    link: "https://www.fbi.gov/news/press-releases/fbi-warning-increase-ransomware-attacks-healthcare-sector",
                    pubDate: "2024-01-14T12:00:00Z",
                    contentSnippet: "The FBI has observed a significant increase in ransomware attacks targeting healthcare organizations."
                  }
                ]
              }
            ];
            
            res.writeHead(200, { 
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*',
              'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
              'Access-Control-Allow-Headers': 'Content-Type, Authorization'
            });
            res.end(JSON.stringify(mockFeeds));
          });
        }
      },
      '/api/items': {
        target: 'http://localhost:5173',
        changeOrigin: true,
        configure: (proxy, options) => {
          proxy.on('proxyReq', (proxyReq, req, res) => {
            // Serve mock feed items for development
            const mockItems = [
              {
                id: "1",
                source_type: "CISA_KEV",
                title: "CVE-2024-0001 - Critical Remote Code Execution",
                summary: "A critical vulnerability allowing remote code execution has been identified and added to the CISA KEV catalog.",
                url: "https://www.cisa.gov/known-exploited-vulnerabilities-catalog",
                published_at: "2024-01-15T16:00:00Z",
                fetched_at: "2024-01-15T16:30:00Z",
                cve: "CVE-2024-0001",
                exploited: true,
                epss: 0.85
              },
              {
                id: "2",
                source_type: "FBI_FLASH",
                title: "Ransomware Campaign Targeting Healthcare",
                summary: "FBI observes increased ransomware activity targeting healthcare sector during holiday season.",
                url: "https://www.fbi.gov/news/press-releases/healthcare-ransomware",
                published_at: "2024-01-14T12:00:00Z",
                fetched_at: "2024-01-14T12:15:00Z",
                exploited: false,
                epss: 0.23
              }
            ];
            
            res.writeHead(200, { 
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*',
              'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
              'Access-Control-Allow-Headers': 'Content-Type, Authorization'
            });
            res.end(JSON.stringify(mockItems));
          });
        }
      },
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
