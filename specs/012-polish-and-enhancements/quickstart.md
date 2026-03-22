# Quickstart: Polish & Enhancements

## Core Components

### 1. Client-Side UUID Generator
```typescript
// utils/uuid.ts
export function generate_calculation_id(): string {
  return crypto.randomUUID();
}
```

### 2. Local Storage Persistence Hook
```typescript
// hooks/useWizardPersistence.ts
import { useEffect, useState } from 'react';

export function useWizardPersistence<T>(key: string, initialValue: T) {
  const [state, setState] = useState<T>(initialValue);

  // Sync state to local storage on change
  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(state));
  }, [key, state]);

  return [state, setState] as const;
}
```

### 3. Smooth Step Transitions (Framer Motion)
```tsx
// components/WizardStepWrapper.tsx
import { motion, AnimatePresence } from 'framer-motion';

export const WizardStepWrapper = ({ children, stepKey }: { children: React.ReactNode, stepKey: string }) => (
  <AnimatePresence mode="wait">
    <motion.div
      key={stepKey}
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
    >
      {children}
    </motion.div>
  </AnimatePresence>
);
```

### 4. Real-time Validation (Input Level)
```typescript
// utils/validation.ts
export const validatePositiveNumber = (value: number): string | null => {
  if (value < 0) return "Value cannot be negative";
  if (value > 999) return "Value too large";
  return null;
}
```

## Implementation Order
1.  **Skeleton**: Wrap wizard steps in `WizardStepWrapper`.
2.  **Persistence**: Integrate `useWizardPersistence` into the main wizard context/state.
3.  **Validation**: Add real-time feedback to all numeric inputs (services, hours, experience).
4.  **Polish**: Add visual progress bar syncing with `currentStep`.
5.  **Export**: Ensure `calculation_id` is included in the PDF and database `POST` request.
