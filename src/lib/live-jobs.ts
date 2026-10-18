import { db } from "./db";

export type LiveJob = {
  id: string;
  company: string;
  title: string;
  city: string;
  employmentType: string;
  officialUrl: string;
  firstSeenAt: string;
  lastSeenAt: string;
};

export function getLiveFeed() {
  const source = db.prepare("SELECT company, status, last_checked_at, last_success_at FROM source WHERE id = 'weride'")
    .get() as { company: string; status: string; last_checked_at: string | null; last_success_at: string | null };
  const run = db.prepare("SELECT status, job_count, new_count, error_text FROM source_run WHERE source_id = 'weride' ORDER BY id DESC LIMIT 1")
    .get() as { status: string; job_count: number; new_count: number; error_text: string | null } | undefined;
  const successfulRun = db.prepare("SELECT job_count, new_count FROM source_run WHERE source_id = 'weride' AND status = 'success' ORDER BY id DESC LIMIT 1")
    .get() as { job_count: number; new_count: number } | undefined;
  const rows = db.prepare(`SELECT id, title, city, employment_type, official_url, first_seen_at, last_seen_at
    FROM job WHERE source_id = 'weride' AND last_seen_at = ? ORDER BY first_seen_at DESC`)
    .all(source.last_success_at) as {
      id: string; title: string; city: string; employment_type: string; official_url: string;
      first_seen_at: string; last_seen_at: string;
    }[];
  return {
    source: {
      company: source.company,
      status: source.status,
      lastCheckedAt: source.last_checked_at,
      lastSuccessAt: source.last_success_at,
      jobCount: successfulRun?.job_count ?? null,
      newCount: successfulRun?.new_count ?? null,
      error: run?.status === "error" ? run.error_text : null,
    },
    jobs: rows.map((row): LiveJob => ({
      id: row.id,
      company: source.company,
      title: row.title,
      city: row.city,
      employmentType: row.employment_type,
      officialUrl: row.official_url,
      firstSeenAt: row.first_seen_at,
      lastSeenAt: row.last_seen_at,
    })),
  };
}
