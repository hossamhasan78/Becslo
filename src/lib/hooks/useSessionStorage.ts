'use client'

import { useState, useEffect, useCallback } from 'react'

/**
 * A custom hook that manages state in sessionStorage.
 * Synchronizes a state value with a corresponding sessionStorage key.
 * 
 * @param key The sessionStorage key to use
 * @param initialValue The initial value if no value exists in sessionStorage
 * @returns [storedValue, setValue] - State and a function to update it
 */
export function useSessionStorage<T>(key: string, initialValue: T): [T, (value: T | ((val: T) => T)) => void] {
  // Initialize state with value from sessionStorage or initialValue
  // We use a lazy initializer to avoid reading from sessionStorage on every render
  const [storedValue, setStoredValue] = useState<T>(initialValue)
  
  // Read from sessionStorage once on mount
  useEffect(() => {
    if (typeof window === 'undefined') return

    try {
      const item = window.sessionStorage.getItem(key)
      if (item) {
        setStoredValue(JSON.parse(item))
      }
    } catch (error) {
      console.warn(`Error reading sessionStorage key "${key}":`, error)
    }
  }, [key])

  // Return a wrapped version of useState's setter function that persists to sessionStorage
  const setValue = useCallback((value: T | ((val: T) => T)) => {
    try {
      // Allow value to be a function so we have same API as useState
      const valueToStore = value instanceof Function ? value(storedValue) : value
      
      // Save state
      setStoredValue(valueToStore)
      
      // Save to sessionStorage
      if (typeof window !== 'undefined') {
        window.sessionStorage.setItem(key, JSON.stringify(valueToStore))
      }
    } catch (error) {
      console.warn(`Error setting sessionStorage key "${key}":`, error)
    }
  }, [key, storedValue])

  return [storedValue, setValue]
}
