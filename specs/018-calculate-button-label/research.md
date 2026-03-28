# Research: Step 5 — Relabel Next Button to 'Calculate'

**Feature Branch**: `018-calculate-button-label`
**Date**: 2026-03-28

---

## Finding 1 — Touch Point Location

**Decision**: One file, one conditional label change.

The navigation button rendered for steps 1–5 lives in `src/app/(wizard)/wizard/page.tsx` at the bottom of the wizard layout (lines 189–203). It currently renders "Next Step" for all steps where `state.currentStep < 6`. Step 6 has its own separate button block.

**Change required**: When `state.currentStep === 5`, render "Calculate" as the button label. All other steps (1–4) continue to render "Next Step".

**Rationale**: The label is inline text inside the single shared navigation button block — no abstraction layer, no separate component. A simple conditional on `state.currentStep` is the correct and minimal approach consistent with how the Step 6 button is already handled with its own conditional block.

**Alternatives considered**:
- Passing a `label` prop through WizardContext — over-engineering for a single-step label override.
- Abstracting a `StepButton` component — unnecessary; no other divergence between step buttons exists at this time.

---

## Finding 2 — No Data Model or API Impact

This change has zero impact on:
- Wizard state (`WizardState`) — step number tracking is unchanged
- `WizardContext` — no new actions, no new state fields
- Any API route — the button only calls the existing `goToNextStep` action
- Supabase schema — no database changes

---

## Finding 3 — Constitution Check

All five principles pass without exception. This is a cosmetic label change within an already-authenticated, already-implemented wizard step. No new dependencies, no new services, no pricing logic changes.

---

## Summary

| Item | Status |
|------|--------|
| Touch points | 1 file (`page.tsx`), 1 line (button label text) |
| Data model changes | None |
| API contract changes | None |
| New dependencies | None |
| Constitution gates | All pass |
