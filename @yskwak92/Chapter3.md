# Chapter 3. AI와 함께하는 개발 방법론

# 스터디 노트

> 작성 시작: 2026-05-19
> 작성자: 곽연수

---

## 학습 주제
3장 (AI와 함께하는 개발 방법론) 

## 핵심 개념
- 클로드코드는 어떻게 (How) 구현할지는 잘 알지만, 무엇을 (What) 만들어야 하는지는 모른다 (건호님 팁: objective -> data -> result) 
- 해서, 무작정으로 '이런거 만들어줘'라고만 명령하면 들쑥날쑥 만들어줌 -> 일일이 또 고쳐야됌 -> 토큰 낭비 심함 
- 결론: 작은 단위로 쪼개라: 아이디어 정리 -> 설계 문서 초안 -> 설계 검토 및 확정 -> 구현 (설계 검토 및 확정까지는 gemini, 구현은 클로드코드에게) 
***여기서 중요 포인트는 한 번에 하나의 작업만 요청하기 

3.2.2 작업 분해의 기준과 단위 (p 150) 
- 적절한 작업 크기의 기준
1. 단일 책임 원칙 적용: 하나의 요청은 하나의 책임만 다뤄야 한다
2. 테스트 가능한 단위: 결과물을 독립적으로 테스트할 수 있어야 한다 
3. 10분 내 검증 가능한 크기: 경험적으로 10분 안에 검증할 수 없는 작업은 다소 크다고 생각한다. 
4. 파일 혹은 기능 단위의 경계; 예를 들어 회원 도메인이라면 로그인/로그아웃은 기능은 다르지만 같은 경계에서 기능을 맡을 수 있다. 그러나 회원 가입/수정 등과 로그인/로그아웃은 경계도 다르고 역할도 다르기에 서로 다른 파일로 코드와 로직이 분리되어야 맞다. 

코드 품질: AI는 특히 보안 측면에서 취약한 코드를 생성하는 경향이 있다. 해서 다음 커맨드를 자주 활용해봐야 한다: 
/review: 최근 변경 코드를 PR 리뷰 수준으로 점검 
/simplify: 코드 재사용 및 품질 검토 
/security-review; 변경사항 대상으로 보안 취약점 분석 (보안 민감 코드 작업 후) 

p 157 에서 승인 전 실행과 테스트 먼저는 어떻게 진행해야 하는가?

3.4.3 리뷰 워크플로와 되돌리기 (깃 활용: 작은 작업마다 커밋) 
- 작업 시작 전: git checkout - b feature/user-authentication 
- 첫 번째 작업 완료 후 
git add . 
git commit -m "feat: 사용자 입력 검증 함수 추가" 
- 두 번째 작업 완료 후 
git add . 
git commit -m "feat: 데이터베이스 조회 로직 구현" 
- 세 번째 작업에서 문제 발생 시 
git reset -- hard HEAD~! # 직전 커밋으로 되돌리기 

"git checkout - b feature/user-authentication" 사용했을때: 
뭔가 망쳐도 돌아갈 수 있는 건 commit을 했을 때예요. 브랜치만 만드는 걸로는 부족하고, 작업하다가 중간중간 git commit을 찍어줘야 그 시점으로 돌아갈 수 있어요.

예를 들면:
  1. 코드 수정 → git commit ("로그인 화면 디자인 변경")  ← 저장점 ①
  2. 더 수정    → git commit ("비번 정책 추가")          ← 저장점 ②
  3. 망함 😱   → ① 또는 ②로 돌아가기 가능

  ---
  지금 어떻게 할까요?

  선택지가 두 개 있어요:

  A. 그냥 main에서 작업하기 (단순)

  git checkout main
  git branch -d feature/user-authentication   # 빈 브랜치 삭제
  → 작은 작업은 main에서 직접 해도 괜찮아요. 어차피 commit마다 돌아갈 수 있으니까요.

  B. 이대로 feature 브랜치에서 작업하기 (권장)

  - 큰 작업(예: Phase B 액션플랜 기능)은 별도 브랜치에서 작업하다가, 잘 되면 main에 합치는(merge) 방식이 안전해요.
  - 이 경우 브랜치 이름을 좀 더 정확하게 바꾸는 게 좋아요. (지금 이름이 "user-authentication"인데 실제로는 다른 작업할 가능성이
   높잖아요)

  어떻게 할까요?
-----------------------------------------------------------------------------------------------------------------------------------------------------------------
3.5 AI에게 없는 것 - 개발자의 판단력 (이건 비개발자에게 너무 어려움) 
3.6 증강코딩 
AI가 궤도를 이탈하고 있다는 세 가지 경고 신호 
1. 루프: AI가 비슷한 작업을 반복하면서 복잡한 로직에 빠져드는 현상. 
2. 요청하지 않은 기능 추가: AI가 지시하지 않은 여역까지 코드를 과도하게 추가하는 경우 
3. 치팅 징후: AI가 테스트를 통과시키기 위해 테스트 자체를 비활성화하거나 삭제하는 경우. 이를 방지하려면 CLAUDE.md나 HOok을 통해 명시적으로 강제해야 한다. (뭘 넣어야 되는건지 몰라서 찾아본 결과) 

