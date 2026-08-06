---
description: 只读审查当前 diff，按严重程度输出清单，不改任何文件。
argument-hint: [path|PR]
disallowed-tools: Edit Write NotebookEdit
---

Review the current diff. Report findings only — this is a read-only pass.

Target: $ARGUMENTS. If empty, review the diff between this branch and the default branch (`git diff $(git merge-base HEAD origin/HEAD)...HEAD`).

Hard constraints:
- Do NOT edit, create, or delete any file. Do NOT run a formatter, a codemod, or any tool with a --fix flag. Do NOT commit. If you find yourself about to change a file, stop and write the finding down instead. Deciding which findings are worth acting on is my job; a review that quietly fixes things takes that decision away and merges unrelated changes into one diff.
- Read-only commands are fine: git diff, git log, grep, tests, type checks, and linters in report mode.
- Review only what the diff touches, plus whatever you must read to judge it. Do not audit the whole repo.
- Do not invent problems to fill a quota. If the diff is clean, say it is clean.

Look for these, in priority order:
1. Correctness — logic that yields a wrong result: off-by-one, inverted condition, wrong variable, unhandled null or undefined, race, resource leak, transaction left open.
2. Contract breakage — a caller elsewhere in the repo that this change breaks. Actually grep for the callers; do not assume there are none.
3. Error handling — swallowed exceptions, errors logged and then continued past, a failure that surfaces to the caller as success.
4. Security-adjacent — injection, unvalidated input crossing a trust boundary, secrets in code or logs. Shallow pass only; a real audit is a separate job.
5. Test gaps — behavior added or changed with no test that would fail if it regressed.
6. Clarity and cleanup — last, and clearly marked optional.

For every finding give:
- file:line
- Severity: blocker / should-fix / nit
- The concrete failure: which input or state produces which wrong outcome. If you cannot state that concretely, it is a nit, not a bug — label it honestly.
- A suggested fix in one or two sentences, described and not applied.

List blockers first. End with a one-line verdict: safe to merge / fix blockers first / needs a closer look at <area>.
