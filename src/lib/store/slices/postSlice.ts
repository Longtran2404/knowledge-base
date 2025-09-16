import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Post } from "../../../types/post";

interface PostState {
  posts: Post[];
  featuredPosts: Post[];
  recentPosts: Post[];
  categories: string[];
  currentPost: Post | null;
  isLoading: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  filters: {
    category?: string;
    tags?: string[];
    isPublished?: boolean;
    authorId?: string;
  };
  sort: {
    field: string;
    order: "asc" | "desc";
  };
}

const initialState: PostState = {
  posts: [],
  featuredPosts: [],
  recentPosts: [],
  categories: [],
  currentPost: null,
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

const postSlice = createSlice({
  name: "post",
  initialState,
  reducers: {
    setPosts: (state, action: PayloadAction<Post[]>) => {
      state.posts = action.payload;
    },
    addPost: (state, action: PayloadAction<Post>) => {
      state.posts.unshift(action.payload);
    },
    updatePost: (state, action: PayloadAction<Post>) => {
      const index = state.posts.findIndex(
        (post) => post.id === action.payload.id
      );
      if (index !== -1) {
        state.posts[index] = action.payload;
      }
    },
    removePost: (state, action: PayloadAction<string>) => {
      state.posts = state.posts.filter((post) => post.id !== action.payload);
    },
    setFeaturedPosts: (state, action: PayloadAction<Post[]>) => {
      state.featuredPosts = action.payload;
    },
    setRecentPosts: (state, action: PayloadAction<Post[]>) => {
      state.recentPosts = action.payload;
    },
    setCategories: (state, action: PayloadAction<string[]>) => {
      state.categories = action.payload;
    },
    setCurrentPost: (state, action: PayloadAction<Post | null>) => {
      state.currentPost = action.payload;
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
      action: PayloadAction<Partial<PostState["pagination"]>>
    ) => {
      state.pagination = { ...state.pagination, ...action.payload };
    },
    setFilters: (
      state,
      action: PayloadAction<Partial<PostState["filters"]>>
    ) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    setSort: (state, action: PayloadAction<PostState["sort"]>) => {
      state.sort = action.payload;
    },
    resetPostState: (state) => {
      return initialState;
    },
  },
});

export const {
  setPosts,
  addPost,
  updatePost,
  removePost,
  setFeaturedPosts,
  setRecentPosts,
  setCategories,
  setCurrentPost,
  setLoading,
  setError,
  clearError,
  setPagination,
  setFilters,
  setSort,
  resetPostState,
} = postSlice.actions;

export default postSlice.reducer;
