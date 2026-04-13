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

import React, { useEffect, useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useDashboard } from '@/hooks/useDashboard';
import { MetricCard } from './dashboard/components/MetricCard';
import { SalesDashboard } from './dashboard/components/SalesDashboard';
import {
  DollarSign, ShoppingCart, Users, TrendingUp, Package,
  CreditCard, Zap, Activity
} from 'lucide-react';

export default function AdminPage() {
  const {
    salesMetrics,
    orderMetrics,
    productMetrics,
    customerMetrics,
    paymentMetrics,
    loading,
    error,
    fetchSalesMetrics,
    fetchOrderMetrics,
    fetchProductMetrics,
    fetchCustomerMetrics,
    fetchPaymentMetrics,
  } = useDashboard();

  const [activeTab, setActiveTab] = useState('sales');

  useEffect(() => {
    fetchSalesMetrics();
    fetchOrderMetrics();
    fetchProductMetrics();
    fetchCustomerMetrics();
    fetchPaymentMetrics();
  }, []);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };

  if (error) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-red-800"><strong>Error:</strong> {error}</p>
        <p className="text-red-700 text-sm mt-2">Make sure the backend API is running at {process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-gray-600">Real-time analytics and business metrics</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="sales">Sales</TabsTrigger>
          <TabsTrigger value="orders">Orders</TabsTrigger>
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="customers">Customers</TabsTrigger>
          <TabsTrigger value="payments">Payments</TabsTrigger>
        </TabsList>

        {/* SALES TAB */}
        <TabsContent value="sales" className="space-y-6">
          <SalesDashboard metrics={salesMetrics} loading={loading} />
        </TabsContent>

        {/* ORDERS TAB */}
        <TabsContent value="orders" className="space-y-6">
          {loading ? (
            <div className="text-center py-8">Loading order metrics...</div>
          ) : orderMetrics ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <MetricCard
                  title="Total Orders"
                  value={orderMetrics.totalOrders}
                  icon={<ShoppingCart className="text-blue-600" />}
                  bgColor="bg-blue-50"
                />
                <MetricCard
                  title="Pending"
                  value={orderMetrics.pendingOrders}
                  icon={<Zap className="text-yellow-600" />}
                  bgColor="bg-yellow-50"
                />
                <MetricCard
                  title="Confirmed"
                  value={orderMetrics.confirmedOrders}
                  icon={<Activity className="text-blue-600" />}
                  bgColor="bg-blue-50"
                />
                <MetricCard
                  title="Completed"
                  value={orderMetrics.completedOrders}
                  icon={<TrendingUp className="text-green-600" />}
                  bgColor="bg-green-50"
                />
                <MetricCard
                  title="Fulfillment"
                  value={`${orderMetrics.fulfillmentRate.toFixed(1)}%`}
                  icon={<Activity className="text-purple-600" />}
                  bgColor="bg-purple-50"
                />
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Recent Orders</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-2 px-4">Order #</th>
                          <th className="text-left py-2 px-4">Customer</th>
                          <th className="text-right py-2 px-4">Amount</th>
                          <th className="text-center py-2 px-4">Status</th>
                          <th className="text-center py-2 px-4">Payment</th>
                        </tr>
                      </thead>
                      <tbody>
                        {orderMetrics.recentOrders.slice(0, 10).map((order) => (
                          <tr key={order.orderId} className="border-b hover:bg-gray-50">
                            <td className="py-2 px-4 font-mono text-xs">{order.orderNumber}</td>
                            <td className="py-2 px-4">{order.customerName}</td>
                            <td className="text-right py-2 px-4 font-bold">{formatCurrency(order.totalAmount)}</td>
                            <td className="text-center py-2 px-4">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                order.orderStatus === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                                order.orderStatus === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                                order.orderStatus === 'CONFIRMED' ? 'bg-blue-100 text-blue-800' :
                                'bg-red-100 text-red-800'
                              }`}>
                                {order.orderStatus}
                              </span>
                            </td>
                            <td className="text-center py-2 px-4">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                order.paymentStatus === 'PAID' ? 'bg-green-100 text-green-800' :
                                order.paymentStatus === 'UNPAID' ? 'bg-red-100 text-red-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {order.paymentStatus}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <div className="text-center py-8">No data available</div>
          )}
        </TabsContent>

        {/* PRODUCTS TAB */}
        <TabsContent value="products" className="space-y-6">
          {loading ? (
            <div className="text-center py-8">Loading product metrics...</div>
          ) : productMetrics ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <MetricCard
                  title="Total Products"
                  value={productMetrics.totalProducts}
                  icon={<Package className="text-blue-600" />}
                  bgColor="bg-blue-50"
                />
                <MetricCard
                  title="Active"
                  value={productMetrics.activeProducts}
                  icon={<TrendingUp className="text-green-600" />}
                  bgColor="bg-green-50"
                />
                <MetricCard
                  title="Inactive"
                  value={productMetrics.inactiveProducts}
                  icon={<Zap className="text-gray-600" />}
                  bgColor="bg-gray-50"
                />
                <MetricCard
                  title="On Promotion"
                  value={productMetrics.productsWithPromotion}
                  icon={<Activity className="text-purple-600" />}
                  bgColor="bg-purple-50"
                />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Top 5 Products by Revenue</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {productMetrics.topProductsByRevenue.slice(0, 5).map((product, idx) => (
                        <div key={product.productId} className="flex justify-between items-center border-b pb-2">
                          <div>
                            <p className="font-medium text-sm">{idx + 1}. {product.productName}</p>
                            <p className="text-xs text-gray-500">{product.quantity} units</p>
                          </div>
                          <p className="font-bold text-sm">{formatCurrency(product.revenue)}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Products by Category</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {productMetrics.productsByCategory.slice(0, 5).map((category) => (
                        <div key={category.categoryId} className="flex justify-between items-center border-b pb-2">
                          <div>
                            <p className="font-medium text-sm">{category.categoryName}</p>
                            <p className="text-xs text-gray-500">{category.productCount} products</p>
                          </div>
                          <p className="font-bold text-sm">{formatCurrency(category.revenue)}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </>
          ) : (
            <div className="text-center py-8">No data available</div>
          )}
        </TabsContent>

        {/* CUSTOMERS TAB */}
        <TabsContent value="customers" className="space-y-6">
          {loading ? (
            <div className="text-center py-8">Loading customer metrics...</div>
          ) : customerMetrics ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <MetricCard
                  title="Total Customers"
                  value={customerMetrics.totalCustomers}
                  icon={<Users className="text-blue-600" />}
                  bgColor="bg-blue-50"
                />
                <MetricCard
                  title="Active Customers"
                  value={customerMetrics.activeCustomers}
                  icon={<Activity className="text-green-600" />}
                  bgColor="bg-green-50"
                />
                <MetricCard
                  title="New This Month"
                  value={customerMetrics.newCustomersThisMonth}
                  icon={<TrendingUp className="text-purple-600" />}
                  bgColor="bg-purple-50"
                />
                <MetricCard
                  title="Avg. Customer Value"
                  value={formatCurrency(customerMetrics.averageCustomerValue)}
                  icon={<DollarSign className="text-orange-600" />}
                  bgColor="bg-orange-50"
                />
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Top 10 Customers by Spending</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-2 px-4">Customer</th>
                          <th className="text-left py-2 px-4">Email</th>
                          <th className="text-right py-2 px-4">Orders</th>
                          <th className="text-right py-2 px-4">Total Spent</th>
                        </tr>
                      </thead>
                      <tbody>
                        {customerMetrics.topCustomers.slice(0, 10).map((customer) => (
                          <tr key={customer.customerId} className="border-b hover:bg-gray-50">
                            <td className="py-2 px-4 font-medium">{customer.customerName}</td>
                            <td className="py-2 px-4 text-xs">{customer.email}</td>
                            <td className="text-right py-2 px-4">{customer.orderCount}</td>
                            <td className="text-right py-2 px-4 font-bold">{formatCurrency(customer.totalSpent)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <div className="text-center py-8">No data available</div>
          )}
        </TabsContent>

        {/* PAYMENTS TAB */}
        <TabsContent value="payments" className="space-y-6">
          {loading ? (
            <div className="text-center py-8">Loading payment metrics...</div>
          ) : paymentMetrics ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <MetricCard
                  title="Total Revenue (Paid)"
                  value={formatCurrency(paymentMetrics.totalRevenuePaid)}
                  icon={<DollarSign className="text-green-600" />}
                  bgColor="bg-green-50"
                />
                <MetricCard
                  title="Outstanding"
                  value={formatCurrency(paymentMetrics.totalRevenueUnpaid)}
                  icon={<CreditCard className="text-orange-600" />}
                  bgColor="bg-orange-50"
                />
                <MetricCard
                  title="Refunded"
                  value={formatCurrency(paymentMetrics.totalRevenueRefunded)}
                  icon={<Activity className="text-red-600" />}
                  bgColor="bg-red-50"
                />
                <MetricCard
                  title="Payment Rate"
                  value={`${paymentMetrics.paymentRate.toFixed(1)}%`}
                  icon={<TrendingUp className="text-blue-600" />}
                  bgColor="bg-blue-50"
                />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Payment Status Distribution</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {paymentMetrics.paymentStatusDistribution.map((status) => (
                        <div key={status.status} className="flex justify-between items-center">
                          <div>
                            <p className="font-medium text-sm">{status.status}</p>
                            <div className="w-32 h-2 bg-gray-200 rounded-full mt-1">
                              <div
                                className={`h-2 rounded-full ${
                                  status.status === 'PAID' ? 'bg-green-600' :
                                  status.status === 'UNPAID' ? 'bg-red-600' :
                                  'bg-gray-600'
                                }`}
                                style={{ width: `${status.percentage}%` }}
                              />
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-sm">{status.count}</p>
                            <p className="text-xs text-gray-500">{status.percentage.toFixed(1)}%</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Revenue by Payment Method</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {paymentMetrics.revenueByPaymentMethod.map((method) => (
                        <div key={method.method} className="flex justify-between items-center border-b pb-2">
                          <div>
                            <p className="font-medium text-sm">{method.method}</p>
                            <p className="text-xs text-gray-500">{method.count} transactions</p>
                          </div>
                          <p className="font-bold text-sm">{formatCurrency(method.amount)}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </>
          ) : (
            <div className="text-center py-8">No data available</div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
