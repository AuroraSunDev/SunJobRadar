import assert from "node:assert/strict";
import test from "node:test";
import { evaluateManualJob } from "../src/lib/manual-job-match.ts";

const profile = {
  year: "2027 届", type: "校招", roles: ["AI 产品经理"], cities: ["北京"],
  companies: ["美团"], exclusions: [], frequency: "每天", time: "10:00",
};

test("no profile produces no match claim", () => {
  assert.equal(evaluateManualJob(null, { sourceId: "meituan", title: "AI 产品经理", city: "北京" }), null);
});

test("literal role, target company, and city receive three explained matches", () => {
  assert.deepEqual(evaluateManualJob(profile, { sourceId: "meituan", title: "AI产品经理（校招）", city: "北京市" }), {
    company: { status: "match", text: "目标企业：美团" },
    city: { status: "match", text: "目标城市：北京市" },
    role: { status: "match", text: "名称命中：AI 产品经理" },
  });
});

test("different company and city are flagged, but title mismatch remains uncertain", () => {
  assert.deepEqual(evaluateManualJob(profile, { sourceId: "huawei", title: "智能产品设计师", city: "上海" }), {
    company: { status: "mismatch", text: "非目标企业：华为" },
    city: { status: "mismatch", text: "非目标城市：上海" },
    role: { status: "unknown", text: "名称未命中目标岗位词，需核对" },
  });
});

test("missing city stays unknown instead of becoming a mismatch", () => {
  assert.equal(evaluateManualJob(profile, { sourceId: "meituan", title: "AI 产品经理", city: "" })?.city.status, "unknown");
});
