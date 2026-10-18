import { auth } from "@/lib/auth";
import { jobs } from "@/lib/jobs";
import { parseProfile } from "@/lib/profile";
import { getUserState, putJobState, putProfile } from "@/lib/state";
import { db } from "@/lib/db";

export const runtime = "nodejs";

function sameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  const host = request.headers.get("host");
  if (!origin) return true;
  try {
    return Boolean(host) && new URL(origin).host === host;
  } catch {
    return false;
  }
}

export async function GET(request: Request) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) return Response.json({ error: "请先登录" }, { status: 401 });
  return Response.json(getUserState(session.user.id));
}

export async function PUT(request: Request) {
  if (!sameOrigin(request)) return Response.json({ error: "来源不允许" }, { status: 403 });
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) return Response.json({ error: "请先登录" }, { status: 401 });
  const profile = parseProfile(await request.json().catch(() => null));
  if (!profile) return Response.json({ error: "求职设置无效" }, { status: 400 });
  putProfile(session.user.id, profile);
  return Response.json({ ok: true });
}

export async function POST(request: Request) {
  if (!sameOrigin(request)) return Response.json({ error: "来源不允许" }, { status: 403 });
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) return Response.json({ error: "请先登录" }, { status: 401 });
  const input = await request.json().catch(() => null);
  if (!input || !["saved", "hidden"].includes(input.field) || typeof input.value !== "boolean"
    || typeof input.id !== "string" || !jobs.some((job) => job.id === input.id)) {
    return Response.json({ error: "岗位设置无效" }, { status: 400 });
  }
  putJobState(session.user.id, input.id, input.field, input.value);
  return Response.json({ ok: true });
}

export async function PATCH(request: Request) {
  if (!sameOrigin(request)) return Response.json({ error: "来源不允许" }, { status: 403 });
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) return Response.json({ error: "请先登录" }, { status: 401 });
  if (getUserState(session.user.id).profile) return Response.json({ error: "已有求职画像" }, { status: 409 });
  const input = await request.json().catch(() => null);
  const profile = parseProfile(input?.profile);
  const knownIds = new Set(jobs.map((job) => job.id));
  const validIds = (value: unknown) => Array.isArray(value) && value.length <= knownIds.size
    && value.every((id) => typeof id === "string" && knownIds.has(id));
  if (!profile || !validIds(input?.savedIds) || !validIds(input?.hiddenIds)) {
    return Response.json({ error: "旧设置无效" }, { status: 400 });
  }
  db.exec("BEGIN");
  try {
    putProfile(session.user.id, profile);
    for (const id of new Set(input.savedIds as string[])) putJobState(session.user.id, id, "saved", true);
    for (const id of new Set(input.hiddenIds as string[])) putJobState(session.user.id, id, "hidden", true);
    db.exec("COMMIT");
  } catch {
    db.exec("ROLLBACK");
    return Response.json({ error: "导入失败" }, { status: 500 });
  }
  return Response.json(getUserState(session.user.id));
}
