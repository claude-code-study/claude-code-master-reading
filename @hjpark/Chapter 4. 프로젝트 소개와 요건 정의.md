# Chapter 4. 프로젝트 소개와 요건 정의

> 대상 독자: Lead SQA Engineer 스터디용 요약본  
> 원본: Claude Code Expert 도서 4장 (4.1 ~ 4.5)

---

## 4.1 ~ 4.2 기술 스택 선정과 요건 정의

### 핵심 주제

풀스택 TODO 앱(칸반 보드 스타일) 개발을 위한 **기술 스택 선정**과 **요건 정의**

---

### 기술 스택 선정 기준

AI 친화성, 타입 안정성, 배포 용이성 세 가지가 핵심 기준이다.

**프론트엔드: React + TypeScript**

TypeScript의 타입 시스템이 AI 코딩에서 특히 유리하다.  
인터페이스를 선언하면 AI가 코드 구조를 100% 확신하고 생성할 수 있고, IDE에서 오타/타입 오류를 즉시 잡아낸다.  
JavaScript는 AI가 구조를 "추측"해야 해서 버그 발생 가능성이 높아진다.

```typescript
// TypeScript: 오류 즉시 감지
interface User {
  id: string;
  name: string;
  email: string;
}
const user = await getUser("123");
console.log(user.nmae); // ❌ IDE에서 즉시 오류 표시

// JavaScript: 런타임에서야 발견
const user = await getUser("123");
console.log(user.nmae); // 결과: undefined (원인 파악에 시간 소요)
```

**백엔드: Next.js API Routes (MVP 기준)**

프론트/백엔드를 같은 프로젝트에서 관리하고 Vercel 원클릭 배포가 가능하다.  
실시간 통신이나 독립 서비스가 필요한 경우엔 Express가 적합하다.

**데이터베이스: PostgreSQL (또는 SQLite)**

Vercel + Neon 조합이 서버리스에 최적화되어 있고, 벡터 검색과 JSON 타입까지 지원한다.  
개인 프로젝트라면 비용 절감을 위해 SQLite도 좋은 선택이다.

---

### 요건 정의 3종 세트

| 문서 | 관점 | 핵심 질문 |
|------|------|-----------|
| 기능 요구사항 (FR) | 시스템 | **무엇을** 해야 하는가 |
| 비기능 요구사항 (NFR) | 품질/제약 | **어떻게** 수행해야 하는가 |
| 사용자 스토리 (US) | 사용자 | **왜** 이 기능이 필요한가 |

**기능 요구사항 (FR) 요약**

| ID | 기능 | API 엔드포인트 |
|----|------|----------------|
| FR-001 | 티켓 생성 | POST /api/tickets |
| FR-002 | 목록 조회 | GET /api/tickets |
| FR-003 | 상세 조회 | GET /api/tickets/:id |
| FR-004 | 티켓 수정 | PATCH /api/tickets/:id |
| FR-005 | 티켓 완료 | PATCH /api/tickets/:id/complete |
| FR-006 | 티켓 삭제 | DELETE /api/tickets/:id |
| FR-007 | 상태 이동 (DnD) | PATCH /api/tickets/reorder |
| FR-008 | 일정초과 경고 | 조회 시 필드 값으로 구분 |

**비기능 요구사항 (NFR) 요약**

| ID | 항목 | 핵심 기준 |
|----|------|-----------|
| NFR-001 | 성능 | API 300ms 이하, 화면 로드 2초 이내 |
| NFR-002 | 반응형 | 모바일(360px) ~ 데스크톱(1920px) |
| NFR-003 | 접근성 | 키보드 네비게이션, 스크린 리더 |
| NFR-004 | 데이터 정합성 | 낙관적 업데이트 + 롤백 |
| NFR-005 | 브라우저 호환 | Chrome/Safari/Firefox/Edge 최신 2버전 |
| NFR-006 | 배포 | Vercel + Vercel Postgres, HTTPS |

