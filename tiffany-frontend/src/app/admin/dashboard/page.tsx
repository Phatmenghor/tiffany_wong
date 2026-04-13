'use client';

import React, { useEffect, useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useDashboard } from '@/hooks/useDashboard';
import { MetricCard } from './components/MetricCard';
import { SalesDashboard } from './components/SalesDashboard';
import {
  DollarSign, ShoppingCart, Users, TrendingUp, Package,
  CreditCard, Zap, Activity
} from 'lucide-react';

export default function DashboardPage() {
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
    // Fetch all metrics on component mount
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
