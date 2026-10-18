export type SearchProfile = {
  year: string;
  type: string;
  roles: string[];
  cities: string[];
  companies: string[];
  exclusions: string[];
  frequency: string;
  time: string;
};

function stringList(value: unknown, required: boolean) {
  return Array.isArray(value) && (!required || value.length > 0) && value.length <= 20
    && value.every((item) => typeof item === "string" && item.length > 0 && item.length <= 80);
}

export function parseProfile(value: unknown): SearchProfile | null {
  if (!value || typeof value !== "object") return null;
  const item = value as Record<string, unknown>;
  if (!["2026 届", "2027 届", "2028 届"].includes(String(item.year))
    || !["校招", "实习", "社招"].includes(String(item.type))
    || !stringList(item.roles, true)
    || !stringList(item.cities, true)
    || !stringList(item.companies, true)
    || !stringList(item.exclusions, false)
    || !["每天", "每两天", "每周"].includes(String(item.frequency))
    || !["08:00", "10:00", "18:00"].includes(String(item.time))) return null;
  return item as SearchProfile;
}