**사용자 스토리 ↔ FR ↔ TC 매핑**

| 사용자 스토리 | 관련 FR | 관련 테스트 케이스 |
|--------------|---------|-------------------|
| US-001: 새 할 일 등록 | FR-001 | TC-API-001, TC-COMP-004 |
| US-003: 칸반 보드 현황 파악 | FR-002, FR-008 | TC-API-002, TC-COMP-002, TC-COMP-003 |
| US-005: DnD 상태 변경 | FR-005, FR-007 | TC-API-006, TC-INT-001 |
| US-007: 할 일 수정 | FR-003, FR-004 | TC-API-003, TC-API-004, TC-COMP-005 |
| US-008: 할 일 삭제 | FR-006 | TC-API-005, TC-COMP-005, TC-COMP-006 |

---

### QA 관점 포인트 (4.1~4.2)

- **RTM(추적 매트릭스)** 이 코드 작성 전에 완성됨 → 요건 변경 시 영향 테스트 케이스를 즉시 식별 가능
- **NFR-004 낙관적 업데이트 + 롤백**은 DnD 기능 테스트 시 반드시 검증해야 할 항목
- **TC-INT-002** "Done 이후 24시간 자동 삭제" 같은 시간 기반 케이스는 명세 단계에서 미리 정의됨 → 테스트 누락 리스크 감소

---

## 4.3 클로드 코드와 함께 요건 문서 작성하기

### 프로젝트 구조 확정

**Next.js API Routes 선택 이유 4가지**

1. **배포 단순화**: git push 한 번으로 프론트/백엔드 동시 배포
2. **논리적 계층 분리 가능**: `app/api/`는 서버에서만 실행, 브라우저에 미노출
3. **TypeScript 타입 공유**: `import { Ticket } from '@/shared/types'` 별도 설정 없이 즉시 사용
4. **서버리스 함수**: 미사용 API 비용 미발생 → Vercel 무료 플랜으로 커버

**기술 스택 결정표**

| 결정 사항 | 선택 | 근거 |
|-----------|------|------|
| 프로젝트 구조 | Next.js 안에서 디렉터리로 계층 분리 | 프론트/백엔드 논리적 분리 |
| 프론트엔드 | React 19 + TypeScript | 컴파일 시점 오류 감지 |
| 스타일링 | Tailwind CSS | AI가 일관된 스타일 코드 생성 용이 |
| 백엔드 | Next.js API Routes | Vercel 네이티브, CORS 불필요 |
| ORM | Drizzle ORM | 서버리스 최적화, 코드 생성 단계 불필요 |
| 데이터베이스 | Vercel Postgres (Neon) | 무료 티어, 서버리스 최적화 |
| 드래그 앤 드롭 | @dnd-kit/core | React 19 호환, 접근성 지원 |
| 검증 | Zod 4 | 프론트/백엔드 동일 스키마 공유 |
| 테스트 | Jest + React Testing Library | TDD에 적합 |
| 배포 | Vercel | git push 자동 배포 |

---

### 문서 체계 (docs/)

```
docs/
├── PRD.md            # 제품 요구사항: "무엇을" 만드는가
├── TRD.md            # 기술 요구사항: "어떻게" 만드는가
├── REQUIREMENTS.md   # FR + NFR + US 통합 명세
├── API_SPEC.md       # API 엔드포인트 명세
├── DATA_MODEL.md     # DB 스키마, ERD, 비즈니스 규칙
├── COMPONENT_SPEC.md # 컴포넌트 계층, Props, 이벤트 흐름
└── TEST_CASES.md     # TDD용 테스트 케이스 정의
```

**CLAUDE.md 핵심 추가 사항**

경계 규칙 — 백엔드 작업 시 프론트엔드 코드 수정 금지.  
같은 프로젝트 내에 있어서 물리적으로 가능하기 때문에 명시적으로 막아야 한다.

