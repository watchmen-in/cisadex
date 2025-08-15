import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "maplibre-gl/dist/maplibre-gl.css";
import Home from "./pages/Home";
import Browse from "./pages/Browse";
import EntityPage from "./pages/EntityPage";
import Compare from "./pages/Compare";
import AboutData from "./pages/AboutData";
import "./index.css";
import ErrorBoundary from "./components/ErrorBoundary";
import { setupCSPReporting } from "./utils/security";

// Initialize security features
setupCSPReporting();

// Performance monitoring
if (typeof window !== 'undefined' && 'performance' in window) {
  window.addEventListener('load', () => {
    // Log performance metrics in development
    if (import.meta.env.DEV) {
      const perfData = performance.getEntriesByType('navigation')[0];
      console.log('Performance metrics:', {
        loadTime: perfData.loadEventEnd - perfData.loadEventStart,
        domContentLoaded: perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart,
        firstPaint: performance.getEntriesByName('first-paint')[0]?.startTime,
        firstContentfulPaint: performance.getEntriesByName('first-contentful-paint')[0]?.startTime,
      });
    }
  });
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter basename="/">
      <ErrorBoundary>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/browse" element={<Browse />} />
          <Route path="/entity/:id" element={<EntityPage />} />
          <Route path="/compare" element={<Compare />} />
          <Route path="/about" element={<AboutData />} />
          {/* Fallback route for unknown paths */}
          <Route path="*" element={
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
              <div className="text-center">
                <h1 className="text-2xl font-bold text-gray-800 mb-4">Page Not Found</h1>
                <p className="text-gray-600 mb-4">The page you're looking for doesn't exist.</p>
                <a 
                  href="/" 
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                >
                  Go Home
                </a>
              </div>
            </div>
          } />
        </Routes>
      </ErrorBoundary>
    </BrowserRouter>
  </React.StrictMode>
);
