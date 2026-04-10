/**
 * Auth Feature - Redux Slice
 * Manages auth state: user, profile, loading, errors
 */

import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { UserAuthResponseModel } from "../models/response/auth-resposne";
import {
  loginService,
  getProfileService,
  updateProfileService,
  changePasswordService,
  deleteAccountService,
  logoutService,
} from "../thunks/auth-thunks";

import { AuthState } from "../models/type/auth-types";
import {
  storeTokens,
  clearAllTokens,
  storeAdminTokens,
  clearAdminTokens,
} from "@/utils/local-storage/token";
import {
  storeUserInfo,
  clearUserInfo,
  storeAdminUserInfo,
  clearAdminUserInfo,
} from "@/utils/local-storage/userInfo";

const isOwner = (userType?: string) => userType === "OWNER";

/**
 * Extended auth state with social sync info
 */
interface ExtendedAuthState extends AuthState {
  isSocialLoading: boolean;
  isNewUser: boolean;
}

/**
 * Initial auth state
 */
const initialState: ExtendedAuthState = {
  isAuthenticated: false,
  authReady: false,
  user: null,
  profile: null,
  isLoading: false,
  isProfileLoading: false,
  error: null,
  isSocialLoading: false,
  isNewUser: false,
};

/**
 * Auth slice
 */
const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    /**
     * Set user directly (useful after checking local storage)
     */
    setUser: (state, action: PayloadAction<UserAuthResponseModel>) => {
      state.user = action.payload;
      state.isAuthenticated = !!action.payload.accessToken;
      state.authReady = true;
    },

    /**
     * Mark auth initialization as complete (even when no token found)
     */
    setAuthReady: (state) => {
      state.authReady = true;
    },

    /**
     * Clear authentication state
     */
    logout: (state) => {
      state.isAuthenticated = false;
      state.user = null;
      state.profile = null;
      state.error = null;
      state.isNewUser = false;
      clearAllTokens();
      clearUserInfo();
      clearAdminTokens();
      clearAdminUserInfo();
    },

    /**
     * Clear any errors
     */
    clearError: (state) => {
      state.error = null;
    },

    /**
     * Clear new user flag
     */
    clearNewUserFlag: (state) => {
      state.isNewUser = false;
    },

    /**
     * Reset auth state
     */
    resetAuthState: () => initialState,
  },

  extraReducers: (builder) => {
    // Login thunk handlers
    builder
      .addCase(loginService.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginService.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
        state.isAuthenticated = !!action.payload.accessToken;
        state.authReady = true;

        // NOTE: Token storage now happens in the loginService thunk (side effects in thunks, not reducers!)
        // Reducer is pure function - no side effects here
      })
      .addCase(loginService.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        state.isAuthenticated = false;
      });

    // Get profile thunk handlers
    builder
      .addCase(getProfileService.pending, (state) => {
        state.isProfileLoading = true;
        state.error = null;
      })
      .addCase(getProfileService.fulfilled, (state, action) => {
        state.isProfileLoading = false;
        state.profile = action.payload;
      })
      .addCase(getProfileService.rejected, (state, action) => {
        state.isProfileLoading = false;
        state.error = action.payload as string;
      });

    // Update profile thunk handlers
    builder
      .addCase(updateProfileService.pending, (state) => {
        state.isProfileLoading = true;
        state.error = null;
      })
      .addCase(updateProfileService.fulfilled, (state, action) => {
        state.isProfileLoading = false;
        state.profile = action.payload;
        // Update user info in state if needed
        if (state.user) {
          state.user.fullName = action.payload.fullName || state.user.fullName;
          state.user.profileImageUrl =
            action.payload.profileImageUrl || state.user.profileImageUrl;
        }
      })
      .addCase(updateProfileService.rejected, (state, action) => {
        state.isProfileLoading = false;
        state.error = action.payload as string;
      });

    // Change password thunk handlers
    builder
      .addCase(changePasswordService.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(changePasswordService.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(changePasswordService.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Delete account thunk handlers
    builder
      .addCase(deleteAccountService.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteAccountService.fulfilled, (state) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.profile = null;
      })
      .addCase(deleteAccountService.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Logout service thunk handlers
    builder
      .addCase(logoutService.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(logoutService.fulfilled, (state) => {
        state.isLoading = false;
        state.isAuthenticated = false;

        // Only clear tokens for the user type being logged out
        const isOwnerType = state.user?.userType === "OWNER";

        if (isOwnerType) {
          // Owner logout - only clear owner tokens
          clearAdminTokens();
          clearAdminUserInfo();
        } else {
          // Customer logout - only clear customer tokens
          clearAllTokens();
          clearUserInfo();
        }

        state.user = null;
        state.profile = null;
        state.isNewUser = false;
      })
      .addCase(logoutService.rejected, (state) => {
        // Even if server logout fails, clear local state
        state.isLoading = false;
        state.isAuthenticated = false;

        // Only clear tokens for the user type being logged out
        const isOwnerType = state.user?.userType === "OWNER";

        if (isOwnerType) {
          // Owner logout - only clear owner tokens
          clearAdminTokens();
          clearAdminUserInfo();
        } else {
          // Customer logout - only clear customer tokens
          clearAllTokens();
          clearUserInfo();
        }

        state.user = null;
        state.profile = null;
        state.isNewUser = false;
        clearAdminTokens();
        clearAdminUserInfo();
      });
  },
});

export const {
  setUser,
  setAuthReady,
  logout,
  clearError,
  setSocialSync,
  clearNewUserFlag,
  resetAuthState,
} = authSlice.actions;
export default authSlice.reducer;
