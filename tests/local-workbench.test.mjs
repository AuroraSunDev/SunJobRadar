import test from "node:test";
import assert from "node:assert/strict";
import {
  mkdtempSync,
  readFileSync,
  existsSync,
  writeFileSync,
  rmSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { spawnSync } from "node:child_process";
import { markdown } from "../templates/local-workbench/domain.mjs";

const root = resolve(import.meta.dirname, "..");
const profile = {
  confirmed: true,
  name: "示例同学",
  graduation: "2028-06",
  recruitment: "校招",
  roles: ["AI Builder", "软件开发"],
  cities: [],
  mustHave: [],
  exclusions: ["销售"],
  summary: "有课程项目经验",
  facts: [
    {
      id: "f1",
      text: "使用 Java 完成课程团队项目",
      source: "用户确认的示例简历",
      boundary: "仅负责自己的模块",
    },
  ],
  schedule: { everyDays: 2, time: "10:00", timezone: "Asia/Shanghai" },
};
const run = {
  id: "test-run",
  startedAt: "2026-10-19T02:00:00Z",
  completedAt: "2026-10-19T02:05:00Z",
  status: "partial",
  sources: [
    {
      url: "https://example.com/jobs/42",
      status: "partial",
      note: "仅读取片段",
    },
  ],
  jobs: [
    {
      url: "https://example.com/jobs/42?utm_source=test",
      title: "应用工程师",
      company: "示例公司",
      city: "上海",
      roles: ["AI Builder"],
      observedAt: "2026-10-19T02:03:00Z",
      sourceStatus: "partial",
      jd: "要求 Java 课程项目经验；出差要求待核对。",
      requirements: [
        {
          text: "Java 课程项目经验",
          state: "matched",
          factIds: ["f1"],
          evidence: "Java 课程项目经验",
          reason: "对应已确认的课程事实",
        },
      ],
      recommendation: "cautious",
      summary: "仅按已读片段分析",
      profileVersion: 1,
    },
  ],
};

function project(t) {
  const parent = mkdtempSync(join(tmpdir(), "jobradar-test-"));
  t.after(() => rmSync(parent, { recursive: true, force: true }));
  const dir = join(parent, "my-radar");
  const result = spawnSync(
    process.execPath,
    [join(root, "scripts/create-workbench.mjs"), dir],
    { encoding: "utf8" },
  );
  assert.equal(result.status, 0, result.stderr);
  return dir;
}
function cli(dir, command, value) {
  return spawnSync(process.execPath, ["cli.mjs", command], {
    cwd: dir,
    encoding: "utf8",
    input: value === undefined ? "" : JSON.stringify(value),
  });
}
function json(result) {
  assert.equal(result.status, 0, result.stderr);
  return JSON.parse(result.stdout);
}

test("clean generator creates runnable dependency-free instance and refuses existing directories", (t) => {
  const probe = join(root, "templates/local-workbench/zz-copy-probe.txt");
  writeFileSync(probe, "not part of release");
  t.after(() => rmSync(probe, { force: true }));
  const dir = project(t);
  assert.equal(existsSync(join(dir, ".git")), false);
  assert.equal(existsSync(join(dir, "cloud")), false);
  assert.equal(existsSync(join(dir, "zz-copy-probe.txt")), false);
  assert.equal(existsSync(join(dir, "docs/agent-contract.md")), true);
  assert.equal(
    JSON.parse(readFileSync(join(dir, "package.json"))).dependencies,
    undefined,
  );
  assert.equal(json(cli(dir, "read")).profile, null);
  const again = spawnSync(
    process.execPath,
    [join(root, "scripts/create-workbench.mjs"), dir],
    { encoding: "utf8" },
  );
  assert.notEqual(again.status, 0);
});
test("only confirmed profiles initialize and personal data stays in ignored local storage", (t) => {
  const dir = project(t);
  assert.notEqual(cli(dir, "init", { ...profile, confirmed: false }).status, 0);
  assert.equal(json(cli(dir, "init", profile)).profile.version, 1);
  assert.equal(existsSync(join(dir, ".sunjobradar", "radar.sqlite")), true);
  assert.equal(
    json(cli(dir, "read")).profile.facts[0].boundary,
    "仅负责自己的模块",
  );
  assert.notEqual(cli(dir, "init", profile).status, 0);
});
test("imports deduplicate canonical URLs and replay identically without hiding run conflict", (t) => {
  const dir = project(t);
  json(cli(dir, "init", profile));
  assert.equal(json(cli(dir, "import", run)).newCount, 1);
  assert.equal(json(cli(dir, "import", run)).replayed, true);
  assert.notEqual(cli(dir, "import", { ...run, status: "success" }).status, 0);
  const state = json(cli(dir, "read"));
  assert.equal(state.jobs.length, 1);
  assert.equal(state.jobs[0].url, "https://example.com/jobs/42");
  assert.equal(state.runs.length, 1);
});
test("invalid evidence and unsafe URLs fail atomically", (t) => {
  const dir = project(t);
  json(cli(dir, "init", profile));
  for (const patch of [
    { url: "http://127.0.0.1/a" },
    {
      requirements: [{ ...run.jobs[0].requirements[0], factIds: ["missing"] }],
    },
    { sourceStatus: "discovery" },
    {
      requirements: [{ ...run.jobs[0].requirements[0], evidence: "invented" }],
    },
  ]) {
    assert.notEqual(
      cli(dir, "import", { ...run, jobs: [{ ...run.jobs[0], ...patch }] })
        .status,
      0,
    );
  }
  assert.equal(json(cli(dir, "read")).jobs.length, 0);
  assert.equal(json(cli(dir, "read")).runs.length, 0);
});
test("unknown mandatory requirement cannot become a confident recommendation", (t) => {
  const dir = project(t);
  json(cli(dir, "init", profile));
  const job = {
    ...run.jobs[0],
    recommendation: "recommended",
    requirements: [
      {
        text: "出差要求",
        state: "unknown",
        must: true,
        factIds: [],
        evidence: "出差要求",
        reason: "待用户确认",
      },
    ],
  };
  assert.notEqual(cli(dir, "import", { ...run, jobs: [job] }).status, 0);
});
test("older observations and discovery-only updates preserve readable JD and first seen", (t) => {
  const dir = project(t);
  json(cli(dir, "init", profile));
  json(cli(dir, "import", run));
  json(
    cli(dir, "import", {
      ...run,
      id: "older",
      jobs: [
        { ...run.jobs[0], title: "old", observedAt: "2026-10-18T01:00:00Z" },
      ],
    }),
  );
  const discovery = {
    ...run.jobs[0],
    sourceStatus: "discovery",
    jd: "",
    requirements: [],
    title: "lead",
    observedAt: "2026-10-19T03:00:00Z",
  };
  json(
    cli(dir, "import", {
      ...run,
      id: "discovery",
      completedAt: "2026-10-19T03:01:00Z",
      sources: [
        { url: discovery.url, status: "discovery", note: "仅发现链接" },
      ],
      jobs: [discovery],
    }),
  );
  const job = json(cli(dir, "read")).jobs[0];
  assert.equal(job.title, "应用工程师");
  assert.equal(job.sourceStatus, "partial");
  assert.equal(job.firstSeenAt, "2026-10-18T01:00:00.000Z");
  assert.equal(job.lastSeenAt, "2026-10-19T03:00:00.000Z");
});
test("profile changes mark prior matches stale and schedule remains unconfigured until verified", (t) => {
  const dir = project(t);
  json(cli(dir, "init", profile));
  json(cli(dir, "import", run));
  assert.equal(json(cli(dir, "read")).schedule.status, "unconfigured");
  json(
    cli(dir, "profile", {
      ...profile,
      roles: ["产品经理"],
      expectedVersion: 1,
    }),
  );
  const state = json(cli(dir, "read"));
  assert.equal(state.profile.version, 2);
  assert.equal(state.jobs[0].stale, true);
  assert.notEqual(
    cli(dir, "profile", { ...profile, expectedVersion: 1 }).status,
    0,
  );
  assert.notEqual(
    cli(dir, "schedule", { status: "enabled", provider: "Codex" }).status,
    0,
  );
});
test("hash-routed job identities and their original links survive import", (t) => {
  const dir = project(t);
  json(cli(dir, "init", profile));
  const urls = [
    "https://example.com/careers#/job/java-42",
    "https://example.com/careers#/job/python-99",
  ];
  const payload = {
    ...run,
    sources: urls.map((url) => ({
      url,
      status: "partial",
      note: "读取正文片段",
    })),
    jobs: urls.map((url, i) => ({ ...run.jobs[0], url, title: "岗位 " + i })),
  };
  assert.equal(json(cli(dir, "import", payload)).newCount, 2);
  assert.deepEqual(
    json(cli(dir, "read"))
      .jobs.map((j) => j.url)
      .sort(),
    urls.sort(),
  );
});
test("stale exports preserve the originally cited fact rather than substituting a correction", (t) => {
  const dir = project(t);
  json(cli(dir, "init", profile));
  json(cli(dir, "import", run));
  json(
    cli(dir, "profile", {
      ...profile,
      expectedVersion: 1,
      facts: [{ ...profile.facts[0], text: "更正：没有 Java 项目经验" }],
    }),
  );
  const state = json(cli(dir, "read")),
    output = markdown(state.jobs[0], state.profile);
  assert.match(output, /使用 Java 完成课程团队项目/);
  assert.doesNotMatch(output, /更正：没有 Java 项目经验/);
  assert.match(output, /分析已过期/);
});
test("unconfirmed schedule assumptions are rejected", (t) => {
  const dir = project(t);
  const { schedule, ...missingSchedule } = profile;
  assert.notEqual(cli(dir, "init", missingSchedule).status, 0);
});
test("ambiguous local timestamps are rejected instead of shifting discovery times", (t) => {
  const dir = project(t);
  json(cli(dir, "init", profile));
  assert.notEqual(
    cli(dir, "import", { ...run, startedAt: "2026-10-19 01:00" }).status,
    0,
  );
});
