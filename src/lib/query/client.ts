import { QueryClient, DefaultOptions } from "@tanstack/react-query";
import { logger } from "../logging/logger";

/**
 * React Query configuration with comprehensive error handling and logging
 */

// Default options for all queries
const defaultOptions: DefaultOptions = {
  queries: {
    // Cache time: 5 minutes
    staleTime: 5 * 60 * 1000,
    // Background refetch: 10 minutes
    gcTime: 10 * 60 * 1000,
    // Retry configuration
    retry: (failureCount, error: any) => {
      // Don't retry on 4xx errors (client errors)
      if (error?.response?.status >= 400 && error?.response?.status < 500) {
        return false;
      }
      // Retry up to 3 times for other errors
      return failureCount < 3;
    },
    // Retry delay with exponential backoff
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    // Refetch on window focus
    refetchOnWindowFocus: true,
    // Refetch on reconnect
    refetchOnReconnect: true,
    // Refetch on mount
    refetchOnMount: true,
  },
  mutations: {
    // Retry mutations once
    retry: 1,
    // Retry delay for mutations
    retryDelay: 1000,
  },
};

// Create QueryClient instance
export const queryClient = new QueryClient({
  defaultOptions,
});

// Query key factory for consistent key generation
export const queryKeys = {
  // User related queries
  users: {
    all: ["users"] as const,
    lists: () => [...queryKeys.users.all, "list"] as const,
    list: (filters: Record<string, any>) =>
      [...queryKeys.users.lists(), { filters }] as const,
    details: () => [...queryKeys.users.all, "detail"] as const,
    detail: (id: string) => [...queryKeys.users.details(), id] as const,
    profile: () => [...queryKeys.users.all, "profile"] as const,
  },

  // Course related queries
  courses: {
    all: ["courses"] as const,
    lists: () => [...queryKeys.courses.all, "list"] as const,
    list: (filters: Record<string, any>) =>
      [...queryKeys.courses.lists(), { filters }] as const,
    details: () => [...queryKeys.courses.all, "detail"] as const,
    detail: (id: string) => [...queryKeys.courses.details(), id] as const,
    categories: () => [...queryKeys.courses.all, "categories"] as const,
    featured: () => [...queryKeys.courses.all, "featured"] as const,
    popular: () => [...queryKeys.courses.all, "popular"] as const,
  },

  // Product related queries
  products: {
    all: ["products"] as const,
    lists: () => [...queryKeys.products.all, "list"] as const,
    list: (filters: Record<string, any>) =>
      [...queryKeys.products.lists(), { filters }] as const,
    details: () => [...queryKeys.products.all, "detail"] as const,
    detail: (id: string) => [...queryKeys.products.details(), id] as const,
    categories: () => [...queryKeys.products.all, "categories"] as const,
    featured: () => [...queryKeys.products.all, "featured"] as const,
  },

  // Resource related queries
  resources: {
    all: ["resources"] as const,
    lists: () => [...queryKeys.resources.all, "list"] as const,
    list: (filters: Record<string, any>) =>
      [...queryKeys.resources.lists(), { filters }] as const,
    details: () => [...queryKeys.resources.all, "detail"] as const,
    detail: (id: string) => [...queryKeys.resources.details(), id] as const,
    categories: () => [...queryKeys.resources.all, "categories"] as const,
    public: () => [...queryKeys.resources.all, "public"] as const,
  },

  // Post/Blog related queries
  posts: {
    all: ["posts"] as const,
    lists: () => [...queryKeys.posts.all, "list"] as const,
    list: (filters: Record<string, any>) =>
      [...queryKeys.posts.lists(), { filters }] as const,
    details: () => [...queryKeys.posts.all, "detail"] as const,
    detail: (id: string) => [...queryKeys.posts.details(), id] as const,
    categories: () => [...queryKeys.posts.all, "categories"] as const,
    featured: () => [...queryKeys.posts.all, "featured"] as const,
    recent: () => [...queryKeys.posts.all, "recent"] as const,
  },

  // Subscription related queries
  subscriptions: {
    all: ["subscriptions"] as const,
    status: () => [...queryKeys.subscriptions.all, "status"] as const,
    plans: () => [...queryKeys.subscriptions.all, "plans"] as const,
    history: () => [...queryKeys.subscriptions.all, "history"] as const,
  },

  // Payment related queries
  payments: {
    all: ["payments"] as const,
    history: () => [...queryKeys.payments.all, "history"] as const,
    methods: () => [...queryKeys.payments.all, "methods"] as const,
  },

  // Search related queries
  search: {
    all: ["search"] as const,
    global: (query: string) =>
      [...queryKeys.search.all, "global", query] as const,
    suggestions: (query: string) =>
      [...queryKeys.search.all, "suggestions", query] as const,
  },

  // Analytics related queries
  analytics: {
    all: ["analytics"] as const,
    dashboard: () => [...queryKeys.analytics.all, "dashboard"] as const,
    performance: () => [...queryKeys.analytics.all, "performance"] as const,
    usage: () => [...queryKeys.analytics.all, "usage"] as const,
  },

  // File upload related queries
  uploads: {
    all: ["uploads"] as const,
    progress: (id: string) =>
      [...queryKeys.uploads.all, "progress", id] as const,
    status: (id: string) => [...queryKeys.uploads.all, "status", id] as const,
  },
} as const;

