'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { axiosClientWithAuth } from '@/utils/axios/axios-client';
import { DollarSign, ShoppingCart, Users, TrendingUp, CheckCircle, Clock, Package } from 'lucide-react';
import { PieChart, Pie, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { DashboardSkeleton } from '@/components/shared/common/skeleton-loaders';

interface SimpleDashboardData {
  totalRevenue: number;
  totalOrders: number;
  pendingOrders: number;
  completedOrders: number;
  totalCustomers: number;
  newCustomersThisMonth: number;
  totalProducts: number;
  activeProducts: number;
  paidOrders: number;
  unpaidOrders: number;
  totalPaid: number;
  totalUnpaid: number;
  fulfillmentRate: number;
  paymentRate: number;
  averageOrderValue: number;
}

const MetricCard = ({
  title,
  value,
  icon: Icon,
  bgColor = 'bg-blue-50',
  subtitle,
}: {
  title: string;
  value: string | number;
  icon: any;
  bgColor?: string;
  subtitle?: string;
}) => (
  <Card className={bgColor}>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      <Icon className="w-5 h-5 text-gray-600" />
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
      {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
    </CardContent>
  </Card>
);

export default function AdminPage() {
  const [data, setData] = useState<SimpleDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axiosClientWithAuth.get('/api/v1/dashboard/simple');
      setData(response.data.data);
    } catch (err: any) {
      setError(err instanceof Error ? err.message : 'Failed to fetch dashboard');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };

  if (loading) {
    return <DashboardSkeleton />;
  }

  if (error) {
    return (
      <div className="p-8 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-red-800"><strong>Error:</strong> {error}</p>
        <button
          onClick={fetchDashboard}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!data) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="p-8 space-y-8 bg-gradient-to-b from-gray-50 to-white min-h-screen">
      <div>
        <h1 className="text-4xl font-bold">Dashboard</h1>
        <p className="text-gray-600 mt-2">Business Overview & Analysis</p>
      </div>

      {/* Top Summary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-lg p-8 shadow">
          <p className="text-green-700 text-sm font-semibold mb-2">TOTAL REVENUE</p>
          <p className="text-4xl font-bold text-green-900">{formatCurrency(data.totalRevenue)}</p>
        </div>
        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-200 rounded-lg p-8 shadow">
          <p className="text-blue-700 text-sm font-semibold mb-2">AVERAGE ORDER VALUE</p>
          <p className="text-4xl font-bold text-blue-900">{formatCurrency(data.averageOrderValue)}</p>
        </div>
      </div>

      {/* Main Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Orders"
          value={data.totalOrders}
          icon={ShoppingCart}
          bgColor="bg-blue-50"
          subtitle="All orders"
        />
        <MetricCard
          title="Pending Orders"
          value={data.pendingOrders}
          icon={Clock}
          bgColor="bg-yellow-50"
          subtitle="Awaiting confirmation"
        />
        <MetricCard
          title="Completed Orders"
          value={data.completedOrders}
          icon={CheckCircle}
          bgColor="bg-green-50"
          subtitle="Finished"
        />
        <MetricCard
          title="Fulfillment Rate"
          value={`${data.fulfillmentRate.toFixed(1)}%`}
          icon={TrendingUp}
          bgColor="bg-purple-50"
          subtitle="Completion rate"
        />
      </div>

      {/* Customer Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MetricCard
          title="Total Customers"
          value={data.totalCustomers}
          icon={Users}
          bgColor="bg-indigo-50"
          subtitle="All registered"
        />
        <MetricCard
          title="New Customers"
          value={data.newCustomersThisMonth}
          icon={Users}
          bgColor="bg-pink-50"
          subtitle="This month"
        />
        <MetricCard
          title="Total Products"
          value={data.totalProducts}
          icon={Package}
          bgColor="bg-amber-50"
          subtitle={`${data.activeProducts} active`}
        />
      </div>

      {/* Payment Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border-l-4 border-green-500 p-6 rounded shadow">
          <p className="text-gray-600 text-sm mb-2">PAID ORDERS</p>
          <p className="text-2xl font-bold text-gray-900">{data.paidOrders}</p>
          <p className="text-green-600 text-sm mt-2">{formatCurrency(data.totalPaid)}</p>
        </div>
        <div className="bg-white border-l-4 border-red-500 p-6 rounded shadow">
          <p className="text-gray-600 text-sm mb-2">UNPAID ORDERS</p>
          <p className="text-2xl font-bold text-gray-900">{data.unpaidOrders}</p>
          <p className="text-red-600 text-sm mt-2">{formatCurrency(data.totalUnpaid)}</p>
        </div>
        <div className="bg-white border-l-4 border-blue-500 p-6 rounded shadow">
          <p className="text-gray-600 text-sm mb-2">PAYMENT RATE</p>
          <p className="text-2xl font-bold text-gray-900">{data.paymentRate.toFixed(1)}%</p>
          <p className="text-blue-600 text-sm mt-2">Collection rate</p>
        </div>
      </div>

      {/* Key Performance Indicators */}
      <Card className="border border-gray-200 shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg">📊 Key Performance Indicators</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="border-l-4 border-blue-500 pl-4 py-2">
              <p className="text-gray-600 text-sm">Fulfillment Rate</p>
              <p className="text-3xl font-bold text-blue-600 mt-1">{data.fulfillmentRate.toFixed(1)}%</p>
              <p className="text-xs text-gray-500 mt-1">Completion rate</p>
            </div>
            <div className="border-l-4 border-green-500 pl-4 py-2">
              <p className="text-gray-600 text-sm">Payment Rate</p>
              <p className="text-3xl font-bold text-green-600 mt-1">{data.paymentRate.toFixed(1)}%</p>
              <p className="text-xs text-gray-500 mt-1">Collection rate</p>
            </div>
            <div className="border-l-4 border-purple-500 pl-4 py-2">
              <p className="text-gray-600 text-sm">Avg Order Value</p>
              <p className="text-3xl font-bold text-purple-600 mt-1">{formatCurrency(data.averageOrderValue)}</p>
              <p className="text-xs text-gray-500 mt-1">Per order</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* SECONDARY: Distribution Charts (Pie Charts) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Order Status Distribution */}
        <Card className="border border-gray-200 shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">📦 Order Status Distribution</CardTitle>
          </CardHeader>
          <CardContent className="flex justify-center">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={[
                    { name: 'Completed', value: data.completedOrders, fill: '#10b981' },
                    { name: 'Pending', value: data.pendingOrders, fill: '#f59e0b' },
                  ]}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value, percent = 0 }) => `${name}: ${value} (${(percent * 100).toFixed(0)}%)`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  <Cell fill="#10b981" />
                  <Cell fill="#f59e0b" />
                </Pie>
                <Tooltip formatter={(value) => (typeof value === 'number' ? value : 0)} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Payment Status Distribution */}
        <Card className="border border-gray-200 shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">💳 Payment Status Distribution</CardTitle>
          </CardHeader>
          <CardContent className="flex justify-center">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={[
                    { name: 'Paid', value: data.paidOrders, fill: '#059669' },
                    { name: 'Unpaid', value: data.unpaidOrders, fill: '#dc2626' },
                  ]}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value, percent = 0 }) => `${name}: ${value} (${(percent * 100).toFixed(0)}%)`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  <Cell fill="#059669" />
                  <Cell fill="#dc2626" />
                </Pie>
                <Tooltip formatter={(value) => (typeof value === 'number' ? value : 0)} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
