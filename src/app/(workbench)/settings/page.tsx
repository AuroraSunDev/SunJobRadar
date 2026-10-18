"use client";

import { useState } from "react";
import { FileText, Upload } from "lucide-react";
import { useRouter } from "next/navigation";
import { useDemoState } from "@/components/demo-state";
import { authClient } from "@/lib/auth-client";

export default function SettingsPage() {
  const router = useRouter();
  const { user } = useDemoState();
  const [pending, setPending] = useState(false);

  async function signOut() {
    setPending(true);
    const result = await authClient.signOut();
    if (result.error) {
      setPending(false);
      window.alert("退出失败，请稍后重试");
      return;
    }
    router.replace("/login");
    router.refresh();
  }

  return (
    <div className="page">
      <header className="page-heading inline-heading"><h1>个人设置</h1><p>管理账户与个人资料</p></header>
      <section className="settings-panel account-panel">
        <div className="settings-intro"><h2>账户信息</h2><p>当前登录的本机试用账户</p></div>
        <div className="settings-content">
          <div className="setting-row"><span>姓名</span><strong>{user.name}</strong></div>
          <div className="setting-row"><span>邮箱</span><strong>{user.email}</strong></div>
        </div>
      </section>
      <section className="settings-panel resume-panel">
        <div className="settings-intro"><h2>简历（可选）</h2><p>可在后续版本用于更个性化的推荐</p></div>
        <div className="settings-content"><div className="upload-box"><FileText size={42} strokeWidth={1.5} aria-hidden="true" /><strong>尚未上传简历</strong><label className="button button-outline upload-label"><Upload size={18} aria-hidden="true" />上传 PDF 或 DOCX<input type="file" accept=".pdf,.docx" onChange={(event) => { if (event.target.files?.[0]) window.alert(`已选择 ${event.target.files[0].name}。当前仅展示界面，文件不会上传。`); }} /></label></div><p className="setting-help">简历上传与分析尚未启用。</p></div>
      </section>
      <button className="logout-link" type="button" onClick={() => { void signOut(); }} disabled={pending}>{pending ? "退出中…" : "退出登录"}</button>
      <p className="demo-note">账户与求职设置保存在本机数据库；岗位数据仍为示例</p>
    </div>
  );
}
