'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { axiosClientWithAuth } from '@/utils/axios/axios-client';
import { DollarSign, ShoppingCart, Users, TrendingUp, CheckCircle, Clock, Package } from 'lucide-react';

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
    return (
      <div className="p-8 text-center">
        <p className="text-gray-600">Loading dashboard...</p>
      </div>
    );
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
    return <div className="p-8 text-center">No data available</div>;
  }

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-4xl font-bold">Dashboard</h1>
        <p className="text-gray-600 mt-2">Business Overview</p>
      </div>

      {/* Revenue Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-lg p-8">
          <p className="text-green-700 text-sm font-semibold mb-2">TOTAL REVENUE</p>
          <p className="text-4xl font-bold text-green-900">{formatCurrency(data.totalRevenue)}</p>
        </div>
        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-200 rounded-lg p-8">
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
    </div>
  );
}
