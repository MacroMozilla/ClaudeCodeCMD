---
description: 按项目已有配置统一格式/lint/类型/命名，纯机械改动，与逻辑改动分开提交。
argument-hint: [path]
disable-model-invocation: true
---

Standardize $ARGUMENTS. Mechanical changes only.

Use the project's own rules. Read the config that already exists — the formatter config, the linter config, the type-checker settings, the editorconfig — and apply those. If a category has no configured rule, infer the convention from the majority of the existing code. Do NOT apply your own preferences or a language community's default style over what this repo already does. If the repo is genuinely inconsistent with no majority, list the options and ask; do not pick for me.

In scope:
- Run the configured formatter.
- Fix linter findings that are purely mechanical: unused imports, unused variables, inconsistent quotes, missing semicolons, import ordering.
- Fix type errors that are annotation-only — adding a missing type, narrowing an implicit any — where the runtime behavior does not change.
- Naming consistency, only where a name clearly departs from the surrounding convention, and only for non-exported symbols.

Out of scope — stop and report instead of doing:
- Any change to logic, control flow, or behavior.
- Renaming anything exported or otherwise public.
- Suppressing a linter or type error with an ignore comment. If a finding cannot be fixed mechanically, leave it and list it.
- Rewriting code to a newer language idiom. A working for-loop is not a lint finding.

Hard constraints:
- These commits must contain nothing but mechanical changes. If you find a real bug, do not fix it — report it. A logic fix buried in a thousand-line reformat is invisible.
- Separate commits by kind: formatting in one, lint fixes in another, type annotations in a third. Formatting commits are large and reviewed by skimming; the others need reading.
- Run the tests afterward. If a purely mechanical change turns the suite red, something was not mechanical — revert it and report what happened.
