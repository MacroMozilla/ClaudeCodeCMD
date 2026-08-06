---
description: 跑构建/类型检查/全量测试/lint 并如实报告，不修任何东西；额外回答本次改动是否被测试覆盖。
disable-model-invocation: true
disallowed-tools: Edit Write NotebookEdit
---

Verify the current state of this project. Report only — this is read-only.

Run the project's real checks, in this order, and do not stop at the first failure. I need the whole picture:
1. Build or compile.
2. Type check.
3. Full test suite. Not a subset, not the tests you think are relevant — all of them.
4. Linter, in report mode.

Hard constraints:
- Do NOT fix anything. Not a failing test, not a type error, not a lint finding, not a "trivial" one. Report it. Deciding what to fix is my call, and a fix applied here lands in the same diff as whatever I was already doing.
- Do not modify any file, including test files, config, and snapshots. Never update a snapshot to make a test pass.
- Report what actually happened. Quote the real command you ran and its real output. If a suite did not finish, was skipped, timed out, or you could not find how to run it, say exactly that — do not infer a result you did not observe.
- Skipped and pending tests are not passes. Report them as their own number.
- If you cannot determine the project's check commands, say so and stop. Do not invent a command.

Then answer this specifically, because it is the question a green result usually hides: **are the changes on this branch actually covered by any of the tests that just ran?** Diff the branch, and for each changed area say whether a test exercises it. A passing suite that never touches the new code tells us nothing, and I would rather know that than feel reassured.

Report in this shape:
- One line per check: name, command, pass/fail, counts (passed / failed / skipped), duration.
- Every failure: the test name, the assertion, and the first meaningful line of the error. Group failures that share a root cause.
- Coverage of the change, per the paragraph above.
- A one-line verdict: green / red / green but the change is untested.

Do not soften a red result. If it is broken, the first line of your report says so.
