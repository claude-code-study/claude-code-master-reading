---
name: pr
description: Use when the user invokes $pr or asks to create/update a GitHub pull request with a body containing # 변경내용 and # 테스트방법.
---

# PR

## Purpose

Create or update a GitHub pull request on demand. This skill is manual only; do not run it from hooks.

## Trigger

Use this skill when the user says:

- `$pr`
- `$pr "제목"`
- "깃허브 PR 올려줘"
- "PR 만들어줘"

## Workflow

1. Make sure the working tree is clean.
   - If there are uncommitted changes, do not create a PR yet.
   - Ask the user whether to commit first, or report the changed files.
2. Confirm the branch is not `main` or `master`.
3. Run validation if the user wants test results in the PR body.
   - Typical results: `npm test -- --runInBand`, `npx tsc --noEmit`, `npm run lint`.
4. Create or update the PR:

```bash
npm run pr -- --title "작업명" --tests "npm test -- --runInBand: passed; npx tsc --noEmit: passed; npm run lint: passed"
```

If the current branch has no upstream and the user explicitly wants to push:

```bash
npm run pr -- --push --title "작업명" --tests "npm test: passed"
```

## Title Rule

GitHub PR title must use this format:

```text
[작업명]
```

When calling the script, pass the work name without brackets:

```bash
npm run pr -- --title "로그인 API 구현"
```

The script creates or updates the GitHub PR title as:

```text
[로그인 API 구현]
```

## Template

The PR body must use this template:

```markdown
# 변경내용
- ...

# 테스트방법
- ...
```

## Script Notes

- Script path: `.agents/skills/pr/scripts/create-pr.mjs`
- npm script: `npm run pr`
- Requires GitHub CLI `gh` authentication.
- If a PR already exists for the branch, the script updates the PR title/body instead of creating a duplicate.

## Constraints

- Do not use `git push --force`.
- Do not create a PR from `main` or `master`.
- Do not run automatically as a hook.
- Do not hide failing or skipped tests; record them explicitly.
