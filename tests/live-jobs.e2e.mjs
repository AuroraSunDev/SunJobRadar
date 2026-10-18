import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import test from "node:test";

const base = process.env.TEST_BASE_URL || "http://localhost:3015";

test("live jobs endpoint requires login and returns a real-source feed", async () => {
  assert.equal((await fetch(`${base}/api/live-jobs`)).status, 401);
  const signUp = await fetch(`${base}/api/auth/sign-up/email`, {
    method: "POST",
    headers: { "content-type": "application/json", origin: base },
    body: JSON.stringify({ name: "Source Test", email: `source-${randomUUID()}@example.test`, password: "TestPassword123!" }),
  });
  assert.equal(signUp.status, 200);
  const cookie = signUp.headers.getSetCookie().map((value) => value.split(";")[0]).join("; ");
  const response = await fetch(`${base}/api/live-jobs`, { headers: { cookie } });
  assert.equal(response.status, 200);
  const data = await response.json();
  assert.ok(Array.isArray(data.jobs));
  assert.equal(data.source.company, "文远知行");
  assert.ok(["pending", "active", "error"].includes(data.source.status));
  for (const job of data.jobs) assert.match(job.officialUrl, /^https:\/\/jobs\.lever\.co\/weride\//);
});
