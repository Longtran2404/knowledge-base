import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface UIState {
  // Theme
  theme: "light" | "dark" | "system";

  // Sidebar
  sidebarOpen: boolean;
  sidebarCollapsed: boolean;

  // Modals
  modals: {
    auth: boolean;
    search: boolean;
    cart: boolean;
    notifications: boolean;
    settings: boolean;
  };

  // Notifications
  notifications: Array<{
    id: string;
    type: "success" | "error" | "warning" | "info";
    title: string;
    message: string;
    timestamp: number;
    read: boolean;
  }>;

  // Loading states
  loading: {
    global: boolean;
    auth: boolean;
    courses: boolean;
    products: boolean;
    resources: boolean;
    posts: boolean;
  };

  // Search
  searchQuery: string;
  searchResults: any[];
  searchHistory: string[];

  // Cart
  cartItems: Array<{
    id: string;
    name: string;
    price: number;
    quantity: number;
    image?: string;
    type: "course" | "product";
  }>;
  cartTotal: number;
  cartOpen: boolean;

  // Pagination
  pagination: {
    courses: { page: number; limit: number; total: number };
    products: { page: number; limit: number; total: number };
    resources: { page: number; limit: number; total: number };
    posts: { page: number; limit: number; total: number };
  };

  // Filters
  filters: {
    courses: Record<string, any>;
    products: Record<string, any>;
    resources: Record<string, any>;
    posts: Record<string, any>;
  };

  // Sort
  sort: {
    courses: { field: string; order: "asc" | "desc" };
    products: { field: string; order: "asc" | "desc" };
    resources: { field: string; order: "asc" | "desc" };
    posts: { field: string; order: "asc" | "desc" };
  };
}

