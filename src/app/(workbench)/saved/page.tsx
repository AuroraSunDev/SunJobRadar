"use client";

import { JobRow } from "@/components/job-row";
import { useDemoState } from "@/components/demo-state";
import { jobs } from "@/lib/jobs";

export default function SavedPage() {
  const { savedIds } = useDemoState();
  const savedJobs = jobs.filter((job) => savedIds.includes(job.id));

  return (
    <div className="page">
      <header className="page-heading inline-heading"><h1>已收藏</h1><p>集中查看你想进一步了解的岗位</p></header>
      <div className="list-toolbar"><span>{savedJobs.length} 个收藏岗位</span><span>最近收藏</span></div>
      <div className="job-stack">{savedJobs.map((job) => <JobRow key={job.id} job={job} showDate />)}</div>
      {savedJobs.length === 0 ? <div className="empty-state"><h2>还没有收藏的岗位</h2><p>在新发现或全部岗位中收藏感兴趣的机会。</p></div> : null}
      <p className="demo-note">示意数据 · 收藏状态刷新页面后会重置</p>
    </div>
  );
}