---

### PRD / TRD / REQUIREMENTS.md 작성 포인트

**PRD 프롬프트 핵심 요소**
- MVP 범위 명시 (단일 사용자, 고정 4컬럼, 티켓 CRUD, DnD)
- 2차 제외 범위 명시 (인증, 커스텀 컬럼, 멀티사용자 등)
- FR과의 매핑 명시

**TRD 주요 점검 내용**
- 아키텍처 구조: `컴포넌트 → Route Handler → Service → Drizzle → DB` 흐름 일치 여부
- 불필요한 계층 추가 여부
- 계층 간 경계 규칙 명시

**REQUIREMENTS.md 구조**
```
# Tika App - 요구사항 명세
## 1. 기능 요구사항 (FR)
## 2. 비기능 요구사항 (NFR)
## 3. 사용자 스토리 (US)
## 4. 추적 매트릭스 (US ↔ FR ↔ TC 매핑)
```

---

## 4.4 명세서 설계와 TDD 방식으로 개발 시작하기

### 4.4.1 데이터 설계

**tickets 테이블 설계**

| 컬럼 | 타입 | 제약 조건 | 기본값 | 설명 |
|------|------|-----------|--------|------|
| id | SERIAL | PK, autoincrement | — | — |
| title | VARCHAR(200) | NOT NULL | — | 티켓 제목 |
| description | TEXT | NULLABLE | NULL | 상세 설명 |
| status | VARCHAR(20) | NOT NULL | 'BACKLOG' | 현재 상태 |
| priority | VARCHAR(10) | NOT NULL | 'MEDIUM' | 우선순위 |
| position | INTEGER | NOT NULL | 1 | 컬럼 내 표시 순서 |
| planned_start_date | DATE | NULLABLE | NULL | 시작예정일 |
| due_date | DATE | NULLABLE | NULL | 종료예정일 |
| started_at | TIMESTAMP | NULLABLE | NULL | 시작일 (TODO 이동 시 자동) |
| completed_at | TIMESTAMP | NULLABLE | NULL | 종료일 (Done 이동 시 자동) |
| created_at | TIMESTAMP | NOT NULL | now() | 생성 시각 |
| updated_at | TIMESTAMP | NOT NULL | now() | 수정 시각 |

**비즈니스 규칙**

```
신규 티켓 생성 시     : status = BACKLOG, position = 1
TODO로 이동 시        : started_at = 현재시간 (최초 1회만, 이미 값 있으면 유지)
Done으로 이동 시      : completed_at = 현재시간
Done에서 복귀 시      : completed_at = NULL
일정초과 판정         : due_date < 오늘 AND status ≠ DONE
컬럼 내 순서 변경 시  : DnD 작업 시 해당 컬럼의 position 값 재계산
```

> **설계 주의사항**: status 필드를 PostgreSQL ENUM이 아닌 `varchar + Zod 검증`으로 처리.  
> DB 레벨 ENUM은 값 추가/변경 시 마이그레이션이 복잡해지기 때문.

---

### 4.4.2 API 설계

**공통 규칙**

```json
// 에러 응답 형식
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "제목을 입력해주세요"
  }
}
```

| HTTP 상태 코드 | 의미 |
|---------------|------|
| 200 | 조회/수정 성공 |
| 201 | 생성 성공 |
| 204 | 삭제 성공 |
| 400 | 검증 실패 |
| 404 | 리소스 없음 |
| 500 | 서버 오류 |

**POST /api/tickets 에러 케이스**

| 상태 코드 | 조건 | 에러 메시지 |
|-----------|------|-------------|
| 400 | title 누락 | 제목을 입력해주세요 |
| 400 | title 200자 초과 | 제목은 200자 이내로 입력해주세요 |
| 400 | 과거 종료예정일 | 종료예정일은 오늘 이후여야 합니다 |
| 400 | 잘못된 priority 값 | 우선순위는 LOW, MEDIUM, HIGH 중 하나여야 합니다 |

