import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AdminDashboard from "./pages/AdminDashboard";
import CommitAnalyzer from "./pages/CommitAnalyzer";
import CommitReport from "./pages/CommitReport";
import NotFound from "./pages/NotFound";

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Redirect root to admin dashboard */}
        <Route path="/" element={<Navigate to="/admin" replace />} />

        {/* Admin Routes — no AdminRoute guard needed for static deploy */}
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/commit-analyzer" element={<CommitAnalyzer />} />
        <Route path="/admin/commit-analyzer/report/:team_name" element={<CommitReport />} />

        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
