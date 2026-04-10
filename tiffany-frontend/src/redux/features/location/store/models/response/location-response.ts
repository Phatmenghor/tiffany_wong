import { BasePagination } from "@/utils/common/pagination";

export interface LocationResponseModel {
  id: string;
  userId: string;
  label: string;
  village: string;
  commune: string;
  district: string;
  province: string;
  country: string;
  streetNumber: string;
  houseNumber: string;
  note: string;
  latitude: number;
  longitude: number;
  isDefault: boolean;
  fullAddress: string;
  hasCoordinates: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
}

export interface AllLocationResponseModel extends BasePagination {
  content: LocationResponseModel[];
}
