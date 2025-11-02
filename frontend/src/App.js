import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import AdminPanel from "./pages/AdminPanel";
import BillingPanel from "./pages/BillingPanel";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminDashboard from "./pages/AdminDashboard";

function App() {
  const role = localStorage.getItem("role");
  const token = localStorage.getItem("token");

  return (
    <Router>
      <Navbar />
      <Routes>

        {/* 🏠 Dashboard Route — auto-redirect based on role */}
        <Route
          path="/"
          element={
            role === "admin" ? (
              <AdminDashboard />
            ) : role === "billing" ? (
              <BillingPanel />
            ) : (
              <Dashboard />
            )
          }
        />

        {/* 🧾 Register & Login */}
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />

        {/* 🔒 Admin Panel (Manage sweets, inventory) */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminPanel />
            </ProtectedRoute>
          }
        />

        {/* 🔒 Billing Panel (Generate bills, etc.) */}
        <Route
          path="/billing"
          element={
            token && role === "billing" ? (
              <BillingPanel />
            ) : (
              <Navigate
                to="/login"
                replace
                state={{ message: "Access Denied — Billing Staff Only" }}
              />
            )
          }
        />

        {/* 🚫 Catch-all 404 Page */}
        <Route
          path="*"
          element={
            <h2
              style={{
                textAlign: "center",
                marginTop: "100px",
                color: "crimson",
              }}
            >
              🚫 404 — Page Not Found
            </h2>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