// Utility functions for query management
export const queryUtils = {
  // Invalidate all queries
  invalidateAll: () => {
    queryClient.invalidateQueries();
  },

  // Invalidate queries by key
  invalidateByKey: (queryKey: readonly unknown[]) => {
    queryClient.invalidateQueries({ queryKey });
  },

  // Remove queries by key
  removeByKey: (queryKey: readonly unknown[]) => {
    queryClient.removeQueries({ queryKey });
  },

  // Prefetch query
  prefetch: async <T>(
    queryKey: readonly unknown[],
    queryFn: () => Promise<T>,
    options?: { staleTime?: number }
  ) => {
    await queryClient.prefetchQuery({
      queryKey,
      queryFn,
      staleTime: options?.staleTime,
    });
  },

  // Set query data
  setData: <T>(queryKey: readonly unknown[], data: T) => {
    queryClient.setQueryData(queryKey, data);
  },

  // Get query data
  getData: <T>(queryKey: readonly unknown[]): T | undefined => {
    return queryClient.getQueryData<T>(queryKey);
  },

  // Clear all cache
  clearCache: () => {
    queryClient.clear();
  },

  // Get cache size
  getCacheSize: () => {
    return queryClient.getQueryCache().getAll().length;
  },

  // Get cache statistics
  getCacheStats: () => {
    const queries = queryClient.getQueryCache().getAll();
    const mutations = queryClient.getMutationCache().getAll();

    return {
      totalQueries: queries.length,
      totalMutations: mutations.length,
      staleQueries: queries.filter((q) => q.isStale()).length,
      fetchingQueries: queries.filter((q) => q.state.status === "pending")
        .length,
      errorQueries: queries.filter((q) => q.state.status === "error").length,
    };
  },
};

// Query configuration presets
export const queryConfigs = {
  // Short-lived data (1 minute)
  short: {
    staleTime: 1 * 60 * 1000,
    gcTime: 2 * 60 * 1000,
  },

  // Medium-lived data (5 minutes)
  medium: {
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  },

  // Long-lived data (30 minutes)
  long: {
    staleTime: 30 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
  },

  // Static data (1 hour)
  static: {
    staleTime: 60 * 60 * 1000,
    gcTime: 2 * 60 * 60 * 1000,
  },

  // Real-time data (no caching)
  realtime: {
    staleTime: 0,
    gcTime: 0,
    refetchInterval: 1000,
  },
} as const;

// Export query client and utilities
export default queryClient;
