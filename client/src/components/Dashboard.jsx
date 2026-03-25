
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, Users, Package, TriangleAlert, DollarSign, Calendar, Shield, UserCog, User } from 'lucide-react';
import { Badge } from './ui/badge';
import { useEffect, useState } from 'react';
import { assetAPI, customerAPI, contractAPI, paymentAPI, userAPI } from '../services/api';

const COLORS = ['#0f4c81', '#14b8a6', '#10b981'];

export function Dashboard({ userRole = 'admin' }) {
  const [kpiData, setKpiData] = useState([
    {
      title: 'Total Financed Assets',
      value: '0',
      change: '+0%',
      trend: 'up',
      icon: Package,
      color: 'bg-[#0f4c81]'
    },
    {
      title: 'Active Clients',
      value: '0',
      change: '+0%',
      trend: 'up',
      icon: Users,
      color: 'bg-[#14b8a6]'
    },
    {
      title: 'Monthly Collections',
      value: 'TZS 0',
      change: '+0%',
      trend: 'up',
      icon: DollarSign,
      color: 'bg-[#10b981]'
    },
    {
      title: 'Overdue Payments',
      value: '0',
      change: '-0%',
      trend: 'down',
      icon: TriangleAlert,
      color: 'bg-[#ef4444]'
    }
  ]);

  const [repaymentTrends, setRepaymentTrends] = useState([]);
  const [assetPerformance, setAssetPerformance] = useState([]);
  const [dailyCollections, setDailyCollections] = useState([]);
  const [overdueAlerts, setOverdueAlerts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [assets, setAssets] = useState([]);
  const [contracts, setContracts] = useState([]);

  // Role-specific configurations
  const roleConfig = {
    admin: {
      name: 'Administrator',
      icon: Shield,
      canViewAllData: true,
      canManageUsers: true,
      canModifyAssets: true,
      welcomeMessage: 'Here\'s your complete business overview.'
    },
    manager: {
      name: 'Manager',
      icon: UserCog,
      canViewAllData: true,
      canManageUsers: false,
      canModifyAssets: true,
      welcomeMessage: 'Here\'s your team\'s performance overview.'
    },
    agent: {
      name: 'Agent',
      icon: User,
      canViewAllData: false,
      canManageUsers: false,
      canModifyAssets: false,
      welcomeMessage: 'Here\'s your personal performance overview.'
    }
  };

  const config = roleConfig[userRole] || roleConfig.agent;
  const RoleIcon = config.icon;

  useEffect(() => {
    loadDashboardData();
  }, [userRole]);

  const loadDashboardData = async () => {
    try {
      // Fetch data based on role permissions
      const promises = [];
      
      if (config.canViewAllData || userRole === 'agent') {
        promises.push(customerAPI.list());
        promises.push(assetAPI.list());
        promises.push(contractAPI.list());
        promises.push(paymentAPI.list());
      } else {
        // For managers, they might only see their assigned data
        promises.push(customerAPI.list());
        promises.push(assetAPI.list());
        promises.push(contractAPI.list());
        promises.push(paymentAPI.list());
      }

      const [custRes, assetRes, contractRes, paymentRes] = await Promise.all(promises);

      const customersData = custRes?.data?.customers || [];
      const assetsData = assetRes?.data?.assets || [];
      const contractsData = contractRes?.data?.contracts || [];
      
      setCustomers(customersData);
      setAssets(assetsData);
      setContracts(contractsData);

      // Filter data based on role if needed
      let filteredContracts = contractsData;
      if (userRole === 'agent') {
        // For agents, only show their assigned contracts
        const currentUser = await userAPI.getCurrentUser();
        filteredContracts = contractsData.filter(c => c.agent_id === currentUser.id);
      }

      // Calculate KPIs
      const totalAssets = assetsData.length;
      const activeClients = customersData.length;
      const monthlyCollections = filteredContracts.reduce((sum, c) => sum + (Number(c.total_paid_this_month) || 0), 0);
      const overdueCount = filteredContracts.filter(c => 
        (Number(c.allocated_amount) - Number(c.total_paid || 0)) > 0 && c.days_overdue > 0
      ).length;

      setKpiData([
        {
          title: 'Total Financed Assets',
          value: totalAssets.toString(),
          change: calculateChange('assets', totalAssets),
          trend: 'up',
          icon: Package,
          color: 'bg-[#0f4c81]'
        },
        {
          title: 'Active Clients',
          value: activeClients.toString(),
          change: calculateChange('clients', activeClients),
          trend: 'up',
          icon: Users,
          color: 'bg-[#14b8a6]'
        },
        {
          title: 'Monthly Collections',
          value: `TZS ${(monthlyCollections / 1000000).toFixed(1)}M`,
          change: calculateChange('collections', monthlyCollections),
          trend: 'up',
          icon: DollarSign,
          color: 'bg-[#10b981]'
        },
        {
          title: 'Overdue Payments',
          value: overdueCount.toString(),
          change: calculateChange('overdue', overdueCount, true),
          trend: overdueCount > 0 ? 'up' : 'down',
          icon: TriangleAlert,
          color: 'bg-[#ef4444]'
        }
      ]);

      // Generate repayment trends data
      generateRepaymentTrends(filteredContracts);
      
      // Generate asset performance data
      generateAssetPerformance(assetsData, filteredContracts);
      
      // Generate daily collections data
      generateDailyCollections(filteredContracts);
      
      // Generate overdue alerts
      generateOverdueAlerts(filteredContracts, customersData);

    } catch (error) {
      console.error('Error loading dashboard data:', error);
    }
  };

  const calculateChange = (metric, currentValue, isOverdue = false) => {
    // In a real app, you'd compare with previous period data
    // This is a placeholder calculation
    if (metric === 'overdue') {
      return currentValue > 0 ? `+${currentValue}%` : '-0%';
    }
    return `+${Math.floor(Math.random() * 20)}%`;
  };

  const generateRepaymentTrends = (contracts) => {
    // Generate last 6 months of repayment data
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    const trends = months.map(month => {
      const monthlyContracts = contracts.filter(c => {
        const createdAt = new Date(c.created_at);
        return createdAt.getMonth() === months.indexOf(month);
      });
      
      return {
        month,
        expected: monthlyContracts.reduce((sum, c) => sum + (Number(c.allocated_amount) || 0), 0) / 1000000,
        collected: monthlyContracts.reduce((sum, c) => sum + (Number(c.total_paid) || 0), 0) / 1000000
      };
    });
    
    setRepaymentTrends(trends);
  };

  const generateAssetPerformance = (assets, contracts) => {
    const performance = assets.slice(0, 3).map(asset => {
      const assetContracts = contracts.filter(c => c.asset_id === asset.id);
      const totalAllocated = assetContracts.reduce((sum, c) => sum + (Number(c.allocated_amount) || 0), 0);
      const totalPaid = assetContracts.reduce((sum, c) => sum + (Number(c.total_paid) || 0), 0);
      const percentage = totalAllocated > 0 ? (totalPaid / totalAllocated) * 100 : 0;
      
      return {
        name: asset.name,
        value: Math.round(percentage),
        count: assetContracts.length
      };
    });
    
    setAssetPerformance(performance);
  };

  const generateDailyCollections = (contracts) => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const collections = days.map(day => ({
      day,
      amount: contracts.reduce((sum, c) => sum + (Number(c.payments?.filter(p => p.day === day)?.reduce((s, p) => s + p.amount, 0) || 0)), 0) / 1000
    }));
    
    setDailyCollections(collections);
  };

  const generateOverdueAlerts = (contracts, customers) => {
    const overdue = contracts
      .filter(c => {
        const balance = Number(c.allocated_amount) - Number(c.total_paid || 0);
        return balance > 0 && c.days_overdue > 0;
      })
      .slice(0, 3)
      .map(c => {
        const customer = customers.find(cust => cust.id === c.customer_id);
        const balance = Number(c.allocated_amount) - Number(c.total_paid || 0);
        
        return {
          client: customer?.full_name || `Client ${c.customer_id}`,
          amount: `TZS ${balance.toLocaleString()}`,
          days: c.days_overdue || Math.floor(Math.random() * 30) + 1
        };
      });
    
    setOverdueAlerts(overdue);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <RoleIcon className="h-6 w-6 text-[#0f4c81]" />
            <h1 className="text-3xl font-semibold text-foreground">
              {config.name} Dashboard
            </h1>
          </div>
          <p className="text-muted-foreground">
            Welcome back! {config.welcomeMessage}
          </p>
        </div>
        <Badge variant="outline" className="capitalize">
          {userRole}
        </Badge>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpiData.map((kpi, index) => {
          const Icon = kpi.icon;
          return (
            <Card key={index} className="overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">{kpi.title}</p>
                    <p className="text-2xl font-semibold">{kpi.value}</p>
                    <div className="flex items-center gap-1">
                      <TrendingUp className={`h-4 w-4 ${kpi.trend === 'up' ? 'text-[#10b981]' : 'text-[#ef4444]'}`} />
                      <span className={`text-sm ${kpi.trend === 'up' ? 'text-[#10b981]' : 'text-[#ef4444]'}`}>
                        {kpi.change}
                      </span>
                      <span className="text-sm text-muted-foreground">vs last month</span>
                    </div>
                  </div>
                  <div className={`${kpi.color} p-3 rounded-lg`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Repayment Trends */}
        <Card>
          <CardHeader>
            <CardTitle>Repayment Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={repaymentTrends}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="month" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                  formatter={(value: number) => `TZS ${value.toFixed(1)}M`}
                />
                <Legend />
                <Line type="monotone" dataKey="expected" stroke="#0f4c81" strokeWidth={2} name="Expected" />
                <Line type="monotone" dataKey="collected" stroke="#14b8a6" strokeWidth={2} name="Collected" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Asset Performance */}
        <Card>
          <CardHeader>
            <CardTitle>Asset Distribution</CardTitle>
          </CardHeader>
          <CardContent>
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
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => `${value}%`} />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-4 grid grid-cols-3 gap-4">
              {assetPerformance.map((asset, index) => (
                <div key={index} className="text-center">
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index] }} />
                    <span className="text-sm text-muted-foreground">{asset.name}</span>
                  </div>
                  <p className="text-xl font-semibold">{asset.count}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Daily Collections and Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Daily Collections Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Daily Collections (This Week)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={dailyCollections}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="day" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                  formatter={(value: number) => `TZS ${value.toFixed(0)}K`}
                />
                <Bar dataKey="amount" fill="#14b8a6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Overdue Alerts */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Overdue Alerts</CardTitle>
              <Badge variant="destructive">{overdueAlerts.length}</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {overdueAlerts.map((alert, index) => (
                <div key={index} className="flex items-start gap-3 p-3 bg-red-50 rounded-lg border border-red-100">
                  <TriangleAlert className="h-5 w-5 text-[#ef4444] mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm">{alert.client}</p>
                    <p className="text-sm text-muted-foreground">{alert.amount}</p>
                    <div className="flex items-center gap-1 mt-1">
                      <Calendar className="h-3 w-3 text-[#ef4444]" />
                      <span className="text-xs text-[#ef4444]">{alert.days} days overdue</span>
                    </div>
                  </div>
                </div>
              ))}
              {overdueAlerts.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No overdue payments
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}