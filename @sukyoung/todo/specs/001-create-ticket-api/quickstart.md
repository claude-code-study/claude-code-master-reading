# Quickstart: Ticket Creation API

## Prerequisites

- Local PostgreSQL is running and `DATABASE_URL` is set in `.env.local`.
- Migrations have been applied with `npm run drizzle:migrate`.

## Development Steps

1. Read the contract:

   ```bash
   sed -n '1,220p' specs/001-create-ticket-api/contracts/post-api-tickets.md
   ```

2. Write failing tests first:

   ```bash
   npm test -- --runInBand __tests__/api/tickets.test.ts
   npm test -- --runInBand __tests__/validations/ticket.test.ts
   npm test -- --runInBand __tests__/services/ticketService.test.ts
   ```

3. Implement validation, route handling, and service behavior.

4. Run focused verification:

   ```bash
   npm test -- --runInBand
   ```

5. Run final verification:

   ```bash
   npx tsc --noEmit
   npm run lint
   ```

## Manual API Check

Start the app:

```bash
npm run dev
```

Create a ticket:

```bash
curl -i \
  -H 'Content-Type: application/json' \
  -d '{"title":"API 설계 문서 작성","priority":"HIGH","plannedStartDate":"2026-02-10","dueDate":"2026-02-15"}' \
  http://localhost:3000/api/tickets
```

Expected:

- HTTP status `201`
- JSON body contains `status: "BACKLOG"`
- JSON body contains `priority: "HIGH"`
- JSON body contains `startedAt: null` and `completedAt: null`

Check validation:

```bash
curl -i \
  -H 'Content-Type: application/json' \
  -d '{"title":"   "}' \
  http://localhost:3000/api/tickets
```

Expected:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "제목을 입력해주세요"
  }
}
```
