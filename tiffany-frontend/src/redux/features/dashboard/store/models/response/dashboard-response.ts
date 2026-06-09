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

export interface DashboardOrder {
  id: string;
  orderCode: string;
  customerName: string;
  totalAmount: number;
  status: string;
  paymentMethod: string;
  itemCount: number;
  createdAt: string | null;
}

export interface DashboardOrdersResponse {
  data: DashboardOrder[];
  totalElements: number;
}

export interface DashboardTopProduct {
  id: string;
  name: string;
  unitsSold: number;
  revenue: number;
  category: string;
  imageUrl?: string;
}

export interface DashboardTopProductsResponse {
  data: DashboardTopProduct[];
  period: string;
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

export interface DashboardCustomerStatsResponse {
  newCustomers: number;
  returningCustomers: number;
  returnRate: number;
  totalCustomers: number;
  avgOrderValue: number;
}

export interface DashboardPromotion {
  id: string;
  name: string;
  type: string;
  timesUsed: number;
  revenueGenerated: number;
  discountGiven: number;
}

export interface DashboardPromotionsResponse {
  data: DashboardPromotion[];
}

export type DashboardPeriod = "TODAY" | "7D" | "30D" | "90D";
