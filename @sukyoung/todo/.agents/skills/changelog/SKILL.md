---
name: changelog
description: Use when the user invokes /changelog or asks to record the latest prompt, changed files, branch/time, and test results into CHANGELOG.md and AGENTS.md without hooks.
---

# Changelog

## Purpose

Record a user-requested change history entry on demand. This skill is intentionally manual: do not run it from hooks or automatically after every edit.

## Trigger

Use this skill when the user says:

- `/changelog "요약"`
- `/changelog '요약'`
- "CHANGELOG에 이번 작업 기록해줘"

## Workflow

1. Identify the prompt text to record.
   - Prefer the user's exact request if it is available in the conversation.
   - If the slash command includes a quoted summary, use that as the prompt text when the exact original prompt is not available.
2. Collect test results from commands already run in this turn.
   - Pass them with `--tests`, separated by semicolons.
   - If no tests were run, omit `--tests`; the script will record that no test result was captured.
3. Run the recorder from the repository root:

```bash
npm run changelog -- "사용자가 입력한 요청" --tests "npm test: passed; npx tsc --noEmit: passed; npm run lint: passed"
```

4. Verify the diff with `git status --short --untracked-files=all`.

## What The Script Records

The script updates `CHANGELOG.md` with:

- branch name
- Asia/Seoul timestamp
- prompt text
- changed file list and `+/-` line counts
- grouped Added/Modified/Deleted summary
- test result lines, if supplied

The script also updates `AGENTS.md` with a recent-change summary for the last 14 days between the `CHANGELOG_RECENT` markers.

## Constraints

- Do not execute destructive git, DB, npm, or filesystem commands.
- Do not commit automatically.
- Do not run as a hook.
- Keep generated entries concise and factual.
