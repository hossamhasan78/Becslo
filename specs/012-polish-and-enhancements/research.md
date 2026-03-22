# Research: Polish & Enhancements

## Decisions

### 1. Unique ID Generation
- **Decision**: Use native `crypto.randomUUID()` in the browser/NextJS server.
- **Rationale**: Zero-dependency, modern standard, highly collision-resistant.
- **Alternatives**: `uuid` or `nanoid` (both require extra dependencies).

### 2. UI Transitions & Animations
- **Decision**: Use `framer-motion` for step transitions and progress bar updates.
- **Rationale**: Standard choice for React, highly declarative, handles layout animations smoothly across step changes.
- **Alternatives**: Plain CSS transitions (less flexible for exit animations).

### 3. Local Storage Persistence
- **Decision**: Implement a custom `useLocalStorage` hook with hydration-safe mounting check.
- **Rationale**: Syncing wizard state to Local Storage requires client-side-only execution to avoid hydration mismatches in NextJS.
- **Alternatives**: `zustand` with persistence middleware (might be overkill if only for wizard state).

### 4. Lazy Loading Service Categories
- **Decision**: Use `React.memo` and localized step-based rendering to keep DOM size minimal.
- **Rationale**: Re-rendering only the active step and memoizing category data keeps UI updates <100ms as per SC-002.
- **Alternatives**: `next/dynamic` (better for large independent chunks, not internal UI state).

### 5. Keyboard Navigation
- **Decision**: Global event listeners for 'Enter' and 'Escape' within the wizard container.
- **Rationale**: Simple to implement via `useEffect` and ensures shortcuts work regardless of which input is focused (as long as it's not a textarea).
- **Alternatives**: `react-use-keypress` (another dependency).
