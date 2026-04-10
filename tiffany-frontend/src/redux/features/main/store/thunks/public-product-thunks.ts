import { axiosClient, axiosClientWithAuth } from "@/utils/axios/axios-client";
import { createApiThunk } from "@/utils/axios/api-wrapper";
import {
  AllProductResponseModel,
  ProductDetailResponseModel,
} from "@/redux/features/business/store/models/response/product-response";
import {
  AllProductRequest,
  ProductImageRequest,
} from "@/redux/features/business/store/models/request/product-request";
import { Status } from "@/constants/status/status";

export const fetchPublicProducts = createApiThunk<any, AllProductRequest>(
  "publicProducts/fetchList",
  async (params) => {
    // Only add default ACTIVE status if no statuses filter is provided
    const requestBody = {
      ...((!params.statuses || params.statuses.length === 0) && { status: Status.ACTIVE }),
      ...params,
    };
    const response = await axiosClient.post("/api/v1/public/products/all", requestBody);
    return response.data.data;
  }
);

export const fetchPublicProductById = createApiThunk<
  ProductDetailResponseModel,
  string
>("publicProducts/fetchById", async (productId) => {
  const response = await axiosClient.get(
    `/api/v1/public/products/${productId}`
  );
  return response.data.data;
});

export const fetchPublicCategories = createApiThunk<any, void>(
  "publicProducts/fetchCategories",
  async () => {
    const response = await axiosClientWithAuth.post("/api/v1/categories/all", {
      pageSize: 100,
    });
    return response.data.data.content;
  }
);

export const fetchPublicBrands = createApiThunk<any, void>(
  "publicProducts/fetchBrands",
  async () => {
    const response = await axiosClientWithAuth.post("/api/v1/brands/all", {
      pageSize: 100,
    });
    return response.data.data.content;
  }
);
