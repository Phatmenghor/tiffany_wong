import { configureStore } from "@reduxjs/toolkit";
import {
  loggingMiddleware,
  authLoggingMiddleware,
  userLoggingMiddleware,
  errorLoggingMiddleware,
  autoFetchProfileMiddleware,
} from "./middleware";
import { reducers } from "./reducers";

/**
 * Redux Store Configuration
 * Centralized store setup with all reducers and middleware
 */
const store = configureStore({
  reducer: reducers,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types if needed
        ignoredActions: ["users/fetchAll/pending"],
        // Ignore these field paths in all actions
        ignoredActionPaths: ["meta.arg", "payload.timestamp"],
        // Ignore these paths in the state
        ignoredPaths: ["users.data"],
      },
    }).concat([
      autoFetchProfileMiddleware, // Auto-fetch profile when user is set
      authLoggingMiddleware,
      userLoggingMiddleware,
      errorLoggingMiddleware,
    ]),
  devTools: process.env.NODE_ENV !== "production",
});

// Export store as default (for your ClientProviders)
export default store;

// Also export as named export if needed elsewhere
export { store };
