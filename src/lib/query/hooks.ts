import {
  useQuery,
  useMutation,
  useQueryClient as useQueryClientHook,
  UseQueryOptions,
  UseMutationOptions,
  useInfiniteQuery,
  UseInfiniteQueryOptions,
} from "@tanstack/react-query";
import { enhancedApi } from "../../services/enhanced-api";
import { queryKeys, queryConfigs } from "./client";
import { logger } from "../logging/logger";
import { validator } from "../validation/validator";
import { ZodSchema } from "zod";

/**
 * Custom React Query hooks with enhanced error handling and validation
 */

// Generic query hook with validation
export function useValidatedQuery<TData, TError = Error>(
  queryKey: readonly unknown[],
  queryFn: () => Promise<TData>,
  schema?: ZodSchema<TData>,
  options?: Omit<UseQueryOptions<TData, TError>, "queryKey" | "queryFn">
) {
  return useQuery({
    queryKey,
    queryFn: async () => {
      const data = await queryFn();

      if (schema) {
        const validation = validator.validate(
          schema,
          data,
          "useValidatedQuery"
        );
        if (!validation.success) {
          logger.error(
            "Query data validation failed",
            {
              component: "useValidatedQuery",
              operation: "validation",
            },
            new Error("Validation failed"),
            {
              errors: validation.errors,
              queryKey,
            }
          );
          throw new Error("Data validation failed");
        }
        return validation.data;
      }

      return data;
    },
    ...options,
  });
}

// Generic mutation hook with validation
export function useValidatedMutation<TData, TVariables, TError = Error>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  schema?: ZodSchema<TData>,
  options?: Omit<UseMutationOptions<TData, TError, TVariables>, "mutationFn">
) {
  const queryClient = useQueryClientHook();

  return useMutation({
    mutationFn: async (variables: TVariables) => {
      const data = await mutationFn(variables);

      if (schema) {
        const validation = validator.validate(
          schema,
          data,
          "useValidatedMutation"
        );
        if (!validation.success) {
          logger.error(
            "Mutation data validation failed",
            {
              component: "useValidatedMutation",
              operation: "validation",
            },
            new Error("Validation failed"),
            {
              errors: validation.errors,
            }
          );
          throw new Error("Data validation failed");
        }
        return validation.data;
      }

      return data;
    },
    onSuccess: (data, variables, context) => {
      // Invalidate related queries
      queryClient.invalidateQueries();
      options?.onSuccess?.(data, variables, context);
    },
    ...options,
  });
}

// User related hooks
export function useUserProfile() {
  return useValidatedQuery(
    queryKeys.users.profile(),
    () => enhancedApi.get("/user/profile"),
    undefined,
    {
      ...queryConfigs.medium,
      retry: 1,
    }
  );
}

export function useUpdateUserProfile() {
  return useValidatedMutation(
    (data: any) => enhancedApi.put("/user/profile", data),
    undefined,
    {
      onSuccess: () => {
        queryKeys.users.profile();
      },
    }
  );
}

export function useChangePassword() {
  return useValidatedMutation(
    (data: {
      currentPassword: string;
      newPassword: string;
      confirmPassword: string;
    }) => enhancedApi.post("/user/change-password", data),
    undefined,
    {
      onSuccess: () => {
        logger.info("Password changed successfully", {
          component: "useChangePassword",
          operation: "passwordChange",
        });
      },
    }
  );
}

// Course related hooks
export function useCourses(filters: Record<string, any> = {}) {
  return useValidatedQuery(
    queryKeys.courses.list(filters),
    () => enhancedApi.get("/courses", { params: filters }),
    undefined,
    {
      ...queryConfigs.medium,
    }
  );
}

export function useCourse(id: string) {
  return useValidatedQuery(
    queryKeys.courses.detail(id),
    () => enhancedApi.get(`/courses/${id}`),
    undefined,
    {
      ...queryConfigs.medium,
      enabled: !!id,
    }
  );
}

export function useFeaturedCourses() {
  return useValidatedQuery(
    queryKeys.courses.featured(),
    () => enhancedApi.get("/courses/featured"),
    undefined,
    {
      ...queryConfigs.long,
    }
  );
}

export function usePopularCourses() {
  return useValidatedQuery(
    queryKeys.courses.popular(),
    () => enhancedApi.get("/courses/popular"),
    undefined,
    {
      ...queryConfigs.long,
    }
  );
}

export function useCourseCategories() {
  return useValidatedQuery(
    queryKeys.courses.categories(),
    () => enhancedApi.get("/courses/categories"),
    undefined,
    {
      ...queryConfigs.static,
    }
  );
}

export function useCreateCourse() {
  const queryClient = useQueryClientHook();

  return useValidatedMutation(
    (data: any) => enhancedApi.post("/courses", data),
    undefined,
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: queryKeys.courses.all });
      },
    }
  );
}

