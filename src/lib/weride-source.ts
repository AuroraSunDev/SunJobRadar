export type SourceJob = {
  sourceJobId: string;
  officialUrl: string;
  title: string;
  city: string;
  employmentType: string;
};

type LeverPosting = {
  id?: unknown;
  text?: unknown;
  hostedUrl?: unknown;
  categories?: { team?: unknown; location?: unknown; commitment?: unknown };
};

export function parseWeRideJobs(payload: unknown): SourceJob[] {
  if (!Array.isArray(payload)) throw new Error("职位接口返回格式异常");
  const seen = new Set<string>();
  const jobs: SourceJob[] = [];
  for (const item of payload as LeverPosting[]) {
    if (item?.categories?.team !== "Campus Recruiting" || item.categories.location !== "China") continue;
    if (typeof item.id !== "string" || typeof item.text !== "string" || typeof item.hostedUrl !== "string") {
      throw new Error("校招岗位字段不完整");
    }
    const url = new URL(item.hostedUrl);
    if (url.protocol !== "https:" || url.hostname !== "jobs.lever.co" || url.pathname !== `/weride/${item.id}` || seen.has(item.id)) {
      throw new Error("校招岗位链接或编号异常");
    }
    seen.add(item.id);
    jobs.push({
      sourceJobId: item.id,
      officialUrl: url.href,
      title: item.text.trim(),
      city: "中国（具体城市见官网）",
      employmentType: item.categories.commitment === "Full-time" ? "校招 · 全职" : "校招 · 类型待确认",
    });
  }
  return jobs;
}
