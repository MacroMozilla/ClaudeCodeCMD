---
description: 提交前轻量组合：先只读跑检查并扫一遍 diff，停下等确认，再单独做格式化提交。
disable-model-invocation: true
---

Get my current changes ready to commit. This is a light pass — two stages, and you stop between them.

Stage 1 — check. Read-only.
- Run the build, the type check, the full test suite, and the linter in report mode.
- Report the results honestly: real commands, real output, skipped counts stated separately from passes.
- Review the diff yourself for anything obviously wrong: a leftover debug print or console log, a commented-out block, a hardcoded path or credential, a TODO you just added, a large accidental inclusion (a lockfile, a build artifact, a vendored directory), a file that should not be tracked.
- Do NOT fix anything in this stage.

Then STOP and show me the results. If anything is red or suspicious, we deal with it before going further — do not proceed to stage 2 on your own.

Stage 2 — standardize, only after I say go.
- Run the project's configured formatter and apply the mechanical lint fixes, following the repo's own configuration rather than any style you would prefer.
- Put this in its OWN commit, separate from my functional changes, labelled as formatting. A formatting commit is reviewed by skimming and a logic commit is reviewed by reading; combining them means the logic change never gets read.
- Do not change any logic. If a lint finding cannot be fixed mechanically, leave it and mention it.
- Re-run the tests afterward. If a purely mechanical change turned the suite red, revert it and tell me — something was not mechanical.

Finally, propose a commit message for my functional changes: what changed and why, not a list of the files you touched. Propose it — do not commit my changes for me unless I ask.
