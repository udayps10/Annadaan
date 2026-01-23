/**
 * Standardized Error Handling Utilities
 * Provides consistent error responses and logging across the application
 */

import { NextResponse } from 'next/server';
import { HTTP_STATUS, ERROR_MESSAGES, isProduction } from './config';

/**
 * Custom API Error class with status code and additional context
 */
export class ApiError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly context?: Record<string, any>;

  constructor(
    message: string,
    statusCode: number = HTTP_STATUS.INTERNAL_SERVER_ERROR,
    isOperational: boolean = true,
    context?: Record<string, any>
  ) {
    super(message);
    Object.setPrototypeOf(this, new.target.prototype);

    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.context = context;

    Error.captureStackTrace(this);
  }
}

/**
 * Predefined error types for common scenarios
 */
export class ValidationError extends ApiError {
  constructor(message: string, context?: Record<string, any>) {
    super(message, HTTP_STATUS.BAD_REQUEST, true, context);
  }
}

export class AuthenticationError extends ApiError {
  constructor(message: string = ERROR_MESSAGES.UNAUTHORIZED) {
    super(message, HTTP_STATUS.UNAUTHORIZED, true);
  }
}

// Alias for compatibility
export class UnauthorizedError extends AuthenticationError {
  constructor(message: string = ERROR_MESSAGES.UNAUTHORIZED) {
    super(message);
  }
}

export class AuthorizationError extends ApiError {
  constructor(message: string = ERROR_MESSAGES.FORBIDDEN) {
    super(message, HTTP_STATUS.FORBIDDEN, true);
  }
}

export class NotFoundError extends ApiError {
  constructor(message: string = ERROR_MESSAGES.NOT_FOUND, context?: Record<string, any>) {
    super(message, HTTP_STATUS.NOT_FOUND, true, context);
  }
}

export class ConflictError extends ApiError {
  constructor(message: string, context?: Record<string, any>) {
    super(message, HTTP_STATUS.CONFLICT, true, context);
  }
}

export class DatabaseError extends ApiError {
  constructor(message: string = ERROR_MESSAGES.DATABASE_ERROR, context?: Record<string, any>) {
    super(message, HTTP_STATUS.INTERNAL_SERVER_ERROR, false, context);
  }
}

export class RateLimitError extends ApiError {
  constructor(message: string = ERROR_MESSAGES.RATE_LIMIT_EXCEEDED) {
    super(message, HTTP_STATUS.TOO_MANY_REQUESTS, true);
  }
}

/**
 * Error response structure
 */
interface ErrorResponse {
  success: false;
  error: {
    message: string;
    statusCode: number;
    code?: string;
    details?: any;
    stack?: string;
  };
}

/**
 * Format error into standardized response
 */
export function formatErrorResponse(error: Error | ApiError): ErrorResponse {
  const isApiError = error instanceof ApiError;
  
  const response: ErrorResponse = {
    success: false,
    error: {
      message: isApiError ? error.message : ERROR_MESSAGES.SERVER_ERROR,
      statusCode: isApiError ? error.statusCode : HTTP_STATUS.INTERNAL_SERVER_ERROR,
      code: error.name,
    },
  };

  // Add context if available
  if (isApiError && error.context) {
    response.error.details = error.context;
  }

  // Include stack trace in development
  if (!isProduction()) {
    response.error.stack = error.stack;
  }

  return response;
}

/**
 * Create NextResponse from error
 */
export function handleError(error: Error | ApiError): NextResponse<ErrorResponse> {
  const errorResponse = formatErrorResponse(error);
  
  // Log error
  logError(error, errorResponse);

  return NextResponse.json(errorResponse, {
    status: errorResponse.error.statusCode,
  });
}

/**
 * Log error with context
 */
export function logError(error: Error | ApiError, response?: ErrorResponse): void {
  const timestamp = new Date().toISOString();
  const isApiError = error instanceof ApiError;

  // Determine log level
  const isOperational = isApiError ? error.isOperational : false;
  const logLevel = isOperational ? 'warn' : 'error';

  // Build structured log data
  const logData = {
    timestamp,
    level: logLevel,
    name: error.name,
    message: error.message,
    statusCode: isApiError ? error.statusCode : HTTP_STATUS.INTERNAL_SERVER_ERROR,
    isOperational,
    context: isApiError ? error.context : undefined,
    stack: !isProduction() ? error.stack : undefined,
  };

  // Log based on level
  if (logLevel === 'error') {
    console.error('❌ ERROR:');
    console.error(JSON.stringify(logData, null, 2));
  } else {
    console.warn('⚠️  WARNING:');
    console.warn(JSON.stringify(logData, null, 2));
  }

  // In production, send to monitoring service (e.g., Sentry, DataDog)
  if (isProduction() && !isOperational) {
    // TODO: Integrate with monitoring service
    // Example: Sentry.captureException(error, { contexts: { response } });
  }
}

