import { axiosClientWithAuth } from "@/utils/axios/axios-client";
import { createApiThunk } from "@/utils/axios/api-wrapper";
import {
  LocationCreateRequest,
  LocationFilterRequest,
  LocationUpdateRequest,
} from "../models/request/location-request";
import {
  AllLocationResponseModel,
  LocationResponseModel,
} from "../models/response/location-response";

export const fetchAllLocationsService = createApiThunk<
  AllLocationResponseModel,
  LocationFilterRequest | void
>("location/fetchAll", async (params) => {
  const response = await axiosClientWithAuth.post(
    "/api/v1/locations/my-addresses/all",
    {
      pageNo: 1,
      pageSize: 100,
      ...(params || {}),
    }
  );
  return response.data.data;
});

export const createLocationService = createApiThunk<
  LocationResponseModel,
  LocationCreateRequest
>("location/create", async (data) => {
  try {
    const response = await axiosClientWithAuth.post("/api/v1/locations", data);
    return response.data.data;
  } catch (error: any) {
    console.error("[Location] Create failed:", {
      error: error.message,
      status: error.response?.status,
      errorDetails: error.response?.data,
      sentData: data,
    });
    throw error;
  }
});

export const updateLocationService = createApiThunk<
  LocationResponseModel,
  LocationUpdateRequest
>("location/update", async ({ locationId, locationData }) => {
  try {
    const response = await axiosClientWithAuth.put(
      `/api/v1/locations/${locationId}`,
      locationData
    );
    return response.data.data;
  } catch (error: any) {
    console.error("[Location] Update failed:", {
      locationId,
      error: error.message,
      status: error.response?.status,
      errorDetails: error.response?.data,
    });
    throw error;
  }
});

export const deleteLocationService = createApiThunk<
  LocationResponseModel,
  string
>("location/delete", async (locationId) => {
  try {
    const response = await axiosClientWithAuth.delete(
      `/api/v1/locations/${locationId}`
    );
    return response.data.data;
  } catch (error: any) {
    console.error("[Location] Delete failed:", {
      locationId,
      error: error.message,
      status: error.response?.status,
    });
    throw error;
  }
});

export const fetchDefaultLocationService = createApiThunk<
  LocationResponseModel,
  void
>(
  "location/fetchDefault",
  async () => {
    const response = await axiosClientWithAuth.get("/api/v1/locations/default");
    return response.data.data;
  },
  { logError: false } // Don't log 404 - it's expected if no default exists
);
