export interface DashboardSummaryResponse {
  totalSalesToday: number;
  totalOrdersToday: number;
  totalOrdersChange: number;
  totalSalesChange: number;
  systemAlerts: number;
  avgOrderValue: number;
}

export interface SalesDataPoint {
  date: string;
  revenue: number;
  orders: number;
}

export interface DashboardSalesResponse {
  data: SalesDataPoint[];
  totalRevenue: number;
  totalOrders: number;
  period: string;
}

export interface PaymentMethodData {
  method: string;
  amount: number;
  count: number;
  percentage: number;
}

export interface DashboardPaymentsResponse {
  data: PaymentMethodData[];
  totalAmount: number;
  totalCount: number;
}

export interface HourlySalesPoint {
  hour: number;
  revenue: number;
  orders: number;
}

export interface DashboardHourlySalesResponse {
  data: HourlySalesPoint[];
  peakHour: number;
  currentHour: number;
}
