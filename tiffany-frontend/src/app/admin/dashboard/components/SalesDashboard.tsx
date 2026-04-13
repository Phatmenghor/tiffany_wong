'use client';

import React from 'react';
import { SalesMetrics } from '@/hooks/useDashboard';
import { MetricCard } from './MetricCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, ShoppingCart, Users, TrendingUp } from 'lucide-react';

interface SalesDashboardProps {
  metrics: SalesMetrics | null;
  loading: boolean;
}

export const SalesDashboard: React.FC<SalesDashboardProps> = ({ metrics, loading }) => {
  if (loading) {
    return <div className="text-center py-8">Loading sales metrics...</div>;
  }

  if (!metrics) {
    return <div className="text-center py-8">No data available</div>;
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };

  return (
    <div className="space-y-6">
      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Revenue"
          value={formatCurrency(metrics.totalRevenue)}
          subtitle="All time"
          icon={<DollarSign className="text-green-600" />}
          bgColor="bg-green-50"
        />
        <MetricCard
          title="Total Orders"
          value={metrics.totalOrders}
          subtitle="Completed and pending"
          icon={<ShoppingCart className="text-blue-600" />}
          bgColor="bg-blue-50"
        />
        <MetricCard
          title="Active Customers"
          value={metrics.activeCustomers}
          subtitle="Unique customers"
          icon={<Users className="text-purple-600" />}
          bgColor="bg-purple-50"
        />
        <MetricCard
          title="Average Order Value"
          value={formatCurrency(metrics.averageOrderValue)}
          subtitle="Per order"
          icon={<TrendingUp className="text-orange-600" />}
          bgColor="bg-orange-50"
        />
      </div>

      {/* Orders by Status */}
      <Card>
        <CardHeader>
          <CardTitle>Orders by Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 px-4">Status</th>
                  <th className="text-right py-2 px-4">Count</th>
                  <th className="text-right py-2 px-4">Total Amount</th>
                  <th className="text-right py-2 px-4">Percentage</th>
                </tr>
              </thead>
              <tbody>
                {metrics.ordersByStatus.map((item) => (
                  <tr key={item.status} className="border-b hover:bg-gray-50">
                    <td className="py-2 px-4 font-medium">{item.status}</td>
                    <td className="text-right py-2 px-4">{item.count}</td>
                    <td className="text-right py-2 px-4">{formatCurrency(item.totalAmount)}</td>
                    <td className="text-right py-2 px-4">
                      {metrics.totalOrders > 0 && (
                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                          {((item.count / metrics.totalOrders) * 100).toFixed(1)}%
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Top Products */}
      <Card>
        <CardHeader>
          <CardTitle>Top 5 Products by Revenue</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {metrics.topProducts.slice(0, 5).map((product, index) => (
              <div key={product.productId} className="flex items-center justify-between border-b pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-sm font-bold">
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-medium">{product.productName}</p>
                    <p className="text-xs text-gray-500">{product.quantity} units sold</p>
                  </div>
                </div>
                <p className="font-bold">{formatCurrency(product.revenue)}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Payment Methods */}
      <Card>
        <CardHeader>
          <CardTitle>Sales by Payment Method</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 px-4">Method</th>
                  <th className="text-right py-2 px-4">Orders</th>
                  <th className="text-right py-2 px-4">Amount</th>
                </tr>
              </thead>
              <tbody>
                {metrics.salesByPaymentMethod.map((item) => (
                  <tr key={item.method} className="border-b hover:bg-gray-50">
                    <td className="py-2 px-4 font-medium">{item.method}</td>
                    <td className="text-right py-2 px-4">{item.count}</td>
                    <td className="text-right py-2 px-4">{formatCurrency(item.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
