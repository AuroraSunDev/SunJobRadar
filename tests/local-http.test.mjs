import test from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { once } from "node:events";
import { request } from "node:http";
import { spawnSync } from "node:child_process";
import { createApp } from "../templates/local-workbench/server.mjs";

test("loopback UI requires pairing and blocks hostile hosts and origins", async (t) => {
  const home = mkdtempSync(join(tmpdir(), "radar-http-"));
  const app = createApp(home);
  app.server.listen(0, "127.0.0.1");
  await once(app.server, "listening");
  t.after(async () => {
    await new Promise((r) => app.server.close(r));
    app.close();
    rmSync(home, { recursive: true, force: true });
  });
  const base = `http://127.0.0.1:${app.server.address().port}`;
  assert.equal((await fetch(base + "/api/state")).status, 401);
  const hostileStatus = await new Promise((resolve, reject) => {
    const req = request(
      base + "/api/state",
      { headers: { host: "attacker.example" } },
      (res) => {
        res.resume();
        resolve(res.statusCode);
      },
    );
    req.on("error", reject);
    req.end();
  });
  assert.equal(hostileStatus, 403);
  const key = readFileSync(join(home, "access-key"), "utf8").trim();
  assert.equal(
    (
      await fetch(base + "/api/connect", {
        method: "POST",
        headers: {
          origin: "https://evil.example",
          "content-type": "application/json",
        },
        body: JSON.stringify({ key }),
      })
    ).status,
    403,
  );
  const connected = await fetch(base + "/api/connect", {
    method: "POST",
    headers: { origin: base, "content-type": "application/json" },
    body: JSON.stringify({ key }),
  });
  assert.equal(connected.status, 200);
  assert.match(connected.headers.get("set-cookie"), /HttpOnly/);
  const cookie = connected.headers.get("set-cookie").split(";")[0];
  const headers = { origin: base, cookie, "content-type": "application/json" };
  assert.equal(
    (
      await fetch(base + "/api/profile", {
        method: "POST",
        headers,
        body: JSON.stringify({
          confirmed: true,
          name: "测试",
          roles: ["软件开发"],
          facts: [],
          schedule: { everyDays: 2, time: "10:00", timezone: "Asia/Shanghai" },
        }),
      })
    ).status,
    200,
  );
  const state = await (
    await fetch(base + "/api/state", { headers: { cookie } })
  ).json();
  assert.equal(state.profile.version, 1);
  assert.equal(
    (
      await fetch(base + "/api/profile", {
        method: "POST",
        headers: { ...headers, origin: "http://evil.example" },
        body: "{}",
      })
    ).status,
    403,
  );
  assert.equal(
    (
      await fetch(base + "/api/profile", {
        method: "POST",
        headers: { cookie, "content-type": "application/json" },
        body: "{}",
      })
    ).status,
    403,
  );
  assert.equal(
    (
      await fetch(base + "/api/profile", {
        method: "POST",
        headers: { ...headers, "content-type": "text/plain" },
        body: "{}",
      })
    ).status,
    415,
  );
  assert.equal(
    (
      await fetch(base + "/api/profile", {
        method: "POST",
        headers,
        body: "x".repeat(2 * 1024 * 1024 + 1),
      })
    ).status,
    413,
  );
  assert.equal((await fetch(base + "/not-real")).status, 404);
  assert.equal(
    (await fetch(base + "/")).headers
      .get("content-security-policy")
      .includes("script-src 'self'"),
    true,
  );
});

test("malformed unauthenticated request targets cannot terminate the local service", (t) => {
  const home = mkdtempSync(join(tmpdir(), "radar-url-"));
  t.after(() => rmSync(home, { recursive: true, force: true }));
  const script = `import {createApp} from ${JSON.stringify(new URL("../templates/local-workbench/server.mjs", import.meta.url).href)};import{request}from'node:http';const app=createApp(process.argv[1]);app.server.listen(0,'127.0.0.1',()=>{const port=app.server.address().port;const req=request({hostname:'127.0.0.1',port,path:'//[',headers:{'Sec-Fetch-Site':'cross-site'}},async res=>{res.resume();console.log(res.statusCode);console.log((await fetch('http://127.0.0.1:'+port+'/api/state')).status);app.server.close(()=>app.close());});req.end();});`;
  const result = spawnSync(
    process.execPath,
    ["--input-type=module", "-e", script, home],
    { encoding: "utf8", timeout: 5000 },
  );
  assert.equal(result.status, 0, result.stderr);
  assert.equal(result.stdout.trim(), "400\n401");
});
