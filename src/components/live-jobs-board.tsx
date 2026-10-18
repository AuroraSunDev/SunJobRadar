"use client";

import { useEffect, useState } from "react";
import { ExternalLink } from "lucide-react";
import type { getLiveFeed } from "@/lib/live-jobs";

type Feed = ReturnType<typeof getLiveFeed>;

export function LiveJobsBoard() {
  const [feed, setFeed] = useState<Feed | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let active = true;
    fetch("/api/live-jobs").then(async (response) => {
      if (!response.ok) throw new Error();
      return response.json() as Promise<Feed>;
    }).then((data) => { if (active) setFeed(data); })
      .catch(() => { if (active) setError(true); });
    return () => { active = false; };
  }, []);

  return (
    <section className="manual-board live-board">
      <div className="section-heading"><h2>真实校招岗位</h2></div>
      <p className="manual-help">文远知行官网链接的公开招聘接口 · 自动检查中国校招岗位 · 投递前请在原站确认要求。</p>
      {error ? <p className="form-error" role="alert">岗位数据加载失败，请刷新页面重试。</p>
        : !feed ? <p className="manual-help">正在加载官网岗位…</p>
          : <>
            <p className="manual-help">{feed.source.status === "error" ? "最近检查失败，以下显示上次成功检查的结果。" : feed.source.lastSuccessAt
              ? `最近成功检查：${new Date(feed.source.lastSuccessAt).toLocaleString("zh-CN", { timeZone: "Asia/Shanghai" })}（北京时间） · 本轮新增 ${feed.source.newCount ?? 0} 个`
              : "尚未完成首次自动检查。"}</p>
            {feed.jobs.length ? <div className="manual-job-stack">{feed.jobs.map((job) => (
              <article className="manual-job-row" key={job.id}>
                <div><span className="manual-source">{job.company} · 官方招聘页</span>
                  <h3><a href={job.officialUrl} target="_blank" rel="noopener noreferrer">{job.title}</a></h3>
                  <p>{job.city} · {job.employmentType} · 首次发现 {new Date(job.firstSeenAt).toLocaleDateString("zh-CN", { timeZone: "Asia/Shanghai" })}</p>
                </div>
                <div className="manual-job-actions"><a className="button button-outline" href={job.officialUrl} target="_blank" rel="noopener noreferrer">打开官网 <ExternalLink size={16} aria-hidden="true" /></a></div>
              </article>
            ))}</div> : <p className="manual-help">本轮没有发现中国校招岗位。</p>}
          </>}
    </section>
  );
}
