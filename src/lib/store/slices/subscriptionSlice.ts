import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface SubscriptionState {
  status: any | null;
  plans: any[];
  history: any[];
  isLoading: boolean;
  error: string | null;
}

const initialState: SubscriptionState = {
  status: null,
  plans: [],
  history: [],
  isLoading: false,
  error: null,
};

const subscriptionSlice = createSlice({
  name: "subscription",
  initialState,
  reducers: {
    setStatus: (state, action: PayloadAction<any>) => {
      state.status = action.payload;
    },
    setPlans: (state, action: PayloadAction<any[]>) => {
      state.plans = action.payload;
    },
    setHistory: (state, action: PayloadAction<any[]>) => {
      state.history = action.payload;
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
    resetSubscriptionState: (state) => {
      return initialState;
    },
  },
});

export const {
  setStatus,
  setPlans,
  setHistory,
  setLoading,
  setError,
  clearError,
  resetSubscriptionState,
} = subscriptionSlice.actions;

export default subscriptionSlice.reducer;