---

### 4.4.3 컴포넌트 설계

**컴포넌트 계층 구조**

```
App (page.tsx - 서버 컴포넌트)
└── BoardContainer (클라이언트, 상태 관리 + DnD 컨텍스트)
    ├── BoardHeader (검색 + 새 업무 버튼)
    ├── BacklogSidebar (좌측 사이드바)
    │   └── TicketCard × N
    ├── Board (우측 3컬럼 그리드)
    │   └── Column × 3 (TODO / In Progress / Done)
    │       └── TicketCard × N
    └── TicketModal (상세/수정 모달)
        ├── TicketDetailView
        ├── TicketForm
        └── DeleteButton ── ConfirmDialog
```

**핵심 컴포넌트 명세**

| 컴포넌트 | 책임 | 핵심 동작 |
|----------|------|-----------|
| Board | 4개 컬럼 렌더링, DnD 관리 | 드래그 시작 → 오버레이 → 드롭 → onMove 호출 → 낙관적 업데이트 |
| Column | 해당 상태 티켓 목록 렌더링 | position 순 정렬, 빈 컬럼 안내 메시지 |
| TicketCard | 개별 티켓 표시, 드래그 | 오버듀 시 빨간색 강조, 클릭 시 상세 모달 |

**이벤트 흐름**

```
[드래그 앤 드롭]
TicketCard(드래그 시작) → Board(DnD 컨텍스트) → Column(드롭)
→ Board.onReorder(id, newStatus, newPosition) → useTickets Hook
→ 낙관적 UI 업데이트 + PATCH /api/tickets/reorder

[티켓 생성]
Header("새 업무" 클릭) → TicketForm(모달) → Zod 검증
→ useTickets.create() → POST /api/tickets → 보드 갱신

[티켓 완료]
Done 컬럼으로 드래그 → PATCH /api/tickets/:id/complete → completed_at 자동 설정
```

**사용자 스토리 ↔ 컴포넌트 매핑**

| 사용자 스토리 | 주요 컴포넌트 | 사용하는 Hook |
|--------------|-------------|--------------|
| US-001: 새 할 일 등록 | TicketForm | useTickets.create |
| US-003: 칸반 보드 현황 파악 | Board, Column, TicketCard | useTickets (조회) |
| US-005: DnD 상태 변경 | Board (DnD), Column | useTickets.reorder |
| US-006: 티켓 완료 처리 | Board (DnD → Done) | useTickets.complete |
| US-007: 할 일 수정 | TicketModal | useTickets.update |
| US-008: 할 일 삭제 | TicketModal, ConfirmDialog | useTickets.remove |

---

### 4.4.4 테스트 케이스 정의

**TEST_CASES.md 구조**

```
TEST_CASES.md
├── API 테스트        (TC-API-001 ~ 008) ← 5장 백엔드
├── 컴포넌트 테스트   (TC-COMP-001 ~ 006) ← 6장 프론트엔드
└── 통합 테스트       (TC-INT-001 ~ 002) ← 6장 프론트엔드
```

**TC-API-001: 티켓 생성 API**

| # | 시나리오 | 입력 | 기대 결과 |
|---|----------|------|-----------|
| 1 | 모든 필드 포함 생성 | title, description, priority, plannedStartDate, dueDate | 201 |
| 2 | 최소 필드 생성 | title만 | 201, priority=MEDIUM, status=BACKLOG |
| 3 | 제목 누락 | title 없음 | 400, "제목을 입력해주세요" |
| 4 | 제목 200자 초과 | 201자 title | 400, "제목은 200자 이내로..." |
| 5 | 과거 종료예정일 | dueDate = 어제 | 400, "종료예정일은 오늘 이후..." |
| 6 | 잘못된 우선순위 | priority = "URGENT" | 400, 검증 에러 |

**TC-COMP-001: TicketCard 컴포넌트**

