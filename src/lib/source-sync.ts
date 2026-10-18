import { db } from "./db.ts";
import { parseWeRideJobs, type SourceJob } from "./weride-source.ts";

export function saveWeRideJobs(jobs: SourceJob[], checkedAt: string) {
  let newCount = 0;
  db.exec("BEGIN");
  try {
    for (const job of jobs) {
      const inserted = db.prepare(`INSERT OR IGNORE INTO job
        (id, source_id, source_job_id, official_url, title, city, employment_type, raw_json, first_seen_at, last_seen_at)
        VALUES (?, 'weride', ?, ?, ?, ?, ?, '{}', ?, ?)`)
        .run(`weride:${job.sourceJobId}`, job.sourceJobId, job.officialUrl, job.title, job.city,
          job.employmentType, checkedAt, checkedAt);
      if (inserted.changes) newCount++;
      else db.prepare(`UPDATE job SET official_url = ?, title = ?, city = ?, employment_type = ?, last_seen_at = ?
        WHERE source_id = 'weride' AND source_job_id = ?`)
        .run(job.officialUrl, job.title, job.city, job.employmentType, checkedAt, job.sourceJobId);
    }
    db.prepare("UPDATE source SET status = 'active', last_checked_at = ?, last_success_at = ? WHERE id = 'weride'")
      .run(checkedAt, checkedAt);
    db.prepare(`INSERT INTO source_run (source_id, checked_at, status, job_count, new_count)
      VALUES ('weride', ?, 'success', ?, ?)`)
      .run(checkedAt, jobs.length, newCount);
    db.exec("COMMIT");
    return { jobCount: jobs.length, newCount };
  } catch (error) {
    db.exec("ROLLBACK");
    throw error;
  }
}

export async function runWeRideSync(fetcher: typeof fetch = fetch) {
  const checkedAt = new Date().toISOString();
  try {
    const response = await fetcher("https://api.lever.co/v0/postings/weride?mode=json", {
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(15000),
    });
    if (!response.ok) throw new Error(`职位接口返回 HTTP ${response.status}`);
    const jobs = parseWeRideJobs(await response.json());
    return saveWeRideJobs(jobs, checkedAt);
  } catch (error) {
    const message = error instanceof Error ? error.message : "未知错误";
    db.prepare("UPDATE source SET status = 'error', last_checked_at = ? WHERE id = 'weride'").run(checkedAt);
    db.prepare(`INSERT INTO source_run (source_id, checked_at, status, error_text)
      VALUES ('weride', ?, 'error', ?)`)
      .run(checkedAt, message.slice(0, 300));
    throw error;
  }
}

export { db };
