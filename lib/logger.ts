/**
 * Structured Logging Utilities
 * 
 * Provides consistent logging interface for application events.
 * In production, these can be integrated with logging services like Winston, Pino, etc.
 */

export interface LogContext {
  [key: string]: any
}

/**
 * Log informational messages
 */
export function logInfo(message: string, context?: LogContext): void {
  if (process.env.NODE_ENV === 'production') {
    // In production, use structured JSON logging
    console.log(JSON.stringify({
      level: 'info',
      message,
      timestamp: new Date().toISOString(),
      ...context
    }))
  } else {
    // In development, use readable format
    console.log(`[INFO] ${message}`, context || '')
  }
}

/**
 * Log error messages
 */
export function logError(message: string, context?: LogContext): void {
  if (process.env.NODE_ENV === 'production') {
    // In production, use structured JSON logging
    console.error(JSON.stringify({
      level: 'error',
      message,
      timestamp: new Date().toISOString(),
      ...context
    }))
  } else {
    // In development, use readable format
    console.error(`[ERROR] ${message}`, context || '')
  }
}

/**
 * Log warning messages
 */
export function logWarning(message: string, context?: LogContext): void {
  if (process.env.NODE_ENV === 'production') {
    console.warn(JSON.stringify({
      level: 'warning',
      message,
      timestamp: new Date().toISOString(),
      ...context
    }))
  } else {
    console.warn(`[WARNING] ${message}`, context || '')
  }
}

/**
 * Log debug messages (only in development)
 */
export function logDebug(message: string, context?: LogContext): void {
  if (process.env.NODE_ENV !== 'production') {
    console.debug(`[DEBUG] ${message}`, context || '')
  }
}
