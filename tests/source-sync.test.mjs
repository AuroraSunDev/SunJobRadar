import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";

const temp = mkdtempSync(join(tmpdir(), "sunjobradar-source-test-"));
process.env.SUNJOBRADAR_DB_PATH = join(temp, "jobs.sqlite");
const { db, saveWeRideJobs, runWeRideSync } = await import("../src/lib/source-sync.ts");

const job = {
  sourceJobId: "012d6448-fa8c-4a68-8767-d99f4d1b9bea",
  officialUrl: "https://jobs.lever.co/weride/012d6448-fa8c-4a68-8767-d99f4d1b9bea",
  title: "New Grads 2026 - General Software Engineer",
  city: "中国（具体城市见官网）",
  employmentType: "校招 · 全职",
};

test("successive checks preserve first discovery and update last seen", () => {
  assert.deepEqual(saveWeRideJobs([job], "2026-10-18T00:00:00.000Z"), { jobCount: 1, newCount: 1 });
  assert.deepEqual(saveWeRideJobs([job], "2026-10-19T00:00:00.000Z"), { jobCount: 1, newCount: 0 });
  const row = db.prepare("SELECT first_seen_at, last_seen_at FROM job WHERE source_id = 'weride'").get();
  assert.equal(row.first_seen_at, "2026-10-18T00:00:00.000Z");
  assert.equal(row.last_seen_at, "2026-10-19T00:00:00.000Z");
  assert.equal(db.prepare("SELECT COUNT(*) AS n FROM job WHERE source_id = 'weride'").get().n, 1);
  assert.equal(db.prepare("SELECT COUNT(*) AS n FROM source_run WHERE source_id = 'weride' AND status = 'success'").get().n, 2);
});

test("failed source request records failure without changing discovered jobs", async () => {
  await assert.rejects(() => runWeRideSync(async () => new Response("unavailable", { status: 503 })));
  assert.equal(db.prepare("SELECT status FROM source WHERE id = 'weride'").get().status, "error");
  assert.equal(db.prepare("SELECT COUNT(*) AS n FROM job WHERE source_id = 'weride'").get().n, 1);
  assert.equal(db.prepare("SELECT status FROM source_run ORDER BY id DESC LIMIT 1").get().status, "error");
});

test.after(() => {
  db.close();
  rmSync(temp, { recursive: true, force: true });
});