| # | 시나리오 | 조건 | 기대 결과 |
|---|----------|------|-----------|
| 1 | 기본 렌더링 | 티켓 데이터 전달 | 제목, 우선순위 뱃지, 종료예정일 표시 |
| 2 | 오버듀 표시 | due_date < 오늘, status ≠ DONE | 종료예정일 빨간색, "기한 초과" 표시 |
| 3 | 완료 상태 | status = DONE | 완료 스타일 적용 |
| 4 | 카드 클릭 | 카드 영역 클릭 | onClick 핸들러 호출 |
| 5 | 종료예정일 없음 | due_date = null | 종료예정일 영역 미표시 |

**TC-INT-001: 드래그 앤 드롭**

| # | 시나리오 | 동작 | 기대 결과 |
|---|----------|------|-----------|
| 1 | 컬럼 간 이동 (→TODO) | BACKLOG → TODO로 드래그 | reorder API 호출, started_at 자동 설정 |
| 2 | 컬럼 간 이동 (→Done) | IN_PROGRESS → Done으로 드래그 | complete API 호출, completed_at 자동 설정 |
| 3 | 컬럼 내 순서 변경 | 같은 컬럼에서 위치 변경 | reorder API 호출, position 재계산 |
| 4 | 네트워크 오류 시 롤백 | 드래그 후 API 실패 | 원래 위치로 복원 |

**TC-INT-002: 완료 후 영구 삭제**

| # | 시나리오 | 동작 | 기대 결과 |
|---|----------|------|-----------|
| 1 | Done 이동 후 표시 | Done으로 이동 | Done 컬럼에 표시, completed_at 설정 |
| 2 | Done 상태에서 수동 삭제 | 삭제 버튼 클릭 | 확인 다이얼로그 → DELETE API → 보드에서 제거 |
| 3 | 24시간 경과 후 자동 삭제 | Done 상태 24시간 유지 | 조회 시 목록에서 제외 |

**추적 매트릭스 (RTM)**

| TC ID | 관련 FR | 관련 US | 테스트 대상 |
|-------|---------|---------|-------------|
| TC-API-001 | FR-001 | US-001 | 티켓 생성 API |
| TC-API-002 | FR-002 | US-003 | 보드 조회 API |
| TC-API-004 | FR-004 | US-007 | 티켓 수정 API |
| TC-API-006 | FR-006 | US-008 | 티켓 영구 삭제 API |
| TC-API-007 | FR-007 | US-005 | 상태/순서 변경 API |
| TC-API-008 | FR-008 | US-003 | isOverdue 필드 계산 |
| TC-COMP-001 | — | US-003 | TicketCard 컴포넌트 |
| TC-INT-001 | FR-007 | US-005 | 드래그 앤 드롭 통합 |
| TC-INT-002 | FR-002, FR-005 | US-006, US-008 | completed_at+24시간 자동 삭제 |

> **활용법**: "US-005가 제대로 구현됐는지 어떻게 확인?" → "TC-API-007 + TC-INT-001 통과하면 됨"

---

### 4.4.5 TDD 개발 흐름

**TDD 3단계 사이클**

```
Red    → 실패하는 테스트 작성 (구현 코드 없음)
Green  → 테스트 통과 최소 구현 (테스트 코드 수정 금지)
Refactor → 코드 개선 (새 기능 추가 금지, 테스트 통과 유지)
```

**CLAUDE.md TDD 사이클 규칙 추가**

```markdown
### TDD 사이클 규칙
- Red 단계: 테스트 코드만 작성, 구현 코드 생성 금지
- Green 단계: 테스트를 통과하는 최소한의 코드만 작성, 테스트 코드 수정 금지
- Refactor 단계: 코드 개선만, 새 기능 추가 금지, 테스트는 반드시 통과 유지
- 테스트와 구현을 한 번에 작성하지 말 것 — 반드시 단계별로 진행
- 테스트 실패 시 구현을 수정할 것, 테스트를 수정하지 말 것 (명세 오류인 경우 명세 먼저 수정)
```

