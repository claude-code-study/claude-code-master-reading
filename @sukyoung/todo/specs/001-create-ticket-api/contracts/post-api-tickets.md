# Contract: POST /api/tickets

Source of truth: `docs/API_SPEC.md` section `POST /api/tickets`.

## Request

```http
POST /api/tickets
Content-Type: application/json
```

### Body

```json
{
  "title": "API 설계 문서 작성",
  "description": "REST API 엔드포인트와 요청/응답 형식을 정의한다",
  "priority": "HIGH",
  "plannedStartDate": "2026-02-10",
  "dueDate": "2026-02-15"
}
```

| Field | Required | Rule |
|-------|----------|------|
| title | yes | 1-200 chars, whitespace-only invalid |
| description | no | max 1000 chars |
| priority | no | LOW, MEDIUM, or HIGH; defaults to MEDIUM |
| plannedStartDate | no | `YYYY-MM-DD`; defaults to null |
| dueDate | no | `YYYY-MM-DD`, today or later; defaults to null |

## Success Response

```http
201 Created
Content-Type: application/json
```

```json
{
  "id": 1,
  "title": "API 설계 문서 작성",
  "description": "REST API 엔드포인트와 요청/응답 형식을 정의한다",
  "status": "BACKLOG",
  "priority": "HIGH",
  "position": -1024,
  "plannedStartDate": "2026-02-10",
  "dueDate": "2026-02-15",
  "startedAt": null,
  "completedAt": null,
  "createdAt": "2026-02-01T09:00:00.000Z",
  "updatedAt": "2026-02-01T09:00:00.000Z"
}
```

## Validation Error Response

```http
400 Bad Request
Content-Type: application/json
```

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "제목을 입력해주세요"
  }
}
```

## Required Validation Messages

| Condition | Message |
|-----------|---------|
| title missing | `제목을 입력해주세요` |
| title empty | `제목을 입력해주세요` |
| title whitespace only | `제목을 입력해주세요` |
| title longer than 200 chars | `제목은 200자 이내로 입력해주세요` |
| description longer than 1000 chars | `설명은 1000자 이내로 입력해주세요` |
| priority not LOW/MEDIUM/HIGH | `우선순위는 LOW, MEDIUM, HIGH 중 선택해주세요` |
| dueDate before today | `종료예정일은 오늘 이후 날짜를 선택해주세요` |

## Test Mapping

- `TC-API-001` in `docs/TEST_CASES.md`
- API contract tests in `__tests__/api/tickets.test.ts`
- Validation tests in `__tests__/validations/ticket.test.ts`
- Service tests in `__tests__/services/ticketService.test.ts`
