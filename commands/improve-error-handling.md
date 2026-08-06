---
description: 修复被吞掉/被伪装成成功的错误，不动正常路径，不擅自加重试与降级。
argument-hint: [path]
disable-model-invocation: true
---

Improve the error handling in $ARGUMENTS.

Fix these, in priority order:
1. Swallowed failures — an empty catch, a catch that only logs and continues, an ignored error return, a rejected promise nobody awaits. A failure that does not reach a caller or an operator is the bug.
2. Failures reported as success — a function that returns a default, an empty list, or null on error, so the caller cannot tell the difference.
3. Unactionable messages — an error that does not say what operation failed, on what input, and what the caller should do about it. Include the identifiers needed to find the record; never include secrets, tokens, or personal data.
4. Lost context — a re-thrown error that drops the original cause or stack.

Hard constraints:
- Do not change the happy path. If the operation succeeds, everything it returns and every side effect stays exactly as it is.
- Do not change the *type* of an error that a caller might be matching on. Grep for callers first. If a type must change, stop and tell me which callers are affected.
- Catch only where you can make a decision. If this layer cannot decide anything, let the error propagate and add context on the way through. Do not wrap every function in try/catch — that hides the real handler and adds noise.
- Do not add retries, fallbacks, circuit breakers, or default values to paper over a failure. Those are design decisions with their own failure modes. Propose them separately; do not implement them here.
- Do not silence a linter or type checker to make a change go through.

Working order:
1. List what you found, grouped by the four kinds above, with file:line. Wait for my go-ahead.
2. Apply the fixes. One kind per commit.
3. Add or point out a test for each failure path you changed. An error path with no test regresses silently.
4. Run the suite and confirm the happy path is unchanged.
