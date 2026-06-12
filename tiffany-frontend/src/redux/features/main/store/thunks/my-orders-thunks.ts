/**
 * My Orders Management - Async Thunks
 * Redux thunks for fetching user's orders
 */

import { axiosClientWithAuth } from "@/utils/axios/axios-client";
import { createApiThunk } from "@/utils/axios/api-wrapper";

export interface FetchMyOrdersParams {
  pageNo?: number;
  pageSize?: number;
  orderStatus?: string;
  paymentStatus?: string;
  paymentMethod?: string;
  search?: string;
}

/**
 * Fetch user's orders with filters
 */
export const fetchMyOrdersService = createApiThunk<
  any,
  FetchMyOrdersParams
>(
  "myOrders/fetchAll",
  async (params) => {
    const response = await axiosClientWithAuth.post(
      "/api/v1/orders/my-orders",
      params
    );
    return response.data.data;
  }
);

/**
 * Fetch order details by ID
 */
export const fetchOrderDetailsService = createApiThunk<any, string>(
  "myOrders/fetchDetails",
  async (orderId) => {
    const response = await axiosClientWithAuth.get(
      `/api/v1/orders/${orderId}`
    );
    return response.data.data;
  }
);

export interface CancelOrderParams {
  orderId: string;
  customerNote?: string;
}

/**
 * Cancel order via the generic update endpoint
 */
export const cancelOrderService = createApiThunk<any, CancelOrderParams>(
  "myOrders/cancel",
  async ({ orderId, customerNote }) => {
    const response = await axiosClientWithAuth.put(
      `/api/v1/orders/${orderId}`,
      { orderStatus: "CANCELLED", customerNote: customerNote || "" }
    );
    return response.data.data;
  }
);
