import { JobRow } from "@/components/job-row";
import { featuredJobs } from "@/lib/jobs";
import { getLiveFeed } from "@/lib/live-jobs";

export default function HomePage() {
  const live = getLiveFeed();
  return (
    <div className="page page-home">
      <header className="page-heading inline-heading">
        <h1>新发现</h1>
        <p>{live.source.status === "error" ? "文远知行最近检查失败，显示上次成功结果" : live.source.lastSuccessAt ? "文远知行官网岗位已接入" : "等待首次官网岗位检查"}</p>
      </header>

      <section className="discovery-banner" aria-label="本轮发现概览">
        <div className="discovery-content">
          <p>最近成功检查新增</p>
          <div><strong>{live.source.newCount ?? 0}</strong><span>个岗位</span></div>
        </div>
        <div className="radar-art" aria-hidden="true"><span className="radar-dot" /></div>
      </section>

      <section className="page-section">
        <div className="section-heading"><h2>文远知行 · 真实岗位</h2></div>
        {live.jobs.length ? <div className="manual-job-stack">{live.jobs.map((job) => <article className="manual-job-row" key={job.id}>
          <div><span className="manual-source">{job.company} · 校招</span><h3><a href={job.officialUrl} target="_blank" rel="noopener noreferrer">{job.title}</a></h3><p>{job.city} · 首次发现 {new Date(job.firstSeenAt).toLocaleDateString("zh-CN", { timeZone: "Asia/Shanghai" })}</p></div>
          <a className="button button-outline" href={job.officialUrl} target="_blank" rel="noopener noreferrer">打开官网</a>
        </article>)}</div> : <p className="manual-help">尚无成功检查得到的中国校招岗位。</p>}
      </section>
      <section className="page-section">
        <div className="section-heading"><h2>示例岗位</h2></div>
        <div className="job-stack">
          {featuredJobs.map((job) => <JobRow key={job.id} job={job} />)}
        </div>
      </section>
      <p className="demo-note">文远知行岗位来自公开招聘接口；下方示例岗位和匹配结果仅用于展示界面</p>
    </div>
  );
}
