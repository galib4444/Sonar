/**
 * Error Logging Utility
 * Tracks errors with source location, stack traces, and context
 */

export interface ErrorContext {
  component?: string;
  function?: string;
  route?: string;
  userId?: string;
  [key: string]: any;
}

export interface LoggedError {
  message: string;
  source: string;
  stack?: string;
  context?: ErrorContext;
  timestamp: string;
}

class ErrorLogger {
  private errors: LoggedError[] = [];
  private maxErrors = 100;

  /**
   * Log an error with source tracking
   */
  log(error: Error | string, source: string, context?: ErrorContext) {
    const errorMessage = typeof error === 'string' ? error : error.message;
    const stack = typeof error === 'string' ? undefined : error.stack;

    const loggedError: LoggedError = {
      message: errorMessage,
      source,
      stack,
      context,
      timestamp: new Date().toISOString(),
    };

    this.errors.push(loggedError);

    // Keep only last N errors
    if (this.errors.length > this.maxErrors) {
      this.errors.shift();
    }

    // Console log with clear formatting
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.error('🐛 ERROR CAUGHT:');
    console.error(`📍 Source: ${source}`);
    console.error(`💬 Message: ${errorMessage}`);
    if (context) {
      console.error(`📋 Context:`, context);
    }
    if (stack) {
      console.error(`📚 Stack trace:`);
      console.error(stack);
    }
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    // In production, you could send this to an error tracking service
    // like Sentry, LogRocket, etc.
  }

  /**
   * Get all logged errors
   */
  getErrors(): LoggedError[] {
    return [...this.errors];
  }

  /**
   * Clear all logged errors
   */
  clear() {
    this.errors = [];
  }

  /**
   * Get errors from a specific source
   */
  getErrorsBySource(source: string): LoggedError[] {
    return this.errors.filter(e => e.source.includes(source));
  }
}

// Singleton instance
export const errorLogger = new ErrorLogger();

/**
 * Wrapper for async functions to catch and log errors
 */
export function withErrorLogging<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  source: string,
  context?: ErrorContext
): T {
  return (async (...args: Parameters<T>) => {
    try {
      return await fn(...args);
    } catch (error) {
      errorLogger.log(error as Error, source, context);
      throw error;
    }
  }) as T;
}

/**
 * Wrapper for sync functions to catch and log errors
 */
export function withErrorLoggingSync<T extends (...args: any[]) => any>(
  fn: T,
  source: string,
  context?: ErrorContext
): T {
  return ((...args: Parameters<T>) => {
    try {
      return fn(...args);
    } catch (error) {
      errorLogger.log(error as Error, source, context);
      throw error;
    }
  }) as T;
}
