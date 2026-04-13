'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart,
  Bar,
} from 'recharts';
import { axiosClientWithAuth } from '@/utils/axios/axios-client';
import { ChartSkeleton } from './skeleton-loaders';

interface DailyData {
  date: string;
  ordersCount: number;
  revenue: number;
  completedOrders: number;
  newCustomers: number;
  totalAmount: number;
}

interface DailyTrendData {
  dailyData: DailyData[];
  period: string;
  totalDays: number;
}

export function DailyTrendsChart() {
  const [data, setData] = useState<DailyData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDailyTrends();
  }, []);

  const fetchDailyTrends = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Fetching daily trends from /api/v1/dashboard/daily-trends');

      const response = await axiosClientWithAuth.get<any>('/api/v1/dashboard/daily-trends?days=30');

      console.log('Daily trends response:', response.data);

      if (response.data?.data?.dailyData && Array.isArray(response.data.data.dailyData)) {
        const chartData = response.data.data.dailyData.map((item: any) => ({
          date: item.date,
          ordersCount: item.ordersCount || 0,
          revenue: typeof item.revenue === 'string' ? parseFloat(item.revenue) : item.revenue || 0,
          completedOrders: item.completedOrders || 0,
          newCustomers: item.newCustomers || 0,
          totalAmount: typeof item.totalAmount === 'string' ? parseFloat(item.totalAmount) : item.totalAmount || 0,
        }));
        console.log('Chart data prepared:', chartData);
        setData(chartData);
      } else {
        console.warn('No daily data received or invalid format');
        setError('No data available for daily trends');
      }
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || err?.message || 'Failed to fetch daily trends';
      setError(errorMessage);
      console.error('Daily trends error:', {
        message: errorMessage,
        status: err?.response?.status,
        data: err?.response?.data,
        fullError: err
      });
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const formatCurrency = (value: number) => {
    if (value >= 1000) {
      return `$${(value / 1000).toFixed(1)}K`;
    }
    return `$${value.toFixed(0)}`;
  };

  if (loading) {
    return (
      <Card className="border-2 border-blue-200 shadow-lg bg-white mb-8">
        <ChartSkeleton />
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="border-2 border-red-200 shadow-lg bg-white mb-8">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Daily Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800 font-semibold mb-2">Error Loading Daily Trends</p>
            <p className="text-red-700 text-sm mb-4">{error}</p>
            <button
              onClick={fetchDailyTrends}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
            >
              Try Again
            </button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Card className="border-2 border-gray-200 shadow-lg bg-white mb-8">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Daily Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-80">
            <p className="text-gray-600">No data available</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const chartData = data.map(item => ({
    ...item,
    date: formatDate(item.date),
  }));

  return (
    <Card className="border-2 border-blue-200 shadow-lg bg-white mb-8">
      <CardHeader className="pb-2 border-b-2 border-blue-200">
        <CardTitle className="text-xl font-bold">📈 Daily Trends - Last 30 Days</CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <ResponsiveContainer width="100%" height={380}>
          <ComposedChart
            data={chartData}
            margin={{ top: 10, right: 30, left: 0, bottom: 60 }}
          >
            <defs>
              <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="date"
              angle={-45}
              textAnchor="end"
              height={100}
              tick={{ fontSize: 12 }}
            />
            <YAxis
              yAxisId="left"
              label={{ value: 'Orders / Customers', angle: -90, position: 'insideLeft' }}
              tick={{ fontSize: 12 }}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              label={{ value: 'Revenue ($)', angle: 90, position: 'insideRight' }}
              tick={{ fontSize: 12 }}
            />
            <Tooltip
              formatter={(value: any) => {
                if (typeof value === 'number') {
                  if (value > 100) {
                    return formatCurrency(value);
                  }
                  return value.toFixed(0);
                }
                return value;
              }}
              labelFormatter={(label) => `Date: ${label}`}
              contentStyle={{ backgroundColor: '#fff', border: '1px solid #ccc' }}
            />
            <Legend
              wrapperStyle={{ paddingTop: '20px' }}
              iconType="line"
            />
            <Bar
              yAxisId="left"
              dataKey="ordersCount"
              fill="#8884d8"
              opacity={0.3}
              name="Total Orders"
            />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="ordersCount"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={{ fill: '#3b82f6', r: 4 }}
              activeDot={{ r: 6 }}
              name="Orders"
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="revenue"
              stroke="#ef4444"
              strokeWidth={2}
              dot={{ fill: '#ef4444', r: 4 }}
              activeDot={{ r: 6 }}
              name="Revenue"
            />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="completedOrders"
              stroke="#10b981"
              strokeWidth={2}
              dot={{ fill: '#10b981', r: 4 }}
              activeDot={{ r: 6 }}
              name="Completed Orders"
            />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="newCustomers"
              stroke="#f59e0b"
              strokeWidth={2}
              dot={{ fill: '#f59e0b', r: 4 }}
              activeDot={{ r: 6 }}
              name="New Customers"
            />
          </ComposedChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
