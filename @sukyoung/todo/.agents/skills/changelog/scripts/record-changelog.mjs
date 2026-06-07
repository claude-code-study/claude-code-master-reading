#!/usr/bin/env node

import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const CHANGELOG_PATH = "CHANGELOG.md";
const AGENTS_PATH = "AGENTS.md";
const RECENT_START = "<!-- CHANGELOG_RECENT_START -->";
const RECENT_END = "<!-- CHANGELOG_RECENT_END -->";
const RECENT_DAYS = 14;

const runGit = (args, fallback = "") => {
  try {
    return execFileSync("git", args, { encoding: "utf8" }).trimEnd();
  } catch {
    return fallback;
  }
};

const GIT_ROOT = runGit(["rev-parse", "--show-toplevel"], process.cwd());

const parseArgs = (args) => {
  const promptParts = [];
  let tests = "";

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];

    if (arg === "--tests") {
      tests = args[index + 1] ?? "";
      index += 1;
      continue;
    }

    if (arg === "--help" || arg === "-h") {
      return { help: true, prompt: "", tests: "" };
    }

    promptParts.push(arg);
  }

  return {
    help: false,
    prompt: promptParts.join(" ").trim(),
    tests: tests.trim(),
  };
};

const usage = () => {
  console.log(
    [
      'Usage: npm run changelog -- "사용자가 입력한 요청" --tests "npm test: passed; npm run lint: passed"',
      "",
      "Records the current working-tree diff, or the latest commit diff when the tree is clean.",
    ].join("\n"),
  );
};

const formatTimestamp = () => {
  return new Intl.DateTimeFormat("sv-SE", {
    day: "2-digit",
    hour: "2-digit",
    hour12: false,
    minute: "2-digit",
    month: "2-digit",
    timeZone: "Asia/Seoul",
    year: "numeric",
  }).format(new Date());
};

const normalizePath = (path) => {
  if (path.includes(" -> ")) {
    return path.split(" -> ").at(-1) ?? path;
  }

  if (path.includes("=>")) {
    const match = path.match(/\{.* => (.*)\}/);
    return match?.[1] ?? path.split("=>").at(-1)?.trim() ?? path;
  }

  return path;
};

const parseNumstat = (output) => {
  const files = new Map();

  for (const line of output.split("\n").filter(Boolean)) {
    const [addedRaw, deletedRaw, ...pathParts] = line.split("\t");
    const path = normalizePath(pathParts.join("\t"));
    const added = Number.parseInt(addedRaw, 10);
    const deleted = Number.parseInt(deletedRaw, 10);

    files.set(path, {
      path,
      added: Number.isFinite(added) ? added : 0,
      deleted: Number.isFinite(deleted) ? deleted : 0,
      kind: "Modified",
    });
  }

  return files;
};

const countLines = (path) => {
  try {
    const filePath = existsSync(path) ? path : join(GIT_ROOT, path);

    if (!existsSync(filePath) || !statSync(filePath).isFile()) {
      return 0;
    }

    const contents = readFileSync(filePath, "utf8");
    if (contents.length === 0) {
      return 0;
    }

    return contents.endsWith("\n")
      ? contents.split("\n").length - 1
      : contents.split("\n").length;
  } catch {
    return 0;
  }
};

const parseStatus = (output, files) => {
  for (const line of output.split("\n").filter(Boolean)) {
    const status = line.slice(0, 2);
    const rawPath = normalizePath(line.slice(3));
    const existing = files.get(rawPath) ?? {
      path: rawPath,
      added: 0,
      deleted: 0,
      kind: "Modified",
    };

    if (status === "??" || status.includes("A")) {
      existing.kind = "Added";
      if (existing.added === 0 && existing.deleted === 0) {
        existing.added = countLines(rawPath);
      }
    } else if (status.includes("D")) {
      existing.kind = "Deleted";
    } else {
      existing.kind = "Modified";
    }

    files.set(rawPath, existing);
  }
};

const getChangedFiles = () => {
  const status = runGit(["status", "--porcelain=v1", "--untracked-files=all"]);
  const isDirty = status.length > 0;
  const latestCommitRange = runGit(["rev-parse", "--verify", "HEAD~1"], "")
    ? ["diff", "--numstat", "HEAD~1", "HEAD", "--"]
    : ["diff-tree", "--no-commit-id", "--numstat", "-r", "HEAD"];
  const numstatArgs = isDirty
    ? ["diff", "--numstat", "HEAD", "--"]
    : latestCommitRange;
  const files = parseNumstat(runGit(numstatArgs));

  if (isDirty) {
    parseStatus(status, files);
  }

  return [...files.values()].sort((a, b) => a.path.localeCompare(b.path));
};

const formatPathList = (files) => {
  if (files.length === 0) {
    return "변경된 파일 없음";
  }

  return files.map((file) => `'${file.path}'`).join(", ");
};

const formatChanges = (files, prompt) => {
  const lines = [];

  for (const kind of ["Added", "Modified", "Deleted"]) {
    const group = files.filter((file) => file.kind === kind);

    if (group.length > 0) {
      lines.push(`- **${kind}**: ${prompt} (${formatPathList(group)})`);
    }
  }

  return lines.length > 0 ? lines.join("\n") : "- 변경된 파일 없음";
};

