---
description: 精简局部逻辑，行为和对外接口保持不变。改动前要求有测试基线。
argument-hint: [path]
disable-model-invocation: true
---

Simplify the code in $ARGUMENTS. If no target is given, simplify only the files changed on this branch versus the default branch.

Scope — do exactly one thing:
1. Reduce incidental complexity in the target: collapse redundant branches, remove needless indirection, inline a single-use helper that costs more than it saves, replace hand-rolled logic with a helper that already exists in this repo.
2. Do NOT fix bugs, do NOT add features, do NOT optimize for speed, do NOT reformat or re-sort code you are not otherwise changing, and do NOT rename anything on the public surface. If you spot a bug, write it down and keep going — report it at the end, do not fix it here.

Hard constraints:
- Behavior must not change. Every observable output, side effect, thrown error type, log line something depends on, and public signature stays exactly as it is.
- The public interface must not change: exported functions, classes, and types, their parameter lists, defaults, and return shapes. If a simplification would require an interface change, stop and report it as a proposal instead of doing it.
- Do not delete an abstraction that merely looks unused. Plugin hooks, adapter and strategy seams, feature flags, protected or overridable members, an interface with one implementation today, and anything referenced from config, docs, generated code, or another package are all presumed deliberate. If you cannot prove it is dead with a repo-wide search, leave it and list it under "left alone".
- Before changing anything, check that the target is covered by tests. Run them and record the pass/fail baseline. If there is no meaningful coverage, STOP and say so — ask whether to add tests first or to proceed unprotected. Do not proceed silently.
- Keep comments that explain why. Delete only a comment that restates code you just deleted.

Working order:
1. Report the test baseline.
2. List the simplifications you intend to make, grouped by kind, before editing anything.
3. Apply them. Put each kind in its own commit so any one can be reverted alone. Never mix simplification with another kind of change.
4. Re-run the same tests. The result must match the baseline exactly. If it does not, revert and report.

Finish with: what you changed and why, what you deliberately left alone and the reason, and anything you suspect is dead but could not prove.
