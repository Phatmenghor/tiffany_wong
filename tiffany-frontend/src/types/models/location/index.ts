/**
 * Location Domain Types
 * Geographic locations, addresses, delivery areas
 */

export interface Location {
  id: string;
  name: string;
  type: LocationType;
  country: string;
  state?: string;
  city?: string;
  district?: string;
  area?: string;
  coordinates?: GeoCoordinates;
  status: LocationStatus;
  deliveryZones?: DeliveryZone[];
  serviceability?: ServiceabilityInfo;
  createdAt?: string;
  updatedAt?: string;
}

export type LocationType =
  | "COUNTRY"
  | "STATE"
  | "CITY"
  | "DISTRICT"
  | "AREA";

export type LocationStatus = "ACTIVE" | "INACTIVE";

export interface GeoCoordinates {
  latitude: number;
  longitude: number;
}

export interface DeliveryZone {
  id: string;
  locationId: string;
  radius: number; // in kilometers
  deliveryTime: number; // in hours
  deliveryCharge: number;
  isActive: boolean;
}

export interface ServiceabilityInfo {
  isServiceable: boolean;
  estimatedDeliveryDays: number;
  availablePaymentMethods: string[];
}

export interface LocationFilter {
  type?: LocationType;
  status?: LocationStatus;
  country?: string;
  searchTerm?: string;
}

export interface LocationListResponse {
  locations: Location[];
  total: number;
  page: number;
  pageSize: number;
}
