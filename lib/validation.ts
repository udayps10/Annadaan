/**
 * Input Validation Utilities
 * Provides comprehensive validation for all user inputs
 */

import { VALIDATION_RULES, UPLOAD_CONFIG, DONATION_CONFIG } from './config';
import { ValidationError } from './errors';

/**
 * Validation result type
 */
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

/**
 * Base validator function type
 */
type ValidatorFunction = (value: any, fieldName?: string) => ValidationResult;

/**
 * Helper to create validation result
 */
function createResult(isValid: boolean, errors: string[] = []): ValidationResult {
  return { isValid, errors };
}

/**
 * Email validation
 */
export function validateEmail(email: string, fieldName: string = 'Email'): ValidationResult {
  const errors: string[] = [];

  if (!email || typeof email !== 'string') {
    errors.push(`${fieldName} is required.`);
    return createResult(false, errors);
  }

  const trimmedEmail = email.trim().toLowerCase();

  if (trimmedEmail.length > VALIDATION_RULES.email.maxLength) {
    errors.push(`${fieldName} must not exceed ${VALIDATION_RULES.email.maxLength} characters.`);
  }

  if (!VALIDATION_RULES.email.regex.test(trimmedEmail)) {
    errors.push(`${fieldName} must be a valid email address.`);
  }

  return createResult(errors.length === 0, errors);
}

/**
 * Phone number validation (Indian format)
 */
export function validatePhone(phone: string, fieldName: string = 'Phone number'): ValidationResult {
  const errors: string[] = [];

  if (!phone || typeof phone !== 'string') {
    errors.push(`${fieldName} is required.`);
    return createResult(false, errors);
  }

  // Remove spaces first
  let cleanedPhone = phone.replace(/\s+/g, '');
  
  // Only remove country code if the number is longer than 10 digits
  // This prevents removing '91' from numbers like 9137645007
  if (cleanedPhone.length > 10) {
    cleanedPhone = cleanedPhone.replace(/^(\+91|91)/, '');
  }

  if (cleanedPhone.length !== VALIDATION_RULES.phone.length) {
    errors.push(`${fieldName} must be ${VALIDATION_RULES.phone.length} digits.`);
  }

  if (!VALIDATION_RULES.phone.regex.test(cleanedPhone)) {
    errors.push(`${fieldName} must be a valid Indian mobile number starting with 6-9.`);
  }

  return createResult(errors.length === 0, errors);
}

/**
 * Password validation
 */
export function validatePassword(password: string, fieldName: string = 'Password'): ValidationResult {
  const errors: string[] = [];
  const rules = VALIDATION_RULES.password;

  if (!password || typeof password !== 'string') {
    errors.push(`${fieldName} is required.`);
    return createResult(false, errors);
  }

  if (password.length < rules.minLength) {
    errors.push(`${fieldName} must be at least ${rules.minLength} characters long.`);
  }

  if (password.length > rules.maxLength) {
    errors.push(`${fieldName} must not exceed ${rules.maxLength} characters.`);
  }

  if (rules.requireUppercase && !/[A-Z]/.test(password)) {
    errors.push(`${fieldName} must contain at least one uppercase letter.`);
  }

  if (rules.requireLowercase && !/[a-z]/.test(password)) {
    errors.push(`${fieldName} must contain at least one lowercase letter.`);
  }

  if (rules.requireNumbers && !/\d/.test(password)) {
    errors.push(`${fieldName} must contain at least one number.`);
  }

  if (rules.requireSpecialChars && !/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push(`${fieldName} must contain at least one special character.`);
  }

  return createResult(errors.length === 0, errors);
}

/**
 * Name validation
 */
