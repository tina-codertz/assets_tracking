import React from "react";
import { useAuth } from "../pages/context/AuthContext";
import { Link, Outlet, useNavigate } from "react-router-dom";

export const DashboardLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/auth");
  };

  const navItemsByRole = {
    admin: [
      { to: "/admin/dashboard", label: "Overview" },
      { to: "/admin/assets", label: "Assets" },
      { to: "/admin/users", label: "Users" },
      { to: "/admin/reports", label: "Reports" },
    ],
    agent: [
      { to: "/agent/dashboard", label: "Overview" },
      { to: "/agent/customers", label: "Customers" },
      { to: "/agent/contracts", label: "Contracts" },
    ],
    manager: [
      { to: "/manager/dashboard", label: "Overview" },
      { to: "/manager/agents", label: "Agents & Performance" },
    ],
  };

  const items = user ? navItemsByRole[user.role] || [] : [];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <aside className="w-64 bg-white shadow-lg flex flex-col">
        <div className="px-6 py-4 border-b">
          <h1 className="text-xl font-bold text-gray-800">Asset Tracking</h1>
          {user && (
            <p className="text-xs text-gray-500 mt-1">
              {user.email} • {user.role.toUpperCase()}
            </p>
          )}
        </div>
        <nav className="flex-1 px-4 py-4 space-y-1">
          {items.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="block px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-600"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <button
          onClick={handleLogout}
          className="m-4 px-4 py-2 text-sm font-semibold text-red-600 border border-red-200 rounded-lg hover:bg-red-50"
        >
          Logout
        </button>
      </aside>
      <main className="flex-1 p-6">
        <Outlet />
      </main>
    </div>
  );
};

