import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Resource } from "../../../types/resource";

interface ResourceState {
  resources: Resource[];
  publicResources: Resource[];
  categories: string[];
  currentResource: Resource | null;
  isLoading: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  filters: {
    type?: string;
    category?: string;
    tags?: string[];
    isPublic?: boolean;
  };
  sort: {
    field: string;
    order: "asc" | "desc";
  };
}

const initialState: ResourceState = {
  resources: [],
  publicResources: [],
  categories: [],
  currentResource: null,
  isLoading: false,
  error: null,
  pagination: {
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  },
  filters: {},
  sort: {
    field: "createdAt",
    order: "desc",
  },
};

const resourceSlice = createSlice({
  name: "resource",
  initialState,
  reducers: {
    setResources: (state, action: PayloadAction<Resource[]>) => {
      state.resources = action.payload;
    },
    addResource: (state, action: PayloadAction<Resource>) => {
      state.resources.unshift(action.payload);
    },
    updateResource: (state, action: PayloadAction<Resource>) => {
      const index = state.resources.findIndex(
        (resource) => resource.id === action.payload.id
      );
      if (index !== -1) {
        state.resources[index] = action.payload;
      }
    },
    removeResource: (state, action: PayloadAction<string>) => {
      state.resources = state.resources.filter(
        (resource) => resource.id !== action.payload
      );
    },
    setPublicResources: (state, action: PayloadAction<Resource[]>) => {
      state.publicResources = action.payload;
    },
    setCategories: (state, action: PayloadAction<string[]>) => {
      state.categories = action.payload;
    },
    setCurrentResource: (state, action: PayloadAction<Resource | null>) => {
      state.currentResource = action.payload;
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
    setPagination: (
      state,
      action: PayloadAction<Partial<ResourceState["pagination"]>>
    ) => {
      state.pagination = { ...state.pagination, ...action.payload };
    },
    setFilters: (
      state,
      action: PayloadAction<Partial<ResourceState["filters"]>>
    ) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    setSort: (state, action: PayloadAction<ResourceState["sort"]>) => {
      state.sort = action.payload;
    },
    resetResourceState: (state) => {
      return initialState;
    },
  },
});

export const {
  setResources,
  addResource,
  updateResource,
  removeResource,
  setPublicResources,
  setCategories,
  setCurrentResource,
  setLoading,
  setError,
  clearError,
  setPagination,
  setFilters,
  setSort,
  resetResourceState,
} = resourceSlice.actions;

export default resourceSlice.reducer;
