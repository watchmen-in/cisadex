import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  base: "/",
  build: {
    chunkSizeWarningLimit: 1000, // Increase warning limit
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunks
          'react-vendor': ['react', 'react-dom'],
          'router-vendor': ['react-router-dom'],
          'map-vendor': ['maplibre-gl'],
          
          // App chunks
          'map-components': [
            './src/components/map/AtlasMap.tsx',
            './src/components/map/DetailDrawer.tsx',
            './src/components/map/SearchBox.tsx',
            './src/map/readyQueue.ts',
            './src/map/config.ts'
          ],
          'utils': [
            './src/utils/cache.ts',
            './src/utils/security.ts',
            './src/utils/validateEntity.ts',
            './src/utils/debounce.ts'
          ]
        }
      }
    },
    // Enable source maps for debugging in production if needed
    sourcemap: false,
    // Optimize CSS
    cssCodeSplit: true,
    // Enable minification (use default esbuild)
    minify: 'esbuild'
  },
  // Optimize dependencies
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom', 'maplibre-gl']
  }
});
