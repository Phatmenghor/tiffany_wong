import { createAsyncThunk } from "@reduxjs/toolkit";
import { axiosClientWithAuth } from "@/utils/axios/axios-client";
import type {
  DashboardSummaryResponse,
  DashboardSalesResponse,
  DashboardPaymentsResponse,
  DashboardStockResponse,
  DashboardOrdersResponse,
  DashboardTopProductsResponse,
  DashboardHourlySalesResponse,
  DashboardCustomerStatsResponse,
  DashboardPromotionsResponse,
} from "../models/response/dashboard-response";

const BASE = "/api/v1/dashboard";

export const fetchDashboardSummaryThunk = createAsyncThunk<DashboardSummaryResponse, { period: string }>(
  "dashboard/fetchSummary",
  async ({ period }, { rejectWithValue }) => {
    try {
      const res = await axiosClientWithAuth.get(`${BASE}/summary`, { params: { period } });
      return res.data.data;
    } catch (e: any) {
      return rejectWithValue(e?.response?.data?.message || "Failed to load summary");
    }
  }
);

export const fetchDashboardSalesThunk = createAsyncThunk<DashboardSalesResponse, { period: string }>(
  "dashboard/fetchSales",
  async ({ period }, { rejectWithValue }) => {
    try {
      const res = await axiosClientWithAuth.get(`${BASE}/sales`, { params: { period } });
      return res.data.data;
    } catch (e: any) {
      return rejectWithValue(e?.response?.data?.message || "Failed to load sales");
    }
  }
);

export const fetchDashboardPaymentsThunk = createAsyncThunk<DashboardPaymentsResponse, { period: string }>(
  "dashboard/fetchPayments",
  async ({ period }, { rejectWithValue }) => {
    try {
      const res = await axiosClientWithAuth.get(`${BASE}/payments`, { params: { period } });
      return res.data.data;
    } catch (e: any) {
      return rejectWithValue(e?.response?.data?.message || "Failed to load payments");
    }
  }
);

export const fetchDashboardStockThunk = createAsyncThunk<DashboardStockResponse, void>(
  "dashboard/fetchStock",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axiosClientWithAuth.get(`${BASE}/stock`);
      return res.data.data;
    } catch (e: any) {
      return rejectWithValue(e?.response?.data?.message || "Failed to load stock");
    }
  }
);

export const fetchDashboardOrdersThunk = createAsyncThunk<DashboardOrdersResponse, { period: string }>(
  "dashboard/fetchOrders",
  async ({ period }, { rejectWithValue }) => {
    try {
      const res = await axiosClientWithAuth.get(`${BASE}/orders`, { params: { period } });
      return res.data.data;
    } catch (e: any) {
      return rejectWithValue(e?.response?.data?.message || "Failed to load orders");
    }
  }
);

export const fetchDashboardTopProductsThunk = createAsyncThunk<DashboardTopProductsResponse, { period: string }>(
  "dashboard/fetchTopProducts",
  async ({ period }, { rejectWithValue }) => {
    try {
      const res = await axiosClientWithAuth.get(`${BASE}/top-products`, { params: { period } });
      return res.data.data;
    } catch (e: any) {
      return rejectWithValue(e?.response?.data?.message || "Failed to load top products");
    }
  }
);

export const fetchDashboardHourlySalesThunk = createAsyncThunk<DashboardHourlySalesResponse, { period: string }>(
  "dashboard/fetchHourlySales",
  async ({ period }, { rejectWithValue }) => {
    try {
      const res = await axiosClientWithAuth.get(`${BASE}/hourly-sales`, { params: { period } });
      return res.data.data;
    } catch (e: any) {
      return rejectWithValue(e?.response?.data?.message || "Failed to load hourly sales");
    }
  }
);

export const fetchDashboardCustomerStatsThunk = createAsyncThunk<DashboardCustomerStatsResponse, { period: string }>(
  "dashboard/fetchCustomerStats",
  async ({ period }, { rejectWithValue }) => {
    try {
      const res = await axiosClientWithAuth.get(`${BASE}/customers`, { params: { period } });
      return res.data.data;
    } catch (e: any) {
      return rejectWithValue(e?.response?.data?.message || "Failed to load customer stats");
    }
  }
);

export const fetchDashboardPromotionsThunk = createAsyncThunk<DashboardPromotionsResponse, { period: string }>(
  "dashboard/fetchPromotions",
  async ({ period }, { rejectWithValue }) => {
    try {
      const res = await axiosClientWithAuth.get(`${BASE}/promotions`, { params: { period } });
      return res.data.data;
    } catch (e: any) {
      return rejectWithValue(e?.response?.data?.message || "Failed to load promotions");
    }
  }
);
