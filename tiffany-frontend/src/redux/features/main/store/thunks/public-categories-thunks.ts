import { createAsyncThunk } from "@reduxjs/toolkit";
import { axiosClient } from "@/utils/axios";
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
  PaginationResponseModel<CategoriesResponseModel>,
  FetchPublicCategoriesParams,
  { rejectValue: string }
>("publicCategories/fetchAll", async (params, { rejectWithValue }) => {
  try {
    const response = await axiosClient.post(
      "/api/v1/public/categories/all-data",
      {
        status: params.status || "ACTIVE",
        search: params.search || undefined,
      }
    );
    // Wrap array response in pagination format for compatibility
    const categories = response.data.data || [];
    return {
      content: categories,
      pageNo: 1,
      totalPages: 1,
      totalElements: categories.length,
      last: true,
      pageSize: categories.length,
      first: true,
      hasNext: false,
      hasPrevious: false,
      numberOfElements: categories.length,
    };
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message || "Failed to fetch categories"
    );
  }
});
