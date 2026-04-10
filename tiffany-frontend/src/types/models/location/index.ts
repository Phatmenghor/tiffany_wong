/**
 * Location Types
 * Location/geography related models
 */

export interface Location {
  id: string;
  name: string;
  slug: string;
  latitude?: number;
  longitude?: number;
  address?: string;
  city: string;
  country: string;
  postalCode?: string;
  createdAt: string;
  updatedAt: string;
}

export interface LocationCreateRequest {
  name: string;
  slug: string;
  latitude?: number;
  longitude?: number;
  address?: string;
  city: string;
  country: string;
  postalCode?: string;
}

export interface LocationUpdateRequest {
  name?: string;
  slug?: string;
  latitude?: number;
  longitude?: number;
  address?: string;
  city?: string;
  country?: string;
  postalCode?: string;
}

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface GeoBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}
