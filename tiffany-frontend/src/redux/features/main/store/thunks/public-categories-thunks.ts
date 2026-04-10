import { createAsyncThunk } from "@reduxjs/toolkit";
import { axiosClient } from "@/utils/axios/axios-client";
import { PaginationResponseModel } from "@/redux/features/master-data/store/models/response/pagination-response";
import { CategoriesResponseModel } from "@/redux/features/master-data/store/models/response/categories-response";

export interface FetchPublicCategoriesParams {
  pageNo?: number;
  pageSize?: number;
  search?: string;
  status?: string;
  append?: boolean;
}

export const fetchPublicCategories = createAsyncThunk<
  any,
  FetchPublicCategoriesParams,
  { rejectValue: string }
>("publicCategories/fetchAll", async (params, { rejectWithValue }) => {
  try {
    const response = await axiosClient.post(
      "/api/v1/public/categories/all-data",
      {
        pageNo: params.pageNo || 1,
        pageSize: params.pageSize || 15,
        status: params.status || "ACTIVE",
        search: params.search || undefined,
      }
    );
    return response.data.data;
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message || "Failed to fetch categories"
    );
  }
});
