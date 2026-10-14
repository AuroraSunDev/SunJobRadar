"use client";

import { useState } from "react";
import { FileText, Upload } from "lucide-react";
import Link from "next/link";

export default function SettingsPage() {
  const [name, setName] = useState("小林");
  const [email, setEmail] = useState("lin@example.com");
  const [saved, setSaved] = useState(false);

  return (
    <div className="page">
      <header className="page-heading inline-heading"><h1>个人设置</h1><p>管理账户与个人资料</p></header>
      <section className="settings-panel account-panel">
        <div className="settings-intro"><h2>账户信息</h2><p>管理你的账户基本信息</p></div>
        <div className="settings-content form-content"><label>姓名<input value={name} onChange={(event) => { setName(event.target.value); setSaved(false); }} /></label><label>邮箱<input type="email" value={email} onChange={(event) => { setEmail(event.target.value); setSaved(false); }} /></label>{saved ? <p className="inline-success">演示资料已更新</p> : null}</div>
        <button className="button button-primary settings-action" type="button" onClick={() => setSaved(true)}>保存修改</button>
      </section>
      <section className="settings-panel resume-panel">
        <div className="settings-intro"><h2>简历（可选）</h2><p>可在后续版本用于更个性化的推荐</p></div>
        <div className="settings-content"><div className="upload-box"><FileText size={42} strokeWidth={1.5} aria-hidden="true" /><strong>尚未上传简历</strong><label className="button button-outline upload-label"><Upload size={18} aria-hidden="true" />上传 PDF 或 DOCX<input type="file" accept=".pdf,.docx" onChange={(event) => { if (event.target.files?.[0]) window.alert(`已选择 ${event.target.files[0].name}。当前仅展示界面，文件不会上传。`); }} /></label></div><p className="setting-help">当前基础匹配以求职画像为依据；简历深度分析尚未启用。</p></div>
      </section>
      <Link href="/login" className="logout-link">退出登录</Link>
      <p className="demo-note">示意数据 · 修改不会保存到服务器</p>
    </div>
  );
}
