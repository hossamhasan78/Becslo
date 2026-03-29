import { CostEntry } from '@/lib/types/pricing'

export interface WizardState {
  currentStep: number
  calculation_id: string | null
  updatedAt: string | null
  services: SelectedService[]
  experienceDesigner: number
  experienceFreelance: number
  designerCountryId: number | null
  clientCountryId: number | null
  designerCountryCode: string
  clientCountryCode: string
  costs: CostEntry[]
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
  { id: 1, title: 'Services', description: 'Select services and hours' },
  { id: 2, title: 'Experience', description: 'Enter experience levels' },
  { id: 3, title: 'Geography', description: 'Select countries' },
  { id: 4, title: 'Costs', description: 'Add additional costs' },
  { id: 5, title: 'Risk & Profit', description: 'Set risk and profit margins' },
  { id: 6, title: 'Results', description: 'Review and export' },
]

export const DEFAULT_WIZARD_STATE: WizardState = {
  currentStep: 1,
  calculation_id: null,
  updatedAt: null,
  services: [],
  experienceDesigner: 2,
  experienceFreelance: 2,
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
