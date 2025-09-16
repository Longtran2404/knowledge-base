import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Course } from "../../../types/course";

interface CourseState {
  courses: Course[];
  featuredCourses: Course[];
  popularCourses: Course[];
  categories: string[];
  currentCourse: Course | null;
  isLoading: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  filters: {
    level?: string;
    domain?: string;
    year?: number;
    tags?: string[];
    minPrice?: number;
    maxPrice?: number;
    rating?: number;
  };
  sort: {
    field: string;
    order: "asc" | "desc";
  };
}

const initialState: CourseState = {
  courses: [],
  featuredCourses: [],
  popularCourses: [],
  categories: [],
  currentCourse: null,
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

const courseSlice = createSlice({
  name: "course",
  initialState,
  reducers: {
    // Course list actions
    setCourses: (state, action: PayloadAction<Course[]>) => {
      state.courses = action.payload;
    },
    addCourse: (state, action: PayloadAction<Course>) => {
      state.courses.unshift(action.payload);
    },
    updateCourse: (state, action: PayloadAction<Course>) => {
      const index = state.courses.findIndex(
        (course) => course.id === action.payload.id
      );
      if (index !== -1) {
        state.courses[index] = action.payload;
      }
    },
    removeCourse: (state, action: PayloadAction<string>) => {
      state.courses = state.courses.filter(
        (course) => course.id !== action.payload
      );
    },

    // Featured courses actions
    setFeaturedCourses: (state, action: PayloadAction<Course[]>) => {
      state.featuredCourses = action.payload;
    },

    // Popular courses actions
    setPopularCourses: (state, action: PayloadAction<Course[]>) => {
      state.popularCourses = action.payload;
    },

    // Categories actions
    setCategories: (state, action: PayloadAction<string[]>) => {
      state.categories = action.payload;
    },

    // Current course actions
    setCurrentCourse: (state, action: PayloadAction<Course | null>) => {
      state.currentCourse = action.payload;
    },

    // Loading actions
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },

    // Error actions
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },

    // Pagination actions
    setPagination: (
      state,
      action: PayloadAction<Partial<CourseState["pagination"]>>
    ) => {
      state.pagination = { ...state.pagination, ...action.payload };
    },
    setPage: (state, action: PayloadAction<number>) => {
      state.pagination.page = action.payload;
    },
    setLimit: (state, action: PayloadAction<number>) => {
      state.pagination.limit = action.payload;
    },

    // Filter actions
    setFilters: (
      state,
      action: PayloadAction<Partial<CourseState["filters"]>>
    ) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    setFilter: (
      state,
      action: PayloadAction<{ key: keyof CourseState["filters"]; value: any }>
    ) => {
      (state.filters as any)[action.payload.key] = action.payload.value;
    },
    clearFilters: (state) => {
      state.filters = {};
    },

    // Sort actions
    setSort: (state, action: PayloadAction<CourseState["sort"]>) => {
      state.sort = action.payload;
    },
    toggleSort: (state, action: PayloadAction<string>) => {
      if (state.sort.field === action.payload) {
        state.sort.order = state.sort.order === "asc" ? "desc" : "asc";
      } else {
        state.sort.field = action.payload;
        state.sort.order = "asc";
      }
    },

    // Reset actions
    resetCourseState: (state) => {
      return initialState;
    },
  },
});

export const {
  setCourses,
  addCourse,
  updateCourse,
  removeCourse,
  setFeaturedCourses,
  setPopularCourses,
  setCategories,
  setCurrentCourse,
  setLoading,
  setError,
  clearError,
  setPagination,
  setPage,
  setLimit,
  setFilters,
  setFilter,
  clearFilters,
  setSort,
  toggleSort,
  resetCourseState,
} = courseSlice.actions;

export default courseSlice.reducer;
