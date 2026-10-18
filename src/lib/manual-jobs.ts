import { randomUUID } from "node:crypto";
import { db } from "./db";
import type { OfficialJobLink } from "./official-job-url";

export type ManualJob = OfficialJobLink & {
  id: string;
  title: string;
  city: string;
  createdAt: string;
};

type Row = {
  id: string;
  source_id: OfficialJobLink["sourceId"];
  source_job_id: string;
  official_url: string;
  title: string;
  city: string;
  created_at: string;
};

function toJob(row: Row): ManualJob {
  return {
    id: row.id,
    sourceId: row.source_id,
    sourceJobId: row.source_job_id,
    officialUrl: row.official_url,
    title: row.title,
    city: row.city,
    createdAt: row.created_at,
  };
}

export function listManualJobs(userId: string): ManualJob[] {
  const rows = db.prepare("SELECT * FROM manual_job WHERE user_id = ? ORDER BY created_at DESC").all(userId) as Row[];
  return rows.map(toJob);
}

export function addManualJob(userId: string, link: OfficialJobLink, title: string, city: string): ManualJob | null {
  const job: ManualJob = { ...link, id: randomUUID(), title, city, createdAt: new Date().toISOString() };
  const result = db.prepare(`INSERT OR IGNORE INTO manual_job
    (id, user_id, source_id, source_job_id, official_url, title, city, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)`).run(job.id, userId, job.sourceId, job.sourceJobId,
    job.officialUrl, job.title, job.city, job.createdAt);
  return result.changes ? job : null;
}

export function removeManualJob(userId: string, id: string): boolean {
  return db.prepare("DELETE FROM manual_job WHERE user_id = ? AND id = ?").run(userId, id).changes > 0;
}
