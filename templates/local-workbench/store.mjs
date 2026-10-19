import { DatabaseSync } from "node:sqlite";
import { mkdirSync, chmodSync } from "node:fs";
import { join } from "node:path";
import { createHash } from "node:crypto";
import { ensure, parseProfile, parseRun, date } from "./domain.mjs";

const hash = (value) => createHash("sha256").update(value).digest("hex");
function stable(value) {
  if (Array.isArray(value)) return value.map(stable);
  if (value && typeof value === "object")
    return Object.fromEntries(
      Object.keys(value)
        .sort()
        .map((k) => [k, stable(value[k])]),
    );
  return value;
}
export function openStore(home) {
  mkdirSync(home, { recursive: true, mode: 0o700 });
  chmodSync(home, 0o700);
  const path = join(home, "radar.sqlite"),
    db = new DatabaseSync(path);
  chmodSync(path, 0o600);
  db.exec(`PRAGMA busy_timeout=5000; PRAGMA journal_mode=WAL;
    CREATE TABLE IF NOT EXISTS setting (key TEXT PRIMARY KEY, json TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS job (id TEXT PRIMARY KEY,url TEXT UNIQUE NOT NULL,json TEXT NOT NULL,first_seen TEXT NOT NULL,last_seen TEXT NOT NULL,saved INTEGER NOT NULL DEFAULT 0);
    CREATE TABLE IF NOT EXISTS run (id TEXT PRIMARY KEY,hash TEXT NOT NULL,json TEXT NOT NULL);`);
  const setting = (key) => {
    const r = db.prepare("SELECT json FROM setting WHERE key=?").get(key);
    return r ? JSON.parse(r.json) : null;
  };
  const set = (key, value) =>
    db
      .prepare(
        "INSERT INTO setting VALUES (?,?) ON CONFLICT(key) DO UPDATE SET json=excluded.json",
      )
      .run(key, JSON.stringify(value));
  function transaction(work) {
    db.exec("BEGIN IMMEDIATE");
    try {
      const result = work();
      db.exec("COMMIT");
      return result;
    } catch (error) {
      db.exec("ROLLBACK");
      throw error;
    }
  }
  function read() {
    const profile = setting("profile");
    return {
      schemaVersion: 1,
      profile,
      schedule: setting("schedule") ?? { status: "unconfigured" },
      jobs: db
        .prepare("SELECT * FROM job ORDER BY last_seen DESC,id")
        .all()
        .map((r) => ({
          ...JSON.parse(r.json),
          id: r.id,
          firstSeenAt: r.first_seen,
          lastSeenAt: r.last_seen,
          saved: Boolean(r.saved),
          stale: JSON.parse(r.json).profileVersion !== profile?.version,
        })),
      runs: db
        .prepare("SELECT json FROM run ORDER BY rowid DESC")
        .all()
        .map((r) => JSON.parse(r.json)),
    };
  }
  function profile(input, initial = false) {
    return transaction(() => {
      const previous = setting("profile");
      ensure(
        initial ? !previous : Boolean(previous),
        initial ? "已有画像，请用 profile 修改" : "请先初始化画像",
      );
      ensure(
        initial || input.expectedVersion === previous.version,
        "画像已更新，请读取最新版本再保存",
      );
      const next = {
        ...parseProfile(input),
        version: (previous?.version ?? 0) + 1,
      };
      set("profile", next);
      return read();
    });
  }
  function importRun(input) {
    return transaction(() => {
      const payloadHash = hash(JSON.stringify(stable(input))),
        previous = db
          .prepare("SELECT hash,json FROM run WHERE id=?")
          .get(input?.id ?? "");
      if (previous) {
        ensure(
          previous.hash === payloadHash,
          "同一检索 ID 的内容发生变化，请使用新 ID",
        );
        return { ...JSON.parse(previous.json), replayed: true };
      }
      const run = parseRun(input, setting("profile"));
      let newCount = 0,
        updatedCount = 0;
      for (const j of run.jobs) {
        const id = hash(j.url).slice(0, 32),
          old = db.prepare("SELECT * FROM job WHERE id=?").get(id);
        if (!old) {
          db.prepare(
            "INSERT INTO job (id,url,json,first_seen,last_seen) VALUES (?,?,?,?,?)",
          ).run(id, j.url, JSON.stringify(j), j.observedAt, j.observedAt);
          newCount++;
        } else {
          const previousJob = JSON.parse(old.json),
            rank = { discovery: 0, partial: 1, full: 2 };
          const update =
            j.observedAt >= previousJob.observedAt &&
            rank[j.sourceStatus] >= rank[previousJob.sourceStatus];
          db.prepare(
            "UPDATE job SET json=?,first_seen=?,last_seen=? WHERE id=?",
          ).run(
            JSON.stringify(update ? j : previousJob),
            j.observedAt < old.first_seen ? j.observedAt : old.first_seen,
            j.observedAt > old.last_seen ? j.observedAt : old.last_seen,
            id,
          );
          if (update) updatedCount++;
        }
      }
      const result = {
        ...run,
        jobs: run.jobs.map((j) => ({ url: j.url })),
        newCount,
        updatedCount,
      };
      db.prepare("INSERT INTO run VALUES (?,?,?)").run(
        run.id,
        payloadHash,
        JSON.stringify(result),
      );
      return result;
    });
  }
  function favorite(input) {
    ensure(typeof input?.saved === "boolean", "收藏状态无效");
    const result = db
      .prepare("UPDATE job SET saved=? WHERE id=?")
      .run(Number(input.saved), input.id ?? "");
    ensure(result.changes === 1, "岗位不存在");
    return read();
  }
  function schedule(input) {
    ensure(
      input && ["enabled", "paused", "unconfigured"].includes(input.status),
      "调度状态无效",
    );
    if (input.status === "unconfigured")
      set("schedule", { status: input.status });
    else {
      ensure(
        typeof input.id === "string" &&
          input.id.length > 0 &&
          typeof input.provider === "string" &&
          input.provider.length > 0 &&
          typeof input.description === "string",
        "启用调度需提供已核对的任务 ID、平台、说明和时间",
      );
      set("schedule", {
        status: input.status,
        id: input.id.slice(0, 300),
        provider: input.provider.slice(0, 100),
        description: input.description.slice(0, 2000),
        verifiedAt: date(input.verifiedAt),
      });
    }
    return read();
  }
  return {
    read,
    profile,
    importRun,
    favorite,
    schedule,
    close: () => db.close(),
  };
}
