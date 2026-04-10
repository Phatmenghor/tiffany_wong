/**
 * home-thunks.ts
 * All API calls specific to home page with pagination support
 */

import { Status } from "@/constants/status/status";
import { AllProductRequest } from "@/redux/features/business/store/models/request/product-request";
import { AllBannerRequest } from "@/redux/features/master-data/store/models/request/banner-request";
import { AllCategoriesRequest } from "@/redux/features/master-data/store/models/request/categories-request";
import { axiosClient, axiosClientWithAuth } from "@/utils/axios/axios-client";
import { createApiThunk } from "@/utils/axios/api-wrapper";

export const fetchHomeBanners = createApiThunk<any, AllBannerRequest>(
  "home/fetchBanners",
  async (request) => {
    const response = await axiosClient.post("/api/v1/public/banners/all", {
      status: Status.ACTIVE,
      ...request,
    });
    return response.data.data;
  },
);

export const fetchHomeCategories = createApiThunk<any, AllCategoriesRequest>(
  "home/fetchCategories",
  async (request) => {
    const response = await axiosClient.post("/api/v1/public/categories/all-data", {
      status: Status.ACTIVE,
      ...request,
    });
    return response.data.data;
  },
);

export const fetchHomePromotionProducts = createApiThunk<
  any,
  AllProductRequest
>("home/fetchPromotionProducts", async (request) => {
  const response = await axiosClient.post(
    "/api/v1/public/products/all",
    {
      hasPromotion: true,
      statuses: [Status.ACTIVE],
      pageNo: request?.pageNo || 1,
      pageSize: request?.pageSize || 20,
      ...request,
    },
  );
  return response.data.data;
});

// Paginated Featured Products
export const fetchHomeFeaturedProducts = createApiThunk<
  any,
  { pageNo: number; pageSize: number }
>("home/fetchFeaturedProducts", async ({ pageNo, pageSize }) => {
  const response = await axiosClient.post(
    "/api/v1/public/products/all",
    {
      pageNo: pageNo || 1,
      pageSize,
      statuses: [Status.ACTIVE],
    },
  );
  return response.data.data;
});

export const fetchHomeBrands = createApiThunk<any, void>(
  "home/fetchBrands",
  async () => {
    const response = await axiosClientWithAuth.post(
      "/api/v1/public/brands/all",
      {
        pageSize: 30,
        status: Status.ACTIVE,
      },
    );
    return response.data.data;
  },
);
