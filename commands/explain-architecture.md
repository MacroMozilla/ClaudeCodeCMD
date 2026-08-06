---
description: 只读梳理代码库实际结构，以代码为准并指出文档与实现不符之处；只描述不建议。
argument-hint: [subsystem]
disable-model-invocation: true
disallowed-tools: Edit Write NotebookEdit
---

Explain the architecture of this codebase. If $ARGUMENTS names a subsystem, scope it to that. Read-only.

Ground every statement in the code. README files, architecture docs, and comments are evidence of *intent*, not of current structure — they go stale first and they mislead most. Where a document and the code disagree, describe what the code does and flag the disagreement explicitly. Those disagreements are the most valuable thing in this report: they are where the surprises live.

Cover:
1. What this system does, in three sentences, derived from the entry points and the data it moves — not from the README's marketing line.
2. Entry points. Every way execution starts: main functions, HTTP routes, CLI commands, scheduled jobs, queue consumers, event handlers.
3. The real module map. What the units are, what each is responsible for, and which direction dependencies actually run. Name the files. If there is a layering convention, say whether the code actually respects it, and point at the specific imports that break it.
4. The data. The core domain types, where they are defined, where they are persisted, and how they change shape as they cross boundaries.
5. The seams. Where a change can be made in isolation, and where a change will ripple. This is the part that decides how any later refactor gets planned.
6. Cross-cutting machinery: configuration, dependency wiring, error handling, logging, auth, transactions. How each is threaded through, and whether it is consistent.
7. What is unusual. Anything that departs from what a reader would expect from this stack — a hand-rolled version of a standard thing, an inverted convention, a deliberate duplication. For each, look at the git history to see if the reason is recoverable.

Hard constraints:
- Do NOT change any file. No notes written to disk, no docs updated, no diagrams committed. Report in your response. If I want it written down, that is a separate pass.
- Distinguish what you verified from what you inferred. Mark inferences as inferences.
- If part of the system is too large to read properly, say which part and what you sampled, rather than generalizing from a corner of it.
- Do not propose improvements. This pass is description. A recommendation mixed into a description makes it hard to tell what is there from what you think should be.

Finish with: the three things most likely to surprise someone changing this code for the first time.
