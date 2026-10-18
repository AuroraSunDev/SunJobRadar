export type OfficialJobLink = {
  sourceId: "meituan" | "huawei";
  sourceJobId: string;
  officialUrl: string;
};

export function parseOfficialJobUrl(input: unknown): OfficialJobLink | null {
  if (typeof input !== "string" || input.length > 1000) return null;
  let url: URL;
  try {
    url = new URL(input.trim());
  } catch {
    return null;
  }
  if (url.protocol !== "https:" || url.username || url.password || url.port) return null;

  let sourceId: OfficialJobLink["sourceId"];
  let idParameter: string;
  if (url.hostname === "zhaopin.meituan.com" && url.pathname === "/web/position/detail") {
    sourceId = "meituan";
    idParameter = "jobUnionId";
  } else if (url.hostname === "career.huawei.com"
    && url.pathname === "/reccampportal/portal5/campus-recruitment-detail.html") {
    sourceId = "huawei";
    idParameter = "jobId";
  } else return null;

  const ids = url.searchParams.getAll(idParameter);
  if (ids.length !== 1 || !/^\d{1,20}$/.test(ids[0])) return null;
  const parameters = new URLSearchParams([[idParameter, ids[0]]]);
  if (sourceId === "huawei") {
    for (const key of ["dataSource", "jobType", "recruitType", "sourceType"]) {
      const values = url.searchParams.getAll(key);
      if (values.length === 1 && /^[A-Za-z0-9_-]{1,20}$/.test(values[0])) parameters.set(key, values[0]);
    }
  }
  url.search = parameters.toString();
  url.hash = "";
  return { sourceId, sourceJobId: ids[0], officialUrl: url.toString() };
}
