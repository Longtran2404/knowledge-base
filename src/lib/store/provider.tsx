import React from "react";
import { Provider } from "react-redux";
import { store } from "./index";
import { logger } from "../logging/logger";

interface ReduxProviderProps {
  children: React.ReactNode;
}

/**
 * Redux Provider with enhanced logging and monitoring
 */
export function ReduxProvider({ children }: ReduxProviderProps) {
  React.useEffect(() => {
    // Log store initialization
    logger.info(
      "Redux store initialized",
      {
        component: "ReduxProvider",
        operation: "initialization",
      },
      {
        state: store.getState(),
      }
    );

    // Subscribe to state changes for monitoring
    const unsubscribe = store.subscribe(() => {
      const state = store.getState();

      // Log state changes in development
      if (process.env.NODE_ENV === "development") {
        logger.debug(
          "Redux state changed",
          {
            component: "ReduxProvider",
            operation: "stateChange",
          },
          {
            stateKeys: Object.keys(state),
            timestamp: Date.now(),
          }
        );
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  return <Provider store={store}>{children}</Provider>;
}

export default ReduxProvider;
