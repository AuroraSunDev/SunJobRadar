"use client";

import { Bookmark, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import type { Job } from "@/lib/jobs";
import { useDemoState } from "./demo-state";

export function JobRow({ job, showDate = false }: { job: Job; showDate?: boolean }) {
  const { savedIds, toggleSaved } = useDemoState();
  const saved = savedIds.includes(job.id);

  return (
    <article className="job-row">
      <div className="job-company">{job.company}</div>
      <div className="job-main">
        <div className="job-title-line">
          <Link href={`/jobs/${job.id}`} className="job-title">{job.title}</Link>
          <span className={`status status-${job.category === "优先查看" ? "priority" : job.category === "信息不足" ? "unknown" : "consider"}`}>{job.category}</span>
        </div>
        <p className="job-meta">{job.city}<span aria-hidden="true" className="meta-divider" />{job.type}</p>
        <p className="job-reason">{job.reason}</p>
      </div>
      {showDate ? <p className="job-seen">首次发现<br /><strong>{job.firstSeen}</strong></p> : null}
      <div className="job-actions">
        <Link className="button button-primary row-button" href={`/jobs/${job.id}`}>查看详情 <ArrowUpRight size={16} aria-hidden="true" /></Link>
        <button className={`icon-button ${saved ? "selected" : ""}`} type="button" aria-label={saved ? `取消收藏${job.title}` : `收藏${job.title}`} aria-pressed={saved} onClick={() => toggleSaved(job.id)}>
          <Bookmark size={21} fill={saved ? "currentColor" : "none"} aria-hidden="true" />
        </button>
      </div>
    </article>
  );
}