1번 setting.json: "이 hook을 실행하라"라고 claude code에게 알려주는 등록 파일
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Edit|Write|MultiEdit",
        "hooks": [
          {
            "type": "command",
            "command": "python3 .claude/hooks/block_test_cheating.py"
          }
        ]
      }
    ]
  }
}

2. block_test_cheating.py: 실제로 차단하는 로직
#!/usr/bin/env python3
import json, re, sys

TEST_FILE = re.compile(r"(test_.*\.py|.*_test\.py|.*\.(test|spec)\.(ts|tsx|js|jsx))$")

FORBIDDEN = [
    r"@(pytest\.mark\.)?skip",
    r"@unittest\.skip",
    r"pytest\.skip\(",
    r"\.skip\(",
    r"\bxit\(|\bxdescribe\(|\bxtest\(",
    r"if\s+False\s*:",
    r"if\s*\(\s*false\s*\)",
    r"except[\s\w,]*:\s*pass",
    r"assert\s+True\s*$",
]

data = json.load(sys.stdin)
tool_input = data.get("tool_input", {})
path = tool_input.get("file_path", "")

if not TEST_FILE.search(path):
    sys.exit(0)

new_content = tool_input.get("new_string", "") + tool_input.get("content", "")

for pat in FORBIDDEN:
    if re.search(pat, new_content):
        print(f"🚫 테스트 비활성화 패턴 감지: {pat}\n사용자 승인 없이 테스트를 끄지 마세요.", file=sys.stderr)
        sys.exit(2)

sys.exit(0)
-----------------------------------------------------------------------------------------------------------------------------------
3.6 명시적으로 TDD 사이클 요청하기 (p 173) 
AI가 TDD를 따르도록 하려면 명시적이고 단계적인 지시가 필요하다
# 1단계: Red - 실패하는 테스트만 작성 
ex) "createUser 함수에 대한 실패하는 테스트를 먼저 작성해줘. 구현은 하지 마. 테스트만 작성해"

# 2단계: Green - 최소 구현 
ex) "방금 작성한 테스트를 통과시키는 최소한의 코드를 작성해줘. 추가 기능은 넣지 마."

# 3단계: Refactor - 정리 
ex) "테스트가 통과하는 상태를 유지하면서 코드를 리팩터링해줘. 새로운 기능은 추가하지 마." 

CLAUDE.md나 시스템 프롬프트에 추가할 수 있는 TDD 강제 템플릿 (p 174)
-이걸 커맨드 (/)로 만들면 더 편함. (p 176)

3.6.5 테스트가 진짜 안정망이 되려면 (p 180)
테스트는 단순히 코드가 동작하는지 확인하는 것을 넘어, 개발자와 AI 모두에게 '이 변경이 안전한가?' 라는 질문에 답을 주는 안정만이다. 
Hook을 활용한 테스트 품질 자동 검증 (테스트 커버리지 체크 Hook): 나중에 책 스캔

3.7 클로드 코드에서 MCP 설정하기 (p 181)
MCP는 AI가 외부 도구와 데이터 소스에 접근할 수 있게 해주는 표준화된 프로토콜이다. 
MCP 연결 방법 (p 182)
- HTTP 서버 연결
- Stdio 서버 연결 
- JSON 설정으로 추가 
- 연수: claude.ai 에서 커넥터로 추가 

MCP 서버 관련 명령어 
# 설치된 MCP 서버 목록 확인: claude mcp list 
# 특정 서버 상세 정보 확인: claude mcp get github
# MCP 서버 제거: claude mcp remove github
# 클로드 코드 내에서 서버 상태 확인: /mcp 

3.7.3 Skill, Hook, MCP 확장 기능 사용의 원칙 (p 192) 
많이 설정한다고 좋은 것이 아니다. 이로 인해 토큰이 낭비될 수도 있고, 의도한 방향대로 동작이 일어나지 않는 경우도 생긴다. 권장 접근법은 '필요할 때 필요한 것만 설정'하는 것이다: 
1. 기본 설정은 최소화: CLAUDE.md와 필수 HOOK만 설정 
2. MCP는 필요할 때 추가: 깃허브 작업할 떄 깃허브 MCP, DB 작업할 때 PostgreSQL MCP 
3. 사용 후 비활성화: /mcp 명령어로 현재 불필요한 MCP 서버 끄기 
4. 프로젝트별 분리: --scope local로 프로젝트에 필요한 것만 설정
