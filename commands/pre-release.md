---
description: 发版前分阶段检查：范围盘点→全量验证→安全审查→文档对齐，每阶段停下；任何改动都要求重新全量验证。
disable-model-invocation: true
---

Run the pre-release checks. Stop after every stage and wait for me — this is the last gate before something reaches users, and the failure mode here is a well-meant quick fix that goes out unverified.

Hard constraints:
- STOP between stages. Do not chain them.
- Nothing gets fixed during a review stage. If a stage finds a problem, report it and stop; we decide together whether it blocks the release. A fix applied mid-review goes out without the full suite having run against it.
- ANY change made during this run, however small, sends us back to stage 2 for a full re-verify. No exceptions, no "it was only a typo in a comment".
- Do not tag, publish, push, or deploy anything. Ever, in this command. You prepare and report; releasing is a human action.

Stage 1 — scope. What is actually shipping: the commit range since the last release, the user-visible changes, anything that breaks compatibility (API signatures, config keys, data formats, minimum versions), and any migration a user must perform. Flag every breaking change explicitly — this is the list people miss.

Stage 2 — verify. Full build from clean, full test suite, type check, linter. Real commands and real output. Skipped tests reported separately from passes. If the project has integration or end-to-end suites, run those too and say so if you cannot.

Stage 3 — security. Audit the diff for this release: secrets that got committed, new untrusted-input paths, auth or permission changes, new dependencies and their known vulnerabilities, debug flags or verbose logging left switched on. Report only. Never invent a CVE identifier.

Stage 4 — documentation. Does the documentation describe what is actually shipping? Check the README, the API docs, the changelog, the version number, migration notes for every breaking change from stage 1, and any example or quickstart that a signature change just invalidated. Propose the edits; apply them only after I approve, and remember that applying them sends us back to stage 2.

Finish with a release readiness summary: what is shipping, what is blocking, what is a known issue we are accepting, and a clear go / no-go recommendation with your reason.
