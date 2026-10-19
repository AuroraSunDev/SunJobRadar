# SunJobRadar

面向中国应届毕业生的个人求职工作台。产品目标是让用户设置一次求职偏好，持续发现目标企业官网中值得关注的新岗位，并统一查看、筛选和收藏。

## 当前进度

已完成前端界面、本机账户与服务端数据保存。文远知行官网链接的 Lever 公开职位接口已接入：独立检查任务读取中国校招岗位、按来源岗位 ID 去重，并记录首次发现、最近出现时间和检查失败。注册后可以配置求职画像、收藏和隐藏示例岗位，也可以手动保存美团或华为官网的具体岗位详情链接。数据保存在本机 SQLite 数据库中。阶段划分与验收条件见 [PLAN.md](../PLAN.md)。

| 页面 | 地址 |
| --- | --- |
| 新发现 | `/` |
| 全部岗位 | `/jobs` |
| 岗位详情 | `/jobs/[id]` |
| 已收藏 | `/saved` |
| 监控设置 | `/monitoring` |
| 个人设置 | `/settings` |
| 登录与注册 | `/login` |
| 首次配置 | `/onboarding` |

**“示例岗位”区域的岗位、企业、匹配理由和时间仍为示例。** “真实校招岗位”区域来自文远知行公开接口，目前只筛选来源标记为“中国／校招”的记录；具体城市、毕业年份和岗位要求需在原站核对。手动保存的美团、华为官网链接由用户填写，系统只核验链接格式，不自动抓取这两个网站。手动链接的条件提示不是 JD 分析或 AI 推荐。简历上传尚未接入。来源核查见 [docs/source-review-2026-10-17.md](source-review-2026-10-17.md)。

账户目前用于本机试运行，尚无邮箱验证和密码找回。请勿将这个版本公开部署给真实用户。部署、持久化云数据库与隐私检查列在后续阶段。

## 本机运行

需要 Node.js 24.15 或更新版本。首次运行时安装依赖，并创建仅保存在本机的认证密钥：

```bash
npm ci
printf 'BETTER_AUTH_SECRET=%s\nBETTER_AUTH_URL=http://localhost:3000\n' "$(openssl rand -base64 32)" > .env.local
npm run dev
```

打开 [http://localhost:3000](http://localhost:3000)。如端口不同，请将 `BETTER_AUTH_URL` 改为实际访问地址。请保留现有 `.env.local`；重新生成密钥会使已有登录会话失效。

在另一个终端运行 `npm run jobs:watch`，它启动后立即检查一次文远知行公开接口，此后每 12 小时检查一次。该终端关闭后检查即停止；单次检查可运行 `npm run jobs:sync`。自动任务的频率暂时与“监控设置”中个人保存的期望时间无关。失败会记入数据库并显示在监控设置页；失败时保留上次成功检查得到的岗位。

`npm run dev`、`npm run start` 和 `npm run build` 会先执行数据库迁移。数据库默认在被 Git 忽略的 `.data/sunjobradar.sqlite`；可用 `SUNJOBRADAR_DB_PATH` 指定其他本机路径。可运行 `npm run lint`、`npm run build` 和 `node --experimental-strip-types --test tests/*.test.mjs` 验证项目。运行中的本机服务可用 `node --test tests/manual-jobs.e2e.mjs tests/live-jobs.e2e.mjs` 验证接口（默认测试端口分别为 3012 和 3015，统一测试时设置 `TEST_BASE_URL`）。

## 设计参考图

本地 `design-references/JobRadar-v0.3/` 保存按页面命名的参考图。该目录已被 `.gitignore` 排除，不会提交到 GitHub。
