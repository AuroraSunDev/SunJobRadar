import { isIP } from "node:net";

export const states = [
  "matched",
  "partial",
  "gap",
  "unknown",
  "not_applicable",
];
export const recommendations = ["recommended", "cautious", "stretch", "skip"];
export function ensure(ok, message) {
  if (!ok) throw new Error(message);
}
function text(value, max = 1000) {
  ensure(
    typeof value === "string" && value.trim().length > 0 && value.length <= max,
    "文字字段为空或过长",
  );
  return value.trim();
}
function list(value, max = 30) {
  ensure(Array.isArray(value) && value.length <= max, "列表格式无效");
  return [...new Set(value.map((v) => text(v, 200)))];
}
export function date(value) {
  ensure(
    typeof value === "string" &&
      /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/.test(
        value,
      ) &&
      Number.isFinite(Date.parse(value)),
    "时间必须为带时区的 ISO 日期",
  );
  ensure(
    new Date(value.slice(0, 10) + "T00:00:00Z").toISOString().slice(0, 10) ===
      value.slice(0, 10),
    "日期无效",
  );
  return new Date(value).toISOString();
}
export function canonicalUrl(value) {
  const url = new URL(value);
  ensure(
    url.protocol === "https:" && !url.username && !url.password && !url.port,
    "仅接受无凭据的公网 HTTPS 原始链接",
  );
  ensure(
    !isIP(url.hostname) &&
      url.hostname.includes(".") &&
      !url.hostname.endsWith(".") &&
      !/(^|\.)(localhost|local|internal|test|invalid)$/.test(url.hostname) &&
      !url.hostname.includes(":"),
    "拒绝本机或私网链接",
  );
  for (const key of [...url.searchParams.keys()])
    if (/^(utm_|fbclid$|gclid$|ref$)/i.test(key)) url.searchParams.delete(key);
  url.searchParams.sort();
  return url.href;
}
export function parseProfile(input) {
  ensure(
    input && input.confirmed === true,
    "请先由用户确认画像，设置 confirmed: true",
  );
  const graduation = input.graduation ?? "";
  ensure(
    graduation === "" || /^\d{4}-(0[1-9]|1[0-2])$/.test(graduation),
    "毕业月份格式应为 YYYY-MM，可留空",
  );
  const roles = list(input.roles);
  ensure(roles.length > 0, "至少填写一个目标方向");
  ensure(
    Array.isArray(input.facts) && input.facts.length <= 100,
    "事实列表无效",
  );
  const facts = input.facts.map((f) => ({
    id: text(f.id, 80),
    text: text(f.text, 3000),
    source: text(f.source, 500),
    boundary: text(f.boundary || "以原始材料和本人确认的范围为准", 1000),
  }));
  ensure(new Set(facts.map((f) => f.id)).size === facts.length, "事实 ID 重复");
  ensure(
    input.schedule && typeof input.schedule.timezone === "string",
    "请先确认检索间隔、时间及时区",
  );
  const schedule = input.schedule;
  ensure(
    Number.isInteger(schedule.everyDays) &&
      schedule.everyDays >= 1 &&
      schedule.everyDays <= 365,
    "检索间隔无效",
  );
  ensure(/^([01]\d|2[0-3]):[0-5]\d$/.test(schedule.time), "检索时间无效");
  new Intl.DateTimeFormat("zh-CN", { timeZone: schedule.timezone }).format();
  return {
    confirmed: true,
    name: text(input.name || "我的工作台", 100),
    graduation,
    recruitment: text(input.recruitment || "待确认", 100),
    roles,
    cities: list(input.cities ?? []),
    mustHave: list(input.mustHave ?? []),
    exclusions: list(input.exclusions ?? []),
    summary:
      typeof input.summary === "string" ? input.summary.slice(0, 6000) : "",
    facts,
    schedule: {
      everyDays: schedule.everyDays,
      time: schedule.time,
      timezone: schedule.timezone,
    },
  };
}
export function parseRun(input, profile) {
  ensure(profile, "请先初始化求职画像");
  ensure(
    input && ["success", "partial", "error"].includes(input.status),
    "检索状态无效",
  );
  const id = text(input.id, 160),
    startedAt = date(input.startedAt),
    completedAt = date(input.completedAt);
  ensure(completedAt >= startedAt, "完成时间不能早于开始时间");
  ensure(
    Array.isArray(input.sources) &&
      input.sources.length > 0 &&
      input.sources.length <= 200,
    "需要来源记录",
  );
  const sources = input.sources.map((s) => {
    ensure(
      ["full", "partial", "discovery", "error", "blocked"].includes(s.status),
      "来源状态无效",
    );
    return {
      url: canonicalUrl(s.url),
      status: s.status,
      note: text(s.note, 2000),
    };
  });
  ensure(
    Array.isArray(input.jobs) && input.jobs.length <= 500,
    "岗位列表过大或无效",
  );
  ensure(
    input.status !== "error" || input.jobs.length === 0,
    "失败检索不得包含成功岗位",
  );
  const facts = new Set(profile.facts.map((f) => f.id));
  const jobs = input.jobs.map((j) => {
    ensure(
      j.profileVersion === profile.version,
      "画像版本已改变，请重新分析后导入",
    );
    ensure(
      ["full", "partial", "discovery"].includes(j.sourceStatus),
      "岗位来源状态无效",
    );
    const url = canonicalUrl(j.url),
      observedAt = date(j.observedAt);
    ensure(observedAt <= completedAt, "读取时间不能晚于完成时间");
    ensure(
      sources.some((s) => s.url === url && s.status === j.sourceStatus),
      "岗位需对应相同状态的来源记录",
    );
    const jd = typeof j.jd === "string" ? j.jd.trim() : "";
    ensure(jd.length <= 100000, "JD 过长");
    ensure(
      j.sourceStatus === "discovery" ? jd === "" : jd.length > 0,
      "来源状态与 JD 证据不一致",
    );
    ensure(
      Array.isArray(j.requirements) && j.requirements.length <= 100,
      "要求列表无效",
    );
    const requirements = j.requirements.map((r) => {
      ensure(states.includes(r.state), "要求匹配状态无效");
      const factIds = list(r.factIds ?? [], 100);
      ensure(
        factIds.every((id) => facts.has(id)),
        "引用了不存在的事实",
      );
      const evidence = typeof r.evidence === "string" ? r.evidence.trim() : "";
      ensure(
        evidence.length === 0 || jd.includes(evidence),
        "要求引文不存在于本次 JD",
      );
      ensure(
        !["matched", "partial"].includes(r.state) ||
          (factIds.length > 0 && evidence.length > 0),
        "已匹配要求需要 JD 引文与事实依据",
      );
      return {
        text: text(r.text, 2000),
        state: r.state,
        must: r.must === true,
        factIds,
        evidence,
        reason: text(r.reason, 3000),
      };
    });
    ensure(
      j.sourceStatus !== "discovery" || requirements.length === 0,
      "仅发现链接不能生成要求分析",
    );
    ensure(recommendations.includes(j.recommendation), "投递建议无效");
    ensure(
      !(
        j.recommendation === "recommended" &&
        (j.sourceStatus !== "full" ||
          requirements.length === 0 ||
          requirements.some(
            (r) => r.must && !["matched", "not_applicable"].includes(r.state),
          ))
      ),
      "证据不全或硬性要求未满足，不能标为推荐投递",
    );
    const cited = new Set(requirements.flatMap((r) => r.factIds));
    return {
      url,
      title: text(j.title, 500),
      company: text(j.company, 300),
      city: typeof j.city === "string" ? j.city.slice(0, 500) : "待核对",
      roles: list(j.roles ?? []),
      observedAt,
      sourceStatus: j.sourceStatus,
      jd,
      requirements,
      factSnapshot: profile.facts.filter((f) => cited.has(f.id)),
      recommendation: j.recommendation,
      summary: text(j.summary, 5000),
      profileVersion: profile.version,
    };
  });
  ensure(
    new Set(jobs.map((j) => j.url)).size === jobs.length,
    "同一检索内岗位网址重复",
  );
  ensure(
    input.status !== "success" ||
      sources.every((s) => ["full", "partial", "discovery"].includes(s.status)),
    "包含失败来源时应标记部分完成或失败",
  );
  return { id, startedAt, completedAt, status: input.status, sources, jobs };
}
export function markdown(job, profile) {
  const lines = [
    `# ${job.company} · ${job.title}`,
    "",
    `原始网址：${job.url}`,
    `城市：${job.city}`,
    `证据：${job.sourceStatus}；读取时间：${job.observedAt}`,
    `画像版本：${job.profileVersion}；当前：${profile.version}`,
    job.stale ? "**分析已过期，请重新匹配后使用。**" : "",
    `建议：${job.recommendation}`,
    job.summary,
    "",
    "## 岗位要求与证据",
  ];
  const evidenceFacts = job.factSnapshot ?? (job.stale ? [] : profile.facts);
  for (const r of job.requirements) {
    lines.push(
      `- ${r.text}：${r.state}。${r.reason}`,
      `  JD 引文：${r.evidence || "未取得"}`,
    );
    for (const id of r.factIds) {
      const f = evidenceFacts.find((f) => f.id === id);
      lines.push(
        f
          ? `  原分析事实 ${id}：${f.text}；来源：${f.source}；边界：${f.boundary}`
          : `  事实 ${id}：未保留历史内容，需重新核对。`,
      );
    }
  }
  lines.push(
    "",
    "## 已保存的 JD 证据",
    job.jd || "仅发现链接，未读到正文。",
    "",
    "本文件仅用于申请准备，不代表已填表或已提交申请。",
  );
  return lines.filter((v) => v !== undefined).join("\n");
}
