"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, LockKeyhole, Mail } from "lucide-react";
import { useState } from "react";
import { Brand } from "@/components/brand";

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="login-layout">
      <section className="login-brand-panel"><Brand light /><div className="login-message"><h1>持续发现，<br />值得关注的岗位</h1><p>设置求职目标，定期查看来自企业官网的新机会</p></div><div className="login-radar" aria-hidden="true"><span /></div></section>
      <section className="login-form-panel"><form onSubmit={(event) => { event.preventDefault(); router.push("/onboarding"); }}><h2>欢迎使用 JobRadar</h2><label>邮箱<span className="field-with-icon"><Mail size={20} aria-hidden="true" /><input type="email" placeholder="请输入邮箱" required /></span></label><label>密码<span className="field-with-icon"><LockKeyhole size={20} aria-hidden="true" /><input type={showPassword ? "text" : "password"} placeholder="请输入密码" required /><button type="button" aria-label={showPassword ? "隐藏密码" : "显示密码"} onClick={() => setShowPassword(!showPassword)}><Eye size={20} aria-hidden="true" /></button></span></label><button type="submit" className="button button-primary login-submit">进入演示</button><div className="login-links"><Link href="/onboarding">创建账户</Link><button type="button" onClick={() => window.alert("当前仅为界面演示，尚未接入账户系统。")}>忘记密码</button></div><p className="login-disclaimer">界面演示 · 尚未接入真实账户</p></form></section>
    </div>
  );
}
