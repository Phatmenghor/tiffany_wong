import { useState } from 'react';
import { axiosClientWithAuth } from '@/utils/axios/axios-client';

export interface SalesMetrics {
  totalRevenue: number;
  totalOrders: number;
  activeCustomers: number;
  averageOrderValue: number;
  revenueTrend: Array<{
    date: string;
    revenue: number;
    orderCount: number;
  }>;
  ordersByStatus: Array<{
    status: string;
    count: number;
    totalAmount: number;
  }>;
  paymentStatusDistribution: Array<{
    status: string;
    count: number;
    amount: number;
  }>;
  topProducts: Array<{
    productId: string;
    productName: string;
    quantity: number;
    revenue: number;
  }>;
  salesByPaymentMethod: Array<{
    method: string;
    count: number;
    amount: number;
  }>;
}

export interface OrderMetrics {
  totalOrders: number;
  pendingOrders: number;
  confirmedOrders: number;
  completedOrders: number;
  cancelledOrders: number;
  fulfillmentRate: number;
  ordersByStatus: Array<{
    status: string;
    count: number;
  }>;
  recentOrders: Array<{
    orderId: string;
    orderNumber: string;
    customerName: string;
    totalAmount: number;
    orderStatus: string;
    paymentStatus: string;
    createdAt: string;
  }>;
}

export interface ProductMetrics {
  totalProducts: number;
  activeProducts: number;
  inactiveProducts: number;
  productsWithPromotion: number;
  topProductsByRevenue: Array<{
    productId: string;
    productName: string;
    quantity: number;
    revenue: number;
  }>;
  topProductsByViews: Array<{
    productId: string;
    productName: string;
    viewCount: number;
  }>;
  topProductsByFavorites: Array<{
    productId: string;
    productName: string;
    favoriteCount: number;
  }>;
  productsByCategory: Array<{
    categoryId: string;
    categoryName: string;
    productCount: number;
    revenue: number;
  }>;
  lowestPerformanceProducts: Array<{
    productId: string;
    productName: string;
    revenue: number;
  }>;
}

export interface CustomerMetrics {
  totalCustomers: number;
  activeCustomers: number;
  newCustomersThisMonth: number;
  totalCustomerValue: number;
  averageCustomerValue: number;
  topCustomers: Array<{
    customerId: string;
    customerName: string;
    email: string;
    orderCount: number;
    totalSpent: number;
  }>;
  newCustomers: Array<{
    customerId: string;
    customerName: string;
    email: string;
    registeredDate: string;
    totalSpent: number;
  }>;
}

export interface PaymentMetrics {
  totalOrders: number;
  paidOrders: number;
  unpaidOrders: number;
  refundedOrders: number;
  totalRevenuePaid: number;
  totalRevenueUnpaid: number;
  totalRevenueRefunded: number;
  paymentRate: number;
  paymentStatusDistribution: Array<{
    status: string;
    count: number;
    amount: number;
    percentage: number;
  }>;
  revenueByPaymentMethod: Array<{
    method: string;
    count: number;
    amount: number;
    percentage: number;
  }>;
}

export const useDashboard = () => {
  const [salesMetrics, setSalesMetrics] = useState<SalesMetrics | null>(null);
  const [orderMetrics, setOrderMetrics] = useState<OrderMetrics | null>(null);
  const [productMetrics, setProductMetrics] = useState<ProductMetrics | null>(null);
  const [customerMetrics, setCustomerMetrics] = useState<CustomerMetrics | null>(null);
  const [paymentMetrics, setPaymentMetrics] = useState<PaymentMetrics | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSalesMetrics = async () => {
    try {
      setLoading(true);
      const response = await axiosClientWithAuth.get('/api/v1/dashboard/sales');
      setSalesMetrics(response.data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch sales metrics');
    } finally {
      setLoading(false);
    }
  };

  const fetchOrderMetrics = async () => {
    try {
      setLoading(true);
      const response = await axiosClientWithAuth.get('/api/v1/dashboard/orders');
      setOrderMetrics(response.data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch order metrics');
    } finally {
      setLoading(false);
    }
  };

  const fetchProductMetrics = async () => {
    try {
      setLoading(true);
      const response = await axiosClientWithAuth.get('/api/v1/dashboard/products');
      setProductMetrics(response.data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch product metrics');
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomerMetrics = async () => {
    try {
      setLoading(true);
      const response = await axiosClientWithAuth.get('/api/v1/dashboard/customers');
      setCustomerMetrics(response.data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch customer metrics');
    } finally {
      setLoading(false);
    }
  };

  const fetchPaymentMetrics = async () => {
    try {
      setLoading(true);
      const response = await axiosClientWithAuth.get('/api/v1/dashboard/payments');
      setPaymentMetrics(response.data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch payment metrics');
    } finally {
      setLoading(false);
    }
  };

  return {
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
  };
};
