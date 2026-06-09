import { createAsyncThunk } from "@reduxjs/toolkit";
import { axiosClientWithAuth } from "@/utils/axios/axios-client";
import type {
  DashboardSummaryResponse,
  DashboardSalesResponse,
  DashboardPaymentsResponse,
  DashboardHourlySalesResponse,
} from "../models/response/dashboard-response";

const BASE = "/api/v1/dashboard";

export const fetchDashboardSummaryThunk = createAsyncThunk<DashboardSummaryResponse, void>(
  "dashboard/fetchSummary",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axiosClientWithAuth.get(`${BASE}/summary`);
      return res.data.data;
    } catch (e: any) {
      return rejectWithValue(e?.response?.data?.message || "Failed to load summary");
    }
  }
);

export const fetchDashboardSalesThunk = createAsyncThunk<DashboardSalesResponse, void>(
  "dashboard/fetchSales",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axiosClientWithAuth.get(`${BASE}/sales`);
      return res.data.data;
    } catch (e: any) {
      return rejectWithValue(e?.response?.data?.message || "Failed to load sales");
    }
  }
);

export const fetchDashboardPaymentsThunk = createAsyncThunk<DashboardPaymentsResponse, void>(
  "dashboard/fetchPayments",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axiosClientWithAuth.get(`${BASE}/payments`);
      return res.data.data;
    } catch (e: any) {
      return rejectWithValue(e?.response?.data?.message || "Failed to load payments");
    }
  }
);

export const fetchDashboardHourlySalesThunk = createAsyncThunk<DashboardHourlySalesResponse, void>(
  "dashboard/fetchHourlySales",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axiosClientWithAuth.get(`${BASE}/hourly-sales`);
      return res.data.data;
    } catch (e: any) {
      return rejectWithValue(e?.response?.data?.message || "Failed to load hourly sales");
    }
  }
);
