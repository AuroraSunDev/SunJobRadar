import { ArrowLeft, CircleAlert, CircleCheck } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { JobActions } from "@/components/job-actions";
import { Brand } from "@/components/brand";
import { jobs } from "@/lib/jobs";

export function generateStaticParams() {
  return jobs.map(({ id }) => ({ id }));
}

export default async function JobDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const job = jobs.find((item) => item.id === id);
  if (!job) notFound();

  return (
    <div className="page detail-page">
      <div className="detail-mobile-brand"><Brand /></div>
      <Link href="/jobs" className="back-link"><ArrowLeft size={19} aria-hidden="true" /><span className="back-link-full">返回全部岗位</span><span className="back-link-short">返回</span></Link>
      <header className="detail-header">
        <div><h1>{job.title}</h1><p className="detail-meta"><strong>{job.company}</strong><span>{job.city}</span><span>{job.type}</span><span className={`status status-${job.category === "优先查看" ? "priority" : job.category === "信息不足" ? "unknown" : "consider"}`}>{job.category}</span></p><p className="detail-reason">{job.reason}</p></div>
        <JobActions id={job.id} title={job.title} />
      </header>
      <div className="source-strip">
        <div><span>来源</span><strong>{job.source}</strong></div>
        <div><span>首次发现</span><strong>{job.firstSeen}</strong></div>
        <div><span>最近检查</span><strong>{job.lastChecked}</strong></div>
        <div><span>官网发布时间</span><strong>未提供</strong></div>
      </div>
      <div className="detail-grid">
        <div className="detail-primary">
          <section className="content-panel"><h2>岗位职责</h2><ol>{job.responsibilities.map((item) => <li key={item}>{item}</li>)}</ol></section>
          <section className="content-panel"><h2>任职要求</h2><ol>{job.requirements.map((item) => <li key={item}>{item}</li>)}</ol></section>
        </div>
        <div className="detail-aside">
          <section className="content-panel"><h2>为什么值得查看</h2>{job.matches.map((item) => <p className="match-point" key={item}><CircleCheck size={20} aria-hidden="true" />{item}</p>)}</section>
          <section className="content-panel"><h2>需要确认</h2><p className="warning-point"><CircleAlert size={21} aria-hidden="true" />{job.toConfirm}</p></section>
        </div>
      </div>
      <p className="demo-note">示意数据 · 职责与要求并非真实招聘信息</p>
    </div>
  );
}
