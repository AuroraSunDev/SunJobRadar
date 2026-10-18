import { runWeRideSync } from "../src/lib/source-sync.ts";

const watch = process.argv.includes("--watch");
const intervalMs = 12 * 60 * 60 * 1000;

async function check() {
  try {
    const result = await runWeRideSync();
    console.log(`文远知行：发现 ${result.jobCount} 个中国校招岗位，其中 ${result.newCount} 个首次入库。`);
  } catch (error) {
    console.error(`文远知行检查失败：${error instanceof Error ? error.message : "未知错误"}`);
    if (!watch) process.exitCode = 1;
  }
  if (watch) setTimeout(check, intervalMs);
}

await check();
