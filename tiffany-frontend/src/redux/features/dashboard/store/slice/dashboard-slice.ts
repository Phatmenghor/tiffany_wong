import { createSlice } from "@reduxjs/toolkit";
import type {
  DashboardHourlySalesResponse,
  DashboardPaymentsResponse,
  DashboardSalesResponse,
  DashboardSummaryResponse,
} from "../models/response/dashboard-response";
import {
  fetchDashboardHourlySalesThunk,
  fetchDashboardPaymentsThunk,
  fetchDashboardSalesThunk,
  fetchDashboardSummaryThunk,
} from "../thunks/dashboard-thunks";

interface DashboardState {
  summary: DashboardSummaryResponse | null;
  sales: DashboardSalesResponse | null;
  payments: DashboardPaymentsResponse | null;
  hourlySales: DashboardHourlySalesResponse | null;
  loading: {
    summary: boolean;
    sales: boolean;
    payments: boolean;
    hourlySales: boolean;
  };
  error: string | null;
}

const initialState: DashboardState = {
  summary: null,
  sales: null,
  payments: null,
  hourlySales: null,
  loading: { summary: true, sales: true, payments: true, hourlySales: true },
  error: null,
};

const dashboardSlice = createSlice({
  name: "dashboard",
  initialState,
  reducers: {
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
      .addCase(fetchDashboardHourlySalesThunk.pending, (s) => { s.loading.hourlySales = true; })
      .addCase(fetchDashboardHourlySalesThunk.fulfilled, (s, a) => { s.hourlySales = a.payload; s.loading.hourlySales = false; })
      .addCase(fetchDashboardHourlySalesThunk.rejected, (s) => { s.loading.hourlySales = false; });
  },
});

export const { resetDashboard } = dashboardSlice.actions;
export default dashboardSlice.reducer;
