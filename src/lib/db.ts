import { chmodSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { DatabaseSync } from "node:sqlite";

const dbPath = process.env.SUNJOBRADAR_DB_PATH || join(process.cwd(), ".data", "sunjobradar.sqlite");
mkdirSync(dirname(dbPath), { recursive: true, mode: 0o700 });

export const db = new DatabaseSync(dbPath);
chmodSync(dbPath, 0o600);
db.exec("PRAGMA foreign_keys = ON");

const version = Number(db.prepare("PRAGMA user_version").get()?.user_version || 0);
if (version < 1) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS source (
      id TEXT PRIMARY KEY,
      company TEXT NOT NULL,
      official_url TEXT,
      status TEXT NOT NULL DEFAULT 'unverified',
      last_checked_at TEXT,
      last_success_at TEXT
    );
    CREATE TABLE IF NOT EXISTS job (
      id TEXT PRIMARY KEY,
      source_id TEXT NOT NULL REFERENCES source(id),
      source_job_id TEXT NOT NULL,
      official_url TEXT NOT NULL,
      title TEXT NOT NULL,
      city TEXT,
      employment_type TEXT,
      raw_json TEXT NOT NULL,
      first_seen_at TEXT NOT NULL,
      last_seen_at TEXT NOT NULL,
      UNIQUE(source_id, source_job_id)
    );
    CREATE TABLE IF NOT EXISTS search_profile (
      user_id TEXT PRIMARY KEY REFERENCES user(id) ON DELETE CASCADE,
      profile_json TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS user_job_state (
      user_id TEXT NOT NULL REFERENCES user(id) ON DELETE CASCADE,
      job_id TEXT NOT NULL,
      saved INTEGER NOT NULL DEFAULT 0,
      hidden INTEGER NOT NULL DEFAULT 0,
      PRIMARY KEY(user_id, job_id)
    );
    INSERT OR IGNORE INTO source (id, company) VALUES ('meituan', '美团'), ('huawei', '华为');
    PRAGMA user_version = 1;
  `);
}

if (version < 2) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS manual_job (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES user(id) ON DELETE CASCADE,
      source_id TEXT NOT NULL REFERENCES source(id),
      source_job_id TEXT NOT NULL,
      official_url TEXT NOT NULL,
      title TEXT NOT NULL,
      city TEXT NOT NULL,
      created_at TEXT NOT NULL,
      UNIQUE(user_id, source_id, source_job_id)
    );
    UPDATE source SET official_url = 'https://zhaopin.meituan.com/web/campus', status = 'manual_only' WHERE id = 'meituan';
    UPDATE source SET official_url = 'https://career.huawei.com/cn/campus-recruitment', status = 'manual_only' WHERE id = 'huawei';
    PRAGMA user_version = 2;
  `);
}

if (version < 3) {
  db.exec(`
    INSERT OR IGNORE INTO source (id, company, official_url, status)
      VALUES ('weride', '文远知行', 'https://www.weride.ai/careers', 'pending');
    CREATE TABLE IF NOT EXISTS source_run (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      source_id TEXT NOT NULL REFERENCES source(id),
      checked_at TEXT NOT NULL,
      status TEXT NOT NULL CHECK (status IN ('success', 'error')),
      job_count INTEGER NOT NULL DEFAULT 0,
      new_count INTEGER NOT NULL DEFAULT 0,
      error_text TEXT
    );
    PRAGMA user_version = 3;
  `);
}
