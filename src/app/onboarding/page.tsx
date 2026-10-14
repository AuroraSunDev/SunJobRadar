"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Brand } from "@/components/brand";

const roleOptions = ["AI 产品经理", "AI 应用开发工程师", "前端开发工程师", "后端开发工程师"];
const cityOptions = ["北京", "杭州", "上海", "深圳", "广州"];
const companyOptions = ["美团", "华为", "字节跳动", "腾讯"];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [year, setYear] = useState("2027 届");
  const [type, setType] = useState("校招");
  const [roles, setRoles] = useState(["AI 产品经理", "AI 应用开发工程师"]);
  const [cities, setCities] = useState(["北京", "杭州", "上海"]);
  const [companies, setCompanies] = useState(["美团", "华为"]);
  const [exclusions, setExclusions] = useState(["外包", "3 年以上经验"]);
  const [frequency, setFrequency] = useState("每两天");
  const [time, setTime] = useState("10:00");

  function toggle(value: string, values: string[], update: (next: string[]) => void) {
    update(values.includes(value) ? values.filter((item) => item !== value) : [...values, value]);
  }

  function next() {
    if (step < 3) setStep(step + 1);
    else router.push("/");
  }

  return (
    <div className="onboarding-page">
      <header className="onboarding-top"><Brand /><div className="progress-wrap"><div className="progress-track"><span style={{ width: `${step / 3 * 100}%` }} /></div><span>第 {step} 步，共 3 步</span></div></header>
      <div className="onboarding-body">
        <header className="onboarding-heading"><h1>{step === 1 ? "先告诉我们你的求职目标" : step === 2 ? "选择关注的城市与企业" : "设置筛选条件与检查周期"}</h1><p>{step === 1 ? "这些信息用于筛选值得关注的岗位" : step === 2 ? "只关注与你求职方向有关的机会" : "让新岗位更贴近你的求职目标"}</p></header>
        <div className="onboarding-grid"><div className="onboarding-form">
          {step === 1 ? <><div className="form-group"><label htmlFor="year">毕业年份 <b>*</b></label><select id="year" value={year} onChange={(event) => setYear(event.target.value)}><option>2027 届</option><option>2026 届</option><option>2028 届</option></select></div><div className="form-group"><span className="group-label">求职类型 <b>*</b></span><div className="choice-row">{["校招", "实习", "社招"].map((item) => <button key={item} type="button" className={`choice ${type === item ? "selected" : ""}`} onClick={() => setType(item)}>{item}</button>)}</div></div><div className="form-group"><span className="group-label">目标岗位 <b>*</b></span><div className="choice-row wrap">{roleOptions.map((item) => <button key={item} type="button" className={`choice choice-chip ${roles.includes(item) ? "selected" : ""}`} onClick={() => toggle(item, roles, setRoles)}>{item}</button>)}</div></div></> : null}
          {step === 2 ? <><div className="form-group"><span className="group-label">目标城市 <b>*</b></span><div className="choice-row wrap">{cityOptions.map((item) => <button key={item} type="button" className={`choice ${cities.includes(item) ? "selected" : ""}`} onClick={() => toggle(item, cities, setCities)}>{item}</button>)}</div></div><div className="form-group"><span className="group-label">目标企业 <b>*</b></span><div className="choice-row wrap">{companyOptions.map((item) => <button key={item} type="button" className={`choice choice-chip ${companies.includes(item) ? "selected" : ""}`} onClick={() => toggle(item, companies, setCompanies)}>{item}</button>)}</div><p className="form-help">可监控范围以实际接入情况为准。</p></div></> : null}
          {step === 3 ? <><div className="form-group"><span className="group-label">必须满足</span><div className="choice-row"><span className="static-choice">接受 {year}</span><span className="static-choice">目标城市内</span></div></div><div className="form-group"><span className="group-label">排除条件</span><div className="choice-row wrap">{["外包", "3 年以上经验", "销售"].map((item) => <button key={item} type="button" className={`choice choice-chip ${exclusions.includes(item) ? "selected" : ""}`} onClick={() => toggle(item, exclusions, setExclusions)}>{item}</button>)}</div></div><div className="form-group"><span className="group-label">加分项</span><div className="static-choice wide">AI 应用项目经验</div></div><div className="form-group"><span className="group-label">检查周期</span><div className="choice-row"><select aria-label="检查频率" value={frequency} onChange={(event) => setFrequency(event.target.value)}><option>每天</option><option>每两天</option><option>每周</option></select><select aria-label="检查时间" value={time} onChange={(event) => setTime(event.target.value)}><option>08:00</option><option>10:00</option><option>18:00</option></select></div><p className="form-help">北京时间</p></div></> : null}
        </div><aside className="profile-summary"><h2>你的求职画像</h2><dl><div><dt>毕业年份</dt><dd>{year}</dd></div><div><dt>求职类型</dt><dd>{type}</dd></div><div><dt>目标岗位</dt><dd>{roles.join("、") || "未选择"}</dd></div>{step > 1 ? <><div><dt>目标城市</dt><dd>{cities.join("、") || "未选择"}</dd></div><div><dt>目标企业</dt><dd>{companies.join("、") || "未选择"}</dd></div></> : null}{step === 3 ? <div><dt>检查周期</dt><dd>{frequency} {time}（北京时间）</dd></div> : null}</dl></aside></div>
        <div className="onboarding-actions"><button className="button button-outline" type="button" onClick={() => step === 1 ? router.push("/login") : setStep(step - 1)}>{step === 1 ? "返回" : "上一步"}</button><button className="button button-primary" type="button" onClick={next}>{step === 3 ? "完成设置" : "下一步"}</button></div>
        <p className="demo-note">界面演示 · 设置不会保存到服务器</p>
      </div>
    </div>
  );
}
