import { db } from "./db";
import type { SearchProfile } from "./profile";

export type UserState = {
  profile: SearchProfile | null;
  savedIds: string[];
  hiddenIds: string[];
};

export function getUserState(userId: string): UserState {
  const row = db.prepare("SELECT profile_json FROM search_profile WHERE user_id = ?").get(userId) as { profile_json: string } | undefined;
  const states = db.prepare("SELECT job_id, saved, hidden FROM user_job_state WHERE user_id = ?").all(userId) as { job_id: string; saved: number; hidden: number }[];
  return {
    profile: row ? JSON.parse(row.profile_json) as SearchProfile : null,
    savedIds: states.filter((item) => item.saved).map((item) => item.job_id),
    hiddenIds: states.filter((item) => item.hidden).map((item) => item.job_id),
  };
}

export function putProfile(userId: string, profile: SearchProfile) {
  db.prepare(`INSERT INTO search_profile (user_id, profile_json, updated_at) VALUES (?, ?, ?)
    ON CONFLICT(user_id) DO UPDATE SET profile_json = excluded.profile_json, updated_at = excluded.updated_at`)
    .run(userId, JSON.stringify(profile), new Date().toISOString());
}

export function putJobState(userId: string, jobId: string, field: "saved" | "hidden", value: boolean) {
  const row = db.prepare("SELECT saved, hidden FROM user_job_state WHERE user_id = ? AND job_id = ?").get(userId, jobId) as { saved: number; hidden: number } | undefined;
  const saved = field === "saved" ? value : Boolean(row?.saved);
  const hidden = field === "hidden" ? value : Boolean(row?.hidden);
  if (!saved && !hidden) {
    db.prepare("DELETE FROM user_job_state WHERE user_id = ? AND job_id = ?").run(userId, jobId);
    return;
  }
  db.prepare(`INSERT INTO user_job_state (user_id, job_id, saved, hidden) VALUES (?, ?, ?, ?)
    ON CONFLICT(user_id, job_id) DO UPDATE SET saved = excluded.saved, hidden = excluded.hidden`)
    .run(userId, jobId, Number(saved), Number(hidden));
}
