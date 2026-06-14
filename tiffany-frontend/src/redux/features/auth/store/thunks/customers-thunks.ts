import {
  AdminChangePasswordRequest,
  AllUserRequest,
  UpdateUserParams,
} from "../models/request/users-request";
import { UserResponseModel } from "../models/response/users-response";
import { axiosClientWithAuth } from "@/utils/axios/axios-client";
import { createApiThunk } from "@/utils/axios/api-wrapper";

export const fetchAllCustomersService = createApiThunk<any, AllUserRequest>(
  "customers/fetchAll",
  async (params) => {
    const response = await axiosClientWithAuth.post("/api/v1/users/all", params);
    return response.data.data;
  }
);

export const fetchCustomerByIdService = createApiThunk<any, string>(
  "customers/fetchById",
  async (userId) => {
    const response = await axiosClientWithAuth.get(`/api/v1/users/${userId}`);
    return response.data.data;
  }
);

export const deleteCustomerService = createApiThunk<any, string>(
  "customers/delete",
  async (userId) => {
    const response = await axiosClientWithAuth.delete(`/api/v1/users/${userId}`);
    return response.data.data;
  }
);

export const toggleCustomerStatusService = createApiThunk<any, UserResponseModel>(
  "customers/toggleStatus",
  async (user) => {
    if (!user?.id) throw new Error("User ID is required");
    const newStatus = user.accountStatus === "ACTIVE" ? "LOCKED" : "ACTIVE";
    const response = await axiosClientWithAuth.put(`/api/v1/users/${user.id}`, {
      accountStatus: newStatus,
    });
    return response.data.data;
  }
);

export const adminChangeCustomerPasswordService = createApiThunk<any, AdminChangePasswordRequest>(
  "customers/adminChangePassword",
  async (resetParam) => {
    const response = await axiosClientWithAuth.post(`/api/v1/users/admin/reset-password`, resetParam);
    return response.data.data;
  }
);

export const updateCustomerService = createApiThunk<any, UpdateUserParams>(
  "customers/update",
  async ({ userId, userData }) => {
    const response = await axiosClientWithAuth.put(`/api/v1/users/${userId}`, userData);
    return response.data.data;
  }
);
