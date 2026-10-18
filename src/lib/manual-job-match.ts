import type { SearchProfile } from "./profile";

type Check = { status: "match" | "mismatch" | "unknown"; text: string };
type ManualJobFields = { sourceId: "meituan" | "huawei"; title: string; city: string };

export type ManualMatch = { company: Check; city: Check; role: Check };

const companyName = { meituan: "美团", huawei: "华为" };

function normalizeCity(value: string) {
  return value.trim().replace(/市$/, "");
}

function normalizeTitle(value: string) {
  return value.replace(/\s+/g, "").toLowerCase();
}

export function evaluateManualJob(profile: SearchProfile | null, job: ManualJobFields): ManualMatch | null {
  if (!profile) return null;
  const company = companyName[job.sourceId];
  const companyMatches = profile.companies.includes(company);
  const city = job.city.trim();
  const cityMatches = city && profile.cities.some((target) => normalizeCity(target) === normalizeCity(city));
  const role = profile.roles.find((target) => normalizeTitle(job.title).includes(normalizeTitle(target)));
  return {
    company: {
      status: companyMatches ? "match" : "mismatch",
      text: `${companyMatches ? "目标企业" : "非目标企业"}：${company}`,
    },
    city: city ? {
      status: cityMatches ? "match" : "mismatch",
      text: `${cityMatches ? "目标城市" : "非目标城市"}：${city}`,
    } : { status: "unknown", text: "城市待确认" },
    role: role ? { status: "match", text: `名称命中：${role}` }
      : { status: "unknown", text: "名称未命中目标岗位词，需核对" },
  };
}
