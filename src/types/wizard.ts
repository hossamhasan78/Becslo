export type PricingModel = 'hourly' | 'project'

export interface WizardState {
  currentStep: number
  calculation_id: string | null
  updatedAt: string | null
  pricingModel: PricingModel | null
  services: SelectedService[]
  experienceDesigner: number
  experienceFreelance: number
  designerCountryId: number | null
  clientCountryId: number | null
  designerCountryCode: string
  clientCountryCode: string
  costs: number[]
  riskBuffer: number
  profitMargin: number
  highestCompletedStep: number
  isSaved: boolean
  savedCalculationId: string | null
}

export interface SelectedService {
  id: number
  hours: number
  adjustedRate: number
  cost: number
}

export interface WizardStep {
  id: number
  title: string
  description: string
}

export const WIZARD_STEPS: WizardStep[] = [
  { id: 1, title: 'Pricing Model', description: 'Choose hourly or project-based' },
  { id: 2, title: 'Services', description: 'Select services and hours' },
  { id: 3, title: 'Experience', description: 'Enter experience levels' },
  { id: 4, title: 'Geography', description: 'Select countries' },
  { id: 5, title: 'Costs', description: 'Add additional costs' },
  { id: 6, title: 'Risk & Profit', description: 'Set risk and profit margins' },
  { id: 7, title: 'Review', description: 'Review and export' },
]

export const DEFAULT_WIZARD_STATE: WizardState = {
  currentStep: 1,
  calculation_id: null,
  updatedAt: null,
  pricingModel: null,
  services: [],
  experienceDesigner: 5,
  experienceFreelance: 5,
  designerCountryId: null,
  clientCountryId: null,
  designerCountryCode: '',
  clientCountryCode: '',
  costs: [],
  riskBuffer: 15,
  profitMargin: 20,
  highestCompletedStep: 0,
  isSaved: false,
  savedCalculationId: null,
}
