import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
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
import "./styles/tailwind.css";
import ErrorBoundary from "./components/ErrorBoundary";
import Layout from "./components/Layout";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter basename="/">
      <ErrorBoundary>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Home />} />
            <Route path="/map" element={<Map />} />
            <Route path="/catalog" element={<Catalog />} />
            <Route path="/advisories" element={<Advisories />} />
            <Route path="/research" element={<Research />} />
            <Route path="/data" element={<DataPortal />} />
            <Route path="/about" element={<AboutData />} />
            <Route path="/browse" element={<Browse />} />
            <Route path="/entity/:id" element={<EntityPage />} />
            <Route path="/compare" element={<Compare />} />
          </Route>
        </Routes>
      </ErrorBoundary>
    </BrowserRouter>
  </React.StrictMode>
);