export function useUpdateCourse() {
  const queryClient = useQueryClientHook();

  return useValidatedMutation(
    ({ id, data }: { id: string; data: any }) =>
      enhancedApi.put(`/courses/${id}`, data),
    undefined,
    {
      onSuccess: (_, { id }) => {
        queryKeys.courses.detail(id);
        queryClient.invalidateQueries({ queryKey: queryKeys.courses.all });
      },
    }
  );
}

export function useDeleteCourse() {
  const queryClient = useQueryClientHook();

  return useValidatedMutation(
    (id: string) => enhancedApi.delete(`/courses/${id}`),
    undefined,
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: queryKeys.courses.all });
      },
    }
  );
}

// Product related hooks
export function useProducts(filters: Record<string, any> = {}) {
  return useValidatedQuery(
    queryKeys.products.list(filters),
    () => enhancedApi.get("/products", { params: filters }),
    undefined,
    {
      ...queryConfigs.medium,
    }
  );
}

export function useProduct(id: string) {
  return useValidatedQuery(
    queryKeys.products.detail(id),
    () => enhancedApi.get(`/products/${id}`),
    undefined,
    {
      ...queryConfigs.medium,
      enabled: !!id,
    }
  );
}

export function useFeaturedProducts() {
  return useValidatedQuery(
    queryKeys.products.featured(),
    () => enhancedApi.get("/products/featured"),
    undefined,
    {
      ...queryConfigs.long,
    }
  );
}

export function useProductCategories() {
  return useValidatedQuery(
    queryKeys.products.categories(),
    () => enhancedApi.get("/products/categories"),
    undefined,
    {
      ...queryConfigs.static,
    }
  );
}

// Resource related hooks
export function useResources(filters: Record<string, any> = {}) {
  return useValidatedQuery(
    queryKeys.resources.list(filters),
    () => enhancedApi.get("/resources", { params: filters }),
    undefined,
    {
      ...queryConfigs.medium,
    }
  );
}

export function useResource(id: string) {
  return useValidatedQuery(
    queryKeys.resources.detail(id),
    () => enhancedApi.get(`/resources/${id}`),
    undefined,
    {
      ...queryConfigs.medium,
      enabled: !!id,
    }
  );
}

export function usePublicResources() {
  return useValidatedQuery(
    queryKeys.resources.public(),
    () => enhancedApi.get("/resources/public"),
    undefined,
    {
      ...queryConfigs.medium,
    }
  );
}

export function useResourceCategories() {
  return useValidatedQuery(
    queryKeys.resources.categories(),
    () => enhancedApi.get("/resources/categories"),
    undefined,
    {
      ...queryConfigs.static,
    }
  );
}

export function useUploadResource() {
  const queryClient = useQueryClientHook();

  return useValidatedMutation(
    (data: FormData) => enhancedApi.post("/resources/upload", data),
    undefined,
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: queryKeys.resources.all });
      },
    }
  );
}

// Post/Blog related hooks
export function usePosts(filters: Record<string, any> = {}) {
  return useValidatedQuery(
    queryKeys.posts.list(filters),
    () => enhancedApi.get("/posts", { params: filters }),
    undefined,
    {
      ...queryConfigs.medium,
    }
  );
}

export function usePost(id: string) {
  return useValidatedQuery(
    queryKeys.posts.detail(id),
    () => enhancedApi.get(`/posts/${id}`),
    undefined,
    {
      ...queryConfigs.medium,
      enabled: !!id,
    }
  );
}

export function useFeaturedPosts() {
  return useValidatedQuery(
    queryKeys.posts.featured(),
    () => enhancedApi.get("/posts/featured"),
    undefined,
    {
      ...queryConfigs.long,
    }
  );
}

export function useRecentPosts() {
  return useValidatedQuery(
    queryKeys.posts.recent(),
    () => enhancedApi.get("/posts/recent"),
    undefined,
    {
      ...queryConfigs.medium,
    }
  );
}

export function usePostCategories() {
  return useValidatedQuery(
    queryKeys.posts.categories(),
    () => enhancedApi.get("/posts/categories"),
    undefined,
    {
      ...queryConfigs.static,
    }
  );
}

// Subscription related hooks
export function useSubscriptionStatus() {
  return useValidatedQuery(
    queryKeys.subscriptions.status(),
    () => enhancedApi.get("/subscription/status"),
    undefined,
    {
      ...queryConfigs.short,
    }
  );
}

export function useSubscriptionPlans() {
  return useValidatedQuery(
    queryKeys.subscriptions.plans(),
    () => enhancedApi.get("/subscription/plans"),
    undefined,
    {
      ...queryConfigs.static,
    }
  );
}

export function useSubscriptionHistory() {
  return useValidatedQuery(
    queryKeys.subscriptions.history(),
    () => enhancedApi.get("/subscription/history"),
    undefined,
    {
      ...queryConfigs.medium,
    }
  );
}

export function useCreateSubscription() {
  return useValidatedMutation(
    (data: { plan: string; paymentMethodId: string }) =>
      enhancedApi.post("/subscription/create", data),
    undefined,
    {
      onSuccess: () => {
        queryKeys.subscriptions.status();
        queryKeys.subscriptions.history();
      },
    }
  );
}

