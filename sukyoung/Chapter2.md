클로드 코드의 편집 모드

개발을 시작하기에 앞서 요건 정의나 소스 분석을 할 때 Plan 모드로 먼저 접근한다. 그 뒤, 기능 개발에 필요한 몇가지를 확인한 뒤 Edit Auto 모드 혹은 Ask 모드를 선택해 진행을 이어 나가는 것이 일반적이다.

### 클로드 모델 계열 이해하기

앤트로픽은 세 가지 모델 계열을 제공하며, 각각 고유한 특성과 용도를 가지고 있다.

- Opus: 가장 뛰어난 지능을 갖춘 시니어 아키텍트
- Sonnet: 균형 잡힌 성능으로 일상 업무를 처리하는 실무 개발자
- Haiku: 빠른 속도로 간단한 작업을 처리하는 민첩한 팀원

> ※ 책 집필 시점 기준으로 Opus 4.6 / Sonnet 4.6 / Haiku 4.5 기준으로 기술됨. 현재 Opus 4.7 등 최신 버전이 출시되어 있으므로 최신 모델은 [공식 문서](https://code.claude.com/docs/en/model-config) 참고.

⇒ 비용이 높은 Opus의 경우 설계나 분석 등 비교적 큰 작업(Plan)모드에 적용한 뒤, 구현은 Sonnet으로 하거나, 빠르게 프로토타이핑을 해야 할 경우 Haiku를 사용한다.

작업 중간에 각 단계에서 사용하는 **모델을 변경**하면 효율적으로 사용할 수 있다.

1. 세션 중 명령어로 변경

작업 중 언제든지 모델을 전환할 수 있다.

```jsx
# 현재 모델 확인 명령어
/model

# 모델 전환 선택
/model Default (recommended)
/model Sonnet
/model Haiku

# 현재 모델의 상세 확인
/status

 Version:          2.1.139
  Session name:     /rename to add a name
  Session ID:       7b7d2a8b-6810-416d-a56b-e606bdc752f0
  cwd:              /Users/ga/Workspace/skillflo-web
  Login method:     Claude Pro account
  Organization:     sukyoung.shin@day1company.co.kr's Organization
  Email:            sukyoung.shin@day1company.co.kr

  Model:            Default (Sonnet 4.6 · Best for everyday tasks)
  IDE:              Connected to Visual Studio Code extension
  MCP servers:      2 connected, 1 need auth, 1 disabled · /mcp
  Setting sources:  User settings, Project local settings
  ...
```

1. 시작 시 플래그로 지정

특정 모델로 세션을 시작하고 싶을때 사용한다. → 코드리뷰할땐 XX모델을 사용해. 

```jsx
# Sonnet으로 시작
claude --model sonnet

# Opus로 시작
claude --model claude-opus
```

1. 환경 변수로 기본값 설정

항상 특정 모델을 기본으로 사용하고 싶을 때 설정하는 방법 (ex. 새로 업데이트한 클로드 모델이 느리다거나 버그가 있는 경우에 직전 모델로 고정해서 작업을 할 수 있다)

```jsx
# ~/.bashrc 또는 ~/.zshrc에 추가
export ANTHROPIC_MODEL="claude-sonnet-4-5-20250929"
```

우선순위는 세션 중 명령어 > 시작 플래그 > 환경 변수 > 설정 파일 순이다.

### 성능 vs 비용 (trade off)

🔽 SWE-bench 리더보드 화면

[Screenshot 2026-05-12 at 12.15.16 PM.png](attachment:fc56aec3-d511-4d31-9e4b-5d65bea4b909:Screenshot_2026-05-12_at_12.15.16_PM.png)

SWE-bench란 깃허브에서 수집한 실제 소프트웨어 문제를 기반으로 LLM을 평가하는 벤치마크 도구이https://www.swebench.com/

→ 표를 토대로, 대부분의 일상 개발 작업에는 Sonnet 4.6을, 가장 깊은 추론이나 멀티에이전트 조율이 필요한 경우에만 Opus 4.6을 선택하면 된다.

컨텍스트 윈도우 크기

- Opus 4.6과 Sonnet 4.6은 기본 20만 토큰의 컨텍스트 윈도우를 제공, 베타로 100만(1M) 토큰까지 확장할 수 있다.
- Haiku 4.5는 기존과 동일한 20만 토큰을 지원한다.

### 꼭 알아야 할 필수 명령어 (p85~)

1. `/init` : [CLAUDE.md](http://CLAUDE.md) 문서 생성 (Best Practice는 하단을 참고한다)
- CLAUDE.md에 포함되는 내용
    - 빌드/테스트/린트 명령어
    - 프로젝트 아키텍처 개요
    - 코딩 컨벤션 및 주요 디렉터리 구조
- [CLAUDE.md](http://CLAUDE.md) 문서를 생성하면 클로드 코드가 다음을 수행한다
    - 프로젝트 구조 분석: 현재 디렉터리의 파일과 폴더 구조를 스캔
    - [CLAUDE.md](http://CLAUDE.md) 생성: 프로젝트의 컨텍스트를 담은 설정 파일을 자동 생성
    - 기술 스택 파악: package.json 등을 읽어 사용 중인 언어와 프레임워크를 인식
    - 컨벤션 추론: 기존 코드 스타일, 디렉터리 구조, 네이밍 패턴 등을 파악
- CLAUDE.md가 있을때의 이점
    - 반복 설명 불필요: 매번 ‘이 프로젝트는 TypeScript를 쓰고…’라고 말할 필요 없음
    - 일관된 응답: 프로젝트 컨벤션에 맞는 코드 생성
    - 팀 공유 기능: 깃에 커밋하면 팀원 모두가 같은 컨텍스트 공유

1. `/compact` : 컨텍스트 압축

대화가 길어지면 윈도우가 가득 차서 이전 내용을 잊어버리게 된다. 컨텍스트가 길어질수록 클로드가 느려지거나 오동작 하는 상황이 벌어지게 되는데, 이때 쓰면 유용하다.

다음과 같은 경우에 사용한다.

- 긴 작업 중 ‘context window full’ 경고가 나타날 때
- 대화가 길어져 응답 품질이 떨어질 때
- 특정 주제에 집중하고 싶을 때

1. `/context` : 현재 세션의 윈도우 상태 시각화

현재 세션의 토큰 사용량이나 대화 요소별 상태들을 모니터링할 수 있는 명령어다.

다음과 같은 경우에 사용한다.

- 현재 사용 중인 모델의 버전
- 현재 소비한 토큰 / 전체 가용 토큰
- 자동 압축(auto-compact) 트리거까지 얼마나 남았는지
- MCP에서 호출되는 토큰 소비량

**그 외 자주 사용하는 명령어**

| 명령어 | 설명 |
| --- | --- |
| /add-dir | 추가 작업 디렉터리 지정. 여러 폴더인 경우 클로드가 접근할 경로 추가 |
| /memory | [CLAUDE.md](http://CLAUDE.md) 메모리 파일 편집. 프로젝트 정보 추가/수정 |
| /model | AI 모델 선택/변경, /model sonnet, /model opus, /model haiku 등 |
| /plan | Plan 모드 진입. 코드 수정 없이 계획·분석만 수행할 때 사용 |
| /effort | 추론 강도 조절. 복잡도에 따라 모델이 사용하는 연산량을 제어 |
| /permissions | 파일 접근·명령 실행 등 승인 규칙 설정 |
| /agents | 서브에이전트 구성 및 설정 |
| /btw | 작업 흐름을 끊지 않고 짧은 메모를 전달할 때 사용 |
| /review | 코드 리뷰 요청. 구현 완료 후 품질 점검용 |
| /rewind | 대화 및 코드 변경 되돌리기, 클로드 코드 수정이 마음에 안 들 때 원복 |
| /context | 컨텍스트 사용량을 색상 그리드로 시각화. 남은 용량 파악에 유용 |
| /resume [세션] | 이전 대화 재개. 세션 ID/이름 지정 또는 선택 화면 열기 |
| /rename <이름> | 현재 세션 이름 변경. 나중에 /resume으로 쉽게 찾기 위함 |
| /exit | 종료 |
| /pr-comments | PR 코멘트 확인. 코드 리뷰 피드백 빠른 확인용 |
- `!` : bash 명령 직접 실행
    - 프롬프트 시작에 !를 붙이면 Bash 명령을 직접 실행한다. 클로드를 거치지 않으므로 토큰을 절약할 수 있다. 권한 필요한 건 새 터미널에서 진행한다.
- `#` : 메모리에 기록
    - 해당 내용이 CLAUDE.md에 추가된다. 자주 쓰는 규칙이나 컨벤션을 빠르게 기록할 때 유용하다.

## [CLAUDE.md](http://CLAUDE.md) Best Practices

좋은 CLAUDE.md는 다음의 정보를 포함한다.

1. 프로젝트 개요: 한두 문장의 프로젝트 설명/주요 기능 및 목적
2. 기술 스택: 사용하는 언어, 프레임워크 및 주요 라이브러리
3. 핵심 명령어: 빌드, 테스트, 린트 명령어 / 개발 서버 실행 방법
4. 디렉터리 구조: 주요 폴더의 역할 / 코드 배치 규칙
5. 코딩 규칙: 네이밍 컨벤션, 스타일 가이드
6. 금지 사항과 예외 규칙: 파일 수정, 삭제 관련 규칙 / 깃, 데이터베이스 등 민감한 조작 금지 / 라이브러리 버전업 등에 대한 규칙

CLAUDE.md는 매 세션 시작시 자동으로 컨텍스트에 로드된다. 그러나 로드된다는 것이 지시사항이 반드시 준수된다는 것을 의미하지는 않는다. 따라서 CLAUDE.md에만 의존하지 말고, Hook으로 강제하는 방식이 실무적으로 권장된다.

## [AGENTS.md](http://AGENTS.md) : 모든 에이전트를 위한 표준 문서(p107)

CLAUDE.md는 클로드 코드 전용 파일이다. 커서는 .cursor/rules를 읽고, 깃허브 코파일럿은 .github/copilot-instructions.md를 참조하며, 제미나이 CLI는 GEMINI.md를 찾는다. 같은 목적의 파일인데 이름과 위치가 제각각이다. 이 문제를 해결하기 위해 2025년 8월, AGENTS.md라는 오픈 표준이 등장했다.

1. AGENTS.md에 에이전트 공용 지침을 작성하고, CLAUDE.md에서는 이를 참조하면서 클로드 코드 전용 설정만 추가하는 방식 (권장)
2. 심볼릭 링크 사용하기 : 모든 에이전트가 완전히 동일한 지침을 쓰도록 하려면 심볼릭 링크를 활용할 수 있다. 이렇게 하면 AGENTS.md를 수정할 때, CLAUDE.md도 자동으로 동일한 내용을 반영한다. 다만 이 방식은 클로드 코드 전용 설정을 별도로 추가하기 어렵다는 단점이 있으므로 클코 고유 기능을 적극 활용한다면 1번 방식을 사용한다. 

AGENTS.md를 사용하면 이점

- 도구가 바뀔 경우 마이그레이션 시 [AGENTS.md](http://AGENTS.md) 기반이라면 문제될 게 없다.
- 다양한 프로젝트 실제 사례는 공식 사이트 https://github.com/agentsmd/agents.md 참고
- 

참고

- 한국어 가이드 https://cc101.axwith.com/ko
- [https://siosio3103.medium.com/당신의-claude-md는-아마-잘못되었을-겁니다-boris-cherny가-절대-하지-않는-7가지-실수-f2201efd098b](https://siosio3103.medium.com/%EB%8B%B9%EC%8B%A0%EC%9D%98-claude-md%EB%8A%94-%EC%95%84%EB%A7%88-%EC%9E%98%EB%AA%BB%EB%90%98%EC%97%88%EC%9D%84-%EA%B2%81%EB%8B%88%EB%8B%A4-boris-cherny%EA%B0%80-%EC%A0%88%EB%8C%80-%ED%95%98%EC%A7%80-%EC%95%8A%EB%8A%94-7%EA%B0%80%EC%A7%80-%EC%8B%A4%EC%88%98-f2201efd098b)
-