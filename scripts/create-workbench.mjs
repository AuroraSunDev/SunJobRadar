import { mkdirSync, copyFileSync, lstatSync, rmSync } from "node:fs";
import { resolve, join, dirname } from "node:path";

const target = process.argv[2];
if (!target || process.argv.length !== 3) {
  console.error("用法：node scripts/create-workbench.mjs <新的工作台目录>");
  process.exit(1);
}
const [major, minor] = process.versions.node.split(".").map(Number);
if (major < 24 || (major === 24 && minor < 15)) {
  console.error("需要 Node.js 24.15 或更新版本。");
  process.exit(1);
}
const destination = resolve(target);
const packageRoot = resolve(import.meta.dirname, "..");
const files = [
  "package.json",
  ".gitignore",
  "AGENTS.md",
  "domain.mjs",
  "store.mjs",
  "server.mjs",
  "cli.mjs",
  "public/index.html",
  "public/app.js",
  "public/style.css",
  "public/favicon.svg",
];
let created = false;
try {
  mkdirSync(destination);
  created = true;
  for (const file of [
    ...files.map((file) => ["templates/local-workbench/" + file, file]),
    ["docs/agent-contract.md", "docs/agent-contract.md"],
    ["examples/profile.example.json", "examples/profile.example.json"],
    ["examples/run.example.json", "examples/run.example.json"],
  ]) {
    const src = join(packageRoot, file[0]),
      dst = join(destination, file[1]);
    if (!lstatSync(src).isFile()) throw new Error("模板必须为普通文件");
    mkdirSync(dirname(dst), { recursive: true });
    copyFileSync(src, dst);
  }
  console.log(
    `已创建本机工作台：${destination}\n进入该目录运行 node cli.mjs serve。由 Agent 确认画像后通过 init 初始化。`,
  );
} catch (error) {
  if (created) rmSync(destination, { recursive: true, force: true });
  console.error(
    error.code === "EEXIST"
      ? "目标目录已存在，为保护数据拒绝覆盖。"
      : error.message,
  );
  process.exitCode = 1;
}
