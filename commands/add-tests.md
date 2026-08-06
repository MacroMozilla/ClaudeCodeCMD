---
description: 为现有行为补特征测试，锁定当前行为作为基线；不改动生产代码。
argument-hint: [path]
disable-model-invocation: true
---

Add tests for $ARGUMENTS. These are characterization tests: they lock in what the code does *today*, so that later changes have something to break.

Hard constraints:
- Do NOT change production code. Not a bug fix, not a rename, not a signature tweak to make something easier to test. If code is untestable as written, report what would need to change and stop — that is a refactor and it needs its own pass, done after these tests exist.
- Test the behavior that exists, not the behavior that should exist. If you find current behavior that looks wrong, write the test that asserts the *current* behavior, mark it clearly (a comment naming it as suspected-wrong, or a name like `test_currently_returns_null_on_empty_input`), and report it. Do not write a failing test for the behavior you think is correct — a red suite is not a baseline.
- Do not mock the thing under test. Mock only what crosses a process boundary: network, clock, filesystem, randomness. A test that asserts a mock was called the way you configured it proves nothing.
- Do not chase a coverage number. Ten tests over the branches that matter beat a hundred that touch every line.

What to cover, in priority order:
1. The paths that later passes will touch, and anything with no coverage at all today.
2. Boundaries: empty, one, many, null and undefined, zero and negative, max size, duplicate, out of order, wrong type.
3. Error paths — what happens when the dependency fails, the input is malformed, the resource is missing.
4. The happy path, last. It is usually the one already implicitly covered.

Each test must fail if the behavior it describes changes. Verify this: after writing a test, deliberately break the code it covers, confirm the test goes red, then restore. Report any test that stayed green — it is not protecting anything.

Finish with: what you covered, what you could not test and why, and any current behavior you suspect is a bug.
