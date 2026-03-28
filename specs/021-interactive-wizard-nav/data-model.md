# Data Model: Interactive In-Wizard Step Navigation

**Branch**: `021-interactive-wizard-nav`
**Date**: 2026-03-28

---

## Overview

This feature introduces no new data entities, database tables, or API contracts. All state is managed client-side, in-memory, within the existing `WizardState` shape.

---

## Relevant Existing Entities

### WizardState (existing — no changes)

| Field | Type | Role in this feature |
|-------|------|---------------------|
| `currentStep` | `number` | The step the wizard is currently displaying (1–6) |
| `highestCompletedStep` | `number` | The furthest step the user has advanced through. Never decreases. Used to determine which steps are clickable and which display as "completed." |

No new fields. No field modifications.

---

### WizardStep (existing — no changes)

| Field | Type | Description |
|-------|------|-------------|
| `id` | `number` | Step number (1–6) |
| `title` | `string` | Step label displayed in the step list |
| `description` | `string` | Short descriptor shown below the step list |

The `WIZARD_STEPS` constant (6 entries) is the source of truth for rendering the step list.

---

## Step Navigation State Machine

Each step's navigation state is derived — not stored — from the two `WizardState` fields above:

| Derived State | Condition | Visual Treatment | Interactive? |
|---------------|-----------|-----------------|--------------|
| **Future** | `step.id > highestCompletedStep` AND `step.id !== currentStep` | Grey, locked indicator | No |
| **Current** | `step.id === currentStep` | Highlighted (blue) | Yes (no-op click) |
| **Completed** | `step.id !== currentStep` AND `step.id <= highestCompletedStep` | Green + checkmark | Yes (navigates) |

> **Note on the fix**: The current codebase derives "completed" as `step.id < currentStep`, which breaks when the user back-navigates. The correct derivation is `step.id !== currentStep && step.id <= highestCompletedStep` — this is the only change this feature makes.

---

## No Contracts Required

This feature is entirely internal to the wizard UI. It exposes no new API endpoints, no event schemas, and no external interfaces. The `/contracts/` directory is not needed.
