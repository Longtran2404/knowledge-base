import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { User, LoginData, RegisterData } from "../../../types/user";

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  subscriptionStatus: any | null;
  lastLoginTime: number | null;
  sessionExpiry: number | null;
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  subscriptionStatus: null,
  lastLoginTime: null,
  sessionExpiry: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    // Login actions
    loginStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    loginSuccess: (
      state,
      action: PayloadAction<{ user: User; subscriptionStatus: any }>
    ) => {
      state.isLoading = false;
      state.user = action.payload.user;
      state.isAuthenticated = true;
      state.subscriptionStatus = action.payload.subscriptionStatus;
      state.lastLoginTime = Date.now();
      state.sessionExpiry = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
      state.error = null;
    },
    loginFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
      state.isAuthenticated = false;
    },

    // Register actions
    registerStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    registerSuccess: (state, action: PayloadAction<{ user: User }>) => {
      state.isLoading = false;
      state.user = action.payload.user;
      state.isAuthenticated = true;
      state.lastLoginTime = Date.now();
      state.sessionExpiry = Date.now() + 24 * 60 * 60 * 1000;
      state.error = null;
    },
    registerFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
    },

    // Logout actions
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.subscriptionStatus = null;
      state.lastLoginTime = null;
      state.sessionExpiry = null;
      state.error = null;
    },

    // Session actions
    refreshSession: (
      state,
      action: PayloadAction<{ user: User; subscriptionStatus: any }>
    ) => {
      state.user = action.payload.user;
      state.subscriptionStatus = action.payload.subscriptionStatus;
      state.sessionExpiry = Date.now() + 24 * 60 * 60 * 1000;
    },
    sessionExpired: (state) => {
      state.isAuthenticated = false;
      state.sessionExpiry = null;
    },

    // User update actions
    updateUser: (state, action: PayloadAction<Partial<User>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
      }
    },
    updateSubscriptionStatus: (state, action: PayloadAction<any>) => {
      state.subscriptionStatus = action.payload;
    },

    // Error actions
    clearError: (state) => {
      state.error = null;
    },
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
    },

    // Loading actions
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
  },
});

export const {
  loginStart,
  loginSuccess,
  loginFailure,
  registerStart,
  registerSuccess,
  registerFailure,
  logout,
  refreshSession,
  sessionExpired,
  updateUser,
  updateSubscriptionStatus,
  clearError,
  setError,
  setLoading,
} = authSlice.actions;

export default authSlice.reducer;
