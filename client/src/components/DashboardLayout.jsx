import React, { useState } from "react";
import { useAuth } from "../pages/context/AuthContext";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  BookCheck,
  ContainerIcon,
  FileText,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  Settings,
  ShieldCheck,
  SigmaSquare,
  UserIcon,
  X,
} from "lucide-react";

export const DashboardLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/auth");
  };

  const navItemsByRole = {
    admin: [
      { to: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
      { to: "/admin/clients", label: "Clients", icon: UserIcon },
      { to: "/admin/assets", label: "Assets", icon: Package },
      { to: "/admin/payments", label: "Payments", icon: Package },
      { to: "/admin/notifications", label: "Notifications", icon: Package },
      { to: "/admin/reports", label: "Reports", icon: FileText },
      { to: "/admin/users", label: "Users", icon: UserIcon },
      { to: "/admin/settings", label: "Settings", icon: Settings },
    ],
    agent: [
      { to: "/admin/dashboard", label: "Dashboard", icon: BookCheck },
      { to: "/admin/clients", label: "Clients", icon: UserIcon },
      { to: "/admin/assets", label: "Assets", icon: ContainerIcon },
      { to: "/admin/payments", label: "Payments", icon: Package },
      { to: "/admin/notifications", label: "Notifications", icon: Package },

    ],
    manager: [
      { to: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
      { to: "/admin/clients", label: "Agents & Performance", icon: SigmaSquare },
      { to: "/admin/assets", label: "Assets", icon: Package },
      { to: "/admin/payments", label: "Payments", icon: Package },
      { to: "/admin/notifications", label: "Notifications", icon: Package },
      { to: "/admin/reports", label: "Reports", icon: FileText },
      { to: "/admin/settings", label: "Settings", icon: Settings },
    ],
  };

  const items = user ? navItemsByRole[user.role] || [] : [];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      
      {/*  Mobile Overlay */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
        />
      )}

      {/*  Sidebar */}
      <aside
        className={`fixed z-50 top-0 left-0 h-full w-64 bg-[#0f4c81] shadow-lg flex flex-col transform transition-transform duration-300
        ${isOpen ? "translate-x-0" : "-translate-x-full"} 
        lg:translate-x-0 lg:static`}
      >
        {/* Header */}
        <div className="px-6 py-6 border-b border-white/10 flex justify-between items-center">
          <h1 className="text-lg font-bold text-white">Asset Tracking</h1>

          {/* Close button (mobile only) */}
          <button
            onClick={() => setIsOpen(false)}
            className="lg:hidden text-white"
          >
            <X size={20} />
          </button>
        </div>

        {/* User Info */}
        {user && (
          <div className="px-6 py-3 text-xs text-white">
            {user.email} • {user.role.toUpperCase()}
          </div>
        )}

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-2">
          {items.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.to}
                to={item.to}
                end
                onClick={() => setIsOpen(false)} // auto close on mobile
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? "bg-white text-[#0f4c81]"
                      : "text-white hover:bg-white/10"
                  }`
                }
              >
                <Icon size={18} />
                {item.label}
              </NavLink>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="p-4">
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 w-full px-4 py-2 text-white rounded-lg hover:bg-white/10 transition"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </aside>

      {/*  Main Content */}
      <div className="flex-1 flex flex-col w-full">
        
        {/* Topbar */}
        <header className="flex items-center justify-between bg-white shadow px-4 py-3 lg:hidden">
          <button onClick={() => setIsOpen(true)}>
            <Menu size={22} />
          </button>
          <h2 className="font-semibold">Dashboard</h2>
        </header>

        {/* Content */}
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};