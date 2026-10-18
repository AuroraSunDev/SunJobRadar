import { auth } from "@/lib/auth";
import { addManualJob, listManualJobs, removeManualJob } from "@/lib/manual-jobs";
import { parseOfficialJobUrl } from "@/lib/official-job-url";

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
  return Response.json({ jobs: listManualJobs(session.user.id) });
}

export async function POST(request: Request) {
  if (!sameOrigin(request)) return Response.json({ error: "来源不允许" }, { status: 403 });
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) return Response.json({ error: "请先登录" }, { status: 401 });
  const input = await request.json().catch(() => null);
  const link = parseOfficialJobUrl(input?.officialUrl);
  const title = typeof input?.title === "string" ? input.title.trim() : "";
  const city = typeof input?.city === "string" ? input.city.trim() : "";
  if (!link || !title || title.length > 120 || city.length > 80) {
    return Response.json({ error: "请填写岗位名称和有效的美团或华为官网岗位详情链接" }, { status: 400 });
  }
  const job = addManualJob(session.user.id, link, title, city);
  if (!job) return Response.json({ error: "这个岗位已保存" }, { status: 409 });
  return Response.json({ job }, { status: 201 });
}

export async function DELETE(request: Request) {
  if (!sameOrigin(request)) return Response.json({ error: "来源不允许" }, { status: 403 });
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) return Response.json({ error: "请先登录" }, { status: 401 });
  const input = await request.json().catch(() => null);
  if (typeof input?.id !== "string" || !removeManualJob(session.user.id, input.id)) {
    return Response.json({ error: "找不到这条记录" }, { status: 404 });
  }
  return new Response(null, { status: 204 });
}
