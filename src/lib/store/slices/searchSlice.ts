import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface SearchState {
  query: string;
  results: any[];
  suggestions: string[];
  history: string[];
  isLoading: boolean;
  error: string | null;
  filters: {
    type?: string;
    category?: string;
    tags?: string[];
  };
}

const initialState: SearchState = {
  query: "",
  results: [],
  suggestions: [],
  history: [],
  isLoading: false,
  error: null,
  filters: {},
};

const searchSlice = createSlice({
  name: "search",
  initialState,
  reducers: {
    setQuery: (state, action: PayloadAction<string>) => {
      state.query = action.payload;
    },
    setResults: (state, action: PayloadAction<any[]>) => {
      state.results = action.payload;
    },
    setSuggestions: (state, action: PayloadAction<string[]>) => {
      state.suggestions = action.payload;
    },
    addToHistory: (state, action: PayloadAction<string>) => {
      const query = action.payload.trim();
      if (query && !state.history.includes(query)) {
        state.history.unshift(query);
        if (state.history.length > 20) {
          state.history = state.history.slice(0, 20);
        }
      }
    },
    clearHistory: (state) => {
      state.history = [];
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
    setFilters: (
      state,
      action: PayloadAction<Partial<SearchState["filters"]>>
    ) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = {};
    },
    resetSearchState: (state) => {
      return initialState;
    },
  },
});

export const {
  setQuery,
  setResults,
  setSuggestions,
  addToHistory,
  clearHistory,
  setLoading,
  setError,
  clearError,
  setFilters,
  clearFilters,
  resetSearchState,
} = searchSlice.actions;

export default searchSlice.reducer;