export function validateName(name: string, fieldName: string = 'Name'): ValidationResult {
  const errors: string[] = [];
  const rules = VALIDATION_RULES.name;

  if (!name || typeof name !== 'string') {
    errors.push(`${fieldName} is required.`);
    return createResult(false, errors);
  }

  const trimmedName = name.trim();

  if (trimmedName.length < rules.minLength) {
    errors.push(`${fieldName} must be at least ${rules.minLength} characters long.`);
  }

  if (trimmedName.length > rules.maxLength) {
    errors.push(`${fieldName} must not exceed ${rules.maxLength} characters.`);
  }

  if (!rules.regex.test(trimmedName)) {
    errors.push(`${fieldName} can only contain letters, spaces, hyphens, and apostrophes.`);
  }

  return createResult(errors.length === 0, errors);
}

/**
 * Address validation
 */
export function validateAddress(address: string, fieldName: string = 'Address'): ValidationResult {
  const errors: string[] = [];
  const rules = VALIDATION_RULES.address;

  if (!address || typeof address !== 'string') {
    errors.push(`${fieldName} is required.`);
    return createResult(false, errors);
  }

  const trimmedAddress = address.trim();

  if (trimmedAddress.length < rules.minLength) {
    errors.push(`${fieldName} must be at least ${rules.minLength} characters long.`);
  }

  if (trimmedAddress.length > rules.maxLength) {
    errors.push(`${fieldName} must not exceed ${rules.maxLength} characters.`);
  }

  return createResult(errors.length === 0, errors);
}

/**
 * Pincode validation (Indian format)
 */
export function validatePincode(pincode: string, fieldName: string = 'Pincode'): ValidationResult {
  const errors: string[] = [];
  const rules = VALIDATION_RULES.pincode;

  if (!pincode || typeof pincode !== 'string') {
    errors.push(`${fieldName} is required.`);
    return createResult(false, errors);
  }

  const cleanedPincode = pincode.trim().replace(/\s+/g, '');

  if (cleanedPincode.length !== rules.length) {
    errors.push(`${fieldName} must be exactly ${rules.length} digits.`);
  }

  if (!rules.regex.test(cleanedPincode)) {
    errors.push(`${fieldName} must contain only numbers.`);
  }

  return createResult(errors.length === 0, errors);
}

/**
 * Donation amount validation
 */
export function validateDonationAmount(amount: number | string, fieldName: string = 'Amount'): ValidationResult {
  const errors: string[] = [];

  if (amount === null || amount === undefined || amount === '') {
    errors.push(`${fieldName} is required.`);
    return createResult(false, errors);
  }

  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;

  if (isNaN(numAmount)) {
    errors.push(`${fieldName} must be a valid number.`);
    return createResult(false, errors);
  }

  if (numAmount < DONATION_CONFIG.minDonationAmount) {
    errors.push(`${fieldName} must be at least Rs. ${DONATION_CONFIG.minDonationAmount}.`);
  }

  if (numAmount > DONATION_CONFIG.maxDonationAmount) {
    errors.push(`${fieldName} must not exceed Rs. ${DONATION_CONFIG.maxDonationAmount}.`);
  }

  return createResult(errors.length === 0, errors);
}

/**
 * URL validation
 */
export function validateUrl(url: string, fieldName: string = 'URL'): ValidationResult {
  const errors: string[] = [];

  if (!url || typeof url !== 'string') {
    errors.push(`${fieldName} is required.`);
    return createResult(false, errors);
  }

  try {
    new URL(url);
  } catch {
    errors.push(`${fieldName} must be a valid URL.`);
  }

  return createResult(errors.length === 0, errors);
}

/**
 * Required field validation
 */
export function validateRequired(value: any, fieldName: string): ValidationResult {
  const errors: string[] = [];

  if (value === null || value === undefined || value === '') {
    errors.push(`${fieldName} is required.`);
  }

  if (typeof value === 'string' && value.trim() === '') {
    errors.push(`${fieldName} cannot be empty.`);
  }

  return createResult(errors.length === 0, errors);
}

/**
 * Enum validation
 */
