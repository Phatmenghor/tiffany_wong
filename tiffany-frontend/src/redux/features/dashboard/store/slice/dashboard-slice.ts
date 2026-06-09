import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type {
  DashboardCustomerStatsResponse,
  DashboardHourlySalesResponse,
  DashboardOrdersResponse,
  DashboardPaymentsResponse,
  DashboardPeriod,
  DashboardPromotionsResponse,
  DashboardSalesResponse,
  DashboardStockResponse,
  DashboardSummaryResponse,
  DashboardTopProductsResponse,
} from "../models/response/dashboard-response";
import {
  fetchDashboardCustomerStatsThunk,
  fetchDashboardHourlySalesThunk,
  fetchDashboardOrdersThunk,
  fetchDashboardPaymentsThunk,
  fetchDashboardPromotionsThunk,
  fetchDashboardSalesThunk,
  fetchDashboardStockThunk,
  fetchDashboardSummaryThunk,
  fetchDashboardTopProductsThunk,
} from "../thunks/dashboard-thunks";

interface DashboardState {
  period: DashboardPeriod;
  summary: DashboardSummaryResponse | null;
  sales: DashboardSalesResponse | null;
  payments: DashboardPaymentsResponse | null;
  stock: DashboardStockResponse | null;
  orders: DashboardOrdersResponse | null;
  topProducts: DashboardTopProductsResponse | null;
  hourlySales: DashboardHourlySalesResponse | null;
  customerStats: DashboardCustomerStatsResponse | null;
  promotions: DashboardPromotionsResponse | null;
  loading: {
    summary: boolean;
    sales: boolean;
    payments: boolean;
    stock: boolean;
    orders: boolean;
    topProducts: boolean;
    hourlySales: boolean;
    customerStats: boolean;
    promotions: boolean;
  };
  error: string | null;
}

const initialState: DashboardState = {
  period: "TODAY",
  summary: null, sales: null, payments: null, stock: null,
  orders: null, topProducts: null, hourlySales: null,
  customerStats: null, promotions: null,
  loading: {
    summary: true, sales: true, payments: true, stock: true,
    orders: true, topProducts: true, hourlySales: true,
    customerStats: true, promotions: true,
  },
  error: null,
};

const dashboardSlice = createSlice({
  name: "dashboard",
  initialState,
  reducers: {
    setPeriod: (state, action: PayloadAction<DashboardPeriod>) => { state.period = action.payload; },
    resetDashboard: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboardSummaryThunk.pending, (s) => { s.loading.summary = true; s.error = null; })
      .addCase(fetchDashboardSummaryThunk.fulfilled, (s, a) => { s.summary = a.payload; s.loading.summary = false; })
      .addCase(fetchDashboardSummaryThunk.rejected, (s, a) => { s.loading.summary = false; s.error = a.payload as string; });

    builder
      .addCase(fetchDashboardSalesThunk.pending, (s) => { s.loading.sales = true; })
      .addCase(fetchDashboardSalesThunk.fulfilled, (s, a) => { s.sales = a.payload; s.loading.sales = false; })
      .addCase(fetchDashboardSalesThunk.rejected, (s) => { s.loading.sales = false; });

    builder
      .addCase(fetchDashboardPaymentsThunk.pending, (s) => { s.loading.payments = true; })
      .addCase(fetchDashboardPaymentsThunk.fulfilled, (s, a) => { s.payments = a.payload; s.loading.payments = false; })
      .addCase(fetchDashboardPaymentsThunk.rejected, (s) => { s.loading.payments = false; });

    builder
      .addCase(fetchDashboardStockThunk.pending, (s) => { s.loading.stock = true; })
      .addCase(fetchDashboardStockThunk.fulfilled, (s, a) => { s.stock = a.payload; s.loading.stock = false; })
      .addCase(fetchDashboardStockThunk.rejected, (s) => { s.loading.stock = false; });

    builder
      .addCase(fetchDashboardOrdersThunk.pending, (s) => { s.loading.orders = true; })
      .addCase(fetchDashboardOrdersThunk.fulfilled, (s, a) => { s.orders = a.payload; s.loading.orders = false; })
      .addCase(fetchDashboardOrdersThunk.rejected, (s) => { s.loading.orders = false; });

    builder
      .addCase(fetchDashboardTopProductsThunk.pending, (s) => { s.loading.topProducts = true; })
      .addCase(fetchDashboardTopProductsThunk.fulfilled, (s, a) => { s.topProducts = a.payload; s.loading.topProducts = false; })
      .addCase(fetchDashboardTopProductsThunk.rejected, (s) => { s.loading.topProducts = false; });

    builder
      .addCase(fetchDashboardHourlySalesThunk.pending, (s) => { s.loading.hourlySales = true; })
      .addCase(fetchDashboardHourlySalesThunk.fulfilled, (s, a) => { s.hourlySales = a.payload; s.loading.hourlySales = false; })
      .addCase(fetchDashboardHourlySalesThunk.rejected, (s) => { s.loading.hourlySales = false; });

    builder
      .addCase(fetchDashboardCustomerStatsThunk.pending, (s) => { s.loading.customerStats = true; })
      .addCase(fetchDashboardCustomerStatsThunk.fulfilled, (s, a) => { s.customerStats = a.payload; s.loading.customerStats = false; })
      .addCase(fetchDashboardCustomerStatsThunk.rejected, (s) => { s.loading.customerStats = false; });

    builder
      .addCase(fetchDashboardPromotionsThunk.pending, (s) => { s.loading.promotions = true; })
      .addCase(fetchDashboardPromotionsThunk.fulfilled, (s, a) => { s.promotions = a.payload; s.loading.promotions = false; })
      .addCase(fetchDashboardPromotionsThunk.rejected, (s) => { s.loading.promotions = false; });
  },
});

export const { setPeriod, resetDashboard } = dashboardSlice.actions;
export default dashboardSlice.reducer;
