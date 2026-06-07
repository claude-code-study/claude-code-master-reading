# Tasks: Ticket Creation API

**Input**: Design documents from `/specs/001-create-ticket-api/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/post-api-tickets.md, quickstart.md

**Tests**: Required. This feature follows the project TDD rule and maps to `docs/TEST_CASES.md` section `TC-API-001`.

**Organization**: Tasks are grouped by user story so each story can be implemented and tested independently.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel because it touches a different file or has no dependency on incomplete work
- **[Story]**: User story label from `spec.md`
- Every task includes an exact file path

## Phase 1: Setup (Shared Test Harness)

**Purpose**: Prepare focused test files before endpoint implementation changes.

- [ ] T001 Create API route test harness for POST requests in `__tests__/api/tickets.test.ts`
- [ ] T002 [P] Create validation schema test harness in `__tests__/validations/ticket.test.ts`
- [ ] T003 [P] Add isolated create-test setup notes or helpers in `__tests__/services/ticketService.test.ts`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Lock shared contracts that every user story depends on.

**Critical**: No implementation work should begin until these contract references are reflected in tests.

- [ ] T004 Add shared expected error envelope helper in `__tests__/api/tickets.test.ts`
- [ ] T005 Add shared valid ticket input factory in `__tests__/api/tickets.test.ts`
- [ ] T006 [P] Add validation message constants for ticket creation tests in `__tests__/validations/ticket.test.ts`

**Checkpoint**: Test scaffolding is ready and implementation can proceed story by story.

---

## Phase 3: User Story 1 - Create a Backlog Ticket with Required Fields (Priority: P1)

**Goal**: A user can create a ticket with only a title and receive documented defaults.

**Independent Test**: Submit `{ title: "테스트 할일" }` and verify `201`, `status=BACKLOG`, `priority=MEDIUM`, nullable optional fields, and timestamps.

### Tests for User Story 1

- [ ] T007 [P] [US1] Add API contract test for minimal ticket creation in `__tests__/api/tickets.test.ts`
- [ ] T008 [P] [US1] Add Zod test for minimal valid create input and default priority in `__tests__/validations/ticket.test.ts`
- [ ] T009 [P] [US1] Add service test for Backlog status, Medium priority, null startedAt, and null completedAt in `__tests__/services/ticketService.test.ts`

### Implementation for User Story 1

- [ ] T010 [US1] Align create ticket optional defaults and inferred input type in `src/shared/validations/ticket.ts`
- [ ] T011 [US1] Ensure `ticketService.create` applies Backlog status, Medium priority, null system dates, and timestamps in `src/server/services/ticketService.ts`
- [ ] T012 [US1] Ensure POST handler returns `201 Created` with the created ticket in `src/app/api/tickets/route.ts`

**Checkpoint**: Minimal valid ticket creation passes independently.

---

## Phase 4: User Story 2 - Create a Ticket with Full Details (Priority: P1)

**Goal**: A user can create a ticket with all documented optional fields and get those values back unchanged.

**Independent Test**: Submit a full valid request with description, HIGH priority, plannedStartDate, and dueDate; verify the response preserves every field and places the ticket at the top of Backlog.

### Tests for User Story 2

- [ ] T013 [P] [US2] Add API contract test for full-detail ticket creation in `__tests__/api/tickets.test.ts`
- [ ] T014 [P] [US2] Add Zod tests for valid priority, plannedStartDate, dueDate, and description length in `__tests__/validations/ticket.test.ts`
- [ ] T015 [P] [US2] Add service test for Backlog top position assignment across consecutive creates in `__tests__/services/ticketService.test.ts`

### Implementation for User Story 2

- [ ] T016 [US2] Ensure date string validation accepts documented `YYYY-MM-DD` values in `src/shared/validations/ticket.ts`
- [ ] T017 [US2] Ensure `ticketService.create` preserves description, priority, plannedStartDate, and dueDate in `src/server/services/ticketService.ts`
- [ ] T018 [US2] Ensure `ticketService.create` assigns new Backlog tickets above existing Backlog tickets in `src/server/services/ticketService.ts`

**Checkpoint**: Full-detail valid ticket creation passes independently.

---

## Phase 5: User Story 3 - Reject Invalid Ticket Creation Requests (Priority: P1)

**Goal**: Invalid ticket creation requests are rejected with the documented validation messages and standard error envelope.

**Independent Test**: Submit each invalid `TC-API-001` request and verify HTTP 400, `VALIDATION_ERROR`, the documented message, and no ticket creation.

### Tests for User Story 3

- [ ] T019 [P] [US3] Add API tests for missing, empty, whitespace-only, and over-200-character titles in `__tests__/api/tickets.test.ts`
- [ ] T020 [P] [US3] Add API tests for over-1000-character description, invalid priority, and past dueDate in `__tests__/api/tickets.test.ts`
- [ ] T021 [P] [US3] Add Zod validation tests for title, description, priority, date format, and past dueDate messages in `__tests__/validations/ticket.test.ts`
- [ ] T022 [P] [US3] Add API test proving validation failure does not call ticket creation service in `__tests__/api/tickets.test.ts`

### Implementation for User Story 3

- [ ] T023 [US3] Set priority enum validation message to the API spec text in `src/shared/validations/ticket.ts`
- [ ] T024 [US3] Add Asia/Seoul today-or-later dueDate validation in `src/shared/validations/ticket.ts`
- [ ] T025 [US3] Ensure Zod validation failures return `{ error: { code, message } }` from `src/server/middleware/errorHandler.ts`
- [ ] T026 [US3] Ensure POST handler validates before invoking `ticketService.create` in `src/app/api/tickets/route.ts`

**Checkpoint**: All invalid create requests fail with documented errors and no mutation.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Verify contract fidelity and guard against regressions.

- [ ] T027 Verify `POST /api/tickets` response fields against `specs/001-create-ticket-api/contracts/post-api-tickets.md`
- [ ] T028 Run focused test suite for ticket creation with `npm test -- --runInBand __tests__/api/tickets.test.ts`
- [ ] T029 Run validation tests with `npm test -- --runInBand __tests__/validations/ticket.test.ts`
- [ ] T030 Run service tests with `npm test -- --runInBand __tests__/services/ticketService.test.ts`
- [ ] T031 Run full Jest suite with `npm test -- --runInBand`
- [ ] T032 Run TypeScript strict check with `npx tsc --noEmit`
- [ ] T033 Run lint check with `npm run lint`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies.
- **Foundational (Phase 2)**: Depends on Phase 1. Blocks all user stories.
- **US1 (Phase 3)**: Depends on Phase 2. Establishes minimal successful creation.
- **US2 (Phase 4)**: Depends on Phase 2 and can run after or alongside US1 once shared test harness exists, but service position assertions are easier after US1 defaults are stable.
- **US3 (Phase 5)**: Depends on Phase 2. Can run alongside US1/US2 after shared error helpers exist.
- **Polish (Phase 6)**: Depends on all target user stories.

### User Story Dependencies

- **US1**: Independent minimal creation path.
- **US2**: Independent full-detail creation path; shares endpoint/schema/service files with US1.
- **US3**: Independent validation failure path; shares endpoint/schema/error middleware with US1/US2.

### Within Each User Story

- Tests MUST be written first and fail before implementation.
- Validation schema changes precede route handler verification.
- Service behavior changes stay in `src/server/services/ticketService.ts`.
- Route handler remains thin and only handles parsing, validation, service call, and response.

---

## Parallel Opportunities

- T002 and T003 can run in parallel with T001.
- T006 can run in parallel with T004 and T005.
- T007, T008, and T009 can run in parallel.
- T013, T014, and T015 can run in parallel.
- T019, T020, T021, and T022 can run in parallel.
- US1, US2, and US3 test-writing can be split across agents after Phase 2, but implementation tasks touch shared files and should be serialized carefully.

---

## Parallel Example: User Story 3

```bash
# Work can be assigned in parallel because these are test-only tasks:
Task: "T019 Add API title validation tests in __tests__/api/tickets.test.ts"
Task: "T021 Add Zod validation tests in __tests__/validations/ticket.test.ts"
Task: "T022 Add no-service-call mutation guard in __tests__/api/tickets.test.ts"
```

---

## Implementation Strategy

### MVP First

1. Complete Phase 1 and Phase 2.
2. Complete US1 to prove the endpoint can create a minimal Backlog ticket.
3. Run `npm test -- --runInBand __tests__/api/tickets.test.ts`.

### Contract Completion

1. Complete US2 to cover full valid input and position behavior.
2. Complete US3 to cover all invalid input cases from `TC-API-001`.
3. Run the full verification set in Phase 6.

### Guardrails

- Do not run destructive DB, Git, npm, or filesystem commands.
- Do not reset or delete database contents to make tests pass.
- If test isolation requires state control, use scoped test helpers or module isolation rather than destructive database operations.
