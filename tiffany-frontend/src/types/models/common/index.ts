/**
 * Common/Shared Types and Interfaces
 * Used across multiple domains
 */

export * from "./business-profile";

// Common UI Component Props Types
export interface BaseComponentProps {
  className?: string;
  testId?: string;
}

export interface LoadingState {
  isLoading: boolean;
  error?: string | null;
  message?: string;
}

export interface PaginationState {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalElements: number;
}

export interface ApiResponse<T> {
  status: "success" | "error";
  data?: T;
  message?: string;
  error?: string;
}
