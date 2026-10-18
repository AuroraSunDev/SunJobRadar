"use client";

import { Eye, LockKeyhole, Mail, UserRound } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Brand } from "@/components/brand";
import { authClient } from "@/lib/auth-client";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setPending(true);
    try {
      const result = mode === "register"
        ? await authClient.signUp.email({ name: name.trim(), email: email.trim(), password })
        : await authClient.signIn.email({ email: email.trim(), password });
      if (result.error) {
        setError(mode === "register" ? "创建账户失败，请检查邮箱是否已使用。" : "邮箱或密码不正确。");
        return;
      }
      router.replace(mode === "register" ? "/onboarding" : "/");
      router.refresh();
    } catch {
      setError("连接失败，请稍后重试。");
    } finally {
      setPending(false);
    }
  }

  function switchMode() {
    setMode((current) => current === "login" ? "register" : "login");
    setError("");
  }

  return (
    <div className="login-layout">
      <section className="login-brand-panel"><Brand light /><div className="login-message"><h1>持续发现，<br />值得关注的岗位</h1><p>设置求职目标，定期查看来自企业官网的新机会</p></div><div className="login-radar" aria-hidden="true"><span /></div></section>
      <section className="login-form-panel"><form onSubmit={submit}><h2>{mode === "register" ? "创建 JobRadar 账户" : "欢迎使用 JobRadar"}</h2>
        {mode === "register" ? <label>姓名<span className="field-with-icon"><UserRound size={20} aria-hidden="true" /><input value={name} onChange={(event) => setName(event.target.value)} autoComplete="name" maxLength={80} placeholder="请输入姓名" required /></span></label> : null}
        <label>邮箱<span className="field-with-icon"><Mail size={20} aria-hidden="true" /><input type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" placeholder="请输入邮箱" required /></span></label>
        <label>密码<span className="field-with-icon"><LockKeyhole size={20} aria-hidden="true" /><input type={showPassword ? "text" : "password"} value={password} onChange={(event) => setPassword(event.target.value)} autoComplete={mode === "register" ? "new-password" : "current-password"} minLength={8} maxLength={128} placeholder="至少 8 位" required /><button type="button" aria-label={showPassword ? "隐藏密码" : "显示密码"} onClick={() => setShowPassword(!showPassword)}><Eye size={20} aria-hidden="true" /></button></span></label>
        {error ? <p className="login-error" role="alert">{error}</p> : null}
        <button type="submit" className="button button-primary login-submit" disabled={pending}>{pending ? "请稍候…" : mode === "register" ? "创建账户" : "登录"}</button>
        <div className="login-links"><button type="button" onClick={switchMode}>{mode === "register" ? "已有账户？登录" : "创建账户"}</button></div>
        <p className="login-disclaimer">本机试用账户 · 暂未提供邮箱验证与密码找回</p>
      </form></section>
    </div>
  );
}
