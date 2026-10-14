"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { JobRow } from "@/components/job-row";
import { useDemoState } from "@/components/demo-state";
import { jobs } from "@/lib/jobs";

export default function JobsPage() {
  const { hiddenIds } = useDemoState();
  const [query, setQuery] = useState("");
  const [city, setCity] = useState("");
  const [company, setCompany] = useState("");
  const [type, setType] = useState("");
  const [category, setCategory] = useState("");
  const [includeHidden, setIncludeHidden] = useState(false);

  const visibleJobs = useMemo(() => jobs.filter((job) => {
    const term = query.trim().toLowerCase();
    return (!term || `${job.title} ${job.company}`.toLowerCase().includes(term))
      && (!city || job.city === city)
      && (!company || job.company === company)
      && (!type || job.type === type)
      && (!category || job.category === category)
      && (includeHidden || !hiddenIds.includes(job.id));
  }), [query, city, company, type, category, includeHidden, hiddenIds]);

  return (
    <div className="page">
      <header className="page-heading inline-heading"><h1>全部岗位</h1><p>查看已发现的岗位</p></header>
      <div className="search-field"><Search size={21} aria-hidden="true" /><input aria-label="搜索岗位或企业" placeholder="搜索岗位或企业" value={query} onChange={(event) => setQuery(event.target.value)} /></div>
      <div className="filters">
        <select aria-label="城市" value={city} onChange={(event) => setCity(event.target.value)}><option value="">城市</option><option>北京</option><option>杭州</option><option>深圳</option></select>
        <select aria-label="企业" value={company} onChange={(event) => setCompany(event.target.value)}><option value="">企业</option>{[...new Set(jobs.map((job) => job.company))].map((name) => <option key={name}>{name}</option>)}</select>
        <select aria-label="招聘类型" value={type} onChange={(event) => setType(event.target.value)}><option value="">招聘类型</option>{[...new Set(jobs.map((job) => job.type))].map((value) => <option key={value}>{value}</option>)}</select>
        <select aria-label="匹配结果" value={category} onChange={(event) => setCategory(event.target.value)}><option value="">匹配结果</option><option>优先查看</option><option>可以考虑</option><option>信息不足</option></select>
        <label className="checkbox-label"><input type="checkbox" checked={includeHidden} onChange={(event) => setIncludeHidden(event.target.checked)} />包含已隐藏岗位</label>
      </div>
      <div className="list-toolbar"><span>{visibleJobs.length} 个示例岗位</span><span>按首次发现时间排序</span></div>
      <div className="job-stack">{visibleJobs.map((job) => <JobRow key={job.id} job={job} showDate />)}</div>
      {visibleJobs.length === 0 ? <div className="empty-state"><h2>没有找到符合条件的岗位</h2><p>试试调整搜索词或筛选条件。</p></div> : null}
      <p className="demo-note">示意数据 · 筛选仅作用于本页示例岗位</p>
    </div>
  );
}
