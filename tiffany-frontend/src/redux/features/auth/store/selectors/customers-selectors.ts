import { RootState } from "@/redux/store/types";
import { createSelector } from "@reduxjs/toolkit";

export const selectCustomersState = (state: RootState) => state.customers;

export const selectCustomers = (state: RootState) => state.customers.data;

export const selectCustomersContent = createSelector(
  [selectCustomers],
  (data) => data?.content || []
);

export const selectCustomersIsLoading = (state: RootState) => state.customers.isLoading;

export const selectCustomersError = (state: RootState) => state.customers.error;

export const selectCustomersFilters = (state: RootState) => state.customers.filters;

export const selectCustomersOperations = (state: RootState) => state.customers.operations;

export const selectCustomersPagination = createSelector([selectCustomers], (data) => ({
  currentPage: data?.pageNo || 1,
  totalPages: data?.totalPages || 1,
  totalElements: data?.totalElements || 0,
  pageSize: data?.pageSize || 15,
  last: data?.last || false,
  first: data?.first || true,
  hasNext: data?.hasNext || false,
  hasPrevious: data?.hasPrevious || false,
}));
