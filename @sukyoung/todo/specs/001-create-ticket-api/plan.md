# Implementation Plan: Ticket Creation API

**Branch**: `001-create-ticket-api` | **Date**: 2026-06-07 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/001-create-ticket-api/spec.md`

**Note**: This template is filled in by the `/speckit-plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

Implement `POST /api/tickets` exactly as specified in `docs/API_SPEC.md`.
The route handler will parse JSON, validate the request with the shared Zod
schema, delegate ticket creation to `src/server/services/ticketService.ts`, and
return either a `201 Created` ticket response or the standard error envelope.

Current code already has the route/service split, but planning identifies API
contract gaps to close before implementation is complete:

- `dueDate` must reject dates earlier than today in Asia/Seoul.
- `priority` validation must return the documented Korean message for invalid values.
- API contract tests must cover all `TC-API-001` cases before implementation changes.

## Technical Context

**Language/Version**: TypeScript 5.x strict mode

**Primary Dependencies**: Next.js 15 App Router, React 19, Zod, Drizzle ORM,
`postgres` driver

**Storage**: Local PostgreSQL via `DATABASE_URL`; `tickets` table managed by
Drizzle schema and migrations

**Testing**: Jest for API/service/validation tests

**Target Platform**: Next.js Route Handlers running on Node.js-compatible local
and deployment environments

**Project Type**: Full-stack web application with App Router API endpoints

**Performance Goals**: Ticket creation should complete within the project API
response target documented in `docs/PRD.md` and `docs/TRD.md`

**Constraints**: Must follow `docs/API_SPEC.md`; no authentication in MVP;
backend-only implementation must not modify `src/client/`

**Scale/Scope**: Single-user MVP board; scope limited to `POST /api/tickets`
creation behavior and its tests

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **TypeScript Strictness**: PASS. Plan preserves strict TypeScript and uses
  typed Zod inference/shared types.
- **API Specification Fidelity**: PASS. Contract source is `docs/API_SPEC.md`
  `POST /api/tickets`; all tests target that shape.
- **Standard Error Envelope**: PASS. All validation failures return
  `{ "error": { "code": "VALIDATION_ERROR", "message": "..." } }`.
- **Zod Request Validation**: PASS. Request body validation occurs before
  service-layer creation.
- **Service-Layer Business Logic**: PASS. Route handler remains thin; creation
  defaults and position behavior remain in `src/server/services/`.
- **Guardrails**: PASS. Plan avoids prohibited DB/Git/npm/filesystem commands
  and does not require destructive operations.
- **Verdict**: PASS.

## Project Structure

### Documentation (this feature)

```text
specs/001-create-ticket-api/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── post-api-tickets.md
├── checklists/
│   └── requirements.md
└── spec.md
```

### Source Code (repository root)

```text
src/
├── app/
│   └── api/
│       └── tickets/
│           └── route.ts
├── server/
│   ├── middleware/
│   │   ├── errorHandler.ts
│   │   └── validate.ts
│   └── services/
│       └── ticketService.ts
└── shared/
    ├── types/
    │   └── index.ts
    └── validations/
        └── ticket.ts

__tests__/
├── api/
│   └── tickets.test.ts
├── services/
│   └── ticketService.test.ts
└── validations/
    └── ticket.test.ts
```

**Structure Decision**: Use the existing Next.js App Router structure. Keep API
transport in `src/app/api/tickets/route.ts`, validation in
`src/shared/validations/ticket.ts`, error mapping in `src/server/middleware/`,
and creation rules in `src/server/services/ticketService.ts`.

## Complexity Tracking

No constitution violations or complexity exceptions are required.

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| None | N/A | N/A |

## Phase 0: Research Summary

See [research.md](./research.md).

Key decisions:

- Use shared Zod schema for request body validation before service calls.
- Keep route handler thin and delegate creation to `ticketService.create`.
- Use standard error handling middleware for all Zod validation failures.
- Compare `dueDate` against today's date in Asia/Seoul according to API spec.

## Phase 1: Design Summary

See:

- [data-model.md](./data-model.md)
- [contracts/post-api-tickets.md](./contracts/post-api-tickets.md)
- [quickstart.md](./quickstart.md)

Post-design Constitution Check remains PASS. The design keeps validation,
route handling, service logic, and tests in their required boundaries.

## Implementation Plan

1. Add failing tests first:
   - API contract tests for minimal creation, full creation, validation errors,
     standard error envelope, and position ordering.
   - Validation schema tests for title, description, priority, date format, and
     past due date behavior.
   - Service tests for Backlog defaults and position assignment.

2. Update shared validation:
   - Ensure invalid priority returns
     `"우선순위는 LOW, MEDIUM, HIGH 중 선택해주세요"`.
   - Ensure past `dueDate` returns
     `"종료예정일은 오늘 이후 날짜를 선택해주세요"`.
   - Preserve `title` trimming/whitespace rejection and max length messages.

3. Confirm route handler behavior:
   - `POST /api/tickets` parses JSON with `createTicketSchema`.
   - Validation errors flow through `handleRouteError`.
   - Successful creation returns `NextResponse.json(ticket, { status: 201 })`.

4. Confirm service behavior:
   - Always set `status=BACKLOG`.
   - Use `priority=MEDIUM` when omitted.
   - Normalize omitted optional fields to null.
   - Set `startedAt=null`, `completedAt=null`.
   - Assign position as Backlog top using `min(position) - 1024`, while keeping
     first-ticket behavior consistent with tests and API expectations.

5. Validate:
   - `npm test -- --runInBand`
   - `npx tsc --noEmit`
   - `npm run lint`
