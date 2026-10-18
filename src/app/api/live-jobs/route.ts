import { auth } from "@/lib/auth";
import { getLiveFeed } from "@/lib/live-jobs";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) return Response.json({ error: "请先登录" }, { status: 401 });
  return Response.json(getLiveFeed());
}
