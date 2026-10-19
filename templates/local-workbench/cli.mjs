import { resolve } from "node:path";
import { readFileSync } from "node:fs";
import { openStore } from "./store.mjs";

const command = process.argv[2] ?? "help";
const home = resolve(
  process.env.SUNJOBRADAR_HOME || resolve(import.meta.dirname, ".sunjobradar"),
);
try {
  if (command === "serve") {
    const { serve } = await import("./server.mjs");
    await serve(home);
  } else if (command === "help")
    console.log(
      "SunJobRadar：node cli.mjs init|read|profile|import|favorite|schedule|serve\n写入命令从标准输入读取 JSON。个人数据保存在 .sunjobradar/，不会上传。",
    );
  else {
    const store = openStore(home);
    try {
      const operations = {
        init: (v) => store.profile(v, true),
        profile: (v) => store.profile(v),
        import: (v) => store.importRun(v),
        favorite: (v) => store.favorite(v),
        schedule: (v) => store.schedule(v),
        read: () => store.read(),
      };
      if (!operations[command])
        throw new Error("未知命令，请运行 node cli.mjs help");
      const input =
        command === "read" ? null : JSON.parse(readFileSync(0, "utf8"));
      console.log(JSON.stringify(operations[command](input), null, 2));
    } finally {
      store.close();
    }
  }
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
