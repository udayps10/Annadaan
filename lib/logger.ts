/**
 * Structured Logging Utilities
 * 
 * Provides consistent logging interface for application events.
 * In production, these can be integrated with logging services like Winston, Pino, etc.
 * 
 * Environment Variables:
 * - ENABLE_DEBUG_LOGS: "true" | "false" (default: false in production, true in development)
 * - LOG_LEVEL: "debug" | "info" | "warning" | "error" (default: "debug")
 * - ENABLE_STRUCTURED_LOGS: "true" | "false" (default: true in production, false in development)
 */

export interface LogContext {
  [key: string]: any
}

// Configuration from environment variables
const config = {
  enableDebug: process.env.ENABLE_DEBUG_LOGS === 'true' || 
               (process.env.ENABLE_DEBUG_LOGS !== 'false' && process.env.NODE_ENV !== 'production'),
  logLevel: (process.env.LOG_LEVEL || 'debug') as 'debug' | 'info' | 'warning' | 'error',
  structuredLogs: process.env.ENABLE_STRUCTURED_LOGS === 'true' || 
                  (process.env.ENABLE_STRUCTURED_LOGS !== 'false' && process.env.NODE_ENV === 'production')
}

// Log level hierarchy
const LOG_LEVELS = {
  debug: 0,
  info: 1,
  warning: 2,
  error: 3
}

/**
 * Check if a log level should be logged based on configured minimum level
 */
function shouldLog(level: keyof typeof LOG_LEVELS): boolean {
  return LOG_LEVELS[level] >= LOG_LEVELS[config.logLevel]
}

/**
 * Serialize error object for logging
 */
function serializeError(error: any): any {
  if (error instanceof Error) {
    const serialized: any = {
      name: error.name,
      message: error.message,
      stack: error.stack
    }
    
    // Add any additional enumerable properties
    Object.keys(error).forEach(key => {
      if (!(key in serialized)) {
        serialized[key] = (error as any)[key]
      }
    })
    
    return serialized
  }
  return error
}

/**
 * Serialize context for logging (handles complex objects)
 */
function serializeContext(context?: LogContext): any {
  if (!context) return undefined
  
  const serialized: any = {}
  for (const [key, value] of Object.entries(context)) {
    if (value instanceof Error) {
      serialized[key] = serializeError(value)
    } else if (typeof value === 'object' && value !== null) {
      try {
        // Test if object is serializable
        JSON.stringify(value)
        serialized[key] = value
      } catch (e) {
        serialized[key] = String(value)
      }
    } else {
      serialized[key] = value
    }
  }
  return serialized
}

/**
 * Log informational messages
 */
export function logInfo(message: string, context?: LogContext): void {
  if (!shouldLog('info')) return
  
  const serializedContext = serializeContext(context)
  
  if (config.structuredLogs) {
    // Use structured JSON logging
    console.log(JSON.stringify({
      level: 'info',
      message,
      timestamp: new Date().toISOString(),
      ...serializedContext
    }))
  } else {
    // Use readable format
    if (serializedContext && Object.keys(serializedContext).length > 0) {
      console.log(`ℹ️  [INFO] ${message}`, JSON.stringify(serializedContext, null, 2))
    } else {
      console.log(`ℹ️  [INFO] ${message}`)
    }
  }
}

/**
 * Log error messages
 */
export function logError(message: string, error?: Error | any, context?: LogContext): void {
  if (!shouldLog('error')) return
  
  const errorData = error ? serializeError(error) : undefined
  const serializedContext = serializeContext(context)
  
  if (config.structuredLogs) {
    // Use structured JSON logging
    console.error(JSON.stringify({
      level: 'error',
      message,
      timestamp: new Date().toISOString(),
      error: errorData,
      ...serializedContext
    }))
  } else {
    // Use readable format with full details
    console.error(`❌ [ERROR] ${message}`)
    if (errorData) {
      console.error('Error Details:', JSON.stringify(errorData, null, 2))
    }
    if (serializedContext && Object.keys(serializedContext).length > 0) {
      console.error('Context:', JSON.stringify(serializedContext, null, 2))
    }
  }
}

/**
 * Log warning messages
 */
export function logWarning(message: string, error?: Error | any, context?: LogContext): void {
  if (!shouldLog('warning')) return
  
  const errorData = error ? serializeError(error) : undefined
  const serializedContext = serializeContext(context)
  
  if (config.structuredLogs) {
    console.warn(JSON.stringify({
      level: 'warning',
      message,
      timestamp: new Date().toISOString(),
      error: errorData,
      ...serializedContext
    }))
  } else {
    console.warn(`⚠️  [WARNING] ${message}`)
    if (errorData) {
      console.warn('Error Details:', JSON.stringify(errorData, null, 2))
    }
    if (serializedContext && Object.keys(serializedContext).length > 0) {
      console.warn('Context:', JSON.stringify(serializedContext, null, 2))
    }
  }
}

/**
 * Log debug messages (respects ENABLE_DEBUG_LOGS environment variable)
 */
export function logDebug(message: string, context?: LogContext): void {
  if (!config.enableDebug || !shouldLog('debug')) return
  
  const serializedContext = serializeContext(context)
  
  if (config.structuredLogs) {
    console.debug(JSON.stringify({
      level: 'debug',
      message,
      timestamp: new Date().toISOString(),
      ...serializedContext
    }))
  } else {
    if (serializedContext && Object.keys(serializedContext).length > 0) {
      console.debug(`🔍 [DEBUG] ${message}`, JSON.stringify(serializedContext, null, 2))
    } else {
      console.debug(`🔍 [DEBUG] ${message}`)
    }
  }
}
