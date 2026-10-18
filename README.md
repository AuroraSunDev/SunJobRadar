# SunJobRadar

面向中国应届毕业生的个人求职工作台。产品目标是让用户设置一次求职偏好，持续发现目标企业官网中值得关注的新岗位，并统一查看、筛选和收藏。

## 当前进度

已完成前端界面、本机账户与服务端数据保存。注册后可以配置求职画像、收藏和隐藏示例岗位，也可以在“全部岗位”手动保存美团或华为官网的具体岗位详情链接。这些数据按账户隔离，保存在本机 SQLite 数据库中。原先保存在浏览器中的设置可以在首次配置页手动导入。阶段划分与验收条件见 [PLAN.md](PLAN.md)。

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

**页面内置的岗位、企业、匹配理由和岗位时间仍为示例。** 手动保存的官网链接与示例岗位分开展示；岗位名称和城市由用户填写，系统只核验链接格式与官方域名，不自动核验岗位是否仍有效。手动链接按官网岗位 ID 去重，并显示基于用户画像的企业、城市及岗位名称字面命中提示；这不是 JD 分析或 AI 推荐，毕业年份与招聘类型仍需到官网核对。自动采集和增量检查尚未接入；首页真实新发现仍为零。简历上传也尚未接入。示例岗位的“访问官网”按钮不会打开真实岗位。来源核查见 [docs/source-review-2026-10-17.md](docs/source-review-2026-10-17.md)。

账户目前用于本机试运行，尚无邮箱验证和密码找回。请勿将这个版本公开部署给真实用户。部署、持久化云数据库与隐私检查列在后续阶段。

## 本机运行

需要 Node.js 24.15 或更新版本。首次运行时安装依赖，并创建仅保存在本机的认证密钥：

```bash
npm ci
printf 'BETTER_AUTH_SECRET=%s\nBETTER_AUTH_URL=http://localhost:3000\n' "$(openssl rand -base64 32)" > .env.local
npm run dev
```

打开 [http://localhost:3000](http://localhost:3000)。如端口不同，请将 `BETTER_AUTH_URL` 改为实际访问地址。请保留现有 `.env.local`；重新生成密钥会使已有登录会话失效。

`npm run dev` 和 `npm run start` 会先执行数据库迁移。数据库默认在被 Git 忽略的 `.data/sunjobradar.sqlite`；可用 `SUNJOBRADAR_DB_PATH` 指定其他本机路径。可运行 `npm run lint`、`npm run build` 和 `node --experimental-strip-types --test tests/official-job-url.test.mjs tests/manual-job-match.test.mjs` 验证项目。运行中的本机服务可用 `node --test tests/manual-jobs.e2e.mjs` 验证账户隔离与链接接口（默认测试端口为 3012，可设 `TEST_BASE_URL`）。

## 设计参考图

本地 `design-references/JobRadar-v0.3/` 保存按页面命名的参考图。该目录已被 `.gitignore` 排除，不会提交到 GitHub。
