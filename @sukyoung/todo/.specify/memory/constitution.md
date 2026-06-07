<!--
Sync Impact Report
Version change: template -> 1.0.0
Modified principles:
- Template placeholders -> I. TypeScript Strictness
- Template placeholders -> II. API Specification Fidelity
- Template placeholders -> III. Standard Error Envelope
- Template placeholders -> IV. Zod Request Validation
- Template placeholders -> V. Service-Layer Business Logic
Added sections:
- Technical Constraints
- Development Workflow
Removed sections:
- None
Templates requiring updates:
- ✅ .specify/templates/plan-template.md
- ✅ .specify/templates/spec-template.md
- ✅ .specify/templates/tasks-template.md
Runtime guidance:
- ✅ AGENTS.md
Follow-up TODOs:
- None
-->
# Tika Constitution

## Core Principles

### I. TypeScript Strictness
All production code, tests, and shared contracts MUST compile under TypeScript
strict mode. Implementations MUST preserve `strict: true` in `tsconfig.json`
and MUST NOT introduce untyped escape hatches such as broad `any`, unsafe casts,
or unchecked nullable access unless the exception is localized and justified.

Rationale: Tika shares API, UI, validation, and database contracts across a
single Next.js codebase. Strict TypeScript keeps those contracts enforceable
before runtime.

### II. API Specification Fidelity
All API endpoints MUST follow `docs/API_SPEC.md` exactly for routes, methods,
status codes, request shapes, response shapes, and field names. Any API behavior
that conflicts with `docs/API_SPEC.md` is non-compliant until the specification
is amended through the SDD workflow.

Rationale: The API specification is the source of truth for frontend/backend
integration and for contract testing.

### III. Standard Error Envelope
Every API error response MUST use the exact JSON envelope:

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable message"
  }
}
```

Route handlers and middleware MUST NOT return alternative error shapes such as
plain strings, top-level `message`, or framework-default HTML/stack responses.

Rationale: A single error envelope keeps client handling predictable and makes
validation, not-found, and server errors testable through one contract.

### IV. Zod Request Validation
Every API request body, route parameter, and query parameter accepted by the
application MUST be validated with Zod before reaching business logic. Shared
validation schemas SHOULD live in `src/shared/validations/` when they are useful
to both frontend and backend code.

Validation failures MUST return HTTP 400 using the standard error envelope.

Rationale: Zod gives one executable contract for request validation and keeps
invalid input out of service-layer logic.

### V. Service-Layer Business Logic
Business logic MUST be implemented in `src/server/services/`. Files under
`src/app/api/` MUST stay thin and limit themselves to request parsing,
validation, service calls, and response construction.

Route handlers MUST NOT embed ticket workflow rules, database orchestration, or
cross-field business decisions directly.

Rationale: Service-layer separation keeps API transport concerns independent
from domain behavior and makes backend logic testable without HTTP plumbing.

## Technical Constraints

- The project MUST use Next.js App Router with TypeScript strict mode.
- Backend code MUST respect the directory boundaries in `AGENTS.md`.
- API contracts MUST be checked against `docs/API_SPEC.md` before
  implementation.
- Request validation schemas MUST be kept in sync with API and shared type
  changes.
- Database schema changes MUST consider `docs/DATA_MODEL.md`,
  `src/server/db/schema.ts`, and Drizzle migrations together.

## Development Workflow

- SDD order is mandatory for new features and behavior changes:
  Specify -> Plan -> Tasks -> Implement -> Validate.
- The plan phase MUST include a Constitution Check covering all five core
  principles.
- Task generation MUST include explicit tasks for API contract conformance,
  standard error responses, Zod validation, and service-layer placement whenever
  a feature touches backend behavior.
- Implementation MUST not proceed when the Constitution Check has unresolved
  violations.
- Validation SHOULD include `npm test`, `npx tsc --noEmit`, and `npm run lint`.
  DB changes SHOULD additionally run `npm run drizzle:generate` and
  `npm run drizzle:migrate`.

## Governance

This constitution supersedes conflicting implementation habits, generated
templates, and local agent guidance. Project documents such as `AGENTS.md`,
Spec Kit templates, and feature plans MUST be updated when this constitution is
amended.

Amendments require:
- A documented rationale for the change.
- A semantic version bump.
- A Sync Impact Report in this file.
- Review of dependent templates and runtime guidance.

Versioning policy:
- MAJOR: Removes or redefines an existing principle in a backward-incompatible
  way.
- MINOR: Adds a new principle or materially expands governance requirements.
- PATCH: Clarifies wording without changing compliance obligations.

Compliance review is required during planning and before implementation. Any
deviation MUST be documented in the feature plan with a reason and mitigation.

**Version**: 1.0.0 | **Ratified**: 2026-06-07 | **Last Amended**: 2026-06-07
