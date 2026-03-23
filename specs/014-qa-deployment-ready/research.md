# Research: Phase 7 Testing & Deployment

## Decision: E2E Testing Framework
**Chosen**: Playwright
**Rationale**: 
- Native support for NextJS apps.
- Superior handling of multi-step wizard state transitions compared to Cypress.
- Built-in support for recording and trace viewing which is essential for debugging CI failures in authentication flows.
- Fast execution with worker parallelism.

**Alternatives Considered**:
- Cypress: Good, but can be flaky with iframe/popup auth flows which may occur if we ever move beyond basic email/password (though MVP is limited, Playwright is more future-proof).

## Decision: Smoke Testing Pattern
**Chosen**: GitHub Actions with Vercel Deployment Event
**Rationale**:
- Vercel's `deployment_status` event in GitHub Actions allows triggering a smoke test suite specifically against the `preview_url` or `production_url` as soon as the deployment finishes.
- Decouples deployment from testing while still providing an immediate health signal.
- Minimal overhead; only runs a subset of P1 scripts.

**Alternatives Considered**:
- Vercel Checks API: More integrated but requires more complex setup for a simple MVP.

## Decision: PDF Error Recovery
**Chosen**: React Error Boundary + Local Retry Utility
**Rationale**:
- Since the PDF is generated via a server-side API call, transient 504 (timeout) or 429 (rate limit) errors can be handled by a client-side retry button.
- Calculation state is already in the Wizard Context, so we don't need persistent storage for the "retry" to work; we just re-POST the same payload.

## Decision: Deployment Checklist Format
**Chosen**: Markdown in `docs/`
**Rationale**: Simple, version-controlled, and easily readable by human admins during hand-off.
