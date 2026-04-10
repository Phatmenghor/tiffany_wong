/**
 * Product Domain Types
 * Products, categories, inventory, pricing
 */

export interface Product {
  id: string;
  name: string;
  description: string;
  categoryId: string;
  categoryName?: string;
  price: number;
  mainImageUrl?: string;
  images?: ProductImage[];
  sizes?: ProductSize[];
  sku?: string;
  barcode?: string;
  status: ProductStatus;
  promotionType?: PromotionType;
  promotionValue?: number;
  promotionFromDate?: string;
  promotionToDate?: string;
  stock?: number;
  rating?: number;
  reviewCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProductImage {
  id?: string;
  imageUrl: string;
  altText?: string;
  displayOrder?: number;
}

export interface ProductSize {
  id?: string;
  name: string;
  price: number;
  sku?: string;
  barcode?: string;
  stock?: number;
  promotionType?: PromotionType;
  promotionValue?: number;
  promotionFromDate?: string;
  promotionToDate?: string;
}

export type ProductStatus = "ACTIVE" | "INACTIVE" | "DRAFT" | "ARCHIVED";
export type PromotionType = "NONE" | "PERCENTAGE" | "FIXED_AMOUNT";

export interface Category {
  id: string;
  name: string;
  description?: string;
  image?: string;
  parentId?: string;
  level?: number;
  status: "ACTIVE" | "INACTIVE";
  productCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProductFilter {
  categories?: string[];
  priceRange?: [number, number];
  rating?: number;
  inStock?: boolean;
  searchTerm?: string;
}

export interface ProductListResponse {
  products: Product[];
  total: number;
  page: number;
  pageSize: number;
}
