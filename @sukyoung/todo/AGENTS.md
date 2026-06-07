# AGENTS.md - Tika Project (Ticket + Kanban Board)

## 프로젝트 개요
Tika는 티켓 기반 칸반 보드 TODO 앱이다.
Next.js App Router 기반으로, 프런트엔드와 백엔드를 디렉터리 수준에서 분리한다.
src/shared/에서 타입과 검증 스키마를 공유한다.

## 프로젝트 구조
- src/app: Next.js App Router
- src/app/api: 백엔드 진입점 (Route Handlers, 요청 파싱 + 응답만)
- src/server: 백엔드 로직 (services, db, middleware)
- src/client: 프런트엔드 로직 (components, hooks, api)
- src/shared: 프런트엔드/백엔드 공유 타입, 검증 스키마, 상수

## 기술 스택
- Framework: Next.js 15 (App Router)
- Language: TypeScript strict mode
- Styling: Tailwind CSS

## 프로젝트 문서 (반드시 참조)
- 제품 요구사항: /docs/PRD.md
- 기술 요구사항: /docs/TRD.md


## 코딩 컨벤션
### TypeScript (공통)
- strict 모드 사용

### 백엔드 (src/app/api/ + src/server/)
- Route Handler는 얇게: 요청 파싱 -> 서비스 호출 -> 응답 반환

### 프런트엔드 (src/client/)
- 함수 컴포넌트 + 화살표 함수

## 개발 규칙
### 반드시 지켜야 할 것
- 새 기능 구현 전 TEST_CASES.md의 해당 테스트부터 작성

### 하지 말아야 할 것
- 명세에 없는 기능 임의 추가 금지

### 경계 규칙
- 백엔드 작업 시 (src/app/api/, src/server/) 프런트엔드(src/client/) 코드 수정 금지

<!-- SPECKIT START -->
For additional context about technologies to be used, project structure,
shell commands, and other important information, read the current plan
<!-- SPECKIT END -->