**전체 개발 사이클**

```
1. 명세 확인    → API_SPEC.md + TEST_CASES.md 교차 확인
2. Red         → 테스트 작성 (구현 코드 없음)
3. 테스트 실행  → 전부 실패 확인
4. Green       → 최소 구현 (테스트 코드 수정 금지)
5. 테스트 실행  → 전부 통과 확인
6. Refactor    → 코드 개선 (테스트 통과 유지)
7. 테스트 실행  → 전부 통과 재확인
8. 다음 기능으로 → Step 1로 돌아감
```

---

## 4.5 SDD와 Spec Kit

### SDD란 무엇인가

**SDD(Specification-Driven Development, 명세 주도 개발)**  
코드를 작성하기 전에 명세를 먼저 정의하고, 그 명세를 기반으로 개발을 진행하는 방법론.

> "명세 자체가 실행 가능한 산출물이 되어, 구현을 안내하는 데 그치지 않고 동작하는 결과물을 직접 만들어낸다." — GitHub Spec Kit

**명세의 두 가지 종류**

| 구분 | 역할 | 내용 |
|------|------|------|
| Spec (What) | 무엇을 만들 것인가 | 사용자 관점 요구사항, 유저 스토리 |
| Plan (How) | 어떻게 만들 것인가 | 기술적 구현 설계, 아키텍처 선택 |

**명세의 3가지 핵심 역할**

1. **요구사항 구체화**: 모호함 없이 필드명, 타입, 동작, 제약조건을 정의
2. **개발 가이드**: API 엔드포인트, 데이터 구조, 에러 처리 방향 제시
3. **검증 기준**: 명세와 구현이 일치하면 완료, 불일치 시 수정

**SDD 5단계 흐름**

| 단계 | 설명 | 산출물 |
|------|------|--------|
| 1. 요구사항 분석 | 사용자 요건 수집, 비즈니스 목표 정의 | 요구사항 문서 |
| 2. 명세 문서 작성 | API, 데이터 모델, 컴포넌트 설계 | spec.md, API 명세 |
| 3. 명세 리뷰 및 확정 | 팀 리뷰, 이해관계자 승인 | 확정된 명세 버전 |
| 4. 명세 기반 구현 | 명세를 AI에게 전달하여 코드 생성 | 소스 코드 |
| 5. 명세 대비 검증 | 구현이 명세와 일치하는지 확인 | 테스트 결과 리포트 |

---

### SDD vs TDD 관계

| 항목 | SDD | TDD |
|------|-----|-----|
| 관심사 | 무엇을 만드는가 | 만든 것이 동작하는가 |
| 산출물 | 명세 문서 | 테스트 코드 |
| 레이어 | What 정의 | How 검증 |

**경쟁 관계가 아니라 레이어 구조**: SDD가 What을 정의하면 TDD가 How를 검증.  
4장에서 작업한 것이 이미 SDD + TDD 결합 방식이었다.

---

### AI 시대에 명세가 더 중요한 이유

```
AI 코딩 도구 등장 전
→ 사람이 느리게 작성하면서 자연스럽게 "이 필드가 Optional이어야 할까?" 같은 질문을 스스로 검토

AI 코딩 도구 등장 후
→ 코드 생성 속도가 빨라질수록, 잘못된 방향으로 달려가는 속도도 빨라짐
→ 명세 없이 시작하면 AI가 엄청난 속도로 잘못된 구조를 쌓아 올릴 수 있음
```

**핵심**: 명세가 명확하면 AI의 추측이 제거되고 실행력만 극대화된다.

---

### Spec Kit 명령어

