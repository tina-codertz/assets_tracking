import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./pages/context/AuthContext";
import { Toaster } from "react-hot-toast";
import { Auth } from "./components/Auth";
import ForgotPassword from "./components/ForgotPassword";
import ProtectedRoute from "./components/ProtectedRoute";
import { DashboardLayout } from "./components/SidebarLayout";

import AdminDashboard from "./pages/Admin/AdminDashboard";
import Agents from "./pages/agents/Agents";
import Manager from "./pages/managers/Manager";

// Admin pages (to be added next)
import AdminAssets from "./pages/Admin/Assets";
import AdminUsers from "./pages/dashboard/Users";
import AdminReports from "./pages/dashboard/Reports";

const App = () => {
  const RenderDashboard = () => {
    const user = JSON.parse(localStorage.getItem("user"));

    switch (user?.role) {
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

  return (
    <Router>
      <AuthProvider>
        <Toaster position="top-right" />
        <Routes>
          {/* public routes */}
          <Route path="/auth" element={<Auth />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />

          {/* role-based areas */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="assets" element={<AdminAssets />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="reports" element={<AdminReports />} />
          </Route>

          <Route
            path="/agent"
            element={
              <ProtectedRoute allowedRoles={["agent"]}>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route path="dashboard" element={<Agents />} />
            <Route path="customers" element={<Agents />} />
            <Route path="contracts" element={<Agents />} />
          </Route>

          <Route
            path="/manager"
            element={
              <ProtectedRoute allowedRoles={["manager"]}>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route path="dashboard" element={<Manager />} />
            <Route path="agents" element={<Manager />} />
          </Route>

          {/* legacy entry */}
          <Route path="/dashboard" element={<RenderDashboard />} />

          {/* default routes */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
};

export default App;
