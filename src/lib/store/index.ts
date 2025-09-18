/**
 * Redux Store Configuration
 * Combines all slices and middleware for the application
 */

import { configureStore } from "@reduxjs/toolkit";
import { logger } from "../logging/logger";

// Import all slices
import analyticsSlice from "./slices/analyticsSlice";
import authSlice from "./slices/authSlice";
import courseSlice from "./slices/courseSlice";
import paymentSlice from "./slices/paymentSlice";
import postSlice from "./slices/postSlice";
import productSlice from "./slices/productSlice";
import resourceSlice from "./slices/resourceSlice";
import searchSlice from "./slices/searchSlice";
import subscriptionSlice from "./slices/subscriptionSlice";
import uiSlice from "./slices/uiSlice";

// Configure the store
export const store = configureStore({
  reducer: {
    analytics: analyticsSlice,
    auth: authSlice,
    courses: courseSlice,
    payment: paymentSlice,
    posts: postSlice,
    products: productSlice,
    resources: resourceSlice,
    search: searchSlice,
    subscription: subscriptionSlice,
    ui: uiSlice,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types for serialization checks
        ignoredActions: ["persist/PERSIST"],
      },
    }),
  devTools: process.env.NODE_ENV !== "production",
});

// Initialize logging
logger.info(
  "Redux store configured",
  {
    component: "store",
    operation: "initialization",
  },
  {
    reducers: Object.keys(store.getState()),
  }
);

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
