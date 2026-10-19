const root = document.querySelector("#app"),
  notice = document.querySelector("#notice");
let state = null,
  page = "jobs",
  selected = null,
  role = "",
  city = "",
  query = "",
  condition = "",
  mobileDetail = false,
  noticeTimer;
const labels = {
  matched: "已匹配",
  partial: "部分匹配",
  gap: "真实缺口",
  unknown: "待确认",
  not_applicable: "不适用",
  recommended: "建议投递",
  cautious: "谨慎投递",
  stretch: "尝试投递",
  skip: "暂不建议",
  full: "已读正文",
  discovery: "仅发现链接",
  error: "失败",
  success: "完成",
  blocked: "访问受限",
};
const e = (value) =>
  String(value ?? "").replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
const list = (value) =>
  String(value || "")
    .split(/[，,、\n]/)
    .map((v) => v.trim())
    .filter(Boolean);
function time(value) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("zh-CN", {
    timeZone:
      state?.profile?.schedule.timezone ||
      Intl.DateTimeFormat().resolvedOptions().timeZone,
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date(value));
}
function toast(message) {
  clearTimeout(noticeTimer);
  notice.textContent = message;
  notice.className = "visible";
  noticeTimer = setTimeout(() => (notice.className = ""), 5000);
}
async function api(path, value) {
  const response = await fetch("/api/" + path, {
    method: value === undefined ? "GET" : "POST",
    headers: value === undefined ? {} : { "Content-Type": "application/json" },
    body: value === undefined ? undefined : JSON.stringify(value),
  });
  const data = await response.json();
  if (!response.ok) {
    const error = new Error(data.error || "请求失败");
    error.status = response.status;
    throw error;
  }
  return data;
}
async function load() {
  try {
    state = await api("state");
    if (!state.profile) page = "profile";
    render();
  } catch (error) {
    if (error.status === 401) pair();
    else {
      root.innerHTML =
        '<p class="empty">' + e(error.message) + "，请刷新后重试。</p>";
    }
  }
}
function pair() {
  root.innerHTML = `<main class="card pair"><div class="brand"><img src="/favicon.svg" alt="">SunJobRadar</div><h1>打开你的本机工作台</h1><p>工作台只在这台电脑上运行。请让你的 Agent 读取工作台目录里的 <strong>.sunjobradar/access-key</strong>，然后在这里输入本机访问码。</p><form id="pair-form"><label for="access-key">本机访问码</label><input id="access-key" name="key" type="password" autocomplete="off" required><button class="button" type="submit">连接工作台</button><p class="error" role="alert" id="pair-error"></p></form><small>访问码只发往这台电脑。首次使用时，Agent 会继续引导你确认求职画像。</small></main>`;
  document
    .querySelector("#pair-form")
    .addEventListener("submit", async (event) => {
      event.preventDefault();
      try {
        await api("connect", { key: new FormData(event.target).get("key") });
        await load();
      } catch (error) {
        document.querySelector("#pair-error").textContent = error.message;
      }
    });
}
function tag(text, color = "") {
  return `<span class="tag ${color}">${e(text)}</span>`;
}
function render() {
  const p = state.profile;
  const titles = {
    jobs: "个人求职工作台",
    saved: "已收藏的岗位",
    runs: "检索记录",
    profile: "求职画像",
  };
  root.innerHTML = `<aside class="sidebar"><div class="brand"><img src="/favicon.svg" alt="">SunJobRadar</div><nav aria-label="主要导航">${[
    ["jobs", "工作台"],
    ["saved", "已收藏"],
    ["runs", "检索记录"],
    ["profile", "求职画像"],
  ]
    .map(
      ([id, text]) =>
        `<button class="nav ${page === id ? "active" : ""}" data-page="${id}" ${page === id ? 'aria-current="page"' : ""}>${text}${id === "saved" && state.jobs.some((j) => j.saved) ? " · " + state.jobs.filter((j) => j.saved).length : ""}</button>`,
    )
    .join(
      "",
    )}</nav><footer>◉ 个人空间 · 本机保存<br>SunJobRadar v0.2.0</footer></aside><main class="main"><header class="top"><div><h1>${titles[page]}</h1><p>${p ? e([p.name, p.graduation ? p.graduation + " 毕业" : "毕业时间待确认", p.recruitment].join(" · ")) : "由你的 Agent 引导配置，建立属于自己的求职工作台"}</p></div><span class="local-label">仅本机访问</span></header><div id="content">${page === "profile" ? profileView() : page === "runs" ? runsView() : jobsView()}</div><p class="footnote">岗位保留原始网址与读取证据；条件缺失会标为待核对。申请准备资料不会替你填写或提交申请。</p></main>`;
  bind();
}
function filtered() {
  return state.jobs.filter(
    (j) =>
      (page !== "saved" || j.saved) &&
      (!role || j.roles.includes(role)) &&
      (!city || list(j.city).includes(city)) &&
      (!query ||
        [j.company, j.title, j.city]
          .join(" ")
          .toLowerCase()
          .includes(query.toLowerCase())) &&
      (!condition ||
        (condition === "stale"
          ? j.stale
          : condition === "discovery"
            ? j.sourceStatus === "discovery"
            : !j.stale && j.recommendation === condition)),
  );
}
function jobsView() {
  const jobs = filtered();
  if (!jobs.some((j) => j.id === selected)) selected = jobs[0]?.id ?? null;
  const roles = [
    ...new Set([
      ...(state.profile?.roles ?? []),
      ...state.jobs.flatMap((j) => j.roles),
    ]),
  ];
  const cities = [...new Set(state.jobs.flatMap((j) => list(j.city)))].filter(
    (c) => c !== "待核对",
  );
  return `<section class="stats" aria-label="岗位概览"><div class="stat"><small>已发现岗位</small><strong>${state.jobs.length}</strong></div><div class="stat"><small>已保存 JD 证据</small><strong>${state.jobs.filter((j) => j.sourceStatus !== "discovery").length}</strong></div><div class="stat"><small>待重新匹配</small><strong>${state.jobs.filter((j) => j.stale).length}</strong></div></section><section class="filters" aria-label="岗位筛选"><div class="role-tabs"><button class="chip ${!role ? "active" : ""}" data-role="" aria-pressed="${!role}">全部方向</button>${roles.map((r) => `<button class="chip ${role === r ? "active" : ""}" data-role="${e(r)}" aria-pressed="${role === r}">${e(r)}</button>`).join("")}</div><div class="filter-row"><input id="search" aria-label="搜索岗位或公司" placeholder="搜索岗位或公司" value="${e(query)}"><select id="city" aria-label="按城市筛选"><option value="">全部城市</option>${cities.map((c) => `<option ${city === c ? "selected" : ""}>${e(c)}</option>`).join("")}</select><select id="condition" aria-label="按证据状态筛选"><option value="">全部证据状态</option>${[
    ["cautious", "谨慎投递"],
    ["recommended", "建议投递"],
    ["discovery", "仅发现链接"],
    ["stale", "需重新匹配"],
  ]
    .map(
      ([v, l]) =>
        `<option value="${v}" ${condition === v ? "selected" : ""}>${l}</option>`,
    )
    .join(
      "",
    )}</select></div></section><div class="columns ${mobileDetail ? "show-detail" : ""}"><section class="card job-list" aria-label="岗位列表"><div class="list-head"><span>${page === "saved" ? "已收藏岗位" : "发现的岗位"}</span><span>${jobs.length} 个结果</span></div>${jobs.length ? jobs.map((j) => `<article class="job ${selected === j.id ? "selected" : ""}"><button class="job-open" data-job="${j.id}"><h3>${e(j.title)}</h3><p>${e(j.company)}</p><p>${e(j.city)}</p>${tag(j.stale ? "需重新匹配" : j.sourceStatus === "discovery" ? "仅发现链接" : j.sourceStatus === "partial" ? "部分正文 · 条件待核对" : "已读正文", j.stale ? "purple" : "orange")}</button><button class="save" data-save="${j.id}" aria-label="${j.saved ? "取消收藏" : "收藏"} ${e(j.title)}" aria-pressed="${j.saved}">${j.saved ? "◆" : "◇"}</button></article>`).join("") : '<div class="empty">暂无符合筛选条件的岗位。<br>让你的 Agent 搜索并导入真实岗位后，这里会显示结果。</div>'}</section><section class="card detail" aria-label="岗位详情">${selected ? detailView(state.jobs.find((j) => j.id === selected)) : '<div class="empty">选择一个岗位，查看原始来源与匹配依据。</div>'}</section></div>`;
}
function detailView(j) {
  return `<button class="back" data-back>← 返回岗位列表</button><h2>${e(j.title)}</h2><p class="company">${e(j.company)}</p><p class="muted">${e(j.city)}</p><div>${j.roles.map((r) => tag(r)).join("")}</div><div class="summary"><strong>${j.stale ? "分析已过期，请重新匹配" : labels[j.recommendation]}</strong>${e(j.summary)}</div><section><h3>要求与我的证据</h3>${
    j.requirements.length
      ? j.requirements
          .map(
            (r) =>
              `<div class="requirement"><strong>${e(r.text)}${r.must ? " · 硬性要求" : ""}</strong> ${tag(labels[r.state], r.state === "matched" ? "green" : "orange")}<p>${e(r.reason)}</p>${r.evidence ? `<p>JD：${e(r.evidence)}</p>` : ""}${r.factIds
                .map((id) => {
                  const f = (
                    j.factSnapshot ?? (j.stale ? [] : state.profile.facts)
                  ).find((f) => f.id === id);
                  return `<p class="evidence">${f ? e(f.text) + " · 来源：" + e(f.source) + " · 边界：" + e(f.boundary) : "未保留历史事实，需重新匹配"}</p>`;
                })
                .join("")}</div>`,
          )
          .join("")
      : '<p class="muted">尚未取得足够 JD 正文，不能推测岗位要求。</p>'
  }</section><details><summary>原始 JD 证据 · ${j.sourceStatus === "partial" ? "仅部分正文" : labels[j.sourceStatus]}</summary><pre>${e(j.jd || "仅发现职位链接，未读取正文。")}</pre></details><section><p class="muted">首次发现 ${time(j.firstSeenAt)} · 最近发现 ${time(j.lastSeenAt)}<br>JD 读取 ${j.sourceStatus === "discovery" ? "—" : time(j.observedAt)}<br>分析依据：画像 v${j.profileVersion} · 当前 v${state.profile.version}${j.stale ? " · 待重新匹配" : ""}</p><div class="actions"><a class="button" href="${e(j.url)}" target="_blank" rel="noopener noreferrer">查看原始 JD ↗</a><a class="button secondary" href="/api/export?id=${j.id}" download>下载申请准备资料</a></div></section>`;
}
function runsView() {
  const p = state.profile,
    s = state.schedule;
  return `<section class="card schedule"><h2>本机检索计划</h2><p>${p ? `期望每 ${p.schedule.everyDays} 天 · ${e(p.schedule.time)} · ${e(p.schedule.timezone)}` : "先完成求职画像"}</p><p><strong>${s.status === "enabled" ? "已核对外部任务配置" : s.status === "paused" ? "外部任务已暂停" : "尚未配置自动任务"}</strong></p><p>${e(s.description || "时间偏好已保存在画像中。让你的 Agent 创建并核对定时任务后，才会更新启用状态；没有定时工具时可手动发起检索。")}</p>${s.verifiedAt ? `<p>核对时间 ${time(s.verifiedAt)} · ${e(s.provider)}</p>` : ""}<p>本机任务需要电脑与相应 Agent 保持可用；配置成功不等于已经实际执行。</p></section><h2 class="screen-title">实际检索记录</h2>${state.runs.length ? state.runs.map((r) => `<article class="card run"><h3>${r.status === "partial" ? "部分完成" : labels[r.status]} ${tag("新增 " + r.newCount + " · 更新 " + r.updatedCount, r.status === "error" ? "orange" : "green")}</h3><p class="muted">${time(r.startedAt)} → ${time(r.completedAt)}</p><details><summary>查看本轮 ${r.sources.length} 个来源</summary><ul>${r.sources.map((s) => `<li><a class="source-link" href="${e(s.url)}" target="_blank" rel="noopener noreferrer">${e(s.url)}</a><br>${s.status === "partial" ? "部分正文" : labels[s.status]} · ${e(s.note)}</li>`).join("")}</ul></details></article>`).join("") : '<div class="card empty">尚未运行检索。Agent 完成真实检索并导入后，这里会留下记录。</div>'}`;
}
function profileView() {
  const p = state.profile || {
    name: "",
    graduation: "",
    recruitment: "",
    roles: [],
    cities: [],
    mustHave: [],
    exclusions: [],
    summary: "",
    facts: [],
    schedule: {
      everyDays: 2,
      time: "10:00",
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    },
  };
  const field = (name, label, value, type = "text", wide = false, help = "") =>
    `<label class="field ${wide ? "wide" : ""}">${label}<input type="${type}" name="${name}" value="${e(value)}" ${["name", "roles", "recruitment", "timezone"].includes(name) ? "required" : ""}>${help ? `<small>${help}</small>` : ""}</label>`;
  return `<div class="profile-layout"><form class="card form-card" id="profile-form"><h2>我的求职目标 <span class="version">${state.profile ? "画像 v" + state.profile.version : "首次配置"}</span></h2><p class="muted">你确认的资料将用于后续检索。保存修改后，旧分析会提示重新匹配。</p><div class="form-grid">${field("name", "称呼", p.name)}${field("graduation", "预计毕业月份", p.graduation, "month")}${field("recruitment", "求职类型", p.recruitment, "text", true, "例如校招、实习、社招；不确定可填写待确认")}${field("roles", "目标岗位或方向", p.roles.join("，"), "text", true, "用逗号分隔，可填写任意方向")}${field("cities", "目标地区", p.cities.join("，"), "text", true, "留空表示不限地区，用逗号分隔")}${field("mustHave", "必须满足的条件", p.mustHave.join("，"), "text", true)}${field("exclusions", "排除条件", p.exclusions.join("，"), "text", true)}<label class="field wide">背景摘要<textarea name="summary" rows="4">${e(p.summary)}</textarea><small>详细经历和事实来源由 Agent 在你确认后录入。不要填写证件或账户凭据。</small></label>${field("everyDays", "期望检索间隔（天）", p.schedule.everyDays, "number")}${field("time", "期望检索时间", p.schedule.time, "time")}${field("timezone", "时区", p.schedule.timezone, "text", true, "例如 Asia/Shanghai 或 Australia/Sydney")}</div><label class="confirm"><input type="checkbox" name="confirmed" required>我已核对以上信息，同意将其保存到本机工作台用于求职检索。</label><button class="button" type="submit">保存求职画像</button><p class="error" role="alert" id="profile-error"></p></form><section class="card form-card"><h2>我的事实依据</h2><p class="muted">保留材料来源与个人贡献边界。需要补充或修正时，让你的 Agent 协助核对。</p>${p.facts.length ? p.facts.map((f) => `<article class="fact">${tag(f.id, "green")}<p>${e(f.text)}</p><small>来源：${e(f.source)}<br>边界：${e(f.boundary)}</small></article>`).join("") : '<p class="muted">尚未导入简历事实。完成 Agent 引导后，这里会显示你确认的经历依据。</p>'}</section></div>`;
}
function bind() {
  root.querySelectorAll("[data-page]").forEach(
    (b) =>
      (b.onclick = () => {
        page = b.dataset.page;
        mobileDetail = false;
        render();
      }),
  );
  root.querySelectorAll("[data-role]").forEach(
    (b) =>
      (b.onclick = () => {
        role = b.dataset.role;
        mobileDetail = false;
        render();
      }),
  );
  root.querySelectorAll("[data-job]").forEach(
    (b) =>
      (b.onclick = () => {
        selected = b.dataset.job;
        mobileDetail = true;
        render();
      }),
  );
  root.querySelectorAll("[data-back]").forEach(
    (b) =>
      (b.onclick = () => {
        mobileDetail = false;
        render();
      }),
  );
  root.querySelectorAll("[data-save]").forEach(
    (b) =>
      (b.onclick = async () => {
        b.disabled = true;
        try {
          const j = state.jobs.find((j) => j.id === b.dataset.save);
          state = await api("favorite", { id: j.id, saved: !j.saved });
          render();
          toast(j.saved ? "已取消收藏" : "已收藏");
        } catch (error) {
          b.disabled = false;
          toast(error.message);
        }
      }),
  );
  const search = root.querySelector("#search");
  if (search)
    search.oninput = () => {
      const position = search.selectionStart;
      query = search.value;
      mobileDetail = false;
      render();
      const next = root.querySelector("#search");
      next.focus();
      next.setSelectionRange(position, position);
    };
  for (const id of ["city", "condition"]) {
    const el = root.querySelector("#" + id);
    if (el)
      el.onchange = () => {
        if (id === "city") city = el.value;
        else condition = el.value;
        mobileDetail = false;
        render();
      };
  }
  const form = root.querySelector("#profile-form");
  if (form)
    form.onsubmit = async (event) => {
      event.preventDefault();
      const b = form.querySelector("button[type=submit]");
      b.disabled = true;
      const v = Object.fromEntries(new FormData(form));
      try {
        state = await api("profile", {
          name: v.name,
          graduation: v.graduation,
          recruitment: v.recruitment,
          roles: list(v.roles),
          cities: list(v.cities),
          mustHave: list(v.mustHave),
          exclusions: list(v.exclusions),
          summary: v.summary,
          facts: state.profile?.facts ?? [],
          confirmed: v.confirmed === "on",
          expectedVersion: state.profile?.version,
          schedule: {
            everyDays: Number(v.everyDays),
            time: v.time,
            timezone: v.timezone,
          },
        });
        render();
        toast("求职画像已保存");
      } catch (error) {
        document.querySelector("#profile-error").textContent = error.message;
        b.disabled = false;
      }
    };
}
load();