| 명령어 | 역할 | 사용 시점 | 산출물 |
|--------|------|-----------|--------|
| `/speckit.constitution` | 프로젝트 원칙 정의 | 프로젝트 최초 세팅 | memory/constitution.md |
| `/speckit.specify` | 요구사항 명세 작성 | 새 기능 개발 시작 전 | [feature-name]/spec.md |
| `/speckit.plan` | 기술 설계 수립 | 명세 확정 후 구현 전 | plan.md, data-model.md 등 |
| `/speckit.tasks` | 구현 태스크 분해 | 설계 완료 후 코딩 직전 | tasks.md |
| `/speckit.implement` | 태스크 실행 | 태스크 분해 완료 후 | 실제 코드 파일 |
| `/speckit.clarify` | 명세 모호함 제거 | plan 전 명세 검증 시 | spec.md에 Clarifications 추가 |
| `/speckit.analyze` | 아티팩트 간 정합성 분석 | tasks 후, implement 전 | — |
| `/speckit.checklist` | 요구사항 완전성 검증 | 품질 검증 시 | 검증 체크리스트 |

**Constitution의 역할**  
프로젝트의 불변 원칙 (코드 품질 기준, API 규칙, 아키텍처 원칙, 테스트 정책)을 정의.  
AI가 모든 작업에서 이 원칙을 최우선으로 참조 → 프로젝트 전체에 일관된 품질 기준 적용.

---

### 수동 워크플로 vs Spec Kit 선택 기준

| 항목 | 수동 TDD | Spec Kit |
|------|----------|----------|
| 문서 구조 통제 | 완전 통제 가능 | Spec Kit 템플릿 따라야 함 |
| 기존 문서 표준 | 그대로 사용 가능 | 호환 어려울 수 있음 |
| 시작 속도 | 도구 학습 없이 즉시 시작 | 설치/학습 필요 |
| 명세 작성 속도 | 느림 | 빠름 (AI 초안 생성) |
| 일관성 | 유지하기 어려움 | 표준화된 구조 보장 |
| 자동화 | 없음 | 명세 → 계획 → 태스크 → 구현 자동화 |

**선택 기준**
- 팀에 문서 표준이 있거나 개발 프로세스를 직접 체험하려면 → **수동 TDD**
- 빠르게 일관된 방법론을 적용하려면 → **Spec Kit**

---

### CLAUDE.md에 SDD + TDD 규칙 명시 예시

```markdown
## 개발 방법론: SDD + TDD

### 작업 순서
1. 명세 확인: 요청된 기능의 명세를 먼저 확인하거나 작성
2. 테스트 작성: 명세를 기반으로 실패하는 테스트 먼저 작성
3. 최소 구현: 테스트를 통과시키는 최소한의 코드 작성
4. 리팩터링: 테스트 통과 유지하며 코드 개선
5. 명세 검증: 구현이 명세와 일치하는지 최종 확인

### 필수 규칙
- 명세 없이 구현 시작 금지
- 테스트 없이 구현 완료 선언 금지
- 명세와 불일치하는 구현 금지
```

---

## 핵심 요약 (QA 관점)

| 주제 | 핵심 포인트 |
|------|-------------|
| 타입 시스템 | TypeScript로 AI 코드의 타입 오류를 컴파일 시점에 잡음 → 런타임 버그 감소 |
| RTM | US ↔ FR ↔ TC 3중 매핑을 코드 작성 전에 완성 → 요건 변경 시 영향 범위 즉시 식별 |
| 비즈니스 규칙 | DB 설계 단계에서 `started_at`, `completed_at` 자동 설정 규칙 명시 → 테스트 기준 명확 |
| NFR-004 | 낙관적 업데이트 + 롤백 (TC-INT-001 #4) → DnD 기능 테스트 필수 검증 항목 |
| SDD + TDD | SDD가 What을 정의 → TDD가 How를 검증 → 두 방법론이 레이어로 결합 |
| AI 코딩 원칙 | 명세가 명확할수록 AI의 추측이 줄어들고 실행력이 극대화됨 |
