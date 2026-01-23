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
  const serializedContext = serializeContext(context)
  
  if (process.env.NODE_ENV === 'production') {
    // In production, use structured JSON logging
    console.log(JSON.stringify({
      level: 'info',
      message,
      timestamp: new Date().toISOString(),
      ...serializedContext
    }))
  } else {
    // In development, use readable format
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
  const errorData = error ? serializeError(error) : undefined
  const serializedContext = serializeContext(context)
  
  if (process.env.NODE_ENV === 'production') {
    // In production, use structured JSON logging
    console.error(JSON.stringify({
      level: 'error',
      message,
      timestamp: new Date().toISOString(),
      error: errorData,
      ...serializedContext
    }))
  } else {
    // In development, use readable format with full details
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
  const errorData = error ? serializeError(error) : undefined
  const serializedContext = serializeContext(context)
  
  if (process.env.NODE_ENV === 'production') {
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
 * Log debug messages (only in development)
 */
export function logDebug(message: string, context?: LogContext): void {
  if (process.env.NODE_ENV !== 'production') {
    const serializedContext = serializeContext(context)
    if (serializedContext && Object.keys(serializedContext).length > 0) {
      console.debug(`🔍 [DEBUG] ${message}`, JSON.stringify(serializedContext, null, 2))
    } else {
      console.debug(`🔍 [DEBUG] ${message}`)
    }
  }
}