/**
 * Async error handler wrapper
 */
export function asyncHandler<T extends any[], R>(
  fn: (...args: T) => Promise<R>
): (...args: T) => Promise<R | NextResponse<ErrorResponse>> {
  return async (...args: T) => {
    try {
      return await fn(...args);
    } catch (error) {
      if (error instanceof ApiError) {
        return handleError(error);
      }
      if (error instanceof Error) {
        return handleError(error);
      }
      // Unknown error type
      return handleError(new ApiError('An unexpected error occurred'));
    }
  };
}

/**
 * Success response structure
 */
interface SuccessResponse<T = any> {
  success: true;
  data: T;
  message?: string;
  meta?: {
    timestamp: string;
    [key: string]: any;
  };
}

/**
 * Create standardized success response
 */
export function createSuccessResponse<T>(
  data: T,
  message?: string,
  meta?: Record<string, any>
): SuccessResponse<T> {
  return {
    success: true,
    data,
    message,
    meta: {
      timestamp: new Date().toISOString(),
      ...meta,
    },
  };
}

/**
 * Create NextResponse with success data
 */
export function handleSuccess<T>(
  data: T,
  message?: string,
  statusCode: number = HTTP_STATUS.OK,
  meta?: Record<string, any>
): NextResponse<SuccessResponse<T>> {
  const response = createSuccessResponse(data, message, meta);
  return NextResponse.json(response, { status: statusCode });
}

/**
 * Parse and standardize database errors
 */
export function parseDatabaseError(error: any): ApiError {
  // MySQL error codes
  if (error.code === 'ER_DUP_ENTRY') {
    return new ConflictError('A record with this information already exists.', {
      field: error.sqlMessage,
    });
  }

  if (error.code === 'ER_NO_REFERENCED_ROW_2') {
    return new ValidationError('Referenced record does not exist.', {
      constraint: error.sqlMessage,
    });
  }

  if (error.code === 'ER_ROW_IS_REFERENCED_2') {
    return new ConflictError('Cannot delete record because it is referenced by other records.', {
      constraint: error.sqlMessage,
    });
  }

  if (error.code === 'ER_CON_COUNT_ERROR') {
    return new ApiError('Database connection pool exhausted. Please try again.', HTTP_STATUS.SERVICE_UNAVAILABLE, false);
  }

  if (error.code === 'PROTOCOL_CONNECTION_LOST') {
    return new ApiError('Database connection lost. Please try again.', HTTP_STATUS.SERVICE_UNAVAILABLE, false);
  }

  if (error.code === 'ECONNREFUSED') {
    return new DatabaseError('Unable to connect to database.', { originalError: error.message });
  }

  // Generic database error
  return new DatabaseError('Database operation failed.', {
    code: error.code,
    errno: error.errno,
  });
}

/**
 * Log info message
 */
export function logInfo(message: string, context?: Record<string, any>): void {
  const logData = {
    timestamp: new Date().toISOString(),
    level: 'info',
    message,
    context,
  };
  console.log('ℹ️  INFO:');
  console.log(JSON.stringify(logData, null, 2));
}

/**
 * Log warning message
 */
export function logWarning(message: string, context?: Record<string, any>): void {
  const logData = {
    timestamp: new Date().toISOString(),
    level: 'warn',
    message,
    context,
  };
  console.warn('⚠️  WARNING:');
  console.warn(JSON.stringify(logData, null, 2));
}

/**
 * Log debug message (only in development)
 */
export function logDebug(message: string, context?: Record<string, any>): void {
  if (!isProduction()) {
    const logData = {
      timestamp: new Date().toISOString(),
      level: 'debug',
      message,
      context,
    };
    console.log('🔍 DEBUG:');
    console.log(JSON.stringify(logData, null, 2));
  }
}
