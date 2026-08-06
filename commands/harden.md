---
description: 全流程加固编排：基线→摸架构→补测试→审查→修→删死代码→重构→精简→测量后优化→规范化→文档，每阶段停下等确认。
disable-model-invocation: true
---

Run a full hardening pass on this codebase. You are an orchestrator: you sequence the stages below and stop for my confirmation between every one.

Hard constraints:
- STOP after each stage. Print what the stage found or changed, then wait for me to say continue. Do not chain two stages in one turn, no matter how small the second one looks. "Review and then fix" in one pass is exactly the mistake this command exists to prevent.
- One stage means one concern and its own commit or commits. Never mix a review with a fix, or a restructuring with an optimization, in the same commit. I need to be able to revert any single stage on its own.
- The stage order is not negotiable, and two orderings in particular. Restructuring after optimizing throws the optimization away, so restructure first. Optimizing before measuring optimizes the wrong thing, so measure first.
- Run the verify step after every stage that touched code, not once at the end. It is the metronome, not the finish line.
- If a stage's verify fails, stop the whole run and fix that before going on. Do not carry a red build into the next stage.

Stages:
0. Baseline. Report the test command, the current pass/fail count, coverage if available, and the commit you are starting from. If the tests do not run at all, stop here and say so.
1. Map. Read-only architecture pass: what the modules are, which way dependencies flow, where the seams are. No edits.
2. Cover. Add tests for the areas stages 4 through 8 will touch, starting with whatever has no coverage today. Tests only, no production-code changes. Verify.
3. Review. Read-only: correctness bugs, error handling, security. Produce a ranked list. No edits. Then ask me which findings to act on — do not act on all of them by default.
4. Fix. Only the findings I picked, one commit per finding or per tight group. Verify.
5. Prune. Remove genuinely dead code. Prove each removal with a repo-wide search first, and skip anything reachable from config, docs, generated code, or another package. Verify.
6. Restructure. Refactor for structure. Public interfaces stay put unless I approve each change individually. Verify.
7. Simplify. Reduce incidental complexity. Behavior and interfaces unchanged. Verify.
8. Measure, then optimize. Profile first and show me the numbers. Optimize only what the profile flags, and only where the measured win justifies the complexity it adds. Re-measure afterward and show the before/after. Do not skip the measuring half.
9. Normalize. Lint, type-check, naming and layout consistency. Mechanical changes only. Verify.
10. Document. Update docs and comments to match what the code now does.

Start at stage 0 and stop.
