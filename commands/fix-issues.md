---
description: 按给定的问题清单逐条修复，一条一个 commit，不做清单之外的改动。
argument-hint: [清单 | issue# | 文件路径]
disable-model-invocation: true
---

Fix the issues listed in $ARGUMENTS. If no list is given, ask me for one — do not go looking for problems yourself, that is a separate job.

Hard constraints:
- Fix ONLY the issues on the list. If you notice something else along the way, write it down and report it at the end. Do not fix it. An unrequested fix in this diff is a change I did not agree to review.
- Do not refactor, rename, reformat, or reorganize while fixing. If a clean fix seems to require restructuring, stop and tell me — that is a refactor, and it belongs in its own pass.
- One issue, one commit. Message names the issue. I need to revert any single fix without losing the others.
- If a fix would change a public interface or observable behavior beyond the bug itself, stop and describe the options instead of picking one.

For each issue, in order:
1. Reproduce it first, with a failing test if the area is testable. If you cannot reproduce it, say so and move on — do not fix a bug you have not seen.
2. State the root cause in one sentence. If the real cause is somewhere other than where the issue points, say that before changing anything.
3. Make the smallest change that fixes the cause, not the symptom.
4. Run the tests. Commit.

At the end report: what you fixed, what you could not reproduce, what you deliberately left untouched, and anything new you noticed but did not act on.
