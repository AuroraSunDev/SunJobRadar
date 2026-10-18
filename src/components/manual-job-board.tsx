"use client";

import { useEffect, useState } from "react";
import { ExternalLink, Trash2 } from "lucide-react";
import Link from "next/link";
import { useDemoState } from "@/components/demo-state";
import { evaluateManualJob } from "@/lib/manual-job-match";
import type { ManualJob } from "@/lib/manual-jobs";

const companyName = { meituan: "美团", huawei: "华为" };

export function ManualJobBoard({ allowAdd = false }: { allowAdd?: boolean }) {
  const { profile } = useDemoState();
  const [jobs, setJobs] = useState<ManualJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [officialUrl, setOfficialUrl] = useState("");
  const [title, setTitle] = useState("");
  const [city, setCity] = useState("");

  useEffect(() => {
    let active = true;
    fetch("/api/manual-jobs").then(async (response) => {
      if (!response.ok) throw new Error();
      return response.json() as Promise<{ jobs: ManualJob[] }>;
    }).then((data) => {
      if (active) setJobs(data.jobs);
    }).catch(() => {
      if (active) setError("官网链接加载失败，请刷新页面重试。");
    }).finally(() => {
      if (active) setLoading(false);
    });
    return () => { active = false; };
  }, []);

  async function addJob(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/manual-jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ officialUrl, title, city }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "保存失败，请稍后重试。");
      setJobs((current) => [data.job, ...current]);
      setOfficialUrl("");
      setTitle("");
      setCity("");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "保存失败，请稍后重试。");
    } finally {
      setBusy(false);
    }
  }

  async function removeJob(id: string) {
    setError("");
    try {
      const response = await fetch("/api/manual-jobs", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (!response.ok) throw new Error();
      setJobs((current) => current.filter((job) => job.id !== id));
    } catch {
      setError("移除失败，请稍后重试。");
    }
  }

  return (
    <section className="manual-board" id="manual-jobs">
      <div className="section-heading"><h2>我保存的官网岗位链接</h2></div>
      <p className="manual-help">仅保存你提供的官网链接和填写的信息；条件提示只比较自填字段，系统尚未核验岗位内容或自动检查更新。</p>
      {allowAdd ? (
        <form className="manual-form" onSubmit={(event) => { void addJob(event); }}>
          <label>官网岗位链接<input aria-label="官网岗位链接" type="url" required value={officialUrl} onChange={(event) => setOfficialUrl(event.target.value)} placeholder="粘贴美团或华为的岗位详情链接" /></label>
          <label>岗位名称<input aria-label="岗位名称" required maxLength={120} value={title} onChange={(event) => setTitle(event.target.value)} placeholder="按官网填写" /></label>
          <label>工作城市（可选）<input aria-label="工作城市" maxLength={80} value={city} onChange={(event) => setCity(event.target.value)} placeholder="不确定可留空" /></label>
          <button className="button button-primary" type="submit" disabled={busy}>{busy ? "保存中…" : "保存官网岗位"}</button>
        </form>
      ) : null}
      {allowAdd ? <p className="manual-help">查找岗位：<a href="https://zhaopin.meituan.com/web/campus" target="_blank" rel="noopener noreferrer">美团校招</a> · <a href="https://career.huawei.com/cn/campus-recruitment" target="_blank" rel="noopener noreferrer">华为校招</a>。请复制具体岗位的详情链接。</p> : null}
      {error ? <p className="form-error" role="alert">{error}</p> : null}
      {loading ? <p className="manual-help">正在加载已保存的链接…</p> : jobs.length ? (
        <div className="manual-job-stack">{jobs.map((job) => {
          const match = evaluateManualJob(profile, job);
          return (
          <article className="manual-job-row" key={job.id}>
            <div><span className="manual-source">{companyName[job.sourceId]} · 用户填写</span><h3>{job.title}</h3><p>{job.city || "城市待确认"} · 保存于 {new Date(job.createdAt).toLocaleDateString("zh-CN")}</p>
              {match ? <><div className="manual-match" aria-label="画像条件提示">{[match.company, match.city, match.role].map((check) => <span className={`manual-match-chip ${check.status}`} key={check.text}>{check.text}</span>)}</div><p className="manual-check-note">毕业年份、招聘类型和岗位职责未核对</p></>
                : <p className="manual-check-note"><Link href="/onboarding">设置求职画像</Link>后可查看条件提示</p>}
            </div>
            <div className="manual-job-actions"><a className="button button-outline" href={job.officialUrl} target="_blank" rel="noopener noreferrer" aria-label={`打开${companyName[job.sourceId]}官网岗位`}>打开官网 <ExternalLink size={16} aria-hidden="true" /></a><button className="icon-button" type="button" aria-label={`移除 ${job.title}`} onClick={() => { void removeJob(job.id); }}><Trash2 size={18} aria-hidden="true" /></button></div>
          </article>
        ); })}</div>
      ) : <p className="manual-help">还没有保存官网岗位链接。</p>}
    </section>
  );
}
