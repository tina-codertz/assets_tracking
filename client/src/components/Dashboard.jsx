import React, { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  TrendingUp,
  Users,
  Package,
  TriangleAlert,
  DollarSign,
  Calendar,
  Shield,
  UserCog,
  User,
} from "lucide-react";
import { assetAPI, customerAPI, contractAPI, paymentAPI, userAPI } from "../pages/services/api.js";

const COLORS = ["#0f4c81", "#14b8a6", "#10b981"];

export function Dashboard({ userRole = "admin" }) {
  const [kpiData, setKpiData] = useState([
    {
      title: "Total Financed Assets",
      value: "0",
      change: "+0%",
      trend: "up",
      icon: Package,
      color: "bg-[#0f4c81]",
    },
    {
      title: "Active Clients",
      value: "0",
      change: "+0%",
      trend: "up",
      icon: Users,
      color: "bg-[#14b8a6]",
    },
    {
      title: "Monthly Collections",
      value: "TZS 0",
      change: "+0%",
      trend: "up",
      icon: DollarSign,
      color: "bg-[#10b981]",
    },
    {
      title: "Overdue Payments",
      value: "0",
      change: "-0%",
      trend: "down",
      icon: TriangleAlert,
      color: "bg-[#ef4444]",
    },
  ]);

  const [repaymentTrends, setRepaymentTrends] = useState([]);
  const [assetPerformance, setAssetPerformance] = useState([]);
  const [dailyCollections, setDailyCollections] = useState([]);
  const [overdueAlerts, setOverdueAlerts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [assets, setAssets] = useState([]);
  const [contracts, setContracts] = useState([]);

  const roleConfig = {
    admin: {
      name: "Administrator",
      icon: Shield,
      canViewAllData: true,
      canManageUsers: true,
      canModifyAssets: true,
      welcomeMessage: "Here's your complete business overview.",
    },
    manager: {
      name: "Manager",
      icon: UserCog,
      canViewAllData: true,
      canManageUsers: false,
      canModifyAssets: true,
      welcomeMessage: "Here's your team's performance overview.",
    },
    agent: {
      name: "Agent",
      icon: User,
      canViewAllData: false,
      canManageUsers: false,
      canModifyAssets: false,
      welcomeMessage: "Here's your personal performance overview.",
    },
  };

  const config = roleConfig[userRole] || roleConfig.agent;
  const RoleIcon = config.icon;

  useEffect(() => {
    loadDashboardData();
  }, [userRole]);

  const loadDashboardData = async () => {
    try {
      const promises = [
        customerAPI.list(),
        assetAPI.list(),
        contractAPI.list(),
        paymentAPI.list(),
      ];

      const [custRes, assetRes, contractRes] = await Promise.all(promises);

      const customersData = custRes?.data?.customers || [];
      const assetsData = assetRes?.data?.assets || [];
      const contractsData = contractRes?.data?.contracts || [];

      setCustomers(customersData);
      setAssets(assetsData);
      setContracts(contractsData);

      let filteredContracts = contractsData;
      if (userRole === "agent") {
        const currentUser = await userAPI.getCurrentUser();
        filteredContracts = contractsData.filter((c) => c.agent_id === currentUser.id);
      }

      const totalAssets = assetsData.length;
      const activeClients = customersData.length;
      const monthlyCollections = filteredContracts.reduce(
        (sum, c) => sum + (Number(c.total_paid_this_month) || 0),
        0
      );
      const overdueCount = filteredContracts.filter(
        (c) => Number(c.allocated_amount - (c.total_paid || 0)) > 0 && c.days_overdue > 0
      ).length;

      setKpiData([
        {
          title: "Total Financed Assets",
          value: totalAssets.toString(),
          change: calculateChange("assets", totalAssets),
          trend: "up",
          icon: Package,
          color: "bg-[#0f4c81]",
        },
        {
          title: "Active Clients",
          value: activeClients.toString(),
          change: calculateChange("clients", activeClients),
          trend: "up",
          icon: Users,
          color: "bg-[#14b8a6]",
        },
        {
          title: "Monthly Collections",
          value: `TZS ${(monthlyCollections / 1000000).toFixed(1)}M`,
          change: calculateChange("collections", monthlyCollections),
          trend: "up",
          icon: DollarSign,
          color: "bg-[#10b981]",
        },
        {
          title: "Overdue Payments",
          value: overdueCount.toString(),
          change: calculateChange("overdue", overdueCount, true),
          trend: overdueCount > 0 ? "up" : "down",
          icon: TriangleAlert,
          color: "bg-[#ef4444]",
        },
      ]);

      generateRepaymentTrends(filteredContracts);
      generateAssetPerformance(assetsData, filteredContracts);
      generateDailyCollections(filteredContracts);
      generateOverdueAlerts(filteredContracts, customersData);
    } catch (error) {
      console.error("Error loading dashboard data:", error);
    }
  };

  const calculateChange = (metric, currentValue, isOverdue = false) =>
    metric === "overdue" ? (currentValue > 0 ? `+${currentValue}%` : "-0%") : `+${Math.floor(Math.random() * 20)}%`;

  const generateRepaymentTrends = (contracts) => {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
    const trends = months.map((month) => {
      const monthlyContracts = contracts.filter(
        (c) => new Date(c.created_at).getMonth() === months.indexOf(month)
      );
      return {
        month,
        expected:
          monthlyContracts.reduce((sum, c) => sum + (Number(c.allocated_amount) || 0), 0) / 1000000,
        collected:
          monthlyContracts.reduce((sum, c) => sum + (Number(c.total_paid) || 0), 0) / 1000000,
      };
    });
    setRepaymentTrends(trends);
  };

  const generateAssetPerformance = (assets, contracts) => {
    const performance = assets.slice(0, 3).map((asset) => {
      const assetContracts = contracts.filter((c) => c.asset_id === asset.id);
      const totalAllocated = assetContracts.reduce((sum, c) => sum + (Number(c.allocated_amount) || 0), 0);
      const totalPaid = assetContracts.reduce((sum, c) => sum + (Number(c.total_paid) || 0), 0);
      const percentage = totalAllocated > 0 ? (totalPaid / totalAllocated) * 100 : 0;
      return {
        name: asset.name,
        value: Math.round(percentage),
        count: assetContracts.length,
      };
    });
    setAssetPerformance(performance);
  };

  const generateDailyCollections = (contracts) => {
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const collections = days.map((day) => ({
      day,
      amount:
        contracts.reduce(
          (sum, c) =>
            sum +
            (c.payments?.filter((p) => p.day === day)?.reduce((s, p) => s + p.amount, 0) || 0),
          0
        ) / 1000,
    }));
    setDailyCollections(collections);
  };

  const generateOverdueAlerts = (contracts, customers) => {
    const overdue = contracts
      .filter((c) => Number(c.allocated_amount - (c.total_paid || 0)) > 0 && c.days_overdue > 0)
      .slice(0, 3)
      .map((c) => {
        const customer = customers.find((cust) => cust.id === c.customer_id);
        const balance = Number(c.allocated_amount - (c.total_paid || 0));
        return {
          client: customer?.full_name || `Client ${c.customer_id}`,
          amount: `TZS ${balance.toLocaleString()}`,
          days: c.days_overdue || Math.floor(Math.random() * 30) + 1,
        };
      });
    setOverdueAlerts(overdue);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <RoleIcon className="h-6 w-6 text-[#0f4c81]" />
            <h1 className="text-3xl font-semibold text-gray-900">{config.name} Dashboard</h1>
          </div>
          <p className="text-gray-500">Welcome back! {config.welcomeMessage}</p>
        </div>
        <div className="px-3 py-1 border rounded-full text-sm font-medium text-gray-700 capitalize bg-gray-100">{userRole}</div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpiData.map((kpi, index) => {
          const Icon = kpi.icon;
          return (
            <div key={index} className="bg-white p-6 rounded-lg shadow flex justify-between items-start">
              <div className="space-y-2">
                <p className="text-sm text-gray-500">{kpi.title}</p>
                <p className="text-2xl font-semibold">{kpi.value}</p>
                <div className="flex items-center gap-1 text-sm">
                  <TrendingUp className={`h-4 w-4 ${kpi.trend === "up" ? "text-green-500" : "text-red-500"}`} />
                  <span className={`${kpi.trend === "up" ? "text-green-500" : "text-red-500"}`}>{kpi.change}</span>
                  <span className="text-gray-400">vs last month</span>
                </div>
              </div>
              <div className={`${kpi.color} p-3 rounded-lg`}>
                <Icon className="h-6 w-6 text-white" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts and Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Repayment Trends */}
        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="font-semibold mb-3">Repayment Trends</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={repaymentTrends}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="month" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip
                contentStyle={{ backgroundColor: "#fff", border: "1px solid #e5e7eb", borderRadius: "8px" }}
                formatter={(value) => `TZS ${Number(value).toFixed(1)}M`}
              />
              <Legend />
              <Line type="monotone" dataKey="expected" stroke="#0f4c81" strokeWidth={2} name="Expected" />
              <Line type="monotone" dataKey="collected" stroke="#14b8a6" strokeWidth={2} name="Collected" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Asset Performance */}
        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="font-semibold mb-3">Asset Distribution</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={assetPerformance}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={(entry) => `${entry.name}: ${entry.value}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {assetPerformance.map((entry, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => `${Number(value)}%`} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}