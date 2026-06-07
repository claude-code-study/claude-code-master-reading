# AGENTS.md - Tika Project (Ticket + Kanban Board)

## 프로젝트 개요
Tika는 티켓 기반 칸반 보드 TODO 앱이다.
사용자는 티켓을 생성하고 Backlog, TODO, In Progress, Done 칼럼에서 상태와 순서를 관리한다.

Next.js 15 App Router 기반의 풀스택 애플리케이션이며, 프런트엔드와 백엔드는 디렉터리 수준에서 분리한다.
`src/shared/`에서 타입, 상수, 검증 스키마를 공유한다.

## 프로젝트 구조
- `src/app`: Next.js App Router, 페이지와 레이아웃
- `src/app/api`: 백엔드 진입점. Route Handler는 요청 파싱, 서비스 호출, 응답 반환만 담당
- `src/server`: 백엔드 로직. services, db, middleware
- `src/server/db`: Drizzle 스키마, DB 연결, seed
- `src/client`: 프런트엔드 로직. components, hooks, api
- `src/shared`: 프런트엔드/백엔드 공유 타입, 검증 스키마, 상수
- `__tests__`: Jest 테스트
- `drizzle`: Drizzle migration 산출물
- `.specify`: Spec Kit / SDD 워크플로 설정과 템플릿

## 기술 스택
- Framework: Next.js 15 App Router
- UI: React 19
- Language: TypeScript strict mode
- Styling: Tailwind CSS 4
- Drag and Drop: `@dnd-kit/core`, `@dnd-kit/sortable`
- ORM: Drizzle ORM
- Database: 로컬 PostgreSQL, `postgres` 드라이버, `DATABASE_URL`
- Validation: Zod
- Test: Jest, React Testing Library, `@testing-library/jest-dom`
- Package manager: npm

## 명세 문서 경로
구현 전 관련 명세를 반드시 확인한다.

- 프로젝트 constitution: `.specify/memory/constitution.md`
- 제품 요구사항: `docs/PRD.md`
- 기술 요구사항: `docs/TRD.md`
- 상세 요구사항: `docs/REQUIREMENTS.md`
- API 명세: `docs/API_SPEC.md`
- 데이터 모델: `docs/DATA_MODEL.md`
- 컴포넌트 명세: `docs/COMPONENT_SPEC.md`
- 테스트 케이스: `docs/TEST_CASES.md`
- 프런트엔드 작업 목록: `docs/FRONTEND_TASKS.md`
- SDD 산출물: `specs/<feature>/spec.md`, `specs/<feature>/plan.md`, `specs/<feature>/tasks.md`

## 코딩 컨벤션
### Constitution 준수
- `.specify/memory/constitution.md`는 구현 규칙의 최상위 기준이다.
- TypeScript strict 모드는 필수다.
- API 응답은 `docs/API_SPEC.md`의 형식을 정확히 따른다.
- 에러 응답은 `{ "error": { "code": "...", "message": "..." } }` 형식만 사용한다.
- 모든 API 요청 body, route parameter, query parameter는 Zod로 검증한다.
- 비즈니스 로직은 `src/server/services/`에 분리한다.
- Guardrails 절대 준수: constitution의 금지 DB/Git/npm/파일시스템 명령은 실행하지 않는다.
- 파괴적 작업은 실행 전 사용자 확인과 백업/복구 방법 안내가 필요하다.

### TypeScript
- `strict` 모드를 유지한다.
- `@/*` 경로 별칭은 `src/*`를 가리킨다.
- 공유 타입과 검증 스키마는 가능한 한 `src/shared/`에 둔다.
- 명세에 없는 타입, 상태, API 필드를 임의로 추가하지 않는다.

### 백엔드
- 대상 디렉터리: `src/app/api`, `src/server`
- Route Handler는 얇게 유지한다: 요청 파싱 -> 서비스 호출 -> 응답 반환.
- 비즈니스 로직은 `src/server/services/`에 둔다.
- DB 스키마 변경은 `docs/DATA_MODEL.md`, `src/server/db/schema.ts`, `drizzle/` migration을 함께 고려한다.
- 로컬 DB 연결은 `DATABASE_URL`과 `postgres` 드라이버를 사용한다.

### 프런트엔드
- 대상 디렉터리: `src/client`, `src/app/(board)`
- 함수 컴포넌트와 화살표 함수를 사용한다.
- UI 동작은 사용자 시나리오와 컴포넌트 명세를 기준으로 구현한다.
- API 호출 코드는 `src/client/api/`에 둔다.

### 경계 규칙
- 백엔드 작업만 요청된 경우 `src/client/`를 수정하지 않는다.
- 프런트엔드 작업만 요청된 경우 `src/server/`와 `src/app/api/`를 수정하지 않는다.
- 경계를 넘는 변경이 필요한 경우 먼저 이유를 명확히 한다.

## SDD 워크플로 규칙
새 기능 또는 동작 변경은 Spec Driven Development 흐름을 따른다.

1. Specify
   - 요구사항을 먼저 명세한다.
   - 기존 문서와 충돌하면 구현보다 명세 정리를 우선한다.
   - 모호한 요구사항은 구현 전에 확인하거나 합리적 가정을 명시한다.

2. Plan
   - 구현 계획은 관련 명세, 영향 범위, 데이터 모델, API 계약, 테스트 전략을 포함해야 한다.
   - 백엔드/프런트엔드/공유 코드 경계를 계획 단계에서 확정한다.

3. Tasks
   - 작업은 의존성 순서대로 나누고, 각 작업은 검증 방법을 가져야 한다.
   - 테스트 작업은 구현 작업보다 앞선다.

4. Implement
   - 새 기능 구현 전 `docs/TEST_CASES.md` 또는 feature `tasks.md`에 대응하는 테스트를 먼저 작성한다.
   - Red -> Green -> Refactor 순서를 따른다.
   - 명세에 없는 기능은 추가하지 않는다.

5. Validate
   - 변경 범위에 맞는 검증을 수행한다.
   - 기본 검증: `npm test`, `npx tsc --noEmit`, `npm run lint`
   - DB 변경 검증: `npm run drizzle:generate`, `npm run drizzle:migrate`
   - 검증하지 못한 항목은 이유를 남긴다.

## 개발 규칙
### 반드시 지켜야 할 것
- 구현 전 관련 명세와 테스트 케이스를 확인한다.
- 새 기능은 테스트를 먼저 작성한다.
- API, 타입, DB 스키마 변경은 관련 문서를 함께 확인한다.
- 사용자 변경사항이나 기존 미커밋 변경사항을 임의로 되돌리지 않는다.

### 하지 말아야 할 것
- 명세에 없는 기능을 임의로 추가하지 않는다.
- 관련 없는 리팩터링이나 포맷 변경을 섞지 않는다.
- 프런트엔드와 백엔드 경계를 이유 없이 넘나들지 않는다.

<!-- SPECKIT START -->
For additional context about technologies to be used, project structure,
shell commands, and other important information, read the current plan.
If a feature-specific SDD plan exists, prefer `specs/<feature>/plan.md`.
<!-- SPECKIT END -->
