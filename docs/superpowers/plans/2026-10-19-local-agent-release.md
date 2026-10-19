# Local Agent Workbench Implementation Plan

> **For agentic workers:** Use superpowers:executing-plans inline. User selected the local design and explicitly authorized implementation and the initial GitHub publication.

**Goal:** Ship an installable, personalized, local-first workbench with Agent onboarding and real JD import.

**Architecture:** Fixed standalone Node/SQLite template, CLI transport for agents, authenticated loopback HTTP UI for users. Plugin skills guide profile confirmation, real-source collection and provider scheduling without embedding one user's tools or data.

**Tech Stack:** Node.js 24.15+, built-in SQLite/HTTP/crypto, HTML/CSS/JavaScript; existing Next.js application retained as legacy.

**Spec:** ../specs/2026-10-19-local-agent-release-design.md

- [x] Task 1 — template domain/store/CLI/generator. Write failing integration tests; implement profile confirmation, schema, matching evidence, atomic/idempotent imports, exports and clean generation. Verify fresh-directory use.
- [x] Task 2 — loopback server and dashboard. Write HTTP security and persistence tests, implement pairing and read/profile/favorite APIs; render desktop/mobile with source boundaries and stale analysis.
- [x] Task 3 — setup/collect skills, portable plugin, examples and docs. Validate skills, run realistic clean onboarding and a real search import; record capability limitations.
- [x] Task 4 — full regression suite, independent whole-change review, fix important findings with reproducing tests, browser acceptance, privacy scan and clean package.
- [ ] Task 5 — commit scoped source, recheck remote head, push without force, create v0.2.0 tag/release when GitHub access permits, verify remote content.

## Execution ledger

- Baseline: 13 existing unit tests passed. Existing TypeScript module-format warnings are unrelated. Remote main verified at 151da1c.
- Isolation: clean local clone at work/SunJobRadar-release; canonical personal checkout and ignored cloud/ untouched.
- GitHub plugin get_repo returned 404. Authenticated Git transport connectivity verified through approved network access. Resolve publication permissions using the existing user-authorized Git connection.
- Pre-flight: CLI/read model is shared by the generator, UI and two skills; shared keys and paths checked. Contract is copied into generated instances. Root Next.js dependencies are not required by the new template.
- Task 1/2: generator/store/HTTP tests observed RED then GREEN; only allowlisted template files are copied, with no existing-directory overwrite. Initial HTTP execution needed approved loopback permission.
- Task 3: both skills passed bundled quick_validate using temporary PyYAML environment. Independent fictional Sydney-profile forward test passed; manually performed real official-source discovery/import/readback in a disposable instance with a fictional 2028 graduate (correctly flagged outside that posting's 2027 window). Optional native marketplace installation remains unverified.
- Final review: independent reviewer found no Critical findings; accepted URL-parser crash, hash-route job collision and historical-fact substitution issues. All reproduced and fixed in one pass with regression tests. Timezone-free timestamps and silently assumed schedule preferences were treated as data-correctness issues and fixed as well; HTTP test title corrected to match actual coverage.
- Final: malformed request returns 400 and service stays alive; distinct hash jobs remain distinct; old analysis retains cited fact snapshots after corrections. Suite 26/26 passed. Existing TypeScript module-format warnings retained; no new application browser warnings or errors observed.
- Browser acceptance: desktop 1536x1024 and mobile 390x844; pairing, AI Builder+Shanghai filtering, favorite after reload, editable graduation/version increment/stale UI, stale-warning download, records and mobile return flow passed. Test data is not part of source.
