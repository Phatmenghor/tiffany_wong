/**
 * Product Types
 * Product-related models and interfaces
 */

export interface Product {
  id: string;
  name: string;
  description: string;
  categoryId: string;
  price: number;
  mainImageUrl?: string;
  images?: string[];
  stock?: number;
  promotionType?: string;
  promotionValue?: number;
  promotionFromDate?: string;
  promotionToDate?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProductCreateRequest {
  name: string;
  description: string;
  categoryId: string;
  price: number;
  mainImageUrl?: string;
  images?: string[];
  stock?: number;
  promotionType?: string;
  promotionValue?: number;
  promotionFromDate?: string;
  promotionToDate?: string;
}

export interface ProductUpdateRequest {
  name?: string;
  description?: string;
  categoryId?: string;
  price?: number;
  mainImageUrl?: string;
  images?: string[];
  stock?: number;
  promotionType?: string;
  promotionValue?: number;
  promotionFromDate?: string;
  promotionToDate?: string;
  isActive?: boolean;
}

export interface ProductListResponse {
  data: Product[];
  total: number;
  page: number;
  pageSize: number;
}

export interface ProductCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  parentCategoryId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProductPromotion {
  id: string;
  productId: string;
  type: PromotionType;
  value: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export enum PromotionType {
  PERCENTAGE = "PERCENTAGE",
  FIXED_AMOUNT = "FIXED_AMOUNT",
  BUY_ONE_GET_ONE = "BUY_ONE_GET_ONE",
  QUANTITY_DISCOUNT = "QUANTITY_DISCOUNT",
}
