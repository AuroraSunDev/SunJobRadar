import { createServer } from "node:http";
import { randomBytes, timingSafeEqual } from "node:crypto";
import { existsSync, readFileSync, writeFileSync, chmodSync } from "node:fs";
import { join } from "node:path";
import { openStore } from "./store.mjs";
import { markdown } from "./domain.mjs";

const MAX_BODY = 2 * 1024 * 1024;
function same(a, b) {
  return (
    typeof a === "string" &&
    Buffer.byteLength(a) === Buffer.byteLength(b) &&
    timingSafeEqual(Buffer.from(a), Buffer.from(b))
  );
}
export function createApp(home) {
  const store = openStore(home),
    file = join(home, "access-key");
  if (!existsSync(file))
    writeFileSync(file, randomBytes(32).toString("hex"), {
      mode: 0o600,
      flag: "wx",
    });
  chmodSync(file, 0o600);
  const key = readFileSync(file, "utf8").trim(),
    session = randomBytes(32).toString("hex");
  let attempts = 0,
    windowStart = Date.now();
  const server = createServer(async (req, res) => {
    res.setHeader("Cache-Control", "no-store");
    res.setHeader("Referrer-Policy", "no-referrer");
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader(
      "Content-Security-Policy",
      "default-src 'self'; script-src 'self'; style-src 'self'; connect-src 'self'; img-src 'self' data:; base-uri 'none'; frame-ancestors 'none'; form-action 'self'",
    );
    const send = (status, data) => {
      res.statusCode = status;
      res.setHeader("Content-Type", "application/json; charset=utf-8");
      res.end(JSON.stringify(data));
    };
    const host = req.headers.host,
      port = server.address()?.port;
    if (![`127.0.0.1:${port}`, `localhost:${port}`].includes(host))
      return send(403, { error: "仅限通过本机地址访问" });
    let url;
    try {
      if (
        !req.url.startsWith("/") ||
        req.url.startsWith("//") ||
        req.url.includes("\\")
      )
        throw new Error();
      url = new URL(req.url, `http://${host}`);
    } catch {
      return send(400, { error: "请求地址无效" });
    }
    const api = url.pathname.startsWith("/api/");
    const origin = `http://${host}`;
    if (api && req.headers["sec-fetch-site"] === "cross-site")
      return send(403, { error: "拒绝跨站请求" });
    if (api && req.method !== "GET") {
      if (req.headers.origin !== origin)
        return send(403, { error: "写入请求必须来自同一本机页面" });
      if (req.headers["content-type"]?.split(";")[0] !== "application/json")
        return send(415, { error: "需要 JSON 请求" });
      if (Number(req.headers["content-length"]) > MAX_BODY) {
        req.resume();
        return send(413, { error: "请求过大" });
      }
    }
    const cookie = /(?:^|;\s*)radar_session=([^;]*)/.exec(
      req.headers.cookie ?? "",
    )?.[1];
    const authenticated = same(cookie, session);
    try {
      if (api) {
        if (url.pathname !== "/api/connect" && !authenticated)
          return send(401, { error: "请先输入本机访问码" });
        let input;
        if (req.method === "POST") {
          let size = 0;
          const chunks = [];
          for await (const chunk of req) {
            size += chunk.length;
            if (size <= MAX_BODY) chunks.push(chunk);
          }
          if (size > MAX_BODY) return send(413, { error: "请求过大" });
          input = JSON.parse(Buffer.concat(chunks).toString("utf8"));
        }
        if (req.method === "POST" && url.pathname === "/api/connect") {
          if (Date.now() - windowStart > 60000) {
            attempts = 0;
            windowStart = Date.now();
          }
          if (++attempts > 10)
            return send(429, { error: "尝试过多，请一分钟后重试" });
          if (!same(input.key, key))
            return send(401, { error: "访问码不正确" });
          attempts = 0;
          res.setHeader(
            "Set-Cookie",
            `radar_session=${session}; HttpOnly; SameSite=Strict; Path=/`,
          );
          return send(200, { ok: true });
        }
        if (req.method === "GET" && url.pathname === "/api/state")
          return send(200, store.read());
        if (req.method === "POST" && url.pathname === "/api/profile")
          return send(200, store.profile(input, !store.read().profile));
        if (req.method === "POST" && url.pathname === "/api/favorite")
          return send(200, store.favorite(input));
        if (req.method === "GET" && url.pathname === "/api/export") {
          const state = store.read(),
            job = state.jobs.find((j) => j.id === url.searchParams.get("id"));
          if (!job) return send(404, { error: "岗位不存在" });
          res.setHeader("Content-Type", "text/markdown; charset=utf-8");
          res.setHeader(
            "Content-Disposition",
            'attachment; filename="application-preparation.md"',
          );
          return res.end(markdown(job, state.profile));
        }
        return send(404, { error: "接口不存在" });
      }
      if (req.method !== "GET") return send(405, { error: "方法不支持" });
      const assets = {
          "/": "index.html",
          "/app.js": "app.js",
          "/style.css": "style.css",
          "/favicon.svg": "favicon.svg",
        },
        asset = assets[url.pathname];
      if (!asset) return send(404, { error: "页面不存在" });
      res.setHeader(
        "Content-Type",
        {
          html: "text/html; charset=utf-8",
          js: "text/javascript; charset=utf-8",
          css: "text/css; charset=utf-8",
          svg: "image/svg+xml",
        }[asset.split(".").pop()],
      );
      res.end(readFileSync(join(import.meta.dirname, "public", asset)));
    } catch (error) {
      send(400, {
        error: error instanceof SyntaxError ? "JSON 格式无效" : error.message,
      });
    }
  });
  server.requestTimeout = 30000;
  return { server, close: () => store.close() };
}
export async function serve(home) {
  const port = Number(process.env.PORT || 4173);
  if (!Number.isInteger(port) || port < 1 || port > 65535)
    throw new Error("PORT 必须为有效端口");
  const app = createApp(home);
  await new Promise((resolve, reject) => {
    app.server.once("error", reject);
    app.server.listen(port, "127.0.0.1", resolve);
  });
  console.log(
    `SunJobRadar 已启动：http://127.0.0.1:${port}\n本机访问码保存在：${join(home, "access-key")}\n仅限本机访问；关闭进程后服务停止。`,
  );
  const stop = () =>
    app.server.close(() => {
      app.close();
      process.exit(0);
    });
  process.once("SIGINT", stop);
  process.once("SIGTERM", stop);
}
