import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
  fetchAllCustomersService,
  fetchCustomerByIdService,
  deleteCustomerService,
  toggleCustomerStatusService,
  updateCustomerService,
  adminChangeCustomerPasswordService,
} from "../thunks/customers-thunks";
import { UserManagementState } from "../models/type/users-types";
import { AccountStatus, UserRole } from "@/constants/status/status";

const initialState: UserManagementState = {
  data: null,
  selectedUser: null,
  isLoading: true,
  error: null,
  filters: {
    search: "",
    accountStatus: AccountStatus.ALL,
    role: UserRole.ALL,
    pageNo: 1,
  },
  operations: {
    isCreating: false,
    isUpdating: false,
    isDeleting: false,
    isResettingPassword: false,
    isFetchingDetail: false,
  },
};

const customersSlice = createSlice({
  name: "customers",
  initialState,
  reducers: {
    setCustomerSearchFilter: (state, action: PayloadAction<string>) => {
      state.filters.search = action.payload;
      state.filters.pageNo = 1;
    },

    setCustomerAccountStatusFilter: (state, action: PayloadAction<AccountStatus>) => {
      state.filters.accountStatus = action.payload;
      state.filters.pageNo = 1;
    },

    setCustomerPageNo: (state, action: PayloadAction<number>) => {
      state.filters.pageNo = action.payload;
    },

    clearCustomerError: (state) => {
      state.error = null;
    },

    clearSelectedCustomer: (state) => {
      state.selectedUser = null;
    },

    resetCustomerState: () => {
      return initialState;
    },

    toggleCustomerStatusOptimistic: (state, action: PayloadAction<{ userId: string; newStatus: string }>) => {
      if (state.data?.content) {
        const user = state.data.content.find((u) => u.id === action.payload.userId);
        if (user) user.accountStatus = action.payload.newStatus as any;
      }
    },

    revertCustomerStatusOptimistic: (state, action: PayloadAction<{ userId: string; oldStatus: string }>) => {
      if (state.data?.content) {
        const user = state.data.content.find((u) => u.id === action.payload.userId);
        if (user) user.accountStatus = action.payload.oldStatus as any;
      }
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(fetchAllCustomersService.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAllCustomersService.fulfilled, (state, action) => {
        state.isLoading = false;
        state.data = action.payload;
      })
      .addCase(fetchAllCustomersService.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    builder
      .addCase(fetchCustomerByIdService.pending, (state) => {
        state.operations.isFetchingDetail = true;
        state.error = null;
        state.selectedUser = null;
      })
      .addCase(fetchCustomerByIdService.fulfilled, (state, action) => {
        state.operations.isFetchingDetail = false;
        state.selectedUser = action.payload;
        if (state.data?.content) {
          const index = state.data.content.findIndex((u) => u.id === action.payload.id);
          if (index !== -1) state.data.content[index] = action.payload;
        }
      })
      .addCase(fetchCustomerByIdService.rejected, (state, action) => {
        state.operations.isFetchingDetail = false;
        state.error = action.payload as string;
      });

    builder
      .addCase(updateCustomerService.pending, (state) => {
        state.operations.isUpdating = true;
        state.error = null;
      })
      .addCase(updateCustomerService.fulfilled, (state, action) => {
        state.operations.isUpdating = false;
        state.selectedUser = action.payload;
        if (state.data) {
          state.data.content = state.data.content.map((u) =>
            u.id === action.payload.id ? action.payload : u
          );
        }
      })
      .addCase(updateCustomerService.rejected, (state, action) => {
        state.operations.isUpdating = false;
        state.error = action.payload as string;
      });

    builder
      .addCase(deleteCustomerService.pending, (state) => {
        state.operations.isDeleting = true;
        state.error = null;
      })
      .addCase(deleteCustomerService.fulfilled, (state, action) => {
        state.operations.isDeleting = false;
        if (state.data) {
          const deletedId = typeof action.payload === "string" ? action.payload : action.payload?.id;
          state.data.content = state.data.content.filter((u) => u.id !== deletedId);
          state.data.totalElements -= 1;
          state.data.totalPages = Math.ceil(state.data.totalElements / state.data.pageSize);
          state.data.last = state.data.pageNo >= state.data.totalPages;
          state.data.hasNext = !state.data.last;
          state.data.hasPrevious = state.data.pageNo > 1;
        }
      })
      .addCase(deleteCustomerService.rejected, (state, action) => {
        state.operations.isDeleting = false;
        state.error = action.payload as string;
      });

    builder
      .addCase(toggleCustomerStatusService.pending, (state) => {
        state.error = null;
      })
      .addCase(toggleCustomerStatusService.fulfilled, (state, action) => {
        if (state.data) {
          state.data.content = state.data.content.map((u) =>
            u.id === action.payload.id ? action.payload : u
          );
        }
      })
      .addCase(toggleCustomerStatusService.rejected, (state, action) => {
        state.error = action.payload as string;
      });

    builder
      .addCase(adminChangeCustomerPasswordService.pending, (state) => {
        state.operations.isResettingPassword = true;
        state.error = null;
      })
      .addCase(adminChangeCustomerPasswordService.fulfilled, (state) => {
        state.operations.isResettingPassword = false;
      })
      .addCase(adminChangeCustomerPasswordService.rejected, (state, action) => {
        state.operations.isResettingPassword = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  setCustomerSearchFilter,
  setCustomerAccountStatusFilter,
  setCustomerPageNo,
  clearCustomerError,
  clearSelectedCustomer,
  resetCustomerState,
  toggleCustomerStatusOptimistic,
  revertCustomerStatusOptimistic,
} = customersSlice.actions;

export default customersSlice.reducer;