export function useCancelSubscription() {
  return useValidatedMutation(
    () => enhancedApi.post("/subscription/cancel"),
    undefined,
    {
      onSuccess: () => {
        queryKeys.subscriptions.status();
        queryKeys.subscriptions.history();
      },
    }
  );
}

// Payment related hooks
export function usePaymentHistory() {
  return useValidatedQuery(
    queryKeys.payments.history(),
    () => enhancedApi.get("/payment/history"),
    undefined,
    {
      ...queryConfigs.medium,
    }
  );
}

export function usePaymentMethods() {
  return useValidatedQuery(
    queryKeys.payments.methods(),
    () => enhancedApi.get("/payment/methods"),
    undefined,
    {
      ...queryConfigs.medium,
    }
  );
}

export function useCreatePaymentIntent() {
  return useValidatedMutation(
    (data: { amount: number; currency: string }) =>
      enhancedApi.post("/payment/create-intent", data),
    undefined,
    {
      onSuccess: () => {
        queryKeys.payments.history();
      },
    }
  );
}

// Search related hooks
export function useGlobalSearch(query: string) {
  return useValidatedQuery(
    queryKeys.search.global(query),
    () => enhancedApi.get("/search", { params: { q: query } }),
    undefined,
    {
      ...queryConfigs.short,
      enabled: query.length > 2,
    }
  );
}

export function useSearchSuggestions(query: string) {
  return useValidatedQuery(
    queryKeys.search.suggestions(query),
    () => enhancedApi.get("/search/suggestions", { params: { q: query } }),
    undefined,
    {
      ...queryConfigs.short,
      enabled: query.length > 1,
    }
  );
}

// Infinite query hooks
export function useInfiniteCourses(filters: Record<string, any> = {}) {
  return useInfiniteQuery({
    queryKey: [...queryKeys.courses.lists(), { filters }],
    queryFn: ({ pageParam = 1 }) =>
      enhancedApi.get("/courses", {
        params: { ...filters, page: pageParam, limit: 20 },
      }),
    initialPageParam: 1,
    getNextPageParam: (lastPage: any) => {
      return lastPage.pagination?.hasNext
        ? lastPage.pagination.page + 1
        : undefined;
    },
    ...queryConfigs.medium,
  });
}

export function useInfinitePosts(filters: Record<string, any> = {}) {
  return useInfiniteQuery({
    queryKey: [...queryKeys.posts.lists(), { filters }],
    queryFn: ({ pageParam = 1 }) =>
      enhancedApi.get("/posts", {
        params: { ...filters, page: pageParam, limit: 20 },
      }),
    initialPageParam: 1,
    getNextPageParam: (lastPage: any) => {
      return lastPage.pagination?.hasNext
        ? lastPage.pagination.page + 1
        : undefined;
    },
    ...queryConfigs.medium,
  });
}

// Analytics hooks
export function useAnalyticsDashboard() {
  return useValidatedQuery(
    queryKeys.analytics.dashboard(),
    () => enhancedApi.get("/analytics/dashboard"),
    undefined,
    {
      ...queryConfigs.short,
    }
  );
}

export function usePerformanceMetrics() {
  return useValidatedQuery(
    queryKeys.analytics.performance(),
    () => enhancedApi.get("/analytics/performance"),
    undefined,
    {
      ...queryConfigs.short,
    }
  );
}

export function useUsageStats() {
  return useValidatedQuery(
    queryKeys.analytics.usage(),
    () => enhancedApi.get("/analytics/usage"),
    undefined,
    {
      ...queryConfigs.short,
    }
  );
}

// File upload hooks
export function useFileUpload() {
  const queryClient = useQueryClientHook();

  return useValidatedMutation(
    (data: {
      file: File;
      category: string;
      description?: string;
      isPublic?: boolean;
    }) => {
      const formData = new FormData();
      formData.append("file", data.file);
      formData.append("category", data.category);
      if (data.description) formData.append("description", data.description);
      formData.append("isPublic", String(data.isPublic || false));

      return enhancedApi.post("/upload", formData);
    },
    undefined,
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: queryKeys.resources.all });
      },
    }
  );
}

// Utility hooks
export function useQueryClient() {
  return useQueryClientHook();
}

export function useInvalidateQueries() {
  const queryClient = useQueryClientHook();

  return {
    invalidateAll: () => queryClient.invalidateQueries(),
    invalidateByKey: (queryKey: readonly unknown[]) =>
      queryClient.invalidateQueries({ queryKey }),
    removeByKey: (queryKey: readonly unknown[]) =>
      queryClient.removeQueries({ queryKey }),
  };
}

export function usePrefetchQuery() {
  const queryClient = useQueryClientHook();

  return (queryKey: readonly unknown[], queryFn: () => Promise<any>) => {
    return queryClient.prefetchQuery({ queryKey, queryFn });
  };
}
