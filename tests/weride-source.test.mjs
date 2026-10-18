import assert from "node:assert/strict";
import test from "node:test";
import { parseWeRideJobs } from "../src/lib/weride-source.ts";

const campus = {
  id: "012d6448-fa8c-4a68-8767-d99f4d1b9bea",
  text: "New Grads 2026 - General Software Engineer",
  hostedUrl: "https://jobs.lever.co/weride/012d6448-fa8c-4a68-8767-d99f4d1b9bea",
  categories: { team: "Campus Recruiting", location: "China", commitment: "Full-time" },
};

test("keeps only official China campus postings with source IDs", () => {
  const jobs = parseWeRideJobs([
    campus,
    { ...campus, id: "outside", hostedUrl: "https://jobs.lever.co/weride/outside", categories: { ...campus.categories, location: "San Jose, CA" } },
    { ...campus, id: "experienced", hostedUrl: "https://jobs.lever.co/weride/experienced", categories: { ...campus.categories, team: "Software Engineering" } },
  ]);
  assert.deepEqual(jobs, [{
    sourceJobId: campus.id,
    officialUrl: campus.hostedUrl,
    title: campus.text,
    city: "中国（具体城市见官网）",
    employmentType: "校招 · 全职",
  }]);
});

test("rejects malformed feed and non-official candidate links", () => {
  assert.throws(() => parseWeRideJobs({ jobs: [] }));
  assert.throws(() => parseWeRideJobs([{ ...campus, hostedUrl: "https://evil.test/job" }]));
  assert.throws(() => parseWeRideJobs([campus, campus]));
});
