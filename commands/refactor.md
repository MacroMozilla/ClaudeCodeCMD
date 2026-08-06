---
description: 只调整结构，行为与公开接口保持不变；要求测试基线，一次一个结构动作。
argument-hint: [path]
disable-model-invocation: true
---

Refactor $ARGUMENTS. Restructuring only — the observable behavior of this code must be identical before and after.

Hard constraints:
- Behavior is frozen. Same outputs, same side effects, same error types and messages, same ordering, same timing characteristics that anything depends on. If you believe the current behavior is wrong, do NOT fix it here. Write it down and report it; a bug fix hidden inside a refactor is invisible to review.
- Do not optimize. Do not simplify logic. Do not rename things that are not part of the restructuring. Each of those is its own pass, and mixing them makes the diff unreadable — a reviewer cannot tell a moved line from a changed one.
- Public interfaces stay put unless I approve each change individually: exported names, parameter lists and their order, defaults, return shapes, error types, config keys, and anything another package imports.
- Tests are the safety net and they must exist first. Run them and record the baseline. If the target has no meaningful coverage, STOP and tell me — do not refactor unprotected.
- Never restructure after a performance-tuning pass. If this code has been optimized, tell me before proceeding: restructuring will discard that work.

Working order:
1. Report the test baseline and describe the current structure in a few lines — what the pieces are and how they depend on each other.
2. Propose the target structure and the sequence of moves to get there. Wait for my approval before editing.
3. Execute one move at a time. One structural move per commit: extract a module, invert a dependency, collapse two layers — one of those per commit, never several at once.
4. Run the full test suite after every move, not only at the end. If a move turns the suite red, revert that move rather than patching forward.

Report at the end: the moves you made, the behavior you deliberately preserved even though it looks wrong, and anything you found that belongs in a separate pass.
