/**
 * Input Sanitization Utilities
 * 
 * Functions to clean and normalize user inputs before processing.
 * Helps prevent injection attacks and ensures data consistency.
 */

/**
 * Sanitize email address
 * - Trims whitespace
 * - Converts to lowercase
 * - Removes potential injection characters
 */
export function sanitizeEmail(email: string): string {
  if (!email) return ''
  return email
    .trim()
    .toLowerCase()
    .replace(/[<>'"]/g, '') // Remove potential HTML/SQL injection chars
}

/**
 * Sanitize phone number
 * - Removes all non-digit characters
 * - Keeps only numbers
 */
export function sanitizePhone(phone: string): string {
  if (!phone) return ''
  return phone.replace(/\D/g, '') // Remove all non-digits
}

/**
 * Sanitize general string input
 * - Trims whitespace
 * - Removes potential XSS characters
 * - Limits length if specified
 */
export function sanitizeString(input: string, maxLength?: number): string {
  if (!input) return ''
  
  let sanitized = input
    .trim()
    .replace(/[<>]/g, '') // Remove angle brackets to prevent basic XSS
  
  if (maxLength && sanitized.length > maxLength) {
    sanitized = sanitized.substring(0, maxLength)
  }
  
  return sanitized
}

/**
 * Sanitize name (person, organization)
 * - Trims whitespace
 * - Allows letters, spaces, hyphens, apostrophes
 * - Removes special characters
 */
export function sanitizeName(name: string): string {
  if (!name) return ''
  return name
    .trim()
    .replace(/[^a-zA-Z\s\-']/g, '') // Keep only letters, spaces, hyphens, apostrophes
    .replace(/\s+/g, ' ') // Normalize multiple spaces to single space
}

/**
 * Sanitize numeric string
 * - Keeps only digits and decimal point
 */
export function sanitizeNumeric(value: string): string {
  if (!value) return ''
  return value.replace(/[^\d.]/g, '')
}

/**
 * Sanitize URL
 * - Trims whitespace
 * - Ensures proper protocol
 */
export function sanitizeUrl(url: string): string {
  if (!url) return ''
  
  const trimmed = url.trim()
  
  // Add https:// if no protocol specified
  if (trimmed && !trimmed.match(/^https?:\/\//i)) {
    return `https://${trimmed}`
  }
  
  return trimmed
}

/**
 * Sanitize Aadhaar number (last 4 digits)
 * - Keeps only digits
 * - Limits to 4 digits
 */
export function sanitizeAadhaarLast4(aadhaar: string): string {
  if (!aadhaar) return ''
  const digits = aadhaar.replace(/\D/g, '')
  return digits.substring(0, 4)
}