const formatFiles = (files) => {
  if (files.length === 0) {
    return "- 변경된 파일 없음";
  }

  return files
    .map((file) => `- '${file.path}' (+${file.added}, -${file.deleted} lines)`)
    .join("\n");
};

const formatTests = (tests) => {
  const lines = tests
    .split(";")
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length === 0) {
    return "- 기록된 테스트 결과 없음";
  }

  return lines.map((line) => `- ${line}`).join("\n");
};

const buildEntry = ({ branch, prompt, timestamp, tests, files }) => {
  return [
    `## [${branch}] - ${timestamp}`,
    "",
    "### 🥅Prompt",
    `> \"${prompt}\"`,
    "",
    "### ✅Changes",
    formatChanges(files, prompt),
    "",
    "### Files Modified",
    formatFiles(files),
    "",
    "### Tests",
    formatTests(tests),
    "",
  ].join("\n");
};

const readChangelog = () => {
  if (!existsSync(CHANGELOG_PATH)) {
    return "# CHANGELOG\n\n";
  }

  return readFileSync(CHANGELOG_PATH, "utf8");
};

const prependChangelogEntry = (entry) => {
  const changelog = readChangelog();

  if (!changelog.startsWith("# ")) {
    writeFileSync(CHANGELOG_PATH, `# CHANGELOG\n\n${entry}\n${changelog}`);
    return readFileSync(CHANGELOG_PATH, "utf8");
  }

  const firstLineEnd = changelog.indexOf("\n");
  const title = changelog.slice(0, firstLineEnd + 1);
  const rest = changelog.slice(firstLineEnd + 1).replace(/^\n*/, "");

  writeFileSync(CHANGELOG_PATH, `${title}\n${entry}\n${rest}`);
  return readFileSync(CHANGELOG_PATH, "utf8");
};

const extractRecentEntries = (changelog) => {
  const sections = changelog.split(/^## /m).slice(1);
  const now = Date.now();
  const maxAgeMs = RECENT_DAYS * 24 * 60 * 60 * 1000;
  const entries = [];

  for (const section of sections) {
    const headingMatch = section.match(/^\[([^\]]+)\] - (\d{4}-\d{2}-\d{2} \d{2}:\d{2})/);
    if (!headingMatch) {
      continue;
    }

    const [, branch, timestamp] = headingMatch;
    const entryTime = new Date(`${timestamp.replace(" ", "T")}:00+09:00`);

    if (Number.isNaN(entryTime.getTime()) || now - entryTime.getTime() > maxAgeMs) {
      continue;
    }

    const promptMatch = section.match(/### 🥅Prompt\n> "([^"]*)"/);
    entries.push({
      branch,
      timestamp,
      prompt: promptMatch?.[1] ?? "요약 없음",
    });
  }

  return entries.slice(0, 20);
};

const buildRecentSummary = (entries) => {
  if (entries.length === 0) {
    return "- 최근 14일 내 기록된 변경사항 없음";
  }

  return entries
    .map((entry) => `- ${entry.timestamp} [${entry.branch}] ${entry.prompt}`)
    .join("\n");
};

const updateAgentsRecentSummary = (changelog) => {
  const entries = extractRecentEntries(changelog);
  const summary = buildRecentSummary(entries);
  const block = [
    "## 최근 변경사항 요약",
    "최근 14일 내 `/changelog` skill로 기록된 변경사항이다.",
    "",
    RECENT_START,
    summary,
    RECENT_END,
    "",
  ].join("\n");
  const agents = existsSync(AGENTS_PATH) ? readFileSync(AGENTS_PATH, "utf8") : "";

  if (agents.includes(RECENT_START) && agents.includes(RECENT_END)) {
    const updated = agents.replace(
      new RegExp(`${RECENT_START}[\\s\\S]*?${RECENT_END}`),
      `${RECENT_START}\n${summary}\n${RECENT_END}`,
    );
    writeFileSync(AGENTS_PATH, updated);
    return;
  }

  const speckitIndex = agents.indexOf("<!-- SPECKIT START -->");
  if (speckitIndex === -1) {
    writeFileSync(AGENTS_PATH, `${agents.trimEnd()}\n\n${block}`);
    return;
  }

  writeFileSync(
    AGENTS_PATH,
    `${agents.slice(0, speckitIndex).trimEnd()}\n\n${block}${agents.slice(speckitIndex)}`,
  );
};

const main = () => {
  const { help, prompt, tests } = parseArgs(process.argv.slice(2));

  if (help) {
    usage();
    return;
  }

  if (!prompt) {
    usage();
    process.exit(1);
  }

  const branch = runGit(["rev-parse", "--abbrev-ref", "HEAD"], "unknown");
  const timestamp = formatTimestamp();
  const files = getChangedFiles();
  const entry = buildEntry({ branch, prompt, timestamp, tests, files });
  const changelog = prependChangelogEntry(entry);

  updateAgentsRecentSummary(changelog);

  console.log(`CHANGELOG.md 기록 완료: ${branch} ${timestamp}`);
  console.log(`AGENTS.md 최근 변경사항 요약 갱신 완료`);
};

main();
