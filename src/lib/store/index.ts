import { configureStore } from "@reduxjs/toolkit";
import { logger } from "../logging/logger";
import authSlice from "./slices/authSlice";
import uiSlice from "./slices/uiSlice";
import courseSlice from "./slices/courseSlice";
import productSlice from "./slices/productSlice";
import resourceSlice from "./slices/resourceSlice";
import postSlice from "./slices/postSlice";
import subscriptionSlice from "./slices/subscriptionSlice";
import paymentSlice from "./slices/paymentSlice";
import searchSlice from "./slices/searchSlice";
import analyticsSlice from "./slices/analyticsSlice";

/**
 * Redux Store Configuration with RTK Query integration
 */

// Root state type
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Configure store
export const store = configureStore({
  reducer: {
    // Feature slices
    auth: authSlice,
    ui: uiSlice,
    course: courseSlice,
    product: productSlice,
    resource: resourceSlice,
    post: postSlice,
    subscription: subscriptionSlice,
    payment: paymentSlice,
    search: searchSlice,
    analytics: analyticsSlice,
  } as any,

  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [
          "persist/PERSIST",
          "persist/REHYDRATE",
          "persist/PAUSE",
          "persist/PURGE",
          "persist/REGISTER",
        ],
        ignoredActionsPaths: ["meta.arg", "payload.timestamp"],
        ignoredPaths: ["_persist"],
      },
      immutableCheck: {
        ignoredPaths: ["_persist"],
      },
    }).concat(
      // Custom middleware for logging
      (store) => (next) => (action) => {
        const result = next(action);

        // Log actions in development
        if (process.env.NODE_ENV === "development") {
          logger.debug(
            "Redux Action",
            {
              component: "ReduxStore",
              operation: "actionDispatch",
            },
            {
              type: (action as any).type,
              payload: (action as any).payload,
              timestamp: Date.now(),
            }
          );
        }

        return result;
      }
    ),

  devTools: process.env.NODE_ENV !== "production",

  // Preloaded state
  preloadedState: {
    // Load from localStorage if available
    ...(typeof window !== "undefined" && localStorage.getItem("redux-persist")
      ? JSON.parse(localStorage.getItem("redux-persist") || "{}")
      : {}),
  },
});

// Setup RTK Query listeners
// setupListeners(store.dispatch); // Removed as we're not using RTK Query

// Persist state to localStorage
if (typeof window !== "undefined") {
  store.subscribe(() => {
    const state = store.getState();
    localStorage.setItem("redux-persist", JSON.stringify(state));
  });
}

// Export store
export default store;

// Export hooks
export { useAppDispatch, useAppSelector } from "./hooks";
