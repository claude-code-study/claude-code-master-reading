#!/usr/bin/env node

import { execFileSync } from "node:child_process";
import { mkdtempSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";

const run = (command, args, options = {}) => {
  return execFileSync(command, args, {
    encoding: "utf8",
    stdio: options.stdio ?? "pipe",
  }).trim();
};

const tryRun = (command, args, fallback = "") => {
  try {
    return run(command, args);
  } catch {
    return fallback;
  }
};

const parseArgs = (args) => {
  const parsed = {
    base: "",
    dryRun: false,
    push: false,
    tests: "",
    title: "",
    web: false,
  };

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];

    if (arg === "--base") {
      parsed.base = args[index + 1] ?? "";
      index += 1;
    } else if (arg === "--dry-run") {
      parsed.dryRun = true;
    } else if (arg === "--push") {
      parsed.push = true;
    } else if (arg === "--tests") {
      parsed.tests = args[index + 1] ?? "";
      index += 1;
    } else if (arg === "--title") {
      parsed.title = args[index + 1] ?? "";
      index += 1;
    } else if (arg === "--web") {
      parsed.web = true;
    } else if (arg === "--help" || arg === "-h") {
      parsed.help = true;
    } else if (!parsed.title) {
      parsed.title = arg;
    }
  }

  return parsed;
};

const usage = () => {
  console.log(
    [
      'Usage: npm run pr -- --title "작업명" --tests "npm test: passed; npm run lint: passed"',
      "",
      'The GitHub PR title is normalized to "[작업명]".',
      "",
      "Options:",
      "  --base <branch>   Base branch. Defaults to origin/HEAD, then main.",
      "  --push            Push the current branch before creating the PR.",
      "  --dry-run         Print the generated PR title/body without calling GitHub.",
      "  --tests <text>    Semicolon-separated test result lines.",
      "  --web             Open GitHub PR creation in browser via gh.",
    ].join("\n"),
  );
};

const ensureCommand = (command, args, message) => {
  try {
    run(command, args);
  } catch {
    console.error(message);
    process.exit(1);
  }
};

const currentBranch = () => run("git", ["branch", "--show-current"]);

const defaultBaseBranch = () => {
  const originHead = tryRun(["git"][0], [
    "symbolic-ref",
    "--short",
    "refs/remotes/origin/HEAD",
  ]);

  if (originHead.startsWith("origin/")) {
    return originHead.replace(/^origin\//, "");
  }

  const remoteDefault = tryRun("git", [
    "remote",
    "show",
    "origin",
  ]).match(/HEAD branch: (.+)/)?.[1];

  return remoteDefault || "main";
};

const hasCleanWorkingTree = () => {
  return tryRun("git", ["status", "--porcelain=v1"]) === "";
};

const hasUpstream = (branch) => {
  return tryRun("git", ["rev-parse", "--abbrev-ref", `${branch}@{upstream}`]) !== "";
};

const latestCommitTitle = () => {
  return tryRun("git", ["log", "-1", "--pretty=%s"], "Update changes");
};

const normalizeTitle = (title) => {
  const trimmedTitle = title.trim();

  if (!trimmedTitle) {
    return "[Update]";
  }

  if (/^\[[^\]]+\]$/.test(trimmedTitle)) {
    return trimmedTitle;
  }

  return `[${trimmedTitle}]`;
};

const commitBullets = (base) => {
  const commits = tryRun("git", [
    "log",
    "--oneline",
    "--no-merges",
    `origin/${base}..HEAD`,
  ]);

  if (!commits) {
    return ["- 최신 커밋 기준 변경사항 반영"];
  }

  return commits
    .split("\n")
    .filter(Boolean)
    .map((line) => `- ${line}`);
};

const fileBullets = (base) => {
  const files = tryRun("git", ["diff", "--name-status", `origin/${base}...HEAD`]);

  if (!files) {
    return [];
  }

  return files
    .split("\n")
    .filter(Boolean)
    .map((line) => {
      const [status, ...pathParts] = line.split(/\s+/);
      const path = pathParts.join(" ");
      const label = {
        A: "Added",
        D: "Deleted",
        M: "Modified",
        R: "Renamed",
      }[status[0] ?? ""] ?? status;

      return `- ${label}: \`${path}\``;
    });
};

const testBullets = (tests) => {
  const lines = tests
    .split(";")
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length === 0) {
    return ["- 테스트 미실행"];
  }

  return lines.map((line) => `- ${line}`);
};

const buildBody = ({ base, tests }) => {
  const commits = commitBullets(base);
  const files = fileBullets(base);
  const changes = files.length > 0 ? [...commits, "", "## 변경 파일", ...files] : commits;

  return [
    "# 변경내용",
    ...changes,
    "",
    "# 테스트방법",
    ...testBullets(tests),
    "",
  ].join("\n");
};

const writeBodyFile = (body) => {
  const dir = mkdtempSync(join(tmpdir(), "tika-pr-"));
  const path = join(dir, "body.md");
  writeFileSync(path, body);
  return path;
};

const main = () => {
  const args = parseArgs(process.argv.slice(2));

  if (args.help) {
    usage();
    return;
  }

  ensureCommand("git", ["--version"], "git command is required");
  if (!args.dryRun) {
    ensureCommand("gh", ["--version"], "GitHub CLI 'gh' is required and must be authenticated");
  }

  const branch = currentBranch();
  if (!branch) {
    console.error("현재 브랜치를 확인할 수 없습니다.");
    process.exit(1);
  }

  if (branch === "main" || branch === "master") {
    console.error("main/master 브랜치에서는 PR을 만들지 않습니다.");
    process.exit(1);
  }

  if (!args.dryRun && !hasCleanWorkingTree()) {
    console.error("커밋되지 않은 변경사항이 있습니다. 먼저 commit 후 다시 실행하세요.");
    process.exit(1);
  }

  const base = args.base || defaultBaseBranch();
  const title = normalizeTitle(args.title || latestCommitTitle());
  const body = buildBody({ base, tests: args.tests });
  const bodyFile = writeBodyFile(body);

  if (args.dryRun) {
    console.log(`# Title\n${title}\n`);
    console.log(body);
    return;
  }

  if (args.push || !hasUpstream(branch)) {
    run("git", ["push", "-u", "origin", branch], { stdio: "inherit" });
  }

  const existingPrUrl = tryRun("gh", [
    "pr",
    "view",
    "--head",
    branch,
    "--json",
    "url",
    "--jq",
    ".url",
  ]);

  if (existingPrUrl) {
    run("gh", ["pr", "edit", existingPrUrl, "--title", title, "--body-file", bodyFile], {
      stdio: "inherit",
    });
    console.log(existingPrUrl);
    return;
  }

  const createArgs = [
    "pr",
    "create",
    "--base",
    base,
    "--head",
    branch,
    "--title",
    title,
    "--body-file",
    bodyFile,
  ];

  if (args.web) {
    createArgs.push("--web");
  }

  run("gh", createArgs, { stdio: "inherit" });
};

main();
