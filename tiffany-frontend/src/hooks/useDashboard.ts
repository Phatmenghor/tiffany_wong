import { useState, useCallback, useEffect, useRef } from 'react';
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

  // Separate loading states for each endpoint
  const [salesLoading, setSalesLoading] = useState(false);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [productsLoading, setProductsLoading] = useState(false);
  const [customersLoading, setCustomersLoading] = useState(false);
  const [paymentsLoading, setPaymentsLoading] = useState(false);

  const [error, setError] = useState<string | null>(null);

  // Abort controllers for request cancellation
  const abortControllersRef = useRef({
    sales: new AbortController(),
    orders: new AbortController(),
    products: new AbortController(),
    customers: new AbortController(),
    payments: new AbortController(),
  });

  const fetchSalesMetrics = useCallback(async () => {
    try {
      setSalesLoading(true);
      setError(null);
      const response = await axiosClientWithAuth.get('/api/v1/dashboard/sales', {
        signal: abortControllersRef.current.sales.signal,
      });
      setSalesMetrics(response.data.data);
    } catch (err: any) {
      if (err.name !== 'CanceledError') {
        setError(err instanceof Error ? err.message : 'Failed to fetch sales metrics');
      }
    } finally {
      setSalesLoading(false);
    }
  }, []);

  const fetchOrderMetrics = useCallback(async () => {
    try {
      setOrdersLoading(true);
      setError(null);
      const response = await axiosClientWithAuth.get('/api/v1/dashboard/orders', {
        signal: abortControllersRef.current.orders.signal,
      });
      setOrderMetrics(response.data.data);
    } catch (err: any) {
      if (err.name !== 'CanceledError') {
        setError(err instanceof Error ? err.message : 'Failed to fetch order metrics');
      }
    } finally {
      setOrdersLoading(false);
    }
  }, []);

  const fetchProductMetrics = useCallback(async () => {
    try {
      setProductsLoading(true);
      setError(null);
      const response = await axiosClientWithAuth.get('/api/v1/dashboard/products', {
        signal: abortControllersRef.current.products.signal,
      });
      setProductMetrics(response.data.data);
    } catch (err: any) {
      if (err.name !== 'CanceledError') {
        setError(err instanceof Error ? err.message : 'Failed to fetch product metrics');
      }
    } finally {
      setProductsLoading(false);
    }
  }, []);

  const fetchCustomerMetrics = useCallback(async () => {
    try {
      setCustomersLoading(true);
      setError(null);
      const response = await axiosClientWithAuth.get('/api/v1/dashboard/customers', {
        signal: abortControllersRef.current.customers.signal,
      });
      setCustomerMetrics(response.data.data);
    } catch (err: any) {
      if (err.name !== 'CanceledError') {
        setError(err instanceof Error ? err.message : 'Failed to fetch customer metrics');
      }
    } finally {
      setCustomersLoading(false);
    }
  }, []);

  const fetchPaymentMetrics = useCallback(async () => {
    try {
      setPaymentsLoading(true);
      setError(null);
      const response = await axiosClientWithAuth.get('/api/v1/dashboard/payments', {
        signal: abortControllersRef.current.payments.signal,
      });
      setPaymentMetrics(response.data.data);
    } catch (err: any) {
      if (err.name !== 'CanceledError') {
        setError(err instanceof Error ? err.message : 'Failed to fetch payment metrics');
      }
    } finally {
      setPaymentsLoading(false);
    }
  }, []);

  // Cleanup on unmount - abort all pending requests
  useEffect(() => {
    return () => {
      abortControllersRef.current.sales.abort();
      abortControllersRef.current.orders.abort();
      abortControllersRef.current.products.abort();
      abortControllersRef.current.customers.abort();
      abortControllersRef.current.payments.abort();
    };
  }, []);

  // Combined loading state for backwards compatibility
  const loading = salesLoading || ordersLoading || productsLoading || customersLoading || paymentsLoading;

  return {
    salesMetrics,
    orderMetrics,
    productMetrics,
    customerMetrics,
    paymentMetrics,
    loading,
    salesLoading,
    ordersLoading,
    productsLoading,
    customersLoading,
    paymentsLoading,
    error,
    fetchSalesMetrics,
    fetchOrderMetrics,
    fetchProductMetrics,
    fetchCustomerMetrics,
    fetchPaymentMetrics,
  };
};