const initialState: UIState = {
  theme: "system",
  sidebarOpen: false,
  sidebarCollapsed: false,
  modals: {
    auth: false,
    search: false,
    cart: false,
    notifications: false,
    settings: false,
  },
  notifications: [],
  loading: {
    global: false,
    auth: false,
    courses: false,
    products: false,
    resources: false,
    posts: false,
  },
  searchQuery: "",
  searchResults: [],
  searchHistory: [],
  cartItems: [],
  cartTotal: 0,
  cartOpen: false,
  pagination: {
    courses: { page: 1, limit: 20, total: 0 },
    products: { page: 1, limit: 20, total: 0 },
    resources: { page: 1, limit: 20, total: 0 },
    posts: { page: 1, limit: 20, total: 0 },
  },
  filters: {
    courses: {},
    products: {},
    resources: {},
    posts: {},
  },
  sort: {
    courses: { field: "createdAt", order: "desc" },
    products: { field: "createdAt", order: "desc" },
    resources: { field: "createdAt", order: "desc" },
    posts: { field: "createdAt", order: "desc" },
  },
};

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    // Theme actions
    setTheme: (state, action: PayloadAction<"light" | "dark" | "system">) => {
      state.theme = action.payload;
    },
    toggleTheme: (state) => {
      state.theme = state.theme === "light" ? "dark" : "light";
    },

    // Sidebar actions
    setSidebarOpen: (state, action: PayloadAction<boolean>) => {
      state.sidebarOpen = action.payload;
    },
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
    setSidebarCollapsed: (state, action: PayloadAction<boolean>) => {
      state.sidebarCollapsed = action.payload;
    },
    toggleSidebarCollapsed: (state) => {
      state.sidebarCollapsed = !state.sidebarCollapsed;
    },

    // Modal actions
    openModal: (state, action: PayloadAction<keyof UIState["modals"]>) => {
      state.modals[action.payload] = true;
    },
    closeModal: (state, action: PayloadAction<keyof UIState["modals"]>) => {
      state.modals[action.payload] = false;
    },
    closeAllModals: (state) => {
      Object.keys(state.modals).forEach((key) => {
        state.modals[key as keyof UIState["modals"]] = false;
      });
    },

    // Notification actions
    addNotification: (
      state,
      action: PayloadAction<
        Omit<UIState["notifications"][0], "id" | "timestamp" | "read">
      >
    ) => {
      const notification = {
        id: Date.now().toString(),
        timestamp: Date.now(),
        read: false,
        ...action.payload,
      };
      state.notifications.unshift(notification);

      // Keep only last 50 notifications
      if (state.notifications.length > 50) {
        state.notifications = state.notifications.slice(0, 50);
      }
    },
    removeNotification: (state, action: PayloadAction<string>) => {
      state.notifications = state.notifications.filter(
        (n) => n.id !== action.payload
      );
    },
    markNotificationAsRead: (state, action: PayloadAction<string>) => {
      const notification = state.notifications.find(
        (n) => n.id === action.payload
      );
      if (notification) {
        notification.read = true;
      }
    },
    markAllNotificationsAsRead: (state) => {
      state.notifications.forEach((n) => (n.read = true));
    },
    clearNotifications: (state) => {
      state.notifications = [];
    },

    // Loading actions
    setLoading: (
      state,
      action: PayloadAction<{ key: keyof UIState["loading"]; value: boolean }>
    ) => {
      state.loading[action.payload.key] = action.payload.value;
    },
    setGlobalLoading: (state, action: PayloadAction<boolean>) => {
      state.loading.global = action.payload;
    },

    // Search actions
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },
    setSearchResults: (state, action: PayloadAction<any[]>) => {
      state.searchResults = action.payload;
    },
    addToSearchHistory: (state, action: PayloadAction<string>) => {
      const query = action.payload.trim();
      if (query && !state.searchHistory.includes(query)) {
        state.searchHistory.unshift(query);
        // Keep only last 20 searches
        if (state.searchHistory.length > 20) {
          state.searchHistory = state.searchHistory.slice(0, 20);
        }
      }
    },
    clearSearchHistory: (state) => {
      state.searchHistory = [];
    },

    // Cart actions
    addToCart: (
      state,
      action: PayloadAction<Omit<UIState["cartItems"][0], "quantity">>
    ) => {
      const existingItem = state.cartItems.find(
        (item) => item.id === action.payload.id
      );
      if (existingItem) {
        existingItem.quantity += 1;
      } else {
        state.cartItems.push({ ...action.payload, quantity: 1 });
      }
      state.cartTotal = state.cartItems.reduce(
        (total, item) => total + item.price * item.quantity,
        0
      );
    },
    removeFromCart: (state, action: PayloadAction<string>) => {
      state.cartItems = state.cartItems.filter(
        (item) => item.id !== action.payload
      );
      state.cartTotal = state.cartItems.reduce(
        (total, item) => total + item.price * item.quantity,
        0
      );
    },
    updateCartItemQuantity: (
      state,
      action: PayloadAction<{ id: string; quantity: number }>
    ) => {
      const item = state.cartItems.find(
        (item) => item.id === action.payload.id
      );
      if (item) {
        if (action.payload.quantity <= 0) {
          state.cartItems = state.cartItems.filter(
            (item) => item.id !== action.payload.id
          );
        } else {
          item.quantity = action.payload.quantity;
        }
        state.cartTotal = state.cartItems.reduce(
          (total, item) => total + item.price * item.quantity,
          0
        );
      }
    },
    clearCart: (state) => {
      state.cartItems = [];
      state.cartTotal = 0;
    },
    setCartOpen: (state, action: PayloadAction<boolean>) => {
      state.cartOpen = action.payload;
    },
    toggleCart: (state) => {
      state.cartOpen = !state.cartOpen;
    },

    // Pagination actions
    setPagination: (
      state,
      action: PayloadAction<{
        type: keyof UIState["pagination"];
        pagination: UIState["pagination"][keyof UIState["pagination"]];
      }>
    ) => {
      state.pagination[action.payload.type] = action.payload.pagination;
    },
    setPage: (
      state,
      action: PayloadAction<{ type: keyof UIState["pagination"]; page: number }>
    ) => {
      state.pagination[action.payload.type].page = action.payload.page;
    },
    setLimit: (
      state,
      action: PayloadAction<{
        type: keyof UIState["pagination"];
        limit: number;
      }>
    ) => {
      state.pagination[action.payload.type].limit = action.payload.limit;
    },

    // Filter actions
    setFilter: (
      state,
      action: PayloadAction<{
        type: keyof UIState["filters"];
        key: string;
        value: any;
      }>
    ) => {
      state.filters[action.payload.type][action.payload.key] =
        action.payload.value;
    },
    clearFilters: (state, action: PayloadAction<keyof UIState["filters"]>) => {
      state.filters[action.payload] = {};
    },
    clearAllFilters: (state) => {
      state.filters = {
        courses: {},
        products: {},
        resources: {},
        posts: {},
      };
    },

    // Sort actions
    setSort: (
      state,
      action: PayloadAction<{
        type: keyof UIState["sort"];
        field: string;
        order: "asc" | "desc";
      }>
    ) => {
      state.sort[action.payload.type] = {
        field: action.payload.field,
        order: action.payload.order,
      };
    },
    toggleSort: (
      state,
      action: PayloadAction<{ type: keyof UIState["sort"]; field: string }>
    ) => {
      const currentSort = state.sort[action.payload.type];
      if (currentSort.field === action.payload.field) {
        currentSort.order = currentSort.order === "asc" ? "desc" : "asc";
      } else {
        currentSort.field = action.payload.field;
        currentSort.order = "asc";
      }
    },

    // Reset actions
    resetUI: (state) => {
      return { ...initialState, theme: state.theme };
    },
  },
});

export const {
  setTheme,
  toggleTheme,
  setSidebarOpen,
  toggleSidebar,
  setSidebarCollapsed,
  toggleSidebarCollapsed,
  openModal,
  closeModal,
  closeAllModals,
  addNotification,
  removeNotification,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  clearNotifications,
  setLoading,
  setGlobalLoading,
  setSearchQuery,
  setSearchResults,
  addToSearchHistory,
  clearSearchHistory,
  addToCart,
  removeFromCart,
  updateCartItemQuantity,
  clearCart,
  setCartOpen,
  toggleCart,
  setPagination,
  setPage,
  setLimit,
  setFilter,
  clearFilters,
  clearAllFilters,
  setSort,
  toggleSort,
  resetUI,
} = uiSlice.actions;

export default uiSlice.reducer;
