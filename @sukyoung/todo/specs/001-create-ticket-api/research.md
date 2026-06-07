# Research: Ticket Creation API

## Decision: Validate request body with shared Zod schema

Use `src/shared/validations/ticket.ts` as the source of truth for
`POST /api/tickets` request body validation.

**Rationale**: The project constitution requires Zod request validation before
business logic, and `docs/API_SPEC.md` states that frontend forms and backend
APIs share Zod schemas.

**Alternatives considered**:
- Route-local validation: rejected because it duplicates shared rules.
- Service-layer validation only: rejected because invalid transport input would
  reach business logic.

## Decision: Keep Route Handler thin

Keep `src/app/api/tickets/route.ts` responsible for JSON parsing, Zod
validation, service invocation, and response construction.

**Rationale**: Constitution requires business logic in `src/server/services/`.
The existing route shape already follows this pattern.

**Alternatives considered**:
- Put defaults and position calculation in the route: rejected because it mixes
  transport and domain behavior.

## Decision: Use standard error middleware for validation failures

Let `handleRouteError` convert `ZodError` into HTTP 400 with the standard
`{ error: { code, message } }` envelope.

**Rationale**: The constitution and `docs/API_SPEC.md` require one stable error
shape. Centralized mapping prevents drift across route handlers.

**Alternatives considered**:
- Inline error responses in each route: rejected because it increases the risk
  of inconsistent error envelopes.

## Decision: Date comparison follows Asia/Seoul business date

For `dueDate`, reject dates earlier than today's date in Asia/Seoul.

**Rationale**: `docs/API_SPEC.md` sets timezone to Asia/Seoul and rejects past
due dates. The rule is user-facing and must not depend on server timezone.

**Alternatives considered**:
- UTC date comparison: rejected because it can differ from the documented
  Asia/Seoul date near day boundaries.

## Decision: Scope is backend-only

This plan covers API validation, route behavior, service behavior, and tests for
`POST /api/tickets`. It does not modify frontend code.

**Rationale**: The user requested implementation planning for an API endpoint.
AGENTS boundary rules say backend work should not modify `src/client/`.

**Alternatives considered**:
- Include form/client integration: rejected as out of scope for this API plan.
