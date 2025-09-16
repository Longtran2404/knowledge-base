import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface AnalyticsState {
  dashboard: any | null;
  performance: any | null;
  usage: any | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: AnalyticsState = {
  dashboard: null,
  performance: null,
  usage: null,
  isLoading: false,
  error: null,
};

const analyticsSlice = createSlice({
  name: "analytics",
  initialState,
  reducers: {
    setDashboard: (state, action: PayloadAction<any>) => {
      state.dashboard = action.payload;
    },
    setPerformance: (state, action: PayloadAction<any>) => {
      state.performance = action.payload;
    },
    setUsage: (state, action: PayloadAction<any>) => {
      state.usage = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    resetAnalyticsState: (state) => {
      return initialState;
    },
  },
});

export const {
  setDashboard,
  setPerformance,
  setUsage,
  setLoading,
  setError,
  clearError,
  resetAnalyticsState,
} = analyticsSlice.actions;

export default analyticsSlice.reducer;
