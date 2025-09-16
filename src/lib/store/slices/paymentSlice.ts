import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface PaymentState {
  history: any[];
  methods: any[];
  currentPayment: any | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: PaymentState = {
  history: [],
  methods: [],
  currentPayment: null,
  isLoading: false,
  error: null,
};

const paymentSlice = createSlice({
  name: "payment",
  initialState,
  reducers: {
    setHistory: (state, action: PayloadAction<any[]>) => {
      state.history = action.payload;
    },
    addPayment: (state, action: PayloadAction<any>) => {
      state.history.unshift(action.payload);
    },
    setMethods: (state, action: PayloadAction<any[]>) => {
      state.methods = action.payload;
    },
    setCurrentPayment: (state, action: PayloadAction<any | null>) => {
      state.currentPayment = action.payload;
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
    resetPaymentState: (state) => {
      return initialState;
    },
  },
});

export const {
  setHistory,
  addPayment,
  setMethods,
  setCurrentPayment,
  setLoading,
  setError,
  clearError,
  resetPaymentState,
} = paymentSlice.actions;

export default paymentSlice.reducer;
