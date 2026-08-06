---
description: 盘点依赖的漏洞/未使用/过期/风险信号，先出报告等确认，升级时一个依赖一个 commit。
disable-model-invocation: true
---

Audit the dependencies of this project. Report first — do not change anything until I pick.

Phase 1, read-only. Produce four lists:
1. Known vulnerabilities. Use the project's own tooling (npm audit, pip-audit, cargo audit, govulncheck, or whatever this stack uses). For each: package, severity, whether the vulnerable code path is actually reachable from this project, and the smallest version that fixes it. "Reachable" matters more than severity — say when you cannot determine it.
2. Unused. A declared dependency you cannot find imported. Before listing one, check for use in build scripts, config files, type-only imports, peer or optional dependencies, plugin auto-loading, and CI. If you are not certain, put it under "possibly unused" with the reason.
3. Outdated. Split into patch, minor, and major. For majors, note the breaking changes from the changelog — do not summarize from the version number alone.
4. Risk signals. Unmaintained (no release in a long time), single-maintainer packages in critical paths, packages with a tiny footprint you could inline, and duplicate packages doing the same job.

Phase 2, only after I choose. For each item I approve:
- One dependency per commit. Never batch upgrades, and never mix a security patch with a version bump for convenience — I need to revert one without losing the other.
- Security patches first, as small a version jump as fixes the issue.
- After each upgrade: install cleanly from a fresh lockfile, build, and run the full test suite. Report the result before moving to the next.
- For a major version, list the call sites that need changing and stop for my approval before touching them.

Do not upgrade anything I did not pick. Do not "helpfully" update the lockfile beyond the package in question.
