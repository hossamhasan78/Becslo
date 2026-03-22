'use client'

import { useState, useCallback, useMemo } from 'react'
import { WizardState, DEFAULT_WIZARD_STATE } from '@/types/wizard'
import { generateUUID } from '@/lib/utils/uuid'

const STORAGE_KEY = 'becslo_wizard_state'
const EXPIRY_HOURS = 24

function isValidState(state: WizardState | null): boolean {
  if (!state) return false
  if (!state.updatedAt) return false
  
  const updatedTime = new Date(state.updatedAt).getTime()
  const now = Date.now()
  const hoursElapsed = (now - updatedTime) / (1000 * 60 * 60)
  
  return hoursElapsed < EXPIRY_HOURS
}

function getInitialState(): WizardState {
  if (typeof window === 'undefined') return DEFAULT_WIZARD_STATE
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      const parsed = JSON.parse(stored) as WizardState
      if (isValidState(parsed)) {
        return parsed
      }
      localStorage.removeItem(STORAGE_KEY)
    }
  } catch (error) {
    console.warn('Error reading wizard state from localStorage:', error)
  }
  
  return DEFAULT_WIZARD_STATE
}

export function useWizardPersistence() {
  const [hasExistingState, setHasExistingState] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      return stored ? isValidState(JSON.parse(stored) as WizardState) : false
    } catch {
      return false
    }
  })
  
  const [state, setState] = useState<WizardState>(getInitialState)
  
  const isHydrated = useMemo(() => true, [])

  const saveState = useCallback((newState: Partial<WizardState>) => {
    if (typeof window === 'undefined') return
    
    try {
      const currentState = state
      const updatedState: WizardState = {
        ...currentState,
        ...newState,
        calculation_id: newState.calculation_id ?? currentState.calculation_id ?? generateUUID(),
        updatedAt: new Date().toISOString(),
      }
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedState))
      setState(updatedState)
    } catch (error) {
      console.warn('Error saving wizard state to localStorage:', error)
    }
  }, [state])

  const clearState = useCallback(() => {
    if (typeof window === 'undefined') return
    
    localStorage.removeItem(STORAGE_KEY)
    setState(DEFAULT_WIZARD_STATE)
    setHasExistingState(false)
  }, [])

  const resumeSession = useCallback(() => {
    if (typeof window === 'undefined') return false
    
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored) as WizardState
        if (isValidState(parsed)) {
          setState(parsed)
          return true
        }
      }
    } catch (error) {
      console.warn('Error resuming wizard session:', error)
    }
    return false
  }, [])

  return {
    state,
    isHydrated,
    hasExistingState,
    saveState,
    clearState,
    resumeSession,
  }
}