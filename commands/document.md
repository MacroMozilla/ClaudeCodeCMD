---
description: 补写模块/公开 API/为什么这么写的文档，只写代码实际行为，不改动任何代码。
argument-hint: [path]
disable-model-invocation: true
---

Document $ARGUMENTS.

Every statement you write must be verified against the implementation. Read the code and confirm it, do not infer behavior from a function's name or from an existing doc comment — those are exactly what goes stale. If the current docs contradict the code, the code wins: fix the doc and flag the contradiction in your report, because it may mean the code is the thing that is wrong.

Write these, in priority order:
1. Module or package level — what this is for, what belongs in it, what does not, and how it relates to its neighbours.
2. Public API — for each exported item: what it does, what the parameters mean including units and valid ranges, what it returns, what it throws and when, and any side effect. Include a usage example that would actually run. Verify the example against the real signature; a wrong example is worse than none.
3. Why-comments at any non-obvious decision — a workaround, a deliberate inefficiency, an ordering that matters, a constraint imposed from outside. This is the highest-value category, because it is the only information that cannot be recovered by reading the code.
4. Known limitations and sharp edges. What breaks this, what it does not handle, what surprises people.

Do not write:
- A comment that restates the line below it.
- A doc comment on every function for the sake of coverage. An obvious function needs nothing.
- Aspirational description. Document what it does today, not what it is supposed to become.

Hard constraints:
- Do not change any code. Not even formatting. Comments and documentation files only. If you find a bug while reading, report it — do not fix it here.
- Match the documentation style already used in this repo — same format, same tone, same level of detail. Do not introduce a new convention.
- If you cannot determine what something does or why it exists, write that down as an open question. A stated gap is useful; a confident guess is a liability.
