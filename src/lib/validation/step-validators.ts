import { WizardState } from '@/types/wizard'

export interface StepValidationError {
  field: string
  message: string
}

export interface StepValidationResult {
  stepId: number
  isValid: boolean
  errors: StepValidationError[]
}

/**
 * Validates a single wizard step based on state
 */
export function validateStep(stepId: number, state: WizardState): StepValidationResult {
  const errors: StepValidationError[] = []

  switch (stepId) {
    case 1: // Services
      if (state.services.length === 0) {
        errors.push({ field: 'services', message: 'Please select at least one service' })
      }
      // Check if any selected service has hours < 1 (enforced at input level, but guard here)
      state.services.forEach((service, index) => {
        if (service.hours < 1) {
          errors.push({ field: `services[${index}].hours`, message: 'Hours must be at least 1' })
        }
      })
      break

    case 2: // Experience
      if (state.experienceDesigner < 1 || state.experienceDesigner > 10) {
        errors.push({ field: 'experienceDesigner', message: 'Designer experience must be between 1 and 10' })
      }
      if (state.experienceFreelance < 1 || state.experienceFreelance > 10) {
        errors.push({ field: 'experienceFreelance', message: 'Freelance experience must be between 1 and 10' })
      }
      break

    case 3: // Geography
      if (!state.designerCountryCode) {
        errors.push({ field: 'designerCountryCode', message: 'Please select your country' })
      }
      if (!state.clientCountryCode) {
        errors.push({ field: 'clientCountryCode', message: 'Please select the client\'s country' })
      }
      break

    case 4: // Costs
      // Optional, no validation needed unless we require something
      break

    case 5: // Risk & Profit
      // Bounds usually enforced by sliders 0-50, 10-50
      if (state.riskBuffer < 0 || state.riskBuffer > 50) {
        errors.push({ field: 'riskBuffer', message: 'Risk buffer must be between 0 and 50' })
      }
      if (state.profitMargin < 10 || state.profitMargin > 50) {
        errors.push({ field: 'profitMargin', message: 'Profit margin must be between 10 and 50' })
      }
      break

    case 6: // Review
      // No validation needed for navigation, button click triggers server-side validation
      break

    default:
      break
  }

  return {
    stepId,
    isValid: errors.length === 0,
    errors
  }
}
