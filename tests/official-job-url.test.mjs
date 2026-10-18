import assert from "node:assert/strict";
import test from "node:test";
import { parseOfficialJobUrl } from "../src/lib/official-job-url.ts";

test("accepts a Meituan position detail URL and extracts its stable job ID", () => {
  assert.deepEqual(parseOfficialJobUrl("https://zhaopin.meituan.com/web/position/detail?jobUnionId=4383089295"), {
    sourceId: "meituan",
    sourceJobId: "4383089295",
    officialUrl: "https://zhaopin.meituan.com/web/position/detail?jobUnionId=4383089295",
  });
});

test("accepts a Huawei campus position detail URL", () => {
  assert.deepEqual(parseOfficialJobUrl("https://career.huawei.com/reccampportal/portal5/campus-recruitment-detail.html?dataSource=1&jobId=24073&jobType=0"), {
    sourceId: "huawei",
    sourceJobId: "24073",
    officialUrl: "https://career.huawei.com/reccampportal/portal5/campus-recruitment-detail.html?jobId=24073&dataSource=1&jobType=0",
  });
});

test("rejects lookalike hosts, non-HTTPS links, and listing pages", () => {
  for (const link of [
    "https://zhaopin.meituan.com.evil.test/web/position/detail?jobUnionId=1",
    "http://zhaopin.meituan.com/web/position/detail?jobUnionId=1",
    "https://zhaopin.meituan.com/web/campus",
    "https://career.huawei.com/reccampportal/portal5/campus-recruitment-detail.html",
  ]) assert.equal(parseOfficialJobUrl(link), null, link);
});

test("rejects ambiguous IDs and embedded credentials", () => {
  assert.equal(parseOfficialJobUrl("https://zhaopin.meituan.com/web/position/detail?jobUnionId=1&jobUnionId=2"), null);
  assert.equal(parseOfficialJobUrl("https://user:pass@zhaopin.meituan.com/web/position/detail?jobUnionId=1"), null);
});

test("removes tracking and other unneeded query data from saved links", () => {
  assert.deepEqual(parseOfficialJobUrl("https://zhaopin.meituan.com/web/position/detail?staffSsoId=private&jobUnionId=4383089295#details"), {
    sourceId: "meituan",
    sourceJobId: "4383089295",
    officialUrl: "https://zhaopin.meituan.com/web/position/detail?jobUnionId=4383089295",
  });
  assert.deepEqual(parseOfficialJobUrl("https://career.huawei.com/reccampportal/portal5/campus-recruitment-detail.html?dataSource=1&jobId=24073&sourceType=001&token=private"), {
    sourceId: "huawei",
    sourceJobId: "24073",
    officialUrl: "https://career.huawei.com/reccampportal/portal5/campus-recruitment-detail.html?jobId=24073&dataSource=1&sourceType=001",
  });
});
