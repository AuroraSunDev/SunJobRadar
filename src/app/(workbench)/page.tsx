import { JobRow } from "@/components/job-row";
import { featuredJobs } from "@/lib/jobs";

export default function HomePage() {
  return (
    <div className="page page-home">
      <header className="page-heading inline-heading">
        <h1>新发现</h1>
        <p>最近检查：10月14日 10:00（北京时间）</p>
      </header>

      <section className="discovery-banner" aria-label="本轮发现概览">
        <div className="discovery-content">
          <p>本轮新发现</p>
          <div><strong>8</strong><span>个岗位</span></div>
        </div>
        <div className="radar-art" aria-hidden="true"><span className="radar-dot" /></div>
      </section>

      <section className="page-section">
        <div className="section-heading"><h2>值得先看</h2></div>
        <div className="job-stack">
          {featuredJobs.map((job) => <JobRow key={job.id} job={job} />)}
        </div>
      </section>
      <p className="demo-note">示意数据 · 岗位与匹配结果仅用于展示界面</p>
    </div>
  );
}
