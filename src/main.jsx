import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "maplibre-gl/dist/maplibre-gl.css";
import AppShell from "./App";
import Home from "./pages/Home";
import Links from "./pages/Links";
import "./index.css";
import ErrorBoundary from "./components/ErrorBoundary";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter basename="/">
      <ErrorBoundary>
        <Routes>
          <Route element={<AppShell />}>
            <Route path="/" element={<Home />} />
            <Route path="/resource-hub" element={<Links />} />
          </Route>
        </Routes>
      </ErrorBoundary>
    </BrowserRouter>
  </React.StrictMode>
);
