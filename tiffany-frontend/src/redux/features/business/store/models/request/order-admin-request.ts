import { BaseGetAllRequest } from "@/utils/common/get-all-request";

export interface AllOrderAdminRequest extends BaseGetAllRequest {
  businessId?: string;
  orderStatus?: string;
  paymentMethod?: string;
  paymentStatus?: string;
}

export interface UpdateOrderRequest {
  orderStatus?: string;
  paymentStatus?: string;
  customerNote?: string;
}

export interface UpdateOrderParams {
  orderId: string;
  orderData: UpdateOrderRequest;
}
