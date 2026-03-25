// App.js
import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./pages/context/AuthContext";
import { Toaster } from "react-hot-toast";
import { Auth } from "./components/Auth";
import ForgotPassword from "./components/ForgotPassword";
import ProtectedRoute from "./components/ProtectedRoute";
import { DashboardLayout } from "./components/SidebarLayout";

// Pages
import {Dashboard} from "./components/Dashboard"
import Assets from "./pages/dashboard/Assets";
import Users from "./pages/dashboard/Users";
import Reports from "./pages/dashboard/Reports";
import Payments from "./pages/dashboard/Payments";
import Notifications from "./pages/dashboard/Notifications";
import Settings from "./pages/dashboard/Settings";
import Clients from "./pages/dashboard/Clients";

// Safe dashboard redirect based on user role
const RenderDashboard = () => {
  const user = JSON.parse(localStorage.getItem("user") || "null");

  if (!user) return <Navigate to="/auth" replace />;

  switch (user.role) {
    case "admin":
      return <Navigate to="/admin/dashboard" replace />;
    case "manager":
      return <Navigate to="/manager/dashboard" replace />;
    case "agent":
      return <Navigate to="/agent/dashboard" replace />;
    default:
      return <Navigate to="/auth" replace />;
  }
};

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <Toaster position="top-right" />
        <Routes>
          {/* Public Routes */}
          <Route path="/auth" element={<Auth />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />

          {/* Admin Routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route path="dashboard" element={<Dashboard userRole="admin" />} />
            <Route path="clients" element={<Clients />} />
            <Route path="assets" element={<Assets />} />
            <Route path="payments" element={<Payments />} />
            <Route path="notifications" element={<Notifications />} />
            <Route path="reports" element={<Reports />} />
            <Route path="users" element={<Users />} />
            <Route path="settings" element={<Settings />} />
          </Route>

          {/* Manager Routes */}
          <Route
            path="/manager"
            element={
              <ProtectedRoute allowedRoles={["manager"]}>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route path="dashboard" element={<Dashboard userRole="manager" />} />
            <Route path="clients" element={<Clients />} />
            <Route path="assets" element={<Assets />} />
            <Route path="payments" element={<Payments />} />
            <Route path="notifications" element={<Notifications />} />
            <Route path="reports" element={<Reports />} />
            <Route path="settings" element={<Settings />} />
          </Route>

          {/* Agent Routes */}
          <Route
            path="/agent"
            element={
              <ProtectedRoute allowedRoles={["agent"]}>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route path="dashboard" element={<Dashboard userRole="agent" />} />
            <Route path="clients" element={<Clients />} />
            <Route path="assets" element={<Assets />} />
            <Route path="payments" element={<Payments />} />
            <Route path="notifications" element={<Notifications />} />
          </Route>

          {/* Legacy entry / dashboard redirect */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute allowedRoles={["admin", "manager", "agent"]}>
                <RenderDashboard />
              </ProtectedRoute>
            }
          />

          {/* Default route */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
};

export default App;