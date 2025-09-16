import {
  ErrorHandler,
  AppError,
  createErrorContext,
} from "../../error-handler";

describe("ErrorHandler", () => {
  let errorHandler: ErrorHandler;

  beforeEach(() => {
    errorHandler = ErrorHandler.getInstance();
    errorHandler.clearErrorLog();
  });

  describe("Error wrapping", () => {
    it("should wrap error with context", () => {
      const error = new Error("Test error");
      const context = createErrorContext("test-operation", "TestComponent");

      const wrappedError = errorHandler.wrapError(error, context);

      expect(wrappedError).toBeInstanceOf(AppError);
      expect(wrappedError.message).toBe("Test error");
      expect(wrappedError.context).toEqual(context);
      expect(wrappedError.isRetryable).toBe(false);
    });

    it("should identify retryable errors", () => {
      const error = { response: { status: 500 } };
      const context = createErrorContext("test-operation", "TestComponent");

      const wrappedError = errorHandler.wrapError(error, context, "api");

      expect(wrappedError.isRetryable).toBe(true);
    });

    it("should provide user-friendly error messages", () => {
      const error = { response: { status: 401 } };
      const context = createErrorContext("test-operation", "TestComponent");

      const wrappedError = errorHandler.wrapError(error, context);

      expect(wrappedError.message).toBe(
        "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại."
      );
    });
  });

  describe("Retry logic", () => {
    it("should retry failed operations", async () => {
      let attemptCount = 0;
      const operation = jest.fn().mockImplementation(() => {
        attemptCount++;
        if (attemptCount < 3) {
          throw new Error("Network error");
        }
        return "success";
      });

      const context = createErrorContext("test-operation", "TestComponent");

      const result = await errorHandler.executeWithRetry(
        operation,
        context,
        "api"
      );

      expect(result).toBe("success");
      expect(operation).toHaveBeenCalledTimes(3);
    });

    it("should not retry non-retryable errors", async () => {
      const operation = jest.fn().mockImplementation(() => {
        throw new Error("Client error");
      });

      const context = createErrorContext("test-operation", "TestComponent");

      await expect(
        errorHandler.executeWithRetry(operation, context, "api")
      ).rejects.toThrow();

      expect(operation).toHaveBeenCalledTimes(1);
    });

    it("should respect max retries", async () => {
      const operation = jest.fn().mockImplementation(() => {
        throw new Error("Network error");
      });

      const context = createErrorContext("test-operation", "TestComponent");

      await expect(
        errorHandler.executeWithRetry(operation, context, "api")
      ).rejects.toThrow();

      expect(operation).toHaveBeenCalledTimes(4); // Initial + 3 retries
    });
  });

  describe("Error statistics", () => {
    it("should track error statistics", () => {
      const error1 = new Error("Error 1");
      const error2 = new Error("Error 2");
      const context1 = createErrorContext("operation1", "Component1");
      const context2 = createErrorContext("operation2", "Component2");

      errorHandler.wrapError(error1, context1);
      errorHandler.wrapError(error2, context2);

      const stats = errorHandler.getErrorStats();

      expect(stats.totalErrors).toBe(2);
      expect(stats.errorsByComponent["Component1"]).toBe(1);
      expect(stats.errorsByComponent["Component2"]).toBe(1);
    });
  });
});
