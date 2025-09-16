import React from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { queryClient } from "./client";
import { logger } from "../logging/logger";

interface QueryProviderProps {
  children: React.ReactNode;
}

/**
 * React Query Provider with DevTools integration
 */
export function QueryProvider({ children }: QueryProviderProps) {
  React.useEffect(() => {
    // Log query client initialization
    logger.info(
      "Query client initialized",
      {
        component: "QueryProvider",
        operation: "initialization",
      },
      {
        cacheSize: queryClient.getQueryCache().getAll().length,
      }
    );

    // Set up query client event listeners
    const unsubscribe = queryClient.getQueryCache().subscribe((event) => {
      if (event?.type === "added") {
        logger.debug(
          "Query added",
          {
            component: "QueryProvider",
            operation: "queryAdded",
          },
          {
            queryKey: event.query.queryKey,
            queryHash: event.query.queryHash,
          }
        );
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {process.env.NODE_ENV === "development" && (
        <ReactQueryDevtools
          initialIsOpen={false}
          position="bottom"
          buttonPosition="bottom-right"
        />
      )}
    </QueryClientProvider>
  );
}

export default QueryProvider;
