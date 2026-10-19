# SunJobRadar Agent 入口

用户希望建立自己的求职工作台时，先读取 `skills/setup/SKILL.md`；已有实例需要收集岗位时读取 `skills/collect/SKILL.md`。使用固定生成器创建独立实例，不复制开发者个人资料。使用者无需先安装本仓库旧版 Next.js 依赖。

开发 `templates/local-workbench/` 时用 Node 内置模块和浏览器原生 API；`src/` 是保留的旧版 Next.js 应用。所有生成实例、简历、数据库、密钥和运行日志必须保持私有。发布只包含模板、脚本、契约、虚构样例和文档。

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
