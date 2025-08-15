import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import Browse from "./pages/Browse";
import EntityPage from "./pages/EntityPage";
import Compare from "./pages/Compare";
import AboutData from "./pages/AboutData";
import Map from "./pages/Map";
import Catalog from "./pages/Catalog";
import Advisories from "./pages/Advisories";
import Research from "./pages/Research";
import DataPortal from "./pages/DataPortal";
import Feeds from "./pages/Feeds";
import SimpleFeeds from "./pages/SimpleFeeds";
import EnhancedDashboard from "./pages/EnhancedDashboard";
import FeedsComparison from "./components/FeedsComparison";
import FeedsImprovementSummary from "./components/FeedsImprovementSummary";
import Splash from "./pages/Splash";
import IncidentReport from "./pages/IncidentReport";
import FederalInfrastructureMap from "./pages/FederalInfrastructureMap.tsx";
import MapTest from "./pages/MapTest";
import "./styles/tailwind.css";
import ErrorBoundary from "./components/ErrorBoundary";
import Layout from "./components/Layout";
import { setupCSPReporting } from "./utils/security";
import { useSecurityInit } from "./hooks/useSecurityInit";

// Initialize security features globally
setupCSPReporting();

// Security component wrapper
function SecurityWrapper({ children }) {
  useSecurityInit();
  return children;
}

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
        <SecurityWrapper>
          <Routes>
          <Route path="/splash" element={<Splash />} />
          <Route path="/dashboard" element={<EnhancedDashboard />} />
          <Route element={<Layout />}>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/map" element={<Navigate to="/dashboard#map" replace />} />
            <Route path="/catalog" element={<Navigate to="/dashboard#resources" replace />} />
            <Route path="/advisories" element={<Navigate to="/dashboard#overview" replace />} />
            <Route path="/research" element={<Navigate to="/dashboard#intelligence" replace />} />
            <Route path="/data" element={<Navigate to="/dashboard#intelligence" replace />} />
            <Route path="/feeds" element={<Navigate to="/dashboard#intelligence" replace />} />
            <Route path="/feeds-new" element={<Navigate to="/dashboard#intelligence" replace />} />
            <Route path="/feeds-comparison" element={<Navigate to="/dashboard#intelligence" replace />} />
            <Route path="/feeds-summary" element={<Navigate to="/dashboard#intelligence" replace />} />
            <Route path="/threat-intelligence" element={<Navigate to="/dashboard#overview" replace />} />
            <Route path="/federal-infrastructure" element={<Navigate to="/dashboard#map" replace />} />
            <Route path="/report-incident" element={<Navigate to="/dashboard#emergency" replace />} />
            <Route path="/map-test" element={<Navigate to="/dashboard#map" replace />} />
            <Route path="/about" element={<AboutData />} />
            <Route path="/browse" element={<Navigate to="/dashboard#resources" replace />} />
            <Route path="/entity/:id" element={<EntityPage />} />
            <Route path="/compare" element={<Navigate to="/dashboard#resources" replace />} />
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
          </Route>
        </Routes>
        </SecurityWrapper>
      </ErrorBoundary>
    </BrowserRouter>
  </React.StrictMode>
);
