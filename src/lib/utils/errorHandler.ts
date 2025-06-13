export enum ErrorType {
  API_ERROR = "API_ERROR",
  RATE_LIMIT = "RATE_LIMIT",
  NETWORK_ERROR = "NETWORK_ERROR",
  VALIDATION_ERROR = "VALIDATION_ERROR",
  UNKNOWN_ERROR = "UNKNOWN_ERROR",
}

export interface ApiError extends Error {
  type: ErrorType;
  statusCode?: number;
  retryable: boolean;
  timestamp: number;
}

export class ErrorHandler {
  private static instance: ErrorHandler;
  private readonly MAX_RETRIES = 3;
  private readonly RETRY_DELAY = 1000; // 1 second

  private constructor() {}

  static getInstance(): ErrorHandler {
    if (!ErrorHandler.instance) {
      ErrorHandler.instance = new ErrorHandler();
    }
    return ErrorHandler.instance;
  }

  createApiError(
    message: string,
    type: ErrorType,
    statusCode?: number,
    retryable: boolean = true
  ): ApiError {
    const error = new Error(message) as ApiError;
    error.type = type;
    error.statusCode = statusCode;
    error.retryable = retryable;
    error.timestamp = Date.now();
    return error;
  }

  async handleApiError(error: any): Promise<ApiError> {
    if (error instanceof Response) {
      const statusCode = error.status;

      if (statusCode === 429) {
        return this.createApiError(
          "Rate limit exceeded",
          ErrorType.RATE_LIMIT,
          statusCode
        );
      }

      if (statusCode >= 500) {
        return this.createApiError(
          "Server error",
          ErrorType.API_ERROR,
          statusCode
        );
      }

      if (statusCode >= 400) {
        return this.createApiError(
          "Client error",
          ErrorType.VALIDATION_ERROR,
          statusCode,
          false
        );
      }
    }

    if (error instanceof TypeError && error.message.includes("fetch")) {
      return this.createApiError(
        "Network error",
        ErrorType.NETWORK_ERROR,
        undefined
      );
    }

    return this.createApiError(
      "Unknown error occurred",
      ErrorType.UNKNOWN_ERROR,
      undefined,
      false
    );
  }

  async withRetry<T>(
    operation: () => Promise<T>,
    retries: number = this.MAX_RETRIES
  ): Promise<T> {
    try {
      return await operation();
    } catch (error) {
      const apiError = await this.handleApiError(error);

      if (!apiError.retryable || retries <= 0) {
        throw apiError;
      }

      // Wait before retrying
      await new Promise((resolve) => setTimeout(resolve, this.RETRY_DELAY));

      // Retry the operation
      return this.withRetry(operation, retries - 1);
    }
  }

  logError(error: ApiError): void {
    console.error({
      message: error.message,
      type: error.type,
      statusCode: error.statusCode,
      timestamp: new Date(error.timestamp).toISOString(),
      stack: error.stack,
    });
  }
}