export function validateEnum<T extends string>(
  value: string,
  allowedValues: readonly T[],
  fieldName: string = 'Value'
): ValidationResult {
  const errors: string[] = [];

  if (!allowedValues.includes(value as T)) {
    errors.push(`${fieldName} must be one of: ${allowedValues.join(', ')}.`);
  }

  return createResult(errors.length === 0, errors);
}

/**
 * File validation
 */
export function validateFile(
  file: File | Buffer,
  options: {
    maxSize?: number;
    allowedTypes?: string[];
    fieldName?: string;
  } = {}
): ValidationResult {
  const errors: string[] = [];
  const fieldName = options.fieldName || 'File';
  const maxSize = options.maxSize || UPLOAD_CONFIG.maxFileSize;
  const allowedTypes = options.allowedTypes || UPLOAD_CONFIG.allowedImageTypes;

  if (!file) {
    errors.push(`${fieldName} is required.`);
    return createResult(false, errors);
  }

  // Check file size
  const fileSize = file instanceof File ? file.size : file.length;
  if (fileSize > maxSize) {
    const maxSizeMB = (maxSize / (1024 * 1024)).toFixed(2);
    errors.push(`${fieldName} size must not exceed ${maxSizeMB} MB.`);
  }

  // Check file type
  if (file instanceof File && allowedTypes.length > 0) {
    if (!allowedTypes.includes(file.type as any)) {
      errors.push(`${fieldName} must be one of: ${allowedTypes.join(', ')}.`);
    }
  }

  return createResult(errors.length === 0, errors);
}

/**
 * Sanitize string input
 */
export function sanitizeString(input: string): string {
  if (typeof input !== 'string') return '';
  
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/[^\x20-\x7E\u00A0-\uFFFF]/g, ''); // Remove non-printable characters
}

/**
 * Sanitize email
 */
export function sanitizeEmail(email: string): string {
  if (typeof email !== 'string') return '';
  return email.trim().toLowerCase();
}

/**
 * Sanitize phone number
 */
export function sanitizePhone(phone: string): string {
  if (typeof phone !== 'string') return '';
  // Remove all non-digit characters
  let cleaned = phone.replace(/\D/g, '');
  // Only remove country code if the number is longer than 10 digits
  if (cleaned.length > 10) {
    cleaned = cleaned.replace(/^91/, '');
  }
  return cleaned;
}

/**
 * Validate multiple fields and throw on error
 */
export function validateFields(validations: Array<{ result: ValidationResult; field: string }>): void {
  const allErrors: string[] = [];

  for (const { result, field } of validations) {
    if (!result.isValid) {
      allErrors.push(...result.errors);
    }
  }

  if (allErrors.length > 0) {
    throw new ValidationError('Validation failed', { errors: allErrors });
  }
}

/**
 * Validate object schema
 */
export function validateSchema<T extends Record<string, any>>(
  data: any,
  schema: Record<keyof T, ValidatorFunction>
): ValidationResult {
  const errors: string[] = [];

  for (const [field, validator] of Object.entries(schema)) {
    const result = validator(data[field], field);
    if (!result.isValid) {
      errors.push(...result.errors);
    }
  }

  return createResult(errors.length === 0, errors);
}

/**
 * Parse and validate JSON
 */
export function parseJSON<T = any>(jsonString: string): T {
  try {
    return JSON.parse(jsonString);
  } catch {
    throw new ValidationError('Invalid JSON format');
  }
}

/**
 * Validate and parse integer
 */
export function parseInteger(value: any, fieldName: string = 'Value'): number {
  const parsed = parseInt(value, 10);
  
  if (isNaN(parsed)) {
    throw new ValidationError(`${fieldName} must be a valid integer.`);
  }

  return parsed;
}

/**
 * Validate and parse float
 */
export function parseFloat(value: any, fieldName: string = 'Value'): number {
  const parsed = Number(value);
  
  if (isNaN(parsed)) {
    throw new ValidationError(`${fieldName} must be a valid number.`);
  }

  return parsed;
}
