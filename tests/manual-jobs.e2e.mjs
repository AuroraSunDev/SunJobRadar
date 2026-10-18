import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import test from "node:test";

const base = process.env.TEST_BASE_URL || "http://localhost:3012";
const officialUrl = "https://zhaopin.meituan.com/web/position/detail?jobUnionId=4383089295";

async function createAccount() {
  const response = await fetch(`${base}/api/auth/sign-up/email`, {
    method: "POST",
    headers: { "content-type": "application/json", origin: base },
    body: JSON.stringify({ name: "Test User", email: `job-${randomUUID()}@example.test`, password: "TestPassword123!" }),
  });
  assert.equal(response.status, 200);
  return response.headers.getSetCookie().map((cookie) => cookie.split(";")[0]).join("; ");
}

async function request(path, cookie, method = "GET", body, origin) {
  return fetch(`${base}${path}`, {
    method,
    headers: {
      cookie,
      ...(body ? { "content-type": "application/json" } : {}),
      ...(origin ? { origin } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
}

test("manual official links are validated, deduplicated, private, and removable", async () => {
  const a = await createAccount();
  const b = await createAccount();
  assert.equal((await request("/api/manual-jobs", "")).status, 401);
  assert.equal((await request("/api/manual-jobs", a, "POST", { officialUrl, title: "AI 产品经理", city: "北京" }, "https://evil.test")).status, 403);
  assert.equal((await request("/api/manual-jobs", a, "POST", {
    officialUrl: "https://zhaopin.meituan.com.evil.test/web/position/detail?jobUnionId=4383089295",
    title: "假岗位", city: "北京",
  })).status, 400);

  const added = await request("/api/manual-jobs", a, "POST", { officialUrl, title: "AI 产品经理", city: "北京" });
  assert.equal(added.status, 201);
  const { job } = await added.json();
  assert.equal(job.officialUrl, officialUrl);
  assert.equal(job.sourceId, "meituan");
  assert.equal(job.title, "AI 产品经理");
  assert.equal((await request("/api/manual-jobs", a, "POST", { officialUrl, title: "重复", city: "北京" })).status, 409);

  const aJobs = await (await request("/api/manual-jobs", a)).json();
  const bJobs = await (await request("/api/manual-jobs", b)).json();
  assert.equal(aJobs.jobs.length, 1);
  assert.deepEqual(bJobs.jobs, []);
  assert.equal((await request("/api/manual-jobs", b, "DELETE", { id: job.id })).status, 404);
  assert.equal((await request("/api/manual-jobs", a, "DELETE", { id: job.id })).status, 204);
  assert.deepEqual((await (await request("/api/manual-jobs", a)).json()).jobs, []);
});
