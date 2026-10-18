"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Pencil } from "lucide-react";
import Link from "next/link";
import { useDemoState } from "@/components/demo-state";
import type { getLiveFeed } from "@/lib/live-jobs";

type LiveSource = ReturnType<typeof getLiveFeed>["source"];

function checkTime(value: string | null) {
  return value ? new Date(value).toLocaleString("zh-CN", { timeZone: "Asia/Shanghai" }) : "—";
}

export default function MonitoringPage() {
  const { profile, saveProfile } = useDemoState();
  const frequencyRef = useRef<HTMLSelectElement>(null);
  const timeRef = useRef<HTMLSelectElement>(null);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [liveSource, setLiveSource] = useState<LiveSource | null>(null);

  useEffect(() => {
    fetch("/api/live-jobs").then(async (response) => {
      if (!response.ok) throw new Error();
      return response.json() as Promise<{ source: LiveSource }>;
    }).then((data) => setLiveSource(data.source)).catch(() => setLiveSource(null));
  }, []);

  async function saveSchedule() {
    if (!profile) return;
    setError("");
    try {
      await saveProfile({ ...profile, frequency: frequencyRef.current?.value ?? profile.frequency, time: timeRef.current?.value ?? profile.time });
      setSaved(true);
    } catch {
      setError("保存失败，请稍后重试。");
    }
  }

  return (
    <div className="page">
      <header className="page-heading inline-heading"><h1>监控设置</h1><p>管理求职条件与检查计划</p></header>
      <section className="settings-panel">
        <div className="settings-intro"><h2>求职画像</h2><p>设置你关注的岗位、城市和招聘类型</p></div>
        <div className="settings-content">
          <div className="setting-row"><span>目标岗位</span><strong>{profile?.roles.join("、") || "尚未设置"}</strong></div>
          <div className="setting-row"><span>目标城市</span><strong>{profile?.cities.join("、") || "尚未设置"}</strong></div>
          <div className="setting-row"><span>目标企业</span><strong>{profile?.companies.join("、") || "尚未设置"}</strong></div>
          <div className="setting-row"><span>招聘类型</span><strong>{profile ? `${profile.year}${profile.type}` : "尚未设置"}</strong></div>
        </div>
        <Link href="/onboarding" className="button button-outline settings-action"><Pencil size={17} aria-hidden="true" />{profile ? "编辑画像" : "创建画像"}</Link>
      </section>
      <section className="settings-panel">
        <div className="settings-intro"><h2>检查计划</h2><p>保存期望的检查时间；当前文远知行检查任务独立运行</p></div>
        <div className="settings-content">
          <div className="setting-row"><span>检查周期</span><div className="inline-controls"><select key={profile?.frequency} ref={frequencyRef} aria-label="检查频率" defaultValue={profile?.frequency ?? "每两天"} onChange={() => setSaved(false)}><option>每天</option><option>每两天</option><option>每周</option></select><select key={profile?.time} ref={timeRef} aria-label="检查时间" defaultValue={profile?.time ?? "10:00"} onChange={() => setSaved(false)}><option>08:00</option><option>10:00</option><option>18:00</option></select><span>北京时间</span></div></div>
          <div className="setting-row"><span>文远知行上次成功检查</span><strong>{checkTime(liveSource?.lastSuccessAt ?? null)}（北京时间）</strong></div>
          {saved ? <p className="inline-success"><Check size={17} aria-hidden="true" />检查计划已保存到本机账户</p> : null}
          {error ? <p className="form-error" role="alert">{error}</p> : null}
        </div>
        <button className="button button-primary settings-action" type="button" onClick={() => { void saveSchedule(); }} disabled={!profile}>保存设置</button>
      </section>
      <section className="settings-panel source-panel">
        <div className="settings-intro"><h2>数据源状态</h2><p>文远知行公开接口已接入；美团与华为待接入</p></div>
        <div className="source-table-wrap"><table className="source-table"><thead><tr><th>企业／来源</th><th>状态</th><th>最近检查</th><th>上次成功检查</th></tr></thead><tbody>
          <tr><td><strong>文远知行</strong><small><a href="https://www.weride.ai/careers" target="_blank" rel="noopener noreferrer">查看官方招聘入口</a></small></td>
            <td><span className={`source-state ${liveSource?.status === "active" ? "healthy" : "pending"}`}>{liveSource?.status === "active" ? "已接入" : liveSource?.status === "error" ? "检查失败" : "待首次检查"}</span></td>
            <td>{checkTime(liveSource?.lastCheckedAt ?? null)}</td><td>{checkTime(liveSource?.lastSuccessAt ?? null)}</td></tr>
          {[
          { company: "美团", url: "https://zhaopin.meituan.com/web/campus" },
          { company: "华为", url: "https://career.huawei.com/cn/campus-recruitment" },
        ].map(({ company, url }) => <tr key={company}><td><strong>{company}</strong><small><a href={url} target="_blank" rel="noopener noreferrer">查看官方校招入口</a></small></td><td><span className="source-state pending">未接入</span></td><td>—</td><td>—</td></tr>)}</tbody></table><p className="source-caption">文远知行任务每 12 小时检查一次（需单独运行）；上面的个人检查周期暂不控制该任务。{liveSource?.error ? `最近错误：${liveSource.error}` : ""}</p></div>
      </section>
      <p className="demo-note">文远知行岗位为真实来源；其他界面示例岗位均有单独标识</p>
    </div>
  );
}
