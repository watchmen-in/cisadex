import React from "react";
import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Links from "./pages/Links";

export default function App() {
  return (
    <div className="flex flex-col h-full">
      <Navbar />
      <div className="flex-1 pt-16">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/links" element={<Links />} />
        </Routes>
      </div>
    </div>
  );
}
