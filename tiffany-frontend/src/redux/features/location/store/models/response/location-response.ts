import { BasePagination } from "@/utils/common/pagination";

export interface ProvinceResponseModel {
  id: string;
  provinceCode: string;
  provinceEn: string;
  provinceKh: string;
}

export interface DistrictResponseModel {
  id: string;
  districtCode: string;
  districtEn: string;
  districtKh: string;
  provinceId?: string;
}

export interface CommuneResponseModel {
  id: string;
  communeCode: string;
  communeEn: string;
  communeKh: string;
  districtId?: string;
}

export interface VillageResponseModel {
  id: string;
  villageCode: string;
  villageEn: string;
  villageKh: string;
  communeId?: string;
}

export interface AllProvinceResponseModel extends BasePagination {
  content: ProvinceResponseModel[];
}

export interface AllDistrictResponseModel extends BasePagination {
  content: DistrictResponseModel[];
}

export interface AllCommuneResponseModel extends BasePagination {
  content: CommuneResponseModel[];
}

export interface AllVillageResponseModel extends BasePagination {
  content: VillageResponseModel[];
}

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
