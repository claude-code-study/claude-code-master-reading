# Feature Specification: Ticket Creation API

**Feature Branch**: `001-create-ticket-api`

**Created**: 2026-06-07

**Status**: Draft

**Input**: User description: "API_SPEC.md의 POST /api/tickets 명세를 확인하고 구현에 필요한 요구사항을 정리"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Create a Backlog Ticket with Required Fields (Priority: P1)

A user creates a new ticket by providing only a title. The created ticket appears
as a Backlog item with default values applied.

**Why this priority**: This is the smallest useful ticket creation flow and the
baseline for all ticket-based board workflows.

**Independent Test**: Submit a ticket with only a valid title and verify the
created ticket contains the provided title, Backlog status, Medium priority, and
empty optional date/system fields where specified.

**Acceptance Scenarios**:

1. **Given** no request fields except a valid title, **When** the user creates a ticket, **Then** the system returns a created ticket with status `BACKLOG` and priority `MEDIUM`.
2. **Given** the ticket is newly created, **When** the response is returned, **Then** `startedAt` and `completedAt` are null.
3. **Given** the ticket is newly created, **When** the response is returned, **Then** `createdAt` and `updatedAt` are present as timestamps.

---

### User Story 2 - Create a Ticket with Full Details (Priority: P1)

A user creates a new ticket with title, description, priority, planned start
date, and due date. The created ticket reflects every accepted field exactly.

**Why this priority**: Full-detail ticket creation is required for users to plan
and prioritize work from the start.

**Independent Test**: Submit a valid full-detail ticket and verify every
provided field is preserved in the created ticket response.

**Acceptance Scenarios**:

1. **Given** a valid title, description, priority, planned start date, and due date, **When** the user creates a ticket, **Then** the response includes those same values.
2. **Given** existing tickets in Backlog, **When** another ticket is created, **Then** the new ticket is positioned at the top of Backlog.

---

### User Story 3 - Reject Invalid Ticket Creation Requests (Priority: P1)

A user receives a clear validation error when ticket creation input does not
meet the documented constraints.

**Why this priority**: Invalid input must not create malformed tickets or break
board state.

**Independent Test**: Submit each invalid request case from `TC-API-001` and
verify the response uses the documented validation error code and message.

**Acceptance Scenarios**:

1. **Given** the title is missing, empty, or only whitespace, **When** the user creates a ticket, **Then** the system rejects the request with message "제목을 입력해주세요".
2. **Given** the title exceeds 200 characters, **When** the user creates a ticket, **Then** the system rejects the request with message "제목은 200자 이내로 입력해주세요".
3. **Given** the description exceeds 1000 characters, **When** the user creates a ticket, **Then** the system rejects the request with message "설명은 1000자 이내로 입력해주세요".
4. **Given** the priority is not LOW, MEDIUM, or HIGH, **When** the user creates a ticket, **Then** the system rejects the request with message "우선순위는 LOW, MEDIUM, HIGH 중 선택해주세요".
5. **Given** the due date is before today in Asia/Seoul, **When** the user creates a ticket, **Then** the system rejects the request with message "종료예정일은 오늘 이후 날짜를 선택해주세요".

### Edge Cases

- Title values containing only whitespace are treated as missing.
- Optional fields omitted from the request are returned as documented defaults or null values.
- A due date equal to today is accepted because the specification rejects only past due dates.
- Multiple Backlog tickets must keep deterministic ordering, with the newest created ticket placed above older Backlog tickets.
- Validation failures must not create a ticket.

### API Contract Requirements *(include if feature touches API)*

- Endpoint behavior MUST match `docs/API_SPEC.md` exactly for route, method,
  status code, request shape, response shape, and field names.
- Error responses MUST use `{ "error": { "code": "...", "message": "..." } }`.
- Request body validation MUST cover title, description, priority,
  plannedStartDate, and dueDate before business logic runs.
- Business behavior exposed by the API MUST be implemented in
  `src/server/services/`, not directly inside route handlers.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST allow creation of a ticket with a required title.
- **FR-002**: System MUST accept optional description, priority, planned start date, and due date fields when they satisfy documented constraints.
- **FR-003**: System MUST set every newly created ticket status to `BACKLOG`.
- **FR-004**: System MUST default priority to `MEDIUM` when priority is omitted.
- **FR-005**: System MUST default description, planned start date, due date, startedAt, and completedAt to null when omitted or system-initialized as null.
- **FR-006**: System MUST place the new ticket at the top of Backlog by assigning a position lower than the current minimum Backlog position.
- **FR-007**: System MUST set createdAt and updatedAt when a ticket is created.
- **FR-008**: System MUST return the created ticket with the response fields documented for `POST /api/tickets`.
- **FR-009**: System MUST reject missing, empty, whitespace-only, or over-length titles with the documented validation error response.
- **FR-010**: System MUST reject descriptions longer than 1000 characters with the documented validation error response.
- **FR-011**: System MUST reject priorities outside LOW, MEDIUM, and HIGH with the documented validation error response.
- **FR-012**: System MUST reject due dates earlier than today's date in Asia/Seoul with the documented validation error response.
- **FR-013**: System MUST validate plannedStartDate and dueDate as date strings in `YYYY-MM-DD` format.
- **FR-014**: System MUST use the standard error envelope for every validation failure.
- **FR-015**: System MUST not create a ticket when validation fails.

### Key Entities *(include if feature involves data)*

- **Ticket**: A board item representing a unit of work. Key attributes include title, description, status, priority, position, planned start date, due date, startedAt, completedAt, createdAt, and updatedAt.
- **Validation Error**: A rejected ticket creation request represented by an error code and user-readable message.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of valid minimal ticket creation attempts return a created Backlog ticket with documented defaults.
- **SC-002**: 100% of valid full-detail ticket creation attempts return all accepted user-provided fields unchanged.
- **SC-003**: 100% of invalid inputs listed in `TC-API-001` are rejected with the documented validation message and do not create a ticket.
- **SC-004**: Users can create a valid ticket in a single request and immediately receive all fields needed to render it on the board.
- **SC-005**: Repeated ticket creation keeps Backlog ordering predictable, with the newest ticket shown first.

## Assumptions

- The MVP has no authentication and creates tickets for a single-user board.
- The source of truth for request and response shape is `docs/API_SPEC.md`.
- Date comparisons for dueDate use Asia/Seoul as documented in `docs/API_SPEC.md`.
- The relevant test coverage is `docs/TEST_CASES.md` section `TC-API-001`.
