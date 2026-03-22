import type { PricingInput, ValidationError } from '../types/pricing';

export function validatePositiveNumber(value: unknown): { valid: boolean; value: number | null; error?: string } {
  if (value === null || value === undefined || value === '') {
    return { valid: false, value: null, error: 'Value is required' }
  }
  
  const num = typeof value === 'string' ? parseFloat(value) : value
  
  if (typeof num !== 'number' || isNaN(num)) {
    return { valid: false, value: null, error: 'Value must be a number' }
  }
  
  if (num < 0) {
    return { valid: false, value: null, error: 'Value must be positive' }
  }
  
  return { valid: true, value: num }
}

export function validatePricingInput(input: PricingInput): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!input.services || input.services.length === 0) {
    errors.push({
      field: 'services',
      message: 'At least one service must be selected',
    });
  }

  input.services.forEach((service, index) => {
    if (service.hours < 0) {
      errors.push({
        field: `services.${index}.hours`,
        message: 'Hours must be non-negative',
      });
    }
  });

  if (input.designerExperience < 1 || input.designerExperience > 10) {
    errors.push({
      field: 'designerExperience',
      message: 'Designer experience must be between 1 and 10',
    });
  }

  if (input.freelanceExperience < 1 || input.freelanceExperience > 10) {
    errors.push({
      field: 'freelanceExperience',
      message: 'Freelance experience must be between 1 and 10',
    });
  }

  if (input.designerCountryCode.length !== 2) {
    errors.push({
      field: 'designerCountryCode',
      message: 'Invalid country code',
    });
  }

  if (input.clientCountryCode.length !== 2) {
    errors.push({
      field: 'clientCountryCode',
      message: 'Invalid country code',
    });
  }

  if (input.riskBufferPercent < 0 || input.riskBufferPercent > 50) {
    errors.push({
      field: 'riskBufferPercent',
      message: 'Risk buffer must be between 0% and 50%',
    });
  }

  if (input.profitMarginPercent < 10 || input.profitMarginPercent > 50) {
    errors.push({
      field: 'profitMarginPercent',
      message: 'Profit margin must be between 10% and 50%',
    });
  }

  return errors;
}

export function validateInputRanges(
  input: PricingInput,
  maxHours: number
): ValidationError[] {
  const errors: ValidationError[] = [];

  input.services.forEach((service, index) => {
    if (service.hours > maxHours) {
      errors.push({
        field: `services.${index}.hours`,
        message: `Hours cannot exceed ${maxHours}`,
      });
    }
  });

  return errors;
}

export function hasValidationErrors(errors: ValidationError[]): boolean {
  return errors.length > 0;
}

export function formatValidationErrors(errors: ValidationError[]): Record<string, string> {
  const formatted: Record<string, string> = {};
  errors.forEach((error) => {
    formatted[error.field] = error.message;
  });
  return formatted;
}
