import store from "./configure";

/**
 * Redux type definitions
 * Inferred from store configuration
 */
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
