"use client";

import { useState } from "react";
import { Check, Pencil } from "lucide-react";
import Link from "next/link";

export default function MonitoringPage() {
  const [frequency, setFrequency] = useState("每两天");
  const [time, setTime] = useState("10:00");
  const [saved, setSaved] = useState(false);

  return (
    <div className="page">
      <header className="page-heading inline-heading"><h1>监控设置</h1><p>管理求职条件与自动检查</p></header>
      <section className="settings-panel">
        <div className="settings-intro"><h2>求职画像</h2><p>设置你关注的岗位、城市和招聘类型</p></div>
        <div className="settings-content">
          <div className="setting-row"><span>目标岗位</span><strong>AI 产品经理、AI 应用开发工程师</strong></div>
          <div className="setting-row"><span>目标城市</span><strong>北京、杭州、上海</strong></div>
          <div className="setting-row"><span>招聘类型</span><strong>2027 届校招</strong></div>
        </div>
        <Link href="/onboarding" className="button button-outline settings-action"><Pencil size={17} aria-hidden="true" />编辑画像</Link>
      </section>
      <section className="settings-panel">
        <div className="settings-intro"><h2>自动检查</h2><p>设置系统检查新岗位的时间周期</p></div>
        <div className="settings-content">
          <div className="setting-row"><span>检查周期</span><div className="inline-controls"><select aria-label="检查频率" value={frequency} onChange={(event) => { setFrequency(event.target.value); setSaved(false); }}><option>每天</option><option>每两天</option><option>每周</option></select><select aria-label="检查时间" value={time} onChange={(event) => { setTime(event.target.value); setSaved(false); }}><option>08:00</option><option>10:00</option><option>18:00</option></select><span>北京时间</span></div></div>
          <div className="setting-row"><span>上次成功检查</span><strong>10月14日 10:00</strong></div>
          {saved ? <p className="inline-success"><Check size={17} aria-hidden="true" />演示设置已更新</p> : null}
        </div>
        <button className="button button-primary settings-action" type="button" onClick={() => setSaved(true)}>保存设置</button>
      </section>
      <section className="settings-panel source-panel">
        <div className="settings-intro"><h2>数据源状态</h2><p>查看招聘来源的接入状态与检查情况</p></div>
        <div className="source-table-wrap"><table className="source-table"><thead><tr><th>企业／来源</th><th>状态</th><th>最近检查</th><th>上次成功检查</th></tr></thead><tbody><tr><td><strong>美团</strong><small>官网招聘</small></td><td><span className="source-state pending">待验证</span></td><td>10月14日 10:00</td><td>—</td></tr><tr><td><strong>华为</strong><small>官网招聘</small></td><td><span className="source-state healthy">正常</span></td><td>10月14日 10:00</td><td>10月14日 10:00</td></tr></tbody></table><p className="source-caption">可用范围取决于实际接入情况。当前状态为界面示意。</p></div>
      </section>
      <p className="demo-note">示意数据 · 尚未接入定时任务或企业招聘源</p>
    </div>
  );
}
