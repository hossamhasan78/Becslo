export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

export interface ValidationRule {
  validate: (value: unknown) => boolean;
  message: string;
}

export const validators = {
  required: (message = 'This field is required'): ValidationRule => ({
    validate: (value) => {
      if (typeof value === 'string') return value.trim().length > 0;
      if (typeof value === 'number') return !isNaN(value);
      return value !== null && value !== undefined;
    },
    message,
  }),

  minValue: (min: number, message?: string): ValidationRule => ({
    validate: (value) => {
      const num = Number(value);
      return !isNaN(num) && num >= min;
    },
    message: message || `Value must be at least ${min}`,
  }),

  maxValue: (max: number, message?: string): ValidationRule => ({
    validate: (value) => {
      const num = Number(value);
      return !isNaN(num) && num <= max;
    },
    message: message || `Value must be at most ${max}`,
  }),

  range: (min: number, max: number, message?: string): ValidationRule => ({
    validate: (value) => {
      const num = Number(value);
      return !isNaN(num) && num >= min && num <= max;
    },
    message: message || `Value must be between ${min} and ${max}`,
  }),

  positiveNumber: (message = 'Must be a positive number'): ValidationRule => ({
    validate: (value) => {
      const num = Number(value);
      return !isNaN(num) && num > 0;
    },
    message,
  }),

  nonNegative: (message = 'Cannot be negative'): ValidationRule => ({
    validate: (value) => {
      const num = Number(value);
      return !isNaN(num) && num >= 0;
    },
    message,
  }),

  maxLength: (max: number, message?: string): ValidationRule => ({
    validate: (value) => {
      if (typeof value !== 'string') return true;
      return value.length <= max;
    },
    message: message || `Maximum ${max} characters allowed`,
  }),

  email: (message = 'Invalid email address'): ValidationRule => ({
    validate: (value) => {
      if (typeof value !== 'string') return false;
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(value);
    },
    message,
  }),

  isNumber: (message = 'Must be a number'): ValidationRule => ({
    validate: (value) => !isNaN(Number(value)),
    message,
  }),

  isInteger: (message = 'Must be a whole number'): ValidationRule => ({
    validate: (value) => {
      const num = Number(value);
      return !isNaN(num) && Number.isInteger(num);
    },
    message,
  }),
};

export function validateField(value: unknown, rules: ValidationRule[]): ValidationResult {
  for (const rule of rules) {
    if (!rule.validate(value)) {
      return { isValid: false, error: rule.message };
    }
  }
  return { isValid: true };
}

export function validatePricingModel(model: string | null): ValidationResult {
  return validateField(model, [validators.required('Please select a pricing model')]);
}

export function validateHours(hours: number | null): ValidationResult {
  if (hours === null || hours === undefined) {
    return { isValid: false, error: 'Hours are required' };
  }
  return validateField(hours, [
    validators.nonNegative('Hours cannot be negative'),
    validators.maxValue(1000, 'Maximum 1000 hours per service'),
  ]);
}

export function validateExperienceYears(years: number | null): ValidationResult {
  if (years === null || years === undefined) {
    return { isValid: false, error: 'Years of experience is required' };
  }
  return validateField(years, [
    validators.nonNegative('Years cannot be negative'),
    validators.maxValue(50, 'Please enter a valid number of years (0-50)'),
  ]);
}

export function validateCountry(country: string | null): ValidationResult {
  return validateField(country, [validators.required('Please select a country')]);
}

export function validateServiceSelection(services: unknown[]): ValidationResult {
  if (!Array.isArray(services) || services.length === 0) {
    return { isValid: false, error: 'Please select at least one service' };
  }
  return { isValid: true };
}

export function roundToNearestHalf(value: number): number {
  return Math.round(value * 2) / 2;
}
